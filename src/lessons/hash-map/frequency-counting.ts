import type { LessonBuilder, Step } from "../types";

type Inputs = { nums: number[] };

const code = `def frequency(nums):
    freq = {}
    for num in nums:
        freq[num] = freq.get(num, 0) + 1
    return freq`;

function fmt(m: Map<number, number>): string[] {
  return [...m.entries()].map(([k, v]) => `${k}:${v}`);
}

function build({ nums }: Inputs): Step[] {
  const steps: Step[] = [];
  const arr = nums as (number | string)[];
  const freq = new Map<number, number>();
  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    secondary: { label: "freq {}", array: [] },
    narration: "Initialize an empty frequency map.",
  });
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const prev = freq.get(num) ?? 0;
    freq.set(num, prev + 1);
    steps.push({
      line: 3,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: { label: `freq { ${freq.size} keys }`, array: fmt(freq) },
      status: `freq[${num}] = ${prev + 1}`,
      narration: `nums[${i}]=${num}. Bump count to ${prev + 1}.`,
    });
  }
  let bestK = nums[0];
  let bestV = -1;
  for (const [k, v] of freq) if (v > bestV) { bestK = k; bestV = v; }
  const matchIdx: number[] = [];
  nums.forEach((num, i) => { if (num === bestK) matchIdx.push(i); });
  steps.push({
    line: 5,
    array: arr,
    pointers: [],
    secondary: { label: `freq { ${freq.size} keys }`, array: fmt(freq) },
    highlight: { kind: "match", indices: matchIdx },
    status: `mode=${bestK} (×${bestV})`,
    narration: `Most frequent value is ${bestK} with ${bestV} occurrences.`,
  });
  return steps;
}

export const frequencyCounting: LessonBuilder<Inputs> = {
  slug: "frequency-counting",
  title: "Hash Map — Frequency Counting & Tracking",
  subtitle: "One pass over the array, one map keyed by value — counts in O(n).",
  problem: "Given an array nums, return a map from value → number of occurrences (and identify the mode).",
  spotIt: [
    "Problem asks 'how many times does X appear' or 'most common element'.",
    "Sort-then-scan is O(n log n) but the interviewer wants O(n).",
    "Downstream logic needs counts of distinct values (majority, mode, anagram check).",
  ],
  avoidWhen: [
    "Values are small bounded integers — a fixed-size array is faster and cache-friendly.",
    "You only need to know if any duplicate exists — a set is enough.",
    "Order of insertion matters and you need O(1) min/max by count — use a heap instead.",
  ],
  variant: "hash-frequency",
  view: "array",
  code,
  defaultInputs: { nums: [1, 3, 2, 3, 1, 3, 2, 4] },
  inputs: [{ key: "nums", label: "nums", kind: "intArray" }],
  validate: ({ nums }) => (nums.length > 16 ? ["Trim to ≤ 16 values."] : []),
  build,
};
