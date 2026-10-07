import type { CellHighlight, LessonBuilder, PracticeProblem, Step } from "../types";
import { labelledOptions, numberOptions } from "../prefix/shared";
import { lineOf } from "../binary-search/shared";
import { clone, positionOptions } from "./shared";

type Mode = "cw" | "ccw" | "anti";
type Inputs = { mode: Mode; matrix: number[][] };

const practiceLadder: PracticeProblem[] = [
  {
    name: "Transpose Matrix",
    difficulty: "easy",
    hint: "Phase 1 only, on any rectangle. The result is cols × rows, so allocate it first and fill result[c][r] = matrix[r][c].",
    link: "https://leetcode.com/problems/transpose-matrix/",
  },
  {
    name: "Flipping an Image",
    difficulty: "easy",
    hint: "Phase 2 only, plus a bit inversion. Reverse each row, or do both in one pass with two pointers.",
    link: "https://leetcode.com/problems/flipping-an-image/",
  },
  {
    name: "Toeplitz Matrix",
    difficulty: "easy",
    hint: "Every diagonal must be constant. Compare each cell with its up-left neighbour instead of extracting whole diagonals.",
    link: "https://leetcode.com/problems/toeplitz-matrix/",
  },
  {
    name: "Determine Whether Matrix Can Be Obtained By Rotation",
    difficulty: "easy",
    hint: "Four rotations return to the start. Rotate with transpose + reverse and compare after each turn.",
    link: "https://leetcode.com/problems/determine-whether-matrix-can-be-obtained-by-rotation/",
  },
  {
    name: "Reshape the Matrix",
    difficulty: "easy",
    hint: "A different re-indexing: flatten with index = r * cols + c, then unflatten into the new shape.",
    link: "https://leetcode.com/problems/reshape-the-matrix/",
  },
  {
    name: "Rotate Image",
    difficulty: "medium",
    hint: "The in-place cousin of this lesson. A square matrix can be transposed without a second matrix.",
    link: "https://leetcode.com/problems/rotate-image/",
  },
  {
    name: "Rotating the Box",
    difficulty: "medium",
    hint: "Let the stones fall to the right in every row first, then rotate clockwise with exactly the recipe in this lesson.",
    link: "https://leetcode.com/problems/rotating-the-box/",
  },
];

const codeCw = `def rotate_clockwise(matrix):
    rows, cols = len(matrix), len(matrix[0])
    # 1) transpose into a new cols x rows matrix
    result = [[0] * rows for _ in range(cols)]
    for c in range(cols):
        for r in range(rows):
            result[c][r] = matrix[r][c]
    # 2) flip: reverse every row
    for row in result:
        row.reverse()
    return result`;

const codeCcw = `def rotate_counterclockwise(matrix):
    rows, cols = len(matrix), len(matrix[0])
    # 1) transpose into a new cols x rows matrix
    result = [[0] * rows for _ in range(cols)]
    for c in range(cols):
        for r in range(rows):
            result[c][r] = matrix[r][c]
    # 2) flip: reverse the order of the rows
    result.reverse()
    return result`;

const codeAnti = `def anti_transpose(matrix):
    rows, cols = len(matrix), len(matrix[0])
    # 1) transpose into a new cols x rows matrix
    result = [[0] * rows for _ in range(cols)]
    for c in range(cols):
        for r in range(rows):
            result[c][r] = matrix[r][c]
    # 2) flip both ways: reverse every row, then the order of the rows
    for row in result:
        row.reverse()
    result.reverse()
    return result`;

const CODES: Record<Mode, string> = { cw: codeCw, ccw: codeCcw, anti: codeAnti };

const NAMES: Record<Mode, string> = {
  cw: "rotated 90° clockwise",
  ccw: "rotated 90° counter-clockwise",
  anti: "reflected over the anti-diagonal",
};

function build({ mode, matrix }: Inputs): Step[] {
  const steps: Step[] = [];
  const code = CODES[mode];
  const L = {
    alloc: lineOf(code, "result = [[0]"),
    outer: lineOf(code, "for c in range(cols)"),
    fill: lineOf(code, "result[c][r] = matrix[r][c]"),
    phase2: lineOf(code, "# 2)"),
    revRows: mode === "ccw" ? -1 : lineOf(code, "row.reverse()"),
    revOrder: mode === "cw" ? -1 : lineOf(code, "result.reverse()"),
    ret: lineOf(code, "return result"),
  };
  if (!matrix.length || !matrix[0]?.length) {
    steps.push({ line: 1, matrix, narration: "The matrix is empty." });
    return steps;
  }
  const rows = matrix.length;
  const cols = matrix[0].length;
  const doRows = mode === "cw" || mode === "anti";
  const doOrder = mode === "ccw" || mode === "anti";

  // result starts empty: null cells show where values have not arrived yet.
  const res: (number | null)[][] = Array.from({ length: cols }, () =>
    new Array<number | null>(rows).fill(null),
  );
  const snap = () => res.map((r) => [...r]);
  const leftLabel = `matrix  ${rows}×${cols}`;
  const rightLabel = `result  ${cols}×${rows}`;
  const push = (s: Partial<Step> & { line: number; narration: string }) =>
    steps.push({
      matrix: clone(matrix),
      matrix2: snap(),
      matrix2Layout: "aligned",
      matrixLabel: leftLabel,
      matrix2Label: rightLabel,
      ...s,
    });

  // The corner value we follow to the end, and where the recipe says it lands.
  const cornerTarget: [number, number] =
    mode === "cw" ? [0, rows - 1] : mode === "ccw" ? [cols - 1, 0] : [cols - 1, rows - 1];
  const rule =
    mode === "cw"
      ? "(r, c) → (c, rows − 1 − r)"
      : mode === "ccw"
        ? "(r, c) → (cols − 1 − c, r)"
        : "(r, c) → (cols − 1 − c, rows − 1 − r)";

  // ------------------------------------------------------------- allocate
  const shape =
    rows !== cols
      ? labelledOptions(
          [`${cols} × ${rows}`, `${rows} × ${cols}`, `${rows} × ${rows}`, `${cols} × ${cols}`],
          1,
        )
      : null;
  push({
    line: L.alloc,
    status: `input ${rows}×${cols}  →  result ${cols}×${rows}`,
    narration: `Build the result ${NAMES[mode]}. Step 1 transposes into a new ${cols}×${rows} matrix. Step 2 flips it. The input on the left never changes.`,
    proof:
      rows === cols
        ? "A transpose swaps rows and columns, so the shape is cols × rows. Here the matrix is square, so the shape stays the same."
        : `A transpose swaps rows and columns, so an ${rows}×${cols} input becomes ${cols}×${rows}. That is why a non-square matrix needs a new matrix, not an in-place swap.`,
    predict: shape
      ? {
          question: `The input has ${rows} rows and ${cols} columns. What shape is its transpose (rows × columns)?`,
          options: shape.options,
          answer: shape.answer,
          line: lineOf(code, "rows, cols"),
        }
      : undefined,
  });

  // ------------------------------------------------------------- phase 1: fill the transpose
  for (let c = 0; c < cols; c++) {
    if (c === 1 && cols > 1) {
      const q = labelledOptions(
        [
          `Input column ${c}, top to bottom`,
          `Input row ${c}, left to right`,
          `Input column ${c}, bottom to top`,
          `Input column ${c - 1}, top to bottom`,
        ],
        2,
      );
      push({
        line: L.outer,
        cellHighlights: matrix.map((_, r) => ({ r, c, tone: "compare" as const })),
        cellHighlights2: res[c].map((_, r) => ({ r: c, c: r, tone: "match" as const })),
        status: `filling result row ${c}`,
        narration: `Result row ${c} is built from input column ${c}, read top to bottom: ${matrix.map((row) => row[c]).join(", ")}.`,
        proof:
          "Transposing turns every column into a row. Read down column c of the input, write across row c of the result.",
        predict: {
          question: `The result's row ${c} is about to be filled. Which part of the input does it hold?`,
          options: q.options,
          answer: q.answer,
          line: L.outer,
        },
      });
    }
    for (let r = 0; r < rows; r++) {
      res[c][r] = matrix[r][c];
      push({
        line: L.fill,
        cellHighlights: [{ r, c, tone: "compare" }],
        cellPointers: [{ name: "→", r, c, color: "violet" }],
        cellHighlights2: [{ r: c, c: r, tone: "match" }],
        cellPointers2: [{ name: "=", r: c, c: r, color: "mint" }],
        status: `result[${c}][${r}] = matrix[${r}][${c}] = ${matrix[r][c]}`,
        narration: `result[${c}][${r}] ← matrix[${r}][${c}] = ${matrix[r][c]}. Row and column trade places.`,
        proof:
          r === 0 && c === 0
            ? "The cell at (r, c) moves to (c, r): the row index and column index swap. That is the whole transpose."
            : undefined,
      });
    }
  }

  push({
    line: L.phase2,
    status: "transposed",
    narration: `The transpose is complete: ${cols}×${rows}. Every row of the input is now a column of the result. Next, flip it.`,
    proof:
      "A transpose is a reflection over the main diagonal. It is not a rotation yet, because the picture is mirrored. One more flip un-mirrors it in the right way.",
  });

  // ------------------------------------------------------------- phase 2: flips
  const firstAfter = (): number => {
    // value that will be at (0,0) once all flips are done
    const tmp = res.map((r) => [...r]) as number[][];
    if (doRows) tmp.forEach((r) => r.reverse());
    if (doOrder) tmp.reverse();
    return tmp[0][0];
  };
  const flipAsk = cols * rows > 1 ? firstAfter() : null;
  let askedFlip = false;
  const wrongFirsts = [
    res[0][0],
    res[cols - 1][0],
    res[0][rows - 1],
    res[cols - 1][rows - 1],
  ] as number[];

  const maybeAsk = (extra: Partial<Step>): Partial<Step> => {
    if (askedFlip || flipAsk === null || (rows === 1 && cols === 1)) return {};
    askedFlip = true;
    return {
      ...extra,
      predict: {
        question: `After ALL the flips of this recipe, which value ends up at (row 0, col 0) of the result?`,
        options: numberOptions(
          flipAsk,
          wrongFirsts.filter((v) => v !== flipAsk),
          1,
        ),
        answer: String(flipAsk),
        line: L.phase2,
      },
    };
  };

  if (doRows) {
    for (let r = 0; r < cols; r++) {
      const before = [...(res[r] as number[])];
      const hi: CellHighlight[] = before.map((_, c) => ({ r, c, tone: "visit" as const }));
      const ask = r === 0 ? maybeAsk({}) : {};
      if (ask.predict) {
        push({
          line: L.revRows,
          cellHighlights2: hi,
          status: `reverse row ${r}: [${before.join(", ")}]`,
          narration: `${mode === "anti" ? "Both flips together " : "The flip "}mirror${mode === "anti" ? "" : "s"} the result. Reversing row ${r} turns [${before.join(", ")}] into [${[...before].reverse().join(", ")}].${doOrder ? " Then the order of the rows is reversed too." : ""}`,
          proof:
            mode === "cw"
              ? "Reversing each row maps column c to column rows − 1 − c. Combined with the transpose, (r, c) → (c, rows − 1 − r): a clockwise quarter turn."
              : "Two flips (left–right and top–bottom) together are a 180° turn of the transposed picture, which reflects the input over its anti-diagonal.",
          ...ask,
        });
      }
      res[r].reverse();
      push({
        line: L.revRows,
        cellHighlights2: res[r].map((_, c) => ({ r, c, tone: "visit" as const })),
        status: `row ${r} reversed`,
        narration: `Reversed row ${r}: [${res[r].join(", ")}].`,
      });
    }
  }
  if (doOrder) {
    const pairs = Math.floor(cols / 2);
    for (let i = 0; i < pairs; i++) {
      const j = cols - 1 - i;
      const hi: CellHighlight[] = [
        ...res[i].map((_, c) => ({ r: i, c, tone: "swap" as const })),
        ...res[j].map((_, c) => ({ r: j, c, tone: "swap" as const })),
      ];
      const ask = !doRows && i === 0 ? maybeAsk({}) : {};
      if (ask.predict) {
        push({
          line: L.revOrder,
          cellHighlights2: hi,
          status: `result.reverse(): row ${i} ↔ row ${j}`,
          narration: `Reversing the order of the rows swaps row ${i} with row ${j}, row ${i + 1} with row ${j - 1}, and so on.`,
          proof:
            mode === "ccw"
              ? "Reversing the order of the rows maps row r to row cols − 1 − r. Combined with the transpose, (r, c) → (cols − 1 − c, r): a counter-clockwise quarter turn."
              : undefined,
          ...ask,
        });
      }
      const tmp = res[i];
      res[i] = res[j];
      res[j] = tmp;
      push({
        line: L.revOrder,
        cellHighlights2: hi,
        status: `row ${i} ↔ row ${j}`,
        narration: `Swapped row ${i} and row ${j}.`,
      });
    }
    if (cols % 2 === 1 && cols > 1) {
      push({
        line: L.revOrder,
        status: "middle row stays",
        narration: `With an odd number of rows, the middle row (row ${(cols - 1) / 2}) is its own mirror and stays put.`,
      });
    }
  }

  // ------------------------------------------------------------- final
  const corner = positionOptions(
    cornerTarget,
    [
      [0, 0],
      [0, rows - 1],
      [cols - 1, 0],
      [cols - 1, rows - 1],
    ],
    3,
  );
  push({
    line: L.ret,
    cellHighlights: [{ r: 0, c: 0, tone: "match" }],
    cellHighlights2: [{ r: cornerTarget[0], c: cornerTarget[1], tone: "match" }],
    cellPointers: [{ name: "A", r: 0, c: 0, color: "rose" }],
    cellPointers2: [{ name: "A", r: cornerTarget[0], c: cornerTarget[1], color: "rose" }],
    status: `result is the input ${NAMES[mode]}`,
    narration: `Done. The input's top-left value ${matrix[0][0]} (marked A) now sits at (${cornerTarget[0]},${cornerTarget[1]}). In general ${rule}.`,
    proof: `Two cheap passes compose into the transform: transpose, then ${mode === "cw" ? "reverse each row" : mode === "ccw" ? "reverse the order of the rows" : "reverse both ways"}. It costs O(rows·cols) time and a new O(rows·cols) matrix.`,
    predict: corner
      ? {
          question: `Where does the input's top-left value (row 0, col 0) end up in the final ${cols}×${rows} result?`,
          options: corner.options,
          answer: corner.answer,
          line: L.ret,
        }
      : undefined,
  });
  return steps;
}

export const transposeFlip: LessonBuilder<Inputs> = {
  slug: "transpose-flip",
  title: "Transpose & Flip",
  subtitle:
    "Compose two simple passes — transpose, then reverse rows — for rotations and reflections.",
  problem: ({ mode }) =>
    mode === "ccw"
      ? "Given an m×n matrix, rotate it 90° counter-clockwise by transposing it and then reversing the order of the rows."
      : mode === "anti"
        ? "Given an m×n matrix, reflect it over its anti-diagonal by transposing it and then flipping the result both ways."
        : "Given an m×n matrix, rotate it 90° clockwise by transposing it and then reversing every row.",
  spotIt: [
    "Any 90° rotation, reflection, or 'mirror' on a matrix.",
    "Two simple passes are cleaner than a single index-mapping pass.",
    "Interviewer asks you to reason about composing simpler transforms.",
  ],
  avoidWhen: [
    "You must do it in a single pass for cache reasons — use direct index mapping.",
    "Matrix is huge and two passes double the I/O cost.",
    "Transform isn't a composition of transpose + flip (e.g. arbitrary rotation).",
  ],
  practiceLadder,
  variant: "transpose-flip",
  view: "matrix",
  code: codeCw,
  codeFor: (inputs) => CODES[(inputs as Inputs).mode] ?? codeCw,
  defaultInputs: {
    mode: "cw",
    matrix: [
      [1, 2, 3],
      [4, 5, 6],
    ],
  },
  inputs: [
    {
      key: "mode",
      label: "Recipe",
      kind: "select",
      options: [
        { value: "cw", label: "Rotate clockwise (transpose, reverse rows)" },
        { value: "ccw", label: "Rotate counter-clockwise (transpose, reverse row order)" },
        { value: "anti", label: "Anti-diagonal reflection (transpose, flip both ways)" },
      ],
    },
    { key: "matrix", label: "Matrix (any shape)", kind: "intMatrix", help: "rows by ; cells by ," },
  ],
  validate: ({ matrix }) =>
    matrix.length === 0 || matrix[0].length === 0 ? ["Matrix is empty."] : [],
  build,
};
