import type { LessonBuilder, Step } from "../types";

type Inputs = { s: string };

const code = `def compress(chars):
    write = 0
    i = 0
    while i < len(chars):
        right = i
        while right < len(chars) and chars[right] == chars[i]:
            right += 1
        chars[write] = chars[i]
        write += 1
        run = right - i
        if run > 1:
            for digit in str(run):
                chars[write] = digit
                write += 1
        i = right
    return write`;

function build({ s }: Inputs): Step[] {
  const steps: Step[] = [];
  const chars = s.split("");
  const n = chars.length;
  const snap = (): (number | string)[] => [...chars] as unknown as (number | string)[];

  if (n === 0) {
    steps.push({ line: 1, narration: "Empty input — return 0.", array: snap(), pointers: [] });
    return steps;
  }

  let write = 0;
  let i = 0;
  const ptrs = (w: number, i: number, right?: number) => {
    const out: import("../types").Pointer[] = [
      { name: "write", index: w, color: "mint" },
      { name: "i", index: i, color: "amber", placement: "below" },
    ];
    if (right !== undefined && right < n)
      out.push({ name: "right", index: right, color: "violet", placement: "below" });
    return out;
  };

  steps.push({
    line: 2,
    array: snap(),
    pointers: ptrs(write, i),
    narration: "Two write/read cursors: `write` writes the compressed prefix, `i` reads runs.",
  });

  while (i < n) {
    let right = i;
    while (right < n && chars[right] === chars[i]) right += 1;
    steps.push({
      line: 5,
      array: snap(),
      pointers: ptrs(write, i, right),
      partitions: [
        { from: i, to: right - 1, tone: "mid", label: `run '${chars[i]}'×${right - i}` },
      ],
      narration: `Run of '${chars[i]}' spans [${i}..${right - 1}], length ${right - i}.`,
    });
    chars[write] = chars[i];
    steps.push({
      line: 7,
      array: snap(),
      pointers: ptrs(write + 1, i, right),
      partitions: [{ from: 0, to: write, tone: "low", label: "compressed" }],
      highlight: { kind: "match", indices: [write] },
      narration: `Write '${chars[i]}' at write=${write}.`,
    });
    write += 1;
    const run = right - i;
    if (run > 1) {
      for (const digit of String(run)) {
        chars[write] = digit;
        steps.push({
          line: 11,
          array: snap(),
          pointers: ptrs(write + 1, i, right),
          partitions: [{ from: 0, to: write, tone: "low", label: "compressed" }],
          highlight: { kind: "match", indices: [write] },
          narration: `Write count digit '${digit}' at write=${write}.`,
        });
        write += 1;
      }
    }
    i = right;
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
    pointers: [{ name: "write", index: write, color: "mint" as const }],
    partitions: [{ from: 0, to: write - 1, tone: "low", label: "result" }],
    status: `length ${write}`,
    narration: `Compressed length = ${write}. Prefix: "${chars.slice(0, write).join("")}".`,
  });
  return steps;
}

export const stringCompression: LessonBuilder<Inputs> = {
  slug: "string-compression",
  title: "Two Pointers — Run-Length Compression",
  subtitle:
    "Read with i/right, write with write — O(n) time, O(1) extra space in-place compression.",
  problem:
    "Given a mutable char array, compress runs of repeated characters in place to '<char><count>' (omit count when run length is 1) and return the new length.",
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
