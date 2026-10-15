import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ThreeSumRole = {
  symbol: string;
  title: string;
  text: string;
  tone: "fixed" | "left" | "right";
};

/** The lesson's sorted example and target. */
const VALUES = [-4, -1, 0, 1, 2, 5];
const TARGET = 0;

const TONE = {
  fixed: {
    card: "border-violet/40 bg-violet/5",
    badge: "border-violet bg-violet/15 text-violet",
    text: "text-violet",
    cell: "border-violet bg-violet/15 text-violet ring-2 ring-violet/30",
  },
  left: {
    card: "border-mint/40 bg-mint/5",
    badge: "border-mint bg-mint/10 text-mint",
    text: "text-mint",
    cell: "border-mint bg-mint/20 text-mint ring-2 ring-mint/30",
  },
  right: {
    card: "border-blue-500/40 bg-blue-500/5",
    badge: "border-blue-500 bg-blue-500/10 text-blue-500 dark:text-blue-400",
    text: "text-blue-500 dark:text-blue-400",
    cell: "border-blue-500 bg-blue-500/15 text-blue-500 ring-2 ring-blue-500/30 dark:text-blue-400",
  },
};

type Frame = {
  /** The fixed index, or null on the closing frame. */
  fixed: number | null;
  /** The pair after it that completes the target, when one exists. */
  pair: [number, number] | null;
  text: string;
};

/** One frame per fixed number that still has two numbers after it, then a summary frame. */
function buildFrames(): Frame[] {
  const frames: Frame[] = [];
  const found: number[][] = [];
  for (let i = 0; i <= VALUES.length - 3; i++) {
    const need = TARGET - VALUES[i];
    let pair: [number, number] | null = null;
    let left = i + 1;
    let right = VALUES.length - 1;
    while (left < right) {
      const sum = VALUES[left] + VALUES[right];
      if (sum === need) {
        pair = [left, right];
        break;
      }
      if (sum < need) left += 1;
      else right -= 1;
    }
    if (pair) found.push([VALUES[i], VALUES[pair[0]], VALUES[pair[1]]]);
    frames.push({
      fixed: i,
      pair,
      text: pair
        ? `Fix ${VALUES[i]}. The two numbers after it must add up to ${need}. ${VALUES[pair[0]]} and ${VALUES[pair[1]]} do, so [${VALUES[i]}, ${VALUES[pair[0]]}, ${VALUES[pair[1]]}] is a triplet.`
        : `Fix ${VALUES[i]}. The two numbers after it must add up to ${need}. No pair after it does, so this number is in no triplet.`,
    });
  }
  frames.push({
    fixed: null,
    pair: null,
    text: `Every number was fixed once, and each time the search was a small 2-Sum. The triplets are ${found
      .map((triplet) => `[${triplet.join(", ")}]`)
      .join(" and ")}.`,
  });
  return frames;
}

/** Three role cards, then a scene that fixes one number at a time and searches the rest. */
export function ThreeSumIntuition({ roles }: { roles: ThreeSumRole[] }) {
  const frames = useMemo(buildFrames, []);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frame = frames[index];
  const finished = index === frames.length - 1;
  const columns = { gridTemplateColumns: `repeat(${VALUES.length}, minmax(0, 1fr))` };

  useEffect(() => {
    if (!playing) return;
    if (finished) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setIndex((current) => current + 1), 1900);
    return () => clearTimeout(timer);
  }, [playing, index, finished]);

  const go = (next: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(next, frames.length - 1)));
  };

  const cellClass = (cell: number) => {
    if (frame.fixed === null) return "border-mint/40 bg-mint/10 text-mint";
    if (cell === frame.fixed) return TONE.fixed.cell;
    if (frame.pair && cell === frame.pair[0]) return TONE.left.cell;
    if (frame.pair && cell === frame.pair[1]) return TONE.right.cell;
    if (cell > frame.fixed) return "border-hairline bg-background text-foreground/85";
    return "border-hairline bg-background text-muted-foreground/40";
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {roles.map((role) => (
          <div key={role.symbol} className={cn("rounded-xl border p-4", TONE[role.tone].card)}>
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold",
                  TONE[role.tone].badge,
                )}
              >
                {role.symbol}
              </span>
              <p className={cn("text-sm font-semibold", TONE[role.tone].text)}>{role.title}</p>
            </div>
            <p className="lesson-supporting mt-2 text-foreground/85">{role.text}</p>
          </div>
        ))}
      </div>

      <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
        <div className="px-4 pb-4 pt-5 sm:px-8">
          <p className="text-center text-xs font-semibold text-muted-foreground">
            Target {TARGET}. Fix one number, then find two more after it.
          </p>
          <div className="mx-auto mt-3 max-w-md" style={{ maxWidth: `${VALUES.length * 5}rem` }}>
            <div className="grid h-7 items-end" style={columns}>
              {VALUES.map((_, cell) => (
                <span
                  key={cell}
                  className={cn(
                    "text-center font-mono text-xs font-bold",
                    frame.fixed === cell
                      ? TONE.fixed.text
                      : frame.pair?.[0] === cell
                        ? TONE.left.text
                        : frame.pair?.[1] === cell
                          ? TONE.right.text
                          : "",
                  )}
                >
                  {frame.fixed === cell
                    ? "i"
                    : frame.pair?.[0] === cell
                      ? "L"
                      : frame.pair?.[1] === cell
                        ? "R"
                        : ""}
                </span>
              ))}
            </div>
            <div className="mt-1 grid" style={columns}>
              {VALUES.map((value, cell) => (
                <div key={cell} className="flex justify-center px-0.5 sm:px-1">
                  <div
                    className={cn(
                      "flex aspect-square w-full max-w-16 items-center justify-center rounded-xl border-2 font-mono text-base font-bold transition-colors duration-300 sm:text-lg",
                      cellClass(cell),
                    )}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-1.5 grid" style={columns}>
              {VALUES.map((_, cell) => (
                <span key={cell} className="text-center font-mono text-xs text-muted-foreground">
                  [{cell}]
                </span>
              ))}
            </div>
          </div>

          <p
            key={index}
            className="lesson-supporting mx-auto mt-5 min-h-[4.5rem] max-w-xl text-center text-foreground/90 duration-300 animate-in fade-in"
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
                if (finished) setIndex(0);
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
              onClick={() => go(index - 1)}
              disabled={index === 0}
              aria-label="Previous fixed number"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              onClick={() => go(index + 1)}
              disabled={finished}
              aria-label="Next fixed number"
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
            {frames.map((_, dot) => (
              <button
                key={dot}
                type="button"
                onClick={() => go(dot)}
                aria-label={`Moment ${dot + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  dot === index ? "w-6 bg-mint" : "w-1.5 bg-hairline hover:bg-muted-foreground/40",
                )}
              />
            ))}
          </div>
        </div>
      </figure>
    </div>
  );
}
