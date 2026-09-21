import type { LessonBuilder, Step } from "../types";

type Inputs = { x: number };

const code = `def isqrt(x):
    # largest k where k*k <= x
    low, high = 0, x
    ans = 0
    while low <= high:
        mid = (low + high) // 2
        if mid * mid <= x:
            ans = mid
            low = mid + 1
        else:
            high = mid - 1
    return ans`;

function build({ x }: Inputs): Step[] {
  const steps: Step[] = [];
  if (x < 0) {
    steps.push({ line: 1, narration: "x must be ≥ 0.", pointers: [] });
    return steps;
  }
  // Visualize search space [0..x] as an array of indices
  const space = Array.from({ length: x + 1 }, (_, i) => i);
  let low = 0,
    high = x,
    ans = 0;
  const ptrs = (mid?: number): import("../types").Pointer[] => {
    const out: import("../types").Pointer[] = [
      { name: "low", index: low, color: "mint", placement: "above" },
      { name: "high", index: high, color: "amber", placement: "above" },
    ];
    if (mid !== undefined)
      out.push({ name: "mid", index: mid, color: "violet", placement: "below" });
    return out;
  };
  const partFor = (): Step["partitions"] =>
    low <= high ? [{ from: low, to: high, tone: "mid", label: "feasible?" }] : [];

  steps.push({
    line: 3,
    array: [...space],
    pointers: ptrs(),
    partitions: partFor(),
    narration: `Search the answer space [0, ${x}].`,
  });
  let safety = 0;
  while (low <= high && safety++ < 64) {
    const mid = (low + high) >> 1;
    const sq = mid * mid;
    const ok = sq <= x;
    steps.push({
      line: 5,
      array: [...space],
      pointers: ptrs(mid),
      partitions: partFor(),
      highlight: { kind: "compare", indices: [mid] },
      status: `mid=${mid}, mid² = ${sq} ${ok ? "≤" : ">"} ${x}`,
      narration: `Test mid=${mid}. ${sq} ${ok ? "≤" : ">"} ${x}.`,
    });
    if (ok) {
      ans = mid;
      low = mid + 1;
      steps.push({
        line: 7,
        array: [...space],
        pointers: ptrs(),
        partitions: partFor(),
        status: `ans=${ans}`,
        narration: `Feasible — record ans=${ans} and push low to ${low}.`,
      });
    } else {
      high = mid - 1;
      steps.push({
        line: 9,
        array: [...space],
        pointers: ptrs(),
        partitions: partFor(),
        narration: `Infeasible — pull high to ${high}.`,
      });
    }
  }
  steps.push({
    line: 10,
    array: [...space],
    highlight: { kind: "match", indices: [ans] },
    pointers: [{ name: "ans", index: ans, color: "mint" }],
    status: `return ${ans}`,
    narration: `Largest k with k² ≤ ${x} is ${ans}.`,
  });
  return steps;
}

export const bsearchAnswer: LessonBuilder<Inputs> = {
  slug: "on-answer",
  title: "Binary Search on Answer",
  subtitle:
    "When the answer space is monotonic (feasible / infeasible), binary search the answer itself.",
  problem:
    "Given a non-negative integer x, compute the integer square root: the largest integer r such that r*r <= x.",
  spotIt: [
    "'Minimum / maximum value such that a check passes' with a clear feasible/infeasible boundary.",
    "You can write a fast feasibility check but can't enumerate all answers.",
    "Phrases: 'minimize the largest', 'split array', 'capacity to ship', 'eat bananas in H hours'.",
  ],
  avoidWhen: [
    "Feasibility is not monotonic in the answer \u2014 binary search will lock onto the wrong side.",
    "The answer space is tiny \u2014 just iterate.",
    "Check function is too slow \u2014 bring the per-step cost down first.",
  ],
  variant: "bsearch-answer",
  view: "array",
  code,
  defaultInputs: { x: 30 },
  inputs: [{ key: "x", label: "x  (compute ⌊√x⌋)", kind: "int", min: 0, max: 64 }],
  validate: ({ x }) => {
    const w: string[] = [];
    if (x < 0) w.push("x must be ≥ 0.");
    if (x > 64) w.push("Keep x ≤ 64 for a readable search space.");
    return w;
  },
  build,
};
