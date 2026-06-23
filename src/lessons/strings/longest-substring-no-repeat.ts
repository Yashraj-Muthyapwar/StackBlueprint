import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def length_of_longest(s):
    seen = {}
    l = 0
    best = 0
    for r in range(len(s)):
        if s[r] in seen and seen[s[r]] >= l:
            l = seen[s[r]] + 1
        seen[s[r]] = r
        if r - l + 1 > best:
            best = r - l + 1
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
  const ptrs = (l: number, r: number) => [
    { name: "l", index: l, color: "mint" as const },
    { name: "r", index: r, color: "amber" as const },
  ];
  const win = (l: number, r: number) =>
    [{ from: l, to: r, tone: "mid" as const, label: "window" }];
  const secondaryFrom = (m: Map<string, number>) => {
    const keys = [...m.keys()];
    return {
      label: `seen { ${keys.length} keys }`,
      array: keys.map((k) => `${k}:${m.get(k)}`),
    };
  };

  const seen = new Map<string, number>();
  let l = 0;
  let best = 0;
  let bestRange: [number, number] = [0, -1];

  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    narration: "Track last index of each character in `seen`.",
  });

  for (let r = 0; r < n; r++) {
    const c = chars[r];
    steps.push({
      line: 5,
      array: arr,
      pointers: ptrs(l, r),
      partitions: win(l, r),
      highlight: { kind: "compare", indices: [r] },
      secondary: secondaryFrom(seen),
      narration: `r=${r}, char '${c}'. Check if seen and inside window.`,
    });
    if (seen.has(c) && (seen.get(c) as number) >= l) {
      const prev = seen.get(c) as number;
      steps.push({
        line: 6,
        array: arr,
        pointers: ptrs(l, r),
        partitions: win(l, r),
        highlight: { kind: "swap", indices: [prev, r] },
        secondary: secondaryFrom(seen),
        status: `dup '${c}' at ${prev}`,
        narration: `'${c}' was at index ${prev} (≥ l=${l}). Shrink: l = ${prev + 1}.`,
      });
      l = prev + 1;
    }
    seen.set(c, r);
    steps.push({
      line: 7,
      array: arr,
      pointers: ptrs(l, r),
      partitions: win(l, r),
      secondary: secondaryFrom(seen),
      narration: `seen['${c}'] = ${r}.`,
    });
    const len = r - l + 1;
    if (len > best) {
      best = len;
      bestRange = [l, r];
      steps.push({
        line: 9,
        array: arr,
        pointers: ptrs(l, r),
        partitions: win(l, r),
        highlight: { kind: "match", indices: Array.from({ length: len }, (_, i) => l + i) },
        secondary: secondaryFrom(seen),
        status: `best = ${best}`,
        narration: `New best window length ${best}: "${chars.slice(l, r + 1).join("")}".`,
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
            indices: Array.from({ length: bestRange[1] - bestRange[0] + 1 }, (_, i) => bestRange[0] + i),
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
  subtitle: "Expand r; on a duplicate inside the window, jump l past the previous occurrence.",
  problem: "Given a string s, return the length of the longest substring of s that contains no repeated characters.",
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
