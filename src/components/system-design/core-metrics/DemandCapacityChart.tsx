import { motion, useReducedMotion } from "motion/react";

/*
 * Incoming demand grows while the capacity of one server stays fixed. Where the demand line rises
 * above the capacity line, the shaded area is work the server cannot sustain: requests queue, fail
 * or are rejected.
 */

const W = 800;
const H = 330;
const L = 96;
const R = 28;
const T = 24;
const B = 52;
const MAX = 3400;
const TICKS = [
  { v: 0, label: "0 RPS" },
  { v: 850, label: "850 RPS" },
  { v: 1700, label: "1.7K RPS" },
  { v: 2550, label: "2.6K RPS" },
  { v: 3400, label: "3.4K RPS" },
];
const POINTS = [
  { name: "Launch", demand: 200 },
  { name: "Growth", demand: 800 },
  { name: "Popular", demand: 1500 },
  { name: "Sale", demand: 3100 },
];
const CAPACITY = 1000;

const x = (i: number) => L + (i * (W - L - R)) / (POINTS.length - 1);
const y = (v: number) => T + (1 - v / MAX) * (H - T - B);

export function DemandCapacityChart() {
  const reduced = !!useReducedMotion();
  const demand = POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(p.demand)}`).join(" ");

  // Where the demand line crosses the capacity line (between Growth and Popular).
  const a = POINTS[1].demand;
  const b = POINTS[2].demand;
  const cross = 1 + (CAPACITY - a) / (b - a);
  const crossX = x(cross);
  const over = `M${crossX} ${y(CAPACITY)} L${x(2)} ${y(POINTS[2].demand)} L${x(3)} ${y(POINTS[3].demand)} L${x(3)} ${y(CAPACITY)} Z`;

  const draw = (delay: number) => ({
    initial: reduced ? false : { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: reduced ? { duration: 0 } : { duration: 1.2, delay, ease: "easeInOut" as const },
  });

  return (
    <section
      aria-label="Line chart: incoming demand grows from 200 to 3,100 requests per second while server capacity stays at 1,000 requests per second"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Workload increases while server capacity remains fixed
        </p>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <p className="text-base font-semibold text-foreground">
          Incoming demand vs server capacity
        </p>
        <p className="text-sm text-muted-foreground">Illustrative growth in requests per second.</p>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-hidden className="mt-2 h-auto w-full">
          {TICKS.map((tick) => (
            <g key={tick.v}>
              <line
                x1={L}
                x2={W - R}
                y1={y(tick.v)}
                y2={y(tick.v)}
                strokeDasharray="4 5"
                strokeWidth={1}
                className="stroke-hairline"
              />
              <text
                x={L - 12}
                y={y(tick.v) + 4}
                textAnchor="end"
                className="fill-muted-foreground font-mono text-[12px]"
              >
                {tick.label}
              </text>
            </g>
          ))}

          <path d={over} className="fill-rose-500/15" />
          <text
            x={(crossX + x(3)) / 2 + 24}
            y={y(CAPACITY) - 14}
            textAnchor="middle"
            className="fill-rose-600 font-mono text-[12px] font-semibold dark:fill-rose-400"
          >
            Demand above capacity
          </text>

          <motion.path
            d={`M${x(0)} ${y(CAPACITY)} L${x(3)} ${y(CAPACITY)}`}
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            className="stroke-mint"
            {...draw(0)}
          />
          <motion.path
            d={demand}
            fill="none"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-sky-500"
            {...draw(0.2)}
          />
          {POINTS.map((p, i) => (
            <g key={p.name}>
              <circle cx={x(i)} cy={y(CAPACITY)} r={5} className="fill-mint" />
              <circle cx={x(i)} cy={y(p.demand)} r={5} className="fill-sky-500" />
              <text
                x={x(i)}
                y={H - 22}
                textAnchor={i === 0 ? "start" : i === POINTS.length - 1 ? "end" : "middle"}
                dx={i === 0 ? -6 : i === POINTS.length - 1 ? 6 : 0}
                className="fill-foreground font-mono text-[12.5px] font-semibold"
              >
                {p.name}
              </text>
            </g>
          ))}
        </svg>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 pb-4 pt-1 text-sm text-foreground">
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-sky-500" /> Incoming demand
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-mint" /> Server capacity
          </li>
        </ul>
      </div>
    </section>
  );
}
