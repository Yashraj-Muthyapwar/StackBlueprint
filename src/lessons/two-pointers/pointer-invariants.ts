import type { LessonBuilder, QuizQuestion, Section } from "../types";

/**
 * Hidden grader for the invariant-checker challenge. It reaches builtins directly so shadowing
 * `all` or `print` cannot fake a pass, compares the learner's answer with a reference on fixed
 * and generated states, and checks that the learner's function leaves the array unchanged.
 */
const invariantTests = String.raw`
import builtins as _sb_b

def _sb_reference(values, low, mid, high):
    for k in _sb_b.range(0, low):
        if values[k] != 0:
            return False
    for k in _sb_b.range(low, mid):
        if values[k] != 1:
            return False
    for k in _sb_b.range(high + 1, _sb_b.len(values)):
        if values[k] != 2:
            return False
    return True

def _sb_grade():
    cases = [
        ([0, 0, 1, 1, 2, 0, 1, 2, 2], 2, 4, 6),
        ([0, 0, 1, 1, 2, 0, 1, 2, 1], 2, 4, 6),
        ([0, 1, 1, 2, 0, 1, 2, 2], 1, 3, 5),
        ([2, 0, 1], 0, 0, 2),
        ([0, 1, 2], 1, 2, 1),
        ([1, 0, 2], 1, 1, 2),
        ([0], 1, 1, 0),
        ([2], 0, 0, -1),
        ([1, 1, 1], 0, 3, 2),
        ([0, 0, 0], 3, 3, 2),
    ]
    seed = 20240607
    for _ in _sb_b.range(120):
        seed = (seed * 1103515245 + 12345) % 2147483648
        size = 1 + (seed >> 8) % 9
        seed = (seed * 1103515245 + 12345) % 2147483648
        low = (seed >> 8) % (size + 1)
        seed = (seed * 1103515245 + 12345) % 2147483648
        mid = low + (seed >> 8) % (size - low + 1)
        seed = (seed * 1103515245 + 12345) % 2147483648
        high = mid - 1 + (seed >> 8) % (size - mid + 1)
        values = []
        for _k in _sb_b.range(size):
            seed = (seed * 1103515245 + 12345) % 2147483648
            pick = (seed >> 8) % 7
            values.append(0 if pick < 2 else 1 if pick < 5 else 2)
        # Bias some generated states towards a valid arrangement.
        if (seed >> 12) % 2 == 0:
            for k in _sb_b.range(0, low):
                values[k] = 0
            for k in _sb_b.range(low, mid):
                values[k] = 1
            for k in _sb_b.range(high + 1, size):
                values[k] = 2
        cases.append((values, low, mid, high))
    valid = 0
    for values, low, mid, high in cases:
        want = _sb_reference(values, low, mid, high)
        valid += 1 if want else 0
        before = _sb_b.list(values)
        got = check_invariant(values, low, mid, high)
        if values != before:
            return "check_invariant must not change the array."
        if got is not True and got is not False:
            return "check_invariant must return True or False."
        if got != want:
            return "Wrong answer for " + _sb_b.str(before) + " with low=" + _sb_b.str(low) + ", mid=" + _sb_b.str(mid) + ", high=" + _sb_b.str(high) + ": expected " + _sb_b.str(want) + "."
    if valid < 10 or valid > _sb_b.len(cases) - 10:
        return "Internal test set is unbalanced."
    return "All hidden tests passed"

_sb_b.print(_sb_grade())`;

const challenge: QuizQuestion = {
  id: "invariant-checker",
  question:
    "Practical challenge: Check the invariant. During Dutch National Flag the array is `numbers`, and `low`, `mid` and `high` are the three pointers. Write a function `check_invariant(numbers, low, mid, high)` that returns `True` when every value before `low` is 0, every value from `low` to `mid - 1` is 1, and every value after `high` is 2. Values from `mid` to `high` are not classified yet, so ignore them. Return `False` otherwise, and do not change the array. For `[0, 0, 1, 1, 2, 0, 1, 2, 2]` with `low = 2`, `mid = 4` and `high = 6` the answer is `True`.",
  interactiveCode: true,
  initialCode: `def check_invariant(numbers, low, mid, high):
    # Write your code here.
    pass


numbers = [0, 0, 1, 1, 2, 0, 1, 2, 2]
print(check_invariant(numbers, 2, 4, 6))
`,
  testCode: invariantTests,
  expectedOutput: "All hidden tests passed",
  gradeLastLine: true,
  requiredCodePatterns: [String.raw`def\s+check_invariant\s*\(`, String.raw`\breturn\b`],
  validationMessage:
    "Define `check_invariant(numbers, low, mid, high)` and return `True` or `False`.",
  forbiddenCodePatterns: [
    {
      pattern: String.raw`\bimport\b|__|\bexec\b|\beval\b|\bglobals\b|\bsetattr\b|\bcompile\b`,
      message: "This challenge does not need imports or Python internals. Check each region.",
    },
  ],
  explanation:
    "Each rule talks about one region, so check each region separately: indices before `low` must be 0, indices from `low` to `mid - 1` must be 1, and indices after `high` must be 2. The region from `mid` to `high` is unclassified, so it is never checked. Writing the invariant as code like this is how you can assert it while debugging a pointer loop.",
};

const quizQuestions: QuizQuestion[] = [
  {
    id: "invariant-definition",
    question: "What is a pointer invariant?",
    options: [
      "A condition that must stay true as the pointers move and the array changes.",
      "A pointer that never moves during the loop.",
      "The condition that makes the loop stop.",
    ],
    correctIndex: 0,
    explanation:
      "An invariant is a rule about the array and the pointers that holds before the loop, after every move and when the loop ends. The loop condition only says when to stop.",
  },
  {
    id: "invariant-mid-stays",
    question:
      "In Dutch National Flag, `numbers[mid]` is 2. We swap it with `numbers[high]` and decrease `high`. Why does `mid` stay where it is?",
    options: [
      "The value that arrived at mid has not been classified yet.",
      "mid must always equal low.",
      "Every value at mid must be 1.",
    ],
    correctIndex: 0,
    explanation:
      "The swap brings an unknown value to `mid`. Moving `mid` forward would skip it and could leave a 0 or a 2 inside the region that must hold only 1s.",
  },
  {
    id: "invariant-proof-parts",
    question: "Which three parts make a useful loop-correctness argument?",
    options: [
      "Initialization, maintenance and termination.",
      "Sorting, searching and returning.",
      "Reading, writing and swapping.",
    ],
    correctIndex: 0,
    explanation:
      "The invariant must hold before the loop starts (initialization), survive every iteration (maintenance), and be strong enough at the end to show the result is correct (termination).",
  },
  challenge,
];

const pointerInvariantSections: Section[] = [
  {
    kind: "prose",
    eyebrow: "1 · Why",
    heading: "Why do pointer invariants matter?",
    body: [
      "Writing code that works for one example is not enough. In an interview, you need to understand why it works for every valid input.",
      "For example, when moving zeros, you used two pointers:",
    ],
  },
  {
    kind: "list",
    items: ["`fast` scans the array.", "`slow` tracks where to write the next nonzero value."],
  },
  {
    kind: "prose",
    body: [
      "The key question is not only, “Which pointer moves?”",
      "It is also, “What must remain true after each move?”",
      "That question is the foundation of pointer invariants.",
    ],
  },
  {
    kind: "callout",
    tone: "violet",
    title: "A way of thinking, not a new pattern",
    body: "Pointer invariants are not a separate pattern. They are the reasoning you apply inside every pointer pattern, so this lesson has no algorithm of its own to memorize.",
  },
  {
    kind: "prose",
    eyebrow: "2 · Intuition",
    heading: "Think of rules that must always hold",
    body: [
      "Imagine sorting an array that contains only 0, 1 and 2. Dutch National Flag splits it into regions with three pointers. The middle region is the part still being examined.",
    ],
  },
  {
    kind: "invariant-regions",
    rules: [
      { region: "zeros", text: "Every value before `low` is 0." },
      { region: "ones", text: "Every value between `low` and `mid - 1` is 1." },
      { region: "twos", text: "Every value after `high` is 2." },
      { region: "unknown", text: "Values between `mid` and `high` are not yet classified." },
    ],
  },
  {
    kind: "prose",
    body: [
      "The pointers can move, but these rules must remain true.",
      "That is a pointer invariant.",
    ],
  },
  {
    kind: "prose",
    eyebrow: "3 · How",
    heading: "The three questions to ask",
    body: ["Whenever you solve a two-pointer problem, ask these questions."],
  },
  {
    kind: "table",
    caption: "Three questions for every pointer move",
    headers: ["", "Question", "Example in Dutch National Flag"],
    rows: [
      ["1", "What is already guaranteed to be correct?", "Everything before `low` is already 0."],
      [
        "2",
        "What can I safely change?",
        "When `numbers[mid] == 1`, that value belongs in the middle region. We can increment `mid`.",
      ],
      [
        "3",
        "Why is the next pointer move safe?",
        "When `numbers[mid] == 2`, we swap it with `numbers[high]` and decrease `high`. We do not increment `mid` because the incoming value has not been classified.",
      ],
    ],
  },
  {
    kind: "prose",
    eyebrow: "4 · Example",
    heading: "Connect invariants to your patterns",
    body: [],
  },
  {
    kind: "table",
    caption: "What must remain true in each pattern",
    headers: ["Pattern", "What must remain true?"],
    rows: [
      ["Opposite Ends", "The portion outside the pointers is already reversed correctly."],
      [
        "Slow/Fast: Remove Duplicates",
        "The region through `slow` contains the unique values found so far.",
      ],
      [
        "Slow/Fast: Move Zeros",
        "The processed portion contains the nonzero values in their original order, followed by any processed zeros if using a swap-based version.",
      ],
      [
        "Dutch National Flag",
        "The classified regions contain only their assigned values: 0, 1 and 2.",
      ],
      [
        "Sorted 2-Sum",
        "Any pair eliminated by pointer movement cannot be a valid solution for the remaining search.",
      ],
      [
        "3-Sum",
        "For a fixed `i`, the remaining pointer search considers possible pairs in the remaining sorted range, while duplicate skipping prevents repeated triplets.",
      ],
    ],
  },
  {
    kind: "callout",
    tone: "info",
    title: "No single invariant",
    body: "The exact invariant depends on the algorithm. You do not need to use the same invariant for every problem.",
  },
  {
    kind: "prose",
    eyebrow: "5 · Trade-offs",
    heading: "What should you remember?",
    body: [],
  },
  {
    kind: "list",
    items: [
      "An invariant is a reasoning tool, not extra code.",
      "A pointer move is correct only if it preserves the invariant.",
      "A loop condition tells you when to stop. The invariant helps explain why stopping is safe.",
    ],
  },
  {
    kind: "prose",
    body: ["A useful proof has three parts. They are commonly used to prove loop correctness."],
  },
  {
    kind: "table",
    caption: "The three parts of a loop proof",
    headers: ["Part", "What you show"],
    rows: [
      ["Initialization", "The invariant is true before the loop starts."],
      ["Maintenance", "Every operation preserves it."],
      [
        "Termination",
        "When the loop ends, the invariant helps establish that the result is correct.",
      ],
    ],
  },
  {
    kind: "prose",
    eyebrow: "6 · Practice",
    heading: "Test your reasoning",
    body: ["You are implementing Dutch National Flag with this state:"],
  },
  {
    kind: "code",
    language: "python",
    caption: "Scenario",
    code: "numbers = [2, 0, 1]\nlow = 0\nmid = 0\nhigh = 2",
  },
  {
    kind: "prose",
    body: [
      "At `mid`, the value is 2. You swap `numbers[mid]` with `numbers[high]` and then decrease `high`.",
    ],
  },
  {
    kind: "pattern-exercises",
    exercises: [
      {
        type: "choice",
        label: "Question A",
        title: "Why mid stays in place",
        prompt: "Why must `mid` stay in place?",
        options: [
          "Because the incoming value has not been classified yet.",
          "Because mid must always equal low.",
          "Because every value at mid must be 1.",
        ],
        answer: 0,
        success:
          "Right. The swap brought `numbers[1]`, a value nobody has examined, to `mid`. It still has to be looked at.",
        hint: "Think about what the swap just put at `numbers[mid]`.",
      },
      {
        type: "choice",
        label: "Question B",
        title: "The invariant that is preserved",
        prompt: "Which invariant does this pointer movement preserve?",
        options: [
          "Every value after high is 2.",
          "Every value before low is 1.",
          "Every value between mid and high is already classified.",
        ],
        answer: 0,
        success:
          "Correct. The 2 now sits at the old `high`, and decreasing `high` puts it in the region after `high`, which must hold only 2s.",
        hint: "Look at where the 2 ended up and which pointer moved after the swap.",
      },
    ],
  },
  {
    kind: "takeaways",
    items: [
      "A pointer invariant is a condition that must remain true as pointers move and the array changes.",
      "Ask three questions: what is already guaranteed, what can I safely change, and why is the next move safe.",
      "A pointer move is correct only if it preserves the invariant, which is why `mid` stays put after a swap with `high`.",
      "The loop condition says when to stop. The invariant explains why stopping is safe.",
      "A loop proof has initialization, maintenance and termination. Each pattern keeps its own invariant.",
    ],
  },
  { kind: "quiz", questions: quizQuestions },
];

export const pointerInvariants: LessonBuilder<Record<string, never>> = {
  slug: "pointer-invariants",
  title: "Pointer Invariants: What Must Stay True",
  subtitle: "Learn the question that makes every pointer move safe: what must remain true?",
  tag: "Concept",
  problem: "Explain why a pointer algorithm is correct by stating what stays true after each move.",
  takeaways: [
    "An invariant is a reasoning tool, not extra code.",
    "A move is correct only if it preserves the invariant.",
    "Show initialization, maintenance and termination.",
  ],
  variant: "pointer-invariants",
  view: "array",
  code: `def check_invariant(numbers, low, mid, high):
    return (
        all(value == 0 for value in numbers[:low])
        and all(value == 1 for value in numbers[low:mid])
        and all(value == 2 for value in numbers[high + 1:])
    )`,
  sections: pointerInvariantSections,
  defaultInputs: {},
  inputs: [],
  build: () => [
    {
      line: 1,
      array: [0, 0, 1, 1, 2, 0, 1, 2, 2],
      narration: "Use the concept lesson to see which rules hold in each region.",
    },
  ],
};
