import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * The hospital emergency department analogy. Six patients need treatment. With one doctor the
 * department stops when the doctor is unavailable (single point of failure). With several doctors
 * the others keep working (redundancy), but the failed doctor's patients wait unless a planned
 * handover moves them (failover).
 */

const SETUPS = [
  { label: "One doctor", doctors: 1, handover: false },
  { label: "Backup doctors", doctors: 3, handover: false },
  { label: "Backup doctors and a handover plan", doctors: 3, handover: true },
] as const;
const PATIENTS = 6;

export function HospitalOnCall() {
  const [setup, setSetup] = useState(0);
  const [out, setOut] = useState(false);
  const { doctors, handover } = SETUPS[setup];

  const per = PATIENTS / doctors;
  const cards = Array.from({ length: doctors }, (_, i) => {
    const gone = out && i === 0;
    let treated = per;
    let waiting = 0;
    if (gone) {
      treated = 0;
      waiting = handover ? 0 : per;
    } else if (out && handover) {
      treated = per + per / (doctors - 1);
    }
    return { name: `Doctor ${i + 1}`, gone, treated, waiting };
  });
  const treated = cards.reduce((a, c) => a + c.treated, 0);
  const waiting = cards.reduce((a, c) => a + c.waiting, 0);

  const message = !out
    ? "Every patient is being treated."
    : doctors === 1
      ? "Only one doctor can provide emergency treatment, so treatment stops. This is a single point of failure."
      : !handover
        ? "The other doctors keep working, but Doctor 1's patients wait. A backup that cannot take over provides limited protection."
        : "Doctor 1's patients are transferred through the planned process, and the other doctors continue. This is failover.";

  return (
    <section
      aria-label="Hospital emergency department: make a doctor unavailable and see how one doctor, backup doctors and a handover plan differ"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <div
          role="group"
          aria-label="How the hospital is organised"
          className="flex flex-wrap gap-1.5"
        >
          {SETUPS.map((s, i) => (
            <Button
              key={s.label}
              type="button"
              size="sm"
              variant={setup === i ? "default" : "outline"}
              aria-pressed={setup === i}
              className="h-7 px-2.5 text-xs"
              onClick={() => {
                setSetup(i);
                setOut(false);
              }}
            >
              {s.label}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant={out ? "outline" : "default"}
          className="h-7 px-2.5 text-xs"
          onClick={() => setOut((o) => !o)}
        >
          {out ? "Doctor 1 returns" : "Doctor 1 becomes unavailable"}
        </Button>
      </div>

      <div className="grid gap-3 px-4 pt-4 sm:px-5 @min-[36rem]:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.name}
            className={cn(
              "rounded-xl border px-3 py-3 transition-colors duration-300",
              c.gone ? "border-rose-500/50 bg-rose-500/5" : "border-mint/50 bg-mint/5",
              doctors === 1 && "@min-[36rem]:col-span-3",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{c.name}</p>
              <p
                className={cn(
                  "font-mono text-[11px] font-semibold",
                  c.gone ? "text-rose-600 dark:text-rose-400" : "text-mint",
                )}
              >
                {c.gone ? "Unavailable" : "On duty"}
              </p>
            </div>
            <div className="mt-2 flex min-h-6 flex-wrap gap-1.5">
              {Array.from({ length: c.treated }, (_, i) => (
                <Dot key={`t${i}`} tone="ok" />
              ))}
              {Array.from({ length: c.waiting }, (_, i) => (
                <Dot key={`w${i}`} tone="wait" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-2 pt-3 sm:px-5">
        <Chip label="Being treated" value={`${treated} of ${PATIENTS}`} tone="text-mint" />
        <Chip
          label="Waiting"
          value={`${waiting}`}
          tone={waiting ? "text-rose-600 dark:text-rose-400" : "text-mint"}
        />
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Dot tone="ok" /> treated <Dot tone="wait" /> waiting
        </span>
      </div>
      <p className="px-4 pb-4 text-center text-sm text-foreground/90 sm:px-5">{message}</p>
    </section>
  );
}

function Dot({ tone }: { tone: "ok" | "wait" }) {
  return (
    <span
      className={cn(
        "size-5 rounded-full border transition-colors duration-300",
        tone === "ok" ? "border-mint/60 bg-mint/60" : "border-rose-500/60 bg-rose-500/60",
      )}
    />
  );
}

function Chip({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex items-baseline gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 font-mono">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <strong className={cn("text-[13px]", tone)}>{value}</strong>
    </span>
  );
}
