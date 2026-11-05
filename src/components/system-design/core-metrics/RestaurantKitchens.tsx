import { useState } from "react";
import { useAnimationFrame, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * The restaurant analogy. Orders arrive at 300 meals per hour. One kitchen makes 100. The learner
 * upgrades the kitchen (vertical) or opens more kitchens (horizontal), and can add a payment
 * counter that caps the whole restaurant, to see why neither choice guarantees a threefold gain.
 */

const DEMAND = 300;
const COUNTER_LIMIT = 200;
const MODES = [
  { label: "One kitchen", capacity: 100, note: "100 meals/hour" },
  { label: "Upgrade the kitchen", capacity: 200, note: "200 meals/hour" },
  { label: "Add kitchens", capacity: 300, note: "3 x 100 meals/hour" },
] as const;

const W = 800;
const H = 230;
const SRC_X = 96;
const KITCHEN_X = 330;
const KITCHEN_W = 270;
const MID_Y = 115;
const DOTS = 14;

export function RestaurantKitchens() {
  const reduced = !!useReducedMotion();
  const [mode, setMode] = useState(0);
  const [counter, setCounter] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useAnimationFrame((t) => {
    if (!reduced) setSeconds(t / 1000);
  });

  const capacity = MODES[mode].capacity;
  const limit = counter ? Math.min(capacity, COUNTER_LIMIT) : capacity;
  const served = Math.min(DEMAND, limit);
  const waiting = DEMAND - served;
  const servedDots = Math.round((served / DEMAND) * DOTS);
  const kitchens = mode === 2 ? 3 : 1;
  const counterX = KITCHEN_X + KITCHEN_W + 40;
  const exitX = counter ? counterX + 100 : KITCHEN_X + KITCHEN_W + 90;

  return (
    <section
      aria-label="Restaurant analogy: orders arrive at 300 meals per hour; upgrade one kitchen or add kitchens to see how much the restaurant can serve"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          300 meals per hour are ordered
        </p>
        <div role="group" aria-label="How the restaurant grows" className="flex flex-wrap gap-1.5">
          {MODES.map((m, i) => (
            <Button
              key={m.label}
              type="button"
              size="sm"
              variant={mode === i ? "default" : "outline"}
              aria-pressed={mode === i}
              className="h-7 px-2.5 text-xs"
              onClick={() => setMode(i)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-3 pt-3 sm:px-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${MODES[mode].label}: the restaurant can serve ${served} of ${DEMAND} orders per hour`}
          className="h-auto w-full"
        >
          {/* customers */}
          <g>
            <circle cx={50} cy={MID_Y - 24} r={11} className="fill-muted-foreground/60" />
            <path
              d={`M${28} ${MID_Y + 6} Q${50} ${MID_Y - 22} ${72} ${MID_Y + 6} Z`}
              className="fill-muted-foreground/60"
            />
            <text
              x={50}
              y={MID_Y + 36}
              textAnchor="middle"
              className="fill-foreground font-mono text-[11px] font-semibold"
            >
              Customers
            </text>
          </g>

          <line
            x1={SRC_X}
            x2={KITCHEN_X}
            y1={MID_Y}
            y2={MID_Y}
            strokeWidth={2}
            strokeDasharray="5 6"
            className="stroke-muted-foreground/40"
          />

          {/* kitchens */}
          {kitchens === 1 ? (
            <Kitchen
              x={KITCHEN_X}
              y={mode === 1 ? 40 : 62}
              w={KITCHEN_W}
              h={mode === 1 ? 150 : 106}
              label={mode === 1 ? "Bigger kitchen" : "Kitchen"}
              sub={MODES[mode].note}
              big={mode === 1}
            />
          ) : (
            [0, 1, 2].map((i) => (
              <Kitchen
                key={i}
                x={KITCHEN_X}
                y={14 + i * 72}
                w={KITCHEN_W}
                h={60}
                label={`Kitchen ${i + 1}`}
                sub="100 meals/hour"
              />
            ))
          )}

          {counter ? (
            <g>
              <rect
                x={counterX}
                y={MID_Y - 44}
                width={88}
                height={88}
                rx={12}
                strokeWidth={2.2}
                className="fill-background stroke-amber"
              />
              <text
                x={counterX + 44}
                y={MID_Y - 8}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-semibold"
              >
                Payment
              </text>
              <text
                x={counterX + 44}
                y={MID_Y + 8}
                textAnchor="middle"
                className="fill-foreground text-[12px] font-semibold"
              >
                counter
              </text>
              <text
                x={counterX + 44}
                y={MID_Y + 28}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[10.5px]"
              >
                200/hour
              </text>
            </g>
          ) : null}

          <text x={exitX + 8} y={MID_Y + 4} className="fill-muted-foreground font-mono text-[11px]">
            Meals out
          </text>

          {/* orders: served ones travel through, waiting ones stop and pile up at the kitchen */}
          {Array.from({ length: DOTS }, (_, i) => {
            const isServed = i < servedDots;
            const phase = reduced ? 0.5 : (((seconds * 0.35 + i / DOTS) % 1) + 1) % 1;
            const stop = KITCHEN_X - 14 - (i % 4) * 14;
            const px = isServed
              ? SRC_X + phase * (exitX - SRC_X)
              : SRC_X + Math.min(phase * 1.6, 1) * (stop - SRC_X);
            const py = isServed ? MID_Y : MID_Y - 18 + (i % 3) * 18;
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={5}
                className={isServed ? "fill-mint" : "fill-rose-500"}
                opacity={isServed ? 1 : 0.85}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-1 sm:px-5">
        <Stat label="Orders" value={`${DEMAND}/hour`} tone="text-foreground" />
        <Stat label="Restaurant can serve" value={`${served}/hour`} tone="text-mint" />
        <Stat
          label="Waiting grows by"
          value={`${waiting}/hour`}
          tone={waiting ? "text-rose-600 dark:text-rose-400" : "text-mint"}
        />
        <Button
          type="button"
          size="sm"
          variant={counter ? "default" : "outline"}
          aria-pressed={counter}
          className="ml-auto h-7 px-2.5 text-xs"
          onClick={() => setCounter((c) => !c)}
        >
          {counter ? "Remove the payment counter limit" : "Add a bottleneck: one payment counter"}
        </Button>
      </div>

      <p className="px-4 pb-4 text-center text-sm text-foreground/90 sm:px-5">
        {waiting === 0
          ? "Capacity now meets the orders."
          : counter && limit < capacity
            ? "The payment counter caps the whole restaurant, however many kitchens it has."
            : "Orders arrive faster than the restaurant can serve them, so they wait."}{" "}
        <span className="text-muted-foreground">Numbers are illustrative.</span>
      </p>
    </section>
  );
}

function Kitchen({
  x,
  y,
  w,
  h,
  label,
  sub,
  big,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
  big?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        strokeWidth={2.2}
        className={cn("stroke-mint", big ? "fill-mint/15" : "fill-background")}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 - 2}
        textAnchor="middle"
        className="fill-foreground text-[14px] font-semibold"
      >
        {label}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2 + 16}
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[11px]"
      >
        {sub}
      </text>
    </g>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex items-baseline gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 font-mono">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <strong className={cn("text-[13px]", tone)}>{value}</strong>
    </span>
  );
}
