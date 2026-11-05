import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { WhiteboardDefs } from "@/components/system-design/whiteboard";
import { cn } from "@/lib/utils";

/*
 * One hand-drawn architecture scene for the Availability lesson, driven entirely by data: boxes
 * with a state (healthy, failed, standby, new, promoted) and arrows that are solid, dashed (a
 * standby or replication path) or off (a failed path). The walkthroughs and the failure-injection
 * cards only describe what to draw; this component draws it.
 */

export type ArchTone = "neutral" | "mint" | "violet" | "sky" | "amber";
export type ArchState = "ok" | "failed" | "standby" | "new" | "promoted";
type Side = "l" | "r" | "t" | "b";

export type ArchNode = {
  id: string;
  label: string;
  /** A second, smaller line, for example "Healthy" or "Standby". */
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: ArchTone;
  state?: ArchState;
  /** A small tag above the box, for example "SPOF". */
  badge?: string;
};

export type ArchEdge = {
  from: string;
  to: string;
  fromSide?: Side;
  toSide?: Side;
  style?: "solid" | "dashed" | "off";
  /** A packet travels along the arrow. */
  flow?: boolean;
  /** The packet is a failing request. */
  bad?: boolean;
  label?: string;
};

export type ArchSceneData = { nodes: ArchNode[]; edges: ArchEdge[] };

const TONE_STROKE: Record<ArchTone, string> = {
  neutral: "stroke-muted-foreground",
  mint: "stroke-mint",
  violet: "stroke-violet",
  sky: "stroke-sky-500",
  amber: "stroke-amber",
};
const TONE_FILL: Record<ArchTone, string> = {
  neutral: "fill-background",
  mint: "fill-mint/10",
  violet: "fill-violet/10",
  sky: "fill-sky-500/10",
  amber: "fill-amber/10",
};

const anchor = (n: ArchNode, side: Side): [number, number] =>
  side === "l"
    ? [n.x, n.y + n.h / 2]
    : side === "r"
      ? [n.x + n.w, n.y + n.h / 2]
      : side === "t"
        ? [n.x + n.w / 2, n.y]
        : [n.x + n.w / 2, n.y + n.h];

const autoSides = (a: ArchNode, b: ArchNode): [Side, Side] => {
  const dx = b.x + b.w / 2 - (a.x + a.w / 2);
  const dy = b.y + b.h / 2 - (a.y + a.h / 2);
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? ["r", "l"] : ["l", "r"];
  return dy >= 0 ? ["b", "t"] : ["t", "b"];
};

export function ArchScene({
  scene,
  ariaLabel,
  className,
}: {
  scene: ArchSceneData;
  ariaLabel: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const reduced = !!useReducedMotion();
  const byId = new Map(scene.nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox="0 0 800 240"
      role="img"
      aria-label={ariaLabel}
      className={cn("h-full w-full", className)}
    >
      <WhiteboardDefs uid={uid} />

      {scene.edges.map((e, i) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b) return null;
        const [sa, sb] = autoSides(a, b);
        const p = anchor(a, e.fromSide ?? sa);
        const q = anchor(b, e.toSide ?? sb);
        const off = e.style === "off";
        const dashed = e.style === "dashed";
        return (
          <g key={`${e.from}-${e.to}-${i}`}>
            <path
              d={`M${p[0]} ${p[1]} L${q[0]} ${q[1]}`}
              fill="none"
              strokeWidth={off ? 1.8 : 2.4}
              strokeLinecap="round"
              strokeDasharray={dashed ? "7 6" : off ? "2 7" : undefined}
              className={cn(
                off
                  ? "stroke-rose-500/50"
                  : dashed
                    ? "stroke-muted-foreground/70"
                    : "stroke-foreground/70",
              )}
              markerEnd={off ? undefined : `url(#${uid}-arrow)`}
            />
            {e.label ? (
              <text
                x={(p[0] + q[0]) / 2}
                y={(p[1] + q[1]) / 2 - 8}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[10.5px]"
              >
                {e.label}
              </text>
            ) : null}
            {e.flow && !off ? (
              <Packet from={p} to={q} bad={e.bad} reduced={reduced} index={i} />
            ) : null}
          </g>
        );
      })}

      {scene.nodes.map((n) => {
        const state = n.state ?? "ok";
        const tone = n.tone ?? "neutral";
        const failed = state === "failed";
        const standby = state === "standby";
        const live = state === "new" || state === "promoted";
        const cx = n.x + n.w / 2;
        return (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={12}
              strokeWidth={failed ? 2.6 : 2.2}
              strokeDasharray={standby ? "6 5" : undefined}
              filter={`url(#${uid}-rough)`}
              className={cn(
                "transition-colors duration-300",
                failed
                  ? "fill-rose-500/10 stroke-rose-500"
                  : standby
                    ? "fill-background stroke-muted-foreground/70"
                    : cn(TONE_STROKE[tone], live ? "fill-mint/25" : TONE_FILL[tone]),
              )}
            />
            <text
              x={cx}
              y={n.y + n.h / 2 + (n.sub ? -2 : 5)}
              textAnchor="middle"
              className={cn(
                "text-[13.5px] font-semibold",
                failed ? "fill-rose-600 dark:fill-rose-400" : "fill-foreground",
              )}
            >
              {n.label}
            </text>
            {n.sub ? (
              <text
                x={cx}
                y={n.y + n.h / 2 + 15}
                textAnchor="middle"
                className={cn(
                  "font-mono text-[11px] font-semibold",
                  failed
                    ? "fill-rose-600 dark:fill-rose-400"
                    : live || state === "ok"
                      ? "fill-mint"
                      : "fill-muted-foreground",
                )}
              >
                {n.sub}
              </text>
            ) : null}
            {failed ? (
              <g className="stroke-rose-500" strokeWidth={2.4} strokeLinecap="round">
                <line x1={n.x + n.w - 18} y1={n.y + 6} x2={n.x + n.w - 8} y2={n.y + 16} />
                <line x1={n.x + n.w - 8} y1={n.y + 6} x2={n.x + n.w - 18} y2={n.y + 16} />
              </g>
            ) : null}
            {n.badge ? <Badge x={n.x} y={n.y - 8} text={n.badge} /> : null}
          </g>
        );
      })}
    </svg>
  );
}

function Badge({ x, y, text }: { x: number; y: number; text: string }): ReactNode {
  const w = text.length * 6.6 + 14;
  return (
    <g>
      <rect
        x={x}
        y={y - 14}
        width={w}
        height={17}
        rx={8.5}
        className="fill-amber/25 stroke-amber"
      />
      <text
        x={x + w / 2}
        y={y - 2}
        textAnchor="middle"
        className="fill-foreground font-mono text-[10px] font-semibold"
      >
        {text}
      </text>
    </g>
  );
}

function Packet({
  from,
  to,
  bad,
  reduced,
  index,
}: {
  from: [number, number];
  to: [number, number];
  bad?: boolean;
  reduced: boolean;
  index: number;
}) {
  const cls = bad ? "fill-rose-500" : "fill-mint";
  if (reduced) {
    return <circle cx={(from[0] + to[0]) / 2} cy={(from[1] + to[1]) / 2} r={4.5} className={cls} />;
  }
  return (
    <motion.circle
      r={4.5}
      className={cls}
      initial={{ cx: from[0], cy: from[1] }}
      animate={{ cx: [from[0], to[0]], cy: [from[1], to[1]] }}
      transition={{ duration: 1.3, repeat: Infinity, ease: "linear", delay: (index % 3) * 0.3 }}
    />
  );
}
