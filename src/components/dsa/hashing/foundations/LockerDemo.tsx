import { useState } from "react";

import { cn } from "@/lib/utils";

const LOCKERS = 10;

/** Students already holding a locker, so a new ID can be seen colliding with them. */
const STUDENTS = [101, 205, 309, 412, 422, 518, 23, 33];
const PRESETS = [412, 101, 205, 309, 518, 422, 33];

/**
 * The simplified hash table as ten lockers. The learner types a student ID, sees the `% 10`
 * calculation, and sees which other students are stored in the same locker.
 */
export function LockerDemo() {
  const [raw, setRaw] = useState("412");
  const parsed = Number(raw);
  const valid = raw.trim() !== "" && Number.isInteger(parsed) && parsed >= 0 && parsed <= 99999;
  const locker = valid ? parsed % LOCKERS : null;
  const sharing = valid ? STUDENTS.filter((id) => id % LOCKERS === locker && id !== parsed) : [];

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-4 py-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          Student ID
          <input
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            inputMode="numeric"
            aria-label="Student ID"
            className="h-8 w-24 rounded-md border border-hairline bg-background px-2 font-mono text-sm text-foreground outline-none focus:border-mint"
          />
        </label>
        {PRESETS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setRaw(String(id))}
            aria-pressed={parsed === id}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-xs font-semibold transition-colors",
              parsed === id
                ? "border-mint bg-mint/15 text-mint"
                : "border-hairline bg-background text-foreground/80 hover:border-mint/40",
            )}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 pt-5 sm:px-6">
        <p className="rounded-lg border border-hairline bg-background/70 px-3 py-2 text-center font-mono text-sm">
          {valid ? `${parsed} % 10 = ${locker}` : "Enter a whole number from 0 to 99999."}
        </p>
        <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
          {valid ? `Selected locker: ${locker}` : "No locker selected"}
        </p>

        <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
          {Array.from({ length: LOCKERS }, (_, slot) => {
            const stored = STUDENTS.filter((id) => id % LOCKERS === slot);
            const selected = slot === locker;
            const collides = selected && sharing.length > 0;
            return (
              <div key={slot} className="text-center">
                <div
                  className={cn(
                    "flex min-h-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-1 py-1 font-mono text-xs font-bold transition-colors duration-300",
                    selected && !collides && "border-mint bg-mint/15 text-mint",
                    collides && "border-rose bg-rose/10 text-rose",
                    !selected && "border-hairline bg-background text-foreground/75",
                    !selected && stored.length === 0 && "border-dashed text-muted-foreground/40",
                  )}
                >
                  {stored.length === 0 ? "empty" : stored.map((id) => <span key={id}>{id}</span>)}
                </div>
                <span className="mt-1 block font-mono text-[11px] text-muted-foreground">
                  locker {slot}
                </span>
              </div>
            );
          })}
        </div>

        <p
          key={`${parsed}-${sharing.length}`}
          className="lesson-supporting mt-4 min-h-[3rem] text-center text-foreground/90 duration-300 animate-in fade-in"
        >
          {!valid
            ? "Type a student ID to see its locker."
            : sharing.length > 0
              ? `Locker ${locker} is also chosen by ${sharing.join(" and ")}. Different keys compete for the same location, and that is a collision.`
              : `Locker ${locker} is chosen by no other student in this school, so there is no collision.`}
        </p>
      </div>
    </figure>
  );
}
