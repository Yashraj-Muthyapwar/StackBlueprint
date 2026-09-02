import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const EMAIL_ROWS: Row[] = [
  r(1, "zane.novak1@example.com"),
  r(2, "boris.alvarez2@example.com"),
  r(3, "priya.doyle3@example.com"),
  r(4, "ugo.mensah4@example.com"),
];

const POSITION_ROWS: Row[] = [
  r(1, "zane.novak1@example.com", 12),
  r(2, "boris.alvarez2@example.com", 15),
  r(3, "priya.doyle3@example.com", 13),
  r(4, "ugo.mensah4@example.com", 12),
];

const PART_ROWS: Row[] = [
  r(1, "zane.novak1", "example.com"),
  r(2, "boris.alvarez2", "example.com"),
  r(3, "priya.doyle3", "example.com"),
  r(4, "ugo.mensah4", "example.com"),
];

/** A lesson-scoped walkthrough of locating and splitting a known email delimiter. */
export const positionSplitPartStages: Stage[] = [
  {
    name: "POSITION locates the delimiter",
    canvasMinHeight: 420,
    sql: [
      "SELECT email,",
      "       POSITION('@' IN email) AS at_position",
      "FROM   customers",
      "ORDER  BY id",
      "LIMIT  4",
    ],
    table: { name: "customers", cols: ["email"], rows: EMAIL_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "Each Cycle Depot email contains one @ delimiter. This query keeps four real customer emails in a predictable id order.",
      ),
      st(
        [1],
        "kept",
        "POSITION counts from 1. In zane.novak1@example.com, eleven characters come before @, so its position is 12.",
        {
          rowsOverride: POSITION_ROWS,
          colsOverride: ["email", "at_position"],
          highlightCols: [1],
        },
      ),
    ],
  },
  {
    name: "SPLIT_PART returns each side",
    canvasMinHeight: 420,
    sql: [
      "SELECT SPLIT_PART(email, '@', 1) AS email_local,",
      "       SPLIT_PART(email, '@', 2) AS email_domain",
      "FROM   customers",
      "ORDER  BY id",
      "LIMIT  4",
    ],
    table: { name: "customers", cols: ["email"], rows: EMAIL_ROWS },
    steps: [
      st(
        [2, 3, 4],
        "kept",
        "The same source emails remain intact. SPLIT_PART reads the delimiter and a part number instead of a fixed character count.",
      ),
      st(
        [0, 1],
        "kept",
        "Part 1 is the text before @. Part 2 is the text after it, giving each customer a local email name and a domain.",
        {
          rowsOverride: PART_ROWS,
          colsOverride: ["email_local", "email_domain"],
          highlightCols: [0, 1],
        },
      ),
    ],
  },
];
