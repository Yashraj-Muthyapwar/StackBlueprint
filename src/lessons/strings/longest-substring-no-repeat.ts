import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def length_of_longest(string):
    seen = {}
    left = 0
    best = 0
    for right in range(len(string)):
        if string[right] in seen and seen[string[right]] >= left:
            left = seen[string[right]] + 1
        seen[string[right]] = right
        if right - left + 1 > best:
            best = right - left + 1
    return best`;

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty string — return 0.", array: arr, pointers: [] });
    return steps;
  }
  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];
  const win = (left: number, right: number) => [
    { from: left, to: right, tone: "mid" as const, label: "window" },
  ];
  const secondaryFrom = (m: Map<string, number>) => {
    const keys = [...m.keys()];
    return {
      label: `seen { ${keys.length} keys }`,
      array: keys.map((k) => `${k}:${m.get(k)}`),
    };
  };

  const seen = new Map<string, number>();
  let left = 0;
  let best = 0;
  let bestRange: [number, number] = [0, -1];

  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    narration: "Track last index of each character in `seen`.",
  });

  for (let right = 0; right < n; right++) {
    const c = chars[right];
    steps.push({
      line: 5,
      array: arr,
      pointers: ptrs(left, right),
      partitions: win(left, right),
      highlight: { kind: "compare", indices: [right] },
      secondary: secondaryFrom(seen),
      narration: `right=${right}, char '${c}'. Check if seen and inside window.`,
    });
    if (seen.has(c) && (seen.get(c) as number) >= left) {
      const prev = seen.get(c) as number;
      steps.push({
        line: 6,
        array: arr,
        pointers: ptrs(left, right),
        partitions: win(left, right),
        highlight: { kind: "swap", indices: [prev, right] },
        secondary: secondaryFrom(seen),
        status: `dup '${c}' at ${prev}`,
        narration: `'${c}' was at index ${prev} (≥ left=${left}). Shrink: left = ${prev + 1}.`,
      });
      left = prev + 1;
    }
    seen.set(c, right);
    steps.push({
      line: 7,
      array: arr,
      pointers: ptrs(left, right),
      partitions: win(left, right),
      secondary: secondaryFrom(seen),
      narration: `seen['${c}'] = ${right}.`,
    });
    const len = right - left + 1;
    if (len > best) {
      best = len;
      bestRange = [left, right];
      steps.push({
        line: 9,
        array: arr,
        pointers: ptrs(left, right),
        partitions: win(left, right),
        highlight: { kind: "match", indices: Array.from({ length: len }, (_, i) => left + i) },
        secondary: secondaryFrom(seen),
        status: `best = ${best}`,
        narration: `New best window length ${best}: "${chars.slice(left, right + 1).join("")}".`,
      });
    }
  }

  steps.push({
    line: 10,
    array: arr,
    pointers: [],
    partitions: bestRange[1] >= 0 ? win(bestRange[0], bestRange[1]) : [],
    highlight:
      bestRange[1] >= 0
        ? {
            kind: "match",
            indices: Array.from(
              { length: bestRange[1] - bestRange[0] + 1 },
              (_, i) => bestRange[0] + i,
            ),
          }
        : undefined,
    status: `return ${best}`,
    narration: `Return ${best}.`,
  });
  return steps;
}

export const longestSubstringNoRepeat: LessonBuilder<Inputs> = {
  slug: "longest-substring-no-repeat",
  title: "Sliding Window — Longest Substring Without Repeat",
  subtitle:
    "Expand right; on a duplicate inside the window, jump left past the previous occurrence.",
  problem:
    "Given a string, return the length of the longest substring of string that contains no repeated characters.",
  spotIt: [
    "Asks for the longest / shortest substring with a constraint on distinct characters.",
    "Brute force is O(n²) and the interviewer wants O(n).",
    "Phrases: 'longest substring without repeating', 'at most k distinct characters'.",
  ],
  avoidWhen: [
    "You need substrings that may overlap with disjoint constraints — DP is better.",
    "You need every valid window (not just the longest) — switch to enumeration.",
    "Constraint is non-monotonic and shrinking the window doesn't preserve validity.",
  ],
  variant: "string-window",
  view: "array",
  code,
  defaultInputs: { s: "abcabcbb" },
  inputs: [{ key: "s", label: "String s", kind: "string", help: "characters" }],
  validate: ({ s }) => (s.length > 24 ? ["Trim to ≤ 24 characters for readable animation."] : []),
  build,
};
