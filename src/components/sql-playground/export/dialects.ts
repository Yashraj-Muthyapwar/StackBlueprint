import type { ManifestColumn, ManifestForeignKey, ManifestTable } from "../db/datasets";

/**
 * Turning the lab's schema into DDL other engines accept.
 *
 * The manifest stores PostgreSQL-flavoured types because that is what the
 * sources use. Every other target needs some translation, and the differences
 * that actually bite are: how identifiers are quoted, whether schemas exist,
 * and how bulk CSV loading is spelled.
 */

export type DialectId = "postgres" | "mysql" | "sqlite" | "duckdb" | "csv";

export interface Dialect {
  id: DialectId;
  label: string;
  /** Shown in the picker. */
  blurb: string;
  fileExtension: string;
}

export const DIALECTS: Dialect[] = [
  {
    id: "postgres",
    label: "PostgreSQL",
    blurb: "Schemas, COPY loading, native types.",
    fileExtension: "sql",
  },
  {
    id: "mysql",
    label: "MySQL / MariaDB",
    blurb: "Backtick quoting, LOAD DATA INFILE, one database per schema.",
    fileExtension: "sql",
  },
  {
    id: "sqlite",
    label: "SQLite",
    blurb: "Flattened table names, .import loading, affinity types.",
    fileExtension: "sql",
  },
  {
    id: "duckdb",
    label: "DuckDB",
    blurb: "Schemas and read_csv. The fastest to get running locally.",
    fileExtension: "sql",
  },
  {
    id: "csv",
    label: "CSV only",
    blurb: "Just the data, for pandas, Excel or an engine not listed.",
    fileExtension: "csv",
  },
];

export const getDialect = (id: DialectId): Dialect =>
  DIALECTS.find((d) => d.id === id) ?? DIALECTS[0];

/** SQLite has no schemas and MySQL treats them as databases we do not create. */
const FLATTENS_SCHEMAS: Record<DialectId, boolean> = {
  postgres: false,
  duckdb: false,
  mysql: true,
  sqlite: true,
  csv: true,
};

export function quoteIdent(name: string, dialect: DialectId): string {
  return dialect === "mysql" ? `\`${name}\`` : `"${name}"`;
}

/** Name a table the way the target engine will see it. */
export function tableName(table: ManifestTable, dialect: DialectId): string {
  const bare = !table.schema || table.schema === "public" || table.schema === "main";
  if (bare) return quoteIdent(table.name, dialect);
  if (FLATTENS_SCHEMAS[dialect]) return quoteIdent(`${table.schema}_${table.name}`, dialect);
  return `${quoteIdent(table.schema, dialect)}.${quoteIdent(table.name, dialect)}`;
}

/** Flat file name for a table's CSV inside the bundle. */
export function csvFileName(table: ManifestTable): string {
  const bare = !table.schema || table.schema === "public" || table.schema === "main";
  return bare ? `${table.name}.csv` : `${table.schema}__${table.name}.csv`;
}

// ------------------------------------------------------------------ types

interface ParsedType {
  base: string;
  /** e.g. (10,2) or (255) */
  args: string | null;
}

function parseType(raw: string): ParsedType {
  const match = /^\s*([A-Za-z_ ]+?)\s*(\(([^)]*)\))?\s*$/.exec(raw);
  if (!match) return { base: raw.trim().toUpperCase(), args: null };
  return {
    base: match[1].trim().toUpperCase(),
    args: match[3] ? `(${match[3].replace(/\s+/g, "")})` : null,
  };
}

/**
 * Map one column type onto the target engine.
 *
 * The goal is a faithful, loadable schema rather than a byte-exact one: a
 * MySQL VARCHAR needs a length, SQLite only really has five affinities, and
 * nobody's TIMESTAMP means quite the same thing.
 */
export function mapType(raw: string, dialect: DialectId): string {
  const { base, args } = parseType(raw);

  if (dialect === "sqlite") {
    if (/INT/.test(base)) return "INTEGER";
    if (/DOUBLE|FLOAT|REAL/.test(base)) return "REAL";
    if (/DECIMAL|NUMERIC|MONEY/.test(base)) return "NUMERIC";
    if (/BOOL/.test(base)) return "INTEGER";
    // SQLite stores dates and times as TEXT; that is the documented idiom.
    return "TEXT";
  }

  if (dialect === "mysql") {
    if (base === "VARCHAR") {
      // MySQL requires a length, and caps a utf8mb4 index key well below 65535.
      const n = args ? Number(args.replace(/[()]/g, "")) : 255;
      return Number.isFinite(n) && n > 0 ? (n > 4000 ? "TEXT" : `VARCHAR(${n})`) : "VARCHAR(255)";
    }
    if (base === "CHAR") return `CHAR${args ?? "(1)"}`;
    if (base === "TEXT") return "TEXT";
    if (base === "BOOLEAN" || base === "BOOL") return "TINYINT(1)";
    if (base === "TIMESTAMP") return "DATETIME";
    if (base === "SMALLINT") return "SMALLINT";
    if (base === "INT" || base === "INTEGER") return "INT";
    if (base === "BIGINT") return "BIGINT";
    if (base === "DECIMAL" || base === "NUMERIC") return `DECIMAL${args ?? "(19,4)"}`;
    if (base === "DOUBLE PRECISION" || base === "DOUBLE") return "DOUBLE";
    if (base === "DATE") return "DATE";
    if (base === "TIME") return "TIME";
    return args ? `${base}${args}` : base;
  }

  // PostgreSQL and DuckDB both take the manifest types as written; only the
  // bare VARCHAR needs help, since PostgreSQL treats it as unlimited (fine)
  // and DuckDB likewise.
  if (base === "DOUBLE") return "DOUBLE PRECISION";
  return args ? `${base}${args}` : base;
}

// ------------------------------------------------------------------ DDL

export interface SchemaSource {
  tables: ManifestTable[];
  foreignKeys: ManifestForeignKey[];
  schemas: string[];
}

function columnLine(column: ManifestColumn, dialect: DialectId): string {
  const type = mapType(column.type, dialect);
  const notNull = column.notNull ? " NOT NULL" : "";
  return `  ${quoteIdent(column.name, dialect)} ${type}${notNull}`;
}

/** CREATE SCHEMA + CREATE TABLE + primary keys, in dependency-safe order. */
export function buildSchemaSql(source: SchemaSource, dialect: DialectId): string {
  const lines: string[] = [];

  if (!FLATTENS_SCHEMAS[dialect] && source.schemas.length) {
    for (const schema of source.schemas) {
      lines.push(`CREATE SCHEMA IF NOT EXISTS ${quoteIdent(schema, dialect)};`);
    }
    lines.push("");
  }

  if (dialect === "mysql" && source.schemas.length) {
    lines.push(
      "-- MySQL has no schemas inside a database, so schema-qualified tables",
      "-- are flattened to schema_table names.",
      "",
    );
  }

  for (const table of source.tables) {
    const cols = table.columns.map((c) => columnLine(c, dialect));

    // A key is only usable if every column it names survived curation. An inline
    // PRIMARY KEY naming a missing column makes the whole CREATE TABLE fail.
    const present = new Set(table.columns.map((c) => c.name));
    const key = table.primaryKey.filter((c) => present.has(c));
    if (key.length && key.length === table.primaryKey.length) {
      cols.push(`  PRIMARY KEY (${key.map((c) => quoteIdent(c, dialect)).join(", ")})`);
    }

    lines.push(`CREATE TABLE ${tableName(table, dialect)} (`, cols.join(",\n"), `);`, "");
  }

  return lines.join("\n");
}

/**
 * Foreign keys, kept separate so they can be applied after loading.
 *
 * Some of these sources carry orphan rows, so a few constraints will be
 * rejected. That is worth saying out loud in the file rather than letting the
 * script die halfway.
 */
export function buildKeysSql(source: SchemaSource, dialect: DialectId): string {
  if (dialect === "csv") return "";

  const byName = new Map(source.tables.map((t) => [`${t.schema}.${t.name}`, t]));
  const lines: string[] = [
    "-- Run this after loading the data.",
    "--",
    "-- A few of these can fail: the upstream sources contain orphan rows that",
    "-- reference parents that were never exported. Skip any that are rejected;",
    "-- the relationship is still documented here.",
    "",
  ];

  if (dialect === "sqlite") {
    lines.push(
      "-- SQLite cannot add a foreign key to an existing table. These are listed",
      "-- for reference; to enforce them, fold them into the CREATE TABLE in",
      "-- schema.sql before loading.",
      "",
    );
  }

  let count = 0;
  for (const fk of source.foreignKeys) {
    const from = byName.get(fk.fromTable);
    const to = byName.get(fk.toTable);
    if (!from || !to) continue;

    // Same guard as the primary keys: skip anything naming a dropped column.
    const fromHas = new Set(from.columns.map((c) => c.name));
    const toHas = new Set(to.columns.map((c) => c.name));
    if (!fk.fromColumns.every((c) => fromHas.has(c))) continue;
    if (!fk.toColumns.every((c) => toHas.has(c))) continue;
    count++;

    const fromCols = fk.fromColumns.map((c) => quoteIdent(c, dialect)).join(", ");
    const toCols = fk.toColumns.map((c) => quoteIdent(c, dialect)).join(", ");
    const statement =
      `ALTER TABLE ${tableName(from, dialect)} ADD ` +
      `FOREIGN KEY (${fromCols}) REFERENCES ${tableName(to, dialect)} (${toCols});`;

    lines.push(dialect === "sqlite" ? `-- ${statement}` : statement);
  }

  return count ? lines.join("\n") + "\n" : "";
}

// ------------------------------------------------------------------ loading

/** The engine-specific incantation for bulk-loading the CSVs. */
export function buildLoadSql(source: SchemaSource, dialect: DialectId): string {
  const head = (note: string[]) => [
    "-- Load the CSVs into the tables from schema.sql.",
    ...note,
    "",
  ];

  if (dialect === "postgres") {
    const lines = head([
      "--",
      "-- \\copy runs client-side in psql, so the paths are relative to wherever",
      "-- you launched psql from. Run this from the folder you unzipped.",
      "--",
      "--   psql -d yourdb -f schema.sql -f load.sql -f keys.sql",
    ]);
    for (const table of source.tables) {
      lines.push(
        `\\copy ${tableName(table, "postgres")} FROM 'data/${csvFileName(table)}' WITH (FORMAT csv, HEADER true, NULL '');`,
      );
    }
    return lines.join("\n") + "\n";
  }

  if (dialect === "duckdb") {
    const lines = head([
      "--",
      "--   duckdb mydb.duckdb",
      "--   .read schema.sql",
      "--   .read load.sql",
    ]);
    for (const table of source.tables) {
      lines.push(
        `INSERT INTO ${tableName(table, "duckdb")} SELECT * FROM read_csv('data/${csvFileName(table)}', header = true, nullstr = '');`,
      );
    }
    return lines.join("\n") + "\n";
  }

  if (dialect === "mysql") {
    const lines = head([
      "--",
      "-- LOAD DATA LOCAL INFILE needs the client flag enabled:",
      "--   mysql --local-infile=1 -u you -p yourdb < load.sql",
      "-- and the server may require: SET GLOBAL local_infile = 1;",
    ]);
    for (const table of source.tables) {
      // Empty CSV fields must be turned into real NULLs, which MySQL only does
      // by reading each column into a user variable first.
      const vars = table.columns.map((c: ManifestColumn) => `@${c.name}`).join(", ");
      const sets = table.columns
        .map((c: ManifestColumn) => `  ${quoteIdent(c.name, "mysql")} = NULLIF(@${c.name}, '')`)
        .join(",\n");
      lines.push(
        `LOAD DATA LOCAL INFILE 'data/${csvFileName(table)}'`,
        `INTO TABLE ${tableName(table, "mysql")}`,
        `FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'`,
        `LINES TERMINATED BY '\\n'`,
        `IGNORE 1 LINES`,
        `(${vars})`,
        `SET`,
        sets + ";",
        "",
      );
    }
    return lines.join("\n") + "\n";
  }

  if (dialect === "sqlite") {
    const lines = [
      "-- Run inside the sqlite3 shell, from the folder you unzipped:",
      "--",
      "--   sqlite3 mydb.sqlite",
      "--   .read schema.sql",
      "--   .read load.sql",
      "--",
      "-- .import is a shell command, not SQL, so this file only works via .read.",
      ".mode csv",
      "",
    ];
    for (const table of source.tables) {
      // --skip 1 keeps the header out of the data now that the table exists.
      lines.push(
        `.import --csv --skip 1 data/${csvFileName(table)} ${table.schema && table.schema !== "public" && table.schema !== "main" ? `${table.schema}_${table.name}` : table.name}`,
      );
    }
    lines.push("", ".mode column");
    return lines.join("\n") + "\n";
  }

  return "";
}
