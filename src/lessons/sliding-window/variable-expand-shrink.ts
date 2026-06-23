import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; target: number };

const code = `def longest_subarray_at_most(arr, target):
    l = 0
    s = 0
    best = 0
    for r in range(len(arr)):
        s += arr[r]
        while s > target:
            s -= arr[l]
            l += 1
        best = max(best, r - l + 1)
    return best`;

function build({ arr, target }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  const ptrs = (l: number, r: number) => [
    { name: "l", index: l, color: "mint" as const },
    { name: "r", index: r, color: "amber" as const },
  ];
  const win = (l: number, r: number) =>
    r >= l ? [{ from: l, to: r, tone: "mid" as const, label: `window (sum)` }] : [];

  if (n === 0) {
    steps.push({ line: 1, narration: "Empty array.", pointers: [] });
    return steps;
  }
  let l = 0,
    s = 0,
    best = 0;
  steps.push({ line: 1, array: [...arr], pointers: ptrs(0, 0), narration: `Goal: longest contiguous subarray with sum ≤ ${target}.` });

  for (let r = 0; r < n; r++) {
    s += arr[r];
    steps.push({
      line: 5,
      array: [...arr],
      pointers: ptrs(l, r),
      partitions: win(l, r),
      highlight: { kind: "compare", indices: [r] },
      status: `s=${s}`,
      narration: `Expand: include arr[${r}]=${arr[r]}, sum=${s}.`,
    });
    while (s > target) {
      steps.push({
        line: 6,
        array: [...arr],
        pointers: ptrs(l, r),
        partitions: win(l, r),
        status: `s=${s} > ${target}`,
        narration: `Shrink: sum ${s} exceeds ${target}.`,
      });
      s -= arr[l];
      l += 1;
      steps.push({
        line: 7,
        array: [...arr],
        pointers: ptrs(l, r),
        partitions: win(l, r),
        status: `s=${s}`,
        narration: `Drop arr[${l - 1}]=${arr[l - 1]}, l→${l}.`,
      });
    }
    const len = r - l + 1;
    if (len > best) {
      best = len;
      steps.push({
        line: 9,
        array: [...arr],
        pointers: ptrs(l, r),
        partitions: win(l, r),
        highlight: { kind: "match", indices: Array.from({ length: len }, (_, i) => l + i) },
        status: `best=${best}`,
        narration: `New best length ${best}.`,
      });
    }
  }
  steps.push({ line: 10, array: [...arr], pointers: [], status: `return ${best}`, narration: `Answer: ${best}.` });
  return steps;
}

export const variableExpandShrink: LessonBuilder<Inputs> = {
  slug: "variable-expand-shrink",
  title: "Sliding Window — Variable (Expand & Shrink)",
  subtitle: "Expand the right edge; shrink from the left whenever a constraint is violated.",
  variant: "variable-expand-shrink",
  view: "array",
  code,
  defaultInputs: { arr: [2, 1, 4, 1, 1, 1, 2, 3], target: 6 },
  inputs: [
    { key: "arr", label: "Array (non-negative)", kind: "intArray" },
    { key: "target", label: "Sum cap (≤ target)", kind: "int" },
  ],
  validate: ({ arr }) => {
    const w: string[] = [];
    if (arr.some((v) => v < 0)) w.push("Expand-shrink relies on a monotonic metric. With negative values shrinking from the left may not restore the constraint.");
    return w;
  },
  build,
};
