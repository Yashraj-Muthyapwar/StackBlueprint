import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def compress(chars):
    write = 0
    i = 0
    while i < len(chars):
        j = i
        while j < len(chars) and chars[j] == chars[i]:
            j += 1
        chars[write] = chars[i]
        write += 1
        run = j - i
        if run > 1:
            for d in str(run):
                chars[write] = d
                write += 1
        i = j
    return write`;

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const a = s.split("");
  const n = a.length;
  const snap = (): (number | string)[] => [...a] as unknown as (number | string)[];

  if (n === 0) {
    steps.push({ line: 1, narration: "Empty input — return 0.", array: snap(), pointers: [] });
    return steps;
  }

  let write = 0;
  let i = 0;
  const ptrs = (w: number, i: number, j?: number) => {
    const out: import("../types").Pointer[] = [
      { name: "w", index: w, color: "mint" },
      { name: "i", index: i, color: "amber", placement: "below" },
    ];
    if (j !== undefined && j < n) out.push({ name: "j", index: j, color: "violet", placement: "below" });
    return out;
  };

  steps.push({
    line: 2,
    array: snap(),
    pointers: ptrs(write, i),
    narration: "Two write/read cursors: `w` writes the compressed prefix, `i` reads runs.",
  });

  while (i < n) {
    let j = i;
    while (j < n && a[j] === a[i]) j += 1;
    steps.push({
      line: 5,
      array: snap(),
      pointers: ptrs(write, i, j),
      partitions: [{ from: i, to: j - 1, tone: "mid", label: `run '${a[i]}'×${j - i}` }],
      narration: `Run of '${a[i]}' spans [${i}..${j - 1}], length ${j - i}.`,
    });
    a[write] = a[i];
    steps.push({
      line: 7,
      array: snap(),
      pointers: ptrs(write + 1, i, j),
      partitions: [{ from: 0, to: write, tone: "low", label: "compressed" }],
      highlight: { kind: "match", indices: [write] },
      narration: `Write '${a[i]}' at w=${write}.`,
    });
    write += 1;
    const run = j - i;
    if (run > 1) {
      for (const d of String(run)) {
        a[write] = d;
        steps.push({
          line: 11,
          array: snap(),
          pointers: ptrs(write + 1, i, j),
          partitions: [{ from: 0, to: write, tone: "low", label: "compressed" }],
          highlight: { kind: "match", indices: [write] },
          narration: `Write count digit '${d}' at w=${write}.`,
        });
        write += 1;
      }
    }
    i = j;
    steps.push({
      line: 13,
      array: snap(),
      pointers: ptrs(write, i),
      partitions: [{ from: 0, to: write - 1, tone: "low", label: "compressed" }],
      narration: `Advance i → ${i}.`,
    });
  }

  steps.push({
    line: 14,
    array: snap(),
    pointers: [{ name: "w", index: write, color: "mint" as const }],
    partitions: [{ from: 0, to: write - 1, tone: "low", label: "result" }],
    status: `length ${write}`,
    narration: `Compressed length = ${write}. Prefix: "${a.slice(0, write).join("")}".`,
  });
  return steps;
}

export const stringCompression: LessonBuilder<Inputs> = {
  slug: "string-compression",
  title: "Two Pointers — Run-Length Compression",
  subtitle: "Read with i/j, write with w — O(n) time, O(1) extra space in-place compression.",
  problem: "Given a mutable char array, compress runs of repeated characters in place to '<char><count>' (omit count when run length is 1) and return the new length.",
  spotIt: [
    "In-place transformation where output is shorter than (or equal to) the input.",
    "Two cursors: one reads contiguous runs, the other writes the compact form.",
    "Phrases: 'string compression', 'remove duplicates in place'.",
  ],
  avoidWhen: [
    "Output may be longer than input — you need a separate buffer.",
    "Encoding rules depend on global context, not on local runs.",
    "Input is immutable — switch to building a new string.",
  ],
  variant: "read-write",
  view: "array",
  code,
  defaultInputs: { s: "aaabbcddddd" },
  inputs: [{ key: "s", label: "Char array", kind: "string" }],
  validate: ({ s }) => (s.length > 20 ? ["Trim to ≤ 20 chars for readable animation."] : []),
  build,
};
