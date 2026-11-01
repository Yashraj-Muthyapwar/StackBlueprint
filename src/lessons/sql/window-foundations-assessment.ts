// Final assessment for the Window Function Foundations module (100 points, pass at 80).
// Every part is auto-graded. Section A: mini-quiz. Section B: predictions plus a multiple
// choice explanation for each. Section C: SQL challenge. Section D: interview multiple choice.

export type ChoiceQuestion = {
  id: string;
  /** Points for a correct answer. Defaults to POINTS.choice. */
  points?: number;
  prompt: string;
  /** SQL shown between the prompt and the options. */
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const POINTS = {
  choice: 4,
  predictionValue: 1,
  pairValue: 2,
  passScore: 80,
  total: 100,
} as const;

export const TRANSACTIONS = [
  { txn_id: 1, account_id: "A", txn_date: "2026-04-01", amount: 100 },
  { txn_id: 2, account_id: "A", txn_date: "2026-04-02", amount: 200 },
  { txn_id: 3, account_id: "A", txn_date: "2026-04-02", amount: 50 },
  { txn_id: 4, account_id: "B", txn_date: "2026-04-01", amount: 300 },
  { txn_id: 5, account_id: "B", txn_date: "2026-04-03", amount: 100 },
  { txn_id: 6, account_id: "A", txn_date: "2026-04-04", amount: 150 },
] as const;

// ---------------------------------------------------------------- Section A

export const SECTION_A: ChoiceQuestion[] = [
  {
    id: "a1",
    prompt:
      "A PostgreSQL employees table has six rows across three departments. Which query form returns each employee row together with its department's total salary?",
    options: [
      "SELECT department, SUM(salary) FROM employees GROUP BY department",
      "SELECT employee_id, salary, SUM(salary) OVER (PARTITION BY department) FROM employees",
      "SELECT employee_id, salary, SUM(salary) OVER () FROM employees",
      "SELECT employee_id, salary, SUM(salary) FROM employees",
    ],
    correctIndex: 1,
    explanation: "The partition separates departments, and the window calculation keeps each employee row.",
  },
  {
    id: "a2",
    prompt:
      "PostgreSQL has one account's rows: (txn_id=1, day=1, amount=10), (txn_id=2, day=2, amount=20), (txn_id=3, day=2, amount=30). What is the result of SUM(amount) OVER (ORDER BY day) on the row with txn_id=2?",
    options: ["60", "10", "50", "30"],
    correctIndex: 0,
    explanation: "The default RANGE frame includes all earlier ordering values and all peers on day 2: 10 + 20 + 30 = 60.",
  },
  {
    id: "a3",
    prompt:
      "You must filter orders to those above their customer's average, calculated using AVG(amount) OVER (PARTITION BY customer_id). Which approach is valid in PostgreSQL?",
    options: [
      "Put the window AVG directly into HAVING at the same query level",
      "Calculate the window average in a CTE, then filter by its alias in the outer WHERE",
      "Put the window AVG directly into WHERE at the same query level",
      "Put the window AVG directly into GROUP BY at the same query level",
    ],
    correctIndex: 1,
    explanation: "The inner query calculates window values. The outer query can filter the resulting column.",
  },
  {
    id: "a4",
    prompt:
      "For PostgreSQL SUM(amount) OVER (), with no PARTITION BY, ORDER BY, or frame clause, the aggregate uses the entire available partition for every result row.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation: "The aggregate uses the entire available partition, so every row receives that partition's total.",
  },
  {
    id: "a5",
    prompt:
      "In PostgreSQL, adding ORDER BY sale_date, sale_id inside OVER() guarantees that the final displayed result rows are sorted by those columns, even without an outer ORDER BY.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation: "Only the query's final ORDER BY guarantees the displayed sort order.",
  },
];

// ---------------------------------------------------------------- Section B

/** B1 expectations in output order: account_id, txn_date, txn_id. */
export const B1_ROWS = [
  { txn_id: 1, expected: 100 },
  { txn_id: 2, expected: 350 },
  { txn_id: 3, expected: 350 },
  { txn_id: 6, expected: 500 },
  { txn_id: 4, expected: 300 },
  { txn_id: 5, expected: 400 },
] as const;

export const B1_CODE = `SELECT
    txn_id,
    account_id,
    amount,
    SUM(amount) OVER (
        PARTITION BY account_id
        ORDER BY txn_date
    ) AS running_total
FROM transactions
ORDER BY account_id, txn_date, txn_id;`;

/** B1 explanation (4 points). */
export const B1_EXPLAIN: ChoiceQuestion = {
  id: "b1x",
  points: 4,
  prompt:
    "In the B1 output, transactions 2 and 3 (account A, 2026-04-02) both receive 350. Which explanation is correct?",
  options: [
    "They tie on txn_date, so they are peers. The default frame is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which includes both rows because they share a date.",
    "They tie on txn_date, so PARTITION BY account_id puts them in a smaller partition together, and that partition has one shared total.",
    "They tie on txn_date, so they are peers. The default RANGE frame ends at the last peer of the current row, so both frames include both amounts.",
    "They tie on txn_date, and the final ORDER BY account_id, txn_date, txn_id makes their frames identical.",
  ],
  correctIndex: 2,
  explanation:
    "Rows with equal window ORDER BY values are peers. With ORDER BY and no frame clause, PostgreSQL uses RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and under RANGE the current row's frame ends at its last peer, so both rows include 100 + 200 + 50 = 350. The default frame is RANGE, not ROWS, PARTITION BY only splits by account, and the final ORDER BY does not change a window calculation.",
};

export const B2_CODE = `SELECT
    txn_id,
    account_id,
    amount,
    SUM(amount) OVER (
        PARTITION BY account_id
    ) AS account_total
FROM transactions
WHERE amount >= 150
ORDER BY account_id, txn_id;`;

/** The rows that query returns. */
export const B2_EXPECTED = [
  { txn_id: 2, total: 350 },
  { txn_id: 6, total: 350 },
  { txn_id: 4, total: 300 },
] as const;

/** B2 explanation (4 points). */
export const B2_EXPLAIN: ChoiceQuestion = {
  id: "b2x",
  points: 4,
  prompt: "Which statement correctly explains the account_total values the B2 query returns?",
  options: [
    "WHERE removes the transactions under 150 first, then the window sums the remaining rows of each account: account A is 200 + 150 = 350 and account B is 300.",
    "The window sums every row of each account first, then WHERE removes the small rows from the display: account A would show 500 and account B would show 400.",
    "WHERE removes the transactions under 150 first, but the window still sums all original rows of the account, so account A shows 500.",
    "The window sums only the rows in each account's output after ORDER BY account_id, txn_id, so the totals depend on the final sort.",
  ],
  correctIndex: 0,
  explanation:
    "WHERE is evaluated logically before window functions, so only transactions 2, 4 and 6 reach SUM(amount) OVER (PARTITION BY account_id). Account A keeps 200 and 150, so its total is 350, and account B keeps 300. The final ORDER BY only sorts the finished rows.",
};

// ---------------------------------------------------------------- Section C

export type CheckRule = { id: string; text: string; points: number; pattern?: string };

export const C_CHALLENGE_ID = "cycle-depot-window-foundations-final";

/** Point rules for the SQL challenge: 5 + 15 + 5 + 4 + 3 + 3 + 3 + 2 = 40. */
export const C_RULES: CheckRule[] = [
  { id: "valid", text: "The query is valid PostgreSQL and runs without an error", points: 5 },
  { id: "result", text: "The result has the exact columns, rows and values", points: 15 },
  {
    id: "cte-filter",
    text: "A CTE calculates the window results, and the outer query filters with WHERE amount > account_avg",
    points: 5,
    pattern: "^\\s*with\\b[\\s\\S]*\\bwhere\\s+amount\\s*>\\s*account_avg\\b",
  },
  {
    id: "avg",
    text: "AVG(amount) OVER (PARTITION BY account_id) gives the account average",
    points: 4,
    pattern: "\\bavg\\s*\\(\\s*amount\\s*\\)\\s*over\\s*\\(\\s*partition\\s+by\\s+account_id\\s*\\)",
  },
  {
    id: "sum-partition",
    text: "SUM(amount) OVER has PARTITION BY account_id",
    points: 3,
    pattern: "\\bsum\\s*\\(\\s*amount\\s*\\)\\s*over\\s*\\([^)]*partition\\s+by\\s+account_id",
  },
  {
    id: "window-order",
    text: "The window orders by txn_date, txn_id for a deterministic order",
    points: 3,
    pattern: "\\bover\\s*\\([^)]*order\\s+by\\s+txn_date\\s*,\\s*txn_id",
  },
  {
    id: "rows-frame",
    text: "An explicit ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW frame",
    points: 3,
    pattern: "\\brows\\s+between\\s+unbounded\\s+preceding\\s+and\\s+current\\s+row\\b",
  },
  {
    id: "outer-order",
    text: "The final ORDER BY is account_id, txn_date, txn_id",
    points: 2,
    pattern: "\\border\\s+by\\s+account_id\\s*,\\s*txn_date\\s*,\\s*txn_id\\s*;?\\s*$",
  },
];

export const C_REQUIREMENTS = [
  "Use `AVG(amount) OVER (PARTITION BY account_id)` for the account average.",
  "Use `SUM(amount) OVER (...)` for the running total.",
  "Define a separate running total for each account.",
  "Use `txn_date, txn_id` for deterministic window ordering.",
  "Specify `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.",
  "Use a CTE to calculate window results before the outer filter.",
  "Apply `WHERE amount > account_avg` in the outer query.",
  "Display the final rows in ascending `account_id`, `txn_date`, and `txn_id` order.",
  "Calculate the running total across **all transactions of each account**, before filtering to above-average transactions.",
  "Do not use a correlated subquery or `GROUP BY`.",
];

export const C_COLUMNS: [string, string][] = [
  ["txn_id", "Transaction identifier"],
  ["account_id", "Account identifier"],
  ["txn_date", "Transaction date"],
  ["amount", "Individual transaction amount"],
  ["account_avg", "Average amount across all transactions of the account"],
  ["running_total", "Deterministic row-by-row cumulative amount for the account"],
];

// ---------------------------------------------------------------- Section D

export const D2_CODE = `SELECT
    account_id,
    txn_id,
    amount,
    SUM(amount) OVER (
        PARTITION BY account_id
        ORDER BY txn_date
    ) AS running_total
FROM transactions
WHERE amount > 100;`;

/** Four questions, 5 points each, 20 points total. */
export const SECTION_D: ChoiceQuestion[] = [
  {
    id: "d1a",
    points: 5,
    prompt:
      "D1 Fundamentals. A transactions table has several rows per account. Which statement correctly compares GROUP BY account_id with SUM(amount) and SUM(amount) OVER (PARTITION BY account_id)?",
    options: [
      "GROUP BY account_id returns one summary row per account, and SUM(amount) OVER (PARTITION BY account_id) returns one summary row per account as well, but with a window ORDER BY.",
      "GROUP BY account_id returns one summary row per account. SUM(amount) OVER (PARTITION BY account_id) keeps every transaction row and repeats the account total on each one.",
      "GROUP BY account_id keeps every transaction row and repeats the account total. SUM(amount) OVER (PARTITION BY account_id) returns one summary row per account.",
      "Both keep every transaction row, and GROUP BY only differs because it needs a HAVING clause to collapse them.",
    ],
    correctIndex: 1,
    explanation:
      "GROUP BY collapses rows into one summary row per group. PARTITION BY only divides rows into groups for the window calculation and keeps every row, so each transaction shows its account's total beside it.",
  },
  {
    id: "d1b",
    points: 5,
    prompt:
      "D1 Fundamentals. What does a window frame add on top of PARTITION BY and window ORDER BY?",
    options: [
      "It chooses which partition the current row belongs to, for example one partition per account.",
      "It chooses the order of the rows inside the partition, for example by txn_date and txn_id.",
      "It chooses which rows are removed from the result, for example amounts of 100 or less.",
      "It chooses which rows inside the partition, relative to the current row, feed the calculation, for example every row from the start of the partition through the current row for a running total.",
    ],
    correctIndex: 3,
    explanation:
      "PARTITION BY defines the groups, and window ORDER BY defines their logical order. The frame then decides which rows of the partition, relative to the current row, contribute to a frame-sensitive calculation such as a running total.",
  },
  {
    id: "d2a",
    points: 5,
    prompt:
      "D2 Debugging. A junior engineer writes the query below. They expect running_total to include transactions of 100 or less. Why does the query not meet that requirement?",
    code: D2_CODE,
    options: [
      "WHERE is evaluated before window functions, so transactions of 100 or less are removed before running_total is calculated.",
      "WHERE is evaluated after window functions, but the window ORDER BY txn_date hides the rows of 100 or less.",
      "The default frame stops before rows of 100 or less because they are not peers of the current row.",
      "PARTITION BY account_id applies the amount filter again inside each partition.",
    ],
    correctIndex: 0,
    explanation:
      "The logical order is FROM, WHERE, GROUP BY, HAVING, window functions, SELECT, then ORDER BY. The WHERE amount > 100 filter runs first, so the window function never sees the smaller transactions.",
  },
  {
    id: "d2b",
    points: 5,
    prompt:
      "D2 Debugging. Which change makes running_total include every transaction while the query still displays only amounts above 100?",
    code: D2_CODE,
    options: [
      "Move WHERE amount > 100 into the OVER clause so the window ignores the smaller rows.",
      "Keep WHERE amount > 100 and add ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW to the window.",
      "Calculate running_total in a CTE over all transactions, then apply WHERE amount > 100 in the outer query.",
      "Replace WHERE with HAVING amount > 100 at the same query level.",
    ],
    correctIndex: 2,
    explanation:
      "A window function sees only the rows that survive the filters at its own query level. Calculating running_total in a CTE keeps every transaction in the window, and the outer query can then filter the finished column. A frame clause does not undo a WHERE filter, and HAVING cannot filter ungrouped rows.",
  },
];
