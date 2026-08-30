import { readFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import {
  CACHE,
  download,
  ensureDir,
  exists,
  parseDelimited,
  parseTabRows,
  writeTable,
  banner,
  mb,
  cleanTimestamp,
} from "./lib.mjs";

const execFileAsync = promisify(execFile);

const OLTP_ZIP =
  "https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks-oltp-install-script.zip";
const INSTALL_SQL =
  "https://raw.githubusercontent.com/lorint/AdventureWorks-for-Postgres/master/install.sql";

/**
 * Columns we drop everywhere. rowguid is a replication artefact, and the XML /
 * binary columns are the difference between a 90 MB download and a 6 MB one
 * while teaching nothing about SQL.
 */
const DROP_COLUMNS = new Set(["rowguid"]);

/**
 * Per-table column drops: XML documents, photos, and the raw hierarchyid
 * columns, which arrive as unreadable hex. Every \copy in install.sql runs
 * before that file's ALTER statements, so the CSV layout always matches the
 * original CREATE TABLE list; dropping by name here keeps the two in step.
 */
const DROP_BY_TABLE = {
  "person.person": ["additionalcontactinfo", "demographics"],
  "production.productmodel": ["catalogdescription", "instructions"],
  "production.productphoto": ["thumbnailphoto", "largephoto"],
  "production.illustration": ["diagram"],
  "production.document": ["document", "doc"],
  "production.productdocument": ["doc"],
  "humanresources.employee": ["org"],
  "sales.store": ["demographics"],
};

/** Tables dropped whole: credentials, and the build-version stub. */
const DROP_TABLES = new Set(["person.password", "dbo.awbuildversion", "dbo.databaselog"]);

/** AdventureWorks domains, resolved to plain types both engines accept. */
const DOMAINS = {
  '"ordernumber"': "VARCHAR(25)",
  '"accountnumber"': "VARCHAR(15)",
  '"flag"': "BOOLEAN",
  '"namestyle"': "BOOLEAN",
  '"name"': "VARCHAR(50)",
  '"phone"': "VARCHAR(25)",
};

/** Types PGlite and DuckDB disagree on, mapped to common ground. */
function normaliseType(type) {
  let t = type.trim();
  const lower = t.toLowerCase();
  if (DOMAINS[lower]) return DOMAINS[lower];
  if (lower === "serial") return "INTEGER";
  if (lower === "bigserial") return "BIGINT";
  if (lower === "uuid") return "VARCHAR(36)";
  if (lower === "xml") return "TEXT";
  if (lower === "bytea") return "TEXT";
  if (lower.startsWith("varchar") && !lower.includes("(")) return "VARCHAR";
  if (lower === "numeric") return "DECIMAL(19,4)"; // stands in for SQL Server money
  return t;
}

/** Split a CREATE TABLE body into column definitions, ignoring table constraints. */
function parseColumns(body) {
  const columns = [];
  let depth = 0;
  let current = "";

  // Strip comments first. Several of them contain commas, e.g.
  // "-- hierarchyid, will become OrganizationNode", and splitting on those
  // would tear a comment in half and turn its words into a phantom column.
  const clean = body.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

  for (const ch of clean) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      columns.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) columns.push(current);

  return columns.map((c) => c.trim()).filter((c) => c && !/^CONSTRAINT\b/i.test(c));
}

function parseColumnDef(text) {
  // name, then the type, then any modifiers we mostly discard.
  const match = /^("?[A-Za-z_][A-Za-z0-9_]*"?)\s+(.+)$/s.exec(text.trim());
  if (!match) return null;

  const name = match[1].replace(/"/g, "").toLowerCase();
  let rest = match[2].trim();

  const notNull = /\bNOT\s+NULL\b/i.test(rest);
  // Strip everything from the first modifier keyword onwards.
  rest = rest.replace(/\s+(NOT\s+NULL|NULL|CONSTRAINT|DEFAULT|CHECK)\b[\s\S]*$/i, "").trim();

  return { name, type: normaliseType(rest), notNull };
}

export async function buildAdventureWorks() {
  banner("AdventureWorks");

  const zip = await download(OLTP_ZIP, "adventureworks-oltp.zip");
  const sqlPath = await download(INSTALL_SQL, "adventureworks-install.sql");
  const csvDir = path.join(CACHE, "adventureworks-csv");

  if (!(await exists(path.join(csvDir, "Product.csv")))) {
    await ensureDir(csvDir);
    process.stdout.write("  extracting CSVs … ");
    await execFileAsync("unzip", ["-q", "-o", zip, "-d", csvDir]);
    console.log("done");
  }

  const sql = await readFile(sqlPath, "utf8");

  // ---- schemas ------------------------------------------------------
  // "CREATE SCHEMA Person" blocks hold the CREATE TABLE statements. The short
  // alias schemas (pe, hr, ...) at the end only define convenience views.
  const realSchemas = ["person", "humanresources", "production", "purchasing", "sales"];

  // ---- tables + columns ---------------------------------------------
  const tables = new Map(); // "schema.table" -> { schema, name, columns }
  const schemaRe = /^CREATE SCHEMA\s+(\w+)/gim;
  const schemaPositions = [];
  for (const m of sql.matchAll(schemaRe)) {
    schemaPositions.push({ name: m[1].toLowerCase(), index: m.index });
  }
  const schemaAt = (index) => {
    let found = null;
    for (const s of schemaPositions) {
      if (s.index <= index) found = s.name;
      else break;
    }
    return found;
  };

  const tableRe = /CREATE TABLE\s+(?:(\w+)\.)?(\w+)\s*\(/gi;
  for (const m of sql.matchAll(tableRe)) {
    const schema = (m[1] ?? schemaAt(m.index) ?? "public").toLowerCase();
    const name = m[2].toLowerCase();
    if (!realSchemas.includes(schema)) continue;

    // Walk to the matching close paren.
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    while (i < sql.length && depth > 0) {
      if (sql[i] === "(") depth++;
      else if (sql[i] === ")") depth--;
      i++;
    }
    const body = sql.slice(start, i - 1);

    const key = `${schema}.${name}`;
    if (DROP_TABLES.has(key)) continue;

    const columns = parseColumns(body).map(parseColumnDef).filter(Boolean);

    tables.set(key, { schema, name, columns });
  }

  // ---- CSV file mapping ----------------------------------------------
  // Most lines read '/Foo.csv', a few read './Foo.csv'. Accept either.
  const copyRe = /\\copy\s+(\w+)\.(\w+)\s+FROM\s+'(?:\.\/)?([\w.]+)'/gi;
  const csvFor = new Map();
  for (const m of sql.matchAll(copyRe)) {
    csvFor.set(`${m[1].toLowerCase()}.${m[2].toLowerCase()}`, m[3]);
  }

  // ---- keys ------------------------------------------------------------
  const primaryKeys = new Map();
  const pkRe =
    /ALTER TABLE\s+(\w+)\.(\w+)\s+ADD\s+CONSTRAINT\s+"[^"]+"\s+PRIMARY KEY\s*\(([^)]+)\)/gi;
  for (const m of sql.matchAll(pkRe)) {
    primaryKeys.set(
      `${m[1].toLowerCase()}.${m[2].toLowerCase()}`,
      m[3].split(",").map((c) => c.trim().replace(/"/g, "").toLowerCase()),
    );
  }

  const foreignKeys = [];
  const fkRe =
    /ALTER TABLE\s+(\w+)\.(\w+)\s+ADD\s+CONSTRAINT\s+"[^"]+"\s+FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+(\w+)\.(\w+)\s*\(([^)]+)\)/gi;
  for (const m of sql.matchAll(fkRe)) {
    foreignKeys.push({
      fromTable: `${m[1].toLowerCase()}.${m[2].toLowerCase()}`,
      fromColumns: m[3].split(",").map((c) => c.trim().replace(/"/g, "").toLowerCase()),
      toTable: `${m[4].toLowerCase()}.${m[5].toLowerCase()}`,
      toColumns: m[6].split(",").map((c) => c.trim().replace(/"/g, "").toLowerCase()),
    });
  }

  // ---- convert the data ------------------------------------------------
  const manifest = [];
  let totalBytes = 0;

  for (const [key, table] of tables) {
    const csvName = csvFor.get(key);
    if (!csvName) continue;

    const file = path.join(csvDir, csvName);
    if (!(await exists(file))) {
      console.log(`  ! missing ${csvName}, skipping ${key}`);
      continue;
    }

    const raw = await readFile(file, "utf8");
    const isPipes = raw.slice(0, 4096).includes("+|");
    const rows = isPipes
      ? parseDelimited(raw, { fieldSep: "+|", rowSep: "&|" })
      : parseTabRows(raw.replace(/\r\n/g, "\n"), table.columns.length);

    // The CSV column order matches the CREATE TABLE order, including the
    // columns we are about to discard, so filter by index.
    const drop = new Set([...DROP_COLUMNS, ...(DROP_BY_TABLE[key] ?? [])]);
    const keptIndexes = [];
    const keptColumns = [];
    table.columns.forEach((col, index) => {
      if (drop.has(col.name)) return;
      keptIndexes.push(index);
      keptColumns.push(col);
    });

    const isTimestamp = keptColumns.map((c) => /timestamp|date/i.test(c.type));

    const outRows = rows
      .filter((r) => r.length >= table.columns.length)
      .map((r) =>
        keptIndexes.map((idx, out) => {
          let v = r[idx] ?? "";
          if (isTimestamp[out]) v = cleanTimestamp(v);
          return v;
        }),
      );

    const stats = await writeTable(
      "adventureworks",
      key.replace(".", "__"),
      keptColumns.map((c) => c.name),
      outRows,
    );
    totalBytes += stats.bytes;

    manifest.push({
      schema: table.schema,
      name: table.name,
      file: `${key.replace(".", "__")}.csv.gz`,
      columns: keptColumns.map((c) => ({
        name: c.name,
        type: c.type,
        notNull: c.notNull && !drop.has(c.name),
      })),
      // A primary key is only kept if every column it names survived. Some of
      // these point at hierarchyid columns that install.sql adds after the
      // copy, which this export never materialises.
      primaryKey: (() => {
        const declared = primaryKeys.get(key) ?? [];
        const present = new Set(keptColumns.map((c) => c.name));
        return declared.every((c) => present.has(c)) ? declared : [];
      })(),
      rows: stats.rows,
      bytes: stats.bytes,
    });
  }

  const keptTables = new Set(manifest.map((t) => `${t.schema}.${t.name}`));
  const keptForeignKeys = foreignKeys.filter(
    (fk) =>
      keptTables.has(fk.fromTable) &&
      keptTables.has(fk.toTable) &&
      !fk.fromColumns.some((c) => DROP_COLUMNS.has(c)),
  );

  manifest.sort((a, b) => `${a.schema}.${a.name}`.localeCompare(`${b.schema}.${b.name}`));

  console.log(
    `  ${manifest.length} tables · ${manifest.reduce((s, t) => s + t.rows, 0).toLocaleString()} rows · ${mb(totalBytes)} gzipped`,
  );

  return {
    id: "adventureworks",
    schemas: realSchemas,
    tables: manifest,
    foreignKeys: keptForeignKeys,
    bytes: totalBytes,
  };
}
