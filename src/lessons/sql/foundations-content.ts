// Rich lesson content for SQL Foundations. Each lesson is composed of
// typed sections rendered by src/routes/sql.foundations.$topic.$lesson.tsx.

import clientServerImg from "@/images/sql/foundations/client-server-architecture.png";
import databasecomponentsImg from "@/images/sql/foundations/database-components.png";
import datastoredandreadImg from "@/images/sql/foundations/data-stored-and-read-disk.png";
import normalizationImg from "@/images/sql/foundations/database_normalization.png";
import denormalizationImg from "@/images/sql/foundations/database_denormalization.png";
import sqlCommandsImg from "@/images/sql/foundations/sql-command-families.png";
import filesVsDatabasesImg from "@/images/sql/foundations/files-vs-databases.png";
import databaseVsDbmsImg from "@/images/sql/foundations/database-vs-dbms.png";
import theRelationalModelImg from "@/images/sql/foundations/the-relational-model.png";
import { type QuizQuestion } from "@/components/lesson/Quiz";
import databaseKeysImg from "@/images/sql/foundations/database-keys.png";
import levelsOfAbstractionImg from "@/images/sql/foundations/database-levels.png";
import databaseLandscapeImg from "@/images/sql/foundations/database-landscape.png";
import { sqlQueryingFundamentalsTopic } from "./sql-querying-fundamentals";

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
  | { kind: "analogy"; title: string; text: string }
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
        | "sql-calculations-aliases"
        | "sql-operators"
        | "where-filtering"
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
  | {
      kind: "playground-practice";
      title: string;
      prompt: string;
      tables: string[];
      successCheck: string;
      href: string;
    }
  | { kind: "takeaways"; items: string[] }
  | { kind: "quiz"; questions: QuizQuestion[]; isFinalQuiz?: boolean };

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

// This is saved for latter use - I have just skipped it for later section.
const normalization: LessonContent = {
  slug: "normalization",
  title: "Normalization & Denormalization",
  subtitle: "Walk every normal form against the same table, then see when to undo it.",
  sections: [
    {
      kind: "prose",
      heading: "Why normalize?",
      body: [
        "**Normalization** means every fact lives in **exactly one place**. When an address changes, you update one row instead of every copy. That is the core payoff.",
        "Skipping it creates three classic problems: **update anomalies** (you change one copy but leave others stale), **insert anomalies** (you cannot add a course unless a student enrolls), and **delete anomalies** (if you delete a student, you might accidentally lose the course data).",
      ],
    },
    {
      kind: "image",
      src: normalizationImg,
      alt: "Database Normalization",
      caption: "Step by step: organizing data to remove redundancy",
    },
    {
      kind: "animation",
      variant: "normalization",
      caption:
        "Same data, decomposed step by step: Unnormalized to 1NF, 2NF, 3NF, BCNF, then Denormalize",
    },
    {
      kind: "prose",
      heading: "The forms in plain English",
      body: [
        "**1NF (First Normal Form):** Every cell is **atomic**. No comma-separated lists, and no JSON pretending to be a relation. Each row is uniquely identifiable.",
        "**2NF (Second Normal Form):** Applies when the primary key is composite. Every non-key column must depend on the **WHOLE key**, not just part of it. Split out anything that depends on only one side.",
        "**3NF (Third Normal Form):** No **transitive dependencies**. If column A depends on column B, and B is not the key, move A and B into their own table referenced by an ID.",
        "**BCNF (Boyce-Codd Normal Form):** A slightly stricter version of 3NF. For every functional dependency X determines Y, X must be a **superkey**. This is rarely needed beyond 3NF, but it closes some edge cases.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A canonical 3NF shape: what most teams ship",
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
      kind: "image",
      src: denormalizationImg,
      alt: "Database Denormalization",
      caption: "Combining tables to optimize read performance",
    },
    {
      kind: "callout",
      tone: "success",
      title: "Normalize first, denormalize when measured",
      body: "Start in 3NF. Denormalize only when a measured read pattern cannot be satisfied with indexes, and document the reason every time. Premature denormalization is the leading source of data drift in young codebases.",
    },
    {
      kind: "prose",
      heading: "When and how to denormalize",
      body: [
        "**Denormalization** deliberately repeats data so reads can **skip expensive joins**. Common examples include copying a customer name onto the orders table for list views, pre-aggregating daily totals into a metrics table, or materializing a view.",
        "The cost is **consistency**: every change to the source data must fan out to every copy. You will need to use triggers, application-layer fan-out, or scheduled refreshes, and accept some **staleness** under heavy load.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "**1NF:** Atomic cells, no lists.",
        "**2NF:** Full dependency on the whole composite key.",
        "**3NF:** No transitive dependencies between non-key columns.",
        "**BCNF:** Stricter 3NF to close edge cases.",
        "**Normalize by default;** denormalize with clear intent and measurement.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "norm1",
          question: "[Easy] What is the primary goal of database normalization?",
          options: [
            "To encrypt the data.",
            "To ensure every fact lives in exactly one place, reducing redundancy and anomalies.",
            "To combine all tables into one giant table.",
            "To automatically generate primary keys.",
          ],
          correctIndex: 1,
          explanation:
            "Normalization organizes data to reduce duplication, ensuring that updates, inserts, and deletes affect only one place in the database.",
        },
        {
          id: "norm2",
          question: "[Easy] What is an 'update anomaly'?",
          options: [
            "When the database crashes during an update.",
            "When you update a piece of duplicated data in one row but forget to update it in others, causing inconsistencies.",
            "When you try to insert data without a primary key.",
            "When you delete a row and it cascades to too many children.",
          ],
          correctIndex: 1,
          explanation:
            "Update anomalies occur when redundant data gets out of sync because you didn't update every single copy of it.",
        },
        {
          id: "norm3",
          question: "[Medium] What rule defines First Normal Form (1NF)?",
          options: [
            "No transitive dependencies.",
            "Every column must be an integer.",
            "Every cell is atomic (indivisible) and there are no repeating groups or lists in a single column.",
            "There must be at least three tables in the database.",
          ],
          correctIndex: 2,
          explanation:
            "1NF requires that all data is atomic, meaning you shouldn't store comma-separated lists or JSON arrays where a related table should be.",
        },
        {
          id: "norm4",
          question: "[Medium] When does Second Normal Form (2NF) apply?",
          options: [
            "It applies to every single table.",
            "It only applies when a table has no primary key.",
            "It specifically applies when a table has a composite primary key (a key made of multiple columns).",
            "It only applies to tables holding user passwords.",
          ],
          correctIndex: 2,
          explanation:
            "2NF requires that all non-key columns depend on the entire composite primary key, not just a part of it.",
        },
        {
          id: "norm5",
          question: "[Medium] What defines Third Normal Form (3NF)?",
          options: [
            "Every table must have a foreign key.",
            "No transitive dependencies (if column A depends on B, and B is not the primary key, they should be in a separate table).",
            "All numbers must be floating points.",
            "Every row must have a unique identifier.",
          ],
          correctIndex: 1,
          explanation:
            "3NF removes transitive dependencies. For example, a customer's 'city' depends on their 'zip_code', not directly on the customer's ID, so zip codes and cities should technically be their own table.",
        },
        {
          id: "norm6",
          question: "[Hard] What is Boyce-Codd Normal Form (BCNF)?",
          options: [
            "It is the exact same thing as 1NF.",
            "It is a stricter version of 3NF that handles complex edge cases where multiple overlapping candidate keys exist.",
            "It is a rule for creating indexes.",
            "It dictates how to write JOIN queries.",
          ],
          correctIndex: 1,
          explanation:
            "BCNF strengthens 3NF by stating that for every non-trivial functional dependency X -> Y, X must be a superkey.",
        },
        {
          id: "norm7",
          question: "[Easy] What is Denormalization?",
          options: [
            "Deleting tables from the database.",
            "Deliberately repeating data in multiple places to speed up read queries by avoiding expensive joins.",
            "Scrambling data for security.",
            "Removing primary keys.",
          ],
          correctIndex: 1,
          explanation:
            "Denormalization trades storage space and write complexity for faster read performance by keeping related data together.",
        },
        {
          id: "norm8",
          question: "[Medium] What is the major downside or cost of Denormalization?",
          options: [
            "Read queries become much slower.",
            "You cannot use foreign keys anymore.",
            "Maintaining consistency becomes difficult: every time the source data changes, you have to manually update all the duplicated copies.",
            "It requires you to buy more RAM.",
          ],
          correctIndex: 2,
          explanation:
            "Because data is duplicated, an update requires fanning out the change to multiple places, which introduces the risk of data getting out of sync (anomalies).",
        },
        {
          id: "norm9",
          question: "[Hard] When is the BEST time to denormalize your database?",
          options: [
            "Right at the beginning, before you even write any queries.",
            "Only when a measured read pattern cannot be satisfied with standard indexing, and you have proven it is a bottleneck.",
            "Whenever you have more than 5 tables.",
            "Never. Denormalization is always bad.",
          ],
          correctIndex: 1,
          explanation:
            "Premature denormalization leads to buggy, drift-heavy databases. You should always start normalized (3NF) and only denormalize when metrics prove you have a specific read performance issue.",
        },
        {
          id: "norm10",
          question:
            "[Medium] Which normal form is generally considered the 'sweet spot' that most teams aim for when designing a standard application database?",
          options: ["1NF", "2NF", "3NF", "BCNF"],
          correctIndex: 2,
          explanation:
            "3NF is the standard goal for relational modeling. It eliminates the vast majority of redundancy without overly complicating the schema design.",
        },
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
        [
          "NUMERIC(p,s)",
          "var",
          "Exact decimal",
          "Money, percentages, anything where rounding is unacceptable",
        ],
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
        [
          "VARCHAR(n)",
          "Variable, max n chars",
          "When n is a real business constraint (e.g. country code = 2)",
        ],
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
  subtitle: "TIMESTAMP vs TIMESTAMPTZ, intervals, and why UTC is the only safe storage choice.",
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
        [
          "TIMESTAMPTZ",
          "Same, normalized to UTC",
          "Default. Created_at, updated_at, anything 'happened at'.",
        ],
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
  subtitle: "When semi-structured columns earn their keep — and when they don't.",
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
  subtitle: "Three-valued logic, NULL propagation, and the comparisons that silently fail.",
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
  subtitle: "Understand data, information, and why databases replaced scattered files.",
  sections: [
    {
      kind: "prose",
      heading: "From Files to Databases",
      body: [
        "Imagine a small clinic keeping patient details in paper folders. That works when there are a few patients and one receptionist. But when the clinic becomes a hospital, billing, pharmacy, and labs may each keep their own copy of the same patient record.",
        "If a patient changes their phone number, every copy must be updated. If one team misses the update, the records no longer agree. Early computer systems faced the same problem when every application stored data in its own files.",
        "A database solves this by keeping related data organized in one shared place, so people and applications can safely use the same reliable source of truth.",
      ],
    },
    {
      kind: "image",
      src: filesVsDatabasesImg,
      alt: "Files vs Databases",
      caption: "One database safely serving many users and applications",
    },
    {
      kind: "prose",
      heading: "Data vs Information",
      body: [
        "**Data** is a raw fact, such as `1024`, `2024-11-03`, `$89.50`, or `TX`.",
        "**Information** is data given context and meaning: “Order #1024 was placed on November 3, 2024, totaled $89.50, and shipped to Texas.”",
        "Databases store raw data, then help applications turn it into useful information quickly and accurately. For example, a business can ask, “How much did we sell in Texas last month?” and receive an answer in seconds.",
      ],
    },
    {
      kind: "prose",
      heading: "Why Simple Files Weren't Enough",
      body: [
        "A text file or spreadsheet is useful for small, simple tasks. But as an application grows, separate files create serious problems:",
        "• **Duplicate and inconsistent data:** The same customer may appear in sales, billing, and shipping files. Updating only one copy creates conflicting records.",
        "• **Hard-to-answer questions:** Each new question may require someone to write a custom program to read and combine files.",
        "• **Weak rules and security:** Important rules, such as “every order must belong to a customer,” can be missed. File access is also often too broad.",
        "• **Unsafe simultaneous updates:** If two people update the same record at once, one update can overwrite the other.",
        "• **Partial failures:** During a bank transfer, money should never leave one account without reaching the other. Files alone do not reliably protect multi-step operations from crashes.",
      ],
    },
    {
      kind: "prose",
      heading: "What a Database Does",
      body: [
        "A **database** is an organized collection of related data. It is designed to be shared by multiple users and applications while keeping the data accurate, consistent, and available.",
        "The **Database Management System (DBMS)** is the software that manages the database. It stores data, enforces rules, controls access, handles simultaneous users, and recovers safely from failures. Popular DBMSs include PostgreSQL, MySQL, MongoDB, and SQLite.",
        "A database also keeps a **schema**: the blueprint that describes its structure, such as tables, columns, data types, and relationships.",
      ],
    },
    {
      kind: "prose",
      heading: "The Core Components",
      body: [
        "A database system has a few important parts working together:",
        "• **Data:** The actual facts being stored, such as names, prices, dates, and orders.",
        "• **DBMS:** The software that stores, retrieves, protects, and manages the data. Examples include PostgreSQL, MySQL, MongoDB, and SQLite.",
        "• **Schema:** The blueprint for how data is organized, including tables, columns, data types, and relationships.",
        "• **Query language:** A way to ask the database for data. SQL is the most common example.",
        "• **Hardware or cloud infrastructure:** The servers, storage, and memory where the database runs.",
      ],
    },
    {
      kind: "image",
      src: databasecomponentsImg,
      alt: "Core components of a database system",
      caption: "The main parts of a database system",
    },
    {
      kind: "prose",
      heading: "Asking Questions with SQL",
      body: [
        "With a flat file, finding all customers in Texas could require writing code to open the file, read every line, and manually check each value. With a relational database, you can state what you want:",
      ],
    },
    {
      kind: "code",
      language: "sql",
      code: `SELECT customer_name, email
FROM customers
WHERE state = 'TX';`,
    },
    {
      kind: "prose",
      body: [
        "This is called a **query**. SQL lets you describe *what* data you need, while the database determines the safest and most efficient way to retrieve it.",
      ],
    },
    {
      kind: "animation",
      variant: "intro-what-is-db",
      caption: "One database safely serving many users and applications",
    },
    {
      kind: "table",
      caption: "Flat Files vs Databases",
      headers: ["Concern", "Flat files", "Database system"],
      rows: [
        ["Data copies", "Often duplicated across files", "Shared, centrally managed data"],
        ["New questions", "Usually need custom code", "Use queries such as SQL"],
        ["Business rules", "Repeated across applications", "Defined and enforced centrally"],
        [
          "Multiple users",
          "Updates can conflict or be lost",
          "Concurrent access is managed safely",
        ],
        ["Failures", "Can leave partial or corrupt data", "Transactions help keep data consistent"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Data is raw facts; information is data with context and meaning.",
        "Databases replaced scattered files because files create duplication, inconsistency, weak security, and unsafe concurrent updates.",
        "A database stores organized related data, while a DBMS is the software that manages and protects it.",
        "A schema defines how data is structured, and queries let you ask for the data you need.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "q1",
          question: "What is the main purpose of a database?",
          options: [
            "To store one file on a local computer.",
            "To organize related data so it can be shared and used reliably.",
            "To replace every application with a spreadsheet.",
            "To prevent users from reading data.",
          ],
          correctIndex: 1,
          explanation:
            "Databases organize related data and allow people and applications to use it safely and reliably.",
        },
        {
          id: "q2",
          question: "What is the difference between data and information?",
          options: [
            "They are exactly the same.",
            "Data is raw facts; information is data with context and meaning.",
            "Information is always stored outside a database.",
            "Data can only be numbers.",
          ],
          correctIndex: 1,
          explanation:
            "A raw value such as `TX` is data. Knowing it represents a customer's state is information.",
        },
        {
          id: "q3",
          question:
            "Which problem commonly occurs when multiple departments maintain separate files for the same customer?",
          options: [
            "Data duplication and inconsistency.",
            "Faster querying.",
            "Automatic backups.",
            "Better access control.",
          ],
          correctIndex: 0,
          explanation: "Separate copies can drift apart when one is updated and another is not.",
        },
        {
          id: "q4",
          question: "What does DBMS stand for?",
          options: [
            "Data Backup Management Service",
            "Database Management System",
            "Digital Business Mapping Software",
            "Database Memory Storage",
          ],
          correctIndex: 1,
          explanation:
            "A DBMS is the software that manages storage, access, rules, and safe updates in a database.",
        },
        {
          id: "q5",
          question: "What is a database schema?",
          options: [
            "A database password.",
            "The physical server that stores data.",
            "The blueprint for how data is organized.",
            "A backup copy of a database.",
          ],
          correctIndex: 2,
          explanation:
            "A schema defines the database structure, including tables, columns, data types, and relationships.",
        },
      ],
    },
  ],
};

const dbmsExplained: LessonContent = {
  slug: "what-is-a-dbms",
  title: "What is a DBMS?",
  subtitle: "Learn how database software stores, protects, and retrieves data safely.",
  sections: [
    {
      kind: "prose",
      heading: "The Software Behind a Database",
      body: [
        "In the previous lesson, you learned that a database stores organized data. But applications do not usually manage the raw data files themselves.",
        "Instead, they communicate with a **Database Management System (DBMS)**: software that sits between applications and the stored data.",
      ],
    },
    {
      kind: "analogy",
      title: "Think of a Library",
      text: "The books in storage are the database. The librarian is the DBMS: it finds books, keeps records organized, controls who can borrow them, and makes sure many people can use the library without creating chaos.",
    },
    {
      kind: "prose",
      heading: "Database vs. DBMS",
      body: [
        "A **database** is the organized collection of data: customers, orders, products, payments, and more.",
        "A **DBMS** is the software that manages that data. PostgreSQL, MySQL, SQLite, MongoDB, and SQL Server are examples of DBMS software.",
        "Your application sends requests to the DBMS. The DBMS decides how to safely read or change the underlying data.",
      ],
    },
    {
      kind: "image",
      src: databaseVsDbmsImg,
      alt: "Database vs DBMS",
      caption: "Database vs. DBMS: Data is the asset. DBMS is the management system.",
    },
    {
      kind: "prose",
      heading: "What Does a DBMS Do?",
      body: [
        "A DBMS handles the difficult work that every application would otherwise need to build for itself:",
        "• **Stores and retrieves data:** It saves data efficiently and finds it when you need it.",
        "• **Understands structure:** It keeps track of tables, columns, data types, and relationships. This structure is called the schema.",
        "• **Processes queries:** You state what data you want, and the DBMS figures out how to retrieve it.",
        "• **Enforces rules:** It can prevent invalid data, such as an order without a customer or a duplicate email address.",
        "• **Controls access:** It decides who can read, add, change, or delete data.",
        "• **Coordinates multiple users:** It prevents simultaneous updates from overwriting each other.",
        "• **Recovers from failures:** It helps keep committed data safe if a server crashes or an operation fails halfway through.",
      ],
    },
    {
      kind: "prose",
      heading: "Queries: Tell It What You Need",
      body: [
        "One of the DBMS's most important jobs is processing queries. With SQL, you describe the result you want instead of writing the low-level steps to find it.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      code: `SELECT customer_name, email
FROM customers
WHERE state = 'TX';`,
    },
    {
      kind: "prose",
      body: [
        "The DBMS checks that the table and columns exist, chooses an efficient way to find matching rows, and returns the result. You say *what* you need; the DBMS handles *how* to retrieve it.",
      ],
    },
    {
      kind: "prose",
      heading: "Keeping Changes Safe with Transactions",
      body: [
        "Some actions involve several related changes. For example, transferring money means subtracting from one account and adding to another.",
        "A DBMS can treat those changes as a **transaction**: either every step succeeds, or none of the changes are kept. This prevents situations where money leaves one account but never reaches the other.",
        "You will explore transactions, concurrency, and recovery in depth later. For now, remember that the DBMS is responsible for making important changes safe.",
      ],
    },
    {
      kind: "prose",
      heading: "Common DBMS Products",
      body: [
        "You will see different DBMS products in real projects. They have different strengths, but they solve the same core problem: managing data reliably.",
      ],
    },
    {
      kind: "table",
      caption: "Common Database Management Systems",
      headers: ["DBMS", "Common use"],
      rows: [
        ["PostgreSQL", "Feature-rich relational database for applications and analytics"],
        ["MySQL", "Popular relational database for web applications"],
        ["SQLite", "Lightweight database stored in a single application file"],
        ["MongoDB", "Document-based database for flexible data structures"],
        ["Snowflake / BigQuery", "Cloud platforms for large-scale analytics"],
      ],
    },
    {
      kind: "takeaways",
      items: [
        "A database is the data; a DBMS is the software that manages that data.",
        "The DBMS sits between applications and stored data.",
        "It handles queries, structure, rules, security, concurrent users, and recovery.",
        "A transaction helps ensure a group of related changes either all succeed or all fail.",
        "PostgreSQL, MySQL, SQLite, and MongoDB are examples of DBMS products.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "q1",
          question: "What is a DBMS?",
          options: [
            "A collection of raw data files.",
            "Software that manages a database.",
            "A programming language used only for websites.",
            "A type of spreadsheet.",
          ],
          correctIndex: 1,
          explanation:
            "A DBMS is software that stores, retrieves, protects, and manages database data.",
        },
        {
          id: "q2",
          question: "Which task is handled by a DBMS?",
          options: [
            "Designing the visual layout of a website.",
            "Managing simultaneous updates from multiple users.",
            "Writing social-media posts.",
            "Replacing every application server.",
          ],
          correctIndex: 1,
          explanation:
            "A DBMS coordinates concurrent access so users do not accidentally overwrite each other's changes.",
        },
        {
          id: "q3",
          question: "What does a transaction help guarantee?",
          options: [
            "Every query runs instantly.",
            "A group of related changes succeeds or fails together.",
            "Every user can access every table.",
            "All data is stored in one spreadsheet.",
          ],
          correctIndex: 1,
          explanation:
            "Transactions prevent partial updates when an important multi-step operation fails.",
        },
        {
          id: "q4",
          question: "Which is an example of DBMS software?",
          options: ["PostgreSQL", "HTML", "Excel formula", "CSS"],
          correctIndex: 0,
          explanation: "PostgreSQL is a database management system.",
        },
      ],
    },
  ],
};

const relationalModel: LessonContent = {
  slug: "relational-model-basics",
  title: "The Relational Model",
  subtitle:
    "Learn how relational databases organize data into tables, rows, columns, and relationships.",
  sections: [
    {
      kind: "prose",
      heading: "Tables: A Familiar Starting Point",
      body: [
        "A relational database organizes data into **tables**. If you have used a spreadsheet, the basic idea will feel familiar: rows represent individual things, and columns represent facts about those things.",
        "For example, an online store might keep its customers in one table and its orders in another. Each table has one clear purpose.",
        "The **relational model** takes the spreadsheet idea and adds rules that make data easier to query, combine, and trust.",
      ],
    },
    {
      kind: "image",
      src: theRelationalModelImg,
      alt: "The Relational Model",
      caption: "The Relational Model",
    },
    {
      kind: "prose",
      heading: "Tables, Rows, and Columns",
      body: [
        "A table stores related information. In database language, a table is also called a **relation**.",
        "Each **row** represents one record. For example, one customer, product, or order. A row is also called a **tuple**.",
        "Each **column** represents one property of that record, such as a name, email address, price, or date. A column is also called an **attribute**.",
      ],
    },
    {
      kind: "animation",
      variant: "table-anatomy",
      caption: "Database → Table → Column → Row, one concept at a time",
    },
    {
      kind: "table",
      caption: "A customers table",
      headers: ["customer_id", "name", "email", "state"],
      rows: [
        ["101", "Priya Sharma", "priya@example.com", "TX"],
        ["102", "Marcus Lee", "marcus@example.com", "TX"],
        ["103", "Elena Ortiz", "elena@example.com", "OK"],
      ],
    },
    {
      kind: "prose",
      body: [
        "In this example, `customers` is the table, each line is a row, and `customer_id`, `name`, `email`, and `state` are columns.",
        "Each column has an expected type of value. For example, an email column stores text, an order date stores dates, and a price stores numbers. This helps the DBMS reject invalid data.",
      ],
    },
    {
      kind: "prose",
      heading: "One Value per Cell",
      body: [
        "A useful rule in relational databases is that each cell should hold one value. For example, do not put three phone numbers into one `phone_number` cell separated by commas.",
        "Keeping values separate makes data easier to search, sort, update, and validate. If a customer can have several phone numbers, that information usually belongs in a related table.",
      ],
    },
    {
      kind: "prose",
      heading: "How Tables Are Related",
      body: [
        "The word *relational* does not mean that all data lives in one huge table. It means separate tables can be connected through matching values.",
        "For example, an order belongs to a customer. Instead of repeating the customer's name and email on every order, the `orders` table can store that customer's ID.",
      ],
    },
    {
      kind: "table",
      caption: "An orders table connected to customers",
      headers: ["order_id", "customer_id", "order_date", "total"],
      rows: [
        ["5001", "101", "2026-07-15", "$89.50"],
        ["5002", "101", "2026-07-16", "$24.00"],
        ["5003", "102", "2026-07-16", "$120.00"],
      ],
    },
    {
      kind: "prose",
      body: [
        "The value `101` appears in both tables. It tells the database that orders `5001` and `5002` belong to Priya Sharma.",
        "This approach reduces repeated data and lets you combine information whenever you need it. You will learn the formal names for these identifiers—primary keys and foreign keys—in the next lesson.",
      ],
    },
    {
      kind: "prose",
      heading: "Structure vs. Data",
      body: [
        "A table's **schema** is its blueprint: the table name, column names, data types, and rules. The schema changes occasionally.",
        "The actual rows currently stored in the table are the table's **data**. They change every time someone adds, updates, or removes a record.",
        "Think of the schema as the layout of a form, and the rows as the completed forms collected over time.",
      ],
    },
    {
      kind: "prose",
      heading: "Why the Relational Model Matters",
      body: [
        "By storing structured data in separate but connected tables, relational databases make it possible to keep data consistent, avoid unnecessary duplication, and answer questions across many kinds of records.",
        "For example, a business can connect customers, orders, products, and payments to answer questions such as: “Which customers in Texas placed an order this month?”",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "A relational database organizes data into tables, also called relations.",
        "Rows represent individual records; columns represent properties of those records.",
        "Each column has an expected type of value, such as text, number, or date.",
        "Tables connect through shared values, such as a customer ID stored on an order.",
        "A schema is the structure of a table; the rows are its current data.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "q1",
          question: "In a relational database, what does a row usually represent?",
          options: [
            "One individual record, such as a customer or order.",
            "The name of the database.",
            "A type of query.",
            "A connection between servers.",
          ],
          correctIndex: 0,
          explanation: "A row stores one record, such as one customer, product, or order.",
        },
        {
          id: "q2",
          question: "What is another name for a table in the relational model?",
          options: ["Relation", "Transaction", "Index", "Query"],
          correctIndex: 0,
          explanation: "The formal relational-model term for a table is a relation.",
        },
        {
          id: "q3",
          question: "Why might an orders table store a customer_id?",
          options: [
            "To connect each order to its customer.",
            "To store the customer's full address repeatedly.",
            "To replace the order date.",
            "To make every order identical.",
          ],
          correctIndex: 0,
          explanation:
            "A customer ID lets an order reference its customer without repeating all customer details.",
        },
        {
          id: "q4",
          question: "What is a schema?",
          options: [
            "The current rows in a table.",
            "The blueprint for how data is organized.",
            "A backup of the database.",
            "A user account.",
          ],
          correctIndex: 1,
          explanation:
            "A schema defines the table structure, including its columns, data types, and rules.",
        },
      ],
    },
  ],
};

const levelsOfAbstraction: LessonContent = {
  slug: "levels-of-abstraction",
  title: "Levels of Abstraction",
  subtitle: "Understand the physical, logical, and view levels of a database and why they matter.",
  sections: [
    {
      kind: "prose",
      heading: "One Database, Different Perspectives",
      body: [
        "You can use a car without knowing how its engine works. You steer, brake, and accelerate while the complex machinery stays hidden underneath.",
        "Databases work in a similar way. Different people interact with the same data at different levels of detail. This separation is called **abstraction**.",
        "Abstraction lets developers, analysts, and end users work with useful data without needing to understand where every byte is stored on disk.",
      ],
    },
    {
      kind: "image",
      src: levelsOfAbstractionImg,
      alt: "The three levels of database abstraction",
      caption: "The three levels of database abstraction",
    },
    {
      kind: "prose",
      heading: "The Three Levels",
      body: [
        "A database can be understood at three levels: the physical level, the logical level, and the view level.",
      ],
    },
    {
      kind: "table",
      caption: "The three levels of database abstraction",
      headers: ["Level", "Main question", "Example"],
      rows: [
        [
          "View level",
          "What should this person see?",
          "A support agent sees a customer's name and order history.",
        ],
        [
          "Logical level",
          "What data exists and how is it related?",
          "Customers, orders, products, columns, keys, and relationships.",
        ],
        [
          "Physical level",
          "How is the data stored and retrieved?",
          "Files, pages, indexes, memory, and disk storage.",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "The Physical Level",
      body: [
        "The **physical level** is the lowest level. It describes how the DBMS stores and retrieves data behind the scenes.",
        "This includes storage files, memory, disk pages, indexes, compression, and other performance details. Most developers and analysts do not work directly at this level—and usually do not need to.",
        "For example, a DBMS may change where data is stored or add an index to make a query faster. The table you use and the query you write can remain exactly the same.",
      ],
    },
    {
      kind: "prose",
      heading: "The Logical Level",
      body: [
        "The **logical level** describes what data exists in the database and how it is organized.",
        "This is the level you have already started learning: tables, rows, columns, data types, primary keys, foreign keys, and relationships.",
        "For an online store, the logical level might include `customers`, `orders`, and `products` tables, along with the rules that connect them.",
      ],
    },
    {
      kind: "prose",
      heading: "The View Level",
      body: [
        "The **view level** shows only the part of the database that a particular user or application needs.",
        "For example, a customer-support agent may need a customer's name, email, and order history. They should not automatically see payroll data, internal notes, or sensitive payment details.",
        "Views help simplify complex databases and support security by giving people access to the data relevant to their job.",
      ],
    },
    {
      kind: "table",
      caption: "Different users can see different views of the same data",
      headers: ["User", "Useful data", "Data usually hidden"],
      rows: [
        [
          "Customer-support agent",
          "Customer name, email, orders",
          "Employee salaries and internal financial data",
        ],
        ["Warehouse employee", "Products, inventory, shipping details", "Customer payment details"],
        ["Finance analyst", "Orders, payments, revenue", "Unrelated operational details"],
      ],
    },
    {
      kind: "prose",
      heading: "Data Independence",
      body: [
        "The biggest benefit of these levels is **data independence**: changes at one level should have little or no effect on the levels above it.",
        "**Physical data independence** means storage can change without changing applications. For example, a database administrator can add an index to speed up searches without changing the SQL query or website code.",
        "**Logical data independence** means the database structure can change while protecting applications and users from unnecessary disruption. This is harder, but views and careful design can help preserve a stable interface.",
      ],
    },
    {
      kind: "prose",
      heading: "Schema and Data",
      body: [
        "At every level, it helps to distinguish between the **schema** and the **data**.",
        "The schema is the blueprint: table definitions, columns, relationships, or storage design. The data is the current set of records stored using that blueprint.",
        "Adding a new customer is a data change. Adding a new column to the `customers` table is a schema change.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Database abstraction separates storage details from the way people use data.",
        "The physical level describes how data is stored; the logical level describes tables and relationships; the view level shows tailored slices of data.",
        "Views simplify access and can help limit sensitive data to the right people.",
        "Physical data independence lets storage and performance details change without breaking queries or applications.",
        "A schema is the blueprint of a database; data is the current information stored in that blueprint.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "q1",
          question: "Which level describes tables, columns, keys, and relationships?",
          options: ["Physical level", "Logical level", "View level", "Network level"],
          correctIndex: 1,
          explanation: "The logical level describes what data exists and how it is organized.",
        },
        {
          id: "q2",
          question: "Which level is concerned with indexes, files, and disk storage?",
          options: ["Physical level", "Logical level", "View level", "Application level"],
          correctIndex: 0,
          explanation: "The physical level describes how the DBMS stores and retrieves data.",
        },
        {
          id: "q3",
          question: "What is a major purpose of the view level?",
          options: [
            "To show every user all database data.",
            "To show a useful and appropriate slice of data to a user or application.",
            "To replace primary keys.",
            "To store data directly on disk.",
          ],
          correctIndex: 1,
          explanation:
            "Views simplify access and can expose only the data relevant to a user or application.",
        },
        {
          id: "q4",
          question: "What is physical data independence?",
          options: [
            "Changing storage details without changing applications or queries.",
            "Deleting all database files safely.",
            "Allowing users to ignore security rules.",
            "Changing a customer's name without saving it.",
          ],
          correctIndex: 0,
          explanation:
            "For example, adding an index can improve performance without requiring application code changes.",
        },
      ],
    },
  ],
};

const databaseKeys: LessonContent = {
  slug: "keys-in-relational-databases",
  title: "Keys in Relational Databases",
  subtitle:
    "Learn how databases identify records and connect tables without duplicate or orphaned data.",
  sections: [
    {
      kind: "prose",
      heading: "Why Databases Need Keys",
      body: [
        "Imagine two customers named Maria Garcia. They may live in different cities, have different email addresses, and place different orders. A database cannot safely identify people by name alone.",
        "A **key** is one or more columns that help the database identify a row reliably. Keys prevent duplicates, connect related tables, and protect the quality of your data.",
      ],
    },
    {
      kind: "image",
      src: databaseKeysImg,
      alt: "Keys in Relational Databases",
      caption: "Keys in Relational Databases",
    },
    {
      kind: "prose",
      heading: "Primary Keys: A Unique Identity",
      body: [
        "A **primary key** is the official identifier for each row in a table. Every table should have one primary key.",
        "A primary key must be unique, which means no two rows can share the same value. It also cannot be empty, because every row must be identifiable.",
      ],
    },
    {
      kind: "animation",
      variant: "pk-anatomy",
      caption: "Declare, insert, reject NULL, reject duplicate, composite, surrogate",
    },
    {
      kind: "table",
      caption: "Each customer has a unique customer ID",
      headers: ["customer_id", "full_name", "email", "city"],
      rows: [
        ["101", "Maria Garcia", "maria.garcia@example.com", "Austin"],
        ["102", "Maria Garcia", "maria.g@example.com", "Dallas"],
        ["103", "Priya Sharma", "priya@example.com", "Houston"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Both Maria Garcia records have the same name, but their `customer_id` values are different. That is why the customer ID is a much safer primary key than a name.",
      ],
    },
    {
      kind: "prose",
      heading: "Foreign Keys: Connecting Tables",
      body: [
        "A **foreign key** is a column in one table that refers to a row in another table. It creates a relationship between the two tables.",
        "For example, an order belongs to a customer. The `orders` table stores the customer's ID rather than repeating the customer's name, email, and address on every order.",
      ],
    },
    {
      kind: "animation",
      variant: "fk-deep",
      caption: "Foreign Keys in depth",
    },
    {
      kind: "table",
      caption: "Orders connect to customers through customer_id",
      headers: ["order_id", "customer_id", "order_date", "total"],
      rows: [
        ["5001", "101", "2026-07-15", "$89.50"],
        ["5002", "101", "2026-07-16", "$24.00"],
        ["5003", "103", "2026-07-16", "$120.00"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Here, `orders.customer_id` is a foreign key that refers to `customers.customer_id`.",
        "The database can enforce **referential integrity**: an order cannot point to customer `999` if that customer does not exist. This prevents orphaned records and keeps relationships trustworthy.",
      ],
    },
    {
      kind: "prose",
      heading: "One Customer, Many Orders",
      body: [
        "A foreign key does not need to be unique. Customer `101` can appear on many orders because one customer can place many orders.",
        "This is called a **one-to-many relationship**: one customer can have many orders, but each order belongs to one customer.",
      ],
    },
    {
      kind: "prose",
      heading: "Other Types of Keys",
      body: [
        "You will encounter a few more key terms as you design databases:",
        "• **Candidate key:** Any minimal column or group of columns that could uniquely identify a row. A customer ID and a unique email address may both be candidate keys.",
        "• **Alternate key:** A candidate key that was not chosen as the primary key. It should still be protected from duplicates when the business requires uniqueness.",
        "• **Composite key:** A key made from two or more columns. For example, `order_id` and `product_id` together can identify one item on an order.",
      ],
    },
    {
      kind: "table",
      caption: "A composite key in an order_items table",
      headers: ["order_id", "product_id", "quantity"],
      rows: [
        ["5001", "201", "2"],
        ["5001", "305", "1"],
        ["5002", "201", "1"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Neither `order_id` nor `product_id` is unique by itself. But together, they identify one specific product on one specific order.",
      ],
    },
    {
      kind: "prose",
      heading: "Natural Keys and Surrogate Keys",
      body: [
        "A **natural key** is a value that already has real-world meaning, such as an email address, ISBN, or government-issued ID.",
        "A **surrogate key** is an identifier created only for the database, such as `customer_id = 101`. It has no business meaning and usually does not change.",
        "A common design is to use a surrogate key as the primary key while also enforcing uniqueness for important real-world values, such as an email address. This gives the database a stable identifier while still preventing duplicate customer records.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "A primary key uniquely identifies every row in a table.",
        "A foreign key connects one table to another.",
        "Referential integrity prevents records from referring to data that does not exist.",
        "A one-to-many relationship lets one parent record, such as a customer, relate to many child records, such as orders.",
        "Composite keys use multiple columns together, while surrogate keys are database-created identifiers.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "q1",
          question: "What is the main purpose of a primary key?",
          options: [
            "To uniquely identify each row in a table.",
            "To sort every table alphabetically.",
            "To store duplicate records.",
            "To connect directly to a server.",
          ],
          correctIndex: 0,
          explanation: "A primary key gives each row a unique, non-empty identity.",
        },
        {
          id: "q2",
          question: "What does a foreign key do?",
          options: [
            "Encrypts a table.",
            "Connects a row to a related row in another table.",
            "Deletes duplicate columns.",
            "Changes the name of a table.",
          ],
          correctIndex: 1,
          explanation: "A foreign key stores a value that refers to a key in another table.",
        },
        {
          id: "q3",
          question: "Why can customer_id appear many times in an orders table?",
          options: [
            "Every customer must have exactly one order.",
            "Foreign-key values must always be unique.",
            "One customer can place many orders.",
            "Customer IDs are not useful in an orders table.",
          ],
          correctIndex: 2,
          explanation: "Repeated foreign-key values represent a one-to-many relationship.",
        },
        {
          id: "q4",
          question: "What is a composite key?",
          options: [
            "A key that contains two or more columns.",
            "A key used only for passwords.",
            "A duplicate primary key.",
            "A key that cannot identify a row.",
          ],
          correctIndex: 0,
          explanation: "A composite key combines multiple columns to uniquely identify a row.",
        },
      ],
    },
  ],
};

const databaseLandscape: LessonContent = {
  slug: "database-landscape",
  title: "The Database Landscape",
  subtitle: "Understand relational databases, NoSQL models, distributed SQL, and where SQL fits.",
  sections: [
    {
      kind: "prose",
      heading: "One Problem, Different Tools",
      body: [
        "Databases are built for different kinds of work. A system that stores bank transfers has different needs from a system that caches website sessions or analyzes billions of event records.",
        "Relational databases are the general-purpose default for structured, correctness-critical data. NoSQL databases and distributed SQL systems exist to handle particular data shapes, scale requirements, or access patterns.",
        "The right question is not “Which database is best?” It is “Which database fits this problem?”",
      ],
    },
    {
      kind: "image",
      src: databaseLandscapeImg,
      alt: "Database Landscape",
      caption: "The database landscape",
    },
    {
      kind: "prose",
      heading: "Relational Databases",
      body: [
        "A **relational database** stores data in tables made of rows and columns. Tables connect through keys, the schema defines expected structure, and SQL is used to read and change data.",
        "Relational databases are strong when data needs to be accurate, connected, and easy to query in many different ways. They are commonly used for customers, orders, payments, inventory, and business reporting.",
        "Examples include PostgreSQL, MySQL, SQL Server, Oracle Database, and SQLite.",
      ],
    },
    {
      kind: "prose",
      heading: "What Does NoSQL Mean?",
      body: [
        "**NoSQL** usually means “not only SQL.” It is an umbrella term for database systems that use data models other than traditional relational tables.",
        "NoSQL systems often trade some relational features—such as a rigid schema, joins, or certain consistency guarantees—for flexibility, high write throughput, or easier distribution across many machines.",
        "NoSQL does not mean “better than SQL,” and it does not mean SQL is outdated. Many real applications use both relational and NoSQL databases.",
      ],
    },
    {
      kind: "table",
      caption: "The main database families",
      headers: ["Family", "Data model", "Good fit", "Examples"],
      rows: [
        [
          "Relational",
          "Tables, rows, columns, and keys",
          "Orders, payments, inventory, reporting",
          "PostgreSQL, MySQL, SQLite",
        ],
        [
          "Key-value",
          "A key linked to a value",
          "Caching, sessions, rate limits, fast lookups",
          "Redis, DynamoDB",
        ],
        [
          "Document",
          "Flexible JSON-like documents",
          "Catalogs, profiles, content, variable-shaped data",
          "MongoDB, Couchbase",
        ],
        [
          "Wide-column",
          "Large, sparse rows grouped into column families",
          "High-volume events, logs, time-series writes",
          "Cassandra, HBase, Bigtable",
        ],
        [
          "Graph",
          "Nodes and relationships",
          "Fraud detection, recommendations, dependency graphs",
          "Neo4j, Neptune",
        ],
        [
          "Distributed SQL",
          "Relational tables across multiple machines",
          "Global applications needing SQL and strong consistency",
          "Spanner, CockroachDB, YugabyteDB",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "The Four Common NoSQL Models",
      body: [
        "**Key-value stores** are like a very fast dictionary. You provide a key and receive its value. They are ideal for sessions, cached results, and rate limits.",
        "**Document databases** store flexible documents, often JSON. A product catalog may have different fields for books, shoes, and laptops without requiring every item to use identical columns.",
        "**Wide-column databases** are designed for enormous, write-heavy workloads such as logs, sensor readings, and events.",
        "**Graph databases** make relationships central. They are useful when you need to explore paths, such as friends-of-friends, fraud networks, or service dependencies.",
      ],
    },
    {
      kind: "prose",
      heading: "Relational vs. NoSQL: The Trade-Off",
      body: [
        "Relational databases emphasize structure, constraints, transactions, and flexible querying with joins. They help prevent invalid or inconsistent data.",
        "NoSQL systems often give you more flexibility in how data is shaped or distributed. In return, you may need to handle more validation, duplication, or consistency decisions in your application.",
        "Neither approach automatically scales better. The best choice depends on the access patterns, data model, reliability needs, and operational complexity of your application.",
      ],
    },
    {
      kind: "table",
      caption: "A practical comparison",
      headers: ["Question", "Relational database", "NoSQL database"],
      rows: [
        [
          "Do records need a consistent structure?",
          "Usually a strong fit",
          "Useful when records vary widely",
        ],
        [
          "Do you need joins and rich reporting?",
          "Usually a strong fit",
          "Often requires denormalized data or extra work",
        ],
        [
          "Do you need strict transaction guarantees?",
          "Usually a strong fit",
          "Capabilities vary by product and design",
        ],
        [
          "Do you mainly look up data by one key?",
          "Possible, but may be more than you need",
          "Key-value stores can be an excellent fit",
        ],
      ],
    },
    {
      kind: "prose",
      heading: "Where Does SQL Fit?",
      body: [
        "SQL is a query language, not a database type. It began with relational databases, but it is now used across warehouses, analytics engines, lakehouses, and many distributed systems.",
        "That is why SQL is worth learning deeply. The skills transfer to PostgreSQL, BigQuery, Snowflake, Spark SQL, Trino, and many other tools.",
        "Some NoSQL systems also provide SQL-like query languages, but their data models and capabilities may differ from a traditional relational database.",
      ],
    },
    {
      kind: "prose",
      heading: "Distributed SQL, Sometimes Called NewSQL",
      body: [
        "Some modern systems combine relational tables, SQL, and transactions with the ability to distribute data across multiple machines. These are often called **distributed SQL** systems; the older term **NewSQL** is also still used.",
        "They are useful when an application needs relational guarantees but must operate across regions or handle very large scale. They are powerful, but usually more complex than a standard relational database.",
      ],
    },
    {
      kind: "callout",
      tone: "success",
      title: "A realistic architecture can use several databases",
      body: "A shopping application might use PostgreSQL for orders and payments, Redis for cached sessions, a search engine for product search, and a warehouse for analytics. Using more than one database is common when each tool has a clear job.",
    },
    {
      kind: "takeaways",
      items: [
        "Relational databases are the default choice for structured, connected, correctness-critical data.",
        "NoSQL is an umbrella term covering key-value, document, wide-column, and graph databases.",
        "NoSQL systems are useful for particular data shapes and access patterns, not as automatic replacements for relational databases.",
        "SQL is a language, not a database category, and it is used across many modern data platforms.",
        "Distributed SQL, also called NewSQL by some sources, combines relational SQL with multi-machine scale.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "dl1",
          question:
            "Which database family is usually the best starting point for orders, payments, and inventory?",
          options: [
            "Relational database",
            "Graph database",
            "Key-value store only",
            "Wide-column database only",
          ],
          correctIndex: 0,
          explanation:
            "Relational databases are well suited to structured, connected, correctness-critical business data.",
        },
        {
          id: "dl2",
          question: "Which NoSQL model is especially useful for caching and fast lookups by ID?",
          options: ["Graph", "Key-value", "Relational", "Wide-column only"],
          correctIndex: 1,
          explanation: "Key-value stores are optimized for retrieving values through known keys.",
        },
        {
          id: "dl3",
          question: "What is SQL?",
          options: [
            "A query language used by many data systems.",
            "A type of NoSQL database.",
            "A replacement for all databases.",
            "A storage device.",
          ],
          correctIndex: 0,
          explanation:
            "SQL is a language for working with data. It is most closely associated with relational databases but is used much more widely.",
        },
        {
          id: "dl4",
          question: "Which database family focuses on traversing connections between entities?",
          options: ["Document", "Graph", "Key-value", "Wide-column"],
          correctIndex: 1,
          explanation: "Graph databases model entities as nodes and their connections as edges.",
        },
        {
          id: "dl5",
          question: "Which statement best describes relational databases and NoSQL databases?",
          options: [
            "NoSQL always replaces relational databases.",
            "Relational databases are always slower.",
            "Each can be appropriate depending on the data and workload.",
            "SQL can only be used with NoSQL databases.",
          ],
          correctIndex: 2,
          explanation:
            "Database choice depends on the problem, including structure, queries, scale, and reliability needs.",
        },
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
      kind: "prose",
      heading: "How Data is Stored",
      body: [
        "When an application saves data, it doesn't just instantly vanish into a hard drive. It follows a highly optimized path to balance speed and safety.",
      ],
    },
    {
      kind: "image",
      src: datastoredandreadImg,
      alt: "How Data is Stored",
      caption: "How Data is Stored",
    },
    {
      kind: "prose",
      body: [
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

// I want to move this to different section.

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
        "Unlike general-purpose languages like 'Python' or 'JavaScript', **SQL is declarative**. You tell the database *what* you want (e.g., 'give me all active users'), and the database engine figures out *how* to get it efficiently.",
      ],
    },
    {
      kind: "prose",
      heading: "Why do we use SQL?",
      body: [
        "• **Universal Standard**: Almost every major database system (*PostgreSQL, MySQL, SQLite, SQL Server*) uses **SQL**.",
        "• **Data Integrity**: It enforces **strict rules** (*schemas*) so your data remains consistent and reliable.",
        "• **Performance**: SQL databases are highly optimized to search through millions of rows in milliseconds.",
      ],
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
  title: "SQL Command Families",
  subtitle:
    "Learn what SQL statements do: define structure, read and change data, manage access, and protect transactions.",
  sections: [
    {
      kind: "prose",
      heading: "One Language, Different Jobs",
      body: [
        "SQL is one language, but its commands do different kinds of work. Some commands create tables, some read data, some change data, some control permissions, and some make multi-step changes safe.",
        "Knowing the command family helps you understand its impact and how carefully it should be used.",
      ],
    },
    {
      kind: "image",
      src: sqlCommandsImg,
      alt: "The SQL command families",
      caption: "The main families of SQL commands",
    },
    {
      kind: "animation",
      variant: "commands-map",
      caption: "DDL, DML, DQL, DCL, and TCL",
    },
    {
      kind: "prose",
      heading: "SQL Is Declarative",
      body: [
        "SQL is a **declarative** language. You describe *what* data or change you want, and the DBMS works out *how* to perform it.",
        "For example, you can ask for customers in Texas without writing the loops, file reads, or storage logic needed to find them.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "State what you want",
      code: `SELECT full_name, email
FROM customers
WHERE state = 'TX';`,
    },
    {
      kind: "table",
      caption: "The SQL command families",
      headers: ["Family", "Purpose", "Common commands"],
      rows: [
        ["DDL", "Defines or changes database structure", "CREATE, ALTER, DROP, TRUNCATE"],
        ["DML", "Adds, changes, or removes rows", "INSERT, UPDATE, DELETE"],
        ["DQL", "Reads data", "SELECT"],
        ["DCL", "Controls permissions", "GRANT, REVOKE"],
        ["TCL", "Controls transactions", "BEGIN, COMMIT, ROLLBACK, SAVEPOINT"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "A terminology note",
      body: "Some books group SELECT under DML instead of calling it DQL. Treating DQL as its own family is useful for beginners because reading data is very different from changing it.",
    },
    {
      kind: "prose",
      heading: "DDL: Define the Structure",
      body: [
        "**Data Definition Language (DDL)** creates and changes database objects, such as tables, columns, indexes, and views.",
        "DDL changes the schema—the blueprint of the database. In production, schema changes should be reviewed carefully because applications and reports may depend on that structure.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Creating and changing a table",
      code: `CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  price      DECIMAL(10,2) NOT NULL
);

ALTER TABLE products
ADD COLUMN stock_qty INT;

DROP TABLE products;`,
    },
    {
      kind: "prose",
      body: [
        "`DROP` removes an object and its data. `TRUNCATE` removes all rows while keeping the table structure. Their exact transaction behavior varies by database product, so treat both as destructive commands.",
      ],
    },
    {
      kind: "prose",
      heading: "DML and DQL: Work with Data",
      body: [
        "**Data Manipulation Language (DML)** changes rows. You use it to add new records, update existing records, and delete records.",
        "**Data Query Language (DQL)** reads data. The main DQL command is `SELECT`.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Reading and changing product data",
      code: `-- DQL: read rows
SELECT name, price
FROM products
WHERE price < 50;

-- DML: add, change, and remove rows
INSERT INTO products (product_id, name, price)
VALUES (1, 'Notebook', 4.50);

UPDATE products
SET price = 5.00
WHERE product_id = 1;

DELETE FROM products
WHERE product_id = 1;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "A safe habit for UPDATE and DELETE",
      body: "Always check the WHERE clause. Without one, UPDATE or DELETE can affect every row in the table. Before a destructive change, run a SELECT using the same WHERE clause to preview the affected rows.",
    },
    {
      kind: "prose",
      heading: "DCL: Control Access",
      body: [
        "**Data Control Language (DCL)** controls who can read or change database objects.",
        "Permissions should follow the principle of least privilege: each user or application receives only the access needed to do its job.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Granting and removing permissions",
      code: `GRANT SELECT ON products TO analyst_role;

GRANT SELECT, INSERT, UPDATE
ON products TO app_user;

REVOKE DELETE ON products FROM app_user;`,
    },
    {
      kind: "prose",
      heading: "TCL: Keep Related Changes Safe",
      body: [
        "**Transaction Control Language (TCL)** manages transactions. A transaction groups related changes so they succeed together or fail together.",
        "For example, moving money between accounts should never subtract money from one account without adding it to the other.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A safe money transfer",
      code: `BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE account_id = 1;

UPDATE accounts
SET balance = balance + 100
WHERE account_id = 2;

COMMIT;`,
    },
    {
      kind: "prose",
      body: [
        "If an error occurs before `COMMIT`, use `ROLLBACK` to undo the changes made in the transaction. `SAVEPOINT` lets you create a checkpoint inside a longer transaction.",
        "Many database tools use autocommit by default, meaning each statement is committed immediately. Know your tool's behavior before running a destructive command.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "DDL changes database structure with commands such as CREATE, ALTER, DROP, and TRUNCATE.",
        "DML changes rows with INSERT, UPDATE, and DELETE.",
        "DQL reads data with SELECT. Some sources group SELECT under DML.",
        "DCL manages permissions with GRANT and REVOKE.",
        "TCL manages transactions with BEGIN, COMMIT, ROLLBACK, and SAVEPOINT.",
        "Preview destructive changes and use transactions when several changes must succeed together.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "sc1",
          question: "Which command family creates or changes a table's structure?",
          options: ["DML", "DQL", "DDL", "TCL"],
          correctIndex: 2,
          explanation:
            "DDL changes the database schema through commands such as CREATE, ALTER, and DROP.",
        },
        {
          id: "sc2",
          question: "Which command reads data from a table?",
          options: ["SELECT", "INSERT", "GRANT", "COMMIT"],
          correctIndex: 0,
          explanation: "SELECT is used to retrieve data and is commonly classified as DQL.",
        },
        {
          id: "sc3",
          question: "What happens if DELETE is run without a WHERE clause?",
          options: [
            "It deletes every row in the table.",
            "It deletes the table structure.",
            "It automatically creates a backup.",
            "It deletes only the newest row.",
          ],
          correctIndex: 0,
          explanation: "Without WHERE, DELETE applies to all rows in the target table.",
        },
        {
          id: "sc4",
          question: "Which command is used to give a role permission to read a table?",
          options: ["ALTER", "GRANT", "ROLLBACK", "INSERT"],
          correctIndex: 1,
          explanation: "GRANT is a DCL command used to give permissions.",
        },
        {
          id: "sc5",
          question: "What does COMMIT do?",
          options: [
            "Makes a transaction's changes permanent.",
            "Deletes a table.",
            "Removes a user's permissions.",
            "Reads rows from a table.",
          ],
          correctIndex: 0,
          explanation: "COMMIT completes a transaction and makes its changes permanent.",
        },
        {
          id: "sc6",
          question: "Why would you use ROLLBACK?",
          options: [
            "To undo uncommitted changes in a transaction.",
            "To grant a new permission.",
            "To add a new column.",
            "To make a query run faster.",
          ],
          correctIndex: 0,
          explanation:
            "ROLLBACK cancels changes made since the current transaction began, as long as they have not been committed.",
        },
      ],
    },
  ],
};

const fundamentalsQuiz: LessonContent = {
  slug: "fundamentals-quiz",
  title: "Database Fundamentals: Final Quiz",
  subtitle:
    "Test your knowledge of databases, the relational model, SQL command families, and database architecture.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "fq1",
          question:
            "What is a primary drawback of storing structured application data in regular files (like CSVs) instead of a database?",
          options: [
            "Files cannot be opened by humans.",
            "Files do not safely handle multiple users modifying data at the same time (concurrency).",
            "Files take up more disk space than databases.",
            "Files require an internet connection.",
          ],
          correctIndex: 1,
          explanation:
            "Databases (through a DBMS) safely handle concurrency, whereas standard files can easily become corrupted if multiple processes write to them simultaneously.",
        },
        {
          id: "fq2",
          question: "What is the primary role of a Database Management System (DBMS)?",
          options: [
            "To provide a graphical user interface for designing websites.",
            "To act as the software engine that safely stores, retrieves, and protects data.",
            "To generate primary keys automatically without user input.",
            "To replace the server's operating system.",
          ],
          correctIndex: 1,
          explanation:
            "The DBMS is the software (like PostgreSQL or MySQL) that manages the actual database and ensures data is stored and retrieved reliably.",
        },
        {
          id: "fq3",
          question: "In the relational model, how is data primarily organized?",
          options: [
            "Into a hierarchy of folders and files.",
            "Into a series of interconnected graphs and nodes.",
            "Into tables consisting of rows and columns.",
            "Into flexible JSON documents.",
          ],
          correctIndex: 2,
          explanation:
            "The relational model organizes data into tables (relations), where rows represent individual records and columns represent attributes.",
        },
        {
          id: "fq4",
          question: "What is the main purpose of a Primary Key?",
          options: [
            "To encrypt sensitive data in a table.",
            "To establish a connection to another table.",
            "To uniquely and reliably identify each specific row in a table.",
            "To sort the table automatically alphabetically.",
          ],
          correctIndex: 2,
          explanation: "A primary key ensures every row has a unique, non-empty identity.",
        },
        {
          id: "fq5",
          question:
            "Why might a database designer choose a 'surrogate key' (like a database-generated ID) over a 'natural key' (like an email address)?",
          options: [
            "Surrogate keys take up less space than natural keys.",
            "Natural keys have no real-world meaning.",
            "Surrogate keys never change, whereas natural keys (like an email) might change in the real world.",
            "Surrogate keys are required for NoSQL databases.",
          ],
          correctIndex: 2,
          explanation:
            "Surrogate keys provide a stable, unchanging identity. If a user changes their email (a natural key), you won't have to update all related tables.",
        },
        {
          id: "fq6",
          question: "What does a Foreign Key do?",
          options: [
            "It enforces a relationship by referring to a primary key in another table.",
            "It allows external users to access the database.",
            "It uniquely identifies a column in the current table.",
            "It automatically deletes duplicate rows.",
          ],
          correctIndex: 0,
          explanation:
            "A foreign key connects rows across tables and allows the database to enforce referential integrity.",
        },
        {
          id: "fq7",
          question:
            "Which level of database abstraction is responsible for describing exactly how data is stored on disk (e.g., files, pages, and indexes)?",
          options: [
            "The View Level",
            "The Logical Level",
            "The Physical Level",
            "The Schema Level",
          ],
          correctIndex: 2,
          explanation:
            "The physical level handles the lowest-level storage and retrieval details behind the scenes.",
        },
        {
          id: "fq8",
          question: "What is the benefit of 'Physical Data Independence'?",
          options: [
            "It allows users to store unlimited amounts of data.",
            "It allows administrators to change storage details (like adding an index) without rewriting application queries.",
            "It prevents the database server from ever crashing.",
            "It removes the need for primary keys.",
          ],
          correctIndex: 1,
          explanation:
            "Physical data independence means the underlying physical structure can be optimized without breaking the logical or view levels above it.",
        },
        {
          id: "fq9",
          question:
            "Which family of SQL commands is used to modify the structure of the database, such as creating or dropping tables?",
          options: [
            "DML (Data Manipulation Language)",
            "DQL (Data Query Language)",
            "DDL (Data Definition Language)",
            "TCL (Transaction Control Language)",
          ],
          correctIndex: 2,
          explanation: "DDL handles structural, schema-level changes (CREATE, ALTER, DROP).",
        },
        {
          id: "fq10",
          question: "Which SQL command family do INSERT, UPDATE, and DELETE belong to?",
          options: ["DDL", "DML", "DCL", "TCL"],
          correctIndex: 1,
          explanation:
            "DML (Data Manipulation Language) is used to add, change, or remove the actual rows of data.",
        },
        {
          id: "fq11",
          question: "What is the purpose of the COMMIT command in SQL?",
          options: [
            "To grant permissions to a new user.",
            "To permanently save all changes made during the current transaction.",
            "To undo changes made in the current transaction.",
            "To define a new table structure.",
          ],
          correctIndex: 1,
          explanation:
            "COMMIT is a TCL command that finalizes a transaction, making its changes permanent.",
        },
        {
          id: "fq12",
          question:
            "If your application needs to handle very large volumes of flexible, JSON-like data where each record might have different fields, which database model is likely the best fit?",
          options: [
            "Relational Database",
            "Document Database (NoSQL)",
            "Key-Value Store",
            "Graph Database",
          ],
          correctIndex: 1,
          explanation:
            "Document databases are designed to store flexible, variable-shaped data like JSON.",
        },
        {
          id: "fq13",
          question: "What does the term 'NoSQL' generally mean in modern data systems?",
          options: [
            "Databases that have completely eliminated SQL.",
            "Not Only SQL, acting as an umbrella term for non-relational database models.",
            "A specific database product made by a single company.",
            "Databases that cannot handle transactions.",
          ],
          correctIndex: 1,
          explanation:
            "NoSQL means 'not only SQL' and covers families like key-value, document, wide-column, and graph databases.",
        },
        {
          id: "fq14",
          question: "Why do databases use a Write-Ahead Log (WAL)?",
          options: [
            "To keep track of which users are currently logged in.",
            "To safely and quickly record changes sequentially on disk before writing them to the main data files, ensuring no data is lost in a crash.",
            "To store passwords securely.",
            "To translate SQL commands into machine code.",
          ],
          correctIndex: 1,
          explanation:
            "The WAL provides durability. Sequential writes to the log are very fast, and if the database crashes, it can replay the log to recover data.",
        },
        {
          id: "fq15",
          question: "How does a database satisfy the 'Durability' guarantee of ACID?",
          options: [
            "By ensuring no two transactions conflict.",
            "By caching all data in RAM so it can be read instantly.",
            "By writing committed changes to permanent storage (like SSD or HDD), so they survive power losses.",
            "By enforcing foreign key relationships.",
          ],
          correctIndex: 2,
          explanation:
            "Durability guarantees that once a transaction is committed, it will remain in the system even in the event of a crash or power loss.",
        },
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
    lessons: [
      dbWhatIs,
      dbmsExplained,
      relationalModel,
      databaseKeys,
      levelsOfAbstraction,
      sqlCommands,
      databaseLandscape,
      dbUnderTheHood,
      fundamentalsQuiz,
    ],
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
  "sql-querying-fundamentals": sqlQueryingFundamentalsTopic,
};
