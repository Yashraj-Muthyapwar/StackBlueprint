import { useState } from "react";
import { ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";

type Answer = "yes" | "no";

const OUTCOME: Record<Answer, { title: string; text: string; tone: string }> = {
  yes: {
    title: "Seen before",
    text: "The value is already in the set, so we have encountered it before.",
    tone: "border-rose bg-rose/10 text-rose",
  },
  no: {
    title: "Add it and continue",
    text: "The value is new, so add it to the set and move to the next element.",
    tone: "border-mint bg-mint/10 text-mint",
  },
};

/** The decision every element goes through. Pick an answer to follow that path. */
export function SeenFlowchart() {
  const [answer, setAnswer] = useState<Answer>("no");

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="px-4 pb-5 pt-5 sm:px-6">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
          <div className="w-full rounded-xl border border-hairline bg-background px-4 py-2.5 text-center text-sm font-semibold">
            Take the next element
          </div>
          <ArrowDown className="size-4 text-muted-foreground" aria-hidden />
          <div className="w-full rounded-xl border-2 border-amber-500 bg-amber-500/10 px-4 py-3 text-center text-sm font-semibold text-amber-600 dark:text-amber-400">
            Is it already in the set?
          </div>
          <div className="grid w-full grid-cols-2 gap-3">
            {(["yes", "no"] as Answer[]).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setAnswer(choice)}
                aria-pressed={answer === choice}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                  answer === choice
                    ? "border-mint bg-mint/15 text-mint"
                    : "border-hairline bg-background text-foreground/80 hover:border-mint/40",
                )}
              >
                {choice === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
          <ArrowDown className="size-4 text-muted-foreground" aria-hidden />
          <div
            key={answer}
            className={cn(
              "w-full rounded-xl border-2 px-4 py-3 text-center duration-300 animate-in fade-in zoom-in-95",
              OUTCOME[answer].tone,
            )}
          >
            <p className="text-sm font-semibold">{OUTCOME[answer].title}</p>
            <p className="lesson-supporting mt-1 text-foreground/85">{OUTCOME[answer].text}</p>
          </div>
        </div>
      </div>
    </figure>
  );
}
