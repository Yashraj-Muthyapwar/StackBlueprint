import type { Row, Stage, RowState } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-ranking-row-number: number each customer's orders -----
const COLS = ["order_id", "customer_id", "order_date", "amount"];
const TEMPLATE = "minmax(0,1fr) minmax(0,1.5fr) minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.9fr)";

type Order = { id: number; customer: string; date: string; amount: number };

// Table order as stored, then the order the result displays.
const STORED: Order[] = [
  { id: 101, customer: "A", date: "Jan 1", amount: 100 },
  { id: 102, customer: "A", date: "Jan 3", amount: 250 },
  { id: 103, customer: "B", date: "Jan 2", amount: 150 },
  { id: 104, customer: "B", date: "Jan 5", amount: 300 },
  { id: 105, customer: "A", date: "Jan 6", amount: 200 },
];
const SORTED: Order[] = [STORED[0], STORED[1], STORED[4], STORED[2], STORED[3]];
const SEQUENCE: Record<number, number> = { 101: 1, 102: 2, 105: 3, 103: 1, 104: 2 };

// Every stage shows the same eight SQL lines, so the table below the query never moves.
const SQL = [
  "SELECT order_id, customer_id,",
  "       order_date, amount,",
  "       ROW_NUMBER() OVER (",
  "         PARTITION BY customer_id",
  "         ORDER BY order_date, order_id",
  "       ) AS order_sequence",
  "FROM   orders",
  "ORDER  BY customer_id, order_date",
];

const base = (orders: Order[]): Row[] => orders.map((o) => r(o.id, o.id, o.customer, o.date, o.amount));
const isA = (row: Row) => row.cells[1] === "A";

export const rowNumberStages: Stage[] = [
  {
    name: "Number each customer's orders",
    blurb: "partition, order, then number",
    sql: SQL,
    table: { name: "orders", cols: COLS, rows: base(STORED), columnTemplate: TEMPLATE },
    steps: [
      st([6], "pending" as RowState, "FROM orders provides five rows. Customer A has three orders and customer B has two.", {
        highlightCols: [1],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Source", ["Table: orders"], "neutral")}
            {sidePanel("Rows", ["5 orders"], "neutral")}
          </div>
        ),
      }),
      st(
        [3],
        (row) => (isA(row) ? ("kept" as RowState) : ("added" as RowState)),
        "PARTITION BY customer_id divides the rows into two partitions. Customer A has three orders and customer B has two.",
        {
          highlightCols: [1],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Partition A", ["Orders 101, 102, 105"], "mint")}
              {sidePanel("Partition B", ["Orders 103, 104"], "amber")}
            </div>
          ),
        },
      ),
      st(
        [4],
        (row) => (isA(row) ? ("kept" as RowState) : ("added" as RowState)),
        "ORDER BY order_date, order_id puts each partition in sequence. Customer A: Jan 1, Jan 3, Jan 6. Customer B: Jan 2, Jan 5.",
        {
          rowsOverride: base(SORTED),
          highlightCols: [2],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Partition A", ["101, 102, 105"], "mint")}
              {sidePanel("Partition B", ["103, 104"], "amber")}
            </div>
          ),
        },
      ),
      st(
        [2, 5],
        (row) => (isA(row) ? ("kept" as RowState) : ("added" as RowState)),
        "ROW_NUMBER() gives 1, 2, 3 to customer A and restarts at 1 for customer B. No row is removed.",
        {
          rowsOverride: SORTED.map((o) => r(o.id, o.id, o.customer, o.date, o.amount, SEQUENCE[o.id])),
          colsOverride: [...COLS, "order_sequence"],
          highlightCols: [4],
          noteTone: "mint",
          side: sidePanel("Row count", ["5 rows in", "5 rows out"], "mint"),
        },
      ),
    ],
  },
];
