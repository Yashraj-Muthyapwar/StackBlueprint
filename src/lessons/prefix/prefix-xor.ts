import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; queries: [number, number][] };

const code = `def build_prefix_xor(arr):
    prefix_xor = [0] * (len(arr) + 1)
    for i, v in enumerate(arr):
        prefix_xor[i + 1] = prefix_xor[i] ^ v
    return prefix_xor

def range_xor(prefix_xor, left, right):
    return prefix_xor[right + 1] ^ prefix_xor[left]`;

function build({ arr, queries }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  const prefix_xor = new Array<number>(n + 1).fill(0);
  steps.push({
    line: 1,
    array: [...arr],
    secondary: { label: "prefix xor", array: [...prefix_xor] },
    pointers: [],
    narration: "Allocate prefix XOR array.",
  });
  for (let i = 0; i < n; i++) {
    prefix_xor[i + 1] = prefix_xor[i] ^ arr[i];
    steps.push({
      line: 3,
      array: [...arr],
      pointers: [{ name: "i", index: i, color: "mint" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: {
        label: "prefix xor",
        array: [...prefix_xor],
        highlight: { kind: "match", indices: [i + 1] },
      },
      status: `prefix_xor[${i + 1}] = prefix_xor[${i}] ^ ${arr[i]} = ${prefix_xor[i + 1]}`,
      narration: `XOR accumulates: prefix_xor[${i + 1}] = ${prefix_xor[i + 1]}.`,
    });
  }
  for (const [left, right] of queries) {
    if (left < 0 || right >= n || left > right) continue;
    const ans = prefix_xor[right + 1] ^ prefix_xor[left];
    steps.push({
      line: 6,
      array: [...arr],
      pointers: [
        { name: "left", index: left, color: "mint" },
        { name: "right", index: right, color: "amber" },
      ],
      partitions: [{ from: left, to: right, tone: "mid", label: `xor=${ans}` }],
      secondary: {
        label: "prefix xor",
        array: [...prefix_xor],
        highlight: { kind: "compare", indices: [left, right + 1] },
      },
      status: `prefix_xor[${right + 1}] ^ prefix_xor[${left}] = ${ans}`,
      narration: `Range XOR arr[${left}..${right}] = ${ans}.`,
    });
  }
  return steps;
}

export const prefixXor: LessonBuilder<Inputs> = {
  slug: "prefix-xor",
  title: "Prefix XOR",
  subtitle: "XOR is its own inverse — range XOR becomes pre[r+1] ^ pre[l].",
  problem:
    "Given an array, answer range XOR queries [left, right] in O(1) using a prefix XOR array.",
  spotIt: [
    "Range XOR queries, or 'count subarrays with XOR equal to K'.",
    "Problems involving toggling bits, parity, or 'find the odd one out' over ranges.",
    "Need O(1) per query and XOR is the aggregation.",
  ],
  avoidWhen: [
    "Aggregation is sum / product / min — different prefix structure.",
    "Elements can change between queries — use a Fenwick tree over XOR.",
    "Problem is about bitwise AND / OR over ranges (those aren't invertible).",
  ],
  variant: "prefix-xor",
  view: "array",
  code,
  defaultInputs: {
    arr: [4, 2, 1, 3, 5, 7],
    queries: [
      [1, 3],
      [0, 5],
    ],
  },
  inputs: [
    { key: "arr", label: "Array (non-negative ints)", kind: "intArray" },
    { key: "queries", label: "Queries (left,right pairs)", kind: "intPairs" },
  ],
  validate: ({ arr, queries }) => {
    const w: string[] = [];
    if (arr.some((v) => v < 0)) w.push("XOR is defined for non-negative ints in this demo.");
    for (const [left, right] of queries)
      if (left < 0 || right >= arr.length || left > right)
        w.push(`Query [${left},${right}] out of bounds.`);
    return w;
  },
  build,
};
