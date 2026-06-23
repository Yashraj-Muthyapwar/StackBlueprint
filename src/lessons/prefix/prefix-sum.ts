import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; queries: [number, number][] };

const code = `def build_prefix(arr):
    pre = [0] * (len(arr) + 1)
    for i, v in enumerate(arr):
        pre[i + 1] = pre[i] + v
    return pre

def range_sum(pre, l, r):  # inclusive
    return pre[r + 1] - pre[l]`;

function build({ arr, queries }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  const pre = new Array<number>(n + 1).fill(0);
  steps.push({
    line: 1,
    array: [...arr],
    secondary: { label: "prefix (length n+1, zero-initialized)", array: [...pre] },
    pointers: [],
    narration: "Allocate prefix array of length n+1.",
  });
  for (let i = 0; i < n; i++) {
    pre[i + 1] = pre[i] + arr[i];
    steps.push({
      line: 3,
      array: [...arr],
      pointers: [{ name: "i", index: i, color: "mint" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: {
        label: "prefix",
        array: [...pre],
        highlight: { kind: "match", indices: [i + 1] },
        pointers: [{ name: "i+1", index: i + 1, color: "mint" }],
      },
      status: `pre[${i + 1}] = pre[${i}] + ${arr[i]} = ${pre[i + 1]}`,
      narration: `pre[${i + 1}] ← pre[${i}] + arr[${i}] = ${pre[i + 1]}.`,
    });
  }
  for (const [l, r] of queries) {
    if (l < 0 || r >= n || l > r) {
      steps.push({
        line: 6,
        array: [...arr],
        secondary: { label: "prefix", array: [...pre] },
        status: `invalid range [${l}, ${r}]`,
        narration: `Skip invalid query [${l}, ${r}].`,
        pointers: [],
      });
      continue;
    }
    const ans = pre[r + 1] - pre[l];
    steps.push({
      line: 6,
      array: [...arr],
      pointers: [
        { name: "l", index: l, color: "mint" },
        { name: "r", index: r, color: "amber" },
      ],
      partitions: [{ from: l, to: r, tone: "mid", label: `sum=${ans}` }],
      secondary: {
        label: "prefix",
        array: [...pre],
        highlight: { kind: "compare", indices: [l, r + 1] },
        pointers: [
          { name: "l", index: l, color: "mint" },
          { name: "r+1", index: r + 1, color: "amber" },
        ],
      },
      status: `pre[${r + 1}] - pre[${l}] = ${pre[r + 1]} - ${pre[l]} = ${ans}`,
      narration: `Range sum arr[${l}..${r}] = ${ans} in O(1).`,
    });
  }
  return steps;
}

export const prefixSum: LessonBuilder<Inputs> = {
  slug: "prefix-sum",
  title: "Prefix Sum",
  subtitle: "Precompute running totals; any range sum becomes a single subtraction.",
  variant: "prefix-sum",
  view: "array",
  code,
  defaultInputs: { arr: [3, 1, 4, 1, 5, 9, 2, 6], queries: [[1, 4], [0, 7], [3, 5]] },
  inputs: [
    { key: "arr", label: "Array", kind: "intArray" },
    { key: "queries", label: "Queries (l,r pairs)", kind: "intPairs", help: "inclusive · `0,3; 1,4`" },
  ],
  validate: ({ arr, queries }) => {
    const w: string[] = [];
    for (const [l, r] of queries) {
      if (l < 0 || r >= arr.length || l > r) {
        w.push(`Query [${l}, ${r}] is out of bounds for length ${arr.length}.`);
      }
    }
    return w;
  },
  build,
};
