import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const PRODUCT_PREVIEW: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(2, "Boulder Full Suspension"),
  r(3, "City Commuter 7"),
  r(4, "Meridian Road Alloy"),
  r(5, "11-Speed Cassette"),
];

const DIGIT_MATCHES: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(3, "City Commuter 7"),
  r(5, "11-Speed Cassette"),
];

const REPLACED_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "Trailhead # Hardtail"),
  r(2, "Trailhead 29 Carbon", "Trailhead # Carbon"),
  r(3, "Boulder Full Suspension", "Boulder Full Suspension"),
  r(4, "Switchback Enduro", "Switchback Enduro"),
];

const MODEL_NUMBER_SOURCE: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(2, "Trailhead 29 Carbon"),
  r(3, "City Commuter 7"),
];

const MODEL_NUMBER_RESULTS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "29"),
  r(2, "Trailhead 29 Carbon", "29"),
  r(3, "City Commuter 7", "7"),
];

const DIGITS_KEPT_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "#29#"),
  r(2, "Trailhead 29 Carbon", "#29#"),
  r(3, "City Commuter 7", "#7#"),
];

const WORD_RUN_ROWS: Row[] = [
  r(1, "Trailhead 29 Hardtail", "Trailhead|29|Hardtail"),
  r(2, "City Commuter 7", "City|Commuter|7"),
  r(3, "11-Speed Cassette", "11|Speed|Cassette"),
];

const FULLY_SHAPED_NAMES: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(2, "Trailhead 29 Carbon"),
];

const SHAPE_CHECK_SOURCE: Row[] = [
  r(1, "Trailhead 29 Hardtail"),
  r(2, "Trailhead 29 Carbon"),
  r(3, "Boulder Full Suspension"),
  r(4, "City Commuter 7"),
  r(5, "11-Speed Cassette"),
];

/** A lesson-scoped walkthrough of flexible regex matching and replacement in PostgreSQL. */
export const regexStages: Stage[] = [
  {
    name: "A regex tests each product name",
    canvasMinHeight: 420,
    sql: [
      "SELECT name",
      "FROM   products",
      "WHERE  name ~ '[0-9]+'",
      "ORDER  BY id",
    ],
    table: { name: "products preview", cols: ["name"], rows: PRODUCT_PREVIEW },
    steps: [
      st(
        [0, 1, 3],
        "kept",
        "This small preview shows five real product names. The query applies the pattern to every product row, not only the rows shown here.",
      ),
      st(
        [2],
        "kept",
        "[0-9] means any digit and + means one or more. The rows with a number match; the other preview rows do not reach the result.",
        {
          rowsOverride: DIGIT_MATCHES,
          colsOverride: ["name"],
        },
      ),
    ],
  },
  {
    name: "REGEXP_REPLACE reshapes matching text",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       REGEXP_REPLACE(name, '[0-9]+', '#', 'g') AS masked_name",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  4",
    ],
    table: { name: "products", cols: ["name"], rows: PRODUCT_PREVIEW.slice(0, 4) },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The source names remain unchanged. This stage creates a second display value from the first four real product names.",
      ),
      st(
        [1],
        "kept",
        "REGEXP_REPLACE finds digit runs with [0-9]+ and changes each run to #. The g flag applies the replacement everywhere the pattern appears.",
        {
          rowsOverride: REPLACED_ROWS,
          colsOverride: ["name", "masked_name"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "REGEXP_LIKE filters and REGEXP_SUBSTR extracts",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       REGEXP_SUBSTR(name, '[0-9]+') AS model_number",
      "FROM   products",
      "WHERE  REGEXP_LIKE(name, '[0-9]+')",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "matching products preview", cols: ["name"], rows: MODEL_NUMBER_SOURCE },
    steps: [
      st(
        [0, 2, 4, 5],
        "kept",
        "This preview starts with three real Cycle Depot product names that contain model-number text. LIMIT keeps the animation compact; the lesson table shows all five matches.",
      ),
      st(
        [3],
        "kept",
        "REGEXP_LIKE is the function form of a regex test. It keeps only names with at least one digit run, just like the PostgreSQL ~ operator.",
      ),
      st(
        [1],
        "kept",
        "REGEXP_SUBSTR returns the first matching digit run as a new value. The original product name remains untouched.",
        {
          rowsOverride: MODEL_NUMBER_RESULTS,
          colsOverride: ["name", "model_number"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "\\d finds digits; \\D finds everything else",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       REGEXP_REPLACE(name, '\\D+', '#', 'g') AS digits_kept",
      "FROM   products",
      "WHERE  name ~ '\\d+'",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "products with digits", cols: ["name"], rows: MODEL_NUMBER_SOURCE },
    steps: [
      st(
        [0, 2, 4, 5],
        "kept",
        "\\d means a digit. The WHERE clause keeps the product names that contain one or more digits.",
      ),
      st(
        [3],
        "kept",
        "The shorthand \\d+ means a run of digits. It is equivalent to [0-9]+ in this PostgreSQL playground.",
      ),
      st(
        [1],
        "kept",
        "\\D+ means a run of non-digits. Replacing those runs with # leaves each model-number run easy to see.",
        {
          rowsOverride: DIGITS_KEPT_ROWS,
          colsOverride: ["name", "digits_kept"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "\\w keeps word characters; \\W exposes separators",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       REGEXP_REPLACE(name, '\\W+', '|', 'g') AS word_runs",
      "FROM   products",
      "WHERE  name ~ '\\W'",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: {
      name: "products with a separator",
      cols: ["name"],
      rows: [MODEL_NUMBER_SOURCE[0], MODEL_NUMBER_SOURCE[2], r(4, "11-Speed Cassette")],
    },
    steps: [
      st(
        [0, 2, 4, 5],
        "kept",
        "A word character is a letter, digit, or underscore. Spaces and hyphens are separators, so these real product names contain non-word characters.",
      ),
      st(
        [3],
        "kept",
        "\\W finds non-word characters. It is the opposite of \\w, which matches the word characters that remain between the separators.",
      ),
      st(
        [1],
        "kept",
        "Replacing every run of separators with | makes the word-like pieces visible. A space and a hyphen are both non-word characters.",
        {
          rowsOverride: WORD_RUN_ROWS,
          colsOverride: ["name", "word_runs"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "^, $, and \\s validate a complete name shape",
    canvasMinHeight: 420,
    sql: [
      "SELECT name",
      "FROM   products",
      "WHERE  name ~ '^[A-Za-z]+\\s[0-9]+\\s[A-Za-z]+$'",
      "ORDER  BY id",
    ],
    table: { name: "products preview", cols: ["name"], rows: SHAPE_CHECK_SOURCE },
    steps: [
      st(
        [0, 1, 3],
        "kept",
        "This checks a full three-part product-name shape: word, space, number, space, word. The source preview includes names that do and do not have that exact shape.",
      ),
      st(
        [2],
        "kept",
        "^ starts at the beginning, \\s matches each required space, and $ requires the pattern to reach the end. Nothing extra may appear before or after.",
        {
          rowsOverride: FULLY_SHAPED_NAMES,
          colsOverride: ["name"],
        },
      ),
    ],
  },
];
