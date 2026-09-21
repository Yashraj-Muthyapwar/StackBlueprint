import type { Row, RowState, Stage } from "@/components/lesson/MultiStage";
import { pass, r, sidePanel, st } from "../animation-shared";

const CUSTOMERS: Row[] = [
  r(1, 1, "Zane Novak", "Austin", "USA"),
  r(2, 2, "Boris Alvarez", "Bristol", "UK"),
  r(5, 5, "Omar Doyle", null, "Germany"),
  r(14, 14, "Hana Yilmaz", null, "France"),
  r(45, 45, "Chloe Farouk", null, "France"),
  r(46, 46, "Farid Sharma", null, "Canada"),
  r(47, 47, "Elena Silva", null, "USA"),
];

const COLUMNS = ["id", "name", "city", "country"];

/** Stages for Filtering 1.4: NULL, UNKNOWN, IS NULL, and COALESCE. */
export const nullThreeValuedLogicStages: Stage[] = [
  {
    name: "= NULL keeps nothing",
    blurb: "Every equality comparison with NULL is UNKNOWN",
    sql: ["SELECT id, name, city", "FROM   customers", "WHERE  city = NULL"],
    table: { name: "customers", cols: COLUMNS, rows: CUSTOMERS },
    steps: [
      st(
        [0, 1],
        "pending",
        "Two known-city rows and five missing-city Cycle Depot rows enter the WHERE condition.",
      ),
      st(
        [2],
        () => "dropped" as RowState,
        "`city = NULL` is UNKNOWN for every row, including rows whose city is NULL. WHERE keeps only TRUE, so the result is empty.",
        {
          highlightCols: [2],
          noteTone: "rose",
          side: sidePanel("WHERE rule", ["TRUE: keep", "FALSE: drop", "UNKNOWN: drop"], "rose"),
        },
      ),
    ],
  },
  {
    name: "IS NULL finds missing cities",
    blurb: "This special test returns TRUE or FALSE",
    sql: ["SELECT id, name, city", "FROM   customers", "WHERE  city IS NULL", "ORDER  BY id"],
    table: { name: "customers", cols: COLUMNS, rows: CUSTOMERS },
    steps: [
      st(
        [2],
        pass((row) => row.cells[2] === null),
        "IS NULL is designed for missing values. It keeps the five customer profiles with no city recorded.",
        { highlightCols: [2], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "A comparison can hide NULLs",
    blurb: "UNKNOWN is not the same as FALSE",
    sql: ["SELECT id, name, city", "FROM   customers", "WHERE  city <> 'Austin'"],
    table: { name: "customers", cols: COLUMNS, rows: CUSTOMERS },
    steps: [
      st(
        [2],
        pass((row) => row.cells[2] !== null && row.cells[2] !== "Austin"),
        "Boris remains because Bristol is not Austin. The five NULL cities evaluate to UNKNOWN, so they disappear along with the Austin row.",
        { highlightCols: [2], noteTone: "amber" },
      ),
      st(
        [2, 3],
        pass((row) => row.cells[2] === null || row.cells[2] !== "Austin"),
        "Add `OR city IS NULL` when the business rule should include missing cities as well as every non-Austin city.",
        { highlightCols: [2], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "COALESCE labels missing data",
    blurb: "Choose a display value without changing stored data",
    sql: [
      "SELECT id, name,",
      "       COALESCE(city, 'Missing') AS city_status",
      "FROM   customers",
    ],
    table: { name: "customers", cols: COLUMNS, rows: CUSTOMERS },
    steps: [
      st(
        [1],
        "added",
        "COALESCE returns the first non-NULL value. It is useful for display labels, but it does not change the city stored in the table.",
        {
          rowsOverride: CUSTOMERS.map((row) =>
            r(row.key, row.cells[0]!, row.cells[1]!, row.cells[2] ?? "Missing", row.cells[3]!),
          ),
          colsOverride: ["id", "name", "city_status", "country"],
          highlightCols: [2],
          noteTone: "violet",
        },
      ),
    ],
  },
];
