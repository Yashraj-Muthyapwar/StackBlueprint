import type { Row, Stage } from "@/components/lesson/MultiStage";
import { pass, r, st } from "../animation-shared";

const PRODUCT_COLS = ["name", "category", "price"];
const PRODUCT_ROWS: Row[] = [
  r("aero", "Aero Sprint Pro", "Road Bikes", "5400.00"),
  r("meridian", "Meridian Road Carbon", "Road Bikes", "2890.00"),
  r("gravel", "Gravel Runner GX", "Road Bikes", "1980.00"),
  r("trailhead", "Trailhead 29 Carbon", "Mountain Bikes", "2450.00"),
];

const ROAD_BIKES = PRODUCT_ROWS.filter((row) => row.cells[1] === "Road Bikes");
const ROAD_BIKES_BY_PRICE = [...ROAD_BIKES].sort(
  (left, right) => Number(right.cells[2]) - Number(left.cells[2]),
);
const ROAD_BIKES_PROJECTION = ROAD_BIKES.map((row) => r(String(row.key), row.cells[0], row.cells[2]));
const ROAD_BIKES_BY_PRICE_PROJECTION = ROAD_BIKES_BY_PRICE.map((row) =>
  r(String(row.key), row.cells[0], row.cells[2]),
);

export const pipelineStages: Stage[] = [
  {
    name: "1. FROM finds the source",
    sql: ["SELECT name, price", "FROM products"],
    table: { name: "products", cols: PRODUCT_COLS, rows: PRODUCT_ROWS },
    steps: [
      st(
        [1],
        "kept",
        "FROM runs first. The database starts with product rows and their available columns.",
        { noteTone: "neutral" },
      ),
    ],
  },
  {
    name: "2. WHERE filters rows",
    sql: [
      "SELECT name, price",
      "FROM products",
      "WHERE category = 'Road Bikes'",
    ],
    table: { name: "products", cols: PRODUCT_COLS, rows: PRODUCT_ROWS },
    steps: [
      st(
        [2],
        pass((row) => row.cells[1] === "Road Bikes"),
        "WHERE runs before SELECT. It removes the Mountain Bikes row while all source columns are still available.",
        { highlightCols: [1], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "3. SELECT chooses columns",
    sql: [
      "SELECT name, price",
      "FROM products",
      "WHERE category = 'Road Bikes'",
    ],
    table: { name: "products", cols: PRODUCT_COLS, rows: PRODUCT_ROWS },
    steps: [
      st(
        [0],
        "kept",
        "Only after WHERE has kept the road bikes does SELECT project name and price into the result.",
        {
          colsOverride: ["name", "price"],
          rowsOverride: ROAD_BIKES_PROJECTION,
          noteTone: "violet",
        },
      ),
    ],
  },
  {
    name: "4. ORDER BY sorts survivors",
    sql: [
      "SELECT name, price",
      "FROM products",
      "WHERE category = 'Road Bikes'",
      "ORDER BY price DESC",
    ],
    table: { name: "result", cols: ["name", "price"], rows: ROAD_BIKES_PROJECTION },
    steps: [
      st(
        [3],
        "kept",
        "ORDER BY sees the projected result and arranges the three road bikes from highest price to lowest.",
        {
          colsOverride: ["name", "price"],
          rowsOverride: ROAD_BIKES_BY_PRICE_PROJECTION,
          noteTone: "amber",
        },
      ),
    ],
  },
  {
    name: "5. LIMIT keeps the first rows",
    sql: [
      "SELECT name, price",
      "FROM products",
      "WHERE category = 'Road Bikes'",
      "ORDER BY price DESC",
      "LIMIT 3;",
    ],
    table: { name: "result", cols: ["name", "price"], rows: ROAD_BIKES_BY_PRICE_PROJECTION },
    steps: [
      st(
        [4],
        "kept",
        "LIMIT is the last step here. It keeps the first three rows after filtering, projecting, and sorting are complete.",
        { noteTone: "mint" },
      ),
    ],
  },
];
