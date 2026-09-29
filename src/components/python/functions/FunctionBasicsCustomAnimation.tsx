import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

type FunctionStep = {
  phase: string;
  title: string;
  code: string;
  explanation: string;
  activeNode: number;
  result?: string;
};

const steps: FunctionStep[] = [
  {
    phase: "definition",
    title: "Define the reusable instructions",
    code: "def add_tax(price):\n    return price * 1.08",
    explanation: "Python stores the function under the name add_tax. The body has not run yet.",
    activeNode: 0,
  },
  {
    phase: "program",
    title: "Continue until the call",
    code: 'print("Ready to calculate")',
    explanation: "A definition is not a call. The program continues until code uses the function name with parentheses.",
    activeNode: 1,
  },
  {
    phase: "call",
    title: "Call the function with an argument",
    code: "total = add_tax(100)",
    explanation: "The argument 100 is passed into the price parameter.",
    activeNode: 2,
  },
  {
    phase: "body",
    title: "Run the indented function body",
    code: "price = 100\nreturn price * 1.08",
    explanation: "The function uses its local parameter and reaches return.",
    activeNode: 3,
  },
  {
    phase: "result",
    title: "Return the value to the caller",
    code: "total = 108.0\nprint(total)",
    explanation: "return sends 108.0 back to the call site, where it is stored in total.",
    activeNode: 4,
    result: "108.0",
  },
];

const nodes = ["Define", "Continue", "Call", "Execute", "Return"];

export function FunctionBasicsCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = steps[step];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % steps.length), 3200);
    return () => window.clearTimeout(timer);
  }, [playing, step]);

  const move = (offset: number) => {
    setPlaying(false);
    setStep((value) => (value + offset + steps.length) % steps.length);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="relative min-h-[520px] w-full overflow-hidden px-4 py-8 md:px-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="mx-auto w-full max-w-5xl"
        >
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet">{current.phase}</p>
            <h3 className="mt-2 text-2xl font-light text-foreground">{current.title}</h3>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {nodes.map((node, index) => {
              const isCurrent = index === current.activeNode;
              const isComplete = index < current.activeNode;
              return (
                <div key={node} className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      opacity: isCurrent || isComplete ? 1 : 0.48,
                      scale: isCurrent ? 1.04 : 1,
                      borderColor: isCurrent ? "var(--mint, #40e0b4)" : "var(--hairline, #2a2a35)",
                    }}
                    className={"rounded-full border px-3 py-1.5 font-mono text-xs " + (isCurrent ? "bg-mint/10 text-mint" : isComplete ? "bg-surface-2 text-foreground" : "bg-surface text-muted-foreground")}
                  >
                    {node}
                  </motion.div>
                  {index < nodes.length - 1 ? <span className="font-mono text-sm text-muted-foreground">→</span> : null}
                </div>
              );
            })}
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-2xl border border-hairline bg-slate-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900 px-4 py-3">
                <span className="size-2.5 rounded-full bg-rose-400" />
                <span className="size-2.5 rounded-full bg-amber-400" />
                <span className="size-2.5 rounded-full bg-mint" />
                <span className="ml-2 font-mono text-xs text-slate-300">example.py</span>
              </div>
              <pre className="min-h-[150px] overflow-x-auto p-5 font-mono text-sm leading-7 text-slate-100"><code>{current.code}</code></pre>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-hairline bg-surface p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">what happens</p>
              <p className="mt-3 text-sm leading-7 text-foreground">{current.explanation}</p>
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: current.result ? 1 : 0.35, scale: 1 }}
                className="mt-6 rounded-xl border border-mint/30 bg-mint/10 px-4 py-3 font-mono text-sm text-mint"
              >
                result: {current.result ?? "waiting for return"}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setPlaying(false); setStep(0); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Restart"><RotateCcw className="size-3.5" /></button>
          <button type="button" onClick={() => move(-1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Previous step"><ChevronLeft className="size-3.5" /></button>
          <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}</button>
          <button type="button" onClick={() => move(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Next step"><ChevronRight className="size-3.5" /></button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">{step + 1} / {steps.length}</div>
      </div>
    </div>
  );
}
