import type { LessonBuilder, PracticeProblem, Prediction, Step } from "../types";
import {
  addTerm,
  badgeAdd,
  labelledOptions,
  numberOptions,
  span,
  spreadIndices,
  termsExpr,
} from "./shared";

type Inputs = { arr: number[]; queries: [number, number][] };

/** Predict mode asks at most this many "what goes in the next chip?" questions while building. */
const MAX_BUILD_PREDICTIONS = 3;
/** ...and at most this many while answering queries. The first one is always the "which two chips?" question. */
const MAX_QUERY_PREDICTIONS = 3;

const practiceLadder: PracticeProblem[] = [
  {
    name: "Running Sum of 1d Array",
    difficulty: "easy",
    hint: "Just the build phase. Write the recurrence prefix[i+1] = prefix[i] + arr[i] before you write any code.",
    link: "https://leetcode.com/problems/running-sum-of-1d-array/",
  },
  {
    name: "Range Sum Query - Immutable",
    difficulty: "easy",
    hint: "This exact pattern. Allocate n + 1 slots so that left = 0 needs no special case.",
    link: "https://leetcode.com/problems/range-sum-query-immutable/",
  },
  {
    name: "Find Pivot Index",
    difficulty: "easy",
    hint: "Left sum is prefix[i]. Right sum is total − prefix[i + 1]. The pivot is where they match.",
    link: "https://leetcode.com/problems/find-pivot-index/",
  },
  {
    name: "Subarray Sum Equals K",
    difficulty: "medium",
    hint: "prefix[j] − prefix[i] = k means prefix[i] = prefix[j] − k. You never need the whole prefix array, just a hash map of prefix sums seen so far.",
    link: "https://leetcode.com/problems/subarray-sum-equals-k/",
  },
  {
    name: "Contiguous Array",
    difficulty: "medium",
    hint: "Turn every 0 into −1. A balanced subarray now has sum 0, so two equal prefix sums bound it. Store the first index of each prefix sum.",
    link: "https://leetcode.com/problems/contiguous-array/",
  },
  {
    name: "Subarray Sums Divisible by K",
    difficulty: "medium",
    hint: "Two prefix sums with the same remainder mod k bound a subarray whose sum is divisible by k. Count equal remainders, and normalise negative remainders.",
    link: "https://leetcode.com/problems/subarray-sums-divisible-by-k/",
  },
  {
    name: "Product of Array Except Self",
    difficulty: "medium",
    hint: "Prefix works for products too: prefix product from the left times suffix product from the right. No division allowed, so two passes.",
    link: "https://leetcode.com/problems/product-of-array-except-self/",
  },
  {
    name: "Shortest Subarray with Sum at Least K",
    difficulty: "hard",
    hint: "Negative numbers break sliding window. Use prefix sums, then a monotonic deque of prefix indices to find the closest valid left edge.",
    link: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/",
  },
];

// 1-based line numbers, matching the code pane.
const code = `def build_prefix_sum(arr):
    prefix_sum = [0] * (len(arr) + 1)
    for i, v in enumerate(arr):
        prefix_sum[i + 1] = prefix_sum[i] + v
    return prefix_sum

def range_sum(prefix_sum, left, right):  # inclusive
    return prefix_sum[right + 1] - prefix_sum[left]`;

const TRACK_LABEL = "prefix_sum[j] = sum of every cell left of boundary j";

function build({ arr, queries }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({
      line: 2,
      array: [],
      narration: "The array is empty, so there is nothing to sum.",
    });
    return steps;
  }

  // P[j] is null until it has been computed, so the track visibly fills in left to right.
  const P: (number | null)[] = new Array(n + 1).fill(null);
  P[0] = 0;
  const track = (marks: NonNullable<Step["track"]>["marks"] = []) => ({
    label: TRACK_LABEL,
    values: [...P],
    marks,
  });

  const answers: number[] = [];
  const answersStrip = () =>
    answers.length > 0 ? { label: "query answers, in order", array: [...answers] } : undefined;

  // ---------------------------------------------------------------- allocate
  steps.push({
    line: 2,
    array: [...arr],
    pointers: [],
    track: track([{ index: 0, tone: "violet" }]),
    status: `prefix_sum has ${n + 1} slots,  prefix_sum[0] = 0`,
    narration: `Make n + 1 = ${n + 1} slots. Slot 0 holds 0, the sum of zero elements. Slot j sits on the boundary just before arr[j], and will hold the sum of everything to its left.`,
    proof:
      "That extra leading 0 is what lets every range use the same formula. A range starting at index 0 subtracts prefix_sum[0] = 0, so it needs no special case.",
  });

  // ---------------------------------------------------------------- build
  const askBuild = spreadIndices(n, MAX_BUILD_PREDICTIONS);
  let asked = 0;
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    const old = P[i] as number;
    const nw = old + v;
    const badges = [{ index: i, text: badgeAdd(v), tone: "mint" as const }];
    const behind =
      i > 0
        ? [{ from: 0, to: i - 1, tone: "low" as const, label: `prefix_sum[${i}] = ${old}` }]
        : [];

    if (askBuild.has(i)) {
      asked += 1;
      const predict: Prediction = {
        question: `prefix_sum[${i}] = ${old} is the sum of everything left of index ${i}, and arr[${i}] = ${v}. What goes into prefix_sum[${i + 1}]?`,
        options: numberOptions(nw, [v, old, old - v], asked),
        answer: String(nw),
        // While the question is open, highlight the loop header, not the update formula.
        line: 3,
      };
      steps.push({
        line: 4,
        array: [...arr],
        pointers: [{ name: "i", index: i, color: "mint" }],
        partitions: behind,
        highlight: { kind: "compare", indices: [i] },
        badges,
        track: track([
          { index: i, tone: "amber", sign: "+" },
          { index: i + 1, tone: "violet" },
        ]),
        status: `prefix_sum[${i}] = ${old},  arr[${i}] = ${v}`,
        narration: `prefix_sum[${i}] already holds ${old}, the sum of everything left of index ${i}. Add arr[${i}] = ${v}: ${old} ${addTerm(v)} = ${nw}.`,
        proof:
          "Each chip reuses the one before it, so the old elements are never added again. One addition per cell: O(n) to build, not O(n²).",
        predict,
      });
    }

    P[i + 1] = nw;
    steps.push({
      line: 4,
      array: [...arr],
      pointers: [{ name: "i", index: i, color: "mint" }],
      partitions: [{ from: 0, to: i, tone: "mid", label: `prefix_sum[${i + 1}] = ${nw}` }],
      highlight: { kind: "match", indices: [i] },
      badges,
      track: track([
        { index: i, tone: "amber", sign: "+" },
        { index: i + 1, tone: "mint" },
      ]),
      status: `prefix_sum[${i + 1}] = prefix_sum[${i}] + ${v} = ${nw}`,
      narration: askBuild.has(i)
        ? `prefix_sum[${i + 1}] = ${old} ${addTerm(v)} = ${nw}. The new chip covers arr[0..${i}].`
        : `prefix_sum[${i + 1}] = prefix_sum[${i}] + arr[${i}] = ${old} ${addTerm(v)} = ${nw}. It covers arr[0..${i}].`,
      proof:
        i === 0
          ? "The sentinel 0 makes the first step follow the same rule as every other step: prefix_sum[1] = 0 + arr[0]."
          : i === n - 1
            ? `prefix_sum[${n}] is the total of the whole array.`
            : undefined,
    });
  }

  steps.push({
    line: 5,
    array: [...arr],
    pointers: [],
    partitions: [{ from: 0, to: n - 1, tone: "mid", label: `total = ${P[n]}` }],
    track: track(),
    status: `return prefix_sum`,
    narration: `All ${n + 1} chips are filled after ${n} additions. From here on, arr is never touched again: every question is answered from the chips.`,
    proof: "Building costs O(n) once. Every query after that is O(1).",
  });

  // ---------------------------------------------------------------- queries
  const full = P as number[];
  let validCount = 0;
  let askedQuery = 0;
  for (const [left, right] of queries) {
    if (left < 0 || right >= n || left > right) {
      steps.push({
        line: 7,
        array: [...arr],
        pointers: [],
        track: track(),
        secondary: answersStrip(),
        status: `invalid range [${left}, ${right}]`,
        narration: `Skip [${left}, ${right}]: it falls outside the array (valid indices are 0 to ${n - 1}).`,
      });
      continue;
    }
    validCount += 1;
    const hi = right + 1;
    const Y = full[hi];
    const X = full[left];
    const ans = Y - X;
    const len = right - left + 1;
    const cells = arr.slice(left, right + 1);

    const ptrs = [
      { name: "left", index: left, color: "mint" as const },
      { name: "right", index: right, color: "amber" as const },
    ];
    const marks = [
      { index: left, tone: "rose" as const, sign: "−" },
      { index: hi, tone: "mint" as const, sign: "+" },
    ];
    const cut =
      left > 0
        ? [{ from: 0, to: left - 1, tone: "high" as const, label: `prefix_sum[${left}] = ${X}` }]
        : [];
    const dimmed = span(hi, n - hi);

    // First query: pick the two chips. Later queries: compute from the two chips shown.
    if (askedQuery < MAX_QUERY_PREDICTIONS) {
      askedQuery += 1;
      if (askedQuery === 1) {
        const { options, answer } = labelledOptions(
          [
            `prefix_sum[${hi}] − prefix_sum[${left}]`,
            `prefix_sum[${right}] − prefix_sum[${left}]`,
            `prefix_sum[${hi}] − prefix_sum[${left + 1}]`,
            `prefix_sum[${hi}] + prefix_sum[${left}]`,
          ],
          askedQuery,
        );
        steps.push({
          line: 8,
          array: [...arr],
          pointers: ptrs,
          partitions: [{ from: left, to: right, tone: "mid", label: `arr[${left}..${right}]` }],
          highlight: { kind: "compare", indices: span(left, len) },
          track: track(),
          secondary: answersStrip(),
          status: `range sum of arr[${left}..${right}]`,
          narration: `The range starts at the left edge of arr[${left}] (boundary ${left}) and ends at the right edge of arr[${right}] (boundary ${hi}). Subtract the chip at boundary ${left} from the chip at boundary ${hi}.`,
          proof:
            "Counting boundaries is where off-by-one errors come from. The chip on boundary j is the sum of the j cells to its left, so the right edge of arr[right] is boundary right + 1, not right.",
          predict: {
            question: `We want the sum of arr[${left}..${right}] (inclusive). Which subtraction gives it?`,
            options,
            answer,
            line: 7,
          },
        });
      } else {
        const missRight = full[right] - X;
        const missLeft = Y - full[left + 1];
        const predict: Prediction = {
          question: `prefix_sum[${hi}] = ${Y} and prefix_sum[${left}] = ${X}. What is the sum of arr[${left}..${right}]?`,
          options: numberOptions(ans, [missRight, missLeft, Y + X], askedQuery),
          answer: String(ans),
          line: 7,
        };
        steps.push({
          line: 8,
          array: [...arr],
          pointers: ptrs,
          partitions: [{ from: left, to: right, tone: "mid", label: `arr[${left}..${right}]` }],
          highlight: { kind: "compare", indices: span(left, len) },
          dimmed,
          track: track(marks),
          secondary: answersStrip(),
          status: `prefix_sum[${hi}] = ${Y},  prefix_sum[${left}] = ${X}`,
          narration: `The two chips are ${Y} and ${X}: ${Y} − ${X} = ${ans}.`,
          predict,
        });
      }
    }

    answers.push(ans);
    steps.push({
      line: 8,
      array: [...arr],
      pointers: ptrs,
      partitions: [...cut, { from: left, to: right, tone: "mid", label: `sum = ${ans}` }],
      highlight: { kind: "match", indices: span(left, len) },
      dimmed,
      track: track(marks),
      secondary: answersStrip(),
      status: `prefix_sum[${hi}] − prefix_sum[${left}] = ${Y} − ${X} = ${ans}`,
      narration: `${Y} − ${X} = ${ans}. Check by hand: ${termsExpr(cells)} = ${ans}, but that took ${len - 1} addition${len - 1 === 1 ? "" : "s"}. The subtraction took one.`,
      proof:
        left === 0
          ? `prefix_sum[${hi}] counts arr[0..${right}]. prefix_sum[0] = 0 counts nothing, so there is nothing to cut off: the sentinel at work.`
          : `prefix_sum[${hi}] counts arr[0..${right}] and prefix_sum[${left}] counts arr[0..${left - 1}]. Everything left of index ${left} is in both, so it cancels and exactly arr[${left}..${right}] is left.`,
    });
  }

  steps.push({
    line: 8,
    array: [...arr],
    pointers: [],
    track: track(),
    secondary: answersStrip(),
    status:
      validCount > 0
        ? `${n} additions to build,  ${validCount} query${validCount === 1 ? "" : "ies"} at O(1)`
        : "built, no valid queries",
    narration:
      validCount > 0
        ? `Done. ${n} additions built the chips once, then each of the ${validCount} quer${validCount === 1 ? "y was" : "ies were"} a single subtraction.`
        : "The prefix array is built, but none of the queries were valid. Edit them above and run again.",
    proof:
      "Adding each range directly costs up to n per query, O(n·q) overall. With prefix sums it is O(n + q).",
  });
  return steps;
}

export const prefixSum: LessonBuilder<Inputs> = {
  slug: "prefix-sum",
  title: "Prefix Sum",
  subtitle: "Precompute running totals; any range sum becomes a single subtraction.",
  problem:
    "Given an array, preprocess it so that the sum of any range [left, right] can be answered in O(1) per query.",
  spotIt: [
    "Many range-sum queries on a static array.",
    "Problems like 'subarray sum equals K' or 'number of subarrays with sum divisible by K' (prefix + hash map).",
    "Editorial mentions O(1) per query after O(n) preprocessing.",
  ],
  avoidWhen: [
    "The array is frequently updated — use a Fenwick tree / segment tree.",
    "You need range min / max / gcd, not sum — prefix sums don't apply.",
    "Only a single query: just iterate, skip preprocessing.",
  ],
  practiceLadder,
  variant: "prefix-sum",
  view: "array",
  code,
  defaultInputs: {
    arr: [3, 1, 4, 1, 5, 9, 2, 6],
    queries: [
      [1, 4],
      [0, 7],
      [3, 5],
    ],
  },
  inputs: [
    { key: "arr", label: "Array", kind: "intArray" },
    {
      key: "queries",
      label: "Queries (left,right pairs)",
      kind: "intPairs",
      help: "inclusive · `0,3; 1,4`",
    },
  ],
  validate: ({ arr, queries }) => {
    const w: string[] = [];
    for (const [left, right] of queries) {
      if (left < 0 || right >= arr.length || left > right) {
        w.push(`Query [${left}, ${right}] is out of bounds for length ${arr.length}.`);
      }
    }
    return w;
  },
  build,
};
