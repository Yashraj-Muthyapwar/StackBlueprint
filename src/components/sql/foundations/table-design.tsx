import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ----- table-build -----
const usersTB: Row[] = [r(1, 1, "ada@ex.com"), r(2, 2, "linus@ex.com"), r(3, 3, "grace@ex.com")];
const tbCols = ["id", "email"];

export const tableBuildStages: Stage[] = [
  {
    name: "CREATE TABLE — declare the shape",
    sql: [
      "CREATE TABLE users (",
      "  id    BIGSERIAL PRIMARY KEY,",
      "  email TEXT      NOT NULL UNIQUE",
      ");",
    ],
    table: { name: "users", cols: tbCols, rows: [] },
    steps: [
      st(
        [0, 1, 2, 3],
        "pending",
        "Schema defined: 2 columns, 1 PK, 1 UNIQUE constraint. The table exists but holds zero rows.",
      ),
    ],
  },
  {
    name: "INSERT — populate",
    sql: [
      "INSERT INTO users (email) VALUES",
      "  ('ada@ex.com'),",
      "  ('linus@ex.com'),",
      "  ('grace@ex.com');",
    ],
    table: { name: "users", cols: tbCols, rows: usersTB },
    steps: [st([0, 1, 2, 3], "added", "BIGSERIAL auto-fills id. Three rows now present.")],
  },
  {
    name: "Constraint rejects duplicate",
    sql: ["INSERT INTO users (email)", "VALUES ('ada@ex.com');  -- duplicate"],
    table: { name: "users", cols: tbCols, rows: [...usersTB, r("dup", "—", "ada@ex.com")] },
    steps: [
      st(
        [1],
        (row) => (row.key === "dup" ? ("dropped" as RowState) : ("kept" as RowState)),
        "UNIQUE(email) enforced at COMMIT time. ERROR: duplicate key value violates unique constraint 'users_email_key'.",
        { noteTone: "rose" },
      ),
    ],
  },
];

// ----- foreign-key -----
const parents: Row[] = [r(1, 1, "Ada"), r(2, 2, "Linus")];
const childOK: Row[] = [r(1, 11, 1, "$45"), r(2, 12, 2, "$120")];

export const fkStages: Stage[] = [
  {
    name: "Parent table exists",
    sql: ["CREATE TABLE users (", "  id BIGSERIAL PRIMARY KEY,", "  name TEXT", ");"],
    table: { name: "users", cols: ["id", "name"], rows: parents },
    steps: [st([0, 1, 2, 3], "kept", "Parent populated with two rows.")],
  },
  {
    name: "Child with FOREIGN KEY",
    sql: [
      "CREATE TABLE orders (",
      "  id      BIGSERIAL PRIMARY KEY,",
      "  user_id BIGINT REFERENCES users(id),",
      "  total   NUMERIC",
      ");",
    ],
    table: { name: "orders", cols: ["id", "user_id", "total"], rows: childOK },
    steps: [
      st(
        [2],
        "added",
        "REFERENCES creates a constraint that every order.user_id must match a users.id (or be NULL).",
      ),
    ],
  },
  {
    name: "Orphan insert rejected",
    sql: ["INSERT INTO orders (user_id, total)", "VALUES (99, 10);  -- no such user"],
    table: {
      name: "orders",
      cols: ["id", "user_id", "total"],
      rows: [...childOK, r("orph", 13, 99, 10)],
    },
    steps: [
      st(
        [1],
        (row) => (row.key === "orph" ? ("dropped" as RowState) : ("kept" as RowState)),
        "ERROR: insert violates foreign key constraint. Referential integrity is enforced at write time — your data can never be inconsistent.",
        { noteTone: "rose" },
      ),
    ],
  },
];

// ----- type-sizes -----
const typesRows: Row[] = [
  r(1, "SMALLINT", "2 bytes", "−32 768 → 32 767", "page counts"),
  r(2, "INT", "4 bytes", "≈ ±2.1 B", "row ids ≤ 2 B"),
  r(3, "BIGINT", "8 bytes", "≈ ±9.2 E18", "ids, timestamps_ms"),
  r(4, "NUMERIC(p,s)", "var", "exact decimal", "money — never FLOAT!"),
  r(5, "TEXT", "var", "unlimited", "free-form strings"),
  r(6, "VARCHAR(n)", "var ≤ n", "bounded", "where length cap matters"),
];
const typeCols = ["#", "type", "storage", "range", "when to use"];

export const typeStages: Stage[] = [
  {
    name: "Integers — pick the smallest that holds your future max",
    sql: [
      "CREATE TABLE t (",
      "  small_count  SMALLINT,",
      "  row_id       INT,",
      "  ms_epoch     BIGINT",
      ");",
    ],
    table: { name: "types", cols: typeCols, rows: typesRows.slice(0, 3) },
    steps: [
      st(
        [0, 1, 2, 3],
        "kept",
        "INT covers 2.1 B — fine for many tables. Use BIGINT for ids if you might exceed 2 B; using BIGINT EVERYWHERE doubles index size.",
        { highlightCols: [2] },
      ),
    ],
  },
  {
    name: "NUMERIC for money — never FLOAT",
    sql: ["-- WRONG", "price DOUBLE PRECISION", "-- RIGHT", "price NUMERIC(12,2)"],
    table: { name: "types", cols: typeCols, rows: [typesRows[3]] },
    steps: [
      st(
        [2, 3],
        "kept",
        "FLOAT/DOUBLE are binary fractions: 0.1 + 0.2 = 0.30000000000000004. NUMERIC(precision, scale) is exact base-10 — required for finance.",
        { noteTone: "rose" },
      ),
    ],
  },
  {
    name: "TEXT vs VARCHAR(n)",
    sql: ["name  TEXT,             -- unlimited", "code  VARCHAR(8),       -- enforced cap"],
    table: { name: "types", cols: typeCols, rows: typesRows.slice(4) },
    steps: [
      st(
        [0, 1],
        "kept",
        "In Postgres TEXT and VARCHAR share storage — no perf difference. Use VARCHAR(n) only when n is a real business rule. Use TEXT otherwise.",
        { noteTone: "mint" },
      ),
    ],
  },
];

// ============================================================
// FOUNDATIONS — extended pedagogical variants
// ============================================================
