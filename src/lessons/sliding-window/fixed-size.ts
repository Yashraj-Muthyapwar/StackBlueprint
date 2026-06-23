import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; k: number };

const code = `def max_window_sum(arr, k):
    s = sum(arr[:k])
    best = s
    for r in range(k, len(arr)):
        s += arr[r] - arr[r - k]
        if s > best:
            best = s
    return best`;

function build({ arr, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (k <= 0 || k > n) {
    steps.push({ line: 1, narration: "Invalid k for the array.", array: [...arr], pointers: [] });
    return steps;
  }
  const win = (l: number, r: number) =>
    [{ from: l, to: r, tone: "mid" as const, label: "window" }];
  const ptrs = (l: number, r: number) => [
    { name: "l", index: l, color: "mint" as const },
    { name: "r", index: r, color: "amber" as const },
  ];
  let s = 0;
  for (let i = 0; i < k; i++) s += arr[i];
  steps.push({
    line: 1,
    array: [...arr],
    pointers: ptrs(0, k - 1),
    partitions: win(0, k - 1),
    status: `s = ${s}`,
    narration: `Initial window [0..${k - 1}] sum = ${s}.`,
  });
  let best = s;
  steps.push({
    line: 2,
    array: [...arr],
    pointers: ptrs(0, k - 1),
    partitions: win(0, k - 1),
    status: `best = ${best}`,
    narration: `best = ${best}.`,
  });
  for (let r = k; r < n; r++) {
    const l = r - k + 1;
    steps.push({
      line: 3,
      array: [...arr],
      pointers: ptrs(l - 1, r),
      partitions: win(l - 1, r),
      highlight: { kind: "compare", indices: [r, l - 1] },
      narration: `Slide: include arr[${r}]=${arr[r]}, drop arr[${l - 1}]=${arr[l - 1]}.`,
    });
    s += arr[r] - arr[l - 1];
    steps.push({
      line: 4,
      array: [...arr],
      pointers: ptrs(l, r),
      partitions: win(l, r),
      status: `s = ${s}`,
      narration: `Window sum updated: ${s}.`,
    });
    if (s > best) {
      best = s;
      steps.push({
        line: 5,
        array: [...arr],
        pointers: ptrs(l, r),
        partitions: win(l, r),
        highlight: { kind: "match", indices: Array.from({ length: k }, (_, i) => l + i) },
        status: `best = ${best}`,
        narration: `New best = ${best}.`,
      });
    }
  }
  steps.push({
    line: 7,
    array: [...arr],
    pointers: [],
    status: `return ${best}`,
    narration: `Return ${best}.`,
  });
  return steps;
}

export const fixedSize: LessonBuilder<Inputs> = {
  slug: "fixed-size",
  title: "Sliding Window — Fixed Size",
  subtitle: "A window of size k slides across the array. Each step add the new element, drop the old one.",
  variant: "fixed-size",
  view: "array",
  code,
  defaultInputs: { arr: [2, 1, 5, 1, 3, 2, 7, 1], k: 3 },
  inputs: [
    { key: "arr", label: "Array", kind: "intArray" },
    { key: "k", label: "Window size k", kind: "int", min: 1 },
  ],
  validate: ({ arr, k }) => {
    const w: string[] = [];
    if (!Number.isInteger(k) || k < 1) w.push("k must be a positive integer.");
    else if (k > arr.length) w.push(`k (${k}) > array length (${arr.length}).`);
    return w;
  },
  build,
};
