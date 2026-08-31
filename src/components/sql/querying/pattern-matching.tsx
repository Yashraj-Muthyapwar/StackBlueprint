import type { Row, Stage } from "@/components/lesson/MultiStage";
import { pass, r, sidePanel, st } from "../animation-shared";

const PRODUCTS: Row[] = [
  r(5, 5, "Meridian Road Alloy", "Road Bikes"),
  r(6, 6, "Meridian Road Carbon", "Road Bikes"),
  r(11, 11, "Volt E-Commuter", "City Bikes"),
  r(12, 12, "Volt E-Cargo", "City Bikes"),
  r(13, 13, "Shellcap Road Helmet", "Helmets"),
];

const COLUMNS = ["id", "name", "category"];

/** Stages for Filtering 1.3: LIKE, ILIKE, wildcards, and NOT LIKE. */
export const patternMatchingStages: Stage[] = [
  {
    name: "Prefix match: Volt%",
    blurb: "Match text that begins with Volt",
    sql: ["SELECT name, category", "FROM   products", "WHERE  name LIKE 'Volt%'"],
    table: { name: "products", cols: COLUMNS, rows: PRODUCTS },
    steps: [
      st([0, 1], "pending", "Five real Cycle Depot product names are available to search."),
      st(
        [2],
        pass((row) => String(row.cells[1]).startsWith("Volt")),
        "The trailing % means any number of characters may follow Volt. The two Volt products remain.",
        {
          highlightCols: [1],
          side: sidePanel(
            "Prefix search",
            ["Known start: Volt", "An ordered name index can seek near Volt", "Then it reads the matching range"],
            "mint",
          ),
        },
      ),
    ],
  },
  {
    name: "Contains match: %Road%",
    blurb: "Match text anywhere in a name",
    sql: ["SELECT name, category", "FROM   products", "WHERE  name LIKE '%Road%'"],
    table: { name: "products", cols: COLUMNS, rows: PRODUCTS },
    steps: [
      st(
        [2],
        pass((row) => String(row.cells[1]).includes("Road")),
        "A % on both sides allows text before and after Road. Notice that Shellcap Road Helmet also matches because Road appears in its name.",
        {
          highlightCols: [1],
          noteTone: "amber",
          side: sidePanel(
            "Contains search",
            ["Unknown start: %Road%", "An ordinary B-tree cannot seek to Road", "The engine may need to inspect many names"],
            "amber",
          ),
        },
      ),
    ],
  },
  {
    name: "One character: _",
    blurb: "Match exactly one character",
    sql: ["SELECT name", "FROM   products", "WHERE  name LIKE 'Volt _-%'"],
    table: { name: "products", cols: COLUMNS, rows: PRODUCTS },
    steps: [
      st(
        [2],
        pass((row) => /^Volt .-/.test(String(row.cells[1]))),
        "The underscore matches exactly one character: E. The hyphen is literal, and the final % accepts the rest of either Volt model name.",
        { highlightCols: [1], noteTone: "violet" },
      ),
    ],
  },
  {
    name: "Case-insensitive: ILIKE",
    blurb: "Match Volt even when the pattern is lowercase",
    sql: ["SELECT name", "FROM   products", "WHERE  name ILIKE 'volt e-%'"],
    table: { name: "products", cols: COLUMNS, rows: PRODUCTS },
    steps: [
      st(
        [2],
        pass((row) => /^volt e-/i.test(String(row.cells[1]))),
        "ILIKE ignores letter case, so the lowercase pattern still finds both product names. LIKE would use the database's normal case rules instead.",
        { highlightCols: [1] },
      ),
    ],
  },
  {
    name: "Exclude with NOT LIKE",
    blurb: "Keep Road products, except helmets",
    sql: [
      "SELECT name, category",
      "FROM   products",
      "WHERE  name ILIKE '%road%'",
      "  AND  name NOT LIKE '%Helmet%'",
    ],
    table: { name: "products", cols: COLUMNS, rows: PRODUCTS },
    steps: [
      st(
        [2],
        pass((row) => String(row.cells[1]).toLowerCase().includes("road")),
        "ILIKE finds every name containing road, including the helmet.",
        { highlightCols: [1] },
      ),
      st(
        [2, 3],
        pass((row) => String(row.cells[1]).toLowerCase().includes("road") && !String(row.cells[1]).includes("Helmet")),
        "NOT LIKE removes the helmet. The two Meridian Road bikes are the final result.",
        { highlightCols: [1, 2], noteTone: "mint" },
      ),
    ],
  },
];
