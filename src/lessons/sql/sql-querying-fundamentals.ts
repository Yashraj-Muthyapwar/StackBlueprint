import type { LessonContent } from "../types";
import type { FoundationTopicMeta } from "./foundations-content";
import { type QuizQuestion } from "@/components/lesson/Quiz";
import yourFirstQueryImg from "@/images/sql/querying-fundamentals/your-first-query.png";
import commentsAndOperatorsImg from "@/images/sql/querying-fundamentals/comments-and-operators.png";

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
      kind: "image",
      src: yourFirstQueryImg,
      alt: "Visualization of how a SELECT statement pulls columns from a table",
      caption: "A query describes the data you want; the database engine figures out how to retrieve it",
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
        },
        {
          id: "yf3",
          question: "Write the exact clause used to select every column from a table.",
          commandAnswer: ["SELECT *", "select *", "SELECT * ", "select * "],
          explanation: "The asterisk (*) is a wildcard that means \"all columns\"."
        },
        {
          id: "yf4",
          question: "What SQL keyword is required to specify the source of the data?",
          commandAnswer: ["FROM", "from", "From"],
          explanation: "The FROM keyword indicates the table from which to retrieve data."
        },
        {
          id: "yf5",
          question: "Why should you generally avoid using SELECT * in saved queries or application code?",
          options: [
            "It is a syntax error in most SQL databases.",
            "It is fragile to schema changes and returns unnecessary data, wasting bandwidth.",
            "It runs the query much faster than specifying column names.",
            "It forces the database to sort the results alphabetically by column name."
          ],
          correctIndex: 1,
          explanation: "Using SELECT * can break your application if columns are added or removed, and it wastes resources by transmitting data you might not need."
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

const sqlBasics: LessonContent = {
  slug: "sql-basics-comments-operators",
  title: "SQL Basics: Comments and Operators",
  subtitle:
    "Write readable SQL and use operators to calculate, compare, and combine conditions.",
  sections: [
    {
      kind: "prose",
      heading: "Two Small Skills You Will Use Everywhere",
      body: [
        "Comments help people understand your SQL. Operators let SQL calculate values and test conditions.",
        "These features appear in nearly every query you will write, so it is worth learning the basics before moving into filtering rows.",
      ],
    },
    {
      kind: "image",
      src: commentsAndOperatorsImg,
      alt: "Visualization of comments and operators in SQL",
      caption: "Comments explain your logic, while operators perform the actual calculations and comparisons.",
    },
    {
      kind: "prose",
      heading: "Comments Are Notes for Humans",
      body: [
        "Comments explain your intent without changing the meaning of a normal query.",
        "Use -- for a comment until the end of a line. Use /* ... */ for a comment that spans multiple lines.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Two ways to write comments",
      code: `-- Show the names and cities of all employees
SELECT full_name, city
FROM employees;

/* Use comments to explain
   non-obvious business rules. */`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Use comments sparingly",
      body: "Comment decisions and business rules, not obvious SQL. A comment such as “select names” adds little; a comment explaining why a filter excludes certain records is useful.",
    },
    {
      kind: "prose",
      heading: "Arithmetic Operators",
      body: [
        "Arithmetic operators calculate new values. You can use them in SELECT to create calculated columns.",
      ],
    },
    {
      kind: "table",
      caption: "Arithmetic operators",
      headers: ["Operator", "Meaning", "Example"],
      rows: [
        ["+", "Addition", "price + 5"],
        ["-", "Subtraction", "price - discount"],
        ["*", "Multiplication", "price * quantity"],
        ["/", "Division", "salary / 12"],
        ["%", "Remainder", "10 % 3"],
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Calculate values in a query",
      code: `SELECT
  product_name,
  price,
  price * 1.10 AS price_with_tax
FROM products;`,
    },
    {
      kind: "prose",
      heading: "Comparison Operators",
      body: [
        "Comparison operators check whether one value matches, exceeds, or differs from another value. They return true or false and are the foundation of filtering with WHERE.",
      ],
    },
    {
      kind: "table",
      caption: "Comparison operators",
      headers: ["Operator", "Meaning"],
      rows: [
        ["=", "Equal to"],
        ["<> or !=", "Not equal to"],
        [">", "Greater than"],
        ["<", "Less than"],
        [">=", "Greater than or equal to"],
        ["<=", "Less than or equal to"],
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Compare values in a filter",
      code: `SELECT full_name, salary
FROM employees
WHERE salary >= 90000;`,
    },
    {
      kind: "prose",
      heading: "Logical Operators",
      body: [
        "Logical operators combine conditions. Use AND when every condition must be true, OR when at least one condition can be true, and NOT to reverse a condition.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Combine conditions",
      code: `-- Both conditions must be true
SELECT full_name, department, city
FROM employees
WHERE department = \Data  AND city = \Austin;

-- Either condition can be true
SELECT full_name, department
FROM employees
WHERE department = \Data   OR department = \Finance;`,
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Use parentheses with AND and OR",
      body: "AND is evaluated before OR. When you mix them, use parentheses to make your intended logic clear.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Make mixed conditions clear",
      code: `SELECT full_name, department, city
FROM employees
WHERE (department = \Data OR department = \Finance)
  AND city = \Austin;`,
    },
    {
      kind: "prose",
      heading: "What Comes Next",
      body: [
        "You now know the basic operators. The next lessons build on them:",
        "• Filtering Rows explains WHERE in depth.",
        "• Condition Types covers BETWEEN, IN, LIKE, and more comparison patterns.",
        "• NULL Explained covers missing values and why = NULL does not work.",
      ],
    },
    {
      kind: "takeaways",
      items: [
        "Use -- for single-line comments and /* ... */ for multi-line comments.",
        "Use arithmetic operators to calculate new values in SELECT.",
        "Use comparison operators to test values in WHERE.",
        "Use AND, OR, and NOT to combine conditions.",
        "Use parentheses whenever mixing AND and OR.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "sb1",
          question: "Which characters are used to start a single-line comment in SQL?",
          commandAnswer: ["--", "-- "],
          explanation: "Two dashes (--) mark the beginning of a single-line comment."
        },
        {
          id: "sb2",
          question: "How do you begin a multi-line comment in SQL?",
          commandAnswer: ["/*", "/* "],
          explanation: "A multi-line comment starts with /* and ends with */."
        },
        {
          id: "sb3",
          question: "Which of these operators is used to check if two values are NOT equal?",
          options: [
            "==",
            "<>",
            "><",
            "!!"
          ],
          correctIndex: 1,
          explanation: "<> (and often !=) is used to check for inequality in SQL."
        },
        {
          id: "sb4",
          question: "What logical operator should you use if you want a row to be returned ONLY when multiple conditions are ALL true?",
          commandAnswer: ["AND", "and", "And"],
          explanation: "The AND operator requires all combined conditions to be true."
        },
        {
          id: "sb5",
          question: "Why is it important to use parentheses when mixing AND and OR operators?",
          options: [
            "Because SQL syntax requires parentheses around all operators.",
            "To prevent the database from throwing a syntax error.",
            "Because AND is evaluated before OR, which can lead to unexpected logic if not made explicit.",
            "Parentheses make the query execute faster."
          ],
          correctIndex: 2,
          explanation: "AND has higher precedence than OR. Using parentheses clarifies your exact intended logic and avoids accidental bugs."
        }
      ]
    }
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
  lessons: [selectFrom, sqlBasics, whereLesson, orderLimit, logicalOrder, queryingFundamentalsQuiz],
};
