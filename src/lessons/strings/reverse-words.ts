import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def reverse_words(string):
    chars = list(string)
    # 1) reverse the whole array
    reverse(chars, 0, len(chars) - 1)
    # 2) reverse each word in place
    start = 0
    for i in range(len(chars) + 1):
        if i == len(chars) or chars[i] == ' ':
            reverse(chars, start, i - 1)
            start = i + 1
    return "".join(chars)`;

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s.split("");
  const n = chars.length;
  const snap = (): (number | string)[] => [...chars] as unknown as (number | string)[];

  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];

  steps.push({ line: 1, array: snap(), pointers: [], narration: `Start with "${s}".` });

  // 1) reverse whole
  let left = 0;
  let right = n - 1;
  steps.push({
    line: 3,
    array: snap(),
    pointers: ptrs(left, right),
    partitions: [{ from: 0, to: n - 1, tone: "mid", label: "reverse whole" }],
    narration: "Phase 1: reverse the entire array.",
  });
  while (left < right) {
    [chars[left], chars[right]] = [chars[right], chars[left]];
    steps.push({
      line: 3,
      array: snap(),
      pointers: ptrs(left, right),
      highlight: { kind: "swap", indices: [left, right] },
      narration: `Swap (${left}, ${right}).`,
    });
    left += 1;
    right -= 1;
  }

  // 2) reverse each word
  let start = 0;
  for (let i = 0; i <= n; i++) {
    if (i === n || chars[i] === " ") {
      let word_left = start;
      let word_right = i - 1;
      if (word_right > word_left) {
        steps.push({
          line: 7,
          array: snap(),
          pointers: ptrs(word_left, word_right),
          partitions: [{ from: word_left, to: word_right, tone: "high", label: "word" }],
          narration: `Reverse word [${word_left}..${word_right}].`,
        });
        while (word_left < word_right) {
          [chars[word_left], chars[word_right]] = [chars[word_right], chars[word_left]];
          steps.push({
            line: 7,
            array: snap(),
            pointers: ptrs(word_left, word_right),
            partitions: [{ from: start, to: i - 1, tone: "high", label: "word" }],
            highlight: { kind: "swap", indices: [word_left, word_right] },
            narration: `Swap (${word_left}, ${word_right}).`,
          });
          word_left += 1;
          word_right -= 1;
        }
      }
      start = i + 1;
    }
  }

  steps.push({
    line: 9,
    array: snap(),
    pointers: [],
    status: `"${chars.join("")}"`,
    narration: `Done — "${chars.join("")}".`,
  });
  return steps;
}

export const reverseWords: LessonBuilder<Inputs> = {
  slug: "reverse-words",
  title: "Two Pointers — Reverse Words In-Place",
  subtitle: "Reverse the whole array, then reverse each word — O(n) time, O(1) extra space.",
  problem:
    "Given a string of words separated by single spaces, reverse the order of the words in place (treating string as a char array).",
  spotIt: [
    "In-place reversal of segments inside a buffer (chars / bytes).",
    "Question asks for O(1) extra space, no extra arrays.",
    "Phrases: 'reverse words in a string', 'rotate array' (variant using the same trick).",
  ],
  avoidWhen: [
    "Whitespace handling is complex (multiple spaces, leading/trailing) and a parse-rebuild is clearer.",
    "Input is immutable (Python str, Java String) — you cannot reverse in place.",
    "You need word ordering with extra constraints (sort by length) — use a token list.",
  ],
  variant: "in-place-swap",
  view: "array",
  code,
  defaultInputs: { s: "the sky is blue" },
  inputs: [{ key: "s", label: "Sentence", kind: "string" }],
  validate: ({ s }) => {
    const w: string[] = [];
    if (s.length > 22) w.push("Trim to ≤ 22 chars for readable animation.");
    if (/\s{2,}/.test(s)) w.push("Use single spaces between words for this demo.");
    return w;
  },
  build,
};
