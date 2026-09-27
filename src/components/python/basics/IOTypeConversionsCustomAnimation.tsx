import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Keyboard, Pause, Play, RotateCcw, Type } from "lucide-react";

const TOTAL_STEPS = 4;
const DURATIONS = [6200, 6200, 6200, 6200];

export function IOTypeConversionsCustomAnimation() {
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

  return <div className="relative z-10 flex w-full flex-col">
    <div className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
      <AnimatePresence mode="wait">
        {step === 0 && <PrintScene key="print" />}
        {step === 1 && <InputScene key="input" />}
        {step === 2 && <ConvertScene key="convert" />}
        {step === 3 && <ImportScene key="import" />}
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
  </div>;
}

function Scene({ title, icon, note, children }: { title: string; icon: React.ReactNode; note: string; children: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex h-full w-full max-w-4xl flex-col items-center justify-center"><div className="mb-8 flex items-center gap-3"><div className="rounded-xl border border-violet/30 bg-violet/10 p-3 text-violet">{icon}</div><h3 className="text-2xl font-light text-foreground">{title}</h3></div>{children}<p className="mt-10 max-w-xl text-center text-sm leading-relaxed text-muted-foreground/80">{note}</p></motion.div>;
}

function Editor({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-hairline bg-slate-950 shadow-2xl"><div className="border-b border-slate-700/70 bg-slate-900 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">example.py</div><div className="p-6 font-mono text-[15px] leading-8">{children}</div></div>;
}

function PrintScene() {
  return <Scene title="print() writes a result" icon={<Type className="size-6" />} note="Pass one or more values to print(). Python separates multiple values with a space unless you choose another separator."><Editor><div><span className="text-blue-400">print</span><span className="text-slate-300">(</span><span className="text-amber">"Total:"</span><span className="text-slate-300">, </span><span className="text-violet">42</span><span className="text-slate-300">)</span></div><motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-5 border-l-2 border-mint pl-4 text-mint">Total: 42</motion.div></Editor></Scene>;
}

function InputScene() {
  return <Scene title="input() receives text" icon={<Keyboard className="size-6" />} note="Even if someone types digits, input() returns a string. Convert the value before using it as a number."><div className="grid w-full max-w-2xl grid-cols-1 gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center"><Editor><div><span className="text-blue-400">input</span><span className="text-slate-300">(</span><span className="text-amber">"Age: "</span><span className="text-slate-300">)</span></div></Editor><span className="hidden text-3xl text-mint md:block">→</span><motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="rounded-2xl border border-violet/30 bg-violet/10 p-6 text-center font-mono"><div className="text-4xl text-violet">"19"</div><div className="mt-2 text-sm text-muted-foreground">str</div></motion.div></div></Scene>;
}

function ConvertScene() {
  return <Scene title="Convert text when needed" icon={<RotateCcw className="size-6" />} note="int() changes numeric text into a whole number. float() changes numeric text into a decimal number."><div className="flex w-full max-w-2xl flex-col items-center gap-4 font-mono md:flex-row md:justify-center"><div className="rounded-2xl border border-hairline bg-surface p-6 text-center"><div className="text-3xl text-violet">"19"</div><div className="mt-2 text-xs text-muted-foreground">str</div></div><span className="text-3xl text-mint">→</span><Editor><div><span className="text-blue-400">int</span><span className="text-slate-300">(</span><span className="text-violet">"19"</span><span className="text-slate-300">)</span></div></Editor><span className="text-3xl text-mint">→</span><motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }} className="rounded-2xl border border-mint/30 bg-mint/10 p-6 text-center"><div className="text-3xl text-mint">19</div><div className="mt-2 text-xs text-muted-foreground">int</div></motion.div></div></Scene>;
}

function ImportScene() {
  return <Scene title="import brings in a module" icon={<Type className="size-6" />} note="A module is a Python file that provides code you can use. import math lets you use math.pi and other math tools."><Editor><div><span className="text-violet">import</span><span className="text-slate-300"> math</span></div><div className="mt-4"><span className="text-blue-400">print</span><span className="text-slate-300">(math.</span><span className="text-mint">pi</span><span className="text-slate-300">)</span></div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-5 border-l-2 border-mint pl-4 text-mint">3.141592653589793</motion.div></Editor></Scene>;
}
