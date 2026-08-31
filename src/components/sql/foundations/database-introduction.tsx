import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ---------- INTRO variants ----------

export const introWhatIs: Stage[] = [
  {
    name: "1. The Relational Core",
    blurb: "A database stores information across interconnected tables",
    sql: [
      "-- Real applications don't store everything in one massive file",
      "-- They split data logically and connect it with keys",
      "SELECT users.email, orders.item",
      "FROM users JOIN orders ON users.id = orders.user_id;",
    ],
    table: {
      name: "users & orders (joined)",
      cols: ["id", "email", "order_item", "amount"],
      rows: [
        r(1, 1, "ada@ex.com", "Laptop", 1200),
        r(2, 1, "ada@ex.com", "Mouse", 25),
        r(3, 2, "linus@ex.com", "Keyboard", 150),
      ],
    },
    steps: [
      st(
        [0, 1, 2, 3],
        "kept",
        "A DATABASE structures your data relationally. Instead of flat spreadsheets, you have tables (like 'users' and 'orders') that reference each other, preventing data duplication.",
        {
          side: sidePanel(
            "Key Traits",
            ["• Persistent", "• Structured", "• Relational", "• Highly Scalable"],
            "mint",
          ),
        },
      ),
    ],
  },
  {
    name: "2. The DBMS Engine",
    blurb: "The software sitting between you and the disk",
    sql: [
      "Client  ──SQL──▶  DBMS Engine  ──▶  Disk Storage",
      "",
      "1. Parser: Checks syntax & permissions",
      "2. Planner: Finds the fastest retrieval route",
      "3. Executor: Runs the plan & fetches data",
    ],
    table: {
      name: "Disk Layout (Pages)",
      cols: ["page_id", "tuple_count", "free_space"],
      rows: [r(1, 101, 45, "12%"), r(2, 102, 38, "25%")],
    },
    steps: [
      st(
        [0, 2],
        "kept",
        "The DBMS (like PostgreSQL or MySQL) takes your raw SQL text, parses it, and creates an execution plan. It is the intelligent engine managing the underlying files.",
        { noteTone: "violet", highlightCols: [0] },
      ),
      st(
        [3, 4],
        "kept",
        "Then, the Executor fetches only the necessary data blocks (Pages) from the physical disk, returning the exact answer back to the client.",
        { noteTone: "mint", highlightCols: [1, 2] },
      ),
    ],
  },
  {
    name: "3. Safe Concurrency",
    blurb: "Why not just a spreadsheet?",
    sql: [
      "-- Imagine 50 users buying the same item simultaneously",
      "BEGIN TRANSACTION;",
      "UPDATE inventory SET stock = stock - 1 WHERE id = 42;",
      "COMMIT;",
    ],
    table: {
      name: "inventory (active lock)",
      cols: ["id", "item", "stock"],
      rows: [r(1, 42, "Mechanical Keyboard", 15)],
    },
    steps: [
      st(
        [0],
        "kept",
        "Spreadsheets corrupt or lock entirely if multiple people edit the same cell. Databases use TRANSACTIONS and LOCKS to ensure concurrent edits are safe.",
        { noteTone: "amber" },
      ),
      st(
        [1, 2, 3],
        (row) => (row.cells[2] === 15 ? "kept" : "dropped"),
        "The DBMS guarantees ACID compliance (Atomicity, Consistency, Isolation, Durability) so that partial failures never corrupt your data.",
        { noteTone: "mint", highlightCols: [2] },
      ),
    ],
  },
  {
    name: "4. Ask Questions in SQL",
    blurb: "Declarative power over massive datasets",
    sql: [
      "SELECT email, balance",
      "FROM   users",
      "WHERE  balance > 100",
      "ORDER  BY balance DESC;",
    ],
    table: {
      name: "users",
      cols: ["id", "email", "balance"],
      rows: [r(1, 1, "ada@ex.com", 250), r(2, 2, "linus@ex.com", 90), r(3, 3, "grace@ex.com", 410)],
    },
    steps: [
      st(
        [0, 1],
        "kept",
        "SQL is DECLARATIVE. You describe WHAT data you want, not HOW to get it. The DBMS handles the loops and filtering.",
        { highlightCols: [0, 1] },
      ),
      st(
        [2],
        (row) => (Number(row.cells[2]) > 100 ? "kept" : "dropped"),
        "The engine applies the WHERE filter. Linus (90) is dropped.",
        { highlightCols: [2], noteTone: "rose" },
      ),
      st(
        [3],
        (row) => (Number(row.cells[2]) > 100 ? "kept" : "dropped"),
        "Finally, it orders the remaining rows. The result is returned instantly, even if filtering millions of records.",
        { highlightCols: [2], noteTone: "mint" },
      ),
    ],
  },
];

export const introTypes: Stage[] = [
  {
    name: "Relational (SQL) — the workhorse",
    sql: ["-- PostgreSQL, MySQL, SQL Server, Oracle, SQLite"],
    table: {
      name: "orders",
      cols: ["id", "user_id", "total"],
      rows: [r(1, 11, 1, 45), r(2, 12, 1, 30), r(3, 13, 2, 120)],
    },
    steps: [
      st(
        [0],
        "kept",
        "RELATIONAL: tables + foreign keys + SQL. Strongest integrity guarantees, mature optimisers. Default choice for transactional systems.",
        { side: sidePanel("Strengths", ["• ACID", "• Joins", "• Constraints", "• SQL"], "mint") },
      ),
    ],
  },
  {
    name: "Document — JSON-native",
    sql: ["// MongoDB, CouchDB, DynamoDB (with documents)"],
    table: {
      name: "events",
      cols: ["_id", "payload"],
      rows: [
        r(1, "e1", '{"type":"signup","plan":"pro"}'),
        r(2, "e2", '{"type":"view","page":"/pricing"}'),
      ],
    },
    steps: [
      st(
        [0],
        "kept",
        "DOCUMENT stores: each record is a nested JSON blob. Great for shape-varying data and rapid iteration. Weaker on cross-document joins and integrity.",
        { highlightCols: [1], noteTone: "violet" },
      ),
    ],
  },
  {
    name: "Key-value — O(1) lookup",
    sql: ["// Redis, Memcached, etcd"],
    table: {
      name: "cache",
      cols: ["key", "value"],
      rows: [r(1, "session:abc", "{user:1}"), r(2, "cart:42", "[3,7,9]"), r(3, "rate:ada", "94")],
    },
    steps: [
      st(
        [0],
        "kept",
        "KEY-VALUE: a hashmap, persisted. Single key → single value, microsecond reads. Used for caches, sessions, queues — not primary storage.",
        { highlightCols: [0], noteTone: "violet" },
      ),
    ],
  },
  {
    name: "Graph — relationships are first-class",
    sql: ["// Neo4j, Memgraph; or graph extensions", "// in Postgres / SQL Server"],
    table: {
      name: "edges",
      cols: ["from", "rel", "to"],
      rows: [
        r(1, "Ada", "FOLLOWS", "Linus"),
        r(2, "Linus", "FOLLOWS", "Grace"),
        r(3, "Ada", "LIKES", "Post#7"),
      ],
    },
    steps: [
      st(
        [0],
        "kept",
        "GRAPH: nodes + edges. Traversals (friends-of-friends, fraud rings) are O(degree) instead of N joins. Use when relationships ARE the workload.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "Columnar / OLAP — analytics at scale",
    sql: ["-- ClickHouse, DuckDB, Snowflake, BigQuery, Redshift"],
    table: {
      name: "events_columnar",
      cols: ["day", "country", "revenue"],
      rows: [
        r(1, "2026-06-01", "US", 12000),
        r(2, "2026-06-01", "DE", 4500),
        r(3, "2026-06-02", "US", 13800),
      ],
    },
    steps: [
      st(
        [0],
        "kept",
        "COLUMNAR stores each column contiguously → reading 2 columns from a 100-column table is 50× cheaper. Built for SUM/AVG over billions of rows, not row-level updates.",
        { highlightCols: [2], noteTone: "mint" },
      ),
    ],
  },
];

export const introHow: Stage[] = [
  {
    name: "1 — Client sends SQL",
    sql: ["psql> SELECT * FROM users WHERE id = 2;"],
    table: {
      name: "users",
      cols: ["id", "email"],
      rows: [r(1, 1, "ada@ex.com"), r(2, 2, "linus@ex.com")],
    },
    steps: [
      st(
        [0],
        "pending",
        "Your app opens a TCP connection to the DB. The SQL string travels over the wire as bytes — nothing has executed yet.",
        {
          side: sidePanel(
            "Wire protocol",
            ["• TCP / TLS", "• Auth handshake", "• Send query"],
            "neutral",
          ),
        },
      ),
    ],
  },
  {
    name: "2 — Parser builds an AST",
    sql: [
      "-- 'SELECT * FROM users WHERE id = 2'",
      "-- ↓ tokenize ↓ parse",
      "-- AST: SELECT(*, FROM=users, WHERE=Eq(id,2))",
    ],
    table: {
      name: "users",
      cols: ["id", "email"],
      rows: [r(1, 1, "ada@ex.com"), r(2, 2, "linus@ex.com")],
    },
    steps: [
      st(
        [0, 1, 2],
        "pending",
        "The PARSER turns text into a tree the engine can reason about. Syntax errors die here.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "3 — Planner picks an execution plan",
    sql: [
      "-- Plan A: SeqScan users + filter id=2   (cost 100)",
      "-- Plan B: IndexScan users_pkey on id=2  (cost 1.5)",
      "-- ✓ Choose Plan B",
    ],
    table: {
      name: "users",
      cols: ["id", "email"],
      rows: [r(1, 1, "ada@ex.com"), r(2, 2, "linus@ex.com")],
    },
    steps: [
      st(
        [0, 1, 2],
        "pending",
        "The PLANNER considers strategies (use an index? scan the whole table? join order?) and picks the cheapest based on statistics.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "4 — Executor runs the plan",
    sql: ["-- IndexScan(users_pkey): probe id=2 → page 42, slot 1 → fetch row"],
    table: {
      name: "users",
      cols: ["id", "email"],
      rows: [r(1, 1, "ada@ex.com"), r(2, 2, "linus@ex.com")],
    },
    steps: [
      st(
        [0],
        (row) => (row.cells[0] === 2 ? "kept" : "dropped"),
        "The EXECUTOR walks the chosen plan: read pages from disk (or buffer cache), apply filters, build result rows.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "5 — Result streamed back",
    sql: ["-- 1 row returned → serialised → TCP → client"],
    table: { name: "result", cols: ["id", "email"], rows: [r(1, 2, "linus@ex.com")] },
    steps: [
      st(
        [0],
        "added",
        "Matching rows are formatted in the wire protocol and streamed to the client. Done.",
        { noteTone: "mint" },
      ),
    ],
  },
];

export const introQuerying: Stage[] = [
  {
    name: "Declarative vs imperative",
    sql: [
      "// IMPERATIVE (code):",
      "for (row in users) if (row.balance > 100) print(row);",
      "",
      "-- DECLARATIVE (SQL):",
      "SELECT * FROM users WHERE balance > 100;",
    ],
    table: {
      name: "users",
      cols: ["id", "email", "balance"],
      rows: [r(1, 1, "ada@ex.com", 250), r(2, 2, "linus@ex.com", 90), r(3, 3, "grace@ex.com", 410)],
    },
    steps: [
      st(
        [3, 4],
        pass((row) => Number(row.cells[2]) > 100),
        "You describe WHAT you want; the engine chooses HOW. The same SQL stays correct as data grows from 100 rows to 100 million.",
        { highlightCols: [2], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Filter — narrow the rows",
    sql: ["SELECT * FROM users WHERE balance > 100"],
    table: {
      name: "users",
      cols: ["id", "email", "balance"],
      rows: [r(1, 1, "ada@ex.com", 250), r(2, 2, "linus@ex.com", 90), r(3, 3, "grace@ex.com", 410)],
    },
    steps: [
      st(
        [0],
        pass((row) => Number(row.cells[2]) > 100),
        "WHERE filters row-by-row. Linus (balance=90) fails — dropped.",
        { highlightCols: [2] },
      ),
    ],
  },
  {
    name: "Project — pick the columns",
    sql: ["SELECT email, balance FROM users WHERE balance > 100"],
    table: {
      name: "users",
      cols: ["id", "email", "balance"],
      rows: [r(1, 1, "ada@ex.com", 250), r(3, 3, "grace@ex.com", 410)],
    },
    steps: [
      st([0], "kept", "SELECT names the columns you want. Smaller payload, faster wire transfer.", {
        highlightCols: [1, 2],
      }),
    ],
  },
  {
    name: "Sort & limit",
    sql: [
      "SELECT email, balance FROM users",
      "WHERE  balance > 100",
      "ORDER  BY balance DESC",
      "LIMIT  1",
    ],
    table: { name: "result", cols: ["email", "balance"], rows: [r(1, "grace@ex.com", 410)] },
    steps: [
      st(
        [2, 3],
        "added",
        "ORDER BY orders survivors; LIMIT caps the output. Together: 'top N' in one line.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Aggregate — collapse many rows into a summary",
    sql: ["SELECT COUNT(*), AVG(balance) FROM users"],
    table: { name: "result", cols: ["count", "avg_balance"], rows: [r(1, 3, 250)] },
    steps: [
      st(
        [0],
        "added",
        "Aggregates reduce N rows to 1 summary row. GROUP BY does it per category. This is how SQL turns raw events into reports.",
        { noteTone: "violet" },
      ),
    ],
  },
];

export const introStorage: Stage[] = [
  {
    name: "Rows live inside fixed-size PAGES",
    sql: [
      "-- A table = an ordered file of 8 KB pages (Postgres)",
      "-- Each page packs many rows + a small header",
    ],
    table: {
      name: "page 42  (8 KB)",
      cols: ["slot", "row"],
      rows: [
        r(1, "#1", "(1, ada@ex.com)"),
        r(2, "#2", "(2, linus@ex.com)"),
        r(3, "#3", "(3, grace@ex.com)"),
        r(4, "…", "free space"),
      ],
    },
    steps: [
      st(
        [0, 1],
        "kept",
        "The engine reads ENTIRE pages from disk — never single rows. Smaller rows = more rows/page = fewer page reads.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "Heap files are unordered",
    sql: ["-- New INSERTs go into the next page with free space"],
    table: {
      name: "heap (users)",
      cols: ["page", "row"],
      rows: [
        r(1, "p41", "(2, linus)"),
        r(2, "p41", "(4, alan)"),
        r(3, "p42", "(1, ada)"),
        r(4, "p42", "(3, grace)"),
      ],
    },
    steps: [
      st(
        [0],
        "kept",
        "Rows are NOT sorted on disk. To find id=3 with no index, the engine must scan every page — a SEQUENTIAL SCAN.",
        { noteTone: "amber" },
      ),
    ],
  },
  {
    name: "Indexes — a sorted shortcut",
    sql: ["CREATE INDEX idx_users_id ON users(id);  -- B-Tree by default"],
    table: {
      name: "idx_users_id  (B-Tree)",
      cols: ["key", "ptr"],
      rows: [r(1, 1, "p42·s1"), r(2, 2, "p41·s1"), r(3, 3, "p42·s2"), r(4, 4, "p41·s2")],
    },
    steps: [
      st(
        [0],
        "added",
        "A B-Tree index is a SORTED map: key → physical address (page + slot). Lookup becomes O(log n) instead of O(n).",
        { highlightCols: [0], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "Buffer cache + WAL — fast AND durable",
    sql: [
      "-- WRITE path:",
      "-- 1. modify row in shared buffer (RAM)",
      "-- 2. append change to WAL (write-ahead log, sequential on disk)",
      "-- 3. fsync WAL  →  COMMIT returns",
      "-- 4. dirty page flushed to heap later (background)",
    ],
    table: {
      name: "buffer cache",
      cols: ["page", "state"],
      rows: [r(1, "p42", "dirty"), r(2, "p41", "clean"), r(3, "p38", "dirty")],
    },
    steps: [
      st(
        [0, 1, 2, 3, 4],
        "kept",
        "Two tricks: keep hot pages in RAM (buffer cache), and write to a SEQUENTIAL log first so COMMITs return fast even before random heap writes finish. Crash? Replay the WAL.",
        { noteTone: "mint" },
      ),
    ],
  },
];
