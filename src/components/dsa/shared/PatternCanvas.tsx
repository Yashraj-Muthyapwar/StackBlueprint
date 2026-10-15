import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
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
import type { AnyPatternProblem, PatternStep, Token, Tone } from "./pattern-canvas-types";
import { setSelectedProblem } from "./problem-store";

const TONE_CLASS: Record<Tone, string> = {
  left: "text-mint font-semibold",
  right: "text-blue-500 dark:text-blue-400 font-semibold",
  value: "text-amber-600 dark:text-amber-400 font-semibold",
  result: "text-violet font-semibold",
  plain: "",
};

/** Identifier colours in the listings (lighter than token colours). */
const IDENTIFIER_CLASS: Record<Tone, string> = {
  left: "text-mint",
  right: "text-blue-500 dark:text-blue-400",
  value: "text-amber-600 dark:text-amber-400",
  result: "text-violet",
  plain: "",
};

const KEYWORD = "font-semibold text-purple-600 dark:text-purple-400";
const PY_KEYWORDS = new Set([
  "def",
  "while",
  "for",
  "in",
  "return",
  "if",
  "elif",
  "else",
  "not",
  "and",
  "or",
  "None",
  "True",
  "False",
  "break",
  "continue",
  "is",
  "lambda",
  "yield",
  "class",
]);
const PY_BUILTINS = new Set([
  "len",
  "max",
  "min",
  "range",
  "abs",
  "sum",
  "print",
  "str",
  "int",
  "list",
  "dict",
  "set",
  "enumerate",
  "zip",
  "sorted",
  "reversed",
]);
const ALGO_KEYWORDS = new Set([
  "while",
  "for",
  "each",
  "return",
  "if",
  "otherwise",
  "else",
  "add",
  "swap",
  "move",
  "set",
  "put",
  "step",
  "stop",
  "repeat",
  "compare",
  "push",
  "pop",
  "visit",
  "call",
]);

function highlightPython(line: string, identifiers: Record<string, Tone>, functions: Set<string>) {
  return line.split(/(\b[A-Za-z_]\w*\b|\d+)/g).map((part, i) => {
    let className = "";
    if (PY_KEYWORDS.has(part)) className = KEYWORD;
    else if (functions.has(part)) className = "font-semibold text-blue-600 dark:text-blue-400";
    else if (PY_BUILTINS.has(part)) className = "text-cyan-600 dark:text-cyan-400";
    else if (identifiers[part]) className = IDENTIFIER_CLASS[identifiers[part]];
    else if (/^\d+$/.test(part)) className = "text-amber-600 dark:text-amber-400";
    return (
      <span key={i} className={className}>
        {part}
      </span>
    );
  });
}

function highlightAlgorithm(line: string, identifiers: Record<string, Tone>) {
  return line.split(/(\b[A-Za-z_]\w*\b)/g).map((part, i) => {
    let className = "";
    if (ALGO_KEYWORDS.has(part)) className = KEYWORD;
    else if (identifiers[part]) className = IDENTIFIER_CLASS[identifiers[part]];
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
  // Long lines use a smaller size so they stay on one row side by side, and listings of more
  // than 16 lines are set tighter so the whole canvas stays about as tall as a 16-line one,
  // which keeps the controls on screen.
  const long = Math.max(...lines.map((line) => line.length)) > 46;
  const tall = lines.length > 16;
  return (
    <div
      className={cn(
        "font-mono",
        tall
          ? "text-[12px] leading-[1.4] @min-[36rem]:text-[12.5px] @min-[36rem]:leading-[1.4]"
          : long
            ? "text-[11px] leading-[1.75] @min-[36rem]:text-[12px]"
            : "text-[12.5px] leading-[1.75] @min-[36rem]:text-[14px]",
      )}
    >
      {lines.map((line, i) => {
        const number = i + 1;
        const isActive = active.includes(number);
        return (
          <div key={number}>
            <div
              data-active-line={isActive ? "true" : undefined}
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
                data-live-note="true"
                className="my-1 ml-10 flex items-start gap-2 rounded-md border border-violet/30 bg-violet/10 px-2.5 py-1 duration-300 animate-in fade-in slide-in-from-left-2 [contain:inline-size]"
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

/** Every description the presets can show; the status card reserves room for the longest. */
function presetNarrations(problems: AnyPatternProblem[]) {
  return problems.flatMap((problem) =>
    problem.presets.flatMap((preset) =>
      (problem.build(preset.input) as PatternStep[]).map((step) => step.narration),
    ),
  );
}

const functionNames = (python: string[]) =>
  new Set(python.flatMap((line) => [...line.matchAll(/\bdef\s+(\w+)/g)].map((m) => m[1])));

export type PatternCanvasProps = {
  /** The problems offered in the file-name dropdown; the first one is shown initially. */
  problems: AnyPatternProblem[];
  /** Problem-set id; a `PatternExample` with the same id follows the selection. */
  problemSet: string;
  /**
   * Minimum stage height. Use the height of the tallest stage any problem in the set draws,
   * so switching problems never resizes the canvas. Defaults to 20.5rem.
   */
  stageMinHeight?: string;
};

/**
 * Shared frame for pattern lessons. It renders the window chrome with a file-name dropdown,
 * presets and inputs, the problem's own `Stage`, a status card, transport controls, and the
 * Python / Algorithm listing with live values. Its size never changes between steps or
 * problems, and it adapts from phones (stacked) to desktops (side by side).
 */
export function PatternCanvas({
  problems,
  problemSet,
  stageMinHeight = "20.5rem",
}: PatternCanvasProps) {
  const [problemId, setProblemId] = useState(problems[0].id);
  const problem = problems.find((p) => p.id === problemId) ?? problems[0];
  const [input, setInput] = useState<unknown>(problem.presets[0].input);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    () => problem.formatInput?.(problem.presets[0].input) ?? {},
  );
  const [inputError, setInputError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const [view, setView] = useState<"code" | "algorithm">("code");

  const steps = useMemo(() => problem.build(input) as PatternStep[], [problem, input]);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const inputKey = useMemo(() => JSON.stringify(input), [input]);
  const stepKey = `${problem.id}-${inputKey}-${stepIndex}`;
  const isLast = stepIndex >= steps.length - 1;
  const identifiers = problem.identifiers ?? {};
  const functions = useMemo(() => functionNames(problem.python), [problem]);

  // Listings longer than 23 lines would make the canvas taller than its budget, so they scroll
  // inside the panel and follow the highlighted line instead.
  const scrollCode = problems.some((p) => Math.max(p.python.length, p.algorithm.length) > 23);
  const codeScrollRef = useRef<HTMLDivElement>(null);

  // The card reserves room for the longest descriptions of every problem, plus any custom run.
  const reservedNarrations = useMemo(
    () => longestNarrations([...presetNarrations(problems), ...steps.map((s) => s.narration)]),
    [problems, steps],
  );

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

  useEffect(() => {
    if (!scrollCode) return;
    const box = codeScrollRef.current;
    const panel = box?.querySelector('[role="tabpanel"][aria-hidden="false"]');
    if (!box || !panel) return;
    const rows = [...panel.querySelectorAll<HTMLElement>('[data-active-line="true"]')];
    const note = panel.querySelector<HTMLElement>('[data-live-note="true"]');
    const top = rows[0] ?? note;
    const bottom = note ?? rows[rows.length - 1];
    if (!top || !bottom) return;
    const view = box.getBoundingClientRect();
    const t = top.getBoundingClientRect();
    const b = bottom.getBoundingClientRect();
    const margin = 10;
    let delta = 0;
    if (b.bottom > view.bottom - margin) {
      // Show the live-values note, but never push the highlighted line itself off the top.
      delta = Math.min(b.bottom - view.bottom + margin, t.top - view.top - margin);
    }
    if (t.top < view.top + margin) delta = t.top - view.top - margin;
    if (Math.abs(delta) < 1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ top: box.scrollTop + delta, behavior: reduce ? "auto" : "smooth" });
  }, [stepKey, view, scrollCode]);

  const clampStep = (index: number) => Math.max(0, Math.min(index, steps.length - 1));
  const goTo = (index: number) => {
    setPlaying(false);
    setStepIndex(clampStep(index));
  };
  const stepBy = (delta: number) => {
    setPlaying(false);
    setStepIndex((current) => clampStep(current + delta));
  };

  const load = (target: AnyPatternProblem, next: unknown) => {
    setInput(next);
    setDrafts(target.formatInput?.(next) ?? {});
    setInputError(null);
    setPlaying(false);
    setStepIndex(0);
  };

  const switchProblem = (id: string) => {
    setSelectedProblem(problemSet, id);
    const next = problems.find((p) => p.id === id) ?? problems[0];
    setProblemId(next.id);
    load(next, next.presets[0].input);
  };

  const applyDrafts = () => {
    if (!problem.parseInput) return;
    const parsed = problem.parseInput(drafts);
    if (typeof parsed === "string") setInputError(parsed);
    else load(problem, parsed);
  };

  const togglePlay = () => {
    if (isLast) {
      setStepIndex(0);
      setPlaying(true);
    } else setPlaying((current) => !current);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.getAttribute("role") === "combobox") return;
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

  const panels = [
    {
      id: "code" as const,
      lines: problem.python,
      active: step.codeLines,
      note: step.codeNote,
      render: (line: string) => highlightPython(line, identifiers, functions),
    },
    {
      id: "algorithm" as const,
      lines: problem.algorithm,
      active: [step.algoLine],
      note: step.algoNote,
      render: (line: string) => highlightAlgorithm(line, identifiers),
    },
  ];

  const Stage = problem.Stage;
  const hasInput = Boolean(problem.inputFields?.length && problem.parseInput);

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Interactive pattern visualizer"
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
          {problems.length > 1 ? (
            <Select value={problem.id} onValueChange={switchProblem}>
              <SelectTrigger
                aria-label="Choose a problem to animate"
                className="-ml-1 h-8 w-auto gap-1.5 rounded-md border-transparent bg-transparent px-1.5 font-mono text-[13px] font-semibold text-foreground shadow-none transition-colors hover:border-hairline hover:bg-background focus:ring-1 focus:ring-mint/40"
              >
                <SelectValue>{problem.file}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {problems.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="font-mono text-[13px] font-semibold">{p.file}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{p.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="font-mono text-[13px] font-semibold text-foreground">
              {problem.file}
            </span>
          )}
          <span className="hidden min-w-0 truncate text-[13px] text-muted-foreground @min-[30rem]:inline">
            {problem.label}
          </span>
        </div>

        {/* Phones: presets on one scrolling row, the input on its own row. Wider: one row. */}
        <div className="flex flex-col gap-2 @min-[40rem]:flex-row @min-[40rem]:items-center">
          <div className="-mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1 py-0.5 [mask-image:linear-gradient(to_right,black_80%,transparent)] [scrollbar-width:none] @min-[40rem]:[mask-image:none]">
            {problem.presets.map((preset) => {
              const active = JSON.stringify(preset.input) === inputKey;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => load(problem, preset.input)}
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
          {hasInput ? (
            <form
              className="flex min-w-0 items-center gap-1.5 @min-[40rem]:shrink-0"
              onSubmit={(event) => {
                event.preventDefault();
                applyDrafts();
              }}
            >
              {problem.inputFields!.map((field) => {
                const id = `${problemSet}-${problem.id}-${field.key}`;
                const narrow = field.size === "narrow";
                return (
                  <div key={field.key} className={cn("contents")}>
                    <label
                      htmlFor={id}
                      className={field.label ? "shrink-0 text-xs text-muted-foreground" : "sr-only"}
                    >
                      {field.label ?? field.placeholder ?? field.key}
                    </label>
                    <Input
                      id={id}
                      value={drafts[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        setDrafts((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                      className={cn(
                        "h-8 bg-background font-mono text-xs",
                        narrow
                          ? "w-14 shrink-0 text-center"
                          : "min-w-0 flex-1 @min-[40rem]:w-44 @min-[40rem]:flex-none",
                      )}
                    />
                  </div>
                );
              })}
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="h-8 shrink-0 px-3 text-xs"
              >
                Load
              </Button>
            </form>
          ) : null}
        </div>
      </div>
      {inputError ? (
        <p className="relative border-b border-hairline bg-rose/5 px-5 py-2 text-xs text-rose">
          {inputError}
        </p>
      ) : null}

      {/*
        Stacked (narrow): stage, controls, code, so the controls sit right under what they drive.
        Side by side (wide): stage | code, with the controls spanning the bottom.
      */}
      <div className="relative grid grid-cols-1 [grid-template-areas:'visual'_'controls'_'code'] @min-[54rem]:grid-cols-[minmax(0,1fr)_fit-content(56%)] @min-[54rem]:[grid-template-areas:'visual_code'_'controls_controls']">
        {/* Stage column: the lesson draws this, centred in a fixed-height area */}
        <div className="flex min-w-0 flex-col gap-4 p-4 [grid-area:visual] sm:p-6">
          <div
            className="flex flex-1 flex-col justify-center"
            style={{ minHeight: stageMinHeight } as CSSProperties}
          >
            <Stage step={step} stepKey={stepKey} problemId={problem.id} />
          </div>

          {/* Status card: what is happening, why, and the live variables */}
          <div
            className={cn(
              "rounded-xl border px-4 py-3 transition-colors duration-300",
              isLast ? "border-mint/40 bg-mint/5" : "border-hairline bg-background/70",
            )}
          >
            <div className="flex items-center gap-2.5">
              {isLast ? (
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
              aria-label="Choose what to show beside the stage"
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
          <div
            ref={codeScrollRef}
            className={cn(
              "grid flex-1 grid-cols-[minmax(0,1fr)] rounded-xl border border-hairline bg-background p-3 shadow-inner",
              scrollCode && "max-h-[29rem] content-start overflow-y-auto overscroll-contain",
            )}
          >
            {/*
              Invisible copies of every listing reserve the largest size of any problem, so switching
              never resizes the canvas. They wrap exactly like the real listing; side by side their
              widest unwrapped line sizes the column (up to 56% of the card).
            */}
            {problems
              .flatMap((p) => [
                { key: `${p.id}-py`, lines: p.python },
                { key: `${p.id}-algo`, lines: p.algorithm },
              ])
              .map((ghost) => (
                <div
                  key={ghost.key}
                  aria-hidden
                  className="invisible min-w-0 [contain:inline-size] [grid-area:1/1] @min-[54rem]:[contain:none]"
                >
                  <Listing
                    lines={ghost.lines}
                    active={[ghost.lines.length]}
                    note={[{ text: "·" }]}
                    noteKey={ghost.key}
                    render={(line) => [line]}
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
