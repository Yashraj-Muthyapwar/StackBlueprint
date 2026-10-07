import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { SectionRenderer } from "@/components/python/SectionRenderer";

import { ArrayCanvas } from "./ArrayCanvas";
import { BitsStrip } from "./BitsStrip";
import { CodePane } from "./CodePane";
import { ElevationMapCanvas } from "./ElevationMapCanvas";
import { LinkedListCanvas } from "./LinkedListCanvas";
import { MatrixCanvas } from "./MatrixCanvas";
import { NarrationCard } from "./NarrationCard";
import { ComplexityCanvas } from "@/components/dsa/two-pointers/ComplexityCanvas";
import { PredictCard } from "./PredictCard";
import { TransportBar } from "./TransportBar";
import { LessonControls } from "./LessonControls";
import { SecondaryStrip } from "./SecondaryStrip";
import type { LessonBuilder, LinkedListStep, Step } from "@/lessons/types";

/** Autoplay delay: a base beat plus extra time for steps with more to read. */
function stepDelay(step: Step | undefined, speed: number) {
  const chars = (step?.narration?.length ?? 0) + (step?.proof?.length ?? 0);
  const ms = Math.min(700 + chars * 10, 3500);
  return ms / speed;
}

export function LessonPlayer({ builder }: { builder: LessonBuilder }) {
  const [inputs, setInputs] = useState<Record<string, unknown>>(
    () => builder.defaultInputs as Record<string, unknown>,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [predictMode, setPredictMode] = useState(false);
  const [showComplexity, setShowComplexity] = useState(false);
  // step index -> id of the option the learner chose
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allSteps = useMemo(() => {
    try {
      return builder.build(inputs);
    } catch (e) {
      console.error(e);
      return [{ line: 1, narration: `Build failed: ${(e as Error).message}` } as Step];
    }
  }, [builder, inputs]);

  const walkthroughSteps = useMemo(() => allSteps.filter((step) => !step.complexity), [allSteps]);
  const steps = showComplexity ? allSteps : walkthroughSteps;
  const hasComplexity = allSteps.some((step) => step.complexity);

  const shape = useMemo(
    () => (builder.shape ? builder.shape(inputs) : undefined),
    [builder, inputs],
  );

  // Lessons that show two strips get a shorter visualization panel and compact strips.
  const hasPair = useMemo(
    () =>
      steps.some((s) => s.secondary && s.secondary2) &&
      !steps.some((s) => s.secondary?.pointers?.length || s.secondary2?.pointers?.length),
    [steps],
  );
  // Long arrays (e.g. a binary-search answer space) get the whole row, with the code below,
  // instead of being squeezed into half the width where every cell turns tiny.
  const wideViz = useMemo(() => {
    const viewType = typeof builder.view === "function" ? builder.view(inputs) : builder.view;
    return (
      viewType === "array" && steps.reduce((m, s) => Math.max(m, s.array?.length ?? 0), 0) > 20
    );
  }, [builder, inputs, steps]);

  const intro =
    typeof builder.walkthroughIntro === "function"
      ? builder.walkthroughIntro(inputs)
      : builder.walkthroughIntro;
  const review =
    typeof builder.walkthroughReview === "function"
      ? builder.walkthroughReview(inputs)
      : builder.walkthroughReview;

  const total = steps.length;
  const safeIdx = Math.min(stepIndex, total - 1);
  const step = steps[safeIdx];
  const panelMin = step.complexity
    ? step.complexity.blocks.length > 5
      ? "min-h-[560px]"
      : "min-h-[480px]"
    : wideViz
      ? "min-h-[260px]"
      : hasPair
        ? "min-h-[320px]"
        : "min-h-[380px]";

  // Predict mode: an unanswered prediction on the current step locks forward motion.
  const hasPredict = useMemo(() => steps.some((s) => s.predict), [steps]);
  const prediction = predictMode ? step.predict : undefined;
  const chosen = answers[safeIdx];
  const locked = !!prediction && chosen === undefined;
  const lockedRef = useRef(false);
  lockedRef.current = locked;

  const score = useMemo(() => {
    let correct = 0;
    let answered = 0;
    let totalQs = 0;
    steps.forEach((s, i) => {
      if (!s.predict) return;
      totalQs += 1;
      const a = answers[i];
      if (a === undefined) return;
      answered += 1;
      if (a === s.predict.answer) correct += 1;
    });
    return { correct, answered, total: totalQs };
  }, [steps, answers]);

  const choose = useCallback(
    (id: string) => {
      setAnswers((a) => (a[safeIdx] !== undefined ? a : { ...a, [safeIdx]: id }));
    },
    [safeIdx],
  );

  const go = useCallback(
    (n: number) => {
      if (n > 0 && lockedRef.current) return;
      setStepIndex((cur) => Math.max(0, Math.min(total - 1, cur + n)));
    },
    [total],
  );

  const reset = useCallback(() => {
    setStepIndex(0);
    setPlaying(false);
    setAnswers({});
    setShowComplexity(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (lockedRef.current) return;
    setPlaying((p) => !p);
  }, []);

  const togglePredict = () => {
    if (!predictMode) {
      // Turning on restarts the lesson so every prediction is asked fresh.
      setAnswers({});
      setStepIndex(0);
      setPlaying(false);
      setShowComplexity(false);
    }
    setPredictMode(!predictMode);
  };

  useEffect(() => {
    if (!playing) return;
    if (locked) {
      // Autoplay pauses at an open prediction.
      setPlaying(false);
      return;
    }
    if (safeIdx >= total - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(
      () => {
        setStepIndex((i) => Math.min(total - 1, i + 1));
      },
      stepDelay(steps[safeIdx], speed),
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, locked, safeIdx, speed, total, steps]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // While a prediction is open: number keys answer, Space does nothing.
      if (locked && prediction) {
        const idx = Number(e.key) - 1;
        if (Number.isInteger(idx) && idx >= 0 && idx < prediction.options.length) {
          e.preventDefault();
          choose(prediction.options[idx].id);
          return;
        }
        if (e.code === "Space") {
          e.preventDefault();
          return;
        }
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.code === "KeyR") {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, reset, togglePlay, locked, prediction, choose]);

  const handleRun = useCallback(
    (next: Record<string, unknown>, warnings: string[], autoPlay: boolean = true) => {
      setInputs(next);
      setShowComplexity(false);
      setStepIndex(0);
      setAnswers({});
      setPlaying(autoPlay);
    },
    [],
  );

  // While a prediction is open, the code pane highlights a neutral line so the
  // active branch doesn't give the answer away.
  const codeLine = locked && prediction?.line ? prediction.line : step.line;
  const codeLineEnd = locked && prediction?.line ? undefined : step.lineEnd;

  return (
    <div className="flex flex-col gap-4 mt-6">
      {builder.problem &&
        (() => {
          const problemText =
            typeof builder.problem === "function" ? builder.problem(inputs) : builder.problem;
          if (!problemText) return null;
          return (
            <div className="rounded-2xl border border-hairline bg-surface">
              <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
                <div className="size-1.5 rounded-full bg-violet shadow-[0_0_10px_var(--violet)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  problem
                </span>
              </div>
              <div className="lesson-supporting px-4 py-3 text-foreground/90">
                <p className="whitespace-pre-wrap">
                  {problemText.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={index} className="font-semibold text-mint">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      part
                    ),
                  )}
                </p>
              </div>
            </div>
          );
        })()}

      {intro?.length ? (
        <div className="space-y-6">
          {intro.map((section, index) => (
            <SectionRenderer key={index} section={section} index={index} />
          ))}
        </div>
      ) : null}

      <LessonControls
        builder={builder}
        onRun={handleRun}
        playing={playing}
        onPlayToggle={togglePlay}
      />

      <div
        className={`grid grid-cols-1 gap-4 ${step.complexity ? "lg:grid-cols-[0.85fr_1.15fr]" : wideViz ? "" : "lg:grid-cols-[minmax(0,1fr)_fit-content(68%)]"}`}
      >
        <div
          className={`relative grid-bg ${panelMin} overflow-hidden rounded-2xl border border-hairline bg-surface`}
        >
          <div className="absolute left-4 top-3 z-10 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              visualization
            </span>
          </div>
          <div className="absolute inset-0">
            {step.complexity ? (
              <ComplexityCanvas key={step.complexity.title} data={step.complexity} />
            ) : (
              (() => {
                const viewType =
                  typeof builder.view === "function" ? builder.view(inputs) : builder.view;
                return (
                  <>
                    {viewType === "array" && <ArrayCanvas step={step} />}
                    {viewType === "elevation-map" && <ElevationMapCanvas step={step} />}
                    {viewType === "matrix" && <MatrixCanvas step={step} />}
                    {viewType === "linked-list" && shape && (
                      <LinkedListCanvas step={step as LinkedListStep} shape={shape} />
                    )}
                  </>
                );
              })()
            )}
          </div>
        </div>
        <div className={`min-w-0 ${panelMin}`}>
          <CodePane
            code={builder.codeFor ? builder.codeFor(inputs) : builder.code}
            activeLine={codeLine}
            activeEnd={codeLineEnd}
            costAnnotations={step.complexity?.blocks}
          />
        </div>
      </div>

      {step.bits && <BitsStrip data={step.bits} />}
      {/* Two strips share one compact row so the controls and narration stay close to the animation. */}
      {(step.secondary || step.secondary2) && (
        <div className={hasPair ? "grid grid-cols-1 gap-3 md:grid-cols-2" : ""}>
          {step.secondary && <SecondaryStrip data={step.secondary} compact={hasPair} />}
          {step.secondary2 && <SecondaryStrip data={step.secondary2} compact={hasPair} />}
        </div>
      )}

      <TransportBar
        step={safeIdx}
        total={total}
        playing={playing}
        speed={speed}
        locked={locked}
        predict={
          hasPredict
            ? {
                enabled: predictMode,
                onToggle: togglePredict,
                correct: score.correct,
                answered: score.answered,
                total: score.total,
              }
            : undefined
        }
        onPrev={() => {
          setPlaying(false);
          go(-1);
        }}
        onNext={() => {
          setPlaying(false);
          go(1);
        }}
        onPlayToggle={togglePlay}
        onReset={reset}
        onSpeed={setSpeed}
      />

      {prediction && <PredictCard prediction={prediction} chosen={chosen} onChoose={choose} />}
      {!locked && <NarrationCard stepIndex={safeIdx} text={step.narration} proof={step.proof} />}
      {hasComplexity && (step.complexity || safeIdx === walkthroughSteps.length - 1) ? (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setPlaying(false);
              setShowComplexity(!showComplexity);
              setStepIndex(showComplexity ? walkthroughSteps.length - 1 : walkthroughSteps.length);
            }}
          >
            {showComplexity ? "Back to result" : "Explain complexity"}
          </Button>
        </div>
      ) : null}
      {review?.length ? (
        <div className="mt-6 space-y-6">
          {review.map((section, index) => (
            <SectionRenderer key={index} section={section} index={index} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
