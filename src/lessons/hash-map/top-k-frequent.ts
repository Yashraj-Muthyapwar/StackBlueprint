import type { LessonBuilder, Step } from "../types";

type Inputs = { nums: number[]; k: number };

const code = `def top_k(nums, k):
    freq = {}
    for num in nums:
        freq[num] = freq.get(num, 0) + 1
    # bucket by count
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, count in freq.items():
        buckets[count].append(num)
    out = []
    for count in range(len(buckets) - 1, 0, -1):
        for num in buckets[count]:
            out.append(num)
            if len(out) == k: return out`;

function fmtMap(m: Map<number, number>) {
  return [...m.entries()].map(([k, v]) => `${k}:${v}`);
}

function build({ nums, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const arr = nums as (number | string)[];
  const freq = new Map<number, number>();
  steps.push({
    line: 2,
    array: arr,
    pointers: [],
    secondary: { label: "freq {}", array: [] },
    narration: `Count occurrences, then bucket by frequency. k=${k}.`,
  });
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    freq.set(num, (freq.get(num) ?? 0) + 1);
    steps.push({
      line: 3,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: { label: `freq { ${freq.size} keys }`, array: fmtMap(freq) },
      narration: `Count ${num} → ${freq.get(num)}.`,
    });
  }
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, count] of freq) buckets[count].push(num);
  steps.push({
    line: 7,
    array: arr,
    pointers: [],
    secondary: {
      label: "buckets[count] (count → values)",
      array: buckets
        .map((b, c) => (b.length ? `${c}:[${b.join(",")}]` : null))
        .filter(Boolean) as string[],
    },
    narration: "Each bucket holds the values that appeared that many times.",
  });
  const out: number[] = [];
  for (let count = buckets.length - 1; count > 0 && out.length < k; count--) {
    for (const num of buckets[count]) {
      out.push(num);
      const matchIdx: number[] = [];
      nums.forEach((v, i) => {
        if (out.includes(v)) matchIdx.push(i);
      });
      steps.push({
        line: 12,
        array: arr,
        pointers: [],
        highlight: { kind: "match", indices: matchIdx },
        secondary: { label: `top-k so far`, array: out.map(String) },
        status: `picked ${num} (count ${count})`,
        narration: `Drain bucket ${count}: take ${num}. ${out.length}/${k} chosen.`,
      });
      if (out.length === k) break;
    }
  }
  steps.push({
    line: 13,
    array: arr,
    pointers: [],
    secondary: { label: "return", array: out.map(String) },
    status: `top-${k} = [${out.join(",")}]`,
    narration: `Return the ${k} most frequent values.`,
  });
  return steps;
}

export const topKFrequent: LessonBuilder<Inputs> = {
  slug: "top-k-frequent",
  title: "Hash Map — Top K Frequent Elements",
  subtitle: "Count with a map, then bucket-sort by frequency for O(n) selection.",
  problem: "Given nums and k, return the k most frequent elements.",
  spotIt: [
    "Prompt says 'top k', 'k most frequent', 'k heaviest'.",
    "You already need a frequency map — selection is the second half.",
    "k is small relative to n, and you want better than O(n log n).",
  ],
  avoidWhen: [
    "k ≈ n — just sort by count.",
    "Stream of unbounded data — use a min-heap of size k instead of buckets.",
    "Ties must be broken by a domain rule heap/sort gives you for free.",
  ],
  variant: "hash-topk",
  view: "array",
  code,
  defaultInputs: { nums: [1, 1, 1, 2, 2, 3, 3, 3, 3], k: 2 },
  inputs: [
    { key: "nums", label: "nums", kind: "intArray" },
    { key: "k", label: "k", kind: "int", min: 1, max: 8 },
  ],
  validate: ({ nums, k }) => {
    const w: string[] = [];
    if (nums.length > 14) w.push("Trim nums to ≤ 14.");
    if (k > nums.length) w.push("k cannot exceed nums.length.");
    return w;
  },
  build,
};
