import { useEffect, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WALKTHROUGH_TONE, type WalkthroughStep } from "./walkthrough";

/*
 * The shared frame for every system design walkthrough animation. It matches the pattern
 * lessons: window chrome with preset pills, a fixed-height stage, a status card (step badge,
 * phase, narration, stat chips) and a transport bar (progress, autoplay, previous, next, reset,
 * counter, speed). A lesson supplies only its steps and what is drawn inside the stage.
 *
 * The stage and the status card never change size between steps, so the page does not jump
 * while the animation plays.
 */

export function LessonWalkthrough<S extends WalkthroughStep>({
  ariaLabel,
  fileName,
  label,
  groups,
  steps,
  renderStage,
  belowStage,
  stageClassName = "h-[17.5rem]",
}: {
  ariaLabel: string;
  /** Shown in the window chrome, for example `url_shortener.board`. */
  fileName: string;
  label: string;
  groups: readonly string[];
  steps: readonly S[];
  /** What is drawn inside the stage box for the current step. */
  renderStage: (step: S, index: number) => ReactNode;
  /** Optional controls between the stage and the status card (for example sliders). */
  belowStage?: ReactNode;
  stageClassName?: string;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);

  const safeIndex = Math.min(index, steps.length - 1);
  const step = steps[safeIndex];
  const last = safeIndex >= steps.length - 1;
  // Invisible copies of the longest narrations reserve the card height so it never resizes.
  const reservedNarrations = useMemo(
    () =>
      [...new Set(steps.map((s) => s.narration))].sort((a, b) => b.length - a.length).slice(0, 4),
    [steps],
  );

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setIndex((current) => {
          if (current >= steps.length - 1) {
            setPlaying(false);
            return current;
          }
          return current + 1;
        }),
      Math.round(2000 / speed),
    );
    return () => clearInterval(timer);
  }, [playing, speed, steps.length]);

  useEffect(() => {
    const pause = () => setPlaying(false);
    window.addEventListener("quiz-started", pause);
    return () => window.removeEventListener("quiz-started", pause);
  }, []);

  const goTo = (i: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(i, steps.length - 1)));
  };
  const stepBy = (d: number) => goTo(safeIndex + d);
  const togglePlay = () => {
    if (last) {
      setIndex(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    // Let sliders and inputs keep their own arrow-key behaviour.
    if (target.tagName === "INPUT" || target.tagName === "SELECT") return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepBy(-1);
    } else if (e.key === " ") {
      e.preventDefault();
      togglePlay();
    }
  };

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-mint/50 dark:bg-surface"
    >
      <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-mint/10 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 size-56 rounded-full bg-blue-500/10 blur-[70px]" />

      {/* Window chrome */}
      <div className="relative space-y-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-rose-500/80" />
            <div className="size-2.5 rounded-full bg-amber-500/80" />
            <div className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-3.5 w-px shrink-0 bg-hairline" />
          <Sparkles className="size-3.5 shrink-0 text-mint" />
          <span className="font-mono text-[13px] font-semibold text-foreground">{fileName}</span>
          <span className="hidden min-w-0 truncate text-[13px] text-muted-foreground @min-[30rem]:inline">
            {label}
          </span>
        </div>
        <div className="-mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none]">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => goTo(steps.findIndex((s) => s.group === g))}
              className={cn(
                "h-8 shrink-0 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors",
                step.group === g
                  ? "border-mint bg-mint/10 text-mint"
                  : "border-hairline bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col gap-4 p-4 sm:p-6">
        {/* Stage */}
        <div
          className={cn(
            "flex items-center justify-center rounded-xl border border-hairline bg-background/60 bg-[radial-gradient(circle,_var(--hairline)_1px,_transparent_1px)] [background-size:22px_22px] px-2",
            stageClassName,
          )}
        >
          {renderStage(step, safeIndex)}
        </div>

        {belowStage}

        {/* Status card */}
        <div
          className={cn(
            "rounded-xl border px-4 py-3 transition-colors duration-300",
            last ? "border-mint/40 bg-mint/5" : "border-hairline bg-background/70",
          )}
        >
          <div className="flex items-center gap-2.5">
            {last ? (
              <CheckCircle2 className="size-5 shrink-0 text-mint" />
            ) : (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-hairline font-mono text-[10px] font-bold text-muted-foreground">
                {safeIndex + 1}
              </span>
            )}
            <span className="min-w-0 truncate text-[13px] font-semibold text-mint">
              {step.phase}
            </span>
          </div>
          <div className="mt-1.5 grid min-h-[3.2rem] text-sm leading-relaxed">
            {reservedNarrations.map((text) => (
              <p key={text} aria-hidden className="invisible [grid-area:1/1]">
                {text}
              </p>
            ))}
            <p
              key={safeIndex}
              className="text-foreground/90 duration-300 animate-in fade-in [grid-area:1/1]"
            >
              {step.narration}
            </p>
          </div>
          <div className="mt-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {step.stats.map((stat) => (
              <span
                key={stat.label}
                className="flex shrink-0 items-baseline gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 font-mono"
              >
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                <strong
                  className={cn(
                    "text-[13px]",
                    stat.tone ? WALKTHROUGH_TONE[stat.tone] : "text-foreground",
                  )}
                >
                  {stat.value}
                </strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Transport controls */}
      <div className="relative flex items-center gap-2 border-t border-hairline bg-surface-2/30 px-4 py-3 sm:px-5">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-hairline/60">
          <div
            className="h-full bg-mint transition-[width] duration-300"
            style={{ width: `${((safeIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={togglePlay}
          className="h-9 min-w-[6.5rem] @min-[30rem]:min-w-28"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? "Pause" : last ? "Replay" : "Autoplay"}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-9"
          onClick={() => stepBy(-1)}
          disabled={safeIndex === 0}
          aria-label="Previous step"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-9"
          onClick={() => stepBy(1)}
          disabled={last}
          aria-label="Next step"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-9"
          onClick={() => goTo(0)}
          aria-label="Reset to the first step"
        >
          <RotateCcw className="size-4" />
        </Button>
        <span className="ml-1 whitespace-nowrap font-mono text-xs text-muted-foreground">
          {safeIndex + 1} / {steps.length}
        </span>
        <div className="ml-auto hidden items-center gap-3 @min-[34rem]:flex">
          <span className="hidden whitespace-nowrap font-mono text-[11px] text-muted-foreground @min-[60rem]:inline">
            ← → step · space play
          </span>
          <div className="flex items-center rounded-lg border border-hairline bg-background p-0.5 font-mono text-[11px]">
            {([0.5, 1, 2] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSpeed(option)}
                className={cn(
                  "rounded-md px-2 py-1 font-semibold transition-colors",
                  speed === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={`Playback speed ${option}x`}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
