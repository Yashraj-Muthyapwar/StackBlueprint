import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def is_palindrome(string):
    left, right = 0, len(string) - 1
    while left < right:
        if string[left] != string[right]:
            return False
        left += 1
        right -= 1
    return True`;

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];

  if (n < 2) {
    steps.push({
      line: 7,
      array: arr,
      pointers: [],
      status: "True",
      narration: "0/1 chars — palindrome.",
    });
    return steps;
  }

  let left = 0;
  let right = n - 1;
  steps.push({
    line: 2,
    array: arr,
    pointers: ptrs(left, right),
    narration: "Place left at the start, right at the end.",
  });

  while (left < right) {
    steps.push({
      line: 3,
      array: arr,
      pointers: ptrs(left, right),
      highlight: { kind: "compare", indices: [left, right] },
      status: `'${chars[left]}' vs '${chars[right]}'`,
      narration: `Compare string[${left}]='${chars[left]}' with string[${right}]='${chars[right]}'.`,
    });
    if (chars[left] !== chars[right]) {
      steps.push({
        line: 4,
        array: arr,
        pointers: ptrs(left, right),
        highlight: { kind: "swap", indices: [left, right] },
        status: "False",
        narration: `Mismatch — not a palindrome, return False.`,
      });
      return steps;
    }
    steps.push({
      line: 5,
      array: arr,
      pointers: ptrs(left, right),
      highlight: { kind: "match", indices: [left, right] },
      narration: `Match. Move inward.`,
    });
    left += 1;
    right -= 1;
  }

  steps.push({
    line: 7,
    array: arr,
    pointers: left === right ? [{ name: "mid", index: left, color: "violet" as const }] : [],
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
  problem: "Given a string, return True iff string reads the same forward and backward.",
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
