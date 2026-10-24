import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { ClientOnly } from "@/components/lesson/ClientOnly";

export type VisualStep = { label: string; note: string };

const BTN =
  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground";

function Player({
  steps,
  renderStep,
}: {
  steps: readonly VisualStep[];
  renderStep: (step: number) => ReactNode;
}) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const count = steps.length;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % count), 3200);
    return () => window.clearTimeout(id);
  }, [playing, step, count]);

  useEffect(() => {
    const stop = () => setPlaying(false);
    window.addEventListener("quiz-started", stop);
    return () => window.removeEventListener("quiz-started", stop);
  }, []);

  const go = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStep((s) => (s + delta + count) % count);
    },
    [count],
  );

  return (
    <div className="flex flex-col">
      <div className="px-5 py-6 lg:px-7 lg:py-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-mint/40 bg-mint/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mint">
            {steps[step].label}
          </span>
        </div>
        {renderStep(step)}
        <p className="lesson-supporting mt-4 min-h-[3.5rem] text-foreground/85">{steps[step].note}</p>
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button type="button" className={BTN} aria-label="Restart" onClick={() => { setPlaying(false); setStep(0); }}>
            <RotateCcw className="size-3.5" />
          </button>
          <button type="button" className={BTN} aria-label="Previous step" onClick={() => go(-1)}>
            <ChevronLeft className="size-3.5" />
          </button>
          <button type="button" className={BTN} aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button type="button" className={BTN} aria-label="Next step" onClick={() => go(1)}>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${i === step ? "w-6 bg-mint" : i < step ? "w-2 bg-mint" : "w-2 bg-hairline"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Shared frame for the small intuition animations in SQL lessons: caption bar,
 * step chip, a body drawn by `renderStep`, the step note, and the same
 * play / back / next / restart control bar as the SQL animations.
 */
export function VisualPlayer({
  caption,
  steps,
  renderStep,
  placeholderHeight = 430,
}: {
  caption?: string;
  steps: readonly VisualStep[];
  renderStep: (step: number) => ReactNode;
  placeholderHeight?: number;
}) {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
      {caption ? (
        <figcaption className="relative z-10 border-b border-hairline bg-surface/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          {caption}
        </figcaption>
      ) : null}
      <ClientOnly fallback={<div style={{ height: placeholderHeight }} className="animate-pulse bg-surface-2/40" />}>
        <Player steps={steps} renderStep={renderStep} />
      </ClientOnly>
    </figure>
  );
}
