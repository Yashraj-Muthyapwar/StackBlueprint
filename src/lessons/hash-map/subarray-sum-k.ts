import type { LessonBuilder, Step } from "../types";

type Inputs = { nums: number[]; k: number };

const code = `def subarray_sum(nums, k):
    seen = {0: 1}   # prefix_sum -> count
    prefix_sum = 0
    count = 0
    for num in nums:
        prefix_sum += num
        complement = prefix_sum - k
        if complement in seen:
            count += seen[complement]
        seen[prefix_sum] = seen.get(prefix_sum, 0) + 1
    return count`;

function fmt(m: Map<number, number>) {
  return [...m.entries()].map(([k, v]) => `${k}:${v}`);
}

function build({ nums, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const arr = nums as (number | string)[];
  const seen = new Map<number, number>([[0, 1]]);
  let prefixSum = 0;
  let count = 0;
  steps.push({
    line: 2,
    array: arr,
    pointers: [],
    secondary: { label: "seen { prefix:count }", array: fmt(seen) },
    narration: `seed seen[0]=1 so a prefix equal to k counts. target k=${k}.`,
  });
  const prefixes: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    prefixSum += nums[i];
    prefixes.push(prefixSum);
    steps.push({
      line: 6,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: { label: "prefix sums", array: prefixes.map(String) },
      status: `prefix_sum=${prefixSum}`,
      narration: `Add nums[${i}]=${nums[i]} → prefix_sum=${prefixSum}.`,
    });
    const complement = prefixSum - k;
    if (seen.has(complement)) {
      const add = seen.get(complement) as number;
      count += add;
      steps.push({
        line: 8,
        array: arr,
        pointers: [{ name: "i", index: i, color: "amber" }],
        highlight: { kind: "match", indices: [i] },
        secondary: { label: `seen { ${seen.size} }`, array: fmt(seen) },
        status: `+${add} → count=${count}`,
        narration: `prefix_sum-k = ${complement} appears ${add}× → ${add} subarrays ending at i sum to ${k}.`,
      });
    } else {
      steps.push({
        line: 8,
        array: arr,
        pointers: [{ name: "i", index: i, color: "amber" }],
        secondary: { label: `seen { ${seen.size} }`, array: fmt(seen) },
        narration: `prefix_sum-k=${complement} not seen — no subarray ends here.`,
      });
    }
    seen.set(prefixSum, (seen.get(prefixSum) ?? 0) + 1);
    steps.push({
      line: 9,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      secondary: { label: `seen { ${seen.size} }`, array: fmt(seen) },
      narration: `Record seen[${prefixSum}]=${seen.get(prefixSum)}.`,
    });
  }
  steps.push({
    line: 10,
    array: arr,
    pointers: [],
    secondary: { label: `seen { ${seen.size} }`, array: fmt(seen) },
    status: `return ${count}`,
    narration: `Total subarrays summing to ${k}: ${count}.`,
  });
  return steps;
}

export const subarraySumK: LessonBuilder<Inputs> = {
  slug: "subarray-sum-k",
  title: "Hash Map — Continuous Subarray Sum = K",
  subtitle: "Prefix sums + a count map turn a range-sum query into an O(1) lookup.",
  problem: "Given nums and k, return the number of contiguous subarrays whose sum equals k.",
  spotIt: [
    "Question counts subarrays / ranges with a sum (or sum mod m) equal to a target.",
    "Values can be negative, so a sliding window does not work.",
    "Brute force is O(n²) and you need O(n).",
  ],
  avoidWhen: [
    "All values are positive and you want the longest/shortest window — sliding window is simpler.",
    "You need the actual subarrays (not just the count) — store full prefix-index lists.",
    "Sums can overflow your hash key type — guard with big-ints or modular keys.",
  ],
  variant: "hash-prefix",
  view: "array",
  code,
  defaultInputs: { nums: [1, 2, 3, -2, 5, -3, 3], k: 3 },
  inputs: [
    { key: "nums", label: "nums", kind: "intArray" },
    { key: "k", label: "k", kind: "int" },
  ],
  validate: ({ nums }) => (nums.length > 14 ? ["Trim to ≤ 14 values."] : []),
  build,
};
