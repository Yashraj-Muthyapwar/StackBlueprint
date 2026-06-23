import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return False
        l += 1
        r -= 1
    return True`;

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  const ptrs = (l: number, r: number) => [
    { name: "l", index: l, color: "mint" as const },
    { name: "r", index: r, color: "amber" as const },
  ];

  if (n < 2) {
    steps.push({ line: 7, array: arr, pointers: [], status: "True", narration: "0/1 chars — palindrome." });
    return steps;
  }

  let l = 0;
  let r = n - 1;
  steps.push({ line: 2, array: arr, pointers: ptrs(l, r), narration: "Place l at the start, r at the end." });

  while (l < r) {
    steps.push({
      line: 3,
      array: arr,
      pointers: ptrs(l, r),
      highlight: { kind: "compare", indices: [l, r] },
      status: `'${chars[l]}' vs '${chars[r]}'`,
      narration: `Compare s[${l}]='${chars[l]}' with s[${r}]='${chars[r]}'.`,
    });
    if (chars[l] !== chars[r]) {
      steps.push({
        line: 4,
        array: arr,
        pointers: ptrs(l, r),
        highlight: { kind: "swap", indices: [l, r] },
        status: "False",
        narration: `Mismatch — not a palindrome, return False.`,
      });
      return steps;
    }
    steps.push({
      line: 5,
      array: arr,
      pointers: ptrs(l, r),
      highlight: { kind: "match", indices: [l, r] },
      narration: `Match. Move inward.`,
    });
    l += 1;
    r -= 1;
  }

  steps.push({
    line: 7,
    array: arr,
    pointers: l === r ? [{ name: "mid", index: l, color: "violet" as const }] : [],
    highlight: { kind: "match", indices: Array.from({ length: n }, (_, i) => i) },
    status: "True",
    narration: "Pointers crossed — palindrome, return True.",
  });
  return steps;
}

export const palindromeCheck: LessonBuilder<Inputs> = {
  slug: "palindrome-check",
  title: "Two Pointers — Palindrome Check",
  subtitle: "Walk indices in from both ends, comparing mirrored characters.",
  problem: "Given a string s, return True iff s reads the same forward and backward.",
  spotIt: [
    "Question is about symmetry / mirroring of a sequence.",
    "Phrases: 'is palindrome', 'valid palindrome', 'longest palindromic substring' (variant).",
    "O(1) extra space requested for a check that brute-force would solve with reversal.",
  ],
  avoidWhen: [
    "You need to count all palindromic substrings — use expand-around-center or Manacher's.",
    "Comparisons require complex normalization that a one-pass two-pointer can't express.",
    "Input is a stream — keep a running rolling hash instead.",
  ],
  variant: "opposite-ends",
  view: "array",
  code,
  defaultInputs: { s: "racecar" },
  inputs: [{ key: "s", label: "String s", kind: "string" }],
  validate: ({ s }) => (s.length > 16 ? ["Trim to ≤ 16 chars for readable animation."] : []),
  build,
};
