import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const NAME_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(2, "Trailhead 29 Carbon"),
  r(3, "Boulder Full Suspension"),
];

const UPPER_RESULT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "TRAILHEAD 29 HARDTAIL"),
  r(2, "Trailhead 29 Carbon", "TRAILHEAD 29 CARBON"),
  r(3, "Boulder Full Suspension", "BOULDER FULL SUSPENSION"),
];

const CATEGORY_ROWS: Row[] = [r(1, "Mountain Bikes"), r(2, "Road Bikes"), r(3, "City Bikes")];

const LOWER_RESULT_ROWS: Row[] = [
  r(1, "Mountain Bikes", "mountain bikes"),
  r(2, "Road Bikes", "road bikes"),
  r(3, "City Bikes", "city bikes"),
];

const INITCAP_ROWS: Row[] = [
  r(1, "GPS Cycling Computer", "Gps Cycling Computer"),
  r(2, "City Commuter Step-Thru", "City Commuter Step-Thru"),
  r(3, "Shellcap MIPS Pro", "Shellcap Mips Pro"),
];

/** A lesson-scoped walkthrough of case conversion in a query result. */
export const upperLowerStages: Stage[] = [
  {
    name: "UPPER formats a display label",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       UPPER(name) AS name_upper",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name"], rows: NAME_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The stored product name is title-cased. It remains available in the first result column.",
      ),
      st(
        [1],
        "kept",
        "UPPER converts only the letters in each name. Numbers and spaces stay in their original positions.",
        {
          rowsOverride: UPPER_RESULT_ROWS,
          colsOverride: ["name", "name_upper"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "LOWER formats an export value",
    canvasMinHeight: 420,
    sql: [
      "SELECT category,",
      "       LOWER(category) AS category_lower",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["category"], rows: CATEGORY_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "Each category begins as the same stored title-cased value that appears in the product table.",
      ),
      st(
        [1],
        "kept",
        "LOWER creates a lowercase version beside the original category. The source category is not overwritten.",
        {
          rowsOverride: LOWER_RESULT_ROWS,
          colsOverride: ["category", "category_lower"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "INITCAP makes a title-cased label",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       INITCAP(LOWER(name)) AS name_title",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: {
      name: "products",
      cols: ["name"],
      rows: INITCAP_ROWS.map(({ key, cells }) => ({ key, cells: [cells[0]] })),
    },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The stored product name remains unchanged. This example includes GPS and MIPS so the title-casing convention is easy to inspect.",
      ),
      st(
        [1],
        "kept",
        "LOWER normalizes the text first, then INITCAP title-cases each word. That means GPS becomes Gps and MIPS becomes Mips.",
        {
          rowsOverride: INITCAP_ROWS,
          colsOverride: ["name", "name_title"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
