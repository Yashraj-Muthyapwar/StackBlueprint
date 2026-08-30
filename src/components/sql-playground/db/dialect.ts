import type { Engine } from "./db-client";

/**
 * Static dialect checking.
 *
 * The point of running one dataset on two engines is that you meet the places
 * where they disagree. Meeting them as a raw parser error ("syntax error at or
 * near QUALIFY") teaches nothing, so this finds the construct before you run it
 * and says what the other engine calls it.
 */

export interface DialectIssue {
  /** Character offsets into the SQL. */
  from: number;
  to: number;
  /** "error" means this engine cannot run it at all. */
  severity: "error" | "warning";
  /** The construct that was found, e.g. "QUALIFY". */
  construct: string;
  message: string;
  /** The engine that does support it, when there is one. */
  supportedBy?: Engine;
}

interface Rule {
  /** Engine that does NOT support this. */
  unsupportedOn: Engine;
  /** Must be global; the matched group 0 is highlighted. */
  pattern: RegExp;
  construct: string;
  message: string;
}

const ENGINE_LABEL: Record<Engine, string> = {
  postgres: "PostgreSQL",
  duckdb: "DuckDB",
};

/**
 * Only constructs that genuinely fail. Anything merely stylistic is left alone,
 * because a warning you learn to ignore is worse than no warning.
 */
const RULES: Rule[] = [
  // ---- DuckDB-only, so they fail on PostgreSQL ----
  {
    unsupportedOn: "postgres",
    pattern: /\bQUALIFY\b/gi,
    construct: "QUALIFY",
    message:
      "QUALIFY is DuckDB-only. On PostgreSQL, move the window function into a subquery and filter outside it.",
  },
  {
    unsupportedOn: "postgres",
    pattern: /\bSUMMARIZE\b/gi,
    construct: "SUMMARIZE",
    message:
      "SUMMARIZE is DuckDB-only. On PostgreSQL, query information_schema.columns, or aggregate the columns you care about by hand.",
  },
  {
    unsupportedOn: "postgres",
    pattern: /\bPIVOT\b|\bUNPIVOT\b/gi,
    construct: "PIVOT",
    message:
      "PIVOT is DuckDB-only. On PostgreSQL, write the equivalent with SUM(CASE WHEN ... THEN ... END) per column, or use the tablefunc crosstab extension.",
  },
  {
    unsupportedOn: "postgres",
    pattern: /\bASOF\s+JOIN\b/gi,
    construct: "ASOF JOIN",
    message:
      "ASOF JOIN is DuckDB-only. On PostgreSQL, use a LATERAL subquery ordered by the timestamp with LIMIT 1.",
  },
  {
    unsupportedOn: "postgres",
    pattern: /\*\s*(EXCLUDE|REPLACE)\s*\(/gi,
    construct: "* EXCLUDE / REPLACE",
    message: "Star modifiers are DuckDB-only. On PostgreSQL, list the columns you want explicitly.",
  },
  {
    unsupportedOn: "postgres",
    pattern: /\bCOLUMNS\s*\(/gi,
    construct: "COLUMNS(*)",
    message: "COLUMNS(...) is DuckDB-only. On PostgreSQL, repeat the expression per column.",
  },
  {
    unsupportedOn: "postgres",
    pattern: /\bapprox_count_distinct\s*\(/gi,
    construct: "approx_count_distinct",
    message:
      "approx_count_distinct is DuckDB-only. On PostgreSQL, use COUNT(DISTINCT ...), or the postgres_hll extension.",
  },
  {
    unsupportedOn: "postgres",
    pattern: /\b(list_sort|list_distinct|list_aggregate|list_value|list_transform)\s*\(/gi,
    construct: "list_* function",
    message:
      "DuckDB list functions are not in PostgreSQL. The closest equivalents are array_agg and the array_* functions.",
  },
  {
    unsupportedOn: "postgres",
    pattern: /\bCALL\s+dbgen\b/gi,
    construct: "CALL dbgen",
    message: "dbgen comes from DuckDB's tpch extension and only exists on DuckDB.",
  },

  // ---- PostgreSQL-only, so they fail on DuckDB ----
  {
    unsupportedOn: "duckdb",
    pattern: /\bDISTINCT\s+ON\s*\(/gi,
    construct: "DISTINCT ON",
    message:
      "DISTINCT ON is PostgreSQL-only. On DuckDB, use QUALIFY ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...) = 1.",
  },
  {
    unsupportedOn: "duckdb",
    pattern: /\bgenerate_series\s*\(\s*(?:DATE|TIMESTAMP)\b/gi,
    construct: "generate_series over dates",
    message:
      "DuckDB's generate_series does not take the same date arguments. Use range(...) with an interval, or generate_series on integers and offset a date.",
  },
  {
    unsupportedOn: "duckdb",
    pattern: /\bto_tsvector\s*\(|\bto_tsquery\s*\(|@@/gi,
    construct: "full-text search",
    message:
      "PostgreSQL text search (tsvector, tsquery, @@) is not in DuckDB. Use the fts extension, or fall back to ILIKE.",
  },
  {
    unsupportedOn: "duckdb",
    pattern: /\bwidth_bucket\s*\(/gi,
    construct: "width_bucket",
    message:
      "width_bucket is PostgreSQL-only. On DuckDB, compute the bucket arithmetically, or use histogram().",
  },
  {
    unsupportedOn: "duckdb",
    pattern: /\bWITHIN\s+GROUP\b/gi,
    construct: "WITHIN GROUP",
    message:
      "Ordered-set aggregates like percentile_cont(...) WITHIN GROUP are PostgreSQL-only. DuckDB spells it quantile_cont(x, 0.5).",
  },
];

/** Strip comments and string literals so a rule cannot fire inside them. */
function maskLiterals(sql: string): string {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? sql.length : end;
      out += " ".repeat(stop - i);
      i = stop;
      continue;
    }
    if (ch === "/" && sql[i + 1] === "*") {
      const close = sql.indexOf("*/", i + 2);
      const stop = close === -1 ? sql.length : close + 2;
      out += " ".repeat(stop - i);
      i = stop;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === quote) {
          if (sql[j + 1] === quote) j += 2;
          else break;
        } else j++;
      }
      const stop = Math.min(j + 1, sql.length);
      out += " ".repeat(stop - i);
      i = stop;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** Constructs in this SQL that the given engine cannot run. */
export function findDialectIssues(sql: string, engine: Engine): DialectIssue[] {
  if (!sql.trim()) return [];
  const masked = maskLiterals(sql);
  const issues: DialectIssue[] = [];

  for (const rule of RULES) {
    if (rule.unsupportedOn !== engine) continue;
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = rule.pattern.exec(masked)) !== null) {
      issues.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: "error",
        construct: rule.construct,
        message: rule.message,
        supportedBy: engine === "postgres" ? "duckdb" : "postgres",
      });
      if (match[0].length === 0) rule.pattern.lastIndex++;
    }
  }

  return issues.sort((a, b) => a.from - b.from);
}

/** One-line summary for the toolbar badge. */
export function summariseIssues(issues: DialectIssue[], engine: Engine): string {
  if (issues.length === 0) return "";
  const names = [...new Set(issues.map((i) => i.construct))];
  const other = issues[0].supportedBy;
  const list =
    names.length > 2 ? `${names.slice(0, 2).join(", ")} +${names.length - 2}` : names.join(", ");
  return `${list} ${names.length > 1 ? "are" : "is"} not supported on ${ENGINE_LABEL[engine]}${
    other ? `. Switch to ${ENGINE_LABEL[other]} to run this.` : "."
  }`;
}

export { ENGINE_LABEL };
