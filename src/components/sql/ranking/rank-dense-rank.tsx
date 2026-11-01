import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-ranking-rank-dense-rank: RANK() and DENSE_RANK() beside ROW_NUMBER() -----
const COLS = ["employee_name", "salary"];
const TEMPLATE = "minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.2fr) minmax(0,1.2fr) minmax(0,1.5fr)";

type Person = { id: number; name: string; salary: number };

const STORED: Person[] = [
  { id: 4, name: "David", salary: 6000 },
  { id: 2, name: "Bob", salary: 8000 },
  { id: 5, name: "Emma", salary: 5000 },
  { id: 1, name: "Alice", salary: 9000 },
  { id: 3, name: "Charlie", salary: 8000 },
];
const SORTED: Person[] = [STORED[3], STORED[1], STORED[4], STORED[0], STORED[2]];
const ROW_NUM: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
const RANK: Record<number, number> = { 1: 1, 2: 2, 3: 2, 4: 4, 5: 5 };
const DENSE: Record<number, number> = { 1: 1, 2: 2, 3: 2, 4: 3, 5: 4 };

// Every step shows the same ten SQL lines, so the table below the query never moves.
const SQL = [
  "SELECT employee_name, salary,",
  "       ROW_NUMBER() OVER (",
  "         ORDER BY salary DESC, employee_id",
  "       ) AS row_num,",
  "       RANK() OVER (ORDER BY salary DESC) AS salary_rank,",
  "       DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank",
  "FROM   employees",
  "ORDER  BY salary DESC, employee_id",
];

const cells = (p: Person) => [p.name, p.salary];
const base = (people: Person[]): Row[] => people.map((p) => r(p.id, ...cells(p)));
const isTie = (row: Row) => row.cells[1] === 8000;

export const rankDenseRankStages: Stage[] = [
  {
    name: "Rank employees by salary",
    blurb: "order, find ties, then rank",
    sql: SQL,
    table: { name: "employees", cols: COLS, rows: base(STORED), columnTemplate: TEMPLATE },
    steps: [
      st([6], "pending", "FROM employees provides five rows. Bob and Charlie both earn 8000.", {
        highlightCols: [1],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Source", ["Table: employees"], "neutral")}
            {sidePanel("Rows", ["5 employees"], "neutral")}
          </div>
        ),
      }),
      st(
        [4, 5],
        (row) => (isTie(row) ? "added" : "kept"),
        "The window orders rows by salary, highest first. Bob and Charlie have equal salary values, so they form one peer group.",
        {
          rowsOverride: base(SORTED),
          highlightCols: [1],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Peer group", ["Bob and Charlie", "salary 8000"], "amber")}
              {sidePanel("Other rows", ["Each one alone"], "mint")}
            </div>
          ),
        },
      ),
      st(
        [4],
        (row) => (isTie(row) ? "added" : "kept"),
        "RANK() gives the peer group the position of its first row, which is 2. David is the fourth row, so he gets 4.",
        {
          rowsOverride: SORTED.map((p) => r(p.id, ...cells(p), RANK[p.id])),
          colsOverride: [...COLS, "salary_rank"],
          highlightCols: [2],
          side: sidePanel("RANK()", ["1, 2, 2, 4, 5", "A gap follows the tie"], "amber"),
        },
      ),
      st(
        [5],
        (row) => (isTie(row) ? "added" : "kept"),
        "DENSE_RANK() counts distinct salary levels, so David gets 3. No rank is skipped.",
        {
          rowsOverride: SORTED.map((p) => r(p.id, ...cells(p), RANK[p.id], DENSE[p.id])),
          colsOverride: [...COLS, "salary_rank", "dense_rank"],
          highlightCols: [3],
          side: sidePanel("DENSE_RANK()", ["1, 2, 2, 3, 4", "No gap after the tie"], "mint"),
        },
      ),
      st(
        [1, 2, 3],
        (row) => (isTie(row) ? "added" : "kept"),
        "ROW_NUMBER() has the unique employee_id tie-breaker, so Bob and Charlie get 2 and 3. All five rows stay.",
        {
          rowsOverride: SORTED.map((p) => r(p.id, ...cells(p), RANK[p.id], DENSE[p.id], ROW_NUM[p.id])),
          colsOverride: [...COLS, "salary_rank", "dense_rank", "row_num"],
          highlightCols: [4],
          noteTone: "mint",
          side: sidePanel("Row count", ["5 rows in", "5 rows out"], "mint"),
        },
      ),
    ],
  },
];
