import { motion } from "motion/react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Prediction } from "@/lessons/types";

export function PredictCard({
  prediction,
  chosen,
  onChoose,
}: {
  prediction: Prediction;
  /** id of the option the learner picked, or undefined while the question is open */
  chosen?: string;
  onChoose: (id: string) => void;
}) {
  const answered = chosen !== undefined;
  const correct = answered && chosen === prediction.answer;
  const answerLabel = prediction.options.find((o) => o.id === prediction.answer)?.label ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-2xl border bg-surface px-5 py-4",
        !answered && "border-amber/50",
        answered && correct && "border-mint/50",
        answered && !correct && "border-rose/50",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-amber shadow-[0_0_10px_var(--amber)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            predict
          </span>
        </div>
        {!answered && (
          <span className="font-mono text-[10px] text-muted-foreground/70">
            press {prediction.options.map((_, i) => i + 1).join(" / ")}
          </span>
        )}
      </div>

      <p className="lesson-supporting text-balance text-foreground">{prediction.question}</p>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {prediction.options.map((opt, i) => {
          const isAnswer = opt.id === prediction.answer;
          const isChosen = opt.id === chosen;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => onChoose(opt.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition",
                !answered && "border-hairline bg-surface-2 hover:border-amber/60 hover:bg-amber/10",
                answered && isAnswer && "border-mint/60 bg-mint/10 text-foreground",
                answered && !isAnswer && isChosen && "border-rose/60 bg-rose/10 text-foreground",
                answered && !isAnswer && !isChosen && "border-hairline bg-surface-2 text-muted-foreground/60",
              )}
            >
              <span className="grid size-5 shrink-0 place-items-center rounded border border-hairline font-mono text-[10px] text-muted-foreground">
                {answered && isAnswer ? (
                  <Check className="size-3 text-mint" />
                ) : answered && isChosen ? (
                  <X className="size-3 text-rose" />
                ) : (
                  i + 1
                )}
              </span>
              <span className="font-mono text-xs">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("mt-3 font-mono text-xs", correct ? "text-mint" : "text-rose")}
        >
          {correct ? "Correct. Here's why it works:" : `Not quite. The answer was "${answerLabel}". Here's why:`}
        </motion.p>
      )}
    </motion.div>
  );
}
