import type { Row, Stage, RowState } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-window-default-frames-peers: default RANGE frame vs an explicit ROWS frame -----
const COLS = ["txn_id", "txn_date", "amount"];
const TEMPLATE = "minmax(0,1fr) minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.9fr)";

type Txn = { id: number; date: string; amount: number };
const TXNS: Txn[] = [
  { id: 1, date: "Jan 1", amount: 100 },
  { id: 2, date: "Jan 2", amount: 200 },
  { id: 3, date: "Jan 2", amount: 50 },
  { id: 4, date: "Jan 3", amount: 150 },
];

// Both stages show eight SQL lines so the table below the query never moves.
const DEFAULT_SQL = [
  "SELECT txn_id, txn_date, amount,",
  "       SUM(amount) OVER (",
  "         ORDER BY txn_date",
  "         -- default frame (RANGE):",
  "         -- through the peer group",
  "       ) AS running_total",
  "FROM   transactions",
  "ORDER  BY txn_date, txn_id",
];
const ROWS_SQL = [
  "SELECT txn_id, txn_date, amount,",
  "       SUM(amount) OVER (",
  "         ORDER BY txn_date, txn_id",
  "         ROWS BETWEEN UNBOUNDED",
  "           PRECEDING AND CURRENT ROW",
  "       ) AS running_total",
  "FROM   transactions",
  "ORDER  BY txn_date, txn_id",
];

const base = (): Row[] => TXNS.map((t) => r(t.id, t.id, t.date, t.amount));
const withTotals = (totals: (number | "")[]): Row[] => TXNS.map((t, i) => r(t.id, t.id, t.date, t.amount, totals[i]));
const sum = (indexes: number[]) => indexes.reduce((acc, i) => acc + TXNS[i].amount, 0);

type StepSpec = { current: number; frame: number[]; totals: (number | "")[]; note: string; frameText: string };

const stepFor = (spec: StepSpec) => {
  const expression = `${spec.frame.map((i) => TXNS[i].amount).join(" + ")} = ${sum(spec.frame)}`;
  return st(
    [1, 2],
    (_row, i) =>
      i === spec.current ? ("added" as RowState) : spec.frame.includes(i) ? ("kept" as RowState) : ("pending" as RowState),
    spec.note,
    {
      rowsOverride: withTotals(spec.totals),
      colsOverride: [...COLS, "running_total"],
      highlightCols: [1],
      noteTone: "mint",
      side: sidePanel(`Current row: txn ${TXNS[spec.current].id}`, [spec.frameText, expression], "mint"),
    },
  );
};

export const defaultFramesPeersStages: Stage[] = [
  {
    name: "Default frame",
    blurb: "peers are included together",
    sql: DEFAULT_SQL,
    table: { name: "transactions", cols: COLS, rows: base(), columnTemplate: TEMPLATE },
    steps: [
      st(
        [2],
        "pending" as RowState,
        "Transactions 2 and 3 have the same txn_date, so they tie on the window ORDER BY. They are peers.",
        { highlightCols: [1] },
      ),
      stepFor({
        current: 0,
        frame: [0],
        totals: [100, "", "", ""],
        note: "Transaction 1 is alone on Jan 1, so its frame holds only itself.",
        frameText: "Frame: txn 1",
      }),
      stepFor({
        current: 1,
        frame: [0, 1, 2],
        totals: [100, 350, "", ""],
        note: "The default RANGE frame ends at the last peer of the current row, so it includes transaction 3 as well.",
        frameText: "Frame: txn 1, 2 and its peer 3",
      }),
      stepFor({
        current: 2,
        frame: [0, 1, 2],
        totals: [100, 350, 350, ""],
        note: "Transaction 3 has the same peer group, so it gets the same total. Both Jan 2 transactions receive 350.",
        frameText: "Frame: the same peer group",
      }),
      stepFor({
        current: 3,
        frame: [0, 1, 2, 3],
        totals: [100, 350, 350, 500],
        note: "Transaction 4 is alone on Jan 3, and its frame holds all four transactions. It receives 500.",
        frameText: "Frame: all four transactions",
      }),
    ],
  },
  {
    name: "Explicit ROWS frame",
    blurb: "one row at a time",
    sql: ROWS_SQL,
    table: { name: "transactions", cols: COLS, rows: base(), columnTemplate: TEMPLATE },
    steps: [
      st(
        [2, 3, 4],
        "pending" as RowState,
        "Adding txn_id as a tie-breaker gives every row a unique place in the order. The ROWS frame then counts physical rows, not peers.",
        { highlightCols: [0] },
      ),
      stepFor({
        current: 0,
        frame: [0],
        totals: [100, "", "", ""],
        note: "Transaction 1 comes first, so its frame holds only itself.",
        frameText: "Frame: txn 1",
      }),
      stepFor({
        current: 1,
        frame: [0, 1],
        totals: [100, 300, "", ""],
        note: "Transaction 2 stops at itself. Transaction 3 is not in its frame any more, so the total is 300.",
        frameText: "Frame: txn 1 and 2",
      }),
      stepFor({
        current: 2,
        frame: [0, 1, 2],
        totals: [100, 300, 350, ""],
        note: "Transaction 3 adds its own 50 to the previous total. The two Jan 2 rows no longer share a result.",
        frameText: "Frame: txn 1, 2 and 3",
      }),
      stepFor({
        current: 3,
        frame: [0, 1, 2, 3],
        totals: [100, 300, 350, 500],
        note: "The running total advances one row at a time: 100, 300, 350, 500.",
        frameText: "Frame: all four transactions",
      }),
    ],
  },
];
