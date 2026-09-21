import type { LessonBuilder, Step } from "../types";

type Inputs = { arr: number[]; k: number };

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

function build({ arr, k }: Inputs): Step[] {
  const steps: Step[] = [];
  const n = arr.length;
  if (k <= 0 || k > n) {
    steps.push({ line: 1, narration: "Invalid k.", array: [...arr], pointers: [] });
    return steps;
  }
  const window_dq: number[] = [];
  const out: number[] = [];
  const win = (right: number) => {
    const left = Math.max(0, right - k + 1);
    return [{ from: left, to: right, tone: "mid" as const, label: "window" }];
  };
  const secondary = () => ({
    label: `deque (indices, values decreasing)  ·  output`,
    array: window_dq.map((i) => `${i}:${arr[i]}`),
    pointers: window_dq.length
      ? [
          { name: "front", index: 0, color: "mint" as const },
          { name: "back", index: window_dq.length - 1, color: "amber" as const },
        ]
      : [],
  });

  steps.push({
    line: 2,
    array: [...arr],
    pointers: [],
    secondary: secondary(),
    narration: `Initialize empty deque and output array.`,
  });

  for (let right = 0; right < n; right++) {
    steps.push({
      line: 4,
      array: [...arr],
      pointers: [{ name: "right", index: right, color: "amber" }],
      partitions: win(Math.max(0, right - 1)),
      secondary: secondary(),
      narration: `Advance right pointer to index ${right}.`,
    });
    steps.push({
      line: 5,
      array: [...arr],
      pointers: [{ name: "right", index: right, color: "amber" }],
      partitions: win(right),
      highlight: { kind: "compare", indices: [right] },
      secondary: secondary(),
      narration: `Check if deque back value is less than arr[${right}] = ${arr[right]}.`,
    });
    while (window_dq.length && arr[window_dq[window_dq.length - 1]] < arr[right]) {
      const popped = window_dq.pop()!;
      steps.push({
        line: 6,
        array: [...arr],
        pointers: [{ name: "right", index: right, color: "amber" }],
        partitions: win(right),
        secondary: secondary(),
        status: `pop ${popped}:${arr[popped]} < ${arr[right]}`,
        narration: `Pop ${popped} from back because ${arr[popped]} < ${arr[right]}.`,
      });
      steps.push({
        line: 5,
        array: [...arr],
        pointers: [{ name: "right", index: right, color: "amber" }],
        partitions: win(right),
        highlight: { kind: "compare", indices: [right] },
        secondary: secondary(),
        narration: `Check if new deque back value is less than ${arr[right]}.`,
      });
    }
    window_dq.push(right);
    steps.push({
      line: 7,
      array: [...arr],
      pointers: [{ name: "right", index: right, color: "amber" }],
      partitions: win(right),
      secondary: secondary(),
      narration: `Push index ${right} to the back of the deque.`,
    });

    steps.push({
      line: 8,
      array: [...arr],
      pointers: [{ name: "right", index: right, color: "amber" }],
      partitions: win(right),
      secondary: secondary(),
      narration: `Check if front of deque (index ${window_dq[0]}) is outside the window.`,
    });
    if (window_dq[0] <= right - k) {
      const out0 = window_dq.shift()!;
      steps.push({
        line: 9,
        array: [...arr],
        pointers: [{ name: "right", index: right, color: "amber" }],
        partitions: win(right),
        secondary: secondary(),
        narration: `Index ${out0} fell out of the window. Pop it from the front.`,
      });
    }

    steps.push({
      line: 10,
      array: [...arr],
      pointers: [{ name: "right", index: right, color: "amber" }],
      partitions: win(right),
      secondary: secondary(),
      narration: `Check if window has reached size ${k} (right >= ${k - 1}).`,
    });
    if (right >= k - 1) {
      out.push(arr[window_dq[0]]);
      steps.push({
        line: 11,
        array: [...arr],
        pointers: [{ name: "right", index: right, color: "amber" }],
        partitions: win(right),
        secondary: { label: `output`, array: [...out] },
        highlight: { kind: "match", indices: [window_dq[0]] },
        status: `max=${arr[window_dq[0]]}`,
        narration: `Append max value arr[${window_dq[0]}] = ${arr[window_dq[0]]} to output.`,
      });
    }
  }
  steps.push({
    line: 12,
    array: [...arr],
    secondary: { label: `output`, array: [...out] },
    status: `return ${JSON.stringify(out)}`,
    narration: `Done. Return ${JSON.stringify(out)}.`,
    pointers: [],
  });
  return steps;
}

export const monotonicWindow: LessonBuilder<Inputs> = {
  slug: "monotonic-window",
  title: "Sliding Window — Monotonic Deque",
  subtitle: "Maintain a deque of decreasing values so the front is always the window's max.",
  problem:
    "Given an array and a window size k, return the maximum of every contiguous subarray of length k in O(n) time.",
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
