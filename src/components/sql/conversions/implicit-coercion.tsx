import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const PRODUCT_ROWS: Row[] = [
  r(1, "1", "Trailhead 29 Hardtail", "1299.00"),
  r(2, "2", "Trailhead 29 Carbon", "2450.00"),
  r(3, "3", "Boulder Full Suspension", "3199.00"),
];

const LOOKUP_ROWS: Row[] = [r(3, "3", "Boulder Full Suspension", "3199.00")];

const SALE_ROWS: Row[] = [
  r(1, "1", "Trailhead 29 Hardtail", "1299.00", "1136.62500"),
  r(2, "2", "Trailhead 29 Carbon", "2450.00", "2143.75000"),
  r(3, "3", "Boulder Full Suspension", "3199.00", "2799.12500"),
];

export const implicitCoercionStages: Stage[] = [
  {
    name: "The integer column supplies the context",
    blurb: "A quoted literal can resolve for a clear comparison",
    canvasMinHeight: 430,
    sql: [
      "SELECT id, name, price",
      "FROM   products",
      "WHERE  id = '3'",
      "ORDER  BY id",
    ],
    table: {
      name: "products",
      cols: ["id", "name", "price"],
      rows: PRODUCT_ROWS,
      columnTemplate: "64px minmax(180px, 1fr) 96px",
    },
    steps: [
      st(
        [0, 1, 3],
        "kept",
        "The source column id is an integer. The first three Cycle Depot products make the comparison context visible.",
      ),
      st(
        [2],
        (row) => (row.cells[0] === "3" ? "kept" : "dropped"),
        "PostgreSQL resolves the quoted literal '3' for this integer comparison, keeping only the matching product row.",
        {
          rowsOverride: LOOKUP_ROWS,
          colsOverride: ["id", "name", "price"],
          highlightCols: [0],
        },
      ),
    ],
  },
  {
    name: "A decimal price supplies numeric context",
    blurb: "The sale rate becomes compatible with price",
    canvasMinHeight: 430,
    sql: [
      "SELECT id, name, price,",
      "       price * 0.875 AS sale_price",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: {
      name: "products",
      cols: ["id", "name", "price"],
      rows: PRODUCT_ROWS,
      columnTemplate: "64px minmax(160px, 1fr) 96px",
    },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "price remains a decimal value for the calculation. The literal 0.875 has a compatible numeric context beside it.",
      ),
      st(
        [1],
        "kept",
        "The multiplication produces a new numeric sale_price. More decimal places are visible because this calculation has not been rounded.",
        {
          rowsOverride: SALE_ROWS,
          colsOverride: ["id", "name", "price", "sale_price"],
          highlightCols: [3],
        },
      ),
    ],
  },
];
