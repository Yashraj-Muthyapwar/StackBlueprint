import type { LessonBuilder, Step } from "../types";

type Inputs = { words: string };

const code = `def group_anagrams(words):
    groups = {}
    for word in words:
        key = ''.join(sorted(word))   # canonical form
        groups.setdefault(key, []).append(word)
    return list(groups.values())`;

function fmtGroups(g: Map<string, string[]>) {
  return [...g.entries()].map(([k, v]) => `${k} → [${v.join(",")}]`);
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
    line: 1,
    array: arr,
    pointers: [],
    secondary: { label: "groups {}", array: [] },
    narration: "Canonical key = sorted letters. Two anagrams share the same key.",
  });
  for (let i = 0; i < list.length; i++) {
    const word = list[i];
    const key = word.split("").sort().join("");
    const had = groups.has(key);
    if (!had) groups.set(key, []);
    (groups.get(key) as string[]).push(word);
    steps.push({
      line: 4,
      array: arr,
      pointers: [{ name: "i", index: i, color: "amber" }],
      highlight: { kind: had ? "match" : "compare", indices: [i] },
      secondary: { label: `groups { ${groups.size} keys }`, array: fmtGroups(groups) },
      status: `key='${key}'`,
      narration: had
        ? `'${word}' canonical='${key}' — append to existing bucket.`
        : `'${word}' canonical='${key}' — create a new bucket.`,
    });
  }
  steps.push({
    line: 5,
    array: arr,
    pointers: [],
    secondary: { label: `groups { ${groups.size} }`, array: fmtGroups(groups) },
    status: `${groups.size} groups`,
    narration: `Return the ${groups.size} bucket(s).`,
  });
  return steps;
}

export const groupAnagrams: LessonBuilder<Inputs> = {
  slug: "group-anagrams",
  title: "Hash Map — Group Anagrams",
  subtitle: "Map every word to a canonical key; words that share a key share a bucket.",
  problem:
    "Given a list of words, group them so that each group contains exactly the anagrams of each other.",
  spotIt: [
    "Equivalence classes induced by a normalization function (sort, count vector, signature).",
    "Output is a partition of the input rather than a single value.",
    "You can compute a cheap, unique key per item.",
  ],
  avoidWhen: [
    "Equivalence isn't representable by a hashable key (fuzzy similarity, edit distance).",
    "Words are huge and sorting per word dominates — switch to a 26-tuple count key.",
    "You only need to know whether two specific words are anagrams — compare keys directly.",
  ],
  variant: "hash-grouping",
  view: "array",
  code,
  defaultInputs: { words: "eat, tea, tan, ate, nat, bat" },
  inputs: [{ key: "words", label: "words (comma-separated)", kind: "string" }],
  validate: ({ words }) => {
    const list = parseWords(words);
    const w: string[] = [];
    if (list.length > 10) w.push("≤ 10 words.");
    if (list.some((x) => x.length > 8)) w.push("Each word ≤ 8 chars.");
    return w;
  },
  build,
};
