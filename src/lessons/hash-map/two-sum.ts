import type { LessonBuilder, Step } from "../types";

type Inputs = { nums: number[]; target: number };

const code = `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []`;

function fmt(m: Map<number, number>) {
  return [...m.entries()].map(([k, v]) => `${k}@${v}`);
}

function build({ nums, target }: Inputs): Step[] {
  const steps: Step[] = [];
  const arr = nums as (number | string)[];
  const seen = new Map<number, number>();
  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    secondary: { label: "seen { value: index }", array: [] },
    narration: `Find two indices whose values sum to ${target}.`,
  });
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    const need = target - x;
    steps.push({
      line: 4,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: { label: `seen { ${seen.size} }`, array: fmt(seen) },
      status: `need = ${target} - ${x} = ${need}`,
      narration: `At i=${i}, x=${x}. Look up complement ${need}.`,
    });
    if (seen.has(need)) {
      const j = seen.get(need) as number;
      steps.push({
        line: 5,
        array: arr,
        pointers: [
          { name: "j", index: j, color: "mint" },
          { name: "i", index: i, color: "amber" },
        ],
        highlight: { kind: "match", indices: [j, i] },
        secondary: { label: `seen { ${seen.size} }`, array: fmt(seen) },
        status: `found [${j}, ${i}]`,
        narration: `${nums[j]} + ${x} = ${target}. Return [${j}, ${i}].`,
      });
      return steps;
    }
    seen.set(x, i);
    steps.push({
      line: 7,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      secondary: { label: `seen { ${seen.size} }`, array: fmt(seen) },
      narration: `Not found yet — record seen[${x}] = ${i}.`,
    });
  }
  steps.push({
    line: 8,
    array: arr,
    pointers: [],
    secondary: { label: `seen { ${seen.size} }`, array: fmt(seen) },
    status: "no pair",
    narration: "Scanned to the end without a match.",
  });
  return steps;
}

export const twoSum: LessonBuilder<Inputs> = {
  slug: "two-sum",
  title: "Hash Map — Two Sum / Complement Lookup",
  subtitle: "Trade O(n²) brute force for one pass: store seen values, look up the complement.",
  problem: "Given nums and target, return indices i<j with nums[i] + nums[j] == target.",
  spotIt: [
    "Problem reduces to 'does the complement exist?' for some predicate.",
    "Brute force compares every pair — O(n²) — and the array is unsorted.",
    "Sorting would destroy the original indices that the answer needs.",
  ],
  avoidWhen: [
    "Array is already sorted — two pointers solves it in O(n) with no extra memory.",
    "You need every pair (not just one) — generate them explicitly.",
    "Values are floats with precision risk — hashing is brittle.",
  ],
  variant: "hash-lookup",
  view: "array",
  code,
  defaultInputs: { nums: [2, 7, 11, 15, 3, 6], target: 9 },
  inputs: [
    { key: "nums", label: "nums", kind: "intArray" },
    { key: "target", label: "target", kind: "int" },
  ],
  validate: ({ nums }) => (nums.length > 16 ? ["Trim to ≤ 16 values."] : []),
  build,
};
