import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const NAME_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(2, "Trailhead 29 Carbon"),
  r(3, "Boulder Full Suspension"),
];

const TRIM_RESULT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "Trailhead 29 Hardtail"),
  r(2, "Trailhead 29 Carbon", "Trailhead 29 Carbon"),
  r(3, "Boulder Full Suspension", "Boulder Full Suspension"),
];

const REPLACE_RESULT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "Trailhead-29-Hardtail"),
  r(2, "Trailhead 29 Carbon", "Trailhead-29-Carbon"),
  r(3, "Boulder Full Suspension", "Boulder-Full-Suspension"),
];

/** A lesson-scoped walkthrough of edge-space cleanup and exact text replacement. */
export const trimReplaceStages: Stage[] = [
  {
    name: "TRIM removes temporary edge padding",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       TRIM(CONCAT(' ', name, ' ')) AS clean_name",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name"], rows: NAME_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The stored names are already clean. The query temporarily adds one space to each edge so TRIM has a visible cleanup job.",
      ),
      st(
        [1],
        "kept",
        "TRIM removes only the temporary edge spaces. It keeps the spaces inside each product name and leaves the stored name unchanged.",
        {
          rowsOverride: TRIM_RESULT_ROWS,
          colsOverride: ["name", "clean_name"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "REPLACE builds a compact key",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       REPLACE(name, ' ', '-') AS product_key",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name"], rows: NAME_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "Each product name has spaces between its words. The original text remains available in the first column.",
      ),
      st(
        [1],
        "kept",
        "REPLACE finds every single space and changes it to a hyphen, producing a new compact product_key for each row.",
        {
          rowsOverride: REPLACE_RESULT_ROWS,
          colsOverride: ["name", "product_key"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
