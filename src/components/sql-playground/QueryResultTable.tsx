import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronsUpDown,
  Clipboard,
  Download,
  Search,
} from "lucide-react";
import { QueryResult, Engine } from "./db/db-client";

const PAGE = 200;

type SortState = { column: string; direction: "asc" | "desc" } | null;

function compare(a: any, b: any): number {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb) && a !== "" && b !== "") return na - nb;
  return String(a).localeCompare(String(b));
}

/** JSON array of objects, with the column order the query produced. */
function toJson(fields: { name: string }[], rows: any[]): string {
  return JSON.stringify(
    rows.map((row) => {
      const out: Record<string, unknown> = {};
      for (const f of fields) out[f.name] = row[f.name] ?? null;
      return out;
    }),
    null,
    2,
  );
}

/** Markdown pipe table, for pasting into a PR or an issue. */
function toMarkdown(fields: { name: string }[], rows: any[]): string {
  const cell = (v: any) => (v === null || v === undefined ? "" : String(v).replace(/\|/g, "\\|"));
  const header = `| ${fields.map((f) => f.name).join(" | ")} |`;
  const rule = `| ${fields.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${fields.map((f) => cell(r[f.name])).join(" | ")} |`);
  return [header, rule, ...body].join("\n");
}

function toCsv(fields: { name: string }[], rows: any[]): string {
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    fields.map((f) => escape(f.name)).join(","),
    ...rows.map((r) => fields.map((f) => escape(r[f.name])).join(",")),
  ].join("\n");
}

const NUMERIC_TYPES = /int|numeric|decimal|double|float|real|serial/i;

export function QueryResultTable({ result, engine }: { result: QueryResult; engine: Engine }) {
  const [sort, setSort] = useState<SortState>(null);
  const [filter, setFilter] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [copied, setCopied] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!exportRef.current?.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [exportOpen]);

  const view = useMemo(() => {
    let rows = result.rows;

    if (filter.trim()) {
      const needle = filter.toLowerCase();
      rows = rows.filter((row) =>
        result.fields.some((f) =>
          String(row[f.name] ?? "")
            .toLowerCase()
            .includes(needle),
        ),
      );
    }
    if (sort) {
      const factor = sort.direction === "asc" ? 1 : -1;
      rows = [...rows].sort((a, b) => compare(a[sort.column], b[sort.column]) * factor);
    }
    return rows;
  }, [result, filter, sort]);

  if (result.error) {
    return (
      <div className="sqlx-error">
        <div className="sqlx-error-head">
          <AlertTriangle size={15} />
          <span>Query failed</span>
        </div>
        <pre className="sqlx-error-body">{result.error}</pre>
        {result.hint && <p className="sqlx-error-hint">{result.hint}</p>}
      </div>
    );
  }

  if (result.isCommand && result.fields.length === 0) {
    return (
      <div className="sqlx-ok">
        <Check size={15} />
        <div>
          <strong>
            {result.statementCount > 1
              ? `${result.statementCount} statements executed`
              : "Statement executed"}
          </strong>
          <span>
            {result.affectedRows !== undefined && `${result.affectedRows} rows affected · `}
            {result.executionTimeMs.toFixed(1)} ms
          </span>
          <span>The Schema map tab reflects any structural change.</span>
        </div>
      </div>
    );
  }

  if (result.fields.length === 0) {
    return (
      <div className="sqlx-empty">
        <strong>Your query returned no columns.</strong>
        Add one or more columns or expressions after <code>SELECT</code>, for example{" "}
        <code>SELECT id, name FROM customers;</code>
      </div>
    );
  }

  const shown = view.slice(0, limit);
  const truncated = view.length > shown.length;

  /** Everything the filter left in, not just the page on screen. */
  const serialise = (format: "csv" | "json" | "md") =>
    format === "csv"
      ? toCsv(result.fields, view)
      : format === "json"
        ? toJson(result.fields, view)
        : toMarkdown(result.fields, view);

  const download = (format: "csv" | "json") => {
    const text = serialise(format);
    const type = format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8";
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-result.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const copy = async (format: "csv" | "json" | "md") => {
    try {
      await navigator.clipboard.writeText(serialise(format));
      setCopied(format);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard access can be blocked; downloading still works.
    }
    setExportOpen(false);
  };

  const toggleSort = (column: string) => {
    setSort((prev) =>
      !prev || prev.column !== column
        ? { column, direction: "asc" }
        : prev.direction === "asc"
          ? { column, direction: "desc" }
          : null,
    );
  };

  return (
    <div className="sqlx-result">
      <div className="sqlx-result-bar">
        <span className="stat">
          rows <b>{result.rows.length.toLocaleString()}</b>
        </span>
        <span className="stat">
          cols <b>{result.fields.length}</b>
        </span>
        <span className="stat">
          time <b>{result.executionTimeMs.toFixed(1)} ms</b>
        </span>
        {filter.trim() && (
          <span className="stat matching">
            matching <b>{view.length.toLocaleString()}</b>
          </span>
        )}

        <div className="sqlx-result-actions">
          <div className="sqlx-result-search">
            <Search size={12} />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter rows"
              aria-label="Filter result rows"
            />
          </div>

          <div className="sqlx-export" ref={exportRef}>
            <button
              className="sqlx-icon-btn wide"
              onClick={() => setExportOpen((o) => !o)}
              aria-expanded={exportOpen}
              aria-haspopup="menu"
              // Named explicitly: the visible label is dropped on narrow panels.
              aria-label="Export rows"
              title="Copy or download these rows"
            >
              {copied ? <Check size={13} /> : <Download size={13} />}
              <span className="label">Export</span>
              <ChevronDown size={11} className="caret" />
            </button>
            {exportOpen && (
              <div className="sqlx-export-menu">
                <p className="head">
                  {view.length.toLocaleString()} row{view.length === 1 ? "" : "s"}
                  {filter.trim() && " (filtered)"}
                </p>
                <button onClick={() => copy("csv")}>
                  <Clipboard size={12} /> Copy as CSV
                </button>
                <button onClick={() => copy("json")}>
                  <Clipboard size={12} /> Copy as JSON
                </button>
                <button onClick={() => copy("md")}>
                  <Clipboard size={12} /> Copy as Markdown
                </button>
                <div className="sep" />
                <button onClick={() => download("csv")}>
                  <Download size={12} /> Download .csv
                </button>
                <button onClick={() => download("json")}>
                  <Download size={12} /> Download .json
                </button>
              </div>
            )}
          </div>

          <span className="stamp">
            {engine === "postgres" ? "PostgreSQL · PGlite" : "DuckDB · WASM"}
          </span>
        </div>
      </div>

      <div className="sqlx-result-scroll">
        <table className="sqlx-table">
          <thead>
            <tr>
              <th className="rownum" />
              {result.fields.map((f) => {
                const active = sort?.column === f.name;
                return (
                  <th key={f.name}>
                    <button onClick={() => toggleSort(f.name)} title={`Sort by ${f.name}`}>
                      <span className="col-name">{f.name}</span>
                      <span className="col-type">{f.type}</span>
                      <span className={`col-sort ${active ? "on" : ""}`}>
                        {active ? (
                          sort!.direction === "asc" ? (
                            <ArrowUp size={11} />
                          ) : (
                            <ArrowDown size={11} />
                          )
                        ) : (
                          <ChevronsUpDown size={11} />
                        )}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <tr key={i}>
                <td className="rownum">{i + 1}</td>
                {result.fields.map((f) => {
                  const value = row[f.name];
                  const isNull = value === null || value === undefined;
                  const numeric = typeof value === "number" || NUMERIC_TYPES.test(f.type);
                  return (
                    <td
                      key={f.name}
                      className={`${isNull ? "null" : ""} ${numeric && !isNull ? "num" : ""}`}
                    >
                      {isNull ? "NULL" : String(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {view.length === 0 && (
          <div className="sqlx-note">
            {result.rows.length === 0
              ? "The query ran without error but matched zero rows. The Pipeline tab shows which clause emptied it."
              : "No rows match that filter."}
          </div>
        )}

        {truncated && (
          <div className="sqlx-note">
            Showing {shown.length.toLocaleString()} of {view.length.toLocaleString()} rows.{" "}
            <button className="sqlx-link" onClick={() => setLimit((n) => n + PAGE * 5)}>
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
