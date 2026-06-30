import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def first_uniq_char(s):
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    for i, char in enumerate(s):
        if freq[char] == 1:
            return i
    return -1`;

function fmt(m: Map<string, number>) {
  return [...m.entries()].map(([k, v]) => `${k}:${v}`);
}

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s.split("");
  const arr = chars as (number | string)[];
  const freq = new Map<string, number>();
  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    secondary: { label: "freq {}", array: [] },
    narration: "Two passes: count, then scan for the first count-1.",
  });
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    freq.set(char, (freq.get(char) ?? 0) + 1);
    steps.push({
      line: 3,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: { kind: "compare", indices: [i] },
      secondary: { label: `freq { ${freq.size} }`, array: fmt(freq) },
      narration: `Pass 1 — count '${char}' = ${freq.get(char)}.`,
    });
  }
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const count = freq.get(char) as number;
    if (count === 1) {
      steps.push({
        line: 5,
        array: arr,
        pointers: [{ name: "i", index: i, color: "mint" }],
        highlight: { kind: "match", indices: [i] },
        secondary: { label: `freq`, array: fmt(freq) },
        status: `first unique = '${char}' @ ${i}`,
        narration: `'${char}' has count 1 — return ${i}.`,
      });
      return steps;
    }
    steps.push({
      line: 5,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: { kind: "swap", indices: [i] },
      secondary: { label: `freq`, array: fmt(freq) },
      narration: `'${char}' count=${count} — skip.`,
    });
  }
  steps.push({
    line: 8,
    array: arr,
    pointers: [],
    secondary: { label: `freq`, array: fmt(freq) },
    status: "-1",
    narration: "No unique character.",
  });
  return steps;
}

export const firstUniqueChar: LessonBuilder<Inputs> = {
  slug: "first-unique-char",
  title: "Index Map — First Unique Character",
  subtitle: "Count first, then walk once more to find the earliest single-occurrence character.",
  problem: "Return the index of the first non-repeating character in s, or -1 if none exists.",
  spotIt: [
    "Question asks for the 'first/earliest' element satisfying a global predicate (uniqueness).",
    "A single pass cannot decide uniqueness — counts depend on the whole string.",
    "Alphabet is bounded so the count structure is cheap.",
  ],
  avoidWhen: [
    "Stream input where you can never re-scan — use an ordered-dict of live unique chars.",
    "You only need to know whether *any* unique character exists — stop at the count step.",
    "Multiple updates over time — maintain counts incrementally instead of recounting.",
  ],
  variant: "hash-index",
  view: "array",
  code,
  defaultInputs: { s: "leetcode" },
  inputs: [{ key: "s", label: "s", kind: "string" }],
  validate: ({ s }) => (s.length > 20 ? ["Trim to ≤ 20 chars."] : []),
  build,
};
