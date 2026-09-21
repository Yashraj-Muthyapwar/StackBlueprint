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
  Upload,
} from "lucide-react";
import { format as formatSql } from "sql-formatter";

import { db, Engine, EngineState, QueryResult, splitStatements } from "./db/db-client";
import { findDialectIssues, summariseIssues } from "./db/dialect";
import { fetchSchema, SchemaSnapshot, toCompletionSchema } from "./db/metadata";
import { DATASETS, DEFAULT_DATASET, getDataset, humanBytes, type DatasetId } from "./db/datasets";
import { examplesFor, starterFor } from "./content";
import { getPractice, type PlaygroundPractice } from "./content/practice";
import { SqlEditor, SqlEditorHandle, type RunTarget } from "./SqlEditor";
import { SplitPane } from "./SplitPane";
import { DatasetPicker } from "./DatasetPicker";
import { QueryResultTable } from "./QueryResultTable";
import { SchemaExplorer } from "./explorer/SchemaExplorer";
import { SchemaVisualizer } from "./visualizer/SchemaVisualizer";
import { QueryFlowVisualizer } from "./visualizer/QueryFlowVisualizer";
import { ExecutionPlanVisualizer } from "./visualizer/ExecutionPlanVisualizer";
import { ChartVisualizer } from "./visualizer/ChartVisualizer";
import { CsvUploader } from "./CsvUploader";
import { useIsDark } from "./useIsDark";

import { ChallengeList } from "./challenges/ChallengeList";
import { ChallengePanel } from "./challenges/ChallengePanel";
import { DatasetSwitchDialog } from "./challenges/DatasetSwitchDialog";
import { getChallenge } from "./challenges/definitions";
import { enforceQueryPolicy } from "./challenges/query-policy";
import { validateResult } from "./challenges/validate";
import { categorizeEngineError } from "./challenges/error-copy";
import {
  saveProgress,
  getChallengeDraft,
  saveChallengeDraft,
  clearChallengeDraft,
  getProgress,
} from "./challenges/progress";
import type { ChallengeDefinition, CheckOutcome } from "./challenges/types";

import "./sql-flow.css";

type Tab = "results" | "pipeline" | "plan" | "schema" | "chart";

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
  const [practice, setPractice] = useState<PlaygroundPractice | null>(null);
  /** Bumped after a reset or dataset load so dependent views refetch. */
  const [schemaVersion, setSchemaVersion] = useState(0);

  const [uploaderOpen, setUploaderOpen] = useState(false);

  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<CheckOutcome | null>(null);
  const [challengeMode, setChallengeMode] = useState(false);
  const [switchDialog, setSwitchDialog] = useState<{
    isOpen: boolean;
    targetChallenge?: ChallengeDefinition;
  }>({ isOpen: false });

  const active = getDataset(dataset);

  // Lesson links contain a short, trusted practice ID. Keep the saved editor
  // draft untouched until the learner explicitly chooses to load the exercise.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPractice(getPractice(params.get("practice")));
  }, []);

  // ---- persistence -----------------------------------------------------
  useEffect(() => {
    const savedEngine = localStorage.getItem(ENGINE_KEY);
    const savedDataset = localStorage.getItem(DATASET_KEY) as DatasetId | null;

    let nextEngine: Engine = savedEngine === "duckdb" ? "duckdb" : "postgres";
    let nextDataset = DEFAULT_DATASET;
    if (savedDataset && DATASETS.some((d) => d.id === savedDataset)) {
      nextDataset = savedDataset;
    }
    // A stored pair can be invalid when a dataset no longer supports an engine.
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
    const id = setTimeout(() => {
      if (activeChallengeId) {
        saveChallengeDraft(activeChallengeId, engine, dataset, sql);
      } else {
        localStorage.setItem(SQL_KEY, sql);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [sql, activeChallengeId, engine, dataset]);

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

  const runChallenge = useCallback(async () => {
    if (!activeChallengeId) return;
    const challenge = getChallenge(activeChallengeId);
    if (!challenge) return;

    const text = sql.trim();
    if (!text) return;

    setRunning(true);
    setTab("results");

    const policy = enforceQueryPolicy(text);
    if (!policy.valid) {
      setChallengeFeedback({
        state: "query-error",
        category: policy.category,
        detail: policy.detail,
      });
      setRunning(false);
      return;
    }

    const expectedQuery =
      challenge.validator.expectedSql[engine] || challenge.validator.expectedSql.postgres;
    if (!expectedQuery) {
      setChallengeFeedback({ state: "unavailable", message: "No expected SQL for this engine." });
      setRunning(false);
      return;
    }

    try {
      const expectedRes = await db.runOrThrow(engine, dataset, expectedQuery);

      const res = await db.run(engine, dataset, policy.sql);
      setResult(res);
      setRanSql(policy.sql);
      setRunOffset(0);

      if (res.error) {
        const cat = categorizeEngineError(res.error);
        setChallengeFeedback({ state: "query-error", category: cat.category, detail: cat.detail });
      } else {
        const validation = validateResult(res, expectedRes, challenge.validator);
        setChallengeFeedback(validation);

        if (validation.state === "passed") {
          const oldProg = getProgress(challenge.id);
          saveProgress(challenge.id, {
            version: challenge.version,
            completedAt: Date.now(),
            attempts: (oldProg?.attempts || 0) + 1,
            revealedHintCount: oldProg?.revealedHintCount || 0,
            revealedSolution: oldProg?.revealedSolution || false,
            needsReview: oldProg?.needsReview,
          });
        }
      }
    } catch (e: any) {
      console.error("Challenge oracle failed:", e);
      setChallengeFeedback({
        state: "unavailable",
        message: "The challenge configuration failed.",
      });
    }
    setRunning(false);
  }, [activeChallengeId, sql, engine, dataset]);

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

  const handleSelectChallenge = useCallback(
    (challenge: ChallengeDefinition) => {
      if (dataset !== challenge.dataset || !challenge.engines.includes(engine)) {
        setSwitchDialog({ isOpen: true, targetChallenge: challenge });
        return;
      }

      setActiveChallengeId(challenge.id);
      setChallengeFeedback(null);
      const draft = getChallengeDraft(challenge.id, engine, dataset);
      setSql(draft || challenge.starterSql || "");
    },
    [dataset, engine],
  );

  const confirmSwitch = useCallback(() => {
    const challenge = switchDialog.targetChallenge;
    if (!challenge) return;

    setSwitchDialog({ isOpen: false });
    const nextEngine = challenge.engines.includes(engine) ? engine : challenge.engines[0];
    const draft = getChallengeDraft(challenge.id, nextEngine, challenge.dataset);
    const sqlToLoad = draft || challenge.starterSql || "";

    switchDataset(challenge.dataset, sqlToLoad);
    setActiveChallengeId(challenge.id);
    setChallengeFeedback(null);
  }, [switchDialog.targetChallenge, engine]); // Note: cannot easily include switchDataset in deps here due to circularity if we aren't careful, but it's safe to just use it.

  const handleExitChallenge = useCallback(() => {
    setActiveChallengeId(null);
    setChallengeFeedback(null);
    const draft = localStorage.getItem(SQL_KEY);
    setSql(draft && draft.trim() ? draft : starterFor(dataset, engine));
  }, [dataset, engine]);

  const handleResetChallenge = useCallback(() => {
    if (!activeChallengeId) return;
    const challenge = getChallenge(activeChallengeId);
    if (!challenge) return;
    if (window.confirm("Are you sure you want to discard your changes to this challenge?")) {
      clearChallengeDraft(activeChallengeId, engine, dataset);
      setSql(challenge.starterSql || "");
      setChallengeFeedback(null);
    }
  }, [activeChallengeId, engine, dataset]);

  // Switching dataset also swaps the editor contents to the new dataset's starter query
  // so that the user doesn't get schema mismatch errors with old queries.
  const switchDataset = useCallback(
    (next: DatasetId, overrideSql?: string) => {
      const def = getDataset(next);
      const nextEngine = def.engines.includes(engine) ? engine : def.engines[0];

      setDataset(next);
      setEngine(nextEngine);
      setResult(null);
      setRanSql("");
      setTab("results");
      setSql(overrideSql || starterFor(next, nextEngine));
    },
    [engine],
  );

  const loadPractice = useCallback(() => {
    if (!practice) return;
    setDataset(practice.dataset);
    setEngine(practice.engine);
    const challenge = practice.challengeId ? getChallenge(practice.challengeId) : undefined;
    if (challenge) {
      setChallengeMode(true);
      setActiveChallengeId(challenge.id);
      setChallengeFeedback(null);
      setSql(challenge.starterSql || practice.starterSql);
    } else {
      setSql(practice.starterSql);
    }
    setResult(null);
    setRanSql("");
    setTab("results");
    setPractice(null);
  }, [practice]);

  const handleUpload = async (
    file: File,
    tableName: string,
    targetChoice: "workspace" | "current",
  ) => {
    let targetDataset = dataset;
    const targetEngine = engine;

    if (targetChoice === "workspace" && dataset !== "my-workspace") {
      targetDataset = "my-workspace";
    }

    await db.uploadCsv(targetEngine, targetDataset, file, tableName);

    // Switch to the target dataset if we aren't already on it
    const previewSql = `SELECT * FROM "uploads"."${tableName}" LIMIT 50;`;
    if (dataset !== targetDataset || engine !== targetEngine) {
      switchDataset(targetDataset, previewSql);
    } else {
      // Force schema reload
      setSchemaVersion((v) => v + 1);

      // Auto-populate query editor with starter
      setSql(previewSql);
      setTab("results");

      // Automatically run the preview
      setTimeout(() => run(previewSql), 100);
    }
  };

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
    { id: "chart", label: "Chart" },
    { id: "pipeline", label: "Pipeline" },
    { id: "plan", label: "Plan" },
    { id: "schema", label: "Schema map" },
  ];

  return (
    <div className={`sqlx ${dark ? "sqlx-dark" : ""}`} data-engine={engine}>
      <div className="sqlx-top">
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

          <button
            className="sqlx-btn secondary"
            onClick={() => setUploaderOpen(true)}
            style={{ marginLeft: 8 }}
          >
            <Upload size={14} /> Upload Data
          </button>

          <div
            className="sqlx-engines"
            role="tablist"
            aria-label="Database engine"
            style={{ marginLeft: "auto" }}
          >
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

        {practice && (
          <div className="sqlx-practice-banner">
            <div>
              <strong>Practice ready: {practice.title}</strong>
              <span>{practice.prompt}</span>
            </div>
            <div className="sqlx-practice-actions">
              <button className="sqlx-btn primary" onClick={loadPractice}>
                Load exercise
              </button>
              <button className="sqlx-link" onClick={() => setPractice(null)}>
                Keep my draft
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="sqlx-body">
        <aside className="sqlx-aside">
          <SchemaExplorer
            schema={schema}
            groups={groups}
            datasetName={active.name}
            loading={schemaLoading}
            onUseQuery={useQuery}
            challengeMode={challengeMode}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "-8px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  cursor: "pointer",
                  color: "var(--text-secondary, #666)",
                  fontWeight: 500,
                }}
              >
                <input
                  type="checkbox"
                  checked={challengeMode}
                  onChange={(e) => setChallengeMode(e.target.checked)}
                  style={{ cursor: "pointer", accentColor: "var(--accent, #6366f1)" }}
                />
                Challenge Mode
              </label>
            </div>
            {challengeMode && (
              <ChallengeList
                dataset={dataset}
                engine={engine}
                activeChallengeId={activeChallengeId}
                onSelectChallenge={handleSelectChallenge}
              />
            )}
          </SchemaExplorer>
        </aside>

        <main
          className="sqlx-main"
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {challengeMode && activeChallengeId && (
            <div
              style={{
                padding: "12px 14px 0 14px",
                flex: "none",
                overflowY: "auto",
                maxHeight: "50%",
              }}
            >
              <ChallengePanel
                challenge={getChallenge(activeChallengeId)!}
                engine={engine}
                onRun={runChallenge}
                onReset={handleResetChallenge}
                onExit={handleExitChallenge}
                onUseStarter={(s) => setSql(s)}
                feedback={challengeFeedback}
                running={running}
                isDatasetActive={true}
              />
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0 }}>
            <SplitPane
              storageKey="sqlx.split"
              initial={40}
              top={
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <section className="sqlx-editor-card" style={{ flex: 1, minHeight: 0 }}>
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
                          <div
                            className="sqlx-menu-panel"
                            onMouseLeave={() => setHistoryOpen(false)}
                          >
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
                        {resetting ? (
                          <Loader2 size={13} className="spin" />
                        ) : (
                          <RotateCcw size={13} />
                        )}
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
                          {active.engines.includes(
                            engine === "postgres" ? "duckdb" : "postgres",
                          ) && <em>switch engine</em>}
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
                </div>
              }
              bottom={
                <section className="sqlx-panel-wrap">
                  {!challengeMode && (
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
                  )}

                  <div className="sqlx-panel">
                    {tab === "results" &&
                      (result ? (
                        <QueryResultTable result={result} engine={engine} />
                      ) : (
                        <div className="sqlx-empty">
                          <strong>Press Run.</strong>
                          <span>
                            {active.name} is loaded on{" "}
                            {engine === "postgres" ? "PostgreSQL" : "DuckDB"}. Pick a guided query
                            on the left, or write your own.
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

                    {tab === "chart" && <ChartVisualizer result={result} engine={engine} />}

                    {tab === "schema" && <SchemaVisualizer schema={schema} active />}
                  </div>
                </section>
              }
            />
          </div>
        </main>
      </div>

      {uploaderOpen && (
        <CsvUploader
          onClose={() => setUploaderOpen(false)}
          onUpload={handleUpload}
          currentDataset={active.name}
        />
      )}

      <DatasetSwitchDialog
        isOpen={switchDialog.isOpen}
        targetDatasetName={
          switchDialog.targetChallenge ? getDataset(switchDialog.targetChallenge.dataset).name : ""
        }
        currentDatasetName={active.name}
        targetEngineName={
          switchDialog.targetChallenge
            ? switchDialog.targetChallenge.engines[0] === "postgres"
              ? "PostgreSQL"
              : "DuckDB"
            : ""
        }
        onConfirm={confirmSwitch}
        onCancel={() => setSwitchDialog({ isOpen: false })}
      />
    </div>
  );
}
