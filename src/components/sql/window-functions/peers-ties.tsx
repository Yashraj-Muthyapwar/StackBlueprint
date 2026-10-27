import type { Row, Stage, RowState } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-window-peers-ties: tied dates are peers under the default RANGE frame -----
const COLS = ["sale_id", "sale_date", "amount"];
const TEMPLATE = "minmax(0,1fr) minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.9fr)";

type Sale = { id: number; date: string; amount: number };
const SALES: Sale[] = [
  { id: 1, date: "2026-02-01", amount: 100 },
  { id: 2, date: "2026-02-01", amount: 200 },
  { id: 3, date: "2026-02-02", amount: 50 },
];

// Both stages show eight SQL lines so the table below the query never moves.
const DEFAULT_FRAME_SQL = [
  "SELECT sale_id, sale_date, amount,",
  "       SUM(amount) OVER (",
  "         PARTITION BY employee_id",
  "         ORDER BY sale_date",
  "         -- default frame (RANGE):",
  "         -- through the peer group",
  "       ) AS running_total",
  "FROM   sales",
];
const ROWS_FRAME_SQL = [
  "SELECT sale_id, sale_date, amount,",
  "       SUM(amount) OVER (",
  "         PARTITION BY employee_id",
  "         ORDER BY sale_date, sale_id",
  "         ROWS BETWEEN UNBOUNDED",
  "           PRECEDING AND CURRENT ROW",
  "       ) AS running_total",
  "FROM   sales",
];

const base = (): Row[] => SALES.map((s) => r(s.id, s.id, s.date, s.amount));

/** Rows with running totals filled in for the rows the animation has reached. */
const withTotals = (totals: (number | "")[]): Row[] =>
  SALES.map((s, i) => r(s.id, s.id, s.date, s.amount, totals[i]));

const sum = (amounts: number[]) => amounts.reduce((a, b) => a + b, 0);

type StepSpec = {
  current: number;
  /** Indexes of the rows inside the frame of the current row. */
  frame: number[];
  totals: (number | "")[];
  note: string;
  frameText: string;
};

const stepFor = (spec: StepSpec) => {
  const total = sum(spec.frame.map((i) => SALES[i].amount));
  const expression = `${spec.frame.map((i) => SALES[i].amount).join(" + ")} = ${total}`;
  return st(
    [1, 2, 3],
    (_row, i) =>
      i === spec.current ? ("added" as RowState) : spec.frame.includes(i) ? ("kept" as RowState) : ("pending" as RowState),
    spec.note,
    {
      rowsOverride: withTotals(spec.totals),
      colsOverride: [...COLS, "running_total"],
      highlightCols: [1],
      noteTone: "mint",
      side: sidePanel(`Current row: sale ${SALES[spec.current].id}`, [spec.frameText, expression], "mint"),
    },
  );
};

export const peersTiesStages: Stage[] = [
  {
    name: "Default frame",
    blurb: "tied rows are peers and share a total",
    sql: DEFAULT_FRAME_SQL,
    table: { name: "sales", cols: COLS, rows: base(), columnTemplate: TEMPLATE },
    steps: [
      st(
        [3],
        "pending" as RowState,
        "Sales 1 and 2 have the same sale_date, so they tie on the window ORDER BY. They are peers.",
        { highlightCols: [1] },
      ),
      stepFor({
        current: 0,
        frame: [0, 1],
        totals: [300, "", ""],
        note: "For sale 1, the default RANGE frame runs through the current row's whole peer group, so it also includes sale 2.",
        frameText: "Frame: sale 1 and its peer, sale 2",
      }),
      stepFor({
        current: 1,
        frame: [0, 1],
        totals: [300, 300, ""],
        note: "Sale 2 has the same peer group, so it gets the same total. Both February 1 rows receive 300.",
        frameText: "Frame: the same peer group",
      }),
      stepFor({
        current: 2,
        frame: [0, 1, 2],
        totals: [300, 300, 350],
        note: "Sale 3 is alone on February 2, and its frame holds all three sales. It receives 350.",
        frameText: "Frame: all three sales",
      }),
    ],
  },
  {
    name: "ROWS frame with a tie-breaker",
    blurb: "strict row-by-row accumulation",
    sql: ROWS_FRAME_SQL,
    table: { name: "sales", cols: COLS, rows: base(), columnTemplate: TEMPLATE },
    steps: [
      st(
        [3, 4, 5],
        "pending" as RowState,
        "Adding sale_id as a tie-breaker gives every row a unique place in the order. The ROWS frame then counts physical rows, not peers.",
        { highlightCols: [0] },
      ),
      stepFor({
        current: 0,
        frame: [0],
        totals: [100, "", ""],
        note: "Sale 1 comes first, so its frame holds only itself.",
        frameText: "Frame: sale 1",
      }),
      stepFor({
        current: 1,
        frame: [0, 1],
        totals: [100, 300, ""],
        note: "Sale 2 follows. Its frame holds sale 1 and sale 2, so the two February 1 rows no longer share a total.",
        frameText: "Frame: sales 1 and 2",
      }),
      stepFor({
        current: 2,
        frame: [0, 1, 2],
        totals: [100, 300, 350],
        note: "Sale 3 adds 50 to the previous total. The result is now a true row-by-row running total: 100, 300, 350.",
        frameText: "Frame: sales 1, 2 and 3",
      }),
    ],
  },
];
