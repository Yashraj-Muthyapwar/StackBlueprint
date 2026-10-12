import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  ScanSearch,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FastSlowRole = {
  pointer: string;
  nickname: string;
  text: string;
  tone: "left" | "right";
};

const START = [2, 2, 4, 4, 6, 6, 8];
const N = START.length;
const center = (index: number) => ((index + 0.5) / N) * 100;

type Frame = {
  values: number[];
  scout: number;
  recorder: number;
  wrote: boolean;
  text: string;
};

function buildFrames(): Frame[] {
  const values = START.slice();
  let recorder = 0;
  const frames: Frame[] = [
    {
      values: values.slice(),
      scout: 1,
      recorder,
      wrote: false,
      text: "The recorder stands on the first box. The scout starts one box ahead.",
    },
  ];
  for (let scout = 1; scout < N; scout++) {
    if (values[scout] === values[recorder]) {
      frames.push({
        values: values.slice(),
        scout,
        recorder,
        wrote: false,
        text: `The scout sees ${values[scout]} again. Nothing new, so the recorder stays.`,
      });
      continue;
    }
    recorder += 1;
    values[recorder] = values[scout];
    frames.push({
      values: values.slice(),
      scout,
      recorder,
      wrote: true,
      text: `The scout finds ${values[scout]}. The recorder steps forward and writes ${values[scout]}.`,
    });
  }
  frames.push({
    values: values.slice(),
    scout: N - 1,
    recorder,
    wrote: false,
    text: `The scout reached the end after ${N - 1} checks. The recorder moved only ${recorder} times, and its boxes hold ${values
      .slice(0, recorder + 1)
      .join(", ")}.`,
  });
  return frames;
}

const FRAMES = buildFrames();

const ROLE_STYLE = {
  left: { border: "border-mint/40 bg-mint/5", text: "text-mint", Icon: PenLine },
  right: {
    border: "border-blue-500/40 bg-blue-500/5",
    text: "text-blue-500 dark:text-blue-400",
    Icon: ScanSearch,
  },
};

function Walker({ index, label, tone }: { index: number; label: string; tone: "left" | "right" }) {
  const { text, Icon, border } = ROLE_STYLE[tone];
  return (
    <div
      className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center transition-[left] duration-700 ease-in-out"
      style={{ left: `${center(index)}%` }}
    >
      <span
        className={cn(
          "mb-1 hidden whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:inline",
          border,
          text,
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full border-2 bg-background",
          text,
        )}
      >
        <Icon className="size-4" />
      </span>
    </div>
  );
}

/** Role cards plus a scene where the scout checks every box and the recorder writes new values. */
export function FastSlowIntuition({ roles }: { roles: FastSlowRole[] }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = FRAMES[frameIndex];
  const finished = frameIndex === FRAMES.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (finished) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setFrameIndex((current) => current + 1), 1500);
    return () => clearTimeout(timer);
  }, [playing, frameIndex, finished]);

  const go = (index: number) => {
    setPlaying(false);
    setFrameIndex(Math.max(0, Math.min(index, FRAMES.length - 1)));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => {
          const style = ROLE_STYLE[role.tone];
          return (
            <div key={role.pointer} className={cn("rounded-xl border p-4", style.border)}>
              <div className="flex items-center gap-2">
                <style.Icon className={cn("size-4", style.text)} />
                <p className={cn("text-sm font-semibold", style.text)}>{role.pointer}</p>
                <span className="text-sm text-muted-foreground">· {role.nickname}</span>
              </div>
              <p className="lesson-supporting mt-2 text-foreground/85">{role.text}</p>
            </div>
          );
        })}
      </div>

      <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
        <div className="relative px-4 pb-4 pt-6 sm:px-8">
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative h-16">
              <Walker index={frame.recorder} label="Recorder" tone="left" />
              <Walker index={frame.scout} label="Scout" tone="right" />
            </div>

            <div
              className="mt-2 grid"
              style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
            >
              {frame.values.map((value, index) => {
                const kept = index <= frame.recorder;
                const isScout = index === frame.scout;
                const isRecorder = index === frame.recorder;
                return (
                  <div key={index} className="flex justify-center px-0.5 sm:px-1">
                    <div
                      className={cn(
                        "flex aspect-square w-full max-w-16 items-center justify-center rounded-xl border-2 font-mono text-lg font-bold transition-colors duration-300 sm:text-xl",
                        isRecorder && frame.wrote
                          ? "border-violet bg-violet/10 text-violet"
                          : isScout
                            ? "border-blue-500 bg-background text-blue-500 dark:text-blue-400"
                            : isRecorder
                              ? "border-mint bg-mint/10 text-mint"
                              : kept
                                ? "border-mint/40 bg-mint/5 text-mint/90"
                                : "border-hairline bg-background text-foreground/75",
                      )}
                    >
                      <span
                        key={`${index}-${value}`}
                        className={
                          isRecorder && frame.wrote
                            ? "duration-300 animate-in zoom-in-50"
                            : undefined
                        }
                      >
                        {value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              className="mt-2 grid"
              style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
            >
              {START.map((_, index) => (
                <span
                  key={index}
                  className="text-center font-mono text-[11px] text-muted-foreground"
                >
                  {index}
                </span>
              ))}
            </div>
          </div>

          <p
            key={frameIndex}
            className="lesson-supporting mx-auto mt-5 min-h-12 max-w-xl text-center text-foreground/90 duration-300 animate-in fade-in"
          >
            {frame.text}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-surface-2/30 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (finished) setFrameIndex(0);
                setPlaying((current) => (finished ? true : !current));
              }}
              className="min-w-28"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playing ? "Pause" : finished ? "Replay" : "Play"}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              onClick={() => go(frameIndex - 1)}
              disabled={frameIndex === 0}
              aria-label="Previous moment"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              onClick={() => go(frameIndex + 1)}
              disabled={finished}
              aria-label="Next moment"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              onClick={() => go(0)}
              aria-label="Reset the scene"
            >
              <RotateCcw className="size-4" />
            </Button>
          </div>
          <div className="flex gap-1.5">
            {FRAMES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Moment ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === frameIndex
                    ? "w-6 bg-mint"
                    : "w-1.5 bg-hairline hover:bg-muted-foreground/40",
                )}
              />
            ))}
          </div>
        </div>
      </figure>
    </div>
  );
}
