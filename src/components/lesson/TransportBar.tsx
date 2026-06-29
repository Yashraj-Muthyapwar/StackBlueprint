import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

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
}) {
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
          title="Play / Pause (Space)"
          className="bg-mint text-primary-foreground hover:bg-mint/90"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={onNext} title="Next (→)">
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
