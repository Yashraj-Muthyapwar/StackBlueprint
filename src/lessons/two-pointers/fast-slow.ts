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
    steps.push({ line: 2, array: [], pointers: [], narration: "Check if array is empty." });
    steps.push({ line: 3, array: [], pointers: [], narration: "Empty array - return 0." });
    return steps;
  }

  const win = (slow: number) => [
    { from: 0, to: slow, tone: "mid" as const, label: `unique [0..${slow}]` },
  ];

  let slow = 0;
  steps.push({
    line: 2,
    array: [...data],
    pointers: ptrs(0, 0, n),
    narration: "Check if array is empty."
  });
  
  steps.push({
    line: 4,
    array: [...data],
    pointers: ptrs(0, 0, n),
    highlight: { kind: "compare", indices: [0] },
    status: "slow = 0, fast = 0  (both start at index 0)",
    narration: "Both pointers start at index 0. slow will mark the end of the unique prefix.",
  });
  steps.push({
    line: 5,
    array: [...data],
    pointers: ptrs(slow, Math.min(1, n - 1), n),
    partitions: win(slow),
    status: "fast → 1",
    narration: "for loop: fast advances to index 1 to scan ahead; slow stays at 0.",
  });


  for (let fast = 1; fast < n; fast++) {
    const same = data[fast] === data[slow];
    if (fast > 1) {
      steps.push({
        line: 5,
        array: [...data],
        pointers: ptrs(slow, fast, n),
        partitions: win(slow),
        status: `fast = ${fast}`,
        narration: `for loop: fast moves to index ${fast}.`
      });
    }
    
    if (same) {
      steps.push({
        line: 6,
        array: [...data],
        pointers: ptrs(slow, fast, n),
        partitions: win(slow),
        highlight: { kind: "compare", indices: [slow, fast] },
        status: `arr[${fast}]=${data[fast]} == arr[${slow}]=${data[slow]} → skip`,
        narration: `arr[fast]=${data[fast]} equals arr[slow]=${data[slow]}. Duplicate - skip.`,
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
      steps.push({
        line: 7,
        array: [...data],
        pointers: ptrs(slow, fast, n),
        partitions: win(slow - 1),
        status: `slow += 1 → ${slow}`,
        narration: `Advance slow to ${slow}.`,
      });
      data[slow] = data[fast];
      steps.push({
        line: 8,
        array: [...data],
        pointers: ptrs(slow, fast, n),
        partitions: win(slow),
        highlight: { kind: "swap", indices: [slow] },
        status: `arr[${slow}] = ${data[slow]}`,
        narration: `Copy ${data[fast]} to index ${slow}.`,
      });
    }
  }

  steps.push({
    line: 5,
    array: [...data],
    pointers: ptrs(slow, n - 1, n),
    partitions: win(slow),
    status: `fast loop done`,
    narration: `fast has reached the end of the array.`,
  });

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
  steps.push({
    line: 2,
    array: [...arr],
    pointers: ptrs(0, 0, n),
    highlight: { kind: "compare", indices: [0] },
    status: `read nums[0] = ${start}`,
    narration: `Both pointers begin at index 0 so we can read nums[0] = ${start}. Each value tells us the next index to jump to.`,
  });
  steps.push({
    line: 2,
    array: [...arr],
    pointers: ptrs(start, start, n),
    highlight: { kind: "compare", indices: [start] },
    status: `slow = fast = nums[0] = ${start}  → index ${start}`,
    narration: `slow and fast both jump to index ${start} (= nums[0]). Now Floyd's tortoise-and-hare begins.`,
  });

  let slow = start;
  let fast = start;

  for (let i = 0; i < n * 3; i++) {
    steps.push({
      line: 3,
      array: [...arr],
      pointers: ptrs(slow, fast, n),
      narration: "while True: start next iteration."
    });
    
    const ns = arr[slow];
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(ns, fast, n),
      highlight: { kind: "compare", indices: [ns, fast] },
      status: `slow: ${slow} → nums[${slow}] = ${ns}`,
      narration: `slow takes one step: nums[${slow}] = ${ns}.`,
    });
    const f1 = arr[fast];
    steps.push({
      line: 5,
      array: [...arr],
      pointers: ptrs(ns, f1, n),
      highlight: { kind: "compare", indices: [ns, f1] },
      status: `fast hop 1/2: ${fast} → nums[${fast}] = ${f1}`,
      narration: `fast starts a double hop. First: nums[${fast}] = ${f1}.`,
    });
    const f2 = arr[f1];
    steps.push({
      line: 5,
      array: [...arr],
      pointers: ptrs(ns, f2, n),
      highlight:
        ns === f2
          ? { kind: "match", indices: [ns] }
          : { kind: "compare", indices: [ns, f2] },
      status: `fast hop 2/2: ${f1} → nums[${f1}] = ${f2}`,
      narration:
        ns === f2
          ? `Second hop: nums[${f1}] = ${f2}. slow and fast meet at index ${ns} — a point inside the cycle.`
          : `Second hop: nums[${f1}] = ${f2}. Not equal yet — keep walking.`,
    });
    steps.push({
      line: 6,
      array: [...arr],
      pointers: ptrs(ns, f2, n),
      highlight:
        ns === f2
          ? { kind: "match", indices: [ns] }
          : { kind: "compare", indices: [ns, f2] },
      status:
        ns === f2
          ? `slow (${ns}) == fast (${f2}) → break`
          : `slow (${ns}) != fast (${f2}) → keep going`,
      narration:
        ns === f2
          ? `Check: slow == fast. Break out of phase 1.`
          : `Check: slow != fast. Continue the loop.`,
    });
    slow = ns;
    fast = f2;
    if (slow === fast) {
      steps.push({
        line: 7,
        array: [...arr],
        pointers: ptrs(slow, fast, n),
        narration: `break: slow equals fast, cycle detected.`
      });
      break;
    }
  }

  slow = arr[0];
  steps.push({
    line: 8,
    array: [...arr],
    pointers: ptrs(slow, fast, n),
    status: `reset slow = nums[0] = ${slow}`,
    narration:
      "Phase 2 — reset slow to nums[0]. Now advance both by one step. Where they meet is the cycle entrance = the duplicate value.",
  });

  for (let i = 0; i < n * 2 && slow !== fast; i++) {
    steps.push({
      line: 9,
      array: [...arr],
      pointers: ptrs(slow, fast, n),
      highlight: { kind: "compare", indices: [slow, fast] },
      status: `check: slow (${slow}) != fast (${fast}) → continue`,
      narration: `slow=${slow}, fast=${fast}. Not equal — take one step each.`,
    });
    const ns = arr[slow];
    steps.push({
      line: 10,
      array: [...arr],
      pointers: ptrs(ns, fast, n),
      highlight: { kind: "compare", indices: [ns, fast] },
      status: `slow: ${slow} → nums[${slow}] = ${ns}`,
      narration: `slow steps to nums[${slow}] = ${ns}.`,
    });
    const nf = arr[fast];
    steps.push({
      line: 11,
      array: [...arr],
      pointers: ptrs(ns, nf, n),
      highlight:
        ns === nf
          ? { kind: "match", indices: [ns] }
          : { kind: "compare", indices: [ns, nf] },
      status: `fast: ${fast} → nums[${fast}] = ${nf}`,
      narration:
        ns === nf
          ? `fast steps to nums[${fast}] = ${nf}. slow and fast meet at ${ns} — that's the cycle entry, i.e. the duplicate.`
          : `fast steps to nums[${fast}] = ${nf}.`,
    });
    slow = ns;
    fast = nf;
  }
  
  steps.push({
    line: 9,
    array: [...arr],
    pointers: ptrs(slow, fast, n),
    highlight: { kind: "match", indices: [slow] },
    status: `check: slow (${slow}) == fast (${fast}) → stop`,
    narration: `slow=${slow}, fast=${fast}. Equal! We found the duplicate.`,
  });

  steps.push({
    line: 12,
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
  title: "Same Direction - Slow & Fast",
  subtitle:
    "Two pointers walking the same way: slow tracks a frontier while fast scouts ahead - pick a problem and watch it unfold.",
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
