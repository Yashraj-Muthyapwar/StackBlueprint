import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Play, RotateCcw, XCircle } from "lucide-react";
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
import {
  BTN,
  BTN_PRIMARY,
  Card,
  ChoiceBlock,
  CodeBlock,
  INPUT,
  SqlChallenge,
  Stepper,
  TH,
  inline,
  pointsOf,
  type RuleResult,
} from "./shared";

type SectionId = "A" | "B" | "C" | "D" | "R";

const SECTION_MAX = { A: 20, B: 20, C: 40, D: 20 } as const;

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
          <SqlChallenge
            challengeId={C_CHALLENGE_ID}
            rules={C_RULES}
            label="Section C"
            maxPoints={SECTION_MAX.C}
            active={section === "C"}
            onScored={onScored}
          />
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
