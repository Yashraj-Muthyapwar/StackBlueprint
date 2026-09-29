import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

const TOTAL_STEPS = 3;
const DURATIONS = [4800, 5200, 5600];

export function ConditionalBranchingCustomAnimation() {
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

  const scenes = [<IfScene key="if" />, <IfElseScene key="if-else" />, <ElifScene key="elif" />];

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
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex h-full w-full max-w-4xl flex-col items-center justify-center"><h3 className="mb-8 text-center text-2xl font-light text-foreground">{title}</h3>{children}<p className="mt-10 max-w-xl text-center text-sm leading-relaxed text-muted-foreground/80">{note}</p></motion.div>;
}

function CodeCard({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-hairline bg-slate-950 shadow-2xl"><div className="border-b border-slate-700/70 bg-slate-900 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">branch.py</div><div className="p-6 font-mono text-base leading-8 text-slate-200 sm:text-lg">{children}</div></div>;
}

function Decision({ condition, trueLabel, falseLabel }: { condition: string; trueLabel: string; falseLabel?: string }) {
  return <div className="flex w-full max-w-3xl flex-col items-center gap-4 font-mono text-sm"><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-xl border border-violet/40 bg-violet/10 px-6 py-4 text-violet">{condition}</motion.div><div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2"><motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border border-mint/30 bg-mint/10 p-5 text-center"><div className="mb-2 text-xs uppercase tracking-widest text-mint">True</div><div className="text-foreground">{trueLabel}</div></motion.div><motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-hairline bg-surface p-5 text-center"><div className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">False</div><div className="text-foreground">{falseLabel ?? "Skip this block"}</div></motion.div></div></div>;
}

function IfScene() {
  return <Scene title="if runs work only when the answer is true" note="For a single optional action, a false condition skips the indented block and the program continues."><CodeCard><div><span className="text-amber">temperature</span> <span className="text-slate-400">=</span> <span className="text-violet">24</span></div><div className="mt-3"><span className="text-mint">if</span> <span className="text-slate-200">temperature </span><span className="text-violet">&gt;</span><span className="text-slate-200"> 20:</span></div><div className="pl-6 text-slate-200"><span className="text-blue-400">print</span>(<span className="text-amber">"Warm day"</span>)</div></CodeCard><div className="mt-7"><Decision condition="24 > 20" trueLabel="Run: print('Warm day')" /></div></Scene>;
}

function IfElseScene() {
  return <Scene title="if/else follows one visible path" note="With age set to 16, the condition is false. The if body is skipped, the else body runs, and both paths rejoin the rest of the program."><div className="grid w-full max-w-4xl items-center gap-7 lg:grid-cols-[0.9fr_1.1fr]"><CodeCard><div><span className="text-amber">age</span> <span className="text-slate-400">=</span> <span className="text-violet">16</span></div><div className="mt-3"><span className="text-mint">if</span> <span className="text-slate-200">age </span><span className="text-violet">&gt;=</span><span className="text-slate-200"> 18:</span></div><div className="pl-6 text-slate-200"><span className="text-blue-400">print</span>(<span className="text-amber">"Adult"</span>)</div><div><span className="text-mint">else</span><span className="text-slate-200">:</span></div><div className="pl-6 text-slate-200"><span className="text-blue-400">print</span>(<span className="text-amber">"Minor"</span>)</div></CodeCard><div className="flex flex-col items-center font-mono text-xs"><FlowNode label="age = 16" /><FlowConnector label="check" /><Diamond label="age >= 18?" /><div className="mt-3 grid w-full grid-cols-2 gap-3"><PathCard label="True" code={'print("Adult")'} muted /><PathCard label="False" code={'print("Minor")'} active /></div><FlowConnector label="continue" active /><FlowNode label="next statement" active /></div></div></Scene>;
}

function ElifScene() {
  return <Scene title="elif stops at the first matching condition" note="For a score of 75, Python first rejects score >= 90, then accepts score >= 75. The remaining checks are not evaluated."><div className="grid w-full max-w-4xl items-center gap-7 lg:grid-cols-[0.85fr_1.15fr]"><CodeCard><div><span className="text-amber">score</span> <span className="text-slate-400">=</span> <span className="text-violet">75</span></div><div className="mt-3"><span className="text-mint">if</span> score <span className="text-violet">&gt;=</span> 90:</div><div className="pl-6"><span className="text-amber">grade</span> <span className="text-slate-400">=</span> <span className="text-amber">"A"</span></div><div><span className="text-mint">elif</span> score <span className="text-violet">&gt;=</span> 75:</div><div className="pl-6"><span className="text-amber">grade</span> <span className="text-slate-400">=</span> <span className="text-amber">"B"</span></div><div><span className="text-mint">elif</span> score <span className="text-violet">&gt;=</span> 40:</div><div className="pl-6"><span className="text-amber">grade</span> <span className="text-slate-400">=</span> <span className="text-amber">"C"</span></div><div><span className="text-mint">else</span>:</div><div className="pl-6"><span className="text-amber">grade</span> <span className="text-slate-400">=</span> <span className="text-amber">"Needs work"</span></div></CodeCard><div className="w-full font-mono text-xs"><FlowNode label="score = 75" /><CascadeCheck condition="score >= 90?" outcome="False: continue to elif" /><CascadeCheck condition="score >= 75?" outcome="True: run grade = 'B'" active /><div className="ml-6 border-l border-dashed border-hairline pl-4 pt-3 text-muted-foreground/70"><div className="rounded-lg border border-hairline bg-surface/50 px-3 py-2">elif score &gt;= 40? <span className="float-right">not reached</span></div><div className="mt-2 rounded-lg border border-hairline bg-surface/50 px-3 py-2">else <span className="float-right">not reached</span></div></div></div></div></Scene>;
}

function FlowNode({ label, active }: { label: string; active?: boolean }) {
  return <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className={`mx-auto w-fit rounded-xl border px-4 py-2.5 ${active ? "border-mint/50 bg-mint/10 text-mint" : "border-violet/40 bg-violet/10 text-violet"}`}>{label}</motion.div>;
}

function FlowConnector({ label, active }: { label: string; active?: boolean }) {
  return <div className={`flex h-10 flex-col items-center justify-center ${active ? "text-mint" : "text-muted-foreground"}`}><span className="text-[10px] uppercase tracking-widest">{label}</span><motion.span initial={{ y: -3, opacity: 0 }} animate={{ y: 2, opacity: 1 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.65 }} className="text-lg leading-3">↓</motion.span></div>;
}

function Diamond({ label }: { label: string }) {
  return <motion.div initial={{ opacity: 0, rotate: 35 }} animate={{ opacity: 1, rotate: 45 }} className="my-2 flex size-24 items-center justify-center rounded-xl border border-violet/50 bg-violet/10"><span className="-rotate-45 text-center text-violet">{label}</span></motion.div>;
}

function PathCard({ label, code, active, muted }: { label: string; code: string; active?: boolean; muted?: boolean }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: muted ? 0.35 : 1, y: 0 }} transition={{ delay: active ? 0.35 : 0.2 }} className={`rounded-xl border p-3 ${active ? "border-mint/50 bg-mint/10 shadow-[0_0_28px_rgba(45,212,191,0.14)]" : "border-hairline bg-surface"}`}><div className={`mb-2 uppercase tracking-widest ${active ? "text-mint" : "text-muted-foreground"}`}>{label}</div><div className="text-[11px] text-foreground">{code}</div></motion.div>;
}

function CascadeCheck({ condition, outcome, active }: { condition: string; outcome: string; active?: boolean }) {
  return <div className="relative ml-6 border-l border-hairline pl-4 pt-3"><motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className={`rounded-xl border p-3 ${active ? "border-mint/50 bg-mint/10 shadow-[0_0_28px_rgba(45,212,191,0.14)]" : "border-hairline bg-surface"}`}><div className={active ? "text-mint" : "text-violet"}>{condition}</div><div className={`mt-1 text-[11px] ${active ? "text-foreground" : "text-muted-foreground"}`}>{outcome}</div></motion.div></div>;
}
