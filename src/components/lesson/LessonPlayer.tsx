import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ArrayCanvas } from "./ArrayCanvas";
import { CodePane } from "./CodePane";
import { ElevationMapCanvas } from "./ElevationMapCanvas";
import { LinkedListCanvas } from "./LinkedListCanvas";
import { MatrixCanvas } from "./MatrixCanvas";
import { NarrationCard } from "./NarrationCard";
import { TransportBar } from "./TransportBar";
import { LessonControls } from "./LessonControls";
import { SecondaryStrip } from "./SecondaryStrip";
import type { LessonBuilder, LinkedListStep, Step } from "@/lessons/types";

export function LessonPlayer({ builder }: { builder: LessonBuilder }) {
  const [inputs, setInputs] = useState<Record<string, unknown>>(
    () => builder.defaultInputs as Record<string, unknown>,
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = useMemo(() => {
    try {
      return builder.build(inputs);
    } catch (e) {
      console.error(e);
      return [{ line: 1, narration: `Build failed: ${(e as Error).message}` } as Step];
    }
  }, [builder, inputs]);

  const shape = useMemo(
    () => (builder.shape ? builder.shape(inputs) : undefined),
    [builder, inputs],
  );

  const total = steps.length;
  const safeIdx = Math.min(stepIndex, total - 1);
  const step = steps[safeIdx];

  const go = useCallback(
    (n: number) => setStepIndex((cur) => Math.max(0, Math.min(total - 1, cur + n))),
    [total],
  );
  const reset = useCallback(() => {
    setStepIndex(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (safeIdx >= total - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setStepIndex((i) => Math.min(total - 1, i + 1));
    }, 900 / speed);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, safeIdx, speed, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
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
  }, [go, reset]);

  const handleRun = useCallback(
    (next: Record<string, unknown>, warnings: string[], autoPlay: boolean = true) => {
      setInputs(next);
      setStepIndex(0);
      setPlaying(autoPlay);
    },
    [],
  );

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
              <div className="px-4 py-3 text-[14px] leading-relaxed text-foreground/90">
                <p className="whitespace-pre-wrap">{problemText}</p>
              </div>
            </div>
          );
        })()}

      <LessonControls
        builder={builder}
        onRun={handleRun}
        playing={playing}
        onPlayToggle={() => setPlaying((p) => !p)}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative grid-bg min-h-[380px] overflow-hidden rounded-2xl border border-hairline bg-surface">
          <div className="absolute left-4 top-3 z-10 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              visualization
            </span>
          </div>
          <div className="absolute inset-0">
            {(() => {
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
            })()}
          </div>
        </div>
        <div className="min-h-[380px]">
          <CodePane
            code={builder.codeFor ? builder.codeFor(inputs) : builder.code}
            activeLine={step.line}
          />
        </div>
      </div>

      {step.secondary && <SecondaryStrip data={step.secondary} />}

      <TransportBar
        step={safeIdx}
        total={total}
        playing={playing}
        speed={speed}
        onPrev={() => {
          setPlaying(false);
          go(-1);
        }}
        onNext={() => {
          setPlaying(false);
          go(1);
        }}
        onPlayToggle={() => setPlaying((p) => !p)}
        onReset={reset}
        onSpeed={setSpeed}
      />

      <NarrationCard stepIndex={safeIdx} text={step.narration} />
    </div>
  );
}
