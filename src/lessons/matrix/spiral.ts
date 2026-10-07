import type {
  CellHighlight,
  CellNote,
  LessonBuilder,
  MatrixRect,
  PracticeProblem,
  Step,
} from "../types";
import { labelledOptions } from "../prefix/shared";
import { lineOf } from "../binary-search/shared";
import { positionOptions } from "./shared";

type Inputs = { matrix: number[][] };

const practiceLadder: PracticeProblem[] = [
  {
    name: "Spiral Matrix",
    difficulty: "medium",
    hint: "This exact pattern. Handle one row and one column first: the two guards `top <= bottom` and `left <= right` exist for them.",
    link: "https://leetcode.com/problems/spiral-matrix/",
  },
  {
    name: "Spiral Matrix II",
    difficulty: "medium",
    hint: "Same four bounds, but you write 1, 2, 3, ... into an n × n grid instead of reading from it.",
    link: "https://leetcode.com/problems/spiral-matrix-ii/",
  },
  {
    name: "Rotate Image",
    difficulty: "medium",
    hint: "Another layer-by-layer problem: rotate the outer ring by cycling four cells at a time, then move inward.",
    link: "https://leetcode.com/problems/rotate-image/",
  },
  {
    name: "Spiral Matrix IV",
    difficulty: "medium",
    hint: "Fill a spiral from a linked list and stop when the list runs out. Initialise the grid to -1 so unfilled cells stay marked.",
    link: "https://leetcode.com/problems/spiral-matrix-iv/",
  },
  {
    name: "Spiral Matrix III",
    difficulty: "medium",
    hint: "The walk starts in the middle and spirals outward, and it may leave the grid. Count steps per side (1, 1, 2, 2, 3, 3, ...) and only record cells that are inside.",
    link: "https://leetcode.com/problems/spiral-matrix-iii/",
  },
  {
    name: "Matrix Diagonal Sum",
    difficulty: "easy",
    hint: "A different traversal, but the same habit: write down the index rule (r == c, r + c == n − 1) before coding, and count the center once.",
    link: "https://leetcode.com/problems/matrix-diagonal-sum/",
  },
];

// 1-based line numbers, matching the code pane.
const code = `def spiral(matrix):
    rows, cols = len(matrix), len(matrix[0])
    result = []
    top, bottom, left, right = 0, rows - 1, 0, cols - 1
    while top <= bottom and left <= right:
        for col in range(left, right + 1):
            result.append(matrix[top][col])
        top += 1
        for row in range(top, bottom + 1):
            result.append(matrix[row][right])
        right -= 1
        if top <= bottom:
            for col in range(right, left - 1, -1):
                result.append(matrix[bottom][col])
            bottom -= 1
        if left <= right:
            for row in range(bottom, top - 1, -1):
                result.append(matrix[row][left])
            left += 1
    return result`;

const L = {
  init: lineOf(code, "top, bottom, left, right"),
  while: lineOf(code, "while top <= bottom"),
  topLoop: lineOf(code, "for col in range(left, right + 1)"),
  topApp: lineOf(code, "matrix[top][col]"),
  topMove: lineOf(code, "top += 1"),
  rightLoop: lineOf(code, "for row in range(top, bottom + 1)"),
  rightApp: lineOf(code, "matrix[row][right]"),
  rightMove: lineOf(code, "right -= 1"),
  botGuard: lineOf(code, "if top <= bottom"),
  botLoop: lineOf(code, "for col in range(right, left - 1, -1)"),
  botApp: lineOf(code, "matrix[bottom][col]"),
  botMove: lineOf(code, "bottom -= 1"),
  leftGuard: lineOf(code, "if left <= right"),
  leftLoop: lineOf(code, "for row in range(bottom, top - 1, -1)"),
  leftApp: lineOf(code, "matrix[row][left]"),
  leftMove: lineOf(code, "left += 1"),
  ret: lineOf(code, "return result"),
};

function build({ matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  if (!matrix.length || !matrix[0]?.length) {
    steps.push({ line: L.init, matrix, narration: "The matrix is empty." });
    return steps;
  }
  const rows = matrix.length;
  const cols = matrix[0].length;
  let top = 0;
  let bottom = rows - 1;
  let left = 0;
  let right = cols - 1;
  const result: number[] = [];
  const visited: { r: number; c: number }[] = [];

  const rect = (): MatrixRect[] =>
    top <= bottom && left <= right
      ? [{ r1: top, c1: left, r2: bottom, c2: right, tone: "violet", outline: true }]
      : [];
  const notes = (): CellNote[] =>
    visited.map((v, i) => ({
      r: v.r,
      c: v.c,
      text: String(i + 1),
      color: i === visited.length - 1 ? ("mint" as const) : ("amber" as const),
    }));
  const base = (current?: { r: number; c: number }): Partial<Step> => ({
    matrix,
    matrixIndices: true,
    matrixRects: rect(),
    cellHighlights: [
      ...visited
        .filter((v) => !current || v.r !== current.r || v.c !== current.c)
        .map((v) => ({ r: v.r, c: v.c, tone: "visit" as const })),
      ...(current ? [{ r: current.r, c: current.c, tone: "match" as const }] : []),
    ] as CellHighlight[],
    cellNotes: notes(),
    secondary: {
      label: "output so far",
      array: [...result],
      highlight: result.length
        ? { kind: "match" as const, indices: [result.length - 1] }
        : undefined,
    },
  });
  const push = (s: Partial<Step> & { line: number; narration: string }) =>
    steps.push({ ...base(), ...s } as Step);

  let askedBound = false;
  let askedTurn = false;
  let askedGuard = false;
  let layer = 0;

  const visit = (
    arrow: string,
    word: string,
    line: number,
    lineEnd: number,
    r: number,
    c: number,
  ) => {
    result.push(matrix[r][c]);
    visited.push({ r, c });
    push({
      line,
      lineEnd,
      ...base({ r, c }),
      cellPointers: [{ name: arrow, r, c, color: "mint" }],
      status: `${arrow} (${r},${c}) = ${matrix[r][c]}`,
      narration: `Move ${word}: (${r},${c}) = ${matrix[r][c]} is number ${result.length} in the spiral.`,
    });
  };

  push({
    line: L.init,
    status: `bounds: top ${top}, bottom ${bottom}, left ${left}, right ${right}`,
    narration: `Spiral over the ${rows}×${cols} matrix. Four bounds (top, bottom, left, right) outline the rectangle still to be read. Walk its outer ring, shrink the rectangle, and repeat.`,
    proof:
      "Every cell sits in exactly one ring, and every ring is read once. The bounds guarantee no cell is read twice.",
  });

  let guard = 0;
  while (top <= bottom && left <= right && guard++ < 400) {
    if (layer > 0) {
      push({
        line: L.while,
        status: `layer ${layer + 1}: rows ${top}..${bottom}, cols ${left}..${right}`,
        narration: `A ring is done. The active rectangle is now rows ${top} to ${bottom} and columns ${left} to ${right}: ${(bottom - top + 1) * (right - left + 1)} cell${(bottom - top + 1) * (right - left + 1) === 1 ? "" : "s"} left.`,
      });
    }
    layer += 1;

    // top row, left to right
    for (let c = left; c <= right; c++)
      visit("→", "right along the top row", L.topLoop, L.topApp, top, c);

    if (!askedBound) {
      askedBound = true;
      const { options, answer } = labelledOptions(
        ["top += 1", "bottom -= 1", "left += 1", "right -= 1"],
        2,
      );
      push({
        line: L.topMove,
        status: "top row finished",
        narration: `The top row is finished, so it leaves the rectangle: top becomes ${top + 1}.`,
        proof:
          "Each side removes itself from the rectangle the moment it has been read. Reading the top row uses up the top bound, so top moves down.",
        predict: {
          question: "The whole top row has just been read. Which bound moves, and which way?",
          options,
          answer,
          line: L.topLoop,
        },
      });
    }
    top++;
    push({
      line: L.topMove,
      status: `top = ${top}`,
      narration: `top += 1, so top = ${top}. The top row is no longer part of the rectangle.`,
    });

    // right column, top to bottom
    for (let r = top; r <= bottom; r++)
      visit("↓", "down the right column", L.rightLoop, L.rightApp, r, right);

    const nextBottom = positionOptions(
      [bottom, right - 1],
      [
        [bottom, right],
        [bottom - 1, right - 1],
        [top, right - 1],
      ],
      1,
    );
    if (!askedTurn && nextBottom && top <= bottom && right - 1 >= left) {
      askedTurn = true;
      push({
        line: L.rightMove,
        status: "right column finished",
        narration: `The right column is finished, so right becomes ${right - 1}. The walk turns left along the bottom row, starting at (${bottom},${right - 1}).`,
        proof:
          "After right -= 1 the bottom row starts one column to the left of the corner we just read. The corner itself already belongs to the right column.",
        predict: {
          question: `The right column is done and the walk reaches the bottom-right corner (${bottom},${right}). After right -= 1, which cell does the bottom row start with?`,
          options: nextBottom.options,
          answer: nextBottom.answer,
          line: L.rightLoop,
        },
      });
    }
    right--;
    push({
      line: L.rightMove,
      status: `right = ${right}`,
      narration: `right -= 1, so right = ${right}.`,
    });

    // bottom row, right to left
    if (top <= bottom) {
      for (let c = right; c >= left; c--)
        visit("←", "left along the bottom row", L.botLoop, L.botApp, bottom, c);
      bottom--;
      push({
        line: L.botMove,
        status: `bottom = ${bottom}`,
        narration: `bottom -= 1, so bottom = ${bottom}.`,
      });
    } else {
      push({
        line: L.botGuard,
        status: `top ${top} > bottom ${bottom}: skip`,
        narration: `top (${top}) is greater than bottom (${bottom}), so no rows are left. Skip the bottom row.`,
        proof:
          "Without this check a single-row matrix would read its row twice: once left to right and again right to left. The guard stops that.",
        predict: !askedGuard
          ? (() => {
              askedGuard = true;
              const q = labelledOptions(
                [
                  "No: top > bottom, so there are no rows left",
                  `Yes: read row ${bottom} from right to left`,
                  "Yes, but only the first cell",
                ],
                1,
              );
              return {
                question: `top = ${top} and bottom = ${bottom}. Should the bottom row be traversed?`,
                options: q.options,
                answer: q.answer,
                line: L.botGuard - 1,
              };
            })()
          : undefined,
      });
    }

    // left column, bottom to top
    if (left <= right) {
      for (let r = bottom; r >= top; r--)
        visit("↑", "up the left column", L.leftLoop, L.leftApp, r, left);
      left++;
      push({
        line: L.leftMove,
        status: `left = ${left}`,
        narration: `left += 1, so left = ${left}.`,
      });
    } else {
      push({
        line: L.leftGuard,
        status: `left ${left} > right ${right}: skip`,
        narration: `left (${left}) is greater than right (${right}), so no columns are left. Skip the left column.`,
        proof:
          "The same reason as the bottom guard, for a single column: without it the column would be read twice, once going down and once going up.",
        predict: !askedGuard
          ? (() => {
              askedGuard = true;
              const q = labelledOptions(
                [
                  "No: left > right, so there are no columns left",
                  `Yes: read column ${left} from bottom to top`,
                  "Yes, but only the first cell",
                ],
                2,
              );
              return {
                question: `left = ${left} and right = ${right}. Should the left column be traversed?`,
                options: q.options,
                answer: q.answer,
                line: L.leftGuard - 1,
              };
            })()
          : undefined,
      });
    }
  }

  push({
    line: L.ret,
    ...base(),
    matrixRects: [],
    status: `return  (${result.length} cells)`,
    narration: `The rectangle is empty: all ${rows * cols} cells were read in spiral order. The numbers on the cells show the order.`,
    proof: `Each of the ${rows * cols} cells was read once: O(rows·cols) time, with no extra memory beyond the output.`,
  });
  return steps;
}

export const spiral: LessonBuilder<Inputs> = {
  slug: "spiral-traversal",
  title: "Matrix Spiral Traversal",
  subtitle: "Four shrinking bounds — top, bottom, left, right — peel the matrix layer by layer.",
  problem:
    "Given an m×n matrix, return all its elements in spiral order, starting from the top-left and moving inward.",
  spotIt: [
    "'Print / collect the matrix in spiral order from outside in.'",
    "Output must follow a layered traversal pattern.",
    "Variants: generate a spiral matrix, spiral order of a rectangular grid.",
  ],
  avoidWhen: [
    "You just need to visit every cell — a normal nested loop is simpler.",
    "Traversal order is row-major or column-major — no spiral needed.",
    "Matrix is sparse — pure traversal wastes time on empty cells.",
  ],
  practiceLadder,
  variant: "spiral",
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
