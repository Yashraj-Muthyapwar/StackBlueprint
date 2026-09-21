import { readFile } from "node:fs/promises";
import { banner, mb, parseCsv, writeRawCsv } from "./lib.mjs";

/**
 * The supplied 48-hour CSV slice from Kaggle's eCommerce Events History in
 * Cosmetics Shop dataset. This builder validates the expected shape and time
 * bounds, then stores the exact source bytes as the table payload.
 */
const SOURCE_NAME = "2020-Jan_48h.csv";
const EXPECTED_COLUMNS = [
  "timestamp",
  "event_time",
  "event_type",
  "product_id",
  "category_id",
  "category_code",
  "brand",
  "price",
  "user_id",
  "user_session",
];
const START = "2020-01-01 00:00:00+00:00";
const END = "2020-01-03 00:00:00+00:00";

const COLUMNS = [
  ["timestamp", "TIMESTAMPTZ", true],
  ["event_time", "VARCHAR(32)", true],
  ["event_type", "VARCHAR(32)", true],
  ["product_id", "INTEGER", true],
  ["category_id", "BIGINT", true],
  ["category_code", "TEXT"],
  ["brand", "TEXT"],
  ["price", "DECIMAL(12,2)", true],
  ["user_id", "BIGINT", true],
  // The supplied CSV includes blank session IDs. Preserve those as SQL NULLs
  // rather than rejecting otherwise original event rows during bulk loading.
  ["user_session", "VARCHAR(36)"],
];

export async function buildCosmetics48h({ sourceFile } = {}) {
  if (!sourceFile) {
    throw new Error("Cosmetics 48h requires --cosmetics-source=/path/to/2020-Jan_48h.csv");
  }

  banner("Cosmetics Shop events (48-hour supplied slice)");
  const bytes = await readFile(sourceFile);
  const parsed = parseCsv(bytes.toString("utf8"));
  const header = parsed[0] ?? [];
  if (
    header.length !== EXPECTED_COLUMNS.length ||
    header.some((value, i) => value !== EXPECTED_COLUMNS[i])
  ) {
    throw new Error(`cosmetics_48h: ${SOURCE_NAME} has unexpected columns`);
  }

  const rows = parsed.slice(1).filter((row) => row.length >= header.length);
  if (rows.length === 0) throw new Error("cosmetics_48h: source has no event rows");
  const timestamps = rows.map((row) => row[0]);
  const earliest = timestamps.reduce((min, value) => (value < min ? value : min));
  const latest = timestamps.reduce((max, value) => (value > max ? value : max));
  if (earliest !== START || latest !== END) {
    throw new Error(
      `cosmetics_48h: expected ${START} through ${END}; found ${earliest} through ${latest}`,
    );
  }

  const stats = await writeRawCsv("cosmetics_48h", SOURCE_NAME, bytes, rows.length);
  console.log(`  1 table · ${rows.length.toLocaleString()} rows · ${mb(stats.bytes)} gzipped`);

  return {
    id: "cosmetics_48h",
    schemas: [],
    tables: [
      {
        schema: "public",
        name: "events",
        file: `${SOURCE_NAME}.gz`,
        rows: stats.rows,
        bytes: stats.bytes,
        primaryKey: [],
        columns: COLUMNS.map(([name, type, notNull]) => ({ name, type, notNull })),
      },
    ],
    foreignKeys: [],
    bytes: stats.bytes,
  };
}
