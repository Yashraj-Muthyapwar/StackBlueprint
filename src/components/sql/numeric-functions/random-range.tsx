import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const RAW_DRAWS: Row[] = [r(1, "Run 1", "0.18"), r(2, "Run 2", "0.63"), r(3, "Run 3", "0.91")];

const PROMO_GROUPS: Row[] = [
  r(1, "0.18", "2.08", "2"),
  r(2, "0.63", "4.78", "4"),
  r(3, "0.91", "6.46", "6"),
];

const PRODUCT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "Mountain Bikes"),
  r(2, "Trailhead 29 Carbon", "Mountain Bikes"),
  r(3, "Boulder Full Suspension", "Mountain Bikes"),
  r(4, "Switchback Enduro", "Mountain Bikes"),
  r(5, "Meridian Road Alloy", "Road Bikes"),
  r(6, "Meridian Road Carbon", "Road Bikes"),
];

const SAMPLE_ROWS: Row[] = [
  r(2, "Trailhead 29 Carbon", "Mountain Bikes"),
  r(5, "Meridian Road Alloy", "Road Bikes"),
  r(3, "Boulder Full Suspension", "Mountain Bikes"),
];

export const randomRangeStages: Stage[] = [
  {
    name: "RANDOM returns a new fractional draw",
    canvasMinHeight: 420,
    sql: ["SELECT RANDOM() AS raw_random"],
    table: {
      name: "example draws",
      cols: ["run"],
      rows: RAW_DRAWS.map((row) => r(row.key, row.cells[0])),
    },
    steps: [
      st(
        [0],
        "kept",
        "RANDOM() produces a new value every time it runs. In PostgreSQL, the range starts at 0 and stays below 1.",
      ),
      st(
        [0],
        "kept",
        "These are illustrative draws. A fresh execution will show different values, but each remains in the same 0 to under-1 range.",
        {
          rowsOverride: RAW_DRAWS,
          colsOverride: ["run", "raw_random"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "Scale a draw into groups 1 through 6",
    canvasMinHeight: 420,
    sql: ["SELECT FLOOR(RANDOM() * 6 + 1)::int AS promo_group"],
    table: {
      name: "illustrative draws",
      cols: ["raw_random"],
      rows: RAW_DRAWS.map((row) => r(row.key, row.cells[1])),
    },
    steps: [
      st(
        [0],
        "kept",
        "Multiply by 6 to create values from 0 to under 6, then add 1 to shift the range to 1 up to under 7.",
      ),
      st(
        [0],
        "kept",
        "FLOOR removes the fractional part, so the only possible integers are 1, 2, 3, 4, 5, and 6.",
        {
          rowsOverride: PROMO_GROUPS,
          colsOverride: ["raw_random", "shifted_value", "promo_group"],
          highlightCols: [2],
        },
      ),
    ],
  },
  {
    name: "Shuffle product rows into a sample",
    canvasMinHeight: 460,
    sql: ["SELECT name, category", "FROM   products", "ORDER  BY RANDOM()", "LIMIT  3"],
    table: { name: "products", cols: ["name", "category"], rows: PRODUCT_ROWS },
    steps: [
      st(
        [0, 1, 3],
        "kept",
        "The products table stays the same. RANDOM() only supplies a temporary sort key for this query execution.",
      ),
      st(
        [2],
        (row) => (SAMPLE_ROWS.some((sample) => sample.key === row.key) ? "kept" : "dropped"),
        "After the random sort, LIMIT 3 keeps the first three rows. This is one illustrative sample, so a new run can select a different trio.",
        {
          rowsOverride: SAMPLE_ROWS,
          colsOverride: ["name", "category"],
          highlightCols: [0],
        },
      ),
    ],
  },
];
