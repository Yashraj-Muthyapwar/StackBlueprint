import { motion } from "motion/react";

import { cn } from "@/lib/utils";

/*
 * Drawing pieces shared by the hand-drawn whiteboard animations (the URL shortener walkthrough and
 * the latency walkthroughs): the rough-edge filter and arrow heads, and the boxes with an icon.
 * Put them inside an <svg>; `uid` keeps the ids unique when several scenes share a page.
 *
 * Never apply the rough filter to a zero-height or zero-width line: its bounding box is empty and
 * the line disappears. Arrows stay unfiltered.
 */

export function WhiteboardDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <filter id={`${uid}-rough`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="2.6" />
      </filter>
      <marker
        id={`${uid}-arrow`}
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0 0 L10 5 L0 10 z" className="fill-muted-foreground" />
      </marker>
      <marker
        id={`${uid}-arrow-on`}
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0 0 L10 5 L0 10 z" className="fill-mint" />
      </marker>
    </defs>
  );
}

export function NodeBox({
  x,
  y,
  w,
  h,
  uid,
  tone,
  title,
  sub,
  icon,
  highlight,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  uid: string;
  tone: "mint" | "violet" | "muted";
  title: string;
  sub: string;
  icon: "user" | "server" | "db";
  highlight?: boolean;
}) {
  const stroke =
    tone === "mint"
      ? "stroke-mint"
      : tone === "violet"
        ? "stroke-violet"
        : "stroke-muted-foreground";
  const fill =
    tone === "mint" ? "fill-mint" : tone === "violet" ? "fill-violet" : "fill-foreground";
  const strokeOnly =
    tone === "mint" ? "stroke-mint" : tone === "violet" ? "stroke-violet" : "stroke-foreground";
  const cx = x + w / 2;
  return (
    <g>
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        strokeWidth={2.2}
        className={cn(
          stroke,
          highlight ? (tone === "violet" ? "fill-violet/10" : "fill-mint/10") : "fill-background",
        )}
        filter={`url(#${uid}-rough)`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <g
        className={strokeOnly}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "user" ? (
          <>
            <circle cx={cx} cy={y + 30} r={9} />
            <path d={`M${cx - 18} ${y + 62} Q${cx} ${y + 40} ${cx + 18} ${y + 62}`} />
          </>
        ) : null}
        {icon === "server" ? (
          <>
            <rect x={cx - 20} y={y + 16} width={40} height={16} rx={4} />
            <rect x={cx - 20} y={y + 36} width={40} height={16} rx={4} />
            <circle cx={cx - 11} cy={y + 24} r={1.6} className={fill} />
            <circle cx={cx - 11} cy={y + 44} r={1.6} className={fill} />
          </>
        ) : null}
        {icon === "db" ? (
          <>
            <ellipse cx={cx} cy={y + 20} rx={20} ry={7} />
            <path
              d={`M${cx - 20} ${y + 20} V${y + 46} C${cx - 20} ${y + 56} ${cx + 20} ${y + 56} ${cx + 20} ${y + 46} V${y + 20}`}
            />
            <path
              d={`M${cx - 20} ${y + 33} C${cx - 20} ${y + 43} ${cx + 20} ${y + 43} ${cx + 20} ${y + 33}`}
            />
          </>
        ) : null}
      </g>
      <text x={cx} y={y + 88} textAnchor="middle" className={cn("text-[15px] font-semibold", fill)}>
        {title}
      </text>
      <text x={cx} y={y + 106} textAnchor="middle" className="fill-muted-foreground text-[11.5px]">
        {sub}
      </text>
    </g>
  );
}
