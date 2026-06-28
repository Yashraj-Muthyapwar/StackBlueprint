// Rich lesson content for SQL Foundations. Each lesson is composed of
// typed sections rendered by src/routes/sql.foundations.$topic.$lesson.tsx.

import clientServerImg from "@/images/client-server-architecture.png";
import relationaldatabaseImg from "@/images/relational_database.png";
import relationalvsnonrelationalImg from "@/images/relational-vs-non-relational.png";
import databasecomponentsImg from "@/images/database-components.png";
import datastoredandreadImg from "@/images/data-stored-and-read-disk.png";

export type Section =
  | { kind: "prose"; heading?: string; body: string[] }
  | { kind: "code"; language: "sql" | "text"; caption?: string; code: string }
  | { kind: "table"; caption?: string; headers: string[]; rows: string[][] }
  | {
    kind: "callout";
    tone: "info" | "warn" | "success";
    title: string;
    body: string;
  }
  | { kind: "diagram"; ascii: string; caption?: string }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | {
    kind: "animation";
    variant:
    | "pipeline"
    | "select-projection"
    | "table-build"
    | "foreign-key"
    | "null-truth"
    | "type-sizes"
    | "where-filter"
    | "group-by-agg"
    | "join-types"
    | "set-ops"
    | "table-anatomy"
    | "pk-anatomy"
    | "fk-deep"
    | "normalization"
    | "intro-what-is-db"
    | "intro-db-types"
    | "intro-how-db-works"
    | "intro-querying"
    | "intro-storage"
    | "commands-map"
    | "query-structure"
    | "select-distinct"
    | "offset-pagination"
    | "sql-comments"
    | "sql-operators"
    | "q-bool"
    | "q-range"
    | "q-like"
    | "q-null3vl"
    | "q-aggr"
    | "q-grpby"
    | "q-having"
    | "q-cube"
    | "q-venn"
    | "q-self"
    | "q-semianti"
    | "q-algos"
    | "q-scalar"
    | "q-corr"
    | "q-existsin"
    | "q-setops"
    | "intro-sql-client-server";
    caption?: string;
  }
  | { kind: "takeaways"; items: string[] };

export type LessonContent = {
  slug: string;
  title: string;
  subtitle: string;
  sections: Section[];
};

export type FoundationTopicMeta = {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  iconKey: "table" | "database" | "terminal";
  lessons: LessonContent[];
};

// ---------- RELATIONAL MODEL ----------

const tablesAndRows: LessonContent = {
  slug: "tables-and-rows",
  title: "Tables, Rows & Columns",
  subtitle:
    "A relation is just a set of tuples — and that one idea underpins every query you'll write.",
  sections: [
    {
      kind: "prose",
      heading: "The four words you'll use every day",
      body: [
        "A DATABASE is the outermost container — it groups related tables under one name (`app_db`) with shared auth, backups, and transactions. One server can host many databases.",
        "A TABLE is a 2-D grid with a fixed shape: a collection of records that all share the same column layout. Think strongly-typed spreadsheet enforced by the engine.",
        "A COLUMN is a named, typed vertical slice (INTEGER, TEXT, TIMESTAMPTZ, …). Every cell must obey the type. Constraints — NOT NULL, UNIQUE, CHECK, DEFAULT — are enforced on every write.",
        "A ROW (tuple / record) is one horizontal entry — one complete instance of the shape. Rows are the unit you INSERT, UPDATE, DELETE, and read back.",
      ],
    },
    {
      kind: "animation",
      variant: "table-anatomy",
      caption: "Database → Table → Column → Row, one concept at a time",
    },
    {
      kind: "diagram",
      caption: "users — a relation with 3 attributes and 4 tuples",
      ascii: `┌────┬──────────────┬─────────────────────┐
│ id │ email        │ created_at          │
├────┼──────────────┼─────────────────────┤
│  1 │ ada@ex.com   │ 2026-01-04 09:12:00 │
│  2 │ linus@ex.com │ 2026-01-05 14:30:21 │
│  3 │ grace@ex.com │ 2026-02-11 08:00:00 │
│  4 │ alan@ex.com  │ 2026-03-02 19:44:09 │
└────┴──────────────┴─────────────────────┘
        ↑       ↑              ↑
     column  column         column
     (int)   (text)         (timestamptz)`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Creating the relation",
      code: `CREATE TABLE users (
  id           BIGSERIAL PRIMARY KEY,
  email        TEXT      NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO users (email) VALUES
  ('ada@ex.com'), ('linus@ex.com'),
  ('grace@ex.com'), ('alan@ex.com');`,
    },
    {
      kind: "prose",
      heading: "Schema vs instance",
      body: [
        "The schema is the shape: column names, types, and constraints. The instance is the current set of rows. Schemas change rarely (migrations); instances change constantly.",
        "Every row must match the schema exactly — right columns, compatible types, all constraints satisfied. The database refuses any write that doesn't fit. Integrity is enforced at write time, not at query time.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Rows have no guaranteed order",
      body: "SELECT * FROM users may return rows in any order the engine finds convenient. For a specific order, you must use ORDER BY — and always tie-break on a unique column like id.",
    },
    {
      kind: "takeaways",
      items: [
        "A table is a set of rows sharing the same column shape.",
        "Schema defines the shape; instance is the current data.",
        "Row order is never guaranteed without ORDER BY.",
        "Constraints (NOT NULL, UNIQUE, CHECK) enforce integrity at write time.",
      ],
    },
  ],
};

const primaryKeys: LessonContent = {
  slug: "primary-keys",
  title: "Primary Keys",
  subtitle:
    "What makes a key, why every table needs one, and the natural vs surrogate debate.",
  sections: [
    {
      kind: "prose",
      heading: "Identity is everything",
      body: [
        "A primary key uniquely identifies each row. No two rows can share the same PK value, and PK columns can never be NULL. It's how the database — and your application — refers to a specific record over its entire lifetime.",
        "Without a primary key you can't safely UPDATE or DELETE a single row, or join tables without ambiguity. 'Every table has a primary key' is one of the few rules in databases with no real exceptions.",
      ],
    },
    {
      kind: "animation",
      variant: "pk-anatomy",
      caption: "Declare → insert → reject NULL → reject duplicate → composite → surrogate",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Two ways to declare a primary key",
      code: `-- Inline (single-column key)
CREATE TABLE products (
  id    BIGSERIAL PRIMARY KEY,
  sku   TEXT NOT NULL UNIQUE
);

-- Composite (multi-column key)
CREATE TABLE order_items (
  order_id   BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  qty        INT    NOT NULL CHECK (qty > 0),
  PRIMARY KEY (order_id, product_id)
);`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "What goes wrong without a PK",
      body: "A NULL in a PK column raises 'null value violates not-null constraint'. A duplicate raises 'duplicate key value violates unique constraint'. Both errors are good — they catch logic bugs at write time, not after the fact.",
    },
    {
      kind: "table",
      caption: "Natural vs surrogate keys",
      headers: ["", "Natural key", "Surrogate key"],
      rows: [
        ["What is it?", "A real-world value (email, ISBN, SSN)", "An invented value (BIGSERIAL, UUID)"],
        ["Meaning", "Carries business meaning", "Meaningless outside the DB"],
        ["Stability", "Can change (people rename, ISBNs reissue)", "Never changes"],
        ["Size", "Often large (TEXT)", "Small (8 bytes)"],
        ["Best for", "Lookup tables, true unique identifiers", "Almost everything else"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Default to surrogate",
      body: "Use a BIGSERIAL or UUID as the primary key, then add a UNIQUE constraint on the natural key (email, sku, etc.). You get a stable identifier for foreign keys and integrity on the business value.",
    },
    {
      kind: "prose",
      heading: "Composite keys",
      body: [
        "Sometimes identity spans multiple columns — a row in order_items is identified by (order_id, product_id) together. That's a composite primary key.",
        "Composite keys are correct but verbose: every foreign key referencing this table must also be composite. Many teams add a surrogate `id BIGSERIAL PRIMARY KEY` and keep (order_id, product_id) as a UNIQUE constraint — cleaner FKs, same integrity.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Primary key = unique + not null + immutable identity.",
        "NULL in a PK column is rejected; duplicates are rejected.",
        "Prefer a surrogate (BIGSERIAL / UUID) plus a UNIQUE on the natural value.",
        "Composite keys are fine, but they make foreign keys verbose.",
        "Never reuse a deleted primary key value.",
      ],
    },
  ],
};

const foreignKeys: LessonContent = {
  slug: "foreign-keys",
  title: "Foreign Keys & Relationships",
  subtitle:
    "1:1, 1:N, N:M — how to model entity relationships without losing referential integrity.",
  sections: [
    {
      kind: "prose",
      heading: "What a foreign key actually does",
      body: [
        "A foreign key is a column whose value must match a primary key in another table. It's the engine's way of saying 'this order must belong to a customer that actually exists' — any INSERT or UPDATE pointing to a missing parent row is rejected.",
        "FKs also control what happens when the parent is deleted: ON DELETE CASCADE removes children, ON DELETE SET NULL nulls the link, ON DELETE RESTRICT (default) blocks the delete entirely.",
      ],
    },
    {
      kind: "animation",
      variant: "fk-deep",
      caption: "Parent → child → orphan rejection → CASCADE → SET NULL → RESTRICT",
    },
    {
      kind: "code",
      language: "sql",
      caption: "One-to-many: a customer has many orders",
      code: `CREATE TABLE customers (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE orders (
  id          BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL
              REFERENCES customers(id)
              ON DELETE CASCADE,
  total_cents INT    NOT NULL,
  placed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);`,
    },
    {
      kind: "diagram",
      caption: "Cardinality at a glance",
      ascii: `1 : 1     users ────── profiles
          (one user has exactly one profile)

1 : N     customers ──< orders
          (one customer has many orders)

N : M     students >──< courses
              \\        /
               enrollments      (join table)`,
    },
    {
      kind: "prose",
      heading: "Many-to-many needs a join table",
      body: [
        "There is no 'many-to-many foreign key'. Model N:M with a third table — a join, link, or junction table — whose primary key is the composite of the two foreign keys.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "N:M with a join table",
      code: `CREATE TABLE enrollments (
  student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id  BIGINT NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, course_id)
);`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Always index your foreign keys",
      body: "PostgreSQL does NOT auto-index the child side of a FK. Without an index, deleting a parent row scans the entire child table. A 200 ms delete becomes 30 seconds on real data.",
    },
    {
      kind: "takeaways",
      items: [
        "Foreign keys = referential integrity enforced by the engine.",
        "Choose ON DELETE behavior deliberately: CASCADE, SET NULL, or RESTRICT.",
        "N:M is always modeled with a join table whose PK is the composite FK pair.",
        "Always add an index on the child-side foreign key column.",
      ],
    },
  ],
};

const normalization: LessonContent = {
  slug: "normalization",
  title: "Normalization — 1NF → 5NF → Denormalize",
  subtitle: "Walk every normal form against the same table, then see when to undo it.",
  sections: [
    {
      kind: "prose",
      heading: "Why normalize?",
      body: [
        "Normalization means every fact lives in exactly one place. When an address changes, you update one row — not every copy. That's the payoff.",
        "Skipping it creates three classic problems: update anomalies (change one copy, leave others stale), insert anomalies (can't add a course unless a student enrolls), and delete anomalies (delete a student and lose the course).",
      ],
    },
    {
      kind: "animation",
      variant: "normalization",
      caption: "Same data, decomposed step by step: Unnormalized → 1NF → 2NF → 3NF → BCNF → 4NF → 5NF → Denormalize",
    },
    {
      kind: "prose",
      heading: "The forms in plain English",
      body: [
        "1NF — every cell is atomic. No comma-separated lists, no JSON pretending to be a relation. Each row is uniquely identifiable.",
        "2NF — applies when the PK is composite. Every non-key column must depend on the WHOLE key, not just part of it. Split out anything that depends on only one side.",
        "3NF — no transitive dependencies. If column A depends on column B and B is not the key, move A and B into their own table referenced by id.",
        "BCNF — a stricter 3NF: for every functional dependency X → Y, X must be a superkey. Rarely needed beyond 3NF, but it closes some edge cases.",
        "4NF — no multi-valued dependencies. If a key independently determines two multi-valued attributes, put them in separate tables.",
        "5NF (PJNF) — decompose until only a natural join can losslessly rebuild the original. Theoretical bar; rarely applied directly.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A canonical 3NF shape — what most teams ship",
      code: `CREATE TABLE customers (
  id    BIGSERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE orders (
  id          BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id)
);

CREATE TABLE order_items (
  order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  qty        INT    NOT NULL CHECK (qty > 0),
  PRIMARY KEY (order_id, product_id)
);`,
    },
    {
      kind: "callout",
      tone: "success",
      title: "Normalize first, denormalize when measured",
      body: "Start in 3NF. Denormalize only when a measured read pattern can't be satisfied with indexes — and document the reason every time. Premature denormalization is the #1 source of data drift in young codebases.",
    },
    {
      kind: "prose",
      heading: "When (and how) to denormalize",
      body: [
        "Denormalization deliberately repeats data so reads skip expensive joins. Common examples: copy `customer_name` onto `orders` for list views; pre-aggregate daily totals into a `metrics_daily` table; materialize a view.",
        "The cost is consistency — every change to the source must fan out to every copy. Use triggers, app-layer fan-out, or scheduled refreshes, and accept some staleness under load.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "1NF: atomic cells, no lists.",
        "2NF: full dependency on the whole composite key.",
        "3NF: no transitive dependencies between non-key columns.",
        "BCNF / 4NF / 5NF: stricter forms — useful theory, rarely needed past 3NF.",
        "Normalize by default; denormalize with intent and measurement.",
      ],
    },
  ],
};

// ---------- DATA TYPES ----------

const numericText: LessonContent = {
  slug: "numeric-text",
  title: "Numeric & Text Types",
  subtitle: "INT vs BIGINT, NUMERIC precision, VARCHAR vs TEXT — and why the choice matters.",
  sections: [
    {
      kind: "prose",
      heading: "Pick the smallest type that fits",
      body: [
        "Type choice is not cosmetic. It changes storage, index size, and query speed. A 4-byte INT vs an 8-byte BIGINT across a billion-row table is the difference between a 4 GB index and an 8 GB index — the difference between staying in RAM and spilling to disk.",
      ],
    },
    {
      kind: "animation",
      variant: "type-sizes",
      caption: "Storage size grows fast",
    },
    {
      kind: "table",
      caption: "Numeric types (PostgreSQL)",
      headers: ["Type", "Bytes", "Range / precision", "Use for"],
      rows: [
        ["SMALLINT", "2", "±32K", "Tiny counters, enums (rare)"],
        ["INTEGER", "4", "±2.1B", "Counts, IDs in small tables"],
        ["BIGINT", "8", "±9.2 × 10¹⁸", "Primary keys, big counters"],
        ["NUMERIC(p,s)", "var", "Exact decimal", "Money, percentages, anything where rounding is unacceptable"],
        ["REAL / DOUBLE", "4 / 8", "Floating point", "Scientific data — NEVER money"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Money is never FLOAT",
      body: "FLOAT and DOUBLE are binary floating-point — 0.1 + 0.2 ≠ 0.3. Use NUMERIC(12, 2) for currency, or store cents as a BIGINT. Both work; FLOAT does not.",
    },
    {
      kind: "table",
      caption: "Text types",
      headers: ["Type", "What it is", "When to use"],
      rows: [
        ["CHAR(n)", "Fixed-length, blank-padded", "Almost never. Avoid."],
        ["VARCHAR(n)", "Variable, max n chars", "When n is a real business constraint (e.g. country code = 2)"],
        ["TEXT", "Variable, no limit", "Default. In Postgres, identical performance to VARCHAR."],
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Real-world type choices",
      code: `CREATE TABLE invoices (
  id            BIGSERIAL  PRIMARY KEY,
  invoice_no    VARCHAR(20) NOT NULL UNIQUE,
  amount_cents  BIGINT      NOT NULL CHECK (amount_cents >= 0),
  -- or: amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  tax_rate      NUMERIC(5,4) NOT NULL,  -- 0.0825 = 8.25%
  notes         TEXT
);`,
    },
    {
      kind: "takeaways",
      items: [
        "Smaller type → smaller index → faster query.",
        "Money: NUMERIC or BIGINT cents. Never FLOAT.",
        "Default text type in Postgres is TEXT. Use VARCHAR(n) only when n encodes a real rule.",
        "Add CHECK constraints to encode invariants the type alone can't (qty > 0, rate BETWEEN 0 AND 1).",
      ],
    },
  ],
};

const datesTimestamps: LessonContent = {
  slug: "dates-timestamps",
  title: "Dates, Timestamps & Time Zones",
  subtitle:
    "TIMESTAMP vs TIMESTAMPTZ, intervals, and why UTC is the only safe storage choice.",
  sections: [
    {
      kind: "prose",
      heading: "Three temporal types worth knowing",
      body: [
        "DATE stores a calendar date with no time. TIMESTAMP stores date + time with no time zone awareness. TIMESTAMPTZ stores date + time normalized to UTC and displayed in the session's time zone. Almost always you want TIMESTAMPTZ.",
      ],
    },
    {
      kind: "table",
      headers: ["Type", "Stores", "Use for"],
      rows: [
        ["DATE", "YYYY-MM-DD", "Birthdays, holidays, due dates"],
        ["TIMESTAMP", "YYYY-MM-DD HH:MM:SS (no TZ)", "Almost never. Source of bugs."],
        ["TIMESTAMPTZ", "Same, normalized to UTC", "Default. Created_at, updated_at, anything 'happened at'."],
        ["INTERVAL", "A duration (3 days, 2 hours)", "Time arithmetic, ages, retention windows"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "TIMESTAMP (without TZ) silently loses information",
      body: "Inserting '2026-03-09 02:30:00' into a TIMESTAMP column gives the DB no hint whether that's New York time, Tokyo time, or UTC. The next reader can't know. TIMESTAMPTZ always stores the instant in UTC and converts it for the session's zone.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Date arithmetic with INTERVAL",
      code: `-- Users who signed up in the last 7 days
SELECT id, email
FROM   users
WHERE  created_at >= now() - INTERVAL '7 days';

-- Truncate to the start of the day
SELECT date_trunc('day', created_at) AS day,
       count(*)
FROM   events
GROUP  BY day
ORDER  BY day;

-- Render in a specific zone for a report
SELECT created_at AT TIME ZONE 'America/Los_Angeles' AS la_time
FROM   orders;`,
    },
    {
      kind: "prose",
      heading: "The rule that prevents 80% of TZ bugs",
      body: [
        "Store in UTC (TIMESTAMPTZ). Convert at the edge — when rendering to a user or accepting their input. Never store local time and rely on a side channel to remember the zone. That information will be lost or mismatched.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "TIMESTAMPTZ by default; DATE when there's truly no time component.",
        "Avoid plain TIMESTAMP — it loses time-zone information.",
        "Do arithmetic with INTERVAL ('7 days', '1 hour 30 min').",
        "Convert to the user's zone at the render boundary, not in storage.",
      ],
    },
  ],
};

const jsonJsonb: LessonContent = {
  slug: "json-jsonb",
  title: "JSON & JSONB",
  subtitle:
    "When semi-structured columns earn their keep — and when they don't.",
  sections: [
    {
      kind: "prose",
      heading: "JSON vs JSONB",
      body: [
        "JSON stores the document as-is — preserving whitespace, key order, and duplicates. JSONB parses it into a binary tree at write time, discarding formatting but enabling fast lookups and indexing. For 99% of applications, JSONB is the right choice.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Reading and filtering JSONB",
      code: `CREATE TABLE events (
  id        BIGSERIAL PRIMARY KEY,
  payload   JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO events (payload) VALUES
  ('{"type":"signup","plan":"pro","src":"web"}'),
  ('{"type":"signup","plan":"free","src":"ios"}');

-- ->  returns JSON, ->>  returns text
SELECT payload->>'plan'  AS plan,
       count(*)
FROM   events
WHERE  payload->>'type' = 'signup'
GROUP  BY plan;

-- @> is "contains" — and is index-friendly
SELECT * FROM events WHERE payload @> '{"plan":"pro"}';

-- GIN index makes containment queries fast
CREATE INDEX idx_events_payload ON events USING GIN (payload);`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "JSONB is not a schema escape hatch",
      body: "If a field is queried, filtered, joined, or validated — promote it to a real column. JSONB is great for shape-varying metadata (webhook payloads, feature flags, audit blobs). It's bad for fields that 'definitely exist on every row'.",
    },
    {
      kind: "table",
      caption: "When to reach for JSONB",
      headers: ["Use JSONB", "Use real columns"],
      rows: [
        ["Shape varies per row (webhook payloads)", "Every row has the same fields"],
        ["You rarely filter on inner fields", "You filter / sort / join on the field constantly"],
        ["Schema would explode (sparse, optional)", "Schema is stable"],
        ["Read-mostly archival data", "Hot transactional data"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "JSONB > JSON in almost every case (binary, indexable).",
        "Use -> for JSON, ->> for text, @> for containment.",
        "Index with GIN when you query into the blob.",
        "Promote any frequently-queried field to a real column.",
      ],
    },
  ],
};

const nullSemantics: LessonContent = {
  slug: "null-semantics",
  title: "NULL Semantics",
  subtitle:
    "Three-valued logic, NULL propagation, and the comparisons that silently fail.",
  sections: [
    {
      kind: "prose",
      heading: "NULL is not a value — it's 'unknown'",
      body: [
        "NULL means 'we don't know'. It's not zero, not empty string, not false. Almost any operation on NULL returns NULL — including comparisons. This is three-valued logic: results can be TRUE, FALSE, or UNKNOWN.",
      ],
    },
    {
      kind: "animation",
      variant: "null-truth",
      caption: "Three-valued logic, one row at a time",
    },
    {
      kind: "diagram",
      caption: "Truth table — note the UNKNOWN row",
      ascii: `A          B          A = B
─────────  ─────────  ───────────
'x'        'x'        TRUE
'x'        'y'        FALSE
'x'        NULL       NULL  ← not FALSE!
NULL       NULL       NULL  ← not TRUE either!`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "The gotcha and the fix",
      code: `-- WRONG: this never returns any rows.
SELECT * FROM users WHERE deleted_at = NULL;

-- RIGHT: use IS NULL / IS NOT NULL.
SELECT * FROM users WHERE deleted_at IS NULL;

-- COALESCE picks the first non-NULL value
SELECT COALESCE(nickname, full_name, email) AS display_name
FROM   users;

-- NULL propagates through arithmetic too
SELECT 100 + NULL;     -- NULL, not 100
SELECT 'hi' || NULL;   -- NULL, not 'hi'
SELECT count(nickname) FROM users;  -- counts non-NULL only`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "NOT IN (subquery) + NULL = empty result",
      body: "If the subquery returns even one NULL, every row evaluates to UNKNOWN and your query returns zero rows. Use NOT EXISTS or filter NULLs out of the subquery.",
    },
    {
      kind: "prose",
      heading: "Design with NULL deliberately",
      body: [
        "Default columns to NOT NULL. Only allow NULL when 'unknown' is a real, distinct state — not just a synonym for zero or empty. `deleted_at TIMESTAMPTZ` nullable is a good NULL (NULL means 'not deleted'). `login_count INT` nullable is a bad NULL — zero means the same thing without the three-valued mess.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "NULL = unknown; comparisons with NULL return NULL.",
        "Use IS NULL / IS NOT NULL — never = NULL.",
        "COALESCE picks the first non-NULL.",
        "Default columns to NOT NULL; allow NULL only when 'unknown' is meaningful.",
      ],
    },
  ],
};
const dbWhatIs: LessonContent = {
  slug: "what-is-database",
  title: "What is a Database?",
  subtitle: "Data storage, core components, and how databases scale beyond simple spreadsheets.",
  sections: [
    {
      kind: "prose",
      heading: "What is a Database?",
      body: [
        "At its simplest, a database is an organized collection of structured information, or data, stored electronically in a computer system.",
        "Unlike a simple Excel spreadsheet which is great for a single user entering flat data, a database is built to handle massive amounts of data, ensure data integrity, and allow thousands of users or applications to read and write data at the exact same time without crashing or corrupting the files.",
      ],
    },
    {
      kind: "animation",
      variant: "intro-what-is-db",
      caption: "A central database serving many users and applications concurrently",
    },
    {
      kind: "image",
      src: databasecomponentsImg,
      alt: "Database Components",
      caption: "Database Components",
    },
    {
      kind: "prose",
      heading: "The Core Components",
      body: [
        "A database isn't just a single file; it is an ecosystem. The major pieces include:",
        "• **The Data**: The actual raw information being stored (text, numbers, files, dates).",
        "• **The Hardware**: The physical servers, hard drives (SSDs/HDDs), and memory (RAM) where the data lives.",
        "• **The Database Management System (DBMS)**: This is the software engine that acts as the interface between the database and its users or applications. When you want to store or fetch data, you talk to the DBMS. Examples include MySQL, PostgreSQL, and MongoDB.",
        "• **The Query Language**: The specific language used to command the DBMS. The most famous is SQL (Structured Query Language).",
        "• **Database Schema**: The structural blueprint or design of how the data is organized (e.g., tables, columns, relationships).",
      ],
    },
    {
      kind: "prose",
      heading: "The Main Types of Databases",
      body: [
        "Databases generally fall into two major categories based on how they model data: Relational (SQL) and Non-Relational (NoSQL).",
      ],
    },
    {
      kind: "image",
      src: relationalvsnonrelationalImg,
      alt: "Relational vs Non-Relational",
      caption: "Relational vs Non-Relational",
    },
    {
      kind: "table",
      caption: "Relational vs Non-Relational Databases",
      headers: ["Type", "Structure", "Examples", "Best for"],
      rows: [
        ["Relational (SQL)", "Rigid, structured tables (rows & columns) with Strict Schemas and relationships", "PostgreSQL, MySQL, Oracle, SQLite", "High accuracy, complex transactions (banking, e-commerce)"],
        ["Non-Relational (NoSQL)", "Flexible, unstructured data (Documents, Key-Value, Graphs)", "MongoDB, Redis, Neo4j", "Unstructured data, massive scale-out, real-time data"],
      ],
    },
    {
      kind: "animation",
      variant: "intro-db-types",
      caption: "Comparing Relational and Non-Relational structures",
    },
    {
      kind: "takeaways",
      items: [
        "A database is an organized collection of structured data designed for scale and concurrent users.",
        "The DBMS acts as the software engine managing storage and retrieval.",
        "Relational (SQL) databases use rigid tables and schemas, while Non-Relational (NoSQL) databases offer flexible data structures.",
      ],
    },
  ],
};

const dbUnderTheHood: LessonContent = {
  slug: "db-under-the-hood",
  title: "How Databases Work Under the Hood",
  subtitle: "From memory vs disk tradeoffs to how the engine parses, optimizes, and fetches data.",
  sections: [
    {
      kind: "image",
      src: datastoredandreadImg,
      alt: "How Data is Stored",
      caption: "How Data is Stored",
    },
    {
      kind: "prose",
      heading: "How Data is Stored",
      body: [
        "When an application saves data, it doesn't just instantly vanish into a hard drive. It follows a highly optimized path to balance speed and safety.",
        "**RAM (Memory)** is extremely fast but volatile (loses data if the power goes out). **Disk (SSD/HDD)** is slower but persistent.",
        "Because writing directly to a physical disk is slow, databases use a trick called a **Write-Ahead Log (WAL)** or transaction log.",
        "When new data comes in, the DBMS first writes it to a sequential log file on the disk (WAL). Writing sequentially is incredibly fast. Simultaneously, the data is updated in the server's RAM cache so applications can read it instantly.",
        "Later, in the background, a process called *checkpointing* flushes the data from the RAM and permanently organizes it into the main disk storage pages. If the server suddenly loses power, the database reads the WAL upon reboot to recover anything that hadn't made it to the permanent disk yet.",
      ],
    },
    {
      kind: "animation",
      variant: "intro-how-db-works",
      caption: "Memory, Disk, and the Write-Ahead Log in action",
    },
    {
      kind: "prose",
      heading: "How Data is Accessed (The Retrieval Engine)",
      body: [
        "When you ask a database for information (e.g., `SELECT * FROM users WHERE email = 'test@example.com'`), the DBMS triggers a multi-step pipeline:",
      ],
    },
    {
      kind: "diagram",
      ascii: "[Your Query] ──> [Parser] ──> [Optimizer] ──> [Storage Engine] ──> [Data Returned]",
      caption: "The query execution pipeline",
    },
    {
      kind: "prose",
      body: [
        "**1. Parsing and Compilation**\nThe DBMS checks your query syntax to make sure it's valid code, ensures you actually have permission to access that data, and translates it into a machine-readable format.",
        "**2. The Query Optimizer**\nThis is the 'brain' of the database. There are often dozens of different physical ways to find your data. The optimizer analyzes the statistics of your data and calculates the most efficient execution plan (e.g., whether to scan the whole database or use a shortcut).",
      ],
    },
    {
      kind: "animation",
      variant: "intro-querying",
      caption: "Parsing, optimizing, and executing a query",
    },
    {
      kind: "prose",
      heading: "The Power of Indexes",
      body: [
        "If you search for a user in a database with 10 million rows without an Index, the database has to perform a **Full Table Scan**—meaning it reads all 10 million rows one by one. This is incredibly slow.",
        "To fix this, we create indexes on frequently searched columns (like an ID or email). An index is typically structured as a **B-Tree** (Balanced Tree).",
        "Instead of scanning sequentially, a B-Tree allows the database to perform binary-style searches, cutting down the search steps from 10,000,000 operations to just a tiny handful (usually less than 20 disk reads).",
        "Once the storage engine locates the specific block on the disk using the index, it pulls the data into RAM and hands it back to your application.",
      ],
    },
    {
      kind: "animation",
      variant: "intro-storage",
      caption: "Using a B-Tree index to bypass a full table scan",
    },
    {
      kind: "takeaways",
      items: [
        "A Write-Ahead Log (WAL) ensures data durability while keeping writes extremely fast.",
        "Query execution involves a parser for syntax/permissions and an optimizer that plans the fastest retrieval route.",
        "B-Tree indexes drastically reduce disk reads, bypassing slow full table scans.",
      ],
    },
  ],
};

const sqlIntro: LessonContent = {
  slug: "sql-intro",
  title: "SQL Intro & Architecture",
  subtitle: "What is SQL and how do clients connect to a database server?",
  sections: [
    {
      kind: "prose",
      heading: "What is SQL?",
      body: [
        "SQL (Structured Query Language) is the standard language for interacting with relational databases. It allows you to create tables, insert data, and write queries to ask complex questions about your data.",
        "Unlike general-purpose languages like 'Python' or 'JavaScript', **SQL is declarative**. You tell the database *what* you want (e.g., 'give me all active users'), and the database engine figures out *how* to get it efficiently."
      ],
    },
    {
      kind: "prose",
      heading: "Why do we use SQL?",
      body: [
        "• **Universal Standard**: Almost every major database system (*PostgreSQL, MySQL, SQLite, SQL Server*) uses **SQL**.",
        "• **Data Integrity**: It enforces **strict rules** (*schemas*) so your data remains consistent and reliable.",
        "• **Performance**: SQL databases are highly optimized to search through millions of rows in milliseconds."
      ],
    },
    {
      kind: "prose",
      heading: "What is a Relational Database?",
      body: [
        "A relational database organizes data into **tables** (like spreadsheets) which can be linked or related to each other based on common data. For example, linking a '*Customers*' table to an '*Orders*' table using a **Customer ID**."
      ],
    },
    {
      kind: "image",
      src: relationaldatabaseImg,
      alt: "Relational Database",
      caption: "Relational Database",
    },
    {
      kind: "prose",
      heading: "Client-Server Architecture",
      body: [
        "Database servers store and manage databases, while database clients connect to servers and send queries.",
        "Multiple users can connect simultaneously to the same database server through various types of clients including web applications and desktop software.",
      ],
    },
    {
      kind: "image",
      src: clientServerImg,
      alt: "Database Server and Clients",
      caption: "Database Server and Clients",
    },
    {
      kind: "prose",
      heading: "Connection Details",
      body: [
        "To connect to a database, you typically need four pieces of information:",
        "• **Server address**: Where the database lives (*URL* or *IP address*)",
        "• **Username**: Your account name",
        "• **Password**: Your account password",
        "• **Database name**: Which specific database to use",
      ],
    },
    {
      kind: "animation",
      variant: "intro-sql-client-server",
      caption: "Clients connecting to a central database server",
    },
    {
      kind: "takeaways",
      items: [
        "SQL is the standard language for relational databases.",
        "Databases use a Client-Server architecture.",
        "Multiple clients can connect to one server simultaneously.",
        "You need a server address, username, password, and database name to connect.",
      ],
    },
  ],
};

// ---------- SELECT FUNDAMENTALS ----------

const sqlCommands: LessonContent = {
  slug: "sql-commands",
  title: "Types of SQL Commands (DDL, DML, DCL, DQL, TCL)",
  subtitle:
    "Five families every SQL statement belongs to — and why knowing them changes how you think about permissions.",
  sections: [
    {
      kind: "prose",
      heading: "Five families, one language",
      body: [
        "Every SQL statement belongs to one of five families: DDL (structure), DML (data), DQL (reading), DCL (permissions), and TCL (transactions). Each has different safety properties, rollback rules, and — in production — different roles allowed to run it.",
      ],
    },
    {
      kind: "animation",
      variant: "commands-map",
      caption: "The SQL command family tree — DDL · DML · DQL · DCL · TCL",
    },
    {
      kind: "table",
      caption: "The five families at a glance",
      headers: ["Family", "Stands for", "Verbs", "What it changes"],
      rows: [
        ["DDL", "Data Definition Language", "CREATE, ALTER, DROP, TRUNCATE, RENAME", "Schema / structure"],
        ["DML", "Data Manipulation Language", "INSERT, UPDATE, DELETE, MERGE", "Rows in tables"],
        ["DQL", "Data Query Language", "SELECT (+ WITH, FROM, WHERE, …)", "Nothing — read only"],
        ["DCL", "Data Control Language", "GRANT, REVOKE", "Permissions"],
        ["TCL", "Transaction Control Language", "BEGIN, COMMIT, ROLLBACK, SAVEPOINT", "Transaction boundaries"],
      ],
    },
    {
      kind: "prose",
      heading: "DDL — shape of the world",
      body: [
        "DDL changes the schema: creates tables, alters columns, drops indexes. Most engines auto-commit DDL — DROP TABLE is final the instant it returns. PostgreSQL is the rare exception: DDL is transactional, so you can BEGIN, DROP TABLE x, then ROLLBACK and the table is still there.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "DDL — structural changes",
      code: `CREATE TABLE products (
  id    BIGSERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL
);

ALTER TABLE products ADD COLUMN sku TEXT UNIQUE;
ALTER TABLE products DROP COLUMN price;

TRUNCATE products;   -- removes all rows, can't be rolled back in most engines
DROP   TABLE products;`,
    },
    {
      kind: "prose",
      heading: "DML — change the rows",
      body: [
        "DML adds, modifies, or removes rows. Unlike DDL, DML is always transactional — wrap it in a transaction, inspect the effect, and ROLLBACK if wrong. This is the family you spend the most time with in application code.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "DML — moving data",
      code: `INSERT INTO products (name, price) VALUES ('Pen', 2.50);

UPDATE products
SET    price = price * 1.10
WHERE  name = 'Pen';

DELETE FROM products WHERE price > 1000;

-- MERGE (upsert) — INSERT if missing, UPDATE if present
MERGE INTO inventory AS i
USING incoming AS x ON i.sku = x.sku
WHEN MATCHED     THEN UPDATE SET qty = i.qty + x.qty
WHEN NOT MATCHED THEN INSERT (sku, qty) VALUES (x.sku, x.qty);`,
    },
    {
      kind: "prose",
      heading: "DQL — pure reads",
      body: [
        "DQL is SELECT and its supporting cast: WITH, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT. It never changes data. Treating DQL as its own family is useful — read-only access is the safest permission you can grant.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "DQL — pure read, no side effects",
      code: `SELECT name, price
FROM   products
WHERE  price < 10
ORDER  BY price DESC
LIMIT  20;`,
    },
    {
      kind: "prose",
      heading: "DCL — who is allowed to do what",
      body: [
        "DCL controls permissions. In a healthy system, the app connects as a role with narrow DML/DQL privileges; only migrations run as a role with DDL; only humans (and audited tools) run GRANT.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "DCL — granting and revoking",
      code: `GRANT SELECT, INSERT ON products TO app_user;
GRANT ALL  PRIVILEGES   ON SCHEMA public TO migration_role;
REVOKE DELETE ON products FROM app_user;`,
    },
    {
      kind: "prose",
      heading: "TCL — atomic units of work",
      body: [
        "TCL defines transaction boundaries — a group of statements that either all succeed or all fail. SAVEPOINTs are nested checkpoints inside a transaction you can selectively roll back to.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "TCL — transaction control",
      code: `BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  SAVEPOINT after_debit;

  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
  -- something went wrong with the credit:
  ROLLBACK TO SAVEPOINT after_debit;

  UPDATE accounts SET balance = balance + 100 WHERE id = 3;
COMMIT;`,
    },
    {
      kind: "callout",
      tone: "success",
      title: "Why the taxonomy matters",
      body: "Production permissioning maps directly to these families. The app role gets DML+DQL, the migration role gets DDL, and DCL stays with humans. Knowing the family tells you immediately who should be able to run a given statement.",
    },
    {
      kind: "takeaways",
      items: [
        "DDL changes structure (CREATE/ALTER/DROP).",
        "DML changes rows (INSERT/UPDATE/DELETE/MERGE).",
        "DQL reads rows (SELECT).",
        "DCL changes permissions (GRANT/REVOKE).",
        "TCL controls transactions (BEGIN/COMMIT/ROLLBACK/SAVEPOINT).",
      ],
    },
  ],
};

const selectFrom: LessonContent = {
  slug: "select-from",
  title: "SELECT & FROM",
  subtitle:
    "Projecting columns, aliasing, and why `SELECT *` is almost always wrong.",
  sections: [
    {
      kind: "prose",
      heading: "The shape of a SELECT",
      body: [
        "Every SELECT names two things: which columns to project (the SELECT list) and where to read from (the FROM clause). Everything else — WHERE, GROUP BY, ORDER BY — filters, groups, or sorts that result.",
      ],
    },
    {
      kind: "animation",
      variant: "select-projection",
      caption: "SELECT * vs. picking the columns you need",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Projection and aliasing",
      code: `-- Project specific columns with aliases
SELECT u.id              AS user_id,
       u.email,
       u.created_at      AS signed_up_at
FROM   users AS u;

-- Computed columns and expressions
SELECT id,
       upper(email)            AS email_upper,
       length(email)           AS email_len,
       extract(year FROM created_at) AS signup_year
FROM   users;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Avoid SELECT * in application code",
      body: "It's fragile (a new column silently changes your row shape), wasteful (returns columns you didn't need), and slow (covering indexes can't help). Use SELECT * only at the REPL while exploring.",
    },
    {
      kind: "prose",
      heading: "FROM is not just one table",
      body: [
        "FROM can take a base table, a subquery, a CTE, a view, or a JOIN of any of those. Whatever you put after FROM, the engine treats it as a relation — same rules apply.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "FROM a derived table",
      code: `SELECT plan, count(*) AS users
FROM (
  SELECT id, payload->>'plan' AS plan
  FROM   events
  WHERE  payload->>'type' = 'signup'
) AS signups
GROUP BY plan;`,
    },
    {
      kind: "prose",
      heading: "DISTINCT — collapse duplicate rows",
      body: [
        "By default SELECT keeps every input row, even when projected values repeat. Add DISTINCT and the engine deduplicates the projected tuple — every unique combination of selected columns survives exactly once.",
        "DISTINCT applies to the WHOLE projection, not just the first column. `SELECT DISTINCT a, b` gives unique (a, b) pairs, not unique a's. For per-column unique counts, use `COUNT(DISTINCT col)` inside an aggregate.",
      ],
    },
    {
      kind: "animation",
      variant: "select-distinct",
      caption: "DISTINCT dedupes the projected tuple — one column, many columns, and COUNT(DISTINCT)",
    },
    {
      kind: "code",
      language: "sql",
      caption: "DISTINCT in three shapes",
      code: `-- Unique values in one column
SELECT DISTINCT country
FROM   customers;

-- Unique combinations across columns
SELECT DISTINCT country, plan
FROM   customers;

-- Count unique without returning the values
SELECT COUNT(*)                AS rows_seen,
       COUNT(DISTINCT country) AS unique_countries
FROM   customers;`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "DISTINCT is not free",
      body: "Dedupe requires a sort or a hash table over the projected rows. On large result sets, COUNT(DISTINCT col) above ~10 M unique keys can spill to disk — consider HyperLogLog (approx_count_distinct) at that scale.",
    },
    {
      kind: "prose",
      heading: "The structure of a SQL query",
      body: [
        "A full SELECT is built from clauses in a fixed order: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT. Each clause is optional after FROM — but the order never changes.",
        "Think of it as an assembly line. FROM brings in raw rows, WHERE drops failures, GROUP BY collapses survivors into buckets, HAVING filters those buckets, SELECT projects columns the caller sees, ORDER BY sorts them, LIMIT caps the output.",
      ],
    },
    {
      kind: "animation",
      variant: "query-structure",
      caption: "Build a full SELECT one clause at a time, watching rows transform at each station",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Every clause in one query",
      code: `SELECT  customer,
        SUM(total) AS revenue       -- 5. project + alias
FROM    orders                       -- 1. source
WHERE   status = 'paid'              -- 2. row filter
GROUP   BY customer                  -- 3. collapse
HAVING  SUM(total) > 200             -- 4. group filter
ORDER   BY revenue DESC              -- 6. sort
LIMIT   2;                           -- 7. cap`,
    },
    {
      kind: "callout",
      tone: "success",
      title: "The comment numbers are the execution order",
      body: "SELECT is written first but runs at step 5. That's why you can't reference a SELECT-list alias in WHERE — the alias doesn't exist until step 5, and WHERE runs at step 2.",
    },
    {
      kind: "takeaways",
      items: [
        "Name your columns; never SELECT * in production code.",
        "Use AS to alias for clarity (works for both tables and columns).",
        "FROM accepts any relation: table, subquery, CTE, view, JOIN.",
        "DISTINCT dedupes the entire projected row, not a single column.",
        "Clauses run in a fixed logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
      ],
    },
  ],
};

const whereLesson: LessonContent = {
  slug: "where",
  title: "WHERE Filters",
  subtitle: "Predicates, short-circuiting, and sargable vs non-sargable conditions.",
  sections: [
    {
      kind: "prose",
      heading: "WHERE happens before SELECT",
      body: [
        "WHERE filters rows from the FROM relation before aggregation or projection. The predicate runs once per candidate row — a row advances only if it returns TRUE. UNKNOWN (the NULL case) drops the row too.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Operators you'll use every day",
      code: `SELECT * FROM products
WHERE  price BETWEEN 10 AND 50          -- inclusive range
   AND name ILIKE 'pen%'                -- case-insensitive prefix
   AND category_id IN (3, 5, 7)         -- set membership
   AND deleted_at IS NULL               -- NULL check
   AND tags @> ARRAY['featured'];       -- array contains`,
    },
    {
      kind: "prose",
      heading: "Sargable vs non-sargable",
      body: [
        "A predicate is sargable (Search ARGument ABLE) when the engine can use an index. Wrapping a column in a function usually breaks that — the engine must compute the function for every row instead of using the index.",
      ],
    },
    {
      kind: "table",
      headers: ["Non-sargable (bad)", "Sargable (good)"],
      rows: [
        ["WHERE lower(email) = 'x'", "WHERE email = 'X' COLLATE \"C\"  -or-  functional index on lower(email)"],
        ["WHERE date(created_at) = '2026-06-01'", "WHERE created_at >= '2026-06-01' AND created_at < '2026-06-02'"],
        ["WHERE price + 10 > 100", "WHERE price > 90"],
        ["WHERE name LIKE '%pen%'", "WHERE name LIKE 'pen%' (anchored left, can use btree)"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Put selective predicates first",
      body: "Postgres reorders predicates by selectivity, but as a habit put the cheapest and most selective predicate first — it makes EXPLAIN easier to read and intent obvious.",
    },
    {
      kind: "takeaways",
      items: [
        "WHERE runs before SELECT/GROUP BY/ORDER BY.",
        "Don't wrap indexed columns in functions — predicate becomes non-sargable.",
        "Convert date_trunc filters to half-open ranges.",
        "Anchored LIKE 'x%' is index-friendly; '%x%' is not.",
      ],
    },
  ],
};

const orderLimit: LessonContent = {
  slug: "order-limit",
  title: "ORDER BY & LIMIT",
  subtitle: "Deterministic ordering, NULLS FIRST / LAST, and pagination pitfalls.",
  sections: [
    {
      kind: "prose",
      heading: "Order is opt-in",
      body: [
        "Without ORDER BY, row order is undefined and not stable across runs. ORDER BY is the only thing that makes results deterministic. For pagination, that determinism must be bulletproof — always tie-break on a unique column or rows will repeat or vanish between pages.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Ordering with tie-break",
      code: `SELECT id, name, created_at
FROM   products
ORDER  BY created_at DESC, id DESC   -- id breaks ties
LIMIT  20;

-- NULL ordering is explicit in Postgres
SELECT id, deleted_at
FROM   products
ORDER  BY deleted_at DESC NULLS LAST;`,
    },
    {
      kind: "prose",
      heading: "LIMIT and OFFSET — paging through results",
      body: [
        "`LIMIT N` caps output at the first N rows. `OFFSET M` skips the first M rows before LIMIT starts counting — the formula for page P is `OFFSET = (P - 1) × page_size`.",
        "A common interview question: the second-highest salary. Sort DESC, OFFSET 1 to skip the maximum, LIMIT 1 to grab the next. Add DISTINCT if duplicate top salaries would share rank 1.",
      ],
    },
    {
      kind: "animation",
      variant: "offset-pagination",
      caption: "LIMIT / OFFSET in action — pages 1 & 2, the second-highest-salary trick, and why deep OFFSET is slow",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Pagination with OFFSET",
      code: `-- Page 1 (first 20 rows)
SELECT id, name, salary
FROM   employees
ORDER  BY salary DESC, id DESC
LIMIT  20;

-- Page 2 (skip 20, take 20)
SELECT id, name, salary
FROM   employees
ORDER  BY salary DESC, id DESC
LIMIT  20 OFFSET 20;

-- Second highest salary (interview classic)
SELECT DISTINCT salary AS second_highest
FROM   employees
ORDER  BY salary DESC
LIMIT  1 OFFSET 1;`,
    },
    {
      kind: "prose",
      heading: "Why deep OFFSET hurts — keyset to the rescue",
      body: [
        "OFFSET 1000 LIMIT 20 forces the engine to read and discard 1000 rows every request. Cost grows linearly with page number. Keyset (seek) pagination avoids this: remember the last sort key and ask for rows AFTER it — O(1) per page regardless of depth.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keyset pagination — O(1) per page",
      code: `-- First page
SELECT id, created_at, name
FROM   products
ORDER  BY created_at DESC, id DESC
LIMIT  20;

-- Next page: pass the last row's (created_at, id) back in
SELECT id, created_at, name
FROM   products
WHERE  (created_at, id) < ($1, $2)
ORDER  BY created_at DESC, id DESC
LIMIT  20;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "OFFSET is not free",
      body: "OFFSET N reads N rows from disk before discarding them. At page 500 of a 20-per-page list, that's 10,000 wasted reads per request. Switch to keyset pagination whenever a list might grow past a few hundred items.",
    },
    {
      kind: "takeaways",
      items: [
        "No ORDER BY → no guaranteed order.",
        "Always tie-break on a unique column (usually id) before paginating.",
        "Be explicit about NULL placement with NULLS FIRST / NULLS LAST.",
        "OFFSET = (page - 1) × page_size — and `LIMIT 1 OFFSET 1` is the second-highest trick.",
        "Prefer keyset pagination over deep OFFSET — same answer, constant cost.",
      ],
    },
  ],
};

const sqlComments: LessonContent = {
  slug: "sql-comments",
  title: "SQL Comments",
  subtitle:
    "Single-line and multi-line comments — stripped before execution, useful for humans.",
  sections: [
    {
      kind: "prose",
      heading: "What a comment is (and is not)",
      body: [
        "Comments are notes for humans. The database strips them out before the query runs — zero effect on the result, the plan, or performance.",
        "SQL has two flavors: `--` runs to end-of-line; `/* … */` spans any number of lines. Both can appear at the start, end, or inside a statement.",
      ],
    },
    {
      kind: "animation",
      variant: "sql-comments",
      caption: "Watch the parser strip every comment, then run only what remains",
    },
    {
      kind: "prose",
      heading: "Single-line comments — `--`",
      body: [
        "Two dashes start a comment that runs to the end of the line. Code on subsequent lines is parsed normally.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Single-line comment above a statement",
      code: `-- fetch all records from the Students table
SELECT *
FROM   Students;`,
    },
    {
      kind: "prose",
      heading: "Comments on the same line as code",
      body: [
        "Tack `--` onto the end of any line. Everything to the left is still SQL; everything to the right is ignored.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Inline single-line comments",
      code: `SELECT *           -- select all columns
FROM   Students;   -- from the Students table`,
    },
    {
      kind: "prose",
      heading: "Multi-line comments — `/* … */`",
      body: [
        "Wrap any block in `/*` and `*/`. It can span many lines and even sit inside a statement — the parser treats it as whitespace, so `FROM /* note */ Students` is identical to `FROM Students`.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Multi-line comment above a statement",
      code: `/* selecting all records
   from the
   Students table */
SELECT *
FROM   Students;`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Multi-line comment inside a statement",
      code: `SELECT *
FROM   /* table name here */ Students;`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Debugging trick — comment out, don't delete",
      body: "To skip a statement temporarily, wrap it in /* … */ instead of deleting. The text stays in the editor for context, and you can re-enable it by removing two characters.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Disabling a query while you debug",
      code: `/* SELECT *
   FROM Customers; */
-- the statement above is ignored by the DBMS

SELECT *
FROM   Students;`,
    },
    {
      kind: "takeaways",
      items: [
        "`--` runs to end of line; `/* … */` spans any number of lines.",
        "Comments are stripped before execution — no runtime cost, no result change.",
        "Comments may appear at the start, end, or middle of a statement.",
        "Comment out blocks while debugging instead of deleting them.",
      ],
    },
  ],
};

const sqlOperators: LessonContent = {
  slug: "sql-operators",
  title: "SQL Operators",
  subtitle:
    "Arithmetic, comparison, and logical operators — the building blocks of every WHERE and ON clause.",
  sections: [
    {
      kind: "prose",
      heading: "What an operator does",
      body: [
        "Operators are symbols (and a few keywords) that compute a result from one or two values. They appear in SELECT projections, WHERE predicates, JOIN ON conditions, HAVING filters, and CHECK constraints.",
        "SQL groups them into three families: arithmetic (compute numbers), comparison (ask a yes/no question), and logical (combine yes/no answers into bigger ones).",
      ],
    },
    {
      kind: "animation",
      variant: "sql-operators",
      caption: "Tour each family in turn — arithmetic in SELECT, comparison in WHERE, logical to combine",
    },
    {
      kind: "prose",
      heading: "Arithmetic operators (+  -  *  /  %)",
      body: [
        "Arithmetic operators take two numeric inputs and return a number. Use them in SELECT to derive new columns (price after tax, totals) or in WHERE to express formulas.",
      ],
    },
    {
      kind: "table",
      caption: "Arithmetic operators",
      headers: ["Operator", "Meaning", "Example"],
      rows: [
        ["+", "Addition", "amount + 100"],
        ["-", "Subtraction", "amount - 20"],
        ["*", "Multiplication", "amount * 4"],
        ["/", "Division", "amount / 2"],
        ["%", "Modulo (remainder)", "10 % 3 → 1"],
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Arithmetic in a projection",
      code: `-- adds 100 to every amount and exposes it as total_amount
SELECT item, amount, amount + 100 AS total_amount
FROM   Orders;

-- subtracts 20 (a flat discount)
SELECT item, amount, amount - 20  AS offer_price   FROM Orders;

-- multiplies and divides
SELECT item, amount, amount * 4   AS bulk_price    FROM Orders;
SELECT item, amount, amount / 2   AS half_price    FROM Orders;

-- modulo returns the remainder
SELECT 10 % 3 AS result;   -- 1`,
    },
    {
      kind: "prose",
      heading: "Comparison operators (=  <  >  <=  >=  <>)",
      body: [
        "Comparison operators take two values and return TRUE, FALSE, or UNKNOWN (when either side is NULL). They are the building blocks of every WHERE clause.",
      ],
    },
    {
      kind: "table",
      caption: "Comparison operators",
      headers: ["Operator", "Meaning"],
      rows: [
        ["=", "Equal to"],
        ["<", "Less than"],
        [">", "Greater than"],
        ["<=", "Less than or equal to"],
        [">=", "Greater than or equal to"],
        ["<> or !=", "Not equal to"],
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Comparison in WHERE",
      code: `-- equality
SELECT order_id, item, amount FROM Orders WHERE customer_id = 4;

-- strict and inclusive bounds
SELECT order_id, item, amount FROM Orders WHERE amount <  400;
SELECT order_id, item, amount FROM Orders WHERE amount >  400;
SELECT order_id, item, amount FROM Orders WHERE amount <= 400;
SELECT order_id, item, amount FROM Orders WHERE amount >= 400;

-- not equal — both spellings work
SELECT order_id, item, amount FROM Orders WHERE amount != 400;
SELECT order_id, item, amount FROM Orders WHERE amount <> 400;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Beware NULL in a comparison",
      body: "`amount = NULL` is never TRUE — it evaluates to UNKNOWN, so the row is dropped. Use `IS NULL` / `IS NOT NULL` for null tests. (See the NULL Semantics lesson for the full three-valued-logic deep dive.)",
    },
    {
      kind: "prose",
      heading: "Logical operators",
      body: [
        "Logical operators combine comparison results. The core trio is AND, OR, NOT; the broader family includes BETWEEN, IN, LIKE, IS NULL, EXISTS, and the quantifiers ANY / ALL.",
        "Each returns TRUE / FALSE / UNKNOWN and can be combined with the others. The table below is a map so you know which operator to reach for.",
      ],
    },
    {
      kind: "table",
      caption: "Logical operator family",
      headers: ["Operator", "Asks"],
      rows: [
        ["AND", "Are BOTH predicates true?"],
        ["OR", "Is AT LEAST ONE predicate true?"],
        ["NOT", "Flip TRUE↔FALSE (UNKNOWN stays UNKNOWN)"],
        ["BETWEEN a AND b", "Is the value in the inclusive range [a, b]?"],
        ["IN (…)", "Is the value one of this fixed set?"],
        ["LIKE 'pat%'", "Does the string match this wildcard pattern?"],
        ["IS NULL / IS NOT NULL", "Is the value missing?"],
        ["EXISTS (subquery)", "Does the subquery return at least one row?"],
        ["ANY / ALL (subquery)", "Compare value to ANY or ALL of a result set"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Precedence cheat-sheet",
      body: "Arithmetic binds tightest, then comparison, then NOT, then AND, then OR. When in doubt — parenthesise. `WHERE a OR b AND c` means `WHERE a OR (b AND c)`, which is almost never what you wanted.",
    },
    {
      kind: "takeaways",
      items: [
        "Three families: arithmetic (numbers), comparison (yes/no), logical (combine).",
        "Comparison and logical operators return TRUE / FALSE / UNKNOWN.",
        "`= NULL` never works — use `IS NULL`.",
        "AND binds tighter than OR — always parenthesise mixed expressions.",
        "Use `<>` or `!=` for not-equal — same operator, two spellings.",
      ],
    },
  ],
};

const logicalOrder: LessonContent = {
  slug: "logical-order",
  title: "Logical Query Order",
  subtitle:
    "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Internalize this and SQL stops surprising you.",
  sections: [
    {
      kind: "prose",
      heading: "Written order ≠ executed order",
      body: [
        "SQL is written SELECT-first but evaluated FROM-first. Knowing the real order explains every 'why can't I reference my alias here?' question you'll ever have.",
      ],
    },
    {
      kind: "animation",
      variant: "pipeline",
      caption: "Watch a query flow through the 7-step pipeline",
    },
    {
      kind: "diagram",
      caption: "Logical evaluation pipeline",
      ascii: `┌────────────┐
│  1. FROM   │  build the source relation (tables + JOINs)
└─────┬──────┘
      ▼
┌────────────┐
│  2. WHERE  │  row-level filter (no aggregates allowed)
└─────┬──────┘
      ▼
┌────────────┐
│ 3. GROUP BY│  collapse rows into groups
└─────┬──────┘
      ▼
┌────────────┐
│ 4. HAVING  │  group-level filter (aggregates allowed)
└─────┬──────┘
      ▼
┌────────────┐
│ 5. SELECT  │  project columns + compute expressions/aliases
└─────┬──────┘
      ▼
┌────────────┐
│6. ORDER BY │  sort the projected rows (aliases now visible)
└─────┬──────┘
      ▼
┌────────────┐
│ 7. LIMIT   │  take the top N
└────────────┘`,
    },
    {
      kind: "code",
      language: "sql",
      caption: "Putting the order to work",
      code: `SELECT  customer_id,
        count(*)            AS order_count,    -- alias defined in SELECT
        sum(total_cents)    AS revenue_cents
FROM    orders
WHERE   placed_at >= now() - INTERVAL '30 days'    -- runs before GROUP BY
GROUP   BY customer_id                              -- collapse rows
HAVING  count(*) >= 3                               -- filter groups
ORDER   BY revenue_cents DESC                       -- alias visible here
LIMIT   10;`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why aliases work in ORDER BY but not WHERE",
      body: "SELECT runs at step 5. WHERE is step 2 — the alias doesn't exist yet. ORDER BY is step 6 — the alias has been computed. That's the whole rule.",
    },
    {
      kind: "takeaways",
      items: [
        "Evaluation order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
        "WHERE filters rows; HAVING filters groups.",
        "Aggregates are forbidden in WHERE — that's what HAVING is for.",
        "SELECT-list aliases are visible in ORDER BY, not in WHERE/GROUP BY/HAVING.",
      ],
    },
  ],
};

// ---------- TOPIC INDEX ----------

export const FOUNDATION_TOPICS: Record<string, FoundationTopicMeta> = {
  "database-fundamentals": {
    slug: "database-fundamentals",
    title: "Database Fundamentals",
    category: "Foundations",
    iconKey: "terminal",
    blurb:
      "What is SQL, client-server architecture, the five families of SQL commands, keys, and normalization.",
    lessons: [dbWhatIs, dbUnderTheHood, sqlIntro, sqlCommands, primaryKeys, foreignKeys, normalization],
  },
  "data-types": {
    slug: "data-types",
    title: "Data Types & Schemas",
    category: "Foundations",
    iconKey: "database",
    blurb:
      "The right type is half the schema — pick precisely and your queries get faster, smaller, and safer.",
    lessons: [numericText, datesTimestamps, jsonJsonb, nullSemantics],
  },
  "select-fundamentals": {
    slug: "select-fundamentals",
    title: "SELECT Fundamentals",
    category: "Foundations",
    iconKey: "terminal",
    blurb:
      "Every query you'll ever write starts here — and the logical execution order is the key that unlocks the rest.",
    lessons: [selectFrom, sqlComments, sqlOperators, whereLesson, orderLimit, logicalOrder],
  },
};
