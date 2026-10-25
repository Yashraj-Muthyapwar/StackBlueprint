import type { Row, Stage, RowState } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-window-over-concept: SUM / AVG / COUNT with an empty OVER () -----
const SOURCE_COLS = ["employee_id", "salary"];
const STAFF: Row[] = [r(1, 1, 5000), r(2, 2, 6000), r(3, 3, 4000), r(4, 4, 4500)];
const TEMPLATE = "minmax(0,1.7fr) minmax(0,1fr) minmax(0,1.9fr)";

const withResult = (value: string | number): Row[] =>
  STAFF.map((row) => r(row.key, row.cells[0], row.cells[1], value));

const stage = (
  name: string,
  blurb: string,
  fn: string,
  alias: string,
  value: string | number,
  explain: string,
  panel: string[],
): Stage => ({
  name,
  blurb,
  sql: ["SELECT employee_id, salary,", `       ${fn} OVER () AS ${alias}`, "FROM   employees"],
  table: { name: "employees", cols: SOURCE_COLS, rows: STAFF, columnTemplate: TEMPLATE },
  steps: [
    st(
      [2],
      "pending" as RowState,
      "FROM employees provides the four rows. They all go into one window.",
      { highlightCols: [1], side: sidePanel("The window", ["OVER () = all four rows", "No PARTITION BY", "No ORDER BY"], "violet") },
    ),
    st(
      [1],
      "kept" as RowState,
      explain,
      { highlightCols: [1], side: sidePanel(fn, panel, "mint") },
    ),
    st(
      [0, 1],
      "added" as RowState,
      `All four employee rows stay. ${alias} is the same on every row.`,
      {
        rowsOverride: withResult(value),
        colsOverride: [...SOURCE_COLS, alias],
        noteTone: "mint",
        side: sidePanel("Row count", ["4 rows in", "4 rows out"], "mint"),
      },
    ),
  ],
});

export const overWindowConceptStages: Stage[] = [
  stage(
    "SUM",
    "adds every salary in the window",
    "SUM(salary)",
    "company_total",
    19500,
    "SUM(salary) adds 5000 + 6000 + 4000 + 4500 over the whole window.",
    ["5000 + 6000 + 4000 + 4500", "= 19500"],
  ),
  stage(
    "AVG",
    "averages every salary in the window",
    "AVG(salary)",
    "company_average",
    "4875.00",
    "AVG(salary) divides the total, 19500, by the four rows in the window.",
    ["19500 / 4", "= 4875.00"],
  ),
  stage(
    "COUNT",
    "counts every row in the window",
    "COUNT(*)",
    "employee_count",
    4,
    "COUNT(*) counts the rows in the window, which is four.",
    ["4 rows in the window", "= 4"],
  ),
];
