import { useMemo, useState } from "react";
import { Activity, CheckCircle2, Database, Gauge, Server, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";

type ScenarioKey = "reads" | "compute" | "writes";

type Scenario = {
  id: ScenarioKey;
  label: string;
  signal: string;
  bottleneck: string;
  response: string;
  verification: string;
  pressure: number;
  icon: LucideIcon;
};

const SCENARIOS: Scenario[] = [
  {
    id: "reads",
    label: "Read pressure",
    signal: "p95 rises while database CPU reaches 92%.",
    bottleneck: "Repeated reads overload the primary database.",
    response: "Add a cache, then read replicas if the read set remains large.",
    verification: "Cache hit rate rises; database CPU and p95 fall.",
    pressure: 92,
    icon: Database,
  },
  {
    id: "compute",
    label: "Traffic burst",
    signal: "Application CPU saturates during a short peak.",
    bottleneck: "The stateless application tier cannot serve enough concurrent requests.",
    response: "Add application instances behind a load balancer.",
    verification: "Per-instance utilization returns to the target range.",
    pressure: 84,
    icon: Server,
  },
  {
    id: "writes",
    label: "Write growth",
    signal: "Write latency and storage growth exceed one primary node.",
    bottleneck: "The write path and dataset no longer fit one partition.",
    response: "Buffer non-urgent work, then partition data by an access key.",
    verification: "Queue depth stays bounded and partitions remain balanced.",
    pressure: 96,
    icon: Activity,
  },
];

const STEPS = [
  { label: "Measure", field: "signal", icon: Gauge, tone: "text-amber" },
  { label: "Find bottleneck", field: "bottleneck", icon: Activity, tone: "text-violet" },
  { label: "Scale the limit", field: "response", icon: Server, tone: "text-mint" },
  { label: "Verify", field: "verification", icon: CheckCircle2, tone: "text-mint" },
] as const;

export function ScalabilityLoop() {
  const [selectedId, setSelectedId] = useState<ScenarioKey>("reads");
  const scenario = useMemo(
    () => SCENARIOS.find((item) => item.id === selectedId) ?? SCENARIOS[0],
    [selectedId],
  );

  return (
    <section className="overflow-hidden rounded-xl border border-hairline bg-card shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline bg-surface/40 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint">Scalability loop</p>
          <h2 className="mt-1 text-base font-semibold text-foreground">Scale the component that is actually limiting the system.</h2>
          <p className="mt-1 text-sm text-muted-foreground">A stable feedback loop, not a collection of default components.</p>
        </div>
        <div className="w-40 rounded-lg border border-hairline bg-background p-2">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground"><span>Pressure</span><span>{scenario.pressure}%</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"><motion.div className="h-full rounded-full bg-amber" animate={{ width: `${scenario.pressure}%` }} transition={{ duration: 0.35, ease: "easeOut" }} /></div>
        </div>
      </header>
      <div className="p-5">
        <div className="grid gap-2 sm:grid-cols-3">
          {SCENARIOS.map((item) => {
            const Icon = item.icon;
            const selected = item.id === scenario.id;
            return <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${selected ? "border-mint/45 bg-mint/10" : "border-hairline bg-background hover:bg-surface-2"}`}>
              <span className={`grid size-8 place-items-center rounded-md ${selected ? "bg-mint text-background" : "bg-surface-2 text-muted-foreground"}`}><Icon className="size-4" /></span>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </button>;
          })}
        </div>
        <div className="mt-5 grid gap-2 md:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const copy = scenario[step.field];
            return <article key={step.label} className="relative rounded-lg border border-hairline bg-background p-4">
              {index < STEPS.length - 1 ? <span aria-hidden="true" className="absolute -right-2 top-8 hidden size-4 rotate-45 border-r border-t border-hairline bg-background md:block" /> : null}
              <div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-surface-2 font-mono text-[10px] text-muted-foreground">{index + 1}</span><Icon className={`size-4 ${step.tone}`} /></div>
              <p className={`mt-4 font-mono text-[10px] uppercase tracking-[0.12em] ${step.tone}`}>{step.label}</p>
              <motion.p key={`${scenario.id}-${step.field}`} initial={{ opacity: 0.45 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="mt-2 text-sm leading-relaxed text-foreground">{copy}</motion.p>
            </article>;
          })}
        </div>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Measure → bottleneck → targeted change → measure again</p>
      </div>
    </section>
  );
}
