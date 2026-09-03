import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const SALE_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1136.625"),
  r(2, "Trailhead 29 Carbon", "2143.750"),
  r(3, "Boulder Full Suspension", "2799.125"),
];

const ROUND_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1136.63"),
  r(2, "Trailhead 29 Carbon", "2143.75"),
  r(3, "Boulder Full Suspension", "2799.13"),
];

const TRUNC_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1136.62"),
  r(2, "Trailhead 29 Carbon", "2143.75"),
  r(3, "Boulder Full Suspension", "2799.12"),
];

const CEIL_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1137"),
  r(2, "Trailhead 29 Carbon", "2144"),
  r(3, "Boulder Full Suspension", "2800"),
];

const FLOOR_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1136"),
  r(2, "Trailhead 29 Carbon", "2143"),
  r(3, "Boulder Full Suspension", "2799"),
];

/** A lesson-scoped walkthrough of rounding and integer boundaries. */
export const roundTruncCeilFloorStages: Stage[] = [
  {
    name: "ROUND picks the nearest cent",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       ROUND(price * 0.875, 2) AS rounded_sale",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name", "sale_price_raw"], rows: SALE_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "A 12.5% sale leaves 87.5% of each listed price. The raw calculation can have more than two decimal places.",
      ),
      st(
        [1],
        "kept",
        "ROUND looks at the next digit and returns the nearest cent. 1136.625 becomes 1136.63.",
        { rowsOverride: ROUND_ROWS, colsOverride: ["name", "rounded_sale"], highlightCols: [1] },
      ),
    ],
  },
  {
    name: "TRUNC stops at the chosen precision",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       TRUNC(price * 0.875, 2) AS truncated_sale",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name", "sale_price_raw"], rows: SALE_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "TRUNC starts from the same raw sale prices, but it does not inspect the next digit.",
      ),
      st(
        [1],
        "kept",
        "TRUNC simply drops everything after the second decimal place. 1136.625 becomes 1136.62.",
        { rowsOverride: TRUNC_ROWS, colsOverride: ["name", "truncated_sale"], highlightCols: [1] },
      ),
    ],
  },
  {
    name: "CEIL moves up to the next integer",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       CEIL(price * 0.875) AS ceiling_sale",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name", "sale_price_raw"], rows: SALE_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "CEIL is useful when a report needs a whole-number capacity or a conservative upper bound.",
      ),
      st(
        [1],
        "kept",
        "CEIL moves any fractional value upward to the next integer. 1136.625 becomes 1137.",
        { rowsOverride: CEIL_ROWS, colsOverride: ["name", "ceiling_sale"], highlightCols: [1] },
      ),
    ],
  },
  {
    name: "FLOOR moves down to the lower integer",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       FLOOR(price * 0.875) AS floor_sale",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name", "sale_price_raw"], rows: SALE_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "FLOOR uses the same raw values when the business rule needs the whole number below the value.",
      ),
      st(
        [1],
        "kept",
        "FLOOR moves any fractional value downward to the lower integer. 1136.625 becomes 1136.",
        { rowsOverride: FLOOR_ROWS, colsOverride: ["name", "floor_sale"], highlightCols: [1] },
      ),
    ],
  },
];
