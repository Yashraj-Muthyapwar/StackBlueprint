import type { Row, Stage, RowState } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-window-order-by-running-total: step through each customer's running total -----
const COLS = ["order_id", "customer_id", "order_date", "amount"];
const TEMPLATE = "minmax(0,1fr) minmax(0,1.5fr) minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.9fr)";

type Order = { id: number; customer: string; date: string; amount: number };

const CUSTOMER_A: Order[] = [
  { id: 101, customer: "A", date: "Jan 1", amount: 100 },
  { id: 102, customer: "A", date: "Jan 3", amount: 200 },
  { id: 105, customer: "A", date: "Jan 6", amount: 50 },
];
const CUSTOMER_B: Order[] = [
  { id: 103, customer: "B", date: "Jan 2", amount: 150 },
  { id: 104, customer: "B", date: "Jan 5", amount: 250 },
];
const ALL_ORDERS: Order[] = [...CUSTOMER_A, ...CUSTOMER_B];

// Every stage shows the same eight SQL lines, so the table below the query
// never moves when the animation changes stage.
const SQL = [
  "SELECT order_id, customer_id,",
  "       order_date, amount,",
  "       SUM(amount) OVER (",
  "         PARTITION BY customer_id",
  "         ORDER BY order_date",
  "       ) AS running_total",
  "FROM   orders",
  "ORDER  BY customer_id, order_date",
];

const base = (orders: Order[]): Row[] => orders.map((o) => r(o.id, o.id, o.customer, o.date, o.amount));

/** Running total of one customer's orders, restarting whenever the customer changes. */
const runningTotals = (orders: Order[]): number[] => {
  const totals: number[] = [];
  orders.forEach((o, i) => {
    const same = i > 0 && orders[i - 1].customer === o.customer;
    totals.push((same ? totals[i - 1] : 0) + o.amount);
  });
  return totals;
};

/** Rows with the running total filled in up to (and including) the current order. */
const upTo = (orders: Order[], current: number): Row[] => {
  const totals = runningTotals(orders);
  return orders.map((o, i) => r(o.id, o.id, o.customer, o.date, o.amount, i <= current ? totals[i] : ""));
};

const stepFor = (orders: Order[], current: number) => {
  const totals = runningTotals(orders);
  const sums = orders.slice(0, current + 1).map((o) => o.amount);
  const o = orders[current];
  return st(
    [2, 3, 4],
    (_row, i) => (i < current ? ("kept" as RowState) : i === current ? ("added" as RowState) : ("pending" as RowState)),
    `For order ${o.id}, the window holds customer ${o.customer}'s orders from the first one through ${o.date}.`,
    {
      rowsOverride: upTo(orders, current),
      colsOverride: [...COLS, "running_total"],
      highlightCols: [3],
      noteTone: "mint",
      side: sidePanel(
        `Current order: ${o.id}`,
        [`Sum of orders through ${o.date}: $${totals[current]}`, `${sums.join(" + ")} = ${totals[current]}`],
        "mint",
      ),
    },
  );
};

const stage = (name: string, blurb: string, orders: Order[], intro: string): Stage => ({
  name,
  blurb,
  sql: SQL,
  table: { name: "orders", cols: COLS, rows: base(orders), columnTemplate: TEMPLATE },
  steps: [
    st([2, 3, 4], "pending" as RowState, intro, { highlightCols: [1] }),
    ...orders.map((_, i) => stepFor(orders, i)),
  ],
});

const combinedTotals = runningTotals(ALL_ORDERS);

export const orderByRunningTotalStages: Stage[] = [
  stage(
    "Customer A",
    "step through the running total",
    CUSTOMER_A,
    "PARTITION BY picks customer A's three orders. ORDER BY order_date puts them in sequence: Jan 1, Jan 3, Jan 6.",
  ),
  stage(
    "Customer B",
    "a new partition starts a new total",
    CUSTOMER_B,
    "Customer B is a separate partition with two orders, so the running total starts again.",
  ),
  {
    name: "Final output",
    blurb: "customers A and B combined",
    sql: SQL,
    table: { name: "orders", cols: COLS, rows: base(ALL_ORDERS), columnTemplate: TEMPLATE },
    steps: [
      st(
        [0, 1, 2, 3, 4, 5, 6, 7],
        "added" as RowState,
        "The query returns all five orders, sorted by customer_id and then order_date. Customer A's total builds to 350, and customer B starts again and reaches 400. Five rows in, five rows out.",
        {
          rowsOverride: ALL_ORDERS.map((o, i) => r(o.id, o.id, o.customer, o.date, o.amount, combinedTotals[i])),
          colsOverride: [...COLS, "running_total"],
          highlightCols: [4],
          noteTone: "mint",
        },
      ),
    ],
  },
];
