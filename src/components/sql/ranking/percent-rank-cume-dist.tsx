import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, sidePanel, st } from "../animation-shared";

// ----- q-ranking-percent-rank-cume-dist: relative rank and cumulative distribution -----
type Student = { id: number; name: string; dept: string; score: number };

const STUDENTS: Student[] = [
  { id: 1, name: "Alice", dept: "Science", score: 50 },
  { id: 2, name: "Bob", dept: "Science", score: 70 },
  { id: 3, name: "Charlie", dept: "Science", score: 70 },
  { id: 4, name: "David", dept: "Arts", score: 90 },
  { id: 5, name: "Emma", dept: "Arts", score: 100 },
];
const byId = (id: number) => STUDENTS.find((s) => s.id === id)!;
const STORED = [4, 2, 5, 1, 3].map(byId);
const SORTED = STUDENTS;

// Whole table as one partition.
const PR: Record<number, string> = { 1: "0.00", 2: "0.25", 3: "0.25", 4: "0.75", 5: "1.00" };
const CD: Record<number, string> = { 1: "0.20", 2: "0.60", 3: "0.60", 4: "0.80", 5: "1.00" };
// Partitioned by department.
const PR_DEPT: Record<number, string> = { 1: "0.00", 2: "0.50", 3: "0.50", 4: "0.00", 5: "1.00" };
const CD_DEPT: Record<number, string> = { 1: "0.33", 2: "1.00", 3: "1.00", 4: "0.50", 5: "1.00" };

const isTie = (row: Row) => row.cells[1] === 70;
const isScience = (row: Row) => row.cells[1] === "Science";

const SQL_ALL = [
  "SELECT student_name, score,",
  "       PERCENT_RANK() OVER (",
  "         ORDER BY score ASC",
  "       ) AS percent_rank,",
  "       CUME_DIST() OVER (",
  "         ORDER BY score ASC",
  "       ) AS cumulative_distribution",
  "FROM   exam_scores",
  "ORDER  BY score ASC, student_id",
];

const SQL_DEPT = [
  "SELECT student_name, department, score,",
  "       PERCENT_RANK() OVER (",
  "         PARTITION BY department",
  "         ORDER BY score ASC",
  "       ) AS percent_rank,",
  "       CUME_DIST() OVER (",
  "         PARTITION BY department",
  "         ORDER BY score ASC",
  "       ) AS cumulative_distribution",
  "FROM   exam_scores",
  "ORDER  BY department, score ASC, student_id",
];

const allRows = (list: Student[], ...extra: Record<number, string>[]): Row[] =>
  list.map((s) => r(s.id, s.name, s.score, ...extra.map((e) => e[s.id])));
const deptRows = (list: Student[], ...extra: Record<number, string>[]): Row[] =>
  list.map((s) => r(s.id, s.name, s.dept, s.score, ...extra.map((e) => e[s.id])));

export const percentRankCumeDistStages: Stage[] = [
  {
    name: "One partition for all students",
    blurb: "order, relative rank, then cumulative distribution",
    sql: SQL_ALL,
    table: {
      name: "exam_scores",
      cols: ["student_name", "score"],
      rows: allRows(STORED),
      columnTemplate: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,1.5fr) minmax(0,2.2fr)",
    },
    steps: [
      st([7], "pending", "FROM exam_scores provides five students. Bob and Charlie have the same score.", {
        highlightCols: [1],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Source", ["Table: exam_scores"], "neutral")}
            {sidePanel("Rows", ["5 students"], "neutral")}
          </div>
        ),
      }),
      st(
        [2, 5],
        (row) => (isTie(row) ? "added" : "kept"),
        "The window orders students by score, lowest first. Bob and Charlie have equal scores, so they form one peer group.",
        {
          rowsOverride: allRows(SORTED),
          highlightCols: [1],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Peer group", ["Bob and Charlie", "score 70"], "amber")}
              {sidePanel("N", ["5 rows in the partition"], "mint")}
            </div>
          ),
        },
      ),
      st(
        [1, 2, 3],
        (row) => (isTie(row) ? "added" : "kept"),
        "PERCENT_RANK() = (RANK - 1) / (N - 1). Bob and Charlie share rank 2, so both get (2 - 1) / (5 - 1) = 0.25.",
        {
          rowsOverride: allRows(SORTED, PR),
          colsOverride: ["student_name", "score", "percent_rank"],
          highlightCols: [2],
          side: sidePanel("PERCENT_RANK()", ["0, 0.25, 0.25, 0.75, 1", "First row is always 0"], "amber"),
        },
      ),
      st(
        [4, 5, 6],
        (row) => (isTie(row) ? "added" : "kept"),
        "CUME_DIST() = rows up to and including the peer group / N. Bob and Charlie both get 3 / 5 = 0.60.",
        {
          rowsOverride: allRows(SORTED, PR, CD),
          colsOverride: ["student_name", "score", "percent_rank", "cumulative_distribution"],
          highlightCols: [3],
          noteTone: "mint",
          side: sidePanel("CUME_DIST()", ["0.2, 0.6, 0.6, 0.8, 1", "5 rows in, 5 rows out"], "mint"),
        },
      ),
    ],
  },
  {
    name: "Add PARTITION BY department",
    blurb: "separate relative ranks for each department",
    sql: SQL_DEPT,
    table: {
      name: "exam_scores",
      cols: ["student_name", "department", "score"],
      rows: deptRows(STORED),
      columnTemplate: "minmax(0,1.4fr) minmax(0,1.2fr) minmax(0,0.9fr) minmax(0,1.3fr) minmax(0,1.8fr)",
    },
    steps: [
      st([9], "pending", "FROM exam_scores provides five students. Each student now has a department.", {
        highlightCols: [1],
        side: (
          <div className="grid grid-cols-2 gap-2">
            {sidePanel("Source", ["Table: exam_scores"], "neutral")}
            {sidePanel("Rows", ["5 students"], "neutral")}
          </div>
        ),
      }),
      st(
        [2, 3, 6, 7],
        (row) => (isScience(row) ? "kept" : "added"),
        "PARTITION BY department makes two partitions. Science has 3 students and Arts has 2. Each partition is ordered by score on its own.",
        {
          rowsOverride: deptRows([byId(4), byId(5), byId(1), byId(2), byId(3)]),
          highlightCols: [1],
          side: (
            <div className="grid grid-cols-2 gap-2">
              {sidePanel("Arts", ["N = 2", "David, Emma"], "amber")}
              {sidePanel("Science", ["N = 3", "Alice, Bob, Charlie"], "mint")}
            </div>
          ),
        },
      ),
      st(
        [1, 2, 3, 4],
        (row) => (isScience(row) ? "kept" : "added"),
        "PERCENT_RANK() restarts in each department. Science: (1 - 1) / (3 - 1) = 0 for Alice, and (2 - 1) / (3 - 1) = 0.50 for Bob and Charlie. Arts: 0 and 1.",
        {
          rowsOverride: deptRows([byId(4), byId(5), byId(1), byId(2), byId(3)], PR_DEPT),
          colsOverride: ["student_name", "department", "score", "percent_rank"],
          highlightCols: [3],
          side: sidePanel("PERCENT_RANK()", ["N - 1 uses the partition size", "Arts: 0, 1", "Science: 0, 0.5, 0.5"], "amber"),
        },
      ),
      st(
        [5, 6, 7, 8],
        (row) => (isScience(row) ? "kept" : "added"),
        "CUME_DIST() also restarts in each department. Science: 1 / 3 = 0.33 for Alice, and 3 / 3 = 1.00 for Bob and Charlie. Arts: 0.50 and 1.00.",
        {
          rowsOverride: deptRows([byId(4), byId(5), byId(1), byId(2), byId(3)], PR_DEPT, CD_DEPT),
          colsOverride: ["student_name", "department", "score", "percent_rank", "cumulative_distribution"],
          highlightCols: [4],
          noteTone: "mint",
          side: sidePanel("Row count", ["5 rows in", "5 rows out"], "mint"),
        },
      ),
    ],
  },
];
