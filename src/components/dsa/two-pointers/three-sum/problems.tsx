/** 3-Sum problem set: sort, fix one number, and search the rest with two pointers. */

import { L, OUT, P, R, V, type PatternProblem } from "@/components/dsa/shared/pattern-canvas-types";

import { TripletStage } from "./TripletStage";
import { parseNumberList, triplet, tripletList, type TripletStep } from "./triplet-step";

/** `i` is violet, like every third pointer in the lesson track. */
const I = OUT;

type ThreeSumInput = { values: number[]; target: number };

function buildThreeSum(input: number[], target: number): TripletStep[] {
  const numbers = input.slice().sort((a, b) => a - b);
  const n = numbers.length;
  const alreadySorted = numbers.every((value, index) => value === input[index]);
  const steps: TripletStep[] = [];
  const results: number[][] = [];
  let i: number | null = null;
  let left: number | null = null;
  let right: number | null = null;

  const base = (total?: number) => ({
    values: numbers.slice(),
    i,
    left,
    right,
    results: results.map((result) => result.slice()),
    stats: [
      { label: "i", value: i ?? "·", tone: "result" as const },
      { label: "left", value: left ?? "·", tone: "left" as const },
      { label: "right", value: right ?? "·", tone: "right" as const },
      { label: "total", value: total ?? "·", tone: "value" as const },
      { label: "found", value: results.length },
    ],
  });

  steps.push({
    ...base(),
    phase: "Sorting the array",
    codeLines: [2, 3],
    codeNote: [P("numbers.sort()  →  "), OUT(triplet(numbers)), P(", "), P("result = "), OUT("[]")],
    algoLine: 1,
    algoNote: [P("sorted: "), OUT(triplet(numbers))],
    narration: alreadySorted
      ? `The array is already sorted: ${triplet(numbers)}. Start with an empty result.`
      : `Sort the array first. It becomes ${triplet(numbers)}. Start with an empty result.`,
  });

  for (let a = 0; a <= n - 3; a++) {
    i = a;
    left = null;
    right = null;
    const fixed = numbers[a];

    steps.push({
      ...base(),
      phase: "Fixing a number",
      codeLines: [4],
      codeNote: [P("i = "), I(String(a)), P("  →  numbers[i] = "), V(String(fixed))],
      algoLine: 2,
      algoNote: [P("fix "), I(`numbers[${a}]`), P(" = "), V(String(fixed))],
      narration: `Fix numbers[${a}] = ${fixed}. The pointers will search the values after it for two numbers that complete the sum.`,
    });

    if (a > 0 && fixed === numbers[a - 1]) {
      steps.push({
        ...base(),
        phase: "Skipping a repeated value",
        codeLines: [6, 7],
        codeNote: [
          P("numbers["),
          I(String(a)),
          P("] == numbers["),
          I(String(a - 1)),
          P("]  →  "),
          V(`${fixed} == ${numbers[a - 1]}`),
          P(", "),
          OUT("continue"),
        ],
        algoLine: 3,
        algoNote: [V(String(fixed)), P(" repeats the previous value, so skip it")],
        narration: `numbers[${a}] is ${fixed}, the same as numbers[${a - 1}]. Every triplet that starts with ${fixed} was already searched, so skip it.`,
        skipped: [a],
      });
      continue;
    }

    left = a + 1;
    right = n - 1;
    steps.push({
      ...base(),
      phase: "Placing left and right",
      codeLines: a > 0 ? [6, 8, 9] : [8, 9],
      codeNote: [
        L("left"),
        P(" = "),
        I(String(a)),
        P(" + 1 = "),
        OUT(String(left)),
        P(", "),
        R("right"),
        P(" = "),
        OUT(String(right)),
      ],
      algoLine: 4,
      algoNote: [
        L("left"),
        P(" = "),
        OUT(String(left)),
        P(", "),
        R("right"),
        P(" = "),
        OUT(String(right)),
      ],
      narration:
        a > 0
          ? `numbers[${a}] is a new value, so search it. Place left right after i, at index ${left}, and right at the last index, ${right}.`
          : `Place left right after i, at index ${left}, and right at the last index, ${right}.`,
    });

    while (left < right) {
      const x = numbers[a];
      const y = numbers[left];
      const z = numbers[right];
      const total = x + y + z;
      const sumLabel = `${x} + ${y} + ${z} = ${total}`;

      steps.push({
        ...base(total),
        phase: "Adding the three values",
        codeLines: [10, 11],
        codeNote: [
          P("total = "),
          I(String(x)),
          P(" + "),
          L(String(y)),
          P(" + "),
          R(String(z)),
          P(" = "),
          OUT(String(total)),
        ],
        algoLine: 6,
        algoNote: [P("sum = "), V(`${x} + ${y} + ${z}`), P(" = "), OUT(String(total))],
        narration: `Add the three selected values: ${x} + ${y} + ${z} = ${total}. The target is ${target}.`,
        total: { label: sumLabel, tone: "amber" },
      });

      if (total === target) {
        steps.push({
          ...base(total),
          phase: "The sum matches",
          codeLines: [12],
          codeNote: [V(String(total)), P(" == "), V(String(target)), P("  →  "), OUT("True")],
          algoLine: 7,
          algoNote: [V(String(total)), P(" equals the target "), V(String(target))],
          narration: `${total} equals the target ${target}, so these three values are a triplet.`,
          total: { label: `${sumLabel} ✓`, tone: "mint" },
          found: true,
        });

        results.push([x, y, z]);
        steps.push({
          ...base(total),
          phase: "Saving the triplet",
          codeLines: [13, 14, 15, 16, 17],
          codeNote: [
            P("result.append("),
            OUT(triplet([x, y, z])),
            P(")  →  "),
            OUT(tripletList(results)),
          ],
          algoLine: 8,
          algoNote: [P("save "), OUT(triplet([x, y, z]))],
          narration: `Save ${triplet([x, y, z])} to the result. It now holds ${results.length} ${results.length === 1 ? "triplet" : "triplets"}.`,
          total: { label: `${sumLabel} ✓`, tone: "mint" },
          found: true,
        });

        left += 1;
        right -= 1;
        steps.push({
          ...base(),
          phase: "Moving both pointers",
          codeLines: [18, 19],
          codeNote: [
            L("left"),
            P(" = "),
            OUT(String(left)),
            P(", "),
            R("right"),
            P(" = "),
            OUT(String(right)),
          ],
          algoLine: 8,
          algoNote: [L("left"), P(" and "), R("right"), P(" both move inward")],
          narration: `A match used both ends, so move both pointers inward: left to ${left} and right to ${right}.`,
        });

        while (left < right && numbers[left] === numbers[left - 1]) {
          const old = left;
          left += 1;
          steps.push({
            ...base(),
            phase: "Skipping a repeated left value",
            codeLines: [21, 22],
            codeNote: [
              P("numbers["),
              L(String(old)),
              P("] == numbers["),
              L(String(old - 1)),
              P("]  →  "),
              V(`${numbers[old]} == ${numbers[old - 1]}`),
              P(", left = "),
              OUT(String(left)),
            ],
            algoLine: 9,
            algoNote: [L("left"), P(" skips the repeated "), V(String(numbers[old]))],
            narration: `numbers[${old}] repeats ${numbers[old - 1]}. Pairing it with the same fixed number would only rebuild the saved triplet, so move left on to ${left}.`,
            skipped: [old],
          });
        }

        while (left < right && numbers[right] === numbers[right + 1]) {
          const old = right;
          right -= 1;
          steps.push({
            ...base(),
            phase: "Skipping a repeated right value",
            codeLines: [24, 25],
            codeNote: [
              P("numbers["),
              R(String(old)),
              P("] == numbers["),
              R(String(old + 1)),
              P("]  →  "),
              V(`${numbers[old]} == ${numbers[old + 1]}`),
              P(", right = "),
              OUT(String(right)),
            ],
            algoLine: 9,
            algoNote: [R("right"), P(" skips the repeated "), V(String(numbers[old]))],
            narration: `numbers[${old}] repeats ${numbers[old + 1]}. It would only rebuild the saved triplet, so move right on to ${right}.`,
            skipped: [old],
          });
        }
      } else if (total < target) {
        steps.push({
          ...base(total),
          phase: "The sum is too small",
          codeLines: [12, 26],
          codeNote: [
            V(String(total)),
            P(" == "),
            V(String(target)),
            P(" is False, "),
            V(String(total)),
            P(" < "),
            V(String(target)),
            P("  →  "),
            OUT("True"),
          ],
          algoLine: 10,
          algoNote: [V(String(total)), P(" < "), V(String(target)), P(": the sum must grow")],
          narration: `${total} is less than ${target}. The sum has to grow, and in a sorted array the next value on the right is at least as large, so move left right.`,
          total: { label: `${sumLabel} < ${target}`, tone: "amber" },
        });

        const old = left;
        left += 1;
        steps.push({
          ...base(),
          phase: "Moving left",
          codeLines: [27],
          codeNote: [L("left"), P(" = "), L(String(old)), P(" + 1 = "), OUT(String(left))],
          algoLine: 11,
          algoNote: [L("left"), P(" moves to "), OUT(String(left))],
          narration: `Move left one step right, to index ${left}.`,
        });
      } else {
        steps.push({
          ...base(total),
          phase: "The sum is too large",
          codeLines: [12, 26, 28],
          codeNote: [
            V(String(total)),
            P(" is neither == nor < "),
            V(String(target)),
            P("  →  "),
            OUT("else"),
          ],
          algoLine: 12,
          algoNote: [V(String(total)), P(" > "), V(String(target)), P(": the sum must shrink")],
          narration: `${total} is greater than ${target}. The sum has to shrink, and in a sorted array the next value on the left is at most as large, so move right left.`,
          total: { label: `${sumLabel} > ${target}`, tone: "amber" },
        });

        const old = right;
        right -= 1;
        steps.push({
          ...base(),
          phase: "Moving right",
          codeLines: [29],
          codeNote: [R("right"), P(" = "), R(String(old)), P(" - 1 = "), OUT(String(right))],
          algoLine: 12,
          algoNote: [R("right"), P(" moves to "), OUT(String(right))],
          narration: `Move right one step left, to index ${right}.`,
        });
      }
    }

    steps.push({
      ...base(),
      phase: "The pointers met",
      codeLines: [10],
      codeNote: [
        P("while "),
        L(String(left)),
        P(" < "),
        R(String(right)),
        P("  →  "),
        OUT("False"),
      ],
      algoLine: 5,
      algoNote: [L("left"), P(" is no longer before "), R("right")],
      narration: `Left (${left}) is no longer before right (${right}), so no pair is left for numbers[${a}] = ${fixed}. Move i forward.`,
    });
  }

  i = null;
  left = null;
  right = null;
  steps.push({
    ...base(),
    phase: "Returning the result",
    codeLines: [30],
    codeNote: [P("return "), OUT(tripletList(results))],
    algoLine: 13,
    algoNote: [P("result "), OUT(tripletList(results))],
    narration: results.length
      ? `Every number has been fixed once. Return ${tripletList(results)}.`
      : `Every number has been fixed once and no triplet adds up to ${target}, so return an empty list.`,
    done: true,
  });

  return steps;
}

export const THREE_SUM_PROBLEMS = [
  {
    id: "three-sum",
    label: "3-Sum",
    file: "three_sum.py",
    identifiers: { i: "result", left: "left", right: "right" },
    python: [
      "def three_sum(numbers: list[int], target: int) -> list[list[int]]:",
      "    numbers.sort()",
      "    result = []",
      "    for i in range(len(numbers) - 2):",
      "        # Skip repeated fixed values",
      "        if i > 0 and numbers[i] == numbers[i - 1]:",
      "            continue",
      "        left = i + 1",
      "        right = len(numbers) - 1",
      "        while left < right:",
      "            total = numbers[i] + numbers[left] + numbers[right]",
      "            if total == target:",
      "                result.append([",
      "                    numbers[i],",
      "                    numbers[left],",
      "                    numbers[right]",
      "                ])",
      "                left += 1",
      "                right -= 1",
      "                # Skip repeated left values",
      "                while left < right and numbers[left] == numbers[left - 1]:",
      "                    left += 1",
      "                # Skip repeated right values",
      "                while left < right and numbers[right] == numbers[right + 1]:",
      "                    right -= 1",
      "            elif total < target:",
      "                left += 1",
      "            else:",
      "                right -= 1",
      "    return result",
    ],
    algorithm: [
      "sort the array and start an empty result",
      "for each i with two positions after it:",
      "    skip i if it repeats the previous value",
      "    put left after i and right at the end",
      "    while left is before right:",
      "        add up the three selected values",
      "        if the sum equals the target:",
      "            save the triplet, move both pointers",
      "            skip repeated left and right values",
      "        otherwise if the sum is too small:",
      "            move left right",
      "        otherwise move right left",
      "return the result",
    ],
    complexity: { time: "O(n²)", space: "O(1)" },
    example: {
      call: "numbers = [-4, -1, 0, 1, 2, 5]\nprint(three_sum(numbers, 0))",
      output: "[[-4, -1, 5], [-1, 0, 1]]",
    },
    presets: [
      { label: "Lesson example", input: { values: [-4, -1, 0, 1, 2, 5], target: 0 } },
      { label: "Repeated values", input: { values: [-1, 0, 1, 2, -1, -4], target: 0 } },
      { label: "Target 12", input: { values: [1, 2, 3, 4, 5, 6, 7], target: 12 } },
      { label: "No triplet", input: { values: [1, 2, 4, 8], target: 20 } },
    ],
    inputFields: [
      { key: "values", placeholder: "e.g. -4, -1, 0, 1, 2, 5", size: "wide" },
      { key: "target", label: "target", size: "narrow" },
    ],
    formatInput: (input) => ({ values: input.values.join(", "), target: String(input.target) }),
    parseInput: (fields) => {
      const values = parseNumberList(fields.values ?? "", 3, 9);
      if (typeof values === "string") return values;
      const target = Number(fields.target);
      if (!fields.target?.trim() || !Number.isInteger(target))
        return "The target must be a whole number.";
      return { values, target };
    },
    build: ({ values, target }) => buildThreeSum(values, target),
    Stage: TripletStage,
  } satisfies PatternProblem<TripletStep, ThreeSumInput>,
];
