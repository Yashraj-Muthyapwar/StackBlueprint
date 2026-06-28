import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { MultiStage, totalSteps, locate } from "@/components/sql/MultiStage";
import { STAGES_REGISTRY, type AnyVariant } from "@/components/sql/animation-stages";

export type AnimationVariant = AnyVariant;

export function LessonAnimation({
  variant,
  caption,
}: {
  variant: AnimationVariant;
  caption?: string;
}) {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-mint/5 via-transparent to-transparent opacity-60 pointer-events-none" />
      {caption ? (
        <figcaption className="relative z-10 border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground bg-surface/50 backdrop-blur">
          {caption}
        </figcaption>
      ) : null}
      <div className="relative z-10">
        <ClientOnly fallback={<div className="h-[360px] animate-pulse bg-surface-2/40" />}>
          <AnimationStage variant={variant} />
        </ClientOnly>
      </div>
    </figure>
  );
}

function AnimationStage({ variant }: { variant: AnimationVariant }) {
  const stages = STAGES_REGISTRY[variant];
  const total = useMemo(() => totalSteps(stages), [stages]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

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

  return (
    <div className="flex flex-col">
      <div className="relative px-5 py-6 lg:px-7 lg:py-8">
        <MultiStage stages={stages} step={step} />
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setPlaying(false); setStep(0); }}
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
