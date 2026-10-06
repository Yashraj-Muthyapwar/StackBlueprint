import type { LessonBuilder, PracticeProblem, Prediction, Step } from "../types";

type Inputs = { arr: number[]; k: number };

/** Predict mode: at most this many "how many entries get popped?" questions. */
const MAX_POP_QUESTIONS = 3;

const practiceLadder: PracticeProblem[] = [
  { name: "Next Greater Element I", difficulty: "easy", hint: "The same pop rule on a stack: pop while the top is smaller than the newcomer. Each popped value has just found its next greater element.", link: "https://leetcode.com/problems/next-greater-element-i/" },
  { name: "Daily Temperatures", difficulty: "medium", hint: "Monotonic stack of indices. When a warmer day arrives, every colder day on the stack gets its answer.", link: "https://leetcode.com/problems/daily-temperatures/" },
  { name: "Jump Game VI", difficulty: "medium", hint: "DP where each cell needs the best score among the previous k cells. A monotonic deque gives that max in O(1).", link: "https://leetcode.com/problems/jump-game-vi/" },
  { name: "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit", difficulty: "medium", hint: "Two deques over the same window: one for the max, one for the min. Shrink from the left while max - min exceeds the limit.", link: "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/" },
  { name: "Sliding Window Maximum", difficulty: "hard", hint: "This exact lesson. Write the pop rule and the expiry rule from memory, then say why each is safe.", link: "https://leetcode.com/problems/sliding-window-maximum/" },
  { name: "Shortest Subarray with Sum at Least K", difficulty: "hard", hint: "Run the deque over prefix sums, because the array can contain negatives. Pop from the front while the window is already valid.", link: "https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/" },
];

const code = `def max_sliding_window(arr, k):
    window_dq = deque()  # stores indices, values decreasing
    out = []
    for right in range(len(arr)):
        while window_dq and arr[window_dq[-1]] < arr[right]:
            window_dq.pop()
        window_dq.append(right)
        if window_dq[0] <= right - k:
            window_dq.popleft()
        if right >= k - 1:
            out.append(arr[window_dq[0]])
    return out`;

/** Index range [start, start + len). */
const span = (start: number, len: number) =>
  Array.from({ length: Math.max(0, len) }, (_, i) => start + i);

/** Options for "how many entries get popped?". Never offers more than the deque holds. */
function popOptions(correct: number, max: number, rotate: number) {
  const out: number[] = [];
  for (const v of [correct, correct + 1, correct - 1, 1, 0, correct + 2]) {
    if (v >= 0 && v <= max && !out.includes(v)) out.push(v);
    if (out.length === 4) break;
  }
  const k = rotate % out.length;
  return [...out.slice(k), ...out.slice(0, k)].map((v) => ({
    id: String(v),
    label: `${v} ${v === 1 ? "entry" : "entries"}`,
  }));
}

/** Options for "which value goes into the output?". Distractors are other values in the same window. */
function maxOptions(correct: number, windowVals: number[], rotate: number) {
  const out: number[] = [];
  for (const v of [correct, windowVals[windowVals.length - 1], windowVals[0], ...windowVals]) {
    if (!out.includes(v)) out.push(v);
    if (out.length === 4) break;
  }
  const k = rotate % out.length;
  return [...out.slice(k), ...out.slice(0, k)].map((v) => ({ id: String(v), label: String(v) }));
}

function build({ arr, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (!Number.isInteger(k) || k <= 0 || k > n) {
    steps.push({ line: 1, narration: "Invalid k.", array: [...arr], pointers: [] });
    return steps;
  }

  const dq: number[] = [];
  const out: number[] = [];

  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];
  const win = (left: number, right: number, label: string) => [
    { from: left, to: right, tone: "mid" as const, label },
  ];

  // Dead candidates: explored cells (index < upto) that are no longer in the deque. They were popped by a
  // bigger newcomer or fell out of the window, so they can never be a maximum again.
  const dead = (upto: number, except?: number) =>
    span(0, upto).filter((i) => !dq.includes(i) && i !== except);

  const frontBadge = (text = "front") =>
    dq.length ? [{ index: dq[0], text, tone: "mint" as const }] : [];

  // Two strips stacked: the deque on top, the output underneath, so neither vanishes mid-lesson.
  const dequeStrip = (hi?: { kind: "compare" | "match"; index: number }) => ({
    label: "deque (index:value, values decreasing)",
    array: dq.map((i) => `${i}:${arr[i]}`),
    highlight: hi ? { kind: hi.kind, indices: [hi.index] } : undefined,
    pointers: dq.length
      ? [
        { name: "front", index: 0, color: "mint" as const },
        { name: "back", index: dq.length - 1, color: "amber" as const },
      ]
      : [],
  });
  const outStrip = () => ({
    label: "output",
    array: [...out],
    highlight: out.length ? { kind: "match" as const, indices: [out.length - 1] } : undefined,
  });

  const push = (s: Partial<Step> & { line: number; narration: string }) =>
    steps.push({ array: [...arr], ...s } as Step);

  push({
    line: 2,
    lineEnd: 3,
    pointers: [],
    partitions: [],
    secondary: dequeStrip(),
    secondary2: outStrip(),
    narration: "An empty deque will hold candidate indices, and an empty list will collect the answers.",
    proof:
      "The deque keeps only the indices that could still become a window's maximum, oldest first, with values decreasing from front to back. Cells that drop out of it are struck through in the array.",
  });

  let askedPops = 0;
  let askedOut = 0;
  let expiredOnce = false;
  let outputOnce = false;

  for (let right = 0; right < n; right++) {
    const v = arr[right];
    const left = Math.max(0, right - k + 1);

    // How many entries will the while-loop pop?
    let pops = 0;
    while (pops < dq.length && arr[dq[dq.length - 1 - pops]] < v) pops += 1;
    const backIdx = dq.length ? dq[dq.length - 1] : -1;

    let predict: Prediction | undefined;
    if (dq.length > 0 && askedPops < MAX_POP_QUESTIONS) {
      askedPops += 1;
      predict = {
        question: `arr[${right}] = ${v} arrives. The deque is [${dq.map((i) => `${i}:${arr[i]}`).join(", ")}]. How many entries get popped from the back?`,
        options: popOptions(pops, dq.length, askedPops),
        answer: String(pops),
      };
    }

    // Arrive: right moves forward and the while-condition is checked against the back of the deque.
    push({
      line: 4,
      lineEnd: 5,
      pointers: ptrs(left, right),
      partitions: win(left, right, "window"),
      highlight: { kind: "compare", indices: [right] },
      badges: frontBadge(),
      dimmed: dead(right),
      secondary: dequeStrip(dq.length ? { kind: "compare", index: dq.length - 1 } : undefined),
      secondary2: outStrip(),
      status: `arr[${right}] = ${v}`,
      narration:
        `right → ${right}: arr[${right}] = ${v} arrives. ` +
        (dq.length === 0
          ? "The deque is empty, so there's nothing to pop."
          : pops > 0
            ? `${pops} ${pops === 1 ? "entry" : "entries"} on the back ${pops === 1 ? "is" : "are"} smaller than ${v}, so ${pops === 1 ? "it gets" : "they get"} popped.`
            : `The back entry (${arr[backIdx]}) isn't smaller than ${v}, so nothing is popped.`),
      proof:
        dq.length === 0
          ? undefined
          : pops > 0
            ? `A smaller value to the left of a bigger newcomer can never be a window's maximum again: ${v} is bigger and stays in every window the older one would. So those indices are dead.`
            : `Both must stay: the back entry is at least as big right now, but it leaves the window first, and then ${v} may become the maximum.`,
      predict,
    });

    // Pop steps: one beat per popped entry.
    for (let p = 0; p < pops; p++) {
      const popped = dq.pop()!;
      const nb = dq.length ? dq[dq.length - 1] : -1;
      const more = p < pops - 1;
      push({
        line: 6,
        pointers: ptrs(left, right),
        partitions: win(left, right, "window"),
        // The popped cell keeps a rose ring and stays bright this step; it fades on the next one.
        highlight: { kind: "swap", indices: [popped] },
        badges: frontBadge(),
        dimmed: dead(right, popped),
        secondary: dequeStrip(),
        secondary2: outStrip(),
        status: `pop ${popped}:${arr[popped]}`,
        narration:
          `${arr[popped]} < ${v}: pop index ${popped} from the back.` +
          (more
            ? ` The new back (${arr[nb]}) is still smaller: keep popping.`
            : dq.length
              ? ` The new back (${arr[nb]}) isn't smaller, so popping stops.`
              : " The deque is empty, so popping stops."),
      });
    }

    // Push the newcomer.
    dq.push(right);
    push({
      line: 7,
      pointers: ptrs(left, right),
      partitions: win(left, right, "window"),
      highlight: { kind: "match", indices: [right] },
      badges: frontBadge(),
      dimmed: dead(right + 1),
      secondary: dequeStrip({ kind: "match", index: dq.length - 1 }),
      secondary2: outStrip(),
      status: `push ${right}:${v}`,
      narration:
        `Push index ${right} onto the back.` +
        (right < k - 1 ? " The window isn't full yet, so there's no output." : ""),
      proof:
        right === 0
          ? "Every entry ahead of the back is at least as big, so values decrease from front to back and the front is always the largest candidate."
          : undefined,
    });

    // Expire the front if it slid out of the window (only drawn when it actually happens).
    if (dq[0] <= right - k) {
      const e = dq.shift()!;
      push({
        line: 8,
        lineEnd: 9,
        pointers: ptrs(left, right),
        partitions: win(left, right, "window"),
        highlight: { kind: "swap", indices: [e] },
        badges: frontBadge(),
        dimmed: dead(right + 1, e),
        secondary: dequeStrip(),
        secondary2: outStrip(),
        status: `expire ${e}:${arr[e]}`,
        narration: `Index ${e} fell outside the window [${left}..${right}]: pop it from the front.`,
        proof: !expiredOnce
          ? "Indices increase from front to back, so the oldest candidate is always at the front. If anything expired, it's the front one."
          : undefined,
      });
      expiredOnce = true;
    }

    // Output once the window is full.
    if (right >= k - 1) {
      const front = dq[0];
      const m = arr[front];

      if (askedOut < 1) {
        askedOut += 1;
        // Ask on the step just before the output, so the answer isn't on screen yet.
        steps[steps.length - 1].predict = {
          question: `The window [${left}..${right}] is full. Which value goes into the output?`,
          options: maxOptions(m, arr.slice(left, right + 1), right),
          answer: String(m),
        };
      }

      out.push(m);
      push({
        line: 10,
        lineEnd: 11,
        pointers: ptrs(left, right),
        partitions: win(left, right, `max = ${m}`),
        highlight: { kind: "match", indices: [front] },
        badges: frontBadge("max"),
        dimmed: dead(right + 1),
        secondary: dequeStrip({ kind: "match", index: 0 }),
        secondary2: outStrip(),
        status: `max = ${m}`,
        narration: `The window [${left}..${right}] is full. Its maximum is the front of the deque: ${m}. Append it to the output.`,
        proof: !outputOnce
          ? "The front survives every pop and is still inside the window. Anything bigger would have popped it, and anything smaller is behind it or already popped, so the front is the window's maximum."
          : undefined,
      });
      outputOnce = true;
    }
  }

  push({
    line: 12,
    pointers: [],
    partitions: [],
    secondary: dequeStrip(),
    secondary2: outStrip(),
    status: `return [${out.join(", ")}]`,
    narration: `Done. Return [${out.join(", ")}].`,
    proof:
      "Each index is pushed once and popped at most once, so the total work is O(n) even though there's a while loop inside the for loop.",
  });
  return steps;
}

export const monotonicWindow: LessonBuilder<Inputs> = {
  slug: "monotonic-window",
  title: "Sliding Window — Monotonic Deque",
  subtitle: "Maintain a deque of decreasing values so the front is always the window's max.",
  problem: "Given an array and a window size k, return the maximum of every contiguous subarray of length k in O(n) time.",
  spotIt: [
    "'Max / min in every window of size k' or 'next greater element in a window'.",
    "You need O(n) and a plain heap gives O(n log k) \u2014 deque is the trick.",
    "Problem talks about 'maintain running max/min as the window slides'.",
  ],
  avoidWhen: [
    "You need the k-th element (not just max/min) \u2014 use a multiset / heap.",
    "Window is unordered or the value you track isn't monotonic.",
    "Updates aren't append-only on one end and pop-only on the other.",
  ],
  practiceLadder,
  variant: "monotonic-window",
  view: "array",
  code,
  defaultInputs: { arr: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
  inputs: [
    { key: "arr", label: "Array", kind: "intArray" },
    { key: "k", label: "Window size k", kind: "int", min: 1 },
  ],
  validate: ({ arr, k }) => {
    const w: string[] = [];
    if (!Number.isInteger(k) || k < 1) w.push("k must be a positive integer.");
    else if (k > arr.length) w.push("k must be ≤ array length.");
    return w;
  },
  build,
};