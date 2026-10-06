import type { LessonBuilder, PracticeProblem, Prediction, Step } from "../types";
import { numberOptions, span } from "../prefix/shared";

type Inputs = { arr: number[] };

/** Predict mode asks at most this many "what is the new max_prod?" questions. */
const MAX_PREDICTIONS = 4;

const practiceLadder: PracticeProblem[] = [
  {
    name: "Maximum Subarray",
    difficulty: "medium",
    hint: "The sum version. Make sure 'extend or restart' feels automatic before adding the sign problem on top.",
    link: "https://leetcode.com/problems/maximum-subarray/",
  },
  {
    name: "Maximum Product Subarray",
    difficulty: "medium",
    hint: "This exact pattern. Why does keeping only max_prod fail on [2, −5, −2, −4, 3]? Trace it by hand.",
    link: "https://leetcode.com/problems/maximum-product-subarray/",
  },
  {
    name: "Maximum Length of Subarray With Positive Product",
    difficulty: "medium",
    hint: "Same two-state idea, but track lengths instead of products: the longest run ending here with a positive product, and with a negative one.",
    link: "https://leetcode.com/problems/maximum-length-of-subarray-with-positive-product/",
  },
  {
    name: "Subarray Product Less Than K",
    difficulty: "medium",
    hint: "All values are positive here, so the product only grows as the window grows. That makes it a sliding window, not Kadane.",
    link: "https://leetcode.com/problems/subarray-product-less-than-k/",
  },
  {
    name: "Product of Array Except Self",
    difficulty: "medium",
    hint: "Prefix products from the left times suffix products from the right. Zeros are the trap, just like they are here.",
    link: "https://leetcode.com/problems/product-of-array-except-self/",
  },
  {
    name: "Maximum Sum Circular Subarray",
    difficulty: "medium",
    hint: "Back to sums, but you now need both a max and a min running state, the same pairing you just practised.",
    link: "https://leetcode.com/problems/maximum-sum-circular-subarray/",
  },
];

// 1-based line numbers, matching the code pane.
const code = `def max_product(arr):
    best = max_prod = min_prod = arr[0]
    for i in range(1, len(arr)):
        x = arr[i]
        choices = (x, max_prod * x, min_prod * x)
        max_prod = max(choices)
        min_prod = min(choices)
        best = max(best, max_prod)
    return best`;

function build({ arr }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (n === 0) {
    steps.push({
      line: 1,
      array: [],
      pointers: [],
      narration: "The array is empty, so there is no product.",
    });
    return steps;
  }

  // Dry run: which steps are "interesting", i.e. the new max did NOT come from plain max_prod * x.
  const interesting: number[] = [];
  const plain: number[] = [];
  {
    let mx = arr[0];
    let mn = arr[0];
    for (let i = 1; i < n; i++) {
      const x = arr[i];
      const c = [mx * x, mn * x, x];
      const nmx = Math.max(...c);
      (nmx === mx * x ? plain : interesting).push(i);
      mn = Math.min(...c);
      mx = nmx;
    }
  }
  const askAt = new Set([
    ...interesting.slice(0, MAX_PREDICTIONS - Math.min(1, plain.length)),
    ...plain.slice(0, 1),
  ]);

  let maxP = arr[0];
  let minP = arr[0];
  let maxStart = 0;
  let minStart = 0;
  let best = arr[0];
  let bestL = 0;
  let bestR = 0;
  // Per-index rows: best / worst product of a subarray ending exactly at that index.
  const maxRow: number[] = [maxP];
  const minRow: number[] = [minP];

  const ptrs = (i: number) => [
    { name: "i", index: i, color: "amber" as const },
    { name: "min", index: minStart, color: "rose" as const, placement: "below" as const },
  ];
  const ring = () => ({ kind: "match" as const, indices: span(bestL, bestR - bestL + 1) });
  const rows = () => ({
    secondary: {
      label: "max_prod for subarrays ending at each index",
      array: [...maxRow],
      highlight: { kind: "match" as const, indices: [bestR] },
    },
    secondary2: {
      label: "min_prod for subarrays ending at each index",
      array: [...minRow],
      highlight: { kind: "swap" as const, indices: [minRow.length - 1] },
    },
  });

  steps.push({
    line: 2,
    array: [...arr],
    pointers: ptrs(0),
    partitions: [{ from: 0, to: 0, tone: "mid", label: `max = ${maxP}` }],
    highlight: ring(),
    ...rows(),
    status: `max_prod = ${maxP},  min_prod = ${minP},  best = ${best}`,
    narration: `Start with the first element. The only subarray ending at index 0 is [${arr[0]}], so max_prod, min_prod and best all start at ${arr[0]}.`,
    proof:
      "A sum can only grow or shrink predictably. A product can flip sign, so we remember the largest AND the smallest product ending at each index.",
  });

  let asked = 0;
  for (let i = 1; i < n; i++) {
    const x = arr[i];
    const oldMax = maxP;
    const oldMin = minP;
    const candidates = [
      { label: "max_prod × x", value: oldMax * x, start: maxStart },
      { label: "min_prod × x", value: oldMin * x, start: minStart },
      { label: "x alone", value: x, start: i },
    ];
    // First-listed wins ties, so extending is preferred over restarting.
    const top = candidates.reduce((a, b) => (b.value > a.value ? b : a));
    const low = candidates.reduce((a, b) => (b.value < a.value ? b : a));
    const newMax = top.value;
    const newMin = low.value;

    if (askAt.has(i)) {
      asked += 1;
      const predict: Prediction = {
        question: `max_prod = ${oldMax}, min_prod = ${oldMin}, and arr[${i}] = ${x}. What is the new max_prod?`,
        // The tempting slip is max_prod × x alone, as if this were the sum version.
        options: numberOptions(newMax, [oldMax * x, x, oldMin * x], asked),
        answer: String(newMax),
        line: 4,
      };
      steps.push({
        line: 5,
        array: [...arr],
        pointers: ptrs(i),
        partitions: [{ from: maxStart, to: i - 1, tone: "mid", label: `max = ${oldMax}` }],
        highlight: ring(),
        ...rows(),
        status: `max_prod = ${oldMax},  min_prod = ${oldMin},  x = ${x}`,
        narration: `The three choices are x = ${x}, max_prod × x = ${oldMax * x}, and min_prod × x = ${oldMin * x}. The largest is ${newMax} (${top.label}), the smallest is ${newMin} (${low.label}).`,
        proof:
          x < 0
            ? `x is negative, so it flips signs: the smallest running product (${oldMin}) times x becomes a candidate for the LARGEST. That is why min_prod has to be remembered.`
            : x === 0
              ? "A zero wipes out every product that passes through it, so both choices collapse to 0 and the next element starts fresh."
              : "x is positive, so it keeps the signs and the bigger running product stays bigger. Both choices still have to be compared with x alone.",
        predict,
      });
    }

    maxP = newMax;
    minP = newMin;
    // A zero product has no meaningful start, so restart the band at i.
    maxStart = newMax === 0 ? i : top.start;
    minStart = newMin === 0 ? i : low.start;
    maxRow.push(maxP);
    minRow.push(minP);
    const prevBest = best;
    const isBest = maxP > best;
    if (isBest) {
      best = maxP;
      bestL = maxStart;
      bestR = i;
    }

    const flipped = x < 0 && top.label === "min_prod × x";
    steps.push({
      line: 6,
      lineEnd: isBest ? 8 : 7,
      array: [...arr],
      pointers: ptrs(i),
      partitions: [{ from: maxStart, to: i, tone: "mid", label: `max = ${maxP}` }],
      badges: [{ index: i, text: `×${x}`, tone: "violet" as const }],
      highlight: ring(),
      ...rows(),
      status: `max_prod = ${maxP},  min_prod = ${minP},  best = ${best}`,
      narration:
        (askAt.has(i)
          ? `max_prod = ${maxP}, from ${top.label}. min_prod = ${minP}, from ${low.label}. `
          : `Choices ${x}, ${oldMax * x}, ${oldMin * x}: max_prod = ${maxP} (${top.label}), min_prod = ${minP} (${low.label}). `) +
        (flipped ? "The negative x flipped the old minimum into the new maximum. " : "") +
        (isBest
          ? `${maxP} beats the old best (${prevBest}): new best on [${bestL}..${bestR}].`
          : `best stays ${best}.`),
      proof:
        flipped && !askAt.has(i)
          ? "A negative times the most negative running product is the biggest positive one. A max-only Kadane would miss this."
          : undefined,
    });
  }

  steps.push({
    line: 9,
    array: [...arr],
    pointers: [],
    partitions: [{ from: bestL, to: bestR, tone: "mid", label: `best = ${best}` }],
    highlight: ring(),
    ...rows(),
    status: `return ${best}`,
    narration: `Return ${best}: the product of arr[${bestL}..${bestR}].`,
    proof:
      "One pass, three variables. The trick is tracking both ends: the smallest product today may be the largest tomorrow.",
  });
  return steps;
}

export const maxProduct: LessonBuilder<Inputs> = {
  slug: "max-product-subarray",
  title: "Max Product Subarray",
  subtitle: "A negative flips signs — keep both the running max and the running min.",
  problem:
    "Given an integer array, return the largest product achievable by any contiguous non-empty subarray.",
  spotIt: [
    "'Maximum product of a contiguous subarray' with negatives and zeros in the input.",
    "Sign can flip — you need to track both running max and running min.",
    "Brute force is O(n²); interviewer wants O(n).",
  ],
  avoidWhen: [
    "Array is all non-negative — a simple running product or sliding window suffices.",
    "You need product over arbitrary subsequences — this is DP, not Kadane.",
    "Overflow is a hard constraint — use logs or big integers instead.",
  ],
  practiceLadder,
  variant: "max-product",
  view: "array",
  code,
  defaultInputs: { arr: [2, 3, -2, 4, -1, 2] },
  inputs: [{ key: "arr", label: "Array", kind: "intArray" }],
  validate: ({ arr }) => (arr.length === 0 ? ["Array is empty."] : []),
  build,
};
