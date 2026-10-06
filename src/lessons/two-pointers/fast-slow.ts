import type { LessonBuilder, PracticeProblem, Prediction, Step } from "../types";
import { stringifyIntArray } from "../util";

type Mode = "remove-duplicates" | "find-duplicate";
type Inputs = { mode: Mode; arr: number[] };

/** Remove Duplicates asks at most this many predict-mode questions, so a long array doesn't become a chore. */
const MAX_PREDICTIONS = 5;

const codeRemoveDuplicates = `def remove_duplicates(arr):
    if not arr:
        return 0
    slow = 0
    for fast in range(1, len(arr)):
        if arr[fast] != arr[slow]:
            slow += 1
            arr[slow] = arr[fast]
    return slow + 1`;

const codeFindDuplicate = `def find_duplicate(nums):
    slow = fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow`;

const DEFAULTS: Record<Mode, number[]> = {
  "remove-duplicates": [0, 0, 1, 1, 1, 2, 2, 3, 3, 4],
  "find-duplicate": [1, 3, 4, 2, 2],
};

const practiceLadder: PracticeProblem[] = [
  { name: "Linked List Cycle", difficulty: "easy", hint: "Classic tortoise and hare. If there's a cycle, the fast pointer will eventually lap the slow pointer.", link: "https://leetcode.com/problems/linked-list-cycle/" },
  { name: "Remove Duplicates from Sorted Array", difficulty: "easy", hint: "Slow pointer tracks the unique prefix, fast pointer scans for new elements.", link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
  { name: "Linked List Cycle II", difficulty: "medium", hint: "Find where the cycle begins. The math proves that after they meet, if you restart one pointer, they will meet at the start of the cycle.", link: "https://leetcode.com/problems/linked-list-cycle-ii/" },
  { name: "Find the Duplicate Number", difficulty: "medium", hint: "Treat the array values as next pointers. The duplicate is the start of the cycle.", link: "https://leetcode.com/problems/find-the-duplicate-number/" },
  { name: "Minimum Window Substring", difficulty: "hard", hint: "Expand with fast pointer until valid, shrink with slow pointer until invalid. Keep track of the best window.", link: "https://leetcode.com/problems/minimum-window-substring/" },
  { name: "Subarrays with K Different Integers", difficulty: "hard", hint: "Standard sliding window only gives 'at most K'. The trick is 'exactly K' = 'at most K' - 'at most K-1'.", link: "https://leetcode.com/problems/subarrays-with-k-different-integers/" },
];

function ptrs(slow: number, fast: number, n: number) {
  // Clamp to valid indices so the canvas never points off-array.
  const cs = Math.max(0, Math.min(n - 1, slow));
  const cf = Math.max(0, Math.min(n - 1, fast));
  return [
    { name: "slow", index: cs, color: "mint" as const, placement: "below" as const },
    { name: "fast", index: cf, color: "amber" as const, placement: "above" as const },
  ];
}

/**
 * Multiple-choice index options for "where does this pointer land?" questions.
 * The correct index is always included; distractors are the classic mistakes
 * (walking to the next cell, or jumping twice). Order is rotated so the
 * correct answer isn't always first.
 */
function indexOptions(correct: number, distractors: number[], n: number, rotate: number) {
  const seen = new Set<number>();
  const ordered: number[] = [];
  const add = (v: number) => {
    if (Number.isInteger(v) && v >= 0 && v < n && !seen.has(v)) {
      seen.add(v);
      ordered.push(v);
    }
  };
  add(correct);
  distractors.forEach(add);
  for (let i = 0; i < n && ordered.length < 3; i++) add(i);
  const picked = ordered.slice(0, 3);
  const k = picked.length ? rotate % picked.length : 0;
  const rotated = [...picked.slice(k), ...picked.slice(0, k)];
  return rotated.map((i) => ({ id: String(i), label: `index ${i}` }));
}

/* -------------------------------------------------------------------------- */
/* Remove Duplicates from Sorted Array                                        */
/* -------------------------------------------------------------------------- */

function buildRemoveDuplicates(arr: number[]): Step[] {
  const steps: Step[] = [];
  const data = [...arr];
  const n = data.length;

  if (n === 0) {
    steps.push({
      line: 2,
      lineEnd: 3,
      array: [],
      pointers: [],
      narration: "Empty array: nothing to dedupe. Return 0.",
    });
    return steps;
  }

  const win = (slow: number) => [
    { from: 0, to: slow, tone: "mid" as const, label: `unique [0..${slow}]` },
  ];

  let slow = 0;
  let asked = 0;

  steps.push({
    line: 2,
    lineEnd: 4,
    array: [...data],
    pointers: ptrs(0, 0, n),
    partitions: win(0),
    highlight: { kind: "compare", indices: [0] },
    status: "slow = 0",
    narration: "The array isn't empty, so index 0 is trivially unique. slow marks the end of the unique prefix.",
    proof: "slow always points at the last unique value we've kept. fast scouts ahead looking for the next value that differs.",
  });

  for (let fast = 1; fast < n; fast++) {
    const f = data[fast];
    const s = data[slow];
    const same = f === s;

    const predict: Prediction | undefined =
      asked++ < MAX_PREDICTIONS
        ? {
          question: `fast is at index ${fast} (value ${f}); slow is at index ${slow} (value ${s}). What should happen?`,
          options: [
            { id: "skip", label: "Skip it (duplicate)" },
            { id: "keep", label: "Keep it (new value)" },
          ],
          answer: same ? "skip" : "keep",
        }
        : undefined;

    // Decision step: the loop advances fast, then compares. Both branches share these lines.
    steps.push({
      line: 5,
      lineEnd: 6,
      array: [...data],
      pointers: ptrs(slow, fast, n),
      partitions: win(slow),
      highlight: { kind: "compare", indices: [slow, fast] },
      status: `fast = ${fast}:  arr[${fast}] = ${f}  vs  arr[${slow}] = ${s}`,
      narration: same
        ? `fast → ${fast}. arr[fast] = ${f} equals arr[slow] = ${s}. It's a repeat, so skip it.`
        : `fast → ${fast}. arr[fast] = ${f} differs from arr[slow] = ${s}. A new value.`,
      proof: same
        ? `The array is sorted, so every repeat of ${s} sits right next to it. This one adds nothing new: slow stays put and fast keeps scanning.`
        : f > s
          ? `The array is sorted, so ${f} is larger than every value already kept. It has never appeared before and must join the unique prefix.`
          : `The input isn't sorted, so ${f} is only different from the last kept value, not guaranteed new. This algorithm assumes sorted input.`,
      predict,
    });

    if (!same) {
      const stale = data[slow + 1];
      slow += 1;
      data[slow] = f;
      steps.push({
        line: 7,
        lineEnd: 8,
        array: [...data],
        pointers: ptrs(slow, fast, n),
        partitions: win(slow),
        highlight: { kind: "swap", indices: [slow] },
        status: `slow = ${slow},  arr[${slow}] = ${f}`,
        narration:
          slow === fast
            ? `slow → ${slow}, the same cell as fast. The copy changes nothing; the unique prefix just grows by one.`
            : `slow → ${slow}. Copy ${f} over the stale ${stale} at index ${slow}, extending the unique prefix.`,
        proof:
          slow === fast
            ? undefined
            : "Cells between slow and fast are leftovers we've already scanned, so they're safe to overwrite. That's how the array is compacted in place with no extra memory.",
      });
    }
  }

  steps.push({
    line: 9,
    array: [...data],
    pointers: ptrs(slow, n - 1, n),
    partitions: win(slow),
    status: `return ${slow + 1}`,
    narration: `fast ran off the end. Unique prefix length = ${slow + 1}: values [0..${slow}] are the answer.`,
    proof: `Everything after index ${slow} is leftover junk. Only the first ${slow + 1} cells matter.`,
  });
  return steps;
}

/* -------------------------------------------------------------------------- */
/* Find the Duplicate Number (Floyd's tortoise and hare)                      */
/* -------------------------------------------------------------------------- */

function buildFindDuplicate(arr: number[]): Step[] {
  const steps: Step[] = [];
  const n = arr.length;

  if (n < 2) {
    steps.push({ line: 1, array: [...arr], pointers: [], narration: "Need at least 2 elements." });
    return steps;
  }
  const bad = arr.some((v) => !Number.isInteger(v) || v < 0 || v >= n);
  if (bad) {
    steps.push({
      line: 1,
      array: [...arr],
      pointers: [],
      narration:
        "Values must be in [1..n] so each value maps to a valid index. Adjust the array and run again.",
    });
    return steps;
  }

  const start = arr[0];
  let slow = start;
  let fast = start;

  steps.push({
    line: 2,
    array: [...arr],
    pointers: ptrs(slow, fast, n),
    highlight: { kind: "compare", indices: [start] },
    status: `slow = fast = nums[0] = ${start}`,
    narration: `Both pointers start on index ${start}, which is nums[0]: one step along the path from index 0.`,
    proof:
      "Each value is a pointer to the next index. n + 1 values can only name n different indices, so walking the pointers from index 0 must eventually loop. The loop's entrance is the index pointed to twice: the duplicate.",
  });

  // Phase 1: slow takes 1 step, fast takes 2, until they meet inside the cycle.
  let round = 0;
  for (let i = 0; i < n * 3; i++) {
    round += 1;
    const ns = arr[slow];
    const f1 = arr[fast];
    const f2 = arr[f1];

    if (round === 1) {
      // Pre-move step so the learner can predict where slow lands.
      steps.push({
        line: 4,
        array: [...arr],
        pointers: ptrs(slow, fast, n),
        highlight: { kind: "compare", indices: [slow] },
        status: `round 1: slow is at index ${slow}`,
        narration: `slow reads nums[${slow}] = ${ns}, so it jumps to index ${ns}.`,
        proof: "The value in a cell is the index to jump to, not an offset. slow always lands on index nums[slow].",
        predict: {
          question: `Round 1: slow is at index ${slow}. Where does one step take it?`,
          options: indexOptions(ns, [slow + 1, arr[ns], slow], n, slow),
          answer: String(ns),
        },
      });
    }

    const met = ns === f2;
    steps.push({
      line: 4,
      lineEnd: 5,
      array: [...arr],
      pointers: ptrs(ns, f2, n),
      highlight: met ? { kind: "match", indices: [ns] } : { kind: "compare", indices: [ns, f2] },
      status: `slow ${slow} → ${ns}    fast ${fast} → ${f1} → ${f2}`,
      narration: `slow steps to ${ns}. fast hops twice: nums[${fast}] = ${f1}, then nums[${f1}] = ${f2}.`,
    });

    slow = ns;
    fast = f2;

    if (met) {
      steps.push({
        line: 6,
        lineEnd: 7,
        array: [...arr],
        pointers: ptrs(slow, fast, n),
        highlight: { kind: "match", indices: [slow] },
        status: `slow (${slow}) == fast (${fast}) → break`,
        narration: `slow == fast at index ${slow}: they met inside the cycle. Phase 1 is over.`,
        proof:
          "The meeting point is somewhere in the cycle, but not necessarily its entrance. The distance from index 0 to the entrance equals the distance from the meeting point around to the entrance, so restarting one pointer from the beginning lets them meet exactly there.",
        predict: {
          question: `slow and fast both sit on index ${slow}. What should the algorithm do next?`,
          options: [
            { id: "return", label: `Return index ${slow} as the duplicate` },
            { id: "reset", label: "Reset slow to nums[0], then move both one step at a time" },
            { id: "again", label: "Keep going: slow one step, fast two steps" },
          ],
          answer: "reset",
        },
      });
      break;
    }

    steps.push({
      line: 6,
      array: [...arr],
      pointers: ptrs(slow, fast, n),
      highlight: { kind: "compare", indices: [slow, fast] },
      status: `slow (${slow}) != fast (${fast}) → keep going`,
      narration: `slow (${slow}) != fast (${fast}). Not met yet, so keep walking.`,
    });
  }

  // Phase 2: restart slow from the beginning; both move one step per turn.
  slow = arr[0];
  steps.push({
    line: 8,
    array: [...arr],
    pointers: ptrs(slow, fast, n),
    highlight: { kind: "compare", indices: [slow] },
    status: `reset slow = nums[0] = ${slow}`,
    narration: `slow resets to nums[0] = ${slow}. fast stays at the meeting point, index ${fast}. From here both move one step at a time.`,
  });

  let round2 = 0;
  for (let i = 0; i < n * 2 && slow !== fast; i++) {
    round2 += 1;
    const ns = arr[slow];
    const nf = arr[fast];

    steps.push({
      line: 9,
      array: [...arr],
      pointers: ptrs(slow, fast, n),
      highlight: { kind: "compare", indices: [slow, fast] },
      status: `slow = ${slow}, fast = ${fast}`,
      narration: `slow (${slow}) != fast (${fast}), so both take one step.`,
      proof:
        round2 === 1
          ? "Phase 2 uses equal speeds: fast no longer double-hops. Both pointers are now the same distance from the cycle entrance, so they arrive there together."
          : undefined,
      predict:
        round2 === 1
          ? {
            question: `Both pointers now take ONE step. fast is at index ${fast}. Where does fast land?`,
            options: indexOptions(nf, [arr[nf], fast + 1, fast], n, fast),
            answer: String(nf),
          }
          : undefined,
    });

    const met = ns === nf;
    steps.push({
      line: 10,
      lineEnd: 11,
      array: [...arr],
      pointers: ptrs(ns, nf, n),
      highlight: met ? { kind: "match", indices: [ns] } : { kind: "compare", indices: [ns, nf] },
      status: `slow ${slow} → ${ns}    fast ${fast} → ${nf}`,
      narration: met
        ? `slow → ${ns}, fast → ${nf}. They land together: this is the cycle entrance.`
        : `slow → ${ns}, fast → ${nf}.`,
    });

    slow = ns;
    fast = nf;
  }

  steps.push({
    line: 12,
    array: [...arr],
    pointers: ptrs(slow, fast, n),
    highlight: { kind: "match", indices: [slow] },
    status: `return ${slow}`,
    narration: `slow == fast, so the loop ends. Return ${slow}: that's the duplicate.`,
    proof: "Two different cells hold this value, so two arrows point into this index. That's what makes it the cycle's entrance.",
  });
  return steps;
}

function build({ mode, arr }: Inputs): Step[] {
  return mode === "find-duplicate" ? buildFindDuplicate(arr) : buildRemoveDuplicates(arr);
}

export const fastSlow: LessonBuilder<Inputs> = {
  slug: "fast-slow",
  title: "Same Direction - Slow & Fast",
  subtitle:
    "Two pointers walking the same way: slow tracks a frontier while fast scouts ahead. Pick a problem and watch it unfold.",
  problem:
    "There are two common problems you can solve with same-direction two pointers. Pick one from the dropdown above to see how it works.\n\n" +
    "1. Remove Duplicates: Given a sorted array, remove duplicates in-place so each value appears only once. Return the length of the unique prefix. You can't use extra memory.\n\n" +
    "2. Find the Duplicate Number: You have an array where every value points to a valid index. Exactly one value repeats. Find it without modifying the array or using extra memory. The trick is to treat the array like a linked list, where duplicates create a cycle.",
  spotIt: [
    "Array is sorted and you need an in-place dedup or compaction.",
    "Cycle detection where each value implies the next index (functional graph).",
    "Constraint forbids extra space or modifying the input.",
  ],
  avoidWhen: [
    "Order doesn't matter — a hash set is simpler than two pointers.",
    "Array isn't sorted (for the dedup variant) — sort first or switch patterns.",
    "Values can be outside [1..n] — Floyd-on-values needs that index mapping to be valid.",
  ],
  practiceLadder,
  variant: "fast-slow",
  view: "array",
  code: codeRemoveDuplicates,
  codeFor: (inputs) =>
    (inputs.mode as Mode) === "find-duplicate" ? codeFindDuplicate : codeRemoveDuplicates,
  defaultInputs: { mode: "remove-duplicates", arr: DEFAULTS["remove-duplicates"] },
  inputs: [
    {
      key: "mode",
      label: "Problem",
      kind: "select",
      options: [
        { value: "remove-duplicates", label: "Remove Duplicates from Sorted Array" },
        { value: "find-duplicate", label: "Find the Duplicate Number" },
      ],
      help: "switches the algorithm",
    },
    { key: "arr", label: "Array", kind: "intArray" },
  ],
  // When the mode changes, swap the array to that mode's sensible default
  // so the input is always valid for the active algorithm.
  onInputChange: (key, value) => {
    if (key !== "mode") return null;
    const next = (value as Mode) in DEFAULTS ? (value as Mode) : "remove-duplicates";
    return { arr: stringifyIntArray(DEFAULTS[next]) };
  },
  validate: ({ mode, arr }) => {
    const w: string[] = [];
    if (arr.length === 0) w.push("Array is empty.");
    if (mode === "remove-duplicates") {
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] < arr[i - 1]) {
          w.push("Array isn't sorted ascending — dedup assumes sorted input.");
          break;
        }
      }
    } else {
      const n = arr.length - 1;
      if (n < 1) w.push("Need at least 2 elements (n+1 with n ≥ 1).");
      else if (arr.some((v) => v < 1 || v > n))
        w.push(`Values must be in [1..${n}] for Floyd-on-values to map to valid indices.`);
    }
    return w;
  },
  build,
};

// Re-export the code variants so the player can swap the displayed source per mode.
export const fastSlowCodeByMode: Record<Mode, string> = {
  "remove-duplicates": codeRemoveDuplicates,
  "find-duplicate": codeFindDuplicate,
};