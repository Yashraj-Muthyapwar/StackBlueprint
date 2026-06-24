import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def reverse_words(s):
    a = list(s)
    # 1) reverse the whole array
    reverse(a, 0, len(a) - 1)
    # 2) reverse each word in place
    i = 0
    for j in range(len(a) + 1):
        if j == len(a) or a[j] == ' ':
            reverse(a, i, j - 1)
            i = j + 1
    return "".join(a)`;

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const a = s.split("");
  const n = a.length;
  const snap = (): (number | string)[] => [...a] as unknown as (number | string)[];

  const ptrs = (l: number, r: number) => [
    { name: "l", index: l, color: "mint" as const },
    { name: "r", index: r, color: "amber" as const },
  ];

  steps.push({ line: 1, array: snap(), pointers: [], narration: `Start with "${s}".` });

  // 1) reverse whole
  let l = 0;
  let r = n - 1;
  steps.push({
    line: 3,
    array: snap(),
    pointers: ptrs(l, r),
    partitions: [{ from: 0, to: n - 1, tone: "mid", label: "reverse whole" }],
    narration: "Phase 1: reverse the entire array.",
  });
  while (l < r) {
    [a[l], a[r]] = [a[r], a[l]];
    steps.push({
      line: 3,
      array: snap(),
      pointers: ptrs(l, r),
      highlight: { kind: "swap", indices: [l, r] },
      narration: `Swap (${l}, ${r}).`,
    });
    l += 1;
    r -= 1;
  }

  // 2) reverse each word
  let i = 0;
  for (let j = 0; j <= n; j++) {
    if (j === n || a[j] === " ") {
      let ll = i;
      let rr = j - 1;
      if (rr > ll) {
        steps.push({
          line: 7,
          array: snap(),
          pointers: ptrs(ll, rr),
          partitions: [{ from: ll, to: rr, tone: "high", label: "word" }],
          narration: `Reverse word [${ll}..${rr}].`,
        });
        while (ll < rr) {
          [a[ll], a[rr]] = [a[rr], a[ll]];
          steps.push({
            line: 7,
            array: snap(),
            pointers: ptrs(ll, rr),
            partitions: [{ from: i, to: j - 1, tone: "high", label: "word" }],
            highlight: { kind: "swap", indices: [ll, rr] },
            narration: `Swap (${ll}, ${rr}).`,
          });
          ll += 1;
          rr -= 1;
        }
      }
      i = j + 1;
    }
  }

  steps.push({
    line: 9,
    array: snap(),
    pointers: [],
    status: `"${a.join("")}"`,
    narration: `Done — "${a.join("")}".`,
  });
  return steps;
}

export const reverseWords: LessonBuilder<Inputs> = {
  slug: "reverse-words",
  title: "Two Pointers — Reverse Words In-Place",
  subtitle: "Reverse the whole array, then reverse each word — O(n) time, O(1) extra space.",
  problem: "Given a string s of words separated by single spaces, reverse the order of the words in place (treating s as a char array).",
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
