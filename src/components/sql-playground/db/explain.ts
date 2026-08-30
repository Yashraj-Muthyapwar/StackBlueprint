import { db, Engine, splitStatements, stripNoise } from "./db-client";
import type { DatasetId } from "./datasets";

export interface PlanNode {
  /** "Hash Join", "Seq Scan", "HASH_GROUP_BY", ... */
  type: string;
  /** Table or index the node touches, when there is one. */
  target?: string;
  /** Planner's total cost estimate. Postgres only. */
  cost?: number;
  /** Estimated rows out. */
  estimatedRows?: number;
  /** Rows actually produced, when the plan came from EXPLAIN ANALYZE. */
  actualRows?: number;
  /** Wall time for this node, milliseconds. ANALYZE only. */
  actualMs?: number;
  /** Filter / join condition / group keys, whatever the engine reported. */
  detail?: string[];
  children: PlanNode[];
}

export interface PlanResult {
  root: PlanNode | null;
  /** Raw engine text, always kept so nothing is hidden from the user. */
  raw: string;
  totalCost?: number;
  planningMs?: number;
  executionMs?: number;
  error?: string;
  analyzed: boolean;
}

/** EXPLAIN only makes sense for one statement, and only for a query. */
export function explainable(
  sql: string,
): { ok: true; sql: string } | { ok: false; reason: string } {
  const statements = splitStatements(sql);
  if (statements.length === 0)
    return { ok: false, reason: "Nothing to explain yet. Write a query and run it." };
  if (statements.length > 1) {
    return {
      ok: false,
      reason: "This is a script of several statements. Select a single query to see its plan.",
    };
  }
  const body = stripNoise(statements[0]);
  if (!/^(select|with|table|values)\b/i.test(body)) {
    return {
      ok: false,
      reason:
        "Plans are shown for queries. Statements like CREATE, INSERT or UPDATE run as a single step.",
    };
  }
  return { ok: true, sql: body.replace(/;\s*$/, "") };
}

// ------------------------------------------------------------------ postgres

function fromPostgresJson(node: any): PlanNode {
  const detail: string[] = [];
  const push = (label: string, value: any) => {
    if (value !== undefined && value !== null && String(value).length)
      detail.push(`${label}: ${value}`);
  };
  push("Filter", node["Filter"]);
  push("Index Cond", node["Index Cond"]);
  push("Hash Cond", node["Hash Cond"]);
  push("Merge Cond", node["Merge Cond"]);
  push("Join Filter", node["Join Filter"]);
  push("Recheck Cond", node["Recheck Cond"]);
  if (Array.isArray(node["Group Key"])) push("Group Key", node["Group Key"].join(", "));
  if (Array.isArray(node["Sort Key"])) push("Sort Key", node["Sort Key"].join(", "));
  push("Rows Removed by Filter", node["Rows Removed by Filter"]);

  const target =
    node["Relation Name"] && node["Alias"] && node["Alias"] !== node["Relation Name"]
      ? `${node["Relation Name"]} ${node["Alias"]}`
      : (node["Relation Name"] ?? node["Index Name"] ?? node["CTE Name"] ?? undefined);

  const loops = node["Actual Loops"] ?? 1;

  return {
    type: [
      node["Join Type"] && node["Node Type"]?.includes("Join") ? `${node["Join Type"]} ` : "",
      node["Node Type"],
    ]
      .join("")
      .trim(),
    target,
    cost: node["Total Cost"],
    estimatedRows: node["Plan Rows"],
    actualRows: node["Actual Rows"] !== undefined ? node["Actual Rows"] * loops : undefined,
    actualMs:
      node["Actual Total Time"] !== undefined ? node["Actual Total Time"] * loops : undefined,
    detail,
    children: (node["Plans"] ?? []).map(fromPostgresJson),
  };
}

async function postgresPlan(
  dataset: DatasetId,
  sql: string,
  analyze: boolean,
): Promise<PlanResult> {
  const options = analyze ? "ANALYZE, VERBOSE FALSE, COSTS, FORMAT JSON" : "COSTS, FORMAT JSON";
  const res = await db.run("postgres", dataset, `EXPLAIN (${options}) ${sql}`);

  if (res.error) return { root: null, raw: "", error: res.error, analyzed: analyze };

  // The shape here varies: Postgres hands back a json value, and depending on
  // the driver it arrives as an object, a JSON string, or an array of JSON
  // strings (one per line). Unwrap all three.
  let parsed: any = res.rows[0]?.["QUERY PLAN"];
  if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
    parsed = parsed.join("\n");
  }
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return { root: null, raw: parsed, analyzed: analyze };
    }
  }

  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!entry?.Plan) {
    return { root: null, raw: JSON.stringify(parsed, null, 2), analyzed: analyze };
  }

  return {
    root: fromPostgresJson(entry.Plan),
    raw: JSON.stringify(parsed, null, 2),
    totalCost: entry.Plan["Total Cost"],
    planningMs: entry["Planning Time"],
    executionMs: entry["Execution Time"],
    analyzed: analyze,
  };
}

// ------------------------------------------------------------------ duckdb

/** Numbers arrive as strings inside extra_info, sometimes with separators. */
function num(value: any): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

const DUCK_SKIP = new Set([
  "Table",
  "Estimated Cardinality",
  "Type",
  "__timing",
  "Timing",
  "Cardinality",
]);

function fromDuckJson(node: any): PlanNode {
  const info = node.extra_info ?? {};

  const detail: string[] = [];
  for (const [key, value] of Object.entries(info)) {
    if (DUCK_SKIP.has(key)) continue;
    const text = Array.isArray(value) ? value.join(", ") : String(value);
    if (text.trim()) detail.push(`${key}: ${text.replace(/\s+/g, " ").trim()}`);
  }

  // EXPLAIN ANALYZE adds operator_timing (seconds) and operator_cardinality.
  const seconds = num(node.operator_timing ?? info["__timing"] ?? info["Timing"]);

  return {
    type: node.name ?? node.operator_type ?? "Operator",
    target: typeof info["Table"] === "string" ? info["Table"].split(".").pop() : undefined,
    estimatedRows: num(info["Estimated Cardinality"] ?? node.estimated_cardinality),
    actualRows: num(node.operator_cardinality ?? info["Cardinality"]),
    actualMs: seconds !== undefined ? seconds * 1000 : undefined,
    detail,
    children: (node.children ?? []).map(fromDuckJson),
  };
}

async function duckdbPlan(dataset: DatasetId, sql: string, analyze: boolean): Promise<PlanResult> {
  // DuckDB emits a nested JSON plan, which beats parsing its box-drawing output.
  const res = await db.run(
    "duckdb",
    dataset,
    `EXPLAIN (FORMAT json) ${analyze ? "ANALYZE " : ""}${sql}`,
  );

  const textFallback = async (): Promise<PlanResult> => {
    const plain = await db.run("duckdb", dataset, `EXPLAIN ${analyze ? "ANALYZE " : ""}${sql}`);
    if (plain.error) return { root: null, raw: "", error: plain.error, analyzed: analyze };
    const raw = plain.rows
      .map((r) => {
        const values = Object.values(r).map((v) => (v == null ? "" : String(v)));
        return values[values.length - 1];
      })
      .join("\n");
    return { root: null, raw, analyzed: analyze };
  };

  if (res.error) return textFallback();

  // The plan sits in the last column of the single returned row.
  let parsed: any = res.rows[0] ? Object.values(res.rows[0]).pop() : null;
  if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
    parsed = parsed.join("\n");
  }
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return textFallback();
    }
  }
  if (Array.isArray(parsed)) parsed = parsed[0];
  if (!parsed || typeof parsed !== "object" || !parsed.name) return textFallback();

  const root = fromDuckJson(parsed);
  const totalMs = analyze ? num(parsed.latency) : undefined;

  return {
    root,
    raw: JSON.stringify(parsed, null, 2),
    executionMs: totalMs !== undefined ? totalMs * 1000 : undefined,
    analyzed: analyze,
  };
}

export async function explainQuery(
  engine: Engine,
  dataset: DatasetId,
  sql: string,
  analyze: boolean,
): Promise<PlanResult> {
  const check = explainable(sql);
  if (!check.ok) return { root: null, raw: "", error: check.reason, analyzed: analyze };
  try {
    return engine === "postgres"
      ? await postgresPlan(dataset, check.sql, analyze)
      : await duckdbPlan(dataset, check.sql, analyze);
  } catch (e: any) {
    return { root: null, raw: "", error: e?.message ?? String(e), analyzed: analyze };
  }
}

/** Deepest cost in the tree, so the cost bars have something to scale against. */
export function maxCost(node: PlanNode | null): number {
  if (!node) return 0;
  return Math.max(node.cost ?? 0, ...node.children.map(maxCost));
}

export function maxRows(node: PlanNode | null): number {
  if (!node) return 0;
  const own = Math.max(node.actualRows ?? 0, node.estimatedRows ?? 0);
  return Math.max(own, ...node.children.map(maxRows));
}
