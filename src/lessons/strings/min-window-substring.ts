import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string; t: string };

const code = `def min_window(text, pattern):
    need = Counter(pattern)
    have = {}
    required = len(need)
    formed = 0
    left = 0
    best = (inf, 0, 0)
    for right in range(len(text)):
        char = text[right]
        have[char] = have.get(char, 0) + 1
        if char in need and have[char] == need[char]:
            formed += 1
        while formed == required:
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            have[text[left]] -= 1
            if text[left] in need and have[text[left]] < need[text[left]]:
                formed -= 1
            left += 1
    return text[best[1]:best[2]+1] if best[0] < inf else ""`;

function counter(str: string): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of str) m.set(c, (m.get(c) ?? 0) + 1);
  return m;
}

function build({ s, t }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  const need = counter(t);
  const have = new Map<string, number>();
  const required = need.size;
  let formed = 0;
  let left = 0;
  let bestLen = Infinity;
  let bestRange: [number, number] = [0, -1];

  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];
  const win = (left: number, right: number) =>
    [{ from: left, to: right, tone: "mid" as const, label: `formed ${formed}/${required}` }];
  const secondary = () => ({
    label: `need vs have`,
    array: [...need.keys()].map((k) => `${k}:${have.get(k) ?? 0}/${need.get(k)}`),
  });

  if (n === 0 || t.length === 0) {
    steps.push({ line: 1, narration: "Empty input — return ''.", array: arr, pointers: [] });
    return steps;
  }

  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    secondary: secondary(),
    narration: `Need: ${[...need.entries()].map(([k, v]) => `${k}×${v}`).join(", ")}.`,
  });

  for (let right = 0; right < n; right++) {
    const c = chars[right];
    have.set(c, (have.get(c) ?? 0) + 1);
    if (need.has(c) && have.get(c) === need.get(c)) formed += 1;
    steps.push({
      line: 11,
      array: arr,
      pointers: ptrs(left, right),
      partitions: win(left, right),
      highlight: { kind: "compare", indices: [right] },
      secondary: secondary(),
      status: `formed ${formed}/${required}`,
      narration: `right=${right}, add '${c}'. formed=${formed}/${required}.`,
    });
    while (formed === required) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestRange = [left, right];
        steps.push({
          line: 14,
          array: arr,
          pointers: ptrs(left, right),
          partitions: win(left, right),
          highlight: { kind: "match", indices: Array.from({ length: bestLen }, (_, i) => left + i) },
          secondary: secondary(),
          status: `best ${bestLen}`,
          narration: `Valid window "${chars.slice(left, right + 1).join("")}" — new best (${bestLen}).`,
        });
      }
      const lc = chars[left];
      have.set(lc, (have.get(lc) ?? 0) - 1);
      if (need.has(lc) && (have.get(lc) as number) < (need.get(lc) as number)) formed -= 1;
      left += 1;
      steps.push({
        line: 18,
        array: arr,
        pointers: ptrs(left, right),
        partitions: left <= right ? win(left, right) : [],
        secondary: secondary(),
        narration: `Shrink: drop '${lc}', left=${left}. formed=${formed}/${required}.`,
      });
    }
  }

  steps.push({
    line: 19,
    array: arr,
    pointers: [],
    partitions: bestRange[1] >= 0 ? [{ from: bestRange[0], to: bestRange[1], tone: "mid", label: "answer" }] : [],
    highlight:
      bestRange[1] >= 0
        ? { kind: "match", indices: Array.from({ length: bestRange[1] - bestRange[0] + 1 }, (_, i) => bestRange[0] + i) }
        : undefined,
    status: bestRange[1] >= 0 ? `"${chars.slice(bestRange[0], bestRange[1] + 1).join("")}"` : `""`,
    narration:
      bestRange[1] >= 0
        ? `Answer: "${chars.slice(bestRange[0], bestRange[1] + 1).join("")}".`
        : "No valid window — return ''.",
  });
  return steps;
}

export const minWindowSubstring: LessonBuilder<Inputs> = {
  slug: "min-window-substring",
  title: "Sliding Window — Minimum Window Substring",
  subtitle: "Grow right until the window covers pattern, then shrink left while the cover survives — track the smallest cover seen.",
  problem: "Given strings text and pattern, return the smallest substring of text that contains every character of pattern (with multiplicity), or '' if no such window exists.",
  spotIt: [
    "Find the smallest / shortest window that 'contains' another string or multiset.",
    "Constraint is a coverage condition (have ≥ need for every key).",
    "Phrases: 'minimum window substring', 'smallest substring containing all of …'.",
  ],
  avoidWhen: [
    "Order of characters matters — this is not a subsequence search.",
    "You need every window (not just the minimum).",
    "Constraint is non-monotonic in window growth.",
  ],
  variant: "variable-window",
  view: "array",
  code,
  defaultInputs: { s: "ADOBECODEBANC", t: "ABC" },
  inputs: [
    { key: "s", label: "Text s", kind: "string" },
    { key: "t", label: "Pattern t", kind: "string" },
  ],
  validate: ({ s, t }) => {
    const w: string[] = [];
    if (s.length > 22) w.push("Trim s to ≤ 22 chars for readable animation.");
    if (t.length > 8) w.push("Trim t to ≤ 8 chars.");
    return w;
  },
  build,
};
