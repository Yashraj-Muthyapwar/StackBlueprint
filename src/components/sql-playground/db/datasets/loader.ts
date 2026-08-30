import type { PGlite } from "@electric-sql/pglite";
import type * as duckdb from "@duckdb/duckdb-wasm";
import { DDL as CYCLE_DDL, buildSeed } from "../dataset";
import { getDataset, qualify, type DatasetDef, type DatasetId, type ManifestTable } from "./index";

export interface LoadProgress {
  /** 0..1 across the whole dataset. */
  fraction: number;
  /** What is happening right now, for the status line. */
  label: string;
}

export type ProgressFn = (progress: LoadProgress) => void;

const BASE_URL = "/datasets";

/**
 * Fetch and inflate one table's CSV.
 *
 * The files are stored pre-gzipped. Most servers will serve them with
 * Content-Encoding: gzip and the browser inflates transparently; where they do
 * not, the bytes arrive still compressed and DecompressionStream handles it.
 * Sniffing the gzip magic number tells the two cases apart.
 */
async function fetchCsv(
  datasetId: string,
  file: string,
  signal?: AbortSignal,
): Promise<Uint8Array> {
  const res = await fetch(`${BASE_URL}/${datasetId}/${file}`, { signal });
  if (!res.ok) {
    throw new Error(`Could not fetch ${file} (${res.status} ${res.statusText})`);
  }
  const raw = new Uint8Array(await res.arrayBuffer());

  const isGzip = raw.length > 2 && raw[0] === 0x1f && raw[1] === 0x8b;
  if (!isGzip) return raw;

  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot decompress the dataset (no DecompressionStream).");
  }
  const stream = new Blob([raw as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function columnList(table: ManifestTable): string {
  return table.columns.map((c) => `"${c.name}"`).join(", ");
}

/** CREATE TABLE text that both engines accept. */
function createTable(table: ManifestTable): string {
  const cols = table.columns
    .map((c) => `  "${c.name}" ${c.type}${c.notNull ? " NOT NULL" : ""}`)
    .join(",\n");
  return `CREATE TABLE ${qualify(table)} (\n${cols}\n);`;
}

/**
 * Weight each table's share of the progress bar by its download size, so the
 * bar tracks time rather than table count.
 */
function progressWeights(tables: ManifestTable[]): number[] {
  const total = tables.reduce((sum, t) => sum + Math.max(t.bytes, 1), 0);
  return tables.map((t) => Math.max(t.bytes, 1) / total);
}

// ------------------------------------------------------------------ postgres

export async function loadIntoPostgres(
  pg: PGlite,
  datasetId: DatasetId,
  onProgress: ProgressFn,
  signal?: AbortSignal,
): Promise<void> {
  const dataset = getDataset(datasetId);

  if (dataset.source.kind === "generated") {
    onProgress({ fraction: 0.1, label: "building tables" });
    await pg.exec(CYCLE_DDL);
    const { statements } = buildSeed();
    for (const [i, stmt] of statements.entries()) {
      await pg.exec(stmt);
      onProgress({ fraction: 0.1 + (0.85 * (i + 1)) / statements.length, label: "seeding" });
    }
    await pg.exec("ANALYZE;");
    onProgress({ fraction: 1, label: "ready" });
    return;
  }

  if (dataset.source.kind !== "csv") {
    throw new Error(`${dataset.name} is not available on PostgreSQL.`);
  }

  const { manifest } = dataset.source;

  for (const schema of manifest.schemas) {
    await pg.exec(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
  }

  onProgress({ fraction: 0, label: "creating tables" });
  for (const table of manifest.tables) {
    await pg.exec(createTable(table));
  }

  const weights = progressWeights(manifest.tables);
  let done = 0;

  for (const [i, table] of manifest.tables.entries()) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    onProgress({ fraction: done, label: `loading ${table.schema}.${table.name}` });

    const csv = await fetchCsv(manifest.id, table.file, signal);

    // COPY FROM '/dev/blob' is PGlite's bulk path: one round trip for the whole
    // table instead of a statement per row.
    await pg.query(
      `COPY ${qualify(table)} (${columnList(table)}) FROM '/dev/blob' WITH (FORMAT csv, HEADER true)`,
      [],
      { blob: new Blob([csv as BlobPart]) },
    );

    done += weights[i];
  }

  // Keys go on after the data: enforcing them per row during COPY is far slower.
  onProgress({ fraction: 0.97, label: "adding keys" });
  for (const table of manifest.tables) {
    if (table.primaryKey.length === 0) continue;
    const cols = table.primaryKey.map((c) => `"${c}"`).join(", ");
    try {
      await pg.exec(`ALTER TABLE ${qualify(table)} ADD PRIMARY KEY (${cols});`);
    } catch {
      // A source with duplicate keys is the source's problem, not a load failure.
    }
  }

  const byName = new Map(manifest.tables.map((t) => [`${t.schema}.${t.name}`, t]));
  for (const fk of manifest.foreignKeys) {
    const from = byName.get(fk.fromTable);
    const to = byName.get(fk.toTable);
    if (!from || !to) continue;
    const fromCols = fk.fromColumns.map((c) => `"${c}"`).join(", ");
    const toCols = fk.toColumns.map((c) => `"${c}"`).join(", ");
    try {
      await pg.exec(
        `ALTER TABLE ${qualify(from)} ADD FOREIGN KEY (${fromCols}) REFERENCES ${qualify(to)} (${toCols});`,
      );
    } catch {
      // Orphan rows exist in some of these sources; the relationship still shows
      // in the schema map via the manifest, so a rejected constraint is not fatal.
    }
  }

  onProgress({ fraction: 0.99, label: "analysing" });
  await pg.exec("ANALYZE;");
  onProgress({ fraction: 1, label: "ready" });
}

// ------------------------------------------------------------------ duckdb

export async function loadIntoDuckDB(
  database: duckdb.AsyncDuckDB,
  conn: duckdb.AsyncDuckDBConnection,
  datasetId: DatasetId,
  onProgress: ProgressFn,
  signal?: AbortSignal,
): Promise<void> {
  const dataset: DatasetDef = getDataset(datasetId);

  if (dataset.source.kind === "generated") {
    onProgress({ fraction: 0.1, label: "building tables" });
    for (const stmt of CYCLE_DDL.split(";").filter((s) => s.trim())) {
      await conn.query(stmt);
    }
    const { statements } = buildSeed();
    for (const [i, stmt] of statements.entries()) {
      await conn.query(stmt);
      onProgress({ fraction: 0.1 + (0.85 * (i + 1)) / statements.length, label: "seeding" });
    }
    onProgress({ fraction: 1, label: "ready" });
    return;
  }

  if (dataset.source.kind === "tpch") {
    onProgress({ fraction: 0.05, label: "loading the tpch extension" });
    await conn.query("INSTALL tpch;");
    await conn.query("LOAD tpch;");
    onProgress({
      fraction: 0.3,
      label: `generating at scale factor ${dataset.source.scaleFactor}`,
    });
    await conn.query(`CALL dbgen(sf=${dataset.source.scaleFactor});`);
    onProgress({ fraction: 1, label: "ready" });
    return;
  }

  const { manifest } = dataset.source;

  for (const schema of manifest.schemas) {
    await conn.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
  }

  onProgress({ fraction: 0, label: "creating tables" });
  for (const table of manifest.tables) {
    await conn.query(createTable(table));
  }

  const weights = progressWeights(manifest.tables);
  let done = 0;

  for (const [i, table] of manifest.tables.entries()) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    onProgress({ fraction: done, label: `loading ${table.schema}.${table.name}` });

    const csv = await fetchCsv(manifest.id, table.file, signal);
    const virtualName = `${manifest.id}_${table.schema}_${table.name}.csv`;

    // Hand DuckDB the bytes through its virtual file system, then let its own
    // CSV reader do the parsing.
    await database.registerFileBuffer(virtualName, csv);
    try {
      const types = table.columns.map((c) => `'${c.name}': '${c.type}'`).join(", ");
      await conn.query(
        `INSERT INTO ${qualify(table)} SELECT ${columnList(table)} FROM read_csv('${virtualName}', header = true, columns = {${types}}, nullstr = '', ignore_errors = true);`,
      );
    } finally {
      await database.dropFile(virtualName);
    }

    done += weights[i];
  }

  onProgress({ fraction: 1, label: "ready" });
}
