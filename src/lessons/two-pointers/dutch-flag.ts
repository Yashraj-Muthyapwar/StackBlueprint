import type { LessonBuilder, Partition, PracticeProblem, Step } from "../types";

type Inputs = { arr: number[] };

const practiceLadder: PracticeProblem[] = [
  { name: "Move Zeroes", difficulty: "easy", hint: "Like a 2-color Dutch Flag. Maintain a zone for non-zeroes and a zone for the current scanner.", link: "https://leetcode.com/problems/move-zeroes/" },
  { name: "Sort Array By Parity", difficulty: "easy", hint: "Another 2-color variation. Evens on the left, odds on the right.", link: "https://leetcode.com/problems/sort-array-by-parity/" },
  { name: "Sort Colors", difficulty: "medium", hint: "The canonical 3-color Dutch Flag. 0s, 1s, and 2s.", link: "https://leetcode.com/problems/sort-colors/" },
  { name: "Rearrange Array Elements by Sign", difficulty: "medium", hint: "Partitioning with an added constraint: you must maintain relative order (stable partition).", link: "https://leetcode.com/problems/rearrange-array-elements-by-sign/" },
  { name: "First Missing Positive", difficulty: "hard", hint: "Partitioning integers to their correct indices (Cyclic Sort). It's an in-place bucket sort.", link: "https://leetcode.com/problems/first-missing-positive/" },
  { name: "Wiggle Sort II", difficulty: "hard", hint: "Can be solved in O(N) time and O(1) space using Dutch Flag partitioning around the median.", link: "https://leetcode.com/problems/wiggle-sort-ii/" },
];

const code = `def dutch_flag(arr):
    low, mid, high = 0, 0, len(arr) - 1
    while mid <= high:
        if arr[mid] == 0:
            arr[low], arr[mid] = arr[mid], arr[low]
            low += 1
            mid += 1
        elif arr[mid] == 1:
            mid += 1
        else:
            arr[mid], arr[high] = arr[high], arr[mid]
            high -= 1
    return arr`;

function parts(low: number, mid: number, high: number, n: number): Partition[] {
  const out: Partition[] = [];
  if (low - 1 >= 0) out.push({ from: 0, to: low - 1, tone: "low", label: "= 0" });
  if (high + 1 <= n - 1) out.push({ from: high + 1, to: n - 1, tone: "high", label: "= 2" });
  if (mid - 1 >= low) out.push({ from: low, to: mid - 1, tone: "mid", label: "= 1" });
  return out;
}

function build({ arr: input }: Inputs): Step[] {
  const arr = [...input];
  const n = arr.length;
  const steps: Step[] = [];
  const ptr = (low: number, mid: number, high: number) => [
    { name: "low", index: low, color: "mint" as const, placement: "above" as const },
    { name: "mid", index: mid, color: "violet" as const, placement: "below" as const },
    { name: "high", index: high, color: "amber" as const, placement: "above" as const },
  ];
  const push = (s: Omit<Step, "array" | "partitions"> & { low: number; mid: number; high: number; array?: number[] }) => {
    const { low, mid, high, ...rest } = s;
    steps.push({ ...rest, array: s.array ?? [...arr], partitions: parts(low, mid, high, n) });
  };

  if (n === 0) {
    steps.push({ line: 1, narration: "Empty array.", pointers: [] });
    return steps;
  }

  push({ line: 1, pointers: [], low: 0, mid: 0, high: n - 1, narration: "Sort 0s, 1s, 2s in one pass." });
  let low = 0,
    mid = 0,
    high = n - 1;
  push({ line: 2, pointers: ptr(low, mid, high), low, mid, high, narration: "Three pointers: low (0-zone), mid (scanner), high (2-zone)." });

  let safety = 0;
  while (mid <= high && safety++ < 500) {
    push({ line: 3, pointers: ptr(low, mid, high), low, mid, high, status: `mid=${mid} ≤ high=${high}`, narration: "Loop guard holds." });
    push({
      line: 4,
      pointers: ptr(low, mid, high),
      low,
      mid,
      high,
      highlight: { kind: "compare", indices: [mid] },
      status: `arr[mid]=${arr[mid]}`,
      narration: `Inspect arr[mid] = ${arr[mid]}.`,
    });
    if (arr[mid] === 0) {
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      push({
        line: 5,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        array: [...arr],
        highlight: { kind: "swap", indices: [low, mid] },
        narration: `Swap arr[${low}] ↔ arr[${mid}]. Advance low and mid.`,
      });
      low += 1;
      mid += 1;
    } else if (arr[mid] === 1) {
      push({ line: 9, pointers: ptr(low, mid, high), low, mid, high, narration: "It's a 1 — already correct, advance mid." });
      mid += 1;
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      push({
        line: 11,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        array: [...arr],
        highlight: { kind: "swap", indices: [mid, high] },
        narration: `It's a 2 — swap with arr[${high}], shrink high. Don't advance mid.`,
      });
      high -= 1;
    }
  }
  push({ line: 13, pointers: ptr(low, mid, high), low, mid, high, narration: "Partitioned into three zones." });
  return steps;
}

export const dutchFlag: LessonBuilder<Inputs> = {
  slug: "dutch-flag",
  title: "Two Pointers — Dutch Flag",
  subtitle: "Partition an array of 0s, 1s, and 2s into three zones using three pointers in a single pass.",
  problem: "Given an array containing only 0s, 1s, and 2s, sort it in a single pass and in place so all 0s come first, then 1s, then 2s.",
  spotIt: [
    "Sort or partition an array into a small fixed number of categories (e.g. 0/1/2, neg/zero/pos).",
    "Constraints demand a single pass and in-place rearrangement.",
    "Phrases like 'sort colors', 'move zeros', 'partition around a pivot'.",
  ],
  avoidWhen: [
    "There are many distinct keys \u2014 use counting sort or a comparison sort.",
    "Relative order of equal elements must be preserved (Dutch flag is not stable).",
    "You only need to count categories, not rearrange them.",
  ],
  practiceLadder,
  variant: "dutch-flag",
  view: "array",
  code,
  defaultInputs: { arr: [2, 0, 2, 1, 1, 0, 0, 2, 1] },
  inputs: [{ key: "arr", label: "Array (values 0/1/2)", kind: "intArray" }],
  validate: ({ arr }) => {
    const w: string[] = [];
    const bad = arr.filter((v) => v !== 0 && v !== 1 && v !== 2);
    if (bad.length) w.push(`Dutch Flag expects only 0/1/2. Found: ${[...new Set(bad)].join(", ")}.`);
    if (arr.length > 16) w.push("For readability, keep length ≤ 16.");
    return w;
  },
  build,
};
