import type { LessonBuilder, Step } from "../types";
import { isSortedAsc } from "../util";

type Mode = "two-sum" | "trapping-rain-water";
type Inputs = { mode: Mode; arr: number[]; target: number };

const codeTwoSum = `def two_sum(arr, target):
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

const codeTrappingRainWater = `def trap(heights):
    if not heights:
        return 0
    left, right = 0, len(heights) - 1
    left_max, right_max = heights[left], heights[right]
    water = 0
    while left < right:
        if left_max < right_max:
            left += 1
            left_max = max(left_max, heights[left])
            water += left_max - heights[left]
        else:
            right -= 1
            right_max = max(right_max, heights[right])
            water += right_max - heights[right]
    return water`;

const DEFAULTS: Record<Mode, number[]> = {
  "two-sum": [1, 3, 4, 5, 7, 10, 11],
  "trapping-rain-water": [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
};

function buildTwoSum({ arr, target }: Inputs): Step[] {
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

function buildTrappingRainWater({ arr }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  const waterLevels = new Array(n).fill(0);
  
  const push = (s: Omit<Step, "array"|"waterLevels"> & { array?: number[], waterLevels?: number[] }) =>
    steps.push({ ...s, array: s.array ?? [...arr], waterLevels: s.waterLevels ?? [...waterLevels] });

  const ptrs = (l: number, r: number) => [
    { name: "left", index: l, color: "mint" as const, placement: "below" as const },
    { name: "right", index: r, color: "amber" as const, placement: "below" as const },
  ];

  if (n < 2) {
    push({ line: 2, narration: "Array too small, return 0." });
    return steps;
  }

  let left = 0, right = n - 1;
  let left_max = arr[left];
  let right_max = arr[right];
  let water = 0;

  const st = () => `water = ${water} | L_max = ${left_max} | R_max = ${right_max}`;

  push({ line: 4, pointers: ptrs(left, right), narration: "Start left and right pointers at the boundaries." });
  push({ line: 5, pointers: ptrs(left, right), status: st(), narration: "Initialize left_max and right_max with the boundary heights." });
  
  let safety = 0;
  while (left < right && safety++ < 200) {
    push({ line: 7, pointers: ptrs(left, right), status: st(), narration: `Guard: left (${left}) < right (${right}).` });
    push({ line: 8, pointers: ptrs(left, right), status: st(), highlight: { kind: "compare", indices: [left, right] }, narration: `Compare max boundaries: ${left_max} < ${right_max}?` });

    if (left_max < right_max) {
      push({ line: 8, pointers: ptrs(left, right), status: st(), narration: `left_max (${left_max}) < right_max (${right_max}). We know the right side can safely trap water.` });
      left += 1;
      push({ line: 9, pointers: ptrs(left, right), status: st(), narration: `Advance left to ${left}.` });
      
      const prev_left_max = left_max;
      left_max = Math.max(left_max, arr[left]);
      push({ line: 10, pointers: ptrs(left, right), status: st(), narration: `Update left_max = max(${prev_left_max}, ${arr[left]}) → ${left_max}.` });
      
      const trapped = left_max - arr[left];
      waterLevels[left] = trapped;
      water += trapped;
      
      push({ line: 11, pointers: ptrs(left, right), status: st(), narration: `Water added at left: ${left_max} - ${arr[left]} = ${trapped}.` });
    } else {
      push({ line: 12, pointers: ptrs(left, right), status: st(), narration: `right_max (${right_max}) <= left_max (${left_max}). We know the left side can safely trap water.` });
      right -= 1;
      push({ line: 13, pointers: ptrs(left, right), status: st(), narration: `Advance right to ${right}.` });
      
      const prev_right_max = right_max;
      right_max = Math.max(right_max, arr[right]);
      push({ line: 14, pointers: ptrs(left, right), status: st(), narration: `Update right_max = max(${prev_right_max}, ${arr[right]}) → ${right_max}.` });
      
      const trapped = right_max - arr[right];
      waterLevels[right] = trapped;
      water += trapped;
      
      push({ line: 15, pointers: ptrs(left, right), status: st(), narration: `Water added at right: ${right_max} - ${arr[right]} = ${trapped}.` });
    }
  }

  push({ line: 16, pointers: ptrs(left, right), status: st(), narration: `Pointers met. Total water trapped: ${water}.` });
  
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
    "You need to count all pairs (not just find one) — a hash map is usually better.",
    "Data is a stream / linked list without random access — use fast-slow or a hash set instead.",
  ],
  variant: "opposite-ends",
  view: (inputs) => inputs.mode === "trapping-rain-water" ? "elevation-map" : "array",
  code: codeTwoSum,
  codeFor: (inputs) => (inputs.mode === "trapping-rain-water" ? codeTrappingRainWater : codeTwoSum),
  defaultInputs: { mode: "two-sum", arr: [1, 3, 4, 5, 7, 10, 11], target: 9 },
  inputs: [
    {
      key: "mode",
      label: "Problem",
      kind: "select",
      options: [
        { value: "two-sum", label: "Two Sum (Sorted)" },
        { value: "trapping-rain-water", label: "Trapping Rain Water" },
      ],
    },
    { key: "arr", label: "Array", kind: "intArray", help: "comma-separated" },
    { key: "target", label: "Target sum", kind: "int", hidden: (v: any) => v.mode === "trapping-rain-water" },
  ],
  validate: (inputs) => {
    const { mode, arr, target } = inputs;
    const w: string[] = [];
    if (mode === "two-sum") {
      if (!isSortedAsc(arr)) w.push("Two-Sum with opposite-ends pointers requires a sorted array. With an unsorted array the algorithm can miss valid pairs or report wrong indices.");
      if (arr.length < 2) w.push("Array has fewer than 2 elements.");
      if (target === undefined || !Number.isInteger(target)) w.push("Target should be an integer.");
    }
    return w;
  },
  onInputChange: (key, value, nextRaw) => {
    if (key === "mode") {
      const mode = value as Mode;
      return { arr: DEFAULTS[mode].join(", ") };
    }
    return null;
  },
  build: (inputs) => {
    return inputs.mode === "trapping-rain-water" ? buildTrappingRainWater(inputs) : buildTwoSum(inputs);
  },
};
