import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[] };

const code = `def kadane(arr):
    best_sum = current_sum = arr[0]
    for i in range(1, len(arr)):
        if current_sum + arr[i] < arr[i]:
            current_sum = arr[i]
        else:
            current_sum = current_sum + arr[i]
        if current_sum > best_sum:
            best_sum = current_sum
    return best_sum`;

function build({ arr }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty array.", pointers: [] });
    return steps;
  }
  let bestSum = arr[0],
    currentSum = arr[0],
    start = 0,
    bestL = 0,
    bestR = 0;
  const ptrs = (i: number) => [{ name: "i", index: i, color: "amber" as const }];
  const winBest = () => [{ from: bestL, to: bestR, tone: "mid" as const, label: `best ${bestSum}` }];

  steps.push({
    line: 1,
    array: [...arr],
    pointers: ptrs(0),
    partitions: winBest(),
    status: `current_sum=${currentSum}, best_sum=${bestSum}`,
    narration: "Start with the first element.",
  });

  for (let i = 1; i < n; i++) {
    const extend = currentSum + arr[i];
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(i),
      partitions: winBest(),
      highlight: { kind: "compare", indices: [i] },
      status: `extend=${extend} vs fresh=${arr[i]}`,
      narration: `Extend current sum ${currentSum} → ${extend}, or start fresh at ${arr[i]}?`,
    });
    if (currentSum + arr[i] < arr[i]) {
      currentSum = arr[i];
      start = i;
      steps.push({
        line: 5,
        array: [...arr],
        pointers: ptrs(i),
        partitions: winBest(),
        status: `current_sum=${currentSum} (restart)`,
        narration: `Restart subarray at i=${i}, current_sum=${currentSum}.`,
      });
    } else {
      currentSum = currentSum + arr[i];
      steps.push({
        line: 7,
        array: [...arr],
        pointers: ptrs(i),
        partitions: winBest(),
        status: `current_sum=${currentSum} (extend)`,
        narration: `Extend, current_sum=${currentSum}.`,
      });
    }
    if (currentSum > bestSum) {
      bestSum = currentSum;
      bestL = start;
      bestR = i;
      steps.push({
        line: 9,
        array: [...arr],
        pointers: ptrs(i),
        partitions: winBest(),
        highlight: { kind: "match", indices: Array.from({ length: bestR - bestL + 1 }, (_, k) => bestL + k) },
        status: `best_sum=${bestSum}`,
        narration: `New best ${bestSum} on [${bestL}..${bestR}].`,
      });
    }
  }
  steps.push({
    line: 11,
    array: [...arr],
    partitions: winBest(),
    status: `return ${bestSum}`,
    narration: `Maximum subarray sum = ${bestSum}.`,
    pointers: [],
  });
  return steps;
}

export const kadane: LessonBuilder<Inputs> = {
  slug: "max-subarray",
  title: "Kadane's — Max Subarray Sum",
  subtitle: "At each index, decide: extend the current subarray or restart fresh.",
  problem: "Given an integer array, return the largest sum achievable by any contiguous non-empty subarray.",
  spotIt: [
    "'Maximum sum contiguous subarray' or any variant ('circular', 'with one deletion').",
    "Array contains negatives — otherwise the answer is just the total sum.",
    "Interviewer asks for O(n) and O(1) space.",
  ],
  avoidWhen: [
    "You need the actual indices and the problem disallows extra state — be careful with bookkeeping.",
    "Subarrays don't have to be contiguous — switch to DP on subsets or greedy.",
    "Aggregation is product, not sum — use the product-subarray variant.",
  ],
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
