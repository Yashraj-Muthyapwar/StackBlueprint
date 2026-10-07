import type { LessonBuilder, PracticeProblem, Prediction, Step } from "../types";

type Inputs = { arr: number[]; k: number };

/** Predict mode asks at most this many questions, so a long array doesn't become a chore. */
const MAX_PREDICTIONS = 4;

const practiceLadder: PracticeProblem[] = [
  { name: "Maximum Average Subarray I", difficulty: "easy", hint: "This exact pattern. Divide by k at the very end, not on every slide.", link: "https://leetcode.com/problems/maximum-average-subarray-i/" },
  { name: "Contains Duplicate II", difficulty: "easy", hint: "The window holds the last k elements. Which structure tells you in O(1) whether a value is already inside it?", link: "https://leetcode.com/problems/contains-duplicate-ii/" },
  { name: "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold", difficulty: "medium", hint: "Same slide, but count windows instead of tracking the max. Compare sums against threshold * k to avoid division.", link: "https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold/" },
  { name: "Maximum Points You Can Obtain from Cards", difficulty: "medium", hint: "Taking k cards from the ends means leaving a window of size n - k in the middle. Minimize that window instead.", link: "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/" },
  { name: "Find All Anagrams in a String", difficulty: "medium", hint: "The 'sum' becomes a frequency table. Adding and removing one character updates it in O(1).", link: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" },
  { name: "Sliding Window Maximum", difficulty: "hard", hint: "A running sum can be undone by subtraction. A running max can't. You need a structure that forgets old maxima: a monotonic deque.", link: "https://leetcode.com/problems/sliding-window-maximum/" },
];

const code = `def max_window_sum(arr, k):
    window_sum = sum(arr[:k])
    best = window_sum
    for right in range(k, len(arr)):
        window_sum += arr[right] - arr[right - k]
        if window_sum > best:
            best = window_sum
    return best`;

/** Index range [start, start + len). */
const span = (start: number, len: number) => Array.from({ length: len }, (_, i) => start + i);

/** "+ 7" / "− 2" style terms so negative array values still read correctly in equations. */
const addTerm = (x: number) => (x < 0 ? `− ${Math.abs(x)}` : `+ ${x}`);
const subTerm = (x: number) => (x < 0 ? `+ ${Math.abs(x)}` : `− ${x}`);
const badgeAdd = (x: number) => `${x < 0 ? "−" : "+"}${Math.abs(x)}`;
const badgeSub = (x: number) => `${x < 0 ? "+" : "−"}${Math.abs(x)}`;

/**
 * Numeric options for "what's the new sum?". The classic slips are included as
 * distractors (forgetting to subtract, forgetting to add, swapping the signs).
 */
function sumOptions(correct: number, distractors: number[], rotate: number) {
  const seen = new Set<number>();
  const ordered: number[] = [];
  const add = (v: number) => {
    if (!seen.has(v)) {
      seen.add(v);
      ordered.push(v);
    }
  };
  add(correct);
  distractors.forEach(add);
  for (const d of [correct + 1, correct - 1, correct + 2]) {
    if (ordered.length >= 3) break;
    add(d);
  }
  const picked = ordered.slice(0, 4);
  const k = rotate % picked.length;
  return [...picked.slice(k), ...picked.slice(0, k)].map((v) => ({ id: String(v), label: String(v) }));
}

function build({ arr, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (!Number.isInteger(k) || k <= 0 || k > n) {
    steps.push({ line: 1, narration: "Invalid k for the array.", array: [...arr], pointers: [] });
    return steps;
  }

  const win = (left: number, right: number, sum: number) => [
    { from: left, to: right, tone: "mid" as const, label: `sum = ${sum}` },
  ];
  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];

  // Every window sum computed so far, by window start index. Shown in the secondary
  // strip so "maximum over all windows" is something you can see being built.
  const sums: number[] = [];
  let bestIdx = 0;
  const secondary = () => ({
    label: "window sums (by start index)",
    array: [...sums],
    highlight: { kind: "match" as const, indices: [bestIdx] },
  });

  // First window: the only sum computed from scratch.
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  sums.push(windowSum);
  let best = windowSum;

  const firstTerms = arr.slice(0, k);
  const firstExpr =
    k <= 6 ? firstTerms.join(" + ") : `${firstTerms.slice(0, 3).join(" + ")} + … + ${firstTerms[k - 1]}`;

  steps.push({
    line: 2,
    lineEnd: 3,
    array: [...arr],
    pointers: ptrs(0, k - 1),
    partitions: win(0, k - 1, windowSum),
    highlight: { kind: "match", indices: span(0, k) },
    status: `window_sum = ${windowSum},  best = ${best}`,
    narration:
      k === 1
        ? `The first window is just arr[0] = ${windowSum}. It's the best so far.`
        : `Sum the first ${k} elements: ${firstExpr} = ${windowSum}. This is the first window and the best so far.`,
    proof:
      "This is the only sum we compute from scratch. Re-adding k numbers for every window would cost O(n·k). Every later window will be built from the previous one with just two operations.",
    secondary: secondary(),
  });

  let asked = 0;
  for (let right = k; right < n; right++) {
    const s = right - k; // start of the window before sliding
    const e = right - 1; // end of the window before sliding
    const left = s + 1; // start of the window after sliding
    const leave = arr[s];
    const enter = arr[right];
    const old = windowSum;
    const nw = old - leave + enter;
    const eq = `${old} ${subTerm(leave)} ${addTerm(enter)} = ${nw}`;
    const isFirstSlide = right === k;

    const badges = [
      { index: s, text: badgeSub(leave), tone: "rose" as const },
      { index: right, text: badgeAdd(enter), tone: "mint" as const },
    ];

    // Pre-slide step: the window hasn't moved yet, so the learner can predict the new sum.
    const asking = asked < MAX_PREDICTIONS;
    if (asking) {
      asked += 1;
      const predict: Prediction = {
        question: `The window [${s}..${e}] has sum ${old}. It slides one cell right: ${leave} leaves and ${enter} enters. What is the new sum?`,
        options: sumOptions(nw, [old + enter, old - leave, old - enter + leave], asked),
        answer: String(nw),
        // While the question is open, highlight the loop header, not the update formula.
        line: 4,
      };
      steps.push({
        line: 4,
        lineEnd: 5,
        array: [...arr],
        pointers: ptrs(s, e),
        partitions: win(s, e, old),
        badges,
        highlight: { kind: "compare", indices: [s, right] },
        status: `window [${s}..${e}],  sum = ${old}`,
        narration: `Slide right by one: ${enter} enters at index ${right} and ${leave} leaves from index ${s}. New sum = ${eq}.`,
        proof:
          k > 1
            ? `Only two cells change. The other ${k - 1} stay in the window, so there's no need to add them again: subtract the one that left and add the one that arrived.`
            : "With k = 1 the window is a single cell, so the new sum is just the element that entered.",
        secondary: secondary(),
        predict,
      });
    }

    // Slide: the band and both pointers glide one cell right.
    windowSum = nw;
    sums.push(nw);
    const prevBest = best;
    const isBest = nw > best;
    if (isBest) {
      best = nw;
      bestIdx = sums.length - 1;
    }

    steps.push({
      line: 5,
      lineEnd: isBest ? 7 : 6,
      array: [...arr],
      pointers: ptrs(left, right),
      partitions: win(left, right, nw),
      badges,
      highlight: isBest
        ? { kind: "match", indices: span(left, k) }
        : { kind: "compare", indices: [s, right] },
      status: `${eq}  ·  best = ${best}`,
      narration:
        (asking
          ? `The window is now [${left}..${right}] with sum ${nw}. `
          : `${enter} enters, ${leave} leaves: ${eq}. `) +
        (isBest
          ? `${nw} beats the old best (${prevBest}): new best!`
          : `${nw} ≤ best (${best}), so best stays.`),
      proof: isFirstSlide
        ? "best only has to remember the largest sum seen so far, so a single variable is enough."
        : undefined,
      secondary: secondary(),
    });
  }

  steps.push({
    line: 8,
    array: [...arr],
    pointers: [],
    partitions: [{ from: bestIdx, to: bestIdx + k - 1, tone: "mid" as const, label: `best = ${best}` }],
    highlight: { kind: "match", indices: span(bestIdx, k) },
    status: `return ${best}`,
    narration: `Return ${best}: the sum of window [${bestIdx}..${bestIdx + k - 1}].`,
    proof:
      "Each slide cost two operations no matter how big k is. Recomputing every window would cost k each, so O(n·k) overall instead of O(n).",
    secondary: secondary(),
  });
  return steps;
}

export const fixedSize: LessonBuilder<Inputs> = {
  slug: "fixed-size",
  title: "Sliding Window — Fixed Size",
  subtitle: "A window of size k slides across the array. Each step add the new element, drop the old one.",
  problem: "Given an array of integers and a window size k, return the maximum sum of any contiguous subarray of length exactly k.",
  spotIt: [
    "Problem explicitly gives a window size k and asks for a stat over every window.",
    "Phrases: 'max / min / sum / average of every subarray of size k'.",
    "Brute force is O(n\u00b7k) and the interviewer asks you to improve it to O(n).",
  ],
  avoidWhen: [
    "Window size depends on a condition \u2014 use variable-size sliding window instead.",
    "Aggregation is not incremental (e.g. needs full re-sort) \u2014 a heap or deque variant is needed.",
    "You need answers over non-contiguous subsets.",
  ],
  practiceLadder,
  variant: "fixed-size",
  view: "array",
  code,
  defaultInputs: { arr: [2, 1, 5, 1, 3, 2, 7, 1], k: 3 },
  inputs: [
    { key: "arr", label: "Array", kind: "intArray" },
    { key: "k", label: "Window size k", kind: "int", min: 1 },
  ],
  validate: ({ arr, k }) => {
    const w: string[] = [];
    if (!Number.isInteger(k) || k < 1) w.push("k must be a positive integer.");
    else if (k > arr.length) w.push(`k (${k}) > array length (${arr.length}).`);
    return w;
  },
  build,
};