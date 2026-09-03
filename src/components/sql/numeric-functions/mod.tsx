import type { Row, Stage } from "@/components/lesson/MultiStage";
import { r, st } from "../animation-shared";

const ID_ROWS: Row[] = [
  r(1, "1", "Trailhead 29 Hardtail"),
  r(2, "2", "Trailhead 29 Carbon"),
  r(3, "3", "Boulder Full Suspension"),
  r(4, "4", "Switchback Enduro"),
  r(5, "5", "Meridian Road Alloy"),
  r(6, "6", "Meridian Road Carbon"),
];
const PARITY_ROWS: Row[] = [
  r(1, "1", "Trailhead 29 Hardtail", "1"),
  r(2, "2", "Trailhead 29 Carbon", "0"),
  r(3, "3", "Boulder Full Suspension", "1"),
  r(4, "4", "Switchback Enduro", "0"),
  r(5, "5", "Meridian Road Alloy", "1"),
  r(6, "6", "Meridian Road Carbon", "0"),
];
const WAVE_ROWS: Row[] = [
  r(1, "1", "Trailhead 29 Hardtail", "1"),
  r(2, "2", "Trailhead 29 Carbon", "2"),
  r(3, "3", "Boulder Full Suspension", "0"),
  r(4, "4", "Switchback Enduro", "1"),
  r(5, "5", "Meridian Road Alloy", "2"),
  r(6, "6", "Meridian Road Carbon", "0"),
];

export const modRemainderStages: Stage[] = [
  {
    name: "% tests product ID parity",
    canvasMinHeight: 440,
    sql: [
      "SELECT id, name,",
      "       id % 2 AS parity_remainder",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  6",
    ],
    table: { name: "products", cols: ["id", "name"], rows: ID_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "Product IDs are consecutive real Cycle Depot values. Dividing by 2 leaves either 0 or 1.",
      ),
      st(
        [1],
        "kept",
        "A remainder of 0 means even. A remainder of 1 means odd, so % 2 is a compact parity test.",
        {
          rowsOverride: PARITY_ROWS,
          colsOverride: ["id", "name", "parity_remainder"],
          highlightCols: [2],
        },
      ),
    ],
  },
  {
    name: "MOD cycles products through three waves",
    canvasMinHeight: 440,
    sql: [
      "SELECT id, name,",
      "       MOD(id, 3) AS pickup_wave",
      "FROM   products",
      "ORDER  BY id",
      "LIMIT  6",
    ],
    table: { name: "products", cols: ["id", "name"], rows: ID_ROWS },
    steps: [
      st(
        [0, 2, 3, 4],
        "kept",
        "MOD(dividend, divisor) returns the remainder after division. With 3, only 0, 1, and 2 are possible.",
      ),
      st(
        [1],
        "kept",
        "The remainders repeat 1, 2, 0, creating three predictable pickup-wave labels without storing another column.",
        {
          rowsOverride: WAVE_ROWS,
          colsOverride: ["id", "name", "pickup_wave"],
          highlightCols: [2],
        },
      ),
    ],
  },
];
