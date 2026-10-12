import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const NUMBERS = [3, 8, 12, 17, 21];
const LEFT = 0;
const RIGHT = NUMBERS.length - 1;
const SWAPPED = NUMBERS.slice();
[SWAPPED[LEFT], SWAPPED[RIGHT]] = [SWAPPED[RIGHT], SWAPPED[LEFT]];

const POINTER_FIELDS = [
  { key: "leftIndex", label: "Left index", answer: LEFT },
  { key: "leftValue", label: "Left value", answer: NUMBERS[LEFT] },
  { key: "rightIndex", label: "Right index", answer: RIGHT },
  { key: "rightValue", label: "Right value", answer: NUMBERS[RIGHT] },
] as const;

type Status = "idle" | "correct" | "wrong";

const isMatch = (raw: string, answer: number) => raw.trim() !== "" && Number(raw.trim()) === answer;

function ExerciseCard({
  number,
  title,
  prompt,
  status,
  feedback,
  children,
  onCheck,
  onReset,
}: {
  number: number;
  title: string;
  prompt: string;
  status: Status;
  feedback: string;
  children: ReactNode;
  onCheck: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-slate-50 p-5 shadow-sm dark:bg-surface">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">
        Exercise {number}
      </p>
      <h3 className="lesson-subsection-title mt-1 font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="lesson-supporting mt-1 text-muted-foreground">{prompt}</p>
      <div className="mt-5">{children}</div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={onCheck}>
          Check answer
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onReset}>
          <RotateCcw className="size-4" /> Reset
        </Button>
        {status !== "idle" ? (
          <motion.p
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              status === "correct" ? "text-mint" : "text-rose",
            )}
          >
            {status === "correct" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <XCircle className="size-4" />
            )}
            {feedback}
          </motion.p>
        ) : null}
      </div>
    </div>
  );
}

export function OppositeEndsPractice() {
  const [pointers, setPointers] = useState<Record<string, string>>({});
  const [pointerStatus, setPointerStatus] = useState<Status>("idle");
  const [pointerChecked, setPointerChecked] = useState(false);

  const [swapped, setSwapped] = useState<string[]>(NUMBERS.map(() => ""));
  const [swapStatus, setSwapStatus] = useState<Status>("idle");
  const [swapChecked, setSwapChecked] = useState(false);

  const pointerCorrectCount = POINTER_FIELDS.filter((f) =>
    isMatch(pointers[f.key] ?? "", f.answer),
  ).length;
  const swapCorrectCount = SWAPPED.filter((value, i) => isMatch(swapped[i], value)).length;

  const fieldClass = (ok: boolean, checked: boolean) =>
    cn(
      "h-11 bg-background text-center font-mono text-base",
      checked && (ok ? "border-mint ring-1 ring-mint/40" : "border-rose ring-1 ring-rose/40"),
    );

  return (
    <div className="space-y-5">
      <ExerciseCard
        number={1}
        title="Identify the pointers"
        prompt="Enter the starting index and the value stored at that index."
        status={pointerStatus}
        feedback={
          pointerStatus === "correct"
            ? "Both pointers are in the right place."
            : `${pointerCorrectCount} of 4 correct. Indices start at 0, and the last index is len(numbers) - 1.`
        }
        onCheck={() => {
          setPointerChecked(true);
          setPointerStatus(pointerCorrectCount === POINTER_FIELDS.length ? "correct" : "wrong");
        }}
        onReset={() => {
          setPointers({});
          setPointerChecked(false);
          setPointerStatus("idle");
        }}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {POINTER_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label
                htmlFor={`oe-practice-${field.key}`}
                className={cn(
                  "text-xs font-semibold",
                  field.key.startsWith("left") ? "text-mint" : "text-blue-500 dark:text-blue-400",
                )}
              >
                {field.label}
              </Label>
              <Input
                id={`oe-practice-${field.key}`}
                inputMode="numeric"
                value={pointers[field.key] ?? ""}
                onChange={(event) => {
                  setPointers((current) => ({ ...current, [field.key]: event.target.value }));
                  setPointerStatus("idle");
                  setPointerChecked(false);
                }}
                className={fieldClass(
                  isMatch(pointers[field.key] ?? "", field.answer),
                  pointerChecked,
                )}
              />
            </div>
          ))}
        </div>
      </ExerciseCard>

      <ExerciseCard
        number={2}
        title="After the first swap"
        prompt="What does the array look like after you swap the two elements?"
        status={swapStatus}
        feedback={
          swapStatus === "correct"
            ? "Correct. Only the two outer values changed places."
            : `${swapCorrectCount} of ${NUMBERS.length} positions correct. Only the values at left and right move.`
        }
        onCheck={() => {
          setSwapChecked(true);
          setSwapStatus(swapCorrectCount === NUMBERS.length ? "correct" : "wrong");
        }}
        onReset={() => {
          setSwapped(NUMBERS.map(() => ""));
          setSwapChecked(false);
          setSwapStatus("idle");
        }}
      >
        <div className="mx-auto flex max-w-md items-end gap-1.5 font-mono text-lg text-muted-foreground sm:gap-2">
          <span className="hidden pb-2.5 sm:inline">[</span>
          <div className="grid flex-1 grid-cols-5 gap-1.5 sm:gap-2">
            {SWAPPED.map((answer, index) => (
              <div key={index} className="flex min-w-0 flex-col items-center gap-1">
                <Label
                  htmlFor={`oe-practice-swap-${index}`}
                  className="font-mono text-xs text-muted-foreground"
                >
                  [{index}]
                </Label>
                <Input
                  id={`oe-practice-swap-${index}`}
                  inputMode="numeric"
                  aria-label={`Value at index ${index}`}
                  value={swapped[index]}
                  onChange={(event) => {
                    const next = swapped.slice();
                    next[index] = event.target.value;
                    setSwapped(next);
                    setSwapStatus("idle");
                    setSwapChecked(false);
                  }}
                  className={cn(
                    "w-full px-1",
                    fieldClass(isMatch(swapped[index], answer), swapChecked),
                  )}
                />
              </div>
            ))}
          </div>
          <span className="hidden pb-2.5 sm:inline">]</span>
        </div>
      </ExerciseCard>
    </div>
  );
}
