import type { LessonBuilder, Step, PracticeProblem } from "../types";
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

const practiceLadder: PracticeProblem[] = [
  {
    name: "Two Sum II - Input Array Is Sorted",
    difficulty: "easy",
    hint: "The canonical elimination proof. Before each move, say WHY that end is dead. Out loud.",
    link: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
  },
  {
    name: "Squares of a Sorted Array",
    difficulty: "easy",
    hint: "Twist: the biggest square is at one of the two ends. Fill the result array from the back.",
    link: "https://leetcode.com/problems/squares-of-a-sorted-array/",
  },
  {
    name: "Boats to Save People",
    difficulty: "medium",
    hint: "Greedy pairing: heaviest person plus lightest person. If they fit, both board. If not, the heaviest boards alone. Find the proof for why pairing heaviest with lightest is safe.",
    link: "https://leetcode.com/problems/boats-to-save-people/",
  },
  {
    name: "Container With Most Water",
    difficulty: "medium",
    hint: "The proof is about the shorter wall. Write the proof in one sentence before writing any code.",
    link: "https://leetcode.com/problems/container-with-most-water/",
  },
  {
    name: "3Sum",
    difficulty: "medium",
    hint: "Fix one element with an outer loop, then run this exact pattern on the rest. Big lesson: patterns compose.",
    link: "https://leetcode.com/problems/3sum/",
  },
  {
    name: "3Sum Closest",
    difficulty: "medium",
    hint: "Same skeleton, but instead of returning on exact match, track the best distance seen so far.",
    link: "https://leetcode.com/problems/3sum-closest/",
  },
  {
    name: "Trapping Rain Water",
    difficulty: "hard",
    hint: "The proof: the smaller of the two boundary maxes decides the water level on its own side, no matter what is in the middle. Settle that side.",
    link: "https://leetcode.com/problems/trapping-rain-water/",
  },
  {
    name: "4Sum",
    difficulty: "hard",
    hint: "Two outer loops fixing two elements, then this pattern on what remains. If you solved 3Sum by understanding rather than memorizing, this is free.",
    link: "https://leetcode.com/problems/4sum/",
  },
];

/* -------------------------------------------------------------------------- */
/* Two Sum (sorted)                                                           */
/* -------------------------------------------------------------------------- */

function buildTwoSum({ arr, target }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  let left = 0;
  let right = n - 1;

  const ptrs = () => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];

  // Indices outside [left, right] have been proven unable to be part of any answer.
  const dead = () => arr.map((_, i) => i).filter((i) => i < left || i > right);

  const push = (s: Partial<Step> & { line: number; narration: string }) =>
    steps.push({
      array: [...arr],
      pointers: ptrs(),
      dimmed: dead(),
      ...s,
    } as Step);

  if (n < 2) {
    push({ line: 1, pointers: [], dimmed: [], narration: "Need at least two elements." });
    return steps;
  }

  push({
    line: 2,
    narration: `Find two values that sum to ${target}.`,
    proof:
      "Every index is still a candidate, so we start with the widest window: the smallest value on the left, the largest on the right.",
  });

  while (left < right) {
    const a = arr[left];
    const b = arr[right];
    const total = a + b;
    const compare = { kind: "compare" as const, indices: [left, right] };
    const link = { from: left, to: right, label: `${total} vs ${target}` };
    const ask = (answer: "left" | "right") => ({
      question: `${a} + ${b} = ${total} and the target is ${target}. Which pointer should move?`,
      options: [
        { id: "left", label: "Move left pointer" },
        { id: "right", label: "Move right pointer" },
      ],
      answer,
      line: 4,
    });

    if (total === target) {
      push({
        line: 5,
        lineEnd: 6,
        highlight: { kind: "match" as const, indices: [left, right] },
        link,
        status: `return (${left}, ${right})`,
        narration: `${a} + ${b} = ${target}. Found it: return (${left}, ${right}).`,
      });
      return steps;
    }

    if (total < target) {
      push({
        line: 7,
        highlight: compare,
        link,
        status: `${a} + ${b} = ${total} < ${target}`,
        predict: ask("left"),
        narration: `${a} + ${b} = ${total}, which is less than ${target}. The sum is too small.`,
        proof: `${b} is the largest value still alive, and ${a} + ${b} already falls short. So ${a} can't reach ${target} with any partner. Index ${left} is dead.`,
      });
      left += 1;
      push({
        line: 8,
        status: `${Math.max(0, right - left + 1)} of ${n} candidates left`,
        narration: `left moves to ${left}. One index eliminated, ${Math.max(0, right - left + 1)} still alive.`,
      });
    } else {
      push({
        line: 9,
        highlight: compare,
        link,
        status: `${a} + ${b} = ${total} > ${target}`,
        predict: ask("right"),
        narration: `${a} + ${b} = ${total}, which is more than ${target}. The sum is too big.`,
        proof: `${a} is the smallest value still alive, and ${a} + ${b} already overshoots. So ${b} can't hit ${target} with any partner. Index ${right} is dead.`,
      });
      right -= 1;
      push({
        line: 10,
        status: `${Math.max(0, right - left + 1)} of ${n} candidates left`,
        narration: `right moves to ${right}. One index eliminated, ${Math.max(0, right - left + 1)} still alive.`,
      });
    }
  }

  push({
    line: 11,
    narration: "Pointers crossed, so no pair exists. Return None.",
    proof:
      "Every pointer move ruled out one index for good. With none left to try, no valid pair can exist.",
  });
  return steps;
}

/* -------------------------------------------------------------------------- */
/* Trapping Rain Water                                                        */
/* -------------------------------------------------------------------------- */

function buildTrappingRainWater({ arr }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  const waterLevels: number[] = new Array(n).fill(0);

  let left = 0;
  let right = n - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  const ptrs = () => [
    { name: "left", index: left, color: "mint" as const, placement: "below" as const },
    { name: "right", index: right, color: "amber" as const, placement: "below" as const },
  ];
  const st = () => `water = ${water} | L_max = ${leftMax} | R_max = ${rightMax}`;
  const askSide = (answer: "left" | "right") => ({
    question: `left_max is ${leftMax} and right_max is ${rightMax}. Which side is safe to settle next?`,
    options: [
      { id: "left", label: "Settle the left side" },
      { id: "right", label: "Settle the right side" },
    ],
    answer,
    line: 8,
  });

  const push = (s: Partial<Step> & { line: number; narration: string }) =>
    steps.push({
      array: [...arr],
      waterLevels: [...waterLevels],
      pointers: ptrs(),
      leftMax,
      rightMax,
      ...s,
    } as Step);

  if (n < 2) {
    push({ line: 2, pointers: [], narration: "Array too small to trap any water. Return 0." });
    return steps;
  }

  push({
    line: 4,
    narration: "Start with one pointer at each boundary.",
    proof:
      "Bars between the pointers (the dashed zone) are unsettled: we don't know their water level yet. Bars outside it are final.",
  });

  leftMax = arr[left];
  rightMax = arr[right];
  push({
    line: 5,
    status: st(),
    narration: "left_max and right_max start as the boundary heights.",
    proof: "A boundary bar has nothing on one side, so it can never hold water itself.",
  });

  while (left < right) {
    if (leftMax < rightMax) {
      push({
        line: 8,
        status: st(),
        predict: askSide("left"),
        highlight: { kind: "compare", indices: [left, right] },
        narration: `left_max (${leftMax}) < right_max (${rightMax}), so settle the left side.`,
        proof: `The right side already has a wall at least ${rightMax} tall, which is taller than left_max. So the water level at the next bar is capped by left_max, no matter what is in the middle.`,
      });

      left += 1;
      const prevMax = leftMax;
      leftMax = Math.max(leftMax, arr[left]);
      const trapped = leftMax - arr[left];
      waterLevels[left] = trapped;
      water += trapped;

      push({
        line: 9,
        lineEnd: 11,
        status: st(),
        highlight: { kind: "compare", indices: [left] },
        narration:
          leftMax > prevMax
            ? `left → ${left}. Height ${arr[left]} is a new tallest bar, so left_max becomes ${leftMax} and this bar traps 0.`
            : `left → ${left}. left_max stays ${leftMax}, so this bar traps ${leftMax} - ${arr[left]} = ${trapped}.`,
      });
    } else {
      push({
        line: 12,
        status: st(),
        predict: askSide("right"),
        highlight: { kind: "compare", indices: [left, right] },
        narration: `right_max (${rightMax}) ≤ left_max (${leftMax}), so settle the right side.`,
        proof: `The left side already has a wall at least ${leftMax} tall, which is at least right_max. So the water level at the next bar is capped by right_max, no matter what is in the middle.`,
      });

      right -= 1;
      const prevMax = rightMax;
      rightMax = Math.max(rightMax, arr[right]);
      const trapped = rightMax - arr[right];
      waterLevels[right] = trapped;
      water += trapped;

      push({
        line: 13,
        lineEnd: 15,
        status: st(),
        highlight: { kind: "compare", indices: [right] },
        narration:
          rightMax > prevMax
            ? `right → ${right}. Height ${arr[right]} is a new tallest bar, so right_max becomes ${rightMax} and this bar traps 0.`
            : `right → ${right}. right_max stays ${rightMax}, so this bar traps ${rightMax} - ${arr[right]} = ${trapped}.`,
      });
    }
  }

  push({
    line: 16,
    status: st(),
    narration: `Pointers met. Every bar is settled. Total water trapped: ${water}.`,
  });

  return steps;
}

/* -------------------------------------------------------------------------- */
/* Lesson definition                                                          */
/* -------------------------------------------------------------------------- */

function addComplexitySteps(steps: Step[], { mode, arr }: Inputs): Step[] {
  const final = steps[steps.length - 1];
  const n = arr.length;
  const isTwoSum = mode === "two-sum";
  const checks = steps.filter((step) =>
    isTwoSum
      ? step.line === 5 || step.line === 7 || step.line === 9
      : step.line === 8 || step.line === 12,
  ).length;
  const blocks = isTwoSum
    ? [
        { line: 2, label: "Initialize pointers", cost: "O(1) once" },
        { line: 3, label: "Loop condition", cost: "O(1) per test" },
        { line: 4, label: "Read and add two values", cost: "O(1) per pass" },
        { line: 5, end: 10, label: "Compare; return or move", cost: "O(1) per pass" },
        { line: 11, label: "Return if no match", cost: "O(1) once" },
      ]
    : [
        { line: 2, end: 6, label: "Check input; initialize", cost: "O(1) once" },
        { line: 7, label: "Loop condition", cost: "O(1) per test" },
        { line: 8, end: 15, label: "Select side; update water", cost: "O(1) per pass" },
        { line: 16, label: "Return total", cost: "O(1) once" },
      ];
  const base = { n, checks, blocks, metric: "time" as const };
  const explain = (
    title: string,
    activeBlock: number,
    formula: string,
    narration: string,
    proof: string,
  ): Step => {
    const block = blocks[activeBlock];
    return {
      ...final,
      predict: undefined,
      line: block?.line ?? 2,
      lineEnd: block?.end ?? block?.line ?? (isTwoSum ? 11 : 16),
      status: formula,
      complexity: { ...base, title, activeBlock, formula },
      narration,
      proof,
    };
  };
  const body = explain(
    "1. The work inside one pass: O(1)",
    2,
    "Read + add + compare + move → O(1) per pass",
    isTwoSum
      ? "One pass reads just two values, adds them, and compares the sum with the target. It then returns a pair or moves one pointer. Even with a much larger array, one pass still does these same few operations. That is O(1) work per pass."
      : "One pass compares the two maximum heights and processes one bar. It moves one pointer, updates one maximum, and adds water. A larger array does not add work inside that pass. That is O(1) work per pass.",
    isTwoSum
      ? "Reading by index, adding, comparing, and updating an index each take constant time in this analysis. The if and else paths are alternatives. We do not run a separate search inside either path."
      : "The if and else paths are alternatives: only one side is processed per pass. A fixed number of comparisons, assignments, and arithmetic operations gives O(1) work, even though the block contains several lines.",
  );
  body.line = isTwoSum ? 4 : 8;
  body.lineEnd = isTwoSum ? 10 : 15;
  const loop = explain(
    "2. Repeat that work: O(n) total time",
    1,
    "O(1) + (n − 1) × O(1) + O(1) → O(n)",
    n < 2
      ? `This input has ${n} values, so the loop ran 0 times. This particular run takes O(1) time. For larger inputs, the loop can repeat up to n - 1 times. Constant work repeated that many times gives O(n) worst-case time.`
      : `This run checked ${checks} pairs for ${n} values. The pointers start ${n - 1} positions apart. Each ${isTwoSum ? "failed check" : "pass"} moves one pointer inward by 1. At most ${n - 1} passes are possible here. In general, (n - 1) passes × O(1) work per pass gives O(n) worst-case time.`,
    "The comparison left < right takes O(1) each time it runs. The whole while loop costs O(n) because it repeats. Two pointers do not mean two full scans: their inward moves share the same n - 1 distance. Initialization and returning add only fixed work." +
      (isTwoSum
        ? " The input is already sorted. A first-check match takes O(1); sorting first adds a separate cost."
        : " Empty and single-bar inputs return in O(1)."),
  );
  loop.lineEnd = isTwoSum ? 10 : 15;
  const result = [...steps, body, loop];
  const memoryBlocks = isTwoSum
    ? [
        { line: 2, label: "left and right", cost: "2 values" },
        { line: 4, label: "total (reused each pass)", cost: "1 value" },
        { line: 6, label: "Returned pair", cost: "2 indices" },
      ]
    : [
        { line: 4, label: "left and right", cost: "2 values" },
        { line: 5, label: "left_max and right_max", cost: "2 values" },
        { line: 6, label: "water", cost: "1 value" },
      ];
  result.push({
    ...final,
    predict: undefined,
    line: isTwoSum ? 2 : 4,
    lineEnd: 6,
    status: "A fixed number of stored values → O(1) extra space",
    complexity: {
      n,
      checks,
      metric: "space",
      title: "3. Reuse the same variables: O(1) space",
      blocks: memoryBlocks,
      activeBlock: -1,
      formula: "Fixed storage, independent of n → O(1)",
    },
    narration: isTwoSum
      ? "The function keeps two indices and one current sum. When it calculates the next sum, it replaces total instead of saving another value. Whether the array has 10 or 10,000 values, these same three variables are enough. That is O(1) extra space."
      : "The function keeps two indices, two maximum heights, and one water total. Each pass updates these same five variables. It does not save a separate result for every bar. Whether there are 10 or 10,000 bars, the storage stays fixed: O(1) extra space.",
    proof:
      "O(1) means the amount of storage does not grow with n; it does not mean one variable. Repeating a calculation uses more time, but reusing its variables does not require more storage. Count the Python function's extra memory, excluding the input and animation snapshots." +
      (isTwoSum
        ? " The returned pair also stays fixed at two indices."
        : " The returned water total is one number."),
  });
  return result;
}

export const oppositeEnds: LessonBuilder<Inputs> = {
  slug: "opposite-ends",
  title: "Two Pointers — Opposite Ends",
  subtitle:
    "Two indices start at opposite ends of a sorted array and walk toward each other based on a comparison.",
  problem: (inputs) =>
    inputs.mode === "trapping-rain-water"
      ? "Given an array of non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining."
      : "Given a **sorted array of integers** and a **target T**, return **two different indices (i, j)** such that **arr[i] + arr[j] == T**, or **None** if no such pair exists.",
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
  practiceLadder,
  variant: "opposite-ends",
  view: (inputs) => (inputs.mode === "trapping-rain-water" ? "elevation-map" : "array"),
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
    {
      key: "target",
      label: "Target sum",
      kind: "int",
      hidden: (v: Record<string, unknown>) => v.mode === "trapping-rain-water",
    },
  ],
  validate: (inputs) => {
    const { mode, arr, target } = inputs;
    const w: string[] = [];
    if (mode === "two-sum") {
      if (!isSortedAsc(arr))
        w.push(
          "Two-Sum with opposite-ends pointers requires a sorted array. With an unsorted array the algorithm can miss valid pairs or report wrong indices.",
        );
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
    const steps =
      inputs.mode === "trapping-rain-water" ? buildTrappingRainWater(inputs) : buildTwoSum(inputs);
    return addComplexitySteps(steps, inputs);
  },
};
