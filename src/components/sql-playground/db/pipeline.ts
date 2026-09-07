import { db, Engine, splitStatements, stripNoise } from "./db-client";
import type { DatasetId } from "./datasets";

/**
 * Turns a SELECT into the pipeline the engine actually walks, and measures it.
 *
 * SQL is written SELECT-first but evaluated FROM-first. This module reorders the
 * clauses into evaluation order and then probes the database once per stage with
 * a COUNT(*) over the prefix of the query up to that point, so the row counts are
 * measured rather than guessed.
 */

export interface Clause {
  keyword: string;
  text: string;
  start: number;
}

export interface Stage {
  keyword: string;
  title: string;
  why: string;
  snippet: string;
  /** Rows leaving this stage. null when the probe could not run. */
  rows: number | null;
  /** How the count moved against the previous stage. */
  trend: "grow" | "shrink" | "same" | null;
  columns?: number;
}

export interface PipelineTrace {
  stages: Stage[];
  /** Set when the query is not a shape we can trace. */
  message?: string;
  /** True when we ran probe queries and the counts are real. */
  measured: boolean;
}

const KEYWORDS = [
  "WITH",
  "SELECT",
  "FROM",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "FULL JOIN",
  "INNER JOIN",
  "CROSS JOIN",
  "NATURAL JOIN",
  "JOIN",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "QUALIFY",
  "WINDOW",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "FETCH",
  "UNION ALL",
  "UNION",
  "INTERSECT",
  "EXCEPT",
].sort((a, b) => b.length - a.length);

const EXPLAIN: Record<string, [string, string]> = {
  WITH: [
    "Define CTEs",
    "Named subqueries are materialised or inlined first, so later clauses can treat them like tables.",
  ],
  FROM: [
    "Read the source",
    "The base tables enter the pipeline. Every row starts here; everything downstream only removes or reshapes.",
  ],
  JOIN: [
    "Match rows",
    "Rows are paired on the join condition. This is the one stage where the row count can go up.",
  ],
  WHERE: [
    "Filter rows",
    "A row-level filter, applied before grouping. Aggregates cannot appear here because no groups exist yet.",
  ],
  "GROUP BY": [
    "Collapse into groups",
    "Rows sharing a key fold into one group each. After this stage you are counting groups, not rows.",
  ],
  HAVING: [
    "Filter groups",
    "The same idea as WHERE, but it runs after grouping, so it can filter on aggregate results.",
  ],
  QUALIFY: [
    "Filter on windows",
    "A DuckDB extension: filter on window function output without wrapping the query in a subquery.",
  ],
  WINDOW: [
    "Name window frames",
    "Reusable OVER definitions, so several window functions can share one frame.",
  ],
  SELECT: [
    "Shape the output",
    "Only now are expressions evaluated and columns chosen. This is where column aliases come into existence.",
  ],
  "ORDER BY": [
    "Sort",
    "The finished rows get sorted. Because it runs after SELECT, it is allowed to reference SELECT aliases.",
  ],
  LIMIT: [
    "Cut off",
    "Sorting had to complete before the top N could be known, so LIMIT rarely saves as much work as people expect.",
  ],
  OFFSET: [
    "Skip ahead",
    "Rows are still produced and then thrown away, which is why deep OFFSET paging gets slow.",
  ],
};

/** Family a keyword belongs to, for lookups in EXPLAIN. */
const family = (kw: string) => (kw.endsWith("JOIN") ? "JOIN" : kw);

/** Find top-level clause keywords: outside strings, comments and parentheses. */
export function parseClauses(sql: string): Clause[] {
  const found: { keyword: string; start: number }[] = [];
  const upper = sql.toUpperCase();
  let depth = 0;
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (ch === "-" && sql[i + 1] === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? sql.length : nl;
      continue;
    }
    if (ch === "/" && sql[i + 1] === "*") {
      const close = sql.indexOf("*/", i + 2);
      i = close === -1 ? sql.length : close + 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      i++;
      while (i < sql.length) {
        if (sql[i] === quote) {
          if (sql[i + 1] === quote) i += 2;
          else {
            i++;
            break;
          }
        } else i++;
      }
      continue;
    }
    if (ch === "(") {
      depth++;
      i++;
      continue;
    }
    if (ch === ")") {
      depth--;
      i++;
      continue;
    }
    if (depth !== 0) {
      i++;
      continue;
    }

    const boundaryBefore = i === 0 || /[\s),;]/.test(sql[i - 1]);
    if (boundaryBefore) {
      let matched: string | null = null;
      for (const kw of KEYWORDS) {
        if (!upper.startsWith(kw, i)) continue;
        const after = sql[i + kw.length];
        if (after !== undefined && !/[\s(;]/.test(after)) continue;
        matched = kw;
        break;
      }
      if (matched) {
        found.push({ keyword: matched, start: i });
        i += matched.length;
        continue;
      }
    }
    i++;
  }

  return found.map((f, idx) => ({
    keyword: f.keyword,
    start: f.start,
    text: sql
      .slice(f.start, found[idx + 1]?.start ?? sql.length)
      .trim()
      .replace(/;+$/, "")
      .trim(),
  }));
}

/**
 * Split a FROM body on top-level commas.
 *
 * A comma-separated FROM list is an implicit cross join. Counting it directly
 * can materialise an enormous cartesian product, so relations are measured
 * separately.
 */
function splitRelations(fromBody: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  let quote: string | null = null;

  for (let i = 0; i < fromBody.length; i++) {
    const ch = fromBody[i];
    if (quote) {
      buf += ch;
      if (ch === quote) quote = fromBody[i + 1] === quote ? quote : null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(buf.trim());
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out.filter(Boolean);
}

/** Strip the leading keyword off a clause, leaving just its body. */
function body(clause: Clause | undefined): string {
  if (!clause) return "";
  return clause.text.slice(clause.keyword.length).trim();
}

const snippet = (text: string, max = 96) => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? flat.slice(0, max - 1) + "…" : flat;
};

export async function tracePipeline(
  engine: Engine,
  dataset: DatasetId,
  rawSql: string,
  finalRowCount: number | null,
  finalColumnCount: number | null,
): Promise<PipelineTrace> {
  const statements = splitStatements(rawSql);
  if (statements.length === 0) {
    return { stages: [], measured: false, message: "Run a query and its pipeline appears here." };
  }
  if (statements.length > 1) {
    return {
      stages: [],
      measured: false,
      message:
        "This is a script of several statements. Select a single SELECT to trace its pipeline.",
    };
  }

  const sql = stripNoise(statements[0]).replace(/;\s*$/, "");
  if (!/^(select|with)\b/i.test(sql)) {
    return {
      stages: [],
      measured: false,
      message:
        "The pipeline view traces SELECT queries. CREATE, INSERT and UPDATE run as a single step.",
    };
  }

  const clauses = parseClauses(sql);
  const has = (kw: string) => clauses.find((c) => c.keyword === kw);
  const setOp = clauses.find((c) =>
    ["UNION", "UNION ALL", "INTERSECT", "EXCEPT"].includes(c.keyword),
  );

  const withClause = clauses[0]?.keyword === "WITH" ? clauses[0] : undefined;
  const selectClause = has("SELECT");
  const fromClause = has("FROM");
  const joinClauses = clauses.filter((c) => c.keyword.endsWith("JOIN"));
  const whereClause = has("WHERE");
  const groupClause = has("GROUP BY");
  const havingClause = has("HAVING");
  const qualifyClause = has("QUALIFY");
  const windowClause = has("WINDOW");
  const orderClause = has("ORDER BY");
  const limitClause = has("LIMIT");
  const offsetClause = has("OFFSET");

  if (!selectClause) {
    return { stages: [], measured: false, message: "Could not find a SELECT clause to trace." };
  }

  // ---- assemble the stage list in evaluation order --------------------
  const ordered: { clause: Clause; keyword: string }[] = [];
  const add = (c: Clause | undefined) => c && ordered.push({ clause: c, keyword: c.keyword });

  add(withClause);
  add(fromClause);
  for (const j of joinClauses) ordered.push({ clause: j, keyword: j.keyword });
  add(whereClause);
  add(groupClause);
  add(havingClause);
  add(windowClause);
  add(qualifyClause);
  ordered.push({ clause: selectClause, keyword: "SELECT" });
  add(orderClause);
  add(offsetClause);
  add(limitClause);

  const stages: Stage[] = ordered.map(({ clause, keyword }) => {
    const [title, why] = EXPLAIN[family(keyword)] ?? ["Step", ""];
    return {
      keyword,
      title,
      why,
      snippet: snippet(clause.text),
      rows: null,
      trend: null,
    };
  });

  // ---- probe the database for real counts -----------------------------
  const withPrefix = withClause ? withClause.text + " " : "";
  const canProbe = !!fromClause && !setOp;

  if (!canProbe) {
    const last = stages[stages.length - 1];
    if (last && finalRowCount !== null) last.rows = finalRowCount;
    if (selectClause && finalColumnCount !== null) {
      const s = stages.find((x) => x.keyword === "SELECT");
      if (s) s.columns = finalColumnCount;
    }
    return {
      stages,
      measured: false,
      message: setOp
        ? "Set operations combine two pipelines, so per-stage counts are not traced. The clause order below still applies to each branch."
        : undefined,
    };
  }

  const fromBody = body(fromClause);
  const count = async (sqlText: string): Promise<number | null> => {
    const res = await db.run(engine, dataset, sqlText);
    if (res.error || res.rows.length === 0) return null;
    const value = Object.values(res.rows[0])[0];
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const relations = splitRelations(fromBody);
  const crossJoined = relations.length > 1;

  // Cardinality before grouping: FROM, then each JOIN, then WHERE.
  let scanned = `${fromBody}`;
  const whereText = whereClause ? ` ${whereClause.text}` : "";

  let fromCount: number | null;
  if (crossJoined) {
    // Comma-separated relations multiply. Measure each one and take the
    // product rather than asking the engine to build the cross product.
    const each = await Promise.all(
      relations.map((r) => count(`${withPrefix}SELECT COUNT(*) AS n FROM ${r}`)),
    );
    fromCount = each.every((n) => n !== null)
      ? (each as number[]).reduce((product, n) => product * n, 1)
      : null;
  } else {
    fromCount = await count(`${withPrefix}SELECT COUNT(*) AS n FROM ${scanned}`);
  }

  const joinCounts: (number | null)[] = [];
  for (const j of joinClauses) {
    scanned += ` ${j.text}`;
    joinCounts.push(await count(`${withPrefix}SELECT COUNT(*) AS n FROM ${scanned}`));
  }

  const whereCount = whereClause
    ? await count(`${withPrefix}SELECT COUNT(*) AS n FROM ${scanned}${whereText}`)
    : null;

  const preGroupCounts: (number | null)[] = [fromCount, ...joinCounts];
  if (whereClause) preGroupCounts.push(whereCount);

  let cursor = 0;
  const assign = (keyword: string, value: number | null, fromIndex = 0) => {
    for (let i = fromIndex; i < stages.length; i++) {
      if (stages[i].keyword === keyword && stages[i].rows === null) {
        stages[i].rows = value;
        return i;
      }
    }
    return -1;
  };

  const fromStageIndex = assign("FROM", preGroupCounts[cursor++]);
  if (crossJoined && fromStageIndex !== -1) {
    stages[fromStageIndex].keyword = "FROM";
    stages[fromStageIndex].title = `Cross join ${relations.length} tables`;
    stages[fromStageIndex].why =
      "Listing tables separated by commas is an implicit cross join: every row of each " +
      "table is paired with every row of the others. That product is what WHERE then has " +
      "to cut back down, which is why the next step matters so much.";
  }
  for (const j of joinClauses) {
    const idx = stages.findIndex((s) => s.keyword === j.keyword && s.rows === null);
    if (idx !== -1) stages[idx].rows = preGroupCounts[cursor];
    cursor++;
  }
  if (whereClause) assign("WHERE", preGroupCounts[cursor++]);

  // After grouping the unit changes from rows to groups, so probe separately.
  let lastKnown = preGroupCounts[cursor - 1] ?? preGroupCounts[preGroupCounts.length - 1] ?? null;

  if (groupClause) {
    const base = `${scanned}${whereText} ${groupClause.text}`;
    const groups = await count(
      `${withPrefix}SELECT COUNT(*) AS n FROM (SELECT 1 AS _c FROM ${base}) _pipe`,
    );
    assign("GROUP BY", groups);
    lastKnown = groups ?? lastKnown;

    if (havingClause) {
      const kept = await count(
        `${withPrefix}SELECT COUNT(*) AS n FROM (SELECT 1 AS _c FROM ${base} ${havingClause.text}) _pipe`,
      );
      assign("HAVING", kept);
      lastKnown = kept ?? lastKnown;
    }
  }

  if (qualifyClause) {
    const base = `${scanned}${whereText}${groupClause ? " " + groupClause.text : ""}${havingClause ? " " + havingClause.text : ""}`;
    const kept = await count(
      `${withPrefix}SELECT COUNT(*) AS n FROM (SELECT 1 AS _c FROM ${base} ${qualifyClause.text}) _pipe`,
    );
    assign("QUALIFY", kept);
    lastKnown = kept ?? lastKnown;
  }

  // SELECT only changes cardinality when it is DISTINCT.
  const isDistinct = /^SELECT\s+DISTINCT\b/i.test(selectClause.text);
  const selectStage = stages.find((s) => s.keyword === "SELECT")!;
  selectStage.columns = finalColumnCount ?? undefined;

  if (isDistinct) {
    const base = `${selectClause.text} ${fromClause!.text}${joinClauses.map((j) => " " + j.text).join("")}${whereText}${groupClause ? " " + groupClause.text : ""}${havingClause ? " " + havingClause.text : ""}${qualifyClause ? " " + qualifyClause.text : ""}${/DISTINCT\s+ON/i.test(selectClause.text) && orderClause ? " " + orderClause.text : ""}`;
    const distinct = await count(`${withPrefix}SELECT COUNT(*) AS n FROM (${base}) _pipe`);
    selectStage.rows = distinct ?? lastKnown;
    lastKnown = selectStage.rows;
  } else {
    selectStage.rows = lastKnown;
  }

  const windowStage = stages.find((s) => s.keyword === "WINDOW");
  if (windowStage) windowStage.rows = lastKnown;

  const orderStage = stages.find((s) => s.keyword === "ORDER BY");
  if (orderStage) orderStage.rows = lastKnown;

  // OFFSET and LIMIT: the final result is the ground truth.
  const tailStages = stages.filter((s) => s.keyword === "OFFSET" || s.keyword === "LIMIT");
  if (tailStages.length) {
    for (const s of tailStages) s.rows = finalRowCount;
  } else if (finalRowCount !== null && stages.length) {
    stages[stages.length - 1].rows = finalRowCount;
  }

  // ---- trend arrows ---------------------------------------------------
  let previous: number | null = null;
  for (const stage of stages) {
    if (stage.rows === null) continue;
    if (previous !== null) {
      stage.trend = stage.rows > previous ? "grow" : stage.rows < previous ? "shrink" : "same";
    }
    previous = stage.rows;
  }

  return { stages, measured: true };
}
