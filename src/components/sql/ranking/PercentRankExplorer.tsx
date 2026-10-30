import { useState } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";

const STUDENTS = [
  { name: "Alice", score: 50 },
  { name: "Bob", score: 70 },
  { name: "Charlie", score: 70 },
  { name: "David", score: 90 },
  { name: "Emma", score: 100 },
];
const N = STUDENTS.length;

function calc(name: string) {
  const s = STUDENTS.find((x) => x.name === name)!;
  const rank = 1 + STUDENTS.filter((o) => o.score < s.score).length;
  const upTo = STUDENTS.filter((o) => o.score <= s.score).length;
  return { s, rank, upTo, pr: (rank - 1) / (N - 1), cd: upTo / N, tied: STUDENTS.filter((o) => o.score === s.score).length > 1 };
}

function Explorer() {
  const [name, setName] = useState("Alice");
  const { s, rank, upTo, pr, cd, tied } = calc(name);

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <p className="lesson-supporting font-medium text-foreground">Select a student to examine both calculations</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Student">
        {STUDENTS.map((o) => (
          <button
            key={o.name}
            type="button"
            aria-pressed={name === o.name}
            onClick={() => setName(o.name)}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              name === o.name
                ? "border-mint/50 bg-mint/15 text-mint"
                : "border-hairline bg-surface text-muted-foreground hover:border-mint/40 hover:text-foreground"
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-hairline bg-surface-2/50 px-4 py-3">
        <div className="font-mono text-[13px] text-foreground">{s.name}</div>
        <div className="font-mono text-[12px] text-muted-foreground">Score {s.score}</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-amber/40 bg-amber/5 px-4 py-3">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-amber">PERCENT_RANK()</div>
          <div className="mt-2 font-mono text-[13px] text-foreground">
            ({rank} - 1) / ({N} - 1)
          </div>
          <div className="mt-1 font-mono text-[15px] font-semibold text-amber">{pr.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-mint/40 bg-mint/5 px-4 py-3">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mint">CUME_DIST()</div>
          <div className="mt-2 font-mono text-[13px] text-foreground">
            {upTo} / {N} rows
          </div>
          <div className="mt-1 font-mono text-[15px] font-semibold text-mint">{cd.toFixed(2)}</div>
        </div>
      </div>

      <p className="lesson-supporting text-foreground/85">
        {tied
          ? "The two students with score 70 are peers. Both receive the same relative rank and cumulative distribution."
          : "This student has no peers, so the current peer group is just this one row."}
      </p>
    </div>
  );
}

export function PercentRankExplorer({ caption }: { caption?: string }) {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
      {caption ? (
        <figcaption className="border-b border-hairline bg-surface/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
      <ClientOnly fallback={<div className="h-80 animate-pulse bg-surface-2/40" />}>
        <Explorer />
      </ClientOnly>
    </figure>
  );
}
