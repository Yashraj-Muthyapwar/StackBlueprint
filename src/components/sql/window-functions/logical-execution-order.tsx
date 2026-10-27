import type { Row, Stage, RowState } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

// ----- q-window-execution-order-cte: filter on a window result with a CTE -----
const TEMPLATE = "minmax(0,1.5fr) minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.7fr)";
const RAW_COLS = ["employee_id", "department", "salary"];
const STATS_COLS = ["employee_id", "department", "salary", "department_avg"];

type Employee = { id: number; department: string; salary: number; avg: number };
const EMPLOYEES: Employee[] = [
  { id: 1, department: "IT", salary: 5000, avg: 6000 },
  { id: 2, department: "IT", salary: 6000, avg: 6000 },
  { id: 3, department: "IT", salary: 7000, avg: 6000 },
  { id: 4, department: "HR", salary: 4000, avg: 4250 },
  { id: 5, department: "HR", salary: 4500, avg: 4250 },
];

const raw = (): Row[] => EMPLOYEES.map((e) => r(e.id, e.id, e.department, e.salary));
const stats = (): Row[] => EMPLOYEES.map((e) => r(e.id, e.id, e.department, e.salary, e.avg));
const above = (e: Employee) => e.salary > e.avg;

// Both stages show the complete CTE query, so the table below it never moves and the
// learner sees where each step happens. Each step highlights its own lines.
const FULL_SQL = [
  "WITH employee_stats AS (",
  "  SELECT employee_id, department,",
  "         salary,",
  "         AVG(salary) OVER (",
  "           PARTITION BY department",
  "         ) AS department_avg",
  "  FROM   employees",
  ")",
  "SELECT employee_id, department,",
  "       salary, department_avg",
  "FROM   employee_stats",
  "WHERE  salary > department_avg",
  "ORDER  BY employee_id",
];

export const logicalExecutionOrderStages: Stage[] = [
  {
    name: "Inner query",
    blurb: "calculate the window result",
    sql: FULL_SQL,
    table: { name: "employees", cols: RAW_COLS, rows: raw(), columnTemplate: TEMPLATE },
    steps: [
      st(
        [0, 6],
        "pending" as RowState,
        "Inside the CTE, FROM employees provides all five employees. No WHERE filter runs here, so every row reaches the window function.",
        { highlightCols: [1] },
      ),
      st(
        [1, 2, 3, 4, 5],
        (_row, i) => (EMPLOYEES[i].department === "IT" ? ("kept" as RowState) : ("added" as RowState)),
        "AVG(salary) OVER (PARTITION BY department) calculates one average per department and attaches it to every row. IT is (5000 + 6000 + 7000) / 3 = 6000, and HR is (4000 + 4500) / 2 = 4250.",
        {
          rowsOverride: stats(),
          colsOverride: STATS_COLS,
          highlightCols: [3],
          noteTone: "mint",
        },
      ),
    ],
  },
  {
    name: "Outer query",
    blurb: "filter on the calculated column",
    sql: FULL_SQL,
    table: { name: "employee_stats", cols: STATS_COLS, rows: stats(), columnTemplate: TEMPLATE },
    steps: [
      st(
        [7, 10],
        "pending" as RowState,
        "The outer query reads employee_stats. Its department_avg column is stored data now, so the outer query can use it like any other column.",
        { highlightCols: [3] },
      ),
      st(
        [11],
        (_row, i) => (above(EMPLOYEES[i]) ? ("kept" as RowState) : ("dropped" as RowState)),
        "WHERE salary > department_avg keeps employees 3 (7000 > 6000) and 5 (4500 > 4250). The other three are removed.",
        { highlightCols: [2, 3] },
      ),
      st(
        [8, 9, 12],
        "added" as RowState,
        "ORDER BY employee_id sorts the final rows. Two employees are above their department's average.",
        {
          rowsOverride: EMPLOYEES.filter(above).map((e) => r(e.id, e.id, e.department, e.salary, e.avg)),
          colsOverride: STATS_COLS,
          highlightCols: [3],
          noteTone: "mint",
        },
      ),
    ],
  },
];
