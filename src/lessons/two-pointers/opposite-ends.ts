import type { LessonBuilder, Step } from "../types";
import { isSortedAsc } from "../util";

type Inputs = { arr: number[]; target: number };

const code = `def two_sum(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        total = arr[left] + arr[right]
        if total == target:
            return (left, right)
        if total < target:
            left += 1
        else:
            right -= 1
    return None`;

function build({ arr, target }: Inputs): Step[] {
  const steps: Step[] = [];
  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];
  const push = (s: Omit<Step, "array"> & { array?: number[] }) =>
    steps.push({ ...s, array: s.array ?? [...arr] });

  if (arr.length < 2) {
    push({ line: 1, pointers: [], narration: "Need at least two elements." });
    return steps;
  }

  push({ line: 1, pointers: [], narration: `Find two indices whose values sum to ${target}.` });

  let left = 0,
    right = arr.length - 1;
  push({ line: 2, pointers: ptrs(left, right), narration: "Place left at the start and right at the end." });

  let safety = 0;
  while (left < right && safety++ < 200) {
    push({ line: 3, pointers: ptrs(left, right), narration: `Guard: left (${left}) < right (${right}).` });
    const total = arr[left] + arr[right];
    push({
      line: 4,
      pointers: ptrs(left, right),
      highlight: { kind: "compare", indices: [left, right] },
      status: `${arr[left]} + ${arr[right]} = ${total}`,
      narration: `Sum at pointers: ${arr[left]} + ${arr[right]} = ${total}.`,
    });
    if (total === target) {
      push({
        line: 5,
        pointers: ptrs(left, right),
        highlight: { kind: "match", indices: [left, right] },
        status: `return (${left}, ${right})`,
        narration: `${total} equals target — return (${left}, ${right}).`,
      });
      return steps;
    }
    if (total < target) {
      push({ line: 7, pointers: ptrs(left, right), narration: `${total} < ${target} — need larger sum, left += 1.` });
      left += 1;
      push({ line: 8, pointers: ptrs(left, right), narration: `left → ${left}.` });
    } else {
      push({ line: 9, pointers: ptrs(left, right), narration: `${total} > ${target} — need smaller sum, right -= 1.` });
      right -= 1;
      push({ line: 10, pointers: ptrs(left, right), narration: `right → ${right}.` });
    }
  }
  push({ line: 11, pointers: ptrs(left, right), narration: "Pointers crossed — no pair found, return None." });
  return steps;
}

export const oppositeEnds: LessonBuilder<Inputs> = {
  slug: "opposite-ends",
  title: "Two Pointers — Opposite Ends",
  subtitle: "Two indices start at opposite ends of a sorted array and walk toward each other based on a comparison.",
  problem: "Given a sorted array of integers and a target T, return indices (i, j) such that arr[i] + arr[j] == T, or None if no such pair exists.",
  spotIt: [
    "Input is a sorted array (or can be sorted) and you're asked about a pair / triplet / sum / closest.",
    "Question hints at O(n) after sorting, or 'do it in O(1) extra space'.",
    "Phrases like 'find two numbers that sum to target', 'container with most water', 'reverse / palindrome check'.",
  ],
  avoidWhen: [
    "Array is unsorted and sorting would destroy required index order.",
    "You need to count all pairs (not just find one) \u2014 a hash map is usually better.",
    "Data is a stream / linked list without random access \u2014 use fast-slow or a hash set instead.",
  ],
  variant: "opposite-ends",
  view: "array",
  code,
  defaultInputs: { arr: [1, 3, 4, 5, 7, 10, 11], target: 9 },
  inputs: [
    { key: "arr", label: "Array (sorted)", kind: "intArray", help: "comma-separated" },
    { key: "target", label: "Target sum", kind: "int" },
  ],
  validate: ({ arr, target }) => {
    const w: string[] = [];
    if (!isSortedAsc(arr)) w.push("Two-Sum with opposite-ends pointers requires a sorted array. With an unsorted array the algorithm can miss valid pairs or report wrong indices.");
    if (arr.length < 2) w.push("Array has fewer than 2 elements.");
    if (!Number.isInteger(target)) w.push("Target should be an integer.");
    return w;
  },
  build,
};
