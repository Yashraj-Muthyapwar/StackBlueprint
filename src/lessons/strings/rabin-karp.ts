import type { LessonBuilder, Step } from "../types";

type Inputs = { t: string; p: string };

const code = `def rabin_karp(text, pattern, base=31, mod=10**9 + 7):
    m, n = len(pattern), len(text)
    if m == 0 or m > n: return []
    pattern_hash, text_hash, power = 0, 0, 1
    for i in range(m):
        pattern_hash = (pattern_hash * base + ord(pattern[i])) % mod
        text_hash = (text_hash * base + ord(text[i])) % mod
        if i < m - 1: power = power * base % mod
    result = []
    for i in range(n - m + 1):
        if pattern_hash == text_hash and text[i:i+m] == pattern:
            result.append(i)
        if i + m < n:
            text_hash = ((text_hash - ord(text[i]) * power) * base + ord(text[i + m])) % mod
    return result`;

function build({ t, p }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = t.split("");
  const arr = chars as unknown as (number | string)[];
  const n = chars.length;
  const m = p.length;
  if (m === 0 || m > n) {
    steps.push({ line: 3, narration: "Empty / too-long pattern — return [].", array: arr, pointers: [] });
    return steps;
  }

  const base = 31n;
  const mod = 1000000007n;
  let pattern_hash = 0n;
  let text_hash = 0n;
  let power = 1n;
  for (let i = 0; i < m; i++) {
    pattern_hash = (pattern_hash * base + BigInt(p.charCodeAt(i))) % mod;
    text_hash = (text_hash * base + BigInt(t.charCodeAt(i))) % mod;
    if (i < m - 1) power = (power * base) % mod;
  }

  const ptrs = (left: number, right: number) => [
    { name: "left", index: left, color: "mint" as const },
    { name: "right", index: right, color: "amber" as const },
  ];
  const win = (left: number, right: number) => [{ from: left, to: right, tone: "mid" as const, label: "window" }];
  const hashView = () => ({
    label: `hash · pattern=${pattern_hash.toString()} window=${text_hash.toString()}`,
    array: [`pattern="${p}"`, `text[w]="${chars.slice(0, m).join("")}"`],
  });

  steps.push({
    line: 7,
    array: arr,
    pointers: ptrs(0, m - 1),
    partitions: win(0, m - 1),
    secondary: hashView(),
    narration: `Precompute hash of pattern ("${p}") and the first window of length ${m}.`,
  });

  const result: number[] = [];

  for (let i = 0; i <= n - m; i++) {
    const sec = {
      label: `hash · pattern=${pattern_hash.toString()} window=${text_hash.toString()}`,
      array: [`pattern="${p}"`, `text[${i}..${i + m - 1}]="${chars.slice(i, i + m).join("")}"`],
    };
    steps.push({
      line: 10,
      array: arr,
      pointers: ptrs(i, i + m - 1),
      partitions: win(i, i + m - 1),
      highlight: { kind: "compare", indices: Array.from({ length: m }, (_, k) => i + k) },
      secondary: sec,
      narration:
        pattern_hash === text_hash
          ? `Hashes match at i=${i} — verify chars (cheap collision check).`
          : `Hashes differ at i=${i} — skip.`,
    });
    if (pattern_hash === text_hash && t.slice(i, i + m) === p) {
      result.push(i);
      steps.push({
        line: 11,
        array: arr,
        pointers: ptrs(i, i + m - 1),
        partitions: win(i, i + m - 1),
        highlight: { kind: "match", indices: Array.from({ length: m }, (_, k) => i + k) },
        secondary: sec,
        status: `match at ${i}`,
        narration: `Confirmed match at ${i}.`,
      });
    }
    if (i + m < n) {
      const removed = BigInt(t.charCodeAt(i)) * power;
      text_hash = (((text_hash - removed) % mod + mod) % mod * base + BigInt(t.charCodeAt(i + m))) % mod;
      steps.push({
        line: 13,
        array: arr,
        pointers: ptrs(i + 1, i + m),
        partitions: win(i + 1, i + m),
        highlight: { kind: "swap", indices: [i, i + m] },
        secondary: {
          label: `hash · pattern=${pattern_hash.toString()} window=${text_hash.toString()}`,
          array: [`drop text[${i}]='${chars[i]}'`, `add text[${i + m}]='${chars[i + m]}'`],
        },
        narration: `Roll hash: drop '${chars[i]}', add '${chars[i + m]}'.`,
      });
    }
  }

  steps.push({
    line: 14,
    array: arr,
    pointers: [],
    status: `matches: [${result.join(", ")}]`,
    narration: result.length ? `Matches at indices ${result.join(", ")}.` : "No matches.",
  });
  return steps;
}

export const rabinKarp: LessonBuilder<Inputs> = {
  slug: "rabin-karp",
  title: "Pattern Matching — Rabin–Karp (Rolling Hash)",
  subtitle: "Hash the pattern once, then slide a rolling hash over the text. On a hash hit, verify chars.",
  problem: "Given text and pattern, return every start index i where text[i..i+|pattern|-1] == pattern, using a rolling polynomial hash to skip most positions.",
  spotIt: [
    "Repeated substring queries on a long text — rolling hash answers in O(1) per shift.",
    "You need to detect duplicate substrings, longest repeated, or grouped anagrams cheaply.",
    "Phrases: 'rolling hash', 'string hashing', 'longest duplicate substring'.",
  ],
  avoidWhen: [
    "You need worst-case guarantees against adversarial inputs — use KMP / Z.",
    "Memory for the hash modulus & base is constrained, or arithmetic overflow is unsafe.",
    "Pattern length is variable per query and very small — built-in indexOf is simpler.",
  ],
  variant: "rolling-hash",
  view: "array",
  code,
  defaultInputs: { t: "abracadabra", p: "abr" },
  inputs: [
    { key: "t", label: "Text t", kind: "string" },
    { key: "p", label: "Pattern p", kind: "string" },
  ],
  validate: ({ t, p }) => {
    const w: string[] = [];
    if (t.length > 18) w.push("Trim t to ≤ 18 chars for readable animation.");
    if (p.length > 6) w.push("Trim p to ≤ 6 chars.");
    if (p.length === 0) w.push("Pattern can't be empty.");
    return w;
  },
  build,
};
