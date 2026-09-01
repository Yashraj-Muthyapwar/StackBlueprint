import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const PRODUCTS: Row[] = [
  r("pump", "Frame Pump", "39.00"),
  r("alloy", "Meridian Road Alloy", "1150.00"),
  r("aero", "Aero Sprint Pro", "5400.00"),
];

const BANDED_PRODUCTS: Row[] = [
  r("pump", "Frame Pump", "39.00", "Budget"),
  r("alloy", "Meridian Road Alloy", "1150.00", "Mid-range"),
  r("aero", "Aero Sprint Pro", "5400.00", "Premium"),
];

/** Follows three Cycle Depot rows through CASE in first-match order. */
export const caseWhenStages: Stage[] = [
  {
    name: "CASE checks the first matching WHEN",
    blurb: "Frame Pump becomes Budget",
    canvasMinHeight: 370,
    sql: [
      "SELECT name, price,",
      "  CASE",
      "    WHEN price < 1000 THEN 'Budget'",
      "    WHEN price < 2500 THEN 'Mid-range'",
      "    ELSE 'Premium'",
      "  END AS price_band",
      "FROM products;",
    ],
    table: { name: "products", cols: ["name", "price"], rows: PRODUCTS },
    steps: [
      st(
        [2],
        "kept",
        "Frame Pump costs 39.00, so the first WHEN is true. CASE returns Budget immediately and does not test later WHEN clauses for that row.",
        {
          colsOverride: ["name", "price", "price_band"],
          rowsOverride: BANDED_PRODUCTS,
          highlightCols: [2],
          noteTone: "mint",
        },
      ),
    ],
  },
  {
    name: "Later WHEN clauses handle later ranges",
    blurb: "Meridian Road Alloy becomes Mid-range",
    canvasMinHeight: 370,
    sql: [
      "SELECT name, price,",
      "  CASE",
      "    WHEN price < 1000 THEN 'Budget'",
      "    WHEN price < 2500 THEN 'Mid-range'",
      "    ELSE 'Premium'",
      "  END AS price_band",
      "FROM products;",
    ],
    table: { name: "products", cols: ["name", "price"], rows: PRODUCTS },
    steps: [
      st(
        [3],
        "kept",
        "Meridian Road Alloy costs 1150.00. It fails the first test, then matches the second one. CASE uses the first true result: Mid-range.",
        {
          colsOverride: ["name", "price", "price_band"],
          rowsOverride: BANDED_PRODUCTS,
          highlightCols: [2],
          noteTone: "violet",
        },
      ),
    ],
  },
  {
    name: "ELSE labels the rows left over",
    blurb: "Aero Sprint Pro becomes Premium",
    canvasMinHeight: 370,
    sql: [
      "SELECT name, price,",
      "  CASE",
      "    WHEN price < 1000 THEN 'Budget'",
      "    WHEN price < 2500 THEN 'Mid-range'",
      "    ELSE 'Premium'",
      "  END AS price_band",
      "FROM products;",
    ],
    table: { name: "products", cols: ["name", "price"], rows: PRODUCTS },
    steps: [
      st(
        [4, 5],
        "kept",
        "Aero Sprint Pro costs 5400.00, so neither WHEN is true. ELSE supplies Premium. All three source rows remain; CASE has added one value to each row.",
        {
          colsOverride: ["name", "price", "price_band"],
          rowsOverride: BANDED_PRODUCTS,
          highlightCols: [2],
          noteTone: "amber",
        },
      ),
    ],
  },
];
