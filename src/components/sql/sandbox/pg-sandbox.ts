import type { QueryResult } from "@/components/sql-playground/db/db-client";

/** A query that runs longer than this is stopped by terminating its worker. */
const QUERY_TIMEOUT_MS = 5000;
const BOOT_TIMEOUT_MS = 60000;

type Reply =
  | { id: number; ok: true; rows?: any[]; fields?: { name: string; type: string }[]; truncated?: boolean }
  | { id: number; ok: false; error: string };

/**
 * Client for the isolated lesson sandbox. One worker per page; if a query
 * overruns or the worker dies, the worker is discarded and a fresh one is
 * started on the next call, so a learner can always try again.
 */
class PgSandbox {
  private worker: Worker | null = null;
  private nextId = 1;
  private booted: Promise<void> | null = null;

  private start() {
    this.worker = new Worker(new URL("./pg-sandbox.worker.ts", import.meta.url), { type: "module" });
  }

  private discard() {
    this.worker?.terminate();
    this.worker = null;
    this.booted = null;
  }

  private send(message: { type: "init" } | { type: "query"; sql: string }, timeoutMs: number): Promise<Reply> {
    if (!this.worker) this.start();
    const worker = this.worker!;
    const id = this.nextId++;
    return new Promise<Reply>((resolve) => {
      const done = (reply: Reply) => {
        clearTimeout(timer);
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        resolve(reply);
      };
      const onMessage = (e: MessageEvent<Reply>) => {
        if (e.data.id === id) done(e.data);
      };
      const onError = () => {
        if (this.worker === worker) this.discard();
        done({ id, ok: false, error: "The SQL sandbox stopped unexpectedly. Run your query again." });
      };
      const timer = setTimeout(() => {
        if (this.worker === worker) this.discard();
        done({
          id,
          ok: false,
          error: `The query ran for more than ${timeoutMs / 1000} seconds and was stopped. Check for a missing join condition or a very large series.`,
        });
      }, timeoutMs);
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError);
      worker.postMessage({ id, ...message });
    });
  }

  /** Start the worker and load the dataset. Safe to call repeatedly. */
  init(): Promise<void> {
    if (!this.booted) {
      this.booted = this.send({ type: "init" }, BOOT_TIMEOUT_MS).then((reply) => {
        if (!reply.ok) {
          this.booted = null;
          throw new Error(reply.error);
        }
      });
    }
    return this.booted;
  }

  async run(sql: string): Promise<QueryResult> {
    const started = performance.now();
    const base: QueryResult = {
      rows: [],
      fields: [],
      executionTimeMs: 0,
      statementCount: 1,
      isCommand: false,
      sql,
    };
    try {
      await this.init();
    } catch (e: any) {
      return { ...base, error: String(e?.message ?? e) };
    }
    const reply = await this.send({ type: "query", sql }, QUERY_TIMEOUT_MS);
    const executionTimeMs = performance.now() - started;
    if (!reply.ok) return { ...base, executionTimeMs, error: reply.error };
    return { ...base, executionTimeMs, rows: reply.rows ?? [], fields: reply.fields ?? [] };
  }

  dispose() {
    this.discard();
  }
}

export const pgSandbox = new PgSandbox();
