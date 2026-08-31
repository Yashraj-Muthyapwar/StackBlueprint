import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ---------- query-structure: build a SELECT clause by clause ----------
const QS_COLS = ["id", "customer", "country", "total", "status", "placed_at"];
const QS_ROWS: Row[] = [
  r(1, 101, "Ada", "US", 320, "paid", "2026-06-01"),
  r(2, 102, "Linus", "FI", 80, "paid", "2026-06-03"),
  r(3, 103, "Ada", "US", 120, "paid", "2026-06-05"),
  r(4, 104, "Grace", "US", 540, "paid", "2026-06-07"),
  r(5, 105, "Linus", "FI", 60, "refund", "2026-06-09"),
  r(6, 106, "Ada", "US", 90, "paid", "2026-06-11"),
  r(7, 107, "Alan", "UK", 410, "paid", "2026-06-12"),
  r(8, 108, "Grace", "US", 200, "paid", "2026-06-14"),
];

const grpResult = (rows: Row[]): Row[] => {
  const buckets: Record<string, { customer: string; revenue: number; n: number }> = {};
  rows.forEach((row) => {
    const c = String(row.cells[1]);
    const t = Number(row.cells[3]);
    buckets[c] ??= { customer: c, revenue: 0, n: 0 };
    buckets[c].revenue += t;
    buckets[c].n += 1;
  });
  return Object.values(buckets).map((b) => r(b.customer, b.customer, b.revenue, b.n));
};

export const queryStructureStages: Stage[] = [
  {
    name: "FROM — pick the source",
    sql: ["FROM orders"],
    table: { name: "orders", cols: QS_COLS, rows: QS_ROWS },
    steps: [
      st(
        [0],
        "pending",
        "Step 1 of the logical pipeline. FROM names the relation we'll work with — 8 rows enter the pipe.",
        { noteTone: "neutral" },
      ),
    ],
  },
  {
    name: "WHERE — row-level filter",
    sql: [
      "SELECT *",
      "FROM   orders",
      "WHERE  status = 'paid'",
      "       AND placed_at >= '2026-06-01'",
    ],
    table: { name: "orders", cols: QS_COLS, rows: QS_ROWS },
    steps: [
      st(
        [2, 3],
        pass((row) => row.cells[4] === "paid"),
        "WHERE evaluates row-by-row. Refund row drops; 7 paid rows survive into the next step.",
        { highlightCols: [4, 5] },
      ),
    ],
  },
  {
    name: "GROUP BY — collapse into buckets",
    sql: [
      "SELECT customer,",
      "       SUM(total)  AS revenue,",
      "       COUNT(*)    AS orders",
      "FROM   orders",
      "WHERE  status = 'paid'",
      "GROUP  BY customer",
    ],
    table: { name: "orders", cols: QS_COLS, rows: QS_ROWS },
    steps: [
      st(
        [5],
        pass((row) => row.cells[4] === "paid"),
        "GROUP BY hashes surviving rows by customer. Each bucket will reduce into one output row.",
        { highlightCols: [1] },
      ),
      st([0, 1, 2, 5], "kept", "Aggregates SUM/COUNT reduce per bucket. 7 rows → 4 grouped rows.", {
        rowsOverride: grpResult(QS_ROWS.filter((row) => row.cells[4] === "paid")),
        colsOverride: ["customer", "revenue", "orders"],
        noteTone: "mint",
      }),
    ],
  },
  {
    name: "HAVING — filter the groups",
    sql: [
      "SELECT customer,",
      "       SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  status = 'paid'",
      "GROUP  BY customer",
      "HAVING SUM(total) > 200",
    ],
    table: { name: "orders", cols: QS_COLS, rows: QS_ROWS },
    steps: [
      st(
        [5],
        "kept",
        "HAVING runs AFTER aggregation — it filters GROUPS, not rows. Buckets with revenue ≤ 200 fall away.",
        {
          rowsOverride: grpResult(QS_ROWS.filter((row) => row.cells[4] === "paid"))
            .filter((row) => Number(row.cells[2]) > 200)
            .map((row) => r(row.key, row.cells[1], row.cells[2])),
          colsOverride: ["customer", "revenue"],
          noteTone: "violet",
        },
      ),
    ],
  },
  {
    name: "ORDER BY — sort the survivors",
    sql: [
      "SELECT customer,",
      "       SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  status = 'paid'",
      "GROUP  BY customer",
      "HAVING SUM(total) > 200",
      "ORDER  BY revenue DESC",
    ],
    table: { name: "orders", cols: QS_COLS, rows: QS_ROWS },
    steps: [
      st(
        [6],
        "kept",
        "ORDER BY runs after SELECT — it can reuse the 'revenue' alias because the projection has happened.",
        {
          rowsOverride: grpResult(QS_ROWS.filter((row) => row.cells[4] === "paid"))
            .filter((row) => Number(row.cells[2]) > 200)
            .map((row) => r(row.key, row.cells[1], row.cells[2]))
            .sort((a, b) => Number(b.cells[1]) - Number(a.cells[1])),
          colsOverride: ["customer", "revenue"],
          noteTone: "amber",
        },
      ),
    ],
  },
  {
    name: "LIMIT — cap the output",
    sql: [
      "SELECT customer,",
      "       SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  status = 'paid'",
      "GROUP  BY customer",
      "HAVING SUM(total) > 200",
      "ORDER  BY revenue DESC",
      "LIMIT  2",
    ],
    table: { name: "orders", cols: QS_COLS, rows: QS_ROWS },
    steps: [
      st(
        [7],
        "kept",
        "LIMIT is the last step. We finally hand the client just the top 2 customers. Pipeline: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
        {
          rowsOverride: grpResult(QS_ROWS.filter((row) => row.cells[4] === "paid"))
            .filter((row) => Number(row.cells[2]) > 200)
            .map((row) => r(row.key, row.cells[1], row.cells[2]))
            .sort((a, b) => Number(b.cells[1]) - Number(a.cells[1]))
            .slice(0, 2),
          colsOverride: ["customer", "revenue"],
          noteTone: "mint",
        },
      ),
    ],
  },
];
