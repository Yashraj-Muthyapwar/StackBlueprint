// Rich lesson content for SQL Foundations. Each lesson is composed of
// typed sections rendered by src/routes/sql.foundations.$topic.$lesson.tsx.

import clientServerImg from "@/images/sql/foundations/client-server-architecture.png";
import relationaldatabaseImg from "@/images/sql/foundations/relational_database.png";
import relationalvsnonrelationalImg from "@/images/sql/foundations/relational-vs-non-relational.png";
import databasecomponentsImg from "@/images/sql/foundations/database-components.png";
import datastoredandreadImg from "@/images/sql/foundations/data-stored-and-read-disk.png";
import primaryKeysImg from "@/images/sql/foundations/primary_keys.png";
import foreignKeysImg from "@/images/sql/foundations/foreign_keys_relationships.png";
import normalizationImg from "@/images/sql/foundations/database_normalization.png";
import denormalizationImg from "@/images/sql/foundations/database_denormalization.png";
import sqlCommandsImg from "@/images/sql/foundations/sql-command-families.png";
import filesVsDatabasesImg from "@/images/sql/foundations/files-vs-databases.png";
import databaseVsDbmsImg from "@/images/sql/foundations/database-vs-dbms.png";
import theRelationalModelImg from "@/images/sql/foundations/the-relational-model.png";
import { type QuizQuestion } from "@/components/lesson/Quiz";
import databaseKeysImg from "@/images/sql/foundations/database-keys.png";
import levelsOfAbstractionImg from "@/images/sql/foundations/database-levels.png";

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
  | { kind: "takeaways"; items: string[] }
  | { kind: "quiz"; questions: QuizQuestion[] };

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
      heading: "Identity is Everything",
      body: [
        "A **primary key** uniquely identifies each row in a table. No two rows can share the same primary key value, and primary key columns **can never be NULL**. This is how the database and your application refer to a specific record over its entire lifetime.",
        "Without a primary key, you cannot safely update or delete a single row, or join tables without ambiguity. The idea that **every table must have a primary key** is one of the few strict rules in databases with almost no exceptions.",
      ],
    },
    {
      kind: "image",
      src: primaryKeysImg,
      alt: "Primary Keys",
      caption: "Primary keys ensure every row has a unique identity",
    },
    {
      kind: "animation",
      variant: "pk-anatomy",
      caption: "Declare, insert, reject NULL, reject duplicate, composite, surrogate",
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
      title: "What goes wrong without a primary key",
      body: "Trying to insert a NULL into a primary key column raises a not-null constraint error. Trying to insert a duplicate raises a unique constraint error. Both of these errors are actually great features because they catch logic bugs right when you try to save data, instead of causing silent problems later on.",
    },
    {
      kind: "table",
      caption: "Natural vs Surrogate keys",
      headers: ["", "Natural key", "Surrogate key"],
      rows: [
        ["What is it?", "A real-world value (email, ISBN, SSN)", "An invented value (BIGSERIAL, UUID)"],
        ["Meaning", "Carries business meaning", "Meaningless outside the database"],
        ["Stability", "Can change (people change names, ISBNs get reissued)", "Never changes"],
        ["Size", "Often large (TEXT)", "Small (8 bytes)"],
        ["Best for", "Lookup tables, true unique identifiers", "Almost everything else"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Default to surrogate keys",
      body: "Use a simple auto-incrementing number (BIGSERIAL) or a UUID as your primary key, and then add a UNIQUE constraint on the natural key like an email or SKU. This gives you a stable, non-changing identifier for linking tables while keeping your business rules strict.",
    },
    {
      kind: "prose",
      heading: "Composite Keys",
      body: [
        "Sometimes a unique identity requires multiple columns. For example, a row in an order_items table is identified by the **combination** of an order_id and a product_id together. This is called a **composite primary key**.",
        "Composite keys are perfectly valid but can be annoying to type out because every other table that links to this one must also use both columns. Because of this, many teams prefer to just add a simple 'id' surrogate key to the table and keep the multiple columns as a **UNIQUE constraint** instead.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "A **primary key** guarantees that a row is unique, not null, and has an immutable identity.",
        "The database will **automatically reject** NULLs and duplicates in a primary key column.",
        "It is usually best to prefer a **surrogate key** like BIGSERIAL or UUID, plus a UNIQUE constraint on natural values.",
        "**Composite keys** are fine, but they can make linking tables more verbose.",
        "You should **never reuse** a primary key value that has been deleted.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "pk1",
          question: "Which of the following must be true for a primary key?",
          options: [
            "It must be a number.",
            "It must be unique and cannot be NULL.",
            "It must contain a string of at least 8 characters.",
            "It can have duplicate values as long as they are not NULL."
          ],
          correctIndex: 1,
          explanation: "Primary keys are strictly enforced to be both unique and non-null to guarantee a specific row's identity."
        },
        {
          id: "pk2",
          question: "What happens if you try to insert a duplicate primary key value into a table?",
          options: [
            "The database automatically generates a new, unique value.",
            "The old row is overwritten by the new row.",
            "The database throws a unique constraint error and rejects the insert.",
            "The database accepts it but marks it with a warning."
          ],
          correctIndex: 2,
          explanation: "The database will reject any insert that violates the uniqueness of a primary key, preventing data corruption."
        },
        {
          id: "pk3",
          question: "What is a 'surrogate key'?",
          options: [
            "A key made from a real-world value like an email or Social Security Number.",
            "A backup key used only if the primary key fails.",
            "A meaningless, database-generated value (like an auto-incrementing ID or UUID) used purely for identification.",
            "A key that consists of multiple columns."
          ],
          correctIndex: 2,
          explanation: "Surrogate keys have no business meaning and exist solely to give a stable, unchanging identity to a row."
        },
        {
          id: "pk4",
          question: "What is a 'natural key'?",
          options: [
            "A key generated randomly by the database.",
            "An auto-incrementing integer.",
            "A real-world attribute that uniquely identifies a row, like an ISBN or email address.",
            "A key used for connecting to the database."
          ],
          correctIndex: 2,
          explanation: "Natural keys use existing, real-world data (like an email) to identify a row."
        },
        {
          id: "pk5",
          question: "Why might you prefer a surrogate key over a natural key?",
          options: [
            "Natural keys take up less space on disk.",
            "Surrogate keys are faster to type.",
            "Natural keys can sometimes change in the real world (e.g., someone changes their email), which breaks links between tables.",
            "Surrogate keys allow for duplicate values."
          ],
          correctIndex: 2,
          explanation: "If a natural key changes, you have to update every other table that references it. Surrogate keys never change, making relationships stable."
        },
        {
          id: "pk6",
          question: "What is a 'composite key'?",
          options: [
            "A key made out of a mix of numbers and letters.",
            "A primary key that spans across multiple columns (e.g., order_id AND product_id).",
            "A key that is used in more than one database.",
            "A key that is encrypted for security."
          ],
          correctIndex: 1,
          explanation: "A composite key uses two or more columns together to form a unique identity."
        },
        {
          id: "pk7",
          question: "True or False: A table can have multiple primary keys.",
          options: [
            "True",
            "False"
          ],
          correctIndex: 1,
          explanation: "False. A table can only have one primary key (though that one key can be a composite made of multiple columns)."
        },
        {
          id: "pk8",
          question: "What does BIGSERIAL do in PostgreSQL?",
          options: [
            "It creates a massive text field.",
            "It automatically generates an incrementing number for each new row.",
            "It encrypts the column data.",
            "It allows the column to store an array of values."
          ],
          correctIndex: 1,
          explanation: "BIGSERIAL is a convenient way to create an auto-incrementing integer, which is perfect for surrogate primary keys."
        },
        {
          id: "pk9",
          question: "If you decide to use a surrogate ID as your primary key, how should you handle your natural key (like a user's email)?",
          options: [
            "Ignore it and don't store it.",
            "Store it normally, as duplicates don't matter.",
            "Add a UNIQUE constraint to the natural key column to ensure no two users sign up with the same email.",
            "Make it a second primary key."
          ],
          correctIndex: 2,
          explanation: "Adding a UNIQUE constraint to the email gives you the best of both worlds: a stable surrogate primary key, and strict business rules on the natural data."
        },
        {
          id: "pk10",
          question: "Why is it important to never reuse a deleted primary key value?",
          options: [
            "Because the database will crash.",
            "To prevent old, disconnected records (like historical backups or logs) from accidentally linking to the new row.",
            "Because primary keys must always be alphabetical.",
            "Because you are legally required not to."
          ],
          correctIndex: 1,
          explanation: "Reusing an ID can cause catastrophic data mix-ups if old data (like an old invoice in a backup) suddenly points to a brand new customer who happens to get the reused ID."
        }
      ]
    }
  ],
};

const foreignKeys: LessonContent = {
  slug: "foreign-keys",
  title: "Foreign Keys & Relationships",
  subtitle:
    "1:1, 1:N, N:M: how to model entity relationships without losing referential integrity.",
  sections: [
    {
      kind: "prose",
      heading: "What a foreign key actually does",
      body: [
        "A **foreign key** is a column whose value must match a **primary key** in another table. It is the database's way of strictly enforcing that a relationship is valid. For example, any attempt to insert an order pointing to a customer that does not exist will be rejected instantly.",
        "Foreign keys also give you control over what happens when a **parent record is deleted**, ensuring you never end up with **'orphan' records** scattered throughout your database.",
      ],
    },
    {
      kind: "image",
      src: foreignKeysImg,
      alt: "Foreign Keys",
      caption: "Foreign keys enforce strict relationships between tables",
    },
    {
      kind: "animation",
      variant: "fk-deep",
      caption: "Parent to child, orphan rejection, CASCADE, SET NULL, RESTRICT",
    },
    {
      kind: "prose",
      heading: "One-to-One (1:1) Relationships",
      body: [
        "A **one-to-one relationship** means one row in a table is linked to **exactly one row** in another. For example, a user might have exactly one profile.",
        "To enforce this in SQL, you add a foreign key and also apply a **UNIQUE constraint** to it. This guarantees that no two profiles can ever point to the same user.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "1:1 requires a UNIQUE foreign key",
      code: `CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  -- The UNIQUE constraint makes this 1:1 instead of 1:N
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT
);`
    },
    {
      kind: "prose",
      heading: "One-to-Many (1:N) Relationships",
      body: [
        "This is the **most common relationship**. One customer can place many orders, but each order belongs to **exactly one customer**.",
        "To create a **1:N relationship**, you simply place a foreign key on the 'many' side (the orders table) pointing to the 'one' side (the customers table), **without a UNIQUE constraint**.",
      ],
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

-- ALWAYS index the child side of a foreign key!
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
      heading: "Many-to-many (N:M) needs a join table",
      body: [
        "There is no such thing as a **many-to-many foreign key column**. To model an **N:M relationship** (like students and courses), you must create a third table, usually called a **join or link table**.",
        "The primary key of this join table is simply the **combination of the two foreign keys** it connects. This ensures a student cannot enroll in the exact same course twice.",
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
      kind: "prose",
      heading: "Handling Deletions (ON DELETE)",
      body: [
        "When a parent row is deleted, what happens to the children? You must explicitly choose:",
        "• **RESTRICT (default):** The database blocks the deletion and throws an error if children exist.",
        "• **CASCADE:** The database automatically deletes all linked child rows (great for users and their profiles).",
        "• **SET NULL:** The parent is deleted, and the child's foreign key column is updated to NULL (great for keeping historical orders when a user is deleted)."
      ]
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Always index your foreign keys",
      body: "PostgreSQL does not automatically create indexes for foreign keys on the child table. Without an index, deleting a single parent row requires scanning the entire child table to check for linked records. This can turn a fast 200ms delete into a 30-second query on real data.",
    },
    {
      kind: "takeaways",
      items: [
        "**Foreign keys** enforce referential integrity directly at the database engine level.",
        "Add a **UNIQUE constraint** to a foreign key to create a **1:1 relationship**.",
        "**Many-to-many relationships** are always modeled with a **join table**.",
        "You must deliberately choose an **ON DELETE behavior** (CASCADE, SET NULL, or RESTRICT).",
        "You must **always manually add an index** on the child-side foreign key column.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "fk1",
          question: "[Easy] What is the main purpose of a foreign key?",
          options: [
            "To encrypt data between two tables.",
            "To ensure that a value in one table matches a primary key in another, maintaining strict referential integrity.",
            "To automatically create backups of linked tables.",
            "To combine two tables into one large table automatically."
          ],
          correctIndex: 1,
          explanation: "Foreign keys enforce referential integrity, making sure relationships between tables are valid and preventing 'orphan' records."
        },
        {
          id: "fk2",
          question: "[Easy] If a user can only have one profile, and a profile belongs to exactly one user, what kind of relationship is this?",
          options: [
            "1:1 (One-to-One)",
            "1:N (One-to-Many)",
            "N:M (Many-to-Many)",
            "N:1 (Many-to-One)"
          ],
          correctIndex: 0,
          explanation: "A 1:1 relationship means exactly one record on each side is linked directly to the other."
        },
        {
          id: "fk3",
          question: "[Medium] How do you enforce a One-to-One (1:1) relationship in SQL?",
          options: [
            "By naming the columns exactly the same in both tables.",
            "By adding a UNIQUE constraint to the foreign key column on the child table.",
            "By not using a foreign key at all.",
            "By creating a third join table."
          ],
          correctIndex: 1,
          explanation: "Adding a UNIQUE constraint to the foreign key guarantees that no two child rows can ever point to the same parent row, enforcing a strict 1:1 mapping."
        },
        {
          id: "fk4",
          question: "[Medium] What happens by default (RESTRICT) if you try to delete a customer who has orders, and the orders have a foreign key to the customer?",
          options: [
            "The customer is deleted, and the orders are left untouched.",
            "The customer and all their orders are deleted.",
            "The database blocks the deletion and throws an error.",
            "The customer's orders are reassigned to a different customer."
          ],
          correctIndex: 2,
          explanation: "By default, the database restricts you from deleting a parent record if child records still depend on it, preventing broken links."
        },
        {
          id: "fk5",
          question: "[Medium] Which ON DELETE behavior automatically deletes all linked child rows when the parent is deleted?",
          options: [
            "ON DELETE RESTRICT",
            "ON DELETE CASCADE",
            "ON DELETE SET NULL",
            "ON DELETE DROP"
          ],
          correctIndex: 1,
          explanation: "ON DELETE CASCADE is a powerful tool that automatically cleans up dependent records when the parent is removed."
        },
        {
          id: "fk6",
          question: "[Medium] How do you model a Many-to-Many (N:M) relationship in a relational database?",
          options: [
            "You put a foreign key on both tables.",
            "You save an array of IDs in a single text column.",
            "You create a third 'join table' that contains foreign keys pointing to both of the main tables.",
            "You merge both tables into one giant table."
          ],
          correctIndex: 2,
          explanation: "Relational databases require a third 'join' table to resolve many-to-many relationships properly and maintain integrity."
        },
        {
          id: "fk7",
          question: "[Hard] True or False: PostgreSQL automatically creates an index for every foreign key you define.",
          options: [
            "True",
            "False"
          ],
          correctIndex: 1,
          explanation: "False! PostgreSQL does NOT index foreign keys automatically. You must manually add an index to prevent massive performance issues when joining or deleting."
        },
        {
          id: "fk8",
          question: "[Hard] Why is it critically important to manually index the foreign key column on the child table?",
          options: [
            "Because without an index, deleting the parent row requires a slow, full table scan of the child table.",
            "Because you cannot insert data without an index.",
            "Because it encrypts the relationship.",
            "Because it allows you to store larger numbers."
          ],
          correctIndex: 0,
          explanation: "Without an index on the child table's foreign key, the database has to check every single row in the child table whenever a parent is deleted to ensure no orphans are left behind."
        },
        {
          id: "fk9",
          question: "[Medium] What does the ON DELETE SET NULL behavior do?",
          options: [
            "It deletes the parent but leaves the child row, setting the foreign key column to NULL.",
            "It deletes both the parent and the child.",
            "It prevents the parent from being deleted.",
            "It sets the parent's primary key to NULL."
          ],
          correctIndex: 0,
          explanation: "SET NULL keeps the child record alive but safely breaks the link to the deleted parent. This is useful for keeping historical data (like orders) even if the user is deleted."
        },
        {
          id: "fk10",
          question: "[Hard] What is typically used as the Primary Key for a join table (e.g., enrollments linking students to courses)?",
          options: [
            "A single auto-incrementing integer (BIGSERIAL).",
            "A combination of the two foreign keys (e.g., student_id AND course_id) as a composite primary key.",
            "The student's name.",
            "A completely random text string."
          ],
          correctIndex: 1,
          explanation: "The combination of the two foreign keys inherently creates a unique identity for the relationship, ensuring a student cannot enroll in the exact same course twice."
        }
      ]
    }
  ],
};

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
      caption: "Step by step: organizing data to remove redundancy"
    },
    {
      kind: "animation",
      variant: "normalization",
      caption: "Same data, decomposed step by step: Unnormalized to 1NF, 2NF, 3NF, BCNF, then Denormalize",
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
      caption: "Combining tables to optimize read performance"
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
            "To automatically generate primary keys."
          ],
          correctIndex: 1,
          explanation: "Normalization organizes data to reduce duplication, ensuring that updates, inserts, and deletes affect only one place in the database."
        },
        {
          id: "norm2",
          question: "[Easy] What is an 'update anomaly'?",
          options: [
            "When the database crashes during an update.",
            "When you update a piece of duplicated data in one row but forget to update it in others, causing inconsistencies.",
            "When you try to insert data without a primary key.",
            "When you delete a row and it cascades to too many children."
          ],
          correctIndex: 1,
          explanation: "Update anomalies occur when redundant data gets out of sync because you didn't update every single copy of it."
        },
        {
          id: "norm3",
          question: "[Medium] What rule defines First Normal Form (1NF)?",
          options: [
            "No transitive dependencies.",
            "Every column must be an integer.",
            "Every cell is atomic (indivisible) and there are no repeating groups or lists in a single column.",
            "There must be at least three tables in the database."
          ],
          correctIndex: 2,
          explanation: "1NF requires that all data is atomic, meaning you shouldn't store comma-separated lists or JSON arrays where a related table should be."
        },
        {
          id: "norm4",
          question: "[Medium] When does Second Normal Form (2NF) apply?",
          options: [
            "It applies to every single table.",
            "It only applies when a table has no primary key.",
            "It specifically applies when a table has a composite primary key (a key made of multiple columns).",
            "It only applies to tables holding user passwords."
          ],
          correctIndex: 2,
          explanation: "2NF requires that all non-key columns depend on the entire composite primary key, not just a part of it."
        },
        {
          id: "norm5",
          question: "[Medium] What defines Third Normal Form (3NF)?",
          options: [
            "Every table must have a foreign key.",
            "No transitive dependencies (if column A depends on B, and B is not the primary key, they should be in a separate table).",
            "All numbers must be floating points.",
            "Every row must have a unique identifier."
          ],
          correctIndex: 1,
          explanation: "3NF removes transitive dependencies. For example, a customer's 'city' depends on their 'zip_code', not directly on the customer's ID, so zip codes and cities should technically be their own table."
        },
        {
          id: "norm6",
          question: "[Hard] What is Boyce-Codd Normal Form (BCNF)?",
          options: [
            "It is the exact same thing as 1NF.",
            "It is a stricter version of 3NF that handles complex edge cases where multiple overlapping candidate keys exist.",
            "It is a rule for creating indexes.",
            "It dictates how to write JOIN queries."
          ],
          correctIndex: 1,
          explanation: "BCNF strengthens 3NF by stating that for every non-trivial functional dependency X -> Y, X must be a superkey."
        },
        {
          id: "norm7",
          question: "[Easy] What is Denormalization?",
          options: [
            "Deleting tables from the database.",
            "Deliberately repeating data in multiple places to speed up read queries by avoiding expensive joins.",
            "Scrambling data for security.",
            "Removing primary keys."
          ],
          correctIndex: 1,
          explanation: "Denormalization trades storage space and write complexity for faster read performance by keeping related data together."
        },
        {
          id: "norm8",
          question: "[Medium] What is the major downside or cost of Denormalization?",
          options: [
            "Read queries become much slower.",
            "You cannot use foreign keys anymore.",
            "Maintaining consistency becomes difficult: every time the source data changes, you have to manually update all the duplicated copies.",
            "It requires you to buy more RAM."
          ],
          correctIndex: 2,
          explanation: "Because data is duplicated, an update requires fanning out the change to multiple places, which introduces the risk of data getting out of sync (anomalies)."
        },
        {
          id: "norm9",
          question: "[Hard] When is the BEST time to denormalize your database?",
          options: [
            "Right at the beginning, before you even write any queries.",
            "Only when a measured read pattern cannot be satisfied with standard indexing, and you have proven it is a bottleneck.",
            "Whenever you have more than 5 tables.",
            "Never. Denormalization is always bad."
          ],
          correctIndex: 1,
          explanation: "Premature denormalization leads to buggy, drift-heavy databases. You should always start normalized (3NF) and only denormalize when metrics prove you have a specific read performance issue."
        },
        {
          id: "norm10",
          question: "[Medium] Which normal form is generally considered the 'sweet spot' that most teams aim for when designing a standard application database?",
          options: [
            "1NF",
            "2NF",
            "3NF",
            "BCNF"
          ],
          correctIndex: 2,
          explanation: "3NF is the standard goal for relational modeling. It eliminates the vast majority of redundancy without overly complicating the schema design."
        }
      ]
    }
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
  subtitle:
    "Understand data, information, and why databases replaced scattered files.",
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
        [
          "Data copies",
          "Often duplicated across files",
          "Shared, centrally managed data",
        ],
        [
          "New questions",
          "Usually need custom code",
          "Use queries such as SQL",
        ],
        [
          "Business rules",
          "Repeated across applications",
          "Defined and enforced centrally",
        ],
        [
          "Multiple users",
          "Updates can conflict or be lost",
          "Concurrent access is managed safely",
        ],
        [
          "Failures",
          "Can leave partial or corrupt data",
          "Transactions help keep data consistent",
        ],
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
          question: "Which problem commonly occurs when multiple departments maintain separate files for the same customer?",
          options: [
            "Data duplication and inconsistency.",
            "Faster querying.",
            "Automatic backups.",
            "Better access control.",
          ],
          correctIndex: 0,
          explanation:
            "Separate copies can drift apart when one is updated and another is not.",
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
  subtitle:
    "Learn how database software stores, protects, and retrieves data safely.",
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
          explanation:
            "PostgreSQL is a database management system.",
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
          explanation:
            "A row stores one record, such as one customer, product, or order.",
        },
        {
          id: "q2",
          question: "What is another name for a table in the relational model?",
          options: ["Relation", "Transaction", "Index", "Query"],
          correctIndex: 0,
          explanation:
            "The formal relational-model term for a table is a relation.",
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
  subtitle:
    "Understand the physical, logical, and view levels of a database and why they matter.",
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
        [
          "Warehouse employee",
          "Products, inventory, shipping details",
          "Customer payment details",
        ],
        [
          "Finance analyst",
          "Orders, payments, revenue",
          "Unrelated operational details",
        ],
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
          options: [
            "Physical level",
            "Logical level",
            "View level",
            "Network level",
          ],
          correctIndex: 1,
          explanation:
            "The logical level describes what data exists and how it is organized.",
        },
        {
          id: "q2",
          question: "Which level is concerned with indexes, files, and disk storage?",
          options: [
            "Physical level",
            "Logical level",
            "View level",
            "Application level",
          ],
          correctIndex: 0,
          explanation:
            "The physical level describes how the DBMS stores and retrieves data.",
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
          explanation:
            "A primary key gives each row a unique, non-empty identity.",
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
          explanation:
            "A foreign key stores a value that refers to a key in another table.",
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
          explanation:
            "Repeated foreign-key values represent a one-to-many relationship.",
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
          explanation:
            "A composite key combines multiple columns to uniquely identify a row.",
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
        [
          "DDL",
          "Defines or changes database structure",
          "CREATE, ALTER, DROP, TRUNCATE",
        ],
        [
          "DML",
          "Adds, changes, or removes rows",
          "INSERT, UPDATE, DELETE",
        ],
        [
          "DQL",
          "Reads data",
          "SELECT",
        ],
        [
          "DCL",
          "Controls permissions",
          "GRANT, REVOKE",
        ],
        [
          "TCL",
          "Controls transactions",
          "BEGIN, COMMIT, ROLLBACK, SAVEPOINT",
        ],
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
      tone: "warning",
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
          question:
            "Which command family creates or changes a table's structure?",
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
          explanation:
            "SELECT is used to retrieve data and is commonly classified as DQL.",
        },
        {
          id: "sc3",
          question:
            "What happens if DELETE is run without a WHERE clause?",
          options: [
            "It deletes every row in the table.",
            "It deletes the table structure.",
            "It automatically creates a backup.",
            "It deletes only the newest row.",
          ],
          correctIndex: 0,
          explanation:
            "Without WHERE, DELETE applies to all rows in the target table.",
        },
        {
          id: "sc4",
          question:
            "Which command is used to give a role permission to read a table?",
          options: ["ALTER", "GRANT", "ROLLBACK", "INSERT"],
          correctIndex: 1,
          explanation:
            "GRANT is a DCL command used to give permissions.",
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
          explanation:
            "COMMIT completes a transaction and makes its changes permanent.",
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
    lessons: [dbWhatIs, dbmsExplained, relationalModel, databaseKeys, levelsOfAbstraction, sqlCommands, dbUnderTheHood, sqlIntro, primaryKeys, foreignKeys, normalization],
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
