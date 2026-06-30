import type { LessonBuilder, Step } from "../types";
import { stringifyIntArray } from "../util";

type Mode = "remove-duplicates" | "find-duplicate";
type Inputs = { mode: Mode; arr: number[] };

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

function ptrs(slow: number, fast: number, n: number) {
  // Clamp to valid indices so the canvas never points off-array.
  const cs = Math.max(0, Math.min(n - 1, slow));
  const cf = Math.max(0, Math.min(n - 1, fast));
  return [
    { name: "slow", index: cs, color: "mint" as const, placement: "below" as const },
    { name: "fast", index: cf, color: "amber" as const, placement: "above" as const },
  ];
}

function buildRemoveDuplicates(arr: number[]): Step[] {
  const steps: Step[] = [];
  const data = [...arr];
  const n = data.length;

  if (n === 0) {
    steps.push({ line: 3, array: [], pointers: [], narration: "Empty array — return 0." });
    return steps;
  }

  const win = (slow: number) => [
    { from: 0, to: slow, tone: "mid" as const, label: `unique [0..${slow}]` },
  ];

  let slow = 0;
  steps.push({
    line: 4,
    array: [...data],
    pointers: ptrs(slow, 1, n),
    partitions: win(slow),
    narration: "slow marks the last unique element; start at index 0.",
  });

  for (let fast = 1; fast < n; fast++) {
    const same = data[fast] === data[slow];
    if (same) {
      steps.push({
        line: 6,
        array: [...data],
        pointers: ptrs(slow, fast, n),
        partitions: win(slow),
        highlight: { kind: "compare", indices: [slow, fast] },
        status: `arr[${fast}]=${data[fast]} == arr[${slow}]=${data[slow]} → skip`,
        narration: `arr[fast]=${data[fast]} equals arr[slow]=${data[slow]}. Duplicate — skip.`,
      });
    } else {
      steps.push({
        line: 6,
        array: [...data],
        pointers: ptrs(slow, fast, n),
        partitions: win(slow),
        highlight: { kind: "compare", indices: [slow, fast] },
        status: `arr[${fast}]=${data[fast]} ≠ arr[${slow}]=${data[slow]}`,
        narration: `New value found at fast=${fast}.`,
      });
      slow += 1;
      data[slow] = data[fast];
      steps.push({
        line: 8,
        array: [...data],
        pointers: ptrs(slow, fast, n),
        partitions: win(slow),
        highlight: { kind: "swap", indices: [slow] },
        status: `slow→${slow}; arr[${slow}] = ${data[slow]}`,
        narration: `Advance slow to ${slow} and copy ${data[fast]} there.`,
      });
    }
  }

  steps.push({
    line: 9,
    array: [...data],
    pointers: ptrs(slow, n - 1, n),
    partitions: win(slow),
    status: `return ${slow + 1}`,
    narration: `Unique prefix length = ${slow + 1}. Values [0..${slow}] are the answer.`,
  });
  return steps;
}

function buildFindDuplicate(arr: number[]): Step[] {
  const steps: Step[] = [];
  const n = arr.length;

  if (n < 2) {
    steps.push({ line: 1, array: [...arr], pointers: [], narration: "Need at least 2 elements." });
    return steps;
  }
  // Guard: values must be valid indices (0..n-1). If not, bail with a message.
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

  let slow = arr[0];
  let fast = arr[0];
  steps.push({
    line: 2,
    array: [...arr],
    pointers: ptrs(slow, fast, n),
    highlight: { kind: "compare", indices: [slow] },
    status: `slow = fast = nums[0] = ${slow}`,
    narration: "Treat each value as a 'next index'. Both pointers start at nums[0].",
  });

  // Phase 1: detect meeting point inside the cycle.
  for (let i = 0; i < n * 2; i++) {
    const ns = arr[slow];
    const nf = arr[arr[fast]];
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(ns, nf, n),
      highlight:
        ns === nf
          ? { kind: "match", indices: [ns] }
          : { kind: "compare", indices: [ns, nf] },
      status: `slow: ${slow}→${ns}   fast: ${fast}→${nf}`,
      narration:
        ns === nf
          ? `They meet at index ${ns}. Phase 1 done — meeting point found inside the cycle.`
          : `slow jumps 1 (nums[${slow}]=${ns}); fast jumps 2 (nums[nums[${fast}]]=${nf}).`,
    });
    slow = ns;
    fast = nf;
    if (slow === fast) break;
  }

  // Phase 2: reset slow, walk both one step at a time to the cycle entry.
  slow = arr[0];
  steps.push({
    line: 7,
    array: [...arr],
    pointers: ptrs(slow, fast, n),
    status: `reset slow = nums[0] = ${slow}`,
    narration: "Phase 2 — reset slow to nums[0]. Now both move one step at a time.",
  });

  for (let i = 0; i < n * 2 && slow !== fast; i++) {
    const ns = arr[slow];
    const nf = arr[fast];
    steps.push({
      line: 9,
      array: [...arr],
      pointers: ptrs(ns, nf, n),
      highlight:
        ns === nf
          ? { kind: "match", indices: [ns] }
          : { kind: "compare", indices: [ns, nf] },
      status: `slow: ${slow}→${ns}   fast: ${fast}→${nf}`,
      narration:
        ns === nf
          ? `They meet at ${ns} — that's the cycle entry, i.e. the duplicate value.`
          : `Step both by one.`,
    });
    slow = ns;
    fast = nf;
  }

  steps.push({
    line: 11,
    array: [...arr],
    pointers: ptrs(slow, fast, n),
    highlight: { kind: "match", indices: [slow] },
    status: `return ${slow}`,
    narration: `Duplicate value = ${slow}.`,
  });
  return steps;
}

function build({ mode, arr }: Inputs): Step[] {
  return mode === "find-duplicate" ? buildFindDuplicate(arr) : buildRemoveDuplicates(arr);
}

export const fastSlow: LessonBuilder<Inputs> = {
  slug: "fast-slow",
  title: "Same Direction — Slow & Fast",
  subtitle:
    "Two pointers walking the same way: slow tracks a frontier while fast scouts ahead — pick a problem and watch it unfold.",
  problem:
    "Two classic same-direction problems. (1) Remove duplicates from a sorted array in place and return the length of the unique prefix. (2) Find the one repeated number in an array of length n+1 with values in [1..n], without modifying the array and in O(1) extra space.",
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
