import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const NAME_ROWS: Row[] = [r(1, "Zane Novak"), r(2, "Boris Alvarez"), r(3, "Priya Doyle")];

const LEFT_RESULT_ROWS: Row[] = [
  r(1, "Zane Novak", "Zan", 10),
  r(2, "Boris Alvarez", "Bor", 13),
  r(3, "Priya Doyle", "Pri", 11),
];

const CHARACTER_COUNT_ROWS: Row[] = [
  r(1, "Zane Novak", 10, 10),
  r(2, "Boris Alvarez", 13, 13),
  r(3, "Priya Doyle", 11, 11),
];

const EMAIL_ROWS: Row[] = [
  r(1, "zane.novak1@example.com"),
  r(2, "boris.alvarez2@example.com"),
  r(3, "priya.doyle3@example.com"),
];

const RIGHT_RESULT_ROWS: Row[] = [
  r(1, "zane.novak1@example.com", "example.com"),
  r(2, "boris.alvarez2@example.com", "example.com"),
  r(3, "priya.doyle3@example.com", "example.com"),
];

/** A lesson-scoped walkthrough of fixed text slices and character counts. */
export const leftRightLengthStages: Stage[] = [
  {
    name: "LEFT and LENGTH inspect a name",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       LEFT(name, 3) AS name_code,",
      "       LENGTH(name) AS name_characters",
      "FROM   customers",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "customers", cols: ["name"], rows: NAME_ROWS },
    steps: [
      st(
        [0, 3, 4, 5],
        "kept",
        "Each row begins with the complete stored customer name. No text is removed from the table.",
      ),
      st(
        [1, 2],
        "kept",
        "LEFT takes the first three characters. LENGTH counts every character in the full name, including the space between first and last name.",
        {
          rowsOverride: LEFT_RESULT_ROWS,
          colsOverride: ["name", "name_code", "name_characters"],
          highlightCols: [1, 2],
        },
      ),
    ],
  },
  {
    name: "CHAR_LENGTH makes the unit explicit",
    canvasMinHeight: 420,
    sql: [
      "SELECT name,",
      "       LENGTH(name) AS length_count,",
      "       CHAR_LENGTH(name) AS character_count",
      "FROM   customers",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "customers", cols: ["name"], rows: NAME_ROWS },
    steps: [
      st(
        [0, 3, 4, 5],
        "kept",
        "Both expressions examine the same complete customer name. The space between first and last name is a character too.",
      ),
      st(
        [1, 2],
        "kept",
        "For text, LENGTH and CHAR_LENGTH return the same character count. CHAR_LENGTH is useful when you want the unit to be obvious in a portable query.",
        {
          rowsOverride: CHARACTER_COUNT_ROWS,
          colsOverride: ["name", "length_count", "character_count"],
          highlightCols: [1, 2],
        },
      ),
    ],
  },
  {
    name: "RIGHT reads a known suffix",
    canvasMinHeight: 420,
    sql: [
      "SELECT email,",
      "       RIGHT(email, 11) AS email_domain",
      "FROM   customers",
      "ORDER  BY id",
      "LIMIT  3",
    ],
    table: { name: "customers", cols: ["email"], rows: EMAIL_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "The email is still one complete string. RIGHT will read a fixed number of characters from its ending.",
      ),
      st(
        [1],
        "kept",
        "example.com is 11 characters long, so RIGHT(email, 11) copies that suffix into a new result column for every current practice email.",
        {
          rowsOverride: RIGHT_RESULT_ROWS,
          colsOverride: ["email", "email_domain"],
          highlightCols: [1],
        },
      ),
    ],
  },
];
