import { useState } from "react";
import { ROW } from "@/components/sql/cheatsheet/WindowCheatsheet";
import { Card, Chip, MONO, TEXT } from "../introduction-to-the-cloud/ModuleCheatsheet";

// Same one-page cheatsheet layout as Module 1: a legend strip, then two-column cards.

const BUILDING_BLOCKS = [
  { name: "Region", role: "Geographic area that hosts services", detail: "Contains multiple Availability Zones. Example: us-east-1 (N. Virginia)." },
  { name: "Availability Zone", role: "Isolated location inside a Region", detail: "One or more discrete data centers with redundant power, networking, and connectivity." },
  { name: "Edge Location", role: "Delivers content closer to users", detail: "Used by Amazon CloudFront to cache eligible content. Does not replace a Region or Multi-AZ." },
] as const;

function BuildingBlockExplorer() {
  const [i, setI] = useState(0);
  const block = BUILDING_BLOCKS[i];
  return (
    <div>
      <div className="mb-3 inline-flex rounded-lg border border-hairline bg-surface p-0.5" role="group" aria-label="Infrastructure building block">
        {BUILDING_BLOCKS.map((b, idx) => (
          <button
            key={b.name}
            type="button"
            onClick={() => setI(idx)}
            aria-pressed={i === idx}
            className={`rounded-md px-3 py-1.5 font-mono text-[13px] transition-colors ${
              i === idx ? "bg-mint/15 font-semibold text-mint" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-hairline bg-mint/10 p-3" aria-live="polite">
        <p className="font-mono text-[14.5px] font-semibold text-mint">{block.role}</p>
        <p className="mt-1 text-[16px] leading-snug text-foreground/90">{block.detail}</p>
      </div>
      <ul className="mt-3 space-y-1.5 text-[16px] leading-snug text-foreground/90">
        <li>A Region hosts services, an Availability Zone gives fault tolerance inside a Region, and an Edge Location brings content closer to users.</li>
      </ul>
    </div>
  );
}

export default function Module2Cheatsheet() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-surface/40 px-4 py-3">
        <span className="font-mono text-[13px] uppercase tracking-[0.14em] text-muted-foreground">Colors</span>
        <Chip tone="mint">Region</Chip>
        <Chip tone="violet">Availability Zone</Chip>
        <Chip tone="amber">Edge Location</Chip>
        <span className="ml-auto text-[14.5px] text-muted-foreground">Where it runs, how it survives failure, and how content reaches users.</span>
      </div>

      <div className="gap-4 lg:columns-2">
        <Card title="Global infrastructure in one line">
          <div>
            {[
              ["Region", "A separate geographic area that contains multiple Availability Zones"],
              ["Availability Zone", "One or more discrete data centers inside a Region"],
              ["Edge Location", "A site in the AWS global network that delivers content closer to users"],
            ].map(([term, meaning]) => (
              <div key={term} className={ROW}>
                <span className={MONO}>{term}</span>
                <span className={TEXT}>{meaning}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Three building blocks">
          <BuildingBlockExplorer />
        </Card>

        <Card title="Choosing a Region">
          <div>
            {[
              ["Compliance and data residency", "Where the law or policy says data must stay"],
              ["Latency", "How close the Region is to your users"],
              ["Service availability", "Whether the services you need are offered there"],
              ["Pricing", "Costs can differ between Regions"],
            ].map(([factor, meaning]) => (
              <div key={factor} className={ROW}>
                <span className={MONO}>{factor}</span>
                <span className={TEXT}>{meaning}</span>
              </div>
            ))}
          </div>
          <p className={`${TEXT} mt-3 text-muted-foreground`}>Compliance can rule Regions out before the other factors are compared.</p>
        </Card>

        <Card title="High availability vs fault tolerance">
          <div className="overflow-hidden rounded-lg border border-hairline">
            <table className="w-full text-left">
              <thead className="bg-surface-2 text-muted-foreground">
                <tr>
                  {["Concept", "Focus"].map((h) => (
                    <th key={h} className="px-2.5 py-2 font-mono text-[12px] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14.5px]">
                {[
                  ["High availability", "Keep downtime low"],
                  ["Fault tolerance", "Continue service despite failures, potentially without interruption"],
                  ["Redundancy", "Extra components so one failure is not fatal"],
                  ["Failover", "Moving work to a healthy component when one fails"],
                ].map(([concept, focus]) => (
                  <tr key={concept} className="border-t border-hairline/60">
                    <td className="px-2.5 py-2 font-mono text-[14px] text-foreground">{concept}</td>
                    <td className="px-2.5 py-2 text-foreground/85">{focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Building a highly available app">
          <ol className="space-y-2 text-[16px] leading-snug text-foreground/90">
            {[
              "Run EC2 instances in multiple Availability Zones.",
              "Put a load balancer in front to distribute traffic.",
              "Use health checks so traffic skips unhealthy instances.",
              "Keep enough healthy capacity to carry the load after a failure.",
              "Use Auto Scaling to replace failed instances.",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-0 flex size-6 shrink-0 items-center justify-center rounded-full border border-mint/40 bg-mint/10 font-mono text-[12px] text-mint">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Pick the design">
          <div className="overflow-hidden rounded-lg border border-hairline">
            <table className="w-full text-left">
              <thead className="bg-surface-2 text-muted-foreground">
                <tr>
                  {["Design", "Behavior"].map((h) => (
                    <th key={h} className="px-2.5 py-2 font-mono text-[12px] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14.5px]">
                {[
                  ["Single instance", "One failure stops the app"],
                  ["Multi-AZ", "Survives the loss of one Availability Zone"],
                  ["Active-active", "All copies serve traffic, so failure causes little or no pause"],
                  ["Active-passive", "A standby takes over, so failover can mean brief downtime"],
                ].map(([design, behavior]) => (
                  <tr key={design} className="border-t border-hairline/60">
                    <td className="px-2.5 py-2 font-mono text-[14px] text-foreground">{design}</td>
                    <td className="px-2.5 py-2 text-foreground/85">{behavior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Edge Locations at a glance">
          <div>
            {[
              ["Amazon CloudFront", "AWS Content Delivery Network that commonly uses Edge Locations"],
              ["Cache hit", "Content is served straight from the Edge Location"],
              ["Cache miss", "CloudFront fetches it from another cache layer or the origin"],
              ["Result", "Lower latency for users far from the Region"],
            ].map(([term, meaning]) => (
              <div key={term} className={ROW}>
                <span className={MONO}>{term}</span>
                <span className={TEXT}>{meaning}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Check before you design">
          <ol className="space-y-2 text-[16px] leading-snug text-foreground/90">
            {[
              "Which Region fits compliance, latency, service availability, and price?",
              "Are the instances spread across at least two Availability Zones?",
              "What detects failure and reroutes traffic?",
              "Can the remaining healthy capacity carry the load?",
              "Do users far from the Region need content cached at the edge?",
            ].map((q, i) => (
              <li key={q} className="flex items-start gap-2">
                <span className="mt-0 flex size-6 shrink-0 items-center justify-center rounded-full border border-mint/40 bg-mint/10 font-mono text-[12px] text-mint">
                  {i + 1}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Common mistakes">
          <div>
            {[
              ["Two instances make an app highly available.", "Redundancy alone is not enough. Use separate Availability Zones, a load balancer, health checks, and enough capacity."],
              ["Multi-AZ protects against a Region failure.", "It does not do so automatically."],
              ["Edge Locations replace Multi-AZ.", "They deliver content closer to users and do not replicate your whole application."],
              ["Regions, Availability Zones, and Edge Locations are the same.", "A Region contains Availability Zones. Edge Locations are separate delivery sites."],
              ["Always pick the cheapest Region.", "Compliance, latency, and service availability come into the choice too."],
            ].map(([wrong, right]) => (
              <div key={wrong} className={ROW}>
                <span className="flex items-start gap-1.5 text-[16px] leading-snug text-foreground/70">
                  <span className="mt-0.5 font-mono text-[13px] font-bold text-rose-400">NO</span>
                  <span>{wrong}</span>
                </span>
                <span className="flex items-start gap-1.5 text-[16px] leading-snug text-foreground/90">
                  <span className="mt-0.5 font-mono text-[13px] font-bold text-mint">YES</span>
                  <span>{right}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
