import { db, type Engine } from "../db/db-client";
import {
  getDataset,
  humanBytes,
  type DatasetDef,
  type DatasetId,
  type ManifestForeignKey,
  type ManifestTable,
} from "../db/datasets";
import { DDL as CYCLE_DDL, buildSeed } from "../db/dataset";
import { splitStatements } from "../db/db-client";
import {
  buildKeysSql,
  buildLoadSql,
  buildSchemaSql,
  csvFileName,
  getDialect,
  type DialectId,
  type SchemaSource,
} from "./dialects";
import { createZip, type ZipEntry } from "./zip";

export interface BundleProgress {
  fraction: number;
  label: string;
}

const BASE_URL = "/datasets";

/** Fetch and inflate a table's CSV, exactly as the loader does. */
async function fetchCsv(datasetId: string, file: string): Promise<Uint8Array> {
  const res = await fetch(`${BASE_URL}/${datasetId}/${file}`);
  if (!res.ok) throw new Error(`Could not fetch ${file} (${res.status})`);
  const raw = new Uint8Array(await res.arrayBuffer());

  const isGzip = raw.length > 2 && raw[0] === 0x1f && raw[1] === 0x8b;
  if (!isGzip) return raw;
  const stream = new Blob([raw as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// ------------------------------------------------------------------ CSV out

const encoder = new TextEncoder();

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(columns: string[], rows: Record<string, unknown>[]): Uint8Array {
  const out = [columns.map(csvCell).join(",")];
  for (const row of rows) out.push(columns.map((c) => csvCell(row[c])).join(","));
  return encoder.encode(out.join("\n") + "\n");
}

// ------------------------------------------------------------------ sources

interface TableData {
  table: ManifestTable;
  csv: Uint8Array;
}

/**
 * Where a dataset's rows come from.
 *
 * The CSV-backed sets are fetched straight from the same files the loader uses,
 * so exporting one does not require booting an engine. Cycle Depot is generated
 * in JavaScript. TPC-H only exists inside DuckDB, so it is read back out of a
 * live session.
 */
async function collectTables(
  dataset: DatasetDef,
  onProgress: (p: BundleProgress) => void,
): Promise<{ tables: TableData[]; source: SchemaSource }> {
  if (dataset.source.kind === "csv") {
    const manifest = dataset.source.manifest;
    const total = manifest.tables.reduce((sum, t) => sum + Math.max(t.bytes, 1), 0);
    let done = 0;
    const tables: TableData[] = [];

    for (const table of manifest.tables) {
      onProgress({ fraction: done / total, label: `fetching ${table.schema}.${table.name}` });
      tables.push({ table, csv: await fetchCsv(manifest.id, table.file) });
      done += Math.max(table.bytes, 1);
    }

    return {
      tables,
      source: {
        tables: manifest.tables,
        foreignKeys: manifest.foreignKeys,
        schemas: manifest.schemas,
      },
    };
  }

  if (dataset.source.kind === "generated") {
    onProgress({ fraction: 0.2, label: "generating rows" });
    return collectFromGenerated();
  }

  // TPC-H: generated inside DuckDB, so read it back from the engine.
  onProgress({ fraction: 0.05, label: "starting DuckDB" });
  return collectFromEngine(dataset, "duckdb", onProgress);
}

/** Cycle Depot: parse its own DDL so the export matches what the lab runs. */
function collectFromGenerated(): { tables: TableData[]; source: SchemaSource } {
  const seed = buildSeed();
  const tables: ManifestTable[] = [];
  const rowsByTable = new Map<string, string[][]>();
  const columnsByTable = new Map<string, string[]>();

  for (const statement of splitStatements(CYCLE_DDL)) {
    const match = /CREATE TABLE\s+(\w+)\s*\(([\s\S]*)\)\s*$/i.exec(statement);
    if (!match) continue;
    const name = match[1].toLowerCase();

    const columns: ManifestTable["columns"] = [];
    const primaryKey: string[] = [];

    // Split the body on top-level commas so DECIMAL(10,2) stays intact.
    let depth = 0;
    let buf = "";
    const parts: string[] = [];
    for (const ch of match[2]) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        parts.push(buf);
        buf = "";
        continue;
      }
      buf += ch;
    }
    if (buf.trim()) parts.push(buf);

    for (const part of parts) {
      const line = part.trim().replace(/\s+/g, " ");
      if (!line || /^(FOREIGN|PRIMARY|CONSTRAINT|UNIQUE|CHECK)\b/i.test(line)) continue;

      const col = /^(\w+)\s+([\s\S]+)$/.exec(line);
      if (!col) continue;
      const colName = col[1].toLowerCase();

      // Cut the type at the first modifier keyword. Without this the type
      // greedily absorbs "PRIMARY KEY" / "NOT NULL" and they get emitted twice.
      const type = col[2]
        .replace(
          /\s+(NOT\s+NULL|NULL|PRIMARY\s+KEY|UNIQUE|REFERENCES|DEFAULT|CHECK|GENERATED)\b[\s\S]*$/i,
          "",
        )
        .trim();

      const isPrimary = /\bPRIMARY\s+KEY\b/i.test(col[2]);
      columns.push({
        name: colName,
        type: type.toUpperCase(),
        notNull: /\bNOT\s+NULL\b/i.test(col[2]) || isPrimary,
      });
      if (isPrimary) primaryKey.push(colName);
    }

    tables.push({
      schema: "public",
      name,
      file: `${name}.csv`,
      rows: 0,
      bytes: 0,
      primaryKey,
      columns,
    });
    columnsByTable.set(
      name,
      columns.map((c) => c.name),
    );
    rowsByTable.set(name, []);
  }

  // The seed is a list of multi-row INSERTs; recover the literal tuples.
  for (const statement of seed.statements) {
    const head = /^INSERT INTO\s+(\w+)\s*\(([^)]*)\)\s*VALUES/i.exec(statement);
    if (!head) continue;
    const name = head[1].toLowerCase();
    const order = head[2].split(",").map((c) => c.trim().toLowerCase());
    const target = rowsByTable.get(name);
    if (!target) continue;

    for (const tuple of parseTuples(statement.slice(head[0].length))) {
      const byName: Record<string, string> = {};
      order.forEach((col, i) => (byName[col] = tuple[i] ?? ""));
      target.push((columnsByTable.get(name) ?? order).map((c) => byName[c] ?? ""));
    }
  }

  const foreignKeys: ManifestForeignKey[] = [];
  for (const statement of splitStatements(CYCLE_DDL)) {
    const table = /CREATE TABLE\s+(\w+)/i.exec(statement)?.[1]?.toLowerCase();
    if (!table) continue;
    const fkRe = /FOREIGN KEY\s*\(([^)]*)\)\s*REFERENCES\s+(\w+)\s*\(([^)]*)\)/gi;
    let m: RegExpExecArray | null;
    while ((m = fkRe.exec(statement)) !== null) {
      foreignKeys.push({
        fromTable: `public.${table}`,
        fromColumns: m[1].split(",").map((c) => c.trim().toLowerCase()),
        toTable: `public.${m[2].toLowerCase()}`,
        toColumns: m[3].split(",").map((c) => c.trim().toLowerCase()),
      });
    }
  }

  const data: TableData[] = tables.map((table) => {
    const rows = rowsByTable.get(table.name) ?? [];
    table.rows = rows.length;
    const header = table.columns.map((c) => c.name);
    const body = [header.join(",")];
    for (const row of rows) body.push(row.map(csvCell).join(","));
    return { table, csv: encoder.encode(body.join("\n") + "\n") };
  });

  return { tables: data, source: { tables, foreignKeys, schemas: [] } };
}

/** Split `('a','b'),('c','d')` into unquoted field arrays. */
function parseTuples(text: string): string[][] {
  const tuples: string[][] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] !== "(") {
      i++;
      continue;
    }
    i++;
    const fields: string[] = [];
    let field = "";
    let quoted = false;

    while (i < text.length) {
      const ch = text[i];
      if (quoted) {
        if (ch === "'") {
          if (text[i + 1] === "'") {
            field += "'";
            i += 2;
            continue;
          }
          quoted = false;
          i++;
          continue;
        }
        field += ch;
        i++;
        continue;
      }
      if (ch === "'") {
        quoted = true;
        i++;
        continue;
      }
      if (ch === ",") {
        fields.push(cleanLiteral(field));
        field = "";
        i++;
        continue;
      }
      if (ch === ")") {
        fields.push(cleanLiteral(field));
        i++;
        break;
      }
      field += ch;
      i++;
    }
    tuples.push(fields);
  }

  return tuples;
}

const cleanLiteral = (raw: string) => {
  const trimmed = raw.trim();
  return trimmed.toUpperCase() === "NULL" ? "" : trimmed;
};

/** Read every user table out of a live engine, for datasets with no CSV source. */
async function collectFromEngine(
  dataset: DatasetDef,
  engine: Engine,
  onProgress: (p: BundleProgress) => void,
): Promise<{ tables: TableData[]; source: SchemaSource }> {
  await db.init(engine, dataset.id);

  const { fetchSchema } = await import("../db/metadata");
  onProgress({ fraction: 0.15, label: "reading the catalogue" });
  const snapshot = await fetchSchema(engine, dataset.id);

  const tables: ManifestTable[] = snapshot.tables.map((t) => ({
    schema: t.schema === "main" ? "public" : t.schema,
    name: t.name,
    file: `${t.name}.csv`,
    rows: t.rowCount ?? 0,
    bytes: 0,
    primaryKey: t.columns.filter((c) => c.isPrimary).map((c) => c.name),
    columns: t.columns.map((c) => ({
      name: c.name,
      type: c.type.toUpperCase(),
      notNull: !c.isNullable,
    })),
  }));

  const data: TableData[] = [];
  for (const [index, table] of tables.entries()) {
    onProgress({
      fraction: 0.15 + (0.7 * index) / Math.max(1, tables.length),
      label: `exporting ${table.name}`,
    });
    const result = await db.run(engine, dataset.id, `SELECT * FROM "${table.name}"`);
    if (result.error) throw new Error(`${table.name}: ${result.error}`);
    table.rows = result.rows.length;
    data.push({
      table,
      csv: rowsToCsv(
        result.fields.map((f) => f.name),
        result.rows,
      ),
    });
  }

  const foreignKeys: ManifestForeignKey[] = snapshot.foreignKeys.map((fk) => ({
    fromTable: fk.fromTable.replace(/^main\./, "public."),
    fromColumns: [fk.fromColumn],
    toTable: fk.toTable.replace(/^main\./, "public."),
    toColumns: [fk.toColumn],
  }));

  return { tables: data, source: { tables, foreignKeys, schemas: [] } };
}

// ------------------------------------------------------------------ readme

function buildReadme(dataset: DatasetDef, dialect: DialectId, source: SchemaSource): string {
  const d = getDialect(dialect);
  const totalRows = source.tables.reduce((sum, t) => sum + t.rows, 0);

  const quickstart: Record<DialectId, string[]> = {
    postgres: [
      "```bash",
      "createdb practice",
      "psql -d practice -f schema.sql",
      "psql -d practice -f load.sql     # \\copy is client-side: run from this folder",
      "psql -d practice -f keys.sql",
      "```",
    ],
    duckdb: [
      "```bash",
      "duckdb practice.duckdb",
      "```",
      "```sql",
      ".read schema.sql",
      ".read load.sql",
      ".read keys.sql",
      "```",
    ],
    mysql: [
      "```bash",
      "mysql -u root -p -e 'CREATE DATABASE practice'",
      "mysql --local-infile=1 -u root -p practice < schema.sql",
      "mysql --local-infile=1 -u root -p practice < load.sql",
      "mysql -u root -p practice < keys.sql",
      "```",
      "",
      "If `LOAD DATA LOCAL INFILE` is refused, the server needs",
      "`SET GLOBAL local_infile = 1;` first.",
    ],
    sqlite: [
      "```bash",
      "sqlite3 practice.sqlite",
      "```",
      "```sql",
      ".read schema.sql",
      ".read load.sql",
      "```",
      "",
      "`keys.sql` is commented out: SQLite cannot add a foreign key to an",
      "existing table. Fold them into `schema.sql` first if you want them enforced.",
    ],
    csv: [
      "```python",
      "import pandas as pd",
      `df = pd.read_csv("data/${source.tables[0] ? csvFileName(source.tables[0]) : "table.csv"}")`,
      "```",
    ],
  };

  const tableRows = source.tables
    .map((t) => {
      const name = t.schema && t.schema !== "public" ? `${t.schema}.${t.name}` : t.name;
      return `| \`${name}\` | ${t.rows.toLocaleString()} | ${t.columns.length} |`;
    })
    .join("\n");

  return `# ${dataset.name} — ${d.label}

${dataset.about}

Exported from the StackBlueprint SQL Flow Lab for local practice.

- **Target:** ${d.label}
- **Tables:** ${source.tables.length}
- **Rows:** ${totalRows.toLocaleString()}

## Quick start

${quickstart[dialect].join("\n")}

## What is in here

| File | Purpose |
| --- | --- |
| \`schema.sql\` | \`CREATE TABLE\` statements with primary keys |
| \`load.sql\` | bulk-loads every CSV in \`data/\` |
| \`keys.sql\` | foreign keys, applied after loading |
| \`data/*.csv\` | one file per table, header row, \`,\` separated, \`""\` quoted |

CSV files use an empty field for NULL. Text containing a comma, quote or
newline is quoted, with embedded quotes doubled, per RFC 4180.

## Tables

| Table | Rows | Columns |
| --- | ---: | ---: |
${tableRows}

## Notes

${(dataset.caveats ?? ["None."]).map((c) => `- ${c}`).join("\n")}

## Source

${dataset.credit.label}${dataset.credit.url ? `\n${dataset.credit.url}` : ""}
`;
}

// ------------------------------------------------------------------ public

export interface BundleResult {
  blob: Blob;
  filename: string;
  tables: number;
  rows: number;
}

/** Build a downloadable archive of one dataset, targeted at one SQL dialect. */
export async function buildDatasetBundle(
  datasetId: DatasetId,
  dialect: DialectId,
  onProgress: (p: BundleProgress) => void = () => {},
): Promise<BundleResult> {
  const dataset = getDataset(datasetId);

  onProgress({ fraction: 0, label: "collecting tables" });
  const { tables, source } = await collectTables(dataset, (p) =>
    onProgress({ fraction: p.fraction * 0.7, label: p.label }),
  );

  onProgress({ fraction: 0.72, label: "writing schema" });

  const entries: ZipEntry[] = [{ name: "README.md", data: buildReadme(dataset, dialect, source) }];

  if (dialect !== "csv") {
    entries.push({ name: "schema.sql", data: buildSchemaSql(source, dialect) });
    const load = buildLoadSql(source, dialect);
    if (load) entries.push({ name: "load.sql", data: load });
    const keys = buildKeysSql(source, dialect);
    if (keys) entries.push({ name: "keys.sql", data: keys });
  }

  for (const { table, csv } of tables) {
    entries.push({ name: `data/${csvFileName(table)}`, data: csv });
  }

  onProgress({ fraction: 0.8, label: "compressing" });
  const blob = await createZip(entries, (done, total) => {
    onProgress({ fraction: 0.8 + (0.2 * done) / total, label: "compressing" });
  });

  onProgress({ fraction: 1, label: `ready · ${humanBytes(blob.size)}` });

  return {
    blob,
    filename: `${datasetId}-${dialect}.zip`,
    tables: source.tables.length,
    rows: source.tables.reduce((sum, t) => sum + t.rows, 0),
  };
}
