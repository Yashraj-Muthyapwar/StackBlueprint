import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Database,
  ExternalLink,
  Eye,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { format as formatSql } from "sql-formatter";
import "@/components/sql-playground/sql-flow.css";
import { SqlEditor, type SqlEditorHandle } from "@/components/sql-playground/SqlEditor";
import { useIsDark } from "@/components/sql-playground/useIsDark";
import type { QueryResult } from "@/components/sql-playground/db/db-client";
import { pgSandbox } from "@/components/sql/sandbox/pg-sandbox";
import { SCHEMA_HINT } from "@/components/sql-playground/db/dataset";
import { getChallenge } from "@/components/sql-playground/challenges/definitions";
import { enforceQueryPolicy, findForbiddenConstruct } from "@/components/sql-playground/challenges/query-policy";
import { validateResult } from "@/components/sql-playground/challenges/validate";
import {
  categorizeEngineError,
  getCheckFeedback,
  getErrorCopy,
} from "@/components/sql-playground/challenges/error-copy";
import { getProgress, saveProgress } from "@/components/sql-playground/challenges/progress";
import type { CheckOutcome } from "@/components/sql-playground/challenges/types";

const ENGINE = "postgres" as const;

function MiniTable({ result, maxRows = 8 }: { result: QueryResult; maxRows?: number }) {
  const rows = result.rows.slice(0, maxRows);
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="lesson-supporting w-full">
        <thead className="bg-surface-2 text-left text-muted-foreground">
          <tr>
            {result.fields.map((f) => (
              <th key={f.name} className="border-b border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]">
                {f.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-hairline/60 last:border-b-0">
              {result.fields.map((f) => (
                <td key={f.name} className="px-3 py-1.5 font-mono text-[12.5px] text-foreground/85">
                  {row[f.name] === null || row[f.name] === undefined ? "NULL" : String(row[f.name])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {result.rows.length > maxRows ? (
        <div className="border-t border-hairline px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
          Showing {maxRows} of {result.rows.length} rows
        </div>
      ) : null}
    </div>
  );
}

export default function InlineSqlPractice({
  challengeId,
  title,
  prompt,
  playgroundHref,
}: {
  challengeId: string;
  title: string;
  prompt: string;
  playgroundHref?: string;
}) {
  const challenge = useMemo(() => getChallenge(challengeId), [challengeId]);
  const dark = useIsDark();
  const editorRef = useRef<SqlEditorHandle>(null);
  const starter = challenge?.starterSql ?? "";
  const [sql, setSql] = useState(starter);
  const [ready, setReady] = useState(false);
  const [bootLabel, setBootLabel] = useState("Starting the SQL sandbox");
  const [preview, setPreview] = useState<Record<string, QueryResult>>({});
  const [result, setResult] = useState<QueryResult | null>(null);
  const [feedback, setFeedback] = useState<CheckOutcome | null>(null);
  const [running, setRunning] = useState(false);
  const [hintIndex, setHintIndex] = useState(-1);
  const [showSolution, setShowSolution] = useState(false);
  const [passedBefore, setPassedBefore] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setPassedBefore(Boolean(getProgress(challengeId)?.completedAt));
  }, [challengeId]);

  // Boot the in-browser PostgreSQL once this practice scrolls into view.
  const [rootNode, setRootNode] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = rootNode;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootNode, visible]);

  useEffect(() => {
    if (!visible || !challenge) return;
    let cancelled = false;
    pgSandbox
      .init()
      .then(async () => {
        const previews: Record<string, QueryResult> = {};
        for (const table of challenge.requiredTables) {
          previews[table] = await pgSandbox.run(`SELECT * FROM ${table} ORDER BY 1`);
        }
        if (!cancelled) {
          setPreview(previews);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setBootLabel("The SQL sandbox could not start. Try reloading the page.");
      });
    return () => {
      cancelled = true;
    };
  }, [visible, challenge]);

  const runAndCheck = useCallback(async () => {
    if (!challenge || running) return;
    const text = sql.trim();
    if (!text) return;
    setRunning(true);
    setAttempts((n) => n + 1);
    const policy = enforceQueryPolicy(text);
    if (!policy.valid) {
      setFeedback({ state: "query-error", category: policy.category, detail: policy.detail });
      setResult(null);
      setRunning(false);
      return;
    }
    const forbidden = findForbiddenConstruct(policy.sql, challenge.forbiddenSql);
    if (forbidden) {
      setFeedback({ state: "incorrect", reason: "forbidden-construct", detail: forbidden });
      setResult(null);
      setRunning(false);
      return;
    }
    const expectedQuery = challenge.validator.expectedSql[ENGINE];
    if (!expectedQuery) {
      setFeedback({ state: "unavailable", message: "No expected SQL for this exercise." });
      setRunning(false);
      return;
    }
    try {
      const expected = await pgSandbox.run(expectedQuery);
      if (expected.error) throw new Error(expected.error);
      const res = await pgSandbox.run(policy.sql);
      setResult(res);
      if (res.error) {
        const cat = categorizeEngineError(res.error);
        setFeedback({ state: "query-error", category: cat.category, detail: cat.detail });
      } else {
        const outcome = validateResult(res, expected, challenge.validator);
        setFeedback(outcome);
        if (outcome.state === "passed") {
          const old = getProgress(challenge.id);
          saveProgress(challenge.id, {
            version: challenge.version,
            completedAt: Date.now(),
            attempts: (old?.attempts || 0) + 1,
            revealedHintCount: old?.revealedHintCount || 0,
            revealedSolution: old?.revealedSolution || false,
            needsReview: old?.needsReview,
          });
          setPassedBefore(true);
        }
      }
    } catch {
      setFeedback({ state: "unavailable", message: "The exercise could not be checked." });
    }
    setRunning(false);
  }, [challenge, running, sql]);

  const solutionText = useMemo(() => {
    if (challenge?.solutionDisplay) return challenge.solutionDisplay;
    const raw = challenge?.solutionSql[ENGINE] ?? challenge?.solutionSql.postgres ?? "";
    try {
      return formatSql(raw, {
        language: "postgresql",
        keywordCase: "upper",
        indentStyle: "standard",
        expressionWidth: 100,
      });
    } catch {
      return raw;
    }
  }, [challenge]);

  if (!challenge) return null;

  const passed = feedback?.state === "passed";
  const btn =
    "inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-mint/40 disabled:opacity-50";

  return (
    <section ref={setRootNode} className="overflow-hidden rounded-2xl border border-mint/30 bg-mint/5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mint/20 px-5 py-3">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-mint" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">
            Practice in SQL sandbox
          </span>
          {passedBefore ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-mint/40 bg-mint/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mint">
              <CheckCircle2 className="size-3" /> Solved
            </span>
          ) : null}
        </div>
        {playgroundHref ? (
          <Link to={playgroundHref as any} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            Open full playground <ExternalLink className="size-3" />
          </Link>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="lesson-prose mt-1 text-muted-foreground">{prompt}</p>
        </div>

        {Object.entries(preview).map(([table, res]) => (
          <div key={table} className="space-y-1.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{table}</p>
            <MiniTable result={res} />
          </div>
        ))}

        <div className={`sqlx sqlx-embed ${dark ? "sqlx-dark" : ""}`} data-engine={ENGINE}>
          {ready ? (
            <SqlEditor
              ref={editorRef}
              value={sql}
              onChange={setSql}
              onRun={runAndCheck}
              onExplain={() => {}}
              onFormat={() => editorRef.current?.format()}
              schema={SCHEMA_HINT}
              engine={ENGINE}
              dark={dark}
              engineError={result?.error ? { message: result.error, hint: result.hint, from: result.errorSpan?.from, to: result.errorSpan?.to } : null}
            />
          ) : (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {bootLabel}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={`${btn} border-mint/50 bg-mint/15 text-mint`} onClick={runAndCheck} disabled={!ready || running}>
            {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            Run and check
          </button>
          <button type="button" className={btn} onClick={() => { setSql(starter); setFeedback(null); setResult(null); setHintIndex(-1); setShowSolution(false); }}>
            <RotateCcw className="size-3.5" /> Reset
          </button>
          {challenge.hints.length > 0 ? (
            <button
              type="button"
              className={btn}
              disabled={hintIndex >= challenge.hints.length - 1}
              onClick={() => setHintIndex((i) => Math.min(i + 1, challenge.hints.length - 1))}
            >
              <Lightbulb className="size-3.5" />
              {hintIndex === -1 ? "Hint" : hintIndex >= challenge.hints.length - 1 ? "No more hints" : "Next hint"}
            </button>
          ) : null}
          <button
            type="button"
            className={btn}
            disabled={attempts === 0}
            title={attempts === 0 ? "Run your query at least once to unlock the solution" : undefined}
            onClick={() => setShowSolution((s) => !s)}
          >
            <Eye className="size-3.5" /> {showSolution ? "Hide solution" : "Reveal solution"}
          </button>
        </div>

        {hintIndex >= 0 ? (
          <ul className="lesson-supporting list-disc space-y-1 rounded-lg border border-hairline bg-surface-2/50 py-3 pl-8 pr-4 text-foreground/85">
            {challenge.hints.slice(0, hintIndex + 1).map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        ) : null}

        {attempts === 0 ? (
          <p className="font-mono text-[11px] text-muted-foreground">
            Run your query at least once to unlock the solution.
          </p>
        ) : null}

        {showSolution && attempts > 0 ? (
          <pre className="lesson-code overflow-x-auto whitespace-pre rounded-lg border border-hairline bg-surface-2/50 px-4 py-3 font-mono">
            {solutionText}
          </pre>
        ) : null}

        {feedback ? (
          <div
            className={`flex gap-3 rounded-lg border p-3 ${
              passed
                ? "border-mint/40 bg-mint/10"
                : feedback.state === "incorrect"
                  ? "border-amber/40 bg-amber/10"
                  : "border-rose-500/40 bg-rose-500/10"
            }`}
          >
            {passed ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-mint" />
            ) : (
              <XCircle className="mt-0.5 size-5 shrink-0 text-rose-400" />
            )}
            <div className="lesson-supporting text-foreground/90">
              {feedback.state === "passed" ? (
                <>
                  <p className="font-semibold">{challenge.success.title}</p>
                  <p>{challenge.success.body}</p>
                </>
              ) : feedback.state === "incorrect" ? (
                <>
                  <p className="font-semibold">Not quite</p>
                  <p>{getCheckFeedback(feedback.reason, feedback.detail).body}</p>
                </>
              ) : feedback.state === "query-error" ? (
                <>
                  <p className="font-semibold">{getErrorCopy(feedback.category, feedback.detail, challenge).title}</p>
                  <p>{getErrorCopy(feedback.category, feedback.detail, challenge).body}</p>
                </>
              ) : (
                <p>{feedback.message}</p>
              )}
            </div>
          </div>
        ) : null}

        {result && !result.error ? (
          <div className="space-y-1.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Your result</p>
            <MiniTable result={result} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
