import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { gzip } from "node:zlib";
import { promisify } from "node:util";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";

export const gzipAsync = promisify(gzip);

export const CACHE = path.resolve("scripts/datasets/.cache");
export const OUT_DATA = path.resolve("public/datasets");
export const OUT_SRC = path.resolve("src/components/sql-playground/db/datasets");

export async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

export async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

/** Download once into the cache; later runs reuse it so the script is re-runnable offline. */
export async function download(url, filename) {
  await ensureDir(CACHE);
  const target = path.join(CACHE, filename);
  if (await exists(target)) return target;

  process.stdout.write(`  fetching ${filename} … `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(target));
  const { size } = await stat(target);
  console.log(`${mb(size)}`);
  return target;
}

export const mb = (bytes) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;

// ------------------------------------------------------------------ CSV

/**
 * Quote a field for RFC 4180 output.
 *
 * NUL bytes are stripped: they turn up inside AdventureWorks hierarchyid
 * columns, and PostgreSQL text cannot store them at all ("invalid byte
 * sequence for encoding UTF8: 0x00").
 */
export function csvField(value) {
  if (value === null || value === undefined) return "";
  const s = String(value).replace(/\0/g, "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header, rows) {
  const out = [header.map(csvField).join(",")];
  for (const row of rows) out.push(row.map(csvField).join(","));
  return out.join("\n") + "\n";
}

/**
 * Parse a delimited file where fields are never quoted, which is the shape of
 * the AdventureWorks exports. `rowSep` handles the "+|"/"&|" variant that
 * Microsoft uses for tables whose text contains tabs or newlines.
 */
export function parseDelimited(text, { fieldSep, rowSep }) {
  const rows = [];
  for (const raw of text.split(rowSep)) {
    if (raw === "" || raw === "\n") continue;
    const line = raw.replace(/^\r?\n/, "");
    if (!line.trim() && rows.length) continue;
    rows.push(line.split(fieldSep));
  }
  return rows;
}

/**
 * Tab-delimited AdventureWorks files with unquoted free text: a few of them
 * (ProductReview, for one) contain raw newlines inside a comment, so a plain
 * split on "\n" tears one review into several broken rows.
 *
 * Rows are instead accumulated until the tab count completes a record. That is
 * reliable here because the exports switch to the "+|" format whenever a field
 * can contain a tab, so tab count is an exact record delimiter.
 */
export function parseTabRows(text, expectedFields) {
  const rows = [];
  const wanted = expectedFields - 1; // tabs per complete row
  let buffer = "";
  let tabs = 0;

  for (const line of text.split("\n")) {
    const lineTabs = (line.match(/\t/g) ?? []).length;
    if (buffer === "" && lineTabs === 0 && line.trim() === "") continue;

    buffer = buffer === "" ? line : `${buffer}\n${line}`;
    tabs += lineTabs;

    if (tabs >= wanted) {
      const fields = buffer.split("\t");
      // More fields than the schema wants means a stray tab; fold the surplus
      // back into the last column rather than shifting everything left.
      if (fields.length > expectedFields) {
        const head = fields.slice(0, expectedFields - 1);
        head.push(fields.slice(expectedFields - 1).join("\t"));
        rows.push(head);
      } else {
        rows.push(fields);
      }
      buffer = "";
      tabs = 0;
    }
  }

  if (buffer.trim()) rows.push(buffer.split("\t"));
  return rows;
}

/** Minimal RFC 4180 reader, for the Olist and Bike Store sources. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  let i = 0;

  if (text.charCodeAt(0) === 0xfeff) i = 1; // strip BOM

  while (i < text.length) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
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
    if (ch === '"') {
      quoted = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ------------------------------------------------------------------ output

/** Write one table's data as gzipped CSV and report what it cost. */
export async function writeTable(datasetId, tableName, header, rows) {
  const dir = path.join(OUT_DATA, datasetId);
  await ensureDir(dir);
  const csv = toCsv(header, rows);
  const gz = await gzipAsync(csv, { level: 9 });
  await writeFile(path.join(dir, `${tableName}.csv.gz`), gz);
  return { rows: rows.length, bytes: gz.length, rawBytes: Buffer.byteLength(csv) };
}

export async function writeSource(filename, contents) {
  await ensureDir(OUT_SRC);
  await writeFile(path.join(OUT_SRC, filename), contents);
}

export async function readCached(filename, encoding = "utf8") {
  return readFile(path.join(CACHE, filename), encoding);
}

/** Normalise the timestamps AdventureWorks exports: "2019-04-30 00:00:00.000". */
export function cleanTimestamp(value) {
  if (!value) return "";
  return value.replace(/\.000$/, "").replace(/ 00:00:00$/, "");
}

export const banner = (name) => {
  console.log(`\n── ${name} ${"─".repeat(Math.max(0, 46 - name.length))}`);
};
