/// <reference lib="webworker" />
// Isolated PostgreSQL for lesson practice. It lives in its own Web Worker so a
// runaway query can be stopped by terminating the worker, and in its own
// in-memory database so nothing a learner runs touches the SQL Playground.
import { PGlite } from "@electric-sql/pglite";
import { DDL, buildSeed } from "@/components/sql-playground/db/dataset";

type Request =
  | { id: number; type: "init" }
  | { id: number; type: "query"; sql: string };

const MAX_ROWS = 500;

let pg: PGlite | null = null;

function normalize(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "bigint") {
    return v >= BigInt(Number.MIN_SAFE_INTEGER) && v <= BigInt(Number.MAX_SAFE_INTEGER)
      ? Number(v)
      : v.toString();
  }
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    const iso = v.toISOString();
    return iso.slice(11, 19) === "00:00:00" ? iso.slice(0, 10) : `${iso.slice(0, 10)} ${iso.slice(11, 19)}`;
  }
  if (v instanceof Uint8Array) return "[binary]";
  if (Array.isArray(v)) return v.map(normalize);
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}

async function boot(): Promise<PGlite> {
  if (pg) return pg;
  const db = new PGlite();
  await db.waitReady;
  await db.exec(DDL);
  for (const statement of buildSeed().statements) await db.exec(statement);
  pg = db;
  return db;
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const msg = event.data;
  try {
    const db = await boot();
    if (msg.type === "init") {
      self.postMessage({ id: msg.id, ok: true });
      return;
    }

    // Defense in depth behind the query policy: the engine itself refuses writes.
    await db.exec("BEGIN TRANSACTION READ ONLY");
    try {
      const res: any = await db.query(msg.sql);
      const rows = (res.rows ?? []).slice(0, MAX_ROWS).map((row: any) => {
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(row)) out[key] = normalize(row[key]);
        return out;
      });
      self.postMessage({
        id: msg.id,
        ok: true,
        rows,
        truncated: (res.rows?.length ?? 0) > MAX_ROWS,
        fields: (res.fields ?? []).map((f: any) => ({ name: f.name, type: String(f.dataTypeID ?? "unknown") })),
      });
    } finally {
      try {
        await db.exec("ROLLBACK");
      } catch {
        // Nothing open to roll back.
      }
    }
  } catch (e: any) {
    self.postMessage({ id: msg.id, ok: false, error: String(e?.message ?? e) });
  }
};
