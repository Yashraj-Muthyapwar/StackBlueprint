import type { LessonBuilder, Step } from "../types";

type Inputs = { n: number };

const code = `def is_happy(n):
    seen = set()
    current = n
    while current != 1 and current not in seen:
        seen.add(current)
        current = sum(int(d) ** 2 for d in str(current))
    return current == 1`;

function sumSquares(n: number): number {
  let s = 0;
  while (n > 0) { const d = n % 10; s += d * d; n = (n - d) / 10; }
  return s;
}

function build({ n }: Inputs): Step[] {
  const steps: Step[] = [];
  const seen = new Set<number>();
  const trail: number[] = [n];
  let currentValue = n;
  steps.push({
    line: 1,
    array: trail as (number | string)[],
    pointers: [{ name: "n", index: 0, color: "amber" }],
    secondary: { label: "seen states", array: [] },
    narration: `Track each state in a set; stop when we hit 1 or repeat.`,
  });
  let guard = 0;
  while (currentValue !== 1 && !seen.has(currentValue) && guard++ < 40) {
    seen.add(currentValue);
    const nextValue = sumSquares(currentValue);
    trail.push(nextValue);
    steps.push({
      line: 5,
      array: trail as (number | string)[],
      pointers: [{ name: "current", index: trail.length - 1, color: "amber" }],
      highlight: { kind: "compare", indices: [trail.length - 1] },
      secondary: { label: `seen { ${seen.size} }`, array: [...seen].map(String) },
      status: `${currentValue} → ${nextValue}`,
      narration: `Square-sum digits of ${currentValue} → ${nextValue}.`,
    });
    currentValue = nextValue;
  }
  const happy = currentValue === 1;
  steps.push({
    line: 6,
    array: trail as (number | string)[],
    pointers: [],
    highlight: { kind: happy ? "match" : "swap", indices: [trail.length - 1] },
    secondary: { label: `seen { ${seen.size} }`, array: [...seen].map(String) },
    status: happy ? "happy ✓" : "cycle ✗",
    narration: happy
      ? `Reached 1 — ${n} is happy.`
      : `Hit a state already in the set — cycle detected, not happy.`,
  });
  return steps;
}

export const happyNumber: LessonBuilder<Inputs> = {
  slug: "happy-number",
  title: "Hash Set — Tracking Unique Visited States",
  subtitle: "Detect cycles in a deterministic process by remembering every state you have seen.",
  problem: "Starting from n, replace it by the sum of squares of its digits. n is 'happy' iff this reaches 1.",
  spotIt: [
    "A deterministic transition function f(x) → x' that either terminates or loops.",
    "You don't have an upper bound on iterations but the state space is finite.",
    "Question reduces to 'do we ever revisit a state?'.",
  ],
  avoidWhen: [
    "State space is huge or unhashable — use Floyd's tortoise & hare cycle detection.",
    "You need to recover the cycle's structure (length, entry) — fast/slow pointers give it cleanly.",
    "Transitions are non-deterministic — sets cannot prove there is no cycle.",
  ],
  variant: "hash-set",
  view: "array",
  code,
  defaultInputs: { n: 19 },
  inputs: [{ key: "n", label: "n", kind: "int", min: 1, max: 9999 }],
  build,
};
