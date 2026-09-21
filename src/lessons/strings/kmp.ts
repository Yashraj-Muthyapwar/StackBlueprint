import type { LessonBuilder, Step } from "../types";

type Inputs = { p: string };

const code = `def failure(pattern):
    lps = [0] * len(pattern)
    matched = 0
    for i in range(1, len(pattern)):
        while matched > 0 and pattern[matched] != pattern[i]:
            matched = lps[matched - 1]
        if pattern[matched] == pattern[i]:
            matched += 1
        lps[i] = matched
    return lps`;

function build({ p }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = p.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty pattern.", array: arr, pointers: [] });
    return steps;
  }
  const lps = new Array<number>(n).fill(0);
  const lpsView = () => ({ label: "lps (failure function)", array: lps.slice() });
  const ptrs = (matched: number, i: number) => [
    { name: "matched", index: matched, color: "mint" as const },
    { name: "i", index: i, color: "amber" as const, placement: "below" as const },
  ];

  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    secondary: lpsView(),
    narration: `Build failure function: lps[i] = length of longest proper prefix of pattern[0..i] that is also a suffix.`,
  });

  let matched = 0;
  for (let i = 1; i < n; i++) {
    steps.push({
      line: 4,
      array: arr,
      pointers: ptrs(matched, i),
      secondary: lpsView(),
      narration: `i=${i}, matched=${matched}. Try to extend the current matched prefix.`,
    });
    while (matched > 0 && chars[matched] !== chars[i]) {
      steps.push({
        line: 5,
        array: arr,
        pointers: ptrs(matched, i),
        highlight: { kind: "swap", indices: [matched, i] },
        secondary: lpsView(),
        status: `mismatch, fall back`,
        narration: `pattern[matched=${matched}]='${chars[matched]}' ≠ pattern[i=${i}]='${chars[i]}'. Fall back: matched = lps[${matched - 1}] = ${lps[matched - 1]}.`,
      });
      matched = lps[matched - 1];
    }
    if (chars[matched] === chars[i]) {
      steps.push({
        line: 7,
        array: arr,
        pointers: ptrs(matched, i),
        highlight: { kind: "match", indices: [matched, i] },
        secondary: lpsView(),
        narration: `Match: extend prefix → matched = ${matched + 1}.`,
      });
      matched += 1;
    }
    lps[i] = matched;
    steps.push({
      line: 8,
      array: arr,
      pointers: ptrs(Math.max(0, matched - 1), i),
      secondary: lpsView(),
      status: `lps[${i}] = ${matched}`,
      narration: `lps[${i}] = ${matched}.`,
    });
  }

  steps.push({
    line: 9,
    array: arr,
    pointers: [],
    secondary: lpsView(),
    status: `lps = [${lps.join(", ")}]`,
    narration: `Done. Use lps to skip work in the main search loop.`,
  });
  return steps;
}

export const kmp: LessonBuilder<Inputs> = {
  slug: "kmp",
  title: "Pattern Matching — KMP Failure Function",
  subtitle:
    "Precompute the longest proper prefix == suffix at every position so search never re-checks matched chars.",
  problem:
    "Build the KMP failure array lps for a pattern, where lps[i] is the length of the longest proper prefix of pattern[0..i] that is also a suffix.",
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
