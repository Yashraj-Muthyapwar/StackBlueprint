/** Opposite-ends problem set: reverse an array, two sum on a sorted array, trapping rain water. */

import { L, OUT, P, R, V, type PatternProblem } from "@/components/dsa/shared/pattern-canvas-types";

import { ArrayStage } from "./ArrayStage";
import {
  listText,
  parseNumberList,
  pointerStats,
  range,
  toItems,
  type ArrayStep,
} from "./array-step";

/* ------------------------------ Reverse array ------------------------------ */

function buildReverse(values: number[]): ArrayStep[] {
  let items = toItems(values);
  const n = items.length;
  const steps: ArrayStep[] = [];
  let swaps = 0;
  let left = 0;
  let right = n - 1;

  const settledOutside = () => range(0, n - 1).filter((i) => i < left || i > right);
  const stats = () => [...pointerStats(left, right), { label: "swaps", value: swaps }];
  const remaining = (): ArrayStep["bracket"] =>
    left <= right
      ? {
          from: left,
          to: right,
          label: left === right ? "middle stays" : "still to reverse",
          tone: "muted",
        }
      : undefined;

  steps.push({
    phase: "Placing pointers",
    items,
    left: 0,
    right: null,
    codeLines: [2],
    codeNote: [L("left"), P(" = "), OUT("0")],
    algoLine: 1,
    algoNote: [L("left"), P(" starts at index "), OUT("0")],
    narration: "Place the left pointer on the first index.",
    bracket: { from: 0, to: n - 1, label: "still to reverse", tone: "muted" },
    stats: [...pointerStats(0, null), { label: "swaps", value: 0 }],
  });

  steps.push({
    phase: "Placing pointers",
    items,
    left,
    right,
    codeLines: [3],
    codeNote: [R("right"), P(" = "), V(String(n)), P(" - 1 = "), OUT(String(right))],
    algoLine: 2,
    algoNote: [R("right"), P(" starts at index "), OUT(String(right))],
    narration: `Place the right pointer on the last index. The array has ${n} elements, so the last index is ${right}.`,
    bracket: remaining(),
    stats: stats(),
  });

  while (true) {
    const condition = left < right;
    steps.push({
      phase: "Checking left < right",
      items,
      left,
      right,
      codeLines: [5],
      codeNote: [
        P("while "),
        L(String(left)),
        P(" < "),
        R(String(right)),
        P("  →  "),
        OUT(condition ? "True" : "False"),
      ],
      algoLine: 4,
      algoNote: [
        P("is "),
        L(String(left)),
        P(" before "),
        R(String(right)),
        P("?  "),
        OUT(condition ? "yes, keep going" : "no, stop"),
      ],
      narration: condition
        ? `${left} < ${right} is True. The pointers have not met, so run the loop body.`
        : left === right
          ? `${left} < ${right} is False. Both pointers sit on index ${left}, so the middle value stays where it is.`
          : `${left} < ${right} is False. The pointers crossed, so every pair has been swapped.`,
      settled: settledOutside(),
      bracket: remaining(),
      stats: stats(),
    });
    if (!condition) break;

    const a = items[left].value;
    const b = items[right].value;
    steps.push({
      phase: "Reading both values",
      items,
      left,
      right,
      codeLines: [6, 7, 8, 9],
      codeNote: [
        P("(numbers["),
        R(String(right)),
        P("], numbers["),
        L(String(left)),
        P("])  →  "),
        V(`(${b}, ${a})`),
      ],
      algoLine: 5,
      algoNote: [P("read "), V(String(a)), P(" and "), V(String(b))],
      narration: `Python reads the right side first: numbers[${right}] is ${b} and numbers[${left}] is ${a}. Both values are read before anything changes.`,
      focus: [left, right],
      settled: settledOutside(),
      arc: { tone: "amber", label: `read (${b}, ${a})`, dashed: true },
      stats: stats(),
    });

    items = items.slice();
    [items[left], items[right]] = [items[right], items[left]];
    swaps += 1;
    steps.push({
      phase: "Swapping values",
      items,
      left,
      right,
      codeLines: [6],
      codeNote: [
        P("numbers["),
        L(String(left)),
        P("] = "),
        OUT(String(b)),
        P(", numbers["),
        R(String(right)),
        P("] = "),
        OUT(String(a)),
      ],
      algoLine: 5,
      algoNote: [
        P("swap "),
        V(String(a)),
        P(" ⇄ "),
        V(String(b)),
        P("  →  "),
        OUT(listText(items)),
      ],
      narration: `Assign the values: ${b} goes to index ${left} and ${a} goes to index ${right}.`,
      swapped: [left, right],
      settled: settledOutside(),
      arc: { tone: "violet", label: `${a} ⇄ ${b}` },
      stats: stats(),
    });

    left += 1;
    steps.push({
      phase: "Moving inward",
      items,
      left,
      right,
      codeLines: [10],
      codeNote: [L("left"), P(" = "), L(String(left - 1)), P(" + 1 = "), OUT(String(left))],
      algoLine: 6,
      algoNote: [L("left"), P(" moves to index "), OUT(String(left))],
      narration: `Move the left pointer one step right, to index ${left}.`,
      settled: settledOutside(),
      bracket: remaining(),
      stats: stats(),
    });

    right -= 1;
    steps.push({
      phase: "Moving inward",
      items,
      left,
      right,
      codeLines: [11],
      codeNote: [R("right"), P(" = "), R(String(right + 1)), P(" - 1 = "), OUT(String(right))],
      algoLine: 7,
      algoNote: [R("right"), P(" moves to index "), OUT(String(right))],
      narration: `Move the right pointer one step left, to index ${right}.`,
      settled: settledOutside(),
      bracket: remaining(),
      stats: stats(),
    });
  }

  steps.push({
    phase: "Reversed in place",
    items,
    left,
    right,
    codeLines: [13],
    codeNote: [P("return "), OUT(listText(items))],
    algoLine: 9,
    algoNote: [P("result "), OUT(listText(items))],
    narration: `Return the same list, now reversed in place after ${swaps} ${swaps === 1 ? "swap" : "swaps"}. No second array was created.`,
    settled: range(0, n - 1),
    bracket: { from: 0, to: n - 1, label: "✓ reversed in place", tone: "mint" },
    stats: stats(),
  });
  return steps;
}

/* ---------------------------- Two Sum (sorted) ----------------------------- */

function buildTwoSum(values: number[], target: number): ArrayStep[] {
  const items = toItems(values);
  const n = items.length;
  const steps: ArrayStep[] = [];
  let left = 0;
  let right = n - 1;
  const outside = () => range(0, n - 1).filter((i) => i < left || i > right);
  const stats = (total?: number) => [
    ...pointerStats(left, right),
    { label: "target", value: target, tone: "value" as const },
    { label: "sum", value: total ?? "·", tone: "result" as const },
  ];
  const window = (): ArrayStep["bracket"] =>
    left <= right ? { from: left, to: right, label: "candidates", tone: "muted" } : undefined;

  steps.push({
    phase: "Placing pointers",
    items,
    left,
    right,
    codeLines: [2],
    codeNote: [L("left"), P(", "), R("right"), P(" = "), OUT(`0, ${right}`)],
    algoLine: 1,
    algoNote: [L("left"), P(" = "), OUT("0"), P(", "), R("right"), P(" = "), OUT(String(right))],
    narration: `Start with the smallest value on the left and the largest value on the right. We need a pair that adds to ${target}.`,
    bracket: window(),
    stats: stats(),
  });

  while (true) {
    const condition = left < right;
    steps.push({
      phase: "Checking left < right",
      items,
      left,
      right,
      codeLines: [3],
      codeNote: [
        P("while "),
        L(String(left)),
        P(" < "),
        R(String(right)),
        P("  →  "),
        OUT(condition ? "True" : "False"),
      ],
      algoLine: 2,
      algoNote: [
        P("is "),
        L(String(left)),
        P(" before "),
        R(String(right)),
        P("?  "),
        OUT(condition ? "yes" : "no, stop"),
      ],
      narration: condition
        ? `${left} < ${right} is True. There are still two different indices to try.`
        : "The pointers met. Every possible pair has been ruled out.",
      settled: outside(),
      bracket: window(),
      stats: stats(),
    });
    if (!condition) break;

    const a = items[left].value;
    const b = items[right].value;
    const total = a + b;
    steps.push({
      phase: "Adding the pair",
      items,
      left,
      right,
      codeLines: [4],
      codeNote: [P("total = "), L(String(a)), P(" + "), R(String(b)), P(" = "), OUT(String(total))],
      algoLine: 3,
      algoNote: [P("sum = "), V(String(a)), P(" + "), V(String(b)), P(" = "), OUT(String(total))],
      narration: `Add the two ends: ${a} + ${b} = ${total}.`,
      focus: [left, right],
      settled: outside(),
      arc: { tone: "amber", label: `${a} + ${b} = ${total}`, dashed: true },
      stats: stats(total),
    });

    if (total === target) {
      steps.push({
        phase: "Pair found",
        items,
        left,
        right,
        codeLines: [5, 6],
        codeNote: [
          V(String(total)),
          P(" == "),
          V(String(target)),
          P("  →  return "),
          OUT(`(${left}, ${right})`),
        ],
        algoLine: 4,
        algoNote: [P("sum equals target  →  "), OUT(`(${left}, ${right})`)],
        narration: `${total} equals the target ${target}. Return the indices (${left}, ${right}).`,
        found: true,
        settled: outside(),
        arc: { tone: "mint", label: `${a} + ${b} = ${target} ✓` },
        stats: stats(total),
      });
      return steps;
    }

    const tooSmall = total < target;
    steps.push({
      phase: tooSmall ? "Sum too small" : "Sum too large",
      items,
      left,
      right,
      codeLines: tooSmall ? [7] : [7, 9],
      codeNote: [
        V(String(total)),
        P(" < "),
        V(String(target)),
        P("  →  "),
        OUT(tooSmall ? "True" : "False, so else"),
      ],
      algoLine: tooSmall ? 5 : 6,
      algoNote: tooSmall
        ? [P("too small: "), L(String(a)), P(" cannot pair with anything")]
        : [P("too large: "), R(String(b)), P(" cannot pair with anything")],
      narration: tooSmall
        ? `${total} is less than ${target}. Even the largest remaining partner is too small for ${a}, so ${a} can never be part of the answer.`
        : `${total} is greater than ${target}. Even the smallest remaining partner is too big for ${b}, so ${b} can never be part of the answer.`,
      focus: [tooSmall ? left : right],
      settled: outside(),
      arc: { tone: "rose", label: `${total} ${tooSmall ? "<" : ">"} ${target}`, dashed: true },
      stats: stats(total),
    });

    if (tooSmall) left += 1;
    else right -= 1;
    steps.push({
      phase: "Ruling out one end",
      items,
      left,
      right,
      codeLines: [tooSmall ? 8 : 10],
      codeNote: tooSmall
        ? [L("left"), P(" = "), L(String(left - 1)), P(" + 1 = "), OUT(String(left))]
        : [R("right"), P(" = "), R(String(right + 1)), P(" - 1 = "), OUT(String(right))],
      algoLine: tooSmall ? 5 : 6,
      algoNote: tooSmall
        ? [L("left"), P(" moves to index "), OUT(String(left))]
        : [R("right"), P(" moves to index "), OUT(String(right))],
      narration: tooSmall
        ? `Move left inward to index ${left}. The value ${a} is crossed out.`
        : `Move right inward to index ${right}. The value ${b} is crossed out.`,
      settled: outside(),
      bracket: window(),
      stats: stats(),
    });
  }

  steps.push({
    phase: "No pair",
    items,
    left,
    right,
    codeLines: [11],
    codeNote: [P("return "), OUT("None")],
    algoLine: 7,
    algoNote: [P("no pair adds to "), V(String(target))],
    narration: `No two values add to ${target}, so return None.`,
    settled: range(0, n - 1),
    stats: stats(),
  });
  return steps;
}

/* --------------------------- Trapping rain water --------------------------- */

function buildRainWater(values: number[]): ArrayStep[] {
  const items = toItems(values);
  const n = items.length;
  const steps: ArrayStep[] = [];
  const water = values.map(() => 0);
  let total = 0;
  let left = 0;
  let right = n - 1;
  let leftMax = values[0];
  let rightMax = values[n - 1];
  const stats = () => [
    ...pointerStats(left, right),
    { label: "left_max", value: leftMax, tone: "left" as const },
    { label: "right_max", value: rightMax, tone: "right" as const },
    { label: "water", value: total, tone: "result" as const },
  ];
  const open = (): ArrayStep["bracket"] =>
    left < right ? { from: left, to: right, label: "not settled yet", tone: "muted" } : undefined;
  const snapshot = () => water.slice();

  steps.push({
    phase: "Placing pointers",
    items,
    left,
    right,
    codeLines: [4, 5, 6],
    codeNote: [
      L("left_max"),
      P(" = "),
      OUT(String(leftMax)),
      P(", "),
      R("right_max"),
      P(" = "),
      OUT(String(rightMax)),
      P(", water = "),
      OUT("0"),
    ],
    algoLine: 3,
    algoNote: [
      P("tallest seen: "),
      L(String(leftMax)),
      P(" on the left, "),
      R(String(rightMax)),
      P(" on the right"),
    ],
    narration:
      "Start at both ends. Each side remembers the tallest bar it has seen, because water above a bar is limited by the shorter of the two walls.",
    bracket: open(),
    water: snapshot(),
    stats: stats(),
  });

  while (left < right) {
    const leftLower = leftMax < rightMax;
    steps.push({
      phase: "Choosing a side",
      items,
      left,
      right,
      codeLines: leftLower ? [7, 8] : [7, 8, 12],
      codeNote: [
        L(String(leftMax)),
        P(" < "),
        R(String(rightMax)),
        P("  →  "),
        OUT(leftLower ? "True, move left" : "False, move right"),
      ],
      algoLine: leftLower ? 5 : 8,
      algoNote: leftLower
        ? [P("the "), L("left"), P(" wall is lower, so the left side is safe to settle")]
        : [P("the "), R("right"), P(" wall is lower or equal, so settle the right side")],
      narration: leftLower
        ? `left_max ${leftMax} is lower than right_max ${rightMax}. Water on the left side can only rise to ${leftMax}, so work on the left.`
        : `right_max ${rightMax} is not higher than left_max ${leftMax}. Water on the right side can only rise to ${rightMax}, so work on the right.`,
      bracket: open(),
      water: snapshot(),
      stats: stats(),
    });

    if (leftLower) {
      left += 1;
      const before = leftMax;
      leftMax = Math.max(leftMax, values[left]);
      steps.push({
        phase: "Stepping inward",
        items,
        left,
        right,
        codeLines: [9, 10],
        codeNote: [
          L("left_max"),
          P(" = max("),
          L(String(before)),
          P(", "),
          V(String(values[left])),
          P(") = "),
          OUT(String(leftMax)),
        ],
        algoLine: 6,
        algoNote: [
          L("left"),
          P(" moves to "),
          OUT(String(left)),
          P(", left_max is "),
          OUT(String(leftMax)),
        ],
        narration: `Move left to index ${left}, a bar of height ${values[left]}. The tallest left wall is now ${leftMax}.`,
        focus: [left],
        bracket: open(),
        water: snapshot(),
        stats: stats(),
      });
      const added = leftMax - values[left];
      water[left] = added;
      total += added;
      steps.push({
        phase: added ? "Filling water" : "No water here",
        items,
        left,
        right,
        codeLines: [11],
        codeNote: [
          P("water += "),
          L(String(leftMax)),
          P(" - "),
          V(String(values[left])),
          P(" = "),
          OUT(String(added)),
          P("  →  water = "),
          OUT(String(total)),
        ],
        algoLine: 7,
        algoNote: [P("add "), OUT(String(added)), P(" unit" + (added === 1 ? "" : "s"))],
        narration: added
          ? `Index ${left} holds ${leftMax} - ${values[left]} = ${added} unit${added === 1 ? "" : "s"} of water. Total: ${total}.`
          : `The bar at index ${left} is as tall as the wall, so it holds no water.`,
        focus: [left],
        bracket: open(),
        water: snapshot(),
        stats: stats(),
      });
    } else {
      right -= 1;
      const before = rightMax;
      rightMax = Math.max(rightMax, values[right]);
      steps.push({
        phase: "Stepping inward",
        items,
        left,
        right,
        codeLines: [13, 14],
        codeNote: [
          R("right_max"),
          P(" = max("),
          R(String(before)),
          P(", "),
          V(String(values[right])),
          P(") = "),
          OUT(String(rightMax)),
        ],
        algoLine: 9,
        algoNote: [
          R("right"),
          P(" moves to "),
          OUT(String(right)),
          P(", right_max is "),
          OUT(String(rightMax)),
        ],
        narration: `Move right to index ${right}, a bar of height ${values[right]}. The tallest right wall is now ${rightMax}.`,
        focus: [right],
        bracket: open(),
        water: snapshot(),
        stats: stats(),
      });
      const added = rightMax - values[right];
      water[right] = added;
      total += added;
      steps.push({
        phase: added ? "Filling water" : "No water here",
        items,
        left,
        right,
        codeLines: [15],
        codeNote: [
          P("water += "),
          R(String(rightMax)),
          P(" - "),
          V(String(values[right])),
          P(" = "),
          OUT(String(added)),
          P("  →  water = "),
          OUT(String(total)),
        ],
        algoLine: 10,
        algoNote: [P("add "), OUT(String(added)), P(" unit" + (added === 1 ? "" : "s"))],
        narration: added
          ? `Index ${right} holds ${rightMax} - ${values[right]} = ${added} unit${added === 1 ? "" : "s"} of water. Total: ${total}.`
          : `The bar at index ${right} is as tall as the wall, so it holds no water.`,
        focus: [right],
        bracket: open(),
        water: snapshot(),
        stats: stats(),
      });
    }
  }

  steps.push({
    phase: "All water counted",
    items,
    left,
    right,
    codeLines: [16],
    codeNote: [P("return "), OUT(String(total))],
    algoLine: 11,
    algoNote: [P("total water "), OUT(String(total))],
    narration: `The pointers met, so every bar has been settled. The bars trap ${total} unit${total === 1 ? "" : "s"} of water.`,
    bracket: { from: 0, to: n - 1, label: `✓ ${total} units trapped`, tone: "mint" },
    water: snapshot(),
    stats: stats(),
  });
  return steps;
}

/* -------------------------------- Registry -------------------------------- */

type ArrayInput = { values: number[]; target: number };
type ArrayProblem = PatternProblem<ArrayStep, ArrayInput>;

const isWhole = (values: number[]) => values.every((value) => Number.isInteger(value));
const identifiers = { left: "left", left_max: "left", right: "right", right_max: "right" } as const;
const valuesField = (placeholder: string) => ({
  key: "values",
  placeholder,
  size: "wide" as const,
});

/** Formats and parses the toolbar fields shared by the three problems. */
const arrayInput = (
  max: number,
  check: (values: number[]) => string | null,
  withTarget = false,
) => ({
  formatInput: (input: ArrayInput) => ({
    values: input.values.join(", "),
    ...(withTarget ? { target: String(input.target) } : {}),
  }),
  parseInput: (fields: Record<string, string>): ArrayInput | string => {
    const values = parseNumberList(fields.values ?? "", max);
    if (typeof values === "string") return values;
    const error = check(values);
    if (error) return error;
    if (!withTarget) return { values, target: 0 };
    const target = Number(fields.target);
    if (!fields.target?.trim() || !Number.isInteger(target))
      return "The target must be a whole number.";
    return { values, target };
  },
});

export const OPPOSITE_ENDS_PROBLEMS: ArrayProblem[] = [
  {
    id: "reverse",
    label: "Reverse Array",
    file: "reverse_array.py",
    identifiers,
    python: [
      "def reverse_array(numbers):",
      "    left = 0",
      "    right = len(numbers) - 1",
      "",
      "    while left < right:",
      "        numbers[left], numbers[right] = (",
      "            numbers[right],",
      "            numbers[left]",
      "        )",
      "        left += 1",
      "        right -= 1",
      "",
      "    return numbers",
    ],
    algorithm: [
      "set left to the first index",
      "set right to the last index",
      "",
      "while left is before right:",
      "    swap the values at left and right",
      "    move left one step to the right",
      "    move right one step to the left",
      "",
      "return the array, now reversed",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    example: {
      call: "numbers = [10, 20, 30, 40, 50]\nprint(reverse_array(numbers))",
      output: "[50, 40, 30, 20, 10]",
    },
    presets: [
      { label: "Odd length", input: { values: [10, 20, 30, 40, 50], target: 0 } },
      { label: "Even length", input: { values: [1, 2, 3, 4, 5, 6], target: 0 } },
      { label: "Single value", input: { values: [7], target: 0 } },
    ],
    inputFields: [valuesField("e.g. 4, 9, 1, 7")],
    ...arrayInput(8, (values) =>
      values.length < 1 || !isWhole(values) ? "Enter at least one whole number." : null,
    ),
    build: ({ values }) => buildReverse(values),
    Stage: (props) => <ArrayStage {...props} view="cells" settledStyle="placed" />,
  },
  {
    id: "two-sum",
    label: "Two Sum (Sorted)",
    file: "two_sum.py",
    identifiers,
    python: [
      "def two_sum(arr, target):",
      "    left, right = 0, len(arr) - 1",
      "    while left < right:",
      "        total = arr[left] + arr[right]",
      "        if total == target:",
      "            return (left, right)",
      "        if total < target:",
      "            left += 1",
      "        else:",
      "            right -= 1",
      "    return None",
    ],
    algorithm: [
      "left = first index, right = last index",
      "while left is before right:",
      "    add the values at left and right",
      "    sum equals target: return both indices",
      "    sum too small: move left one step right",
      "    sum too large: move right one step left",
      "no pair found: return None",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    example: {
      call: "numbers = [1, 3, 4, 5, 7, 10, 11]\nprint(two_sum(numbers, 9))",
      output: "(2, 3)",
    },
    presets: [
      { label: "Pair inside", input: { values: [1, 3, 4, 5, 7, 10, 11], target: 9 } },
      { label: "Pair at start", input: { values: [2, 7, 11, 15], target: 9 } },
      { label: "No pair", input: { values: [1, 2, 4, 8], target: 20 } },
    ],
    inputFields: [
      valuesField("e.g. 1, 3, 4, 7"),
      { key: "target", label: "target", size: "narrow" },
    ],
    ...arrayInput(
      8,
      (values) => {
        if (values.length < 2 || !isWhole(values)) return "Enter at least two whole numbers.";
        if (values.some((value, i) => i > 0 && value < values[i - 1]))
          return "Two Sum with opposite-end pointers needs the values sorted from smallest to largest.";
        return null;
      },
      true,
    ),
    build: ({ values, target }) => buildTwoSum(values, target),
    Stage: (props) => <ArrayStage {...props} view="cells" settledStyle="eliminated" />,
  },
  {
    id: "rain-water",
    label: "Trapping Rain Water",
    file: "trap.py",
    identifiers,
    python: [
      "def trap(heights):",
      "    if not heights:",
      "        return 0",
      "    left, right = 0, len(heights) - 1",
      "    left_max, right_max = heights[left], heights[right]",
      "    water = 0",
      "    while left < right:",
      "        if left_max < right_max:",
      "            left += 1",
      "            left_max = max(left_max, heights[left])",
      "            water += left_max - heights[left]",
      "        else:",
      "            right -= 1",
      "            right_max = max(right_max, heights[right])",
      "            water += right_max - heights[right]",
      "    return water",
    ],
    algorithm: [
      "if there are no bars, return 0",
      "put left on the first bar and right on the last bar",
      "remember the tallest bar seen from each side",
      "while left is before right:",
      "    if the left wall is lower:",
      "        step left inward and raise left_max if needed",
      "        add left_max minus this bar's height",
      "    otherwise:",
      "        step right inward and raise right_max if needed",
      "        add right_max minus this bar's height",
      "return the total water",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    example: {
      call: "heights = [4, 2, 0, 3, 2, 5]\nprint(trap(heights))",
      output: "9",
    },
    presets: [
      { label: "Basin", input: { values: [4, 2, 0, 3, 2, 5], target: 0 } },
      { label: "Classic", input: { values: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], target: 0 } },
      { label: "No water", input: { values: [1, 2, 3, 4], target: 0 } },
    ],
    inputFields: [valuesField("heights, e.g. 3, 0, 2")],
    ...arrayInput(12, (values) =>
      values.length < 2 || values.some((value) => value < 0 || value > 9)
        ? "Use at least two bar heights, each a whole number from 0 to 9."
        : null,
    ),
    build: ({ values }) => buildRainWater(values),
    Stage: (props) => <ArrayStage {...props} view="bars" settledStyle="none" />,
  },
];
