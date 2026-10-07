import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, CircleHelp, List, Pause, Play, RotateCcw, Tag } from "lucide-react";

const TOTAL_STEPS = 4;
const DURATIONS = [6200, 6200, 6200, 6200];

export function VariablesDataTypesCustomAnimation() {
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
        {step === 0 && <AssignmentScene key="assignment" />}
        {step === 1 && <ReassignmentScene key="reassignment" />}
        {step === 2 && <TypeScene key="types" />}
        {step === 3 && <CollectionScene key="collection" />}
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

function Editor({ children }: { children: React.ReactNode }) { return <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-hairline bg-slate-950 shadow-2xl"><div className="border-b border-slate-700/70 bg-slate-900 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">example.py</div><div className="p-6 font-mono text-[15px] leading-8">{children}</div></div>; }
function CodeLine({ name, value, type }: { name: string; value: string; type?: string }) { return <div><span className="text-rose-400">{name}</span><span className="text-slate-300"> = </span><span className="text-amber">{value}</span>{type ? <span className="ml-4 text-slate-500"># {type}</span> : null}</div>; }

function AssignmentScene() { return <Scene title="A name refers to a value" icon={<Tag className="size-6" />} note="The variable name is customer_name. The string literal is the value it refers to."><Editor><CodeLine name="customer_name" value={'"Ava"'} /><motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} className="mt-4 border-l-2 border-mint pl-4 text-mint">customer_name <span className="text-slate-400">→</span> "Ava"</motion.div></Editor></Scene>; }
function ReassignmentScene() { return <Scene title="Names can be reassigned" icon={<RotateCcw className="size-6" />} note="After the second assignment, score refers to 20 instead of 10."><Editor><CodeLine name="score" value="10" /><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="my-1 h-px bg-slate-700" /><motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}><CodeLine name="score" value="20" /></motion.div></Editor></Scene>; }
function TypeScene() { const rows = [["name", '"Ava"', "str", "blue"], ["age", "25", "int", "amber"], ["price", "19.99", "float", "violet"], ["is_active", "True", "bool", "mint"]] as const; return <Scene title="Every value has a type" icon={<CircleHelp className="size-6" />} note="The type tells Python what kind of value it is handling."><div className="grid w-full max-w-2xl gap-3">{rows.map(([name, value, type, tone], index) => <motion.div key={name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.12 }} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-hairline bg-surface/80 p-4 font-mono"><span className="text-rose-400">{name}</span><span className="text-slate-500">→</span><span className={tone === "mint" ? "text-mint" : tone === "amber" ? "text-amber" : tone === "violet" ? "text-violet" : "text-blue-400"}>{value} <span className="text-slate-500">({type})</span></span></motion.div>)}</div></Scene>; }
function CollectionScene() { return <Scene title="Collections hold several values" icon={<List className="size-6" />} note="Lists, tuples, dictionaries, and sets are also data types. Each holds values in a different way."><Editor><CodeLine name="skills" value='["Python", "SQL"]' type="list" /><CodeLine name="coordinates" value="(10, 20)" type="tuple" /><CodeLine name="profile" value='{"name": "Ava"}' type="dict" /><CodeLine name="tags" value='{"python", "basics"}' type="set" /></Editor></Scene>; }
