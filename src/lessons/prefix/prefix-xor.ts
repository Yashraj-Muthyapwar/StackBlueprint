import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; queries: [number, number][] };

const code = `def build_prefix_xor(arr):
    pre = [0] * (len(arr) + 1)
    for i, v in enumerate(arr):
        pre[i + 1] = pre[i] ^ v
    return pre

def range_xor(pre, l, r):
    return pre[r + 1] ^ pre[l]`;

function build({ arr, queries }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  const pre = new Array<number>(n + 1).fill(0);
  steps.push({
    line: 1,
    array: [...arr],
    secondary: { label: "prefix xor", array: [...pre] },
    pointers: [],
    narration: "Allocate prefix XOR array.",
  });
  for (let i = 0; i < n; i++) {
    pre[i + 1] = pre[i] ^ arr[i];
    steps.push({
      line: 3,
      array: [...arr],
      pointers: [{ name: "i", index: i, color: "mint" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: {
        label: "prefix xor",
        array: [...pre],
        highlight: { kind: "match", indices: [i + 1] },
      },
      status: `pre[${i + 1}] = pre[${i}] ^ ${arr[i]} = ${pre[i + 1]}`,
      narration: `XOR accumulates: pre[${i + 1}] = ${pre[i + 1]}.`,
    });
  }
  for (const [l, r] of queries) {
    if (l < 0 || r >= n || l > r) continue;
    const ans = pre[r + 1] ^ pre[l];
    steps.push({
      line: 6,
      array: [...arr],
      pointers: [
        { name: "l", index: l, color: "mint" },
        { name: "r", index: r, color: "amber" },
      ],
      partitions: [{ from: l, to: r, tone: "mid", label: `xor=${ans}` }],
      secondary: {
        label: "prefix xor",
        array: [...pre],
        highlight: { kind: "compare", indices: [l, r + 1] },
      },
      status: `pre[${r + 1}] ^ pre[${l}] = ${ans}`,
      narration: `Range XOR arr[${l}..${r}] = ${ans}.`,
    });
  }
  return steps;
}

export const prefixXor: LessonBuilder<Inputs> = {
  slug: "prefix-xor",
  title: "Prefix XOR",
  subtitle: "XOR is its own inverse — range XOR becomes pre[r+1] ^ pre[l].",
  variant: "prefix-xor",
  view: "array",
  code,
  defaultInputs: { arr: [4, 2, 1, 3, 5, 7], queries: [[1, 3], [0, 5]] },
  inputs: [
    { key: "arr", label: "Array (non-negative ints)", kind: "intArray" },
    { key: "queries", label: "Queries (l,r pairs)", kind: "intPairs" },
  ],
  zvalidate: ({ arr, queries }) => {
    const w: string[] = [];
    if (arr.some((v) => v < 0)) w.push("XOR is defined for non-negative ints in this demo.");
    for (const [l, r] of queries) if (l < 0 || r >= arr.length || l > r) w.push(`Query [${l},${r}] out of bounds.`);
    return w;
  },
  build,
};
