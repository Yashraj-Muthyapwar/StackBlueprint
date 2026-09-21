import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const COUNTRY_COLS = ["name", "country"];
const COUNTRY_ROWS: Row[] = [
  r("zane", "Zane Novak", "USA"),
  r("boris", "Boris Alvarez", "UK"),
  r("priya", "Priya Doyle", "UK"),
  r("ugo", "Ugo Mensah", "USA"),
  r("omar", "Omar Doyle", "Germany"),
  r("farid", "Farid Sharma", "Canada"),
  r("hana", "Hana Yilmaz", "France"),
];

const PRODUCT_COLS = ["name", "price"];
const PRODUCT_ROWS: Row[] = [
  r("trailhead", "Trailhead 29 Carbon", "2450.00"),
  r("switchback", "Switchback Enduro", "4150.00"),
  r("boulder", "Boulder Full Suspension", "3199.00"),
  r("aero", "Aero Sprint Pro", "5400.00"),
];

const ORDER_COLS = ["id", "order_date", "status"];
const ORDER_ROWS: Row[] = [
  r("96", "96", "2025-06-11", "shipped"),
  r("88", "88", "2025-06-06", "pending"),
  r("108", "108", "2025-06-05", "shipped"),
  r("5", "5", "2025-06-04", "delivered"),
  r("57", "57", "2025-05-25", "delivered"),
  r("100", "100", "2025-05-23", "delivered"),
  r("111", "111", "2025-05-18", "shipped"),
  r("99", "99", "2025-05-15", "delivered"),
];

export const distinctOrderLimitStages: Stage[] = [
  {
    name: "DISTINCT removes repeats",
    sql: ["SELECT DISTINCT country", "FROM customers;"],
    table: { name: "customers", cols: COUNTRY_COLS, rows: COUNTRY_ROWS },
    steps: [
      st(
        [0],
        "kept",
        "DISTINCT keeps one copy of each country value. USA and UK appear twice in the source, but only once in the result.",
        {
          colsOverride: ["country"],
          rowsOverride: [
            r("usa", "USA"),
            r("uk", "UK"),
            r("germany", "Germany"),
            r("canada", "Canada"),
            r("france", "France"),
          ],
          noteTone: "mint",
        },
      ),
    ],
  },
  {
    name: "ORDER BY chooses the sequence",
    sql: ["SELECT name, price", "FROM products", "ORDER BY price DESC;"],
    table: { name: "products", cols: PRODUCT_COLS, rows: PRODUCT_ROWS },
    steps: [
      st(
        [2],
        "kept",
        "DESC sorts from the highest price to the lowest. Add ASC instead when you want the smallest value or A-to-Z first.",
        {
          rowsOverride: [PRODUCT_ROWS[3], PRODUCT_ROWS[1], PRODUCT_ROWS[2], PRODUCT_ROWS[0]],
          colsOverride: PRODUCT_COLS,
          noteTone: "violet",
        },
      ),
    ],
  },
  {
    name: "LIMIT keeps the first rows",
    sql: ["SELECT DISTINCT country", "FROM customers", "ORDER BY country ASC", "LIMIT 3;"],
    table: { name: "customers", cols: COUNTRY_COLS, rows: COUNTRY_ROWS },
    steps: [
      st(
        [3],
        "kept",
        "After duplicate countries are removed and sorted, LIMIT 3 keeps Canada, France, and Germany: the first three rows of that ordered result.",
        {
          colsOverride: ["country"],
          rowsOverride: [r("canada", "Canada"), r("france", "France"), r("germany", "Germany")],
          noteTone: "amber",
        },
      ),
    ],
  },
  {
    name: "OFFSET moves to the next page",
    sql: [
      "SELECT id, order_date, status",
      "FROM orders",
      "ORDER BY order_date DESC, id DESC",
      "LIMIT 4 OFFSET 4;",
    ],
    table: { name: "orders", cols: ORDER_COLS, rows: ORDER_ROWS },
    steps: [
      st(
        [3],
        "kept",
        "OFFSET 4 skips the first four ordered rows. LIMIT 4 then returns the next four, which is page 2 when each page has four rows.",
        {
          colsOverride: ORDER_COLS,
          rowsOverride: ORDER_ROWS.slice(4),
          noteTone: "violet",
        },
      ),
    ],
  },
];
