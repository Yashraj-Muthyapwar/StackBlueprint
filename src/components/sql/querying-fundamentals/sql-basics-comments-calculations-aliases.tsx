import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const PRODUCTS: Row[] = [
  r(1, 1, "Trailhead 29 Hardtail", 1299.0),
  r(2, 2, "Trailhead 29 Carbon", 2450.0),
  r(3, 3, "Boulder Full Suspension", 3199.0),
  r(4, 4, "Switchback Enduro", 4150.0),
];

const PRODUCT_COLUMNS = ["id", "name", "price"];

/** The comments lesson only needs to show what SQL ignores and what it executes. */
export const commentsStages: Stage[] = [
  {
    name: "A comment is ignored",
    blurb: "`--` explains the next line to a reader",
    sql: ["-- Cycle Depot price preview", "SELECT name, price", "FROM products;"],
    table: { name: "products", cols: PRODUCT_COLUMNS, rows: PRODUCTS },
    steps: [
      st(
        [0],
        "pending",
        "The line begins with `--`, so SQL ignores it. It is a note for the person reading the query.",
        { noteTone: "violet" },
      ),
      st(
        [1, 2],
        "kept",
        "Only SELECT and FROM reach the database. The comment does not add, remove, or change any product rows.",
        { highlightCols: [1, 2], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "A comment can follow SQL",
    blurb: "Everything after `--` on that line is a note",
    sql: ["SELECT name, price  -- keep the original price too", "FROM products;"],
    table: { name: "products", cols: PRODUCT_COLUMNS, rows: PRODUCTS },
    steps: [
      st(
        [0, 1],
        "kept",
        "The query still returns name and price. The text after `--` is ignored, so use it only when it clarifies a decision.",
        { highlightCols: [1, 2], noteTone: "mint" },
      ),
    ],
  },
];

/** The calculation lesson keeps one expression and one alias in view at a time. */
export const calculationAliasStages: Stage[] = [
  {
    name: "Start with the stored price",
    blurb: "Every product has a name and original price",
    sql: ["SELECT name, price", "FROM products;"],
    table: { name: "products", cols: PRODUCT_COLUMNS, rows: PRODUCTS },
    steps: [
      st(
        [0, 1],
        "kept",
        "These are the stored values. A SELECT query reads them without changing the products table.",
        { highlightCols: [1, 2] },
      ),
    ],
  },
  {
    name: "Multiply to calculate tax",
    blurb: "`price * 1.08` creates a value for each result row",
    sql: ["SELECT name, price,", "       price * 1.08 AS price_with_tax", "FROM products;"],
    table: { name: "products", cols: PRODUCT_COLUMNS, rows: PRODUCTS },
    steps: [
      st(
        [1],
        "kept",
        "Multiplying by 1.08 adds 8% tax. The expression is calculated for every returned product, but the stored price is unchanged.",
        {
          rowsOverride: [
            r("p1", "Trailhead 29 Hardtail", "1299.00", "1402.92"),
            r("p2", "Trailhead 29 Carbon", "2450.00", "2646.00"),
            r("p3", "Boulder Full Suspension", "3199.00", "3454.92"),
            r("p4", "Switchback Enduro", "4150.00", "4482.00"),
          ],
          colsOverride: ["name", "price", "price_with_tax"],
          highlightCols: [1, 2],
          noteTone: "mint",
        },
      ),
    ],
  },
  {
    name: "AS names the result column",
    blurb: "A clear output label makes a calculation easier to use",
    sql: ["SELECT name, price,", "       price * 1.08 AS price_with_tax", "FROM products;"],
    table: { name: "products", cols: PRODUCT_COLUMNS, rows: PRODUCTS },
    steps: [
      st(
        [1],
        "kept",
        "`AS price_with_tax` labels the new result column. It does not rename the original price column in the products table.",
        {
          rowsOverride: [
            r("p1", "Trailhead 29 Hardtail", "1299.00", "1402.92"),
            r("p2", "Trailhead 29 Carbon", "2450.00", "2646.00"),
            r("p3", "Boulder Full Suspension", "3199.00", "3454.92"),
            r("p4", "Switchback Enduro", "4150.00", "4482.00"),
          ],
          colsOverride: ["name", "price", "price_with_tax"],
          highlightCols: [2],
          noteTone: "violet",
        },
      ),
    ],
  },
];
