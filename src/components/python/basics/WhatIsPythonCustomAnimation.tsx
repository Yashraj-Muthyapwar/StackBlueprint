import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Braces, ChevronLeft, ChevronRight, Cpu, Play, Pause, RotateCcw, Terminal, Sparkles } from "lucide-react";

const TOTAL_STEPS = 4;
const STEP_DURATIONS = [6500, 6000, 6000, 6500];

export function WhatIsPythonCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(() => setStep((current) => (current + 1) % TOTAL_STEPS), STEP_DURATIONS[step]);
    return () => window.clearTimeout(id);
  }, [isHovered, playing, step]);

  const go = useCallback((delta: number) => {
    setPlaying(false);
    setStep((current) => (current + delta + TOTAL_STEPS) % TOTAL_STEPS);
  }, []);

  return (
    <div className="relative z-10 flex w-full flex-col" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative px-4 py-8 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <InstructionStep key="instruction" />}
          {step === 1 && <InterpreterStep key="interpreter" />}
          {step === 2 && <OutputStep key="output" />}
          {step === 3 && <PossibilitiesStep key="possibilities" />}
        </AnimatePresence>
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

function Frame({ children, note }: { children: React.ReactNode; note: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex h-full w-full max-w-4xl flex-col items-center justify-center">{children}<p className="mt-10 max-w-xl text-center text-sm leading-relaxed text-muted-foreground/80">{note}</p></motion.div>;
}

function CodeCard() {
  return <div className="w-full max-w-md overflow-hidden rounded-2xl border border-blue-400/25 bg-slate-950 shadow-2xl">
    <div className="flex items-center gap-2 border-b border-slate-700/70 bg-slate-900 px-4 py-3"><Braces className="size-4 text-blue-400" /><span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">greeting.py</span></div>
    <div className="px-6 py-7 font-mono text-[15px] leading-8"><span className="text-blue-400">print</span><span className="text-slate-300">(</span><span className="text-amber">"Hello, World!"</span><span className="text-slate-300">)</span></div>
  </div>;
}

function InstructionStep() {
  return <Frame note={<>This code tells the computer to display text.</>}><div className="flex w-full flex-col items-center gap-7"><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-3"><div className="rounded-xl border border-blue-400/25 bg-blue-400/10 p-3 text-blue-400"><Terminal className="size-6" /></div><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-blue-400">Step 1</p><h3 className="text-2xl font-light text-foreground">Write an instruction</h3></div></motion.div><CodeCard /></div></Frame>;
}

function InterpreterStep() {
  return <Frame note={<>Python reads <code className="rounded bg-surface-2 px-1.5 py-0.5">print()</code> and runs the instruction.</>}><div className="flex w-full items-center justify-center gap-4 sm:gap-10"><CodeCard /><motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity }} className="hidden text-mint sm:block"><ArrowRight className="size-8" /></motion.div><motion.div animate={{ boxShadow: ["0 0 0 rgba(64,224,180,0)", "0 0 36px rgba(64,224,180,.28)", "0 0 0 rgba(64,224,180,0)"] }} transition={{ duration: 2, repeat: Infinity }} className="flex size-40 shrink-0 flex-col items-center justify-center rounded-3xl border border-mint/35 bg-mint/10"><Cpu className="size-10 text-mint" /><span className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-mint">Python</span><span className="mt-1 text-[11px] text-muted-foreground">interpreter</span></motion.div></div></Frame>;
}

function OutputStep() {
  return <Frame note={<>The result appears in the output area. Change the text in the runnable example below and run it again.</>}><div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center"><div className="flex size-28 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-400/10"><Terminal className="size-10 text-blue-400" /></div><ArrowRight className="hidden size-8 text-mint sm:block" /><motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm overflow-hidden rounded-2xl border border-mint/35 bg-slate-950 shadow-2xl"><div className="flex items-center gap-2 border-b border-slate-700/70 bg-slate-900 px-4 py-3"><span className="size-2 rounded-full bg-mint shadow-[0_0_10px_rgba(64,224,180,.8)]" /><span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">Output</span></div><div className="px-6 py-7 font-mono text-lg text-mint">Hello, World!</div></motion.div></div></Frame>;
}

function PossibilitiesStep() {
  const uses = ["Automate tasks", "Work with data", "Build web apps", "Write scripts"];
  return <Frame note={<>The same Python syntax is used for many types of programs.</>}><div className="w-full"><div className="mb-7 text-center"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet">Step 4</p><h3 className="text-2xl font-light text-foreground">Where Python is used</h3></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{uses.map((use, index) => <motion.div key={use} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12 }} className="flex min-h-32 flex-col justify-between rounded-2xl border border-hairline bg-surface p-4 shadow-lg"><Sparkles className="size-5 text-violet" /><span className="font-mono text-sm text-foreground">{use}</span></motion.div>)}</div></div></Frame>;
}
