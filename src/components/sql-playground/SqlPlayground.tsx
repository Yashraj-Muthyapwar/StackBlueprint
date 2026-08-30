import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Copy,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { format as formatSql } from "sql-formatter";

import { db, Engine, EngineState, QueryResult, splitStatements } from "./db/db-client";
import { findDialectIssues, summariseIssues } from "./db/dialect";
import { fetchSchema, SchemaSnapshot, toCompletionSchema } from "./db/metadata";
import { DATASETS, DEFAULT_DATASET, getDataset, humanBytes, type DatasetId } from "./db/datasets";
import { examplesFor, starterFor } from "./content";
import { SqlEditor, SqlEditorHandle, type RunTarget } from "./SqlEditor";
import { SplitPane } from "./SplitPane";
import { DatasetPicker } from "./DatasetPicker";
import { QueryResultTable } from "./QueryResultTable";
import { SchemaExplorer } from "./explorer/SchemaExplorer";
import { SchemaVisualizer } from "./visualizer/SchemaVisualizer";
import { QueryFlowVisualizer } from "./visualizer/QueryFlowVisualizer";
import { ExecutionPlanVisualizer } from "./visualizer/ExecutionPlanVisualizer";
import { useIsDark } from "./useIsDark";

import "./sql-flow.css";

type Tab = "results" | "pipeline" | "plan" | "schema";

interface HistoryEntry {
  sql: string;
  engine: Engine;
  dataset: DatasetId;
  at: number;
  ms: number;
  rows: number | null;
  failed: boolean;
}

const SQL_KEY = "sqlx.draft";
const HISTORY_KEY = "sqlx.history";
const ENGINE_KEY = "sqlx.engine";
const DATASET_KEY = "sqlx.dataset";
const MAX_HISTORY = 40;

export function SqlPlayground() {
  const dark = useIsDark();
  const editorRef = useRef<SqlEditorHandle>(null);

  const [engine, setEngine] = useState<Engine>("postgres");
  const [dataset, setDataset] = useState<DatasetId>(DEFAULT_DATASET);
  const [state, setState] = useState<EngineState>({ status: "idle", progress: 0, label: "" });

  const [sql, setSql] = useState(() => starterFor(DEFAULT_DATASET, "postgres"));
  const [ranSql, setRanSql] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<Tab>("results");

  const [schema, setSchema] = useState<SchemaSnapshot | null>(null);
  const [schemaLoading, setSchemaLoading] = useState(true);

  const [runTarget, setRunTarget] = useState<RunTarget | null>(null);
  const [formatNote, setFormatNote] = useState<string | null>(null);
  /**
   * Where in the document the last run started. Error spans come back relative
   * to the submitted text, so they need shifting before the editor can mark them.
   */
  const [runOffset, setRunOffset] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  /**
   * False until the effect below has read the saved engine and dataset back.
   * The write-back effect has to wait for it: effects fire on mount too, so
   * without this it saves the initial defaults over the stored choice before
   * the restore ever commits, and every visit lands back on Cycle Depot.
   */
  const [restored, setRestored] = useState(false);
  const [resetting, setResetting] = useState(false);
  /** Bumped after a reset or dataset load so dependent views refetch. */
  const [schemaVersion, setSchemaVersion] = useState(0);

  const active = getDataset(dataset);

  // ---- persistence -----------------------------------------------------
  useEffect(() => {
    const savedEngine = localStorage.getItem(ENGINE_KEY);
    const savedDataset = localStorage.getItem(DATASET_KEY) as DatasetId | null;

    let nextEngine: Engine = savedEngine === "duckdb" ? "duckdb" : "postgres";
    let nextDataset = DEFAULT_DATASET;
    if (savedDataset && DATASETS.some((d) => d.id === savedDataset)) {
      nextDataset = savedDataset;
    }
    // A stored pair can be invalid, e.g. TPC-H remembered against PostgreSQL.
    if (!getDataset(nextDataset).engines.includes(nextEngine)) {
      nextEngine = getDataset(nextDataset).engines[0];
    }
    setEngine(nextEngine);
    setDataset(nextDataset);
    setRestored(true);

    const draft = localStorage.getItem(SQL_KEY);
    setSql(draft && draft.trim() ? draft : starterFor(nextDataset, nextEngine));

    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
      if (Array.isArray(saved)) setHistory(saved);
    } catch {
      /* corrupt history is not worth surfacing */
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem(SQL_KEY, sql), 400);
    return () => clearTimeout(id);
  }, [sql]);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(ENGINE_KEY, engine);
    localStorage.setItem(DATASET_KEY, dataset);
  }, [engine, dataset, restored]);

  // ---- engine lifecycle -------------------------------------------------
  const currentKey = `${engine}:${dataset}`;
  const keyRef = useRef(currentKey);
  keyRef.current = currentKey;

  useEffect(() => {
    const unsubscribe = db.onState((key, next) => {
      if (key === keyRef.current) setState(next);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const reloadSchema = useCallback(async (which: Engine, ds: DatasetId) => {
    setSchemaLoading(true);
    try {
      setSchema(await fetchSchema(which, ds));
    } catch {
      setSchema({ tables: [], foreignKeys: [] });
    } finally {
      setSchemaLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState(db.stateOf(engine, dataset));
    setSchema(null);
    setSchemaLoading(true);

    db.init(engine, dataset)
      .then(() => {
        if (cancelled) return;
        return reloadSchema(engine, dataset);
      })
      .catch(() => {
        if (!cancelled) setSchemaLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [engine, dataset, reloadSchema, schemaVersion]);

  // ---- running ----------------------------------------------------------
  const ready = state.status === "ready";

  const run = useCallback(
    async (override?: string) => {
      // Selection wins, then the statement under the cursor, then the whole script.
      const target = editorRef.current?.runTarget();
      const raw = override ?? target?.sql ?? sql;
      const text = raw.trim();
      if (!text || running) return;

      // Trimming shifts every offset, so track how far in the submitted text
      // starts. An explicit override is not part of the document at all.
      const base = override ? -1 : (target?.from ?? 0) + (raw.length - raw.trimStart().length);

      setRunning(true);
      setTab("results");
      setRanSql(text);
      setRunOffset(base);

      const res = await db.run(engine, dataset, text);
      setResult(res);
      setRunning(false);

      setHistory((prev) => {
        const entry: HistoryEntry = {
          sql: text,
          engine,
          dataset,
          at: Date.now(),
          ms: res.executionTimeMs,
          rows: res.error ? null : res.rows.length,
          failed: !!res.error,
        };
        const rest = prev[0]?.sql === text ? prev.slice(1) : prev;
        const next = [entry, ...rest].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });

      // Writes and DDL can change the catalogue, so refresh it.
      if (/\b(create|drop|alter|insert|update|delete|truncate|call)\b/i.test(text)) {
        reloadSchema(engine, dataset);
      }
    },
    [engine, dataset, sql, running, reloadSchema],
  );

  const explain = useCallback(() => {
    const target = editorRef.current?.runTarget();
    setRanSql((target?.sql ?? sql).trim());
    setTab("plan");
  }, [sql]);

  /** Tidy the SQL in place, using the dialect the active engine speaks. */
  const format = useCallback(() => {
    if (!sql.trim()) return;
    try {
      const tidied = formatSql(sql, {
        language: engine === "duckdb" ? "duckdb" : "postgresql",
        keywordCase: "upper",
        indentStyle: "standard",
        logicalOperatorNewline: "before",
        expressionWidth: 78,
      });
      setSql(tidied);
      setFormatNote(tidied === sql ? "Already tidy" : null);
    } catch (e: any) {
      // The formatter parses the SQL, so unfinished or exotic syntax can defeat
      // it. Say so rather than leaving the button looking broken.
      //
      // Its errors carry a full grammar/token dump that runs to six figures of
      // characters, so keep only the first line and cap it.
      const first = String(e?.message ?? "unparseable SQL")
        .split("\n")[0]
        .trim();
      const short = first.length > 110 ? `${first.slice(0, 109)}…` : first;
      setFormatNote(`Could not format: ${short || "unparseable SQL"}`);
    }
    setTimeout(() => setFormatNote(null), 2600);
  }, [sql, engine]);

  const resetDatabase = useCallback(async () => {
    setResetting(true);
    try {
      await db.reset(engine, dataset);
      await reloadSchema(engine, dataset);
      setResult(null);
    } finally {
      setResetting(false);
    }
  }, [engine, dataset, reloadSchema]);

  // Switching dataset also swaps the editor contents, unless the user has
  // written something of their own.
  const switchDataset = useCallback(
    (next: DatasetId) => {
      const def = getDataset(next);
      const nextEngine = def.engines.includes(engine) ? engine : def.engines[0];
      const wasStarter = sql.trim() === starterFor(dataset, engine).trim();

      setDataset(next);
      setEngine(nextEngine);
      setResult(null);
      setRanSql("");
      setTab("results");
      if (wasStarter || !sql.trim()) setSql(starterFor(next, nextEngine));
    },
    [dataset, engine, sql],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const useQuery = useCallback(
    (next: string, autoRun: boolean) => {
      setSql(next);
      editorRef.current?.focus();
      if (autoRun) run(next);
    },
    [run],
  );

  const completionSchema = useMemo(
    () => (schema && schema.tables.length ? toCompletionSchema(schema) : {}),
    [schema],
  );

  const statementCount = useMemo(() => splitStatements(sql).length, [sql]);
  const target = ranSql || sql;

  // Static dialect check over whatever Run would actually submit.
  const dialectIssues = useMemo(
    () => findDialectIssues(runTarget?.sql ?? sql, engine),
    [runTarget, sql, engine],
  );
  const dialectWarning = summariseIssues(dialectIssues, engine);

  const runLabel =
    runTarget?.label === "selection"
      ? "Run selection"
      : runTarget?.label === "statement"
        ? "Run statement"
        : "Run";

  const engineError = useMemo(() => {
    if (!result?.error) return null;
    // A negative offset means the SQL was not the document's (a guided query
    // run straight from the sidebar), so there is nothing to underline.
    const canMark = runOffset >= 0 && result.errorSpan;
    return {
      message: result.error,
      hint: result.hint,
      from: canMark ? result.errorSpan!.from + runOffset : undefined,
      to: canMark ? result.errorSpan!.to + runOffset : undefined,
    };
  }, [result, runOffset]);
  const groups = useMemo(() => examplesFor(dataset, engine), [dataset, engine]);

  const statusText =
    state.status === "ready"
      ? "ready"
      : state.status === "failed"
        ? "failed"
        : state.label || state.status;

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    {
      id: "results",
      label: "Results",
      badge: result && !result.error && !result.isCommand ? String(result.rows.length) : undefined,
    },
    { id: "pipeline", label: "Pipeline" },
    { id: "plan", label: "Plan" },
    { id: "schema", label: "Schema map" },
  ];

  return (
    <div className={`sqlx ${dark ? "sqlx-dark" : ""}`} data-engine={engine}>
      <header className="sqlx-header">
        <div className="sqlx-brand">
          <span className="mark" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <h1>SQL Playground</h1>
        </div>

        <DatasetPicker
          value={dataset}
          engine={engine}
          warm={(id) => db.isWarm(engine, id)}
          onChange={switchDataset}
        />

        <div className="sqlx-engines" role="tablist" aria-label="Database engine">
          {(["postgres", "duckdb"] as Engine[]).map((candidate) => {
            const supported = active.engines.includes(candidate);
            return (
              <button
                key={candidate}
                role="tab"
                aria-selected={engine === candidate}
                disabled={!supported}
                className={engine === candidate ? "active" : ""}
                onClick={() => supported && setEngine(candidate)}
                title={
                  supported
                    ? candidate === "postgres"
                      ? "PGlite: real PostgreSQL compiled to WebAssembly"
                      : "DuckDB WebAssembly: a columnar analytics engine"
                    : `${active.name} does not run on ${candidate === "postgres" ? "PostgreSQL" : "DuckDB"}`
                }
              >
                <span className={`dot ${db.stateOf(candidate, dataset).status}`} />
                {candidate === "postgres" ? "PostgreSQL" : "DuckDB"}
              </button>
            );
          })}
        </div>

        <span className={`sqlx-status ${state.status}`} title={state.detail}>
          {state.status !== "ready" && state.status !== "failed" && (
            <Loader2 size={12} className="spin" />
          )}
          {statusText}
        </span>
      </header>

      {(state.status === "booting" || state.status === "loading") && (
        <div
          className="sqlx-loadbar"
          role="progressbar"
          aria-valuenow={Math.round(state.progress * 100)}
        >
          <span style={{ width: `${Math.max(2, state.progress * 100)}%` }} />
          <em>
            {active.name}
            {active.bytes > 0 && ` · ${humanBytes(active.bytes)}`}
            {state.label && ` · ${state.label}`}
          </em>
        </div>
      )}

      {state.status === "failed" && (
        <div className="sqlx-loadfail">
          Could not load {active.name}: {state.detail ?? "unknown error"}
          <button className="sqlx-link" onClick={() => setSchemaVersion((v) => v + 1)}>
            Try again
          </button>
        </div>
      )}

      <div className="sqlx-body">
        <aside className="sqlx-aside">
          <SchemaExplorer
            schema={schema}
            groups={groups}
            datasetName={active.name}
            loading={schemaLoading}
            onUseQuery={useQuery}
          />
        </aside>

        <main className="sqlx-main">
          <SplitPane
            storageKey="sqlx.split"
            initial={40}
            top={
              <section className="sqlx-editor-card">
                <div className="sqlx-toolbar">
                  <span className="file">query.sql</span>

                  <button
                    className="sqlx-btn primary"
                    onClick={() => run()}
                    disabled={running || !ready}
                  >
                    {running ? <Loader2 size={13} className="spin" /> : <Play size={13} />}
                    {runLabel}
                  </button>

                  <button className="sqlx-btn" onClick={explain} disabled={!ready}>
                    <Sparkles size={13} /> Explain
                  </button>

                  <button
                    className="sqlx-btn"
                    onClick={format}
                    title={formatNote ?? "Tidy the SQL (Shift+Alt+F)"}
                  >
                    <Wand2 size={13} /> Format
                  </button>

                  {formatNote && <span className="sqlx-format-note">{formatNote}</span>}

                  <div className="sqlx-menu">
                    <button
                      className="sqlx-btn"
                      onClick={() => setHistoryOpen((o) => !o)}
                      aria-expanded={historyOpen}
                    >
                      <Clock size={13} /> History
                      <ChevronDown size={12} />
                    </button>
                    {historyOpen && (
                      <div className="sqlx-menu-panel" onMouseLeave={() => setHistoryOpen(false)}>
                        {history.length === 0 ? (
                          <p className="empty">Nothing run yet.</p>
                        ) : (
                          <>
                            <div className="menu-head">
                              <span>Recent queries</span>
                              <button
                                onClick={() => {
                                  setHistory([]);
                                  localStorage.removeItem(HISTORY_KEY);
                                }}
                              >
                                <Trash2 size={11} /> Clear
                              </button>
                            </div>
                            <ul>
                              {history.map((entry, i) => (
                                <li key={`${entry.at}-${i}`}>
                                  <button
                                    onClick={() => {
                                      setSql(entry.sql);
                                      setHistoryOpen(false);
                                      editorRef.current?.focus();
                                    }}
                                  >
                                    <code>{entry.sql.replace(/\s+/g, " ").slice(0, 74)}</code>
                                    <span className={`meta ${entry.failed ? "bad" : ""}`}>
                                      {entry.dataset ?? "—"} ·{" "}
                                      {entry.engine === "postgres" ? "pg" : "duck"} ·{" "}
                                      {entry.failed ? "error" : `${entry.rows} rows`} ·{" "}
                                      {entry.ms.toFixed(0)} ms
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    className="sqlx-btn"
                    onClick={() => navigator.clipboard?.writeText(sql)}
                    title="Copy the whole editor"
                  >
                    <Copy size={13} />
                  </button>

                  <button
                    className="sqlx-btn"
                    onClick={resetDatabase}
                    disabled={resetting || !ready}
                    title="Discard your changes and reload this dataset"
                  >
                    {resetting ? <Loader2 size={13} className="spin" /> : <RotateCcw size={13} />}
                    Reset
                  </button>

                  {dialectWarning && (
                    <button
                      className="sqlx-dialect-badge"
                      title={dialectWarning}
                      onClick={() => {
                        const other: Engine = engine === "postgres" ? "duckdb" : "postgres";
                        if (active.engines.includes(other)) setEngine(other);
                      }}
                    >
                      <AlertTriangle size={12} />
                      <span>{dialectIssues[0].construct}</span>
                      {active.engines.includes(engine === "postgres" ? "duckdb" : "postgres") && (
                        <em>switch engine</em>
                      )}
                    </button>
                  )}

                  <span className="hint">
                    {statementCount > 1 && <b>{statementCount} statements · </b>}
                    <kbd>{navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}</kbd>
                    <kbd>↵</kbd> run
                  </span>
                </div>

                <div className="sqlx-editor">
                  <SqlEditor
                    ref={editorRef}
                    value={sql}
                    onChange={setSql}
                    onRun={() => run()}
                    onExplain={explain}
                    onFormat={format}
                    schema={completionSchema}
                    engine={engine}
                    dark={dark}
                    engineError={engineError}
                    onTargetChange={setRunTarget}
                  />
                </div>
              </section>
            }
            bottom={
              <section className="sqlx-panel-wrap">
                <div className="sqlx-tabs" role="tablist">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={tab === t.id}
                      className={`sqlx-tab ${tab === t.id ? "active" : ""}`}
                      onClick={() => setTab(t.id)}
                    >
                      {t.label}
                      {t.badge !== undefined && <span className="pill">{t.badge}</span>}
                    </button>
                  ))}
                </div>

                <div className="sqlx-panel">
                  {tab === "results" &&
                    (result ? (
                      <QueryResultTable result={result} engine={engine} />
                    ) : (
                      <div className="sqlx-empty">
                        <strong>Press Run.</strong>
                        <span>
                          {active.name} is loaded on{" "}
                          {engine === "postgres" ? "PostgreSQL" : "DuckDB"}. Pick a guided query on
                          the left, or write your own.
                        </span>
                      </div>
                    ))}

                  {tab === "pipeline" && (
                    <QueryFlowVisualizer
                      engine={engine}
                      dataset={dataset}
                      sql={target}
                      result={result}
                      active
                    />
                  )}

                  {tab === "plan" && (
                    <ExecutionPlanVisualizer
                      engine={engine}
                      dataset={dataset}
                      sql={target}
                      ready={ready}
                      active
                      dark={dark}
                    />
                  )}

                  {tab === "schema" && <SchemaVisualizer schema={schema} active />}
                </div>
              </section>
            }
          />
        </main>
      </div>
    </div>
  );
}
