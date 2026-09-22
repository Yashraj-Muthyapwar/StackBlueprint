import { useState } from "react";

const PHASES = [
  { name: "Requirements", focus: "Scope the product and quality bar", output: "Core features, constraints, assumptions" },
  { name: "Estimation", focus: "Turn scale into design pressure", output: "QPS, storage, bandwidth, skew" },
  { name: "API", focus: "Define the client boundary", output: "Few core operations and data shapes" },
  { name: "High-Level Design", focus: "Draw the smallest working path", output: "Baseline architecture and justified components" },
  { name: "Data Design", focus: "Optimize for reads and writes", output: "Access patterns, derived data, fan-out choice" },
  { name: "Deep Dive", focus: "Resolve the hardest bottleneck", output: "Mechanics, alternatives, trade-offs" },
  { name: "Wrap-Up", focus: "State limits and the next evolution", output: "Recap, failure modes, next bottleneck" },
] as const;

export function DeliveryFrameworkFlow() {
  const [active, setActive] = useState(0);
  const phase = PHASES[active];

  return (
    <figure className="overflow-hidden rounded-xl border border-hairline bg-card shadow-sm">
      <figcaption className="border-b border-hairline bg-surface/40 px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint">Delivery flow</p>
        <p className="mt-1 text-base font-semibold text-foreground">Each phase earns the next architectural decision.</p>
      </figcaption>
      <div className="p-5">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {PHASES.map((item, index) => (
            <button key={item.name} type="button" onClick={() => setActive(index)} className={`min-w-[106px] rounded-lg border px-3 py-2 text-left transition-colors ${active === index ? "border-mint/45 bg-mint/10" : "border-hairline bg-surface/40 hover:bg-surface-2"}`}>
              <span className={`font-mono text-[10px] ${active === index ? "text-mint" : "text-muted-foreground"}`}>{String(index + 1).padStart(2, "0")}</span>
              <span className="mt-1 block text-xs font-medium text-foreground">{item.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-2">
          <div className="bg-card p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">Focus</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{phase.focus}</p>
          </div>
          <div className="bg-card p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mint">Leave with</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{phase.output}</p>
          </div>
        </div>
      </div>
    </figure>
  );
}
