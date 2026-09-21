import type { LessonBuilder, Step } from "../types";

type Inputs = { matrix: number[][] };

const code = `def rotate(matrix):
    n = len(matrix)
    # 1) transpose
    for row in range(n):
        for col in range(row + 1, n):
            matrix[row][col], matrix[col][row] = matrix[col][row], matrix[row][col]
    # 2) reverse each row
    for row in range(n):
        matrix[row].reverse()
    return matrix`;

function clone(m: number[][]): number[][] {
  return m.map((r) => [...r]);
}

function build({ matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  const m = clone(matrix);
  const n = m.length;
  if (!n || m.some((r) => r.length !== n)) {
    steps.push({ line: 1, matrix: m, narration: "Matrix must be square." });
    return steps;
  }
  steps.push({
    line: 1,
    matrix: clone(m),
    narration: `Rotate ${n}×${n} matrix 90° clockwise via transpose + row-reverse.`,
  });

  for (let row = 0; row < n; row++) {
    for (let col = row + 1; col < n; col++) {
      steps.push({
        line: 4,
        matrix: clone(m),
        cellHighlights: [
          { r: row, c: col, tone: "swap" },
          { r: col, c: row, tone: "swap" },
        ],
        narration: `Transpose: swap (${row},${col}) ↔ (${col},${row}).`,
      });
      [m[row][col], m[col][row]] = [m[col][row], m[row][col]];
    }
  }
  steps.push({ line: 6, matrix: clone(m), narration: "Transposed. Now reverse each row." });

  for (let row = 0; row < n; row++) {
    m[row].reverse();
    steps.push({
      line: 8,
      matrix: clone(m),
      cellHighlights: m[row].map((_, col) => ({ r: row, c: col, tone: "visit" as const })),
      narration: `Reversed row ${row}.`,
    });
  }
  steps.push({ line: 9, matrix: clone(m), narration: "Rotation complete." });
  return steps;
}

export const rotate90: LessonBuilder<Inputs> = {
  slug: "rotate-90",
  title: "Matrix Rotate 90° (Clockwise)",
  subtitle: "Transpose, then reverse each row — an in-place 90° rotation.",
  problem: "Rotate an n×n matrix by 90° clockwise, in place, without allocating a second matrix.",
  spotIt: [
    "'Rotate an n×n matrix in place by 90°.'",
    "Constraints forbid allocating a second matrix.",
    "Variations: rotate 180° / 270°, rotate image clockwise / counter-clockwise.",
  ],
  avoidWhen: [
    "Matrix is not square — use a transpose + dimension swap into a new matrix.",
    "Extra memory is fine — a straight index-mapping copy is simpler.",
    "You need to rotate by an arbitrary angle, not a multiple of 90°.",
  ],
  variant: "rotate-90",
  view: "matrix",
  code,
  defaultInputs: {
    matrix: [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
    ],
  },
  inputs: [{ key: "matrix", label: "Square matrix", kind: "intMatrix" }],
  validate: ({ matrix }) => {
    const w: string[] = [];
    if (!matrix.length) w.push("Matrix is empty.");
    else if (matrix.some((r) => r.length !== matrix.length))
      w.push("In-place rotation requires a square matrix.");
    return w;
  },
  build,
};
