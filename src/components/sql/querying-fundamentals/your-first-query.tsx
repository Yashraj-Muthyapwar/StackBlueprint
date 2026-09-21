import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ----- select-projection -----
const customersP: Row[] = [
  r(1, 1, "Zane Novak", "zane.novak1@example.com", "Austin", "USA", "pro", "2023-01-06"),
  r(2, 2, "Boris Alvarez", "boris.alvarez2@example.com", "Bristol", "UK", "retail", "2024-06-08"),
  r(3, 3, "Priya Doyle", "priya.doyle3@example.com", "Manchester", "UK", "retail", "2023-01-15"),
  r(4, 4, "Ugo Mensah", "ugo.mensah4@example.com", "Dallas", "USA", "retail", "2023-02-10"),
];
const customerCols = ["id", "name", "email", "city", "country", "segment", "signup_date"];

export const projStages: Stage[] = [
  {
    name: "SELECT *: explore the table",
    layout: "wide",
    sql: ["SELECT *", "FROM customers", "ORDER BY id", "LIMIT 4"],
    table: {
      name: "customers",
      cols: customerCols,
      rows: customersP,
      columnTemplate:
        "70px minmax(140px, 1fr) minmax(215px, 1.45fr) minmax(120px, 0.8fr) minmax(95px, 0.65fr) minmax(110px, 0.75fr) minmax(125px, 0.85fr)",
    },
    steps: [
      st(
        [0, 1, 2, 3],
        "kept",
        "SELECT * is helpful while exploring. This deterministic sample shows all seven customer columns for the first four rows.",
        { highlightCols: [0, 1, 2, 3, 4, 5, 6], noteTone: "amber" },
      ),
    ],
  },
  {
    name: "Project specific columns",
    sql: ["SELECT id, name, country", "FROM customers", "ORDER BY id", "LIMIT 4"],
    table: { name: "customers", cols: customerCols, rows: customersP },
    steps: [
      st(
        [0, 1, 2, 3],
        "kept",
        "The same four rows remain, but only the three requested columns reach the result.",
        {
          rowsOverride: [
            r("a", 1, "Zane Novak", "USA"),
            r("b", 2, "Boris Alvarez", "UK"),
            r("c", 3, "Priya Doyle", "UK"),
            r("d", 4, "Ugo Mensah", "USA"),
          ],
          colsOverride: ["id", "name", "country"],
          highlightCols: [0, 1, 2],
        },
      ),
    ],
  },

  {
    name: "Column order shapes the result",
    sql: ["SELECT country, name", "FROM customers"],
    table: { name: "customers", cols: customerCols, rows: customersP },
    steps: [
      st(
        [0, 1],
        "kept",
        "The SELECT list also sets the result's column order. The stored customers table does not change.",
        {
          highlightCols: [0, 1],
          noteTone: "mint",
          rowsOverride: [
            r("a", "USA", "Zane Novak"),
            r("b", "UK", "Boris Alvarez"),
            r("c", "UK", "Priya Doyle"),
            r("d", "USA", "Ugo Mensah"),
          ],
          colsOverride: ["country", "name"],
        },
      ),
    ],
  },
];
