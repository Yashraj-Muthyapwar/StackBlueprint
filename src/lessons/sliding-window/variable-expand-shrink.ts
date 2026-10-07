import type { LessonBuilder, PracticeProblem, Prediction, Step } from "../types";

type Inputs = { arr: number[]; target: number };

/** Predict mode asks at most this many questions, so a long array doesn't become a chore. */
const MAX_PREDICTIONS = 4;

const practiceLadder: PracticeProblem[] = [
  { name: "Minimum Size Subarray Sum", difficulty: "medium", hint: "The mirror image of this lesson: shrink while the window is still VALID, recording the length each time before you drop an element.", link: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
  { name: "Longest Substring Without Repeating Characters", difficulty: "medium", hint: "The 'sum' becomes a set (or count map). Shrink from the left until the character you just added is no longer a duplicate.", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { name: "Max Consecutive Ones III", difficulty: "medium", hint: "Track how many zeros are in the window. Shrink whenever that count passes k.", link: "https://leetcode.com/problems/max-consecutive-ones-iii/" },
  { name: "Fruit Into Baskets", difficulty: "medium", hint: "At most two distinct values in the window. Keep a count map and drop keys that reach zero.", link: "https://leetcode.com/problems/fruit-into-baskets/" },
  { name: "Longest Repeating Character Replacement", difficulty: "medium", hint: "Window length minus the count of its most common letter is the number of replacements needed. Shrink when it exceeds k.", link: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
  { name: "Minimum Window Substring", difficulty: "hard", hint: "Expand until the window covers every needed character, then shrink while it still does. Record the best window at each valid moment.", link: "https://leetcode.com/problems/minimum-window-substring/" },
];

const code = `def longest_subarray_at_most(arr, target):
    left = 0
    window_sum = 0
    best = 0
    for right in range(len(arr)):
        window_sum += arr[right]
        while window_sum > target:
            window_sum -= arr[left]
            left += 1
        best = max(best, right - left + 1)
    return best`;

/** Index range [start, start + len). */
const span = (start: number, len: number) =>
  Array.from({ length: Math.max(0, len) }, (_, i) => start + i);

const badgeAdd = (x: number) => `${x < 0 ? "−" : "+"}${Math.abs(x)}`;
const badgeSub = (x: number) => `${x < 0 ? "+" : "−"}${Math.abs(x)}`;

/** Options for "how many elements must leave?". Includes the classic `if`-instead-of-`while` answer, 1. */
function countOptions(correct: number, rotate: number) {
  const out: number[] = [];
  for (const v of [correct, 1, correct + 1, correct - 1, correct + 2]) {
    if (v >= 1 && !out.includes(v)) out.push(v);
    if (out.length === 4) break;
  }
  const k = rotate % out.length;
  return [...out.slice(k), ...out.slice(0, k)].map((v) => ({
    id: String(v),
    label: v === 1 ? "1 element" : `${v} elements`,
  }));
}

function build({ arr, target }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;

  if (n === 0) {
    steps.push({ line: 1, narration: "Empty array.", pointers: [] });
    return steps;
  }

  // A pointer that has walked off the end (left just past the last cell) is simply not drawn.
  const ptrs = (left: number, right: number) =>
    [
      { name: "left", index: left, color: "mint" as const },
      { name: "right", index: right, color: "amber" as const },
    ].filter((p) => p.index >= 0 && p.index < n);

  // The window band carries its own sum and whether it fits under the cap.
  const win = (left: number, right: number, sum: number) =>
    right >= left
      ? [{ from: left, to: right, tone: "mid" as const, label: `sum ${sum} ${sum > target ? ">" : "≤"} ${target}` }]
      : [];

  // Length of the longest valid window ending at each right, shown in the secondary strip
  // so "longest over all windows" is something you can watch being built.
  const lens: number[] = [];
  let bestIdx = 0;
  const secondary = () => ({
    label: "longest valid window ending at each right",
    array: [...lens],
    highlight: { kind: "match" as const, indices: best > 0 ? [bestIdx] : [] },
  });

  let left = 0;
  let windowSum = 0;
  let best = 0;
  let bestL = 0;
  let bestR = -1;
  let asked = 0;

  steps.push({
    line: 2,
    lineEnd: 4,
    array: [...arr],
    pointers: [{ name: "left", index: 0, color: "mint" as const }],
    partitions: [],
    status: `left = 0,  window_sum = 0,  best = 0`,
    narration: "The window starts empty: left = 0, window_sum = 0, best = 0. right will scout ahead one element at a time.",
    proof: `We keep one invariant: after every pass, the window [left..right] has a sum of at most ${target}. Expanding can break it, and shrinking from the left repairs it.`,
    secondary: secondary(),
  });

  for (let right = 0; right < n; right++) {
    const v = arr[right];
    windowSum += v;
    const bad = windowSum > target;

    // Predict: how many elements must leave before the window is valid again?
    let predict: Prediction | undefined;
    if (bad && asked < MAX_PREDICTIONS) {
      asked += 1;
      let s = windowSum;
      let l = left;
      let needed = 0;
      while (s > target && l <= right) {
        s -= arr[l];
        l += 1;
        needed += 1;
      }
      predict = {
        question: `The window [${left}..${right}] has sum ${windowSum}, but the cap is ${target}. How many elements must leave from the left before it's valid again?`,
        options: countOptions(needed, asked),
        answer: String(needed),
      };
    }

    // Expand step: right moves forward and arr[right] joins the window.
    steps.push({
      line: 5,
      lineEnd: 6,
      array: [...arr],
      pointers: ptrs(left, right),
      partitions: win(left, right, windowSum),
      badges: [{ index: right, text: badgeAdd(v), tone: "mint" as const }],
      highlight: bad ? { kind: "swap", indices: span(left, right - left + 1) } : undefined,
      dimmed: span(0, left),
      status: `window_sum = ${windowSum}`,
      narration:
        `right → ${right}: arr[${right}] = ${v} joins the window, so sum = ${windowSum}. ` +
        (bad ? `${windowSum} > ${target}: the window is too heavy.` : `${windowSum} ≤ ${target}: still valid.`),
      proof: bad
        ? `The values are non-negative, so any window starting at or before index ${left} and ending at ${right} or later is at least this heavy. Those starts are dead: left only ever moves forward.`
        : right === 0
          ? "Each element enters the window exactly once, because right only moves forward."
          : undefined,
      secondary: secondary(),
      predict,
    });

    // Shrink steps: one beat per dropped element (the while-check, the subtract and the advance together).
    while (windowSum > target && left <= right) {
      const l = left;
      const a = arr[l];
      const before = windowSum;
      windowSum -= a;
      left += 1;
      const empty = left > right;
      const still = windowSum > target && !empty;
      steps.push({
        line: 7,
        lineEnd: 9,
        array: [...arr],
        pointers: ptrs(left, right),
        partitions: win(left, right, windowSum),
        badges: [{ index: l, text: badgeSub(a), tone: "rose" as const }],
        highlight: still ? { kind: "swap", indices: span(left, right - left + 1) } : undefined,
        // The cell that just left stays bright this step so its "−" badge is readable; it dims on the next one.
        dimmed: span(0, l),
        status: `window_sum = ${windowSum}`,
        narration:
          `${before} > ${target}, so drop arr[${l}] = ${a} and move left → ${left}. sum = ${windowSum}. ` +
          (empty
            ? "The window is empty: arr[right] alone is over the cap."
            : still
              ? "Still too heavy: keep shrinking."
              : "Valid again."),
        proof:
          !still && !empty
            ? "The window one cell longer was too heavy, and starting even earlier only adds more, so this is the longest valid window ending at right."
            : undefined,
        secondary: secondary(),
      });
    }

    // Record step: best = max(best, window length).
    const len = right - left + 1;
    lens.push(len);
    const prevBest = best;
    const isBest = len > best;
    if (isBest) {
      best = len;
      bestIdx = lens.length - 1;
      bestL = left;
      bestR = right;
    }
    steps.push({
      line: 10,
      array: [...arr],
      pointers: ptrs(left, right),
      partitions: win(left, right, windowSum),
      highlight: isBest ? { kind: "match", indices: span(left, len) } : undefined,
      dimmed: span(0, left),
      status: `length = ${len},  best = ${best}`,
      narration:
        len === 0
          ? `The window is empty (length 0), so best stays ${best}.`
          : isBest
            ? `The window [${left}..${right}] has length ${len}, longer than the old best (${prevBest}): new best!`
            : `The window has length ${len}, not longer than best (${best}).`,
      secondary: secondary(),
    });
  }

  steps.push({
    line: 11,
    array: [...arr],
    pointers: [],
    partitions: best > 0 ? [{ from: bestL, to: bestR, tone: "mid" as const, label: `best = ${best}` }] : [],
    highlight: best > 0 ? { kind: "match", indices: span(bestL, best) } : undefined,
    status: `return ${best}`,
    narration:
      best > 0
        ? `Return ${best}: the longest valid window is [${bestL}..${bestR}].`
        : "No window fits under the cap, so return 0.",
    proof:
      "right moved forward n times and left never moved back, so every element entered and left the window at most once. That's O(n) in total, even with a while loop inside the for loop.",
    secondary: secondary(),
  });
  return steps;
}

export const variableExpandShrink: LessonBuilder<Inputs> = {
  slug: "variable-expand-shrink",
  title: "Sliding Window — Variable (Expand & Shrink)",
  subtitle: "Expand the right edge; shrink from the left whenever a constraint is violated.",
  problem: "Given an array of non-negative integers and a target sum, find the length of the longest contiguous subarray whose sum is less than or equal to the target.",
  spotIt: [
    "'Longest / shortest substring or subarray satisfying a condition' on a contiguous range.",
    "Condition can be checked incrementally as you add or remove one element.",
    "Constraint hints: distinct characters, sum ≤ S, at most K of something.",
  ],
  avoidWhen: [
    "The valid range is non-monotonic — shrinking from the left can skip valid answers.",
    "You need all subarrays, not just the optimal one — use prefix sums or hashing.",
    "Elements are not contiguous (subsequences / subsets) — sliding window doesn't apply.",
  ],
  practiceLadder,
  variant: "variable-expand-shrink",
  view: "array",
  code,
  defaultInputs: { arr: [2, 1, 4, 1, 1, 1, 2, 3], target: 6 },
  inputs: [
    { key: "arr", label: "Array (non-negative)", kind: "intArray" },
    { key: "target", label: "Sum cap (≤ target)", kind: "int" },
  ],
  validate: ({ arr, target }) => {
    const w: string[] = [];
    if (arr.some((v) => v < 0)) w.push("Expand-shrink relies on a monotonic metric. With negative values shrinking from the left may not restore the constraint.");
    if (target < 0) w.push("A negative cap can never be satisfied, not even by an empty window, so the answer is always 0.");
    return w;
  },
  build,
};