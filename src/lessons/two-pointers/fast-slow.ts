import type { LessonBuilder, Step } from "../types";

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

function buildRemoveDuplicates(arr: number[]): Step[] {
  const steps: Step[] = [];
  const data = [...arr];
  const ptrs = (slow: number, fast: number) => [
    { name: "slow", index: slow, color: "mint" as const, placement: "below" as const },
    { name: "fast", index: fast, color: "amber" as const, placement: "above" as const },
  ];
  const win = (slow: number) =>
    slow >= 0
      ? [{ from: 0, to: slow, tone: "mid" as const, label: `unique [0..${slow}]` }]
      : [];

  if (data.length === 0) {
    steps.push({ line: 3, array: [], pointers: [], narration: "Empty array — return 0." });
    return steps;
  }

  let slow = 0;
  steps.push({
    line: 4,
    array: [...data],
    pointers: ptrs(slow, slow),
    partitions: win(slow),
    narration: "slow marks the last unique element. Start at index 0.",
  });

  for (let fast = 1; fast < data.length; fast++) {
    steps.push({
      line: 5,
      array: [...data],
      pointers: ptrs(slow, fast),
      partitions: win(slow),
      highlight: { kind: "compare", indices: [slow, fast] },
      status: `arr[slow]=${data[slow]}, arr[fast]=${data[fast]}`,
      narration: `Compare arr[slow]=${data[slow]} with arr[fast]=${data[fast]}.`,
    });
    if (data[fast] !== data[slow]) {
      slow += 1;
      data[slow] = data[fast];
      steps.push({
        line: 8,
        array: [...data],
        pointers: ptrs(slow, fast),
        partitions: win(slow),
        highlight: { kind: "swap", indices: [slow] },
        status: `new unique → arr[${slow}] = ${data[slow]}`,
        narration: `Different. Advance slow → ${slow} and copy value ${data[fast]} there.`,
      });
    } else {
      steps.push({
        line: 5,
        array: [...data],
        pointers: ptrs(slow, fast),
        partitions: win(slow),
        narration: `Same value — skip; slow stays at ${slow}.`,
      });
    }
  }
  steps.push({
    line: 9,
    array: [...data],
    pointers: ptrs(slow, data.length - 1),
    partitions: win(slow),
    status: `return ${slow + 1}`,
    narration: `Length of unique prefix = ${slow + 1}.`,
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
  const ptrs = (slow: number, fast: number) => [
    { name: "slow", index: slow, color: "mint" as const, placement: "below" as const },
    { name: "fast", index: fast, color: "amber" as const, placement: "above" as const },
  ];

  let slow = arr[0];
  let fast = arr[0];
  steps.push({
    line: 2,
    array: [...arr],
    pointers: ptrs(slow, fast),
    narration: "Treat each value as a 'next index'. slow & fast start at nums[0].",
  });

  // Phase 1 — find meeting point inside the cycle
  let guard = 0;
  while (guard++ < n * 3) {
    slow = arr[slow];
    fast = arr[arr[fast]];
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(slow, fast),
      highlight: slow === fast ? { kind: "match", indices: [slow] } : { kind: "compare", indices: [slow, fast] },
      status: `slow=${slow}, fast=${fast}`,
      narration:
        slow === fast
          ? `Phase 1 done — they meet at index ${slow} (somewhere inside the cycle).`
          : `slow jumps 1, fast jumps 2. slow=${slow}, fast=${fast}.`,
    });
    if (slow === fast) break;
  }

  // Phase 2 — find cycle entry (= duplicate value)
  slow = arr[0];
  steps.push({
    line: 7,
    array: [...arr],
    pointers: ptrs(slow, fast),
    narration: "Phase 2 — reset slow to nums[0]. Now both advance one step at a time.",
  });
  guard = 0;
  while (slow !== fast && guard++ < n * 3) {
    slow = arr[slow];
    fast = arr[fast];
    steps.push({
      line: 9,
      array: [...arr],
      pointers: ptrs(slow, fast),
      highlight: slow === fast ? { kind: "match", indices: [slow] } : { kind: "compare", indices: [slow, fast] },
      status: `slow=${slow}, fast=${fast}`,
      narration:
        slow === fast
          ? `They meet at ${slow} — that's the cycle entry, i.e. the duplicate value.`
          : `Step both. slow=${slow}, fast=${fast}.`,
    });
  }
  steps.push({
    line: 11,
    array: [...arr],
    pointers: ptrs(slow, fast),
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
