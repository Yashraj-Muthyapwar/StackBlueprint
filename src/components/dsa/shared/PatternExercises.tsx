import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ExerciseTone = "left" | "right" | "mid" | "accent";

type ExerciseBase = {
  title: string;
  prompt: string;
  /** Shown when every answer is right. */
  success: string;
  /** Shown after "N of M correct." when something is wrong. */
  hint: string;
};

/** Labelled answers, e.g. "Left index" and "Left value". */
export type FieldsExercise = ExerciseBase & {
  type: "fields";
  fields: { label: string; answer: string | number; tone?: ExerciseTone }[];
};

/** One answer per cell with index labels, e.g. the array after a swap. */
export type CellsExercise = ExerciseBase & {
  type: "cells";
  answers: (string | number)[];
  /** Draw `[` and `]` around the cells on wider screens. Defaults to true. */
  brackets?: boolean;
};

export type PatternExercise = FieldsExercise | CellsExercise;

type Status = "idle" | "correct" | "wrong";

const LABEL_TONE: Record<ExerciseTone, string> = {
  left: "text-mint",
  right: "text-blue-500 dark:text-blue-400",
  mid: "text-violet",
  accent: "text-amber-600 dark:text-amber-400",
};

/** Numbers compare by value; text compares trimmed and case-insensitively. */
function isMatch(raw: string, answer: string | number) {
  const value = raw.trim();
  if (value === "") return false;
  if (typeof answer === "number") return Number(value) === answer;
  return value.toLowerCase() === answer.trim().toLowerCase();
}

const fieldClass = (ok: boolean, checked: boolean) =>
  cn(
    "h-11 bg-background text-center font-mono text-base",
    checked && (ok ? "border-mint ring-1 ring-mint/40" : "border-rose ring-1 ring-rose/40"),
  );

/** The card shell shared by every exercise type. */
export function ExerciseCard({
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

function Exercise({ exercise, number }: { exercise: PatternExercise; number: number }) {
  const id = useId();
  const answers =
    exercise.type === "fields" ? exercise.fields.map((field) => field.answer) : exercise.answers;
  const [values, setValues] = useState<string[]>(() => answers.map(() => ""));
  const [status, setStatus] = useState<Status>("idle");
  const [checked, setChecked] = useState(false);
  const correct = answers.filter((answer, i) => isMatch(values[i], answer)).length;
  const numeric = answers.every((answer) => typeof answer === "number");

  const update = (index: number, value: string) => {
    setValues((current) => current.map((v, i) => (i === index ? value : v)));
    setStatus("idle");
    setChecked(false);
  };

  const card = (children: ReactNode) => (
    <ExerciseCard
      number={number}
      title={exercise.title}
      prompt={exercise.prompt}
      status={status}
      feedback={
        status === "correct"
          ? exercise.success
          : `${correct} of ${answers.length} correct. ${exercise.hint}`
      }
      onCheck={() => {
        setChecked(true);
        setStatus(correct === answers.length ? "correct" : "wrong");
      }}
      onReset={() => {
        setValues(answers.map(() => ""));
        setChecked(false);
        setStatus("idle");
      }}
    >
      {children}
    </ExerciseCard>
  );

  if (exercise.type === "fields") {
    return card(
      <div
        className="grid grid-cols-2 gap-4 sm:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": Math.min(4, exercise.fields.length) } as CSSProperties}
      >
        {exercise.fields.map((field, i) => (
          <div key={field.label} className="space-y-1.5">
            <Label
              htmlFor={`${id}-${i}`}
              className={cn("text-xs font-semibold", field.tone && LABEL_TONE[field.tone])}
            >
              {field.label}
            </Label>
            <Input
              id={`${id}-${i}`}
              inputMode={typeof field.answer === "number" ? "numeric" : "text"}
              value={values[i]}
              onChange={(event) => update(i, event.target.value)}
              className={fieldClass(isMatch(values[i], field.answer), checked)}
            />
          </div>
        ))}
      </div>,
    );
  }

  const brackets = exercise.brackets ?? true;
  return card(
    <div
      className="mx-auto flex items-end gap-1.5 font-mono text-lg text-muted-foreground sm:gap-2"
      style={{ maxWidth: `${exercise.answers.length * 5.5}rem` }}
    >
      {brackets ? <span className="hidden pb-2.5 sm:inline">[</span> : null}
      <div
        className="grid flex-1 gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${exercise.answers.length}, minmax(0, 1fr))` }}
      >
        {exercise.answers.map((answer, i) => (
          <div key={i} className="flex min-w-0 flex-col items-center gap-1">
            <Label htmlFor={`${id}-${i}`} className="font-mono text-xs text-muted-foreground">
              [{i}]
            </Label>
            <Input
              id={`${id}-${i}`}
              inputMode={numeric ? "numeric" : "text"}
              aria-label={`Value at index ${i}`}
              value={values[i]}
              onChange={(event) => update(i, event.target.value)}
              className={cn("w-full px-1", fieldClass(isMatch(values[i], answer), checked))}
            />
          </div>
        ))}
      </div>
      {brackets ? <span className="hidden pb-2.5 sm:inline">]</span> : null}
    </div>,
  );
}

/** Numbered "trace it first" exercise cards with Check answer and Reset. */
export function PatternExercises({ exercises }: { exercises: PatternExercise[] }) {
  return (
    <div className="space-y-5">
      {exercises.map((exercise, i) => (
        <Exercise key={exercise.title} exercise={exercise} number={i + 1} />
      ))}
    </div>
  );
}
