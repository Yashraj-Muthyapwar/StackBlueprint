import type { CellHighlight, LessonBuilder, PracticeProblem, Step } from "../types";
import { numberOptions } from "../prefix/shared";
import { lineOf } from "../binary-search/shared";
import { clone, isSquare, positionOptions } from "./shared";

type Mode = "cw" | "ccw";
type Inputs = { mode: Mode; matrix: number[][] };

const practiceLadder: PracticeProblem[] = [
  {
    name: "Transpose Matrix",
    difficulty: "easy",
    hint: "Phase 1 of this lesson, but for any rectangle: the result is cols × rows, so you cannot do it in place unless the matrix is square.",
    link: "https://leetcode.com/problems/transpose-matrix/",
  },
  {
    name: "Flipping an Image",
    difficulty: "easy",
    hint: "Reverse each row, then invert every bit. Two simple passes, or one pass with two pointers per row.",
    link: "https://leetcode.com/problems/flipping-an-image/",
  },
  {
    name: "Determine Whether Matrix Can Be Obtained By Rotation",
    difficulty: "easy",
    hint: "Rotate the matrix up to four times and compare. You already have the rotation, so this is just a loop.",
    link: "https://leetcode.com/problems/determine-whether-matrix-can-be-obtained-by-rotation/",
  },
  {
    name: "Rotate Image",
    difficulty: "medium",
    hint: "This exact pattern. Before coding, write where (r, c) lands after a clockwise turn, then check the transpose + reverse recipe produces it.",
    link: "https://leetcode.com/problems/rotate-image/",
  },
  {
    name: "Spiral Matrix II",
    difficulty: "medium",
    hint: "Layers again, but you fill instead of read. The same four shrinking bounds work.",
    link: "https://leetcode.com/problems/spiral-matrix-ii/",
  },
  {
    name: "Set Matrix Zeroes",
    difficulty: "medium",
    hint: "In-place thinking: the first row and column can store the flags for all the others, if you remember to handle them last.",
    link: "https://leetcode.com/problems/set-matrix-zeroes/",
  },
  {
    name: "Rotating the Box",
    difficulty: "medium",
    hint: "Rotate clockwise, but first let each stone fall to the right in its row. Gravity, then the same rotation recipe.",
    link: "https://leetcode.com/problems/rotating-the-box/",
  },
  {
    name: "Game of Life",
    difficulty: "medium",
    hint: "Another in-place trick: encode 'old state → new state' in the same cell so later cells can still read the old one.",
    link: "https://leetcode.com/problems/game-of-life/",
  },
];

const codeCw = `def rotate(matrix):
    n = len(matrix)
    # 1) transpose: swap across the main diagonal
    for row in range(n):
        for col in range(row + 1, n):
            matrix[row][col], matrix[col][row] = (
                matrix[col][row], matrix[row][col])
    # 2) reverse each row
    for row in range(n):
        matrix[row].reverse()
    return matrix`;

const codeCcw = `def rotate_counterclockwise(matrix):
    n = len(matrix)
    # 1) transpose: swap across the main diagonal
    for row in range(n):
        for col in range(row + 1, n):
            matrix[row][col], matrix[col][row] = (
                matrix[col][row], matrix[row][col])
    # 2) reverse the order of the rows (flip upside down)
    matrix.reverse()
    return matrix`;

const DEFAULT = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
];

function build({ mode, matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  const m = clone(matrix);
  const n = m.length;
  const code = mode === "ccw" ? codeCcw : codeCw;
  const L = {
    n: lineOf(code, "n = len(matrix)"),
    swap: lineOf(code, "matrix[row][col], matrix[col][row]"),
    phase2: lineOf(code, "# 2)"),
    revLoop:
      mode === "cw" ? lineOf(code, "for row in range(n):", 1) : lineOf(code, "matrix.reverse()"),
    rev: mode === "cw" ? lineOf(code, "matrix[row].reverse()") : lineOf(code, "matrix.reverse()"),
    ret: lineOf(code, "return matrix"),
  };

  if (!isSquare(m)) {
    steps.push({
      line: L.n,
      matrix: m,
      narration: "In-place rotation needs a square matrix (same number of rows and columns).",
    });
    return steps;
  }

  // Follow one marked value through both phases, so the rotation rule is something you can watch.
  let A: { r: number; c: number } | null = n >= 2 ? { r: 0, c: 1 } : null;
  const diag: CellHighlight[] =
    n > 1 ? Array.from({ length: n }, (_, i) => ({ r: i, c: i, tone: "visit" as const })) : [];
  const push = (s: Partial<Step> & { line: number; narration: string }) =>
    steps.push({
      matrix: clone(m),
      matrixIndices: true,
      cellPointers: A ? [{ name: "A", r: A.r, c: A.c, color: "rose" }] : [],
      ...s,
    });

  // ------------------------------------------------------------- intro
  const intro = A
    ? positionOptions(
        mode === "cw" ? [1, n - 1] : [n - 2, 0],
        mode === "cw"
          ? [
              [n - 2, 0],
              [0, n - 2],
              [1, 0],
              [n - 1, 1],
            ]
          : [
              [1, n - 1],
              [0, n - 2],
              [1, 0],
              [n - 1, 1],
            ],
        1,
      )
    : null;
  push({
    line: L.n,
    status: `${n}×${n} matrix, A is the value at (row 0, col 1)`,
    narration:
      mode === "cw"
        ? `Rotate the ${n}×${n} matrix 90° clockwise, in place. Two simple moves do it: transpose, then reverse each row. We'll follow the marked value A to see what happens to one cell.`
        : `Rotate the ${n}×${n} matrix 90° counter-clockwise, in place. Two simple moves do it: transpose, then reverse the order of the rows. We'll follow the marked value A.`,
    proof:
      "Neither move is a rotation by itself, but composed they are. Thinking of a rotation as two reflections is what makes the in-place version easy to get right.",
    predict:
      A && intro
        ? {
            question: `The marked value A sits at (row 0, col 1). After the full ${mode === "cw" ? "clockwise" : "counter-clockwise"} 90° rotation, where will it be?`,
            options: intro.options,
            answer: intro.answer,
            line: L.n,
          }
        : undefined,
  });

  // ------------------------------------------------------------- phase 1: transpose
  const pairs: [number, number][] = [];
  for (let row = 0; row < n; row++) for (let col = row + 1; col < n; col++) pairs.push([row, col]);
  const askPair = new Set<number>([0, Math.floor(pairs.length / 2)]);
  const swapRow = (row: number, col: number) => {
    const a = m[row][col];
    const b = m[col][row];
    return { a, b };
  };

  pairs.forEach(([row, col], pi) => {
    const { a, b } = swapRow(row, col);
    const hi: CellHighlight[] = [
      ...diag,
      { r: row, c: col, tone: "swap" },
      { r: col, c: row, tone: "swap" },
    ];
    if (askPair.has(pi) && a !== b) {
      push({
        line: L.swap,
        lineEnd: L.swap + 1,
        cellHighlights: hi,
        status: `swap (${row},${col}) ↔ (${col},${row})`,
        narration: `Swap (${row},${col}) = ${a} with its mirror (${col},${row}) = ${b}. After the swap, (${row},${col}) holds ${b}.`,
        proof:
          pi === 0
            ? "Every cell swaps with the cell on the opposite side of the main diagonal: (row, col) ↔ (col, row). The diagonal cells (amber) swap with themselves, so they never move."
            : undefined,
        predict: {
          question: `(${row},${col}) holds ${a} and (${col},${row}) holds ${b}. After swapping them, what value sits at (${row},${col})?`,
          options: numberOptions(b, [a, m[row][row], m[col][col]], pi + 1),
          answer: String(b),
          line: L.swap - 2,
        },
      });
    }
    m[row][col] = b;
    m[col][row] = a;
    if (A) {
      if (A.r === row && A.c === col) A = { r: col, c: row };
      else if (A.r === col && A.c === row) A = { r: row, c: col };
    }
    push({
      line: L.swap,
      lineEnd: L.swap + 1,
      cellHighlights: hi,
      status: `(${row},${col}) = ${b},  (${col},${row}) = ${a}`,
      narration:
        askPair.has(pi) && a !== b
          ? `Now (${row},${col}) = ${b} and (${col},${row}) = ${a}.`
          : `Swap (${row},${col}) = ${a} ↔ (${col},${row}) = ${b}.`,
    });
  });

  push({
    line: L.phase2,
    cellHighlights: [],
    status: "transposed",
    narration:
      "Transposed: every row of the old matrix is now a column. The picture has been reflected over the main diagonal.",
    proof:
      "A transpose alone is a reflection, not a rotation. It flips the picture over the diagonal, so left and right are still swapped relative to a real turn. One more mirror fixes that.",
  });

  // ------------------------------------------------------------- phase 2
  if (mode === "cw") {
    for (let row = 0; row < n; row++) {
      const before = [...m[row]];
      const rowHi: CellHighlight[] = before.map((_, col) => ({
        r: row,
        c: col,
        tone: "visit" as const,
      }));
      if (row === 0 && n >= 3) {
        const first = before[0];
        const last = before[n - 1];
        push({
          line: L.rev,
          cellHighlights: rowHi,
          status: `reverse row ${row}: [${before.join(", ")}]`,
          narration: `Row ${row} is [${before.join(", ")}]. Reversing it puts ${last} first and ${first} last.`,
          proof:
            "Reversing a row mirrors the picture left to right. After the diagonal reflection, this mirror is exactly what turns it into a quarter turn.",
          predict: {
            question: `Row ${row} is [${before.join(", ")}]. After reversing it, what is the FIRST value?`,
            options: numberOptions(
              last,
              [first, before[1], before[n - 2] === last ? before[1] : before[n - 2]],
              1,
            ),
            answer: String(last),
            line: lineOf(code, "for row in range(n):", 1),
          },
        });
      }
      m[row].reverse();
      if (A && A.r === row) A = { r: A.r, c: n - 1 - A.c };
      push({
        line: L.rev,
        cellHighlights: m[row].map((_, col) => ({ r: row, c: col, tone: "visit" as const })),
        status: `row ${row} reversed`,
        narration: `Reversed row ${row}: [${m[row].join(", ")}].`,
      });
    }
  } else {
    const flipPairs = Math.floor(n / 2);
    for (let i = 0; i < flipPairs; i++) {
      const j = n - 1 - i;
      const rowsHi: CellHighlight[] = [
        ...m[i].map((_, col) => ({ r: i, c: col, tone: "swap" as const })),
        ...m[j].map((_, col) => ({ r: j, c: col, tone: "swap" as const })),
      ];
      if (i === 0 && n >= 3) {
        push({
          line: L.rev,
          cellHighlights: rowsHi,
          status: `matrix.reverse(): swap row ${i} ↔ row ${j}`,
          narration: `Reversing the order of the rows swaps row ${i} with row ${j}, row ${i + 1} with row ${j - 1}, and so on. After swapping rows ${i} and ${j}, the value at (0,0) will be ${m[j][0]}.`,
          proof:
            "Flipping top to bottom mirrors the picture vertically. After the diagonal reflection, this is what makes a counter-clockwise quarter turn.",
          predict: {
            question: `Flipping the matrix upside down swaps row 0 with row ${j}. What value ends up at (row 0, col 0)?`,
            options: numberOptions(m[j][0], [m[0][0], m[0][n - 1], m[j][n - 1]], 1),
            answer: String(m[j][0]),
            line: L.revLoop - 1,
          },
        });
      }
      const tmp = m[i];
      m[i] = m[j];
      m[j] = tmp;
      if (A) {
        if (A.r === i) A = { r: j, c: A.c };
        else if (A.r === j) A = { r: i, c: A.c };
      }
      push({
        line: L.rev,
        cellHighlights: rowsHi,
        status: `row ${i} ↔ row ${j}`,
        narration: `Swapped row ${i} and row ${j}.`,
      });
    }
    if (n % 2 === 1 && n > 1) {
      push({
        line: L.rev,
        cellHighlights: m[(n - 1) / 2].map((_, col) => ({
          r: (n - 1) / 2,
          c: col,
          tone: "visit" as const,
        })),
        status: "middle row stays",
        narration: `With an odd number of rows, the middle row (row ${(n - 1) / 2}) is its own mirror and stays where it is.`,
      });
    }
  }

  // ------------------------------------------------------------- done
  push({
    line: L.ret,
    cellHighlights: A ? [{ r: A.r, c: A.c, tone: "match" }] : [],
    status: "rotation complete",
    narration: A
      ? `Done. A started at (0,1) and finished at (${A.r},${A.c}). In general, the cell at (r, c) ends up at ${mode === "cw" ? "(c, n − 1 − r)" : "(n − 1 − c, r)"}.`
      : "Done.",
    proof: `Every cell moved at most twice, once per phase, all inside the original matrix: O(n²) time and O(1) extra space.`,
  });
  return steps;
}

export const rotate90: LessonBuilder<Inputs> = {
  slug: "rotate-90",
  title: "Matrix Rotate 90°",
  subtitle: "Transpose, then reverse each row — an in-place 90° rotation.",
  problem: ({ mode }) =>
    mode === "ccw"
      ? "Rotate an n×n matrix by 90° counter-clockwise, in place, without allocating a second matrix."
      : "Rotate an n×n matrix by 90° clockwise, in place, without allocating a second matrix.",
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
  practiceLadder,
  variant: "rotate-90",
  view: "matrix",
  code: codeCw,
  codeFor: (inputs) => ((inputs as Inputs).mode === "ccw" ? codeCcw : codeCw),
  defaultInputs: { mode: "cw", matrix: DEFAULT },
  inputs: [
    {
      key: "mode",
      label: "Direction",
      kind: "select",
      options: [
        { value: "cw", label: "Clockwise (transpose, reverse rows)" },
        { value: "ccw", label: "Counter-clockwise (transpose, flip upside down)" },
      ],
    },
    { key: "matrix", label: "Square matrix", kind: "intMatrix", help: "rows by ; cells by ," },
  ],
  validate: ({ matrix }) => {
    const w: string[] = [];
    if (!matrix.length) w.push("Matrix is empty.");
    else if (matrix.some((r) => r.length !== matrix.length))
      w.push("In-place rotation requires a square matrix.");
    return w;
  },
  build,
};
