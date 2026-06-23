import type { ArrayStep, Lesson } from "../types";

const code = `def two_sum(arr, target):
    l, r = 0, len(arr) - 1
    while l < r:
        s = arr[l] + arr[r]
        if s == target:
            return (l, r)
        if s < target:
            l += 1
        else:
            r -= 1
    return None`;

function build(): ArrayStep[] {
  const arr = [1, 3, 4, 5, 7, 10, 11];
  const target = 9;
  const steps: ArrayStep[] = [];

  const push = (s: Omit<ArrayStep, "array"> & { array?: number[] }) =>
    steps.push({ ...s, array: s.array ?? [...arr] });

  push({
    line: 1,
    pointers: [],
    narration: `Goal: find two indices in a sorted array whose values sum to ${target}.`,
  });

  let l = 0;
  let r = arr.length - 1;

  push({
    line: 2,
    pointers: [
      { name: "l", index: l, color: "mint" },
      { name: "r", index: r, color: "amber" },
    ],
    narration: "Place l at the start and r at the end. They will converge.",
  });

  while (l < r) {
    push({
      line: 3,
      pointers: [
        { name: "l", index: l, color: "mint" },
        { name: "r", index: r, color: "amber" },
      ],
      narration: `Loop guard: l (${l}) < r (${r})? Yes, continue.`,
    });

    const s = arr[l] + arr[r];
    push({
      line: 4,
      pointers: [
        { name: "l", index: l, color: "mint" },
        { name: "r", index: r, color: "amber" },
      ],
      highlight: { kind: "compare", indices: [l, r] },
      status: `arr[${l}] + arr[${r}] = ${arr[l]} + ${arr[r]} = ${s}`,
      narration: `Add the values at both pointers: ${arr[l]} + ${arr[r]} = ${s}.`,
    });

    push({
      line: 5,
      pointers: [
        { name: "l", index: l, color: "mint" },
        { name: "r", index: r, color: "amber" },
      ],
      status: `${s} == ${target}?`,
      narration:
        s === target
          ? `${s} equals ${target} — pair found.`
          : `${s} ≠ ${target}, keep scanning.`,
    });

    if (s === target) {
      push({
        line: 6,
        pointers: [
          { name: "l", index: l, color: "mint" },
          { name: "r", index: r, color: "amber" },
        ],
        highlight: { kind: "match", indices: [l, r] },
        status: `return (${l}, ${r})`,
        narration: `Return the matching indices (${l}, ${r}).`,
      });
      return steps;
    }

    push({
      line: 7,
      pointers: [
        { name: "l", index: l, color: "mint" },
        { name: "r", index: r, color: "amber" },
      ],
      status: `${s} < ${target}?`,
      narration:
        s < target
          ? `${s} is smaller than ${target} — we need a larger sum.`
          : `${s} is larger than ${target} — we need a smaller sum.`,
    });

    if (s < target) {
      push({
        line: 8,
        pointers: [
          { name: "l", index: l + 1, color: "mint" },
          { name: "r", index: r, color: "amber" },
        ],
        narration: "Move l one step right — larger values lie ahead.",
      });
      l += 1;
    } else {
      push({
        line: 10,
        pointers: [
          { name: "l", index: l, color: "mint" },
          { name: "r", index: r - 1, color: "amber" },
        ],
        narration: "Move r one step left — smaller values lie behind.",
      });
      r -= 1;
    }
  }

  push({
    line: 11,
    pointers: [
      { name: "l", index: l, color: "mint" },
      { name: "r", index: r, color: "amber" },
    ],
    narration: "Pointers crossed without a match. Return None.",
  });
  return steps;
}

export const oppositeEnds: Lesson<ArrayStep> = {
  slug: "opposite-ends",
  title: "Two Pointers — Opposite Ends",
  subtitle:
    "Two indices start at opposite ends of a sorted array and walk toward each other based on a comparison.",
  variant: "opposite-ends",
  code,
  steps: build(),
};
