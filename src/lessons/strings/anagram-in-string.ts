import type { LessonBuilder, Step } from "../types";

type Inputs = { s1: string; s2: string };

const code = `def check_inclusion(pattern, text):
    if len(pattern) > len(text): return False
    need = [0] * 26
    have = [0] * 26
    for char in pattern:
        need[ord(char) - 97] += 1
    k = len(pattern)
    for i in range(len(text)):
        have[ord(text[i]) - 97] += 1
        if i >= k:
            have[ord(text[i - k]) - 97] -= 1
        if i >= k - 1 and have == need:
            return True
    return False`;

function build({ s1, s2 }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s2.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  const k = s1.length;

  if (k === 0 || k > n) {
    steps.push({
      line: 2,
      narration: "pattern longer than text (or empty) — return False.",
      array: arr,
      pointers: [],
    });
    return steps;
  }

  const need = new Array<number>(26).fill(0);
  const have = new Array<number>(26).fill(0);
  for (const c of s1) need[c.charCodeAt(0) - 97] += 1;

  const fmtCounts = (a: number[]) =>
    a
      .map((v, i) => (v > 0 ? `${String.fromCharCode(97 + i)}×${v}` : null))
      .filter(Boolean) as string[];

  const secondaryHave = () => ({ label: "have (window counts)", array: fmtCounts(have) });
  const secondaryNeed = { label: `need (pattern="${s1}")`, array: fmtCounts(need) };

  steps.push({
    line: 5,
    array: arr,
    pointers: [],
    secondary: secondaryNeed,
    narration: `Build need from pattern="${s1}". Window size k=${k}.`,
  });

  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];
  const win = (left: number, right: number) => [
    { from: left, to: right, tone: "mid" as const, label: "window" },
  ];

  for (let i = 0; i < n; i++) {
    const cIn = chars[i];
    have[cIn.charCodeAt(0) - 97] += 1;
    const left = Math.max(0, i - k + 1);
    steps.push({
      line: 9,
      array: arr,
      pointers: ptrs(left, i),
      partitions: win(left, i),
      highlight: { kind: "compare", indices: [i] },
      secondary: secondaryHave(),
      narration: `i=${i}, include '${cIn}'.`,
    });
    if (i >= k) {
      const out = chars[i - k];
      have[out.charCodeAt(0) - 97] -= 1;
      steps.push({
        line: 11,
        array: arr,
        pointers: ptrs(left, i),
        partitions: win(left, i),
        highlight: { kind: "swap", indices: [i - k] },
        secondary: secondaryHave(),
        narration: `Drop '${out}' (left of window).`,
      });
    }
    if (i >= k - 1) {
      const equal = need.every((v, j) => v === have[j]);
      if (equal) {
        steps.push({
          line: 12,
          array: arr,
          pointers: ptrs(left, i),
          partitions: win(left, i),
          highlight: { kind: "match", indices: Array.from({ length: k }, (_, j) => left + j) },
          secondary: secondaryHave(),
          status: `match at left=${left}`,
          narration: `Window "${chars.slice(left, i + 1).join("")}" matches need — return True.`,
        });
        return steps;
      }
    }
  }
  steps.push({
    line: 14,
    array: arr,
    pointers: [],
    secondary: secondaryHave(),
    status: "False",
    narration: "No window matched — return False.",
  });
  return steps;
}

export const anagramInString: LessonBuilder<Inputs> = {
  slug: "anagram-in-string",
  title: "Sliding Window — Permutation In String",
  subtitle: "Slide a fixed window of size |pattern| across text and compare character counts.",
  problem:
    "Given two strings pattern and text, return True iff some permutation of pattern appears as a substring of text.",
  spotIt: [
    "Asks 'does any permutation / anagram of P appear in T?'",
    "Constraint is an equal-multiset condition over a fixed-length window.",
    "Phrases: 'permutation in string', 'find all anagrams in a string'.",
  ],
  avoidWhen: [
    "Order matters — use a substring search (KMP, Z, Rabin-Karp).",
    "Alphabet is huge — switch to a hash of (char → count).",
    "Window size varies — use the variable-size sliding window template.",
  ],
  variant: "fixed-window",
  view: "array",
  code,
  defaultInputs: { s1: "ab", s2: "eidbaooo" },
  inputs: [
    { key: "s1", label: "Pattern s1", kind: "string" },
    { key: "s2", label: "Text s2", kind: "string" },
  ],
  validate: ({ s1, s2 }) => {
    const w: string[] = [];
    if (s2.length > 22) w.push("Trim s2 to ≤ 22 chars.");
    if (s1.length > 8) w.push("Trim s1 to ≤ 8 chars.");
    if (!/^[a-z]*$/.test(s1) || !/^[a-z]*$/.test(s2)) w.push("Use lowercase a–z only.");
    return w;
  },
  build,
};
