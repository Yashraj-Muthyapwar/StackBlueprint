import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { MultiStage, totalSteps, locate } from "@/components/lesson/MultiStage";
import { STAGES_REGISTRY, type AnyVariant } from "@/components/sql/animation-registry";

export type AnimationVariant = AnyVariant;

export function LessonAnimation({
  variant,
  caption,
}: {
  variant: AnimationVariant;
  caption?: string;
}) {
  // Keep SSR/client hydration from changing the surrounding lesson layout for
  // animations that declare a lesson-specific canvas reserve.
  const fallbackHeight = Math.max(
    360,
    ...STAGES_REGISTRY[variant].map((stage) => stage.canvasMinHeight ?? 0),
  );

  return (
    <figure className="relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-mint/5 via-transparent to-transparent opacity-60 pointer-events-none" />
      {caption ? (
        <figcaption className="relative z-10 border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground bg-surface/50 backdrop-blur">
          {caption}
        </figcaption>
      ) : null}
      <div className="relative z-10">
        <ClientOnly
          fallback={
            <div className="flex flex-col">
              <div style={{ height: fallbackHeight }} className="animate-pulse bg-surface-2/40" />
              <div className="h-[47px] border-t border-hairline bg-surface-2/40" />
            </div>
          }
        >
          <AnimationStage variant={variant} />
        </ClientOnly>
      </div>
    </figure>
  );
}

function AnimationStage({ variant }: { variant: AnimationVariant }) {
  const stages = STAGES_REGISTRY[variant];
  const total = useMemo(() => totalSteps(stages), [stages]);
  const configuredMinHeight = useMemo(
    () => Math.max(0, ...stages.map((stage) => stage.canvasMinHeight ?? 0)),
    [stages],
  );
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stageMeasurements = useRef(new Map<number, HTMLDivElement>());
  const [canvasHeight, setCanvasHeight] = useState<number>();

  const measureCanvas = useCallback(() => {
    const measurements = Array.from(stageMeasurements.current.values());
    const tallestStage = Math.ceil(
      Math.max(0, ...measurements.map((element) => element.getBoundingClientRect().height)),
    );
    if (tallestStage > 0) {
      // A step change briefly reattaches the off-screen measurement refs. Keep
      // the tallest height already found at the same width so that short-lived
      // measurements cannot pull the canvas up and move the lesson below it.
      // Responsive layouts can grow naturally beyond this reserve; never
      // reducing it during playback is what keeps nearby lesson content still.
      setCanvasHeight((current) => {
        const next = Math.max(current ?? 0, tallestStage);
        return current === next ? current : next;
      });
    }
  }, []);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(measureCanvas);
    stageMeasurements.current.forEach((element) => observer.observe(element));
    measureCanvas();
    return () => observer.disconnect();
  }, [measureCanvas, total, variant]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % total), 2200);
    return () => window.clearTimeout(id);
  }, [playing, step, total]);

  useEffect(() => {
    const handleQuizStart = () => setPlaying(false);
    window.addEventListener("quiz-started", handleQuizStart);
    return () => window.removeEventListener("quiz-started", handleQuizStart);
  }, []);

  const go = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStep((s) => (s + delta + total) % total);
    },
    [total],
  );

  const { stageIdx } = locate(stages, step);
  const reservedHeight = Math.max(configuredMinHeight, canvasHeight ?? 0);

  return (
    <div className="flex flex-col">
      <div
        className="relative overflow-hidden"
        style={reservedHeight > 0 ? { height: reservedHeight } : undefined}
      >
        <div className="px-5 py-6 lg:px-7 lg:py-8">
          <MultiStage stages={stages} step={step} />
        </div>

        {/*
          Each step is measured off-screen for this particular animation. The
          visible canvas then reserves only its tallest step. Fixing that
          height prevents transition elements from briefly expanding the
          surrounding lesson while the next stage enters.
        */}
        <div aria-hidden="true" className="pointer-events-none invisible absolute inset-x-0 top-0">
          {Array.from({ length: total }, (_, measuredStep) => (
            <div
              key={measuredStep}
              ref={(element) => {
                if (element) stageMeasurements.current.set(measuredStep, element);
                else stageMeasurements.current.delete(measuredStep);
              }}
              className="px-5 py-6 lg:px-7 lg:py-8"
            >
              <MultiStage stages={stages} step={measuredStep} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Restart"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Previous step"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Next step"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => {
            const { stageIdx: si } = locate(stages, i);
            const isActive = i === step;
            const isStageStart = i === 0 || locate(stages, i - 1).stageIdx !== si;

            return (
              <motion.span
                key={i}
                animate={{
                  backgroundColor: isActive
                    ? "var(--mint, #40e0b4)"
                    : si < stageIdx
                      ? "var(--mint, #40e0b4)"
                      : "var(--hairline, #2a2a35)",
                  width: isActive ? 24 : isStageStart ? 8 : 6,
                }}
                transition={{ duration: 0.2 }}
                className="h-1 rounded-full"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
