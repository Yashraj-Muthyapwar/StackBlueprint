import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Play, RotateCcw, XCircle } from "lucide-react";
import { QUIZ_STARTED_EVENT, emitQuizResults, type QuizReviewItem } from "@/lib/rivet/quiz";
import {
  B_CODE,
  C_CHALLENGE_ID,
  C_REQUIREMENTS,
  C_RULES,
  D_CHALLENGE_ID,
  D_REQUIREMENTS,
  D_RULES,
  EMPLOYEES,
  OUTPUT_COLUMNS,
  POINTS,
  SECTION_A,
  SECTION_B,
  SECTION_MAX,
  TABLE_NAME,
} from "@/lessons/sql/ranking-distribution-assessment";
import type { ChoiceQuestion } from "@/lessons/sql/window-foundations-assessment";
import {
  BTN,
  BTN_PRIMARY,
  Card,
  CodeBlock,
  SqlChallenge,
  Stepper,
  TH,
  inline,
  pointsOf,
  type RuleResult,
} from "./shared";

type SectionId = "A" | "B" | "C" | "D" | "R";

const SECTION_NAMES = {
  A: "A: Mini-quiz",
  B: "B: Rank values",
  C: "C: Top two salary levels",
  D: "D: Exactly two employees",
} as const;

function EmployeesTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="lesson-supporting w-full">
        <thead className="bg-surface-2 text-left text-muted-foreground">
          <tr>
            {["employee_id", "department", "salary", "performance_score"].map((h) => (
              <th key={h} className={TH}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {EMPLOYEES.map((e) => (
            <tr key={e.employee_id} className="border-b border-hairline/60 last:border-b-0">
              <td className="px-3 py-1.5 font-mono text-[12.5px] text-foreground">{e.employee_id}</td>
              <td className="px-3 py-1.5 font-mono text-[12.5px] text-foreground/85">{e.department}</td>
              <td className="px-3 py-1.5 font-mono text-[12.5px] text-foreground/85">{e.salary}</td>
              <td className="px-3 py-1.5 font-mono text-[12.5px] text-foreground/85">{e.performance_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableIntro() {
  return (
    <>
      <p className="lesson-prose text-muted-foreground">
        Use this <code className="rounded bg-mint/10 px-1.5 py-0.5 font-mono text-[0.85em] text-mint">{TABLE_NAME}</code>{" "}
        table. Assume employee_id is unique, every value is non-NULL, and the table has exactly these 12 rows.
      </p>
      <EmployeesTable />
    </>
  );
}

function OutputColumns() {
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="lesson-supporting w-full">
        <thead className="bg-surface-2 text-left text-muted-foreground">
          <tr>
            <th className={TH}>Required output column</th>
            <th className={TH}>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {OUTPUT_COLUMNS.map(([name, meaning]) => (
            <tr key={name} className="border-b border-hairline/60 last:border-b-0">
              <td className="px-3 py-1.5 font-mono text-[12.5px] text-mint">{name}</td>
              <td className="px-3 py-1.5 text-foreground/85">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Requirements({ items }: { items: string[] }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Requirements</p>
      <ul className="lesson-prose mt-2 list-disc space-y-1.5 pl-6 text-muted-foreground marker:text-mint">
        {items.map((r, i) => (
          <li key={i}>{inline(r)}</li>
        ))}
      </ul>
    </div>
  );
}

const sumEarned = (rules: RuleResult[]) => rules.reduce((sum, r) => sum + (r.earned ? r.points : 0), 0);

export default function RankingAssessment() {
  const [started, setStarted] = useState(false);
  const [section, setSection] = useState<SectionId>("A");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [cRules, setCRules] = useState<RuleResult[]>([]);
  const [cValid, setCValid] = useState(false);
  const [dRules, setDRules] = useState<RuleResult[]>([]);
  const [dValid, setDValid] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const passedSent = useRef(false);

  const setAnswer = (id: string, index: number) => setAnswers((a) => ({ ...a, [id]: index }));
  const allQuestions: ChoiceQuestion[] = [...SECTION_A, ...SECTION_B];
  const isCorrect = (id: string) => answers[id] === allQuestions.find((x) => x.id === id)!.correctIndex;
  const earnedFor = (qs: ChoiceQuestion[]) => qs.reduce((sum, q) => sum + (isCorrect(q.id) ? pointsOf(q) : 0), 0);

  const aPoints = earnedFor(SECTION_A);
  const bPoints = earnedFor(SECTION_B);
  const cPoints = sumEarned(cRules);
  const dPoints = sumEarned(dRules);
  const total = aPoints + bPoints + cPoints + dPoints;

  const cResult = cRules.find((r) => r.id === "result")?.earned ?? false;
  const dResult = dRules.find((r) => r.id === "result")?.earned ?? false;
  const critical = [
    {
      id: "gaps",
      text: "RANK() leaves gaps after ties and DENSE_RANK() does not (A1 and the Sales prediction in B)",
      ok: isCorrect("a1") && isCorrect("b3"),
    },
    {
      id: "peers",
      text: "A unique tie-breaker in the window ORDER BY removes the ties you want to keep (A4 and Section C)",
      ok: isCorrect("a4") && cResult,
    },
    {
      id: "filter",
      text: "A window result is filtered in an outer query, not in the same WHERE (A5 and Section D)",
      ok: isCorrect("a5") && dResult,
    },
  ];
  const criticalOk = critical.every((c) => c.ok);
  const passed = total >= POINTS.passScore && cValid && dValid && criticalOk;

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
        question: "C: Top two distinct salary levels in each department",
        userAnswer: `${cPoints} of ${SECTION_MAX.C} points`,
        correctAnswer: `${SECTION_MAX.C} of ${SECTION_MAX.C} points`,
        correct: cPoints === SECTION_MAX.C,
      },
      {
        question: "D: Exactly two employees per department",
        userAnswer: `${dPoints} of ${SECTION_MAX.D} points`,
        correctAnswer: `${SECTION_MAX.D} of ${SECTION_MAX.D} points`,
        correct: dPoints === SECTION_MAX.D,
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

  const onScoredC = useCallback((rules: RuleResult[], valid: boolean) => {
    setCRules(rules);
    setCValid(valid);
  }, []);
  const onScoredD = useCallback((rules: RuleResult[], valid: boolean) => {
    setDRules(rules);
    setDValid(valid);
  }, []);

  const start = () => {
    setStarted(true);
    // Rivet stays hidden while the assessment is in progress.
    window.dispatchEvent(new CustomEvent(QUIZ_STARTED_EVENT));
  };

  const reset = () => {
    setSection("A");
    setAnswers({});
    setCRules([]);
    setCValid(false);
    setDRules([]);
    setDValid(false);
    passedSent.current = false;
    setAttempt((n) => n + 1);
    window.dispatchEvent(new CustomEvent(QUIZ_STARTED_EVENT));
  };

  const sectionScore = { A: aPoints, B: bPoints, C: cPoints, D: dPoints };
  const tabs: { id: SectionId; label: string }[] = [
    { id: "A", label: SECTION_NAMES.A },
    { id: "B", label: SECTION_NAMES.B },
    { id: "C", label: SECTION_NAMES.C },
    { id: "D", label: SECTION_NAMES.D },
    { id: "R", label: "Results" },
  ];

  if (!started) {
    return (
      <section className="space-y-6 rounded-2xl border border-hairline bg-surface/40 p-6 md:p-8">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">Final assessment</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Ranking & Distribution</h2>
          <p className="lesson-prose mt-1 text-muted-foreground">
            ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(), PERCENT_RANK(), CUME_DIST(), and Top-N filtering.
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
                ["B: Rank values (3 questions)", SECTION_MAX.B],
                ["C: Top two distinct salary levels (SQL)", SECTION_MAX.C],
                ["D: Exactly two employees per department (SQL)", SECTION_MAX.D],
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
            You must earn at least {POINTS.passScore} points, write valid PostgreSQL for both coding sections, and
            show no critical misconceptions about ties, ranking functions, or filtering window results.
          </p>
          <p className="lesson-supporting text-muted-foreground">
            Sections A and B are multiple choice, and each answer locks once you pick it. Only Sections C and D ask you
            to write SQL, and both are scored automatically.
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
        <Card title="Section B: Rank values" subtitle="3 questions, 4 points each, 12 points total">
          <TableIntro />
          <p className="lesson-prose text-foreground">Use this query. Predict rn, rk and dr for all 12 employees:</p>
          <CodeBlock code={B_CODE} />
          <p className="lesson-supporting text-muted-foreground">
            Rows appear in the query's output order: department, then salary DESC, then employee_id. One question covers
            each department.
          </p>
          <Stepper
            questions={SECTION_B}
            answers={answers}
            onAnswer={setAnswer}
            onDone={() => setSection("C")}
            doneLabel="Continue to Section C"
          />
        </Card>
      ) : null}

      {/* Sections C and D stay mounted so the typed query survives switching tabs. */}
      <div className={section === "C" ? "" : "hidden"}>
        <Card title="Section C: Top two distinct salary levels" subtitle="15 points, SQL coding">
          <TableIntro />
          <p className="lesson-prose text-foreground">
            Write a PostgreSQL query that returns every employee in the top two{" "}
            <strong className="font-semibold">distinct salary levels</strong> within their department.
          </p>
          <OutputColumns />
          <Requirements items={C_REQUIREMENTS} />
          <SqlChallenge
            challengeId={C_CHALLENGE_ID}
            rules={C_RULES}
            label="Section C"
            maxPoints={SECTION_MAX.C}
            active={section === "C"}
            onScored={onScoredC}
          />
          <button type="button" className={BTN_PRIMARY} onClick={() => setSection("D")}>
            Continue to Section D
          </button>
        </Card>
      </div>

      <div className={section === "D" ? "" : "hidden"}>
        <Card title="Section D: Exactly two employees per department" subtitle="15 points, SQL coding">
          <TableIntro />
          <p className="lesson-prose text-foreground">
            The manager changes the requirement: return exactly two employees with the highest salaries from each
            department. If two employees have the same salary, select the employee with the smaller employee ID first.
          </p>
          <OutputColumns />
          <Requirements items={D_REQUIREMENTS} />
          <p className="lesson-supporting text-muted-foreground">
            Sections C and D test different business requirements. Write a separate, complete SQL query for each.
          </p>
          <SqlChallenge
            challengeId={D_CHALLENGE_ID}
            rules={D_RULES}
            label="Section D"
            maxPoints={SECTION_MAX.D}
            active={section === "D"}
            onScored={onScoredD}
          />
          <button type="button" className={BTN_PRIMARY} onClick={() => setSection("R")}>
            Finish and see my result
          </button>
        </Card>
      </div>

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
                    <td className="px-3 py-1.5">{SECTION_NAMES[id]}</td>
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
                { ok: cValid && dValid, text: "Valid PostgreSQL for both coding sections (Sections C and D ran without an error)" },
                { ok: criticalOk, text: "No critical misconceptions about ties, ranking functions, or filtering window results" },
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
