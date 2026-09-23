import { useState } from "react";
import { MessageCircleMore, ShieldCheck, Timer } from "lucide-react";

type RequirementKind = "functional" | "nonFunctional";

const REQUIREMENTS: Record<RequirementKind, { title: string; detail: string }[]> = {
  functional: [
    { title: "One-to-one messaging", detail: "Send and receive text messages between two users." },
    { title: "Group messaging", detail: "Create groups and deliver messages to group members." },
    { title: "Media sharing", detail: "Send images, video, documents, and voice messages." },
    { title: "Presence and receipts", detail: "Show delivery, read status, and optional presence signals." },
    { title: "Multi-device sync", detail: "Keep a user's message history available across linked devices." },
  ],
  nonFunctional: [
    { title: "Low delivery latency", detail: "Messages should reach online recipients quickly." },
    { title: "High availability", detail: "Core messaging remains available during failures and spikes." },
    { title: "Privacy and security", detail: "Protect message contents and account access." },
    { title: "Massive concurrency", detail: "Support many simultaneous connections and active chats." },
    { title: "Durable delivery", detail: "Retain undelivered messages until a recipient can receive them." },
  ],
};

const TOP_THREE = [
  { rank: "01", title: "One-to-one messaging", reason: "It defines the essential request path and delivery model." },
  { rank: "02", title: "Low delivery latency", reason: "It shapes connection management, routing, and queueing decisions." },
  { rank: "03", title: "High availability", reason: "It determines redundancy, failover, and how the system behaves during outages." },
];

export function WhatsAppRequirements() {
  const [kind, setKind] = useState<RequirementKind>("functional");
  const active = REQUIREMENTS[kind];

  return <section className="overflow-hidden rounded-xl border border-hairline bg-card shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline bg-surface/40 px-5 py-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint">Interview walkthrough</p><h2 className="mt-1 text-base font-semibold text-foreground">Requirements for WhatsApp</h2><p className="mt-1 text-sm text-muted-foreground">Start broad, then rank the requirements that will drive the first architecture.</p></div><MessageCircleMore className="size-6 text-mint" /></div>
    <div className="grid gap-px bg-hairline lg:grid-cols-[1.35fr_1fr]">
      <div className="bg-card p-5"><div className="flex gap-2">{(["functional", "nonFunctional"] as RequirementKind[]).map((item) => <button key={item} type="button" onClick={() => setKind(item)} className={`rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${kind === item ? "border-mint/45 bg-mint/10 text-foreground" : "border-hairline bg-background text-muted-foreground hover:bg-surface-2"}`}>{item === "functional" ? "Functional 5" : "Non-functional 5"}</button>)}</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">{active.map((item, index) => <div key={item.title} className="rounded-lg border border-hairline bg-surface/40 p-3"><span className="font-mono text-[10px] text-mint">{String(index + 1).padStart(2, "0")}</span><p className="mt-1 text-sm font-medium text-foreground">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p></div>)}</div>
      </div>
      <div className="bg-card p-5"><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber">Rank the top three</p><p className="mt-1 text-sm text-muted-foreground">These requirements create the earliest architectural pressure.</p><ol className="mt-4 space-y-3">{TOP_THREE.map((item, index) => <li key={item.rank} className="flex gap-3"><span className={`grid size-7 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold ${index === 0 ? "bg-mint text-background" : "bg-surface-2 text-muted-foreground"}`}>{item.rank}</span><div><p className="text-sm font-medium text-foreground">{item.title}</p><p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.reason}</p></div></li>)}</ol>
        <div className="mt-4 rounded-lg border border-violet/25 bg-violet/10 p-3 text-xs leading-relaxed text-foreground"><span className="inline-flex items-center gap-1 font-medium text-violet"><ShieldCheck className="size-3.5" /> Privacy</span> remains non-negotiable, but it is treated as a cross-cutting constraint across every ranked flow.</div>
        <div className="mt-2 rounded-lg border border-amber/25 bg-amber/10 p-3 text-xs leading-relaxed text-foreground"><span className="inline-flex items-center gap-1 font-medium text-amber"><Timer className="size-3.5" /> Interview move</span> State the ranking, then ask the interviewer whether to prioritize groups, media, multi-device sync, or end-to-end encryption next.</div>
      </div>
    </div>
  </section>;
}
