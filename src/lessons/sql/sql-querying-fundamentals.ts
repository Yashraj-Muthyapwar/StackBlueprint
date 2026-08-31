import type { LessonContent } from "../types";
import { type QuizQuestion } from "@/components/lesson/Quiz";
import commentsAndOperatorsImg from "@/images/sql/querying-fundamentals/comments-and-operators.png";
import distinctOrderLimitImg from "@/images/sql/querying-fundamentals/distinct-order-limit.png";
import logicalQueryOrderImg from "@/images/sql/querying-fundamentals/logical-query-order.png";
import logicalQueryOrderMnemonicImg from "@/images/sql/querying-fundamentals/logical-query-order-mnemonic.png";
import sqlOperatorsImg from "@/images/sql/querying-fundamentals/sql-operators.png";
import whereFiltersImg from "@/images/sql/querying-fundamentals/where-filters.png";
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
  subtitle: "Keep the Cycle Depot rows that match a condition, combine conditions, and handle missing values safely.",
  sections: [
    {
      kind: "prose",
      heading: "WHERE Chooses Which Rows Continue",
      body: [
        "`WHERE` tells the database which rows to keep. After `FROM` produces the candidate rows, SQL evaluates a condition, called a **predicate**, for each row. Only rows where that predicate is `TRUE` appear in the result.",
        "Think of WHERE as a row filter, not a column selector. `SELECT` decides which columns you see. `WHERE` decides which rows reach the result.",
      ],
    },
    {
      kind: "diagram",
      caption: "A simplified logical order for a basic filtered query",
      ascii: `FROM customers
     ↓ candidate rows
WHERE country = 'USA'
     ↓ rows where the predicate is TRUE
SELECT name, country
     ↓ result columns`,
    },
    {
      kind: "image",
      src: whereFiltersImg,
      alt: "Cycle Depot customer rows filtered by WHERE country equals USA into a smaller result table",
      caption:
        "WHERE checks a condition for each source row and keeps only the rows where that condition is true.",
    },
    {
      kind: "prose",
      heading: "Start with One Clear Condition",
      body: [
        "The smallest useful filter compares one column to one value. This query keeps every Cycle Depot customer in the USA. It returns 27 rows; the table is a four-row preview.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Keep customers in the USA",
      code: `SELECT name, country
FROM customers
WHERE country = 'USA';`,
    },
    {
      kind: "table",
      caption: "Four example rows from the 27 matching customers",
      headers: ["name", "country"],
      rows: [
        ["Zane Novak", "USA"],
        ["Ugo Mensah", "USA"],
        ["Sami Mensah", "USA"],
        ["Vera Doyle", "USA"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "WHERE comes before SELECT aliases",
      body: "A SELECT alias is not available inside WHERE because WHERE is evaluated earlier. For example, a price_with_tax alias cannot be used as a WHERE condition in the same query. The Logical Query Order lesson explains the complete sequence later.",
    },
    {
      kind: "prose",
      heading: "Combine Conditions with AND or OR",
      body: [
        "Use `AND` when every requirement must be true. Use `OR` when either requirement is enough. You learned the operators in the previous lesson; WHERE gives those true-or-false answers a job to do.",
      ],
    },
    {
      kind: "table",
      caption: "Common WHERE patterns with Cycle Depot data",
      headers: ["Need", "Condition"],
      rows: [
        ["One match", "country = 'USA'"],
        ["Both requirements", "price >= 2000 AND in_stock >= 50"],
        ["Either alternative", "country = 'USA' OR country = 'Canada'"],
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
      caption: "All four products where both conditions are true",
      headers: ["name", "price", "in_stock"],
      rows: [
        ["Trailhead 29 Carbon", "2450.00", "113"],
        ["Boulder Full Suspension", "3199.00", "125"],
        ["Meridian Road Carbon", "2890.00", "65"],
        ["Aero Sprint Pro", "5400.00", "99"],
      ],
    },
    {
      kind: "prose",
      heading: "Missing Values Need IS NULL",
      body: [
        "`NULL` means a value is missing or unknown. It is not the text 'NULL', and it is not equal to anything, including another NULL.",
        "Do not write `city = NULL`. That comparison evaluates to UNKNOWN, and WHERE keeps only true rows. Use `IS NULL` to find missing values and `IS NOT NULL` to find present values.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find customers whose city is missing",
      code: `SELECT id, name, country
FROM customers
WHERE city IS NULL;`,
    },
    {
      kind: "table",
      caption: "All five customers whose city is missing",
      headers: ["id", "name", "country"],
      rows: [
        ["5", "Omar Doyle", "Germany"],
        ["14", "Hana Yilmaz", "France"],
        ["45", "Chloe Farouk", "France"],
        ["46", "Farid Sharma", "Canada"],
        ["47", "Elena Silva", "USA"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "A useful rule for NULL",
      body: "WHERE keeps only TRUE. FALSE and UNKNOWN are both excluded. That is why = NULL does not find missing values, while IS NULL does.",
    },
    {
      kind: "animation",
      variant: "where-filtering",
      caption:
        "Watch WHERE keep true rows, AND narrow a result further, and IS NULL find the rows with a missing city",
    },
    {
      kind: "playground-practice",
      title: "Find customers without a city",
      prompt:
        "Return id, name, and email for every customer whose city is missing. Use IS NULL, then run the checked Cycle Depot exercise.",
      tables: ["customers"],
      successCheck: "5 rows with the columns id, name, and email.",
      href: "/sql-playground?practice=cycledepot-customers-without-city",
    },
    {
      kind: "takeaways",
      items: [
        "FROM produces candidate rows, WHERE filters them, and SELECT chooses result columns.",
        "A condition in WHERE is called a predicate. Only TRUE rows pass it.",
        "Use =, >, and other comparison operators to write a condition.",
        "Use AND when every condition is required, and OR when either condition is enough.",
        "NULL means missing or unknown. Use IS NULL and IS NOT NULL, never = NULL.",
        "FALSE and UNKNOWN rows do not pass a WHERE filter.",
        "SELECT aliases are not available in WHERE because WHERE runs earlier.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "where1",
          question: "What does WHERE decide in a SQL query?",
          options: [
            "Which columns appear in the result",
            "Which rows continue to the result",
            "The name of the source table",
            "The order of result columns",
          ],
          correctIndex: 1,
          explanation: "WHERE filters rows. SELECT decides which columns the surviving rows return.",
        },
        {
          id: "where2",
          question: "Which condition keeps products priced at least 2000 with at least 50 units in stock?",
          options: [
            "price >= 2000 OR in_stock >= 50",
            "price >= 2000 AND in_stock >= 50",
            "price = 2000 AND in_stock = 50",
            "price >= 2000 NOT in_stock >= 50",
          ],
          correctIndex: 1,
          explanation: "Both business requirements must be true, so the two comparisons are joined with AND.",
        },
        {
          id: "where3",
          question: "Which condition correctly finds Cycle Depot customers with no city?",
          options: ["city = NULL", "city <> NULL", "city IS NULL", "city = 'NULL'"],
          correctIndex: 2,
          explanation: "NULL needs the special IS NULL test. A comparison such as city = NULL produces UNKNOWN.",
        },
        {
          id: "where4",
          question: "Which rows pass a WHERE filter?",
          options: ["Only TRUE rows", "TRUE and FALSE rows", "TRUE and UNKNOWN rows", "Every row"],
          correctIndex: 0,
          explanation: "WHERE keeps TRUE rows. FALSE and UNKNOWN are excluded.",
        },
      ],
    },
  ],
};

const orderLimit: LessonContent = {
  slug: "order-limit",
  title: "DISTINCT, ORDER BY & LIMIT",
  subtitle: "Remove repeated values, sort Cycle Depot results, and keep only the rows you need.",
  sections: [
    {
      kind: "prose",
      heading: "Shape a Useful Short List",
      body: [
        "Query results often contain repeated values, arrive in no useful order, or include more rows than you need. `DISTINCT`, `ORDER BY`, and `LIMIT` solve those three problems.",
        "Use `DISTINCT` to keep unique result values. Use `ORDER BY` to choose their sequence. Use `LIMIT` to keep the first number of rows after sorting.",
      ],
    },
    {
      kind: "image",
      src: distinctOrderLimitImg,
      alt: "A Cycle Depot customers country list transformed by DISTINCT, ORDER BY, and LIMIT into Canada, France, and Germany",
      caption: "DISTINCT removes repeated countries, ORDER BY makes the result alphabetical, and LIMIT keeps the first three rows.",
    },
    {
      kind: "prose",
      heading: "Start with DISTINCT",
      body: [
        "The customers table has many rows but only six countries. `DISTINCT` removes duplicate values from the selected result columns. It does not change the customers table.",
        "When you select more than one column, `DISTINCT` considers the whole combination. `SELECT DISTINCT country, segment` keeps unique country-and-segment pairs, not unique countries alone.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "List every customer country once",
      code: `SELECT DISTINCT country
FROM customers;`,
    },
    {
      kind: "table",
      caption: "The six unique countries. This preview is alphabetized for reading, but DISTINCT alone does not promise an order.",
      headers: ["country"],
      rows: [["Canada"], ["France"], ["Germany"], ["India"], ["UK"], ["USA"]],
    },
    {
      kind: "prose",
      heading: "ORDER BY Makes the Sequence Deliberate",
      body: [
        "Without `ORDER BY`, SQL does not promise the order in which rows appear. Add `ASC` for lowest-to-highest or A-to-Z order. `ASC` is the default. Add `DESC` for highest-to-lowest or Z-to-A order.",
        "When two rows have the same first sort value, add another column to make their order predictable, such as `ORDER BY price DESC, name ASC`.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Show the four most expensive products",
      code: `SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 4;`,
    },
    {
      kind: "table",
      caption: "The result is sorted from the highest price down, then capped at four rows.",
      headers: ["name", "price"],
      rows: [
        ["Aero Sprint Pro", "5400.00"],
        ["Switchback Enduro", "4150.00"],
        ["Volt E-Cargo", "3890.00"],
        ["Boulder Full Suspension", "3199.00"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "LIMIT needs an order to be meaningful",
      body: "`LIMIT 4` by itself returns four rows, but not necessarily the four rows you care about. Put ORDER BY before LIMIT whenever the first rows should mean highest, newest, alphabetically first, or another deliberate ranking.",
    },
    {
      kind: "prose",
      heading: "Use All Three Together",
      body: [
        "This query builds a compact country picker. First it removes repeated countries, then it sorts the unique values alphabetically, then it keeps the first three.",
        "The written order is `SELECT`, `FROM`, `ORDER BY`, `LIMIT`, but `DISTINCT` affects the selected result before the final ordering and limit are applied.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Return the first three unique customer countries in alphabetical order",
      code: `SELECT DISTINCT country
FROM customers
ORDER BY country ASC
LIMIT 3;`,
    },
    {
      kind: "table",
      caption: "The exact three-row result",
      headers: ["country"],
      rows: [["Canada"], ["France"], ["Germany"]],
    },
    {
      kind: "animation",
      variant: "distinct-order-limit",
      caption: "See repeated countries collapse, product prices sort from high to low, LIMIT keep the first rows, and OFFSET move to the next page",
    },
    {
      kind: "prose",
      heading: "Paginate with LIMIT and OFFSET",
      body: [
        "Pagination divides a long, ordered result into pages. `LIMIT` sets the page size. `OFFSET` skips rows before that page begins. For page P, `OFFSET = (P - 1) * page_size`.",
        "Always order before using OFFSET. Otherwise, page 1 and page 2 have no dependable meaning because SQL has not been asked for a sequence.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Return the second page of four most-recent Cycle Depot orders",
      code: `SELECT id, order_date, status
FROM orders
ORDER BY order_date DESC, id DESC
LIMIT 4 OFFSET 4;`,
    },
    {
      kind: "table",
      caption: "The second page after the four most-recent orders are skipped",
      headers: ["id", "order_date", "status"],
      rows: [
        ["57", "2025-05-25", "delivered"],
        ["100", "2025-05-23", "delivered"],
        ["111", "2025-05-18", "shipped"],
        ["99", "2025-05-15", "delivered"],
      ],
    },
    {
      kind: "prose",
      heading: "Why Deep OFFSET Hurts",
      body: [
        "To reach `OFFSET 10000`, the database may need to find and discard the first 10,000 ordered rows before returning the next page. That work grows as users move deeper into the result.",
        "For very large, frequently paged lists, use **keyset pagination** instead. Remember the last row's sort values and ask only for rows after that point. This avoids repeatedly skipping every earlier row.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Use the final row on page 1 as the key for the next page",
      code: `SELECT id, order_date, status
FROM orders
WHERE (order_date, id) < (DATE '2025-06-04', 5)
ORDER BY order_date DESC, id DESC
LIMIT 4;`,
    },
    {
      kind: "callout",
      tone: "info",
      title: "Stable pagination needs a tie-breaker",
      body: "Two orders can share an order_date. Sorting by order_date DESC, id DESC gives every row a stable place and makes both OFFSET and keyset pagination dependable.",
    },
    {
      kind: "playground-practice",
      title: "Build a short country list",
      prompt: "Return each customer country once, sort the values alphabetically, and keep only the first three. Then run the checked Cycle Depot exercise.",
      tables: ["customers"],
      successCheck: "Exactly 3 rows and one country column: Canada, France, and Germany.",
      href: "/sql-playground?practice=cycledepot-first-three-countries",
    },
    {
      kind: "takeaways",
      items: [
        "DISTINCT removes duplicate selected values or duplicate selected combinations.",
        "ORDER BY is how you request a deliberate result order. ASC is the default and DESC reverses it.",
        "Use a second ORDER BY column to break ties when the result needs a predictable sequence.",
        "LIMIT keeps the first N rows after the ordering has been applied.",
        "For a useful short list, combine DISTINCT, ORDER BY, and LIMIT in one query.",
        "OFFSET skips ordered rows for later pages, but deep OFFSET work grows with the page number.",
        "For large, active lists, keyset pagination continues from the last sort values instead of repeatedly skipping earlier rows.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "distinct-order-limit-1",
          question: "What does SELECT DISTINCT country do?",
          options: [
            "Returns each customer row once",
            "Returns each country value once",
            "Sorts countries alphabetically",
            "Returns only the first country",
          ],
          correctIndex: 1,
          explanation: "DISTINCT removes repeated values from the selected country column.",
        },
        {
          id: "distinct-order-limit-2",
          question: "Which clause should come before LIMIT when you want the most expensive products?",
          options: ["FROM", "WHERE", "ORDER BY price DESC", "DISTINCT"],
          correctIndex: 2,
          explanation: "ORDER BY price DESC ranks products from highest price to lowest before LIMIT keeps the first rows.",
        },
        {
          id: "distinct-order-limit-3",
          question: "Which query returns the first three unique countries alphabetically?",
          options: [
            "SELECT country FROM customers LIMIT 3;",
            "SELECT DISTINCT country FROM customers ORDER BY country LIMIT 3;",
            "SELECT country FROM customers ORDER BY country DESC;",
            "SELECT DISTINCT country FROM customers WHERE LIMIT 3;",
          ],
          correctIndex: 1,
          explanation: "DISTINCT removes repeats, ORDER BY country sorts A to Z, and LIMIT 3 keeps the first three rows.",
        },
        {
          id: "distinct-order-limit-4",
          question: "With a page size of 4, what does LIMIT 4 OFFSET 4 return?",
          options: [
            "The first four ordered rows",
            "The next four ordered rows after the first four",
            "Four duplicate rows removed by DISTINCT",
            "Every row after row four",
          ],
          correctIndex: 1,
          explanation: "OFFSET 4 skips the first four ordered rows, then LIMIT 4 keeps the next four rows.",
        },
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
  subtitle: "SQL is written SELECT-first, but the database processes each clause in a different order.",
  sections: [
    {
      kind: "prose",
      heading: "Read the Query One Way, Process It Another",
      body: [
        "You write `SELECT` first because it states the answer you want. The database starts with `FROM`, because it needs rows before it can filter, choose columns, sort, or limit them.",
        "For the queries you have learned so far, remember this working order: `FROM` → `WHERE` → `SELECT` → `ORDER BY` → `LIMIT`.",
      ],
    },
    {
      kind: "image",
      src: logicalQueryOrderImg,
      alt: "A Cycle Depot products query moving through FROM, WHERE, SELECT, ORDER BY, and LIMIT to produce three Road Bikes",
      caption: "The query is written SELECT-first, but the database starts from products, filters Road Bikes, projects two columns, sorts by price, then keeps three rows.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "List the three most expensive Road Bikes",
      code: `SELECT name, price
FROM products
WHERE category = 'Road Bikes'
ORDER BY price DESC
LIMIT 3;`,
    },
    {
      kind: "table",
      caption: "The exact result after every clause has run",
      headers: ["name", "price"],
      rows: [
        ["Aero Sprint Pro", "5400.00"],
        ["Meridian Road Carbon", "2890.00"],
        ["Gravel Runner GX", "1980.00"],
      ],
    },
    {
      kind: "prose",
      heading: "Follow the Rows Through Each Step",
      body: [
        "`FROM products` provides product rows and all their columns. `WHERE` keeps the Road Bikes while `category` is still available. `SELECT` then keeps only name and price in the result.",
        "`ORDER BY price DESC` sorts those surviving result rows. Finally, `LIMIT 3` keeps the first three. The order matters because each clause works on the output from the earlier step.",
      ],
    },
    {
      kind: "animation",
      variant: "pipeline",
      caption: "Step through the same Cycle Depot query in the order the database logically processes it",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why aliases work in ORDER BY but not WHERE",
      body: "An alias is created in SELECT. WHERE has already run, so it cannot see that alias. ORDER BY runs later, so it can use the alias to sort the result.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Repeat a calculation in WHERE, then use its alias in ORDER BY",
      code: `SELECT name, price * 1.08 AS price_with_tax
FROM products
WHERE price * 1.08 > 3000
ORDER BY price_with_tax DESC;`,
    },
    {
      kind: "prose",
      heading: "Putting the Order to Work",
      body: [
        "This Cycle Depot report stays within the core fundamentals. It finds customers with at least three delivered orders, ranks them by their delivered-order count, and keeps the first ten.",
        "The database starts with orders, filters delivered rows, forms customer groups, removes small groups, calculates the selected result, sorts it, then limits it.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Find customers with at least three delivered orders",
      code: `SELECT
  customer_id,
  COUNT(*) AS order_count
FROM orders
WHERE status = 'delivered'
GROUP BY customer_id
HAVING COUNT(*) >= 3
ORDER BY order_count DESC, customer_id ASC
LIMIT 10;`,
    },
    {
      kind: "table",
      caption: "The first five rows of the exact 10-row result, ordered by order count and then customer ID",
      headers: ["customer_id", "order_count"],
      rows: [
        ["13", "5"],
        ["20", "5"],
        ["45", "4"],
        ["1", "3"],
        ["10", "3"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Why the alias works in ORDER BY",
      body: "`order_count` is created in SELECT and is available by the time ORDER BY runs. HAVING cannot use it here because HAVING filters groups before SELECT creates the alias.",
    },
    {
      kind: "prose",
      heading: "Later Reference: The Full SQL Order",
      body: [
        "The report above uses only the fundamentals. In later lessons, SQL can also use JOIN to combine tables, window functions to calculate across related rows, and DISTINCT to remove duplicate result rows.",
        "The full reference order is FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → WINDOW FUNCTIONS → DISTINCT → ORDER BY → LIMIT. A query uses only the steps it needs.",
      ],
    },
    {
      kind: "prose",
      heading: "A Mnemonic for the Full Order",
      body: [
        "Use **Fred John Wrote Good Homework, So Will Dad Order Lunch?** Its first letters follow the full order: FROM, JOIN, WHERE, GROUP BY, HAVING, SELECT, WINDOW FUNCTIONS, DISTINCT, ORDER BY, LIMIT.",
        "For this lesson, focus on the core sequence. Keep this larger map as a preview of concepts that are introduced later.",
      ],
    },
    {
      kind: "image",
      src: logicalQueryOrderMnemonicImg,
      alt: "Mnemonic Fred John Wrote Good Homework, So Will Dad Order Lunch mapped to the full SQL logical query order",
      caption: "Fred John Wrote Good Homework, So Will Dad Order Lunch maps F-J-W-G-H-S-W-D-O-L to FROM, JOIN, WHERE, GROUP BY, HAVING, SELECT, WINDOW FUNCTIONS, DISTINCT, ORDER BY, and LIMIT.",
    },
    {
      kind: "playground-practice",
      title: "Build a Road Bike shortlist",
      prompt: "Return the name and price of Road Bikes only, sorted from highest price to lowest, keeping the first three. Then run the checked Cycle Depot exercise.",
      tables: ["products"],
      successCheck: "3 rows with name and price: Aero Sprint Pro, Meridian Road Carbon, and Gravel Runner GX.",
      href: "/sql-playground?practice=cycledepot-road-bike-shortlist",
    },
    {
      kind: "takeaways",
      items: [
        "SQL is written SELECT-first, but FROM provides the rows first.",
        "WHERE filters source rows before SELECT chooses result columns.",
        "GROUP BY forms one group per customer, and HAVING keeps only groups that meet an aggregate condition.",
        "ORDER BY sorts the surviving result and LIMIT keeps the first requested rows.",
        "SELECT aliases work in ORDER BY but not WHERE because ORDER BY runs later.",
        "The core order for this report is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
        "Later lessons add JOIN, WINDOW FUNCTIONS, and DISTINCT to the full logical-order map.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "logical-order-1",
          question: "Which clause runs first in a query that uses FROM, WHERE, SELECT, ORDER BY, and LIMIT?",
          options: ["SELECT", "FROM", "WHERE", "ORDER BY"],
          correctIndex: 1,
          explanation: "FROM supplies the source rows before every other listed clause can work.",
        },
        {
          id: "logical-order-2",
          question: "Why can ORDER BY use price_with_tax but WHERE cannot?",
          options: [
            "WHERE only accepts text columns.",
            "The alias is created in SELECT, which runs after WHERE and before ORDER BY.",
            "ORDER BY automatically creates all aliases.",
            "LIMIT hides aliases from WHERE.",
          ],
          correctIndex: 1,
          explanation: "WHERE evaluates before SELECT creates the alias. ORDER BY evaluates after it exists.",
        },
        {
          id: "logical-order-3",
          question: "What does LIMIT do in the Road Bikes query?",
          options: [
            "Filters Road Bikes from products",
            "Selects the name and price columns",
            "Sorts prices from highest to lowest",
            "Keeps the first three rows after sorting",
          ],
          correctIndex: 3,
          explanation: "LIMIT is the final step in this query and caps the already sorted result at three rows.",
        },
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
