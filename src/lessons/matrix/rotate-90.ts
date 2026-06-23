import type { LessonBuilder, Step } from "../types";

type Inputs = { matrix: number[][] };

const code = `def rotate(mat):
    n = len(mat)
    # 1) transpose
    for r in range(n):
        for c in range(r + 1, n):
            mat[r][c], mat[c][r] = mat[c][r], mat[r][c]
    # 2) reverse each row
    for r in range(n):
        mat[r].reverse()
    return mat`;

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
  steps.push({ line: 1, matrix: clone(m), narration: `Rotate ${n}×${n} matrix 90° clockwise via transpose + row-reverse.` });

  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {
      steps.push({
        line: 4,
        matrix: clone(m),
        cellHighlights: [
          { r, c, tone: "swap" },
          { r: c, c: r, tone: "swap" },
        ],
        narration: `Transpose: swap (${r},${c}) ↔ (${c},${r}).`,
      });
      [m[r][c], m[c][r]] = [m[c][r], m[r][c]];
    }
  }
  steps.push({ line: 6, matrix: clone(m), narration: "Transposed. Now reverse each row." });

  for (let r = 0; r < n; r++) {
    m[r].reverse();
    steps.push({
      line: 8,
      matrix: clone(m),
      cellHighlights: m[r].map((_, c) => ({ r, c, tone: "visit" as const })),
      narration: `Reversed row ${r}.`,
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
    else if (matrix.some((r) => r.length !== matrix.length)) w.push("In-place rotation requires a square matrix.");
    return w;
  },
  build,
};
