import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const ID_ROWS: Row[] = [
  r(1, "1", "Trailhead 29 Hardtail"),
  r(2, "2", "Trailhead 29 Carbon"),
  r(3, "3", "Boulder Full Suspension"),
];

const TEXT_ID_ROWS: Row[] = [r(1, "1", "1"), r(2, "2", "2"), r(3, "3", "3")];

const PRICE_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1299.00"),
  r(2, "Trailhead 29 Carbon", "2450.00"),
  r(3, "Boulder Full Suspension", "3199.00"),
];

const PRICE_LABEL_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1299.00", "$1,299.00"),
  r(2, "Trailhead 29 Carbon", "2450.00", "$2,450.00"),
  r(3, "Boulder Full Suspension", "3199.00", "$3,199.00"),
];

export const castToCharStages: Stage[] = [
  {
    name: "CAST changes an ID into text",
    blurb: "The identifier stays the same",
    canvasMinHeight: 430,
    sql: [
      "SELECT id, name,",
      "       CAST(id AS text) AS product_id_text",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: {
      name: "products",
      cols: ["id", "name"],
      rows: ID_ROWS.map((row) => r(row.key, row.cells[0], row.cells[1])),
    },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The source ID is an integer. It is a good database identifier, and the product name gives that value business meaning.",
      ),
      st(
        [1],
        "kept",
        "CAST returns the same identifier as text. The characters look familiar, but product_id_text can now participate in text operations.",
        { rowsOverride: TEXT_ID_ROWS, colsOverride: ["id", "product_id_text"], highlightCols: [1] },
      ),
    ],
  },
  {
    name: "TO_CHAR creates a display label",
    blurb: "Keep the original number beside it",
    canvasMinHeight: 430,
    sql: [
      "SELECT name, price,",
      "       TO_CHAR(price, 'FM$9,999.00') AS price_label",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name", "price"], rows: PRICE_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "price remains numeric here, so it is still ready for calculations and numeric sorting.",
      ),
      st(
        [1],
        "kept",
        "TO_CHAR adds the dollar sign, grouping comma, and decimal places as a new text label for a person to read.",
        {
          rowsOverride: PRICE_LABEL_ROWS,
          colsOverride: ["name", "price", "price_label"],
          highlightCols: [2],
        },
      ),
    ],
  },
];
