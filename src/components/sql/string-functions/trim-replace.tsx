import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const NAME_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(2, "Trailhead 29 Carbon"),
  r(3, "Boulder Full Suspension"),
];

const PADDED_ROWS: Row[] = [
  r(1, "|  Trailhead 29 Hardtail  |"),
  r(2, "|  Trailhead 29 Carbon  |"),
  r(3, "|  Boulder Full Suspension  |"),
];

const LTRIM_RESULT_ROWS: Row[] = [
  r(1, "|Trailhead 29 Hardtail  |"),
  r(2, "|Trailhead 29 Carbon  |"),
  r(3, "|Boulder Full Suspension  |"),
];

const RTRIM_RESULT_ROWS: Row[] = [
  r(1, "|  Trailhead 29 Hardtail|"),
  r(2, "|  Trailhead 29 Carbon|"),
  r(3, "|  Boulder Full Suspension|"),
];

const TRIM_RESULT_ROWS: Row[] = [
  r(1, "|Trailhead 29 Hardtail|"),
  r(2, "|Trailhead 29 Carbon|"),
  r(3, "|Boulder Full Suspension|"),
];

const MARKER_PADDED_ROWS: Row[] = [
  r(1, "---Trailhead 29 Hardtail---"),
  r(2, "---Trailhead 29 Carbon---"),
  r(3, "---Boulder Full Suspension---"),
];

const BTRIM_RESULT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(2, "Trailhead 29 Carbon"),
  r(3, "Boulder Full Suspension"),
];

const REPLACE_RESULT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "Trailhead-29-Hardtail"),
  r(2, "Trailhead 29 Carbon", "Trailhead-29-Carbon"),
  r(3, "Boulder Full Suspension", "Boulder-Full-Suspension"),
];

/** A lesson-scoped walkthrough of directional edge cleanup and exact text replacement. */
export const trimReplaceStages: Stage[] = [
  {
    name: "LTRIM removes the left edge",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       CONCAT('|', LTRIM(CONCAT(' ', name, ' ')), '|') AS left_trimmed",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["padded_name"], rows: PADDED_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The pipes make the temporary edge padding visible. LTRIM will work on the left edge only.",
      ),
      st(
        [1],
        "kept",
        "LTRIM removes the left padding and keeps the right-edge space. It leaves spaces inside each product name unchanged.",
        {
          rowsOverride: LTRIM_RESULT_ROWS,
          colsOverride: ["left_trimmed"],
          highlightCols: [0],
        },
      ),
    ],
  },
  {
    name: "RTRIM removes the right edge",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       CONCAT('|', RTRIM(CONCAT(' ', name, ' ')), '|') AS right_trimmed",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["padded_name"], rows: PADDED_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The same padded input starts with one edge space on the left and one on the right.",
      ),
      st(
        [1],
        "kept",
        "RTRIM removes the right padding and keeps the left-edge space. It does not touch the words in the middle.",
        {
          rowsOverride: RTRIM_RESULT_ROWS,
          colsOverride: ["right_trimmed"],
          highlightCols: [0],
        },
      ),
    ],
  },
  {
    name: "TRIM removes both edges",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       CONCAT('|', TRIM(CONCAT(' ', name, ' ')), '|') AS fully_trimmed",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["padded_name"], rows: PADDED_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "TRIM starts from the same padded product label, but it cleans both outside edges.",
      ),
      st(
        [1],
        "kept",
        "TRIM removes all temporary edge padding. The inner word spaces remain, and the original product name is still unchanged in the table.",
        {
          rowsOverride: TRIM_RESULT_ROWS,
          colsOverride: ["fully_trimmed"],
          highlightCols: [0],
        },
      ),
    ],
  },
  {
    name: "BTRIM removes chosen markers",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       BTRIM(CONCAT('---', name, '---'), '-') AS marker_trimmed",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["marker_padded"], rows: MARKER_PADDED_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "This imported-style label is wrapped in hyphen markers. BTRIM receives the character to remove as its second argument.",
      ),
      st(
        [1],
        "kept",
        "BTRIM removes the outer hyphens from both edges and keeps every character in the actual product name.",
        {
          rowsOverride: BTRIM_RESULT_ROWS,
          colsOverride: ["marker_trimmed"],
          highlightCols: [0],
        },
      ),
    ],
  },
  {
    name: "REPLACE builds a compact key",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       REPLACE(name, ' ', '-') AS product_key",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products", cols: ["name"], rows: NAME_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "Each product name has spaces between its words. The original text remains available in the first column.",
      ),
      st(
        [1],
        "kept",
        "REPLACE finds every single space and changes it to a hyphen, producing a new compact product_key for each row.",
        {
          rowsOverride: REPLACE_RESULT_ROWS,
          colsOverride: ["name", "product_key"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
