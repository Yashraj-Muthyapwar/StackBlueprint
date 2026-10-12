/** Same-direction problem set: remove duplicates, remove element, remove duplicates II. */

import { L, OUT, P, R, V, type PatternProblem } from "@/components/dsa/shared/pattern-canvas-types";

import { ScanStage } from "./ScanStage";
import { isSorted, listText, parseNumberList, type ScanStep } from "./scan-step";

const identifiers = { slow: "left", fast: "right" } as const;

/* ---------------------------- Remove duplicates ---------------------------- */

function buildRemoveDuplicates(input: number[]): ScanStep[] {
  const values = input.slice();
  const steps: ScanStep[] = [];
  let slow: number | null = null;
  const prefix = () => (slow === null ? -1 : slow);
  const stats = (fast: number | null): ScanStep["stats"] => [
    { label: "slow", value: slow ?? "·", tone: "left" },
    { label: "fast", value: fast ?? "·", tone: "right" },
    { label: "unique", value: slow === null ? "·" : slow + 1 },
  ];
  const base = (fast: number | null) => ({
    values: values.slice(),
    slow,
    fast,
    prefixEnd: prefix(),
    prefixLabel: "unique prefix",
    stats: stats(fast),
  });

  steps.push({
    ...base(null),
    phase: "Checking the input",
    codeLines: [2],
    codeNote: [P("if not "), V(listText(values)), P("  →  "), OUT("False, keep going")],
    algoLine: 1,
    algoNote: [P("the array has "), V(String(values.length)), P(" values, so keep going")],
    narration: "The array is not empty, so there is work to do.",
  });

  slow = 0;
  steps.push({
    ...base(null),
    phase: "Placing slow",
    codeLines: [5],
    codeNote: [L("slow"), P(" = "), OUT("0")],
    algoLine: 2,
    algoNote: [L("slow"), P(" marks index "), OUT("0")],
    narration: `Slow marks index 0. The first value, ${values[0]}, is always unique, so it starts the prefix.`,
  });

  for (let fast = 1; fast < values.length; fast++) {
    const a = values[fast];
    const b = values[slow];
    const isNew = a !== b;
    steps.push({
      ...base(fast),
      phase: isNew ? "Fast found a new value" : "Fast found a duplicate",
      codeLines: [6, 7],
      codeNote: [
        P("numbers["),
        R(String(fast)),
        P("] != numbers["),
        L(String(slow)),
        P("]  →  "),
        V(`${a} != ${b}`),
        P("  →  "),
        OUT(isNew ? "True" : "False"),
      ],
      algoLine: 4,
      algoNote: isNew
        ? [V(String(a)), P(" differs from "), V(String(b)), P(", so keep it")]
        : [V(String(a)), P(" matches "), V(String(b)), P(", so skip it")],
      narration: isNew
        ? `numbers[${fast}] is ${a}, which differs from ${b}. Fast found a new value.`
        : `numbers[${fast}] is ${a}, the same as numbers[${slow}]. It is a duplicate, so slow stays at ${slow}.`,
      compare: {
        with: slow,
        label: isNew ? `${a} != ${b}` : `${a} == ${b}`,
        tone: isNew ? "amber" : "rose",
      },
    });
    if (!isNew) continue;

    slow += 1;
    steps.push({
      ...base(fast),
      prefixEnd: slow - 1,
      phase: "Advancing slow",
      codeLines: [8],
      codeNote: [L("slow"), P(" = "), L(String(slow - 1)), P(" + 1 = "), OUT(String(slow))],
      algoLine: 5,
      algoNote: [L("slow"), P(" moves to index "), OUT(String(slow))],
      narration: `Slow advances to index ${slow} to make room for the new value.`,
    });

    values[slow] = a;
    steps.push({
      ...base(fast),
      phase: "Writing the value",
      codeLines: [9],
      codeNote: [
        P("numbers["),
        L(String(slow)),
        P("] = numbers["),
        R(String(fast)),
        P("] = "),
        OUT(String(a)),
      ],
      algoLine: 6,
      algoNote: [P("copy "), V(String(a)), P(" to index "), OUT(String(slow))],
      narration: `Copy ${a} into index ${slow}. The unique prefix is now ${listText(values.slice(0, slow + 1))}.`,
      write: { to: slow, label: `copy ${a}` },
      written: slow,
    });
  }

  const k = slow + 1;
  steps.push({
    ...base(null),
    phase: "Returning the count",
    codeLines: [11],
    codeNote: [P("return "), L(String(slow)), P(" + 1 = "), OUT(String(k))],
    algoLine: 7,
    algoNote: [P("unique count "), OUT(String(k))],
    narration: `Fast has checked every value. The first ${k} values, ${listText(values.slice(0, k))}, are the unique result. Return ${k}.`,
    done: true,
  });
  return steps;
}

/* ------------------------------ Remove element ----------------------------- */

function buildRemoveElement(input: number[], target: number): ScanStep[] {
  const values = input.slice();
  const steps: ScanStep[] = [];
  let slow = 0;
  const stats = (fast: number | null): ScanStep["stats"] => [
    { label: "slow", value: slow, tone: "left" },
    { label: "fast", value: fast ?? "·", tone: "right" },
    { label: "value", value: target, tone: "value" },
    { label: "kept", value: slow },
  ];
  const base = (fast: number | null) => ({
    values: values.slice(),
    slow,
    fast,
    prefixEnd: slow - 1,
    prefixLabel: "kept values",
    stats: stats(fast),
  });

  steps.push({
    ...base(null),
    phase: "Placing slow",
    codeLines: [2],
    codeNote: [L("slow"), P(" = "), OUT("0")],
    algoLine: 1,
    algoNote: [L("slow"), P(" marks the next free index, "), OUT("0")],
    narration: `Slow marks the next free position, index 0. Every ${target} will be skipped.`,
  });

  for (let fast = 0; fast < values.length; fast++) {
    const a = values[fast];
    const keep = a !== target;
    steps.push({
      ...base(fast),
      phase: keep ? "Fast found a value to keep" : "Fast found the value to remove",
      codeLines: [3, 4],
      codeNote: [
        P("numbers["),
        R(String(fast)),
        P("] != value  →  "),
        V(`${a} != ${target}`),
        P("  →  "),
        OUT(keep ? "True" : "False"),
      ],
      algoLine: 3,
      algoNote: keep
        ? [V(String(a)), P(" is not "), V(String(target)), P(", so keep it")]
        : [V(String(a)), P(" is the value to remove, so skip it")],
      narration: keep
        ? `numbers[${fast}] is ${a}, not ${target}. Fast found a value to keep.`
        : `numbers[${fast}] is ${a}, the value to remove. Skip it; slow stays at ${slow}.`,
    });
    if (!keep) continue;

    values[slow] = a;
    steps.push({
      ...base(fast),
      prefixEnd: slow,
      phase: "Writing the value",
      codeLines: [5],
      codeNote: [
        P("numbers["),
        L(String(slow)),
        P("] = numbers["),
        R(String(fast)),
        P("] = "),
        OUT(String(a)),
      ],
      algoLine: 4,
      algoNote: [P("copy "), V(String(a)), P(" to index "), OUT(String(slow))],
      narration:
        slow === fast
          ? `Slow and fast are both at index ${slow}, so ${a} stays where it is.`
          : `Copy ${a} into index ${slow}, the next free position.`,
      write: { to: slow, label: slow === fast ? `keep ${a}` : `copy ${a}` },
      written: slow,
    });

    slow += 1;
    steps.push({
      ...base(fast),
      phase: "Advancing slow",
      codeLines: [6],
      codeNote: [L("slow"), P(" = "), L(String(slow - 1)), P(" + 1 = "), OUT(String(slow))],
      algoLine: 5,
      algoNote: [L("slow"), P(" moves to index "), OUT(String(slow))],
      narration: `Slow moves to index ${slow}, the next free position.`,
    });
  }

  steps.push({
    ...base(null),
    phase: "Returning the count",
    codeLines: [8],
    codeNote: [P("return "), OUT(String(slow))],
    algoLine: 6,
    algoNote: [P("kept count "), OUT(String(slow))],
    narration:
      slow === 0
        ? `Every value was ${target}, so nothing is kept. Return 0.`
        : `Fast has checked every value. The first ${slow} values, ${listText(values.slice(0, slow))}, are the result. Return ${slow}.`,
    done: true,
  });
  return steps;
}

/* --------------------------- Remove duplicates II -------------------------- */

function buildRemoveDuplicatesTwo(input: number[]): ScanStep[] {
  const values = input.slice();
  const steps: ScanStep[] = [];
  let slow: number | null = null;
  const stats = (fast: number | null): ScanStep["stats"] => [
    { label: "slow", value: slow ?? "·", tone: "left" },
    { label: "fast", value: fast ?? "·", tone: "right" },
    { label: "kept", value: slow ?? "·" },
  ];
  const base = (fast: number | null) => ({
    values: values.slice(),
    slow,
    fast,
    prefixEnd: slow === null ? -1 : slow - 1,
    prefixLabel: "kept values",
    stats: stats(fast),
  });

  const short = values.length <= 2;
  steps.push({
    ...base(null),
    phase: "Checking the length",
    codeLines: [2],
    codeNote: [
      P("len(numbers) <= 2  →  "),
      V(`${values.length} <= 2`),
      P("  →  "),
      OUT(short ? "True" : "False"),
    ],
    algoLine: 1,
    algoNote: short
      ? [P("only "), V(String(values.length)), P(" values, already fine")]
      : [V(String(values.length)), P(" values, so keep going")],
    narration: short
      ? "With two values or fewer, no value can appear more than twice."
      : "The first two values can always stay, because each value may appear twice.",
  });

  if (short) {
    steps.push({
      ...base(null),
      prefixEnd: values.length - 1,
      phase: "Returning the count",
      codeLines: [3],
      codeNote: [P("return "), OUT(String(values.length))],
      algoLine: 1,
      algoNote: [P("kept count "), OUT(String(values.length))],
      narration: `Return ${values.length}. Every value is kept.`,
      done: true,
    });
    return steps;
  }

  slow = 2;
  steps.push({
    ...base(null),
    phase: "Placing slow",
    codeLines: [5],
    codeNote: [L("slow"), P(" = "), OUT("2")],
    algoLine: 2,
    algoNote: [L("slow"), P(" marks the next free index, "), OUT("2")],
    narration: "Slow marks index 2, the next free position after the two values that always stay.",
  });

  for (let fast = 2; fast < values.length; fast++) {
    const a = values[fast];
    const b = values[slow - 2];
    const keep = a !== b;
    steps.push({
      ...base(fast),
      phase: keep ? "Fast found a value to keep" : "Fast found a third copy",
      codeLines: [6, 7],
      codeNote: [
        P("numbers["),
        R(String(fast)),
        P("] != numbers["),
        L(String(slow - 2)),
        P("]  →  "),
        V(`${a} != ${b}`),
        P("  →  "),
        OUT(keep ? "True" : "False"),
      ],
      algoLine: 4,
      algoNote: keep
        ? [V(String(a)), P(" differs from "), V(String(b)), P(", so keep it")]
        : [V(String(a)), P(" already appears twice, so skip it")],
      narration: keep
        ? `numbers[${fast}] is ${a}, and the value two places behind slow is ${b}. Keeping ${a} cannot make a third copy.`
        : `numbers[${fast}] is ${a}, the same as two places behind slow. Keeping it would make a third copy, so skip it.`,
      compare: {
        with: slow - 2,
        label: keep ? `${a} != ${b}` : `${a} == ${b}`,
        tone: keep ? "amber" : "rose",
      },
    });
    if (!keep) continue;

    values[slow] = a;
    steps.push({
      ...base(fast),
      prefixEnd: slow,
      phase: "Writing the value",
      codeLines: [8],
      codeNote: [
        P("numbers["),
        L(String(slow)),
        P("] = numbers["),
        R(String(fast)),
        P("] = "),
        OUT(String(a)),
      ],
      algoLine: 5,
      algoNote: [P("copy "), V(String(a)), P(" to index "), OUT(String(slow))],
      narration:
        slow === fast
          ? `Slow and fast are both at index ${slow}, so ${a} stays where it is.`
          : `Copy ${a} into index ${slow}, the next free position.`,
      write: { to: slow, label: slow === fast ? `keep ${a}` : `copy ${a}` },
      written: slow,
    });

    slow += 1;
    steps.push({
      ...base(fast),
      phase: "Advancing slow",
      codeLines: [9],
      codeNote: [L("slow"), P(" = "), L(String(slow - 1)), P(" + 1 = "), OUT(String(slow))],
      algoLine: 6,
      algoNote: [L("slow"), P(" moves to index "), OUT(String(slow))],
      narration: `Slow moves to index ${slow}, the next free position.`,
    });
  }

  steps.push({
    ...base(null),
    phase: "Returning the count",
    codeLines: [11],
    codeNote: [P("return "), OUT(String(slow))],
    algoLine: 7,
    algoNote: [P("kept count "), OUT(String(slow))],
    narration: `Fast has checked every value. The first ${slow} values, ${listText(values.slice(0, slow))}, keep each value at most twice. Return ${slow}.`,
    done: true,
  });
  return steps;
}

/* -------------------------------- Registry -------------------------------- */

type ValuesInput = { values: number[] };
type RemoveInput = { values: number[]; value: number };

const sortedValues = {
  inputFields: [{ key: "values", placeholder: "sorted, e.g. 1, 1, 2, 3", size: "wide" as const }],
  formatInput: (input: ValuesInput) => ({ values: input.values.join(", ") }),
  parseInput: (fields: Record<string, string>): ValuesInput | string => {
    const values = parseNumberList(fields.values ?? "", 8);
    if (typeof values === "string") return values;
    if (!isSorted(values))
      return "This method needs the values sorted from smallest to largest, so equal values sit next to each other.";
    return { values };
  },
};

export const FAST_SLOW_PROBLEMS = [
  {
    id: "remove-duplicates",
    label: "Remove Duplicates",
    file: "remove_duplicates.py",
    identifiers,
    python: [
      "def remove_duplicates(numbers):",
      "    if not numbers:",
      "        return 0",
      "",
      "    slow = 0",
      "    for fast in range(1, len(numbers)):",
      "        if numbers[fast] != numbers[slow]:",
      "            slow += 1",
      "            numbers[slow] = numbers[fast]",
      "",
      "    return slow + 1",
    ],
    algorithm: [
      "if the array is empty, return 0",
      "slow marks the last unique value",
      "for each fast from index 1 to the end:",
      "    if fast's value differs from slow's:",
      "        move slow one step right",
      "        copy fast's value to slow",
      "return slow + 1, the unique count",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    example: {
      call: "numbers = [2, 2, 4, 4, 6, 6, 8]\nk = remove_duplicates(numbers)\nprint(k)           # 4\nprint(numbers[:k]) # [2, 4, 6, 8]",
      output: "4\n[2, 4, 6, 8]",
    },
    presets: [
      { label: "Pairs", input: { values: [2, 2, 4, 4, 6, 6, 8] } },
      { label: "All the same", input: { values: [5, 5, 5, 5] } },
      { label: "Already unique", input: { values: [1, 2, 3, 4] } },
    ],
    ...sortedValues,
    build: ({ values }) => buildRemoveDuplicates(values),
    Stage: ScanStage,
  } satisfies PatternProblem<ScanStep, ValuesInput>,
  {
    id: "remove-element",
    label: "Remove Element",
    file: "remove_element.py",
    identifiers,
    python: [
      "def remove_element(numbers, value):",
      "    slow = 0",
      "    for fast in range(len(numbers)):",
      "        if numbers[fast] != value:",
      "            numbers[slow] = numbers[fast]",
      "            slow += 1",
      "",
      "    return slow",
    ],
    algorithm: [
      "slow marks the next free position",
      "for each fast from the first index:",
      "    if fast's value is not the one to remove:",
      "        copy fast's value to slow",
      "        move slow one step right",
      "return slow, the number of kept values",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    example: {
      call: "numbers = [3, 2, 2, 3, 4, 3]\nk = remove_element(numbers, 3)\nprint(k)\nprint(numbers[:k])",
      output: "3\n[2, 2, 4]",
    },
    presets: [
      { label: "Remove 3", input: { values: [3, 2, 2, 3, 4, 3], value: 3 } },
      { label: "No match", input: { values: [1, 2, 3], value: 9 } },
      { label: "All match", input: { values: [7, 7, 7], value: 7 } },
    ],
    inputFields: [
      { key: "values", placeholder: "e.g. 3, 2, 2, 3", size: "wide" },
      { key: "value", label: "remove", size: "narrow" },
    ],
    formatInput: (input) => ({ values: input.values.join(", "), value: String(input.value) }),
    parseInput: (fields) => {
      const values = parseNumberList(fields.values ?? "", 8);
      if (typeof values === "string") return values;
      const value = Number(fields.value);
      if (!fields.value?.trim() || !Number.isInteger(value))
        return "The value to remove must be a whole number.";
      return { values, value };
    },
    build: ({ values, value }) => buildRemoveElement(values, value),
    Stage: ScanStage,
  } satisfies PatternProblem<ScanStep, RemoveInput>,
  {
    id: "remove-duplicates-ii",
    label: "Remove Duplicates II",
    file: "remove_duplicates_ii.py",
    identifiers,
    python: [
      "def remove_duplicates_ii(numbers):",
      "    if len(numbers) <= 2:",
      "        return len(numbers)",
      "",
      "    slow = 2",
      "    for fast in range(2, len(numbers)):",
      "        if numbers[fast] != numbers[slow - 2]:",
      "            numbers[slow] = numbers[fast]",
      "            slow += 1",
      "",
      "    return slow",
    ],
    algorithm: [
      "two values or fewer are already fine",
      "slow marks the next free position",
      "for each fast from index 2 to the end:",
      "    if it differs from two behind slow:",
      "        copy fast's value to slow",
      "        move slow one step right",
      "return slow, the number of kept values",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    example: {
      call: "numbers = [1, 1, 1, 2, 2, 3]\nk = remove_duplicates_ii(numbers)\nprint(k)\nprint(numbers[:k])",
      output: "5\n[1, 1, 2, 2, 3]",
    },
    presets: [
      { label: "Triples", input: { values: [1, 1, 1, 2, 2, 3] } },
      { label: "Long run", input: { values: [0, 0, 1, 1, 1, 1, 2, 3] } },
      { label: "Two values", input: { values: [4, 4] } },
    ],
    ...sortedValues,
    build: ({ values }) => buildRemoveDuplicatesTwo(values),
    Stage: ScanStage,
  } satisfies PatternProblem<ScanStep, ValuesInput>,
];
