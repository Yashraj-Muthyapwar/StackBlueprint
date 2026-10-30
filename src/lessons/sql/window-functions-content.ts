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
      body: [""],
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
        "**Inner query,** `employee_stats`**:** calculate the department average for each employee.",
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
  sections: [
    {
      kind: "assessment",
      assessmentId: "window-foundations",
    },
  ],
};

const windowFoundationsCheatsheet: LessonContent = {
  slug: "window-foundations-cheatsheet",
  title: "Window Function Foundations: Cheatsheet",
  subtitle: "One page reference for OVER(), PARTITION BY, ORDER BY, frames, and execution order.",
  sections: [
    {
      kind: "cheatsheet",
      cheatsheetId: "window-foundations",
    },
  ],
};

// ---------- Ranking & Distribution (placeholders) ----------
const rankingRowNumber: LessonContent = {
  slug: "row-number",
  title: "ROW_NUMBER()",
  subtitle: "Unique sequence numbers / restart per group / tie-breaking",
  sections: [
    {
      kind: "prose",
      body: [
        "In the Window Function Foundations module, you mastered `OVER()`, `PARTITION BY`, `ORDER BY`, window frames, and SQL logical execution order.",
        "We will now use these concepts to solve ranking problems.",
        "Assign a unique sequence number to rows, restart the numbering for each group, and understand how PostgreSQL handles tied ordering values.",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why do we need ROW_NUMBER()?",
      body: [
        "Imagine that you are a data engineer at an **e-commerce company**.",
        "Your manager asks: Show each customer's purchases in chronological order. Assign 1 to their first purchase, 2 to their second purchase, and so on.",
        "Consider this orders table:",
      ],
    },
    {
      kind: "table",
      caption: "The orders table",
      headers: ["order_id", "customer_id", "order_date", "amount"],
      rows: [
        ["101", "A", "2026-01-01", "100"],
        ["102", "A", "2026-01-03", "250"],
        ["103", "B", "2026-01-02", "150"],
        ["104", "B", "2026-01-05", "300"],
        ["105", "A", "2026-01-06", "200"],
      ],
    },
    {
      kind: "prose",
      body: ["You could sort these records using `ORDER BY`, but that does not create a sequence number."],
    },
    {
      kind: "list",
      heading: "You need a function that:",
      items: [
        "Assigns a different number to every row.",
        "Starts counting at 1.",
        "Restarts for each customer.",
        "Follows a specified ordering rule.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The idea",
      body: "PostgreSQL provides **`ROW_NUMBER()`** for this purpose.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of a queue ticket system",
      body: [
        "Imagine customers A and B have separate queues.",
        "Each customer receives sequence numbers for their orders.",
      ],
    },
    {
      kind: "visual",
      id: "ranking-queue-tickets",
      caption: "Separate queues with their own ticket numbers",
    },
    {
      kind: "prose",
      body: ["The sequence restarts at 1 for each customer."],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Remember",
      body: "`ROW_NUMBER()` assigns a unique position within a partition. It does not calculate the sum or average of a group.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How does ROW_NUMBER() work?",
      body: ["The basic PostgreSQL syntax is:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "ROW_NUMBER() with PARTITION BY and ORDER BY",
      code: `ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY order_date, order_id
)`,
    },
    {
      kind: "prose",
      body: [
        "Conceptually, PostgreSQL follows these steps:",
        "1. **Divide** rows into partitions using `customer_id`.",
        "2. **Order** rows within each partition using `order_date, order_id`.",
        "3. **Assign** sequential numbers starting at 1 within each partition.",
        "4. **Return** the row number beside each original order.",
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
        ["ROW_NUMBER()", "Assign a unique sequential number"],
        ["OVER (...)", "Define the window"],
        ["PARTITION BY customer_id", "Restart numbering for each customer"],
        ["ORDER BY order_date", "Sequence orders by date"],
        ["order_id", "Break date ties when unique"],
      ],
    },
    {
      kind: "list",
      heading: "Important PostgreSQL facts",
      items: [
        "`ROW_NUMBER()` takes no arguments.",
        "It returns a `bigint`.",
        "It does not skip sequence numbers.",
        "If `PARTITION BY` is omitted, numbering runs across one partition.",
        "If ordering is not unique, tied rows can receive their row numbers in an unspecified order.",
      ],
    },
    {
      kind: "prose",
      body: [
        "`ROW_NUMBER()` does not require an explicit `ROWS` frame. Unlike `SUM()`, it is not a frame-sensitive cumulative calculation.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Number each customer's orders",
      body: [""],
    },
    {
      kind: "animation",
      variant: "q-ranking-row-number",
      caption: "ROW_NUMBER() numbering each customer's orders.",
    },
    {
      kind: "prose",
      body: ["Expected output: 5 rows, and the numbering restarts for customer B."],
    },
    {
      kind: "visual",
      id: "ranking-row-number-explorer",
      caption: "Try switching to All orders. Notice that the numbering no longer restarts for customer B.",
    },
    {
      kind: "prose",
      heading: "What happens when two orders have the same date?",
      body: ["Suppose customer A has two orders on January 3."],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Ordering with a tie on order_date",
      code: `ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY order_date
)`,
    },
    {
      kind: "prose",
      body: [
        "Both orders still receive different row numbers. However, PostgreSQL does not guarantee which tied order receives the smaller number.",
        "For a stable result, add a unique tie-breaker:",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A unique tie-breaker makes the numbering stable",
      code: `ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY order_date, order_id
)`,
    },
    {
      kind: "prose",
      body: ["This is a common interview requirement."],
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Limitations and alternatives",
      body: [],
    },
    {
      kind: "table",
      caption: "Choose by the output you need",
      headers: ["Situation", "Consideration"],
      rows: [
        ["Need one unique sequence number per row", "Use ROW_NUMBER()"],
        ["Need tied values to share a rank", "ROW_NUMBER() does not do this"],
        ["Need stable numbering", "Use a deterministic ORDER BY"],
        ["Need to return only the first row in each group", "Use a CTE or subquery to filter ROW_NUMBER()"],
        ["Very large partitions", "Sorting can increase memory and execution cost"],
      ],
    },
    {
      kind: "list",
      heading: "Important difference from RANK()",
      items: [
        "`ROW_NUMBER()` assigns a different number to every row, including rows tied on the ordering value.",
        "`RANK()` can assign the same rank to tied rows.",
      ],
    },
    {
      kind: "prose",
      body: ["We will study `RANK()` and `DENSE_RANK()` in the next lesson. For now, focus only on `ROW_NUMBER()`."],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "A common PostgreSQL restriction",
      body: "The `WHERE` clause cannot access `rn` at the same query level.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Fails: WHERE cannot use the row number alias",
      code: `SELECT
    order_id,
    ROW_NUMBER() OVER (
        PARTITION BY customer_id
        ORDER BY order_date
    ) AS rn
FROM orders
WHERE rn = 1;`,
    },
    {
      kind: "prose",
      body: ["You already learned the solution pattern in previous lessons, calculate the row number in a CTE, then filter in an outer query."],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Works: calculate in a CTE, then filter",
      code: `WITH numbered_orders AS (
    SELECT
        order_id,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY order_date, order_id
        ) AS rn
    FROM orders
)
SELECT order_id
FROM numbered_orders
WHERE rn = 1;`,
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Your turn",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-first-sale-row-number",
      title: "Find the first sale made by each employee",
      prompt:
        "Use the employee_sales_log table (sale_id, employee_id, sale_date, amount). Your manager asks: Find the first sale made by each employee. Write a query returning sale_id, employee_id, sale_date, amount. Use ROW_NUMBER(), restart the numbering for each employee, and use sale_date, sale_id in ascending order to break ties. Use a CTE and return only the first sale for each employee. Sort the final result by employee_id. Do not use GROUP BY, DISTINCT ON, or LIMIT.",
      playgroundHref: "/sql-playground?practice=cycledepot-first-sale-row-number",
    },
    {
      kind: "takeaways",
      items: [
        "`ROW_NUMBER()` assigns a unique sequence number to every row, starting at 1, and it never skips a number.",
        "`PARTITION BY` restarts the numbering for each group. Without it, numbering runs across one partition.",
        "`ORDER BY` inside `OVER()` decides which row gets which number.",
        "Tied ordering values still get different numbers, but PostgreSQL does not guarantee which tied row gets the smaller one. Add a unique tie-breaker such as `order_id`.",
        "`WHERE` cannot use a row number at the same query level. Calculate it in a CTE, then filter in the outer query.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "row-number-output-shape",
          question: "The example query numbers the five orders with `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id)`. Customer A has three orders and customer B has two. What does the query return?",
          options: [
            "Five rows, and the highest `order_sequence` is 3 for customer A and 2 for customer B.",
            "Two rows, one for each customer, each showing its number of orders.",
            "Five rows, and `order_sequence` runs from 1 to 5 across all customers.",
            "Five rows, and customer B starts at 4 because customer A used 1 to 3.",
          ],
          correctIndex: 0,
          explanation: "`PARTITION BY customer_id` restarts the numbering for each customer, and `ROW_NUMBER()` keeps every row. The result has five rows. Customer A gets 1, 2, 3 and customer B gets 1, 2.",
        },
        {
          id: "row-number-first-per-group",
          question: "You need only the first order of each customer. Which approach is correct in PostgreSQL?",
          options: [
            "Put `ROW_NUMBER() OVER (...) = 1` directly in the `WHERE` clause of the same query.",
            "Calculate `ROW_NUMBER()` in a CTE, then filter `WHERE rn = 1` in the outer query.",
            "Add `GROUP BY customer_id` and select `ROW_NUMBER()` for each group.",
            "Add `ROW_NUMBER()` to the `SELECT` list and `ORDER BY rn` without any filter.",
          ],
          correctIndex: 1,
          explanation: "The window function runs after `WHERE`, so `WHERE` cannot use it at the same level. A CTE calculates the row number first, and the outer query filters it.",
        },
        {
          id: "row-number-correct-query",
          question: "An orders table has `order_id`, `customer_id`, `order_date` and `amount`. Which query numbers each customer's orders by date, with `order_id` as the tie-breaker?",
          options: [
            "SELECT order_id, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS order_sequence FROM orders;",
            "SELECT order_id, ROW_NUMBER() OVER (ORDER BY order_date, order_id) PARTITION BY customer_id AS order_sequence FROM orders;",
            "SELECT order_id, ROW_NUMBER(customer_id) OVER (ORDER BY order_date, order_id) AS order_sequence FROM orders;",
            "SELECT order_id, ROW_NUMBER() OVER (PARTITION BY customer_id) AS order_sequence FROM orders ORDER BY order_date, order_id;",
          ],
          correctIndex: 0,
          explanation: "`PARTITION BY` and `ORDER BY` both belong inside the `OVER` parentheses. `ROW_NUMBER()` takes no arguments. An outer `ORDER BY` does not tell the window how to sequence rows.",
        },
        {
          id: "row-number-ties",
          question: "Two orders of the same customer share the same `order_date`, and the window uses `ORDER BY order_date` only. What does PostgreSQL do?",
          options: [
            "Both rows get the same number, because they are tied.",
            "The rows get different numbers, but PostgreSQL does not guarantee which one gets the smaller number.",
            "The rows get different numbers, and the one with the smaller `order_id` always gets the smaller number.",
            "PostgreSQL returns an error until you add a tie-breaker.",
          ],
          correctIndex: 1,
          explanation: "`ROW_NUMBER()` never gives the same number twice, but tied rows can receive their numbers in an unspecified order. Add a unique column such as `order_id` to make the result stable.",
        },
      ],
    },
  ],
};

const rankingRankVsDenseRank: LessonContent = {
  slug: "rank-vs-dense-rank",
  title: "RANK() vs DENSE_RANK()",
  subtitle: "Ties share a rank / gaps or no gaps / peer groups",
  sections: [
    {
      kind: "prose",
      body: [
        "In the previous lesson, you mastered `ROW_NUMBER()`.",
        "You learned that `ROW_NUMBER()` assigns a unique sequence number to every row, even when two rows have the same ordering value.",
        "In this lesson, we will learn what happens when two or more rows must share the same rank.",
        "Our focus is one concept: how `RANK()` and `DENSE_RANK()` handle ties differently.",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why do we need RANK() and DENSE_RANK()?",
      body: [
        "Imagine that you are a data engineer at a company.",
        "Your manager asks: Rank employees by salary. Employees with equal salaries must receive the same rank.",
        "Consider this employees table:",
      ],
    },
    {
      kind: "table",
      caption: "The employees table",
      headers: ["employee_id", "employee_name", "salary"],
      rows: [
        ["1", "Alice", "9000"],
        ["2", "Bob", "8000"],
        ["3", "Charlie", "8000"],
        ["4", "David", "6000"],
        ["5", "Emma", "5000"],
      ],
    },
    {
      kind: "prose",
      body: [
        "We already know `ROW_NUMBER()`.",
        "But if Bob and Charlie both earn 8000, should one be ranked second and the other third?",
        "For a salary ranking, that may be unfair. They have equal salaries.",
        "We need functions that assign the same rank to tied salary values.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The idea",
      body: "PostgreSQL provides `RANK()` and `DENSE_RANK()`. Both handle ties, but they assign the next rank differently.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of a ranking contest",
      body: [
        "Imagine five employees compete in a salary-ranking contest.",
        "Bob and Charlie tie for second place.",
      ],
    },
    {
      kind: "visual",
      id: "ranking-contest-podium",
      caption: "The same tie ranked by RANK() and by DENSE_RANK()",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Remember",
      body: "`RANK()` gives the same rank to ties and leaves gaps after them. `DENSE_RANK()` gives the same rank to ties and does not leave gaps. This is the most important distinction for this lesson.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How do RANK() and DENSE_RANK() work?",
      body: ["Consider this PostgreSQL syntax:"],
    },
    {
      kind: "prose",
      heading: "A. RANK()",
      body: [],
    },
    {
      kind: "code",
      language: "sql",
      caption: "RANK() with ORDER BY",
      code: `RANK() OVER (
    ORDER BY salary DESC
)`,
    },
    {
      kind: "prose",
      heading: "B. DENSE_RANK()",
      body: [],
    },
    {
      kind: "code",
      language: "sql",
      caption: "DENSE_RANK() with ORDER BY",
      code: `DENSE_RANK() OVER (
    ORDER BY salary DESC
)`,
    },
    {
      kind: "prose",
      body: [
        "Conceptually, PostgreSQL:",
        "1. **Orders** rows by salary, highest first.",
        "2. **Identifies** peer groups with equal salaries.",
        "3. **Assigns** equal ranks to rows in the same peer group.",
        "4. **Uses** the selected ranking rule to determine the next rank.",
        "`RANK()` assigns each peer group a rank equal to the position of its first row. `DENSE_RANK()` assigns consecutive ranks to distinct peer groups.",
        "For our example:",
      ],
    },
    {
      kind: "table",
      caption: "Ranks for each salary level",
      headers: ["Salary", "Number of employees", "RANK", "DENSE_RANK"],
      rows: [
        ["9000", "1", "1", "1"],
        ["8000", "2", "2", "2"],
        ["6000", "1", "4", "3"],
        ["5000", "1", "5", "4"],
      ],
    },
    {
      kind: "list",
      heading: "Why the next rank differs",
      items: [
        "Why does `RANK()` jump from 2 to 4? Two employees occupy the second-ranked peer group. The next employee is in the fourth row position.",
        "Why does `DENSE_RANK()` move from 2 to 3? It counts distinct salary levels, not occupied row positions.",
      ],
    },
    {
      kind: "prose",
      body: ["You can use either function within departments:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "RANK() restarting for each department",
      code: `RANK() OVER (
    PARTITION BY department
    ORDER BY salary DESC
)`,
    },
    {
      kind: "prose",
      body: ["This restarts ranking for each department. The same applies to `DENSE_RANK()`."],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Compare ROW_NUMBER(), RANK() and DENSE_RANK()",
      body: [""],
    },
    {
      kind: "animation",
      variant: "q-ranking-rank-dense-rank",
      caption: "RANK() and DENSE_RANK() sharing a rank for tied salaries.",
    },
    {
      kind: "prose",
      body: [
        "Notice that `ROW_NUMBER()` has a unique `employee_id` tie-breaker. The other two functions order by salary alone, so equal salaries remain peers.",
      ],
    },
    {
      kind: "visual",
      id: "ranking-tie-explorer",
      caption: "Try adding employee_id to the window ORDER BY. Notice that the salary tie disappears.",
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Choosing between the three functions",
      body: [],
    },
    {
      kind: "table",
      caption: "Choose by the ranking you need",
      headers: ["Situation", "Correct choice or behavior"],
      rows: [
        ["Each row needs a unique number", "ROW_NUMBER()"],
        ["Equal values must share a rank, with gaps", "RANK()"],
        ["Equal values must share a rank, without gaps", "DENSE_RANK()"],
        ["No ties exist", "All three produce the same sequence"],
        ["Need ranking within departments", "Use PARTITION BY department"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "A unique tie-breaker removes the ties",
      body: "If `employee_id` is unique, employees with equal salaries no longer have equal values across the complete window `ORDER BY` list. Therefore, they no longer belong to the same peer group. This can accidentally remove the salary ties you wanted to preserve.",
    },
    {
      kind: "code",
      language: "sql",
      caption: "Fails to keep ties: employee_id makes every row unique",
      code: `RANK() OVER (
    ORDER BY salary DESC, employee_id
)`,
    },
    {
      kind: "prose",
      body: ["For salary-based ranking, use:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "Works: salary alone keeps equal salaries as peers",
      code: `RANK() OVER (
    ORDER BY salary DESC
)`,
    },
    {
      kind: "prose",
      body: [
        "You can still use an outer `ORDER BY salary DESC, employee_id` to make the final display deterministic without changing the salary ranks.",
      ],
    },
    {
      kind: "list",
      heading: "Important limitations",
      items: [
        "Ranking functions do not use the window frame to determine their ranks.",
        "Peer groups are determined by the window's `ORDER BY` values.",
        "`RANK()` and `DENSE_RANK()` return `bigint` values in PostgreSQL.",
      ],
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Your turn",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-top-two-sales-levels",
      title: "Find employees at the top two sales levels",
      prompt:
        "Use the department_sales_totals table (employee_id, department, total_sales). Your manager asks: Show employees who belong to the top two distinct sales levels in each department. Include all employees tied at those sales levels. Write a query returning employee_id, department, total_sales. Use DENSE_RANK(), partition by department, and order sales from highest to lowest. Use a CTE to filter the ranking result and return employees with dense rank 1 or 2. Sort the final output by department, total_sales DESC, and employee_id. Do not use GROUP BY, DISTINCT ON, or LIMIT.",
      playgroundHref: "/sql-playground?practice=cycledepot-top-two-sales-levels",
    },
    {
      kind: "takeaways",
      items: [
        "`RANK()` and `DENSE_RANK()` give tied rows the same rank. `ROW_NUMBER()` always gives a unique number.",
        "`RANK()` leaves gaps after a tie: 1, 2, 2, 4, 5. `DENSE_RANK()` does not: 1, 2, 2, 3, 4.",
        "Rows are peers when every value in the window `ORDER BY` list is equal. Peer groups decide which rows share a rank.",
        "Adding a unique column such as `employee_id` to the window `ORDER BY` removes the ties. Use it in the outer `ORDER BY` instead.",
        "`PARTITION BY` restarts the ranking for each group. Filter a rank in a CTE or subquery, not in `WHERE` at the same level.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "rank-vs-dense-rank-output-shape",
          question: "Five employees earn 9000, 8000, 8000, 6000 and 5000. What does `DENSE_RANK() OVER (ORDER BY salary DESC)` return, and how many rows does the query return?",
          options: [
            "Five rows with ranks 1, 2, 2, 3, 4.",
            "Five rows with ranks 1, 2, 2, 4, 5.",
            "Four rows, one for each distinct salary, with ranks 1, 2, 3, 4.",
            "Five rows with ranks 1, 2, 3, 4, 5.",
          ],
          correctIndex: 0,
          explanation: "`DENSE_RANK()` counts distinct salary levels and does not leave gaps. A window function keeps every row, so the query still returns five rows.",
        },
        {
          id: "rank-vs-dense-rank-pick-function",
          question: "Equal values must share a rank, and the next rank must follow without skipping a number. Which function fits?",
          options: [
            "`ROW_NUMBER()`",
            "`RANK()`",
            "`DENSE_RANK()`",
            "`SUM()` with `ORDER BY`",
          ],
          correctIndex: 2,
          explanation: "`DENSE_RANK()` shares a rank among ties and leaves no gap. `RANK()` shares a rank but skips numbers. `ROW_NUMBER()` never shares a number.",
        },
        {
          id: "rank-vs-dense-rank-correct-query",
          question: "You want the top two distinct salary levels in each department, with ties kept together. Which window definition is correct?",
          options: [
            "`DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC)`",
            "`DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC, employee_id)`",
            "`ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)`",
            "`DENSE_RANK() OVER (ORDER BY department, salary DESC)`",
          ],
          correctIndex: 0,
          explanation: "`PARTITION BY department` restarts the ranking for each department, and ordering by salary alone keeps equal salaries as peers. Adding `employee_id` removes the ties, `ROW_NUMBER()` never shares a number, and without `PARTITION BY` the ranking does not restart.",
        },
        {
          id: "rank-vs-dense-rank-unique-tiebreaker",
          question: "A learner writes `RANK() OVER (ORDER BY salary DESC, employee_id)` and `employee_id` is unique. Bob and Charlie both earn 8000. What happens?",
          options: [
            "They still share rank 2, because the salaries are equal.",
            "They get different ranks, because they are no longer peers across the whole `ORDER BY` list.",
            "PostgreSQL returns an error, because `employee_id` is not allowed in the window.",
            "They both get rank 3.",
          ],
          correctIndex: 1,
          explanation: "Peers must be equal across every value in the window `ORDER BY` list. A unique `employee_id` makes every row different, so the salary tie is lost. Use `employee_id` in the outer `ORDER BY` for a stable display.",
        },
      ],
    },
  ],
};

const rankingNtile: LessonContent = {
  slug: "ntile",
  title: "NTILE()",
  subtitle: "Equal-sized buckets / quartiles / position, not amount",
  sections: [
    {
      kind: "prose",
      body: [
        "You have learnt `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()`.",
        "Those functions assign numbers based on a row's position or its ranking among peers.",
        "In this lesson, we will learn a different concept:",
        " `NTILE(n)` **divides ordered rows into** `n` **buckets that have approximately equal numbers of rows.**",
        "This is useful for **customer segmentation**, **sales performance analysis**, and **interview problems involving quartiles or deciles.**",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why do we need NTILE()?",
      body: [
        "Suppose you work for an **e-commerce company**.",
        "Your manager asks: Divide our customers into four groups based on total spending. Put the highest-spending customers in the first group.",
        "You have eight customers.",
      ],
    },
    {
      kind: "table",
      caption: "The customer_spending table",
      headers: ["customer_id", "total_spent"],
      rows: [
        ["A", "1000"],
        ["B", "900"],
        ["C", "800"],
        ["D", "700"],
        ["E", "600"],
        ["F", "500"],
        ["G", "400"],
        ["H", "300"],
      ],
    },
    {
      kind: "prose",
      body: [
        "You could rank every customer using `ROW_NUMBER()`.",
        "But your manager does not need eight individual positions. They need four spending groups. This is what `NTILE(4)` does.",
      ],
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of sorting customers into baskets",
      body: [
        "Imagine you sort all eight customers from highest spending to lowest spending.",
        "Then you place the customers into four baskets, with two customers in each basket.",
      ],
    },
    {
      kind: "visual",
      id: "ranking-ntile-baskets",
      caption: "Eight sorted customers placed into four baskets",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Remember",
      body: "`NTILE()` groups rows by their ordered positions. It does not group them by equal numerical ranges. For example, `NTILE(4)` does not mean each bucket covers 25% of the spending amount. It aims to place approximately 25% of the rows into each bucket.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How does NTILE() work?",
      body: ["The basic PostgreSQL syntax is:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "NTILE(4) with ORDER BY",
      code: `NTILE(4) OVER (
    ORDER BY total_spent DESC, customer_id
)`,
    },
    {
      kind: "prose",
      body: [
        "The argument `4` asks PostgreSQL to make four buckets.",
        "Conceptually, PostgreSQL:",
        "1. **Takes** the rows available to the window function.",
        "2. **Orders** the rows by `total_spent DESC, customer_id`.",
        "3. **Divides** the ordered rows into four buckets.",
        "4. **Assigns** bucket numbers starting at 1.",
      ],
    },
    {
      kind: "prose",
      heading: "What if the rows do not divide evenly?",
      body: [
        "Suppose you have ten rows and request three buckets.",
        "Ten cannot be divided evenly into three whole-number groups.",
        "PostgreSQL creates bucket sizes that differ by at most one row. Larger buckets come first.",
      ],
    },
    {
      kind: "table",
      caption: "10 rows divided into 3 buckets",
      headers: ["Bucket", "Rows in bucket"],
      rows: [
        ["Bucket 1", "4 rows"],
        ["Bucket 2", "3 rows"],
        ["Bucket 3", "3 rows"],
      ],
    },
    {
      kind: "prose",
      body: ["The first bucket has four rows. The remaining two buckets have three rows each."],
    },
    {
      kind: "table",
      caption: "NTILE() rules",
      headers: ["Rule", "Meaning"],
      rows: [
        ["NTILE(n)", "Request n buckets"],
        ["n must be positive", "Zero or negative bucket counts are invalid"],
        ["Bucket numbers start at 1", "The first bucket receives 1"],
        ["Buckets are approximately equal in size", "Their row counts differ by at most one"],
        ["Larger buckets appear first", "Extra rows go into earlier buckets"],
        ["PARTITION BY can be used", "Bucket assignment restarts in each partition"],
      ],
    },
    {
      kind: "prose",
      body: [
        "If a partition contains fewer rows than the requested number of buckets, some bucket numbers are not assigned.",
        "For example, `NTILE(4)` over a partition containing only two rows assigns bucket numbers 1 and 2.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Spending buckets for eight customers",
      body: ["Consider the eight-customer table."],
    },
    {
      kind: "animation",
      variant: "q-ranking-ntile",
      caption: "NTILE(4) splitting eight ordered customers into four buckets.",
    },
    {
      kind: "prose",
      body: ["Change the number of buckets and inspect the result. This example keeps a unique order for every customer."],
    },
    {
      kind: "visual",
      id: "ranking-ntile-explorer",
      caption: "Explore NTILE(n). With 5 buckets, the sizes are 2 / 2 / 2 / 1 / 1 rows.",
    },
    {
      kind: "prose",
      heading: "Buckets within groups",
      body: ["You can calculate buckets separately for each region:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "NTILE(4) restarting for each region",
      code: `NTILE(4) OVER (
    PARTITION BY region
    ORDER BY total_spent DESC, customer_id
)`,
    },
    {
      kind: "prose",
      body: [
        "PostgreSQL creates separate spending buckets within each region.",
        "The first bucket in one region is independent of the first bucket in another region.",
      ],
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Limitations and alternatives",
      body: [],
    },
    {
      kind: "table",
      caption: "What to understand in each situation",
      headers: ["Situation", "What to understand"],
      rows: [
        ["Two customers have equal spending", "They can be placed in different buckets"],
        ["You need tied values to stay together", "NTILE() does not guarantee that"],
        ["You omit a unique tie-breaker", "Tied rows may receive different, unpredictable bucket assignments"],
        ["You use PARTITION BY region", "Buckets restart for each region"],
        ["You request more buckets than rows", "Some bucket numbers remain unused"],
        ["You need equal spending ranges", "NTILE() is not designed for that"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "Equal values can land in different buckets",
      body: "`NTILE(4)` assigns rows to four approximately equal-sized groups. It does not guarantee that equal spending values stay in the same bucket. Even if two customers both spend $500, they may receive different buckets if the bucket boundary falls between them.",
    },
    {
      kind: "prose",
      body: [
        "Adding a unique `customer_id` as a tie-breaker can make the assignment deterministic, but it does not keep tied spending values together.",
      ],
    },
    {
      kind: "list",
      heading: "Important limitations",
      items: [
        "Like other ranking functions, `NTILE()` does not use a cumulative `ROWS` frame to determine its bucket numbers.",
        "`NTILE()` cuts by row position, so it cannot create buckets of equal spending ranges.",
      ],
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Your turn",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-top-performance-bucket",
      title: "Find employees in the top performance bucket",
      prompt:
        "Use the employee_performance table (employee_id, department, sales). Your manager asks: Identify employees who belong to bucket 1 of three performance buckets in each department. Write a query returning employee_id, department, sales, performance_bucket. Use NTILE(3), partition by department, and order sales from highest to lowest. Use employee_id as a tie-breaker. Use a CTE and return only employees assigned to bucket 1. Sort the final output by department, sales DESC, and employee_id. Do not use GROUP BY, DISTINCT ON, or LIMIT.",
      playgroundHref: "/sql-playground?practice=cycledepot-top-performance-bucket",
    },
    {
      kind: "takeaways",
      items: [
        "`NTILE(n)` divides ordered rows into `n` buckets with approximately equal numbers of rows. Bucket numbers start at 1.",
        "Bucket sizes differ by at most one row, and the larger buckets come first.",
        "`NTILE()` groups by row position, not by equal numerical ranges of the values.",
        "Equal values can land in different buckets. A unique tie-breaker makes the result deterministic but does not keep ties together.",
        "`PARTITION BY` restarts the buckets in each group. Filter a bucket in a CTE or subquery, not in `WHERE` at the same level.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "ntile-output-shape",
          question: "A query applies `NTILE(3)` to 10 ordered rows. How many rows does it return, and how big are the buckets?",
          options: [
            "10 rows, with buckets of 4, 3 and 3 rows.",
            "10 rows, with buckets of 3, 3 and 4 rows.",
            "3 rows, one for each bucket.",
            "10 rows, with buckets of 5, 3 and 2 rows.",
          ],
          correctIndex: 0,
          explanation: "A window function keeps every row. Ten rows cannot divide evenly into three buckets, so sizes differ by at most one and the larger bucket comes first: 4, 3, 3.",
        },
        {
          id: "ntile-pick-function",
          question: "Your manager wants customers split into four spending groups of about the same number of customers. Which function fits?",
          options: [
            "`ROW_NUMBER()`",
            "`DENSE_RANK()`",
            "`NTILE(4)`",
            "`SUM()` with `ORDER BY`",
          ],
          correctIndex: 2,
          explanation: "`NTILE(4)` divides the ordered rows into four buckets with about equal row counts. The ranking functions give positions or ranks, not groups.",
        },
        {
          id: "ntile-correct-query",
          question: "Which window definition creates three performance buckets in each department, highest sales first, with `employee_id` as the tie-breaker?",
          options: [
            "`NTILE(3) OVER (PARTITION BY department ORDER BY sales DESC, employee_id)`",
            "`NTILE(department) OVER (ORDER BY sales DESC, employee_id)`",
            "`NTILE(3) OVER (ORDER BY department, sales DESC, employee_id)`",
            "`NTILE(0) OVER (PARTITION BY department ORDER BY sales DESC)`",
          ],
          correctIndex: 0,
          explanation: "`PARTITION BY department` restarts the buckets in each department. The argument must be a positive number of buckets, and without `PARTITION BY` the buckets do not restart.",
        },
        {
          id: "ntile-ties",
          question: "Two customers both spend $500, and the bucket boundary falls between them. What does `NTILE(4)` do?",
          options: [
            "It always keeps both customers in the same bucket.",
            "It may place them in different buckets, because it cuts by row position.",
            "It returns an error until the tie is removed.",
            "It gives both customers a decimal bucket number.",
          ],
          correctIndex: 1,
          explanation: "`NTILE()` aims for equal row counts, not equal values. Tied values can land in different buckets, and a unique tie-breaker only makes the assignment deterministic.",
        },
      ],
    },
  ],
};

const rankingPercentRankCumeDist: LessonContent = {
  slug: "percent-rank-cume-dist",
  title: "PERCENT_RANK() and CUME_DIST()",
  subtitle: "Relative rank / cumulative distribution / values from 0 to 1",
  sections: [
    {
      kind: "prose",
      body: [
        "You have already learnt `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, and `NTILE()`.",
        "In this lesson, you will learn how to describe a row's position **relative to the other rows in its partition**, using two **PostgreSQL** functions:",
      ],
    },
    {
      kind: "list",
      items: [
        "`PERCENT_RANK()` measures relative rank.",
        "`CUME_DIST()` measures the proportion of rows at or below the current ordering value.",
      ],
    },
    {
      kind: "prose",
      body: ["Both return a value between 0 and 1, but they calculate that value differently."],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why do we need relative positions?",
      body: [
        "Suppose you are building a student performance report.",
        "Your manager asks: How well did each student perform compared with the other students?",
        "A rank such as 3 tells you a student's position, but it does not directly express that position relative to the size of the group.",
        "You need a way to compare relative positions across groups of different sizes.",
        "Consider this exam_scores table:",
      ],
    },
    {
      kind: "table",
      caption: "The exam_scores table",
      headers: ["student_id", "student_name", "score"],
      rows: [
        ["1", "Alice", "50"],
        ["2", "Bob", "70"],
        ["3", "Charlie", "70"],
        ["4", "David", "90"],
        ["5", "Emma", "100"],
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The idea",
      body: "Notice that Bob and Charlie have the same score. We need to handle this tie correctly.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of students standing in a line",
      body: [
        "Imagine five students standing in a line, from lowest score to highest.",
        "Now consider two different questions.",
      ],
    },
    {
      kind: "visual",
      id: "ranking-relative-position",
      caption: "The same line of students, measured two ways",
    },
    {
      kind: "list",
      items: [
        "`PERCENT_RANK()` asks: How far along the rank scale is this student, relative to the first and last rank positions?",
        "`CUME_DIST()` asks: What fraction of students have scores less than or equal to this student's score?",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "Remember",
      body: "Four of the five students have scores of 90 or below. Therefore, David's cumulative distribution is 4/5, or 0.8. These are different measurements, even though both use ranking information.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How do PERCENT_RANK() and CUME_DIST() work?",
      body: [],
    },
    {
      kind: "prose",
      heading: "A. PERCENT_RANK()",
      body: ["PostgreSQL calculates:"],
    },
    {
      kind: "code",
      language: "text",
      caption: "The PERCENT_RANK() formula",
      code: `PERCENT_RANK = (RANK - 1) / (N - 1)`,
    },
    {
      kind: "list",
      heading: "Where",
      items: [
        "`RANK` is the current row's competition rank.",
        "`N` is the number of rows in its partition.",
      ],
    },
    {
      kind: "prose",
      body: ["For a partition containing only one row, PostgreSQL returns 0."],
    },
    {
      kind: "prose",
      heading: "B. CUME_DIST()",
      body: ["PostgreSQL calculates:"],
    },
    {
      kind: "code",
      language: "text",
      caption: "The CUME_DIST() formula",
      code: `CUME_DIST = (rows up to and including the current peer group) / N`,
    },
    {
      kind: "prose",
      body: [
        "In an ascending score order, this is the proportion of students whose scores are less than or equal to the current student's score.",
      ],
    },
    {
      kind: "table",
      caption: "PERCENT_RANK() compared with CUME_DIST()",
      headers: ["Property", "PERCENT_RANK()", "CUME_DIST()"],
      rows: [
        ["Based on", "Competition rank", "Cumulative row count"],
        ["Tied values", "Same result", "Same result"],
        ["Minimum possible value", "0", "Greater than 0 for a nonempty partition"],
        ["Maximum possible value", "1", "1"],
        ["Single-row partition", "0", "1"],
      ],
    },
    {
      kind: "prose",
      body: [
        "Both functions use the window's `ORDER BY` to identify peer groups. Adding a unique tie-breaker can change which rows are peers.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Score the five students",
      body: [""],
    },
    {
      kind: "animation",
      variant: "q-ranking-percent-rank-cume-dist",
      caption: "PERCENT_RANK() and CUME_DIST() first on one partition, then with PARTITION BY department.",
    },
    {
      kind: "visual",
      id: "ranking-percent-rank-explorer",
      caption: "Select a student to examine both calculations.",
    },
    {
      kind: "prose",
      heading: "What if you add PARTITION BY?",
      body: [],
    },
    {
      kind: "code",
      language: "sql",
      caption: "PERCENT_RANK() restarting for each department",
      code: `PERCENT_RANK() OVER (
    PARTITION BY department
    ORDER BY score
)`,
    },
    {
      kind: "prose",
      body: [
        "PostgreSQL calculates relative rank separately for each department. `CUME_DIST()` works the same way with partitioning.",
        "The second stage of the animation above shows this with the same students split into Science and Arts.",
      ],
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Limitations and common mistakes",
      body: [],
    },
    {
      kind: "table",
      caption: "Common mistakes",
      headers: ["Mistake", "Correct understanding"],
      rows: [
        ["Assume the two functions are equivalent", "They use different calculations"],
        ["Assume PERCENT_RANK() means percentage of rows with smaller scores", "It measures relative competition rank"],
        ["Assume CUME_DIST() counts only strictly smaller values", "It includes the entire current peer group"],
        ["Add a unique ID to the window ORDER BY unintentionally", "It may break ties and change results"],
        ["Assume ascending and descending order give the same values", "Ordering direction matters"],
        ["Assume results always represent statistical percentiles exactly", "They are window-based rank and distribution measures"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "A useful interview distinction",
      body: "`CUME_DIST()` is closely related to an empirical cumulative distribution, while `PERCENT_RANK()` scales competition ranks between 0 and 1.",
    },
    {
      kind: "list",
      heading: "Important limitations",
      items: [
        "Neither function requires a cumulative `ROWS` frame.",
        "Their behavior depends on the partition and ordering, including peer groups.",
      ],
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Your turn",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-cume-dist-above-half",
      title: "Find employees above half of their department",
      prompt:
        "Use the employee_scores table (employee_id, department, performance_score). Your manager asks: Return employees whose cumulative distribution is greater than 0.50 within their department, using ascending performance scores. Write a query returning employee_id, department, performance_score, cumulative_distribution. Use CUME_DIST(), partition by department, and order by performance_score ASC inside the window. Keep tied scores as peers: do not add employee_id inside the window ordering. Use a CTE to filter results and return only rows where cumulative distribution is strictly greater than 0.50. Sort the final result by department, performance_score, and employee_id. Do not use GROUP BY, DISTINCT ON, or a subquery instead of the required CTE.",
      playgroundHref: "/sql-playground?practice=cycledepot-cume-dist-above-half",
    },
    {
      kind: "takeaways",
      items: [
        "`PERCENT_RANK()` equals `(RANK - 1) / (N - 1)`. It scales competition ranks between 0 and 1, and the first row is always 0.",
        "`CUME_DIST()` is the number of rows up to and including the current peer group, divided by `N`. It is always greater than 0 and ends at 1.",
        "Tied values are peers and receive the same result from both functions.",
        "A unique tie-breaker in the window `ORDER BY` breaks the ties and changes the results. Ordering direction also changes them.",
        "`PARTITION BY` calculates both measures separately for each group. Neither function needs a `ROWS` frame.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "percent-rank-output-shape",
          question: "Five students have scores 50, 70, 70, 90 and 100. What does `CUME_DIST() OVER (ORDER BY score ASC)` return for the two students with score 70?",
          options: [
            "0.60 for both students, and the query returns five rows.",
            "0.40 and 0.60, and the query returns five rows.",
            "0.25 for both students, and the query returns five rows.",
            "0.60 for one row, because tied rows collapse into one.",
          ],
          correctIndex: 0,
          explanation: "Three of the five rows are at or below 70, so both peers get 3/5 = 0.60. A window function keeps every row, so the query still returns five rows.",
        },
        {
          id: "percent-rank-pick-function",
          question: "You need the fraction of students whose score is less than or equal to each student's score. Which function fits?",
          options: [
            "`PERCENT_RANK()`",
            "`CUME_DIST()`",
            "`NTILE(5)`",
            "`ROW_NUMBER()`",
          ],
          correctIndex: 1,
          explanation: "`CUME_DIST()` counts rows up to and including the current peer group and divides by `N`. `PERCENT_RANK()` scales the competition rank instead.",
        },
        {
          id: "percent-rank-correct-query",
          question: "Which window definition calculates the cumulative distribution separately for each department, lowest score first, and keeps tied scores as peers?",
          options: [
            "`CUME_DIST() OVER (PARTITION BY department ORDER BY score ASC)`",
            "`CUME_DIST() OVER (PARTITION BY department ORDER BY score ASC, employee_id)`",
            "`CUME_DIST(department) OVER (ORDER BY score ASC)`",
            "`CUME_DIST() OVER (ORDER BY department, score ASC)`",
          ],
          correctIndex: 0,
          explanation: "`PARTITION BY department` restarts the calculation in each department. Adding `employee_id` breaks the ties, `CUME_DIST()` takes no argument, and without `PARTITION BY` the departments are not separate.",
        },
        {
          id: "percent-rank-single-row",
          question: "A partition contains only one row. What do `PERCENT_RANK()` and `CUME_DIST()` return for it?",
          options: [
            "Both return 0.",
            "`PERCENT_RANK()` returns 0 and `CUME_DIST()` returns 1.",
            "`PERCENT_RANK()` returns 1 and `CUME_DIST()` returns 0.",
            "Both return 1.",
          ],
          correctIndex: 1,
          explanation: "`PERCENT_RANK()` returns 0 for a single-row partition because `N - 1` would be 0. `CUME_DIST()` returns 1 because the one row is at or below itself.",
        },
      ],
    },
  ],
};

const rankingTopNPerGroup: LessonContent = {
  slug: "top-n-per-group",
  title: "Top-N per Group and Tie-Breaking",
  subtitle: "Exactly N rows / N distinct levels / tie rules",
  sections: [
    {
      kind: "prose",
      body: [
        "You have learnt the ranking and distribution functions introduced so far: `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE()`, `PERCENT_RANK()`, and `CUME_DIST()`.",
        "In this lesson, we will combine your ranking knowledge into one important SQL interview pattern: finding the **Top-N rows in each group**, with a clear rule for ties.",
        "This pattern frequently appears in data engineering and SQL interviews.",
      ],
    },
    {
      kind: "prose",
      heading: "1. WHY: Why is Top-N per group tricky?",
      body: [
        "Imagine you are a data engineer at an **e-commerce company**.",
        "Your manager asks: Find the top two highest-paid employees in every department.",
        "You have this employees table:",
      ],
    },
    {
      kind: "table",
      caption: "The employees table",
      headers: ["employee_id", "department", "salary"],
      rows: [
        ["101", "Engineering", "120000"],
        ["102", "Engineering", "110000"],
        ["103", "Engineering", "110000"],
        ["104", "Engineering", "90000"],
        ["201", "Sales", "100000"],
        ["202", "Sales", "95000"],
        ["203", "Sales", "95000"],
        ["204", "Sales", "80000"],
      ],
    },
    {
      kind: "prose",
      body: ["A query using:"],
    },
    {
      kind: "code",
      language: "sql",
      caption: "LIMIT applies to the whole result",
      code: `ORDER BY salary DESC
LIMIT 2;`,
    },
    {
      kind: "prose",
      body: [
        "returns only two employees from the entire table, not two from each department.",
        "We need to rank employees within each department, then select the employees that meet the Top-N rule.",
      ],
    },
    {
      kind: "callout",
      tone: "info",
      title: "The question that matters",
      body: "When two employees tie, do we return exactly two employees, or do we include every employee tied at the cutoff? The answer determines which ranking function to use.",
    },
    {
      kind: "prose",
      heading: "2. INTUITION: Think of each department as a competition",
      body: ["Think of each department as a separate competition."],
    },
    {
      kind: "visual",
      id: "ranking-top-n-competition",
      caption: "The same Engineering department selected two different ways",
    },
    {
      kind: "callout",
      tone: "info",
      title: "Key rule",
      body: "Top-N employees and Top-N distinct salary levels are not the same requirement.",
    },
    {
      kind: "prose",
      heading: "3. HOW: How do we build Top-N per group?",
      body: ["The general pattern is:"],
    },
    {
      kind: "prose",
      body: [
        "1. **Divide** rows by the group key using `PARTITION BY`.",
        "2. **Order** rows from highest to lowest using the business metric.",
        "3. **Assign** a position or rank with a window function.",
        "4. **Filter** the calculated results with a CTE or subquery.",
        "5. **Sort** the final output with an outer `ORDER BY`.",
      ],
    },
    {
      kind: "table",
      caption: "Choose the function by the business requirement",
      headers: ["Business requirement", "Function"],
      rows: [
        ["Exactly N rows per group, when at least N rows exist", "ROW_NUMBER()"],
        ["Top N competition-rank positions, including ties", "RANK()"],
        ["Top N distinct metric levels, including ties", "DENSE_RANK()"],
      ],
    },
    {
      kind: "prose",
      heading: "A. Exactly N rows with ROW_NUMBER()",
      body: [],
    },
    {
      kind: "code",
      language: "sql",
      caption: "A unique tie-breaker makes the selection deterministic",
      code: `ROW_NUMBER() OVER (
    PARTITION BY department
    ORDER BY salary DESC, employee_id
)`,
    },
    {
      kind: "prose",
      body: ["`employee_id` makes the selection deterministic, assuming it is unique."],
    },
    {
      kind: "prose",
      heading: "B. Salary levels with DENSE_RANK()",
      body: [
        "But if the business rule requires equal salaries to receive equal ranks, use the metric alone in the ranking window:",
      ],
    },
    {
      kind: "code",
      language: "sql",
      caption: "The metric alone keeps salary ties together",
      code: `DENSE_RANK() OVER (
    PARTITION BY department
    ORDER BY salary DESC
)`,
    },
    {
      kind: "prose",
      body: [
        "Adding `employee_id` inside this second window would break salary ties.",
        "You can still use `employee_id` in the final outer `ORDER BY` for stable display ordering.",
      ],
    },
    {
      kind: "prose",
      heading: "4. EXAMPLE: Two Top-N rules on the same table",
      body: [""],
    },
    {
      kind: "animation",
      variant: "q-ranking-top-n-per-group",
      caption: "ROW_NUMBER() keeps exactly two rows, then DENSE_RANK() keeps two salary levels.",
    },
    {
      kind: "visual",
      id: "ranking-top-n-explorer",
      caption: "Change the ranking function and N. Watch how many employees each rule selects.",
    },
    {
      kind: "prose",
      heading: "5. TRADE-OFFS: Limitations and common mistakes",
      body: [],
    },
    {
      kind: "table",
      caption: "Common issues",
      headers: ["Issue", "What you should know"],
      rows: [
        ["LIMIT N applied to entire query", "Does not give N rows per group"],
        ["ROW_NUMBER() with tied salaries", "Selects one ordering among ties; a unique key makes it deterministic"],
        ["RANK() <= N", "Can return more than N rows, and may include fewer than N distinct levels"],
        ["DENSE_RANK() <= N", "Includes all ties across the top N distinct metric levels"],
        ["Fewer than N rows in a partition", "Returns all available rows"],
        ["Filtering a window alias in the same WHERE", "Not valid in PostgreSQL; use a CTE or subquery"],
      ],
    },
    {
      kind: "prose",
      body: ["Suppose salaries are 100, 100, 90, 80."],
    },
    {
      kind: "table",
      caption: "Competition ranks compared with dense ranks",
      headers: ["Salary", "RANK", "DENSE_RANK"],
      rows: [
        ["100", "1", "1"],
        ["100", "1", "1"],
        ["90", "3", "2"],
        ["80", "4", "3"],
      ],
    },
    {
      kind: "callout",
      tone: "warn",
      title: "RANK() <= 2 and DENSE_RANK() <= 2 differ",
      body: "Filtering `RANK() <= 2` returns only employees earning 100. Filtering `DENSE_RANK() <= 2` also includes the employee earning 90. This distinction is important for senior SQL interviews.",
    },
    {
      kind: "list",
      heading: "Important limitations",
      items: [
        "Ranking can require sorting within partitions. On large tables, this can increase CPU, memory usage, and disk activity.",
        "Indexes that match the partition and ordering keys may help some execution plans.",
        "Verify performance with `EXPLAIN (ANALYZE, BUFFERS)` rather than assuming that an index removes all sorting.",
      ],
    },
    {
      kind: "prose",
      heading: "6. PRACTICE: Your turn",
      body: [],
    },
    {
      kind: "sql-practice",
      challengeId: "cycle-depot-top-two-revenue-levels",
      title: "Find products at the top two revenue levels",
      prompt:
        "Use the product_sales table (sale_id, category, product_id, revenue). Assume sale_id uniquely identifies a row. Your manager asks: Return all products belonging to the top two distinct revenue levels within each category. Include every product tied at those levels. Write a query returning sale_id, category, product_id, revenue. Use DENSE_RANK(), partition by category, and order by revenue DESC inside the ranking window, without sale_id or product_id in the window ordering. Use a CTE, filter in the outer query, and return ranks 1 and 2. Order the final output by category, revenue DESC, sale_id. Do not use GROUP BY, DISTINCT ON, or LIMIT.",
      playgroundHref: "/sql-playground?practice=cycledepot-top-two-revenue-levels",
    },
    {
      kind: "takeaways",
      items: [
        "`LIMIT N` applies to the whole result. For N rows per group, rank within each group using `PARTITION BY`, then filter in a CTE or subquery.",
        "Use `ROW_NUMBER()` for exactly N rows per group, and add a unique tie-breaker such as `employee_id` to make the choice deterministic.",
        "Use `RANK()` for Top N competition-rank positions and `DENSE_RANK()` for Top N distinct metric levels. Both include ties.",
        "To keep ties together, use the metric alone in the ranking window. Use the unique key only in the outer `ORDER BY`.",
        "`RANK() <= N` and `DENSE_RANK() <= N` can return different rows. Ranking on large tables can need sorting, so check plans with `EXPLAIN (ANALYZE, BUFFERS)`.",
      ],
    },
    {
      kind: "quiz",
      questions: [
        {
          id: "top-n-output-shape",
          question: "Each department has four employees, and two of them tie for the second highest salary. How many rows does the `DENSE_RANK() <= 2` query return for two such departments?",
          options: [
            "Six rows, because tied employees share the second salary rank.",
            "Four rows, two for each department.",
            "Two rows, because the final filter limits the whole result.",
            "Eight rows, because every employee is ranked.",
          ],
          correctIndex: 0,
          explanation: "Each department has the top level plus a second level shared by two employees, so three rows per department and six in total. A `ROW_NUMBER() <= 2` query would return four rows.",
        },
        {
          id: "top-n-pick-function",
          question: "A report must contain exactly two employees per department, even when other employees tie at the cutoff. Which approach fits?",
          options: [
            "`ROW_NUMBER()` with a unique tie-breaker, filtered with `rn <= 2`.",
            "`DENSE_RANK()` with the salary alone, filtered with `<= 2`.",
            "`RANK()` with the salary alone, filtered with `<= 2`.",
            "`ORDER BY salary DESC LIMIT 2` on the whole table.",
          ],
          correctIndex: 0,
          explanation: "`ROW_NUMBER()` never gives two rows the same number, so it keeps exactly N rows per group. `RANK()` and `DENSE_RANK()` include ties, and `LIMIT 2` returns two rows for the whole table.",
        },
        {
          id: "top-n-correct-query",
          question: "You need every product in the top two distinct revenue levels of each category, with ties kept together. Which window definition is correct?",
          options: [
            "`DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC)`",
            "`DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC, product_id)`",
            "`ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC)`",
            "`DENSE_RANK() OVER (ORDER BY category, revenue DESC)`",
          ],
          correctIndex: 0,
          explanation: "The metric alone keeps equal revenue values as peers, and `PARTITION BY category` restarts the ranking. Adding `product_id` breaks the ties, `ROW_NUMBER()` never shares a number, and without `PARTITION BY` the categories are not separate.",
        },
        {
          id: "top-n-rank-vs-dense",
          question: "Salaries are 100, 100, 90 and 80. Which employees does `RANK() <= 2` return?",
          options: [
            "Only the two employees earning 100.",
            "The two employees earning 100 and the employee earning 90.",
            "Only one employee, because `RANK()` removes ties.",
            "All four employees.",
          ],
          correctIndex: 0,
          explanation: "The competition ranks are 1, 1, 3, 4, so only the two employees earning 100 pass `<= 2`. The dense ranks are 1, 1, 2, 3, so `DENSE_RANK() <= 2` also includes the employee earning 90.",
        },
      ],
    },
  ],
};

const rankingQuiz: LessonContent = {
  slug: "ranking-distribution-quiz",
  title: "Ranking & Distribution: Final Quiz",
  subtitle: "Test your knowledge of ranking, bucketing, percentile functions, and Top-N filtering.",
  sections: [
    {
      kind: "assessment",
      assessmentId: "ranking-distribution",
    },
  ],
};

const rankingCheatsheet: LessonContent = {
  slug: "ranking-distribution-cheatsheet",
  title: "Ranking & Distribution: Cheatsheet",
  subtitle: "One page reference for ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(), PERCENT_RANK(), CUME_DIST(), and Top-N patterns.",
  sections: [
    {
      kind: "cheatsheet",
      cheatsheetId: "ranking-distribution",
    },
  ],
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
  "ranking-distribution": {
    slug: "ranking-distribution",
    title: "Ranking & Distribution",
    category: "Advanced SQL",
    iconKey: "database",
    blurb:
      "Number, rank, bucket and measure rows with ROW_NUMBER, RANK, DENSE_RANK, NTILE, PERCENT_RANK and CUME_DIST.",
    lessons: [rankingRowNumber, rankingRankVsDenseRank, rankingNtile, rankingPercentRankCumeDist, rankingTopNPerGroup, rankingQuiz, rankingCheatsheet],
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
