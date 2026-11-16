import { useState, type ReactNode } from "react";
import { ROW } from "@/components/sql/cheatsheet/WindowCheatsheet";

// Same layout as the SQL cheatsheets, with larger type so the page is easy to read.
type Tone = "violet" | "amber" | "mint" | "rose";
const TONE: Record<Tone, string> = {
  violet: "border-violet/40 bg-violet/10 text-violet",
  amber: "border-amber/40 bg-amber/10 text-amber",
  mint: "border-mint/40 bg-mint/10 text-mint",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-400",
};
function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`inline-flex shrink-0 items-center rounded-md border px-2.5 py-1 font-mono text-[13px] font-semibold ${TONE[tone]}`}>{children}</span>;
}
function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4 break-inside-avoid rounded-xl border border-hairline bg-surface/60 p-5 shadow-sm">
      <h3 className="mb-4 font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-mint">{title}</h3>
      {children}
    </section>
  );
}
const TEXT = "text-[16px] leading-snug text-foreground/90";
const MONO = "font-mono text-[14.5px] leading-snug text-foreground";

// Same one-page cheatsheet layout as the SQL modules: a legend strip, then
// two-column cards of tables, a small explorer, checklists, and common mistakes.

const LAYERS = ["Application", "Runtime / OS", "Physical infrastructure"] as const;
const MODELS = {
  IaaS: ["customer", "customer", "provider"],
  PaaS: ["customer", "provider", "provider"],
  SaaS: ["provider", "provider", "provider"],
} as const;

function ResponsibilityExplorer() {
  const [model, setModel] = useState<keyof typeof MODELS>("IaaS");
  const owners = MODELS[model];
  const mine = owners.filter((o) => o === "customer").length;
  return (
    <div>
      <div className="mb-3 inline-flex rounded-lg border border-hairline bg-surface p-0.5" role="group" aria-label="Service model">
        {(Object.keys(MODELS) as (keyof typeof MODELS)[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setModel(key)}
            aria-pressed={model === key}
            className={`rounded-md px-3 py-1.5 font-mono text-[13px] transition-colors ${
              model === key ? "bg-mint/15 font-semibold text-mint" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="mb-3 overflow-hidden rounded-lg border border-hairline">
        <table className="w-full text-left">
          <thead className="bg-surface-2 text-muted-foreground">
            <tr>
              {["Layer", "Managed by"].map((h) => (
                <th key={h} className="px-2.5 py-2 font-mono text-[12px] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[14px]">
            {LAYERS.map((layer, i) => (
              <tr key={layer} className={`border-t border-hairline/60 ${owners[i] === "customer" ? "bg-amber/10" : "bg-mint/10"}`}>
                <td className="px-2.5 py-2 text-foreground/90 text-[15px]">{layer}</td>
                <td className="px-2.5 py-2">
                  <Chip tone={owners[i] === "customer" ? "amber" : "mint"}>{owners[i] === "customer" ? "Customer" : "Provider"}</Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mb-3 text-[14.5px] text-muted-foreground" aria-live="polite">
        {model}: the customer manages <span className="font-mono font-semibold text-amber">{mine}</span> of 3 layers.
      </p>
      <ul className="space-y-1.5 text-[16px] leading-snug text-foreground/90">
        <li>Moving from IaaS to SaaS generally means less infrastructure management for the customer.</li>
        <li>Exact responsibilities vary by service. Customers always keep some security and data responsibilities.</li>
      </ul>
    </div>
  );
}

const ADVANTAGES = [
  "Trade fixed expenses for variable expenses",
  "Benefit from economies of scale",
  "Stop guessing capacity",
  "Increase speed and agility",
  "Stop spending money running and maintaining data centers",
  "Go global in minutes",
];

export default function ModuleCheatsheet() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-surface/40 px-4 py-3">
        <span className="font-mono text-[13px] uppercase tracking-[0.14em] text-muted-foreground">Colors</span>
        <Chip tone="amber">Customer</Chip>
        <Chip tone="mint">Provider</Chip>
        <Chip tone="violet">Model</Chip>
        <span className="ml-auto text-[14.5px] text-muted-foreground">
          Service models say who manages what. Deployment models say where it runs.
        </span>
      </div>

      <div className="gap-4 lg:columns-2">
        <Card title="Cloud in one line">
          <div>
            {[
              ["Cloud computing", "On-demand computing resources over the internet, without owning the physical infrastructure"],
              ["Traditional IT", "Owned or directly managed servers, networking equipment, and storage"],
              ["AWS", "A platform of on-demand services for computing, storage, networking, databases, security, and more"],
            ].map(([term, meaning]) => (
              <div key={term} className={ROW}>
                <span className={MONO}>{term}</span>
                <span className={TEXT}>{meaning}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Traditional IT vs cloud">
          <div className="overflow-hidden rounded-lg border border-hairline">
            <table className="w-full text-left">
              <thead className="bg-surface-2 text-muted-foreground">
                <tr>
                  {["Factor", "Traditional", "Cloud"].map((h) => (
                    <th key={h} className="px-2.5 py-2 font-mono text-[12px] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[14.5px]">
                {[
                  ["Upfront cost", "Usually high", "Usually low"],
                  ["Scaling", "Hardware acquisition", "On-demand"],
                  ["Hardware upkeep", "Customer", "Provider"],
                  ["Physical control", "Greater", "Limited"],
                ].map(([factor, trad, cloud]) => (
                  <tr key={factor} className="border-t border-hairline/60">
                    <td className="px-2.5 py-2 font-mono text-[14px] text-foreground">{factor}</td>
                    <td className="px-2.5 py-2 text-foreground/85">{trad}</td>
                    <td className="px-2.5 py-2 text-foreground/85">{cloud}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={`${TEXT} mt-3 text-muted-foreground`}>Cloud is not always cheaper. Stable, predictable workloads can cost less on owned infrastructure.</p>
        </Card>

        <Card title="Six advantages of AWS">
          <ol className="space-y-2 text-[16px] leading-snug text-foreground/90">
            {ADVANTAGES.map((a, i) => (
              <li key={a} className="flex items-start gap-2">
                <span className="mt-0 flex size-6 shrink-0 items-center justify-center rounded-full border border-mint/40 bg-mint/10 font-mono text-[12px] text-mint">
                  {i + 1}
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Who manages what">
          <ResponsibilityExplorer />
        </Card>

        <Card title="Pick the service model">
          <div>
            {[
              ["Full control of servers and the OS", "IaaS: Amazon EC2"],
              ["Deploy my code, skip server management", "PaaS: AWS Elastic Beanstalk"],
              ["Just use finished software", "SaaS: Google Workspace"],
            ].map(([need, use]) => (
              <div key={need} className={ROW}>
                <span className={TEXT}>{need}</span>
                <span className={MONO}>{use}</span>
              </div>
            ))}
          </div>
          <p className={`${TEXT} mt-3 text-muted-foreground`}>
            IaaS: more control, more work. PaaS: faster development, less control. SaaS: minimal setup, limited customization.
          </p>
        </Card>

        <Card title="Pick the deployment model">
          <div>
            {[
              ["Fast provisioning and flexible capacity", "Public cloud"],
              ["Dedicated resources and greater control", "Private cloud"],
              ["Combine existing systems with cloud services", "Hybrid cloud"],
            ].map(([need, use]) => (
              <div key={need} className={ROW}>
                <span className={TEXT}>{need}</span>
                <span className={MONO}>{use}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[14px]">
            <span className="text-muted-foreground">Limits</span>
            <Chip tone="violet">Public: less physical control</Chip>
            <Chip tone="violet">Private: more to manage</Chip>
            <Chip tone="violet">Hybrid: more complexity</Chip>
          </div>
        </Card>

        <Card title="Foundational AWS services">
          <div>
            {[
              ["Amazon EC2", "Run applications on virtual servers"],
              ["Amazon S3", "Store files and objects"],
              ["Amazon RDS", "Run managed relational databases"],
              ["Amazon VPC", "Create logically isolated cloud networks"],
              ["AWS IAM", "Manage identities and access permissions"],
              ["Amazon CloudWatch", "Monitor resources and applications"],
            ].map(([service, purpose]) => (
              <div key={service} className={ROW}>
                <span className={MONO}>{service}</span>
                <span className={TEXT}>{purpose}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[14px]">
            <span className="text-muted-foreground">Ways to use AWS</span>
            <Chip tone="mint">Console</Chip>
            <Chip tone="mint">CLI</Chip>
            <Chip tone="mint">APIs</Chip>
            <Chip tone="mint">Infrastructure as code</Chip>
          </div>
        </Card>

        <Card title="Check before you choose">
          <ol className="space-y-2 text-[16px] leading-snug text-foreground/90">
            {[
              "What does the workload need: control, speed, or finished software? Pick IaaS, PaaS, or SaaS.",
              "Where must it run: shared provider infrastructure, dedicated infrastructure, or both? Pick public, private, or hybrid.",
              "Which service fits each job? Compute, storage, database, network, access, monitoring.",
              "How will you watch cost? Usage-based pricing can grow without monitoring.",
              "What stays yours? Security, data, and architecture remain customer responsibilities.",
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
              ["The cloud has no servers.", "Servers exist. The provider owns and runs them."],
              ["Cloud is always cheaper.", "Stable, predictable workloads can cost less on owned infrastructure."],
              ["Service and deployment models are the same.", "Service models: who manages what. Deployment models: where it runs."],
              ["Public cloud customers can see each other's resources.", "Providers use isolation controls."],
              ["A private cloud is any server room.", "It needs resource pooling, automation, and self-service."],
              ["Fast deployment means a correct deployment.", "Cost, security, and architecture are still your job."],
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
