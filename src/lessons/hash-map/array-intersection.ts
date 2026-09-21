import type { LessonBuilder, Step } from "../types";

type Inputs = { a: number[]; b: number[] };

const code = `def intersection(a, b):
    smaller, larger = (a, b) if len(a) <= len(b) else (b, a)
    seen = set(smaller)
    out = set()
    for num in larger:
        if num in seen:
            out.add(num)
    return list(out)`;

function build({ a, b }: Inputs): Step[] {
  const steps: Step[] = [];
  // hash the smaller side
  const [small, big] = a.length <= b.length ? [a, b] : [b, a];
  const arr = big as (number | string)[];
  const seen = new Set<number>(small);
  steps.push({
    line: 3,
    array: arr,
    pointers: [],
    secondary: { label: `set(smaller=${a === small ? "A" : "B"})`, array: [...seen].map(String) },
    narration: `Hash the smaller array (${small.length} elements). Probe the larger.`,
  });
  const out = new Set<number>();
  const matchIdx: number[] = [];
  for (let i = 0; i < big.length; i++) {
    const num = big[i];
    const hit = seen.has(num);
    if (hit) {
      out.add(num);
      matchIdx.push(i);
    }
    steps.push({
      line: 5,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: hit ? { kind: "match", indices: [i] } : { kind: "compare", indices: [i] },
      secondary: { label: `out { ${out.size} }`, array: [...out].map(String) },
      status: hit ? `hit ${num}` : `miss`,
      narration: hit ? `${num} is in the set — add to result.` : `${num} not in set — skip.`,
    });
  }
  steps.push({
    line: 8,
    array: arr,
    pointers: [],
    highlight: { kind: "match", indices: matchIdx },
    secondary: { label: "return", array: [...out].map(String) },
    status: `|∩| = ${out.size}`,
    narration: `Intersection = {${[...out].join(", ")}}.`,
  });
  return steps;
}

export const arrayIntersection: LessonBuilder<Inputs> = {
  slug: "array-intersection",
  title: "Hash Set — Intersection of Two Arrays",
  subtitle: "Hash the smaller side, probe the larger — O(n + m) with no sort.",
  problem: "Given two arrays a and b, return the set of values appearing in both.",
  spotIt: [
    "You need overlap/union/difference of two unordered collections.",
    "Either array is too large to sort comfortably, but membership tests are cheap.",
    "Output must be deduplicated.",
  ],
  avoidWhen: [
    "Multiplicities matter — use a multiset (counts), not a set.",
    "Inputs are already sorted — two pointers is O(n+m) with no extra memory.",
    "Values are unhashable (complex objects without a stable key).",
  ],
  variant: "hash-set",
  view: "array",
  code,
  defaultInputs: { a: [1, 2, 2, 4, 5], b: [2, 3, 4, 4, 6, 7] },
  inputs: [
    { key: "a", label: "a", kind: "intArray" },
    { key: "b", label: "b", kind: "intArray" },
  ],
  validate: ({ a, b }) => (a.length + b.length > 20 ? ["Trim combined size to ≤ 20."] : []),
  build,
};
