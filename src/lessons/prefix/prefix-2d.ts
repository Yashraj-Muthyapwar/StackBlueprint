import type { LessonBuilder, Step } from "../types";

type Inputs = { matrix: number[][]; query: number[] }; // query: [r1, c1, r2, c2]

const code = `def build_2d_prefix(mat):
    R, C = len(mat), len(mat[0])
    pre = [[0]*(C+1) for _ in range(R+1)]
    for r in range(R):
        for c in range(C):
            pre[r+1][c+1] = (mat[r][c] + pre[r][c+1]
                             + pre[r+1][c] - pre[r][c])
    return pre

def rect_sum(pre, r1, c1, r2, c2):
    return (pre[r2+1][c2+1] - pre[r1][c2+1]
            - pre[r2+1][c1] + pre[r1][c1])`;

function build({ matrix: mat, query }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!mat.length || !mat[0]?.length) {
    steps.push({ line: 1, narration: "Empty matrix.", matrix: mat });
    return steps;
  }
  const R = mat.length,
    C = mat[0].length;
  const pre: number[][] = Array.from({ length: R + 1 }, () => new Array(C + 1).fill(0));

  steps.push({ line: 3, matrix: mat, narration: `Compute (R+1)×(C+1) prefix matrix from a ${R}×${C} input.` });

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      pre[r + 1][c + 1] = mat[r][c] + pre[r][c + 1] + pre[r + 1][c] - pre[r][c];
      steps.push({
        line: 5,
        matrix: mat,
        cellHighlights: [{ r, c, tone: "compare" }],
        cellPointers: [{ name: "rc", r, c, color: "mint" }],
        status: `pre[${r + 1}][${c + 1}] = ${pre[r + 1][c + 1]}`,
        narration: `Fill pre[${r + 1}][${c + 1}] using inclusion-exclusion.`,
      });
    }
  }

  steps.push({ line: 6, matrix: pre.map((row) => [...row]), narration: "Prefix matrix built. Now answer the query in O(1)." });

  const [r1, c1, r2, c2] = query;
  if (r1 < 0 || c1 < 0 || r2 >= R || c2 >= C || r1 > r2 || c1 > c2) {
    steps.push({ line: 9, matrix: mat, narration: `Query (${r1},${c1})–(${r2},${c2}) is out of bounds.` });
    return steps;
  }
  const ans = pre[r2 + 1][c2 + 1] - pre[r1][c2 + 1] - pre[r2 + 1][c1] + pre[r1][c1];
  steps.push({
    line: 9,
    matrix: mat,
    matrixRect: { r1, c1, r2, c2, tone: "mint" },
    status: `sum = ${ans}`,
    narration: `Rect sum (${r1},${c1})–(${r2},${c2}) = ${ans}.`,
  });
  return steps;
}

export const prefix2D: LessonBuilder<Inputs> = {
  slug: "prefix-2d",
  title: "Prefix Sum — 2D",
  subtitle: "Inclusion–exclusion over a 2D prefix matrix answers rectangle sums in O(1).",
  problem: "Given a matrix, preprocess it so that the sum of any sub-rectangle (r1, c1, r2, c2) can be answered in O(1) per query.",
  spotIt: [
    "Many sub-rectangle sum queries on a static matrix.",
    "Problems like 'count sub-matrices with sum K' or 'max sum sub-rectangle'.",
    "Editorial mentions inclusion\u2013exclusion or O(1) per rectangle.",
  ],
  avoidWhen: [
    "Matrix changes between queries \u2014 use a 2D Fenwick tree.",
    "Only one or two queries \u2014 direct iteration is simpler.",
    "You need non-additive stats (max / min) over rectangles \u2014 different DS needed.",
  ],
  variant: "prefix-2d",
  view: "matrix",
  code,
  defaultInputs: {
    matrix: [
      [3, 0, 1, 4],
      [5, 6, 3, 2],
      [1, 2, 0, 1],
      [4, 1, 0, 1],
    ],
    query: [1, 1, 2, 3],
  },
  inputs: [
    { key: "matrix", label: "Matrix", kind: "intMatrix", help: "rows by ; cells by ," },
    { key: "query", label: "Rect query r1,c1,r2,c2", kind: "intArray" },
  ],
  validate: ({ matrix, query }) => {
    const w: string[] = [];
    if (matrix.length === 0 || matrix[0]?.length === 0) w.push("Matrix must be non-empty.");
    if (query.length !== 4) w.push("Query must be exactly 4 ints: r1, c1, r2, c2.");
    return w;
  },
  build,
};
