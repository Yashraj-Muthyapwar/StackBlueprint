import { useCallback, useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pause, Play, RotateCcw } from "lucide-react";

const BTN = "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground";

/** Stops an animation when a lesson quiz starts, like the rest of the site's visuals. */
export function usePauseOnQuiz(pause: () => void) {
  useEffect(() => {
    window.addEventListener("quiz-started", pause);
    return () => window.removeEventListener("quiz-started", pause);
  }, [pause]);
}

export function CloudFrame({
  caption,
  children,
  footer,
}: {
  caption: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <figcaption className="border-b border-hairline bg-surface/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {caption}
      </figcaption>
      {children}
      <div className="flex items-center gap-3 border-t border-hairline bg-surface-2/40 px-4 py-2.5">{footer}</div>
    </figure>
  );
}

export function PlayButtons({
  playing,
  onToggle,
  onRestart,
}: {
  playing: boolean;
  onToggle: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" className={BTN} aria-label="Restart" onClick={onRestart}>
        <RotateCcw className="size-3.5" />
      </button>
      <button type="button" className={BTN} aria-label={playing ? "Pause" : "Play"} onClick={onToggle}>
        {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------
   StoryPlayer: auto-advancing illustrated scenes with clickable tabs.
   --------------------------------------------------------------------- */

export function StoryPlayer({
  caption,
  scenes,
  render,
  viewBox = "0 0 640 280",
  sceneMs = 7000,
}: {
  caption: string;
  scenes: readonly { label: string; note: string }[];
  render: (scene: number) => ReactNode;
  viewBox?: string;
  sceneMs?: number;
}) {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [tick, setTick] = useState(0);
  const pause = useCallback(() => setPlaying(false), []);
  usePauseOnQuiz(pause);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setScene((s) => (s + 1) % scenes.length), sceneMs);
    return () => window.clearTimeout(id);
  }, [playing, scene, tick, scenes.length, sceneMs]);

  const select = (i: number) => {
    setScene(i);
    setTick((t) => t + 1);
  };

  return (
    <CloudFrame
      caption={caption}
      footer={
        <>
          <PlayButtons
            playing={playing}
            onToggle={() => setPlaying((p) => !p)}
            onRestart={() => {
              setPlaying(true);
              select(0);
            }}
          />
          <div className="ml-auto flex flex-wrap justify-end gap-2">
            {scenes.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setPlaying(false);
                  select(i);
                }}
                className={`relative overflow-hidden rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  i === scene
                    ? "border-mint/50 bg-mint/10 text-mint"
                    : "border-hairline text-muted-foreground hover:text-foreground"
                }`}
              >
                {i === scene && playing ? (
                  <motion.span
                    key={`${scene}-${tick}`}
                    className="absolute inset-y-0 left-0 bg-mint/20"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: sceneMs / 1000, ease: "linear" }}
                  />
                ) : null}
                <span className="relative">{s.label}</span>
              </button>
            ))}
          </div>
        </>
      }
    >
      <div className="px-3 pt-4 sm:px-5">
        <svg viewBox={viewBox} className="h-auto w-full" role="img" aria-label={scenes[scene].label}>
          <AnimatePresence mode="wait">
            <motion.g
              key={scene}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45 }}
            >
              {render(scene)}
            </motion.g>
          </AnimatePresence>
        </svg>
        {/* Every note shares one grid cell, so the box is as tall as the longest note and the page never shifts. */}
        <div className="grid px-2 pb-4 pt-1">
          {scenes.map((s, i) => (
            <p
              key={s.label}
              aria-hidden={i !== scene}
              className={`lesson-supporting col-start-1 row-start-1 text-foreground/85 transition-opacity duration-300 ${
                i === scene ? "opacity-100" : "opacity-0"
              }`}
            >
              {s.note}
            </p>
          ))}
        </div>
      </div>
    </CloudFrame>
  );
}
