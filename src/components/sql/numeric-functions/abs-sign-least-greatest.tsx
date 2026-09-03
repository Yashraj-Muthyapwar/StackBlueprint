import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const TARGET_ROWS: Row[] = [
  r(13, "Shellcap Road Helmet", "-21.00"),
  r(14, "Shellcap MIPS Pro", "69.00"),
  r(15, "Kidsafe Helmet", "-91.00"),
];

const ABS_ROWS: Row[] = [
  r(13, "Shellcap Road Helmet", "21.00"),
  r(14, "Shellcap MIPS Pro", "69.00"),
  r(15, "Kidsafe Helmet", "91.00"),
];

const SIGN_ROWS: Row[] = [
  r(13, "Shellcap Road Helmet", "-1"),
  r(14, "Shellcap MIPS Pro", "1"),
  r(15, "Kidsafe Helmet", "-1"),
];

const PRICE_COST_ROWS: Row[] = [
  r(13, "Shellcap Road Helmet", "129.00", "62.00"),
  r(14, "Shellcap MIPS Pro", "219.00", "108.00"),
  r(15, "Kidsafe Helmet", "59.00", "24.00"),
];

const LEAST_ROWS: Row[] = [
  r(13, "Shellcap Road Helmet", "62.00"),
  r(14, "Shellcap MIPS Pro", "108.00"),
  r(15, "Kidsafe Helmet", "24.00"),
];

const GREATEST_ROWS: Row[] = [
  r(13, "Shellcap Road Helmet", "129.00"),
  r(14, "Shellcap MIPS Pro", "219.00"),
  r(15, "Kidsafe Helmet", "59.00"),
];

/** A lesson-scoped walkthrough of signed gaps and row-level comparisons. */
export const absSignLeastGreatestStages: Stage[] = [
  {
    name: "ABS measures the size of a gap",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       ABS(price - 150.00) AS target_gap",
      "FROM   products",
      "WHERE  id BETWEEN 13 AND 15",
      "ORDER  BY id",
    ],
    table: { name: "products", cols: ["name", "price_vs_target"], rows: TARGET_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "Each value compares a real product price with the 150.00 target. Negative means below and positive means above.",
      ),
      st(
        [1],
        "kept",
        "ABS removes the sign and keeps the distance. The 129.00 helmet is 21.00 away from the target.",
        { rowsOverride: ABS_ROWS, colsOverride: ["name", "target_gap"], highlightCols: [1] },
      ),
    ],
  },
  {
    name: "SIGN keeps only the direction",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       SIGN(price - 150.00) AS target_direction",
      "FROM   products",
      "WHERE  id BETWEEN 13 AND 15",
      "ORDER  BY id",
    ],
    table: { name: "products", cols: ["name", "price_vs_target"], rows: TARGET_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The same signed gap contains more detail than a direction label needs.",
      ),
      st(
        [1],
        "kept",
        "SIGN maps negative values to -1 and positive values to 1. It would return 0 for an exact target match.",
        { rowsOverride: SIGN_ROWS, colsOverride: ["name", "target_direction"], highlightCols: [1] },
      ),
    ],
  },
  {
    name: "LEAST chooses the lower value",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       LEAST(price, cost) AS lower_amount",
      "FROM   products",
      "WHERE  id BETWEEN 13 AND 15",
      "ORDER  BY id",
    ],
    table: { name: "products", cols: ["name", "price", "cost"], rows: PRICE_COST_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "LEAST compares multiple expressions in each row. Here it receives the product price and cost.",
      ),
      st(
        [1],
        "kept",
        "LEAST returns the smaller value in each row. For Shellcap Road Helmet, 62.00 is lower than 129.00.",
        { rowsOverride: LEAST_ROWS, colsOverride: ["name", "lower_amount"], highlightCols: [1] },
      ),
    ],
  },
  {
    name: "GREATEST chooses the higher value",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       GREATEST(price, cost) AS higher_amount",
      "FROM   products",
      "WHERE  id BETWEEN 13 AND 15",
      "ORDER  BY id",
    ],
    table: { name: "products", cols: ["name", "price", "cost"], rows: PRICE_COST_ROWS },
    steps: [
      st([0, 2, 3, 4], "kept", "GREATEST starts from the same two values in each product row."),
      st(
        [1],
        "kept",
        "GREATEST returns the larger value in each row. For Shellcap Road Helmet, 129.00 is higher than 62.00.",
        {
          rowsOverride: GREATEST_ROWS,
          colsOverride: ["name", "higher_amount"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
