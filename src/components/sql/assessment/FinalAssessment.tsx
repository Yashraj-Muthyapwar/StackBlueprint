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
import { QUIZ_STARTED_EVENT, emitQuizResults, type QuizReviewItem } from "@/lib/rivet/quiz";
import {
  B1_CODE,
  B1_EXPLAIN,
  B1_ROWS,
  B2_CODE,
  B2_EXPECTED,
  B2_EXPLAIN,
  C_CHALLENGE_ID,
  C_COLUMNS,
  C_REQUIREMENTS,
  C_RULES,
  POINTS,
  SECTION_A,
  SECTION_D,
  TRANSACTIONS,
  type ChoiceQuestion,
} from "@/lessons/sql/window-foundations-assessment";

type SectionId = "A" | "B" | "C" | "D" | "R";
type RuleResult = { id: string; text: string; points: number; earned: boolean; note?: string };

const SECTION_MAX = { A: 20, B: 20, C: 40, D: 20 } as const;

const BTN =
  "inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-mint/40 disabled:cursor-not-allowed disabled:opacity-50";
const BTN_PRIMARY = `${BTN} border-mint/50 bg-mint/15 text-mint`;
const INPUT =
  "w-full rounded-md border border-hairline bg-surface px-2.5 py-1.5 font-mono text-[13px] text-foreground focus:border-mint focus:outline-none focus:ring-1 focus:ring-mint disabled:opacity-60";
const TH = "border-b border-hairline px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]";

const pointsOf = (q: ChoiceQuestion) => q.points ?? POINTS.choice;

/** Inline `code` and **bold** in short strings. */
function inline(text: string): ReactNode[] {
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

function CodeBlock({ code }: { code: string }) {
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

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
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

function TransactionsTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="lesson-supporting w-full">
        <thead className="bg-surface-2 text-left text-muted-foreground">
          <tr>
            {["txn_id", "account_id", "txn_date", "amount"].map((h) => (
              <th key={h} className={TH}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TRANSACTIONS.map((t) => (
            <tr key={t.txn_id} className="border-b border-hairline/60 last:border-b-0">
              <td className="px-3 py-1.5 font-mono text-[12.5px] text-foreground">{t.txn_id}</td>
              <td className="px-3 py-1.5 font-mono text-[12.5px] text-foreground/85">{t.account_id}</td>
              <td className="px-3 py-1.5 font-mono text-[12.5px] text-foreground/85">{t.txn_date}</td>
              <td className="px-3 py-1.5 font-mono text-[12.5px] text-foreground/85">{t.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------------------------------------------ multiple choice

function ChoiceBlock({
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

/** One question at a time with numbered dots, used by Sections A and D. */
function Stepper({
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

// ------------------------------------------------------------------ section C

function ResultTable({ result }: { result: QueryResult }) {
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

function SqlChallenge({
  active,
  onScored,
}: {
  active: boolean;
  onScored: (results: RuleResult[], valid: boolean) => void;
}) {
  const challenge = useMemo(() => getChallenge(C_CHALLENGE_ID), []);
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
    const base: RuleResult[] = C_RULES.map((r) => ({ id: r.id, text: r.text, points: r.points, earned: false }));
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

    const list = C_RULES.map<RuleResult>((r) => {
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
  }, [challenge, running, sql, onScored]);

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
            Section C score: {earned} / {SECTION_MAX.C} points
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

// ------------------------------------------------------------------ main component

export default function FinalAssessment() {
  const [started, setStarted] = useState(false);
  const [section, setSection] = useState<SectionId>("A");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [b1Inputs, setB1Inputs] = useState<Record<number, string>>({});
  const [b1Checked, setB1Checked] = useState(false);
  const [b2Pairs, setB2Pairs] = useState<{ id: string; total: string }[]>(
    Array.from({ length: 4 }, () => ({ id: "", total: "" })),
  );
  const [b2Checked, setB2Checked] = useState(false);
  const [cRules, setCRules] = useState<RuleResult[]>([]);
  const [cValid, setCValid] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const passedSent = useRef(false);

  const setAnswer = (id: string, index: number) => setAnswers((a) => ({ ...a, [id]: index }));
  const allQuestions = [...SECTION_A, B1_EXPLAIN, B2_EXPLAIN, ...SECTION_D];
  const isCorrect = (id: string) => answers[id] === allQuestions.find((x) => x.id === id)!.correctIndex;
  const earnedFor = (qs: ChoiceQuestion[]) => qs.reduce((sum, q) => sum + (isCorrect(q.id) ? pointsOf(q) : 0), 0);

  // ---- scoring
  const aPoints = earnedFor(SECTION_A);
  const dPoints = earnedFor(SECTION_D);

  const b1Correct = (txn: number) => {
    const row = B1_ROWS.find((r) => r.txn_id === txn)!;
    const typed = (b1Inputs[txn] ?? "").trim();
    return b1Checked && typed !== "" && Number(typed) === row.expected;
  };
  const b1Values = B1_ROWS.reduce((sum, r) => sum + (b1Correct(r.txn_id) ? POINTS.predictionValue : 0), 0);

  const pairMatches = (p: { id: string; total: string }, exp: { txn_id: number; total: number }) =>
    p.id.trim() !== "" && p.total.trim() !== "" && Number(p.id) === exp.txn_id && Number(p.total) === exp.total;
  const b2Matches = B2_EXPECTED.map((exp) => b2Checked && b2Pairs.some((p) => pairMatches(p, exp)));
  const b2Wrong = b2Checked
    ? b2Pairs.filter((p) => (p.id.trim() || p.total.trim()) && !B2_EXPECTED.some((e) => pairMatches(p, e))).length
    : 0;
  const b2Values = Math.max(0, (b2Matches.filter(Boolean).length - b2Wrong) * POINTS.pairValue);

  const bPoints = b1Values + earnedFor([B1_EXPLAIN]) + b2Values + earnedFor([B2_EXPLAIN]);
  const cPoints = cRules.reduce((sum, r) => sum + (r.earned ? r.points : 0), 0);
  const total = aPoints + bPoints + cPoints + dPoints;

  const critical = [
    { id: "keep-rows", text: "Window functions keep every row (A1)", ok: isCorrect("a1") },
    {
      id: "frames",
      text: "The default frame includes peers (A2 and the B1 totals for transactions 2 and 3)",
      ok: isCorrect("a2") && b1Correct(2) && b1Correct(3),
    },
    {
      id: "execution-order",
      text: "WHERE runs before window functions (A3, the B2 totals, and D2)",
      ok: isCorrect("a3") && b2Matches[0] && b2Matches[1] && isCorrect("d2a"),
    },
    { id: "order-by", text: "Only the outer ORDER BY guarantees display order (A5)", ok: isCorrect("a5") },
  ];
  const criticalOk = critical.every((c) => c.ok);
  const passed = total >= POINTS.passScore && cValid && criticalOk;

  // Rivet gets the review items only once the result screen is shown.
  useEffect(() => {
    if (section !== "R") return;
    const items: QuizReviewItem[] = [
      ...allQuestions.map((q) => ({
        question: q.prompt,
        userAnswer: answers[q.id] !== undefined ? q.options[answers[q.id]] : "(no answer)",
        correctAnswer: q.options[q.correctIndex],
        correct: isCorrect(q.id),
        explanation: q.explanation,
      })),
      {
        question: "B1: Predict the running_total for every transaction",
        userAnswer: B1_ROWS.map((r) => `txn ${r.txn_id}: ${b1Inputs[r.txn_id]?.trim() || "-"}`).join(", "),
        correctAnswer: B1_ROWS.map((r) => `txn ${r.txn_id}: ${r.expected}`).join(", "),
        correct: b1Values === B1_ROWS.length,
      },
      {
        question: "B2: State the returned rows and account_total values",
        userAnswer: b2Pairs.filter((p) => p.id || p.total).map((p) => `txn ${p.id || "-"}: ${p.total || "-"}`).join(", ") || "(no answer)",
        correctAnswer: B2_EXPECTED.map((e) => `txn ${e.txn_id}: ${e.total}`).join(", "),
        correct: b2Values === B2_EXPECTED.length * POINTS.pairValue,
      },
      {
        question: "C: Transaction analytics report",
        userAnswer: `${cPoints} of ${SECTION_MAX.C} points`,
        correctAnswer: `${SECTION_MAX.C} of ${SECTION_MAX.C} points`,
        correct: cPoints === SECTION_MAX.C,
      },
    ];
    emitQuizResults(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    if (section === "R" && passed && !passedSent.current) {
      passedSent.current = true;
      window.dispatchEvent(new CustomEvent("quiz-passed", { detail: { score: total } }));
    }
  }, [section, passed, total]);

  const onScored = useCallback((rules: RuleResult[], valid: boolean) => {
    setCRules(rules);
    setCValid(valid);
  }, []);

  const start = () => {
    setStarted(true);
    // Rivet stays hidden while the assessment is in progress.
    window.dispatchEvent(new CustomEvent(QUIZ_STARTED_EVENT));
  };

  const reset = () => {
    setSection("A");
    setAnswers({});
    setB1Inputs({});
    setB1Checked(false);
    setB2Pairs(Array.from({ length: 4 }, () => ({ id: "", total: "" })));
    setB2Checked(false);
    setCRules([]);
    setCValid(false);
    passedSent.current = false;
    setAttempt((n) => n + 1);
    window.dispatchEvent(new CustomEvent(QUIZ_STARTED_EVENT));
  };

  const sectionScore = { A: aPoints, B: bPoints, C: cPoints, D: dPoints };
  const tabs: { id: SectionId; label: string }[] = [
    { id: "A", label: "A: Mini-quiz" },
    { id: "B", label: "B: Predictions" },
    { id: "C", label: "C: SQL challenge" },
    { id: "D", label: "D: Interview" },
    { id: "R", label: "Results" },
  ];

  if (!started) {
    return (
      <section className="space-y-6 rounded-2xl border border-hairline bg-surface/40 p-6 md:p-8">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">Final assessment</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Window Function Foundations</h2>
          <p className="lesson-prose mt-1 text-muted-foreground">
            Window functions, frames, and SQL's logical execution order.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-hairline bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Total assessment</p>
            <p className="mt-1 text-2xl font-semibold">{POINTS.total} points</p>
          </div>
          <div className="rounded-xl border border-hairline bg-surface p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Passing score</p>
            <p className="mt-1 text-2xl font-semibold">
              {POINTS.passScore}/{POINTS.total}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-hairline">
          <table className="lesson-supporting w-full">
            <thead className="bg-surface-2 text-left text-muted-foreground">
              <tr>
                <th className={TH}>Section</th>
                <th className={`${TH} text-right`}>Points</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["A: Mini-quiz (5 questions)", SECTION_MAX.A],
                ["B: Output prediction", SECTION_MAX.B],
                ["C: Practical PostgreSQL challenge", SECTION_MAX.C],
                ["D: Interview questions (4 questions)", SECTION_MAX.D],
              ].map(([name, pts]) => (
                <tr key={name as string} className="border-b border-hairline/60">
                  <td className="px-3 py-2">{name}</td>
                  <td className="px-3 py-2 text-right font-mono">{pts}</td>
                </tr>
              ))}
              <tr>
                <td className="px-3 py-2 font-semibold">Total</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{POINTS.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">To pass</p>
          <p className="lesson-prose text-foreground/90">
            You must earn at least {POINTS.passScore} points, write valid PostgreSQL for the main coding challenge, and
            demonstrate no critical misconceptions about window functions, frames, or execution order.
          </p>
          <p className="lesson-supporting text-muted-foreground">
            Every question is scored automatically. Choose carefully: each multiple choice answer locks once you pick it.
          </p>
        </div>

        <button type="button" className={`${BTN_PRIMARY} px-5 py-2.5 text-sm`} onClick={start}>
          <Play className="size-4" /> Start assessment
        </button>
      </section>
    );
  }

  return (
    <div key={attempt} className="space-y-5">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Assessment sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={section === t.id}
            onClick={() => setSection(t.id)}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              section === t.id
                ? "border-mint/50 bg-mint/15 text-mint"
                : "border-hairline bg-surface text-muted-foreground hover:border-mint/40 hover:text-foreground"
            }`}
          >
            {t.label}
            {t.id !== "R" ? ` ${sectionScore[t.id]}/${SECTION_MAX[t.id]}` : ""}
          </button>
        ))}
        <span className="ml-auto font-mono text-[12px] text-muted-foreground">
          Total so far: {total} / {POINTS.total}
        </span>
      </div>

      {section === "A" ? (
        <Card title="Section A: Mini-quiz" subtitle="5 questions, 4 points each, 20 points total">
          <Stepper
            questions={SECTION_A}
            answers={answers}
            onAnswer={setAnswer}
            onDone={() => setSection("B")}
            doneLabel="Continue to Section B"
          />
        </Card>
      ) : null}

      {section === "B" ? (
        <div className="space-y-5">
          <Card title="Section B: Output prediction" subtitle="2 questions, 10 points each, 20 points total">
            <p className="lesson-prose text-muted-foreground">
              Use this <code className="rounded bg-mint/10 px-1.5 py-0.5 font-mono text-[0.85em] text-mint">transactions</code>{" "}
              table for both questions:
            </p>
            <TransactionsTable />
          </Card>

          <Card
            title="Question B1: Window frame behavior"
            subtitle="Predict the running_total for every transaction (6 points), then pick the explanation (4 points)"
          >
            <CodeBlock code={B1_CODE} />
            <p className="lesson-supporting text-muted-foreground">
              Rows appear in the query's output order. Enter your predicted running_total for each.
            </p>
            <div className="overflow-x-auto rounded-lg border border-hairline">
              <table className="lesson-supporting w-full">
                <thead className="bg-surface-2 text-left text-muted-foreground">
                  <tr>
                    {["txn_id", "running_total (your prediction)", "check"].map((h) => (
                      <th key={h} className={TH}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {B1_ROWS.map((row) => (
                    <tr key={row.txn_id} className="border-b border-hairline/60 last:border-b-0">
                      <td className="px-3 py-1.5 font-mono text-[12.5px]">{row.txn_id}</td>
                      <td className="px-3 py-1.5">
                        <input
                          inputMode="numeric"
                          aria-label={`running_total for txn ${row.txn_id}`}
                          className={`${INPUT} max-w-[9rem]`}
                          value={b1Inputs[row.txn_id] ?? ""}
                          disabled={b1Checked}
                          onChange={(e) => setB1Inputs((v) => ({ ...v, [row.txn_id]: e.target.value }))}
                        />
                      </td>
                      <td className="px-3 py-1.5 font-mono text-[12.5px]">
                        {b1Checked ? (
                          b1Correct(row.txn_id) ? (
                            <span className="text-mint">Correct</span>
                          ) : (
                            <span className="text-amber">Expected {row.expected}</span>
                          )
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!b1Checked ? (
              <button type="button" className={BTN_PRIMARY} onClick={() => setB1Checked(true)}>
                Check my predictions
              </button>
            ) : (
              <p className="font-mono text-[12px] text-mint">Predictions: {b1Values} / 6 points</p>
            )}
            <ChoiceBlock question={B1_EXPLAIN} answer={answers[B1_EXPLAIN.id]} onAnswer={(i) => setAnswer(B1_EXPLAIN.id, i)} />
          </Card>

          <Card
            title="Question B2: Filter before window calculation"
            subtitle="State the returned rows and totals (6 points), then pick the explanation (4 points)"
          >
            <p className="lesson-prose text-foreground">Predict the output of:</p>
            <CodeBlock code={B2_CODE} />
            <p className="lesson-supporting text-muted-foreground">
              State the returned transaction IDs and their account_total values. Fill one row for each returned
              transaction and leave unused rows empty.
            </p>
            <div className="grid max-w-md gap-2">
              {b2Pairs.map((p, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <input
                    inputMode="numeric"
                    aria-label={`Returned txn_id ${i + 1}`}
                    placeholder="txn_id"
                    className={INPUT}
                    value={p.id}
                    disabled={b2Checked}
                    onChange={(e) => setB2Pairs((rows) => rows.map((r, j) => (j === i ? { ...r, id: e.target.value } : r)))}
                  />
                  <input
                    inputMode="numeric"
                    aria-label={`account_total ${i + 1}`}
                    placeholder="account_total"
                    className={INPUT}
                    value={p.total}
                    disabled={b2Checked}
                    onChange={(e) => setB2Pairs((rows) => rows.map((r, j) => (j === i ? { ...r, total: e.target.value } : r)))}
                  />
                </div>
              ))}
            </div>
            {!b2Checked ? (
              <button type="button" className={BTN_PRIMARY} onClick={() => setB2Checked(true)}>
                Check my answer
              </button>
            ) : (
              <div className="space-y-1">
                <p className="font-mono text-[12px] text-mint">Rows and totals: {b2Values} / 6 points</p>
                <p className="lesson-supporting text-foreground/90">
                  Expected rows: {B2_EXPECTED.map((e) => `txn ${e.txn_id} with ${e.total}`).join(", ")}.
                </p>
              </div>
            )}
            <ChoiceBlock question={B2_EXPLAIN} answer={answers[B2_EXPLAIN.id]} onAnswer={(i) => setAnswer(B2_EXPLAIN.id, i)} />
          </Card>

          <button type="button" className={BTN_PRIMARY} onClick={() => setSection("C")}>
            Continue to Section C
          </button>
        </div>
      ) : null}

      {section === "C" ? (
        <Card title="Section C: Practical PostgreSQL challenge" subtitle="40 points, SQL coding">
          <p className="lesson-prose text-foreground">
            You are building a transaction analytics report for a bank. Use the same six-row{" "}
            <code className="rounded bg-mint/10 px-1.5 py-0.5 font-mono text-[0.85em] text-mint">transactions</code> table
            from Section B.
          </p>
          <p className="lesson-prose text-foreground">
            Write <strong className="font-semibold">one PostgreSQL query</strong> that returns only transactions where the
            amount is greater than the average transaction amount for that account, calculated across all its
            transactions.
          </p>
          <div className="overflow-x-auto rounded-lg border border-hairline">
            <table className="lesson-supporting w-full">
              <thead className="bg-surface-2 text-left text-muted-foreground">
                <tr>
                  <th className={TH}>Column</th>
                  <th className={TH}>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {C_COLUMNS.map(([name, meaning]) => (
                  <tr key={name} className="border-b border-hairline/60 last:border-b-0">
                    <td className="px-3 py-1.5 font-mono text-[12.5px] text-mint">{name}</td>
                    <td className="px-3 py-1.5 text-foreground/85">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Requirements</p>
            <ul className="lesson-prose mt-2 list-disc space-y-1.5 pl-6 text-muted-foreground marker:text-mint">
              {C_REQUIREMENTS.map((r, i) => (
                <li key={i}>{inline(r)}</li>
              ))}
            </ul>
          </div>
          <SqlChallenge active={section === "C"} onScored={onScored} />
          <button type="button" className={BTN_PRIMARY} onClick={() => setSection("D")}>
            Continue to Section D
          </button>
        </Card>
      ) : null}

      {section === "D" ? (
        <Card title="Section D: Interview questions" subtitle="4 questions, 5 points each, 20 points total">
          <Stepper
            questions={SECTION_D}
            answers={answers}
            onAnswer={setAnswer}
            onDone={() => setSection("R")}
            doneLabel="Finish and see my result"
          />
        </Card>
      ) : null}

      {section === "R" ? (
        <Card title="Your result" subtitle={`Passing score ${POINTS.passScore} / ${POINTS.total}`}>
          <div className="flex flex-wrap items-end gap-3">
            <span className="font-mono text-5xl text-mint">{total}</span>
            <span className="pb-1.5 font-mono text-lg text-muted-foreground">/ {POINTS.total}</span>
            <span
              className={`mb-1.5 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                passed ? "border-mint/50 bg-mint/15 text-mint" : "border-amber/50 bg-amber/10 text-amber"
              }`}
            >
              {passed ? "Passed" : "Not passed yet"}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-hairline">
            <table className="lesson-supporting w-full">
              <thead className="bg-surface-2 text-left text-muted-foreground">
                <tr>
                  <th className={TH}>Section</th>
                  <th className={`${TH} text-right`}>Points</th>
                </tr>
              </thead>
              <tbody>
                {(["A", "B", "C", "D"] as const).map((id) => (
                  <tr key={id} className="border-b border-hairline/60">
                    <td className="px-3 py-1.5">
                      {{ A: "A: Mini-quiz", B: "B: Output prediction", C: "C: Practical PostgreSQL challenge", D: "D: Interview questions" }[id]}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono">
                      {sectionScore[id]} / {SECTION_MAX[id]}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-3 py-1.5 font-semibold">Total</td>
                  <td className="px-3 py-1.5 text-right font-mono font-semibold">
                    {total} / {POINTS.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">To pass you need all three</p>
            <ul className="space-y-1.5">
              {[
                { ok: total >= POINTS.passScore, text: `At least ${POINTS.passScore} points (you have ${total})` },
                { ok: cValid, text: "Valid PostgreSQL for the main coding challenge (Section C ran without an error)" },
                { ok: criticalOk, text: "No critical misconceptions about window functions, frames, or execution order" },
              ].map((c) => (
                <li key={c.text} className="lesson-supporting flex items-start gap-2 text-foreground/90">
                  {c.ok ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-rose-400" />
                  )}
                  {c.text}
                </li>
              ))}
            </ul>
            <ul className="space-y-1 pl-6">
              {critical.map((c) => (
                <li key={c.id} className={`lesson-supporting ${c.ok ? "text-foreground/80" : "text-amber"}`}>
                  {c.ok ? "Shown: " : "Review: "}
                  {c.text}
                </li>
              ))}
            </ul>
          </div>

          {passed ? (
            <p className="lesson-supporting font-semibold text-mint">You passed. This lesson is now marked complete.</p>
          ) : (
            <p className="lesson-supporting text-foreground/90">Go back to any section to review, or start again.</p>
          )}
          <button type="button" className={BTN} onClick={reset}>
            <RotateCcw className="size-3.5" /> Retake the assessment
          </button>
        </Card>
      ) : null}
    </div>
  );
}
