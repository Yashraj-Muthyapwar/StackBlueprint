import type { LessonBuilder, PracticeProblem, Prediction, Step } from "../types";
import { isSortedAsc } from "../util";
import { labelledOptions, numberOptions, span } from "../prefix/shared";
import { lineOf, maxProbes } from "./shared";

type Mode = "exact" | "first";
type Inputs = { mode: Mode; arr: number[]; target: number };

/** Predict mode: this many "which half?" questions, plus one "what is mid?" question. */
const MAX_DIRECTION_PREDICTIONS = 3;

const practiceLadder: PracticeProblem[] = [
  {
    name: "Binary Search",
    difficulty: "easy",
    hint: "This exact pattern. Write the loop invariant first: if the target exists, it is always inside [low, high].",
    link: "https://leetcode.com/problems/binary-search/",
  },
  {
    name: "Search Insert Position",
    difficulty: "easy",
    hint: "When the loop ends, low is exactly where the target would be inserted. Why? Trace it on a target that isn't in the array.",
    link: "https://leetcode.com/problems/search-insert-position/",
  },
  {
    name: "Find First and Last Position of Element in Sorted Array",
    difficulty: "medium",
    hint: "The 'first occurrence' mode of this lesson, plus its mirror image for the last one. Don't stop when you find a match.",
    link: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
  },
  {
    name: "Search in Rotated Sorted Array",
    difficulty: "medium",
    hint: "One half of [low, high] is always sorted. Decide which, check whether the target lies inside it, then discard the other half.",
    link: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
  },
  {
    name: "Find Minimum in Rotated Sorted Array",
    difficulty: "medium",
    hint: "Compare arr[mid] with arr[high], not with a target. Which side of mid must hold the minimum?",
    link: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
  },
  {
    name: "Find Peak Element",
    difficulty: "medium",
    hint: "The array isn't sorted, but 'arr[mid] < arr[mid + 1]' still tells you which side must contain a peak.",
    link: "https://leetcode.com/problems/find-peak-element/",
  },
  {
    name: "Search a 2D Matrix",
    difficulty: "medium",
    hint: "Treat the matrix as one sorted array of R × C cells and convert mid back to (row, col) with // and %.",
    link: "https://leetcode.com/problems/search-a-2d-matrix/",
  },
  {
    name: "Median of Two Sorted Arrays",
    difficulty: "hard",
    hint: "Binary search on how many elements the smaller array contributes to the left half. It is a search on a partition, not on a value.",
    link: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
  },
];

const codeExact = `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`;

const codeFirst = `def first_occurrence(arr, target):
    low, high = 0, len(arr) - 1
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            ans = mid
            high = mid - 1
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return ans`;

const DEFAULTS: Record<Mode, { arr: number[]; target: number }> = {
  exact: { arr: [1, 3, 4, 7, 11, 15, 19, 24, 30], target: 15 },
  first: { arr: [2, 4, 4, 4, 4, 7, 9, 9, 12, 15], target: 4 },
};

function build({ mode, arr, target }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  const code = mode === "first" ? codeFirst : codeExact;
  const L = {
    init: lineOf(code, "low, high"),
    while: lineOf(code, "while"),
    mid: lineOf(code, "mid ="),
    eq: lineOf(code, "if arr[mid] == target"),
    // exact: `return mid` / first: `ans = mid`
    hit: lineOf(code, mode === "first" ? "ans = mid" : "return mid"),
    lt: lineOf(code, mode === "first" ? "elif arr[mid] < target" : "if arr[mid] < target"),
    low: lineOf(code, "low = mid + 1"),
    highEq: lineOf(code, "high = mid - 1", 0),
    highElse: lineOf(code, "high = mid - 1", mode === "first" ? 1 : 0),
    ret: lineOf(code, mode === "first" ? "return ans" : "return -1"),
  };

  if (n === 0) {
    steps.push({
      line: L.init,
      array: [],
      pointers: [],
      narration: "The array is empty, so there is nothing to search.",
    });
    return steps;
  }

  // Dry run: how many probes there will be, so predict mode can spread its questions sensibly.
  const probes: { mid: number; cmp: number; low: number; high: number }[] = [];
  {
    let lo = 0;
    let hi = n - 1;
    let guard = 0;
    while (lo <= hi && guard++ < 64) {
      const mid = (lo + hi) >> 1;
      const cmp = arr[mid] === target ? 0 : arr[mid] < target ? -1 : 1;
      probes.push({ mid, cmp, low: lo, high: hi });
      if (cmp === 0 && mode === "exact") break;
      if (cmp < 0) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  const askDir = new Set(probes.map((_, i) => i).slice(0, MAX_DIRECTION_PREDICTIONS));
  const askMid = probes.length > 1 ? 1 : 0;

  let low = 0;
  let high = n - 1;
  let ans = -1;
  const sizes: number[] = [n];

  const ptrs = (mid?: number): NonNullable<Step["pointers"]> => {
    const out: NonNullable<Step["pointers"]> = [
      { name: "low", index: Math.min(low, n - 1), color: "mint", placement: "above" },
      { name: "high", index: Math.max(high, 0), color: "amber", placement: "above" },
    ];
    if (mid !== undefined)
      out.push({ name: "mid", index: mid, color: "violet", placement: "below" });
    if (ans >= 0) out.push({ name: "ans", index: ans, color: "rose", placement: "below" });
    return out;
  };
  const live = () =>
    low <= high
      ? [
          {
            from: low,
            to: high,
            tone: "mid" as const,
            label: `${high - low + 1} cell${high - low + 1 === 1 ? "" : "s"} in play`,
          },
        ]
      : [];
  // Cells outside [low, high] are proven not to matter. The recorded answer stays bright.
  const dead = () => span(0, n).filter((i) => (i < low || i > high) && i !== ans);
  const sizesStrip = () => ({
    label: "cells still in play after each step",
    array: [...sizes],
    highlight: { kind: "match" as const, indices: [sizes.length - 1] },
  });
  const base = () => ({
    array: [...arr],
    partitions: live(),
    dimmed: dead(),
    secondary: sizesStrip(),
  });
  const ring = (mid?: number) =>
    ans >= 0 && mid === undefined
      ? { kind: "match" as const, indices: [ans] }
      : mid !== undefined
        ? { kind: "compare" as const, indices: [mid] }
        : undefined;

  steps.push({
    line: L.init,
    ...base(),
    dimmed: [],
    pointers: ptrs(),
    status: `looking for ${target} in ${n} cells`,
    narration:
      mode === "first"
        ? `Find the FIRST index holding ${target}. The array is sorted, so equal values sit side by side. Each comparison can still discard half of the cells.`
        : `Find ${target}. The array is sorted, so one comparison at the middle can rule out half of the remaining cells.`,
    proof:
      "Invariant: if the target is anywhere in the array, it is somewhere in [low, high]. Every move keeps that true while shrinking the range.",
  });

  for (let pi = 0; pi < probes.length; pi++) {
    const { mid, cmp } = probes[pi];
    const v = arr[mid];
    const sign = cmp === 0 ? "=" : cmp < 0 ? "<" : ">";

    // 1) mid calculation (quizzed once)
    if (pi === askMid) {
      const predict: Prediction = {
        question: `low = ${low} and high = ${high}. What is mid = (low + high) // 2?`,
        // Slips: rounding up, and the classic "forgot to add low" (high − low) // 2.
        options: numberOptions(
          mid,
          [Math.ceil((low + high) / 2), (high - low) >> 1, mid + 1],
          pi + 1,
        ),
        answer: String(mid),
        line: L.while,
      };
      steps.push({
        line: L.mid,
        ...base(),
        pointers: ptrs(),
        status: `low = ${low},  high = ${high}`,
        narration: `mid = (${low} + ${high}) // 2 = ${mid}. Integer division rounds down, so mid is always a valid index inside [low, high].`,
        proof:
          "Looking at the middle is what makes the search logarithmic: whichever way the comparison goes, about half of the cells disappear.",
        predict,
      });
    }

    // 2) compare arr[mid] with the target
    const compareNarration =
      cmp === 0
        ? mode === "first"
          ? `arr[${mid}] = ${v} equals ${target}. It is a match, but an earlier cell might match too.`
          : `arr[${mid}] = ${v} equals ${target}: found.`
        : cmp < 0
          ? `arr[${mid}] = ${v} is less than ${target}.`
          : `arr[${mid}] = ${v} is greater than ${target}.`;
    const dirOptions =
      mode === "first"
        ? cmp === 0
          ? [
              "Record ans = mid, keep searching LEFT",
              "Return mid right away",
              "Record ans = mid, keep searching RIGHT",
            ]
          : cmp < 0
            ? [
                "Discard the left half (low = mid + 1)",
                "Discard the right half (high = mid − 1)",
                "Record ans = mid and stop",
              ]
            : [
                "Discard the right half (high = mid − 1)",
                "Discard the left half (low = mid + 1)",
                "Record ans = mid and stop",
              ]
        : cmp === 0
          ? [
              "Found it: return mid",
              "Discard the left half (low = mid + 1)",
              "Discard the right half (high = mid − 1)",
            ]
          : cmp < 0
            ? [
                "Discard the left half (low = mid + 1)",
                "Discard the right half (high = mid − 1)",
                "Return mid",
              ]
            : [
                "Discard the right half (high = mid − 1)",
                "Discard the left half (low = mid + 1)",
                "Return mid",
              ];
    const { options, answer } = labelledOptions(dirOptions, pi + 2);

    steps.push({
      line: L.eq,
      lineEnd: L.lt,
      ...base(),
      pointers: ptrs(mid),
      highlight: ring(mid),
      status: askDir.has(pi)
        ? `arr[${mid}] = ${v},  target = ${target}`
        : `arr[${mid}] = ${v} ${sign} ${target}`,
      narration: compareNarration,
      proof:
        cmp === 0
          ? mode === "first"
            ? "Because the array is sorted, any earlier copy of the target must be to the LEFT of mid. So record this match and keep looking left; nothing to the right can be earlier."
            : undefined
          : cmp < 0
            ? `The array is sorted, so every cell at or left of index ${mid} is at most ${v}, which is below ${target}. None of them can be the target.`
            : `The array is sorted, so every cell at or right of index ${mid} is at least ${v}, which is above ${target}. None of them can be the target.`,
      predict: askDir.has(pi)
        ? {
            question: `arr[${mid}] = ${v} and the target is ${target}. What should the search do next?`,
            options,
            answer,
            line: L.while,
          }
        : undefined,
    });

    // 3) the move itself
    if (cmp === 0 && mode === "exact") {
      steps.push({
        line: L.hit,
        ...base(),
        pointers: ptrs(mid),
        highlight: { kind: "match", indices: [mid] },
        status: `return ${mid}`,
        narration: `Found ${target} at index ${mid} after ${pi + 1} comparison${pi === 0 ? "" : "s"}, out of ${n} cells.`,
        proof: `Scanning left to right could take up to ${n} comparisons. Halving the range needs at most ${maxProbes(n)}.`,
      });
      return steps;
    }

    if (cmp === 0) {
      ans = mid;
      high = mid - 1;
      sizes.push(Math.max(0, high - low + 1));
      steps.push({
        line: L.hit,
        lineEnd: L.highEq,
        ...base(),
        pointers: ptrs(),
        highlight: ring(),
        status: `ans = ${ans},  high = ${high}`,
        narration: `Record ans = ${mid}, then move high to ${high} to look for an even earlier ${target}.`,
        proof:
          pi === probes.length - 1 || high < low
            ? "ans only ever moves left: each new match is earlier than the last. When the range runs out, ans holds the first occurrence."
            : undefined,
      });
    } else if (cmp < 0) {
      low = mid + 1;
      sizes.push(Math.max(0, high - low + 1));
      steps.push({
        line: L.low,
        ...base(),
        pointers: ptrs(),
        highlight: ring(),
        status: `low = ${low}`,
        narration: `Discard the left half: low = mid + 1 = ${low}. The range shrinks to ${Math.max(0, high - low + 1)} cell${high - low + 1 === 1 ? "" : "s"}.`,
      });
    } else {
      high = mid - 1;
      sizes.push(Math.max(0, high - low + 1));
      steps.push({
        line: L.highElse,
        ...base(),
        pointers: ptrs(),
        highlight: ring(),
        status: `high = ${high}`,
        narration: `Discard the right half: high = mid − 1 = ${high}. The range shrinks to ${Math.max(0, high - low + 1)} cell${high - low + 1 === 1 ? "" : "s"}.`,
      });
    }
  }

  const found = mode === "first" && ans >= 0;
  steps.push({
    line: L.ret,
    ...base(),
    pointers: found ? [{ name: "ans", index: ans, color: "mint" as const }] : [],
    highlight: found ? { kind: "match", indices: [ans] } : undefined,
    status: `return ${found ? ans : -1}`,
    narration: found
      ? `low passed high, so the range is empty. Return ans = ${ans}: the first index holding ${target}.`
      : `low passed high, so no cells are left in play and ${target} is not in the array. Return -1.`,
    proof: `That took ${probes.length} comparison${probes.length === 1 ? "" : "s"} for ${n} cells. The worst case is ⌊log₂ ${n}⌋ + 1 = ${maxProbes(n)}, because the range halves every time.`,
  });
  return steps;
}

export const bsearchIndex: LessonBuilder<Inputs> = {
  slug: "on-index",
  title: "Binary Search on Index",
  subtitle: "Search a sorted array by halving the index range each step.",
  problem: ({ mode }) =>
    mode === "first"
      ? "Given a sorted array that may contain duplicates, return the index of the first occurrence of the target, or -1 if it is absent, in O(log n) time."
      : "Given a sorted array and a target value, return the index of the target if present, otherwise -1, in O(log n) time.",
  spotIt: [
    "Sorted array (or rotated sorted) and a target / boundary lookup.",
    "Required complexity is O(log n).",
    "Phrases: 'first / last occurrence', 'insertion position', 'peak element'.",
  ],
  avoidWhen: [
    "Data is unsorted and sorting costs more than the queries save.",
    "You need every match — a linear scan is simpler.",
    "Comparator isn't monotonic across the index — binary search will miss the answer.",
  ],
  practiceLadder,
  variant: "bsearch-index",
  view: "array",
  code: codeExact,
  codeFor: (inputs) => ((inputs as Inputs).mode === "first" ? codeFirst : codeExact),
  defaultInputs: { mode: "exact", ...DEFAULTS.exact },
  inputs: [
    {
      key: "mode",
      label: "Variant",
      kind: "select",
      options: [
        { value: "exact", label: "Find a value (stop at the first hit)" },
        { value: "first", label: "First occurrence (duplicates)" },
      ],
    },
    { key: "arr", label: "Array (sorted)", kind: "intArray" },
    { key: "target", label: "Target", kind: "int" },
  ],
  onInputChange: (changedKey, newValue) => {
    if (changedKey !== "mode") return null;
    const d = DEFAULTS[newValue === "first" ? "first" : "exact"];
    return { arr: d.arr.join(", "), target: String(d.target) };
  },
  validate: ({ arr }) =>
    isSortedAsc(arr)
      ? []
      : ["Binary search requires a sorted array. On unsorted data it returns wrong indices or -1."],
  build,
};
