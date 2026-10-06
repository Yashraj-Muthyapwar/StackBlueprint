import type { LessonBuilder, Partition, PracticeProblem, Prediction, Step } from "../types";

type Inputs = { arr: number[] };

/** Predict mode asks at most this many questions, so a long array doesn't become a chore. */
const MAX_PREDICTIONS = 6;

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

/**
 * The invariant, drawn as bands:
 *   [0 .. low-1]    all 0s
 *   [low .. mid-1]  all 1s
 *   [mid .. high]   unknown (not examined yet)
 *   [high+1 .. n-1] all 2s
 */
function parts(low: number, mid: number, high: number, n: number): Partition[] {
  const out: Partition[] = [];
  if (low - 1 >= 0) out.push({ from: 0, to: low - 1, tone: "low", label: "= 0" });
  if (mid - 1 >= low) out.push({ from: low, to: mid - 1, tone: "mid", label: "= 1" });
  if (high >= mid) out.push({ from: mid, to: high, tone: "unknown", label: "?" });
  if (high + 1 <= n - 1) out.push({ from: high + 1, to: n - 1, tone: "high", label: "= 2" });
  return out;
}

function build({ arr: input }: Inputs): Step[] {
  const arr = [...input];
  const n = arr.length;
  const steps: Step[] = [];

  if (n === 0) {
    steps.push({ line: 1, narration: "Empty array: nothing to sort.", pointers: [] });
    return steps;
  }

  let low = 0;
  let mid = 0;
  let high = n - 1;

  // A pointer that has walked off either end (mid past the last cell, high before the first)
  // is simply not drawn, so the canvas never points outside the array.
  const ptr = () =>
    [
      { name: "low", index: low, color: "mint" as const, placement: "above" as const },
      { name: "mid", index: mid, color: "violet" as const, placement: "below" as const },
      { name: "high", index: high, color: "amber" as const, placement: "above" as const },
    ].filter((p) => p.index >= 0 && p.index < n);

  const push = (s: Partial<Step> & { line: number; narration: string }) =>
    steps.push({
      array: [...arr],
      pointers: ptr(),
      partitions: parts(low, mid, high, n),
      ...s,
    } as Step);

  push({
    line: 2,
    status: `unknown zone: all ${n} cells`,
    narration: "low and mid start on the left, high on the right. Nothing has been examined yet.",
    proof:
      "The invariant: everything left of low is 0, between low and mid is 1, right of high is 2, and the cells from mid to high are unknown. Every step shrinks the unknown zone by exactly one cell.",
  });

  let asked = 0;
  let iters = 0;
  while (mid <= high && iters < 500) {
    iters += 1;
    const v = arr[mid];
    const kind: "zero" | "one" | "two" = v === 0 ? "zero" : v === 1 ? "one" : "two";

    const predict: Prediction | undefined =
      asked++ < MAX_PREDICTIONS
        ? {
          question: `arr[mid] = ${v} (mid is at index ${mid}). What happens next?`,
          options: [
            { id: "zero", label: "Swap with low, then advance low and mid" },
            { id: "one", label: "Just advance mid" },
            { id: "two", label: "Swap with high, then shrink high" },
          ],
          answer: kind,
        }
        : undefined;

    // Decision step: the loop guard and the first `if` apply to every case, so the
    // highlighted lines don't reveal which branch is coming.
    let narration: string;
    let proof: string;
    if (kind === "zero") {
      narration = `arr[mid] = 0. A 0 belongs in the left zone, so swap it with arr[low].`;
      proof =
        low === mid
          ? "low and mid are on the same cell (the 1-zone is empty), so the swap is a no-op: the 0 is already in place and both pointers advance."
          : "The cells from low to mid-1 are all 1s, so arr[low] is a 1. Swapping puts the 0 at the end of the 0-zone and a known 1 at mid, so mid can safely advance.";
    } else if (kind === "one") {
      narration = `arr[mid] = 1. A 1 already belongs in the middle zone.`;
      proof =
        "The middle zone is exactly the cells between low and mid, so advancing mid just extends it by one.";
    } else {
      narration =
        v === 2
          ? `arr[mid] = 2. A 2 belongs in the right zone, so swap it with arr[high].`
          : `arr[mid] = ${v}. The else branch treats anything that isn't 0 or 1 as a 2, so swap it with arr[high].`;
      proof =
        mid === high
          ? "mid and high are on the same cell, the last unknown one. The swap is a no-op and high shrinks past mid."
          : "arr[high] hasn't been examined yet, so whatever arrives at mid is unknown. That's why mid does NOT advance here: we look at the new value next. The 2 at high is final, so high shrinks.";
    }

    push({
      line: 3,
      lineEnd: 4,
      highlight: { kind: "compare", indices: [mid] },
      status: `mid = ${mid}:  arr[mid] = ${v}`,
      narration,
      proof,
      predict,
    });

    // Action step: apply the move, then show the resulting state.
    if (kind === "zero") {
      const l = low;
      const m = mid;
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      low += 1;
      mid += 1;
      push({
        line: 5,
        lineEnd: 7,
        highlight: { kind: "swap", indices: l === m ? [m] : [l, m] },
        status: `low = ${low},  mid = ${mid}`,
        narration:
          l === m
            ? `No-op swap. low → ${low}, mid → ${mid}. The 0-zone grew by one.`
            : `Swap arr[${l}] ↔ arr[${m}]. low → ${low}, mid → ${mid}. The 0-zone grew by one.`,
      });
    } else if (kind === "one") {
      mid += 1;
      push({
        line: 8,
        lineEnd: 9,
        status: `mid = ${mid}`,
        narration: `mid → ${mid}. The 1-zone grew by one.`,
      });
    } else {
      const m = mid;
      const h = high;
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      high -= 1;
      push({
        line: 11,
        lineEnd: 12,
        highlight: { kind: "swap", indices: m === h ? [m] : [m, h] },
        status: `high = ${high}`,
        narration:
          m === h
            ? `No-op swap. high → ${high}. The 2-zone grew by one.`
            : `Swap arr[${m}] ↔ arr[${h}]. high → ${high}; mid stays at ${mid} to examine the value that just arrived.`,
      });
    }
  }

  push({
    line: 13,
    status: `done: ${iters} steps for ${n} cells`,
    narration: `mid crossed high, so no unknown cells are left. The array is partitioned: 0s, then 1s, then 2s.`,
    proof:
      "Each loop iteration settled exactly one cell (mid advanced or high shrank), so the whole pass touches each cell once: O(n) time and O(1) space.",
  });
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