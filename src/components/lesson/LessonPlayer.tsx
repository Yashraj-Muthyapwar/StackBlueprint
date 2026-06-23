import { useCallback, useEffect, useRef, useState } from "react";

import { ArrayCanvas } from "./ArrayCanvas";
import { CodePane } from "./CodePane";
import { LinkedListCanvas } from "./LinkedListCanvas";
import { NarrationCard } from "./NarrationCard";
import { TransportBar } from "./TransportBar";
import type {
  ArrayStep,
  Lesson,
  LinkedListShape,
  LinkedListStep,
} from "@/lessons/types";

type Props =
  | {
      kind: "array";
      lesson: Lesson<ArrayStep>;
    }
  | {
      kind: "linked-list";
      lesson: Lesson<LinkedListStep>;
      shape: LinkedListShape;
    };

export function LessonPlayer(props: Props) {
  const { lesson } = props;
  const total = lesson.steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = lesson.steps[stepIndex];

  const go = useCallback(
    (n: number) => {
      setStepIndex((cur) => {
        const next = Math.max(0, Math.min(total - 1, cur + n));
        return next;
      });
    },
    [total],
  );

  const reset = useCallback(() => {
    setStepIndex(0);
    setPlaying(false);
  }, []);

  // autoplay
  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= total - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setStepIndex((i) => Math.min(total - 1, i + 1));
    }, 900 / speed);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, stepIndex, speed, total]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.code === "KeyR") {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, reset]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1fr]">
        {/* Visualization pane */}
        <div className="relative grid-bg min-h-[360px] overflow-hidden rounded-2xl border border-hairline bg-surface">
          <div className="absolute left-4 top-3 z-10 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              visualization
            </span>
          </div>
          <div className="absolute inset-0">
            {props.kind === "array" ? (
              <ArrayCanvas step={step as ArrayStep} />
            ) : (
              <LinkedListCanvas step={step as LinkedListStep} shape={props.shape} />
            )}
          </div>
          <Legend kind={props.kind} />
        </div>

        {/* Code pane */}
        <div className="min-h-[360px]">
          <CodePane code={lesson.code} activeLine={step.line} />
        </div>
      </div>

      <TransportBar
        step={stepIndex}
        total={total}
        playing={playing}
        speed={speed}
        onPrev={() => {
          setPlaying(false);
          go(-1);
        }}
        onNext={() => {
          setPlaying(false);
          go(1);
        }}
        onPlayToggle={() => setPlaying((p) => !p)}
        onReset={reset}
        onSpeed={setSpeed}
      />

      <NarrationCard stepIndex={stepIndex} text={step.narration} />
    </div>
  );
}

function Legend({ kind }: { kind: "array" | "linked-list" }) {
  const items =
    kind === "linked-list"
      ? [
          { name: "slow", color: "var(--mint)" },
          { name: "fast", color: "var(--amber)" },
        ]
      : [
          { name: "left / low", color: "var(--mint)" },
          { name: "right / high", color: "var(--amber)" },
          { name: "mid", color: "var(--violet)" },
        ];
  return (
    <div className="absolute bottom-3 right-3 z-10 flex items-center gap-3 rounded-full border border-hairline bg-background/70 px-3 py-1.5 backdrop-blur">
      {items.map((it) => (
        <div key={it.name} className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{
              background: it.color,
              boxShadow: `0 0 8px ${it.color}`,
            }}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {it.name}
          </span>
        </div>
      ))}
    </div>
  );
}
