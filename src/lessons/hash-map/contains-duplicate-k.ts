import type { LessonBuilder, Step } from "../types";

type Inputs = { nums: number[]; k: number };

const code = `def contains_nearby_dup(nums, k):
    last_seen = {}                  # value -> most recent index
    for i, num in enumerate(nums):
        if num in last_seen and i - last_seen[num] <= k:
            return True
        last_seen[num] = i
    return False`;

function fmt(m: Map<number, number>) {
  return [...m.entries()].map(([k, v]) => `${k}@${v}`);
}

function build({ nums, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const arr = nums as (number | string)[];
  const lastSeen = new Map<number, number>();
  steps.push({
    line: 2,
    array: arr,
    pointers: [],
    secondary: { label: "last_seen { value: index }", array: [] },
    narration: `Find a duplicate within k=${k} positions.`,
  });
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    if (lastSeen.has(num)) {
      const j = lastSeen.get(num) as number;
      const gap = i - j;
      if (gap <= k) {
        steps.push({
          line: 4,
          array: arr,
          pointers: [
            { name: "j", index: j, color: "mint" },
            { name: "i", index: i, color: "amber" },
          ],
          highlight: { kind: "match", indices: [j, i] },
          secondary: { label: `last_seen { ${lastSeen.size} }`, array: fmt(lastSeen) },
          status: `gap=${gap} ≤ ${k} → True`,
          narration: `Saw ${num} at ${j}; now at ${i}. Gap ${gap} ≤ k. Return True.`,
        });
        return steps;
      }
      steps.push({
        line: 4,
        array: arr,
        pointers: [
          { name: "j", index: j, color: "rose" },
          { name: "i", index: i, color: "amber" },
        ],
        highlight: { kind: "swap", indices: [j, i] },
        secondary: { label: `last_seen { ${lastSeen.size} }`, array: fmt(lastSeen) },
        status: `gap=${gap} > ${k}`,
        narration: `Same value but gap ${gap} > k=${k}. Overwrite index.`,
      });
    }
    lastSeen.set(num, i);
    steps.push({
      line: 6,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      secondary: { label: `last_seen { ${lastSeen.size} }`, array: fmt(lastSeen) },
      narration: `last_seen[${num}] = ${i}.`,
    });
  }
  steps.push({
    line: 7,
    array: arr,
    pointers: [],
    secondary: { label: `last_seen { ${lastSeen.size} }`, array: fmt(lastSeen) },
    status: "False",
    narration: "No near-duplicate found.",
  });
  return steps;
}

export const containsDuplicateK: LessonBuilder<Inputs> = {
  slug: "contains-duplicate-k",
  title: "Index Map — Duplicate Within Distance k",
  subtitle: "Store the most recent index of each value; check the gap when you see it again.",
  problem: "Return True iff nums contains two equal values whose indices differ by at most k.",
  spotIt: [
    "Constraint relates the *positions* of equal values, not just their existence.",
    "Plain set tells you a duplicate exists but loses where it lived.",
    "k is small relative to n and you want a single pass.",
  ],
  avoidWhen: [
    "You need the closest pair distance for every value — sort indices instead.",
    "The window check involves more than equality (e.g. |nums[i]-nums[j]| ≤ t) — use a sorted window / bucket.",
    "Stream has unbounded value domain and bounded k — a sliding window set is leaner.",
  ],
  variant: "hash-index",
  view: "array",
  code,
  defaultInputs: { nums: [1, 2, 3, 1, 2, 3], k: 2 },
  inputs: [
    { key: "nums", label: "nums", kind: "intArray" },
    { key: "k", label: "k", kind: "int", min: 1, max: 10 },
  ],
  validate: ({ nums }) => (nums.length > 16 ? ["Trim to ≤ 16 values."] : []),
  build,
};
