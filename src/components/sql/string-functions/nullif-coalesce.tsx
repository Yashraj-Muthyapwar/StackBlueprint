import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const PRODUCT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1299.00", "780.00"),
  r(2, "Trailhead 29 Carbon", "2450.00", "1520.00"),
  r(3, "Boulder Full Suspension", "3199.00", "2010.00"),
];

const PRODUCT_MARGIN_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "40.0"),
  r(2, "Trailhead 29 Carbon", "38.0"),
  r(3, "Boulder Full Suspension", "37.2"),
];

const REPORT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "519.00", "1299.00"),
  r(2, "No revenue yet", "0.00", "0.00"),
];

const GUARDED_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1299.00"),
  r(2, "No revenue yet", null),
];

const FALLBACK_ROWS: Row[] = [r(1, "Trailhead 29 Hardtail", "40.0"), r(2, "No revenue yet", "0.0")];

/** Shows how a safe denominator becomes a deliberate report value. */
export const nullifCoalesceStages: Stage[] = [
  {
    name: "Calculate a margin percentage",
    blurb: "Use product price as the denominator",
    canvasMinHeight: 450,
    sql: [
      "SELECT name, price, cost,",
      "       ROUND(100.0 * (price - cost) / NULLIF(price, 0), 1) AS margin_pct",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: {
      name: "products",
      cols: ["name", "price", "cost"],
      rows: PRODUCT_ROWS,
    },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "Each product supplies a list price and cost. The numerator is price minus cost, and price is the denominator for the percentage.",
      ),
      st(
        [1],
        "kept",
        "NULLIF(price, 0) keeps each current nonzero price. The resulting margin percentage is a new result value, not a stored column.",
        {
          rowsOverride: PRODUCT_MARGIN_ROWS,
          colsOverride: ["name", "margin_pct"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "NULLIF guards a zero denominator",
    blurb: "Only zero becomes NULL",
    canvasMinHeight: 450,
    sql: [
      "SELECT label, revenue,",
      "       NULLIF(revenue, 0) AS safe_revenue",
      "FROM   report_rows",
    ],
    table: {
      name: "report_rows",
      cols: ["label", "margin", "revenue"],
      rows: REPORT_ROWS,
    },
    steps: [
      st(
        [0, 2],
        "kept",
        "This small report input includes one normal row and one zero-revenue row so the protected path is visible.",
      ),
      st(
        [1],
        "kept",
        "NULLIF compares revenue with 0. It keeps 1299.00, but turns the matching 0.00 into NULL before any division occurs.",
        {
          rowsOverride: GUARDED_ROWS,
          colsOverride: ["label", "safe_revenue"],
          highlightCols: [1],
          noteTone: "amber",
        },
      ),
    ],
  },
  {
    name: "COALESCE chooses the fallback",
    blurb: "Display an intentional value for an undefined rate",
    canvasMinHeight: 450,
    sql: [
      "SELECT label,",
      "       COALESCE(ROUND(100.0 * margin / NULLIF(revenue, 0), 1), 0.0) AS margin_pct",
      "FROM   report_rows",
    ],
    table: {
      name: "report_rows",
      cols: ["label", "margin", "revenue"],
      rows: REPORT_ROWS,
    },
    steps: [
      st(
        [1],
        "kept",
        "The active product calculates to 40.0. The zero-revenue row reaches NULL after division, so COALESCE supplies the chosen fallback of 0.0.",
        {
          rowsOverride: FALLBACK_ROWS,
          colsOverride: ["label", "margin_pct"],
          highlightCols: [1],
          noteTone: "mint",
        },
      ),
    ],
  },
];
