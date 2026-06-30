import type { LessonBuilder, Step } from "../types";

type Inputs = { matrix: number[][] };

const code = `def transpose_then_flip(matrix):
    rows, cols = len(matrix), len(matrix[0])
    # transpose (creates a new rows×cols → cols×rows)
    transposed = [[matrix[row][col] for row in range(rows)] for col in range(cols)]
    # horizontal flip (reverse each row)
    for row in range(len(transposed)):
        transposed[row].reverse()
    return transposed`;

const clone = (m: number[][]) => m.map((r) => [...r]);

function build({ matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!matrix.length || !matrix[0]?.length) {
    steps.push({ line: 1, matrix, narration: "Empty matrix." });
    return steps;
  }
  const rows = matrix.length;
  const cols = matrix[0].length;
  steps.push({ line: 1, matrix: clone(matrix), narration: `Input ${rows}×${cols}. Transpose, then flip each row.` });

  const transposed: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      transposed[col][row] = matrix[row][col];
      steps.push({
        line: 4,
        matrix: clone(transposed),
        cellHighlights: [{ r: col, c: row, tone: "compare" }],
        narration: `transposed[${col}][${row}] ← matrix[${row}][${col}] = ${matrix[row][col]}.`,
      });
    }
  }
  steps.push({ line: 5, matrix: clone(transposed), narration: "Transposed. Now flip each row." });
  for (let row = 0; row < transposed.length; row++) {
    transposed[row].reverse();
    steps.push({
      line: 7,
      matrix: clone(transposed),
      cellHighlights: transposed[row].map((_, col) => ({ r: row, c: col, tone: "visit" as const })),
      narration: `Reversed row ${row}.`,
    });
  }
  steps.push({ line: 8, matrix: clone(transposed), narration: "Done." });
  return steps;
}

export const transposeFlip: LessonBuilder<Inputs> = {
  slug: "transpose-flip",
  title: "Transpose & Flip",
  subtitle: "Compose two simple passes — transpose, then reverse rows — for rotations and reflections.",
  problem: "Given an n×n matrix, transpose it and then flip rows or columns to realize rotations and reflections.",
  spotIt: [
    "Any 90° rotation, reflection, or 'mirror' on a matrix.",
    "Two simple passes are cleaner than a single index-mapping pass.",
    "Interviewer asks you to reason about composing simpler transforms.",
  ],
  avoidWhen: [
    "You must do it in a single pass for cache reasons — use direct index mapping.",
    "Matrix is huge and two passes double the I/O cost.",
    "Transform isn't a composition of transpose + flip (e.g. arbitrary rotation).",
  ],
  variant: "transpose-flip",
  view: "matrix",
  code,
  defaultInputs: {
    matrix: [
      [1, 2, 3],
      [4, 5, 6],
    ],
  },
  inputs: [{ key: "matrix", label: "Matrix (any shape)", kind: "intMatrix" }],
  validate: ({ matrix }) => (matrix.length === 0 || matrix[0].length === 0 ? ["Matrix is empty."] : []),
  build,
};
