import type { LessonBuilder, Step } from "../types";

type Inputs = { words: string };

const code = `def group_shifted(words):
    def get_key(word):
        diffs = []
        for i in range(1, len(word)):
            d = (ord(word[i]) - ord(word[i-1])) % 26
            diffs.append(d)
        return tuple(diffs)
    groups = {}
    for word in words:
        groups.setdefault(get_key(word), []).append(word)
    return list(groups.values())`;

function shiftKey(s: string): string {
  if (s.length <= 1) return "·";
  const diffs: number[] = [];
  for (let i = 1; i < s.length; i++) {
    diffs.push((((s.charCodeAt(i) - s.charCodeAt(i - 1)) % 26) + 26) % 26);
  }
  return diffs.join(",");
}

function fmtGroups(g: Map<string, string[]>) {
  return [...g.entries()].map(([k, v]) => `(${k}) → [${v.join(",")}]`);
}

function parseWords(s: string): string[] {
  return s
    .split(/[\s,]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function build({ words }: Inputs): Step[] {
  const steps: Step[] = [];
  const list = parseWords(words);
  const arr = list as (number | string)[];
  const groups = new Map<string, string[]>();
  steps.push({
    line: 8,
    array: arr,
    pointers: [],
    secondary: { label: "groups {}", array: [] },
    narration: "Key = tuple of consecutive letter differences mod 26 — shift-invariant.",
  });
  for (let i = 0; i < list.length; i++) {
    const word = list[i];
    const key = shiftKey(word);
    const had = groups.has(key);
    if (!had) groups.set(key, []);
    (groups.get(key) as string[]).push(word);
    steps.push({
      line: 10,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: { kind: had ? "match" : "compare", indices: [i] },
      secondary: { label: `groups { ${groups.size} }`, array: fmtGroups(groups) },
      status: `key=(${key})`,
      narration: had
        ? `'${word}' shares shift signature (${key}) — joins existing bucket.`
        : `'${word}' has new shift signature (${key}).`,
    });
  }
  steps.push({
    line: 11,
    array: arr,
    pointers: [],
    secondary: { label: `groups { ${groups.size} }`, array: fmtGroups(groups) },
    status: `${groups.size} groups`,
    narration: `Return ${groups.size} group(s) of shift-equivalent strings.`,
  });
  return steps;
}

export const groupShiftedStrings: LessonBuilder<Inputs> = {
  slug: "group-shifted-strings",
  title: "Hash Map — Group Shifted Strings",
  subtitle: "Two strings are 'shift-equal' iff their inter-letter deltas match — that's the key.",
  problem:
    "Group strings such that each group contains shifts of one another, e.g. 'abc' ↔ 'bcd' ↔ 'xyz'.",
  spotIt: [
    "Equivalence under a transformation (shift, rotation, reflection).",
    "You can encode the *shape* of the data independently of its absolute values.",
    "Modular arithmetic naturally normalizes the representation.",
  ],
  avoidWhen: [
    "Transformations are not closed under composition — equivalence classes are ill-defined.",
    "Lengths differ — pad the key or include length explicitly.",
    "You only need to test pairs — compare keys on demand.",
  ],
  variant: "hash-grouping",
  view: "array",
  code,
  defaultInputs: { words: "abc, bcd, acef, xyz, az, ba, a, z" },
  inputs: [{ key: "words", label: "words (comma-separated)", kind: "string" }],
  validate: ({ words }) => {
    const list = parseWords(words);
    const w: string[] = [];
    if (list.length > 10) w.push("≤ 10 words.");
    if (list.some((x) => x.length > 8)) w.push("Each word ≤ 8 chars.");
    if (list.some((x) => !/^[a-z]+$/.test(x))) w.push("Lowercase a–z only.");
    return w;
  },
  build,
};
