import type { LessonBuilder, Step } from "../types";

type Inputs = { matrix: number[][] };

const code = `def spiral(matrix):
    rows, cols = len(matrix), len(matrix[0])
    result = []
    top, bottom, left, right = 0, rows - 1, 0, cols - 1
    while top <= bottom and left <= right:
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1
        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1
        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1
        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1
    return result`;

function build({ matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!matrix.length || !matrix[0]?.length) {
    steps.push({ line: 1, matrix, narration: "Empty matrix." });
    return steps;
  }
  const rows = matrix.length;
  const cols = matrix[0].length;
  let top = 0,
    bottom = rows - 1,
    left = 0,
    right = cols - 1;
  const result: number[] = [];
  const visited: Array<{ r: number; c: number; tone: "visit" }> = [];

  const push = (line: number, r: number, c: number, narr: string) => {
    result.push(matrix[r][c]);
    visited.push({ r, c, tone: "visit" });
    steps.push({
      line,
      matrix,
      cellHighlights: [...visited.slice(0, -1), { r, c, tone: "match" as const }],
      cellPointers: [{ name: "pos", r, c, color: "mint" }],
      secondary: { label: "output", array: [...result] },
      narration: narr,
    });
  };

  steps.push({
    line: 4,
    matrix,
    narration: `Spiral over ${rows}×${cols}. Bounds: top, bottom, left, right.`,
  });

  let safety = 0;
  while (top <= bottom && left <= right && safety++ < 400) {
    for (let col = left; col <= right; col++)
      push(6, top, col, `→ (${top},${col}) = ${matrix[top][col]}`);
    top++;
    for (let row = top; row <= bottom; row++)
      push(9, row, right, `↓ (${row},${right}) = ${matrix[row][right]}`);
    right--;
    if (top <= bottom) {
      for (let col = right; col >= left; col--)
        push(13, bottom, col, `← (${bottom},${col}) = ${matrix[bottom][col]}`);
      bottom--;
    }
    if (left <= right) {
      for (let row = bottom; row >= top; row--)
        push(17, row, left, `↑ (${row},${left}) = ${matrix[row][left]}`);
      left++;
    }
  }
  steps.push({
    line: 19,
    matrix,
    cellHighlights: visited,
    secondary: { label: "output", array: [...result] },
    status: `len=${result.length}`,
    narration: `Spiral complete (${result.length} cells).`,
  });
  return steps;
}

export const spiral: LessonBuilder<Inputs> = {
  slug: "spiral-traversal",
  title: "Matrix Spiral Traversal",
  subtitle: "Four shrinking bounds — top, bottom, left, right — peel the matrix layer by layer.",
  problem:
    "Given an m×n matrix, return all its elements in spiral order, starting from the top-left and moving inward.",
  spotIt: [
    "'Print / collect the matrix in spiral order from outside in.'",
    "Output must follow a layered traversal pattern.",
    "Variants: generate a spiral matrix, spiral order of a rectangular grid.",
  ],
  avoidWhen: [
    "You just need to visit every cell — a normal nested loop is simpler.",
    "Traversal order is row-major or column-major — no spiral needed.",
    "Matrix is sparse — pure traversal wastes time on empty cells.",
  ],
  variant: "spiral",
  view: "matrix",
  code,
  defaultInputs: {
    matrix: [
      [1, 2, 3, 4],
      [12, 13, 14, 5],
      [11, 16, 15, 6],
      [10, 9, 8, 7],
    ],
  },
  inputs: [{ key: "matrix", label: "Matrix", kind: "intMatrix" }],
  validate: ({ matrix }) =>
    matrix.length === 0 || matrix[0]?.length === 0 ? ["Matrix is empty."] : [],
  build,
};
