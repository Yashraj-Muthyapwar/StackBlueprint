import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; k: number };

const code = `def max_window_sum(arr, k):
    window_sum = sum(arr[:k])
    best = window_sum
    for right in range(k, len(arr)):
        window_sum += arr[right] - arr[right - k]
        if window_sum > best:
            best = window_sum
    return best`;

function build({ arr, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (k <= 0 || k > n) {
    steps.push({ line: 1, narration: "Invalid k for the array.", array: [...arr], pointers: [] });
    return steps;
  }
  const win = (left: number, right: number) =>
    [{ from: left, to: right, tone: "mid" as const, label: "window" }];
  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];
  let window_sum = 0;
  for (let i = 0; i < k; i++) window_sum += arr[i];
  steps.push({
    line: 2,
    array: [...arr],
    pointers: ptrs(0, k - 1),
    partitions: win(0, k - 1),
    status: `window_sum = ${window_sum}`,
    narration: `Calculate sum of the first ${k} elements: ${window_sum}.`,
  });
  let best = window_sum;
  steps.push({
    line: 3,
    array: [...arr],
    pointers: ptrs(0, k - 1),
    partitions: win(0, k - 1),
    status: `best = ${best}`,
    narration: `Set initial best sum to ${best}.`,
  });
  for (let right = k; right < n; right++) {
    const left = right - k + 1;
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(left - 1, right),
      partitions: win(left - 1, right - 1),
      narration: `Move right pointer to index ${right}.`,
    });
    steps.push({
      line: 5,
      array: [...arr],
      pointers: ptrs(left, right),
      partitions: win(left, right),
      highlight: { kind: "compare", indices: [right, left - 1] },
      narration: `Slide window: add arr[${right}]=${arr[right]}, subtract arr[${left - 1}]=${arr[left - 1]}.`,
    });
    window_sum += arr[right] - arr[left - 1];
    steps.push({
      line: 6,
      array: [...arr],
      pointers: ptrs(left, right),
      partitions: win(left, right),
      status: `window_sum = ${window_sum}`,
      narration: `Is new window_sum (${window_sum}) > best (${best})?`,
    });
    if (window_sum > best) {
      best = window_sum;
      steps.push({
        line: 7,
        array: [...arr],
        pointers: ptrs(left, right),
        partitions: win(left, right),
        highlight: { kind: "match", indices: Array.from({ length: k }, (_, i) => left + i) },
        status: `best = ${best}`,
        narration: `Yes, update best = ${best}.`,
      });
    } else {
      steps.push({
        line: 6,
        array: [...arr],
        pointers: ptrs(left, right),
        partitions: win(left, right),
        narration: `No, keep best = ${best}.`,
      });
    }
  }
  steps.push({
    line: 8,
    array: [...arr],
    pointers: [],
    status: `return ${best}`,
    narration: `Return the best sum: ${best}.`,
  });
  return steps;
}

export const fixedSize: LessonBuilder<Inputs> = {
  slug: "fixed-size",
  title: "Sliding Window — Fixed Size",
  subtitle: "A window of size k slides across the array. Each step add the new element, drop the old one.",
  problem: "Given an array of integers and a window size k, return the maximum sum of any contiguous subarray of length exactly k.",
  spotIt: [
    "Problem explicitly gives a window size k and asks for a stat over every window.",
    "Phrases: 'max / min / sum / average of every subarray of size k'.",
    "Brute force is O(n\u00b7k) and the interviewer asks you to improve it to O(n).",
  ],
  avoidWhen: [
    "Window size depends on a condition \u2014 use variable-size sliding window instead.",
    "Aggregation is not incremental (e.g. needs full re-sort) \u2014 a heap or deque variant is needed.",
    "You need answers over non-contiguous subsets.",
  ],
  variant: "fixed-size",
  view: "array",
  code,
  defaultInputs: { arr: [2, 1, 5, 1, 3, 2, 7, 1], k: 3 },
  inputs: [
    { key: "arr", label: "Array", kind: "intArray" },
    { key: "k", label: "Window size k", kind: "int", min: 1 },
  ],
  validate: ({ arr, k }) => {
    const w: string[] = [];
    if (!Number.isInteger(k) || k < 1) w.push("k must be a positive integer.");
    else if (k > arr.length) w.push(`k (${k}) > array length (${arr.length}).`);
    return w;
  },
  build,
};
