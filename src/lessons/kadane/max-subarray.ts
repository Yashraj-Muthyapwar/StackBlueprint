import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[] };

const code = `def kadane(arr):
    best = cur = arr[0]
    start = end = best_l = best_r = 0
    for i in range(1, len(arr)):
        if cur + arr[i] < arr[i]:
            cur = arr[i]
            start = i
        else:
            cur = cur + arr[i]
        if cur > best:
            best = cur
            best_l, best_r = start, i
    return best`;

function build({ arr }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty array.", pointers: [] });
    return steps;
  }
  let best = arr[0],
    cur = arr[0],
    start = 0,
    bestL = 0,
    bestR = 0;
  const ptrs = (i: number) => [{ name: "i", index: i, color: "amber" as const }];
  const winBest = () => [{ from: bestL, to: bestR, tone: "mid" as const, label: `best ${best}` }];

  steps.push({
    line: 1,
    array: [...arr],
    pointers: ptrs(0),
    partitions: winBest(),
    status: `cur=${cur}, best=${best}`,
    narration: "Start with the first element.",
  });

  for (let i = 1; i < n; i++) {
    const extend = cur + arr[i];
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(i),
      partitions: winBest(),
      highlight: { kind: "compare", indices: [i] },
      status: `extend=${extend} vs fresh=${arr[i]}`,
      narration: `Extend current sum ${cur} → ${extend}, or start fresh at ${arr[i]}?`,
    });
    if (cur + arr[i] < arr[i]) {
      cur = arr[i];
      start = i;
      steps.push({
        line: 5,
        array: [...arr],
        pointers: ptrs(i),
        partitions: winBest(),
        status: `cur=${cur} (restart)`,
        narration: `Restart subarray at i=${i}, cur=${cur}.`,
      });
    } else {
      cur = cur + arr[i];
      steps.push({
        line: 7,
        array: [...arr],
        pointers: ptrs(i),
        partitions: winBest(),
        status: `cur=${cur} (extend)`,
        narration: `Extend, cur=${cur}.`,
      });
    }
    if (cur > best) {
      best = cur;
      bestL = start;
      bestR = i;
      steps.push({
        line: 9,
        array: [...arr],
        pointers: ptrs(i),
        partitions: winBest(),
        highlight: { kind: "match", indices: Array.from({ length: bestR - bestL + 1 }, (_, k) => bestL + k) },
        status: `best=${best}`,
        narration: `New best ${best} on [${bestL}..${bestR}].`,
      });
    }
  }
  steps.push({
    line: 11,
    array: [...arr],
    partitions: winBest(),
    status: `return ${best}`,
    narration: `Maximum subarray sum = ${best}.`,
    pointers: [],
  });
  return steps;
}

export const kadane: LessonBuilder<Inputs> = {
  slug: "max-subarray",
  title: "Kadane's — Max Subarray Sum",
  subtitle: "At each index, decide: extend the current subarray or restart fresh.",
  problem: "Given an integer array, return the largest sum achievable by any contiguous non-empty subarray.",
  variant: "kadane",
  view: "array",
  code,
  defaultInputs: { arr: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
  inputs: [{ key: "arr", label: "Array", kind: "intArray" }],
  validate: ({ arr }) => {
    const w: string[] = [];
    if (arr.length === 0) w.push("Array is empty.");
    if (arr.every((v) => v < 0)) w.push("All negatives — the answer is the single largest element.");
    return w;
  },
  build,
};
