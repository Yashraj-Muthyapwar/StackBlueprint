import { PGlite } from "@electric-sql/pglite";
import * as duckdb from "@duckdb/duckdb-wasm";
import type { DatasetId } from "./datasets";
import { loadIntoDuckDB, loadIntoPostgres, type LoadProgress } from "./datasets/loader";
import { locateError } from "./error-location";

export type Engine = "postgres" | "duckdb";

export interface Field {
  name: string;
  type: string;
}

export interface QueryResult {
  rows: any[];
  fields: Field[];
  error?: string;
  /** A plain-English nudge for common mistakes, shown under the error. */
  hint?: string;
  executionTimeMs: number;
  /** How many statements ran; > 1 means only the last one's rows are shown. */
  statementCount: number;
  /** For INSERT/UPDATE/DELETE, when the engine reports it. */
  affectedRows?: number;
  /** True when the statement returned no result set (DDL/DML). */
  isCommand: boolean;
  sql: string;
  /** Character range of the error within `sql`, when it could be located. */
  errorSpan?: { from: number; to: number };
}

export type EngineStatus = "idle" | "booting" | "loading" | "ready" | "failed";

/** Identifies one loaded database: an engine holding a particular dataset. */
export type SessionKey = `${Engine}:${DatasetId}`;

export interface EngineState {
  status: EngineStatus;
  /** 0..1 while loading. */
  progress: number;
  /** What the loader is doing right now. */
  label: string;
  detail?: string;
}

// ------------------------------------------------------------------ helpers

/**
 * Split a script into statements on top-level semicolons, respecting single
 * quotes, double-quoted identifiers, line/block comments and $$ dollar quoting.
 */
export interface StatementRange {
  /** Offsets into the original text, trimmed to the statement itself. */
  from: number;
  to: number;
  text: string;
}

/**
 * Locate every statement in a script, keeping its offsets.
 *
 * Offsets are what let the editor underline the right statement, run just the
 * one under the cursor, and put an error marker where the error actually is.
 */
export function statementRanges(sql: string): StatementRange[] {
  const out: StatementRange[] = [];
  let start = 0;
  let i = 0;

  const push = (end: number) => {
    const raw = sql.slice(start, end);
    const leading = raw.length - raw.trimStart().length;
    const trailing = raw.length - raw.trimEnd().length;
    const text = raw.trim();
    if (text && stripNoise(text).length > 0) {
      out.push({ from: start + leading, to: end - trailing, text });
    }
  };

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (ch === "-" && next === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? sql.length : nl;
      continue;
    }
    if (ch === "/" && next === "*") {
      const close = sql.indexOf("*/", i + 2);
      i = close === -1 ? sql.length : close + 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === quote) {
          if (sql[j + 1] === quote)
            j += 2; // escaped by doubling
          else break;
        } else j++;
      }
      i = j + 1;
      continue;
    }
    if (ch === "$") {
      const tag = /^\$[A-Za-z_]*\$/.exec(sql.slice(i));
      if (tag) {
        const close = sql.indexOf(tag[0], i + tag[0].length);
        i = close === -1 ? sql.length : close + tag[0].length;
        continue;
      }
    }
    if (ch === ";") {
      push(i);
      start = i + 1;
      i++;
      continue;
    }
    i++;
  }

  push(sql.length);
  return out;
}

/** The statement containing (or nearest before) a cursor offset. */
export function statementAt(sql: string, cursor: number): StatementRange | null {
  const ranges = statementRanges(sql);
  if (ranges.length === 0) return null;
  for (const range of ranges) {
    if (cursor >= range.from && cursor <= range.to) return range;
  }
  // Between statements, or in trailing whitespace: take the one just before.
  let best = ranges[0];
  for (const range of ranges) if (range.to <= cursor) best = range;
  return best;
}

export function splitStatements(sql: string): string[] {
  return statementRanges(sql).map((r) => r.text);
}

/** Remove comments and whitespace, to test whether a statement has any substance. */
export function stripNoise(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .trim();
}

/** Postgres type OIDs we are likely to meet, for a friendlier column header. */
const PG_OID: Record<number, string> = {
  16: "bool",
  20: "int8",
  21: "int2",
  23: "int4",
  25: "text",
  700: "float4",
  701: "float8",
  1042: "bpchar",
  1043: "varchar",
  1082: "date",
  1114: "timestamp",
  1184: "timestamptz",
  1700: "numeric",
  114: "json",
  3802: "jsonb",
  2950: "uuid",
  1005: "int2[]",
  1007: "int4[]",
  1016: "int8[]",
  1009: "text[]",
};

const DUCK_TYPE: Record<string, string> = {
  Int8: "tinyint",
  Int16: "smallint",
  Int32: "int",
  Int64: "bigint",
  Uint8: "utinyint",
  Uint16: "usmallint",
  Uint32: "uint",
  Uint64: "ubigint",
  Float32: "float",
  Float64: "double",
  Utf8: "varchar",
  Bool: "boolean",
};

/**
 * Arrow hands DECIMAL back as a 128-bit integer wrapper whose string form is the
 * *unscaled* value: 11410.30 arrives as "1141030" with scale 2. Put the point back.
 */
function decodeDecimal(value: any, scale: number): number | string | null {
  if (value === null || value === undefined) return null;
  // Note: Arrow's BigNum.toJSON() wraps the digits in literal quote characters,
  // so toString() is the one that gives a clean unscaled integer.
  let digits = String(value).replace(/"/g, "");
  if (!/^-?\d+$/.test(digits)) {
    const n = Number(digits);
    return Number.isFinite(n) ? n : digits;
  }
  const negative = digits.startsWith("-");
  if (negative) digits = digits.slice(1);
  if (scale <= 0) return Number((negative ? "-" : "") + digits);

  const padded = digits.padStart(scale + 1, "0");
  const text = `${negative ? "-" : ""}${padded.slice(0, -scale)}.${padded.slice(-scale)}`;
  const n = Number(text);
  return Number.isFinite(n) ? n : text;
}

/**
 * Arrow encodes DATE either as days since the epoch (Date32<DAY>) or as
 * milliseconds (Date64<MILLISECOND>); DuckDB uses the latter. Getting the unit
 * wrong overflows the Date constructor, so read it from the type.
 */
function decodeDate(value: any, millis: boolean): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString().slice(0, 10);
  }
  const raw = Number(value);
  if (!Number.isFinite(raw)) return String(value);

  const render = (ms: number): string | null => {
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return null;
    const year = date.getUTCFullYear();
    // Anything outside this window means the unit was wrong, not the data.
    return year >= 1400 && year <= 2400 ? date.toISOString().slice(0, 10) : null;
  };

  // Try the unit the type claims, then the other plausible encodings. The
  // magnitudes are far enough apart that only one of them lands in range.
  const candidates = millis ? [raw, raw * 86400000, raw * 1000] : [raw * 86400000, raw, raw * 1000];

  for (const ms of candidates) {
    const text = render(ms);
    if (text) return text;
  }
  return String(value);
}

/** Pick a per-column decoder once, instead of sniffing every single cell. */
function duckDecoder(type: any): (v: any) => any {
  const name = String(type);
  // Arrow prints decimals as "Decimal[38e+2]": precision, then the scale with an
  // explicit sign. The .scale property does not survive the worker boundary
  // intact, so read the printed form.
  const printed = /^Decimal\[\d+e([+-]?\d+)\]$/i.exec(name);
  const scale = typeof type?.scale === "number" ? type.scale : printed ? Number(printed[1]) : null;

  if (scale !== null && Number.isFinite(scale)) {
    return (v) => decodeDecimal(v, scale);
  }
  if (/^Date/i.test(name)) {
    // "Date32<DAY>" vs "Date64<MILLISECOND>".
    const millis = /millisecond/i.test(name) || /^Date64/i.test(name);
    return (v) => decodeDate(v, millis);
  }
  return normalize;
}

function duckTypeName(t: any): string {
  const raw = String(t);
  if (DUCK_TYPE[raw]) return DUCK_TYPE[raw];
  // "Decimal[38e+2]" reads better to a SQL learner as "decimal(38,2)".
  const decimal = /^Decimal\[(\d+)e([+-]?\d+)\]$/i.exec(raw);
  if (decimal) return `decimal(${decimal[1]},${Math.abs(Number(decimal[2]))})`;
  if (raw.startsWith("Date")) return "date";
  if (raw.startsWith("Timestamp")) return "timestamp";
  return raw.toLowerCase();
}

/**
 * Normalise engine-specific cell values into things React and JSON can handle.
 * BigInt in particular will throw the moment anything tries to serialise it.
 */
function normalize(v: any): any {
  if (v === null || v === undefined) return null;
  if (typeof v === "bigint") {
    return v >= BigInt(Number.MIN_SAFE_INTEGER) && v <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(v)
      : v.toString();
  }
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    const iso = v.toISOString();
    // Drop a midnight time component: a DATE should not read as a timestamp.
    return iso.slice(11, 19) === "00:00:00"
      ? iso.slice(0, 10)
      : `${iso.slice(0, 10)} ${iso.slice(11, 19)}`;
  }
  if (v instanceof Uint8Array)
    return `\\x${Array.from(v)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`;
  if (Array.isArray(v)) return v.map(normalize);
  if (typeof v === "object") {
    // Arrow's 128-bit integer wrapper (HUGEINT and friends).
    if ((v as any)[Symbol.for("isArrowBigNum")]) {
      const digits = String(v).replace(/"/g, "");
      const n = Number(digits);
      return Number.isSafeInteger(n) ? n : digits;
    }
    // Arrow structs / JSON columns
    try {
      return JSON.stringify(v, (_k, val) => (typeof val === "bigint" ? val.toString() : val));
    } catch {
      return String(v);
    }
  }
  return v;
}

/** Turn a raw engine error into something a learner can act on. */
export function errorHint(message: string, engine: Engine): string | undefined {
  const m = message.toLowerCase();
  if (m.includes("does not exist") && m.includes("relation")) {
    return "That table isn't in this database. The Explorer on the left lists everything available.";
  }
  if (
    m.includes("catalog error") ||
    (m.includes("table with name") && m.includes("does not exist"))
  ) {
    return "That table isn't in this database. The Explorer on the left lists everything available.";
  }
  if (m.includes("column") && (m.includes("does not exist") || m.includes("not found"))) {
    return "Check the column name against the Explorer. Aliases you define in SELECT can't be used in WHERE.";
  }
  if (m.includes("must appear in the group by") || m.includes("not found in from clause")) {
    return "Every non-aggregated column in SELECT has to appear in GROUP BY, or be wrapped in an aggregate.";
  }
  if (m.includes("syntax error")) {
    return engine === "duckdb"
      ? "DuckDB parses close to Postgres, but not identically. Check quoting and any Postgres-only syntax."
      : "Check for a missing comma, an unclosed quote, or a keyword in the wrong clause.";
  }
  if (m.includes("qualify")) {
    return "QUALIFY is a DuckDB extension. On PostgreSQL, wrap the window function in a subquery and filter outside it.";
  }
  if (m.includes("distinct on")) {
    return "DISTINCT ON is PostgreSQL-only. On DuckDB, use QUALIFY with ROW_NUMBER() instead.";
  }
  if (m.includes("division by zero")) {
    return "Guard the denominator, e.g. NULLIF(denominator, 0).";
  }
  return undefined;
}

// ------------------------------------------------------------------ handles

interface Handle {
  engine: Engine;
  exec(sql: string): Promise<{ rows: any[]; fields: Field[]; affected?: number }>;
  reload(): Promise<void>;
  dispose(): Promise<void>;
}

async function bootPostgres(
  dataset: DatasetId,
  onProgress: (p: LoadProgress) => void,
  onStage: (s: EngineStatus) => void,
): Promise<Handle> {
  onStage("booting");
  const pg = new PGlite();
  await pg.waitReady;

  onStage("loading");
  await loadIntoPostgres(pg, dataset, onProgress);
  onStage("ready");

  return {
    engine: "postgres",
    async exec(sql: string) {
      const res: any = await pg.query(sql);
      return {
        rows: (res.rows ?? []).map((row: any) => {
          const out: any = {};
          for (const k of Object.keys(row)) out[k] = normalize(row[k]);
          return out;
        }),
        fields: (res.fields ?? []).map((f: any) => ({
          name: f.name,
          type: PG_OID[f.dataTypeID] ?? String(f.dataTypeID ?? "unknown"),
        })),
        affected: typeof res.affectedRows === "number" ? res.affectedRows : undefined,
      };
    },
    async reload() {
      // Drop every user schema, not just public: these datasets bring their own.
      const schemas: any = await pg.query(
        `SELECT nspname FROM pg_namespace
         WHERE nspname NOT IN ('pg_catalog','information_schema','pg_toast')
           AND nspname NOT LIKE 'pg_temp%' AND nspname NOT LIKE 'pg_toast_temp%'`,
      );
      for (const row of schemas.rows ?? []) {
        await pg.exec(`DROP SCHEMA IF EXISTS "${row.nspname}" CASCADE;`);
      }
      await pg.exec("CREATE SCHEMA public;");
      await loadIntoPostgres(pg, dataset, onProgress);
    },
    async dispose() {
      await pg.close();
    },
  };
}

async function bootDuckDB(
  dataset: DatasetId,
  onProgress: (p: LoadProgress) => void,
  onStage: (s: EngineStatus) => void,
): Promise<Handle> {
  onStage("booting");
  const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker!}");`], { type: "text/javascript" }),
  );
  const worker = new Worker(workerUrl);
  const database = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
  await database.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(workerUrl);

  // One long-lived connection: temp tables and settings survive between runs.
  const conn = await database.connect();

  onStage("loading");
  await loadIntoDuckDB(database, conn, dataset, onProgress);
  onStage("ready");

  return {
    engine: "duckdb",
    async exec(sql: string) {
      const table = await conn.query(sql);
      const fields: Field[] = table.schema.fields.map((f: any) => ({
        name: f.name,
        type: duckTypeName(f.type),
      }));
      const decoders = table.schema.fields.map((f: any) => duckDecoder(f.type));
      const rows = table.toArray().map((r: any) => {
        const obj = r.toJSON();
        const out: any = {};
        fields.forEach((f, i) => {
          out[f.name] = decoders[i](obj[f.name]);
        });
        return out;
      });
      // DuckDB reports DML counts as a single "Count" column.
      const affected =
        fields.length === 1 && fields[0].name === "Count" && rows.length === 1
          ? Number(rows[0].Count)
          : undefined;
      return { rows, fields, affected };
    },
    async reload() {
      const views = await conn.query(
        `SELECT table_schema, table_name, table_type FROM information_schema.tables
         WHERE table_schema NOT IN ('information_schema','pg_catalog','system','temp')`,
      );
      for (const row of views.toArray()) {
        const r: any = row.toJSON();
        const kind = String(r.table_type).includes("VIEW") ? "VIEW" : "TABLE";
        await conn.query(`DROP ${kind} IF EXISTS "${r.table_schema}"."${r.table_name}" CASCADE`);
      }
      await loadIntoDuckDB(database, conn, dataset, onProgress);
    },
    async dispose() {
      await conn.close();
      await database.terminate();
      await worker.terminate();
    },
  };
}

// ------------------------------------------------------------------ client

type StateListener = (key: SessionKey, state: EngineState) => void;

const IDLE: EngineState = { status: "idle", progress: 0, label: "" };

class DBClient {
  private handles = new Map<SessionKey, Promise<Handle>>();
  private states = new Map<SessionKey, EngineState>();
  private listeners = new Set<StateListener>();
  /** Sessions in creation order, so the oldest can be evicted under memory pressure. */
  private order: SessionKey[] = [];

  /** How many engine+dataset combinations to keep warm at once. */
  private static readonly MAX_SESSIONS = 3;

  onState(fn: StateListener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(key: SessionKey, patch: Partial<EngineState>) {
    const next = { ...(this.states.get(key) ?? IDLE), ...patch };
    this.states.set(key, next);
    for (const fn of this.listeners) fn(key, next);
  }

  stateOf(engine: Engine, dataset: DatasetId): EngineState {
    return this.states.get(`${engine}:${dataset}`) ?? IDLE;
  }

  /** True when this combination is already loaded, so switching is instant. */
  isWarm(engine: Engine, dataset: DatasetId): boolean {
    return this.states.get(`${engine}:${dataset}`)?.status === "ready";
  }

  /**
   * Boot an engine holding a dataset. Memoised per combination, so flipping
   * between two you have already opened is instant. A failed boot is dropped so
   * the next attempt can retry.
   */
  init(engine: Engine, dataset: DatasetId): Promise<Handle> {
    const key: SessionKey = `${engine}:${dataset}`;
    const existing = this.handles.get(key);
    if (existing) return existing;

    this.emit(key, { status: "booting", progress: 0, label: "starting engine", detail: undefined });

    const boot = engine === "postgres" ? bootPostgres : bootDuckDB;
    const booted = boot(
      dataset,
      (p) => this.emit(key, { progress: p.fraction, label: p.label }),
      (stage) => this.emit(key, { status: stage }),
    )
      .then((handle) => {
        this.emit(key, { status: "ready", progress: 1, label: "ready" });
        return handle;
      })
      .catch((e) => {
        this.handles.delete(key);
        this.order = this.order.filter((k) => k !== key);
        this.emit(key, {
          status: "failed",
          progress: 0,
          label: "failed",
          detail: e?.message ?? String(e),
        });
        throw e;
      });

    this.handles.set(key, booted);
    this.order.push(key);
    void this.evictIfNeeded(key);
    return booted;
  }

  /**
   * Each live session holds a WASM heap, and the bigger datasets are hundreds of
   * megabytes once loaded. Keep a few warm and retire the rest.
   */
  private async evictIfNeeded(keep: SessionKey) {
    while (this.order.length > DBClient.MAX_SESSIONS) {
      const victim = this.order.find((k) => k !== keep);
      if (!victim) return;
      this.order = this.order.filter((k) => k !== victim);
      const handle = this.handles.get(victim);
      this.handles.delete(victim);
      this.states.delete(victim);
      this.emit(victim, IDLE);
      try {
        await (await handle)?.dispose();
      } catch {
        // A session that will not close cleanly is still gone from our map.
      }
    }
  }

  /**
   * Run a script. Statements execute in order; the result of the last one that
   * produced a result set is returned, so `CREATE ...; INSERT ...; SELECT ...`
   * shows the SELECT. Errors are returned, never thrown.
   */
  async run(engine: Engine, dataset: DatasetId, sql: string): Promise<QueryResult> {
    const ranges = statementRanges(sql);
    const statements = ranges.map((r) => r.text);
    const started = performance.now();

    const empty: QueryResult = {
      rows: [],
      fields: [],
      executionTimeMs: 0,
      statementCount: 0,
      isCommand: true,
      sql,
    };
    if (statements.length === 0) {
      return {
        ...empty,
        error: "Nothing to run.",
        hint: "Type a query, or pick one from the Explorer.",
      };
    }

    let handle: Handle;
    try {
      handle = await this.init(engine, dataset);
    } catch (e: any) {
      return {
        ...empty,
        executionTimeMs: performance.now() - started,
        error: `Could not start ${engine === "postgres" ? "PostgreSQL" : "DuckDB"}: ${e?.message ?? e}`,
        hint:
          engine === "duckdb"
            ? "DuckDB downloads its WebAssembly build from a CDN on first use. Check the network tab."
            : undefined,
      };
    }

    let last: { rows: any[]; fields: Field[]; affected?: number } | null = null;
    let lastWithRows: { rows: any[]; fields: Field[]; affected?: number } | null = null;

    for (const [index, stmt] of statements.entries()) {
      try {
        last = await handle.exec(stmt);
        if (last.fields.length > 0) lastWithRows = last;
      } catch (e: any) {
        const message = String(e?.message ?? e);
        const range = ranges[index];
        // Drivers report the position within the single statement they ran, so
        // shift it by where that statement starts in the submitted text.
        const local = locateError(
          stmt,
          message,
          typeof e?.position === "number" ? e.position : undefined,
        );
        const errorSpan = local
          ? { from: range.from + local.from, to: range.from + local.to }
          : undefined;

        return {
          rows: [],
          fields: [],
          error:
            statements.length > 1
              ? `Statement ${index + 1} of ${statements.length}: ${message}`
              : message,
          hint: errorHint(message, engine),
          executionTimeMs: performance.now() - started,
          statementCount: statements.length,
          isCommand: true,
          sql,
          errorSpan,
        };
      }
    }

    const chosen = lastWithRows ?? last!;
    return {
      rows: chosen.rows,
      fields: chosen.fields,
      executionTimeMs: performance.now() - started,
      statementCount: statements.length,
      affectedRows: chosen.affected,
      isCommand: chosen.fields.length === 0,
      sql,
    };
  }

  /** Same as run(), but throws on error. For internal probes. */
  async runOrThrow(engine: Engine, dataset: DatasetId, sql: string): Promise<QueryResult> {
    const res = await this.run(engine, dataset, sql);
    if (res.error) throw new Error(res.error);
    return res;
  }

  /** Drop everything the user changed and reload the dataset from source. */
  async reset(engine: Engine, dataset: DatasetId): Promise<void> {
    const key: SessionKey = `${engine}:${dataset}`;
    const handle = await this.init(engine, dataset);
    this.emit(key, { status: "loading", progress: 0, label: "reloading" });
    await handle.reload();
    this.emit(key, { status: "ready", progress: 1, label: "ready" });
  }
}

export const db = new DBClient();
