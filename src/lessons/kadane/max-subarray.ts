import type { LessonBuilder, PracticeProblem, Prediction, Step } from "../types";
import { addTerm, badgeAdd, span } from "../prefix/shared";

type Inputs = { arr: number[] };

/** Predict mode asks at most this many extend-or-restart questions. */
const MAX_PREDICTIONS = 4;

const practiceLadder: PracticeProblem[] = [
  {
    name: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    hint: "Kadane in disguise: run it on the day-to-day price differences, or track the lowest price so far. Same 'extend or restart' decision.",
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
  },
  {
    name: "Maximum Subarray",
    difficulty: "medium",
    hint: "This exact pattern. Before coding, say in one sentence why a negative running sum should be thrown away.",
    link: "https://leetcode.com/problems/maximum-subarray/",
  },
  {
    name: "Maximum Absolute Sum of Any Subarray",
    difficulty: "medium",
    hint: "The most negative subarray is just Kadane on the negated array. Run both and take the larger magnitude.",
    link: "https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/",
  },
  {
    name: "Maximum Sum Circular Subarray",
    difficulty: "medium",
    hint: "The best circular subarray is either a normal one, or the total minus the worst normal one. Watch the all-negative case, where that formula returns 0.",
    link: "https://leetcode.com/problems/maximum-sum-circular-subarray/",
  },
  {
    name: "Maximum Subarray Sum with One Deletion",
    difficulty: "medium",
    hint: "Two running states per index: best ending here with no deletion, and best ending here with one deletion used.",
    link: "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/",
  },
  {
    name: "Longest Turbulent Subarray",
    difficulty: "medium",
    hint: "Same extend-or-restart shape, but the state is a length, and the restart rule depends on the comparison signs.",
    link: "https://leetcode.com/problems/longest-turbulent-subarray/",
  },
  {
    name: "Max Sum of Rectangle No Larger Than K",
    difficulty: "hard",
    hint: "Fix two rows, collapse the columns between them into a 1D array, then you need 'largest subarray sum ≤ K'. Plain Kadane is not enough here.",
    link: "https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/",
  },
];

// 1-based line numbers, matching the code pane.
const code = `def kadane(arr):
    best_sum = current_sum = arr[0]
    for i in range(1, len(arr)):
        if current_sum + arr[i] < arr[i]:
            current_sum = arr[i]
        else:
            current_sum = current_sum + arr[i]
        if current_sum > best_sum:
            best_sum = current_sum
    return best_sum`;

function build({ arr }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({
      line: 1,
      array: [],
      pointers: [],
      narration: "The array is empty, so there is nothing to sum.",
    });
    return steps;
  }

  // Dry run first, so predict mode can quiz a mix of restarts and extends instead of the first few steps.
  const restartAt: number[] = [];
  const extendAt: number[] = [];
  {
    let cur = arr[0];
    for (let i = 1; i < n; i++) {
      if (cur + arr[i] < arr[i]) {
        restartAt.push(i);
        cur = arr[i];
      } else {
        extendAt.push(i);
        cur += arr[i];
      }
    }
  }
  const askAt = new Set([
    ...restartAt.slice(0, 2),
    ...extendAt.slice(0, MAX_PREDICTIONS - Math.min(2, restartAt.length)),
  ]);

  let cur = arr[0];
  let best = arr[0];
  let start = 0;
  let bestL = 0;
  let bestR = 0;
  // current_sum after each index: the "best sum ending exactly here" row.
  const endings: number[] = [cur];

  // The band's left edge already marks where the current subarray starts, so only i gets a caret.
  const ptrs = (i: number) => [{ name: "i", index: i, color: "amber" as const }];
  const ring = () => ({ kind: "match" as const, indices: span(bestL, bestR - bestL + 1) });
  const strip = () => ({
    label: "current_sum for the subarray ending at each index",
    array: [...endings],
    highlight: { kind: "match" as const, indices: [bestR] },
  });

  steps.push({
    line: 2,
    array: [...arr],
    pointers: ptrs(0),
    partitions: [{ from: 0, to: 0, tone: "mid", label: `current = ${cur}` }],
    highlight: ring(),
    secondary: strip(),
    status: `current_sum = ${cur},  best_sum = ${best}`,
    narration: `Start with the first element: the best subarray ending at index 0 is just [${cur}], so both current_sum and best_sum are ${cur}.`,
    proof:
      "Every subarray ends somewhere. Kadane finds, for each index i, the best sum of a subarray ending exactly at i, then keeps the largest of those.",
  });

  let asked = 0;
  for (let i = 1; i < n; i++) {
    const x = arr[i];
    const old = cur;
    const ext = old + x;
    const restart = ext < x;
    const decide = restart ? "restart" : "extend";

    if (askAt.has(i)) {
      asked += 1;
      const predict: Prediction = {
        question: `current_sum = ${old} and arr[${i}] = ${x}. Keep extending the current subarray, or restart at index ${i}?`,
        options:
          asked % 2 === 1
            ? [
                { id: "extend", label: `Extend: ${old} ${addTerm(x)} = ${ext}` },
                { id: "restart", label: `Restart: current_sum = ${x}` },
              ]
            : [
                { id: "restart", label: `Restart: current_sum = ${x}` },
                { id: "extend", label: `Extend: ${old} ${addTerm(x)} = ${ext}` },
              ],
        answer: decide,
        // While the question is open, highlight the loop header, not the branch taken.
        line: 3,
      };
      steps.push({
        line: 4,
        array: [...arr],
        pointers: ptrs(i),
        partitions: [{ from: start, to: i - 1, tone: "mid", label: `current = ${old}` }],
        highlight: ring(),
        secondary: strip(),
        status: `extend = ${ext}  vs  restart = ${x}`,
        narration: `Extending gives ${old} ${addTerm(x)} = ${ext}. Restarting gives just ${x}. ${restart ? `${x} is bigger, so restart.` : `${ext} is at least ${x}, so extend.`}`,
        proof: restart
          ? `A running sum of ${old} is negative: it can only drag the next element down. The best subarray ending at index ${i} never needs it.`
          : `A running sum of ${old} is not negative, so carrying it along never makes the sum smaller than starting fresh.`,
        predict,
      });
    }

    if (restart) {
      cur = x;
      start = i;
    } else {
      cur = ext;
    }
    endings.push(cur);
    const prevBest = best;
    const isBest = cur > best;
    if (isBest) {
      best = cur;
      bestL = start;
      bestR = i;
    }

    steps.push({
      line: restart ? 5 : 7,
      array: [...arr],
      pointers: ptrs(i),
      partitions: [{ from: start, to: i, tone: "mid", label: `current = ${cur}` }],
      badges: [
        restart
          ? { index: i, text: "new", tone: "rose" as const }
          : { index: i, text: badgeAdd(x), tone: "mint" as const },
      ],
      highlight: ring(),
      secondary: strip(),
      status: restart
        ? `current_sum = ${cur}  (restart)`
        : `current_sum = ${old} ${addTerm(x)} = ${cur}  (extend)`,
      narration: askAt.has(i)
        ? restart
          ? `Restart at index ${i}: current_sum = ${cur}, and the subarray now begins here.`
          : `Extend: current_sum = ${cur}, and the subarray stays [${start}..${i}].`
        : restart
          ? `${old} ${addTerm(x)} = ${ext} is less than ${x} alone, so the old subarray only drags us down. Restart at index ${i}: current_sum = ${cur}.`
          : `Extend: current_sum = ${old} ${addTerm(x)} = ${cur}, so the subarray is now [${start}..${i}].`,
      proof:
        i === 1 && !askAt.has(i)
          ? "The best subarray ending at i either is arr[i] alone or extends the best one ending at i − 1. One number carries all the history we need."
          : undefined,
    });

    if (isBest) {
      steps.push({
        line: 8,
        lineEnd: 9,
        array: [...arr],
        pointers: ptrs(i),
        partitions: [{ from: bestL, to: bestR, tone: "mid", label: `best = ${best}` }],
        highlight: ring(),
        secondary: strip(),
        status: `best_sum = ${best}`,
        narration: `${cur} beats the old best (${prevBest}): new best_sum = ${best} on [${bestL}..${bestR}].`,
      });
    }
  }

  steps.push({
    line: 10,
    array: [...arr],
    pointers: [],
    partitions: [{ from: bestL, to: bestR, tone: "mid", label: `best = ${best}` }],
    highlight: ring(),
    secondary: strip(),
    status: `return ${best}`,
    narration: `Return ${best}: the sum of arr[${bestL}..${bestR}]. The green ring in the row below marks the index where that best subarray ends.`,
    proof:
      "One pass and two variables. Trying every subarray would be O(n²), or O(n³) if you re-add each one.",
  });
  return steps;
}

export const kadane: LessonBuilder<Inputs> = {
  slug: "max-subarray",
  title: "Kadane's — Max Subarray Sum",
  subtitle: "At each index, decide: extend the current subarray or restart fresh.",
  problem:
    "Given an integer array, return the largest sum achievable by any contiguous non-empty subarray.",
  spotIt: [
    "'Maximum sum contiguous subarray' or any variant ('circular', 'with one deletion').",
    "Array contains negatives — otherwise the answer is just the total sum.",
    "Interviewer asks for O(n) and O(1) space.",
  ],
  avoidWhen: [
    "You need the actual indices and the problem disallows extra state — be careful with bookkeeping.",
    "Subarrays don't have to be contiguous — switch to DP on subsets or greedy.",
    "Aggregation is product, not sum — use the product-subarray variant.",
  ],
  practiceLadder,
  variant: "kadane",
  view: "array",
  code,
  defaultInputs: { arr: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
  inputs: [{ key: "arr", label: "Array", kind: "intArray" }],
  validate: ({ arr }) => {
    const w: string[] = [];
    if (arr.length === 0) w.push("Array is empty.");
    if (arr.length > 0 && arr.every((v) => v < 0))
      w.push("All negatives — the answer is the single largest element.");
    return w;
  },
  build,
};
