import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; queries: [number, number][] };

const code = `def build_prefix_sum(arr):
    prefix_sum = [0] * (len(arr) + 1)
    for i, v in enumerate(arr):
        prefix_sum[i + 1] = prefix_sum[i] + v
    return prefix_sum

def range_sum(prefix_sum, left, right):  # inclusive
    return prefix_sum[right + 1] - prefix_sum[left]`;

function build({ arr, queries }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  const prefix_sum = new Array<number>(n + 1).fill(0);
  steps.push({
    line: 1,
    array: [...arr],
    secondary: { label: "prefix_sum (length n+1, zero-initialized)", array: [...prefix_sum] },
    pointers: [],
    narration: "Allocate prefix sum array of length n+1.",
  });
  for (let i = 0; i < n; i++) {
    prefix_sum[i + 1] = prefix_sum[i] + arr[i];
    steps.push({
      line: 3,
      array: [...arr],
      pointers: [{ name: "i", index: i, color: "mint" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: {
        label: "prefix_sum",
        array: [...prefix_sum],
        highlight: { kind: "match", indices: [i + 1] },
        pointers: [{ name: "i+1", index: i + 1, color: "mint" }],
      },
      status: `prefix_sum[${i + 1}] = prefix_sum[${i}] + ${arr[i]} = ${prefix_sum[i + 1]}`,
      narration: `prefix_sum[${i + 1}] ← prefix_sum[${i}] + arr[${i}] = ${prefix_sum[i + 1]}.`,
    });
  }
  for (const [left, right] of queries) {
    if (left < 0 || right >= n || left > right) {
      steps.push({
        line: 6,
        array: [...arr],
        secondary: { label: "prefix_sum", array: [...prefix_sum] },
        status: `invalid range [${left}, ${right}]`,
        narration: `Skip invalid query [${left}, ${right}].`,
        pointers: [],
      });
      continue;
    }
    const ans = prefix_sum[right + 1] - prefix_sum[left];
    steps.push({
      line: 6,
      array: [...arr],
      pointers: [
        { name: "left", index: left, color: "mint" },
        { name: "right", index: right, color: "amber" },
      ],
      partitions: [{ from: left, to: right, tone: "mid", label: `sum=${ans}` }],
      secondary: {
        label: "prefix_sum",
        array: [...prefix_sum],
        highlight: { kind: "compare", indices: [left, right + 1] },
        pointers: [
          { name: "left", index: left, color: "mint" },
          { name: "right+1", index: right + 1, color: "amber" },
        ],
      },
      status: `prefix_sum[${right + 1}] - prefix_sum[${left}] = ${prefix_sum[right + 1]} - ${prefix_sum[left]} = ${ans}`,
      narration: `Range sum arr[${left}..${right}] = ${ans} in O(1).`,
    });
  }
  return steps;
}

export const prefixSum: LessonBuilder<Inputs> = {
  slug: "prefix-sum",
  title: "Prefix Sum",
  subtitle: "Precompute running totals; any range sum becomes a single subtraction.",
  problem: "Given an array, preprocess it so that the sum of any range [left, right] can be answered in O(1) per query.",
  spotIt: [
    "Many range-sum queries on a static array.",
    "Problems like 'subarray sum equals K' or 'number of subarrays with sum divisible by K' (prefix + hash map).",
    "Editorial mentions O(1) per query after O(n) preprocessing.",
  ],
  avoidWhen: [
    "The array is frequently updated — use a Fenwick tree / segment tree.",
    "You need range min / max / gcd, not sum — prefix sums don't apply.",
    "Only a single query: just iterate, skip preprocessing.",
  ],
  variant: "prefix-sum",
  view: "array",
  code,
  defaultInputs: { arr: [3, 1, 4, 1, 5, 9, 2, 6], queries: [[1, 4], [0, 7], [3, 5]] },
  inputs: [
    { key: "arr", label: "Array", kind: "intArray" },
    { key: "queries", label: "Queries (left,right pairs)", kind: "intPairs", help: "inclusive · `0,3; 1,4`" },
  ],
  validate: ({ arr, queries }) => {
    const w: string[] = [];
    for (const [left, right] of queries) {
      if (left < 0 || right >= arr.length || left > right) {
        w.push(`Query [${left}, ${right}] is out of bounds for length ${arr.length}.`);
      }
    }
    return w;
  },
  build,
};
