import type { LessonBuilder, Step } from "../types";
import { isSortedAsc } from "../util";

type Inputs = { arr: number[]; target: number };

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

function build({ arr, target }: Inputs): Step[] {
  const steps: Step[] = [];
  const ptrs = (l: number, r: number) => [
    { name: "l", index: l, color: "mint" as const },
    { name: "r", index: r, color: "amber" as const },
  ];
  const push = (s: Omit<Step, "array"> & { array?: number[] }) =>
    steps.push({ ...s, array: s.array ?? [...arr] });

  if (arr.length < 2) {
    push({ line: 1, pointers: [], narration: "Need at least two elements." });
    return steps;
  }

  push({ line: 1, pointers: [], narration: `Find two indices whose values sum to ${target}.` });

  let l = 0,
    r = arr.length - 1;
  push({ line: 2, pointers: ptrs(l, r), narration: "Place l at the start and r at the end." });

  let safety = 0;
  while (l < r && safety++ < 200) {
    push({ line: 3, pointers: ptrs(l, r), narration: `Guard: l (${l}) < r (${r}).` });
    const s = arr[l] + arr[r];
    push({
      line: 4,
      pointers: ptrs(l, r),
      highlight: { kind: "compare", indices: [l, r] },
      status: `${arr[l]} + ${arr[r]} = ${s}`,
      narration: `Sum at pointers: ${arr[l]} + ${arr[r]} = ${s}.`,
    });
    if (s === target) {
      push({
        line: 5,
        pointers: ptrs(l, r),
        highlight: { kind: "match", indices: [l, r] },
        status: `return (${l}, ${r})`,
        narration: `${s} equals target — return (${l}, ${r}).`,
      });
      return steps;
    }
    if (s < target) {
      push({ line: 7, pointers: ptrs(l, r), narration: `${s} < ${target} — need larger sum, l += 1.` });
      l += 1;
      push({ line: 8, pointers: ptrs(l, r), narration: `l → ${l}.` });
    } else {
      push({ line: 9, pointers: ptrs(l, r), narration: `${s} > ${target} — need smaller sum, r -= 1.` });
      r -= 1;
      push({ line: 10, pointers: ptrs(l, r), narration: `r → ${r}.` });
    }
  }
  push({ line: 11, pointers: ptrs(l, r), narration: "Pointers crossed — no pair found, return None." });
  return steps;
}

export const oppositeEnds: LessonBuilder<Inputs> = {
  slug: "opposite-ends",
  title: "Two Pointers — Opposite Ends",
  subtitle: "Two indices start at opposite ends of a sorted array and walk toward each other based on a comparison.",
  variant: "opposite-ends",
  view: "array",
  code,
  defaultInputs: { arr: [1, 3, 4, 5, 7, 10, 11], target: 9 },
  inputs: [
    { key: "arr", label: "Array (sorted)", kind: "intArray", help: "comma-separated" },
    { key: "target", label: "Target sum", kind: "int" },
  ],
  zvalidate: ({ arr, target }) => {
    const w: string[] = [];
    if (!isSortedAsc(arr)) w.push("Two-Sum with opposite-ends pointers requires a sorted array. With an unsorted array the algorithm can miss valid pairs or report wrong indices.");
    if (arr.length < 2) w.push("Array has fewer than 2 elements.");
    if (!Number.isInteger(target)) w.push("Target should be an integer.");
    return w;
  },
  build,
};
