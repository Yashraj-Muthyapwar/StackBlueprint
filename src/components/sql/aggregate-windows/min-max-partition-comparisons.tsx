import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-aggregate-min-max: boundaries, gaps and tied maximum earners -----
const EMPLOYEES = [
  { id: 101, dept: "Engineering", salary: 120000 },
  { id: 102, dept: "Engineering", salary: 100000 },
  { id: 103, dept: "Engineering", salary: 80000 },
  { id: 201, dept: "Sales", salary: 90000 },
  { id: 202, dept: "Sales", salary: 70000 },
];
const byId = (id: number) => EMPLOYEES.find((e) => e.id === id)!;
const STORED = [202, 101, 201, 103, 102].map(byId);

const MIN: Record<string, number> = { Engineering: 80000, Sales: 70000 };
const MAX: Record<string, number> = { Engineering: 120000, Sales: 90000 };

const COLS = ["employee_id", "department", "salary"];
const isEng = (row: Row) => row.cells[1] === "Engineering";
const base = (list: typeof EMPLOYEES): Row[] => list.map((e) => r(e.id, e.id, e.dept, e.salary));
const partitionPanel = (
  <div className="grid grid-cols-2 gap-2">
    {sidePanel("Engineering", ["101, 102, 103"], "mint")}
    {sidePanel("Sales", ["201, 202"], "amber")}
  </div>
);
const fromStep = st([3], "pending", "FROM employees provides five rows. Every one of them will stay in the result.", {
  highlightCols: [1, 2],
  side: (
    <div className="grid grid-cols-2 gap-2">
      {sidePanel("Source", ["Table: employees"], "neutral")}
      {sidePanel("Rows", ["5 employees"], "neutral")}
    </div>
  ),
});

// Example A: department minimum and maximum
const T5 = "minmax(0,1fr) minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.2fr) minmax(0,1.2fr)";
const aRows = (n: number): Row[] =>
  EMPLOYEES.map((e) => {
    const cells: (string | number)[] = [e.id, e.dept, e.salary];
    if (n >= 1) cells.push(MIN[e.dept]);
    if (n >= 2) cells.push(MAX[e.dept]);
    return r(e.id, ...cells);
  });
const aCols = (n: number) => [...COLS, "department_min", "department_max"].slice(0, 3 + n);

// Example B: gap from the department maximum
const bRows = (n: number): Row[] =>
  EMPLOYEES.map((e) => {
    const cells: (string | number)[] = [e.id, e.dept, e.salary, MAX[e.dept]];
    if (n >= 2) cells.push(MAX[e.dept] - e.salary);
    return r(e.id, ...cells);
  });
const bCols = (n: number) => [...COLS, "department_max", "gap_from_max"].slice(0, 3 + n);

// Example C: employees who earn the departmental maximum
const T4 = "minmax(0,1fr) minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.4fr)";
const cRows = (): Row[] => EMPLOYEES.map((e) => r(e.id, e.id, e.dept, e.salary, MAX[e.dept]));
const earns = (row: Row) => Number(row.cells[2]) === Number(row.cells[3]);

export const minMaxStages: Stage[] = [
  {
    name: "A. Department minimum and maximum",
    blurb: "MIN() and MAX() beside every employee",
    sql: [
      "SELECT employee_id, department, salary,",
      "  MIN(salary) OVER (PARTITION BY department) AS department_min,",
      "  MAX(salary) OVER (PARTITION BY department) AS department_max",
      "FROM employees",
      "ORDER BY department, employee_id;",
    ],
    table: { name: "employees", cols: COLS, rows: base(STORED), columnTemplate: T5 },
    steps: [
      fromStep,
      st([1, 2], (row) => (isEng(row) ? "kept" : "added"), "PARTITION BY department creates two partitions. Engineering has three employees and Sales has two. No row is removed.", {
        rowsOverride: base(EMPLOYEES),
        highlightCols: [1],
        side: partitionPanel,
      }),
      st([1], (row) => (isEng(row) ? "kept" : "added"), "MIN(salary) finds the smallest salary in each partition: 80000 for Engineering and 70000 for Sales.", {
        rowsOverride: aRows(1),
        colsOverride: aCols(1),
        highlightCols: [3],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Engineering", ["Min = 80000"], "mint")}
            {sidePanel("Sales", ["Min = 70000"], "amber")}
          </div>
        ),
      }),
      st([2], (row) => (isEng(row) ? "kept" : "added"), "MAX(salary) finds the largest salary in each partition: 120000 for Engineering and 90000 for Sales.", {
        rowsOverride: aRows(2),
        colsOverride: aCols(2),
        highlightCols: [4],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Engineering", ["Max = 120000"], "mint")}
            {sidePanel("Sales", ["Max = 90000"], "amber")}
          </div>
        ),
      }),
      st([4], "kept", "ORDER BY sorts the final output. The output contains all five original employees.", {
        rowsOverride: aRows(2),
        colsOverride: aCols(2),
        noteTone: "mint",
        side: sidePanel("Row count", ["5 rows in", "5 rows out"], "mint"),
      }),
    ],
  },
  {
    name: "B. Gap from the maximum",
    blurb: "How far below the department maximum?",
    sql: [
      "SELECT employee_id, department, salary,",
      "  MAX(salary) OVER (PARTITION BY department) AS department_max,",
      "  MAX(salary) OVER (PARTITION BY department) - salary AS gap_from_max",
      "FROM employees",
      "ORDER BY department, employee_id;",
    ],
    table: { name: "employees", cols: COLS, rows: base(STORED), columnTemplate: T5 },
    steps: [
      fromStep,
      st([1, 2], (row) => (isEng(row) ? "kept" : "added"), "The same two partitions are used for both calculations.", {
        rowsOverride: base(EMPLOYEES),
        highlightCols: [1],
        side: partitionPanel,
      }),
      st([1], (row) => (isEng(row) ? "kept" : "added"), "The first MAX(salary) attaches the department maximum to every row: 120000 for Engineering and 90000 for Sales.", {
        rowsOverride: bRows(1),
        colsOverride: bCols(1),
        highlightCols: [3],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Engineering", ["Max = 120000"], "mint")}
            {sidePanel("Sales", ["Max = 90000"], "amber")}
          </div>
        ),
      }),
      st([2], (row) => (Number(row.cells[4]) === 0 ? "kept" : "added"), "The second MAX(salary) is a window value, so it can be used in arithmetic. Subtracting the row's own salary gives the gap.", {
        rowsOverride: bRows(2),
        colsOverride: bCols(2),
        highlightCols: [4],
        side: sidePanel("Gap", ["101: 0", "102: 20000", "103: 40000", "201: 0", "202: 20000"], "violet"),
      }),
      st([4], "kept", "An employee with gap_from_max = 0 earns the maximum salary in their department. If two employees share the maximum, both receive a gap of 0.", {
        rowsOverride: bRows(2),
        colsOverride: bCols(2),
        noteTone: "mint",
        side: sidePanel("Row count", ["5 rows in", "5 rows out"], "mint"),
      }),
    ],
  },
  {
    name: "C. Maximum earners",
    blurb: "Filter on a window result with a CTE",
    sql: [
      "WITH salary_stats AS (",
      "  SELECT employee_id, department, salary,",
      "    MAX(salary) OVER (PARTITION BY department) AS department_max",
      "  FROM employees",
      ")",
      "SELECT employee_id, department, salary",
      "FROM salary_stats",
      "WHERE salary = department_max",
      "ORDER BY department, employee_id;",
    ],
    table: { name: "employees", cols: COLS, rows: base(STORED), columnTemplate: T4 },
    steps: [
      st([3], "pending", "The CTE starts from employees, which provides five rows.", {
        highlightCols: [2],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Source", ["Table: employees"], "neutral")}
            {sidePanel("Rows", ["5 employees"], "neutral")}
          </div>
        ),
      }),
      st([2], (row) => (isEng(row) ? "kept" : "added"), "Inside the CTE, MAX(salary) OVER (PARTITION BY department) calculates the maximum. A window function cannot be filtered in WHERE at the same query level, so the calculation lives here.", {
        rowsOverride: cRows(),
        colsOverride: [...COLS, "department_max"],
        highlightCols: [3],
        side: partitionPanel,
      }),
      st([7], (row) => (earns(row) ? "kept" : "dropped"), "The outer WHERE keeps rows where salary equals department_max. Employees 101 and 201 match, and the other three are removed.", {
        rowsOverride: cRows(),
        colsOverride: [...COLS, "department_max"],
        highlightCols: [2, 3],
        side: sidePanel("Filter", ["salary = department_max", "2 rows kept"], "mint"),
      }),
      st([5, 8], "kept", "The result has two rows, one for each department. This returns all employees tied for the maximum. ROW_NUMBER() is not needed, because the requirement is to keep every tie.", {
        rowsOverride: EMPLOYEES.filter((e) => e.salary === MAX[e.dept]).map((e) => r(e.id, e.id, e.dept, e.salary)),
        colsOverride: COLS,
        highlightCols: [2],
        noteTone: "mint",
        side: sidePanel("Row count", ["5 rows in", "2 rows out"], "mint"),
      }),
    ],
  },
];
