import type { LessonContent, FoundationTopicMeta } from "../types";
import { type QuizQuestion } from "@/components/lesson/Quiz";

const selectFrom: LessonContent = {
  slug: "your-first-query",
  title: "Your First Query",
  subtitle: "Use SELECT and FROM to read data from a table.",
  sections: [
    {
      kind: "prose",
      heading: "Asking the Database a Question",
      body: [
        "A **query** is a request for data written in SQL. You describe the result you want, and the database decides how to find it.",
        "Most queries begin with two clauses: `SELECT`, which chooses what to show, and `FROM`, which names where the data comes from.",
      ],
    },
    {
      kind: "table",
      caption: "The employees table used in this lesson",
      headers: ["employee_id", "full_name", "department", "city"],
      rows: [
        ["1", "Priya Sharma", "Data", "Austin"],
        ["2", "Marcus Lee", "Data", "Denton"],
        ["3", "Elena Ortiz", "Finance", "Tulsa"],
        ["4", "Sam Whitfield", "Finance", "Austin"],
      ],
    },
    {
      kind: "prose",
      heading: "Your Smallest Useful Query",
      body: [
        "This query asks for the `full_name` column from the `employees` table:",
      ],
    },
    {
      kind: "code",
      language: "sql",
      code: `SELECT full_name
FROM employees;`,
    },
    {
      kind: "table",
      caption: "Query result",
      headers: ["full_name"],
      rows: [
        ["Priya Sharma"],
        ["Marcus Lee"],
        ["Elena Ortiz"],
        ["Sam Whitfield"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Read it like a sentence: “Select `full_name` from `employees`.”",
        "`FROM employees` names the source table. `SELECT full_name` chooses the column shown in the result.",
        "A query result is itself table-shaped: it has rows and columns, even though it is only the answer to your request.",
      ],
    },
    {
      kind: "prose",
      heading: "Select More Than One Column",
      body: [
        "Separate column names with commas. The order in your `SELECT` list becomes the order of columns in the result.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      code: `SELECT full_name, city, department
FROM employees;`,
    },
    {
      kind: "animation",
      variant: "select-projection",
      caption: "SELECT chooses which columns appear in the result",
    },
    {
      kind: "prose",
      heading: "Selecting Every Column",
      body: [
        "The asterisk (`*`) means “all columns.” It is useful when you are exploring a table for the first time.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      code: `SELECT *
FROM employees;`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "A good habit",
      body: "Use SELECT * while exploring. In saved queries and application code, name the columns you need. It makes the query clearer and avoids returning unnecessary data.",
    },
    {
      kind: "prose",
      heading: "Basic SQL Writing Style",
      body: [
        "SQL keywords such as `SELECT` and `FROM` are usually written in uppercase. Table and column names are usually written in lowercase, often with underscores.",
        "Whitespace and line breaks do not change the meaning of a query, but formatting one clause per line makes longer queries easier to read. End statements with a semicolon (`;`) as a consistent habit.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A readable SQL statement",
      code: `SELECT full_name, city
FROM employees;`,
    },
    {
      kind: "takeaways",
      items: [
        "A query is a request for data written in SQL.",
        "SELECT chooses the columns to return.",
        "FROM names the table or source to read from.",
        "Use commas to select multiple columns.",
        "Use SELECT * for quick exploration, but prefer explicit column names in saved queries.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "yf1",
          question: "Which clause determines the specific columns that are returned in the query result?",
          options: [
            "FROM",
            "SELECT",
            "WHERE",
            "RETURN"
          ],
          correctIndex: 1,
          explanation: "SELECT specifies the columns to include in the result set."
        },
        {
          id: "yf2",
          question: "What is the purpose of the FROM clause in a basic SQL query?",
          options: [
            "To filter rows based on a condition.",
            "To define the sorting order of the results.",
            "To specify the source table or relation.",
            "To choose which columns to show."
          ],
          correctIndex: 2,
          explanation: "FROM tells the database which table, view, or subquery you want to read data from."
        }
      ]
    }
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

const queryingFundamentalsQuiz: LessonContent = {
  slug: "querying-fundamentals-quiz",
  title: "Querying Fundamentals: Final Quiz",
  subtitle: "Test your knowledge of SELECT, FROM, WHERE, operators, and logical execution order.",
  sections: [
    {
      kind: "quiz",
      isFinalQuiz: true,
      questions: [
        {
          id: "qf1",
          question: "Which of the following describes the correct logical execution order of a SQL query?",
          options: [
            "SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY",
            "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY",
            "FROM → GROUP BY → WHERE → SELECT → HAVING → ORDER BY",
            "SELECT → WHERE → FROM → HAVING → GROUP BY → ORDER BY"
          ],
          correctIndex: 1,
          explanation: "SQL evaluates the source (FROM) first, filters rows (WHERE), groups them (GROUP BY), filters groups (HAVING), projects columns (SELECT), and finally sorts the results (ORDER BY)."
        },
        {
          id: "qf2",
          question: "What is the result of the comparison 'amount = NULL' in SQL?",
          options: [
            "TRUE",
            "FALSE",
            "UNKNOWN",
            "A syntax error"
          ],
          correctIndex: 2,
          explanation: "In SQL's three-valued logic, comparing anything to NULL with '=' yields UNKNOWN. Always use 'IS NULL' or 'IS NOT NULL'."
        },
        {
          id: "qf3",
          question: "Why should you generally avoid 'SELECT *' in application code?",
          options: [
            "It is a syntax error in most SQL databases.",
            "It is fragile, returns unneeded columns wasting bandwidth, and cannot efficiently use covering indexes.",
            "It runs the query much faster than specifying column names.",
            "It forces the database to sort the results alphabetically by column name."
          ],
          correctIndex: 1,
          explanation: "Using SELECT * is fragile to schema changes and wastes resources by returning data the application might not need."
        }
      ]
    }
  ]
};

export const sqlQueryingFundamentalsTopic: FoundationTopicMeta = {
  slug: "sql-querying-fundamentals",
  title: "SQL Querying Fundamentals",
  category: "Foundations",
  iconKey: "table",
  blurb:
    "Every query you'll ever write starts here — and the logical execution order is the key that unlocks the rest.",
  lessons: [selectFrom, sqlComments, sqlOperators, whereLesson, orderLimit, logicalOrder, queryingFundamentalsQuiz],
};
