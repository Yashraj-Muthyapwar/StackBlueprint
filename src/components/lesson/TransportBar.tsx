import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function TransportBar({
  step,
  total,
  playing,
  speed,
  onPrev,
  onNext,
  onPlayToggle,
  onReset,
  onSpeed,
  locked = false,
  predict,
}: {
  step: number;
  total: number;
  playing: boolean;
  speed: number;
  onPrev: () => void;
  onNext: () => void;
  onPlayToggle: () => void;
  onReset: () => void;
  onSpeed: (n: number) => void;
  /** True while a prediction is open: play and next are disabled until it's answered. */
  locked?: boolean;
  /** Provide only for lessons that have predictions. */
  predict?: {
    enabled: boolean;
    onToggle: () => void;
    correct: number;
    answered: number;
    total: number;
  };
}) {
  const lockedTitle = "Answer the prediction first";
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-surface px-4 py-2.5">
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" onClick={onReset} title="Reset (R)">
          <RotateCcw className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onPrev} title="Previous (←)">
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          size="icon"
          onClick={onPlayToggle}
          disabled={locked}
          title={locked ? lockedTitle : "Play / Pause (Space)"}
          className="bg-mint text-primary-foreground hover:bg-mint/90"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onNext}
          disabled={locked}
          title={locked ? lockedTitle : "Next (→)"}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
        <span>
          Step <span className="text-foreground">{step + 1}</span>
          <span className="px-1 text-muted-foreground/50">/</span>
          <span>{total}</span>
        </span>
      </div>

      {predict && (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant={predict.enabled ? "default" : "ghost"}
            onClick={predict.onToggle}
            title={
              predict.enabled
                ? "Turn off predict mode"
                : "Predict mode: guess each move before it's revealed (restarts the lesson)"
            }
            className={
              predict.enabled
                ? "bg-amber text-primary-foreground hover:bg-amber/90"
                : "border border-hairline"
            }
          >
            <Target className="mr-1 size-3.5" /> Predict
          </Button>
          {predict.enabled && (
            <span className="font-mono text-xs text-muted-foreground">
              <span className="text-foreground">{predict.correct}</span>
              <span className="px-1 text-muted-foreground/50">/</span>
              {predict.answered} correct
              <span className="pl-2 text-muted-foreground/60">({predict.total} total)</span>
            </span>
          )}
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          speed
        </span>
        <div className="w-32">
          <Slider
            value={[speed]}
            min={0.25}
            max={2}
            step={0.25}
            onValueChange={(v) => onSpeed(v[0])}
          />
        </div>
        <span className="w-10 text-right font-mono text-xs text-foreground">{speed}×</span>
      </div>
    </div>
  );
}
