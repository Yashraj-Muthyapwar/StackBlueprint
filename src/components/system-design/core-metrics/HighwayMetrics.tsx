import { useState } from "react";
import { useAnimationFrame, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * The highway analogy for all three metrics. Every open lane carries the same cars at the same
 * speed, so one trip always takes 5 minutes (latency). More open lanes let more cars finish each
 * hour (throughput) and raise what the road can carry (bandwidth). One car is highlighted so the
 * eye can follow a single trip.
 */

const W = 800;
const X0 = 100;
const LEN = 600;
const TOP = 34;
const LANE_H = 36;
const MAX_LANES = 4;
const BOTTOM = TOP + LANE_H * MAX_LANES;
const H = BOTTOM + 14;
const CAR_W = 34;
const CAR_H = 18;
const PERIOD = 7; // seconds of animation for one trip
const TRIP_MINUTES = 5;
const CARS_PER_LANE = 4;
const CARS_PER_LANE_PER_HOUR = (60 / TRIP_MINUTES) * CARS_PER_LANE;

const frac = (n: number) => n - Math.floor(n);
const carX = (progress: number) => X0 + progress * (LEN - CAR_W);
const laneY = (lane: number) => TOP + lane * LANE_H + (LANE_H - CAR_H) / 2;

export function HighwayMetrics() {
  const reduced = !!useReducedMotion();
  const [lanes, setLanes] = useState(2);
  const [seconds, setSeconds] = useState(reduced ? PERIOD * 0.4 : 0);

  useAnimationFrame((time) => {
    if (!reduced) setSeconds(time / 1000);
  });

  const cycles = seconds / PERIOD;
  const yourProgress = frac(cycles);

  return (
    <section
      aria-label="A highway with a changeable number of lanes: more lanes raise how many cars finish per hour, but one trip still takes the same time"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Open more lanes
        </p>
        <div role="group" aria-label="Number of open lanes" className="flex items-center gap-1.5">
          {Array.from({ length: MAX_LANES }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={lanes === n ? "default" : "outline"}
              aria-pressed={lanes === n}
              className="h-7 px-2.5 text-xs"
              onClick={() => setLanes(n)}
            >
              {n} {n === 1 ? "lane" : "lanes"}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-3 pt-3 sm:px-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`A highway with ${lanes} open ${lanes === 1 ? "lane" : "lanes"}. One highlighted car drives from the start to the finish.`}
          className="h-auto w-full"
        >
          <rect
            x={X0}
            y={TOP}
            width={LEN}
            height={LANE_H * MAX_LANES}
            rx={6}
            className="fill-surface-2 stroke-muted-foreground/40"
            strokeWidth={1.5}
          />
          {Array.from({ length: MAX_LANES }, (_, lane) => (
            <g key={lane}>
              {lane > 0 ? (
                <line
                  x1={X0}
                  x2={X0 + LEN}
                  y1={TOP + LANE_H * lane}
                  y2={TOP + LANE_H * lane}
                  strokeDasharray="10 9"
                  strokeWidth={1.5}
                  className="stroke-muted-foreground/40"
                />
              ) : null}
              {lane >= lanes ? (
                <rect
                  x={X0 + 1}
                  y={TOP + lane * LANE_H + 1}
                  width={LEN - 2}
                  height={LANE_H - 2}
                  className="fill-background/70"
                />
              ) : null}
              <text
                x={X0 - 12}
                y={TOP + lane * LANE_H + LANE_H / 2 + 4}
                textAnchor="end"
                className={cn(
                  "font-mono text-[11px]",
                  lane < lanes ? "fill-foreground/80" : "fill-muted-foreground/60",
                )}
              >
                {lane < lanes ? `Lane ${lane + 1}` : "Closed"}
              </text>
            </g>
          ))}

          {[
            { x: X0, label: "Start" },
            { x: X0 + LEN, label: "Finish" },
          ].map((gate) => (
            <g key={gate.label}>
              <line
                x1={gate.x}
                x2={gate.x}
                y1={TOP - 6}
                y2={BOTTOM + 6}
                strokeWidth={3}
                className="stroke-foreground/70"
              />
              <text
                x={gate.x}
                y={TOP - 14}
                textAnchor="middle"
                className="fill-foreground font-mono text-[12px] font-semibold uppercase tracking-widest"
              >
                {gate.label}
              </text>
            </g>
          ))}

          {Array.from({ length: lanes }, (_, lane) =>
            Array.from({ length: CARS_PER_LANE }, (_, k) => {
              const offset = k / CARS_PER_LANE + (lane % 2) * 0.1;
              const yours = lane === 0 && k === 0;
              return (
                <Car
                  key={`${lane}-${k}`}
                  x={carX(frac(cycles + offset))}
                  y={laneY(lane)}
                  className={yours ? "fill-mint" : "fill-sky-500/70 opacity-40"}
                  ring={yours}
                />
              );
            }),
          )}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-1 sm:px-5">
        <Stat
          label="Latency: one trip"
          value={`${TRIP_MINUTES} min`}
          note="unchanged"
          tone="text-mint"
        />
        <Stat
          label="Throughput"
          value={`${lanes * CARS_PER_LANE_PER_HOUR} cars/hour`}
          note={`${lanes} ${lanes === 1 ? "lane" : "lanes"} open`}
          tone="text-violet"
        />
        <Stat
          label="Capacity"
          value={`${lanes} of ${MAX_LANES} lanes`}
          note="road width"
          tone="text-amber-600 dark:text-amber-400"
        />
      </div>

      <p className="px-4 pb-4 text-center text-sm text-foreground/90 sm:px-5">
        Opening lanes lets more cars finish every hour. The highlighted car still needs 5 minutes.
      </p>
    </section>
  );
}

function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <span className="flex items-baseline gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 font-mono">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <strong className={cn("text-[13px]", tone)}>{value}</strong>
      <span className="text-[11px] text-muted-foreground">{note}</span>
    </span>
  );
}

function Car({
  x,
  y,
  className,
  ring,
}: {
  x: number;
  y: number;
  className: string;
  ring?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {ring ? (
        <rect
          x={-4}
          y={-4}
          width={CAR_W + 8}
          height={CAR_H + 8}
          rx={9}
          fill="none"
          strokeWidth={2}
          className="stroke-mint/60"
        />
      ) : null}
      <rect width={CAR_W} height={CAR_H} rx={5} className={className} />
      <rect
        x={CAR_W - 12}
        y={3.5}
        width={7}
        height={CAR_H - 7}
        rx={2}
        className="fill-background/70"
      />
    </g>
  );
}
