import { useState } from "react";
import { ArrowLeft, ArrowRight, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  { area: "Product scope", question: "Which Instagram experiences are in scope: feed, posting, Stories, Reels, search, comments, or direct messages?", why: "The product surface determines the core APIs, data model, and request paths." },
  { area: "Media", question: "Should users upload photos only, video, or both? What are the maximum media size and duration?", why: "Media type and size drive storage, upload, transcoding, and delivery choices." },
  { area: "Scale", question: "How many daily active users, posts per day, and feed reads per second should we plan for?", why: "These numbers determine capacity estimates and reveal where scale is needed." },
  { area: "Feed behavior", question: "Is the feed chronological, ranked, or configurable by the user?", why: "Ranking and fan-out behavior change how feeds are generated and stored." },
  { area: "Freshness", question: "How quickly must a new post appear to followers after publishing?", why: "A freshness target determines whether asynchronous fan-out is acceptable." },
  { area: "Performance", question: "What latency target applies when loading a home feed or uploading media?", why: "Latency goals help justify caches, CDNs, and asynchronous processing." },
  { area: "Privacy", question: "Do users need private accounts, follower approval, blocking, and audience controls?", why: "Privacy rules affect authorization checks and what content can be cached or delivered." },
  { area: "Data lifecycle", question: "How long must original media remain durable, and how are deletions handled?", why: "Retention and deletion rules define storage durability, cleanup, and recovery requirements." },
  { area: "Consistency", question: "Which interactions require strong consistency, such as privacy changes or post deletion?", why: "Not every update needs the same consistency guarantee, and that affects the architecture." },
  { area: "Availability", question: "What availability target and geographic coverage should the system support?", why: "Availability and geography shape replication, failover, and regional deployment decisions." },
] as const;

export function ClarificationPractice() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const active = QUESTIONS[activeIndex];

  return (
    <section className="rounded-xl border border-hairline bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint">Interview walkthrough</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Clarify “Design Instagram”</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">Before drawing components, align on the product and constraints. Step through the questions in the order an interviewer can follow.</p>
        </div>
        <span className="rounded-full border border-hairline bg-surface px-3 py-1 font-mono text-xs text-muted-foreground">Question {activeIndex + 1} of {QUESTIONS.length}</span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[160px_1fr]">
        <div className="grid grid-cols-5 gap-1.5 md:grid-cols-1">
          {QUESTIONS.map((item, index) => (
            <button key={item.question} type="button" onClick={() => { setActiveIndex(index); setShowAll(false); }} aria-label={`Show question ${index + 1}: ${item.area}`} className={`rounded-lg border px-2 py-2 text-left font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${activeIndex === index && !showAll ? "border-mint/45 bg-mint/10 text-foreground" : "border-hairline bg-surface/40 text-muted-foreground hover:bg-surface-2"}`}>
              <span className="mr-1 text-mint">{String(index + 1).padStart(2, "0")}</span><span className="hidden md:inline">{item.area}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-mint/25 bg-[radial-gradient(circle_at_top_right,rgba(64,224,180,.10),transparent_40%)] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint">{active.area}</p>
          <p className="mt-3 text-lg font-medium leading-relaxed text-foreground">{active.question}</p>
          <div className="mt-4 border-l-2 border-amber pl-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">Why ask this?</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{active.why}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setActiveIndex((current) => Math.max(0, current - 1))} disabled={activeIndex === 0}><ArrowLeft /> Previous</Button>
            <Button type="button" size="sm" onClick={() => setActiveIndex((current) => Math.min(QUESTIONS.length - 1, current + 1))} disabled={activeIndex === QUESTIONS.length - 1}>Next <ArrowRight /></Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowAll((current) => !current)}><ListChecks /> {showAll ? "Hide checklist" : "View all questions"}</Button>
          </div>
        </div>
      </div>

      {showAll ? (
        <div className="mt-5 grid gap-2 border-t border-hairline pt-4 sm:grid-cols-2">
          {QUESTIONS.map((item, index) => (
            <button key={item.question} type="button" onClick={() => { setActiveIndex(index); setShowAll(false); }} className="rounded-lg border border-hairline bg-surface/40 p-3 text-left transition-colors hover:bg-surface-2">
              <span className="font-mono text-[10px] text-mint">{String(index + 1).padStart(2, "0")} · {item.area}</span>
              <span className="mt-1 block text-sm leading-relaxed text-foreground">{item.question}</span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
