import type { Row, RowState, Stage } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-ranking-top-n-per-group: ROW_NUMBER for exactly N, DENSE_RANK for N levels -----
type Emp = { id: number; dept: string; salary: number };

const EMPLOYEES: Emp[] = [
  { id: 101, dept: "Engineering", salary: 120000 },
  { id: 102, dept: "Engineering", salary: 110000 },
  { id: 103, dept: "Engineering", salary: 110000 },
  { id: 104, dept: "Engineering", salary: 90000 },
  { id: 201, dept: "Sales", salary: 100000 },
  { id: 202, dept: "Sales", salary: 95000 },
  { id: 203, dept: "Sales", salary: 95000 },
  { id: 204, dept: "Sales", salary: 80000 },
];
const byId = (id: number) => EMPLOYEES.find((e) => e.id === id)!;
const STORED = [203, 101, 204, 102, 201, 103, 202, 104].map(byId);

const RN: Record<number, number> = { 101: 1, 102: 2, 103: 3, 104: 4, 201: 1, 202: 2, 203: 3, 204: 4 };
const DR: Record<number, number> = { 101: 1, 102: 2, 103: 2, 104: 3, 201: 1, 202: 2, 203: 2, 204: 3 };

const COLS = ["employee_id", "department", "salary"];
const TEMPLATE = "minmax(0,1.2fr) minmax(0,1.5fr) minmax(0,1.2fr) minmax(0,1fr)";

const plain = (list: Emp[]): Row[] => list.map((e) => r(e.id, e.id, e.dept, e.salary));
const withRank = (list: Emp[], rank: Record<number, number>): Row[] =>
  list.map((e) => r(e.id, e.id, e.dept, e.salary, rank[e.id]));

const sqlFor = (fn: string, order: string, alias: string) => [
  "WITH ranked_employees AS (",
  "  SELECT employee_id, department, salary,",
  `         ${fn} OVER (`,
  "           PARTITION BY department",
  `           ORDER BY ${order}`,
  `         ) AS ${alias}`,
  "  FROM employees",
  ")",
  "SELECT employee_id, department, salary",
  "FROM ranked_employees",
  `WHERE ${alias} <= 2`,
  "ORDER BY department, salary DESC, employee_id",
];

function stage(
  name: string,
  blurb: string,
  fn: string,
  order: string,
  alias: string,
  rank: Record<number, number>,
  rankNote: string,
  filterNote: string,
  resultNote: string,
  rankPanel: ReturnType<typeof sidePanel>,
  keptIds: number[],
): Stage {
  const sorted = EMPLOYEES;
  const keep = (row: Row): RowState => (keptIds.includes(Number(row.cells[0])) ? "kept" : "dropped");
  return {
    name,
    blurb,
    sql: sqlFor(fn, order, alias),
    table: { name: "employees", cols: COLS, rows: plain(STORED), columnTemplate: TEMPLATE },
    steps: [
      st([6], "pending", "FROM employees provides eight rows. Each department has four employees.", {
        highlightCols: [1],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Source", ["Table: employees"], "neutral")}
            {sidePanel("Rows", ["8 employees"], "neutral")}
          </div>
        ),
      }),
      st(
        [3, 4],
        (row) => (row.cells[1] === "Engineering" ? "kept" : "added"),
        "PARTITION BY department makes two partitions. Each one is ordered from the highest salary to the lowest.",
        {
          rowsOverride: plain(sorted),
          highlightCols: [1, 2],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Engineering", ["101, 102, 103, 104"], "mint")}
              {sidePanel("Sales", ["201, 202, 203, 204"], "amber")}
            </div>
          ),
        },
      ),
      st(
        [2, 5],
        (row) => (row.cells[1] === "Engineering" ? "kept" : "added"),
        rankNote,
        {
          rowsOverride: withRank(sorted, rank),
          colsOverride: [...COLS, alias],
          highlightCols: [3],
          side: rankPanel,
        },
      ),
      st([9, 10], keep, filterNote, {
        rowsOverride: withRank(sorted, rank),
        colsOverride: [...COLS, alias],
        highlightCols: [3],
        side: sidePanel("Filter", [`${alias} <= 2`, `${keptIds.length} rows kept`], "mint"),
      }),
      st([8, 11], "kept", resultNote, {
        rowsOverride: sorted.filter((e) => keptIds.includes(e.id)).map((e) => r(e.id, e.id, e.dept, e.salary)),
        highlightCols: [2],
        noteTone: "mint",
        side: sidePanel("Row count", ["8 rows in", `${keptIds.length} rows out`], "mint"),
      }),
    ],
  };
}

export const topNPerGroupStages: Stage[] = [
  stage(
    "Exactly two employees per department",
    "ROW_NUMBER() with a unique tie-breaker",
    "ROW_NUMBER()",
    "salary DESC, employee_id",
    "rn",
    RN,
    "ROW_NUMBER() gives 1, 2, 3, 4 in each department. employee_id breaks the tie between 102 and 103.",
    "WHERE rn <= 2 keeps two rows from each department and removes the rest.",
    "The outer ORDER BY sorts the output. The result has exactly two rows for each department.",
    sidePanel("ROW_NUMBER()", ["1, 2, 3, 4", "No shared numbers"], "amber"),
    [101, 102, 201, 202],
  ),
  stage(
    "Top two salary levels per department",
    "DENSE_RANK() keeps salary ties",
    "DENSE_RANK()",
    "salary DESC",
    "salary_rank",
    DR,
    "DENSE_RANK() gives 1, 2, 2, 3 in each department. Employees 102 and 103 share the second salary level.",
    "WHERE salary_rank <= 2 keeps both tied employees, so each department keeps three rows.",
    "The result has six rows because tied employees share the second salary rank in each department.",
    sidePanel("DENSE_RANK()", ["1, 2, 2, 3", "Ties share a rank"], "mint"),
    [101, 102, 103, 201, 202, 203],
  ),
];
