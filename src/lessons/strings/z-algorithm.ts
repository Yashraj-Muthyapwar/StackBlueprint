import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def z_function(s):
    n = len(s)
    z = [0] * n
    l = r = 0
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    return z`;

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty input.", array: arr, pointers: [] });
    return steps;
  }
  const z = new Array<number>(n).fill(0);
  const zView = () => ({ label: "z[]", array: z.slice() });
  const ptrs = (i: number, l: number, r: number) => {
    const out: import("../types").Pointer[] = [{ name: "i", index: i, color: "amber" }];
    if (r > l) {
      out.push({ name: "l", index: l, color: "mint", placement: "below" });
      out.push({ name: "r", index: r - 1, color: "violet", placement: "below" });
    }
    return out;
  };

  let l = 0;
  let r = 0;
  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    secondary: zView(),
    narration: `Z[i] = length of the longest substring starting at i that matches a prefix of s. Maintain a Z-box [l, r).`,
  });

  for (let i = 1; i < n; i++) {
    if (i < r) {
      z[i] = Math.min(r - i, z[i - l]);
      steps.push({
        line: 7,
        array: arr,
        pointers: ptrs(i, l, r),
        partitions: r > l ? [{ from: l, to: r - 1, tone: "mid", label: "Z-box" }] : [],
        highlight: { kind: "compare", indices: [i, i - l] },
        secondary: zView(),
        status: `seed z[${i}]=${z[i]}`,
        narration: `Inside Z-box: copy z[${i - l}]=${z[i - l]} (capped at ${r - i}).`,
      });
    }
    while (i + z[i] < n && chars[z[i]] === chars[i + z[i]]) {
      z[i] += 1;
      steps.push({
        line: 8,
        array: arr,
        pointers: ptrs(i, l, r),
        highlight: { kind: "match", indices: [z[i] - 1, i + z[i] - 1] },
        secondary: zView(),
        narration: `Extend: s[${z[i] - 1}]='${chars[z[i] - 1]}' = s[${i + z[i] - 1}]='${chars[i + z[i] - 1]}', z[${i}] = ${z[i]}.`,
      });
    }
    if (i + z[i] > r) {
      l = i;
      r = i + z[i];
      steps.push({
        line: 10,
        array: arr,
        pointers: ptrs(i, l, r),
        partitions: r > l ? [{ from: l, to: r - 1, tone: "high", label: "new Z-box" }] : [],
        secondary: zView(),
        status: `Z-box [${l}, ${r})`,
        narration: `New Z-box: l=${l}, r=${r}.`,
      });
    }
  }

  steps.push({
    line: 11,
    array: arr,
    pointers: [],
    secondary: zView(),
    status: `z = [${z.join(", ")}]`,
    narration: "Done. Pattern search: build z over P + '$' + T and scan for z[i] == |P|.",
  });
  return steps;
}

export const zAlgorithm: LessonBuilder<Inputs> = {
  slug: "z-algorithm",
  title: "Pattern Matching — Z-Algorithm",
  subtitle: "Compute Z[i] in linear time by reusing the rightmost match box [l, r).",
  problem: "Given a string s, compute the Z-array where Z[i] is the length of the longest substring starting at i that matches a prefix of s.",
  spotIt: [
    "You need every prefix-match length in linear time (substring search, period detection).",
    "Problem mentions 'longest prefix that is also a suffix at position i' or 'period of a string'.",
    "Phrases: 'Z-array', 'all occurrences of P in T in O(n+m)' without KMP-style preprocessing.",
  ],
  avoidWhen: [
    "You only need a single match and the pattern is small — indexOf / KMP suffice.",
    "Memory for an extra n-length array is forbidden.",
    "You need approximate / fuzzy matching.",
  ],
  variant: "z-box",
  view: "array",
  code,
  defaultInputs: { s: "aabcaabxaaaz" },
  inputs: [{ key: "s", label: "String s", kind: "string" }],
  validate: ({ s }) => (s.length > 14 ? ["Trim to ≤ 14 chars for readable animation."] : []),
  build,
};
