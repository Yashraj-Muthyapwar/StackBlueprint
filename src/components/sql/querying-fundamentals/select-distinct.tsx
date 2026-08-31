import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ---------- select-distinct ----------
const DST_COLS = ["id", "customer", "country", "plan"];
const DST_ROWS: Row[] = [
  r(1, 1, "Ada", "US", "pro"),
  r(2, 2, "Linus", "FI", "free"),
  r(3, 3, "Ada", "US", "pro"),
  r(4, 4, "Grace", "US", "pro"),
  r(5, 5, "Linus", "FI", "pro"),
  r(6, 6, "Alan", "UK", "free"),
  r(7, 7, "Ada", "US", "free"),
];

export const distinctStages: Stage[] = [
  {
    name: "Without DISTINCT — duplicates everywhere",
    sql: ["SELECT country", "FROM   customers"],
    table: { name: "customers", cols: DST_COLS, rows: DST_ROWS },
    steps: [
      st(
        [0, 1],
        "kept",
        "Projection without DISTINCT preserves every input row — 7 values, with US repeated 4 times and FI twice.",
        { highlightCols: [2] },
      ),
    ],
  },
  {
    name: "DISTINCT one column",
    sql: ["SELECT DISTINCT country", "FROM   customers"],
    table: { name: "customers", cols: DST_COLS, rows: DST_ROWS },
    steps: [
      st(
        [0, 1],
        "kept",
        "DISTINCT runs a hash/sort dedupe pass after the projection. 7 → 3 unique countries: US, FI, UK.",
        {
          rowsOverride: [r("US", "US"), r("FI", "FI"), r("UK", "UK")],
          colsOverride: ["country"],
          noteTone: "mint",
        },
      ),
    ],
  },
  {
    name: "DISTINCT applies to the WHOLE row",
    sql: ["SELECT DISTINCT country, plan", "FROM   customers"],
    table: { name: "customers", cols: DST_COLS, rows: DST_ROWS },
    steps: [
      st(
        [0, 1],
        "kept",
        "DISTINCT looks at the entire projected tuple, not just the first column. 7 → 5 unique pairs.",
        {
          rowsOverride: [
            r("a", "US", "pro"),
            r("b", "FI", "free"),
            r("c", "US", "free"),
            r("d", "FI", "pro"),
            r("e", "UK", "free"),
          ],
          colsOverride: ["country", "plan"],
          noteTone: "violet",
        },
      ),
    ],
  },
  {
    name: "COUNT(DISTINCT …) — cardinality, not rows",
    sql: [
      "SELECT COUNT(*)              AS rows_seen,",
      "       COUNT(DISTINCT country) AS unique_countries",
      "FROM   customers",
    ],
    table: { name: "customers", cols: DST_COLS, rows: DST_ROWS },
    steps: [
      st(
        [0, 1, 2],
        "kept",
        "COUNT(*) = 7 input rows. COUNT(DISTINCT country) = 3 unique values. Different questions, different answers — DISTINCT is memory-heavy on large cardinalities.",
        {
          rowsOverride: [r("k", 7, 3)],
          colsOverride: ["rows_seen", "unique_countries"],
          noteTone: "amber",
        },
      ),
    ],
  },
];
