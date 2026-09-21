import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const INCOMING_ROWS: Row[] = [r(1, "'1'"), r(2, "'3'"), r(3, "''"), r(4, "'bike-7'")];

const VALIDATION_ROWS: Row[] = [
  r(1, "'1'", "true"),
  r(2, "'3'", "true"),
  r(3, "''", "false"),
  r(4, "'bike-7'", "false"),
];

const SAFE_CAST_ROWS: Row[] = [
  r(1, "''", "NULL"),
  r(2, "'1'", "1"),
  r(3, "'3'", "3"),
  r(4, "'bike-7'", "NULL"),
];

export const safeCastsStages: Stage[] = [
  {
    name: "Check the incoming text first",
    blurb: "A full-match rule separates integer-shaped values from the rest",
    canvasMinHeight: 430,
    sql: [
      "WITH incoming_product_ids(raw_product_id) AS (",
      "  VALUES ('1'), ('3'), (''), ('bike-7')",
      ")",
      "SELECT raw_product_id,",
      "       raw_product_id ~ '^[0-9]+$' AS has_integer_shape",
      "FROM incoming_product_ids",
      "ORDER BY raw_product_id",
    ],
    table: {
      name: "incoming_product_ids",
      cols: ["raw_product_id"],
      rows: INCOMING_ROWS,
      columnTemplate: "minmax(180px, 1fr)",
    },
    steps: [
      st(
        [0, 1, 2, 3, 5, 6],
        "kept",
        "The CTE represents four incoming product-ID strings. It is query-local, so it does not modify any Cycle Depot table.",
      ),
      st(
        [4],
        "kept",
        "The anchored pattern accepts only one or more digits. The boolean output makes each decision visible before any cast runs.",
        {
          rowsOverride: VALIDATION_ROWS,
          colsOverride: ["raw_product_id", "has_integer_shape"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "Cast only a passing value",
    blurb: "CASE turns invalid text into an intentional NULL",
    canvasMinHeight: 430,
    sql: [
      "WITH incoming_product_ids(raw_product_id) AS (",
      "  VALUES ('1'), ('3'), (''), ('bike-7')",
      ")",
      "SELECT raw_product_id,",
      "       CASE WHEN raw_product_id ~ '^[0-9]+$'",
      "            THEN raw_product_id::integer END AS safe_product_id",
      "FROM incoming_product_ids",
      "ORDER BY raw_product_id",
    ],
    table: {
      name: "incoming_product_ids",
      cols: ["raw_product_id"],
      rows: INCOMING_ROWS,
      columnTemplate: "minmax(180px, 1fr)",
    },
    steps: [
      st(
        [0, 1, 2, 3, 7, 8],
        "kept",
        "Every source row stays visible. The protection is in the expression, not a filter that discards rows.",
      ),
      st(
        [4, 5],
        "kept",
        "Only the true rows reach ::integer. The empty text and bike-7 do not match, so CASE returns NULL for those rows.",
        {
          rowsOverride: SAFE_CAST_ROWS,
          colsOverride: ["raw_product_id", "safe_product_id"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
