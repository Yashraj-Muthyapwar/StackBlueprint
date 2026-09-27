import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

const TOTAL_STEPS = 4;
const DURATIONS = [5000, 5200, 5200, 5000];

export function OperatorsCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((value) => (value + 1) % TOTAL_STEPS), DURATIONS[step]);
    return () => window.clearTimeout(id);
  }, [playing, step]);

  const go = useCallback((delta: number) => {
    setPlaying(false);
    setStep((value) => (value + delta + TOTAL_STEPS) % TOTAL_STEPS);
  }, []);

  const scenes = [<ArithmeticScene key="arithmetic" />, <ComparisonScene key="comparison" />, <LogicalScene key="logical" />, <PrecedenceScene key="precedence" />];

  return (
    <div className="relative z-10 flex w-full flex-col">
      <div className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
        <AnimatePresence mode="wait">{scenes[step]}</AnimatePresence>
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setPlaying(false); setStep(0); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Restart"><RotateCcw className="size-3.5" /></button>
          <button type="button" onClick={() => go(-1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Previous step"><ChevronLeft className="size-3.5" /></button>
          <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}</button>
          <button type="button" onClick={() => go(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Next step"><ChevronRight className="size-3.5" /></button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">{step + 1} / {TOTAL_STEPS}</div>
      </div>
    </div>
  );
}

function Scene({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex h-full w-full max-w-4xl flex-col items-center justify-center"><h3 className="mb-8 text-2xl font-light text-foreground">{title}</h3>{children}<p className="mt-10 max-w-xl text-center text-sm leading-relaxed text-muted-foreground/80">{note}</p></motion.div>;
}

function CodeCard({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-hairline bg-slate-950 shadow-2xl"><div className="border-b border-slate-700/70 bg-slate-900 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">operators.py</div><div className="p-6 font-mono text-lg leading-9 text-slate-200">{children}</div></div>;
}

function ArithmeticScene() {
  return <Scene title="Arithmetic creates a value" note="Arithmetic operators combine numbers. The result can be stored in another variable or printed."><CodeCard><div><span className="text-amber">price</span> <span className="text-slate-400">=</span> <span className="text-violet">24</span></div><div><span className="text-amber">quantity</span> <span className="text-slate-400">=</span> <span className="text-violet">3</span></div><div className="mt-3"><span className="text-amber">total</span> <span className="text-slate-400">= price </span><span className="text-mint">*</span><span className="text-slate-400"> quantity</span></div><motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="mt-5 border-l-2 border-mint pl-4 text-mint">total = 72</motion.div></CodeCard></Scene>;
}

function ComparisonScene() {
  return <Scene title="Comparison asks a question" note="Comparison operators produce Boolean values. Those values will later guide if and loop statements."><CodeCard><div><span className="text-amber">total</span> <span className="text-slate-400">=</span> <span className="text-violet">72</span></div><div><span className="text-amber">free_shipping_limit</span> <span className="text-slate-400">=</span> <span className="text-violet">50</span></div><div className="mt-3"><span className="text-amber">qualifies</span> <span className="text-slate-400">= total </span><span className="text-mint">&gt;=</span><span className="text-slate-400"> free_shipping_limit</span></div><motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="mt-5 inline-block rounded-lg border border-mint/30 bg-mint/10 px-4 py-2 text-mint">True</motion.div></CodeCard></Scene>;
}

function LogicalScene() {
  return <Scene title="Logical operators combine answers" note="and requires both conditions. or accepts either condition. not reverses a Boolean value."><div className="grid w-full max-w-2xl grid-cols-1 gap-4 text-center font-mono md:grid-cols-3"><LogicCard label="True and False" result="False" /><LogicCard label="True or False" result="True" /><LogicCard label="not False" result="True" /></div></Scene>;
}

function LogicCard({ label, result }: { label: string; result: string }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-hairline bg-surface p-5"><div className="text-sm text-muted-foreground">{label}</div><div className="mt-3 text-2xl text-mint">{result}</div></motion.div>;
}

function PrecedenceScene() {
  return <Scene title="Parentheses set the order" note="Python evaluates multiplication before addition. Parentheses override that order and make your intent clear."><div className="grid w-full max-w-2xl grid-cols-1 gap-5 font-mono md:grid-cols-2"><CodeCard><div><span className="text-violet">2</span> <span className="text-mint">+</span> <span className="text-violet">3</span> <span className="text-mint">*</span> <span className="text-violet">4</span></div><div className="mt-5 text-mint">14</div></CodeCard><CodeCard><div><span className="text-slate-300">(</span><span className="text-violet">2</span> <span className="text-mint">+</span> <span className="text-violet">3</span><span className="text-slate-300">)</span> <span className="text-mint">*</span> <span className="text-violet">4</span></div><div className="mt-5 text-mint">20</div></CodeCard></div></Scene>;
}
