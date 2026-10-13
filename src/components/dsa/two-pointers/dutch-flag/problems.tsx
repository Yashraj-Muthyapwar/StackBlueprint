/** Dutch National Flag problem set: sort 0s, 1s and 2s, and partition around a pivot. */

import { L, OUT, P, R, V, type PatternProblem } from "@/components/dsa/shared/pattern-canvas-types";

import { FlagStage } from "./FlagStage";
import { listText, parseNumberList, type FlagStep } from "./flag-step";

type Group = 0 | 1 | 2;

type Config = {
  classify: (value: number) => Group;
  /** The two tests the decision structure runs, e.g. ["2 == 0", "2 == 1"]. */
  tests: (value: number) => [string, string];
  /** How the narration names the three kinds of value. */
  names: { zero: string; one: string; two: string };
  /** Narration for examining numbers[mid]. */
  examine: (value: number, index: number, group: Group) => string;
  labels: FlagStep["regionLabels"];
  finish: (list: string) => string;
};

/** One builder for every three-way partition: only the classification differs. */
function buildDutchFlag(input: number[], config: Config): FlagStep[] {
  const values = input.slice();
  const n = values.length;
  const steps: FlagStep[] = [];
  let low = 0;
  let mid = 0;
  let high = n - 1;

  const base = () => ({
    values: values.slice(),
    low,
    mid,
    high,
    regionLabels: config.labels,
    stats: [
      { label: "low", value: low, tone: "left" as const },
      { label: "mid", value: mid, tone: "value" as const },
      { label: "high", value: high, tone: "right" as const },
    ],
  });

  steps.push({
    ...base(),
    phase: "Placing pointers",
    codeLines: [2, 3, 4],
    codeNote: [
      L("low"),
      P(" = "),
      OUT("0"),
      P(", "),
      V("mid"),
      P(" = "),
      OUT("0"),
      P(", "),
      R("high"),
      P(" = "),
      OUT(String(high)),
    ],
    algoLine: 1,
    algoNote: [
      L("low"),
      P(" and "),
      V("mid"),
      P(" start at 0, "),
      R("high"),
      P(" at "),
      OUT(String(high)),
    ],
    narration: `Place low and mid on the first index and high on the last index, ${high}. Every element between mid and high is still unknown.`,
  });

  while (true) {
    const keepGoing = mid <= high;
    steps.push({
      ...base(),
      phase: "Checking mid <= high",
      codeLines: [6],
      codeNote: [
        P("while "),
        V(String(mid)),
        P(" <= "),
        R(String(high)),
        P("  →  "),
        OUT(keepGoing ? "True" : "False"),
      ],
      algoLine: 2,
      algoNote: [
        V(String(mid)),
        P(" has "),
        OUT(keepGoing ? "not passed" : "passed"),
        P(" "),
        R(String(high)),
      ],
      narration: keepGoing
        ? `${mid} <= ${high} is True, so there are still unknown elements to examine.`
        : `${mid} <= ${high} is False. Mid passed high, so no unknown elements are left.`,
    });
    if (!keepGoing) break;

    const value = values[mid];
    const group = config.classify(value);
    const [test0, test1] = config.tests(value);

    if (group === 0) {
      steps.push({
        ...base(),
        phase: "Examining numbers[mid]",
        codeLines: [7],
        codeNote: [
          P("numbers["),
          V(String(mid)),
          P("] is "),
          V(String(value)),
          P("  →  "),
          OUT(`${test0} is True`),
        ],
        algoLine: 3,
        algoNote: [V(`numbers[${mid}]`), P(" = "), V(String(value)), P(", so it goes left")],
        narration: config.examine(value, mid, 0),
      });
    } else if (group === 1) {
      steps.push({
        ...base(),
        phase: "Examining numbers[mid]",
        codeLines: [7, 14],
        codeNote: [
          P("numbers["),
          V(String(mid)),
          P("] is "),
          V(String(value)),
          P("  →  "),
          P(`${test0} is False, `),
          OUT(`${test1} is True`),
        ],
        algoLine: 5,
        algoNote: [V(`numbers[${mid}]`), P(" = "), V(String(value)), P(", so it stays")],
        narration: config.examine(value, mid, 1),
      });
    } else {
      steps.push({
        ...base(),
        phase: "Examining numbers[mid]",
        codeLines: [7, 14, 17],
        codeNote: [
          P("numbers["),
          V(String(mid)),
          P("] is "),
          V(String(value)),
          P("  →  both tests are False, so "),
          OUT("else"),
        ],
        algoLine: 7,
        algoNote: [V(`numbers[${mid}]`), P(" = "), V(String(value)), P(", so it goes right")],
        narration: config.examine(value, mid, 2),
      });
    }

    if (group === 0) {
      const same = low === mid;
      const lowValue = values[low];
      [values[low], values[mid]] = [values[mid], values[low]];
      steps.push({
        ...base(),
        phase: "Swapping with low",
        codeLines: [8, 9, 10],
        codeNote: [
          P("swap numbers["),
          L(String(low)),
          P("] and numbers["),
          V(String(mid)),
          P("]  →  "),
          OUT(listText(values)),
        ],
        algoLine: 4,
        algoNote: [P("swap "), L(`numbers[${low}]`), P(" with "), V(`numbers[${mid}]`)],
        narration: same
          ? `Low and mid are on the same index, so the ${config.names.zero} is already where it belongs.`
          : `Swap numbers[${low}] and numbers[${mid}]. The ${config.names.zero} joins the left group, and the ${config.names.one} that was at low (${lowValue}) moves to mid.`,
        swapped: [low, mid],
        swapLabel: `${value} ⇄ ${lowValue}`,
      });

      low += 1;
      steps.push({
        ...base(),
        phase: "Moving low",
        codeLines: [11],
        codeNote: [L("low"), P(" = "), L(String(low - 1)), P(" + 1 = "), OUT(String(low))],
        algoLine: 4,
        algoNote: [L("low"), P(" moves to "), OUT(String(low))],
        narration: `Move low one step right, to index ${low}. The left group grew by one.`,
      });

      mid += 1;
      steps.push({
        ...base(),
        phase: "Moving mid",
        codeLines: [12],
        codeNote: [V("mid"), P(" = "), V(String(mid - 1)), P(" + 1 = "), OUT(String(mid))],
        algoLine: 4,
        algoNote: [V("mid"), P(" moves to "), OUT(String(mid))],
        narration: `Move mid one step right, to index ${mid}, so the next unknown element is examined.`,
      });
    } else if (group === 1) {
      mid += 1;
      steps.push({
        ...base(),
        phase: "Moving mid",
        codeLines: [15],
        codeNote: [V("mid"), P(" = "), V(String(mid - 1)), P(" + 1 = "), OUT(String(mid))],
        algoLine: 6,
        algoNote: [V("mid"), P(" moves to "), OUT(String(mid))],
        narration: `Move mid one step right, to index ${mid}. The middle group grew by one.`,
      });
    } else {
      const same = mid === high;
      const highValue = values[high];
      [values[mid], values[high]] = [values[high], values[mid]];
      steps.push({
        ...base(),
        phase: "Swapping with high",
        codeLines: [18, 19, 20],
        codeNote: [
          P("swap numbers["),
          V(String(mid)),
          P("] and numbers["),
          R(String(high)),
          P("]  →  "),
          OUT(listText(values)),
        ],
        algoLine: 8,
        algoNote: [P("swap "), V(`numbers[${mid}]`), P(" with "), R(`numbers[${high}]`)],
        narration: same
          ? `Mid and high are on the same index, so the ${config.names.two} is already where it belongs.`
          : `Swap numbers[${mid}] (${value}) with numbers[${high}] (${highValue}). The ${config.names.two} joins the right group, and the value from the right arrives at mid.`,
        swapped: [mid, high],
        swapLabel: `${value} ⇄ ${highValue}`,
      });

      high -= 1;
      steps.push({
        ...base(),
        phase: "Moving high",
        codeLines: [21],
        codeNote: [R("high"), P(" = "), R(String(high + 1)), P(" - 1 = "), OUT(String(high))],
        algoLine: 8,
        algoNote: [R("high"), P(" moves to "), OUT(String(high))],
        narration:
          high < mid
            ? `Move high one step left, to index ${high}. Mid passed high, so no unknown elements are left.`
            : `Move high one step left, to index ${high}. Mid stays at ${mid}: the value that arrived from the right has not been examined yet.`,
      });
    }
  }

  steps.push({
    ...base(),
    phase: "Returning the array",
    codeLines: [23],
    codeNote: [P("return "), OUT(listText(values))],
    algoLine: 9,
    algoNote: [P("result "), OUT(listText(values))],
    narration: config.finish(listText(values)),
    done: true,
  });
  return steps;
}

/* -------------------------------- Registry -------------------------------- */

type SortInput = { values: number[] };
type PartitionInput = { values: number[]; pivot: number };

const identifiers = { low: "left", mid: "value", high: "right" } as const;

const sortConfig: Config = {
  classify: (value) => value as Group,
  tests: (value) => [`${value} == 0`, `${value} == 1`],
  names: { zero: "0", one: "1", two: "2" },
  examine: (value, index, group) =>
    group === 0
      ? `numbers[${index}] is 0. It belongs in the left group, with the zeros collected before low.`
      : group === 1
        ? `numbers[${index}] is 1. It already belongs in the middle group, so only mid needs to move.`
        : `numbers[${index}] is 2. It belongs at the right end, so swap it with the value at high.`,
  labels: {
    zeros: { short: "0s", long: "zeros" },
    ones: { short: "1s", long: "ones" },
    twos: { short: "2s", long: "twos" },
  },
  finish: (list) =>
    `Return the array. It is sorted in place: ${list}. No second array was created.`,
};

const partitionConfig = (pivot: number): Config => ({
  classify: (value) => (value < pivot ? 0 : value === pivot ? 1 : 2),
  tests: (value) => [`${value} < ${pivot}`, `${value} == ${pivot}`],
  names: { zero: "smaller value", one: "pivot value", two: "larger value" },
  examine: (value, index, group) =>
    group === 0
      ? `numbers[${index}] is ${value}, less than the pivot ${pivot}. It belongs in the left group.`
      : group === 1
        ? `numbers[${index}] is ${value}, equal to the pivot ${pivot}. It belongs in the middle group, so only mid needs to move.`
        : `numbers[${index}] is ${value}, greater than the pivot ${pivot}. It belongs at the right end, so swap it with the value at high.`,
  labels: {
    zeros: { short: "<", long: "less" },
    ones: { short: "=", long: "equal" },
    twos: { short: ">", long: "greater" },
  },
  finish: (list) =>
    `Return the array: values below ${pivot}, then ${pivot}, then larger values: ${list}.`,
});

export const DUTCH_FLAG_PROBLEMS = [
  {
    id: "sort-colors",
    label: "Sort 0, 1 and 2",
    file: "sort_colors.py",
    identifiers,
    python: [
      "def sort_colors(numbers):",
      "    low = 0",
      "    mid = 0",
      "    high = len(numbers) - 1",
      "",
      "    while mid <= high:",
      "        if numbers[mid] == 0:",
      "            numbers[low], numbers[mid] = (",
      "                numbers[mid], numbers[low]",
      "            )",
      "            low += 1",
      "            mid += 1",
      "",
      "        elif numbers[mid] == 1:",
      "            mid += 1",
      "",
      "        else:",
      "            numbers[mid], numbers[high] = (",
      "                numbers[high], numbers[mid]",
      "            )",
      "            high -= 1",
      "",
      "    return numbers",
    ],
    algorithm: [
      "put low and mid at the start, high at the end",
      "while mid has not passed high:",
      "    if the value at mid is 0:",
      "        swap with low, then move low and mid",
      "    otherwise if it is 1:",
      "        move mid right",
      "    otherwise it is 2:",
      "        swap with high, then move high left",
      "return the sorted array",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    example: {
      call: "numbers = [2, 0, 2, 1, 1, 0]\nsort_colors(numbers)\nprint(numbers)",
      output: "[0, 0, 1, 1, 2, 2]",
    },
    presets: [
      { label: "Mixed", input: { values: [2, 0, 2, 1, 1, 0] } },
      { label: "Walkthrough", input: { values: [2, 0, 1, 2, 1, 0] } },
      { label: "Already sorted", input: { values: [0, 1, 1, 2] } },
    ],
    inputFields: [{ key: "values", placeholder: "only 0, 1 and 2", size: "wide" }],
    formatInput: (input) => ({ values: input.values.join(", ") }),
    parseInput: (fields) => {
      const values = parseNumberList(fields.values ?? "", 9);
      if (typeof values === "string") return values;
      if (values.some((value) => value < 0 || value > 2))
        return "This problem sorts only the values 0, 1 and 2.";
      return { values };
    },
    build: ({ values }) => buildDutchFlag(values, sortConfig),
    Stage: FlagStage,
  } satisfies PatternProblem<FlagStep, SortInput>,
  {
    id: "partition",
    label: "Partition around a pivot",
    file: "partition_around_pivot.py",
    identifiers,
    python: [
      "def partition_around_pivot(numbers, pivot):",
      "    low = 0",
      "    mid = 0",
      "    high = len(numbers) - 1",
      "",
      "    while mid <= high:",
      "        if numbers[mid] < pivot:",
      "            numbers[low], numbers[mid] = (",
      "                numbers[mid], numbers[low]",
      "            )",
      "            low += 1",
      "            mid += 1",
      "",
      "        elif numbers[mid] == pivot:",
      "            mid += 1",
      "",
      "        else:",
      "            numbers[mid], numbers[high] = (",
      "                numbers[high], numbers[mid]",
      "            )",
      "            high -= 1",
      "",
      "    return numbers",
    ],
    algorithm: [
      "put low and mid at the start, high at the end",
      "while mid has not passed high:",
      "    if the value at mid is below the pivot:",
      "        swap with low, then move low and mid",
      "    otherwise if it equals the pivot:",
      "        move mid right",
      "    otherwise it is above the pivot:",
      "        swap with high, then move high left",
      "return the partitioned array",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    example: {
      call: "numbers = [7, 2, 5, 9, 5, 1]\npartition_around_pivot(numbers, 5)\nprint(numbers)",
      output: "[1, 2, 5, 5, 9, 7]",
    },
    presets: [
      { label: "Pivot 5", input: { values: [7, 2, 5, 9, 5, 1], pivot: 5 } },
      { label: "Pivot 3", input: { values: [3, 3, 1, 6, 2, 3, 8], pivot: 3 } },
      { label: "No match", input: { values: [8, 2, 9, 1], pivot: 5 } },
    ],
    inputFields: [
      { key: "values", placeholder: "e.g. 7, 2, 5, 9", size: "wide" },
      { key: "pivot", label: "pivot", size: "narrow" },
    ],
    formatInput: (input) => ({ values: input.values.join(", "), pivot: String(input.pivot) }),
    parseInput: (fields) => {
      const values = parseNumberList(fields.values ?? "", 9);
      if (typeof values === "string") return values;
      const pivot = Number(fields.pivot);
      if (!fields.pivot?.trim() || !Number.isInteger(pivot))
        return "The pivot must be a whole number.";
      return { values, pivot };
    },
    build: ({ values, pivot }) => buildDutchFlag(values, partitionConfig(pivot)),
    Stage: FlagStage,
  } satisfies PatternProblem<FlagStep, PartitionInput>,
];
