import type { LessonBuilder, Step } from "../types";

type Inputs = { matrix: number[][] };

const code = `def transpose_then_flip(mat):
    R, C = len(mat), len(mat[0])
    # transpose (creates a new R×C → C×R)
    t = [[mat[r][c] for r in range(R)] for c in range(C)]
    # horizontal flip (reverse each row)
    for r in range(len(t)):
        t[r].reverse()
    return t`;

const clone = (m: number[][]) => m.map((r) => [...r]);

function build({ matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!matrix.length || !matrix[0]?.length) {
    steps.push({ line: 1, matrix, narration: "Empty matrix." });
    return steps;
  }
  const R = matrix.length;
  const C = matrix[0].length;
  steps.push({ line: 1, matrix: clone(matrix), narration: `Input ${R}×${C}. Transpose, then flip each row.` });

  const t: number[][] = Array.from({ length: C }, () => new Array(R).fill(0));
  for (let c = 0; c < C; c++) {
    for (let r = 0; r < R; r++) {
      t[c][r] = matrix[r][c];
      steps.push({
        line: 4,
        matrix: clone(t),
        cellHighlights: [{ r: c, c: r, tone: "compare" }],
        narration: `t[${c}][${r}] ← mat[${r}][${c}] = ${matrix[r][c]}.`,
      });
    }
  }
  steps.push({ line: 5, matrix: clone(t), narration: "Transposed. Now flip each row." });
  for (let r = 0; r < t.length; r++) {
    t[r].reverse();
    steps.push({
      line: 7,
      matrix: clone(t),
      cellHighlights: t[r].map((_, c) => ({ r, c, tone: "visit" as const })),
      narration: `Reversed row ${r}.`,
    });
  }
  steps.push({ line: 8, matrix: clone(t), narration: "Done." });
  return steps;
}

export const transposeFlip: LessonBuilder<Inputs> = {
  slug: "transpose-flip",
  title: "Transpose & Flip",
  subtitle: "Compose two simple passes — transpose, then reverse rows — for rotations and reflections.",
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
  zvalidate: ({ matrix }) => (matrix.length === 0 || matrix[0].length === 0 ? ["Matrix is empty."] : []),
  build,
};
