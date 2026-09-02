import { useState } from "react";
import { motion } from "motion/react";

const TOKENS = ["The", "cat", "sat"] as const;

const EXAMPLES = {
  The: {
    scores: [2.4, null, null],
    weights: [1, 0, 0],
    explanation: "The first position can only attend to itself in a causal model.",
  },
  cat: {
    scores: [0.7, 1.3, null],
    weights: [0.35, 0.65, 0],
    explanation: "The representation of cat uses its own features and some context from The.",
  },
  sat: {
    scores: [0.2, 2.4, 0.7],
    weights: [0.08, 0.79, 0.13],
    explanation: "This head has learned that cat is especially useful context for sat.",
  },
} as const;

function WeightCell({ value, disabled }: { value: number; disabled: boolean }) {
  if (disabled) {
    return (
      <div className="grid h-16 place-items-center rounded-lg border border-dashed border-hairline bg-surface-2/50 font-mono text-xs text-muted-foreground">
        masked
      </div>
    );
  }

  const shade = Math.max(0.08, value);
  return (
    <motion.div
      animate={{ opacity: 0.35 + shade * 0.65, scale: value > 0.7 ? 1.02 : 1 }}
      transition={{ duration: 0.25 }}
      className="grid h-16 place-items-center rounded-lg border border-mint/50 bg-mint/20 font-mono text-sm font-semibold text-mint"
    >
      {value.toFixed(2)}
    </motion.div>
  );
}

export function AttentionWorkbench() {
  const [focus, setFocus] = useState<(typeof TOKENS)[number]>("sat");
  const example = EXAMPLES[focus];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mint">
            Causal self-attention
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the token whose attention row you want to inspect.
          </p>
        </div>
        <div className="flex rounded-lg border border-hairline bg-surface-2/40 p-1">
          {TOKENS.map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => setFocus(token)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${focus === token ? "bg-mint/15 text-mint" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}
              aria-pressed={focus === token}
            >
              {token}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <div className="rounded-xl border border-hairline bg-surface/50 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            1. Scores before softmax
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {TOKENS.map((token, index) => (
              <div key={token} className="space-y-1.5 text-center">
                <p className="font-mono text-xs text-muted-foreground">key: {token}</p>
                <div
                  className={`rounded-lg border px-2 py-3 font-mono text-sm ${example.scores[index] === null ? "border-dashed border-hairline bg-surface-2/50 text-muted-foreground" : "border-violet/50 bg-violet/10 text-violet"}`}
                >
                  {example.scores[index] === null ? "−∞" : example.scores[index]}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Causal masking replaces future scores with negative infinity before softmax, so their
            resulting probability is zero.
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-surface/50 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            2. Attention weights after softmax
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {TOKENS.map((token, index) => (
              <div key={token} className="space-y-1.5 text-center">
                <p className="font-mono text-xs text-muted-foreground">value: {token}</p>
                <WeightCell
                  value={example.weights[index]}
                  disabled={example.scores[index] === null}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            The weighted sum of the value vectors becomes the attention output for{" "}
            <code className="text-mint">{focus}</code>. {example.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
