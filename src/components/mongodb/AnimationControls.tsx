import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/** Playback controls used only by MongoDB lesson animations. */
export function AnimationControls({
  step,
  total,
  playing,
  onReset,
  onPrev,
  onNext,
  onPlayToggle,
  stageForStep = () => 0,
}: {
  step: number;
  total: number;
  playing: boolean;
  onReset: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPlayToggle: () => void;
  stageForStep?: (step: number) => number;
}) {
  const reducedMotion = useReducedMotion();
  const buttonClass =
    "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground";

  return (
    <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
      <div className="flex items-center gap-1">
        <button type="button" onClick={onReset} className={buttonClass} aria-label="Restart">
          <RotateCcw className="size-3.5" />
        </button>
        <button type="button" onClick={onPrev} className={buttonClass} aria-label="Previous step">
          <ChevronLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onPlayToggle}
          className={buttonClass}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
        <button type="button" onClick={onNext} className={buttonClass} aria-label="Next step">
          <ChevronRight className="size-3.5" />
        </button>
      </div>
      <div
        className="flex items-center gap-1.5"
        role="img"
        aria-label={`Step ${step + 1} of ${total}`}
      >
        {Array.from({ length: total }, (_, index) => (
          <motion.span
            key={index}
            animate={{
              backgroundColor:
                index === step || stageForStep(index) < stageForStep(step)
                  ? "var(--mint, #40e0b4)"
                  : "var(--hairline, #2a2a35)",
              width:
                index === step || index === 0 || stageForStep(index - 1) !== stageForStep(index)
                  ? index === step
                    ? 24
                    : 8
                  : 6,
            }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="h-1 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
