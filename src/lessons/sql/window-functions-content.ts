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
  subtitle: "OVER() / empty window / the window as a per-row set of rows / aggregate vs window call",
  sections: [],
};

const partitionBy: LessonContent = {
  slug: "partition-by",
  title: "PARTITION BY",
  subtitle: "PARTITION BY / independent windows per group / multiple partition keys / partition vs GROUP BY",
  sections: [],
};

const orderByInOver: LessonContent = {
  slug: "order-by-in-over",
  title: "ORDER BY inside OVER()",
  subtitle: "ORDER BY in OVER / running totals / ordering vs output ORDER BY / tie-breaking",
  sections: [],
};

const defaultFramesPeers: LessonContent = {
  slug: "default-frames-peers",
  title: "Default Window Frames and Peers",
  subtitle: "default frame / RANGE vs ROWS / peer rows / ties in running totals",
  sections: [],
};

const sqlLogicalExecutionOrder: LessonContent = {
  slug: "sql-logical-execution-order",
  title: "SQL Logical Execution Order",
  subtitle: "FROM / WHERE / GROUP BY / HAVING / window / SELECT / ORDER BY / why windows cannot appear in WHERE",
  sections: [],
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
