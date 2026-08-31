import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ---------- sql-comments ----------
const COMMENT_ORDERS_COLS = ["id", "item", "amount"];
const COMMENT_ORDERS: Row[] = [
  r(1, 1, "Pen", 30),
  r(2, 2, "Notebook", 90),
  r(3, 3, "Keyboard", 320),
  r(4, 4, "Mouse", 45),
];
const COMMENT_STUDENTS_COLS = ["id", "name", "grade"];
const COMMENT_STUDENTS: Row[] = [r(1, 1, "Ada", "A"), r(2, 2, "Linus", "B"), r(3, 3, "Grace", "A")];

export const commentsStages: Stage[] = [
  {
    name: "Single-line — `-- comment`",
    blurb: "Everything after `--` on a line is ignored",
    sql: ["-- fetch all records from the Students table", "SELECT *", "FROM   Students;"],
    table: { name: "Students", cols: COMMENT_STUDENTS_COLS, rows: COMMENT_STUDENTS },
    steps: [
      st(
        [0],
        "pending",
        "Line 0 begins with `--` so the parser DROPS it entirely. Nothing executes from that line.",
        { noteTone: "amber" },
      ),
      st(
        [1, 2],
        "kept",
        "Only lines 1–2 are sent to the engine. The result is every row of Students — comments don't change behaviour, just intent.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Inline `--` after code",
    blurb: "The dashes only kill the rest of THAT line",
    sql: [
      "SELECT *           -- select all columns",
      "FROM   Students;   -- from the Students table",
    ],
    table: { name: "Students", cols: COMMENT_STUDENTS_COLS, rows: COMMENT_STUDENTS },
    steps: [
      st(
        [0],
        "pending",
        "`SELECT *` on the left is real SQL. `-- select all columns` on the right is annotation — the parser stops at the dashes.",
        { noteTone: "violet" },
      ),
      st([0, 1], "kept", "Same thing on line 1. Final executed query: `SELECT * FROM Students;`", {
        noteTone: "mint",
      }),
    ],
  },
  {
    name: "Multi-line `/* … */`",
    blurb: "Span as many lines as you like",
    sql: [
      "/* selecting all records",
      "   from the",
      "   Students table */",
      "SELECT *",
      "FROM   Students;",
    ],
    table: { name: "Students", cols: COMMENT_STUDENTS_COLS, rows: COMMENT_STUDENTS },
    steps: [
      st(
        [0, 1, 2],
        "pending",
        "The block from `/*` to `*/` is one comment, no matter how many lines it covers.",
        { noteTone: "amber" },
      ),
      st(
        [3, 4],
        "kept",
        "After stripping, the engine sees `SELECT * FROM Students;` — identical to the single-line version.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Comment INSIDE a statement",
    blurb: "`/* … */` acts as whitespace anywhere",
    sql: ["SELECT *", "FROM   /* table name here */ Students;"],
    table: { name: "Students", cols: COMMENT_STUDENTS_COLS, rows: COMMENT_STUDENTS },
    steps: [
      st(
        [1],
        "pending",
        "Inline block comment sits between `FROM` and the table name. The parser collapses it to a single space.",
        { noteTone: "violet" },
      ),
      st(
        [0, 1],
        "kept",
        "Effective query: `SELECT * FROM Students;` — same result, extra context for whoever reads the code.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Debug — comment out a statement",
    blurb: "Disable code without deleting it",
    sql: [
      "/* SELECT *",
      "   FROM Customers; */",
      "-- the statement above is ignored by the DBMS",
      "",
      "SELECT *",
      "FROM   Students;",
    ],
    table: { name: "Students", cols: COMMENT_STUDENTS_COLS, rows: COMMENT_STUDENTS },
    steps: [
      st(
        [0, 1],
        "pending",
        "The Customers query is wrapped in `/* … */`, so the engine never sees it. Useful while debugging.",
        { noteTone: "rose" },
      ),
      st(
        [4, 5],
        "kept",
        "Only the Students SELECT actually runs. Removing two characters re-enables the Customers query.",
        { noteTone: "mint" },
      ),
    ],
  },
];

// ---------- sql-operators ----------
const OP_COLS = ["id", "item", "amount", "customer_id"];
const OP_ROWS: Row[] = [
  r(1, 1, "Pen", 30, 4),
  r(2, 2, "Notebook", 90, 2),
  r(3, 3, "Keyboard", 320, 4),
  r(4, 4, "Monitor", 400, 1),
  r(5, 5, "Mouse", 45, 3),
  r(6, 6, "Cable", 10, 4),
];

export const operatorsStages: Stage[] = [
  {
    name: "Arithmetic +  -  *  /  %",
    blurb: "Derive new numeric columns inside SELECT",
    sql: [
      "SELECT item,",
      "       amount,",
      "       amount + 100 AS total_amount,",
      "       amount - 20  AS offer_price,",
      "       amount * 2   AS double_price,",
      "       amount / 2   AS half_price",
      "FROM   Orders;",
    ],
    table: { name: "Orders", cols: OP_COLS, rows: OP_ROWS },
    steps: [
      st(
        [0, 1, 6],
        "kept",
        "Start with the source rows. Arithmetic operators are computed once per row, on the fly.",
        { highlightCols: [2] },
      ),
      st(
        [2, 6],
        "kept",
        "`amount + 100` produces a NEW column `total_amount`. The original `amount` is unchanged.",
        {
          rowsOverride: OP_ROWS.map((row) =>
            r(row.key, row.cells[1], row.cells[2], Number(row.cells[2]) + 100),
          ),
          colsOverride: ["item", "amount", "total_amount"],
          noteTone: "mint",
        },
      ),
      st(
        [2, 3, 4, 5, 6],
        "kept",
        "All four arithmetic operators evaluated together — one row in, four derived columns out.",
        {
          rowsOverride: OP_ROWS.map((row) => {
            const a = Number(row.cells[2]);
            return r(row.key, row.cells[1], a, a + 100, a - 20, a * 2, a / 2);
          }),
          colsOverride: [
            "item",
            "amount",
            "total_amount",
            "offer_price",
            "double_price",
            "half_price",
          ],
          noteTone: "violet",
        },
      ),
      st(
        [],
        "kept",
        "Modulo (`%`) returns the remainder of a division. `SELECT 10 % 3` → 1. Handy for 'every Nth row' or odd/even checks.",
        {
          rowsOverride: [r("m", 10, 3, 1)],
          colsOverride: ["a", "b", "a % b"],
          noteTone: "amber",
        },
      ),
    ],
  },
  {
    name: "Comparison =  <  >  <=  >=  <>",
    blurb: "Each comparison returns TRUE / FALSE / UNKNOWN",
    sql: ["SELECT id, item, amount", "FROM   Orders", "WHERE  customer_id = 4;"],
    table: { name: "Orders", cols: OP_COLS, rows: OP_ROWS },
    steps: [
      st([0, 1], "pending", "Source: 6 rows enter the WHERE operator.", { highlightCols: [3] }),
      st(
        [2],
        pass((row) => row.cells[3] === 4),
        "`customer_id = 4` keeps the 3 rows owned by customer 4. Equality is the most common comparison.",
        { highlightCols: [3], noteTone: "mint" },
      ),
      st(
        [2],
        pass((row) => Number(row.cells[2]) < 50),
        "Swap predicate to `amount < 50` — strict less-than drops the 50 boundary itself. 3 rows survive.",
        { highlightCols: [2], noteTone: "violet" },
      ),
      st(
        [2],
        pass((row) => Number(row.cells[2]) >= 90),
        "`amount >= 90` — inclusive: 90, 320, and 400 all pass.",
        { highlightCols: [2], noteTone: "mint" },
      ),
      st(
        [2],
        pass((row) => Number(row.cells[2]) !== 400),
        "`amount <> 400` (same as `!=`). 5 of 6 rows pass. Remember: comparing to NULL returns UNKNOWN and the row would be dropped — use IS NULL for nulls.",
        { highlightCols: [2], noteTone: "amber" },
      ),
    ],
  },
  {
    name: "Logical AND",
    blurb: "Both predicates must be TRUE",
    sql: [
      "SELECT id, item, amount, customer_id",
      "FROM   Orders",
      "WHERE  amount > 50",
      "       AND customer_id = 4;",
    ],
    table: { name: "Orders", cols: OP_COLS, rows: OP_ROWS },
    steps: [
      st(
        [2],
        pass((row) => Number(row.cells[2]) > 50),
        "Step 1: `amount > 50` keeps Notebook, Keyboard, Monitor, Mouse (and drops Pen, Cable).",
        { highlightCols: [2] },
      ),
      st(
        [2, 3],
        pass((row) => Number(row.cells[2]) > 50 && row.cells[3] === 4),
        "Step 2: add `AND customer_id = 4`. Only Keyboard satisfies BOTH — the AND survivors are the intersection.",
        { highlightCols: [2, 3], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Logical OR",
    blurb: "Either predicate TRUE keeps the row",
    sql: [
      "SELECT id, item, amount",
      "FROM   Orders",
      "WHERE  amount < 20",
      "       OR amount > 300;",
    ],
    table: { name: "Orders", cols: OP_COLS, rows: OP_ROWS },
    steps: [
      st(
        [2],
        pass((row) => Number(row.cells[2]) < 20),
        "`amount < 20` alone — only Cable qualifies.",
        { highlightCols: [2] },
      ),
      st(
        [2, 3],
        pass((row) => Number(row.cells[2]) < 20 || Number(row.cells[2]) > 300),
        "Add `OR amount > 300`. Keyboard and Monitor join Cable — OR is the union of the two predicates.",
        { highlightCols: [2], noteTone: "violet" },
      ),
    ],
  },
  {
    name: "Logical NOT + precedence",
    blurb: "AND binds tighter than OR — parenthesise!",
    sql: [
      "SELECT id, item, amount, customer_id",
      "FROM   Orders",
      "WHERE  NOT customer_id = 4",
      "       AND amount >= 50;",
    ],
    table: { name: "Orders", cols: OP_COLS, rows: OP_ROWS },
    steps: [
      st(
        [2],
        pass((row) => row.cells[3] !== 4),
        "`NOT customer_id = 4` flips the equality — 3 non-customer-4 rows survive.",
        { highlightCols: [3] },
      ),
      st(
        [2, 3],
        pass((row) => row.cells[3] !== 4 && Number(row.cells[2]) >= 50),
        "Add `AND amount >= 50` → Notebook and Monitor. NOT applied to a single predicate; AND tightens the filter.",
        { highlightCols: [2, 3], noteTone: "mint" },
      ),
      st(
        [2, 3],
        pass((row) => row.cells[3] !== 4 && Number(row.cells[2]) >= 50),
        "Precedence map: arithmetic > comparison > NOT > AND > OR. When mixing AND/OR, ALWAYS parenthesise — `a OR b AND c` parses as `a OR (b AND c)`.",
        { highlightCols: [2, 3], noteTone: "amber" },
      ),
    ],
  },
];
