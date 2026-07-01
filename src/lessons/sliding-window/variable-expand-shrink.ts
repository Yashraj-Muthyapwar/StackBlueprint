import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; target: number };

const code = `def longest_subarray_at_most(arr, target):
    left = 0
    window_sum = 0
    best = 0
    for right in range(len(arr)):
        window_sum += arr[right]
        while window_sum > target:
            window_sum -= arr[left]
            left += 1
        best = max(best, right - left + 1)
    return best`;

function build({ arr, target }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];
  const win = (left: number, right: number) =>
    right >= left ? [{ from: left, to: right, tone: "mid" as const, label: `window (sum)` }] : [];

  if (n === 0) {
    steps.push({ line: 1, narration: "Empty array.", pointers: [] });
    return steps;
  }
  let left = 0,
    window_sum = 0,
    best = 0;
  steps.push({ line: 2, array: [...arr], pointers: ptrs(0, 0), narration: `Initialize left, window_sum, and best to 0.` });

  for (let right = 0; right < n; right++) {
    steps.push({
      line: 5,
      array: [...arr],
      pointers: ptrs(left, right),
      partitions: win(left, Math.max(left, right - 1)),
      narration: `For right = ${right}, process arr[${right}] = ${arr[right]}.`,
    });
    window_sum += arr[right];
    steps.push({
      line: 6,
      array: [...arr],
      pointers: ptrs(left, right),
      partitions: win(left, right),
      highlight: { kind: "compare", indices: [right] },
      status: `window_sum=${window_sum}`,
      narration: `Expand: include arr[${right}], window_sum=${window_sum}.`,
    });
    while (window_sum > target) {
      steps.push({
        line: 7,
        array: [...arr],
        pointers: ptrs(left, right),
        partitions: win(left, right),
        status: `window_sum=${window_sum} > ${target}`,
        narration: `Sum ${window_sum} exceeds ${target}. We must shrink from the left.`,
      });
      window_sum -= arr[left];
      steps.push({
        line: 8,
        array: [...arr],
        pointers: ptrs(left, right),
        partitions: win(left, right),
        status: `window_sum=${window_sum}`,
        narration: `Drop arr[${left}]=${arr[left]}, window_sum=${window_sum}.`,
      });
      left += 1;
      steps.push({
        line: 9,
        array: [...arr],
        pointers: ptrs(left, right),
        partitions: win(left, right),
        narration: `Advance left to ${left}.`,
      });
    }
    const len = right - left + 1;
    if (len > best) {
      best = len;
      steps.push({
        line: 10,
        array: [...arr],
        pointers: ptrs(left, right),
        partitions: win(left, right),
        highlight: { kind: "match", indices: Array.from({ length: len }, (_, i) => left + i) },
        status: `best=${best}`,
        narration: `New best length is ${best}.`,
      });
    } else {
      steps.push({
        line: 10,
        array: [...arr],
        pointers: ptrs(left, right),
        partitions: win(left, right),
        status: `best=${best}`,
        narration: `Length is ${len}, not greater than best (${best}).`,
      });
    }
  }
  steps.push({ line: 11, array: [...arr], pointers: ptrs(left, n - 1), status: `return ${best}`, narration: `Return the best length: ${best}.` });
  return steps;
}

export const variableExpandShrink: LessonBuilder<Inputs> = {
  slug: "variable-expand-shrink",
  title: "Sliding Window — Variable (Expand & Shrink)",
  subtitle: "Expand the right edge; shrink from the left whenever a constraint is violated.",
  problem: "Given an array of non-negative integers and a target sum, find the length of the longest contiguous subarray whose sum is less than or equal to the target.",
  spotIt: [
    "'Longest / shortest substring or subarray satisfying a condition' on a contiguous range.",
    "Condition can be checked incrementally as you add or remove one element.",
    "Constraint hints: distinct characters, sum ≤ S, at most K of something.",
  ],
  avoidWhen: [
    "The valid range is non-monotonic — shrinking from the left can skip valid answers.",
    "You need all subarrays, not just the optimal one — use prefix sums or hashing.",
    "Elements are not contiguous (subsequences / subsets) — sliding window doesn't apply.",
  ],
  variant: "variable-expand-shrink",
  view: "array",
  code,
  defaultInputs: { arr: [2, 1, 4, 1, 1, 1, 2, 3], target: 6 },
  inputs: [
    { key: "arr", label: "Array (non-negative)", kind: "intArray" },
    { key: "target", label: "Sum cap (≤ target)", kind: "int" },
  ],
  validate: ({ arr }) => {
    const w: string[] = [];
    if (arr.some((v) => v < 0)) w.push("Expand-shrink relies on a monotonic metric. With negative values shrinking from the left may not restore the constraint.");
    return w;
  },
  build,
};
