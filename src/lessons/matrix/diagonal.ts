import type { LessonBuilder, Step } from "../types";

type Inputs = { matrix: number[][] };

const code = `def diagonal_order(matrix):
    rows, cols = len(matrix), len(matrix[0])
    result = []
    for d in range(rows + cols - 1):
        if d % 2 == 0:  # up-right
            row = min(d, rows - 1)
            col = d - row
            while row >= 0 and col < cols:
                result.append(matrix[row][col])
                row -= 1; col += 1
        else:           # down-left
            col = min(d, cols - 1)
            row = d - col
            while col >= 0 and row < rows:
                result.append(matrix[row][col])
                row += 1; col -= 1
    return result`;

function build({ matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!matrix.length || !matrix[0]?.length) {
    steps.push({ line: 1, matrix, narration: "Empty matrix." });
    return steps;
  }
  const rows = matrix.length,
    cols = matrix[0].length;
  const result: number[] = [];
  const visited: Array<{ r: number; c: number; tone: "visit" }> = [];

  steps.push({
    line: 4,
    matrix,
    narration: `Walk ${rows + cols - 1} anti-diagonals, alternating direction.`,
  });

  const visit = (line: number, r: number, c: number, narr: string) => {
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

  for (let d = 0; d < rows + cols - 1; d++) {
    if (d % 2 === 0) {
      let r = Math.min(d, rows - 1);
      let c = d - r;
      while (r >= 0 && c < cols) {
        visit(8, r, c, `↗ d=${d} (${r},${c}) = ${matrix[r][c]}`);
        r--;
        c++;
      }
    } else {
      let c = Math.min(d, cols - 1);
      let r = d - c;
      while (c >= 0 && r < rows) {
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
    secondary: { label: "output", array: [...result] },
    narration: "All diagonals traversed.",
  });
  return steps;
}

export const diagonal: LessonBuilder<Inputs> = {
  slug: "diagonal-traversal",
  title: "Matrix Diagonal Traversal",
  subtitle: "Walk anti-diagonals; alternate the direction so the zigzag is continuous.",
  problem:
    "Given an m×n matrix, traverse it diagonally in a zigzag pattern: alternate going up-right and down-left along each anti-diagonal.",
  spotIt: [
    "'Traverse the matrix diagonally', zigzag, or anti-diagonal order.",
    "Problems grouping elements by r+c (anti-diagonal) or r-c (main diagonal).",
    "Variants: diagonal sort, zigzag conversion.",
  ],
  avoidWhen: [
    "Order doesn't matter — use row-major and skip the bookkeeping.",
    "You only care about one specific diagonal — index it directly.",
    "The grid is jagged / non-rectangular — diagonals aren't well defined.",
  ],
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
  validate: ({ matrix }) =>
    matrix.length === 0 || matrix[0]?.length === 0 ? ["Matrix is empty."] : [],
  build,
};
