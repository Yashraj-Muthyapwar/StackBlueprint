import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { pass, r, st } from "../animation-shared";

// ---------- table-anatomy: Database / Table / Column / Row ----------
const TA_USERS: Row[] = [
  r(1, 1, "ada@ex.com", "2026-01-04"),
  r(2, 2, "linus@ex.com", "2026-01-05"),
  r(3, 3, "grace@ex.com", "2026-02-11"),
  r(4, 4, "alan@ex.com", "2026-03-02"),
];
const TA_COLS = ["id", "email", "created_at"];

const dbBox = (highlight: "db" | "table" | "col" | "row" | null) => (
  <div className="space-y-2">
    <div
      className={`rounded-lg border px-3 py-2 transition-colors ${highlight === "db" ? "border-mint bg-mint/15" : "border-hairline bg-surface-2/40"}`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        database
      </div>
      <div className="font-mono text-sm">app_db</div>
      <div className="mt-2 grid gap-1.5">
        {["users", "orders", "products"].map((t) => (
          <div
            key={t}
            className={`rounded-md border px-2 py-1 font-mono text-[12px] ${highlight === "table" && t === "users" ? "border-mint bg-mint/15 text-mint" : "border-hairline bg-surface text-muted-foreground"}`}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
    <div className="text-[11px] text-muted-foreground">
      {highlight === "db" && "A database is a named container of related tables."}
      {highlight === "table" && "A table is one collection of rows with a fixed shape."}
      {highlight === "col" && "A column defines ONE attribute + its data type."}
      {highlight === "row" && "A row is ONE record — values for every column."}
    </div>
  </div>
);

export const tableAnatomyStages: Stage[] = [
  {
    name: "Database — the outermost container",
    blurb: "Holds many tables, plus indexes, views, roles…",
    sql: [
      "-- One database can hold dozens of tables",
      "-- They share the same auth, backups, transactions",
    ],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st(
        [],
        "pending",
        "A DATABASE is the top-level namespace. Inside it live tables, views, indexes, functions, and roles.",
        { side: dbBox("db") },
      ),
    ],
  },
  {
    name: "Table — one shape of record",
    blurb: "A named collection of rows with identical structure",
    sql: [
      "CREATE TABLE users (",
      "  id BIGSERIAL PRIMARY KEY,",
      "  email TEXT,",
      "  created_at TIMESTAMPTZ",
      ");",
    ],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st(
        [0, 1, 2, 3, 4],
        "kept",
        "A TABLE = a 2-D grid. Every row in it MUST follow the same column shape declared by CREATE TABLE.",
        { side: dbBox("table") },
      ),
    ],
  },
  {
    name: "Column — one vertical attribute",
    blurb: "Same data type top to bottom",
    sql: ["SELECT email", "FROM   users"],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st(
        [0],
        "kept",
        "A COLUMN is a vertical slice. Every value in 'email' is TEXT — type is enforced.",
        { highlightCols: [1], side: dbBox("col") },
      ),
      st(
        [0],
        "kept",
        "Other columns highlighted in sequence — id (BIGINT), created_at (TIMESTAMPTZ). Type per column is non-negotiable.",
        { highlightCols: [0, 2], side: dbBox("col") },
      ),
    ],
  },
  {
    name: "Row — one horizontal record",
    blurb: "A complete tuple: one value per column",
    sql: ["SELECT *", "FROM   users", "WHERE  id = 2"],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st(
        [0, 2],
        (row) => (row.cells[0] === 2 ? "kept" : "dropped"),
        "A ROW = ONE record. Here, row id=2 is the tuple (2, 'linus@ex.com', '2026-01-05').",
        { side: dbBox("row") },
      ),
    ],
  },
  {
    name: "Putting it together",
    sql: ["-- database  →  table  →  rows × columns"],
    table: { name: "users", cols: TA_COLS, rows: TA_USERS },
    steps: [
      st(
        [0],
        "kept",
        "Hierarchy: Database CONTAINS tables. Each table is a grid of columns (shape) × rows (data). Master this and the rest of SQL clicks.",
        { highlightCols: [0, 1, 2], noteTone: "mint" },
      ),
    ],
  },
];

// ---------- pk-anatomy: PRIMARY KEY in motion ----------
const PK_ROWS: Row[] = [r(1, 1, "ada@ex.com"), r(2, 2, "linus@ex.com")];
const PK_COLS = ["id", "email"];

export const pkStages: Stage[] = [
  {
    name: "Declaring a primary key",
    sql: [
      "CREATE TABLE users (",
      "  id    BIGSERIAL PRIMARY KEY,",
      "  email TEXT NOT NULL UNIQUE",
      ");",
    ],
    table: { name: "users", cols: PK_COLS, rows: [] },
    steps: [
      st(
        [0, 1, 2, 3],
        "pending",
        "PRIMARY KEY on `id` means: every row MUST have an id, and no two ids may repeat. BIGSERIAL auto-generates the next integer.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "Inserts succeed — id auto-fills",
    sql: ["INSERT INTO users (email) VALUES", "  ('ada@ex.com'), ('linus@ex.com');"],
    table: { name: "users", cols: PK_COLS, rows: PK_ROWS },
    steps: [
      st(
        [0, 1],
        "added",
        "Two new rows — Postgres assigned id=1 then id=2 from the sequence. Identity is now permanent for these rows.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "NULL in a PK column → ERROR",
    sql: ["INSERT INTO users (id, email)", "VALUES (NULL, 'eve@ex.com');"],
    table: { name: "users", cols: PK_COLS, rows: [...PK_ROWS, r("nul", null, "eve@ex.com")] },
    steps: [
      st(
        [0, 1],
        (row) => (row.key === "nul" ? "dropped" : "kept"),
        "ERROR: null value in column 'id' violates not-null constraint. Primary key columns are IMPLICITLY NOT NULL.",
        { noteTone: "rose" },
      ),
    ],
  },
  {
    name: "Duplicate PK value → ERROR",
    sql: ["INSERT INTO users (id, email)", "VALUES (1, 'bob@ex.com');"],
    table: { name: "users", cols: PK_COLS, rows: [...PK_ROWS, r("dup", 1, "bob@ex.com")] },
    steps: [
      st(
        [0, 1],
        (row) => (row.key === "dup" ? "dropped" : "kept"),
        "ERROR: duplicate key value violates unique constraint 'users_pkey'. id=1 already exists.",
        { noteTone: "rose" },
      ),
    ],
  },
  {
    name: "Composite primary key — multi-column identity",
    sql: [
      "CREATE TABLE order_items (",
      "  order_id   BIGINT,",
      "  product_id BIGINT,",
      "  qty        INT NOT NULL,",
      "  PRIMARY KEY (order_id, product_id)",
      ");",
    ],
    table: {
      name: "order_items",
      cols: ["order_id", "product_id", "qty"],
      rows: [r(1, 101, 7, 2), r(2, 101, 9, 1), r(3, 102, 7, 5), r("dupck", 101, 7, 3)],
    },
    steps: [
      st(
        [4],
        (row) => (row.key === "dupck" ? "dropped" : "kept"),
        "PK = the PAIR (order_id, product_id). (101,7) and (101,9) are fine — different products. The second (101,7) duplicates the first → REJECTED.",
        { highlightCols: [0, 1], noteTone: "rose" },
      ),
    ],
  },
  {
    name: "Surrogate vs natural key",
    sql: [
      "-- NATURAL: use a real-world unique value",
      "CREATE TABLE countries (",
      "  iso2  CHAR(2) PRIMARY KEY,  -- 'US','DE','JP'",
      "  name  TEXT NOT NULL",
      ");",
      "",
      "-- SURROGATE: invent an opaque id",
      "CREATE TABLE users (",
      "  id    BIGSERIAL PRIMARY KEY,  -- meaningless 1,2,3…",
      "  email TEXT UNIQUE NOT NULL    -- real identity, kept as UNIQUE",
      ");",
    ],
    table: { name: "users", cols: PK_COLS, rows: PK_ROWS },
    steps: [
      st(
        [6, 7, 8, 9, 10],
        "kept",
        "Best practice for mutable entities: SURROGATE BIGSERIAL/UUID as PK + a UNIQUE on the natural key. Email can change; the surrogate id never does.",
        { noteTone: "violet" },
      ),
    ],
  },
];

// ---------- fk-deep: FOREIGN KEY scenarios ----------
const FK_USERS: Row[] = [r(1, 1, "Ada"), r(2, 2, "Linus"), r(3, 3, "Grace")];
const FK_ORDERS: Row[] = [r(11, 11, 1, 45), r(12, 12, 1, 30), r(13, 13, 2, 120)];
const FK_UCOLS = ["id", "name"];
const FK_OCOLS = ["id", "user_id", "total"];

export const fkDeepStages: Stage[] = [
  {
    name: "Parent table comes first",
    blurb: "An FK can only point to an existing primary key",
    sql: ["CREATE TABLE users (", "  id   BIGSERIAL PRIMARY KEY,", "  name TEXT NOT NULL", ");"],
    table: { name: "users", cols: FK_UCOLS, rows: FK_USERS },
    steps: [
      st(
        [0, 1, 2, 3],
        "kept",
        "Parent table 'users' has 3 rows. Each id is unique — the candidates a foreign key may point to.",
        { highlightCols: [0] },
      ),
    ],
  },
  {
    name: "Declare REFERENCES on the child",
    sql: [
      "CREATE TABLE orders (",
      "  id      BIGSERIAL PRIMARY KEY,",
      "  user_id BIGINT NOT NULL",
      "          REFERENCES users(id),",
      "  total   NUMERIC NOT NULL",
      ");",
    ],
    table: { name: "orders", cols: FK_OCOLS, rows: [] },
    steps: [
      st(
        [2, 3],
        "pending",
        "user_id is now a FOREIGN KEY → every value MUST match some users.id. The engine will enforce this on every INSERT and UPDATE.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "Valid inserts — user exists",
    sql: ["INSERT INTO orders (user_id, total)", "VALUES (1, 45), (1, 30), (2, 120);"],
    table: { name: "orders", cols: FK_OCOLS, rows: FK_ORDERS },
    steps: [
      st(
        [0, 1],
        "added",
        "Each user_id (1,1,2) finds a matching parent in users → all three rows accepted.",
        { highlightCols: [1], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Orphan insert REJECTED",
    sql: ["INSERT INTO orders (user_id, total)", "VALUES (99, 10);"],
    table: { name: "orders", cols: FK_OCOLS, rows: [...FK_ORDERS, r("orph", 14, 99, 10)] },
    steps: [
      st(
        [0, 1],
        (row) => (row.key === "orph" ? "dropped" : "kept"),
        "ERROR: insert violates foreign key constraint. user_id=99 has no parent in users → the engine refuses the write. Referential integrity preserved.",
        { highlightCols: [1], noteTone: "rose" },
      ),
    ],
  },
  {
    name: "ON DELETE CASCADE — children follow parent",
    sql: [
      "CREATE TABLE orders (",
      "  ...",
      "  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE",
      ");",
      "",
      "DELETE FROM users WHERE id = 1;",
    ],
    table: { name: "orders", cols: FK_OCOLS, rows: FK_ORDERS },
    steps: [
      st(
        [5],
        (row) => (row.cells[1] === 1 ? "dropped" : "kept"),
        "Deleting Ada (id=1) cascades into orders — her 2 child rows are auto-deleted in the SAME transaction.",
        { highlightCols: [1], noteTone: "amber" },
      ),
    ],
  },
  {
    name: "ON DELETE SET NULL — keep history, drop the link",
    sql: ["...REFERENCES users(id) ON DELETE SET NULL", "", "DELETE FROM users WHERE id = 1;"],
    table: {
      name: "orders",
      cols: FK_OCOLS,
      rows: [r(11, 11, null, 45), r(12, 12, null, 30), r(13, 13, 2, 120)],
    },
    steps: [
      st(
        [2],
        (row) => (row.cells[1] === null ? "added" : "kept"),
        "user_id must be NULLABLE. Ada's two orders survive — their user_id becomes NULL. Useful when child rows are still meaningful without the parent.",
        { highlightCols: [1], noteTone: "violet" },
      ),
    ],
  },
  {
    name: "ON DELETE RESTRICT (default) — block the delete",
    sql: ["DELETE FROM users WHERE id = 1;  -- with default RESTRICT"],
    table: { name: "users", cols: FK_UCOLS, rows: FK_USERS },
    steps: [
      st(
        [0],
        () => "dropped",
        "ERROR: update or delete on 'users' violates foreign key constraint on 'orders'. The parent can't go away while children reference it. Safest default.",
        { noteTone: "rose" },
      ),
    ],
  },
];

// ---------- normalization: 1NF → 5NF → Denormalize ----------
const UN_ROWS: Row[] = [
  r(1, 101, "Ada", "ada@ex.com", "Pen, Notebook"),
  r(2, 102, "Ada", "ada@ex.com", "Keyboard"),
  r(3, 103, "Linus", "linus@ex.com", "Pen"),
];
const UN_COLS = ["order_id", "customer", "email", "items"];

const NF1_ROWS: Row[] = [
  r(1, 101, "Ada", "ada@ex.com", "Pen"),
  r(2, 101, "Ada", "ada@ex.com", "Notebook"),
  r(3, 102, "Ada", "ada@ex.com", "Keyboard"),
  r(4, 103, "Linus", "linus@ex.com", "Pen"),
];

const sidePanel = (title: string, lines: string[], tone: Tone = "violet") => {
  const colorMap: Record<Tone, string> = {
    mint: "border-mint/40 bg-mint/10 text-mint",
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    amber: "border-amber/40 bg-amber/10 text-amber",
    violet: "border-violet/40 bg-violet/10 text-violet",
    neutral: "border-hairline bg-surface-2/40 text-muted-foreground",
  };
  return (
    <div className={`rounded-lg border p-3 ${colorMap[tone]}`}>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em]">{title}</div>
      {lines.map((l, i) => (
        <div key={i} className="mt-1 font-mono text-[12px] text-foreground/85">
          {l}
        </div>
      ))}
    </div>
  );
};

export const normStages: Stage[] = [
  {
    name: "Unnormalized — the smell",
    blurb: "One wide table, repeating customer info + a multi-valued cell",
    sql: ["-- BEFORE: all-in-one fact table"],
    table: { name: "orders_flat", cols: UN_COLS, rows: UN_ROWS },
    steps: [
      st(
        [0],
        () => "dropped",
        "Three problems: 'items' is a LIST in one cell (not atomic); Ada's email REPEATS on every row (update anomaly waiting to happen); no clean way to ask 'how many pens sold?'.",
        {
          highlightCols: [3],
          noteTone: "rose",
          side: sidePanel(
            "Anomalies",
            ["• Update anomaly", "• Insert anomaly", "• Delete anomaly"],
            "rose",
          ),
        },
      ),
    ],
  },
  {
    name: "1NF — atomic cells, no lists",
    blurb: "Split the comma list into separate rows",
    sql: ["-- 1NF: one value per cell"],
    table: { name: "orders_flat", cols: UN_COLS, rows: NF1_ROWS },
    steps: [
      st(
        [0],
        "added",
        "Order 101 expanded into two rows — one per item. Every cell now holds a SINGLE atomic value. 1NF is the minimum bar.",
        { highlightCols: [3], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "2NF — split partial dependencies",
    blurb: "Non-key columns must depend on the WHOLE composite key",
    sql: [
      "-- Composite key was (order_id, item)",
      "-- 'customer' depends only on order_id  →  move it out",
      "CREATE TABLE orders     (order_id PK, customer, email);",
      "CREATE TABLE order_items(order_id, item, PK(order_id,item));",
    ],
    table: {
      name: "orders",
      cols: ["order_id", "customer", "email"],
      rows: [
        r(1, 101, "Ada", "ada@ex.com"),
        r(2, 102, "Ada", "ada@ex.com"),
        r(3, 103, "Linus", "linus@ex.com"),
      ],
    },
    steps: [
      st(
        [2, 3],
        "added",
        "Customer info now lives once per order, not per item. 'items' moves into its own table referencing order_id.",
        {
          side: sidePanel(
            "order_items",
            ["(101, Pen)", "(101, Notebook)", "(102, Keyboard)", "(103, Pen)"],
            "violet",
          ),
        },
      ),
    ],
  },
  {
    name: "3NF — kill transitive dependencies",
    blurb: "Non-key columns must depend ONLY on the key",
    sql: [
      "-- order.email depends on order.customer (not directly on order_id)",
      "-- Move customer attributes into customers, reference by id",
      "CREATE TABLE customers (id PK, name, email);",
      "CREATE TABLE orders    (id PK, customer_id REFERENCES customers);",
    ],
    table: {
      name: "customers",
      cols: ["id", "name", "email"],
      rows: [r(1, 1, "Ada", "ada@ex.com"), r(2, 2, "Linus", "linus@ex.com")],
    },
    steps: [
      st(
        [2, 3],
        "added",
        "An email change touches ONE row in customers — no risk of drift. orders references customer_id. This is the canonical 3NF shape most teams target.",
        {
          noteTone: "mint",
          side: sidePanel(
            "orders",
            ["(101, customer_id=1)", "(102, customer_id=1)", "(103, customer_id=2)"],
            "violet",
          ),
        },
      ),
    ],
  },
  {
    name: "BCNF — every determinant is a key",
    blurb: "Stricter 3NF: no non-key column determines a key column",
    sql: [
      "-- Each instructor teaches exactly ONE course",
      "-- Then instructor → course (non-key determining a key part) violates BCNF",
      "CREATE TABLE instructor_course (instructor PK, course);",
      "CREATE TABLE enrollments       (student, instructor REFERENCES instructor_course);",
    ],
    table: {
      name: "instructor_course",
      cols: ["instructor", "course"],
      rows: [r(1, "Prof. Knuth", "Algorithms"), r(2, "Prof. Lamport", "Distributed")],
    },
    steps: [
      st(
        [2, 3],
        "added",
        "BCNF = strict 3NF. Every functional dependency X → Y must have X as a superkey. Practically rare to need beyond 3NF — but useful for integrity.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "4NF — no multi-valued dependencies",
    blurb: "Independent multi-valued facts go in separate tables",
    sql: [
      "-- A teacher has many SUBJECTS and many CLASSROOMS — independently.",
      "-- WRONG: one table (teacher, subject, classroom) → cartesian explosion",
      "CREATE TABLE teacher_subject  (teacher, subject);",
      "CREATE TABLE teacher_classroom(teacher, classroom);",
    ],
    table: {
      name: "teacher_subject",
      cols: ["teacher", "subject"],
      rows: [r(1, "Ada", "Math"), r(2, "Ada", "Physics")],
    },
    steps: [
      st(
        [2, 3],
        "added",
        "If two attributes are INDEPENDENT multi-valued facts about the same key, store them in SEPARATE tables — otherwise every combination is duplicated.",
        {
          noteTone: "violet",
          side: sidePanel("teacher_classroom", ["(Ada, Room 1)", "(Ada, Room 2)"], "violet"),
        },
      ),
    ],
  },
  {
    name: "5NF — join-dependency decomposition",
    blurb: "When a 3-way relationship can't be split into 2-ways without loss",
    sql: [
      "-- Rare: Agent–Brand–Product where ALL three constrain each other",
      "-- 5NF decomposes into the smallest set of join-equivalent tables",
      "CREATE TABLE agent_brand   (agent, brand);",
      "CREATE TABLE brand_product (brand, product);",
      "CREATE TABLE agent_product (agent, product);",
    ],
    table: {
      name: "agent_brand",
      cols: ["agent", "brand"],
      rows: [r(1, "Ada", "Acme"), r(2, "Ada", "BigCo")],
    },
    steps: [
      st(
        [2, 3, 4],
        "added",
        "5NF (PJNF) = decompose until ONLY natural join can reconstruct the data. You'll rarely hit this in production — but it's the theoretical end of the line.",
        { noteTone: "neutral" },
      ),
    ],
  },
  {
    name: "Denormalize — undo, deliberately",
    blurb: "Trade write integrity for read speed when measurements demand it",
    sql: [
      "-- Read path is hot: every order_view JOINs 5 tables",
      "-- Solution: pre-compute customer_name on orders",
      "ALTER TABLE orders ADD COLUMN customer_name TEXT;",
      "-- Maintained by trigger or app-layer write fan-out",
    ],
    table: {
      name: "orders",
      cols: ["id", "customer_id", "customer_name", "total"],
      rows: [r(1, 101, 1, "Ada", 45), r(2, 102, 1, "Ada", 30), r(3, 103, 2, "Linus", 120)],
    },
    steps: [
      st(
        [2, 3],
        "added",
        "Denormalization REPEATS data so reads avoid joins. Cost: every rename triggers fan-out updates. Do this only when an EXPLAIN plan + load test prove the need.",
        { highlightCols: [2], noteTone: "amber" },
      ),
    ],
  },
];
