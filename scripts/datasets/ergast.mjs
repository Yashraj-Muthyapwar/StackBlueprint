import path from "node:path";
import { readFile } from "node:fs/promises";
import { banner, mb, parseCsv, writeTable } from "./lib.mjs";

/**
 * Formula 1 results archive supplied with this project. The source tables use
 * camelCase column names and a handful of compressed table names; the lab uses
 * lower snake_case identifiers so every query works unquoted in PostgreSQL and
 * DuckDB.
 *
 * Rebuild with:
 *   npm run datasets -- --ergast-source=/path/to/ergast_2024
 */
const TABLES = [
  [
    "circuits",
    "circuits",
    [
      ["circuitId", "circuit_id", "INTEGER", true],
      ["circuitRef", "circuit_ref", "VARCHAR(255)", true],
      ["name", "name", "VARCHAR(255)", true],
      ["location", "location", "VARCHAR(255)"],
      ["country", "country", "VARCHAR(255)"],
      ["lat", "lat", "DOUBLE PRECISION"],
      ["lng", "lng", "DOUBLE PRECISION"],
      ["alt", "alt", "INTEGER"],
      ["url", "url", "VARCHAR(255)", true],
    ],
    ["circuit_id"],
  ],
  [
    "constructors",
    "constructors",
    [
      ["constructorId", "constructor_id", "INTEGER", true],
      ["constructorRef", "constructor_ref", "VARCHAR(255)", true],
      ["name", "name", "VARCHAR(255)", true],
      ["nationality", "nationality", "VARCHAR(255)"],
      ["url", "url", "VARCHAR(255)", true],
    ],
    ["constructor_id"],
  ],
  [
    "drivers",
    "drivers",
    [
      ["driverId", "driver_id", "INTEGER", true],
      ["driverRef", "driver_ref", "VARCHAR(255)", true],
      ["number", "number", "INTEGER"],
      ["code", "code", "VARCHAR(3)"],
      ["forename", "forename", "VARCHAR(255)", true],
      ["surname", "surname", "VARCHAR(255)", true],
      ["dob", "dob", "DATE"],
      ["nationality", "nationality", "VARCHAR(255)"],
      ["url", "url", "VARCHAR(255)", true],
    ],
    ["driver_id"],
  ],
  [
    "seasons",
    "seasons",
    [
      ["year", "year", "INTEGER", true],
      ["url", "url", "VARCHAR(255)", true],
    ],
    ["year"],
  ],
  [
    "status",
    "status",
    [
      ["statusId", "status_id", "INTEGER", true],
      ["status", "status", "VARCHAR(255)", true],
    ],
    ["status_id"],
  ],
  [
    "races",
    "races",
    [
      ["raceId", "race_id", "INTEGER", true],
      ["year", "year", "INTEGER", true],
      ["round", "round", "INTEGER", true],
      ["circuitId", "circuit_id", "INTEGER", true],
      ["name", "name", "VARCHAR(255)", true],
      ["date", "date", "DATE", true],
      ["time", "time", "TIME"],
      ["url", "url", "VARCHAR(255)"],
      ["fp1_date", "fp1_date", "DATE"],
      ["fp1_time", "fp1_time", "TIME"],
      ["fp2_date", "fp2_date", "DATE"],
      ["fp2_time", "fp2_time", "TIME"],
      ["fp3_date", "fp3_date", "DATE"],
      ["fp3_time", "fp3_time", "TIME"],
      ["quali_date", "quali_date", "DATE"],
      ["quali_time", "quali_time", "TIME"],
      ["sprint_date", "sprint_date", "DATE"],
      ["sprint_time", "sprint_time", "TIME"],
    ],
    ["race_id"],
  ],
  [
    "results",
    "results",
    [
      ["resultId", "result_id", "INTEGER", true],
      ["raceId", "race_id", "INTEGER", true],
      ["driverId", "driver_id", "INTEGER", true],
      ["constructorId", "constructor_id", "INTEGER", true],
      ["number", "number", "INTEGER"],
      ["grid", "grid", "INTEGER", true],
      ["position", "position", "INTEGER"],
      ["positionText", "position_text", "VARCHAR(255)", true],
      ["positionOrder", "position_order", "INTEGER", true],
      ["points", "points", "DOUBLE PRECISION", true],
      ["laps", "laps", "INTEGER", true],
      ["time", "time", "VARCHAR(255)"],
      ["milliseconds", "milliseconds", "INTEGER"],
      ["fastestLap", "fastest_lap", "INTEGER"],
      ["rank", "rank", "INTEGER"],
      ["fastestLapTime", "fastest_lap_time", "VARCHAR(255)"],
      ["fastestLapSpeed", "fastest_lap_speed", "DOUBLE PRECISION"],
      ["statusId", "status_id", "INTEGER", true],
    ],
    ["result_id"],
  ],
  [
    "qualifying",
    "qualifying",
    [
      ["qualifyId", "qualify_id", "INTEGER", true],
      ["raceId", "race_id", "INTEGER", true],
      ["driverId", "driver_id", "INTEGER", true],
      ["constructorId", "constructor_id", "INTEGER", true],
      ["number", "number", "INTEGER", true],
      ["position", "position", "INTEGER"],
      ["q1", "q1", "VARCHAR(255)"],
      ["q2", "q2", "VARCHAR(255)"],
      ["q3", "q3", "VARCHAR(255)"],
    ],
    ["qualify_id"],
  ],
  [
    "sprintresults",
    "sprint_results",
    [
      ["sprintResultId", "sprint_result_id", "INTEGER", true],
      ["raceId", "race_id", "INTEGER", true],
      ["driverId", "driver_id", "INTEGER", true],
      ["constructorId", "constructor_id", "INTEGER", true],
      ["number", "number", "INTEGER"],
      ["grid", "grid", "INTEGER", true],
      ["position", "position", "INTEGER"],
      ["positionText", "position_text", "VARCHAR(255)", true],
      ["positionOrder", "position_order", "INTEGER", true],
      ["points", "points", "DOUBLE PRECISION", true],
      ["laps", "laps", "INTEGER", true],
      ["time", "time", "VARCHAR(255)"],
      ["milliseconds", "milliseconds", "INTEGER"],
      ["fastestLap", "fastest_lap", "INTEGER"],
      ["fastestLapTime", "fastest_lap_time", "VARCHAR(255)"],
      ["statusId", "status_id", "INTEGER", true],
    ],
    ["sprint_result_id"],
  ],
  [
    "constructorresults",
    "constructor_results",
    [
      ["constructorResultsId", "constructor_result_id", "INTEGER", true],
      ["raceId", "race_id", "INTEGER", true],
      ["constructorId", "constructor_id", "INTEGER", true],
      ["points", "points", "DOUBLE PRECISION"],
      ["status", "status", "VARCHAR(255)"],
    ],
    ["constructor_result_id"],
  ],
  [
    "constructorstandings",
    "constructor_standings",
    [
      ["constructorStandingsId", "constructor_standing_id", "INTEGER", true],
      ["raceId", "race_id", "INTEGER", true],
      ["constructorId", "constructor_id", "INTEGER", true],
      ["points", "points", "DOUBLE PRECISION", true],
      ["position", "position", "INTEGER"],
      ["positionText", "position_text", "VARCHAR(255)"],
      ["wins", "wins", "INTEGER", true],
    ],
    ["constructor_standing_id"],
  ],
  [
    "driverstandings",
    "driver_standings",
    [
      ["driverStandingsId", "driver_standing_id", "INTEGER", true],
      ["raceId", "race_id", "INTEGER", true],
      ["driverId", "driver_id", "INTEGER", true],
      ["points", "points", "DOUBLE PRECISION", true],
      ["position", "position", "INTEGER"],
      ["positionText", "position_text", "VARCHAR(255)"],
      ["wins", "wins", "INTEGER", true],
    ],
    ["driver_standing_id"],
  ],
  [
    "laptimes",
    "lap_times",
    [
      ["raceId", "race_id", "INTEGER", true],
      ["driverId", "driver_id", "INTEGER", true],
      ["lap", "lap", "INTEGER", true],
      ["position", "position", "INTEGER"],
      ["time", "time", "VARCHAR(255)"],
      ["milliseconds", "milliseconds", "INTEGER"],
    ],
    ["race_id", "driver_id", "lap"],
  ],
  [
    "pitstops",
    "pit_stops",
    [
      ["raceId", "race_id", "INTEGER", true],
      ["driverId", "driver_id", "INTEGER", true],
      ["stop", "stop", "INTEGER", true],
      ["lap", "lap", "INTEGER", true],
      ["time", "time", "TIME", true],
      ["duration", "duration", "VARCHAR(255)"],
      ["milliseconds", "milliseconds", "INTEGER"],
    ],
    ["race_id", "driver_id", "stop"],
  ],
];

const FOREIGN_KEYS = [
  ["races", ["year"], "seasons", ["year"]],
  ["races", ["circuit_id"], "circuits", ["circuit_id"]],
  ["results", ["race_id"], "races", ["race_id"]],
  ["results", ["driver_id"], "drivers", ["driver_id"]],
  ["results", ["constructor_id"], "constructors", ["constructor_id"]],
  ["results", ["status_id"], "status", ["status_id"]],
  ["qualifying", ["race_id"], "races", ["race_id"]],
  ["qualifying", ["driver_id"], "drivers", ["driver_id"]],
  ["qualifying", ["constructor_id"], "constructors", ["constructor_id"]],
  ["sprint_results", ["race_id"], "races", ["race_id"]],
  ["sprint_results", ["driver_id"], "drivers", ["driver_id"]],
  ["sprint_results", ["constructor_id"], "constructors", ["constructor_id"]],
  ["sprint_results", ["status_id"], "status", ["status_id"]],
  ["constructor_results", ["race_id"], "races", ["race_id"]],
  ["constructor_results", ["constructor_id"], "constructors", ["constructor_id"]],
  ["constructor_standings", ["race_id"], "races", ["race_id"]],
  ["constructor_standings", ["constructor_id"], "constructors", ["constructor_id"]],
  ["driver_standings", ["race_id"], "races", ["race_id"]],
  ["driver_standings", ["driver_id"], "drivers", ["driver_id"]],
  ["lap_times", ["race_id"], "races", ["race_id"]],
  ["lap_times", ["driver_id"], "drivers", ["driver_id"]],
  ["pit_stops", ["race_id"], "races", ["race_id"]],
  ["pit_stops", ["driver_id"], "drivers", ["driver_id"]],
].map(([fromTable, fromColumns, toTable, toColumns]) => ({
  fromTable: `public.${fromTable}`,
  fromColumns,
  toTable: `public.${toTable}`,
  toColumns,
}));

export async function buildErgast({ sourceDir } = {}) {
  if (!sourceDir) {
    throw new Error("Ergast requires --ergast-source=/path/to/ergast_2024");
  }

  banner("Ergast Formula 1 (through 2024)");
  const manifest = [];
  let totalBytes = 0;

  for (const [sourceName, name, columns, primaryKey] of TABLES) {
    const source = await readFile(path.join(sourceDir, `${sourceName}.csv`), "utf8");
    const parsed = parseCsv(source);
    const header = parsed[0].map((column) => column.trim());
    const sourceIndexes = columns.map(([sourceColumn]) => {
      const index = header.indexOf(sourceColumn);
      if (index === -1) throw new Error(`${sourceName}: missing column "${sourceColumn}"`);
      return index;
    });
    const rows = parsed
      .slice(1)
      .filter((row) => row.length >= header.length)
      .map((row) => sourceIndexes.map((index) => (row[index] === "NULL" ? "" : row[index])));
    const stats = await writeTable(
      "ergast",
      name,
      columns.map(([, column]) => column),
      rows,
    );
    totalBytes += stats.bytes;
    manifest.push({
      schema: "public",
      name,
      file: `${name}.csv.gz`,
      rows: stats.rows,
      bytes: stats.bytes,
      primaryKey,
      columns: columns.map(([, column, type, notNull]) => ({ name: column, type, notNull })),
    });
  }

  console.log(
    `  ${manifest.length} tables · ${manifest.reduce((sum, table) => sum + table.rows, 0).toLocaleString()} rows · ${mb(totalBytes)} gzipped`,
  );
  return {
    id: "ergast",
    schemas: [],
    tables: manifest,
    foreignKeys: FOREIGN_KEYS,
    bytes: totalBytes,
  };
}
