import { useState } from "react";

import { cn } from "@/lib/utils";

const RECORDS: [number, string][] = [
  [101, "Alice"],
  [205, "Bob"],
  [309, "Charlie"],
  [412, "David"],
];

/**
 * The school picture. A set is an attendance register that only answers "is this ID present?".
 * A dictionary is the student records, where an ID retrieves the name that belongs to it.
 */
export function SetDictIntuition() {
  const [picked, setPicked] = useState(205);
  const name = RECORDS.find(([id]) => id === picked)?.[1];

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-hairline px-4 py-3">
        <span className="text-xs font-semibold text-muted-foreground">Ask about student ID</span>
        {RECORDS.map(([id]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPicked(id)}
            aria-pressed={id === picked}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-xs font-semibold transition-colors",
              id === picked
                ? "border-mint bg-mint/15 text-mint"
                : "border-hairline bg-background text-foreground/80 hover:border-mint/40",
            )}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="grid gap-px bg-hairline md:grid-cols-2">
        <div className="bg-slate-50 p-4 dark:bg-surface sm:p-5">
          <p className="text-sm font-semibold">Set: attendance register</p>
          <p className="lesson-supporting mt-1 text-foreground/80">
            Tells you whether a student is present. You care about membership, not details.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {RECORDS.map(([id]) => (
              <span
                key={id}
                className={cn(
                  "rounded-lg border-2 px-3 py-2 font-mono text-sm font-bold transition-colors duration-300",
                  id === picked
                    ? "border-mint bg-mint/15 text-mint"
                    : "border-hairline bg-background text-foreground/80",
                )}
              >
                {id}
              </span>
            ))}
          </div>
          <p className="mt-4 rounded-lg border border-hairline bg-background/70 px-3 py-2 font-mono text-xs">
            {picked} in student_ids → True
          </p>
        </div>

        <div className="bg-slate-50 p-4 dark:bg-surface sm:p-5">
          <p className="text-sm font-semibold">Dictionary: student records</p>
          <p className="lesson-supporting mt-1 text-foreground/80">
            Each ID is connected to a name. You use the ID to retrieve the related information.
          </p>
          <div className="mt-4 overflow-clip rounded-lg border border-hairline">
            {RECORDS.map(([id, student]) => (
              <div
                key={id}
                className={cn(
                  "flex items-center justify-between border-b border-hairline px-3 py-2 font-mono text-sm last:border-b-0 transition-colors duration-300",
                  id === picked ? "bg-mint/15 text-mint" : "bg-background text-foreground/80",
                )}
              >
                <span className="font-bold">{id}</span>
                <span>→</span>
                <span>{student}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-lg border border-hairline bg-background/70 px-3 py-2 font-mono text-xs">
            students[{picked}] → "{name}"
          </p>
        </div>
      </div>
    </figure>
  );
}
