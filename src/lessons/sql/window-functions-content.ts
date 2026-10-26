// Rich lesson content for SQL "Window Functions" (Advanced SQL) - StackBlueprint curriculum.

import type { LessonContent, FoundationTopicMeta } from "./foundations-content";

const groupByVsWindow: LessonContent = {
  slug: "group-by-vs-window",
  title: "GROUP BY vs Window Functions",
  subtitle: "Collapsing rows vs keeping every row / aggregate next to detail / when each one fits",
  sections: [
    {
      kind: "prose",
      heading: "1. WHY: Why do window functions exist?",
      body: [
        "Suppose you are a data engineer at a company. You have an `employees` table:",
      ],
    },
    {
      kind: "table",
      caption: "The employees table",
      headers: ["employee_id", "department", "salary"],
      rows: [
        ["1", "IT", "5000"],
        ["2", "IT", "6000"],
        ["3", "HR", "4000"],
        ["4", "HR", "4500"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Your manager asks two questions.",
        "**Question A**: What is the total salary of each department? You can use `GROUP BY`.",
        "**Question B**: What is each employee's salary, along with the total salary of their department? This is different. You must keep every employee row.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The idea",
      body: "A **window function** helps you calculate a value across related rows without removing the individual rows.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Grouping vs looking through a window",
      body: [
        "Imagine four employees standing in two rooms.",
      ],
    },
    {
      kind: "visual",
      id: "window-two-rooms",
      caption: "Grouping vs looking through a window",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The key difference",
      body: "`GROUP BY` combines rows into groups and produces one row per group in this example. A **window function** calculates values using related rows while keeping each original row.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How do they work?",
      body: ["**A. GROUP BY**"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "GROUP BY: one row per department",
      code: `SELECT
    department,
    SUM(salary) AS department_total
FROM employees
GROUP BY department;`,
    },
    {
      kind: "prose",
      body: [
        "PostgreSQL groups employees by department, then calculates `SUM(salary)` for each group. Result: 2 rows.",
      ],
    },
    {
      kind: "prose",
      body: ["**B. Window Function**"],
    },
    {
      kind: "prose",
      body: [
        "The general structure is: `FUNCTION(...) OVER (window_definition)`",
        "The `OVER` keyword must come immediately after the function call. The parentheses after `OVER` contain the window definition.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Window function: every employee row stays",
      code: `SELECT
    employee_id,
    department,
    salary,
    SUM(salary) OVER (
        PARTITION BY department
    ) AS department_total
FROM employees;`,
    },
    {
      kind: "prose",
      body: [
        "**PostgreSQL** takes these conceptual steps:",
        "**1.** Read the **employees** table.",
        "**2.** Divide the rows into **partitions** based on `department`.",
        "**3.** Calculate the **salary** total for each partition.",
        "**4.** Add that total to every **employee** row in the partition.",
        "**Result**: `4` rows.",
        "The `OVER()` clause makes `SUM()` act as a window function. `PARTITION BY` defines the groups of related rows. We will study both in detail in later lessons.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Compare the outputs",
      body: ["Now that you understand the core idea, let's look at the results side by side."],
    },
    {
      kind: "animation",
      variant: "q-window-group-by-vs-window",
      caption: "The same idea in SQL: GROUP BY collapses the rows, a window function keeps them.",
    },
    {
      kind: "prose",
      body: ["Notice that the **department total** appears beside each **employee's original salary**."],
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: When should you use each?",
      body: ["Pick the approach that matches the output you need."],
    },
    {
      kind: "table",
      caption: "Choose by the output you need",
      headers: ["Requirement", "Preferred approach"],
      rows: [
        ["One total per department", "GROUP BY"],
        ["Total salary beside each employee", "Window function"],
        ["One result per category", "GROUP BY"],
        ["Employee rank within a department", "Window function"],
      ],
    },
    {
      kind: "list",
      heading: "Important limitations",
      items: [
        "Window functions can require sorting and extra processing.",
        "A window function does not automatically reduce the row count.",
        "In PostgreSQL, you cannot use a window function directly in `WHERE`. You usually need to wrap the query in a **CTE** or **subquery**.",
        "The correct choice depends on the output you need. Window functions are not always better than `GROUP BY`.",
      ],
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Your turn",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-customer-order-totals",
      title: "Show each order beside its customer total",
      prompt: "Write a PostgreSQL query to return the following columns: order_id, customer_id, amount, customer_total. Do not use a GROUP BY query that removes individual orders.",
      playgroundHref: "/sql-playground?practice=cycledepot-customer-order-totals",
    },
    {
      kind: "takeaways",
      items: [
        "`GROUP BY` combines rows into groups and produces one row per group.",
        "A **window function** calculates values using related rows while keeping each original row.",
        "The structure is `FUNCTION(...) OVER (window_definition)`, and `OVER` must come immediately after the function call.",
        "Use `GROUP BY` for one result per category, and a window function for a total beside each row or a rank within a department.",
        "You cannot use a window function directly in `WHERE` in PostgreSQL. Use a subquery or CTE.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "group-by-vs-window-row-count",
          question: "The employees table has 4 rows in 2 departments. How many rows does `SUM(salary) OVER (PARTITION BY department)` return?",
          options: ["4 rows", "2 rows", "1 row", "6 rows"],
          correctIndex: 0,
          explanation: "A window function keeps every input row. GROUP BY would return 2 rows, one per department.",
        },
        {
          id: "group-by-vs-window-task-a",
          question: "An orders table has order_id, customer_id and amount. display every order and the total amount spent by that order's customer. Which approach should you use?",
          options: [
            "A window function with SUM(amount) OVER (PARTITION BY customer_id)",
            "GROUP BY customer_id alone",
            "GROUP BY order_id",
            "SELECT DISTINCT customer_id",
          ],
          correctIndex: 0,
          explanation: "Every order row must stay, so a window function is the right tool. GROUP BY customer_id alone would return only 2 rows.",
        },
        {
          id: "group-by-vs-window-task-b",
          question: "For the same orders table, which query returns order_id, customer_id, amount and customer_total while keeping every order?",
          options: [
            "SELECT order_id, customer_id, amount, SUM(amount) OVER (PARTITION BY customer_id) AS customer_total FROM orders;",
            "SELECT order_id, customer_id, amount, SUM(amount) AS customer_total FROM orders GROUP BY customer_id;",
            "SELECT order_id, customer_id, amount, SUM(amount) OVER () PARTITION BY customer_id AS customer_total FROM orders;",
            "SELECT order_id, customer_id, amount FROM orders WHERE SUM(amount) OVER (PARTITION BY customer_id) > 0;",
          ],
          correctIndex: 0,
          explanation: "OVER must come directly after the function, with PARTITION BY inside its parentheses. Customer A rows show 300 and customer B rows show 500. The GROUP BY option fails because order_id is not grouped, and a window function is not allowed in WHERE.",
        },
        {
          id: "group-by-vs-window-where",
          question: "In PostgreSQL, where can you NOT use a window function directly?",
          options: ["In the WHERE clause", "In the SELECT list", "In an ORDER BY clause", "In a subquery's SELECT list"],
          correctIndex: 0,
          explanation: "Window functions are not allowed in WHERE. Compute them in a subquery or CTE, then filter in the outer query.",
        },
      ],
    },
  ],
};

const overWindowConcept: LessonContent = {
  slug: "over-window-concept",
  title: "OVER() and the Window Concept",
  subtitle: "Mastering the empty OVER() clause and calculating aggregates across rows without collapsing them.",
  sections: [
    {
      kind: "prose",
      body: ["In Previous Lesson, you learned:"],
    },
    {
      kind: "list",
      items: [
        "`GROUP BY` produces one result row per group.",
        "**Window functions** calculate values across related rows without collapsing them.",
      ],
    },
    {
      kind: "prose",
      body: ["Now we will learn what `OVER()` means and how it changes an aggregate function."],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why do we need OVER()?",
      body: ["Consider an employees table."],
    },
    {
      kind: "table",
      caption: "The employees table",
      headers: ["employee_id", "department", "salary"],
      rows: [
        ["1", "IT", "5000"],
        ["2", "IT", "6000"],
        ["3", "HR", "4000"],
        ["4", "HR", "4500"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Your manager asks: Show every employee's salary and the total salary paid to all employees.",
        "We need two things in the same result:",
        "1. Each employee's individual salary.",
        "2. The total salary across all employees.",
        "A normal aggregate query with `SUM(salary)` and no `GROUP BY` produces one summary row. It cannot also return individual employee columns directly.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The idea",
      body: "The `OVER()` clause lets us calculate the total without removing the employee rows.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of a calculator and a window",
      body: ["Imagine that every employee holds a calculator."],
    },
    {
      kind: "visual",
      id: "window-calculator",
      caption: "A calculator and a window",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Remember",
      body: "`SUM()` tells PostgreSQL what to calculate. `OVER()` tells PostgreSQL which rows to use for the window calculation. With empty parentheses, `OVER()` uses all rows available to the window function.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How does OVER() work?",
      body: ["Start with this PostgreSQL query:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "SUM with an empty OVER ()",
      code: `SELECT
    employee_id,
    department,
    salary,
    SUM(salary) OVER () AS company_total
FROM employees;`,
    },
    {
      kind: "prose",
      body: [
        "PostgreSQL conceptually does the following:",
        "1. Read the rows: the `FROM employees` clause provides the four rows.",
        "2. Define the window: `OVER ()` includes all four rows in one window because there is no `PARTITION BY` or window `ORDER BY`.",
        "3. Calculate the total: PostgreSQL evaluates `SUM(salary)` over the window.",
        "4. Return the original rows with the result: each employee receives the same company total.",
      ],
    },
    {
      kind: "prose",
      heading: "Anatomy of the syntax",
      body: [],
    },
    {
      kind: "code",
      language: "text",
      caption: "Window function syntax",
      code: `SUM(salary) OVER ()`,
    },
    {
      kind: "table",
      caption: "Reading the syntax",
      headers: ["Part", "Meaning"],
      rows: [
        ["SUM", "Aggregate function"],
        ["salary", "Column to calculate"],
        ["OVER", "Apply the function as a window function"],
        ["()", "Window definition: empty means no partitioning or ordering"],
      ],
    },
    {
      kind: "prose",
      body: ["A window can also have additional instructions:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A window with additional instructions",
      code: `SUM(salary) OVER (
    PARTITION BY department
    ORDER BY employee_id
)`,
    },
    {
      kind: "prose",
      body: [
        "For now, focus only on `OVER ()`. We will study `PARTITION BY`, `ORDER BY`, and frames separately.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Compare three different calculations",
      body: ["We will use the same four employee rows."],
    },
    {
      kind: "animation",
      variant: "q-window-over-concept",
      caption: "Interactive OVER() example: SUM, AVG and COUNT on the same four rows.",
    },
    {
      kind: "prose",
      body: [
        "All three queries keep the four employee rows. The function changes the calculation, not the number of rows returned.",
      ],
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Limitations and common mistakes",
      body: ["Watch for these common mistakes when you first use `OVER()`."],
    },
    {
      kind: "list",
      heading: "Common mistakes",
      items: [
        "**Confusing** `OVER()` **with** `GROUP BY` **:** `OVER()` does not collapse rows. Every original row remains in the result set alongside the computed window value.",
        "**Assuming** `OVER()` **always spans the entire table:** An empty `OVER()` covers all rows, but `PARTITION BY`, `ORDER BY`, and window frame clauses (`ROWS/RANGE BETWEEN`) restrict the calculation window.",
        "**Parenthesis syntax errors:** Writing `SUM(salary) (OVER)` is invalid. The `OVER` keyword comes before the window specification parentheses: `SUM(salary) OVER ()`.",
        "**Assuming all SQL functions support** `OVER()` **:** Scalar functions (like `ROUND()` or `UPPER()`) do not support `OVER()`. Only dedicated window functions (`ROW_NUMBER()`, `RANK()`, `LEAD()`) and compatible aggregate functions (`SUM()`, `AVG()`) can use it.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "OVER () works on the remaining rows",
      body: "One more important detail: a window function works on the rows that remain after `WHERE`, `GROUP BY`, and `HAVING` processing. So `OVER ()` does not always mean every row in the physical table.",
    },
    {
      kind: "prose",
      body: [
        "**For example**, if you filter out HR employees, `SUM(salary) OVER ()` will only calculate over the remaining IT rows.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Filtering first changes the window",
      code: `SELECT
    employee_id,
    salary,
    SUM(salary) OVER () AS company_total
FROM employees
WHERE department <> 'HR';`,
    },
    {
      kind: "table",
      caption: "Result: 2 rows, and the total covers only the IT rows",
      headers: ["employee_id", "salary", "company_total"],
      rows: [
        ["1", "5000", "11000"],
        ["2", "6000", "11000"],
      ],
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Solve it yourself",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-order-average-over",
      title: "Show each order beside the overall average",
      prompt: "Write a query that returns: order_id, customer_id, amount, average_order_amount. The new column must show the average amount across all five orders, while keeping every order row. Do not use GROUP BY, PARTITION BY, or a subquery.",
      playgroundHref: "/sql-playground?practice=cycledepot-order-average-over",
    },
    {
      kind: "takeaways",
      items: [
        "`OVER ()` turns an aggregate such as `SUM` into a **window function** that keeps every row.",
        "`SUM()` tells PostgreSQL what to calculate. `OVER ()` tells PostgreSQL which rows to use.",
        "With empty parentheses, the window uses all rows available to the window function.",
        "The function changes the calculation, not the number of rows returned.",
        "A window function works on the rows left after `WHERE`, `GROUP BY`, and `HAVING`, so `OVER ()` does not always mean every row in the table.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "over-window-concept-sum-vs-sum-over",
          question: "An orders table has five rows with order_id, customer_id and amount, and the amounts add up to 800. Explain the difference between `SUM(amount)` and `SUM(amount) OVER ()`.",
          options: [
            "Without GROUP BY, SUM(amount) produces one summary row. SUM(amount) OVER () preserves the five order rows and shows the total on each row.",
            "SUM(amount) keeps all five order rows, and SUM(amount) OVER () returns one summary row.",
            "They return exactly the same result, because both calculate 800.",
            "SUM(amount) OVER () groups the five orders by customer_id.",
          ],
          correctIndex: 0,
          explanation: "Both can calculate 800, but the shape of the result is different. SUM(amount) without GROUP BY produces one summary row. SUM(amount) OVER () preserves five order rows and shows the total on each row. Also, SUM(amount) does not always mean all rows in the table. With GROUP BY, it calculates a total for each group.",
        },
        {
          id: "over-window-concept-approach",
          question: "An employees table has employee_id, department and salary. You need every employee's salary and the total salary paid to all employees in the same result. Which approach fits?",
          options: [
            "Add SUM(salary) OVER () as a column next to the employee columns",
            "Add SUM(salary) as a column with no GROUP BY",
            "Use GROUP BY employee_id and SUM(salary)",
            "Use SELECT DISTINCT salary",
          ],
          correctIndex: 0,
          explanation: "OVER () calculates the total across all rows without removing the employee rows. A plain SUM(salary) with no GROUP BY cannot be listed beside employee_id, and GROUP BY employee_id gives one total per employee, not the company total.",
        },
        {
          id: "over-window-concept-correct-query",
          question: "Which query returns employee_id, salary and the average salary of all employees on every row, keeping all four employees?",
          options: [
            "SELECT employee_id, salary, AVG(salary) OVER () AS company_average FROM employees;",
            "SELECT employee_id, salary, AVG(salary) (OVER) AS company_average FROM employees;",
            "SELECT employee_id, salary, AVG(salary) AS company_average FROM employees;",
            "SELECT employee_id, salary, AVG(salary) OVER () AS company_average FROM employees GROUP BY employee_id, salary;",
          ],
          correctIndex: 0,
          explanation: "The correct syntax is AVG(salary) OVER (). Writing (OVER) is invalid. A plain AVG(salary) with no GROUP BY cannot sit beside employee_id. Adding GROUP BY employee_id, salary first collapses the rows to one per employee, so each row would only average itself.",
        },
        {
          id: "over-window-concept-where-filter",
          question: "A query uses WHERE department <> 'HR' and SUM(salary) OVER (). The employees are 1 (IT, 5000), 2 (IT, 6000), 3 (HR, 4000) and 4 (HR, 4500). What total appears on each returned row?",
          options: ["11000", "19500", "8500", "5500"],
          correctIndex: 0,
          explanation: "A window function works on the rows that remain after WHERE, GROUP BY and HAVING. After the HR rows are filtered out, only the two IT rows are left, so the window total is 5000 + 6000 = 11000.",
        },
      ],
    },
  ],
};

const partitionBy: LessonContent = {
  slug: "partition-by",
  title: "PARTITION BY",
  subtitle: "Independent windows per group / multiple partition keys / partition vs GROUP BY",
  sections: [
    {
      kind: "prose",
      body: ["In the previous lesson, you learned:"],
    },
    {
      kind: "list",
      items: [
        "`SUM(amount)` calculates an aggregate.",
        "`SUM(amount) OVER ()` calculates a total across all available rows while preserving individual rows.",
      ],
    },
    {
      kind: "prose",
      body: [
        "Now we will answer an important question:",
        "What if you want to calculate a separate total for each customer, department, or category?",
        "This is where `PARTITION BY` becomes useful.",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why do we need PARTITION BY?",
      body: ["Suppose you work for an **e-commerce company**. You have this orders table:"],
    },
    {
      kind: "table",
      caption: "The orders table",
      headers: ["order_id", "customer_id", "amount"],
      rows: [
        ["101", "A", "100"],
        ["102", "A", "200"],
        ["103", "B", "150"],
        ["104", "B", "250"],
        ["105", "B", "100"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Your manager asks: Show every order and the total money spent by the customer who placed that order.",
        "You cannot use `SUM(amount) OVER ()` alone because it calculates the total across all five orders.",
        "You need a separate total for each customer.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The idea",
      body: "`PARTITION BY` solves this problem by dividing rows into independent groups for the window calculation.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of separate rooms",
      body: ["Imagine five customers' order slips on a desk. You place the slips into separate rooms according to their `customer_id`."],
    },
    {
      kind: "visual",
      id: "window-order-slips",
      caption: "Order slips in separate rooms",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Remember",
      body: "`PARTITION BY` divides the rows for a calculation. It does not remove or combine the original rows.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How does PARTITION BY work?",
      body: ["Consider this PostgreSQL expression:"],
    },
    {
      kind: "code",
      language: "text",
      caption: "Window function syntax with PARTITION BY",
      code: `SUM(amount) OVER (
    PARTITION BY customer_id
)`,
    },
    {
      kind: "prose",
      body: [
        "**PostgreSQL** conceptually performs these steps:",
        "1. **Read** the rows available to the `window function`.",
        "2. **Divide** those rows into partitions based on `customer_id`.",
        "3. **Calculate** `SUM(amount)` independently for each partition.",
        "4. **Attach** the relevant customer's total to every order row.",
      ],
    },
    {
      kind: "prose",
      heading: "Understand the syntax",
      body: [],
    },
    {
      kind: "table",
      caption: "Reading the syntax",
      headers: ["SQL component", "Purpose"],
      rows: [
        ["SUM(amount)", "Calculate the total amount"],
        ["OVER (...)", "Apply the function over a window"],
        ["PARTITION BY customer_id", "Create one partition for each customer"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Unlike `GROUP BY`, `PARTITION BY` does not collapse the individual orders.",
        "Also, `PARTITION BY` does not sort rows. We will study ordering in the next lesson.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Compare the results",
      body: ["Compare the same five orders with and without `PARTITION BY`."],
    },
    {
      kind: "animation",
      variant: "q-window-partition-by",
      caption: "The same five orders with OVER () and with OVER (PARTITION BY customer_id).",
    },
    {
      kind: "prose",
      body: ["**Example A: Without PARTITION BY**"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "SUM with an empty OVER ()",
      code: `SELECT
    order_id,
    customer_id,
    amount,
    SUM(amount) OVER () AS total_amount
FROM orders
ORDER BY order_id;`,
    },
    {
      kind: "table",
      caption: "Result: 5 rows, every row gets the overall total",
      headers: ["order_id", "customer_id", "amount", "total_amount"],
      rows: [
        ["101", "A", "100", "800"],
        ["102", "A", "200", "800"],
        ["103", "B", "150", "800"],
        ["104", "B", "250", "800"],
        ["105", "B", "100", "800"],
      ],
    },
    {
      kind: "prose",
      body: ["Every row receives the overall total: 800."],
    },
    {
      kind: "prose",
      body: ["**Example B: With PARTITION BY**"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "SUM with PARTITION BY customer_id",
      code: `SELECT
    order_id,
    customer_id,
    amount,
    SUM(amount) OVER (
        PARTITION BY customer_id
    ) AS customer_total
FROM orders
ORDER BY order_id;`,
    },
    {
      kind: "visual",
      id: "window-partition-explorer",
      caption: "Explore each partition",
    },
    {
      kind: "prose",
      body: ["Notice that the rows for customer A receive 300, while the rows for customer B receive 500."],
    },
    {
      kind: "prose",
      heading: "Important comparison",
      body: [],
    },
    {
      kind: "table",
      caption: "Three ways to total the same orders",
      headers: ["SQL", "Calculation"],
      rows: [
        ["SUM(amount) OVER ()", "Total across all available rows"],
        ["SUM(amount) OVER (PARTITION BY customer_id)", "Separate total for each customer"],
        ["GROUP BY customer_id with SUM(amount)", "One summary row per customer"],
      ],
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Limitations and common mistakes",
      body: ["Watch for these mistakes when you first use `PARTITION BY`."],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Mistake 3: choosing the wrong partition key",
      body: "If you partition by `order_id`, and every order ID is unique, each partition contains only one order. Then `SUM(amount)` returns that order's own amount, not its customer's total.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Fails to give customer totals: partitioning by order_id",
      code: `SELECT
    order_id,
    customer_id,
    amount,
    SUM(amount) OVER (
        PARTITION BY order_id
    ) AS customer_total
FROM orders
ORDER BY order_id;`,
    },
    {
      kind: "table",
      caption: "Result: every partition holds one order, so customer_total equals amount",
      headers: ["order_id", "customer_id", "amount", "customer_total"],
      rows: [
        ["101", "A", "100", "100"],
        ["102", "A", "200", "200"],
        ["103", "B", "150", "150"],
        ["104", "B", "250", "250"],
        ["105", "B", "100", "100"],
      ],
    },
    {
      kind: "list",
      heading: "Important limitations",
      items: [
        "**Mistake 1:** thinking `PARTITION BY` is the same as `GROUP BY`. Both organize rows into groups. However, `GROUP BY` produces summary groups, while window partitioning retains individual result rows.",
        "**Mistake 2:** thinking `PARTITION BY` sorts rows. It defines partitions, not their output order. Use the query's outer `ORDER BY` when you need a guaranteed display order.",
        "**Performance consideration:** window functions can require extra memory and sorting. Large partitions can increase query cost. A grouped aggregate may be more suitable when you need only one summary row per customer.",
      ],
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Solve it yourself",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-department-average-partition",
      title: "Show each employee beside their department average",
      prompt: "Write a query returning: employee_id, department, salary, department_avg. Use AVG() with OVER() and PARTITION BY. Do not use GROUP BY, a CTE, or a subquery.",
      playgroundHref: "/sql-playground?practice=cycledepot-department-average-partition",
    },
    {
      kind: "takeaways",
      items: [
        "`PARTITION BY` divides the rows into independent groups for a **window function**. It does not remove or combine the original rows.",
        "`SUM(amount) OVER (PARTITION BY customer_id)` gives each order its own customer's total.",
        "Unlike `GROUP BY`, `PARTITION BY` keeps every individual row.",
        "`PARTITION BY` does not sort rows. Use the outer `ORDER BY` for a guaranteed display order.",
        "Choose the partition key with care: partitioning by a unique column gives every row its own partition.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "partition-by-controls-and-row-count",
          question: "What does `PARTITION BY` control, and why does it not reduce the number of output rows?",
          options: [
            "It controls how rows are divided into groups for a window function. It does not reduce the rows because the window function calculates a result for each original row.",
            "It controls the sort order of the output. It keeps every row because sorting never removes rows.",
            "It controls which rows are filtered out. It keeps every row because the filter runs after the window function.",
            "It controls how rows are combined into one summary row per group, so the output always has one row per partition.",
          ],
          correctIndex: 0,
          explanation: "PARTITION BY controls how rows are divided into groups for a window function. It doesn't reduce the number of rows because the window function calculates a result for each original row. If a partition contains only one row, the window calculation is performed using just that one row. For example, if you use AVG(salary) and every partition has one employee, each employee's average will simply equal their own salary.",
        },
        {
          id: "partition-by-vs-group-by",
          question: "What is the difference between `PARTITION BY` and `GROUP BY` in PostgreSQL? What happens if you omit `PARTITION BY` from a window function?",
          options: [
            "GROUP BY combines rows and returns one summary row per group. PARTITION BY keeps the rows available to the window function and calculates a window result for each row within its group. If you omit PARTITION BY, the window function treats the entire result set as one partition.",
            "PARTITION BY combines rows and returns one summary row per group. GROUP BY keeps every row. If you omit PARTITION BY, the window function returns an error.",
            "They are two names for the same thing. If you omit PARTITION BY, each row becomes its own partition.",
            "GROUP BY sorts the rows and PARTITION BY filters them. If you omit PARTITION BY, the window function ignores NULL values.",
          ],
          correctIndex: 0,
          explanation: "GROUP BY combines rows and returns one summary row per group. PARTITION BY keeps the rows available to the window function and calculates a window result for each row within its group. If you omit PARTITION BY, the window function treats the entire result set as one partition, which is why SUM(amount) OVER () gives every row the same total.",
        },
        {
          id: "partition-by-correct-query",
          question: "An orders table has order_id, customer_id and amount. Which query shows every order with the number of orders placed by that order's customer?",
          options: [
            "SELECT order_id, customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS orders_by_customer FROM orders;",
            "SELECT order_id, customer_id, COUNT(*) OVER () PARTITION BY customer_id AS orders_by_customer FROM orders;",
            "SELECT order_id, customer_id, COUNT(*) PARTITION BY customer_id AS orders_by_customer FROM orders;",
            "SELECT order_id, customer_id, COUNT(*) OVER (customer_id) AS orders_by_customer FROM orders;",
          ],
          correctIndex: 0,
          explanation: "PARTITION BY belongs inside the OVER parentheses: COUNT(*) OVER (PARTITION BY customer_id). Putting it after OVER () or without OVER is a syntax error, and OVER (customer_id) is read as a window name, not a partition.",
        },
        {
          id: "partition-by-wrong-key",
          question: "In the orders table every order_id is unique. What does `SUM(amount) OVER (PARTITION BY order_id)` return for order 103, which has an amount of 150?",
          options: ["150", "500", "800", "250"],
          correctIndex: 0,
          explanation: "Every order_id is unique, so each partition holds exactly one order. The sum of a single row is that row's own amount, 150, not the customer's total of 500.",
        },
      ],
    },
  ],
};

const orderByInOver: LessonContent = {
  slug: "order-by-in-over",
  title: "ORDER BY inside OVER()",
  subtitle: "ORDER BY in OVER / running totals / ordering vs output ORDER BY / tie-breaking",
  sections: [
    {
      kind: "prose",
      body: ["In your previous lessons, you mastered:"],
    },
    {
      kind: "list",
      items: [
        "`OVER()`: defines a window for a calculation.",
        "`PARTITION BY`: divides rows into independent partitions.",
        "**Window functions** preserve individual result rows.",
      ],
    },
    {
      kind: "prose",
      body: [
        "Today, you will learn how `ORDER BY` controls the order of rows within a window.",
        "This is important for ranking, running totals, moving averages, `LAG()`, `LEAD()`, sessionization, and gaps-and-islands problems.",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why do we need ORDER BY inside OVER()?",
      body: [
        "Suppose you work at an e-commerce company.",
        "Your manager asks: Show each customer's orders in chronological order and calculate the cumulative amount spent after each order.",
        "Consider this orders table:",
      ],
    },
    {
      kind: "table",
      caption: "The orders table",
      headers: ["order_id", "customer_id", "order_date", "amount"],
      rows: [
        ["101", "A", "2026-01-01", "100"],
        ["102", "A", "2026-01-03", "200"],
        ["103", "B", "2026-01-02", "150"],
        ["104", "B", "2026-01-05", "250"],
        ["105", "A", "2026-01-06", "50"],
      ],
    },
    {
      kind: "prose",
      body: ["You already know how to calculate customer totals:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A customer total with PARTITION BY",
      code: `SUM(amount) OVER (
    PARTITION BY customer_id
)`,
    },
    {
      kind: "prose",
      body: [
        "However, this returns the customer's total across all their orders. It does not calculate how much the customer had spent after each successive order.",
        "To calculate a running total, the order of transactions matters.",
        "That is why we use `ORDER BY` inside `OVER()`.",
      ],
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of a running scoreboard",
      body: ["Imagine a scoreboard that tracks customer A's purchases."],
    },
    {
      kind: "visual",
      id: "window-scoreboard",
      caption: "Customer A's running scoreboard",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The key difference",
      body: "Each new purchase adds to the previous total. Think of `PARTITION BY` as selecting the customer's scoreboard. Think of `ORDER BY` as deciding the sequence of entries on that scoreboard.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How does ORDER BY work inside OVER()?",
      body: ["A window specification can contain both partitioning and ordering:"],
    },
    {
      kind: "code",
      language: "text",
      caption: "Window function syntax with PARTITION BY and ORDER BY",
      code: `SUM(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
)`,
    },
    {
      kind: "table",
      caption: "Reading the syntax",
      headers: ["Part", "Role", "Required?"],
      rows: [
        ["PARTITION BY customer_id", "Selects each customer's own scoreboard", "No"],
        ["ORDER BY order_date", "Sets the sequence of rows inside each partition", "No"],
        ["Window frame", "Decides which rows around the current row are used. A default applies when you write none.", "No"],
      ],
    },
    {
      kind: "prose",
      body: [
        "PostgreSQL conceptually follows these steps:",
        "1. Divide the orders by `customer_id`.",
        "2. Determine the order of rows within each customer partition using `order_date`.",
        "3. Apply the window function using the specified ordering and applicable window frame.",
        "4. Return the result on each original row.",
      ],
    },
    {
      kind: "prose",
      heading: "Important: ORDER BY inside vs outside OVER()",
      body: ["These two clauses have different jobs."],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Inside OVER()",
      code: `SUM(amount) OVER (
    ORDER BY order_date
)`,
    },
    {
      kind: "prose",
      body: ["Inside `OVER()`, `ORDER BY` defines the order used by the window calculation."],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Outside OVER()",
      code: `SELECT *
FROM orders
ORDER BY order_date;`,
    },
    {
      kind: "prose",
      body: [
        "Outside `OVER()`, `ORDER BY` controls the final display order of the query's result.",
        "One does not replace the other.",
      ],
    },
    {
      kind: "prose",
      heading: "A critical PostgreSQL rule",
      body: ["For an aggregate window function with `ORDER BY`, PostgreSQL's default frame is generally:"],
    },
    {
      kind: "code",
      language: "text",
      caption: "The default frame",
      code: `RANGE BETWEEN UNBOUNDED PRECEDING
          AND CURRENT ROW`,
    },
    {
      kind: "prose",
      body: [
        "The `CURRENT ROW` boundary in a `RANGE` frame includes rows tied on the window's ordering values, called **peers**.",
        "This means `SUM(amount) OVER (ORDER BY order_date)` often behaves like a running total. But orders that have the same date can receive the same cumulative total.",
        "We will learn the full difference between `ROWS` and `RANGE` in the next lesson. For now, all orders in our example have distinct dates within each customer.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Running totals",
      body: ["Consider this query:"],
    },
    {
      kind: "animation",
      variant: "q-window-order-by-running-total",
      caption: "Step through the calculation one order at a time for customer A and customer B, then see the final output.",
    },
    {
      kind: "prose",
      body: [
        "Notice that customer B starts with a new running total. Customer A's purchases do not affect customer B's calculation.",
      ],
    },
    {
      kind: "prose",
      heading: "Another use: ROW_NUMBER()",
      body: ["`ORDER BY` also determines the sequence for ranking functions:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "ROW_NUMBER() uses the window ORDER BY",
      code: `SELECT
    order_id,
    customer_id,
    order_date,
    ROW_NUMBER() OVER (
        PARTITION BY customer_id
        ORDER BY order_date
    ) AS order_sequence
FROM orders;`,
    },
    {
      kind: "prose",
      body: [
        "This gives each order a sequence number within its customer's orders. For customer A, the sequence is 1, 2, 3. For customer B, the sequence is 1, 2.",
      ],
    },
    {
      kind: "table",
      caption: "order_sequence for each order",
      headers: ["order_id", "customer_id", "order_date", "order_sequence"],
      rows: [
        ["101", "A", "2026-01-01", "1"],
        ["102", "A", "2026-01-03", "2"],
        ["105", "A", "2026-01-06", "3"],
        ["103", "B", "2026-01-02", "1"],
        ["104", "B", "2026-01-05", "2"],
      ],
    },
    {
      kind: "prose",
      body: ["We will study `ROW_NUMBER()` in detail in the Ranking & Distribution module."],
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Common mistakes and limitations",
      body: ["Watch for these when you add `ORDER BY` to a window."],
    },
    {
      kind: "list",
      heading: "Important limitations",
      items: [
        "**Assume window** `ORDER BY` **sorts final output:** only the **outer** `ORDER BY` guarantees final result order.",
        "**Forget** `PARTITION BY` **:** a calculation can combine orders from different customers.",
        "**Use a nonunique ordering column:** tied rows can produce unexpected results.",
        "**Assume adding** `ORDER BY` **only changes sorting:** for aggregate windows, it can also change the default window frame.",
        "**Order by the wrong column:** the calculation follows the wrong business sequence.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Interview edge case: tied dates",
      body: "If two orders have the same `order_date`, PostgreSQL treats them as peers under the default `RANGE` frame. Their running totals can include both orders at once.",
    },
    {
      kind: "prose",
      heading: "Why can tied rows get the same running total?",
      body: [
        "With the default `RANGE` frame, rows having equal window `ORDER BY` values are peers. The frame includes those peers together.",
        "Consider three sales by one employee. Two sales share the same date. Step through how PostgreSQL calculates the running total.",
      ],
    },
    {
      kind: "animation",
      variant: "q-window-peers-ties",
      caption: "Tied rows under the default frame, then a strict ROWS frame with a tie-breaker.",
    },
    {
      kind: "list",
      heading: "What to remember",
      items: [
        "Both February 1 rows receive 300 because their ordering values are equal, so both belong to the same peer group. The February 2 row receives 350.",
        "An explicit `ROWS` frame can produce a row-by-row running total. However, it does not automatically resolve ties in ordering. You also need a unique tie-breaker, such as `sale_id`, to get a deterministic sequence.",
        "This distinction is important in interviews involving financial balances, transaction logs, and event sequences.",
      ],
    },
    {
      kind: "prose",
      body: [
        "If you need strict row-by-row accumulation, you normally need a deterministic order and an explicit `ROWS` frame. For example:",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Works: a unique tie-breaker and an explicit ROWS frame",
      code: `SUM(amount) OVER (
    PARTITION BY employee_id
    ORDER BY sale_date, sale_id
    ROWS BETWEEN UNBOUNDED PRECEDING
             AND CURRENT ROW
)`,
    },
    {
      kind: "prose",
      body: ["You do not need to master that syntax today. We will study it in the next lesson."],
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Your turn",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-employee-running-total",
      title: "Show a running total of sales for each employee",
      prompt: "Write a query that returns these columns: employee_id, sale_id, sale_date, amount, running_total. Calculate a running total separately for each employee. Follow chronological order using sale_date. Display employees in ascending order, then their sales by date. Preserve all five sales. Do not use GROUP BY, CTEs, or subqueries.",
      playgroundHref: "/sql-playground?practice=cycledepot-employee-running-total",
    },
    {
      kind: "takeaways",
      items: [
        "`ORDER BY` inside `OVER()` defines the order used by the window calculation, which is what makes a **running total** possible.",
        "Outside `OVER()`, `ORDER BY` controls the final display order. One does not replace the other.",
        "For aggregate windows, the window `ORDER BY` also changes the default frame to `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.",
        "Rows with equal ordering values are peers, and under the default frame they can receive the same running total.",
        "For strict row-by-row accumulation, use a unique tie-breaker and an explicit `ROWS` frame.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "order-by-in-over-inside-vs-outside",
          question: "What is the difference between `ORDER BY` inside `OVER()` and `ORDER BY` at the end of a SQL query? What happens when you use `ORDER BY` inside an aggregate window function?",
          options: [
            "The outer ORDER BY controls the final output order, while the window ORDER BY controls ordering within the window calculation. For aggregate window functions, the window ORDER BY can also change which rows contribute, because it changes the default window frame.",
            "They are the same. The window ORDER BY also sorts the final output, and it never changes the result of an aggregate.",
            "The outer ORDER BY controls the window calculation, and the window ORDER BY controls the final display order.",
            "The window ORDER BY only sorts rows before the calculation, so SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) gives the same total as the same expression without ORDER BY.",
          ],
          correctIndex: 0,
          explanation: "The outer ORDER BY controls the final output order, while the window ORDER BY controls ordering within the window calculation. However, saying the window ORDER BY simply sorts rows before calculation is incomplete. For aggregate window functions, ORDER BY can also affect which rows contribute to the result, because it changes the default window frame. For example, a running total can differ from a full-partition total even when both queries use the same partition.",
        },
        {
          id: "order-by-in-over-tied-running-total",
          question: "An employee has three sales: sale 1 on 2026-02-01 for 100, sale 2 on 2026-02-01 for 200, and sale 3 on 2026-02-02 for 50. With SUM(amount) OVER (PARTITION BY employee_id ORDER BY sale_date), what running totals do sales 1, 2 and 3 get under PostgreSQL's default frame?",
          options: ["300, 300, 350", "100, 300, 350", "100, 200, 50", "350, 350, 350"],
          correctIndex: 0,
          explanation: "With the default RANGE frame, rows having equal window ORDER BY values are peers, and the frame includes those peers together. Both February 1 rows receive 300 because they belong to the same peer group, and the February 2 row receives 350. An explicit ROWS frame can produce a row-by-row running total, but it does not resolve ties by itself. You also need a unique tie-breaker, such as sale_id, to get a deterministic sequence.",
        },
        {
          id: "order-by-in-over-correct-query",
          question: "An orders table has order_id, customer_id, order_date and amount. Which query shows each order with the running total of that customer's spending, in date order?",
          options: [
            "SELECT order_id, customer_id, order_date, amount, SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total FROM orders ORDER BY customer_id, order_date;",
            "SELECT order_id, customer_id, order_date, amount, SUM(amount) OVER (ORDER BY order_date PARTITION BY customer_id) AS running_total FROM orders ORDER BY customer_id, order_date;",
            "SELECT order_id, customer_id, order_date, amount, SUM(amount) OVER (PARTITION BY customer_id) AS running_total FROM orders ORDER BY customer_id, order_date;",
            "SELECT order_id, customer_id, order_date, amount, SUM(amount) OVER () AS running_total FROM orders ORDER BY order_date;",
          ],
          correctIndex: 0,
          explanation: "The window needs both PARTITION BY customer_id and ORDER BY order_date, in that order. Writing ORDER BY before PARTITION BY is a syntax error. Without the window ORDER BY the sum is the full customer total on every row, and OVER () with only an outer ORDER BY gives the same grand total on every row.",
        },
        {
          id: "order-by-in-over-display-order",
          question: "A query uses SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) and has no ORDER BY at the end. What can you rely on about the order of the returned rows?",
          options: [
            "Nothing is guaranteed, so add an outer ORDER BY when the display order matters",
            "The rows come back sorted by order_date because of the window ORDER BY",
            "The rows come back sorted by customer_id and then order_date",
            "The rows come back in the order they were inserted",
          ],
          correctIndex: 0,
          explanation: "The window ORDER BY only defines the order used by the window calculation. Only the outer ORDER BY guarantees the order of the final result.",
        },
      ],
    },
  ],
};

const defaultFramesPeers: LessonContent = {
  slug: "default-frames-peers",
  title: "Default Window Frames and Peers",
  subtitle: "default frame / RANGE vs ROWS / peer rows / ties in running totals",
  sections: [
    {
      kind: "prose",
      body: ["In Previous Lessons, you learned that:"],
    },
    {
      kind: "list",
      items: [
        "`PARTITION BY` divides rows into partitions.",
        "Window `ORDER BY` defines the logical order within each partition.",
        "Rows with equal window ordering values are called **peers**.",
      ],
    },
    {
      kind: "prose",
      body: [
        "In this lesson, you will learn which rows PostgreSQL includes in a window calculation when you do not specify a frame.",
        "This is an important foundation for running totals and moving averages.",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why do window frames exist?",
      body: ["Imagine a bank transaction table."],
    },
    {
      kind: "table",
      caption: "The transactions table",
      headers: ["txn_id", "txn_date", "amount"],
      rows: [
        ["1", "Jan 1", "100"],
        ["2", "Jan 2", "200"],
        ["3", "Jan 2", "50"],
        ["4", "Jan 3", "150"],
      ],
    },
    {
      kind: "prose",
      body: [
        "You want a running account balance.",
        "But a problem exists: two transactions have the same date. Two questions follow:",
      ],
    },
    {
      kind: "list",
      items: [
        "Should the balance after transaction 2 include transaction 3?",
        "Should both transactions show the same balance?",
      ],
    },
    {
      kind: "prose",
      body: ["The answer depends on which rows the window frame contains."],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The idea",
      body: "A **window frame** defines the subset of rows within a partition used by frame-sensitive window calculations.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of a moving selection box",
      body: [
        "Imagine the transactions arranged by date.",
        "A window frame is a selection box that determines which transaction amounts contribute to the current total.",
      ],
    },
    {
      kind: "visual",
      id: "window-frame-selector",
      caption: "Default PostgreSQL frame with ORDER BY txn_date",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Key idea",
      body: "The default frame includes all earlier ordering values and every row tied with the current row's ordering value.",
    },
    {
      kind: "prose",
      heading: "3. HOW: PostgreSQL's default window frame",
      body: [
        "When an aggregate window function has an `ORDER BY` but no explicit frame clause, PostgreSQL uses a frame equivalent to:",
      ],
    },
    {
      kind: "code",
      language: "text",
      caption: "The default frame",
      code: `RANGE BETWEEN UNBOUNDED PRECEDING
          AND CURRENT ROW`,
    },
    {
      kind: "prose",
      body: ["Let's understand each term."],
    },
    {
      kind: "table",
      caption: "Reading the syntax",
      headers: ["Keyword", "Meaning"],
      rows: [
        ["RANGE", "Uses ordering values and their peer groups to determine frame boundaries"],
        ["UNBOUNDED PRECEDING", "Begin at the first row of the partition"],
        ["CURRENT ROW", "Under RANGE, end at the last peer of the current row"],
      ],
    },
    {
      kind: "prose",
      heading: "What exactly is a peer group?",
      body: [
        "Rows are peers when their values are equal for all expressions in the window's `ORDER BY` clause.",
        "For example:",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Ordering by date only",
      code: `ORDER BY txn_date`,
    },
    {
      kind: "prose",
      body: [
        "Transactions 2 and 3 are peers because both have the date January 2.",
        "But consider:",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Ordering by date and a unique id",
      code: `ORDER BY txn_date, txn_id`,
    },
    {
      kind: "prose",
      body: [
        "If `txn_id` is unique, transactions 2 and 3 are no longer peers. Their combined ordering values differ.",
      ],
    },
    {
      kind: "prose",
      heading: "Three cases to remember",
      body: [],
    },
    {
      kind: "table",
      caption: "What an aggregate window uses",
      headers: ["Window specification", "Aggregate calculation uses"],
      rows: [
        ["OVER ()", "Entire partition"],
        ["OVER (ORDER BY txn_date)", "Default cumulative RANGE frame, including peers"],
        ["OVER (PARTITION BY account_id)", "Entire partition for each account"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Important",
      body: "Different window functions can use ordering differently. Ranking functions, for example, do not use the frame in the same way as `SUM()`.",
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Observe the peer-group behavior",
      body: [""],
    },
    {
      kind: "animation",
      variant: "q-window-default-frames-peers",
      caption: "Step through the default frame, then the explicit ROWS frame.",
    },
    {
      kind: "prose",
      body: [
        "Notice that both January 2 transactions receive 350.",
        "They are **peers**. The default frame includes both amounts when calculating either row's result.",
      ],
    },
    {
      kind: "prose",
      heading: "Compare it with an explicit ROWS frame",
      body: [],
    },
    {
      kind: "code",
      language: "sql",
      caption: "An explicit ROWS frame with a tie-breaker",
      code: `SELECT
    txn_id,
    txn_date,
    amount,
    SUM(amount) OVER (
        ORDER BY txn_date, txn_id
        ROWS BETWEEN UNBOUNDED PRECEDING
                 AND CURRENT ROW
    ) AS running_total
FROM transactions
ORDER BY txn_date, txn_id;`,
    },
    {
      kind: "table",
      caption: "Result with the ROWS frame: 4 rows",
      headers: ["txn_id", "txn_date", "amount", "running_total"],
      rows: [
        ["1", "Jan 1", "100", "100"],
        ["2", "Jan 2", "200", "300"],
        ["3", "Jan 2", "50", "350"],
        ["4", "Jan 3", "150", "500"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Here, the running total advances one row at a time. The unique `txn_id` acts as a tie-breaker.",
        "We will study `ROWS` and `RANGE` in much greater detail in the dedicated Advanced Window Frames module.",
      ],
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Common mistakes and failure modes",
      body: [""],
    },
    {
      kind: "list",
      heading: "Important limitations",
      items: [
        "**Assume** `CURRENT ROW` **always means only the physical current row:** with `RANGE`, it includes **peers** at the boundary.",
        "**Assume** `OVER (ORDER BY date)` **is always row-by-row:** rows with equal dates can share results.",
        "**Assume** `ROWS` **automatically creates a deterministic order:** you still need an adequate **tie-breaker**.",
        "**Assume the default frame is always the full partition:** an aggregate window with `ORDER BY` normally has a **cumulative default frame**.",
        "**Assume the final** `ORDER BY` **changes frame behavior:** only window ordering and framing define the window calculation.",
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Important interview scenario",
      body: "In financial systems, transactions may have identical timestamps. If you need a balance after each individual transaction, you must define a reliable sequence. A date alone may not be sufficient.",
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Your turn",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-ties-running-total",
      title: "Build a deterministic running total for tied sales",
      prompt: "Write a query that produces a deterministic row-by-row running total for the same four sales. Required columns: sale_id, sale_date, amount, running_total. Use SUM(amount) OVER (...). Order the calculation by date and use sale_id as the tie-breaker. Specify an explicit ROWS frame. Display the final result by sale_date, then sale_id. Do not use a CTE or subquery. Do not refer to the worked example when answering. Write the full query yourself.",
      playgroundHref: "/sql-playground?practice=cycledepot-ties-running-total",
    },
    {
      kind: "takeaways",
      items: [
        "`PARTITION BY` defines the groups of rows.",
        "Window `ORDER BY` defines their logical order.",
        "The **window frame** defines which rows contribute to a frame-sensitive calculation.",
        "With an aggregate window and `ORDER BY` but no frame clause, PostgreSQL uses `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`, so rows tied on the ordering value (peers) share one result.",
        "For a deterministic row-by-row running total, use an explicit `ROWS` frame and a unique ordering key.",
        "Only window ordering and framing define the window calculation. The final `ORDER BY` does not change it.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "default-frames-peers-running-totals",
          question: "A transactions table has txn_id 1 (Jan 1, 100), txn_id 2 (Jan 2, 200), txn_id 3 (Jan 2, 50) and txn_id 4 (Jan 3, 150). With SUM(amount) OVER (ORDER BY txn_date), what running totals do transactions 1, 2, 3 and 4 get?",
          options: ["100, 350, 350, 500", "100, 300, 350, 500", "100, 200, 50, 150", "500, 500, 500, 500"],
          correctIndex: 0,
          explanation: "The default RANGE frame ends at the last peer of the current row. Transactions 2 and 3 share the date Jan 2, so both frames include both amounts and both rows get 100 + 200 + 50 = 350. Transaction 4 then adds 150 for 500.",
        },
        {
          id: "default-frames-peers-approach",
          question: "You need the account balance after each individual transaction, even when several transactions share a date. Which approach fits?",
          options: [
            "ORDER BY txn_date, txn_id with an explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW frame",
            "ORDER BY txn_date alone, and rely on the default frame",
            "OVER () with no ORDER BY",
            "A final ORDER BY txn_date, txn_id and the default frame",
          ],
          correctIndex: 0,
          explanation: "A unique tie-breaker gives every row a definite place in the sequence, and the explicit ROWS frame counts physical rows instead of peers. A date alone leaves ties as peers, OVER () uses the whole partition, and a final ORDER BY does not change the window calculation.",
        },
        {
          id: "default-frames-peers-correct-query",
          question: "A transactions table has txn_id, txn_date and amount. Which expression gives a row-by-row running total with a deterministic order?",
          options: [
            "SUM(amount) OVER (ORDER BY txn_date, txn_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
            "SUM(amount) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ORDER BY txn_date, txn_id)",
            "SUM(amount) OVER (ORDER BY txn_date)",
            "SUM(amount) OVER (ORDER BY txn_date RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
          ],
          correctIndex: 0,
          explanation: "The frame clause comes after ORDER BY, so the second option is a syntax error. The third option uses the default frame, so tied dates share a total. The fourth is the default frame written out, so tied dates still share a total. Only the first has a unique tie-breaker and an explicit ROWS frame.",
        },
        {
          id: "default-frames-peers-current-row",
          question: "In a RANGE frame, what does CURRENT ROW include at the end of the frame?",
          options: [
            "The current row and every peer tied with it on the window ORDER BY values",
            "Only the physical current row",
            "Every row of the partition",
            "Only the rows before the current row",
          ],
          correctIndex: 0,
          explanation: "Under RANGE, CURRENT ROW ends at the last peer of the current row. Rows that tie on the window's ordering values are included together, which is why they can share one result.",
        },
      ],
    },
  ],
};

const sqlLogicalExecutionOrder: LessonContent = {
  slug: "sql-logical-execution-order",
  title: "SQL Logical Execution Order",
  subtitle: "FROM / WHERE / GROUP BY / HAVING / window / SELECT / ORDER BY / why windows cannot appear in WHERE",
  sections: [
    {
      kind: "prose",
      body: [
        "In your previous lessons, you mastered `OVER()`, `PARTITION BY`, window ordering, peer groups, and window frames.",
        "In this lesson, you will learn when PostgreSQL evaluates window functions in relation to other SQL clauses.",
        "This concept is important because it explains why some SQL queries work and others fail, even when their window-function syntax is correct.",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why can't a window function go in WHERE?",
      body: [
        "Imagine you work as a data engineer. You have an employees table:",
      ],
    },
    {
      kind: "table",
      caption: "The employees table",
      headers: ["employee_id", "department", "salary"],
      rows: [
        ["1", "IT", "5000"],
        ["2", "IT", "6000"],
        ["3", "IT", "7000"],
        ["4", "HR", "4000"],
        ["5", "HR", "4500"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Your manager asks: Find employees whose salaries are above their department's average salary.",
        "You might try:",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Fails: a window function directly in WHERE",
      code: `SELECT
    employee_id,
    department,
    salary
FROM employees
WHERE salary > AVG(salary) OVER (
    PARTITION BY department
);`,
    },
    {
      kind: "prose",
      body: [
        "This query is invalid in PostgreSQL. Why?",
        "The problem is not the `AVG()` calculation. The problem is where you tried to use the window function.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The idea",
      body: "PostgreSQL evaluates the `WHERE` filter logically before it evaluates **window functions**. Therefore, a window-function result is not available to `WHERE` in the same query level.",
    },
    {
      kind: "prose",
      body: ["To solve this, we need to understand SQL's logical processing order."],
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of a factory",
      body: ["Imagine that a factory processes employees in several stages."],
    },
    {
      kind: "visual",
      id: "window-execution-order",
      caption: "Employee records moving through the logical order",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Simplified order",
      body: "This is a simplified logical order, not a literal physical execution plan. PostgreSQL's optimizer may execute operations differently while preserving SQL semantics.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "The main rule",
      body: "**Window functions** operate after `WHERE`, `GROUP BY`, and `HAVING`, but before final result ordering and limiting.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How PostgreSQL evaluates a window query",
      body: ["Consider:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A window function after WHERE",
      code: `SELECT
    employee_id,
    department,
    salary,
    AVG(salary) OVER () AS average_salary
FROM employees
WHERE salary >= 5000
ORDER BY employee_id;`,
    },
    {
      kind: "prose",
      body: [
        "PostgreSQL conceptually performs these operations:",
        "1. `FROM` provides the employee records.",
        "2. `WHERE` removes employees with salaries below 5000.",
        "3. `AVG(salary) OVER ()` calculates the average using the remaining rows.",
        "4. `SELECT` returns the requested columns and calculated result.",
        "5. `ORDER BY` sorts the final rows.",
        "The window function sees only employees who passed the `WHERE` filter.",
      ],
    },
    {
      kind: "table",
      caption: "Where a window function can appear",
      headers: ["Clause", "Window function allowed?"],
      rows: [
        ["SELECT", "Yes"],
        ["Final ORDER BY", "Yes"],
        ["WHERE", "No"],
        ["GROUP BY", "No"],
        ["HAVING", "No"],
      ],
    },
    {
      kind: "prose",
      body: [
        "In PostgreSQL, window functions can appear in the select list and the query's `ORDER BY` clause. They cannot be used directly in `WHERE`, `GROUP BY`, or `HAVING` at the same query level.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Filtering on a window result",
      body: ["Let's return to the original employees table."],
    },
    {
      kind: "code",
      language: "sql",
      caption: "WHERE runs before the window calculation",
      code: `SELECT
    employee_id,
    department,
    salary,
    AVG(salary) OVER (
        PARTITION BY department
    ) AS department_avg
FROM employees
WHERE salary >= 5000
ORDER BY employee_id;`,
    },
    {
      kind: "table",
      caption: "Result: 3 rows",
      headers: ["employee_id", "department", "salary", "department_avg"],
      rows: [
        ["1", "IT", "5000", "6000"],
        ["2", "IT", "6000", "6000"],
        ["3", "IT", "7000", "6000"],
      ],
    },
    {
      kind: "prose",
      body: [
        "The HR employees are removed before the window calculation. The IT average happens to remain 6000 because all IT employees pass the filter.",
        "To use a window result in a filter, create a separate query level using a CTE.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "What is a CTE?",
      body: "CTE means Common Table Expression. For now, think of it as a named intermediate query result.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Calculate in a CTE, then filter outside",
      code: `WITH employee_stats AS (
    SELECT
        employee_id,
        department,
        salary,
        AVG(salary) OVER (
            PARTITION BY department
        ) AS department_avg
    FROM employees
)
SELECT
    employee_id,
    department,
    salary,
    department_avg
FROM employee_stats
WHERE salary > department_avg
ORDER BY employee_id;`,
    },
    {
      kind: "animation",
      variant: "q-window-execution-order-cte",
      caption: "Step through the inner query, then the outer query.",
    },
    {
      kind: "list",
      heading: "How the two query levels work",
      items: [
        "**Inner query, `employee_stats`:** calculate the department average for each employee.",
        "**Outer query:** read the calculated column `department_avg`, then filter employees whose salary is greater.",
      ],
    },
    {
      kind: "table",
      caption: "Result: 2 rows",
      headers: ["employee_id", "department", "salary", "department_avg"],
      rows: [
        ["3", "IT", "7000", "6000"],
        ["5", "HR", "4500", "4250"],
      ],
    },
    {
      kind: "prose",
      heading: "Why does this work?",
      body: [
        "The window function is calculated inside the CTE. The outer query then treats `department_avg` as an ordinary input column that it can use in `WHERE`.",
        "This is a common interview pattern for filtering window calculations, including ranking and deduplication.",
      ],
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Common mistakes and limitations",
      body: ["Pick the approach that matches what you need."],
    },
    {
      kind: "table",
      caption: "Choose by what you need",
      headers: ["Requirement", "Preferred approach"],
      rows: [
        ["Filter on a window result", "Calculate it in a CTE or subquery, then filter in the outer query"],
        ["Calculate over only some rows", "Filter with WHERE at the same query level, because it runs before the window"],
        ["Sort the final output", "Use the outer ORDER BY"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "A window function cannot be filtered in the same query level",
      body: "`WHERE` filters rows before window calculations at the same query level, so a window result does not exist yet when `WHERE` runs. Calculate it in a CTE or subquery, then filter outside.",
    },
    {
      kind: "list",
      heading: "Important limitations",
      items: [
        "**Use a window function directly in `WHERE`:** calculate it in a CTE or subquery, then filter outside.",
        "**Assume `WHERE` filters after window calculations:** `WHERE` filters rows before window calculations at the same query level.",
        "**Assume `OVER()` always sees the entire table:** it sees rows remaining after applicable filtering and grouping.",
        "**Assume `GROUP BY` must follow window calculations:** grouping occurs logically before window calculations.",
        "**Assume `ORDER BY` always happens before window calculations:** the final `ORDER BY` occurs later, and the window `ORDER BY` belongs to the window specification.",
      ],
    },
    {
      kind: "prose",
      heading: "Aggregate functions and window functions can work together",
      body: ["For example, PostgreSQL permits an expression such as:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A grouped aggregate inside a window function",
      code: `SUM(SUM(amount)) OVER ()`,
    },
    {
      kind: "prose",
      body: [
        "when the inner `SUM(amount)` is a grouped aggregate.",
        "This works because ordinary aggregation occurs logically before window evaluation. You do not need to master nested aggregates today, but you should recognize the processing order.",
      ],
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Your turn",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-above-average-sales",
      title: "Find sales above the overall average",
      prompt: "A manager asks: Find sales whose amount is greater than the average amount of all five sales. Write a PostgreSQL query returning: sale_id, employee_id, amount, average_amount. Calculate the average using AVG(amount) OVER (). Keep only sales whose amount is strictly greater than that average. Use a CTE. Sort the final output by sale_id. Do not use GROUP BY.",
      playgroundHref: "/sql-playground?practice=cycledepot-above-average-sales",
    },
    {
      kind: "takeaways",
      items: [
        "SQL's logical order is `FROM` / `JOIN`, `WHERE`, `GROUP BY`, `HAVING`, **window functions**, `SELECT`, then `DISTINCT` / `ORDER BY` / `LIMIT`.",
        "Window functions operate after `WHERE`, `GROUP BY`, and `HAVING`, but before final result ordering and limiting.",
        "A window function sees only the rows that passed the earlier steps, so `OVER ()` does not always mean the entire table.",
        "Window functions are allowed in the select list and the final `ORDER BY`, but not directly in `WHERE`, `GROUP BY`, or `HAVING` at the same query level.",
        "To filter on a window result, calculate it in a CTE or subquery, then filter in the outer query.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "sql-logical-execution-order-filter-before-window",
          question: "An employees table has employee 1 (IT, 5000), 2 (IT, 6000), 3 (IT, 7000), 4 (HR, 4000) and 5 (HR, 4500). What does SELECT employee_id, salary, AVG(salary) OVER () AS average_salary FROM employees WHERE salary >= 5000 return?",
          options: [
            "3 rows, each with an average_salary of 6000",
            "5 rows, each with an average_salary of 5300",
            "3 rows, each with an average_salary of 5300",
            "2 rows, each with an average_salary of 6500",
          ],
          correctIndex: 0,
          explanation: "WHERE runs before window functions, so only the three rows with a salary of 5000 or more reach AVG(salary) OVER (). Their average is (5000 + 6000 + 7000) / 3 = 6000. The average of all five employees, 5300, is never calculated because the HR rows are already gone.",
        },
        {
          id: "sql-logical-execution-order-approach",
          question: "You need the employees whose salary is above their department's average. Which approach works in PostgreSQL?",
          options: [
            "Calculate AVG(salary) OVER (PARTITION BY department) in a CTE, then filter with WHERE in the outer query",
            "Put AVG(salary) OVER (PARTITION BY department) directly in the WHERE clause",
            "Put AVG(salary) OVER (PARTITION BY department) in a HAVING clause",
            "Put AVG(salary) OVER (PARTITION BY department) in the GROUP BY clause",
          ],
          correctIndex: 0,
          explanation: "A window function cannot be used directly in WHERE, HAVING or GROUP BY at the same query level. A CTE makes the window result an ordinary column, which the outer query can filter on.",
        },
        {
          id: "sql-logical-execution-order-correct-query",
          question: "A sales table has sale_id, employee_id and amount. Which query returns the sales whose amount is above the average of all sales?",
          options: [
            "WITH s AS (SELECT sale_id, employee_id, amount, AVG(amount) OVER () AS average_amount FROM sales) SELECT sale_id, employee_id, amount, average_amount FROM s WHERE amount > average_amount ORDER BY sale_id;",
            "SELECT sale_id, employee_id, amount, AVG(amount) OVER () AS average_amount FROM sales WHERE amount > AVG(amount) OVER () ORDER BY sale_id;",
            "SELECT sale_id, employee_id, amount, AVG(amount) OVER () AS average_amount FROM sales WHERE amount > average_amount ORDER BY sale_id;",
            "SELECT sale_id, employee_id, amount, AVG(amount) OVER () AS average_amount FROM sales HAVING amount > average_amount ORDER BY sale_id;",
          ],
          correctIndex: 0,
          explanation: "Only the CTE version calculates the window result in an inner query and filters on it in the outer query. The second option puts a window function in WHERE. The third refers to a select-list alias in WHERE, which does not exist yet at that point. The fourth uses HAVING, which treats the table as one group and cannot use the select-list alias or the ungrouped columns.",
        },
        {
          id: "sql-logical-execution-order-where-window",
          question: "Why is WHERE salary > AVG(salary) OVER (PARTITION BY department) invalid in PostgreSQL?",
          options: [
            "WHERE is evaluated logically before window functions, so the window result is not available at that query level",
            "AVG cannot be used as a window function",
            "PARTITION BY is not allowed inside OVER",
            "Window functions only run after the final ORDER BY",
          ],
          correctIndex: 0,
          explanation: "The calculation itself is fine. The problem is where it is used: WHERE filters rows before window functions are evaluated, and window functions run after WHERE, GROUP BY and HAVING but before the final ORDER BY and LIMIT.",
        },
      ],
    },
  ],
};

const windowFoundationsQuiz: LessonContent = {
  slug: "window-foundations-quiz",
  title: "Window Function Foundations: Final Quiz",
  subtitle: "Test your knowledge on window function foundations.",
  sections: [],
};

const windowFoundationsCheatsheet: LessonContent = {
  slug: "window-foundations-cheatsheet",
  title: "Window Function Foundations: Cheatsheet",
  subtitle: "One-page reference for OVER(), PARTITION BY, ORDER BY, frames, and execution order.",
  sections: [],
};

// ---------- Multi-Dimensional Aggregations (GROUPING SETS) ----------
const groupingSets: LessonContent = {
  slug: "grouping-sets",
  title: "Multi-Dimensional Aggregations (GROUPING SETS / ROLLUP / CUBE)",
  subtitle: "Build related detail rows and subtotals in one grouped query, without separate UNION ALL queries.",
  sections: [
    {
      kind: "prose",
      heading: "1. The 'Why' — Conceptual Anchor",
      body: [
        "BI dashboards need totals at multiple grains — region, region+quarter, grand total. UNION ALL of separate GROUP BYs scans the table once per query.",
        "GROUPING SETS streams each row into multiple accumulator arrays simultaneously — one scan, all marginal totals.",
      ],
    },
    {
      kind: "animation",
      variant: "q-cube",
      caption: "Each row fans into multiple bucket lanes — one per grouping set.",
    },
    {
      kind: "prose",
      heading: "2. Visual Logic — Animation Blueprint",
      body: [
        "Source rows sit left; three bucket arrays (region, quarter, region×quarter) and a grand-total pill sit right.",
        "Each row fans into all three arrays and the grand-total pill simultaneously. The source scan bar shows it runs exactly once.",
        "Viewport contains region totals, quarter totals, detail rows, and the grand total. The GROUPING() column marks which dimension was rolled up.",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "One scan, every margin",
      code: `-- /* Phase 1: single pass over the fact table */
SELECT region,
       quarter,
       SUM(amount) AS revenue,
       GROUPING(region)  AS region_is_total,   -- /* 1 = aggregated out */
       GROUPING(quarter) AS quarter_is_total
FROM   sales_fact
GROUP  BY GROUPING SETS (                      -- /* Phase 2: each row fans into 4 buckets */
  (region, quarter),                           -- /* detail grain */
  (region),                                    -- /* region subtotal */
  (quarter),                                   -- /* quarter subtotal */
  ()                                           -- /* grand total */
)
ORDER  BY region NULLS LAST, quarter NULLS LAST;

-- /* ROLLUP is shorthand for hierarchical subtotals */
SELECT region, quarter, SUM(amount)
FROM   sales_fact
GROUP  BY ROLLUP (region, quarter);            -- /* = GROUPING SETS ((region,quarter),(region),()) */

-- /* CUBE is shorthand for the full lattice */
SELECT region, quarter, SUM(amount)
FROM   sales_fact
GROUP  BY CUBE (region, quarter);              -- /* every subset of the two dimensions */`,
    },
    {
      kind: "table",
      caption: "Shorthand expansions",
      headers: ["Construct", "Expands to"],
      rows: [
        ["ROLLUP(a, b)", "(a,b), (a), ()"],
        ["ROLLUP(a, b, c)", "(a,b,c), (a,b), (a), ()"],
        ["CUBE(a, b)", "(a,b), (a), (b), ()"],
        ["GROUPING SETS(...)", "Explicit list — no expansion"],
      ],
    },
    {
      kind: "table",
      caption: "4. Progression Path — curated LeetCode matrix",
      headers: ["Tier", "Problem", "Focus"],
      rows: [
        ["Warm-up [1303]", "Find the Team Size", "Basic GROUP BY producing per-key totals (warmup for marginal sums)."],
        ["Drill [1393]", "Capital Gain/Loss", "Multi-dimensional aggregation across two pivots."],
        ["Challenge [1212]", "Team Scores in Football Tournament", "Multi-grain totals fused with self-join / UNION ALL alternatives."],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Logic Trap — rollup NULLs vs data NULLs",
      body: "A NULL region can mean the source row had no region OR that region was rolled up. Read GROUPING(region) = 1 to distinguish — without it you double-count real NULLs as subtotals.",
    },
    {
      kind: "callout",
      tone: "info",
      title: "One scan vs N scans",
      body: "PostgreSQL implements GROUPING SETS as a single heap scan plus one sort — vs N scans for equivalent UNION ALL queries. Memory peaks at the largest grouping set; spills write partial aggregates to disk in batches.",
    },
    {
      kind: "takeaways",
      items: [
        "GROUPING SETS produces all marginal totals in one table pass.",
        "ROLLUP = hierarchical subtotals; CUBE = full lattice.",
        "Use GROUPING(col) to distinguish real NULLs from roll-up NULLs.",
        "Always faster than the equivalent UNION ALL of separate GROUP BYs.",
      ],
    },
  ],
};

// =============================================================
// TOPIC INDEX
// =============================================================

export const WINDOW_FUNCTION_TOPICS: Record<string, FoundationTopicMeta> = {
  "window-function-foundations": {
    slug: "window-function-foundations",
    title: "Window Function Foundations",
    category: "Advanced SQL",
    iconKey: "database",
    blurb:
      "How window functions differ from GROUP BY, what OVER() defines, and the rules that decide which rows each calculation sees.",
    lessons: [groupByVsWindow, overWindowConcept, partitionBy, orderByInOver, defaultFramesPeers, sqlLogicalExecutionOrder, windowFoundationsQuiz, windowFoundationsCheatsheet],
  },
  "multi-dimensional-aggregations": {
    slug: "multi-dimensional-aggregations",
    title: "Window Functions",
    category: "Advanced SQL",
    iconKey: "database",
    blurb:
      "Start advanced analytical SQL with multi-dimensional totals, then build toward window-function techniques.",
    lessons: [groupingSets],
  },
};
