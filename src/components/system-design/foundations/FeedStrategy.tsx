import { useState } from "react";
import { motion } from "motion/react";
import { Database, FilePlus2, List, Network, Users } from "lucide-react";

type Strategy = "push" | "pull" | "hybrid";

const STRATEGIES: Record<Strategy, { label: string; title: string; detail: string; writes: string; reads: string }> = {
  push: { label: "Push fan-out", title: "Materialize at write time", detail: "One new post fans out into many prepared follower timelines.", writes: "High", reads: "Low" },
  pull: { label: "Pull on read", title: "Assemble at read time", detail: "Store the post once, then fetch and merge it when a follower opens the feed.", writes: "Low", reads: "High" },
  hybrid: { label: "Hybrid for skew", title: "Push normal, pull hot accounts", detail: "Materialize normal accounts. Store high-follower posts once and merge them during feed reads.", writes: "Balanced", reads: "Balanced" },
};

function Node({ icon: Icon, label, detail, className, tone }: { icon: typeof Database; label: string; detail?: string; className: string; tone: "mint" | "amber" | "violet" }) {
  const colors = { mint: "border-mint/35 bg-mint/10 text-mint", amber: "border-amber/35 bg-amber/10 text-amber", violet: "border-violet/35 bg-violet/10 text-violet" };
  return <div className={`pointer-events-none absolute z-10 flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center ${className}`}><div className={`grid size-11 place-items-center rounded-xl border-2 bg-background shadow-sm ${colors[tone]}`}><Icon className="size-5" /></div><span className="mt-1 rounded border border-hairline bg-background px-2 py-0.5 text-center font-mono text-[8px] font-bold uppercase tracking-[0.08em] text-foreground shadow-sm">{label}</span>{detail ? <span className="mt-1 text-center font-mono text-[8px] text-muted-foreground">{detail}</span> : null}</div>;
}

function MessagePacket({ points, color, delay = 0 }: { points: [number, number][]; color: string; delay?: number }) {
  const x = points.map(([value]) => value);
  const y = points.map(([, value]) => value);
  const transition = { duration: 2.6, delay, ease: "linear" as const, repeat: Infinity, repeatDelay: 1.8 };
  return <>
    <motion.circle r="2.1" fill={color} initial={{ opacity: 0, cx: x[0], cy: y[0] }} animate={{ opacity: [0, 0.11, 0.11, 0], cx: x, cy: y }} transition={transition} />
    <motion.rect width="3.2" height="2.1" rx="0.6" fill="#ffffff" stroke={color} strokeWidth="0.34" initial={{ opacity: 0, x: x[0] - 1.6, y: y[0] - 1.05 }} animate={{ opacity: [0, 1, 1, 0], x: x.map((value) => value - 1.6), y: y.map((value) => value - 1.05) }} transition={transition} />
    <motion.circle r="0.38" fill={color} initial={{ opacity: 0, cx: x[0] - 0.72, cy: y[0] }} animate={{ opacity: [0, 1, 1, 0], cx: x.map((value) => value - 0.72), cy: y }} transition={transition} />
    <motion.line stroke={color} strokeWidth="0.28" strokeLinecap="round" initial={{ opacity: 0, x1: x[0] - 0.05, x2: x[0] + 0.9, y1: y[0] - 0.38, y2: y[0] - 0.38 }} animate={{ opacity: [0, 1, 1, 0], x1: x.map((value) => value - 0.05), x2: x.map((value) => value + 0.9), y1: y.map((value) => value - 0.38), y2: y.map((value) => value - 0.38) }} transition={transition} />
  </>;
}

export function FeedStrategy() {
  const [strategy, setStrategy] = useState<Strategy>("hybrid");
  const current = STRATEGIES[strategy];
  const showPush = strategy === "push" || strategy === "hybrid";
  const showPull = strategy === "pull" || strategy === "hybrid";

  return <figure className="overflow-hidden rounded-xl border border-hairline bg-card shadow-sm">
    <figcaption className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline bg-surface/40 px-5 py-4">
      <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint">Feed generation</p><p className="mt-1 text-base font-semibold text-foreground">Put the expensive work on the path that can afford it.</p></div>
      <div className="flex flex-wrap gap-1.5">{(Object.keys(STRATEGIES) as Strategy[]).map((item) => <button key={item} type="button" onClick={() => setStrategy(item)} className={`rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${strategy === item ? "border-mint/45 bg-mint/10 text-foreground" : "border-hairline bg-background text-muted-foreground hover:bg-surface-2"}`}>{STRATEGIES[item].label}</button>)}</div>
    </figcaption>

    <div className="relative h-[360px] min-h-[360px] overflow-hidden bg-[radial-gradient(circle_at_50%_48%,rgba(64,224,180,.08),transparent_44%)]">
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <motion.path d="M 12 28 H 33 C 42 28 43 17 55 17 M 33 28 C 42 28 43 34 55 34 M 33 28 C 42 28 43 51 55 51 M 55 17 H 82 V 72 M 55 34 H 82 V 72 M 55 51 H 82 V 72" className="fill-none stroke-mint" strokeWidth="0.5" strokeDasharray="1.4 1.4" initial={false} animate={{ opacity: showPush ? 1 : 0.1, strokeDashoffset: showPush ? [0, -12] : 0 }} transition={{ opacity: { duration: 0.25 }, strokeDashoffset: { duration: 2.4, ease: "linear", repeat: Infinity } }} />
        <motion.path d="M 12 78 H 38 V 78 H 58 M 58 78 H 82 V 72" className="fill-none stroke-violet" strokeWidth="0.5" strokeDasharray="1.4 1.4" initial={false} animate={{ opacity: showPull ? 1 : 0.1, strokeDashoffset: showPull ? [0, -12] : 0 }} transition={{ opacity: { duration: 0.25 }, strokeDashoffset: { duration: 2.4, ease: "linear", repeat: Infinity } }} />
        <motion.path d="M 12 28 V 78 H 58" className="fill-none stroke-amber" strokeWidth="0.4" strokeDasharray="1.4 1.4" initial={false} animate={{ opacity: showPull ? 0.7 : 0.12, strokeDashoffset: showPull ? [0, -12] : 0 }} transition={{ opacity: { duration: 0.25 }, strokeDashoffset: { duration: 2.4, ease: "linear", repeat: Infinity } }} />
        {showPush ? <><MessagePacket color="#14b8a6" points={[[12, 28], [33, 28], [43, 17], [55, 17], [82, 17], [82, 72]]} /><MessagePacket color="#14b8a6" delay={1.05} points={[[12, 28], [33, 28], [43, 51], [55, 51], [82, 51], [82, 72]]} /></> : null}
        {showPull ? <><MessagePacket color="#d97706" delay={0.35} points={[[12, 28], [12, 78], [58, 78]]} /><MessagePacket color="#8b5cf6" delay={1.25} points={[[12, 78], [38, 78], [58, 78], [82, 78], [82, 72]]} /></> : null}
      </svg>

      <div className="absolute left-4 top-3 z-10 flex flex-wrap gap-x-3 gap-y-1 rounded-md border border-hairline bg-background/90 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.07em] text-muted-foreground"><span><i className="mr-1 inline-block size-2 rounded-full bg-mint" />fan-out writes</span><span><i className="mr-1 inline-block size-2 rounded-full bg-violet" />feed merge</span><span><i className="mr-1 inline-block size-2 rounded-full bg-amber" />store once</span></div>
      <span className="absolute left-[16%] top-[12%] rounded bg-mint/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-mint">push path: materialize</span>
      <span className="absolute left-[16%] top-[62%] rounded bg-violet/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-violet">pull path: merge on read</span>
      <Node className="left-[12%] top-[28%]" icon={FilePlus2} label="New post" tone="amber" />
      <Node className="left-[33%] top-[28%]" icon={Users} label="Followers" detail="fan-out point" tone="mint" />
      <Node className="left-[55%] top-[17%]" icon={List} label="Timeline A" tone="mint" />
      <Node className="left-[55%] top-[34%]" icon={List} label="Timeline B" tone="mint" />
      <Node className="left-[55%] top-[51%]" icon={List} label="Timeline C" detail="materialized views" tone="mint" />
      <Node className="left-[12%] top-[78%]" icon={Users} label="Feed reader" tone="violet" />
      <Node className="left-[58%] top-[78%]" icon={Database} label="Post store" detail="hot accounts" tone="amber" />
      <Node className="left-[82%] top-[72%]" icon={Network} label="Feed merge" tone="violet" />
    </div>
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-hairline bg-surface/30 px-4 py-3 text-center"><div><p className="text-sm font-medium text-foreground">{current.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{current.detail}</p></div><div className="flex gap-2 font-mono text-[9px] uppercase tracking-[0.07em]"><span className="rounded border border-amber/30 bg-amber/10 px-2 py-1 text-amber">Write work: {current.writes}</span><span className="rounded border border-violet/30 bg-violet/10 px-2 py-1 text-violet">Read work: {current.reads}</span></div></div>
  </figure>;
}
