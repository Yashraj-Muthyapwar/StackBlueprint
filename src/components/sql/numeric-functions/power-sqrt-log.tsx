import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const PRICE_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1299.00"),
  r(2, "Trailhead 29 Carbon", "2450.00"),
  r(3, "Boulder Full Suspension", "3199.00"),
  r(4, "Switchback Enduro", "4150.00"),
];

const POWER_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1299.00", "168.7401"),
  r(2, "Trailhead 29 Carbon", "2450.00", "600.2500"),
  r(3, "Boulder Full Suspension", "3199.00", "1023.3601"),
  r(4, "Switchback Enduro", "4150.00", "1722.2500"),
];

const SQRT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "1299.00", "36.042"),
  r(2, "Trailhead 29 Carbon", "2450.00", "49.497"),
  r(3, "Boulder Full Suspension", "3199.00", "56.560"),
  r(4, "Switchback Enduro", "4150.00", "64.420"),
];

const SCALE_ROWS: Row[] = [
  r(1, "0", "1.000", "1", "0"),
  r(2, "1", "2.718", "10", "1"),
  r(3, "2", "7.389", "100", "2"),
  r(4, "3", "20.086", "1000", "3"),
];

export const powerSqrtLogStages: Stage[] = [
  {
    name: "POWER amplifies a scaled price",
    canvasMinHeight: 440,
    sql: [
      "SELECT name, price,",
      "       ROUND(POWER(price / 100.0, 2), 4)",
      "         AS price_index_squared",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  4",
    ],
    table: { name: "products", cols: ["name", "price"], rows: PRICE_ROWS },
    steps: [
      st(
        [0, 3, 4, 5],
        "kept",
        "First scale every real price down by 100. POWER(value, 2) then multiplies that scaled value by itself.",
      ),
      st(
        [1, 2],
        "kept",
        "The square emphasizes differences. For example, 12.99 becomes 168.7401, while 41.50 becomes 1722.2500.",
        {
          rowsOverride: POWER_ROWS,
          colsOverride: ["name", "price", "price_index_squared"],
          highlightCols: [2],
        },
      ),
    ],
  },
  {
    name: "SQRT returns a root scale",
    canvasMinHeight: 440,
    sql: [
      "SELECT name, price,",
      "       ROUND(SQRT(price)::numeric, 3)",
      "         AS price_root",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  4",
    ],
    table: { name: "products", cols: ["name", "price"], rows: PRICE_ROWS },
    steps: [
      st(
        [0, 3, 4, 5],
        "kept",
        "SQRT asks which number, multiplied by itself, produces the input. It is useful when a square-scaled measure needs a more compact scale.",
      ),
      st(
        [1, 2],
        "kept",
        "The raw roots have many decimal places, so ROUND makes the report output easier to scan without changing the underlying calculation.",
        {
          rowsOverride: SQRT_ROWS,
          colsOverride: ["name", "price", "price_root"],
          highlightCols: [2],
        },
      ),
    ],
  },
  {
    name: "EXP grows while LOG compresses",
    canvasMinHeight: 440,
    sql: [
      "WITH steps(step) AS (VALUES (0), (1), (2), (3))",
      "SELECT step, ROUND(EXP(step::numeric), 3) AS exp_value,",
      "       POWER(10, step) AS base10_scale,",
      "       LOG(POWER(10, step)) AS log10_scale",
      "FROM   steps",
      "ORDER  BY step",
    ],
    table: {
      name: "steps",
      cols: ["step"],
      rows: SCALE_ROWS.map((row) => r(row.id, row.cells[0])),
    },
    steps: [
      st(
        [0, 4, 5],
        "kept",
        "EXP raises Euler's number e to each step, so equal step changes compound quickly. PostgreSQL LOG uses base 10.",
      ),
      st(
        [1, 2, 3],
        "kept",
        "LOG compresses powers of ten back to their exponents: 1, 10, 100, and 1000 become 0, 1, 2, and 3.",
        {
          rowsOverride: SCALE_ROWS,
          colsOverride: ["step", "exp_value", "base10_scale", "log10_scale"],
          highlightCols: [1, 3],
        },
      ),
    ],
  },
];
