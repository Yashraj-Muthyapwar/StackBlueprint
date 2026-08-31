import type { LessonContent } from "../types";
import { type QuizQuestion } from "@/components/lesson/Quiz";
import commentsAndOperatorsImg from "@/images/sql/querying-fundamentals/comments-and-operators.png";
import sqlOperatorsImg from "@/images/sql/querying-fundamentals/sql-operators.png";
import yourFirstQueryImg from "@/images/sql/querying-fundamentals/your-first-query.png";

const selectFrom: LessonContent = {
  slug: "your-first-query",
  title: "Your First Query",
  subtitle: "Read real Cycle Depot customer data with SELECT and FROM.",
  sections: [
    {
      kind: "prose",
      heading: "Asking the Database a Question",
      body: [
        "A **query** is a request for data written in SQL. SQL is declarative: you describe the result you want, and the database chooses how to retrieve it.",
        "Most queries begin with two clauses: `SELECT`, which chooses the result columns, and `FROM`, which names the source table.",
      ],
    },
    {
      kind: "image",
      src: yourFirstQueryImg,
      alt: "A Cycle Depot customers table projected into a smaller query result using SELECT name, city, country FROM customers",
      caption: "A query describes the result you want. Here, SELECT keeps every customer row but returns only name, city, and country.",
    },
    {
      kind: "prose",
      heading: "Your Smallest Useful Query",
      body: [
        "Start by asking for one column. This is the smallest query that can retrieve useful customer information. In the playground it returns all 60 customer names; the table below is a four-row preview.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Return every customer name",
      code: `SELECT name
FROM customers;`,
    },
    {
      kind: "table",
      caption: "Four rows from the query result",
      headers: ["name"],
      rows: [["Zane Novak"], ["Boris Alvarez"], ["Priya Doyle"], ["Ugo Mensah"]],
    },
    {
      kind: "prose",
      body: [
        "Read it like a sentence: “Select name from customers.”",
        "`FROM customers` names the source table. `SELECT name` chooses the one column shown in the result.",
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
      caption: "Choose three useful customer columns",
      code: `SELECT name, city, country
FROM customers;`,
    },
    {
      kind: "table",
      caption: "A four-row preview of the projected result",
      headers: ["name", "city", "country"],
      rows: [
        ["Zane Novak", "Austin", "USA"],
        ["Boris Alvarez", "Bristol", "UK"],
        ["Priya Doyle", "Manchester", "UK"],
        ["Ugo Mensah", "Dallas", "USA"],
      ],
    },
    {
      kind: "animation",
      variant: "select-projection",
      caption: "Cycle Depot customers: SELECT keeps rows but projects only the columns you ask for",
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
      caption: "Explore every customer column, with a deterministic sample",
      code: `SELECT *
FROM customers
ORDER BY id
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "SELECT * returns all seven customer columns for these four rows",
      headers: ["id", "name", "email", "city", "country", "segment", "signup_date"],
      rows: [
        ["1", "Zane Novak", "zane.novak1@example.com", "Austin", "USA", "pro", "2023-01-06"],
        [
          "2",
          "Boris Alvarez",
          "boris.alvarez2@example.com",
          "Bristol",
          "UK",
          "retail",
          "2024-06-08",
        ],
        [
          "3",
          "Priya Doyle",
          "priya.doyle3@example.com",
          "Manchester",
          "UK",
          "retail",
          "2023-01-15",
        ],
        ["4", "Ugo Mensah", "ugo.mensah4@example.com", "Dallas", "USA", "retail", "2023-02-10"],
      ],
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
      code: `SELECT name, city
FROM customers;`,
    },
    {
      kind: "playground-practice",
      title: "Build a customer directory",
      prompt:
        "Return every customer's id, name, and country. Rename name to customer_name. Use the checked exercise in the playground to test your result.",
      tables: ["customers"],
      successCheck: "60 rows with the columns id, customer_name, and country.",
      href: "/sql-playground?practice=cycledepot-customer-projection",
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
          question:
            "Which clause determines the specific columns that are returned in the query result?",
          options: ["FROM", "SELECT", "WHERE", "RETURN"],
          correctIndex: 1,
          explanation: "SELECT specifies the columns to include in the result set.",
        },
        {
          id: "yf2",
          question: "What is the purpose of FROM customers in a basic Cycle Depot query?",
          options: [
            "To filter rows based on a condition.",
            "To define the sorting order of the results.",
            "To specify the source table or relation.",
            "To choose which columns to show.",
          ],
          correctIndex: 2,
          explanation:
            "FROM tells the database which table, view, or subquery you want to read data from.",
        },
        {
          id: "yf3",
          question: "Write the exact clause used to select every column from a table.",
          commandAnswer: ["SELECT *", "select *", "SELECT * ", "select * "],
          explanation: 'The asterisk (*) is a wildcard that means "all columns".',
        },
        {
          id: "yf4",
          question: "What separates multiple column names in a SELECT list?",
          options: ["A comma", "A semicolon", "A period", "The word AND"],
          correctIndex: 0,
          explanation: "Separate selected column names with commas, for example: SELECT name, city FROM customers;",
        },
        {
          id: "yf5",
          question:
            "Why should you generally avoid using SELECT * in saved queries or application code?",
          options: [
            "It is a syntax error in most SQL databases.",
            "It is fragile to schema changes and returns unnecessary data, wasting bandwidth.",
            "It runs the query much faster than specifying column names.",
            "It forces the database to sort the results alphabetically by column name.",
          ],
          correctIndex: 1,
          explanation:
            "Using SELECT * can break your application if columns are added or removed, and it wastes resources by transmitting data you might not need.",
        },
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
        [
          "WHERE lower(email) = 'x'",
          "WHERE email = 'X' COLLATE \"C\"  -or-  functional index on lower(email)",
        ],
        [
          "WHERE date(created_at) = '2026-06-01'",
          "WHERE created_at >= '2026-06-01' AND created_at < '2026-06-02'",
        ],
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
      caption:
        "LIMIT / OFFSET in action — pages 1 & 2, the second-highest-salary trick, and why deep OFFSET is slow",
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

const commentsCalculationsAliases: LessonContent = {
  slug: "sql-basics-comments-operators",
  title: "SQL Basics: Comments, Calculations, and Aliases",
  subtitle: "Use comments, calculations, and aliases to make a Cycle Depot query clear and useful.",
  sections: [
    {
      kind: "prose",
      heading: "Make the Query Explain Itself",
      body: [
        "A useful query should be understandable when you return to it later. Comments explain a decision to the next reader. Expressions calculate a value. Aliases give that value a clear result-column name.",
        "We will use the Cycle Depot products table to show a price before and after an 8% sales-tax calculation.",
      ],
    },
    {
      kind: "image",
      src: commentsAndOperatorsImg,
      alt: "A Cycle Depot products query with a comment, an 8 percent price calculation, and the price_with_tax alias",
      caption:
        "A comment documents intent, an expression calculates a value, and AS gives the resulting column a useful name.",
    },
    {
      kind: "prose",
      heading: "Comments Are Notes for People",
      body: [
        "A comment is ignored by the database. Use `--` for the rest of one line, or `/* ... */` for a longer note.",
        "Comment a business decision or a surprising rule. Do not narrate SQL that already says exactly what it does.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A comment does not change the query result",
      code: `-- Cycle Depot price preview
SELECT name, price
FROM products;`,
    },
    {
      kind: "animation",
      variant: "sql-comments",
      caption: "The database ignores the comment and runs the SELECT statement below it",
    },
    {
      kind: "prose",
      heading: "Calculate a New Value",
      body: [
        "An expression combines values with an operator. Here, `price * 1.08` calculates the price after adding 8% tax. It does not change the stored product price.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Calculate the price with tax",
      code: `SELECT
  name,
  price,
  price * 1.08 AS price_with_tax
FROM products;`,
    },
    {
      kind: "table",
      caption: "A four-product preview of the calculated result",
      headers: ["name", "price", "price_with_tax"],
      rows: [
        ["Trailhead 29 Hardtail", "1299.00", "1402.92"],
        ["Trailhead 29 Carbon", "2450.00", "2646.00"],
        ["Boulder Full Suspension", "3199.00", "3454.92"],
        ["Switchback Enduro", "4150.00", "4482.00"],
      ],
    },
    {
      kind: "prose",
      heading: "Use AS to Name the Result",
      body: [
        "`AS price_with_tax` gives the calculated column a meaningful heading. The alias belongs to this query result only. It does not rename the `price` column in the products table.",
        "Use a clear alias whenever a calculation would otherwise produce an unclear heading such as `?column?` or `price * 1.08`.",
      ],
    },
    {
      kind: "animation",
      variant: "sql-calculations-aliases",
      caption: "The multiplication creates a new value for every product, and AS labels that value in the result",
    },
    {
      kind: "playground-practice",
      title: "Preview product prices with tax",
      prompt:
        "Return every product's name and price, then calculate price * 1.08 as price_with_tax. Use the checked Cycle Depot exercise to test the result.",
      tables: ["products"],
      successCheck: "30 rows with the columns name, price, and price_with_tax.",
      href: "/sql-playground?practice=cycledepot-product-price-with-tax",
    },
    {
      kind: "takeaways",
      items: [
        "Use -- for a short comment and /* ... */ for a longer note.",
        "Comments are ignored by the database and do not change a query result.",
        "Use arithmetic expressions in SELECT to calculate a value for each row.",
        "Use AS to give a calculated result column a clear name.",
        "Comparison and logical operators are the focus of the next lesson.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "sb1",
          question: "Which characters are used to start a single-line comment in SQL?",
          commandAnswer: ["--", "-- "],
          explanation: "Two dashes (--) mark the beginning of a single-line comment.",
        },
        {
          id: "sb2",
          question: "How do you begin a multi-line comment in SQL?",
          commandAnswer: ["/*", "/* "],
          explanation: "A multi-line comment starts with /* and ends with */.",
        },
        {
          id: "sb3",
          question: "What does price * 1.08 do in the Cycle Depot query?",
          options: [
            "Changes every stored product price permanently.",
            "Calculates a new value for each result row.",
            "Filters out products that cost more than 1.08.",
            "Renames the products table.",
          ],
          correctIndex: 1,
          explanation: "The expression calculates a value in the result. It does not update the products table.",
        },
        {
          id: "sb4",
          question: "Why use AS price_with_tax after the calculation?",
          options: [
            "To name the calculated result column.",
            "To rename price in the products table.",
            "To run the calculation before FROM.",
            "To make the comment execute.",
          ],
          correctIndex: 0,
          explanation: "AS gives a result column a readable alias without changing the source schema.",
        },
        {
          id: "sb5",
          question: "Which part of this query is ignored by the database?",
          options: [
            "SELECT name",
            "FROM products",
            "price * 1.08",
            "-- Cycle Depot price preview",
          ],
          correctIndex: 3,
          explanation: "A line beginning with -- is a comment for readers, so the database skips it.",
        },
      ],
    },
  ],
};

const sqlOperators: LessonContent = {
  slug: "sql-operators",
  title: "SQL Operators: Arithmetic, Comparison, and Logic",
  subtitle:
    "Calculate with product values, ask true-or-false questions, and combine conditions before filtering rows.",
  sections: [
    {
      kind: "prose",
      heading: "Operators Turn Values into Answers",
      body: [
        "An **operator** tells SQL what to do with one or more values. Arithmetic operators calculate a new value. Comparison operators ask a true-or-false question. Logical operators combine those questions.",
        "We will use Cycle Depot product prices, costs, and stock levels. The same operator can appear in a SELECT result or inside a WHERE filter.",
      ],
    },
    {
      kind: "image",
      src: sqlOperatorsImg,
      alt: "Cycle Depot products flow through arithmetic, comparison, and logical SQL operators to create calculated and true-or-false result columns",
      caption:
        "Arithmetic produces a value, comparison produces true or false, and logic combines comparisons into one condition.",
    },
    {
      kind: "prose",
      heading: "Arithmetic Operators Calculate Values",
      body: [
        "Use `+`, `-`, `*`, and `/` to calculate with numeric columns. For a product, `price - cost` calculates its gross margin. As with the earlier tax calculation, this adds a value to the result without changing stored data.",
      ],
    },
    {
      kind: "table",
      caption: "Arithmetic operators",
      headers: ["operator", "meaning", "Cycle Depot example"],
      rows: [
        ["+", "Addition", "price + 5.00"],
        ["-", "Subtraction", "price - cost"],
        ["*", "Multiplication", "price * 1.08"],
        ["/", "Division", "price / 12"],
        ["%", "Remainder", "in_stock % 2"],
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Calculate gross margin for every product",
      code: `SELECT
  name,
  price,
  cost,
  price - cost AS gross_margin
FROM products;`,
    },
    {
      kind: "table",
      caption: "A four-product preview of the arithmetic result",
      headers: ["name", "price", "cost", "gross_margin"],
      rows: [
        ["Trailhead 29 Hardtail", "1299.00", "780.00", "519.00"],
        ["Trailhead 29 Carbon", "2450.00", "1520.00", "930.00"],
        ["Boulder Full Suspension", "3199.00", "2010.00", "1189.00"],
        ["Switchback Enduro", "4150.00", "2680.00", "1470.00"],
      ],
    },
    {
      kind: "prose",
      heading: "Comparison Operators Ask a True-or-False Question",
      body: [
        "Comparison operators include `=`, `<>`, `>`, `>=`, `<`, and `<=`. Each comparison checks one row and returns `true` or `false`. Here, `price >= 2000` asks whether a product meets a premium-price threshold.",
      ],
    },
    {
      kind: "table",
      caption: "Comparison operators",
      headers: ["operator", "meaning", "Cycle Depot example"],
      rows: [
        ["=", "Equal to", "country = 'USA'"],
        ["<> or !=", "Not equal to", "category <> 'Accessories'"],
        [">", "Greater than", "price > 2000"],
        ["<", "Less than", "in_stock < 50"],
        [">=", "Greater than or equal to", "price >= 2000"],
        ["<=", "Less than or equal to", "in_stock <= 10"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "A note about missing values",
      body: "These examples compare non-NULL values. If a comparison involves NULL, SQL can return UNKNOWN instead of true or false. The WHERE Filters lesson explains three-valued logic and IS NULL.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Show the comparison result for every product",
      code: `SELECT
  name,
  price,
  price >= 2000 AS premium
FROM products;`,
    },
    {
      kind: "table",
      caption: "The comparison is true only for products priced at 2000 or more",
      headers: ["name", "price", "premium"],
      rows: [
        ["Trailhead 29 Hardtail", "1299.00", "false"],
        ["Trailhead 29 Carbon", "2450.00", "true"],
        ["Boulder Full Suspension", "3199.00", "true"],
        ["Switchback Enduro", "4150.00", "true"],
      ],
    },
    {
      kind: "prose",
      heading: "Logical Operators Combine Comparisons",
      body: [
        "`AND` requires both conditions to be true. `OR` requires at least one condition to be true. `NOT` reverses a condition. Parentheses make a combined condition easier to read and remove ambiguity.",
        "A boolean expression does not remove rows on its own. Put it in `WHERE` when you want the database to keep only matching rows. The next lesson explores filtering in more depth.",
      ],
    },
    {
      kind: "table",
      caption: "Logical operators",
      headers: ["operator", "meaning", "Cycle Depot example"],
      rows: [
        ["AND", "Both conditions must be true", "price >= 2000 AND in_stock >= 50"],
        ["OR", "At least one condition must be true", "category = 'Helmets' OR category = 'Clothing'"],
        ["NOT", "Reverses a condition", "NOT (category = 'Accessories')"],
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep products that are premium-priced and ready to sell",
      code: `SELECT name, price, in_stock
FROM products
WHERE price >= 2000
  AND in_stock >= 50;`,
    },
    {
      kind: "table",
      caption: "The four products where both conditions are true",
      headers: ["name", "price", "in_stock"],
      rows: [
        ["Trailhead 29 Carbon", "2450.00", "113"],
        ["Boulder Full Suspension", "3199.00", "125"],
        ["Meridian Road Carbon", "2890.00", "65"],
        ["Aero Sprint Pro", "5400.00", "99"],
      ],
    },
    {
      kind: "animation",
      variant: "sql-operators",
      caption:
        "The same Cycle Depot rows produce a number with arithmetic, a boolean with comparison, and one combined condition with AND",
    },
    {
      kind: "playground-practice",
      title: "Find ready-to-sell premium products",
      prompt:
        "Return product name, price, and in_stock for products priced at least 2000 that also have at least 50 units in stock. Use the checked Cycle Depot exercise to test the result.",
      tables: ["products"],
      successCheck: "4 rows with the columns name, price, and in_stock.",
      href: "/sql-playground?practice=cycledepot-ready-to-sell-premium-products",
    },
    {
      kind: "takeaways",
      items: [
        "Arithmetic operators such as +, -, *, /, and % calculate a value.",
        "Comparison operators such as >= and = return true or false for each row.",
        "AND requires every combined condition to be true. OR requires at least one. NOT reverses a condition.",
        "A boolean expression becomes a filter when you put it in WHERE.",
        "A comparison involving NULL can return UNKNOWN. Use IS NULL to check for missing values.",
        "Use parentheses when a combined condition would otherwise be hard to read.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "op1",
          question: "Which expression calculates a Cycle Depot product's gross margin?",
          options: ["price = cost", "price - cost", "price >= cost", "price AND cost"],
          correctIndex: 1,
          explanation: "Subtracting cost from price calculates the gross margin for each product row.",
        },
        {
          id: "op2",
          question: "What does the comparison price >= 2000 return for each product?",
          options: ["A new stored price", "A true-or-false value", "Only matching product rows", "A product category"],
          correctIndex: 1,
          explanation: "A comparison evaluates to a boolean value. WHERE can then use that value to decide which rows to keep.",
        },
        {
          id: "op3",
          question: "When is A AND B true?",
          options: ["When A is true", "When B is true", "When both A and B are true", "When either A or B is false"],
          correctIndex: 2,
          explanation: "AND requires both sides of the expression to be true.",
        },
        {
          id: "op4",
          question: "Which WHERE clause keeps products priced at least 2000 with at least 50 units in stock?",
          options: [
            "WHERE price >= 2000 OR in_stock >= 50",
            "WHERE price >= 2000 AND in_stock >= 50",
            "WHERE price - 2000 AND in_stock - 50",
            "WHERE NOT price >= 2000",
          ],
          correctIndex: 1,
          explanation: "Both requirements must be met, so the comparisons are joined with AND.",
        },
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
          question:
            "Which of the following describes the correct logical execution order of a SQL query?",
          options: [
            "SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY",
            "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY",
            "FROM → GROUP BY → WHERE → SELECT → HAVING → ORDER BY",
            "SELECT → WHERE → FROM → HAVING → GROUP BY → ORDER BY",
          ],
          correctIndex: 1,
          explanation:
            "SQL evaluates the source (FROM) first, filters rows (WHERE), groups them (GROUP BY), filters groups (HAVING), projects columns (SELECT), and finally sorts the results (ORDER BY).",
        },
        {
          id: "qf2",
          question: "What is the result of the comparison 'amount = NULL' in SQL?",
          options: ["TRUE", "FALSE", "UNKNOWN", "A syntax error"],
          correctIndex: 2,
          explanation:
            "In SQL's three-valued logic, comparing anything to NULL with '=' yields UNKNOWN. Always use 'IS NULL' or 'IS NOT NULL'.",
        },
        {
          id: "qf3",
          question: "Why should you generally avoid 'SELECT *' in application code?",
          options: [
            "It is a syntax error in most SQL databases.",
            "It is fragile, returns unneeded columns wasting bandwidth, and cannot efficiently use covering indexes.",
            "It runs the query much faster than specifying column names.",
            "It forces the database to sort the results alphabetically by column name.",
          ],
          correctIndex: 1,
          explanation:
            "Using SELECT * is fragile to schema changes and wastes resources by returning data the application might not need.",
        },
      ],
    },
  ],
};

export const sqlQueryingFundamentalsTopic = {
  slug: "sql-querying-fundamentals",
  title: "SQL Querying Fundamentals",
  category: "Foundations",
  iconKey: "table" as const,
  blurb:
    "Every query you'll ever write starts here — and the logical execution order is the key that unlocks the rest.",
  lessons: [
    selectFrom,
    commentsCalculationsAliases,
    sqlOperators,
    whereLesson,
    orderLimit,
    logicalOrder,
    queryingFundamentalsQuiz,
  ],
};
