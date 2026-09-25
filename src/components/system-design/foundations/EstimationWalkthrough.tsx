import { useMemo, useState } from "react";
import { Camera, MessageCircleMore, Newspaper, type LucideIcon } from "lucide-react";

type WorkloadKey = "chat" | "photos" | "feed";
type Tone = "mint" | "amber" | "violet";

type Workload = {
  id: WorkloadKey;
  label: string;
  title: string;
  icon: LucideIcon;
  tone: Tone;
  readsPerDay: number;
  writesPerDay: number;
  bytesPerWrite: number;
  peakMultiplier: number;
  assumptions: string[];
  decision: string;
};

const DAY_SECONDS = 86_400;

const WORKLOADS: Workload[] = [
  {
    id: "chat", label: "Chat", title: "Messaging service", icon: MessageCircleMore, tone: "mint",
    readsPerDay: 2_400_000_000, writesPerDay: 600_000_000, bytesPerWrite: 1_000, peakMultiplier: 4,
    assumptions: ["20M DAU", "30 messages per user per day", "120 message reads per user per day", "1 KB stored message"],
    decision: "Both paths matter. Durable queues and conversation partitioning protect delivery writes while history reads need predictable low latency.",
  },
  {
    id: "photos", label: "Photos", title: "Photo sharing app", icon: Camera, tone: "amber",
    readsPerDay: 500_000_000, writesPerDay: 5_000_000, bytesPerWrite: 3_000_000, peakMultiplier: 5,
    assumptions: ["5M uploads per day", "500M photo views per day", "3 MB compressed upload", "5× consumer peak"],
    decision: "Media bytes dominate. Store uploads in object storage and serve the read-heavy path through a CDN.",
  },
  {
    id: "feed", label: "Feed", title: "Social home feed", icon: Newspaper, tone: "violet",
    readsPerDay: 100_000_000, writesPerDay: 1_000_000, bytesPerWrite: 2_000, peakMultiplier: 4,
    assumptions: ["100M feed reads per day", "1M posts per day", "2 KB stored post metadata", "4× consumer peak"],
    decision: "The read path is dominant. Evaluate caching, replicas, or a materialized feed view before scaling the primary store.",
  },
];

const toneClasses: Record<Tone, { chip: string; active: string; label: string }> = {
  mint: { chip: "bg-mint text-background", active: "border-mint/45 bg-mint/10", label: "text-mint" },
  amber: { chip: "bg-amber text-background", active: "border-amber/45 bg-amber/10", label: "text-amber" },
  violet: { chip: "bg-violet text-background", active: "border-violet/45 bg-violet/10", label: "text-violet" },
};

function compact(value: number, digits = 1) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: digits }).format(value);
}

function storage(bytes: number) {
  if (bytes >= 1_000_000_000_000) return `${compact(bytes / 1_000_000_000_000)} TB`;
  if (bytes >= 1_000_000_000) return `${compact(bytes / 1_000_000_000)} GB`;
  if (bytes >= 1_000_000) return `${compact(bytes / 1_000_000)} MB`;
  return `${compact(bytes / 1_000)} KB`;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-lg border border-hairline bg-background p-3"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

export function EstimationWalkthrough() {
  const [selectedId, setSelectedId] = useState<WorkloadKey>("chat");
  const workload = WORKLOADS.find((item) => item.id === selectedId) ?? WORKLOADS[0];
  const tone = toneClasses[workload.tone];
  const result = useMemo(() => {
    const requests = workload.readsPerDay + workload.writesPerDay;
    const averageQps = requests / DAY_SECONDS;
    const readQps = workload.readsPerDay / DAY_SECONDS;
    const writeQps = workload.writesPerDay / DAY_SECONDS;
    return {
      averageQps,
      readQps,
      writeQps,
      peakQps: averageQps * workload.peakMultiplier,
      storagePerDay: workload.writesPerDay * workload.bytesPerWrite,
      ratio: workload.readsPerDay / workload.writesPerDay,
    };
  }, [workload]);

  return <section className="overflow-hidden rounded-xl border border-hairline bg-card shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline bg-surface/40 px-5 py-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint">Interview walkthrough</p><h2 className="mt-1 text-base font-semibold text-foreground">Calculate the signals that change the design</h2><p className="mt-1 text-sm text-muted-foreground">Use the three workloads to practice a clear first-pass estimate.</p></div><span className="rounded-md border border-hairline bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">1 day = 86,400 sec</span></div>
    <div className="p-5"><div className="grid gap-2 sm:grid-cols-3">{WORKLOADS.map((item) => { const Icon = item.icon; const colors = toneClasses[item.tone]; const selected = item.id === workload.id; return <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${selected ? colors.active : "border-hairline bg-background hover:bg-surface-2"}`}><span className={`grid size-8 place-items-center rounded-md ${selected ? colors.chip : "bg-surface-2 text-muted-foreground"}`}><Icon className="size-4" /></span><span><span className="block font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{item.label}</span><span className="block text-sm font-medium text-foreground">{item.title}</span></span></button>; })}</div>
      <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline lg:grid-cols-[0.9fr_1.35fr]"><div className="bg-card p-4"><p className={`font-mono text-[10px] uppercase tracking-[0.14em] ${tone.label}`}>Assumptions</p><ol className="mt-3 space-y-2">{workload.assumptions.map((assumption, index) => <li key={assumption} className="flex gap-2 text-sm text-foreground"><span className={`grid size-4 shrink-0 place-items-center rounded-full font-mono text-[8px] ${tone.chip}`}>{index + 1}</span>{assumption}</li>)}</ol><div className={`mt-4 rounded-lg border p-3 ${tone.active}`}><p className={`font-mono text-[9px] uppercase tracking-[0.1em] ${tone.label}`}>Design direction</p><p className="mt-1 text-xs leading-relaxed text-foreground">{workload.decision}</p></div></div>
        <div className="bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">Calculated result</p><p className="mt-1 text-sm font-medium text-foreground">Show the math, then explain the pressure.</p></div><span className={`rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.08em] ${tone.active} ${tone.label}`}>{workload.peakMultiplier}× peak</span></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2"><Metric label="Average QPS" value={compact(result.averageQps)} detail={`${compact(result.readQps)} read + ${compact(result.writeQps)} write QPS`} /><Metric label="Peak QPS" value={compact(result.peakQps)} detail={`${workload.peakMultiplier}× average QPS`} /><Metric label="Storage / day" value={storage(result.storagePerDay)} detail={`${compact(workload.writesPerDay)} writes × ${storage(workload.bytesPerWrite)}`} /><Metric label="Read : write" value={`${compact(result.ratio, 0)} : 1`} detail={`${compact(workload.readsPerDay)} reads / ${compact(workload.writesPerDay)} writes`} /></div>
          <div className="mt-4 rounded-lg border border-hairline bg-surface/40 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground"><span className={tone.label}>QPS</span> = (reads/day + writes/day) ÷ 86,400 <span className="px-1 text-foreground">•</span><span className={tone.label}> Storage/day</span> = writes/day × bytes/write</div>
        </div></div></div>
  </section>;
}
