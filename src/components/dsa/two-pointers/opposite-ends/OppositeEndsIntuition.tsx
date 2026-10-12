import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, PersonStanding, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const START = [10, 20, 30, 40, 50];

type Beat = "start" | "swap" | "walk" | "meet";
type Frame = {
  beat: Beat;
  boxes: { id: number; value: number }[];
  left: number;
  right: number;
  text: string;
};

function buildFrames(): Frame[] {
  let boxes = START.map((value, id) => ({ id, value }));
  let left = 0;
  let right = boxes.length - 1;
  const frames: Frame[] = [
    {
      beat: "start",
      boxes,
      left,
      right,
      text: `Left stands at index 0. Right stands at index ${START.length - 1}. Press play to walk them inward.`,
    },
  ];
  while (left < right) {
    const a = boxes[left].value;
    const b = boxes[right].value;
    boxes = boxes.slice();
    [boxes[left], boxes[right]] = [boxes[right], boxes[left]];
    frames.push({
      beat: "swap",
      boxes,
      left,
      right,
      text: `They swap their boxes: ${a} and ${b} trade places.`,
    });
    left += 1;
    right -= 1;
    frames.push({
      beat: left < right ? "walk" : "meet",
      boxes,
      left,
      right,
      text:
        left < right
          ? "The left person steps right. The right person steps left."
          : left === right
            ? `They meet at index ${left}. The middle box is already in place, so they stop.`
            : "They cross. Every pair has been swapped, so they stop.",
    });
  }
  return frames;
}

const FRAMES = buildFrames();
const N = START.length;
const center = (index: number) => ((index + 0.5) / N) * 100;

function Walker({
  side,
  index,
  together,
  walking,
}: {
  side: "left" | "right";
  index: number;
  together: boolean;
  walking: boolean;
}) {
  const isLeft = side === "left";
  return (
    <div
      className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center transition-[left] duration-700 ease-in-out"
      style={{ left: `calc(${center(index)}% ${isLeft ? "-" : "+"} ${together ? 22 : 0}px)` }}
    >
      <span
        className={cn(
          "mb-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
          isLeft
            ? "border-mint/40 bg-mint/10 text-mint"
            : "border-blue-500/40 bg-blue-500/10 text-blue-500 dark:text-blue-400",
        )}
      >
        {isLeft ? "Left" : "Right"}
      </span>
      <motion.div
        animate={walking ? { y: [0, -5, 0, -5, 0] } : { y: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className={isLeft ? "text-mint" : "text-blue-500 dark:text-blue-400"}
      >
        <PersonStanding className={cn("size-9 sm:size-11", !isLeft && "-scale-x-100")} />
      </motion.div>
    </div>
  );
}

export function OppositeEndsIntuition({ caption }: { caption?: string }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = FRAMES[frameIndex];
  const finished = frameIndex === FRAMES.length - 1;
  const swapping = frame.beat === "swap";
  const walking = frame.beat === "walk" || frame.beat === "meet";

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

  const togglePlay = () => {
    if (finished) {
      setFrameIndex(0);
      setPlaying(true);
    } else setPlaying((current) => !current);
  };

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="relative px-4 pb-4 pt-6 sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-mint/[0.06] to-transparent" />

        <div className="relative mx-auto w-full max-w-xl">
          {/* Walkers */}
          <div className="relative h-20">
            <Walker
              side="left"
              index={frame.left}
              together={frame.left === frame.right}
              walking={walking}
            />
            <Walker
              side="right"
              index={frame.right}
              together={frame.left === frame.right}
              walking={walking}
            />
          </div>

          {/* Swap arc between the two people */}
          <div className="relative h-8">
            {swapping ? (
              <>
                <svg
                  key={frameIndex}
                  viewBox="0 0 100 30"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full duration-300 animate-in fade-in"
                  aria-hidden
                >
                  <path
                    d={`M ${center(frame.left)} 30 Q ${(center(frame.left) + center(frame.right)) / 2} -10 ${center(frame.right)} 30`}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    className="stroke-violet"
                  />
                </svg>
                <span
                  className="absolute -top-1 -translate-x-1/2 rounded-full border border-violet/40 bg-violet/10 px-2 py-0.5 font-mono text-[11px] font-bold text-violet"
                  style={{ left: `${(center(frame.left) + center(frame.right)) / 2}%` }}
                >
                  swap
                </span>
              </>
            ) : null}
          </div>

          {/* Boxes */}
          <div className="grid grid-cols-5">
            {frame.boxes.map((box, index) => {
              const isLeft = index === frame.left;
              const isRight = index === frame.right;
              const moving = swapping && (isLeft || isRight);
              const placed =
                index < frame.left || index > frame.right || (finished && !isLeft && !isRight);
              return (
                <motion.div
                  key={box.id}
                  layout
                  transition={{ layout: { type: "spring", stiffness: 120, damping: 18 } }}
                  className="flex justify-center px-1 sm:px-2"
                >
                  <motion.div
                    animate={moving ? { y: [0, isLeft ? -18 : -36, 0] } : { y: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className={cn(
                      "flex aspect-square w-full max-w-20 items-center justify-center rounded-xl border-2 font-mono text-xl font-bold shadow-sm transition-colors duration-300 sm:text-2xl",
                      moving
                        ? "border-violet bg-violet/10 text-violet"
                        : finished || placed
                          ? "border-mint/50 bg-mint/10 text-mint"
                          : isLeft
                            ? "border-mint bg-background text-mint"
                            : isRight
                              ? "border-blue-500 bg-background text-blue-500 dark:text-blue-400"
                              : "border-hairline bg-background text-foreground/80",
                    )}
                  >
                    {box.value}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-5">
            {START.map((_, index) => (
              <span key={index} className="text-center font-mono text-[11px] text-muted-foreground">
                Index {index}
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
          <Button type="button" size="sm" onClick={togglePlay} className="min-w-28">
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
            aria-label="Reset the walk"
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
                i === frameIndex ? "w-6 bg-mint" : "w-1.5 bg-hairline hover:bg-muted-foreground/40",
              )}
            />
          ))}
        </div>
      </div>

      {caption ? (
        <figcaption className="border-t border-hairline px-5 py-2.5 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
