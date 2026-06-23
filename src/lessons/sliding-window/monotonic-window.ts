import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; k: number };

const code = `def max_sliding_window(arr, k):
    dq = deque()  # stores indices, values decreasing
    out = []
    for r in range(len(arr)):
        while dq and arr[dq[-1]] < arr[r]:
            dq.pop()
        dq.append(r)
        if dq[0] <= r - k:
            dq.popleft()
        if r >= k - 1:
            out.append(arr[dq[0]])
    return out`;

function build({ arr, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (k <= 0 || k > n) {
    steps.push({ line: 1, narration: "Invalid k.", array: [...arr], pointers: [] });
    return steps;
  }
  const dq: number[] = [];
  const out: number[] = [];
  const win = (r: number) => {
    const l = Math.max(0, r - k + 1);
    return [{ from: l, to: r, tone: "mid" as const, label: "window" }];
  };
  const secondary = () => ({
    label: `deque (indices, values decreasing)  ·  output`,
    array: dq.map((i) => `${i}:${arr[i]}`),
    pointers: dq.length
      ? [{ name: "front", index: 0, color: "mint" as const }, { name: "back", index: dq.length - 1, color: "amber" as const }]
      : [],
  });

  for (let r = 0; r < n; r++) {
    steps.push({
      line: 3,
      array: [...arr],
      pointers: [{ name: "r", index: r, color: "amber" }],
      partitions: win(r),
      highlight: { kind: "compare", indices: [r] },
      secondary: secondary(),
      narration: `r=${r}, value=${arr[r]}.`,
    });
    while (dq.length && arr[dq[dq.length - 1]] < arr[r]) {
      const popped = dq.pop()!;
      steps.push({
        line: 4,
        array: [...arr],
        pointers: [{ name: "r", index: r, color: "amber" }],
        partitions: win(r),
        secondary: secondary(),
        status: `pop ${popped}:${arr[popped]} < ${arr[r]}`,
        narration: `Pop ${popped} from back — its value ${arr[popped]} can never beat ${arr[r]}.`,
      });
    }
    dq.push(r);
    steps.push({
      line: 5,
      array: [...arr],
      pointers: [{ name: "r", index: r, color: "amber" }],
      partitions: win(r),
      secondary: secondary(),
      narration: `Push ${r} to back.`,
    });
    if (dq[0] <= r - k) {
      const out0 = dq.shift()!;
      steps.push({
        line: 6,
        array: [...arr],
        pointers: [{ name: "r", index: r, color: "amber" }],
        partitions: win(r),
        secondary: secondary(),
        narration: `Front index ${out0} fell out of the window — popleft.`,
      });
    }
    if (r >= k - 1) {
      out.push(arr[dq[0]]);
      steps.push({
        line: 8,
        array: [...arr],
        pointers: [{ name: "r", index: r, color: "amber" }],
        partitions: win(r),
        secondary: { label: `output`, array: [...out] },
        highlight: { kind: "match", indices: [dq[0]] },
        status: `max=${arr[dq[0]]}`,
        narration: `Window max = arr[${dq[0]}] = ${arr[dq[0]]}.`,
      });
    }
  }
  steps.push({
    line: 9,
    array: [...arr],
    secondary: { label: `output`, array: [...out] },
    status: `return ${JSON.stringify(out)}`,
    narration: `Done. Output ${JSON.stringify(out)}.`,
    pointers: [],
  });
  return steps;
}

export const monotonicWindow: LessonBuilder<Inputs> = {
  slug: "monotonic-window",
  title: "Sliding Window — Monotonic Deque",
  subtitle: "Maintain a deque of decreasing values so the front is always the window's max.",
  problem: "Given an array and a window size k, return the maximum of every contiguous subarray of length k in O(n) time.",
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
    if (k < 1) w.push("k must be ≥ 1.");
    else if (k > arr.length) w.push("k must be ≤ array length.");
    return w;
  },
  build,
};
