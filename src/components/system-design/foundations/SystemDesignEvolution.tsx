import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Check,
  Database,
  Layers3,
  MonitorSmartphone,
  Pause,
  Play,
  RefreshCw,
  Server,
  Workflow,
  Zap,
} from "lucide-react";

type Stage = 0 | 1 | 2;

const STAGES = [
  {
    label: "Baseline",
    title: "Keep one simple request path",
    constraint: "Modest traffic, synchronous user request",
    decision: "One application and one durable database are enough.",
  },
  {
    label: "Read pressure",
    title: "Add a cache for repeated reads",
    constraint: "Database reads are now the latency bottleneck",
    decision: "Serve repeat reads from memory and protect the database.",
  },
  {
    label: "Traffic bursts",
    title: "Move slow work off the request path",
    constraint: "Notifications and processing should not delay the response",
    decision: "Queue background work for a worker to process independently.",
  },
] as const;

const nodeTone = {
  client: "border-violet/35 bg-violet/10 text-violet",
  app: "border-mint/35 bg-mint/10 text-mint",
  data: "border-amber/35 bg-amber/10 text-amber",
  queue: "border-rose-500/35 bg-rose-500/10 text-rose-500",
};

function ArchitectureNode({
  icon: Icon,
  label,
  detail,
  tone,
  visible = true,
  pulse = false,
  className,
}: {
  icon: typeof Server;
  label: string;
  detail: string;
  tone: keyof typeof nodeTone;
  visible?: boolean;
  pulse?: boolean;
  className: string;
}) {
  if (!visible) return null;

  return (
    <div className={`pointer-events-none absolute z-20 flex w-[128px] -translate-x-1/2 -translate-y-1/2 flex-col items-center ${className}`}>
      <motion.div
        animate={pulse ? { boxShadow: ["0 0 0 rgba(64, 224, 180, 0)", "0 0 24px rgba(64, 224, 180, .38)", "0 0 0 rgba(64, 224, 180, 0)"] } : { boxShadow: "0 0 0 rgba(64, 224, 180, 0)" }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className={`grid size-14 place-items-center rounded-2xl border-2 bg-background shadow-sm ${nodeTone[tone]}`}
      >
        <Icon className="size-6" />
      </motion.div>
      <span className="mt-2 rounded border border-hairline bg-background/90 px-2 py-1 text-center font-mono text-[10px] font-bold uppercase tracking-[0.11em] text-foreground shadow-sm">
        {label}
      </span>
      <span className="mt-1 text-center font-mono text-[9px] text-muted-foreground">{detail}</span>
    </div>
  );
}

function FlowPacket({
  points,
  color,
  delay = 0,
  duration = 2.3,
  cycle = 6,
}: {
  points: [number, number][];
  color: string;
  delay?: number;
  duration?: number;
  cycle?: number;
}) {
  return (
    <motion.circle
      r="1.25"
      fill={color}
      initial={{ cx: points[0][0], cy: points[0][1], opacity: 0 }}
      animate={{
        cx: points.map(([x]) => x),
        cy: points.map(([, y]) => y),
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        delay,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: cycle - duration,
      }}
    />
  );
}

export function SystemDesignEvolution() {
  const [stage, setStage] = useState<Stage>(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => setStage((current) => ((current + 1) % STAGES.length) as Stage),
      5200,
    );
    return () => window.clearTimeout(timer);
  }, [playing, stage]);

  const selectStage = (next: Stage) => {
    setStage(next);
    setPlaying(false);
  };
  const showCache = stage >= 1;
  const showAsync = stage >= 2;

  return (
    <figure className="overflow-hidden rounded-xl border border-hairline bg-card shadow-sm">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface/50 px-4 py-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Architecture evolution</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">Evolve the baseline only when a measurable constraint requires it.</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setStage(0); setPlaying(false); }} aria-label="Reset to the baseline stage" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"><RefreshCw className="size-4" /></button>
          <button type="button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? "Pause automatic progression" : "Resume automatic progression"} className="rounded-md bg-foreground p-2 text-background transition-colors hover:bg-foreground/85">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}</button>
        </div>
      </figcaption>

      <div className="border-b border-hairline bg-surface/20 px-4 py-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          {STAGES.map((item, index) => (
            <button key={item.label} type="button" onClick={() => selectStage(index as Stage)} className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${stage === index ? "border-mint/45 bg-mint/10" : "border-transparent hover:bg-surface-2"}`}>
              <span className={`grid size-5 shrink-0 place-items-center rounded-full font-mono text-[10px] ${stage > index ? "bg-mint text-background" : stage === index ? "bg-mint/20 text-mint" : "bg-surface-2 text-muted-foreground"}`}>{stage > index ? <Check className="size-3" /> : index + 1}</span>
              <span className={`truncate font-mono text-[10px] uppercase tracking-[0.11em] ${stage === index ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full shrink-0 overflow-x-auto">
        <div className="relative h-[430px] min-h-[430px] max-h-[430px] min-w-[760px] overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(64,224,180,.10),transparent_42%)]">
          <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 16 50 H 36" className="fill-none stroke-border" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
            <motion.path initial={false} animate={{ opacity: showCache ? 0.14 : 1 }} d="M 44 50 H 82" className="fill-none stroke-border" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
            <motion.path initial={false} animate={{ opacity: showCache ? 1 : 0.12 }} d="M 40 46 V 24 H 66 M 74 24 H 82 V 46" className="fill-none stroke-amber" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
            <motion.path initial={false} animate={{ opacity: showAsync ? 1 : 0 }} d="M 40 54 V 82 H 82" className="fill-none stroke-rose-500" strokeWidth="0.5" strokeDasharray="1.5 1.5" />
            {stage === 0 ? <>
              <FlowPacket color="#40e0b4" points={[[12, 50], [40, 50], [86, 50]]} />
              <FlowPacket color="#8b5cf6" delay={2.5} points={[[86, 50], [40, 50], [12, 50]]} />
            </> : null}
            {stage === 1 ? <>
              <FlowPacket color="#40e0b4" points={[[12, 50], [40, 50], [40, 24], [70, 24]]} />
              <FlowPacket color="#f59e0b" delay={2.5} points={[[70, 24], [40, 24], [40, 50], [12, 50]]} />
            </> : null}
            {stage === 2 ? <>
              <FlowPacket color="#40e0b4" points={[[12, 50], [40, 50], [86, 50]]} />
              <FlowPacket color="#8b5cf6" delay={2.5} points={[[86, 50], [40, 50], [12, 50]]} />
              <FlowPacket color="#f43f5e" delay={1.15} duration={2.1} points={[[40, 50], [40, 82], [58, 82], [86, 82]]} />
            </> : null}
          </svg>

          <div className="absolute left-5 top-5 z-10 flex items-center gap-3 rounded-lg border border-hairline bg-background/85 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground shadow-sm">
            <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-mint" />request</span>
            <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-violet" />response</span>
            {showCache ? <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-amber" />cache path</span> : null}
            {showAsync ? <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-rose-500" />async job</span> : null}
          </div>

          <ArchitectureNode className="left-[12%] top-1/2" icon={MonitorSmartphone} label="Client" detail="browser or mobile app" tone="client" />
          <ArchitectureNode className="left-[40%] top-1/2" icon={Server} label="Application" detail="request path" tone="app" pulse />
          <ArchitectureNode className="left-[86%] top-1/2" icon={Database} label="Database" detail="durable data" tone="data" />
          <ArchitectureNode className="left-[70%] top-[24%]" icon={Zap} label="Cache" detail="repeated reads" tone="data" visible={showCache} />
          <ArchitectureNode className="left-[58%] top-[82%]" icon={Layers3} label="Queue" detail="durable backlog" tone="queue" visible={showAsync} />
          <ArchitectureNode className="left-[86%] top-[82%]" icon={Workflow} label="Worker" detail="background tasks" tone="queue" visible={showAsync} />
        </div>
      </div>

      <div className="grid min-h-[128px] gap-px border-t border-hairline bg-hairline md:h-[128px] md:min-h-[128px] md:max-h-[128px] md:grid-cols-[1fr_1.2fr]">
        <div className="h-full overflow-hidden bg-card px-3 py-2.5"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber">Constraint</p><p className="mt-1 text-sm font-medium leading-relaxed text-foreground">{STAGES[stage].title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{STAGES[stage].constraint}</p></div>
        <div className="h-full overflow-hidden bg-card px-3 py-2.5"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint">Design response</p><p className="mt-1 text-sm leading-relaxed text-foreground">{STAGES[stage].decision}</p></div>
      </div>
    </figure>
  );
}
