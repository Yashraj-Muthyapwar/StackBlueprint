import type { BitRow, LessonBuilder, PracticeProblem, Prediction, Step } from "../types";
import { bitWidth, labelledOptions, numberOptions, span, spreadIndices, termsExpr } from "./shared";

type Inputs = { arr: number[]; queries: [number, number][] };

/** Predict mode asks at most this many "what goes in the next chip?" questions while building. */
const MAX_BUILD_PREDICTIONS = 3;
/** ...and at most this many while answering queries. The first one is always "which operation?". */
const MAX_QUERY_PREDICTIONS = 3;

const practiceLadder: PracticeProblem[] = [
  {
    name: "Decode XORed Array",
    difficulty: "easy",
    hint: "The build phase run backwards. XOR is its own inverse, so arr[i + 1] = encoded[i] ^ arr[i]. Say out loud why that works.",
    link: "https://leetcode.com/problems/decode-xored-array/",
  },
  {
    name: "XOR Queries of a Subarray",
    difficulty: "medium",
    hint: "This exact pattern. prefix[right + 1] ^ prefix[left], with the leading 0 slot so left = 0 needs no special case.",
    link: "https://leetcode.com/problems/xor-queries-of-a-subarray/",
  },
  {
    name: "Maximum XOR for Each Query",
    difficulty: "medium",
    hint: "XOR of the whole array is a prefix. Removing the last element is one more XOR. The best k flips every bit that is 0 in that value.",
    link: "https://leetcode.com/problems/maximum-xor-for-each-query/",
  },
  {
    name: "Count Triplets That Can Form Two Arrays of Equal XOR",
    difficulty: "medium",
    hint: "a == b means the XOR of arr[i..k] is 0, which means prefix[i] == prefix[k + 1]. Every j between i and k works, so each equal pair contributes k − i triplets.",
    link: "https://leetcode.com/problems/count-triplets-that-can-form-two-arrays-of-equal-xor/",
  },
  {
    name: "Can Make Palindrome from Substring",
    difficulty: "medium",
    hint: "Prefix XOR over bitmasks: toggle bit (c − 'a') per letter. XOR of two prefix masks is the parity of every letter in the substring. Count the odd bits.",
    link: "https://leetcode.com/problems/can-make-palindrome-from-substring/",
  },
  {
    name: "Find the Longest Substring Containing Vowels in Even Counts",
    difficulty: "medium",
    hint: "A 5-bit parity mask as the running prefix XOR. Two equal masks bound a substring with all-even vowel counts. Store the first index of each mask.",
    link: "https://leetcode.com/problems/find-the-longest-substring-containing-vowels-in-even-counts/",
  },
  {
    name: "Number of Wonderful Substrings",
    difficulty: "medium",
    hint: "Same parity mask over 10 letters, but now at most one bit may be odd: count the mask itself plus the 10 masks that differ in exactly one bit.",
    link: "https://leetcode.com/problems/number-of-wonderful-substrings/",
  },
  {
    name: "Find Kth Largest XOR Coordinate Value",
    difficulty: "medium",
    hint: "Take this to 2D: the prefix XOR matrix uses the same inclusion–exclusion as 2D prefix sums, with XOR in place of + and −. Then pick the kth largest.",
    link: "https://leetcode.com/problems/find-kth-largest-xor-coordinate-value/",
  },
];

// 1-based line numbers, matching the code pane.
const code = `def build_prefix_xor(arr):
    prefix_xor = [0] * (len(arr) + 1)
    for i, v in enumerate(arr):
        prefix_xor[i + 1] = prefix_xor[i] ^ v
    return prefix_xor

def range_xor(prefix_xor, left, right):  # inclusive
    return prefix_xor[right + 1] ^ prefix_xor[left]`;

const TRACK_LABEL = "prefix_xor[j] = XOR of every cell left of boundary j";

function build({ arr, queries }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({
      line: 2,
      array: [],
      narration: "The array is empty, so there is nothing to XOR.",
    });
    return steps;
  }

  // Precompute so the binary width can cover every value that will ever appear on screen.
  const full: number[] = [0];
  for (let i = 0; i < n; i++) full.push(full[i] ^ arr[i]);
  const W = bitWidth([...arr, ...full]);
  const bin = (x: number) => x.toString(2).padStart(W, "0");
  const bitsView = (rows: BitRow[]) => (W > 0 ? { width: W, rows } : undefined);

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
    status: `prefix_xor has ${n + 1} slots,  prefix_xor[0] = 0`,
    narration: `Make n + 1 = ${n + 1} slots. Slot 0 holds 0, the XOR of zero elements. Slot j sits on the boundary just before arr[j] and will hold the XOR of everything to its left.`,
    proof:
      "0 is the identity for XOR: x ^ 0 = x. That is what lets every range use one formula, including ranges that start at index 0.",
  });

  // ---------------------------------------------------------------- build
  const askBuild = spreadIndices(n, MAX_BUILD_PREDICTIONS);
  let asked = 0;
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    const old = P[i] as number;
    const nw = old ^ v;
    const badges = [{ index: i, text: `^${v}`, tone: "mint" as const }];
    const behind =
      i > 0
        ? [{ from: 0, to: i - 1, tone: "low" as const, label: `prefix_xor[${i}] = ${old}` }]
        : [];

    if (askBuild.has(i)) {
      asked += 1;
      const predict: Prediction = {
        question: `prefix_xor[${i}] = ${old} is the XOR of everything left of index ${i}, and arr[${i}] = ${v}. What goes into prefix_xor[${i + 1}]?`,
        // The sum is the most tempting wrong answer: it looks right whenever no bits overlap.
        options: numberOptions(nw, [old + v, old | v, old & v], asked),
        answer: String(nw),
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
          { index: i, tone: "amber", sign: "^" },
          { index: i + 1, tone: "violet" },
        ]),
        bits: bitsView([
          { label: `prefix_xor[${i}]`, value: old, tone: "amber" },
          { label: `arr[${i}]`, value: v, op: "^", tone: "mint" },
          { label: `prefix_xor[${i + 1}]`, value: null, result: true },
        ]),
        status: `prefix_xor[${i}] = ${old},  arr[${i}] = ${v}`,
        narration: `prefix_xor[${i}] already holds ${old}. XOR in arr[${i}] = ${v}: ${old} ^ ${v} = ${nw}.`,
        proof:
          "XOR is associative, so the XOR of arr[0..i] can be built one element at a time, exactly like a running sum.",
        predict,
      });
    }

    P[i + 1] = nw;
    steps.push({
      line: 4,
      array: [...arr],
      pointers: [{ name: "i", index: i, color: "mint" }],
      partitions: [{ from: 0, to: i, tone: "mid", label: `prefix_xor[${i + 1}] = ${nw}` }],
      highlight: { kind: "match", indices: [i] },
      badges,
      track: track([
        { index: i, tone: "amber", sign: "^" },
        { index: i + 1, tone: "mint" },
      ]),
      bits: bitsView([
        { label: `prefix_xor[${i}]`, value: old, tone: "amber" },
        { label: `arr[${i}]`, value: v, op: "^", tone: "mint" },
        { label: `prefix_xor[${i + 1}]`, value: nw, result: true, tone: "violet" },
      ]),
      status: `prefix_xor[${i + 1}] = prefix_xor[${i}] ^ ${v} = ${nw}`,
      narration:
        W > 0
          ? `${old} ^ ${v} = ${nw}. In binary ${bin(old)} ^ ${bin(v)} = ${bin(nw)}: a result bit is 1 only where the two bits differ.`
          : `prefix_xor[${i + 1}] = ${old} ^ ${v} = ${nw}.`,
      proof:
        i === 0
          ? "The sentinel 0 makes the first step follow the same rule as every other step: prefix_xor[1] = 0 ^ arr[0] = arr[0]."
          : i === n - 1
            ? `prefix_xor[${n}] is the XOR of the whole array.`
            : undefined,
    });
  }

  steps.push({
    line: 5,
    array: [...arr],
    pointers: [],
    partitions: [{ from: 0, to: n - 1, tone: "mid", label: `all = ${P[n]}` }],
    track: track(),
    status: "return prefix_xor",
    narration: `All ${n + 1} chips are filled after ${n} XORs. From here on, arr is never touched again.`,
    proof: "Building costs O(n) once. Every query after that is O(1).",
  });

  // ---------------------------------------------------------------- queries
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
    const ans = Y ^ X;
    const len = right - left + 1;
    const cells = arr.slice(left, right + 1);

    const ptrs = [
      { name: "left", index: left, color: "mint" as const },
      { name: "right", index: right, color: "amber" as const },
    ];
    const marks = [
      { index: left, tone: "rose" as const, sign: "^" },
      { index: hi, tone: "mint" as const, sign: "^" },
    ];
    const cut =
      left > 0
        ? [{ from: 0, to: left - 1, tone: "high" as const, label: `prefix_xor[${left}] = ${X}` }]
        : [];
    const dimmed = span(hi, n - hi);

    if (askedQuery < MAX_QUERY_PREDICTIONS) {
      askedQuery += 1;
      if (askedQuery === 1) {
        const { options, answer } = labelledOptions(
          [
            `prefix_xor[${hi}] ^ prefix_xor[${left}]`,
            `prefix_xor[${hi}] − prefix_xor[${left}]`,
            `prefix_xor[${hi}] + prefix_xor[${left}]`,
            `prefix_xor[${hi}] & prefix_xor[${left}]`,
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
          status: `range XOR of arr[${left}..${right}]`,
          narration: `The chip at boundary ${hi} is the XOR of arr[0..${right}], and the chip at boundary ${left} is the XOR of arr[0..${left - 1}]. Combine them with XOR: the shared part cancels.`,
          proof:
            "Subtraction undoes addition, but it does not undo XOR. What undoes XOR is XOR itself, because x ^ x = 0. That one fact is the whole trick.",
          predict: {
            question: `We want the XOR of arr[${left}..${right}] (inclusive). Which operation combines the two prefix chips?`,
            options,
            answer,
            line: 7,
          },
        });
      } else {
        const predict: Prediction = {
          question: `prefix_xor[${hi}] = ${Y} and prefix_xor[${left}] = ${X}. What is the XOR of arr[${left}..${right}]?`,
          // Subtraction and sum are what a prefix-sum habit suggests; AND is the other classic slip.
          options: numberOptions(ans, [Y - X, Y + X, Y & X], askedQuery),
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
          bits: bitsView([
            { label: `prefix_xor[${hi}]`, value: Y, tone: "mint" },
            { label: `prefix_xor[${left}]`, value: X, op: "^", tone: "rose" },
            { label: "range XOR", value: null, result: true },
          ]),
          secondary: answersStrip(),
          status: `prefix_xor[${hi}] = ${Y},  prefix_xor[${left}] = ${X}`,
          narration: `The two chips are ${Y} and ${X}: ${Y} ^ ${X} = ${ans}.`,
          predict,
        });
      }
    }

    answers.push(ans);
    steps.push({
      line: 8,
      array: [...arr],
      pointers: ptrs,
      partitions: [...cut, { from: left, to: right, tone: "mid", label: `xor = ${ans}` }],
      highlight: { kind: "match", indices: span(left, len) },
      dimmed,
      track: track(marks),
      bits: bitsView([
        { label: `prefix_xor[${hi}]`, value: Y, tone: "mint" },
        { label: `prefix_xor[${left}]`, value: X, op: "^", tone: "rose" },
        { label: `arr[${left}..${right}]`, value: ans, result: true, tone: "violet" },
      ]),
      secondary: answersStrip(),
      status: `prefix_xor[${hi}] ^ prefix_xor[${left}] = ${Y} ^ ${X} = ${ans}`,
      narration: `${Y} ^ ${X} = ${ans}. Check by hand: ${termsExpr(cells, "^")} = ${ans}, but that took ${len - 1} XOR${len - 1 === 1 ? "" : "s"}. The chips took one.`,
      proof:
        left === 0
          ? `prefix_xor[${hi}] is the XOR of arr[0..${right}]. prefix_xor[0] = 0 and x ^ 0 = x, so the answer is just that chip: the sentinel at work.`
          : `prefix_xor[${hi}] = prefix_xor[${left}] ^ (arr[${left}] ^ … ^ arr[${right}]). XOR it with prefix_xor[${left}] again: that part now appears twice and x ^ x = 0, so it cancels and only arr[${left}..${right}] is left.`,
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
        ? `${n} XORs to build,  ${validCount} query${validCount === 1 ? "" : "ies"} at O(1)`
        : "built, no valid queries",
    narration:
      validCount > 0
        ? `Done. ${n} XORs built the chips once, then each of the ${validCount} quer${validCount === 1 ? "y was" : "ies were"} a single XOR.`
        : "The prefix array is built, but none of the queries were valid. Edit them above and run again.",
    proof:
      "XOR-ing a range directly costs up to n per query, O(n·q) overall. With prefix XOR it is O(n + q). The same cancellation also powers 'count subarrays with XOR equal to K': equal prefix values bound a subarray whose XOR is 0.",
  });
  return steps;
}

export const prefixXor: LessonBuilder<Inputs> = {
  slug: "prefix-xor",
  title: "Prefix XOR",
  subtitle: "XOR is its own inverse — range XOR becomes pre[r+1] ^ pre[l].",
  problem:
    "Given an array, answer range XOR queries [left, right] in O(1) using a prefix XOR array.",
  spotIt: [
    "Range XOR queries, or 'count subarrays with XOR equal to K'.",
    "Problems involving toggling bits, parity, or 'find the odd one out' over ranges.",
    "Need O(1) per query and XOR is the aggregation.",
  ],
  avoidWhen: [
    "Aggregation is sum / product / min — different prefix structure.",
    "Elements can change between queries — use a Fenwick tree over XOR.",
    "Problem is about bitwise AND / OR over ranges (those aren't invertible).",
  ],
  practiceLadder,
  variant: "prefix-xor",
  view: "array",
  code,
  defaultInputs: {
    arr: [4, 2, 1, 3, 5, 7],
    queries: [
      [1, 3],
      [0, 5],
      [2, 4],
    ],
  },
  inputs: [
    { key: "arr", label: "Array (non-negative ints)", kind: "intArray" },
    {
      key: "queries",
      label: "Queries (left,right pairs)",
      kind: "intPairs",
      help: "inclusive · `0,3; 1,4`",
    },
  ],
  validate: ({ arr, queries }) => {
    const w: string[] = [];
    if (arr.some((v) => !Number.isInteger(v)))
      w.push("XOR needs whole numbers, so decimals are truncated in this demo.");
    if (arr.some((v) => v < 0))
      w.push(
        "XOR is shown for non-negative ints in this demo, so the binary view is hidden for negatives.",
      );
    for (const [left, right] of queries) {
      if (left < 0 || right >= arr.length || left > right) {
        w.push(`Query [${left}, ${right}] is out of bounds for length ${arr.length}.`);
      }
    }
    return w;
  },
  build,
};
