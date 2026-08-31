import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ----- q-bool: AND, OR, NOT, combined -----
const PRODUCTS: Row[] = [
  r(2, 2, "Trailhead 29 Carbon", "Mountain Bikes", 2450, 113),
  r(4, 4, "Switchback Enduro", "Mountain Bikes", 4150, 10),
  r(6, 6, "Meridian Road Carbon", "Road Bikes", 2890, 65),
  r(7, 7, "Aero Sprint Pro", "Road Bikes", 5400, 99),
  r(8, 8, "Gravel Runner GX", "Road Bikes", 1980, 122),
];
const PCOLS = ["id", "name", "category", "price", "in_stock"];

export const boolStages: Stage[] = [
  {
    name: "AND",
    blurb: "Both predicates must be TRUE",
    sql: [
      "SELECT name, price, in_stock",
      "FROM   products",
      "WHERE  category = 'Road Bikes'",
      "       AND in_stock >= 90",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "Five real Cycle Depot products enter the WHERE filter."),
      st(
        [2],
        pass((r) => r.cells[2] === "Road Bikes"),
        "The category check keeps the three Road Bikes. The other two rows do not pass this condition.",
        { highlightCols: [2] },
      ),
      st(
        [2, 3],
        pass((r) => r.cells[2] === "Road Bikes" && Number(r.cells[4]) >= 90),
        "AND asks for both conditions. Aero Sprint Pro and Gravel Runner GX are Road Bikes with at least 90 units in stock.",
        { highlightCols: [2, 4] },
      ),
    ],
  },
  {
    name: "OR",
    blurb: "Either predicate TRUE keeps the row",
    sql: [
      "SELECT name, category, price",
      "FROM   products",
      "WHERE  category = 'Road Bikes'",
      "       OR price >= 4000",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "Start with the same five Cycle Depot products."),
      st(
        [2],
        pass((r) => r.cells[2] === "Road Bikes"),
        "The first branch keeps the three Road Bikes.",
        { highlightCols: [2] },
      ),
      st(
        [2, 3],
        pass((r) => r.cells[2] === "Road Bikes" || Number(r.cells[3]) >= 4000),
        "OR needs only one true branch. Switchback Enduro joins the result because its price is at least 4000.",
        { highlightCols: [2, 3] },
      ),
    ],
  },
  {
    name: "NOT",
    blurb: "Negation excludes matching rows",
    sql: ["SELECT name, category", "FROM   products", "WHERE  NOT category = 'Road Bikes'"],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "All five products are candidates before negation."),
      st(
        [2],
        pass((r) => r.cells[2] !== "Road Bikes"),
        "NOT reverses the category test. The two Mountain Bikes remain; every Road Bike is excluded.",
        { highlightCols: [2], noteTone: "amber" },
      ),
    ],
  },
  {
    name: "Combined precedence",
    blurb: "Parentheses make mixed logic explicit",
    sql: [
      "SELECT name, category, price, in_stock",
      "FROM   products",
      "WHERE  (category = 'Road Bikes' AND in_stock >= 90)",
      "       OR (NOT category = 'Road Bikes' AND price >= 4000)",
    ],
    table: { name: "products", cols: PCOLS, rows: PRODUCTS },
    steps: [
      st(
        [2],
        pass((r) => r.cells[2] === "Road Bikes" && Number(r.cells[4]) >= 90),
        "First group: Road Bikes with at least 90 units. Aero Sprint Pro and Gravel Runner GX pass.",
        { highlightCols: [2, 4] },
      ),
      st(
        [3],
        pass((r) => (r.cells[2] === "Road Bikes" && Number(r.cells[4]) >= 90) || (r.cells[2] !== "Road Bikes" && Number(r.cells[3]) >= 4000)),
        "Second group: non-Road Bikes priced at least 4000. Switchback Enduro passes, so the final result has three products.",
        { highlightCols: [2, 3, 4] },
      ),
      st(
        [2, 3],
        pass((r) => (r.cells[2] === "Road Bikes" && Number(r.cells[4]) >= 90) || (r.cells[2] !== "Road Bikes" && Number(r.cells[3]) >= 4000)),
        "SQL gives NOT priority, then AND, then OR. The parentheses show the business rule clearly, which makes mixed conditions safer to review and change.",
        { noteTone: "violet" },
      ),
    ],
  },
];

// ----- q-range: IN, BETWEEN, NOT IN, combined, PostgreSQL @> -----
const RANGE_PRODUCTS: Row[] = [
  r(2, 2, "Trailhead 29 Carbon", "Mountain Bikes", 2450, 113),
  r(3, 3, "Boulder Full Suspension", "Mountain Bikes", 3199, 125),
  r(6, 6, "Meridian Road Carbon", "Road Bikes", 2890, 65),
  r(8, 8, "Gravel Runner GX", "Road Bikes", 1980, 122),
  r(11, 11, "Volt E-Commuter", "City Bikes", 2260, 15),
  r(12, 12, "Volt E-Cargo", "City Bikes", 3890, 33),
];
const RANGE_COLS = ["id", "name", "category", "price", "in_stock"];

// This is deliberately a PostgreSQL-only teaching dataset. Cycle Depot's
// products table does not currently store tags in an array column.
const ARRAY_TAG_PRODUCTS: Row[] = [
  r("aero", "Aero Sprint Pro", "{road,race,carbon}"),
  r("gravel", "Gravel Runner GX", "{road,gravel,tubeless}"),
  r("city", "City Commuter 7", "{city,rack}"),
];
const ARRAY_TAG_COLS = ["name", "tags"];

export const rangeStages: Stage[] = [
  {
    name: "IN list",
    blurb: "Keep rows that match one listed value",
    sql: ["SELECT name, category, in_stock", "FROM   products", "WHERE  category IN ('Road Bikes', 'Mountain Bikes')"],
    table: { name: "products", cols: RANGE_COLS, rows: RANGE_PRODUCTS },
    steps: [
      st([0, 1], "pending", "Six Cycle Depot products enter the category filter."),
      st(
        [2],
        pass((r) => ["Road Bikes", "Mountain Bikes"].includes(String(r.cells[2]))),
        "IN reads like a compact list of allowed values. Four Road or Mountain Bikes remain; both City Bikes are removed.",
        { highlightCols: [2] },
      ),
    ],
  },
  {
    name: "BETWEEN",
    blurb: "Both endpoints are included",
    sql: ["SELECT name, price", "FROM   products", "WHERE  price BETWEEN 2000 AND 3000"],
    table: { name: "products", cols: RANGE_COLS, rows: RANGE_PRODUCTS },
    steps: [
      st(
        [2],
        pass((r) => Number(r.cells[3]) >= 2000 && Number(r.cells[3]) <= 3000),
        "BETWEEN includes 2000 and 3000. Trailhead 29 Carbon, Meridian Road Carbon, and Volt E-Commuter are inside this price range.",
        { highlightCols: [3] },
      ),
      st(
        [2],
        pass((r) => Number(r.cells[3]) >= 2000 && Number(r.cells[3]) <= 3000),
        "For prices, inclusive endpoints are usually intuitive. For timestamps, prefer a half-open range such as >= start AND < next_day so you do not miss later times on the final date.",
        { noteTone: "amber" },
      ),
    ],
  },
  {
    name: "NOT IN",
    blurb: "Exclude rows that match the list",
    sql: ["SELECT name, category", "FROM   products", "WHERE  category NOT IN ('Road Bikes', 'Mountain Bikes')"],
    table: { name: "products", cols: RANGE_COLS, rows: RANGE_PRODUCTS },
    steps: [
      st(
        [2],
        pass((r) => !["Road Bikes", "Mountain Bikes"].includes(String(r.cells[2]))),
        "NOT IN reverses the membership test. The two City Bikes remain because neither category appears in the excluded list.",
        { highlightCols: [2], noteTone: "amber" },
      ),
    ],
  },
  {
    name: "Combined",
    blurb: "Use a set and a range in one business rule",
    sql: [
      "SELECT name, category, price",
      "FROM   products",
      "WHERE  category IN ('Road Bikes', 'Mountain Bikes', 'City Bikes')",
      "       AND category NOT IN ('City Bikes')",
      "       AND price BETWEEN 2000 AND 4000",
    ],
    table: { name: "products", cols: RANGE_COLS, rows: RANGE_PRODUCTS },
    steps: [
      st(
        [2],
        pass(
          (r) =>
            ["Road Bikes", "Mountain Bikes", "City Bikes"].includes(String(r.cells[2])),
        ),
        "All six displayed products are in the allowed bike-category set.",
        { highlightCols: [2] },
      ),
      st(
        [3],
        pass(
          (r) =>
            ["Road Bikes", "Mountain Bikes", "City Bikes"].includes(String(r.cells[2])) &&
            r.cells[2] !== "City Bikes"),
        "NOT IN removes the City Bikes from that set, leaving the four Road and Mountain Bikes.",
        { highlightCols: [2], noteTone: "amber" },
      ),
      st(
        [4],
        pass(
          (r) =>
            ["Road Bikes", "Mountain Bikes", "City Bikes"].includes(String(r.cells[2])) &&
            r.cells[2] !== "City Bikes" &&
            Number(r.cells[3]) >= 2000 &&
            Number(r.cells[3]) <= 4000),
        "BETWEEN narrows the remaining products to Trailhead 29 Carbon, Boulder Full Suspension, and Meridian Road Carbon.",
        { highlightCols: [2, 3] },
      ),
    ],
  },
  {
    name: "PostgreSQL @> arrays",
    blurb: "Keep arrays that contain every requested value",
    layout: "wide",
    sql: [
      "WITH product_tags(name, tags) AS (",
      "  VALUES",
      "    ('Aero Sprint Pro', ARRAY['road', 'race', 'carbon']),",
      "    ('Gravel Runner GX', ARRAY['road', 'gravel', 'tubeless']),",
      "    ('City Commuter 7', ARRAY['city', 'rack'])",
      ")",
      "SELECT name, tags",
      "FROM   product_tags",
      "WHERE  tags @> ARRAY['road'];",
    ],
    table: { name: "product_tags · PostgreSQL demo", cols: ARRAY_TAG_COLS, rows: ARRAY_TAG_PRODUCTS },
    steps: [
      st(
        [0, 1, 2, 3, 4],
        "pending",
        "This small VALUES dataset gives each product a tags array. It is a PostgreSQL teaching example, not a column in Cycle Depot's current products table.",
        { highlightCols: [1], noteTone: "violet" },
      ),
      st(
        [8],
        pass((r) => String(r.cells[1]).includes("road")),
        "@> reads as contains. The left-hand tags array must contain every requested value on the right, so the two products tagged road remain. Array order does not matter.",
        { highlightCols: [1], noteTone: "violet" },
      ),
    ],
  },
];

// ----- q-null3vl: = NULL fails, IS NULL, NOT IN NULL, COALESCE -----
const EMP_N: Row[] = [
  r(1, 1, "Ada", 0),
  r(2, 2, "Linus", 1),
  r(3, 3, "Grace", null),
  r(4, 4, "Bob", 2),
  r(5, 5, "Eve", null),
];
const NCOLS = ["id", "name", "manager_id"];

export const null3vlStages: Stage[] = [
  {
    name: "= NULL silently fails",
    sql: ["SELECT id, name", "FROM   employees", "WHERE  manager_id = NULL"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st(
        [2],
        () => "dropped" as RowState,
        "Every comparison with NULL returns UNKNOWN — never TRUE. ZERO rows. Beginners' #1 surprise.",
        { highlightCols: [2], noteTone: "rose" },
      ),
    ],
  },
  {
    name: "IS NULL is the only test",
    sql: ["SELECT id, name", "FROM   employees", "WHERE  manager_id IS NULL"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st(
        [2],
        pass((r) => r.cells[2] === null),
        "IS NULL / IS NOT NULL return TRUE/FALSE — never UNKNOWN. Grace and Eve surface.",
        { highlightCols: [2], noteTone: "mint" },
      ),
    ],
  },
  {
    name: "<> 1 hides NULL rows",
    sql: ["SELECT id, name, manager_id", "FROM   employees", "WHERE  manager_id <> 1"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st(
        [2],
        pass((r) => (r.cells[2] === null ? false : r.cells[2] !== 1)),
        "manager_id<>1 evaluates UNKNOWN for NULL rows → dropped. Grace and Eve vanish silently — usually a bug.",
        { highlightCols: [2], noteTone: "amber" },
      ),
      st(
        [2, 3],
        pass((r) => (r.cells[2] === null ? true : r.cells[2] !== 1)),
        "Add OR manager_id IS NULL — now NULL rows are explicitly included.",
        { highlightCols: [2], rowsOverride: EMP_N, noteTone: "mint" },
      ),
    ],
  },
  {
    name: "COALESCE in SELECT",
    sql: ["SELECT id, name,", "       COALESCE(manager_id, -1) AS mgr", "FROM   employees"],
    table: { name: "employees", cols: NCOLS, rows: EMP_N },
    steps: [
      st(
        [1],
        "added",
        "COALESCE returns the first non-NULL argument. NULL manager_ids become -1 — useful for reports and ORDER BY (NULLs sort to extremes).",
        {
          rowsOverride: EMP_N.map((row) =>
            r(row.key, row.cells[0]!, row.cells[1]!, row.cells[2] === null ? -1 : row.cells[2]!),
          ),
          colsOverride: ["id", "name", "mgr"],
        },
      ),
    ],
  },
];

// ============================================================
// Module 2: Aggregations
// ============================================================
