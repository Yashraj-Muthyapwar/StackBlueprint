/** Hash set membership problem set: remember the values seen so far in a set. */

import { L, OUT, P, V, type PatternProblem } from "@/components/dsa/shared/pattern-canvas-types";

import { SeenStage } from "./SeenStage";
import { parseValues, setText, type SeenStep } from "./seen-step";

type SeenInput = { values: number[] };

function buildContainsDuplicate(values: number[]): SeenStep[] {
  const steps: SeenStep[] = [];
  const seen: number[] = [];
  let index: number | null = null;

  const base = (): Pick<SeenStep, "values" | "index" | "seen" | "stats"> => ({
    values: values.slice(),
    index,
    seen: seen.slice(),
    stats: [
      { label: "value", value: index === null ? "·" : values[index], tone: "value" },
      { label: "seen", value: setText(seen), tone: "left" },
      { label: "size", value: seen.length },
    ],
  });

  steps.push({
    ...base(),
    phase: "Starting with an empty set",
    codeLines: [2],
    codeNote: [L("seen"), P(" = "), OUT("set()"), P("  →  "), OUT("{}")],
    algoLine: 1,
    algoNote: [L("seen"), P(" starts empty")],
    narration:
      values.length === 0
        ? "Create an empty set called seen. The list is empty, so the loop will not run."
        : "Create an empty set called seen. It will remember every value we read.",
  });

  for (let i = 0; i < values.length; i++) {
    index = i;
    const value = values[i];
    const repeat = seen.includes(value);

    steps.push({
      ...base(),
      phase: "Reading the next value",
      codeLines: [3],
      codeNote: [P("for "), V("value"), P(" in values  →  "), V(String(value))],
      algoLine: 2,
      algoNote: [P("take "), V(String(value))],
      narration: `Read ${value}, the value at index ${i}.`,
    });

    steps.push({
      ...base(),
      phase: repeat ? "Already in the set" : "Not in the set",
      codeLines: [4],
      codeNote: [
        P("if "),
        V(String(value)),
        P(" in "),
        L(setText(seen)),
        P("  →  "),
        OUT(repeat ? "True" : "False"),
      ],
      algoLine: 3,
      algoNote: [V(String(value)), P(repeat ? " is already in " : " is not in "), L("seen")],
      narration: repeat
        ? `${value} is already in seen, so it appeared earlier in the list.`
        : `${value} is not in seen, so it has not appeared before.`,
      repeat,
    });

    if (repeat) {
      steps.push({
        ...base(),
        phase: "Returning True",
        codeLines: [5],
        codeNote: [P("return "), OUT("True")],
        algoLine: 4,
        algoNote: [P("return "), OUT("True")],
        narration: `A repeat was found, so the function returns True right away. The remaining values never need to be read.`,
        repeat: true,
        result: true,
      });
      return steps;
    }

    seen.push(value);
    steps.push({
      ...base(),
      phase: "Remembering the value",
      codeLines: [6],
      codeNote: [L("seen"), P(".add("), V(String(value)), P(")  →  "), L(setText(seen))],
      algoLine: 5,
      algoNote: [P("add "), V(String(value)), P(" to "), L("seen")],
      narration: `Add ${value} to seen so a later copy of it can be recognised.`,
      added: value,
    });
  }

  index = null;
  steps.push({
    ...base(),
    phase: "Returning False",
    codeLines: [7],
    codeNote: [P("return "), OUT("False")],
    algoLine: 6,
    algoNote: [P("return "), OUT("False")],
    narration:
      values.length === 0
        ? "There are no values, so nothing can repeat. The function returns False."
        : "The loop read every value and none was already in the set. The function returns False.",
    result: false,
  });
  return steps;
}

export const HASH_MEMBERSHIP_PROBLEMS: PatternProblem<SeenStep, SeenInput>[] = [
  {
    id: "contains-duplicate",
    label: "Contains Duplicate",
    file: "contains_duplicate.py",
    python: [
      "def contains_duplicate(values):",
      "    seen = set()",
      "    for value in values:",
      "        if value in seen:",
      "            return True",
      "        seen.add(value)",
      "    return False",
    ],
    algorithm: [
      "start with an empty set called seen",
      "take the next value from the list",
      "if value is already in seen",
      "    return True",
      "otherwise add value to seen",
      "after the last value, return False",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    example: { call: "print(contains_duplicate([12, 25, 37, 12, 49]))", output: "True" },
    identifiers: { seen: "left", value: "value" },
    presets: [
      { label: "Lesson example", input: { values: [12, 25, 37, 12, 49] } },
      { label: "All different", input: { values: [3, 8, 5, 1] } },
      { label: "Repeat at the end", input: { values: [7, 4, 9, 2, 7] } },
      { label: "Empty list", input: { values: [] } },
    ],
    inputFields: [{ key: "values", placeholder: "e.g. 12, 25, 37, 12", size: "wide" }],
    formatInput: (input) => ({ values: input.values.join(", ") }),
    parseInput: (fields) => {
      const values = parseValues(fields.values ?? "");
      return typeof values === "string" ? values : { values };
    },
    build: (input) => buildContainsDuplicate(input.values),
    Stage: SeenStage,
  },
];
