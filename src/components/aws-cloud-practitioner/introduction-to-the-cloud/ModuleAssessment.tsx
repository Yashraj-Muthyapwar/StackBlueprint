import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Play, RotateCcw, XCircle } from "lucide-react";
import { QUIZ_STARTED_EVENT, emitQuizResults, type QuizReviewItem } from "@/lib/rivet/quiz";
import {
  B1_EXPLAIN,
  B1_ROWS,
  B2_EXPLAIN,
  B2_ROWS,
  C_ROWS,
  C_SCENARIO,
  POINTS,
  SECTION_A,
  SECTION_D,
  type ChoiceQuestion,
  type MatchRow,
} from "@/lessons/aws-cloud-practitioner/module-1-assessment";
import { BTN, BTN_PRIMARY, Card, ChoiceBlock, INPUT, Stepper, TH, pointsOf } from "@/components/sql/assessment/shared";

// Same assessment shell as the SQL module assessments: start screen, sectioned tabs,
// automatic scoring, a pass rule with critical misconceptions, and a results screen.

type SectionId = "A" | "B" | "C" | "D" | "R";
const SECTION_MAX = { A: 20, B: 20, C: 40, D: 20 } as const;

type Values = Record<string, string>;

function MatchTable({
  rows,
  values,
  onChange,
  checked,
  columnLabel,
  points,
}: {
  rows: MatchRow[];
  values: Values;
  onChange: (id: string, value: string) => void;
  checked: boolean;
  columnLabel: string;
  points: number;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="lesson-supporting w-full">
        <thead className="bg-surface-2 text-left text-muted-foreground">
          <tr>
            {["Item", columnLabel, "Check"].map((h) => (
              <th key={h} className={TH}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const ok = checked && values[row.id] === row.correct;
            return (
              <tr key={row.id} className="border-b border-hairline/60 align-top last:border-b-0">
                <td className="px-3 py-2 text-foreground/90">{row.prompt}</td>
                <td className="px-3 py-2">
                  <select
                    aria-label={row.prompt}
                    className={`${INPUT} min-w-[11rem] font-sans`}
                    value={values[row.id] ?? ""}
                    disabled={checked}
                    onChange={(e) => onChange(row.id, e.target.value)}
                  >
                    <option value="">Choose...</option>
                    {row.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 font-mono text-[12.5px]">
                  {checked ? (
                    ok ? (
                      <span className="text-mint">Correct (+{points})</span>
                    ) : (
                      <span className="text-amber">Expected {row.correct}</span>
                    )
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ModuleAssessment() {
  const [started, setStarted] = useState(false);
  const [section, setSection] = useState<SectionId>("A");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [b1, setB1] = useState<Values>({});
  const [b1Checked, setB1Checked] = useState(false);
  const [b2, setB2] = useState<Values>({});
  const [b2Checked, setB2Checked] = useState(false);
  const [c, setC] = useState<Values>({});
  const [cChecked, setCChecked] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const passedSent = useRef(false);

  const setAnswer = (id: string, index: number) => setAnswers((a) => ({ ...a, [id]: index }));
  const allQuestions: ChoiceQuestion[] = [...SECTION_A, B1_EXPLAIN, B2_EXPLAIN, ...SECTION_D];
  const isCorrect = (id: string) => answers[id] === allQuestions.find((x) => x.id === id)!.correctIndex;
  const earnedFor = (qs: ChoiceQuestion[]) => qs.reduce((sum, q) => sum + (isCorrect(q.id) ? pointsOf(q) : 0), 0);
  const matchOk = (rows: MatchRow[], vals: Values, checked: boolean, id: string) =>
    checked && vals[id] === rows.find((r) => r.id === id)!.correct;
  const matchPoints = (rows: MatchRow[], vals: Values, checked: boolean, each: number) =>
    rows.reduce((sum, r) => sum + (matchOk(rows, vals, checked, r.id) ? each : 0), 0);

  // ---- scoring
  const aPoints = earnedFor(SECTION_A);
  const dPoints = earnedFor(SECTION_D);
  const b1Points = matchPoints(B1_ROWS, b1, b1Checked, POINTS.matchValue);
  const b2Points = matchPoints(B2_ROWS, b2, b2Checked, POINTS.matchValue);
  const bPoints = b1Points + b2Points + earnedFor([B1_EXPLAIN, B2_EXPLAIN]);
  const cPoints = matchPoints(C_ROWS, c, cChecked, POINTS.designValue);
  const total = aPoints + bPoints + cPoints + dPoints;

  const critical = [
    { id: "servers", text: "The cloud still runs on servers, and it is not always cheaper (A1 and A4)", ok: isCorrect("a1") && isCorrect("a4") },
    { id: "models", text: "Service models and deployment models are different (B2 explanation and the hybrid decision in C)", ok: isCorrect("b2x") && matchOk(C_ROWS, c, cChecked, "hybrid") },
    { id: "tools", text: "Match the service to the job: EC2 runs applications, S3 stores files (C)", ok: matchOk(C_ROWS, c, cChecked, "ec2") && matchOk(C_ROWS, c, cChecked, "s3") },
    { id: "isolation", text: "Public cloud customers are isolated from one another (A5)", ok: isCorrect("a5") },
  ];
  const criticalOk = critical.every((x) => x.ok);
  const passed = total >= POINTS.passScore && cChecked && criticalOk;

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
        question: "B1: Classify each example as IaaS, PaaS, or SaaS",
        userAnswer: B1_ROWS.map((r) => b1[r.id] || "-").join(", "),
        correctAnswer: B1_ROWS.map((r) => r.correct).join(", "),
        correct: b1Points === B1_ROWS.length * POINTS.matchValue,
      },
      {
        question: "B2: Classify each example as public, private, or hybrid cloud",
        userAnswer: B2_ROWS.map((r) => b2[r.id] || "-").join(", "),
        correctAnswer: B2_ROWS.map((r) => r.correct).join(", "),
        correct: b2Points === B2_ROWS.length * POINTS.matchValue,
      },
      {
        question: "C: Plan the architecture for a furniture start-up",
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

  const start = () => {
    setStarted(true);
    window.dispatchEvent(new CustomEvent(QUIZ_STARTED_EVENT));
  };

  const reset = () => {
    setSection("A");
    setAnswers({});
    setB1({});
    setB1Checked(false);
    setB2({});
    setB2Checked(false);
    setC({});
    setCChecked(false);
    passedSent.current = false;
    setAttempt((n) => n + 1);
    window.dispatchEvent(new CustomEvent(QUIZ_STARTED_EVENT));
  };

  const sectionScore = { A: aPoints, B: bPoints, C: cPoints, D: dPoints };
  const tabs: { id: SectionId; label: string }[] = [
    { id: "A", label: "A: Mini-quiz" },
    { id: "B", label: "B: Classify" },
    { id: "C", label: "C: Architecture" },
    { id: "D", label: "D: Interview" },
    { id: "R", label: "Results" },
  ];

  if (!started) {
    return (
      <section className="space-y-6 rounded-2xl border border-hairline bg-surface/40 p-6 md:p-8">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">Final assessment</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Introduction to the Cloud</h2>
          <p className="lesson-prose mt-1 text-muted-foreground">
            Cloud computing, the six AWS advantages, service and deployment models, and the core AWS services.
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
                ["B: Classify service and deployment models", SECTION_MAX.B],
                ["C: Practical architecture challenge", SECTION_MAX.C],
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
            You must earn at least {POINTS.passScore} points, check your design in the practical challenge, and show no
            critical misconceptions about what the cloud is, the service and deployment models, or the core AWS services.
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
          <Stepper questions={SECTION_A} answers={answers} onAnswer={setAnswer} onDone={() => setSection("B")} doneLabel="Continue to Section B" />
        </Card>
      ) : null}

      {section === "B" ? (
        <div className="space-y-5">
          <Card title="Question B1: Service models" subtitle="Classify three examples (6 points), then pick the explanation (4 points)">
            <p className="lesson-prose text-foreground">Is each example IaaS, PaaS, or SaaS?</p>
            <MatchTable rows={B1_ROWS} values={b1} onChange={(id, v) => setB1((x) => ({ ...x, [id]: v }))} checked={b1Checked} columnLabel="Your answer" points={POINTS.matchValue} />
            {!b1Checked ? (
              <button type="button" className={BTN_PRIMARY} onClick={() => setB1Checked(true)}>
                Check my answers
              </button>
            ) : (
              <p className="font-mono text-[12px] text-mint">Classification: {b1Points} / 6 points</p>
            )}
            <ChoiceBlock question={B1_EXPLAIN} answer={answers[B1_EXPLAIN.id]} onAnswer={(i) => setAnswer(B1_EXPLAIN.id, i)} />
          </Card>

          <Card title="Question B2: Deployment models" subtitle="Classify three examples (6 points), then pick the explanation (4 points)">
            <p className="lesson-prose text-foreground">Is each example public, private, or hybrid cloud?</p>
            <MatchTable rows={B2_ROWS} values={b2} onChange={(id, v) => setB2((x) => ({ ...x, [id]: v }))} checked={b2Checked} columnLabel="Your answer" points={POINTS.matchValue} />
            {!b2Checked ? (
              <button type="button" className={BTN_PRIMARY} onClick={() => setB2Checked(true)}>
                Check my answers
              </button>
            ) : (
              <p className="font-mono text-[12px] text-mint">Classification: {b2Points} / 6 points</p>
            )}
            <ChoiceBlock question={B2_EXPLAIN} answer={answers[B2_EXPLAIN.id]} onAnswer={(i) => setAnswer(B2_EXPLAIN.id, i)} />
          </Card>

          <button type="button" className={BTN_PRIMARY} onClick={() => setSection("C")}>
            Continue to Section C
          </button>
        </div>
      ) : null}

      {section === "C" ? (
        <Card title="Section C: Practical architecture challenge" subtitle="40 points, 8 decisions, 5 points each">
          <p className="lesson-prose text-foreground">{C_SCENARIO}</p>
          <MatchTable rows={C_ROWS} values={c} onChange={(id, v) => setC((x) => ({ ...x, [id]: v }))} checked={cChecked} columnLabel="Your decision" points={POINTS.designValue} />
          <div className="flex flex-wrap items-center gap-3">
            {!cChecked ? (
              <button type="button" className={BTN_PRIMARY} onClick={() => setCChecked(true)}>
                Check my design
              </button>
            ) : (
              <p className="font-mono text-[12px] text-mint">Design score: {cPoints} / {SECTION_MAX.C} points</p>
            )}
          </div>
          <button type="button" className={BTN_PRIMARY} onClick={() => setSection("D")}>
            Continue to Section D
          </button>
        </Card>
      ) : null}

      {section === "D" ? (
        <Card title="Section D: Interview questions" subtitle="4 questions, 5 points each, 20 points total">
          <Stepper questions={SECTION_D} answers={answers} onAnswer={setAnswer} onDone={() => setSection("R")} doneLabel="Finish and see my result" />
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
                      {{ A: "A: Mini-quiz", B: "B: Classify service and deployment models", C: "C: Practical architecture challenge", D: "D: Interview questions" }[id]}
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
                { ok: cChecked, text: "A checked design in the practical challenge (Section C)" },
                { ok: criticalOk, text: "No critical misconceptions about the cloud, service and deployment models, or core AWS services" },
              ].map((x) => (
                <li key={x.text} className="lesson-supporting flex items-start gap-2 text-foreground/90">
                  {x.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-rose-400" />}
                  {x.text}
                </li>
              ))}
            </ul>
            <ul className="space-y-1 pl-6">
              {critical.map((x) => (
                <li key={x.id} className={`lesson-supporting ${x.ok ? "text-foreground/80" : "text-amber"}`}>
                  {x.ok ? "Shown: " : "Review: "}
                  {x.text}
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
