// Final assessment for the Ranking & Distribution module (62 points, pass at 50).
// Section A: mini-quiz. Section B: rank-value prediction as multiple choice. Sections C and D:
// SQL challenges graded against the Cycle Depot sandbox. Only the SQL sections take typed answers.

import type { CheckRule, ChoiceQuestion } from "./window-foundations-assessment";

export const POINTS = {
  choice: 4,
  codingValid: 2,
  codingResult: 7,
  passScore: 50,
  total: 62,
} as const;

export const SECTION_MAX = { A: 20, B: 12, C: 15, D: 15 } as const;

export const EMPLOYEES = [
  { employee_id: 101, department: "Engineering", salary: 120000, performance_score: 95 },
  { employee_id: 102, department: "Engineering", salary: 110000, performance_score: 90 },
  { employee_id: 103, department: "Engineering", salary: 110000, performance_score: 90 },
  { employee_id: 104, department: "Engineering", salary: 90000, performance_score: 70 },
  { employee_id: 105, department: "Engineering", salary: 80000, performance_score: 60 },
  { employee_id: 201, department: "Sales", salary: 100000, performance_score: 92 },
  { employee_id: 202, department: "Sales", salary: 95000, performance_score: 85 },
  { employee_id: 203, department: "Sales", salary: 95000, performance_score: 85 },
  { employee_id: 204, department: "Sales", salary: 75000, performance_score: 65 },
  { employee_id: 301, department: "HR", salary: 90000, performance_score: 88 },
  { employee_id: 302, department: "HR", salary: 80000, performance_score: 75 },
  { employee_id: 303, department: "HR", salary: 70000, performance_score: 75 },
] as const;

export const TABLE_NAME = "employee_performance_review";

// ---------------------------------------------------------------- Section A

export const SECTION_A: ChoiceQuestion[] = [
  {
    id: "a1",
    prompt: "Two employees have equal salaries. Which function assigns the same rank and leaves gaps afterward?",
    options: ["ROW_NUMBER()", "RANK()", "DENSE_RANK()", "NTILE()"],
    correctIndex: 1,
    explanation:
      "RANK() gives tied rows the same rank and then skips the numbers they used, so 1, 2, 2 is followed by 4. DENSE_RANK() has no gap, ROW_NUMBER() never repeats a number, and NTILE() returns a bucket number.",
  },
  {
    id: "a2",
    prompt: "What does NTILE(4) primarily attempt to do?",
    options: [
      "Divide the salary range into four equal numerical intervals",
      "Divide rows into four approximately equal-sized ordered buckets",
      "Give tied salaries the same quartile in every case",
      "Return exactly four rows from each partition",
    ],
    correctIndex: 1,
    explanation:
      "NTILE(4) splits the ordered rows into four buckets whose sizes differ by at most one row. It counts rows, not salary values, it can place tied rows in different buckets, and it never removes rows.",
  },
  {
    id: "a3",
    prompt: "What does PERCENT_RANK() return for a one-row partition?",
    options: ["NULL", "0", "0.5", "1"],
    correctIndex: 1,
    explanation:
      "PERCENT_RANK() is (rank - 1) / (rows - 1). A one-row partition would divide by zero, so PostgreSQL returns 0 for it.",
  },
  {
    id: "a4",
    prompt:
      "Why should a unique employee_id normally be omitted from the window ORDER BY when DENSE_RANK() must preserve salary ties?",
    options: [
      "PostgreSQL forbids multiple window ordering columns",
      "It causes an SQL syntax error",
      "It can separate equal salaries into distinct peer groups",
      "It changes the partition key",
    ],
    correctIndex: 2,
    explanation:
      "Rows are peers only when every column in the window ORDER BY is equal. A unique employee_id makes every row different, so equal salaries stop being peers and no longer share a rank.",
  },
  {
    id: "a5",
    prompt: "How can PostgreSQL filter rows by a window-function result?",
    options: [
      "Use the window alias directly in WHERE at the same query level",
      "Calculate the window function in a CTE, then filter in an outer query",
      "Move the window function into GROUP BY",
      "Replace OVER() with LIMIT",
    ],
    correctIndex: 1,
    explanation:
      "WHERE runs before window functions, so it cannot see their results. Calculate the window value in a CTE, then filter that column in the outer query.",
  },
];

// ---------------------------------------------------------------- Section B

export const B_CODE = `SELECT
    employee_id,
    department,
    salary,
    ROW_NUMBER() OVER (
        PARTITION BY department
        ORDER BY salary DESC, employee_id
    ) AS rn,
    RANK() OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) AS rk,
    DENSE_RANK() OVER (
        PARTITION BY department
        ORDER BY salary DESC
    ) AS dr
FROM ${TABLE_NAME}
ORDER BY department, salary DESC, employee_id;`;

const triple = (rn: string, rk: string, dr: string) => `rn: ${rn} | rk: ${rk} | dr: ${dr}`;

/** One question per department, 4 points each, so all 12 employees are covered. */
export const SECTION_B: ChoiceQuestion[] = [
  {
    id: "b1",
    prompt:
      "Engineering has employees 101, 102, 103, 104 and 105, listed in output order. Which option gives rn, rk and dr for them?",
    options: [
      triple("1, 2, 3, 4, 5", "1, 2, 2, 3, 4", "1, 2, 2, 3, 4"),
      triple("1, 2, 2, 4, 5", "1, 2, 2, 4, 5", "1, 2, 2, 3, 4"),
      triple("1, 2, 3, 4, 5", "1, 2, 2, 4, 5", "1, 2, 2, 3, 4"),
      triple("1, 2, 3, 4, 5", "1, 2, 2, 4, 5", "1, 2, 2, 4, 5"),
    ],
    correctIndex: 2,
    explanation:
      "Employees 102 and 103 both earn 110000, so they are peers. ROW_NUMBER() still separates them with employee_id (2 and 3). RANK() gives both 2 and skips to 4, and DENSE_RANK() gives both 2 and continues with 3.",
  },
  {
    id: "b2",
    prompt:
      "HR has employees 301, 302 and 303, listed in output order. Their performance scores are 88, 75 and 75. Which option gives rn, rk and dr for them?",
    options: [
      triple("1, 2, 3", "1, 2, 2", "1, 2, 2"),
      triple("1, 2, 3", "1, 2, 2", "1, 2, 3"),
      triple("1, 2, 3", "1, 2, 3", "1, 2, 2"),
      triple("1, 2, 3", "1, 2, 3", "1, 2, 3"),
    ],
    correctIndex: 3,
    explanation:
      "The windows order by salary, not performance_score. The HR salaries 90000, 80000 and 70000 are all different, so there are no peers and all three functions return 1, 2, 3.",
  },
  {
    id: "b3",
    prompt:
      "Sales has employees 201, 202, 203 and 204, listed in output order. Which option gives rn, rk and dr for them?",
    options: [
      triple("1, 2, 3, 4", "1, 2, 2, 4", "1, 2, 2, 3"),
      triple("1, 2, 2, 4", "1, 2, 2, 4", "1, 2, 2, 3"),
      triple("1, 2, 3, 4", "1, 2, 2, 3", "1, 2, 2, 3"),
      triple("1, 2, 3, 4", "1, 2, 2, 4", "1, 2, 2, 4"),
    ],
    correctIndex: 0,
    explanation:
      "Employees 202 and 203 both earn 95000. ROW_NUMBER() gives 2 and 3 because employee_id breaks the tie. RANK() gives both 2 and then 4, and DENSE_RANK() gives both 2 and then 3.",
  },
];

// ---------------------------------------------------------------- Sections C and D

export const C_CHALLENGE_ID = "cycle-depot-ranking-final-top-two-levels";
export const D_CHALLENGE_ID = "cycle-depot-ranking-final-exactly-two";

const OUTER_ORDER: CheckRule = {
  id: "outer-order",
  text: "The final ORDER BY is department, salary DESC, employee_id",
  points: 2,
  pattern: "\\border\\s+by\\s+department\\s*,\\s*salary\\s+desc\\s*,\\s*employee_id\\s*;?\\s*$",
};

const OUTER_FILTER: CheckRule = {
  id: "cte-filter",
  text: "A CTE calculates the window result, and the outer query filters it with WHERE",
  points: 2,
  pattern: "^\\s*with\\b[\\s\\S]*\\bwhere\\b[\\s\\S]*(<=\\s*2\\b|<\\s*3\\b|\\bin\\s*\\(\\s*1\\s*,\\s*2\\s*\\)|\\bbetween\\s+1\\s+and\\s+2\\b)",
};

/** Section C: 2 + 7 + 2 + 2 + 2 = 15. */
export const C_RULES: CheckRule[] = [
  { id: "valid", text: "The query is valid PostgreSQL and runs without an error", points: POINTS.codingValid },
  { id: "result", text: "The result has the exact columns, rows and values", points: POINTS.codingResult },
  OUTER_FILTER,
  {
    id: "window",
    text: "DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) keeps salary ties together",
    points: 2,
    pattern: "\\bdense_rank\\s*\\(\\s*\\)\\s*over\\s*\\(\\s*partition\\s+by\\s+department\\s+order\\s+by\\s+salary\\s+desc\\s*\\)",
  },
  OUTER_ORDER,
];

/** Section D: 2 + 7 + 2 + 2 + 2 = 15. */
export const D_RULES: CheckRule[] = [
  { id: "valid", text: "The query is valid PostgreSQL and runs without an error", points: POINTS.codingValid },
  { id: "result", text: "The result has the exact columns, rows and values", points: POINTS.codingResult },
  OUTER_FILTER,
  {
    id: "window",
    text: "ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC, employee_id) breaks ties deterministically",
    points: 2,
    pattern: "\\brow_number\\s*\\(\\s*\\)\\s*over\\s*\\(\\s*partition\\s+by\\s+department\\s+order\\s+by\\s+salary\\s+desc\\s*,\\s*employee_id\\s*\\)",
  },
  OUTER_ORDER,
];

export const C_REQUIREMENTS = [
  "Use `DENSE_RANK()`.",
  "Partition by `department`.",
  "Order by `salary DESC` inside the window.",
  "Preserve salary ties.",
  "Use a CTE.",
  "Filter in the outer query.",
  "Final sorting: `department`, `salary DESC`, `employee_id`.",
  "Do not use `GROUP BY`, `DISTINCT ON`, or `LIMIT`.",
];

export const D_REQUIREMENTS = [
  "Use `ROW_NUMBER()`.",
  "Partition by `department`.",
  "Use a deterministic window ordering.",
  "Use a CTE.",
  "Return only rows numbered 1 or 2.",
  "Final sorting: `department`, `salary DESC`, `employee_id`.",
  "Do not use `GROUP BY`, `DISTINCT ON`, or `LIMIT`.",
];

export const OUTPUT_COLUMNS: [string, string][] = [
  ["employee_id", "Employee identifier"],
  ["department", "Department name"],
  ["salary", "Employee salary"],
];
