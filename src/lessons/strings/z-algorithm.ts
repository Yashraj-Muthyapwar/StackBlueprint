import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def z_function(string):
    n = len(string)
    z_array = [0] * n
    left = right = 0
    for i in range(1, n):
        if i < right:
            z_array[i] = min(right - i, z_array[i - left])
        while i + z_array[i] < n and string[z_array[i]] == string[i + z_array[i]]:
            z_array[i] += 1
        if i + z_array[i] > right:
            left, right = i, i + z_array[i]
    return z_array`;

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  if (n === 0) {
    steps.push({ line: 1, narration: "Empty input.", array: arr, pointers: [] });
    return steps;
  }
  const z_array = new Array<number>(n).fill(0);
  const zView = () => ({ label: "z_array[]", array: z_array.slice() });
  const ptrs = (i: number, left: number, right: number) => {
    const out: import("../types").Pointer[] = [{ name: "i", index: i, color: "amber" }];
    if (right > left) {
      out.push({ name: "left", index: left, color: "mint", placement: "below" });
      out.push({ name: "right", index: right - 1, color: "violet", placement: "below" });
    }
    return out;
  };

  let left = 0;
  let right = 0;
  steps.push({
    line: 1,
    array: arr,
    pointers: [],
    secondary: zView(),
    narration: `z_array[i] = length of the longest substring starting at i that matches a prefix of string. Maintain a Z-box [left, right).`,
  });

  for (let i = 1; i < n; i++) {
    if (i < right) {
      z_array[i] = Math.min(right - i, z_array[i - left]);
      steps.push({
        line: 7,
        array: arr,
        pointers: ptrs(i, left, right),
        partitions:
          right > left ? [{ from: left, to: right - 1, tone: "mid", label: "Z-box" }] : [],
        highlight: { kind: "compare", indices: [i, i - left] },
        secondary: zView(),
        status: `seed z_array[${i}]=${z_array[i]}`,
        narration: `Inside Z-box: copy z_array[${i - left}]=${z_array[i - left]} (capped at ${right - i}).`,
      });
    }
    while (i + z_array[i] < n && chars[z_array[i]] === chars[i + z_array[i]]) {
      z_array[i] += 1;
      steps.push({
        line: 8,
        array: arr,
        pointers: ptrs(i, left, right),
        highlight: { kind: "match", indices: [z_array[i] - 1, i + z_array[i] - 1] },
        secondary: zView(),
        narration: `Extend: string[${z_array[i] - 1}]='${chars[z_array[i] - 1]}' = string[${i + z_array[i] - 1}]='${chars[i + z_array[i] - 1]}', z_array[${i}] = ${z_array[i]}.`,
      });
    }
    if (i + z_array[i] > right) {
      left = i;
      right = i + z_array[i];
      steps.push({
        line: 10,
        array: arr,
        pointers: ptrs(i, left, right),
        partitions:
          right > left ? [{ from: left, to: right - 1, tone: "high", label: "new Z-box" }] : [],
        secondary: zView(),
        status: `Z-box [${left}, ${right})`,
        narration: `New Z-box: left=${left}, right=${right}.`,
      });
    }
  }

  steps.push({
    line: 11,
    array: arr,
    pointers: [],
    secondary: zView(),
    status: `z_array = [${z_array.join(", ")}]`,
    narration:
      "Done. Pattern search: build z_array over P + '$' + T and scan for z_array[i] == |P|.",
  });
  return steps;
}

export const zAlgorithm: LessonBuilder<Inputs> = {
  slug: "z-algorithm",
  title: "Pattern Matching — Z-Algorithm",
  subtitle: "Compute z_array[i] in linear time by reusing the rightmost match box [left, right).",
  problem:
    "Given a string, compute the Z-array where z_array[i] is the length of the longest substring starting at i that matches a prefix of string.",
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
