import type { LessonBuilder, Step } from "../types";

type Inputs = { matrix: number[][] };

const code = `def diagonal_order(mat):
    R, C = len(mat), len(mat[0])
    out = []
    for d in range(R + C - 1):
        if d % 2 == 0:  # up-right
            r = min(d, R - 1)
            c = d - r
            while r >= 0 and c < C:
                out.append(mat[r][c])
                r -= 1; c += 1
        else:           # down-left
            c = min(d, C - 1)
            r = d - c
            while c >= 0 and r < R:
                out.append(mat[r][c])
                r += 1; c -= 1
    return out`;

function build({ matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!matrix.length || !matrix[0]?.length) {
    steps.push({ line: 1, matrix, narration: "Empty matrix." });
    return steps;
  }
  const R = matrix.length,
    C = matrix[0].length;
  const out: number[] = [];
  const visited: Array<{ r: number; c: number; tone: "visit" }> = [];

  steps.push({ line: 4, matrix, narration: `Walk ${R + C - 1} anti-diagonals, alternating direction.` });

  const visit = (line: number, r: number, c: number, narr: string) => {
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

  for (let d = 0; d < R + C - 1; d++) {
    if (d % 2 === 0) {
      let r = Math.min(d, R - 1);
      let c = d - r;
      while (r >= 0 && c < C) {
        visit(8, r, c, `↗ d=${d} (${r},${c}) = ${matrix[r][c]}`);
        r--;
        c++;
      }
    } else {
      let c = Math.min(d, C - 1);
      let r = d - c;
      while (c >= 0 && r < R) {
        visit(13, r, c, `↙ d=${d} (${r},${c}) = ${matrix[r][c]}`);
        r++;
        c--;
      }
    }
  }
  steps.push({
    line: 16,
    matrix,
    cellHighlights: visited,
    secondary: { label: "output", array: [...out] },
    narration: "All diagonals traversed.",
  });
  return steps;
}

export const diagonal: LessonBuilder<Inputs> = {
  slug: "diagonal-traversal",
  title: "Matrix Diagonal Traversal",
  subtitle: "Walk anti-diagonals; alternate the direction so the zigzag is continuous.",
  variant: "diagonal",
  view: "matrix",
  code,
  defaultInputs: {
    matrix: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
  },
  inputs: [{ key: "matrix", label: "Matrix", kind: "intMatrix" }],
  validate: ({ matrix }) => (matrix.length === 0 || matrix[0]?.length === 0 ? ["Matrix is empty."] : []),
  build,
};
