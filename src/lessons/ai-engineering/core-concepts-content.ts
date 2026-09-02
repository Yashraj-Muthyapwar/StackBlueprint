import type { QuizQuestion } from "@/components/lesson/Quiz";

export type AIEngineeringSection =
  | { kind: "prose"; heading?: string; body: string[] }
  | { kind: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { kind: "callout"; tone: "info" | "warn" | "success" | "violet"; title: string; body: string }
  | { kind: "analogy"; title: string; text: string }
  | { kind: "diagram"; caption?: string; ascii: string }
  | { kind: "code"; language: "python" | "text"; caption?: string; code: string }
  | { kind: "transformer-explorer"; caption?: string }
  | { kind: "attention-workbench"; caption?: string }
  | { kind: "takeaways"; items: string[] }
  | { kind: "quiz"; questions: QuizQuestion[] };

export type AIEngineeringLesson = {
  slug: string;
  title: string;
  subtitle: string;
  sections: AIEngineeringSection[];
};

export const TRANSFORMER_ARCHITECTURE_LESSON: AIEngineeringLesson = {
  slug: "the-transformer-architecture",
  title: "The Transformer Architecture",
  subtitle:
    "Follow one sentence through attention, multi-head mixing, and next-token prediction to understand the engine behind modern language models.",
  sections: [
    {
      kind: "prose",
      heading: "The core idea: let every token consult the useful parts of its context",
      body: [
        "A **Transformer** is a neural-network architecture for sequences: text, code, audio, images split into patches, and more. Its signature operation is **attention**. Instead of processing a sentence strictly from left to right, attention lets a token look directly at other relevant tokens.",
        "For the sentence `The cat sat on the mat`, the representation of `sat` should care strongly about `cat`. A Transformer learns that connection from data. It repeats this process through many layers, gradually turning token-sized inputs into context-aware representations.",
        "This lesson uses a small decoder-only language model as the running example. Chat-style LLMs use this family: they read a prefix and predict one more token.",
      ],
    },
    {
      kind: "transformer-explorer",
      caption: "One decoder block, unfolded from tokens to a next-token distribution",
    },
    {
      kind: "callout",
      tone: "violet",
      title: "Paper configuration versus this teaching example",
      body: "The 2017 base Transformer used six encoder layers and six decoder layers with d_model = 512, eight attention heads, d_k = d_v = 64, and a feed-forward width of 2,048. This visual uses tiny vectors and two heads so every multiplication fits on screen. The computation is the same.",
    },
    {
      kind: "analogy",
      title: "A room full of editors",
      text: "Imagine each word has an editor. Before rewriting its own notes, every editor scans the words it is allowed to see, decides which ones matter, and gathers useful details from them. **Attention** is that focused research pass. A Transformer stacks many rounds of these editors, so later rounds can reason over relationships found by earlier rounds.",
    },
    {
      kind: "prose",
      heading: "A map of the vocabulary before we go deeper",
      body: [
        "Keep two levels separate in your mind. A **token** is a unit of input text. A **representation** is the vector the model currently holds for that token. Every Transformer layer updates these representations; the token IDs themselves do not change inside the network.",
        "A **parameter** is a learned number, such as an embedding-table entry or a weight in a projection matrix. A **layer** is one repeated attention-and-MLP block. A **head** is one smaller attention channel inside a layer. The **context window** is the sequence of tokens the model is allowed to consider for one forward pass.",
      ],
    },
    {
      kind: "prose",
      heading: "Why attention replaced strictly sequential processing",
      body: [
        "Older recurrent networks passed one hidden state from token to token. That creates a long path between distant words and makes training difficult to parallelize. In a Transformer layer, every token can compare with the allowed context in one matrix operation.",
        "Attention does not mean a model has perfect memory or understanding. It is a learned routing mechanism. The architecture gives the model a direct path to relevant information; training decides what to route and how to use it.",
      ],
    },
    {
      kind: "table",
      caption: "The important dimensions in a decoder block",
      headers: ["Symbol", "Meaning", "Why it matters"],
      rows: [
        ["n", "Sequence length", "Full attention builds an n by n score map."],
        [
          "d_model",
          "Width of each token representation",
          "The amount of feature space carried between layers.",
        ],
        ["h", "Number of attention heads", "Independent attention channels run in parallel."],
        ["d_head", "Width used by one head", "Usually chosen so h × d_head = d_model."],
        [
          "L",
          "Number of Transformer layers",
          "More layers allow more rounds of communication and computation.",
        ],
      ],
    },
    {
      kind: "table",
      caption: "Three common Transformer layouts",
      headers: ["Layout", "What can attend to what?", "Typical use"],
      rows: [
        [
          "Encoder-only",
          "Every input token can attend to every other input token.",
          "Understanding tasks, embeddings, classification",
        ],
        [
          "Decoder-only",
          "Each token sees only earlier tokens and itself through a causal mask.",
          "Text and code generation",
        ],
        [
          "Encoder-decoder",
          "Encoder reads the source; decoder reads prior output and attends to the source.",
          "Translation, summarization, sequence-to-sequence work",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "Step 1: tokens become vectors with position",
      body: [
        "A model cannot directly manipulate text. A **tokenizer** first maps text into token IDs, often pieces of words rather than whole words. An embedding table maps each ID to a learned vector of numbers. Similar use patterns can become nearby directions in this vector space.",
        "Attention alone has no built-in word order. Without extra information, `dog bites man` and `man bites dog` are just the same set of token vectors. So each token representation also receives **positional information**. Modern models commonly use learned positional embeddings or position-aware rotations such as RoPE.",
      ],
    },
    {
      kind: "diagram",
      caption: "The input representation at each position",
      ascii: `text:          The       cat       sat
token id:       31      8,921     2,417
                 │         │         │
token embedding  e₀        e₁        e₂
position signal  p₀        p₁        p₂
                 └───── add / combine ─────┘
context input    x₀        x₁        x₂`,
    },
    {
      kind: "prose",
      heading: "Step 2: self-attention asks, matches, and gathers",
      body: [
        "At every position, the layer creates three learned projections of its input vector: a **query** (what am I looking for?), a **key** (what do I offer?), and a **value** (what information should be passed on?). They are made by multiplying the input matrix by learned weight matrices.",
        "For one token, compare its query with every allowed key using a dot product. Large compatible dot products receive large scores. Divide by `√dₖ` to keep scores numerically well-scaled, apply the mask where necessary, then use softmax to turn scores into weights that sum to one. The weighted sum of the values is the attention output.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Scaled dot-product attention, written for shapes rather than a framework",
      code: `# X: [sequence_length, model_width]
Q = X @ W_q
K = X @ W_k
V = X @ W_v

scores = (Q @ K.T) / sqrt(key_width)
scores = scores + causal_mask      # disallowed future positions get -infinity
weights = softmax(scores, axis=-1) # each row sums to 1
output = weights @ V`,
    },
    {
      kind: "attention-workbench",
      caption:
        "A tiny causal attention matrix. Select a row to see which earlier tokens it can use.",
    },
    {
      kind: "prose",
      heading: "A worked attention calculation",
      body: [
        "The workbench uses a deliberately tiny three-token example. Pick `sat` and notice that its row gives most of its weight to `cat`, while `The` has no future tokens available. These values are illustrative, not universal. In a real model, every layer and every head produces its own learned pattern.",
        "Softmax is important because it makes the row a competition. Increasing one score increases its share while decreasing the relative share of the others. A zero weight does not usually mean a token was deleted. It means that, for this head in this layer, the weighted mixture barely used that token's value.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Read the attention matrix by rows",
      body:
        "Row i answers: " +
        '"Where does token i look?"' +
        " Column j is how much token i uses token j. In a causal language model, entries above the diagonal are blocked so a token cannot peek at future text during training.",
    },
    {
      kind: "prose",
      heading: "Step 3: multiple heads learn different relationships",
      body: [
        "One attention calculation may discover one kind of useful relationship, such as a subject matching a verb. **Multi-head attention** runs several smaller attention mechanisms in parallel. Each head has its own query, key, and value projections, so heads can specialize in different patterns.",
        "The head outputs are concatenated and mixed through another learned projection. The point is not that every head becomes neatly interpretable. The point is that the layer has several independent communication channels available at the same time.",
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "Multi-head attention and the feed-forward sublayer",
      code: `heads = [attention(X @ Wq[i], X @ Wk[i], X @ Wv[i]) for i in range(h)]
mixed = concat(heads, axis=-1) @ W_out
X = X + mixed                    # residual connection

Y = layer_norm(X)
Y = gelu(Y @ W_up) @ W_down      # position-wise MLP
X = X + Y                        # another residual connection`,
    },
    {
      kind: "prose",
      heading: "Step 4: preserve the signal, then transform each position",
      body: [
        "A Transformer block has more than attention. A **residual connection** adds the block input back to its output, giving later layers a direct path to earlier information and making deep networks easier to train. **Layer normalization** stabilizes the scale of each token's features.",
        "Then a position-wise **feed-forward network** applies the same small MLP to every token independently. Attention mixes information across positions. The feed-forward network transforms the features at each position. Together they alternate communication and computation.",
      ],
    },
    {
      kind: "diagram",
      caption: "A simplified pre-normalization decoder block",
      ascii: `x ──► LayerNorm ──► masked multi-head attention ──► + ──► LayerNorm ──► MLP ──► + ──► next block
│                                                   ▲                         ▲                  ▲
└──────────────────────── residual path ───────────┘                         └── residual ──────┘

Attention: tokens exchange information across positions.
MLP:       each token's feature vector is transformed in place.`,
    },
    {
      kind: "prose",
      heading: "Cross-attention: how encoder-decoder models connect two sequences",
      body: [
        "Self-attention uses queries, keys, and values from the same sequence. **Cross-attention** splits those roles across two sequences. A decoder token supplies the query, while the encoder's source-language representations supply keys and values. The decoder can therefore ask, " +
          '"Which part of the source should I use to write this next output token?"',
        "That is why the original Transformer was so natural for translation. The encoder can build a rich representation of the entire input sentence, while the decoder generates a new sentence one token at a time and consults that source representation as needed.",
      ],
    },
    {
      kind: "diagram",
      caption: "Cross-attention uses one sequence to ask and another sequence to answer",
      ascii: `SOURCE:  "Le chat dort"
             encoder representations ──► K, V
                                         ▲
                                         │ cross-attention
                                         │
TARGET:  "The cat ..."
             decoder representation ──► Q

Self-attention: Q, K, V come from one sequence.
Cross-attention: Q comes from the decoder; K and V come from the encoder.`,
    },
    {
      kind: "prose",
      heading: "Step 5: train the model to predict the next token",
      body: [
        "A decoder-only model sees `The cat sat` and is trained to assign a high probability to the next token, perhaps `on`. During training, the complete target sequence is available, but the causal mask prevents every position from reading future targets. This lets the model learn all next-token predictions in parallel.",
        "At the top of the final layer, a linear output head converts each hidden vector into one score, or **logit**, per vocabulary token. Softmax turns logits into probabilities. Cross-entropy loss compares that distribution with the actual next token and adjusts all the model weights through backpropagation.",
      ],
    },
    {
      kind: "prose",
      heading: "Pretraining, instruction tuning, and what the architecture does not supply",
      body: [
        "The architecture defines how information flows. **Pretraining** supplies the broad statistical knowledge by repeatedly predicting missing or next tokens over a huge corpus. The model learns language patterns, code structure, and many regularities because predicting text accurately rewards those internal representations.",
        "Later stages can specialize behavior. Supervised fine-tuning trains on examples of desired responses. Preference optimization uses comparisons or feedback to make responses more helpful, safe, or concise. Retrieval, tools, and system prompts change what context the model receives, but none of them make the base model infallible.",
      ],
    },
    {
      kind: "table",
      caption: "Training versus generation",
      headers: ["Phase", "Input available", "What happens"],
      rows: [
        [
          "Training",
          "A full text sequence",
          "Predict every shifted next token at once, with future positions masked.",
        ],
        [
          "Generation",
          "The prompt plus already generated tokens",
          "Predict one distribution, choose one token, append it, and repeat.",
        ],
        [
          "Sampling",
          "The next-token distribution",
          "Temperature, top-k, or top-p can trade certainty for variety.",
        ],
      ],
    },
    {
      kind: "code",
      language: "python",
      caption: "The generation loop, simplified",
      code: `tokens = tokenize(prompt)
cache = empty_kv_cache()

for _ in range(max_new_tokens):
    logits, cache = model(tokens[-1:], cache=cache)
    next_token = sample(logits[-1], temperature=0.8, top_p=0.9)
    tokens.append(next_token)
    if next_token == EOS:
        break

return detokenize(tokens)`,
    },
    {
      kind: "prose",
      heading: "Sampling is a product decision, not an architectural detail",
      body: [
        "**Greedy decoding** always takes the most likely token. It is predictable but can become repetitive. **Temperature** rescales logits before softmax: lower values sharpen the distribution, higher values spread probability across more choices. **Top-k** keeps only the k most likely options; **top-p** keeps the smallest set whose probability mass reaches p.",
        "For factual extraction or structured output, teams often reduce randomness and constrain the output format. For brainstorming or creative writing, they may permit more diversity. The best setting depends on the task, evaluation, and failure cost.",
      ],
    },
    {
      kind: "prose",
      heading: "What makes large Transformers practical, and what still hurts",
      body: [
        "During generation, the model reuses past keys and values in a **KV cache** instead of recomputing them for every new token. This is essential for efficient autoregressive decoding, though the cache consumes memory as the conversation grows.",
        "Standard full attention compares each token with every other allowed token. For a sequence of length `n`, that attention map has roughly `n²` entries. Long-context models use engineering advances and alternative attention patterns to manage this cost, but context length, memory, latency, and accuracy remain real tradeoffs.",
      ],
    },
    {
      kind: "table",
      caption: "Practical levers when working with a Transformer model",
      headers: ["Lever", "What you change", "Primary tradeoff"],
      rows: [
        [
          "Model size",
          "Layers, width, heads, and parameter count",
          "Capability and cost usually increase together.",
        ],
        [
          "Context length",
          "How much prompt history fits",
          "Longer prompts use more attention and KV-cache memory.",
        ],
        [
          "Batch size",
          "Sequences processed together during training",
          "Higher hardware utilization versus memory pressure.",
        ],
        [
          "Precision / quantization",
          "Bits used to store and compute weights",
          "Lower memory and faster inference versus possible quality loss.",
        ],
        [
          "Decoding settings",
          "Temperature, top-k, top-p, output limits",
          "Predictability versus variety, latency, and safety.",
        ],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Common mental-model traps",
      body: "Attention weights are not a complete explanation of a model's reasoning. A Transformer is not a database that retrieves exact facts, and a token is not always a word. Treat attention as learned information routing inside a much larger computation.",
    },
    {
      kind: "takeaways",
      items: [
        "Transformers turn token IDs into position-aware vectors, then refine them through many repeated blocks.",
        "Self-attention uses queries, keys, and values to route information from relevant allowed positions.",
        "Multi-head attention provides several learned communication channels; MLPs transform each token after communication.",
        "Causal masking makes decoder-only models valid next-token predictors and prevents training-time leakage from future tokens.",
        "Generation is an autoregressive loop. KV caching saves work, while attention cost and context memory shape the system's limits.",
        "Encoder-only, decoder-only, and encoder-decoder layouts share the same core mechanism but expose context differently for different jobs.",
        "Architecture, training data, alignment, retrieval, tools, and decoding each affect behavior. Do not attribute all model behavior to attention alone.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "transformer-position",
          question:
            "Why does a Transformer need positional information in addition to token embeddings?",
          options: [
            "Attention otherwise has no built-in sense of token order.",
            "It converts every token into a one-hot vector.",
            "It prevents the vocabulary from growing.",
            "It removes the need for a tokenizer.",
          ],
          correctIndex: 0,
          explanation:
            "Self-attention compares token vectors without an inherent left-to-right order. Position signals distinguish permutations of the same tokens.",
        },
        {
          id: "transformer-qkv",
          question: "In self-attention, what is the value vector mainly used for?",
          options: [
            "The information gathered after attention weights are chosen.",
            "The score used to decide whether two tokens match.",
            "The position of the token in the sentence.",
            "The model's final vocabulary probability.",
          ],
          correctIndex: 0,
          explanation:
            "Queries and keys determine attention weights. Those weights form a weighted sum of value vectors.",
        },
        {
          id: "transformer-causal-mask",
          question: "What does a causal mask prevent in a decoder-only language model?",
          options: [
            "A token attending to later tokens during next-token prediction.",
            "A token attending to itself.",
            "Different attention heads from running in parallel.",
            "The output head from producing logits.",
          ],
          correctIndex: 0,
          explanation:
            "The mask blocks future positions so the model cannot use the answer it is meant to predict.",
        },
        {
          id: "transformer-block-roles",
          question: "Which pairing correctly describes the jobs inside a Transformer block?",
          options: [
            "Attention exchanges information across tokens; the MLP transforms each token's features.",
            "Attention predicts vocabulary logits; the MLP tokenizes text.",
            "Attention stores the KV cache; the MLP applies the causal mask.",
            "Attention normalizes vectors; the MLP computes positional encodings.",
          ],
          correctIndex: 0,
          explanation:
            "Attention is the communication mechanism across positions. The feed-forward network is applied independently at each position.",
        },
        {
          id: "transformer-kv-cache",
          question: "Why is a KV cache useful during autoregressive generation?",
          options: [
            "It reuses prior keys and values instead of recomputing them for every new token.",
            "It guarantees every generated fact is correct.",
            "It lets the model see future tokens.",
            "It eliminates the quadratic memory cost of the prompt entirely.",
          ],
          correctIndex: 0,
          explanation:
            "The cache avoids repeating past projection work, but it itself grows with sequence length and uses memory.",
        },
      ],
    },
  ],
};

export const AI_ENGINEERING_TOPICS = {
  "core-concepts": {
    slug: "core-concepts",
    lessons: [TRANSFORMER_ARCHITECTURE_LESSON],
  },
} as const;
