import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ----- q-venn: INNER, LEFT, RIGHT, FULL — dual-table step-by-step -----
// Source tables used by every join stage.
export const USERS_J: Row[] = [r(1, 1, "Ada"), r(2, 2, "Linus"), r(3, 3, "Grace")];
const ORDERS_J: Row[] = [
  r(11, 11, 1, "$45"),
  r(12, 12, 1, "$30"),
  r(13, 13, 2, "$120"),
  r(14, 14, 99, "$10"), // orphan — no matching user
];
const USERS_COLS = ["id", "name"];
const ORDERS_COLS = ["id", "user_id", "total"];
const RES_COLS = ["u.id", "u.name", "o.id", "o.total"];

// Helpers to build per-row state arrays for the dual layout.
const mark = <T,>(arr: T[], idx: number[], state: RowState): (RowState | undefined)[] =>
  arr.map((_, i) => (idx.includes(i) ? state : undefined));

// Build result rows for a matched pair.
const pair = (u: Row, o: Row | null): Row =>
  o
    ? r(`${u.cells[0]}-${o.cells[0]}`, u.cells[0]!, u.cells[1]!, o.cells[0]!, o.cells[2]!)
    : r(`${u.cells[0]}-NULL`, u.cells[0]!, u.cells[1]!, null, null);
const orphanRight = (o: Row): Row => r(`NULL-${o.cells[0]}`, null, null, o.cells[0]!, o.cells[2]!);

// Pre-compute matching result rows.
const ADA_45 = pair(USERS_J[0], ORDERS_J[0]);
const ADA_30 = pair(USERS_J[0], ORDERS_J[1]);
const LIN_120 = pair(USERS_J[1], ORDERS_J[2]);
const GRACE_NULL = pair(USERS_J[2], null);
const NULL_ORPHAN = orphanRight(ORDERS_J[3]);

export const vennStages: Stage[] = [
  // ─────────────── INNER JOIN ───────────────
  {
    name: "INNER JOIN — matched pairs only",
    blurb: "Keep a row only when ON predicate is TRUE",
    sql: [
      "SELECT u.id, u.name, o.id, o.total",
      "FROM   users u",
      "INNER  JOIN orders o ON o.user_id = u.id",
    ],
    leftTable: { name: "users  u", cols: USERS_COLS, rows: USERS_J },
    rightTable: { name: "orders o", cols: ORDERS_COLS, rows: ORDERS_J },
    steps: [
      {
        activeLines: [1, 2],
        note: "Two source relations. The join walks every left row and probes the right side on o.user_id = u.id.",
      },
      {
        activeLines: [2],
        leftStates: mark(USERS_J, [0], "kept"),
        rightStates: mark(ORDERS_J, [0, 1], "kept"),
        resultRows: [ADA_45, ADA_30],
        resultCols: RES_COLS,
        note: "Probe u=Ada(id=1). Orders #11 and #12 carry user_id=1 → emit 2 paired rows.",
      },
      {
        activeLines: [2],
        leftStates: mark(USERS_J, [1], "kept"),
        rightStates: mark(ORDERS_J, [2], "kept"),
        resultRows: [ADA_45, ADA_30, LIN_120],
        resultCols: RES_COLS,
        note: "Probe u=Linus(id=2). Order #13 matches → 1 more row.",
      },
      {
        activeLines: [2],
        leftStates: mark(USERS_J, [2], "dropped"),
        resultRows: [ADA_45, ADA_30, LIN_120],
        resultCols: RES_COLS,
        note: "Probe u=Grace(id=3). No order has user_id=3 → Grace is DROPPED. INNER never invents NULLs.",
        noteTone: "amber",
      },
      {
        activeLines: [2],
        leftStates: USERS_J.map((_, i) => (i === 2 ? "dropped" : "kept")),
        rightStates: ORDERS_J.map((_, i) => (i === 3 ? "dropped" : "kept")),
        resultRows: [ADA_45, ADA_30, LIN_120],
        resultCols: RES_COLS,
        note: "Orphan order #14 (user_id=99) finds no user → also dropped. INNER keeps only the intersection.",
      },
    ],
  },

  // ─────────────── LEFT JOIN ───────────────
  {
    name: "LEFT JOIN — keep every left row",
    blurb: "Unmatched left rows survive; right columns become NULL",
    sql: [
      "SELECT u.id, u.name, o.id, o.total",
      "FROM   users u",
      "LEFT   JOIN orders o ON o.user_id = u.id",
    ],
    leftTable: { name: "users  u  (preserved)", cols: USERS_COLS, rows: USERS_J },
    rightTable: { name: "orders o", cols: ORDERS_COLS, rows: ORDERS_J },
    steps: [
      {
        activeLines: [1, 2],
        note: "LEFT JOIN promises: every users row appears at least once in the output.",
      },
      {
        activeLines: [2],
        leftStates: mark(USERS_J, [0], "kept"),
        rightStates: mark(ORDERS_J, [0, 1], "kept"),
        resultRows: [ADA_45, ADA_30],
        resultCols: RES_COLS,
        note: "Ada matches → 2 rows, same as INNER.",
      },
      {
        activeLines: [2],
        leftStates: mark(USERS_J, [1], "kept"),
        rightStates: mark(ORDERS_J, [2], "kept"),
        resultRows: [ADA_45, ADA_30, LIN_120],
        resultCols: RES_COLS,
        note: "Linus matches → 1 row.",
      },
      {
        activeLines: [2],
        leftStates: mark(USERS_J, [2], "kept"),
        resultRows: [ADA_45, ADA_30, LIN_120, GRACE_NULL],
        resultCols: RES_COLS,
        note: "Grace has NO order. LEFT JOIN still emits her — with NULL for o.id and o.total.",
        noteTone: "mint",
      },
      {
        activeLines: [2],
        leftStates: USERS_J.map(() => "kept"),
        rightStates: mark(ORDERS_J, [3], "dropped"),
        resultRows: [ADA_45, ADA_30, LIN_120, GRACE_NULL],
        resultCols: RES_COLS,
        note: "Orphan order #14 is STILL dropped — only the LEFT side is preserved.",
      },
    ],
  },

  // ─────────────── RIGHT JOIN ───────────────
  {
    name: "RIGHT JOIN — keep every right row",
    blurb: "Mirror of LEFT — orphan rows on the right survive",
    sql: [
      "SELECT u.id, u.name, o.id, o.total",
      "FROM   users u",
      "RIGHT  JOIN orders o ON o.user_id = u.id",
    ],
    leftTable: { name: "users  u", cols: USERS_COLS, rows: USERS_J },
    rightTable: { name: "orders o  (preserved)", cols: ORDERS_COLS, rows: ORDERS_J },
    steps: [
      { activeLines: [1, 2], note: "RIGHT JOIN promises every orders row appears at least once." },
      {
        activeLines: [2],
        leftStates: mark(USERS_J, [0], "kept"),
        rightStates: mark(ORDERS_J, [0, 1], "kept"),
        resultRows: [ADA_45, ADA_30],
        resultCols: RES_COLS,
        note: "Orders #11 and #12 find Ada — 2 matched rows.",
      },
      {
        activeLines: [2],
        leftStates: mark(USERS_J, [1], "kept"),
        rightStates: mark(ORDERS_J, [2], "kept"),
        resultRows: [ADA_45, ADA_30, LIN_120],
        resultCols: RES_COLS,
        note: "Order #13 finds Linus — 1 more row.",
      },
      {
        activeLines: [2],
        leftStates: mark(USERS_J, [2], "dropped"),
        rightStates: mark(ORDERS_J, [3], "kept"),
        resultRows: [ADA_45, ADA_30, LIN_120, NULL_ORPHAN],
        resultCols: RES_COLS,
        note: "Orphan order #14 (user_id=99) is preserved with NULL user columns. Grace (no order) is dropped.",
        noteTone: "mint",
      },
      {
        activeLines: [2],
        note: "Convention: prefer LEFT and swap the operand order — it reads more naturally in code reviews.",
      },
    ],
  },

  // ─────────────── FULL OUTER JOIN ───────────────
  {
    name: "FULL OUTER JOIN — keep BOTH sides",
    blurb: "Union of LEFT and RIGHT semantics — unmatched on either side survives",
    sql: [
      "SELECT u.id, u.name, o.id, o.total",
      "FROM   users u",
      "FULL   JOIN orders o ON o.user_id = u.id",
    ],
    leftTable: { name: "users  u  (preserved)", cols: USERS_COLS, rows: USERS_J },
    rightTable: { name: "orders o  (preserved)", cols: ORDERS_COLS, rows: ORDERS_J },
    steps: [
      {
        activeLines: [1, 2],
        note: "FULL = every row from EITHER side appears at least once. Use for reconciliation reports.",
      },
      {
        activeLines: [2],
        leftStates: USERS_J.map((_, i) => (i < 2 ? "kept" : undefined)),
        rightStates: ORDERS_J.map((_, i) => (i < 3 ? "kept" : undefined)),
        resultRows: [ADA_45, ADA_30, LIN_120],
        resultCols: RES_COLS,
        note: "Matched portion first — same 3 rows as INNER.",
      },
      {
        activeLines: [2],
        leftStates: USERS_J.map((_, i) => (i === 2 ? "kept" : "kept")),
        rightStates: ORDERS_J.map((_, i) => (i < 3 ? "kept" : undefined)),
        resultRows: [ADA_45, ADA_30, LIN_120, GRACE_NULL],
        resultCols: RES_COLS,
        note: "Add unmatched left rows (Grace) padded with NULLs — exactly what LEFT contributes.",
        noteTone: "mint",
      },
      {
        activeLines: [2],
        leftStates: USERS_J.map(() => "kept"),
        rightStates: ORDERS_J.map(() => "kept"),
        resultRows: [ADA_45, ADA_30, LIN_120, GRACE_NULL, NULL_ORPHAN],
        resultCols: RES_COLS,
        note: "Add unmatched right rows (orphan #14) padded with NULLs — what RIGHT contributes. 5 rows total.",
        noteTone: "mint",
      },
    ],
  },
];

// ----- q-self: SELF JOIN — same table twice -----
const EMP_S: Row[] = [
  r(1, 1, "Ada", null),
  r(2, 2, "Linus", 1),
  r(3, 3, "Grace", 1),
  r(4, 4, "Bob", 2),
  r(5, 5, "Eve", 2),
];
const SCOLS = ["id", "name", "manager_id"];
const SELF_RES_COLS = ["emp", "manager"];

const selfRow = (eIdx: number, mIdx: number | null) =>
  r(
    `${eIdx}-${mIdx ?? "x"}`,
    String(EMP_S[eIdx].cells[1]),
    mIdx === null ? null : String(EMP_S[mIdx].cells[1]),
  );

export const selfStages: Stage[] = [
  {
    name: "Same table, two aliases",
    blurb: "An employee row can play TWO roles: employee (e) and manager (m)",
    sql: [
      "SELECT e.name AS emp, m.name AS manager",
      "FROM   employees e",
      "JOIN   employees m ON e.manager_id = m.id",
    ],
    leftTable: { name: "employees  e  (each row = an employee)", cols: SCOLS, rows: EMP_S },
    rightTable: { name: "employees  m  (same table, alias m = manager)", cols: SCOLS, rows: EMP_S },
    steps: [
      {
        activeLines: [1, 2],
        note: "The engine reads employees TWICE — once as e, once as m. They are independent cursors over the same data.",
      },
      {
        activeLines: [2],
        leftStates: mark(EMP_S, [0], "dropped"),
        resultRows: [],
        resultCols: SELF_RES_COLS,
        note: "Probe e=Ada. Ada.manager_id = NULL → ON-predicate UNKNOWN → drop. Roots fall out of an INNER self-join.",
        noteTone: "amber",
      },
      {
        activeLines: [2],
        leftStates: mark(EMP_S, [1], "kept"),
        rightStates: mark(EMP_S, [0], "kept"),
        resultRows: [selfRow(1, 0)],
        resultCols: SELF_RES_COLS,
        note: "Probe e=Linus (manager_id=1). Find m where m.id=1 → Ada. Emit (Linus, Ada).",
      },
      {
        activeLines: [2],
        leftStates: mark(EMP_S, [2], "kept"),
        rightStates: mark(EMP_S, [0], "kept"),
        resultRows: [selfRow(1, 0), selfRow(2, 0)],
        resultCols: SELF_RES_COLS,
        note: "Probe e=Grace (manager_id=1). m=Ada again. Emit (Grace, Ada).",
      },
      {
        activeLines: [2],
        leftStates: mark(EMP_S, [3], "kept"),
        rightStates: mark(EMP_S, [1], "kept"),
        resultRows: [selfRow(1, 0), selfRow(2, 0), selfRow(3, 1)],
        resultCols: SELF_RES_COLS,
        note: "Probe e=Bob (manager_id=2). m=Linus. Emit (Bob, Linus).",
      },
      {
        activeLines: [2],
        leftStates: mark(EMP_S, [4], "kept"),
        rightStates: mark(EMP_S, [1], "kept"),
        resultRows: [selfRow(1, 0), selfRow(2, 0), selfRow(3, 1), selfRow(4, 1)],
        resultCols: SELF_RES_COLS,
        note: "Probe e=Eve (manager_id=2). m=Linus. Done — 4 rows, Ada absent.",
      },
    ],
  },
  {
    name: "Use LEFT JOIN to keep the root",
    blurb: "Same data — swap INNER for LEFT so the CEO survives",
    sql: [
      "SELECT e.name AS emp,",
      "       COALESCE(m.name, '— root —') AS manager",
      "FROM   employees e",
      "LEFT   JOIN employees m ON e.manager_id = m.id",
    ],
    leftTable: { name: "employees  e  (preserved)", cols: SCOLS, rows: EMP_S },
    rightTable: { name: "employees  m", cols: SCOLS, rows: EMP_S },
    steps: [
      {
        activeLines: [3],
        leftStates: mark(EMP_S, [0], "kept"),
        resultRows: [r("ada-root", "Ada", "— root —")],
        resultCols: SELF_RES_COLS,
        note: "Ada has no manager — LEFT preserves her. COALESCE swaps the NULL for a friendly label.",
        noteTone: "mint",
      },
      {
        activeLines: [3],
        leftStates: mark(EMP_S, [1, 2], "kept"),
        rightStates: mark(EMP_S, [0], "kept"),
        resultRows: [r("ada-root", "Ada", "— root —"), selfRow(1, 0), selfRow(2, 0)],
        resultCols: SELF_RES_COLS,
        note: "Linus and Grace match Ada.",
      },
      {
        activeLines: [3],
        leftStates: mark(EMP_S, [3, 4], "kept"),
        rightStates: mark(EMP_S, [1], "kept"),
        resultRows: [
          r("ada-root", "Ada", "— root —"),
          selfRow(1, 0),
          selfRow(2, 0),
          selfRow(3, 1),
          selfRow(4, 1),
        ],
        resultCols: SELF_RES_COLS,
        note: "Bob and Eve match Linus. 5 rows — the full org chart, one level up.",
      },
      {
        activeLines: [3],
        note: "Self-join walks ONE level. For arbitrary-depth hierarchies (org chart, threaded comments), use a recursive CTE.",
      },
    ],
  },
];

// ----- q-semianti: EXISTS, NOT EXISTS -----
export const semiStages: Stage[] = [
  {
    name: "Semi-join via EXISTS",
    sql: [
      "SELECT u.id, u.name",
      "FROM   users u",
      "WHERE  EXISTS (SELECT 1 FROM orders o",
      "               WHERE o.user_id = u.id)",
    ],
    table: { name: "users", cols: ["id", "name"], rows: USERS_J },
    steps: [
      st(
        [2, 3],
        pass((r) => r.cells[0] === 1 || r.cells[0] === 2),
        "EXISTS stops at the FIRST match per outer row. Returns LEFT-side columns only — never duplicates the outer row. Ada has 2 orders but appears once.",
        { highlightCols: [0] },
      ),
    ],
  },
  {
    name: "Anti-join via NOT EXISTS",
    sql: [
      "SELECT u.id, u.name",
      "FROM   users u",
      "WHERE  NOT EXISTS (SELECT 1 FROM orders o",
      "                   WHERE o.user_id = u.id)",
    ],
    table: { name: "users", cols: ["id", "name"], rows: USERS_J },
    steps: [
      st(
        [2, 3],
        pass((r) => r.cells[0] === 3),
        "NOT EXISTS = anti-join. Grace surfaces (no orders). Unlike NOT IN, this is NULL-safe.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Why EXISTS beats JOIN+DISTINCT",
    sql: [
      "SELECT DISTINCT u.id, u.name      -- equivalent but slower",
      "FROM   users u",
      "JOIN   orders o ON o.user_id = u.id",
    ],
    table: { name: "users", cols: ["id", "name"], rows: USERS_J },
    steps: [
      st(
        [0, 2],
        pass((r) => r.cells[0] === 1 || r.cells[0] === 2),
        "JOIN+DISTINCT materialises every match then deduplicates. EXISTS short-circuits at the first match — usually cheaper for selective predicates.",
        { noteTone: "violet" },
      ),
    ],
  },
];

// ----- q-algos: Nested Loop, Hash, Sort-Merge -----
const algosRows = (lbl: string): Row[] => [
  r(lbl + "1", "Ada→#11", "$45"),
  r(lbl + "2", "Ada→#12", "$30"),
  r(lbl + "3", "Linus→#13", "$120"),
];

export const algosStages: Stage[] = [
  {
    name: "Nested Loop",
    blurb: "O(N·M) — good when inner side has an index",
    sql: [
      "-- Pseudocode",
      "for u in users:",
      "  for o in orders where o.user_id = u.id:",
      "    emit (u, o)",
    ],
    table: { name: "result", cols: ["pair", "total"], rows: algosRows("nl") },
    steps: [
      st(
        [1, 2],
        "added",
        "Optimiser picks this when one side is tiny (≤ a few thousand rows) OR the inner side has a B-Tree index on the join key — each inner lookup is O(log N).",
      ),
    ],
  },
  {
    name: "Hash Join",
    blurb: "O(N+M) — build hash on smaller side, probe with bigger",
    sql: [
      "-- Phase 1: build hash(users)",
      "-- Phase 2: probe with orders.user_id",
      "SELECT u.name, o.total FROM users u",
      "JOIN orders o ON o.user_id = u.id",
    ],
    table: { name: "result", cols: ["pair", "total"], rows: algosRows("hj") },
    steps: [
      st(
        [0],
        "added",
        "Build phase materialises the small side into a hash table in memory (work_mem). If too big → spills to disk in partitions. Best for equi-joins on large unindexed sides.",
      ),
    ],
  },
  {
    name: "Sort-Merge",
    blurb: "O((N+M)·log) — both sides already sorted? near-linear",
    sql: ["-- Sort users by id, sort orders by user_id", "-- Merge with twin cursors"],
    table: { name: "result", cols: ["pair", "total"], rows: algosRows("sm") },
    steps: [
      st(
        [0, 1],
        "added",
        "Wins on huge sorted inputs, on range joins (>=, BETWEEN), and when an ORDER BY downstream piggybacks on the merge order.",
      ),
    ],
  },
];

// ============================================================
// Module 4: Subqueries & Set Ops
// ============================================================
