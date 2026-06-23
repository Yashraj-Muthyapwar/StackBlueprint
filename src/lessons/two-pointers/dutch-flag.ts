import type { ArrayStep, Lesson, Partition } from "../types";

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

function partitionsFor(low: number, mid: number, high: number, n: number): Partition[] {
  const out: Partition[] = [];
  if (low - 1 >= 0) out.push({ from: 0, to: low - 1, tone: "low", label: "< 1" });
  if (high + 1 <= n - 1) out.push({ from: high + 1, to: n - 1, tone: "high", label: "> 1" });
  if (mid - 1 >= low) out.push({ from: low, to: mid - 1, tone: "mid", label: "= 1" });
  return out;
}

function build(): ArrayStep[] {
  const arr = [2, 0, 2, 1, 1, 0, 0, 2, 1];
  const n = arr.length;
  const steps: ArrayStep[] = [];
  const ptr = (low: number, mid: number, high: number) => [
    { name: "low", index: low, color: "mint" as const, placement: "above" as const },
    { name: "mid", index: mid, color: "violet" as const, placement: "below" as const },
    { name: "high", index: high, color: "amber" as const, placement: "above" as const },
  ];

  const push = (s: Omit<ArrayStep, "array" | "partitions"> & {
    array?: number[];
    low: number;
    mid: number;
    high: number;
  }) => {
    const { low, mid, high, ...rest } = s;
    steps.push({
      ...rest,
      array: s.array ?? [...arr],
      partitions: partitionsFor(low, mid, high, n),
    });
  };

  push({
    line: 1,
    pointers: [],
    low: 0,
    mid: 0,
    high: n - 1,
    narration: "Sort an array of 0s, 1s, and 2s in a single pass — the Dutch National Flag problem.",
  });

  let low = 0;
  let mid = 0;
  let high = n - 1;

  push({
    line: 2,
    pointers: ptr(low, mid, high),
    low,
    mid,
    high,
    narration: "Three pointers: low boundary of 0s, mid scanner, high boundary of 2s.",
  });

  while (mid <= high) {
    push({
      line: 3,
      pointers: ptr(low, mid, high),
      low,
      mid,
      high,
      status: `mid=${mid} ≤ high=${high}?`,
      narration: `Loop guard: mid (${mid}) ≤ high (${high}). Continue.`,
    });

    push({
      line: 4,
      pointers: ptr(low, mid, high),
      low,
      mid,
      high,
      highlight: { kind: "compare", indices: [mid] },
      status: `arr[mid] = ${arr[mid]}`,
      narration: `Inspect arr[mid] = ${arr[mid]}.`,
    });

    if (arr[mid] === 0) {
      const before = [...arr];
      [arr[low], arr[mid]] = [arr[mid], arr[low]];
      push({
        line: 5,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        array: [...arr],
        highlight: { kind: "swap", indices: [low, mid] },
        status: `swap arr[${low}] ↔ arr[${mid}]`,
        narration:
          low === mid
            ? `It's a 0 — swap arr[${low}] with itself (no-op) to keep the rule.`
            : `It's a 0 — swap arr[${low}] (${before[low]}) with arr[${mid}] (${before[mid]}).`,
      });
      low += 1;
      mid += 1;
      push({
        line: 7,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        narration: `Advance both low → ${low} and mid → ${mid}.`,
      });
    } else if (arr[mid] === 1) {
      push({
        line: 8,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        status: "arr[mid] == 1",
        narration: "It's a 1 — already in its zone. Just advance mid.",
      });
      mid += 1;
      push({
        line: 9,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        narration: `mid → ${mid}.`,
      });
    } else {
      const before = [...arr];
      [arr[mid], arr[high]] = [arr[high], arr[mid]];
      push({
        line: 11,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        array: [...arr],
        highlight: { kind: "swap", indices: [mid, high] },
        status: `swap arr[${mid}] ↔ arr[${high}]`,
        narration: `It's a 2 — swap arr[${mid}] (${before[mid]}) with arr[${high}] (${before[high]}).`,
      });
      high -= 1;
      push({
        line: 12,
        pointers: ptr(low, mid, high),
        low,
        mid,
        high,
        narration: `Shrink high → ${high}. Don't advance mid — the swapped-in value is unverified.`,
      });
    }
  }

  push({
    line: 3,
    pointers: ptr(low, mid, high),
    low,
    mid,
    high,
    status: `mid=${mid} > high=${high}`,
    narration: "mid passed high — every element is now sorted into its zone.",
  });
  push({
    line: 13,
    pointers: ptr(low, mid, high),
    low,
    mid,
    high,
    narration: "Return the partitioned array.",
  });

  return steps;
}

export const dutchFlag: Lesson<ArrayStep> = {
  slug: "dutch-flag",
  title: "Two Pointers — Dutch Flag",
  subtitle:
    "Partition an array of 0s, 1s, and 2s into three zones using three pointers in a single pass.",
  variant: "dutch-flag",
  code,
  steps: build(),
};
