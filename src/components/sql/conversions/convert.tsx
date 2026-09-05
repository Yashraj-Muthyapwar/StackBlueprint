import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const DATE_ROWS: Row[] = [
  r(1, "1", "2023-01-06"),
  r(2, "2", "2024-06-08"),
  r(3, "3", "2023-01-15"),
];

const TEXT_ROWS: Row[] = [
  r(1, "1", "2023-01-06", "2023-01-06"),
  r(2, "2", "2024-06-08", "2024-06-08"),
  r(3, "3", "2023-01-15", "2023-01-15"),
];

const MONTH_ROWS: Row[] = [
  r(1, "1", "2023-01-06", "2023-01"),
  r(2, "2", "2024-06-08", "2024-06"),
  r(3, "3", "2023-01-15", "2023-01"),
];

export const convertStages: Stage[] = [
  {
    name: "CAST is PostgreSQL's type conversion",
    blurb: "Same date, different result type",
    canvasMinHeight: 430,
    sql: [
      "SELECT id, signup_date,",
      "       CAST(signup_date AS text) AS signup_text",
      "FROM   customers",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "customers", cols: ["id", "signup_date"], rows: DATE_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "Cycle Depot stores signup_date as a date, which keeps it ready for chronological sorting and date operations.",
      ),
      st(
        [1],
        "kept",
        "CAST returns the same date characters as a new text result. The source signup_date remains a date.",
        {
          rowsOverride: TEXT_ROWS,
          colsOverride: ["id", "signup_date", "signup_text"],
          highlightCols: [2],
        },
      ),
    ],
  },
  {
    name: "TO_CHAR gives text a deliberate shape",
    blurb: "Use a format when people need a label",
    canvasMinHeight: 430,
    sql: [
      "SELECT id, signup_date,",
      "       TO_CHAR(signup_date, 'YYYY-MM') AS signup_month",
      "FROM   customers",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "customers", cols: ["id", "signup_date"], rows: DATE_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The original date stays beside the result so the report still has the source value available.",
      ),
      st(
        [1],
        "kept",
        "TO_CHAR makes a compact year-month text label. Choose this when the display pattern matters, not just the type.",
        {
          rowsOverride: MONTH_ROWS,
          colsOverride: ["id", "signup_date", "signup_month"],
          highlightCols: [2],
        },
      ),
    ],
  },
];
