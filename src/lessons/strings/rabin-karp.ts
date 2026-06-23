import type { LessonBuilder, Step } from "../types";

type Inputs = { t: string; p: string };

const code = `def rabin_karp(t, p, base=31, mod=10**9 + 7):
    m, n = len(p), len(t)
    if m == 0 or m > n: return []
    hp, ht, pw = 0, 0, 1
    for i in range(m):
        hp = (hp * base + ord(p[i])) % mod
        ht = (ht * base + ord(t[i])) % mod
        if i < m - 1: pw = pw * base % mod
    out = []
    for i in range(n - m + 1):
        if hp == ht and t[i:i+m] == p:
            out.append(i)
        if i + m < n:
            ht = ((ht - ord(t[i]) * pw) * base + ord(t[i + m])) % mod
    return out`;

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
  let hp = 0n;
  let ht = 0n;
  let pw = 1n;
  for (let i = 0; i < m; i++) {
    hp = (hp * base + BigInt(p.charCodeAt(i))) % mod;
    ht = (ht * base + BigInt(t.charCodeAt(i))) % mod;
    if (i < m - 1) pw = (pw * base) % mod;
  }

  const ptrs = (l: number, r: number) => [
    { name: "l", index: l, color: "mint" as const },
    { name: "r", index: r, color: "amber" as const },
  ];
  const win = (l: number, r: number) => [{ from: l, to: r, tone: "mid" as const, label: "window" }];
  const hashView = () => ({
    label: `hash · pattern=${hp.toString()} window=${ht.toString()}`,
    array: [`p="${p}"`, `t[w]="${chars.slice(0, m).join("")}"`],
  });

  steps.push({
    line: 7,
    array: arr,
    pointers: ptrs(0, m - 1),
    partitions: win(0, m - 1),
    secondary: hashView(),
    narration: `Precompute hash of p ("${p}") and the first window of length ${m}.`,
  });

  const out: number[] = [];

  for (let i = 0; i <= n - m; i++) {
    const sec = {
      label: `hash · pattern=${hp.toString()} window=${ht.toString()}`,
      array: [`p="${p}"`, `t[${i}..${i + m - 1}]="${chars.slice(i, i + m).join("")}"`],
    };
    steps.push({
      line: 10,
      array: arr,
      pointers: ptrs(i, i + m - 1),
      partitions: win(i, i + m - 1),
      highlight: { kind: "compare", indices: Array.from({ length: m }, (_, k) => i + k) },
      secondary: sec,
      narration:
        hp === ht
          ? `Hashes match at i=${i} — verify chars (cheap collision check).`
          : `Hashes differ at i=${i} — skip.`,
    });
    if (hp === ht && t.slice(i, i + m) === p) {
      out.push(i);
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
      const removed = BigInt(t.charCodeAt(i)) * pw;
      ht = (((ht - removed) % mod + mod) % mod * base + BigInt(t.charCodeAt(i + m))) % mod;
      steps.push({
        line: 13,
        array: arr,
        pointers: ptrs(i + 1, i + m),
        partitions: win(i + 1, i + m),
        highlight: { kind: "swap", indices: [i, i + m] },
        secondary: {
          label: `hash · pattern=${hp.toString()} window=${ht.toString()}`,
          array: [`drop t[${i}]='${chars[i]}'`, `add t[${i + m}]='${chars[i + m]}'`],
        },
        narration: `Roll hash: drop '${chars[i]}', add '${chars[i + m]}'.`,
      });
    }
  }

  steps.push({
    line: 14,
    array: arr,
    pointers: [],
    status: `matches: [${out.join(", ")}]`,
    narration: out.length ? `Matches at indices ${out.join(", ")}.` : "No matches.",
  });
  return steps;
}

export const rabinKarp: LessonBuilder<Inputs> = {
  slug: "rabin-karp",
  title: "Pattern Matching — Rabin–Karp (Rolling Hash)",
  subtitle: "Hash the pattern once, then slide a rolling hash over the text. On a hash hit, verify chars.",
  problem: "Given text t and pattern p, return every start index i where t[i..i+|p|-1] == p, using a rolling polynomial hash to skip most positions.",
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
