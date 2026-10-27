import type { Row, Stage, RowState } from "@/components/lesson/MultiStage";
import { bucketPanel, r, sidePanel, st } from "../animation-shared";

// ----- q-window-group-by-vs-window: collapse rows vs keep rows -----
const COLS = ["employee_id", "department", "salary"];
const STAFF: Row[] = [
  r(1, 1, "IT", 5000),
  r(2, 2, "IT", 6000),
  r(3, 3, "HR", 4000),
  r(4, 4, "HR", 4500),
];

const GROUPED: Row[] = [r("it", "IT", 11000), r("hr", "HR", 8500)];
const WINDOWED: Row[] = [
  r(1, 1, "IT", 5000, 11000),
  r(2, 2, "IT", 6000, 11000),
  r(3, 3, "HR", 4000, 8500),
  r(4, 4, "HR", 4500, 8500),
];

const inIt = (row: Row) => row.cells[1] === "IT";

export const groupByVsWindowStages: Stage[] = [
  {
    name: "GROUP BY collapses rows",
    blurb: "Four employees go in. One row per department comes out.",
    sql: [
      "SELECT department, SUM(salary) AS department_total",
      "FROM   staff_salaries",
      "GROUP  BY department",
      "-- one row per department",
    ],
    table: { name: "staff_salaries", cols: COLS, rows: STAFF },
    steps: [
      st(
        [1],
        "pending" as RowState,
        "Same four employees, same two rooms. First, GROUP BY.",
      ),
      st(
        [2],
        (row) => (inIt(row) ? ("kept" as RowState) : ("pending" as RowState)),
        "GROUP BY department puts the rows into groups. The two IT rows share one group, and the two HR rows share another.",
        {
          highlightCols: [1],
          side: bucketPanel([
            { k: "IT", sum: 11000 },
            { k: "HR", sum: 8500 },
          ]),
        },
      ),
      st(
        [0],
        "added" as RowState,
        "SUM(salary) runs once per group. The individual employees are gone: 4 rows became 2.",
        {
          rowsOverride: GROUPED,
          colsOverride: ["department", "department_total"],
          noteTone: "amber",
        },
      ),
    ],
  },
  {
    name: "A window function keeps every row",
    blurb: "Each employee keeps a row and also sees the total of their own department.",
    sql: [
      "SELECT employee_id, department, salary,",
      "       SUM(salary) OVER (PARTITION BY department)",
      "         AS department_total",
      "FROM   staff_salaries",
    ],
    table: { name: "staff_salaries", cols: COLS, rows: STAFF },
    steps: [
      st(
        [3],
        "pending" as RowState,
        "Start with the same four employee rows.",
      ),
      st(
        [1],
        (row) => (inIt(row) ? ("kept" as RowState) : ("added" as RowState)),
        "PARTITION BY department splits the rows into two partitions. No row is removed.",
        {
          highlightCols: [1],
          side: sidePanel("Partitions", ["IT: 5000 + 6000", "HR: 4000 + 4500"]),
        },
      ),
      st(
        [1, 2],
        "added" as RowState,
        "SUM(salary) OVER (...) writes each partition total onto every row of that partition. 4 rows in, 4 rows out.",
        {
          rowsOverride: WINDOWED,
          colsOverride: [...COLS, "department_total"],
          noteTone: "mint",
          side: sidePanel("Row count", ["GROUP BY: 2 rows", "Window function: 4 rows"], "mint"),
        },
      ),
    ],
  },
];
