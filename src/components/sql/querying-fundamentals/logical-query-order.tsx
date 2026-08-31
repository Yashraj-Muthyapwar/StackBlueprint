import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ----- pipeline -----
const pipeOrders: Row[] = [
  r(1, 1, "Ada", 45, "2026-06-01"),
  r(2, 2, "Linus", 120, "2026-06-05"),
  r(3, 3, "Ada", 80, "2026-06-10"),
  r(4, 4, "Grace", 30, "2026-05-02"),
  r(5, 5, "Alan", 50, "2026-06-18"),
  r(6, 6, "Linus", 75, "2026-06-20"),
  r(7, 7, "Bob", 105, "2026-06-15"),
];
const pipeCols = ["id", "customer", "total", "placed_at"];

export const pipelineStages: Stage[] = [
  {
    name: "FROM",
    blurb: "Resolve the source relation",
    sql: ["SELECT customer, SUM(total) AS revenue", "FROM   orders"],
    table: { name: "orders", cols: pipeCols, rows: pipeOrders },
    steps: [
      st(
        [1],
        "pending",
        "Logical step 1: identify the source. No filtering yet — all 7 rows visible.",
      ),
    ],
  },
  {
    name: "WHERE",
    blurb: "Row-level predicate",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  placed_at >= '2026-06-01'",
    ],
    table: { name: "orders", cols: pipeCols, rows: pipeOrders },
    steps: [
      st(
        [2],
        pass((r) => String(r.cells[3]) >= "2026-06-01"),
        "Grace's May order falls away. WHERE runs BEFORE grouping, so we save work later.",
        { highlightCols: [3] },
      ),
    ],
  },
  {
    name: "GROUP BY",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  placed_at >= '2026-06-01'",
      "GROUP  BY customer",
    ],
    table: { name: "orders", cols: pipeCols, rows: pipeOrders },
    steps: [
      st(
        [3],
        pass((r) => String(r.cells[3]) >= "2026-06-01"),
        "Survivors collapse into buckets by customer.",
        {
          highlightCols: [1],
          side: bucketPanel([
            { k: "Ada", sum: 125 },
            { k: "Linus", sum: 195 },
            { k: "Alan", sum: 50 },
            { k: "Bob", sum: 105 },
          ]),
        },
      ),
    ],
  },
  {
    name: "HAVING",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders",
      "WHERE  placed_at >= '2026-06-01'",
      "GROUP  BY customer",
      "HAVING SUM(total) >= 100",
    ],
    table: { name: "orders", cols: pipeCols, rows: pipeOrders },
    steps: [
      st(
        [4],
        pass((r) => String(r.cells[3]) >= "2026-06-01"),
        "Group-level filter — Alan's $50 bucket drops. HAVING is the only place aggregate predicates live.",
        {
          side: bucketPanel([
            { k: "Ada ✓", sum: 125 },
            { k: "Linus ✓", sum: 195 },
            { k: "Bob ✓", sum: 105 },
          ]),
        },
      ),
    ],
  },
  {
    name: "SELECT · ORDER BY · LIMIT",
    sql: [
      "SELECT customer, SUM(total) AS revenue",
      "FROM   orders WHERE placed_at >= '2026-06-01'",
      "GROUP  BY customer HAVING SUM(total) >= 100",
      "ORDER  BY revenue DESC LIMIT 2",
    ],
    table: {
      name: "result",
      cols: ["customer", "revenue"],
      rows: [r("lin", "Linus", 195), r("ada", "Ada", 125)],
    },
    steps: [
      st(
        [0, 3],
        "added",
        "Projection → sort → cap. SELECT runs LAST in the logical pipeline (but you write it first).",
        { noteTone: "violet" },
      ),
    ],
  },
];
