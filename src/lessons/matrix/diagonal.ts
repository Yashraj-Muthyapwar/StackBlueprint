import type { CellHighlight, CellNote, LessonBuilder, PracticeProblem, Step } from "../types";
import { labelledOptions, numberOptions } from "../prefix/shared";
import { lineOf } from "../binary-search/shared";
import { positionOptions } from "./shared";

type Inputs = { matrix: number[][] };

const practiceLadder: PracticeProblem[] = [
  {
    name: "Matrix Diagonal Sum",
    difficulty: "easy",
    hint: "Main diagonal is r == c, anti-diagonal is r + c == n − 1. Count the center cell once when n is odd.",
    link: "https://leetcode.com/problems/matrix-diagonal-sum/",
  },
  {
    name: "Toeplitz Matrix",
    difficulty: "easy",
    hint: "Every top-left to bottom-right diagonal is constant, meaning r − c is the same along it. Compare each cell with its up-left neighbour.",
    link: "https://leetcode.com/problems/toeplitz-matrix/",
  },
  {
    name: "Diagonal Traverse",
    difficulty: "medium",
    hint: "This exact pattern. The parity of r + c tells you which way to walk, and the walk bounces when it leaves the grid.",
    link: "https://leetcode.com/problems/diagonal-traverse/",
  },
  {
    name: "Sort the Matrix Diagonally",
    difficulty: "medium",
    hint: "Group cells by r − c, sort each group, write them back. The key r − c is what identifies a diagonal.",
    link: "https://leetcode.com/problems/sort-the-matrix-diagonally/",
  },
  {
    name: "Diagonal Traverse II",
    difficulty: "medium",
    hint: "The rows are jagged, so skip the zigzag and group values by r + c instead. Within a diagonal, go bottom-to-top.",
    link: "https://leetcode.com/problems/diagonal-traverse-ii/",
  },
  {
    name: "Zigzag Conversion",
    difficulty: "medium",
    hint: "Not a matrix, but the same bouncing walk: a pointer that reverses direction whenever it hits the first or last row.",
    link: "https://leetcode.com/problems/zigzag-conversion/",
  },
];

// 1-based line numbers, matching the code pane.
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

const L = {
  result: lineOf(code, "result = []"),
  forD: lineOf(code, "for d in range"),
  parity: lineOf(code, "if d % 2 == 0"),
  upRow: lineOf(code, "row = min(d, rows - 1)"),
  upCol: lineOf(code, "col = d - row"),
  upApp: lineOf(code, "result.append(matrix[row][col])", 0),
  upStep: lineOf(code, "row -= 1; col += 1"),
  downCol: lineOf(code, "col = min(d, cols - 1)"),
  downRow: lineOf(code, "row = d - col"),
  downApp: lineOf(code, "result.append(matrix[row][col])", 1),
  downStep: lineOf(code, "row += 1; col -= 1"),
  ret: lineOf(code, "return result"),
};

function build({ matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!matrix.length || !matrix[0]?.length) {
    steps.push({ line: L.result, matrix, narration: "The matrix is empty." });
    return steps;
  }
  const rows = matrix.length;
  const cols = matrix[0].length;
  const total = rows + cols - 1;
  const result: number[] = [];
  const visited: { r: number; c: number }[] = [];

  const notes = (): CellNote[] =>
    visited.map((v, i) => ({
      r: v.r,
      c: v.c,
      text: String(i + 1),
      color: i === visited.length - 1 ? ("mint" as const) : ("amber" as const),
    }));

  /** Cells of anti-diagonal d (r + c = d), listed in the direction we walk them. */
  const diagonal = (d: number): [number, number][] => {
    const out: [number, number][] = [];
    if (d % 2 === 0) {
      for (let r = Math.min(d, rows - 1), c = d - r; r >= 0 && c < cols; r--, c++) out.push([r, c]);
    } else {
      for (let c = Math.min(d, cols - 1), r = d - c; c >= 0 && r < rows; r++, c--) out.push([r, c]);
    }
    return out;
  };

  const base = (d: number | null, current?: [number, number]): Partial<Step> => {
    const isVisited = new Set(visited.map((v) => `${v.r},${v.c}`));
    const hi: CellHighlight[] = visited
      .filter((v) => !current || v.r !== current[0] || v.c !== current[1])
      .map((v) => ({ r: v.r, c: v.c, tone: "visit" as const }));
    if (d !== null) {
      for (const [r, c] of diagonal(d)) {
        if (!isVisited.has(`${r},${c}`)) hi.push({ r, c, tone: "compare" });
      }
    }
    if (current) hi.push({ r: current[0], c: current[1], tone: "match" });
    return {
      matrix,
      matrixIndices: true,
      cellHighlights: hi,
      cellNotes: notes(),
      secondary: {
        label: "output so far",
        array: [...result],
        highlight: result.length
          ? { kind: "match" as const, indices: [result.length - 1] }
          : undefined,
      },
    };
  };
  const push = (
    d: number | null,
    s: Partial<Step> & { line: number; narration: string },
    current?: [number, number],
  ) => steps.push({ ...base(d, current), ...s } as Step);

  // ------------------------------------------------------------- intro
  push(null, {
    line: L.forD,
    status: `${rows}×${cols} matrix  ·  ${total} anti-diagonals`,
    narration: `Cells on the same anti-diagonal share the same r + c, and r + c runs from 0 to ${rows - 1 + cols - 1}. Walk each diagonal in turn, flipping the direction every time so the path zigzags without jumping.`,
    proof:
      "Every cell has exactly one value of r + c, so it lies on exactly one anti-diagonal. Visiting every diagonal once visits every cell once.",
    predict: {
      question: `The matrix has ${rows} rows and ${cols} columns. How many anti-diagonals are there?`,
      options: numberOptions(total, [rows * cols, Math.max(rows, cols), rows + cols], 1),
      answer: String(total),
      line: L.result,
    },
  });

  let askedEven = false;
  let askedOdd = false;
  let askedDir = false;

  for (let d = 0; d < total; d++) {
    const even = d % 2 === 0;
    const cells = diagonal(d);
    const [sr, sc] = cells[0];
    const [er, ec] = cells[cells.length - 1];
    const arrow = even ? "↗" : "↙";
    const startLines = even
      ? { line: L.upRow, lineEnd: L.upCol }
      : { line: L.downCol, lineEnd: L.downRow };

    // Which cell does diagonal d start on? (quizzed once for each direction)
    let predict: Step["predict"];
    if (d === 1 && !askedDir) {
      askedDir = true;
      const q = labelledOptions(
        [
          "Down-left ↙  (row + 1, col − 1)",
          "Up-right ↗  (row − 1, col + 1)",
          "Straight down ↓  (row + 1)",
        ],
        1,
      );
      predict = {
        question: "Diagonal 0 walked up-right. Which way does diagonal 1 walk?",
        options: q.options,
        answer: q.answer,
        line: L.forD,
      };
    } else if (even && d >= 2 && !askedEven) {
      const q = positionOptions(
        [sr, sc],
        [
          [er, ec],
          [d, 0],
          [0, d],
        ],
        1,
      );
      if (q) {
        askedEven = true;
        predict = {
          question: `Diagonal ${d} is even, so it walks up-right. Where does it start? (rows ${rows}, cols ${cols})`,
          options: q.options,
          answer: q.answer,
          line: L.forD,
        };
      }
    } else if (!even && d >= 3 && !askedOdd) {
      const q = positionOptions(
        [sr, sc],
        [
          [er, ec],
          [0, d],
          [d, 0],
        ],
        2,
      );
      if (q) {
        askedOdd = true;
        predict = {
          question: `Diagonal ${d} is odd, so it walks down-left. Where does it start? (rows ${rows}, cols ${cols})`,
          options: q.options,
          answer: q.answer,
          line: L.forD,
        };
      }
    }

    push(d, {
      ...startLines,
      cellPointers: [{ name: arrow, r: sr, c: sc, color: "violet" }],
      status: `d = ${d} (${even ? "even" : "odd"}): ${even ? "up-right" : "down-left"}, starts at (${sr},${sc})`,
      narration: even
        ? `d = ${d} is even, so walk up-right. Start at the lowest cell of the diagonal: row = min(${d}, ${rows - 1}) = ${sr}, col = ${d} − ${sr} = ${sc}.`
        : `d = ${d} is odd, so walk down-left. Start at the rightmost cell of the diagonal: col = min(${d}, ${cols - 1}) = ${sc}, row = ${d} − ${sc} = ${sr}.`,
      proof:
        d === 1
          ? "Consecutive diagonals meet at a corner of the grid. Alternating the direction means each diagonal starts right next to where the previous one ended, so the path is continuous."
          : sr === 0 || sc === 0 || sr === rows - 1 || sc === cols - 1
            ? `The start is clamped to the grid: min(d, ${even ? rows - 1 : cols - 1}) keeps it from leaving the matrix once d passes the ${even ? "last row" : "last column"}.`
            : undefined,
      predict,
    });

    cells.forEach(([r, c], i) => {
      result.push(matrix[r][c]);
      visited.push({ r, c });
      const last = i === cells.length - 1;
      push(
        d,
        {
          line: even ? L.upApp : L.downApp,
          lineEnd: even ? L.upStep : L.downStep,
          cellPointers: [{ name: arrow, r, c, color: "mint" }],
          status: `d = ${d}: (${r},${c}) = ${matrix[r][c]}`,
          narration:
            `${arrow} (${r},${c}) = ${matrix[r][c]} is number ${result.length} in the order.` +
            (last
              ? even
                ? ` The next step would leave the grid (row ${r - 1} or col ${c + 1}), so the while loop ends and diagonal ${d} is done.`
                : ` The next step would leave the grid (col ${c - 1} or row ${r + 1}), so the while loop ends and diagonal ${d} is done.`
              : ""),
        },
        [r, c],
      );
    });
  }

  push(null, {
    line: L.ret,
    status: `return  (${result.length} cells)`,
    narration: `All ${total} diagonals are done and all ${rows * cols} cells are in the output. The numbers on the cells show the zigzag order.`,
    proof: `Each cell was visited once: O(rows·cols) time. The loops never test cells outside the grid, because every start is clamped and every walk stops at an edge.`,
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
  practiceLadder,
  variant: "diagonal",
  view: "matrix",
  code,
  defaultInputs: {
    matrix: [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
    ],
  },
  inputs: [{ key: "matrix", label: "Matrix", kind: "intMatrix", help: "rows by ; cells by ," }],
  validate: ({ matrix }) =>
    matrix.length === 0 || matrix[0]?.length === 0 ? ["Matrix is empty."] : [],
  build,
};
