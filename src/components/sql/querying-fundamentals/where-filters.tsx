import type { Row, Stage } from "@/components/lesson/MultiStage";
import { pass, r, st } from "../animation-shared";

const CUSTOMERS: Row[] = [
  r("c1", "Zane Novak", "USA", "Austin"),
  r("c2", "Boris Alvarez", "UK", "Bristol"),
  r("c3", "Priya Doyle", "UK", "Manchester"),
  r("c4", "Ugo Mensah", "USA", "Dallas"),
];

const PRODUCTS: Row[] = [
  r("p1", "Trailhead 29 Hardtail", "1299.00", "66"),
  r("p2", "Trailhead 29 Carbon", "2450.00", "113"),
  r("p3", "Boulder Full Suspension", "3199.00", "125"),
  r("p4", "Switchback Enduro", "4150.00", "10"),
];

const CITY_CHECK: Row[] = [
  r("c1", "Zane Novak", "Austin", "USA"),
  r("c5", "Omar Doyle", "NULL", "Germany"),
  r("c14", "Hana Yilmaz", "NULL", "France"),
  r("c4", "Ugo Mensah", "Dallas", "USA"),
];

/** Shows one WHERE behavior per stage with small, real Cycle Depot tables. */
export const whereFilteringStages: Stage[] = [
  {
    name: "WHERE keeps matching rows",
    blurb: "country = 'USA' keeps rows where the condition is true",
    sql: ["SELECT name, country", "FROM customers", "WHERE country = 'USA';"],
    table: { name: "customers", cols: ["name", "country", "city"], rows: CUSTOMERS },
    steps: [
      st([0, 1], "pending", "Every customer row reaches WHERE. The condition is checked once for each row."),
      st(
        [2],
        pass((row) => row.cells[1] === "USA"),
        "Only rows where country = 'USA' are true, so Zane and Ugo remain in this compact preview. The full query returns 27 customers.",
        { highlightCols: [1], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "AND requires both checks",
    blurb: "A product must be premium-priced and sufficiently stocked",
    sql: [
      "SELECT name, price, in_stock",
      "FROM products",
      "WHERE price >= 2000",
      "  AND in_stock >= 50;",
    ],
    table: { name: "products", cols: ["name", "price", "in_stock"], rows: PRODUCTS },
    steps: [
      st(
        [2],
        pass((row) => Number(row.cells[1]) >= 2000),
        "The price condition keeps three products in this preview. It does not yet consider stock.",
        { highlightCols: [1] },
      ),
      st(
        [2, 3],
        pass((row) => Number(row.cells[1]) >= 2000 && Number(row.cells[2]) >= 50),
        "AND keeps a row only when both comparisons are true. Switchback is expensive enough, but its stock level is only 10.",
        { highlightCols: [1, 2], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "IS NULL finds missing values",
    blurb: "NULL needs IS NULL, not = NULL",
    sql: ["SELECT name, country", "FROM customers", "WHERE city IS NULL;"],
    table: { name: "customers", cols: ["name", "city", "country"], rows: CITY_CHECK },
    steps: [
      st(
        [2],
        pass((row) => row.cells[1] === "NULL"),
        "Omar and Hana have a missing city in this preview, shown as NULL. IS NULL is the special SQL check that keeps those rows.",
        { highlightCols: [1], noteTone: "violet" },
      ),
    ],
  },
];
