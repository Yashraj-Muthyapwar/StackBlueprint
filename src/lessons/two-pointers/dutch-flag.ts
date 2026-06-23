import type { LessonBuilder, Partition, Step } from "../types";

type Inputs = { arr: number[] };

const code = `def dutch_flag(arr):
    low, mid, high = 0, 0, len(arr) - 1
    while mid <= high:
        if arr[mid] == 0:
            arr[low], arr[mid] = arr[mid], arr[low]
            low += 1
            mid += 1
        elif arr[mid] == 1:
            mid += 1
        else:
            arr[mid], arr[high] = arr[high], arr[mid]
            high -= 1
    return arr`;

function parts(low: number, mid: number, high: number, n: number): Partition[] {
  const out: Partition[] = [];
  if (low - 1 >= 0) out.push({ from: 0, to: low - 1, tone: "low", label: "= 0" });
  if (high + 1 <= n - 1) out.push({ from: high + 1, to: n - 1, tone: "high", label: "= 2" });
  if (mid - 1 >= low) out.push({ from: low, to: mid - 1, tone: "mid", label: "= 1" });
  return out;
}

function build({ arr: input }: Inputs): Step[] {
  const arr = [...input];
  const n = arr.length;
  const steps: Step[] = [];
  const ptr = (low: number, mid: number, high: number) => [
    { name: "low", index: low, color: "mint" as const, placement: "above" as const },
    { name: "mid", index: mid, color: "violet" as const, placement: "below" as const },
    { name: "high", index: high, color: "amber" as const, placement: "above" as const },
  ];
  const push = (s: Omit<Step, "array" | "partitions"> & { low: number; mid: number; high: number; array?: number[] }) => {
    const { low, mid, high, ...rest } = s;
    steps.push({ ...rest, array: s.array ?? [...arr], partitions: parts(low, mid, high, n) });
  };

  if (n === 0) {
    steps.push({ line: 1, narration: "Empty array.", pointers: [] });
    return steps;
  }

  push({ line: 1, pointers: [], low: 0, mid: 0, high: n - 1, narration: "Sort 0s, 1s, 2s in one pass." });
  let low = 0,
    mid = 0,
    high = n - 1;
  push({ line: 2, pointers: ptr(low, mid, high), low, mid, high, narration: "Three pointers: low (0-zone), mid (scanner), high (2-zone)." });

  let safety = 0;
  while (mid <= high && safety++ < 500) {
    push({ line: 3, pointers: ptr(low, mid, high), low, mid, high, status: `mid=${mid} ≤ high=${high}`, narration: "Loop guard holds." });
    push({
      line: 4,
      pointers: ptr(low, mid, high),
      low,
      mid,
      high,
      highlight: { kind: "compare", indices: [mid] },
      status: `arr[mid]=${arr[mid]}`,
      narration: `Inspect arr[mid] = ${arr[mid]}.`,
    });
    if (arr[mid] === 0) {
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      push({
        line: 5,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        array: [...arr],
        highlight: { kind: "swap", indices: [low, mid] },
        narration: `Swap arr[${low}] ↔ arr[${mid}]. Advance low and mid.`,
      });
      low += 1;
      mid += 1;
    } else if (arr[mid] === 1) {
      push({ line: 9, pointers: ptr(low, mid, high), low, mid, high, narration: "It's a 1 — already correct, advance mid." });
      mid += 1;
    } else {
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      push({
        line: 11,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        array: [...arr],
        highlight: { kind: "swap", indices: [mid, high] },
        narration: `It's a 2 — swap with arr[${high}], shrink high. Don't advance mid.`,
      });
      high -= 1;
    }
  }
  push({ line: 13, pointers: ptr(low, mid, high), low, mid, high, narration: "Partitioned into three zones." });
  return steps;
}

export const dutchFlag: LessonBuilder<Inputs> = {
  slug: "dutch-flag",
  title: "Two Pointers — Dutch Flag",
  subtitle: "Partition an array of 0s, 1s, and 2s into three zones using three pointers in a single pass.",
  variant: "dutch-flag",
  view: "array",
  code,
  defaultInputs: { arr: [2, 0, 2, 1, 1, 0, 0, 2, 1] },
  inputs: [{ key: "arr", label: "Array (values 0/1/2)", kind: "intArray" }],
  zvalidate: ({ arr }) => {
    const w: string[] = [];
    const bad = arr.filter((v) => v !== 0 && v !== 1 && v !== 2);
    if (bad.length) w.push(`Dutch Flag expects only 0/1/2. Found: ${[...new Set(bad)].join(", ")}.`);
    if (arr.length > 16) w.push("For readability, keep length ≤ 16.");
    return w;
  },
  build,
};
