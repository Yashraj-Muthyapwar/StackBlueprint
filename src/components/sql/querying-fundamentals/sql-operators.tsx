import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const PRODUCTS: Row[] = [
  r("p1", "Trailhead 29 Hardtail", "1299.00", "780.00", "66"),
  r("p2", "Trailhead 29 Carbon", "2450.00", "1520.00", "113"),
  r("p3", "Boulder Full Suspension", "3199.00", "2010.00", "125"),
  r("p4", "Switchback Enduro", "4150.00", "2680.00", "10"),
];

/** One operator family at a time, with compact Cycle Depot result tables. */
export const operatorStages: Stage[] = [
  {
    name: "Arithmetic calculates a value",
    blurb: "Subtract cost from price to calculate gross margin",
    sql: ["SELECT name, price - cost AS gross_margin", "FROM products;"],
    table: { name: "products", cols: ["name", "price", "cost"], rows: PRODUCTS },
    steps: [
      st(
        [0],
        "kept",
        "The minus operator uses two stored values from each product row. It produces a new value but does not update the table.",
        {
          rowsOverride: [
            r("p1", "Trailhead 29 Hardtail", "519.00"),
            r("p2", "Trailhead 29 Carbon", "930.00"),
            r("p3", "Boulder Full Suspension", "1189.00"),
            r("p4", "Switchback Enduro", "1470.00"),
          ],
          colsOverride: ["name", "gross_margin"],
          highlightCols: [1],
          noteTone: "mint",
        },
      ),
    ],
  },
  {
    name: "Comparison asks a question",
    blurb: "A comparison returns true or false for each row",
    sql: ["SELECT name, price >= 2000 AS premium", "FROM products;"],
    table: { name: "products", cols: ["name", "price"], rows: PRODUCTS },
    steps: [
      st(
        [0],
        "kept",
        "Each product price is compared with 2000. The result is a boolean value: true when the condition is met, otherwise false.",
        {
          rowsOverride: [
            r("p1", "Trailhead 29 Hardtail", "false"),
            r("p2", "Trailhead 29 Carbon", "true"),
            r("p3", "Boulder Full Suspension", "true"),
            r("p4", "Switchback Enduro", "true"),
          ],
          colsOverride: ["name", "premium"],
          highlightCols: [1],
          noteTone: "violet",
        },
      ),
    ],
  },
  {
    name: "Logic combines checks",
    blurb: "AND is true only when both comparisons are true",
    sql: [
      "SELECT name, price >= 2000",
      "       AND in_stock >= 50 AS ready_to_sell",
      "FROM products;",
    ],
    table: { name: "products", cols: ["name", "price", "in_stock"], rows: PRODUCTS },
    steps: [
      st(
        [0, 1],
        "kept",
        "AND combines two comparisons. A product is ready to sell only when it is priced at 2000 or more and has at least 50 units in stock.",
        {
          rowsOverride: [
            r("p1", "Trailhead 29 Hardtail", "false"),
            r("p2", "Trailhead 29 Carbon", "true"),
            r("p3", "Boulder Full Suspension", "true"),
            r("p4", "Switchback Enduro", "false"),
          ],
          colsOverride: ["name", "ready_to_sell"],
          highlightCols: [1],
          noteTone: "mint",
        },
      ),
    ],
  },
];
