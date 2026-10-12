import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  ListOrdered,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  PROBLEMS,
  type FlowTone,
  type Problem,
  type ProblemId,
  type Token,
  type Tone,
} from "./trace";
import { setOppositeEndsProblem } from "./problem-store";

const TONE_CLASS: Record<Tone, string> = {
  left: "text-mint font-semibold",
  right: "text-blue-500 dark:text-blue-400 font-semibold",
  value: "text-amber-600 dark:text-amber-400 font-semibold",
  result: "text-violet font-semibold",
  plain: "",
};

const FLOW_STROKE: Record<FlowTone, string> = {
  amber: "stroke-amber-500",
  violet: "stroke-violet",
  mint: "stroke-mint",
  rose: "stroke-rose",
};

const FLOW_CHIP: Record<FlowTone | "muted", string> = {
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  violet: "border-violet/40 bg-violet/10 text-violet",
  mint: "border-mint/40 bg-mint/10 text-mint",
  rose: "border-rose/40 bg-rose/10 text-rose",
  muted: "border-transparent text-muted-foreground",
};

const PY_KEYWORDS = new Set(["def", "while", "return", "if", "else", "not", "None"]);
const PY_BUILTINS = new Set(["len", "max"]);
const ALGO_KEYWORDS = new Set([
  "while",
  "return",
  "if",
  "otherwise",
  "add",
  "swap",
  "move",
  "set",
  "put",
  "step",
]);

function highlightPython(line: string): ReactNode[] {
  return line.split(/(\b[A-Za-z_]+\b|\d+)/g).map((part, i) => {
    let className = "";
    if (PY_KEYWORDS.has(part)) className = "font-semibold text-purple-600 dark:text-purple-400";
    else if (["reverse_array", "two_sum", "trap"].includes(part))
      className = "font-semibold text-blue-600 dark:text-blue-400";
    else if (PY_BUILTINS.has(part)) className = "text-cyan-600 dark:text-cyan-400";
    else if (part === "left" || part === "left_max") className = "text-mint";
    else if (part === "right" || part === "right_max")
      className = "text-blue-500 dark:text-blue-400";
    else if (/^\d+$/.test(part)) className = "text-amber-600 dark:text-amber-400";
    return (
      <span key={i} className={className}>
        {part}
      </span>
    );
  });
}

function highlightAlgorithm(line: string): ReactNode[] {
  return line.split(/(\b[A-Za-z_]+\b)/g).map((part, i) => {
    let className = "";
    if (ALGO_KEYWORDS.has(part)) className = "font-semibold text-purple-600 dark:text-purple-400";
    else if (part === "left" || part === "left_max") className = "text-mint";
    else if (part === "right" || part === "right_max")
      className = "text-blue-500 dark:text-blue-400";
    return (
      <span key={i} className={className}>
        {part}
      </span>
    );
  });
}

function TokenLine({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((token, i) => (
        <span key={i} className={TONE_CLASS[token.tone ?? "plain"]}>
          {token.text}
        </span>
      ))}
    </>
  );
}

function parseValues(raw: string, problem: Problem): number[] | string {
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length > problem.maxValues)
    return `Use at most ${problem.maxValues} values so every cell stays readable.`;
  const values = parts.map(Number);
  if (values.some((value) => Number.isNaN(value) || Math.abs(value) > 999))
    return "Use whole numbers between -999 and 999, separated by commas.";
  return problem.validate(values) ?? values;
}

/** One listing (Python or pseudocode) with the active line highlighted and its live values below it. */
function Listing({
  lines,
  active,
  note,
  noteKey,
  render,
}: {
  lines: readonly string[];
  active: number[];
  note: Token[];
  noteKey: string;
  render: (line: string) => ReactNode[];
}) {
  const noteAfter = active[active.length - 1];
  // Long listings (Trapping Rain Water) use a smaller size so lines stay on one row.
  const long = Math.max(...lines.map((line) => line.length)) > 46;
  return (
    <div
      className={cn(
        "font-mono leading-[1.75]",
        long ? "text-[11px] @min-[36rem]:text-[12px]" : "text-[12.5px] @min-[36rem]:text-[14px]",
      )}
    >
      {lines.map((line, i) => {
        const number = i + 1;
        const isActive = active.includes(number);
        return (
          <div key={number}>
            <div
              className={cn(
                "flex rounded-r-md border-l-2 px-2 transition-colors duration-200",
                isActive
                  ? "border-mint bg-mint/15 text-foreground"
                  : "border-transparent text-muted-foreground/80",
              )}
            >
              <span className="mr-3 w-5 shrink-0 select-none text-right text-muted-foreground/40">
                {number}
              </span>
              <span
                className="min-w-0 whitespace-pre-wrap break-words"
                style={{ paddingLeft: `${line.length - line.trimStart().length}ch` }}
              >
                {line ? render(line.trimStart()) : " "}
              </span>
            </div>
            {number === noteAfter ? (
              <div
                key={noteKey}
                className="my-1 ml-10 flex items-start gap-2 rounded-md [contain:inline-size] border border-violet/30 bg-violet/10 px-2.5 py-1 duration-300 animate-in fade-in slide-in-from-left-2"
              >
                <span className="select-none text-violet">↳</span>
                <span className="min-w-0 overflow-x-auto whitespace-nowrap text-foreground/90 [scrollbar-width:none]">
                  <TokenLine tokens={note} />
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** The few longest descriptions; rendered invisibly, the tallest one fixes the card height. */
function longestNarrations(narrations: string[]) {
  return [...new Set(narrations)].sort((a, b) => b.length - a.length).slice(0, 6);
}

const PRESET_NARRATIONS = PROBLEMS.flatMap((problem) =>
  problem.presets.flatMap((preset) =>
    problem.build(preset.values, preset.target ?? 0).map((step) => step.narration),
  ),
);

export function OppositeEndsVisualizer() {
  const [problemId, setProblemId] = useState<ProblemId>("reverse");
  const problem = PROBLEMS.find((p) => p.id === problemId)!;
  const [values, setValues] = useState<number[]>(problem.presets[0].values);
  const [target, setTarget] = useState(problem.presets[0].target ?? 0);
  const [draft, setDraft] = useState(values.join(", "));
  const [targetDraft, setTargetDraft] = useState(String(target));
  const [inputError, setInputError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [view, setView] = useState<"code" | "algorithm">("code");

  const steps = useMemo(() => problem.build(values, target), [problem, values, target]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  // The card reserves room for the longest descriptions of every problem, plus any custom run.
  const reservedNarrations = useMemo(
    () => longestNarrations([...PRESET_NARRATIONS, ...steps.map((s) => s.narration)]),
    [steps],
  );
  const isLast = stepIndex >= steps.length - 1;
  const n = values.length;
  const stepKey = `${problem.id}-${values.join(",")}-${target}-${stepIndex}`;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setStepIndex((current) => {
          if (current >= steps.length - 1) {
            setPlaying(false);
            return current;
          }
          return current + 1;
        }),
      Math.round(1800 / speed),
    );
    return () => clearInterval(timer);
  }, [playing, speed, steps.length]);

  const clampStep = (index: number) => Math.max(0, Math.min(index, steps.length - 1));
  const goTo = (index: number) => {
    setPlaying(false);
    setStepIndex(clampStep(index));
  };
  const stepBy = (delta: number) => {
    setPlaying(false);
    setStepIndex((current) => clampStep(current + delta));
  };

  const load = (next: number[], nextTarget: number) => {
    setValues(next);
    setTarget(nextTarget);
    setDraft(next.join(", "));
    setTargetDraft(String(nextTarget));
    setInputError(null);
    setPlaying(false);
    setStepIndex(0);
  };

  const switchProblem = (id: ProblemId) => {
    setOppositeEndsProblem(id);
    const next = PROBLEMS.find((p) => p.id === id)!;
    setProblemId(id);
    load(next.presets[0].values, next.presets[0].target ?? 0);
  };

  const applyDraft = () => {
    const parsed = parseValues(draft, problem);
    if (typeof parsed === "string") return setInputError(parsed);
    const nextTarget = Number(targetDraft);
    if (problem.hasTarget && (!Number.isInteger(nextTarget) || targetDraft.trim() === ""))
      return setInputError("The target must be a whole number.");
    load(parsed, problem.hasTarget ? nextTarget : 0);
  };

  const togglePlay = () => {
    if (isLast) {
      setStepIndex(0);
      setPlaying(true);
    } else setPlaying((current) => !current);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const tag = (event.target as HTMLElement).tagName;
    if (tag === "INPUT" || (event.target as HTMLElement).getAttribute("role") === "combobox")
      return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepBy(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepBy(-1);
    } else if (event.key === " ") {
      event.preventDefault();
      togglePlay();
    }
  };

  // Equal fluid columns keep every cell visible and make the flow-layer percentages exact.
  const columns = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const cellFont = { fontSize: `clamp(0.8rem, ${Math.round(42 / n)}cqi, 2rem)` };
  const center = (index: number) => ((index + 0.5) / n) * 100;
  const arc =
    step.arc && step.left !== null && step.right !== null
      ? {
          ...step.arc,
          from: center(step.left),
          to: center(step.right),
          mid: (center(step.left) + center(step.right)) / 2,
        }
      : null;
  const maxHeight = Math.max(1, ...values);
  const done = isLast;

  const cellClass = (index: number) => {
    const isLeft = step.left === index;
    const isRight = step.right === index;
    const settled = step.settled?.includes(index) ?? false;
    if (step.swapped?.includes(index))
      return "border-violet bg-violet/15 text-violet ring-2 ring-violet/30";
    if (step.found && (isLeft || isRight))
      return "border-mint bg-mint/20 text-mint ring-4 ring-mint/30";
    if (step.focus?.includes(index))
      return "border-amber-500 bg-amber-500/10 text-amber-600 ring-2 ring-amber-500/30 dark:text-amber-400";
    if (isLeft) return "border-mint bg-mint/10 text-mint ring-2 ring-mint/30";
    if (isRight)
      return "border-blue-500 bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/30 dark:text-blue-400";
    if (settled && problem.settledStyle === "placed")
      return "border-mint/40 bg-mint/5 text-mint/80";
    if (settled && problem.settledStyle === "eliminated")
      return "border-hairline bg-background text-muted-foreground/50 line-through opacity-60";
    return "border-hairline bg-background text-foreground/75";
  };

  const panels = [
    {
      id: "code" as const,
      lines: problem.python,
      active: step.codeLines,
      note: step.codeNote,
      render: highlightPython,
    },
    {
      id: "algorithm" as const,
      lines: problem.algorithm,
      active: [step.algoLine],
      note: step.algoNote,
      render: highlightAlgorithm,
    },
  ];

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Interactive opposite-ends visualizer"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-mint/50 dark:bg-surface"
    >
      <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-mint/10 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 size-56 rounded-full bg-blue-500/10 blur-[70px]" />

      {/* Window chrome: problem picker, presets and custom input */}
      <div className="relative space-y-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-rose-500/80" />
            <div className="size-2.5 rounded-full bg-amber-500/80" />
            <div className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-3.5 w-px shrink-0 bg-hairline" />
          <Sparkles className="size-3.5 shrink-0 text-mint" />
          <Select value={problemId} onValueChange={(id) => switchProblem(id as ProblemId)}>
            <SelectTrigger
              aria-label="Choose a problem to animate"
              className="-ml-1 h-8 w-auto gap-1.5 rounded-md border-transparent bg-transparent px-1.5 font-mono text-[13px] font-semibold text-foreground shadow-none transition-colors hover:border-hairline hover:bg-background focus:ring-1 focus:ring-mint/40"
            >
              <SelectValue>{problem.file}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PROBLEMS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  <span className="font-mono text-[13px] font-semibold">{p.file}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{p.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="hidden min-w-0 truncate text-[13px] text-muted-foreground @min-[30rem]:inline">
            {problem.label}
          </span>
        </div>

        {/* Phones: presets on one scrolling row, the input on its own row. Wider: one row. */}
        <div className="flex flex-col gap-2 @min-[40rem]:flex-row @min-[40rem]:items-center">
          <div className="-mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1 py-0.5 [mask-image:linear-gradient(to_right,black_80%,transparent)] [scrollbar-width:none] @min-[40rem]:[mask-image:none]">
            {problem.presets.map((preset) => {
              const active =
                preset.values.join(",") === values.join(",") && (preset.target ?? 0) === target;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => load(preset.values, preset.target ?? 0)}
                  className={cn(
                    "h-8 shrink-0 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors",
                    active
                      ? "border-mint bg-mint/10 text-mint"
                      : "border-hairline bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <form
            className="flex min-w-0 items-center gap-1.5 @min-[40rem]:shrink-0"
            onSubmit={(event) => {
              event.preventDefault();
              applyDraft();
            }}
          >
            <label htmlFor="opposite-ends-values" className="sr-only">
              {problem.view === "bars" ? "Bar heights" : "Array values"}
            </label>
            <Input
              id="opposite-ends-values"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="h-8 min-w-0 flex-1 bg-background font-mono text-xs @min-[40rem]:w-44 @min-[40rem]:flex-none"
              placeholder={problem.view === "bars" ? "heights, e.g. 3, 0, 2" : "e.g. 4, 9, 1, 7"}
            />
            {problem.hasTarget ? (
              <>
                <label htmlFor="opposite-ends-target" className="text-xs text-muted-foreground">
                  target
                </label>
                <Input
                  id="opposite-ends-target"
                  value={targetDraft}
                  onChange={(event) => setTargetDraft(event.target.value)}
                  className="h-8 w-14 shrink-0 bg-background text-center font-mono text-xs"
                />
              </>
            ) : null}
            <Button type="submit" size="sm" variant="outline" className="h-8 shrink-0 px-3 text-xs">
              Load
            </Button>
          </form>
        </div>
      </div>
      {inputError ? (
        <p className="relative border-b border-hairline bg-rose/5 px-5 py-2 text-xs text-rose">
          {inputError}
        </p>
      ) : null}

      {/*
        Stacked (narrow): array, controls, code, so the controls sit right under what they drive.
        Side by side (wide): array | code, with the controls spanning the bottom.
      */}
      <div className="relative grid grid-cols-1 [grid-template-areas:'visual'_'controls'_'code'] @min-[54rem]:grid-cols-[minmax(0,1fr)_auto] @min-[54rem]:[grid-template-areas:'visual_code'_'controls_controls']">
        {/* Visual column */}
        <div className="flex min-w-0 flex-col gap-4 p-4 [grid-area:visual] sm:p-6">
          {/* The stage keeps one height for boxes and bars; pointers, values and indices move as one unit. */}
          <div className="flex min-h-[20.5rem] flex-1 flex-col justify-center">
            <div
              className="@container relative mx-auto w-full"
              style={{ maxWidth: `${n * (problem.view === "bars" ? 4 : 6)}rem` }}
            >
              {/* Pointer labels */}
              <div className="grid" style={columns}>
                {step.items.map((_, index) => {
                  const isLeft = step.left === index;
                  const isRight = step.right === index;
                  return (
                    <div key={index} className="flex h-9 items-end justify-center">
                      {isLeft && isRight ? (
                        <span className="flex flex-col items-center font-mono text-xs font-bold text-violet">
                          L=R<span className="text-xs leading-none">▼</span>
                        </span>
                      ) : isLeft ? (
                        <motion.span
                          layoutId={`${problem.id}-left`}
                          transition={{ type: "spring", stiffness: 260, damping: 26 }}
                          className="flex flex-col items-center font-mono text-xs font-bold text-mint"
                        >
                          L<span className="text-xs leading-none">▼</span>
                        </motion.span>
                      ) : isRight ? (
                        <motion.span
                          layoutId={`${problem.id}-right`}
                          transition={{ type: "spring", stiffness: 260, damping: 26 }}
                          className="flex flex-col items-center font-mono text-xs font-bold text-blue-500 dark:text-blue-400"
                        >
                          R<span className="text-xs leading-none">▼</span>
                        </motion.span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {problem.view === "bars" ? (
                /* Bars with the water trapped above each one */
                <div className="mt-1 grid h-52 items-end" style={columns}>
                  {step.items.map((item, index) => {
                    const water = step.water?.[index] ?? 0;
                    const isLeft = step.left === index;
                    const isRight = step.right === index;
                    const focus = step.focus?.includes(index);
                    return (
                      <div
                        key={item.id}
                        className="flex h-full flex-col justify-end px-0.5 sm:px-1"
                      >
                        <div
                          className="rounded-t-sm bg-sky-400/50 transition-[height] duration-500 dark:bg-sky-400/40"
                          style={{ height: `${(water / maxHeight) * 100}%` }}
                        />
                        <div
                          className={cn(
                            "rounded-t-md border-2 border-b-0 transition-colors duration-300",
                            focus
                              ? "border-amber-500 bg-amber-500/30"
                              : isLeft
                                ? "border-mint bg-mint/30"
                                : isRight
                                  ? "border-blue-500 bg-blue-500/30"
                                  : "border-slate-400/60 bg-slate-400/30 dark:border-slate-500 dark:bg-slate-500/40",
                          )}
                          style={{ height: `${(item.value / maxHeight) * 100}%`, minHeight: 3 }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Cells: keyed by identity so a swap animates the values across */
                <div className="mt-1 grid items-center" style={{ ...columns, ...cellFont }}>
                  {step.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      transition={{ type: "spring", stiffness: 170, damping: 20 }}
                      className="flex justify-center px-1 sm:px-1.5"
                    >
                      <div
                        className={cn(
                          "flex aspect-square w-full max-w-[5.5rem] items-center justify-center rounded-xl border font-mono font-bold transition-all duration-300",
                          cellClass(index),
                        )}
                      >
                        {item.value}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-1.5 grid" style={columns}>
                {step.items.map((item, index) => (
                  <span key={index} className="text-center font-mono text-xs text-muted-foreground">
                    {problem.view === "bars" ? item.value : `[${index}]`}
                  </span>
                ))}
              </div>

              {/* Flow layer: an arc between the pointers, otherwise a bracket over a range */}
              <div className="relative mt-1 h-12">
                {arc ? (
                  <>
                    <svg
                      key={stepKey}
                      viewBox="0 0 100 40"
                      preserveAspectRatio="none"
                      className="absolute inset-x-0 top-0 h-8 w-full duration-300 animate-in fade-in"
                      aria-hidden
                    >
                      <path
                        d={`M ${arc.from} 2 Q ${arc.mid} 46 ${arc.to} 2`}
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        strokeWidth={2}
                        strokeDasharray={arc.dashed ? "5 4" : undefined}
                        className={FLOW_STROKE[arc.tone]}
                      />
                    </svg>
                    <span
                      key={`${stepKey}-label`}
                      className={cn(
                        "absolute top-5 -translate-x-1/2 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold duration-300 animate-in fade-in zoom-in-95",
                        FLOW_CHIP[arc.tone],
                      )}
                      style={{ left: `${arc.mid}%` }}
                    >
                      {arc.label}
                    </span>
                  </>
                ) : step.bracket ? (
                  <div
                    className="absolute top-1 transition-all duration-500 ease-out"
                    style={{
                      left: `calc(${(step.bracket.from / n) * 100}% + 6px)`,
                      width: `calc(${((step.bracket.to - step.bracket.from + 1) / n) * 100}% - 12px)`,
                    }}
                  >
                    <div
                      className={cn(
                        "h-2.5 rounded-b-md border-x-2 border-b-2",
                        step.bracket.tone === "muted"
                          ? "border-muted-foreground/40"
                          : "border-mint",
                      )}
                    />
                    <p
                      className={cn(
                        "mt-1 whitespace-nowrap text-center text-xs",
                        step.bracket.tone === "muted"
                          ? "text-muted-foreground"
                          : "font-medium text-mint",
                      )}
                    >
                      {step.bracket.label}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Status card: what is happening, why, and the live variables */}
          <div
            className={cn(
              "rounded-xl border px-4 py-3 transition-colors duration-300",
              done ? "border-mint/40 bg-mint/5" : "border-hairline bg-background/70",
            )}
          >
            <div className="flex items-center gap-2.5">
              {done ? (
                <CheckCircle2 className="size-5 shrink-0 text-mint" />
              ) : (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-hairline font-mono text-[10px] font-bold text-muted-foreground">
                  {stepIndex + 1}
                </span>
              )}
              <span className="min-w-0 truncate text-[13px] font-semibold text-mint">
                {step.phase}
              </span>
            </div>
            {/* Invisible copies of the longest descriptions reserve the height, so the card never resizes. */}
            <div className="mt-1.5 grid min-h-[4.3rem] text-sm leading-relaxed">
              {reservedNarrations.map((text) => (
                <p key={text} aria-hidden className="invisible [grid-area:1/1]">
                  {text}
                </p>
              ))}
              <p
                key={stepKey}
                className="text-foreground/90 duration-300 animate-in fade-in [grid-area:1/1]"
              >
                {step.narration}
              </p>
            </div>
            <div className="mt-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
              {step.stats.map((stat) => (
                <span
                  key={stat.label}
                  className="flex shrink-0 items-baseline gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 font-mono"
                >
                  <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                  <strong className={cn("text-[13px]", TONE_CLASS[stat.tone ?? "result"])}>
                    {stat.value}
                  </strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Transport controls */}
        <div className="relative flex items-center gap-2 border-t border-hairline bg-surface-2/30 px-4 py-3 [grid-area:controls] sm:px-5">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-hairline/60">
            <div
              className="h-full bg-mint transition-[width] duration-300"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={togglePlay}
            className="h-9 min-w-[6.5rem] @min-[30rem]:min-w-28"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            {playing ? "Pause" : isLast ? "Replay" : "Autoplay"}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-9"
            onClick={() => stepBy(-1)}
            disabled={stepIndex === 0}
            aria-label="Previous step"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-9"
            onClick={() => stepBy(1)}
            disabled={isLast}
            aria-label="Next step"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-9"
            onClick={() => goTo(0)}
            aria-label="Reset to the first step"
          >
            <RotateCcw className="size-4" />
          </Button>
          <span className="ml-1 whitespace-nowrap font-mono text-xs text-muted-foreground">
            {stepIndex + 1} / {steps.length}
          </span>
          <div className="ml-auto hidden items-center gap-3 @min-[34rem]:flex">
            <span className="hidden whitespace-nowrap font-mono text-[11px] text-muted-foreground @min-[60rem]:inline">
              ← → step · space play
            </span>
            <div className="flex items-center rounded-lg border border-hairline bg-background p-0.5 font-mono text-[11px]">
              {([0.5, 1, 2] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSpeed(option)}
                  className={cn(
                    "rounded-md px-2 py-1 font-semibold transition-colors",
                    speed === option
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label={`Playback speed ${option}x`}
                >
                  {option}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Python / algorithm column */}
        <div className="flex min-w-0 flex-col gap-4 border-t border-hairline bg-surface/40 p-4 [grid-area:code] sm:p-5 @min-[54rem]:border-l @min-[54rem]:border-t-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Choose what to show beside the array"
              className="flex rounded-lg border border-hairline bg-background p-0.5"
            >
              {(
                [
                  { id: "code", label: "Python", Icon: Code2 },
                  { id: "algorithm", label: "Algorithm", Icon: ListOrdered },
                ] as const
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={view === id}
                  onClick={() => setView(id)}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all",
                    view === id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              <span className="text-blue-500 dark:text-blue-400">{problem.complexity.time}</span>{" "}
              time · <span className="text-mint">{problem.complexity.space}</span> space
            </span>
          </div>

          {/* Both listings stay mounted in one grid cell, so the canvas keeps its size on toggle. */}
          <div className="grid flex-1 grid-cols-[minmax(0,1fr)] rounded-xl border border-hairline bg-background p-3 shadow-inner">
            {/*
              Invisible copies of every listing reserve the largest size of any problem, so switching
              never resizes the canvas. Side by side they also fix the width (no wrapping); stacked
              they take the column width and wrap like the real listing.
            */}
            {PROBLEMS.flatMap((p) => [
              { key: `${p.id}-py`, lines: p.python, render: highlightPython },
              { key: `${p.id}-algo`, lines: p.algorithm, render: highlightAlgorithm },
            ]).map((ghost) => (
              <div
                key={ghost.key}
                aria-hidden
                className="invisible min-w-0 [contain:inline-size] [grid-area:1/1] @min-[54rem]:[contain:none] @min-[54rem]:[&_span]:whitespace-pre!"
              >
                <Listing
                  lines={ghost.lines}
                  active={[ghost.lines.length]}
                  note={[{ text: "·" }]}
                  noteKey={ghost.key}
                  render={ghost.render}
                />
              </div>
            ))}
            {panels.map((panel) => (
              <div
                key={panel.id}
                role="tabpanel"
                aria-hidden={view !== panel.id}
                className={cn(
                  "min-w-0 [grid-area:1/1] transition-opacity duration-200",
                  view === panel.id ? "opacity-100" : "pointer-events-none invisible opacity-0",
                )}
              >
                <Listing
                  lines={panel.lines}
                  active={panel.active}
                  note={panel.note}
                  noteKey={`${panel.id}-${stepKey}`}
                  render={panel.render}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
