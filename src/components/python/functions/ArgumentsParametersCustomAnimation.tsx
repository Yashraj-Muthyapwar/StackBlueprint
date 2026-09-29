import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

type BindingKind = "required" | "keyword" | "default" | "args" | "kwargs";

type Binding = {
  parameter: string;
  argument: string;
  kind: BindingKind;
};

type FlowSlide = {
  eyebrow: string;
  title: string;
  teachingPoint: string;
  definition: string[];
  call: string;
  bindings: Binding[];
  body: string;
  result: string;
};

const slides: FlowSlide[] = [
  {
    eyebrow: "Parameters and arguments",
    title: "A function call gives a parameter a value",
    teachingPoint: "name is a parameter in the definition. \"Ava\" is the argument supplied by the call.",
    definition: ["def greet(name):", '    return f"Hello, {name}!"'],
    call: 'greet("Ava")',
    bindings: [{ parameter: "name", argument: '"Ava"', kind: "required" }],
    body: 'return f"Hello, {name}!"',
    result: '"Hello, Ava!"',
  },
  {
    eyebrow: "Positional, required, and default",
    title: "Position fills required parameters; defaults fill gaps",
    teachingPoint: "The first argument reaches name by its position. role has no argument, so Python uses its default value.",
    definition: ["def welcome(name, role=\"Learner\"):", '    return f"{name}: {role}"'],
    call: 'welcome("Ava")',
    bindings: [
      { parameter: "name", argument: '"Ava"', kind: "required" },
      { parameter: 'role = "Learner"', argument: '"Learner"', kind: "default" },
    ],
    body: 'return f"{name}: {role}"',
    result: '"Ava: Learner"',
  },
  {
    eyebrow: "Keyword arguments",
    title: "A keyword names its destination",
    teachingPoint: "The argument role=\"Mentor\" goes to role even though it appears before name in the call.",
    definition: ["def welcome(name, role=\"Learner\"):", '    return f"{name}: {role}"'],
    call: 'welcome(role="Mentor", name="Ava")',
    bindings: [
      { parameter: "name", argument: 'name="Ava"', kind: "keyword" },
      { parameter: "role", argument: 'role="Mentor"', kind: "keyword" },
    ],
    body: 'return f"{name}: {role}"',
    result: '"Ava: Mentor"',
  },
  {
    eyebrow: "Star arguments",
    title: "Extra positional arguments collect into a tuple",
    teachingPoint: "The star parameter collects every extra positional argument into the tuple scores.",
    definition: ["def average(*scores):", "    return sum(scores) / len(scores)"],
    call: "average(90, 85, 95)",
    bindings: [{ parameter: "*scores", argument: "(90, 85, 95)", kind: "args" }],
    body: "return sum(scores) / len(scores)",
    result: "90.0",
  },
  {
    eyebrow: "Double-star keyword arguments",
    title: "Extra keyword arguments collect into a dictionary",
    teachingPoint: "The double-star parameter collects the named arguments into the dictionary details.",
    definition: ["def profile(**details):", '    return details["name"]'],
    call: 'profile(name="Ava", city="Austin")',
    bindings: [{ parameter: "**details", argument: '{"name": "Ava", "city": "Austin"}', kind: "kwargs" }],
    body: 'return details["name"]',
    result: '"Ava"',
  },
];

const kindClass: Record<BindingKind, string> = {
  required: "border-mint/30 bg-mint/10 text-mint",
  keyword: "border-violet/30 bg-violet/10 text-violet",
  default: "border-amber/30 bg-amber/10 text-amber",
  args: "border-sky-400/30 bg-sky-400/10 text-sky-500",
  kwargs: "border-rose-400/30 bg-rose-400/10 text-rose-500",
};

function CodePanel({ title, lines, activeLine }: { title: string; lines: string[]; activeLine?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-slate-950 shadow-xl">
      <div className="border-b border-white/10 bg-slate-900 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-300">{title}</div>
      <div className="p-3 font-mono text-sm leading-7 text-slate-100">
        {lines.map((line, index) => (
          <motion.div
            key={`${index}-${line}`}
            animate={{ backgroundColor: index === activeLine ? "rgba(64, 224, 180, 0.12)" : "rgba(0, 0, 0, 0)" }}
            className="flex rounded px-2"
          >
            <span className="mr-3 w-3 select-none text-slate-500">{index + 1}</span>
            <span className={`whitespace-pre ${index === activeLine ? "text-mint" : ""}`}>{line}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BindingCard({ binding, index }: { binding: Binding; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -64, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.13, type: "spring", stiffness: 200, damping: 17 }}
      className="rounded-xl border border-hairline bg-surface p-3 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className={`rounded-md border px-2 py-1 font-mono text-[11px] ${kindClass[binding.kind]}`}>{binding.argument}</span>
        <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 0.7, repeat: Infinity }} className="text-mint">→</motion.span>
        <span className="font-mono text-xs text-foreground">{binding.parameter}</span>
      </div>
    </motion.div>
  );
}

export function ArgumentsParametersCustomAnimation() {
  const [slide, setSlide] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = slides[slide];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (phase < 3) {
        setPhase((value) => value + 1);
      } else {
        setSlide((value) => (value + 1) % slides.length);
        setPhase(0);
      }
    }, phase === 0 ? 1600 : 1450);
    return () => window.clearTimeout(timer);
  }, [phase, playing, slide]);

  const move = (offset: number) => {
    setPlaying(false);
    setSlide((value) => (value + offset + slides.length) % slides.length);
    setPhase(0);
  };

  const restart = () => {
    setPlaying(false);
    setSlide(0);
    setPhase(0);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="relative flex h-[620px] w-full flex-col justify-center overflow-hidden px-5 py-8 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="mx-auto w-full max-w-5xl"
          >
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet">{current.eyebrow}</p>
              <h3 className="mt-2 text-2xl font-light text-foreground">{current.title}</h3>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <CodePanel title="function definition" lines={current.definition} activeLine={phase >= 2 ? 1 : 0} />
              <CodePanel title="function call" lines={[current.call]} activeLine={phase >= 1 ? 0 : undefined} />
            </div>

            <div className="mt-4 min-h-[188px]">
              {phase === 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 text-center text-sm text-muted-foreground">
                  First, Python reads the definition. It does not run the body yet.
                </motion.p>
              )}

              {phase >= 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                  <p className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">arguments travel into matching parameters</p>
                  <motion.div
                    initial={{ opacity: 0, y: -28, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 230, damping: 18 }}
                    className="mx-auto mt-3 max-w-3xl"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {current.bindings.map((binding, index) => <BindingCard binding={binding} index={index} key={binding.parameter} />)}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {phase >= 2 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <CodePanel title="function body now runs" lines={[current.body]} activeLine={0} />
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="hidden text-center font-mono text-2xl text-mint md:block">→</motion.span>
                  {phase === 2 ? (
                    <div className="rounded-xl border border-dashed border-hairline bg-surface-2/40 px-5 py-6 text-center font-mono text-xs text-muted-foreground">evaluating return value...</div>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-mint/30 bg-mint/10 px-5 py-5 text-center">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mint">returned to caller</p>
                      <p className="mt-2 font-mono text-xl text-foreground">{current.result}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            <motion.p key={`${slide}-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto mt-4 max-w-4xl text-center text-sm leading-6 text-muted-foreground">
              {phase === 1 ? "The call is supplying its arguments." : current.teachingPoint}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button type="button" onClick={restart} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Restart"><RotateCcw className="size-3.5" /></button>
          <button type="button" onClick={() => move(-1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Previous slide"><ChevronLeft className="size-3.5" /></button>
          <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}</button>
          <button type="button" onClick={() => move(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Next slide"><ChevronRight className="size-3.5" /></button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">{slide + 1} / {slides.length}</div>
      </div>
    </div>
  );
}
