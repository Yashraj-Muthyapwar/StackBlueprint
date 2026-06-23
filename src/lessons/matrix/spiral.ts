import type { LessonBuilder, Step } from "../types";

type Inputs = { matrix: number[][] };

const code = `def spiral(mat):
    R, C = len(mat), len(mat[0])
    out = []
    top, bottom, left, right = 0, R - 1, 0, C - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(mat[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(mat[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                out.append(mat[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                out.append(mat[r][left])
            left += 1
    return out`;

function build({ matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!matrix.length || !matrix[0]?.length) {
    steps.push({ line: 1, matrix, narration: "Empty matrix." });
    return steps;
  }
  const R = matrix.length;
  const C = matrix[0].length;
  let top = 0,
    bottom = R - 1,
    left = 0,
    right = C - 1;
  const out: number[] = [];
  const visited: Array<{ r: number; c: number; tone: "visit" }> = [];

  const push = (line: number, r: number, c: number, narr: string) => {
    out.push(matrix[r][c]);
    visited.push({ r, c, tone: "visit" });
    steps.push({
      line,
      matrix,
      cellHighlights: [...visited.slice(0, -1), { r, c, tone: "match" as const }],
      cellPointers: [{ name: "p", r, c, color: "mint" }],
      secondary: { label: "output", array: [...out] },
      narration: narr,
    });
  };

  steps.push({ line: 4, matrix, narration: `Spiral over ${R}×${C}. Bounds: top, bottom, left, right.` });

  let safety = 0;
  while (top <= bottom && left <= right && safety++ < 400) {
    for (let c = left; c <= right; c++) push(6, top, c, `→ (${top},${c}) = ${matrix[top][c]}`);
    top++;
    for (let r = top; r <= bottom; r++) push(9, r, right, `↓ (${r},${right}) = ${matrix[r][right]}`);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) push(13, bottom, c, `← (${bottom},${c}) = ${matrix[bottom][c]}`);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) push(17, r, left, `↑ (${r},${left}) = ${matrix[r][left]}`);
      left++;
    }
  }
  steps.push({
    line: 19,
    matrix,
    cellHighlights: visited,
    secondary: { label: "output", array: [...out] },
    status: `len=${out.length}`,
    narration: `Spiral complete (${out.length} cells).`,
  });
  return steps;
}

export const spiral: LessonBuilder<Inputs> = {
  slug: "spiral-traversal",
  title: "Matrix Spiral Traversal",
  subtitle: "Four shrinking bounds — top, bottom, left, right — peel the matrix layer by layer.",
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
  zvalidate: ({ matrix }) => (matrix.length === 0 || matrix[0]?.length === 0 ? ["Matrix is empty."] : []),
  build,
};
