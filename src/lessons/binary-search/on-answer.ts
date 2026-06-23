import type { LessonBuilder, Step } from "../types";

type Inputs = { x: number };

const code = `def isqrt(x):
    # largest k where k*k <= x
    lo, hi = 0, x
    ans = 0
    while lo <= hi:
        mid = (lo + hi) // 2
        if mid * mid <= x:
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return ans`;

function build({ x }: Inputs): Step[] {
  const steps: Step[] = [];
  if (x < 0) {
    steps.push({ line: 1, narration: "x must be ≥ 0.", pointers: [] });
    return steps;
  }
  // Visualize search space [0..x] as an array of indices
  const space = Array.from({ length: x + 1 }, (_, i) => i);
  let lo = 0,
    hi = x,
    ans = 0;
  const ptrs = (mid?: number) => {
    const out = [
      { name: "lo", index: lo, color: "mint" as const, placement: "above" as const },
      { name: "hi", index: hi, color: "amber" as const, placement: "above" as const },
    ];
    if (mid !== undefined) out.push({ name: "mid", index: mid, color: "violet" as const, placement: "below" as const });
    return out;
  };
  const partFor = (): Step["partitions"] => (lo <= hi ? [{ from: lo, to: hi, tone: "mid", label: "feasible?" }] : []);

  steps.push({ line: 3, array: [...space], pointers: ptrs(), partitions: partFor(), narration: `Search the answer space [0, ${x}].` });
  let safety = 0;
  while (lo <= hi && safety++ < 64) {
    const mid = (lo + hi) >> 1;
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
      lo = mid + 1;
      steps.push({ line: 7, array: [...space], pointers: ptrs(), partitions: partFor(), status: `ans=${ans}`, narration: `Feasible — record ans=${ans} and push lo to ${lo}.` });
    } else {
      hi = mid - 1;
      steps.push({ line: 9, array: [...space], pointers: ptrs(), partitions: partFor(), narration: `Infeasible — pull hi to ${hi}.` });
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
  subtitle: "When the answer space is monotonic (feasible / infeasible), binary search the answer itself.",
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
