import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ---------- offset-pagination + 2nd highest salary ----------
const SAL_COLS = ["id", "name", "salary"];
const SAL_ROWS: Row[] = [
  r(1, 1, "Ada", 140000),
  r(2, 2, "Linus", 120000),
  r(3, 3, "Grace", 95000),
  r(4, 4, "Alan", 150000),
  r(5, 5, "Edsger", 80000),
  r(6, 6, "Donald", 110000),
  r(7, 7, "Barbara", 95000),
];

const sortedDesc = [...SAL_ROWS].sort((a, b) => Number(b.cells[2]) - Number(a.cells[2]));

export const offsetStages: Stage[] = [
  {
    name: "ORDER BY — sort the table",
    sql: ["SELECT id, name, salary", "FROM   employees", "ORDER  BY salary DESC"],
    table: { name: "employees", cols: SAL_COLS, rows: SAL_ROWS },
    steps: [
      st(
        [0, 1, 2],
        "kept",
        "Without an explicit sort, OFFSET / LIMIT are meaningless. Pagination starts with a deterministic ORDER BY.",
        {
          rowsOverride: sortedDesc,
          colsOverride: SAL_COLS,
          noteTone: "neutral",
        },
      ),
    ],
  },
  {
    name: "LIMIT — page 1 (top 3)",
    sql: ["SELECT id, name, salary", "FROM   employees", "ORDER  BY salary DESC", "LIMIT  3"],
    table: { name: "employees", cols: SAL_COLS, rows: SAL_ROWS },
    steps: [
      st(
        [3],
        "kept",
        "LIMIT 3 keeps the first 3 rows of the sorted stream. This is page 1 of a 3-per-page listing.",
        {
          rowsOverride: sortedDesc.slice(0, 3),
          colsOverride: SAL_COLS,
          noteTone: "mint",
        },
      ),
    ],
  },
  {
    name: "OFFSET — skip to page 2",
    sql: [
      "SELECT id, name, salary",
      "FROM   employees",
      "ORDER  BY salary DESC",
      "LIMIT  3 OFFSET 3",
    ],
    table: { name: "employees", cols: SAL_COLS, rows: SAL_ROWS },
    steps: [
      st(
        [3],
        "kept",
        "OFFSET 3 walks past the first 3 rows, then LIMIT 3 keeps the next 3. That's page 2 — formula: OFFSET = (page - 1) × page_size.",
        {
          rowsOverride: sortedDesc.slice(3, 6),
          colsOverride: SAL_COLS,
          noteTone: "violet",
        },
      ),
    ],
  },
  {
    name: "Second highest salary — LIMIT 1 OFFSET 1",
    sql: [
      "SELECT salary AS second_highest",
      "FROM   employees",
      "ORDER  BY salary DESC",
      "LIMIT  1 OFFSET 1",
    ],
    table: { name: "employees", cols: SAL_COLS, rows: SAL_ROWS },
    steps: [
      st(
        [0, 2, 3],
        "kept",
        "Classic interview question. Sort DESC, OFFSET 1 (skip the highest), LIMIT 1 (take the next). Caveat: ties at the top break this — see the DISTINCT variant.",
        {
          rowsOverride: [r("x", sortedDesc[1].cells[2] as number)],
          colsOverride: ["second_highest"],
          noteTone: "amber",
        },
      ),
    ],
  },
  {
    name: "Tie-safe — DISTINCT + OFFSET",
    sql: [
      "SELECT DISTINCT salary AS second_highest",
      "FROM   employees",
      "ORDER  BY salary DESC",
      "LIMIT  1 OFFSET 1",
    ],
    table: { name: "employees", cols: SAL_COLS, rows: SAL_ROWS },
    steps: [
      st(
        [0, 2, 3],
        "kept",
        "DISTINCT collapses duplicate salaries first, so OFFSET counts unique salary tiers — robust against two employees sharing the top salary.",
        {
          rowsOverride: [
            r("y", Array.from(new Set(sortedDesc.map((row) => row.cells[2])))[1] as number),
          ],
          colsOverride: ["second_highest"],
          noteTone: "mint",
        },
      ),
    ],
  },
  {
    name: "Why deep OFFSET is slow",
    sql: [
      "-- page 500 of a 20-per-page list",
      "SELECT id, name, salary",
      "FROM   employees",
      "ORDER  BY salary DESC",
      "LIMIT  20 OFFSET 9980",
    ],
    table: { name: "employees", cols: SAL_COLS, rows: SAL_ROWS },
    steps: [
      st(
        [1, 2, 3, 4],
        "kept",
        "OFFSET 9980 forces the engine to READ AND DISCARD 9980 rows before returning 20. Cost grows linearly with the page number — switch to keyset (WHERE salary < $last) for deep lists.",
        { noteTone: "rose" },
      ),
    ],
  },
];
