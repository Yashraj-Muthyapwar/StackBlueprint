import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-ranking-ntile: split eight customers into four spending buckets -----
const COLS = ["customer_id", "total_spent"];
const TEMPLATE = "minmax(0,1.4fr) minmax(0,1.3fr) minmax(0,1.8fr)";

type Customer = { id: string; spent: number };

const SORTED: Customer[] = [
  { id: "A", spent: 1000 },
  { id: "B", spent: 900 },
  { id: "C", spent: 800 },
  { id: "D", spent: 700 },
  { id: "E", spent: 600 },
  { id: "F", spent: 500 },
  { id: "G", spent: 400 },
  { id: "H", spent: 300 },
];
const byId = (id: string) => SORTED.find((c) => c.id === id)!;
const STORED: Customer[] = ["C", "A", "E", "B", "H", "D", "G", "F"].map(byId);
const BUCKET: Record<string, number> = { A: 1, B: 1, C: 2, D: 2, E: 3, F: 3, G: 4, H: 4 };

// Every step shows the same eight SQL lines, so the table below the query never moves.
const SQL = [
  "SELECT customer_id, total_spent,",
  "       NTILE(4) OVER (",
  "         ORDER BY total_spent DESC, customer_id",
  "       ) AS spending_bucket",
  "FROM   customer_spending",
  "ORDER  BY total_spent DESC, customer_id",
];

const base = (list: Customer[]): Row[] => list.map((c) => r(c.id, c.id, c.spent));
const oddBucket = (row: Row) => BUCKET[String(row.cells[0])] % 2 === 1;

export const ntileStages: Stage[] = [
  {
    name: "Split customers into four buckets",
    blurb: "order, divide, then number",
    sql: SQL,
    table: { name: "customer_spending", cols: COLS, rows: base(STORED), columnTemplate: TEMPLATE },
    steps: [
      st([4], "pending", "FROM customer_spending provides eight customers in no particular order.", {
        highlightCols: [1],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Source", ["Table: customer_spending"], "neutral")}
            {sidePanel("Rows", ["8 customers"], "neutral")}
          </div>
        ),
      }),
      st([2], "kept", "ORDER BY total_spent DESC, customer_id puts the highest spenders first.", {
        rowsOverride: base(SORTED),
        highlightCols: [1],
        side: sidePanel("Order", ["A is first", "H is last"], "mint"),
      }),
      st(
        [1],
        (row) => (oddBucket(row) ? "kept" : "added"),
        "NTILE(4) cuts the ordered rows into four buckets. Eight rows divide evenly, so each bucket has two rows.",
        {
          rowsOverride: base(SORTED),
          highlightCols: [1],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Bucket sizes", ["2 / 2 / 2 / 2"], "mint")}
              {sidePanel("Cut by", ["Row position", "Not by amount"], "amber")}
            </div>
          ),
        },
      ),
      st(
        [1, 3],
        (row) => (oddBucket(row) ? "kept" : "added"),
        "Bucket numbers start at 1. A and B form bucket 1, the highest spending group. G and H form bucket 4.",
        {
          rowsOverride: SORTED.map((c) => r(c.id, c.id, c.spent, BUCKET[c.id])),
          colsOverride: [...COLS, "spending_bucket"],
          highlightCols: [2],
          noteTone: "mint",
          side: sidePanel("Row count", ["8 rows in", "8 rows out"], "mint"),
        },
      ),
    ],
  },
];
