import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw, XCircle } from "lucide-react";
import "@/components/sql-playground/sql-flow.css";
import { SqlEditor, type SqlEditorHandle } from "@/components/sql-playground/SqlEditor";
import { useIsDark } from "@/components/sql-playground/useIsDark";
import type { QueryResult } from "@/components/sql-playground/db/db-client";
import { SCHEMA_HINT } from "@/components/sql-playground/db/dataset";
import { getChallenge } from "@/components/sql-playground/challenges/definitions";
import {
  enforceQueryPolicy,
  findForbiddenConstruct,
  hasOuterOrderBy,
  stripQuotedText,
} from "@/components/sql-playground/challenges/query-policy";
import { validateResult } from "@/components/sql-playground/challenges/validate";
import { pgSandbox } from "@/components/sql/sandbox/pg-sandbox";
import { highlightSql } from "@/components/sql/SectionRenderer";
import type { CheckRule, ChoiceQuestion } from "@/lessons/sql/window-foundations-assessment";

// Building blocks shared by the SQL module assessments (Window Foundations, Ranking & Distribution).

export type RuleResult = { id: string; text: string; points: number; earned: boolean; note?: string };

/** Points for a multiple choice question that does not set its own. */
export const DEFAULT_CHOICE_POINTS = 4;

export const BTN =
  "inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-mint/40 disabled:cursor-not-allowed disabled:opacity-50";
export const BTN_PRIMARY = `${BTN} border-mint/50 bg-mint/15 text-mint`;
export const INPUT =
  "w-full rounded-md border border-hairline bg-surface px-2.5 py-1.5 font-mono text-[13px] text-foreground focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint disabled:opacity-60";
export const TH = "border-b border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]";

export const pointsOf = (q: ChoiceQuestion) => q.points ?? DEFAULT_CHOICE_POINTS;

/** Inline `code` and **bold** in short strings. */
export function inline(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-mint/10 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-mint">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="lesson-code overflow-x-auto rounded-lg border border-hairline bg-surface-2/50 px-4 py-3 font-mono">
      <code>
        {code.split("\n").map((line, i) => (
          <div key={i}>{highlightSql(line)}</div>
        ))}
      </code>
    </pre>
  );
}

export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-hairline bg-surface/40 p-5">
      <header>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

// ------------------------------------------------------------------ multiple choice

// ------------------------------------------------------------------ multiple choice

export function ChoiceBlock({
  question,
  answer,
  onAnswer,
}: {
  question: ChoiceQuestion;
  answer: number | undefined;
  onAnswer: (index: number) => void;
}) {
  const answered = answer !== undefined;
  const correct = answer === question.correctIndex;
  const pts = pointsOf(question);

  return (
    <div className="space-y-3">
      <p className="lesson-prose text-foreground">{question.prompt}</p>
      {question.code ? <CodeBlock code={question.code} /> : null}
      <div className="space-y-2" role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option, i) => {
          const picked = answer === i;
          const isCorrect = i === question.correctIndex;
          const show = answered && (isCorrect || picked);
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={picked}
              disabled={answered}
              onClick={() => onAnswer(i)}
              className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                show && isCorrect
                  ? "border-mint/60 bg-mint/10"
                  : show && picked
                    ? "border-rose-500/50 bg-rose-500/10"
                    : "border-hairline bg-surface hover:border-mint/40"
              } ${answered && !show ? "opacity-60" : ""}`}
            >
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-hairline font-mono text-[11px]">
                {question.options.length > 2 ? String.fromCharCode(65 + i) : i === 0 ? "T" : "F"}
              </span>
              <span className="lesson-supporting text-foreground/90">{option}</span>
            </button>
          );
        })}
      </div>
      {answered ? (
        <div
          className={`lesson-supporting rounded-lg border p-3 ${
            correct ? "border-mint/40 bg-mint/10" : "border-amber/40 bg-amber/10"
          }`}
        >
          <p className="font-semibold">{correct ? `Correct (${pts} points)` : "Not quite (0 points)"}</p>
          <p className="mt-1 text-foreground/90">{question.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}

/** One question at a time with numbered dots. */
export function Stepper({
  questions,
  answers,
  onAnswer,
  onDone,
  doneLabel,
}: {
  questions: ChoiceQuestion[];
  answers: Record<string, number>;
  onAnswer: (id: string, index: number) => void;
  onDone: () => void;
  doneLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const q = questions[index];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Question {index + 1} of {questions.length}
        </p>
        <div className="flex gap-1.5">
          {questions.map((x, i) => (
            <button
              key={x.id}
              type="button"
              aria-label={`Question ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`size-6 rounded-full border font-mono text-[10px] ${
                i === index
                  ? "border-mint bg-mint/20 text-mint"
                  : answers[x.id] !== undefined
                    ? "border-violet/50 bg-violet/10 text-violet"
                    : "border-hairline text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      <ChoiceBlock key={q.id} question={q} answer={answers[q.id]} onAnswer={(i) => onAnswer(q.id, i)} />
      <div className="flex gap-2">
        <button type="button" className={BTN} disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          Previous
        </button>
        {index < questions.length - 1 ? (
          <button type="button" className={BTN_PRIMARY} onClick={() => setIndex((i) => i + 1)}>
            Next question
          </button>
        ) : (
          <button type="button" className={BTN_PRIMARY} onClick={onDone}>
            {doneLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ sql challenge

// ------------------------------------------------------------------ section C

export function ResultTable({ result }: { result: QueryResult }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="lesson-supporting w-full">
        <thead className="bg-surface-2 text-left text-muted-foreground">
          <tr>
            {result.fields.map((f) => (
              <th key={f.name} className={TH}>
                {f.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.slice(0, 10).map((row, i) => (
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
    </div>
  );
}

export function SqlChallenge({
  challengeId,
  rules: ruleDefs,
  label,
  maxPoints,
  active,
  onScored,
}: {
  challengeId: string;
  rules: CheckRule[];
  label: string;
  maxPoints: number;
  active: boolean;
  onScored: (results: RuleResult[], valid: boolean) => void;
}) {
  const challenge = useMemo(() => getChallenge(challengeId), [challengeId]);
  const dark = useIsDark();
  const editorRef = useRef<SqlEditorHandle>(null);
  const [sql, setSql] = useState(challenge?.starterSql ?? "");
  const [ready, setReady] = useState(false);
  const [boot, setBoot] = useState("Starting the SQL sandbox");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [rules, setRules] = useState<RuleResult[] | null>(null);

  useEffect(() => {
    if (!active || ready) return;
    let cancelled = false;
    pgSandbox
      .init()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setBoot("The SQL sandbox could not start. Try reloading the page.");
      });
    return () => {
      cancelled = true;
    };
  }, [active, ready]);

  const run = useCallback(async () => {
    if (!challenge || running) return;
    const text = sql.trim();
    if (!text) return;
    setRunning(true);
    setNotice(null);
    const base: RuleResult[] = ruleDefs.map((r) => ({ id: r.id, text: r.text, points: r.points, earned: false }));
    const finish = (list: RuleResult[], valid: boolean, res: QueryResult | null, message: string | null) => {
      setRules(list);
      setResult(res);
      setNotice(message);
      onScored(list, valid);
      setRunning(false);
    };

    const policy = enforceQueryPolicy(text);
    if (!policy.valid) {
      finish(
        base,
        false,
        null,
        policy.category === "syntax"
          ? "That is not a valid SELECT or WITH query. Check the first keyword for a typo."
          : policy.category === "multiple-statements"
            ? "Write one query only. Remove the extra statement."
            : "Write a single SELECT or WITH query. Statements that change data are not allowed in the assessment.",
      );
      return;
    }
    const res = await pgSandbox.run(policy.sql);
    if (res.error) {
      finish(base, false, res, `PostgreSQL could not run your query: ${res.error}`);
      return;
    }

    const cleaned = stripQuotedText(policy.sql);
    const forbidden = findForbiddenConstruct(policy.sql, challenge.forbiddenSql);
    const expected = await pgSandbox.run(challenge.validator.expectedSql.postgres ?? "");
    const outcome = !expected.error && !forbidden ? validateResult(res, expected, challenge.validator) : null;

    const list = ruleDefs.map<RuleResult>((r) => {
      if (r.id === "valid") return { id: r.id, text: r.text, points: r.points, earned: true };
      if (r.id === "result") {
        return {
          id: r.id,
          text: r.text,
          points: r.points,
          earned: outcome?.state === "passed",
          note: forbidden ?? (outcome && outcome.state !== "passed" ? "The rows or columns do not match the expected result yet." : undefined),
        };
      }
      const matches = new RegExp(r.pattern ?? "", "i").test(cleaned);
      const earned = r.id === "outer-order" ? matches && hasOuterOrderBy(policy.sql) : matches;
      return { id: r.id, text: r.text, points: r.points, earned };
    });
    finish(list, true, res, forbidden);
  }, [challenge, running, sql, onScored, ruleDefs]);

  if (!challenge) return null;
  const earned = rules?.reduce((sum, r) => sum + (r.earned ? r.points : 0), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className={`sqlx sqlx-embed ${dark ? "sqlx-dark" : ""}`} data-engine="postgres">
        {ready ? (
          <SqlEditor
            ref={editorRef}
            value={sql}
            onChange={setSql}
            onRun={run}
            onExplain={() => {}}
            onFormat={() => editorRef.current?.format()}
            schema={SCHEMA_HINT}
            engine="postgres"
            dark={dark}
            engineError={
              result?.error
                ? { message: result.error, hint: result.hint, from: result.errorSpan?.from, to: result.errorSpan?.to }
                : null
            }
          />
        ) : (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {boot}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={BTN_PRIMARY} onClick={run} disabled={!ready || running}>
          {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          Run and score
        </button>
        <button
          type="button"
          className={BTN}
          onClick={() => {
            setSql(challenge.starterSql ?? "");
            setRules(null);
            setResult(null);
            setNotice(null);
            onScored([], false);
          }}
        >
          <RotateCcw className="size-3.5" /> Reset
        </button>
      </div>

      {notice ? (
        <div className="lesson-supporting rounded-lg border border-amber/40 bg-amber/10 p-3 text-foreground/90">{notice}</div>
      ) : null}

      {rules ? (
        <div className="space-y-2 rounded-lg border border-hairline bg-surface/50 p-4">
          <p className="font-mono text-[12px] text-mint">
            {label} score: {earned} / {maxPoints} points
          </p>
          <ul className="space-y-1.5">
            {rules.map((r) => (
              <li key={r.id} className="lesson-supporting flex items-start gap-2 text-foreground/90">
                {r.earned ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-rose-400" />
                )}
                <span>
                  {r.text}{" "}
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ({r.earned ? r.points : 0} / {r.points})
                  </span>
                  {r.note ? <span className="block text-[12.5px] text-amber">{r.note}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result && !result.error ? (
        <div className="space-y-1.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Your result</p>
          <ResultTable result={result} />
        </div>
      ) : null}
    </div>
  );
}
