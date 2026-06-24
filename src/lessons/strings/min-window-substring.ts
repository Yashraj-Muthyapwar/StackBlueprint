import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string; t: string };

const code = `def min_window(s, t):
    need = Counter(t)
    have = {}
    required = len(need)
    formed = 0
    l = 0
    best = (inf, 0, 0)
    for r in range(len(s)):
        c = s[r]
        have[c] = have.get(c, 0) + 1
        if c in need and have[c] == need[c]:
            formed += 1
        while formed == required:
            if r - l + 1 < best[0]:
                best = (r - l + 1, l, r)
            have[s[l]] -= 1
            if s[l] in need and have[s[l]] < need[s[l]]:
                formed -= 1
            l += 1
    return s[best[1]:best[2]+1] if best[0] < inf else ""`;

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
  let l = 0;
  let bestLen = Infinity;
  let bestRange: [number, number] = [0, -1];

  const ptrs = (l: number, r: number) => [
    { name: "l", index: l, color: "mint" as const },
    { name: "r", index: r, color: "amber" as const },
  ];
  const win = (l: number, r: number) =>
    [{ from: l, to: r, tone: "mid" as const, label: `formed ${formed}/${required}` }];
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

  for (let r = 0; r < n; r++) {
    const c = chars[r];
    have.set(c, (have.get(c) ?? 0) + 1);
    if (need.has(c) && have.get(c) === need.get(c)) formed += 1;
    steps.push({
      line: 11,
      array: arr,
      pointers: ptrs(l, r),
      partitions: win(l, r),
      highlight: { kind: "compare", indices: [r] },
      secondary: secondary(),
      status: `formed ${formed}/${required}`,
      narration: `r=${r}, add '${c}'. formed=${formed}/${required}.`,
    });
    while (formed === required) {
      if (r - l + 1 < bestLen) {
        bestLen = r - l + 1;
        bestRange = [l, r];
        steps.push({
          line: 14,
          array: arr,
          pointers: ptrs(l, r),
          partitions: win(l, r),
          highlight: { kind: "match", indices: Array.from({ length: bestLen }, (_, i) => l + i) },
          secondary: secondary(),
          status: `best ${bestLen}`,
          narration: `Valid window "${chars.slice(l, r + 1).join("")}" — new best (${bestLen}).`,
        });
      }
      const lc = chars[l];
      have.set(lc, (have.get(lc) ?? 0) - 1);
      if (need.has(lc) && (have.get(lc) as number) < (need.get(lc) as number)) formed -= 1;
      l += 1;
      steps.push({
        line: 18,
        array: arr,
        pointers: ptrs(l, r),
        partitions: l <= r ? win(l, r) : [],
        secondary: secondary(),
        narration: `Shrink: drop '${lc}', l=${l}. formed=${formed}/${required}.`,
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
  subtitle: "Grow r until the window covers t, then shrink l while the cover survives — track the smallest cover seen.",
  problem: "Given strings s and t, return the smallest substring of s that contains every character of t (with multiplicity), or '' if no such window exists.",
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
