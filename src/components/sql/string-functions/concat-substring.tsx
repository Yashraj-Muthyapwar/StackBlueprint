import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const CUSTOMER_ROWS: Row[] = [
  r(1, "Zane Novak", "zane.novak1@example.com"),
  r(2, "Boris Alvarez", "boris.alvarez2@example.com"),
  r(3, "Priya Doyle", "priya.doyle3@example.com"),
];

const CONTACT_ROWS: Row[] = [
  r(1, "Zane Novak <zane.novak1@example.com>"),
  r(2, "Boris Alvarez <boris.alvarez2@example.com>"),
  r(3, "Priya Doyle <priya.doyle3@example.com>"),
];

const PRODUCT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(2, "Trailhead 29 Carbon"),
  r(3, "Boulder Full Suspension"),
];

const PREFIX_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "Trail"),
  r(2, "Trailhead 29 Carbon", "Trail"),
  r(3, "Boulder Full Suspension", "Bould"),
];

/** A compact, lesson-scoped walkthrough of two foundational text operations. */
export const concatSubstringStages: Stage[] = [
  {
    name: "CONCAT builds one contact label",
    canvasMinHeight: 420,
    sql: [
      "SELECT name, email,",
      "       CONCAT(name, ' <', email, '>') AS contact_card",
      "FROM   customers",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "customers", cols: ["name", "email"], rows: CUSTOMER_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "Each customer row supplies two stored text values: a name and an email address.",
      ),
      st(
        [1],
        "kept",
        "CONCAT joins those values and the literal separators into one new contact_card value. The original columns remain unchanged.",
        { rowsOverride: CONTACT_ROWS, colsOverride: ["contact_card"], highlightCols: [0] },
      ),
    ],
  },
  {
    name: "SUBSTRING takes a fixed slice",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       SUBSTRING(name FROM 1 FOR 5) AS name_prefix",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name"], rows: PRODUCT_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The product name stays available in full. SUBSTRING will copy a smaller portion into a second result column.",
      ),
      st(
        [1],
        "kept",
        "FROM 1 means start at the first character. FOR 5 returns exactly five consecutive characters for each product name.",
        { rowsOverride: PREFIX_ROWS, colsOverride: ["name", "name_prefix"], highlightCols: [1] },
      ),
    ],
  },
];
