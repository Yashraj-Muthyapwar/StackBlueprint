import type { LessonBuilder, Step } from "../types";

type Inputs = { p: string };

const code = `def failure(p):
    pi = [0] * len(p)
    k = 0
    for i in range(1, len(p)):
        while k > 0 and p[k] != p[i]:
            k = pi[k - 1]
        if p[k] == p[i]:
            k += 1
        pi[i] = k
    return pi`;

function build({ p }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = p.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty pattern.", array: arr, pointers: [] });
    return steps;
  }
  const pi = new Array<number>(n).fill(0);
  const piView = () => ({ label: "pi (failure function)", array: pi.slice() });
  const ptrs = (k: number, i: number) => [
    { name: "k", index: k, color: "mint" as const },
    { name: "i", index: i, color: "amber" as const, placement: "below" as const },
  ];

  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    secondary: piView(),
    narration: `Build failure function: pi[i] = length of longest proper prefix of p[0..i] that is also a suffix.`,
  });

  let k = 0;
  for (let i = 1; i < n; i++) {
    steps.push({
      line: 4,
      array: arr,
      pointers: ptrs(k, i),
      secondary: piView(),
      narration: `i=${i}, k=${k}. Try to extend the current matched prefix.`,
    });
    while (k > 0 && chars[k] !== chars[i]) {
      steps.push({
        line: 5,
        array: arr,
        pointers: ptrs(k, i),
        highlight: { kind: "swap", indices: [k, i] },
        secondary: piView(),
        status: `mismatch, fall back`,
        narration: `p[k=${k}]='${chars[k]}' ≠ p[i=${i}]='${chars[i]}'. Fall back: k = pi[${k - 1}] = ${pi[k - 1]}.`,
      });
      k = pi[k - 1];
    }
    if (chars[k] === chars[i]) {
      steps.push({
        line: 7,
        array: arr,
        pointers: ptrs(k, i),
        highlight: { kind: "match", indices: [k, i] },
        secondary: piView(),
        narration: `Match: extend prefix → k = ${k + 1}.`,
      });
      k += 1;
    }
    pi[i] = k;
    steps.push({
      line: 8,
      array: arr,
      pointers: ptrs(Math.max(0, k - 1), i),
      secondary: piView(),
      status: `pi[${i}] = ${k}`,
      narration: `pi[${i}] = ${k}.`,
    });
  }

  steps.push({
    line: 9,
    array: arr,
    pointers: [],
    secondary: piView(),
    status: `pi = [${pi.join(", ")}]`,
    narration: `Done. Use pi to skip work in the main search loop.`,
  });
  return steps;
}

export const kmp: LessonBuilder<Inputs> = {
  slug: "kmp",
  title: "Pattern Matching — KMP Failure Function",
  subtitle: "Precompute the longest proper prefix == suffix at every position so search never re-checks matched chars.",
  problem: "Build the KMP failure array pi for a pattern p, where pi[i] is the length of the longest proper prefix of p[0..i] that is also a suffix.",
  spotIt: [
    "Exact substring search where pattern reuse matters (many queries, one pattern).",
    "You need worst-case O(n+m) substring matching — no expected-time hashing.",
    "Phrases: 'implement strStr / indexOf', 'find all occurrences of P in T'.",
  ],
  avoidWhen: [
    "Pattern is tiny and built-in search is plenty fast.",
    "You need fuzzy / approximate matches — KMP is exact-only.",
    "Many patterns at once — use Aho-Corasick instead.",
  ],
  variant: "failure-function",
  view: "array",
  code,
  defaultInputs: { p: "ababaca" },
  inputs: [{ key: "p", label: "Pattern p", kind: "string" }],
  validate: ({ p }) => (p.length > 14 ? ["Trim to ≤ 14 chars for readable animation."] : []),
  build,
};
