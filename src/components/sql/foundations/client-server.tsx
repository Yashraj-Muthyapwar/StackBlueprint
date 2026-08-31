import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

export const introSqlClientServer: Stage[] = [
  {
    name: "1. The Connection",
    blurb: "Clients connect over the network to send queries to the Database Server",
    sql: [
      "-- From a terminal client:",
      "psql -h pg.example.com -U ada -d app_db",
      "",
      "-- The server assigns a dedicated session (Process ID):",
      "SELECT pid, usename, client_addr FROM pg_stat_activity;",
    ],
    table: {
      name: "pg_stat_activity (active sessions)",
      cols: ["pid", "usename", "client_addr"],
      rows: [r(1, 101, "ada", "192.168.1.10"), r(2, 102, "linus", "192.168.1.11")],
    },
    steps: [
      st(
        [1],
        "kept",
        "Client provides the Server Address (-h), Username (-U), and Database Name (-d) to connect.",
        { highlightCols: [1] },
      ),
      st(
        [4],
        "kept",
        "The database server handles multiple concurrent connections. Each connected client gets a session (pid).",
        { highlightCols: [0, 1, 2] },
      ),
    ],
  },
  {
    name: "2. Sending a Query",
    blurb: "The client sends SQL text; the server parses it.",
    sql: [
      "-- Ada types this into her terminal:",
      "SELECT * FROM users WHERE id = 1;",
      "",
      "-- Server logs the query execution:",
      "LOG: duration: 2.1ms  statement: SELECT * FROM users WHERE id = 1;",
    ],
    table: {
      name: "users (database storage)",
      cols: ["id", "email", "balance"],
      rows: [r(1, 1, "ada@ex.com", 250), r(2, 2, "linus@ex.com", 90)],
    },
    steps: [
      st([1], "kept", "The client sends raw text (the SQL query) over the network.", {
        highlightCols: [0],
      }),
      st(
        [4],
        "kept",
        "The server receives the text, parses it, checks permissions, and logs the execution.",
        { noteTone: "violet" },
      ),
    ],
  },
  {
    name: "3. Execution & Return",
    blurb: "The server finds the data and streams it back to the client.",
    sql: [
      "-- Server executes:",
      "SELECT id, email, balance FROM users WHERE id = 1;",
      "",
      "-- Results streamed back to client:",
      "  id |   email    | balance ",
      " ----+------------+---------",
      "   1 | ada@ex.com |     250 ",
    ],
    table: {
      name: "users",
      cols: ["id", "email", "balance"],
      rows: [r(1, 1, "ada@ex.com", 250), r(2, 2, "linus@ex.com", 90)],
    },
    steps: [
      st(
        [1],
        pass((r) => r.key === 1),
        "The server engine scans the tables or indexes, filtering out the rows that don't match.",
        { highlightCols: [0, 1, 2] },
      ),
      st(
        [4, 5, 6],
        pass((r) => r.key === 1),
        "The matching row is serialized (turned into bytes) and sent back over the network to Ada's client.",
        { noteTone: "mint", highlightCols: [0, 1, 2] },
      ),
    ],
  },
];
