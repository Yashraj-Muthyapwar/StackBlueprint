import type {
  CellHighlight,
  CellPointer,
  LessonBuilder,
  MatrixRect,
  PracticeProblem,
  Prediction,
  Step,
} from "../types";
import { labelledOptions, numberOptions } from "./shared";

type Inputs = { matrix: number[][]; query: number[] }; // query: [r1, c1, r2, c2]

/** Predict mode asks at most this many "what goes in this cell?" questions while building. */
const MAX_BUILD_PREDICTIONS = 3;

const practiceLadder: PracticeProblem[] = [
  {
    name: "Range Sum Query - Immutable",
    difficulty: "easy",
    hint: "The 1D version. If the n + 1 trick and the subtraction feel automatic, the 2D version is the same idea with one extra term.",
    link: "https://leetcode.com/problems/range-sum-query-immutable/",
  },
  {
    name: "Image Smoother",
    difficulty: "easy",
    hint: "Every output cell is the average of a 3×3 block, clamped at the edges. Brute force works here, but a 2D prefix makes each block O(1).",
    link: "https://leetcode.com/problems/image-smoother/",
  },
  {
    name: "Range Sum Query 2D - Immutable",
    difficulty: "medium",
    hint: "This exact pattern. Build the (R + 1) × (C + 1) prefix once, then every rectangle is four lookups.",
    link: "https://leetcode.com/problems/range-sum-query-2d-immutable/",
  },
  {
    name: "Matrix Block Sum",
    difficulty: "medium",
    hint: "Each answer cell is a rectangle sum around (i, j) with radius k. Clamp the corners to the matrix, then it is the same four lookups.",
    link: "https://leetcode.com/problems/matrix-block-sum/",
  },
  {
    name: "Maximum Side Length of a Square with Sum Less than or Equal to Threshold",
    difficulty: "medium",
    hint: "Square sums are rectangle sums. The sum only grows with the side, so binary search the side length, or grow it greedily per corner.",
    link: "https://leetcode.com/problems/maximum-side-length-of-a-square-with-sum-less-than-or-equal-to-threshold/",
  },
  {
    name: "Find Kth Largest XOR Coordinate Value",
    difficulty: "medium",
    hint: "Same grid, but the aggregation is XOR. The inclusion–exclusion still works because XOR undoes itself: no subtraction needed, just ^ everywhere.",
    link: "https://leetcode.com/problems/find-kth-largest-xor-coordinate-value/",
  },
  {
    name: "Number of Submatrices That Sum to Target",
    difficulty: "hard",
    hint: "Fix a top row and a bottom row, then collapse the columns between them into a 1D array. Now it is 'Subarray Sum Equals K' with a hash map.",
    link: "https://leetcode.com/problems/number-of-submatrices-that-sum-to-target/",
  },
  {
    name: "Max Sum of Rectangle No Larger Than K",
    difficulty: "hard",
    hint: "Same row-pair collapse, but the 1D question is 'largest subarray sum ≤ K'. Keep a sorted set of earlier prefix sums and look up the smallest one ≥ prefix − K.",
    link: "https://leetcode.com/problems/max-sum-of-rectangle-no-larger-than-k/",
  },
];

// 1-based line numbers, matching the code pane.
const code = `def build_2d_prefix(mat):
    R, C = len(mat), len(mat[0])
    prefix = [[0] * (C + 1) for _ in range(R + 1)]
    for r in range(R):
        for c in range(C):
            prefix[r + 1][c + 1] = (mat[r][c] + prefix[r][c + 1]
                                    + prefix[r + 1][c] - prefix[r][c])
    return prefix

def rect_sum(prefix, r1, c1, r2, c2):  # inclusive corners
    return (prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1]
            - prefix[r2 + 1][c1] + prefix[r1][c1])`;

/** Wrap negatives so equations like `5 + (−3) − 2` stay readable. */
const p = (x: number) => (x < 0 ? `(${x})` : `${x}`);

/** The block of cells whose sum a prefix cell holds: rows 0..r, columns 0..c. */
const block = (r2: number, c2: number, tone: MatrixRect["tone"], outline = false): MatrixRect => ({
  r1: 0,
  c1: 0,
  r2,
  c2,
  tone,
  outline,
});

function build({ matrix: mat, query }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!mat.length || !mat[0]?.length) {
    steps.push({
      line: 2,
      narration: "The matrix is empty, so there is nothing to sum.",
      matrix: mat,
    });
    return steps;
  }
  const R = mat.length;
  const C = mat[0].length;
  const LABEL = "prefix (top-left i×j sums)";

  // null = not computed yet. Row 0 and column 0 are the zero border.
  const P: (number | null)[][] = Array.from({ length: R + 1 }, (_, i) =>
    Array.from({ length: C + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)),
  );
  const snap = () => P.map((row) => [...row]);
  const base = (): Pick<Step, "matrix" | "matrix2" | "matrix2Label" | "matrix2Border"> => ({
    matrix: mat,
    matrix2: snap(),
    matrix2Label: LABEL,
    matrix2Border: true,
  });

  // ---------------------------------------------------------------- allocate
  steps.push({
    line: 3,
    ...base(),
    status: `prefix is ${R + 1} × ${C + 1}: one extra row and column of zeros`,
    narration: `Make an (R + 1) × (C + 1) = ${R + 1} × ${C + 1} grid. Row 0 and column 0 are a border of zeros: the sum of an empty block. prefix[i][j] will hold the sum of the top-left block of i rows and j columns.`,
    proof:
      "The border is the 2D version of the leading 0 in 1D prefix sums. A rectangle that touches the top or left edge will subtract border cells that hold 0, so it needs no special case.",
  });

  // ---------------------------------------------------------------- build
  // Quiz only cells that use all three neighbours (no border), spread across the grid.
  const interior: [number, number][] = [];
  for (let r = 1; r < R; r++) for (let c = 1; c < C; c++) interior.push([r, c]);
  const askAt = new Set<string>();
  if (interior.length > 0) {
    const picks = [0, Math.floor(interior.length / 2), interior.length - 1];
    for (const i of picks.slice(0, MAX_BUILD_PREDICTIONS)) askAt.add(interior[i].join(","));
  }
  const proofCell = interior.length > 0 ? interior[0].join(",") : null;
  let asked = 0;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const v = mat[r][c];
      const A = P[r][c + 1] as number; // block above, through this column
      const L = P[r + 1][c] as number; // block to the left, through this row
      const D = P[r][c] as number; // block above-left, counted by both A and L
      const nw = v + A + L - D;
      const key = `${r},${c}`;

      const inputPtrs: CellPointer[] = [{ name: "+", r, c, color: "amber" }];
      const inputHi: CellHighlight[] = [{ r, c, tone: "match" }];
      const neighbourHi: CellHighlight[] = [
        { r, c: c + 1, tone: "compare" },
        { r: r + 1, c, tone: "compare" },
        { r, c, tone: "swap" },
      ];
      const neighbourPtrs: CellPointer[] = [
        { name: "+", r, c: c + 1, color: "violet" },
        { name: "+", r: r + 1, c, color: "violet" },
        { name: "−", r, c, color: "rose" },
      ];

      if (askAt.has(key)) {
        asked += 1;
        const predict: Prediction = {
          question: `mat[${r}][${c}] = ${v}. The prefix cell above holds ${A}, the one to the left holds ${L}, and the one diagonally above-left holds ${D}. What goes into prefix[${r + 1}][${c + 1}]?`,
          // Slips: forgot the diagonal, counted the diagonal, forgot the cell itself.
          options: numberOptions(nw, [v + A + L, v + A + L + D, A + L - D], asked),
          answer: String(nw),
          line: 4,
        };
        steps.push({
          line: 6,
          lineEnd: 7,
          ...base(),
          matrixRects: [block(r, c, "mint", true)],
          cellHighlights: inputHi,
          cellPointers: inputPtrs,
          cellHighlights2: [...neighbourHi, { r: r + 1, c: c + 1, tone: "match" }],
          cellPointers2: [...neighbourPtrs, { name: "=", r: r + 1, c: c + 1, color: "mint" }],
          status: `above ${A},  left ${L},  diagonal ${D},  cell ${v}`,
          narration: `The new cell must hold the sum of the whole block from (0,0) to (${r},${c}): ${v} + ${A} + ${L} − ${D} = ${nw}.`,
          proof:
            "The block above and the block to the left both contain the block diagonally above-left of this cell. Adding them counts that region twice, so subtract it once.",
          predict,
        });
      }

      P[r + 1][c + 1] = nw;
      const pieces: MatrixRect[] = [];
      if (r > 0) pieces.push(block(r - 1, c, "violet"));
      if (c > 0) pieces.push({ r1: 0, c1: 0, r2: r, c2: c - 1, tone: "violet" });
      steps.push({
        line: 6,
        lineEnd: 7,
        ...base(),
        // Two violet pieces overlap in the diagonal block, which shows up darker: that is the double count.
        matrixRects: [...pieces, block(r, c, "mint", true)],
        cellHighlights: inputHi,
        cellPointers: inputPtrs,
        cellHighlights2: [...neighbourHi, { r: r + 1, c: c + 1, tone: "match" }],
        cellPointers2: [...neighbourPtrs, { name: "=", r: r + 1, c: c + 1, color: "mint" }],
        status: `prefix[${r + 1}][${c + 1}] = ${p(v)} + ${p(A)} + ${p(L)} − ${p(D)} = ${nw}`,
        narration: askAt.has(key)
          ? `prefix[${r + 1}][${c + 1}] = ${nw}. The two violet blocks share their top-left cells, and that shared (darker) part is what both neighbours counted.`
          : `prefix[${r + 1}][${c + 1}] = ${p(v)} + ${p(A)} + ${p(L)} − ${p(D)} = ${nw}. It holds the sum of the block from (0,0) to (${r},${c}).`,
        proof:
          r === 0 && c === 0
            ? "Even the top-left cell follows the same rule: the three neighbours are all border zeros, so it is just mat[0][0]."
            : key === proofCell && !askAt.has(key)
              ? "The block above and the block to the left both contain the block diagonally above-left. Adding them counts that region twice, so subtract it once."
              : r === R - 1 && c === C - 1
                ? `prefix[${R}][${C}] is the sum of the entire matrix.`
                : undefined,
      });
    }
  }

  steps.push({
    line: 8,
    ...base(),
    matrixRects: [block(R - 1, C - 1, "mint", true)],
    status: "return prefix",
    narration: `The prefix grid is full: ${R * C} cells, each filled with three lookups and one addition. The original matrix is never needed again.`,
    proof: "Building costs O(R·C) once. Every rectangle query after that is O(1).",
  });

  // ---------------------------------------------------------------- query
  const [r1, c1, r2, c2] = query;
  if (query.length !== 4 || r1 < 0 || c1 < 0 || r2 >= R || c2 >= C || r1 > r2 || c1 > c2) {
    steps.push({
      line: 10,
      ...base(),
      status: "invalid query",
      narration:
        query.length !== 4
          ? "A rectangle query needs four numbers: r1, c1, r2, c2. Edit the query above and run again."
          : `The query (${r1},${c1}) to (${r2},${c2}) is out of bounds for a ${R} × ${C} matrix.`,
    });
    return steps;
  }

  const T1 = P[r2 + 1][c2 + 1] as number;
  const T2 = P[r1][c2 + 1] as number;
  const T3 = P[r2 + 1][c1] as number;
  const T4 = P[r1][c1] as number;
  const ans = T1 - T2 - T3 + T4;
  const cellsInRect = (r2 - r1 + 1) * (c2 - c1 + 1);
  const target: MatrixRect = { r1, c1, r2, c2, tone: "violet", outline: true };
  const hasTop = r1 > 0;
  const hasLeft = c1 > 0;

  steps.push({
    line: 10,
    ...base(),
    matrixRects: [{ r1, c1, r2, c2, tone: "violet" }],
    status: `rectangle (${r1},${c1}) to (${r2},${c2})`,
    narration: `Query: the sum of the rectangle from (${r1},${c1}) to (${r2},${c2}), inclusive. Adding its ${cellsInRect} cells one by one would work, but four prefix lookups do the same thing no matter how big the rectangle is.`,
  });

  // 1) the big block
  steps.push({
    line: 11,
    ...base(),
    matrixRects: [block(r2, c2, "mint"), target],
    cellHighlights2: [{ r: r2 + 1, c: c2 + 1, tone: "match" }],
    cellPointers2: [{ name: "+", r: r2 + 1, c: c2 + 1, color: "mint" }],
    status: `+ prefix[${r2 + 1}][${c2 + 1}] = ${T1}`,
    narration: `Start with the big block: prefix[${r2 + 1}][${c2 + 1}] = ${T1} covers everything from (0,0) to (${r2},${c2}). That is more than we want, so the extra has to come off.`,
  });

  // 2) the strip above
  steps.push({
    line: 11,
    ...base(),
    matrixRects: [...(hasTop ? [block(r1 - 1, c2, "rose")] : []), target],
    cellHighlights2: [
      { r: r2 + 1, c: c2 + 1, tone: "match" },
      { r: r1, c: c2 + 1, tone: "swap" },
    ],
    cellPointers2: [
      { name: "+", r: r2 + 1, c: c2 + 1, color: "mint" },
      { name: "−", r: r1, c: c2 + 1, color: "rose" },
    ],
    status: `${T1} − ${p(T2)} = ${T1 - T2}`,
    narration: hasTop
      ? `Cut off the strip above the rectangle: subtract prefix[${r1}][${c2 + 1}] = ${T2}, the block from (0,0) to (${r1 - 1},${c2}). Running total: ${T1 - T2}.`
      : `The rectangle starts at row 0, so there is no strip above it. prefix[0][${c2 + 1}] is a border cell holding 0, so the subtraction changes nothing.`,
    proof: hasTop
      ? undefined
      : "This is the zero border doing its job: no special case for rectangles on the top edge.",
  });

  // 3) the strip to the left
  steps.push({
    line: 12,
    ...base(),
    matrixRects: [
      ...(hasLeft ? [{ r1: 0, c1: 0, r2, c2: c1 - 1, tone: "rose" as const }] : []),
      target,
    ],
    cellHighlights2: [
      { r: r2 + 1, c: c2 + 1, tone: "match" },
      { r: r1, c: c2 + 1, tone: "swap" },
      { r: r2 + 1, c: c1, tone: "swap" },
    ],
    cellPointers2: [
      { name: "+", r: r2 + 1, c: c2 + 1, color: "mint" },
      { name: "−", r: r1, c: c2 + 1, color: "rose" },
      { name: "−", r: r2 + 1, c: c1, color: "rose" },
    ],
    status: `${T1 - T2} − ${p(T3)} = ${T1 - T2 - T3}`,
    narration: hasLeft
      ? `Cut off the strip to the left: subtract prefix[${r2 + 1}][${c1}] = ${T3}, the block from (0,0) to (${r2},${c1 - 1}). Running total: ${T1 - T2 - T3}.`
      : `The rectangle starts at column 0, so there is no strip on its left. prefix[${r2 + 1}][0] is a border cell holding 0, so the subtraction changes nothing.`,
    proof: hasLeft ? undefined : "Same border trick, this time on the left edge.",
  });

  // 4) add the corner back
  const running = T1 - T2 - T3;
  const cornerExists = hasTop && hasLeft;
  const cornerRect: MatrixRect[] = cornerExists ? [block(r1 - 1, c1 - 1, "amber")] : [];
  const cornerHi: CellHighlight[] = [
    { r: r2 + 1, c: c2 + 1, tone: "match" },
    { r: r1, c: c2 + 1, tone: "swap" },
    { r: r2 + 1, c: c1, tone: "swap" },
  ];
  const cornerPtrs: CellPointer[] = [
    { name: "+", r: r2 + 1, c: c2 + 1, color: "mint" },
    { name: "−", r: r1, c: c2 + 1, color: "rose" },
    { name: "−", r: r2 + 1, c: c1, color: "rose" },
  ];

  if (cornerExists) {
    const { options, answer } = labelledOptions(
      [
        `Add prefix[${r1}][${c1}] back`,
        `Subtract prefix[${r1}][${c1}] too`,
        "Leave it, the total is already right",
      ],
      1,
    );
    steps.push({
      line: 12,
      ...base(),
      matrixRects: [...cornerRect, target],
      cellHighlights2: [...cornerHi, { r: r1, c: c1, tone: "visit" }],
      cellPointers2: [...cornerPtrs, { name: "?", r: r1, c: c1, color: "amber" }],
      status: `running total = ${running}`,
      narration: `The amber block in the top-left corner sits inside both strips, so it was subtracted twice. prefix[${r1}][${c1}] = ${T4} is exactly that block: add it back once.`,
      proof:
        "Inclusion–exclusion: when two removed pieces overlap, the overlap has been removed twice and must be put back once.",
      predict: {
        question: `We have removed the strip above and the strip to the left. They overlap in the top-left corner block, which is prefix[${r1}][${c1}] = ${T4}. What should we do with it?`,
        options,
        answer,
        line: 11,
      },
    });
  }

  steps.push({
    line: 12,
    ...base(),
    matrixRects: [...cornerRect, { r1, c1, r2, c2, tone: "violet" }],
    cellHighlights2: [...cornerHi, { r: r1, c: c1, tone: "match" }],
    cellPointers2: [...cornerPtrs, { name: "+", r: r1, c: c1, color: "mint" }],
    status: `${T1} − ${p(T2)} − ${p(T3)} + ${p(T4)} = ${ans}`,
    narration: cornerExists
      ? `${running} + ${p(T4)} = ${ans}. The rectangle sums to ${ans}, found with four lookups instead of ${cellsInRect} additions.`
      : `The rectangle touches an edge, so there is no overlap to put back: prefix[${r1}][${c1}] = ${T4} adds nothing. The rectangle sums to ${ans}, found with four lookups instead of ${cellsInRect} additions.`,
    proof:
      "Big block, minus the strip above, minus the strip to the left, plus the corner that was removed twice. Four lookups no matter how large the rectangle is.",
  });

  steps.push({
    line: 12,
    ...base(),
    matrixRects: [{ r1, c1, r2, c2, tone: "mint" }],
    status: `sum = ${ans}`,
    narration: `Done. ${R * C} additions built the grid once, then the rectangle (${r1},${c1}) to (${r2},${c2}) was answered in O(1): ${ans}.`,
    proof:
      "Adding each rectangle directly costs up to R·C per query. With a 2D prefix it is O(R·C) to build, then O(1) per query.",
  });
  return steps;
}

export const prefix2D: LessonBuilder<Inputs> = {
  slug: "prefix-2d",
  title: "Prefix Sum — 2D",
  subtitle: "Inclusion–exclusion over a 2D prefix matrix answers rectangle sums in O(1).",
  problem:
    "Given a matrix, preprocess it so that the sum of any sub-rectangle (r1, c1, r2, c2) can be answered in O(1) per query.",
  spotIt: [
    "Many sub-rectangle sum queries on a static matrix.",
    "Problems like 'count sub-matrices with sum K' or 'max sum sub-rectangle'.",
    "Editorial mentions inclusion–exclusion or O(1) per rectangle.",
  ],
  avoidWhen: [
    "Matrix changes between queries — use a 2D Fenwick tree.",
    "Only one or two queries — direct iteration is simpler.",
    "You need non-additive stats (max / min) over rectangles — different DS needed.",
  ],
  practiceLadder,
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
    { key: "query", label: "Rect query r1,c1,r2,c2", kind: "intArray", help: "inclusive corners" },
  ],
  validate: ({ matrix, query }) => {
    const w: string[] = [];
    if (matrix.length === 0 || matrix[0]?.length === 0) {
      w.push("Matrix must be non-empty.");
      return w;
    }
    if (query.length !== 4) {
      w.push("Query must be exactly 4 ints: r1, c1, r2, c2.");
      return w;
    }
    const [r1, c1, r2, c2] = query;
    if (r1 < 0 || c1 < 0 || r2 >= matrix.length || c2 >= matrix[0].length || r1 > r2 || c1 > c2) {
      w.push(
        `Query (${r1},${c1})–(${r2},${c2}) is out of bounds for a ${matrix.length}×${matrix[0].length} matrix.`,
      );
    }
    return w;
  },
  build,
};
