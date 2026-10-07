import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Braces, ChevronLeft, ChevronRight, Hash, IndentIncrease, LockKeyhole, Pause, Play, RotateCcw } from "lucide-react";

const TOTAL_STEPS = 4;
const DURATIONS = [6200, 6200, 6200, 6200];

export function BasicSyntaxCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((value) => (value + 1) % TOTAL_STEPS), DURATIONS[step]);
    return () => window.clearTimeout(id);
  }, [playing, step]);
  const go = useCallback((delta: number) => { setPlaying(false); setStep((value) => (value + delta + TOTAL_STEPS) % TOTAL_STEPS); }, []);
  return <div className="relative z-10 flex w-full flex-col">
    <div className="relative px-4 py-8 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
      <AnimatePresence mode="wait">
        {step === 0 && <CommentScene key="comment" />}
        {step === 1 && <KeywordScene key="keyword" />}
        {step === 2 && <NameScene key="name" />}
        {step === 3 && <IndentScene key="indent" />}
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

function Scene({ title, icon, children, note }: { title: string; icon: React.ReactNode; children: React.ReactNode; note: string }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="flex h-full w-full max-w-4xl flex-col items-center justify-center"><div className="mb-8 flex items-center gap-3"><div className="rounded-xl border border-violet/30 bg-violet/10 p-3 text-violet">{icon}</div><h3 className="text-2xl font-light text-foreground">{title}</h3></div>{children}<p className="mt-10 max-w-xl text-center text-sm leading-relaxed text-muted-foreground/80">{note}</p></motion.div>;
}

function Editor({ children }: { children: React.ReactNode }) { return <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-hairline bg-slate-950 shadow-2xl"><div className="border-b border-slate-700/70 bg-slate-900 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">example.py</div><div className="p-6 font-mono text-[15px] leading-8">{children}</div></div>; }

function CommentScene() { return <Scene title="Comments are notes" icon={<Hash className="size-6" />} note="Python ignores the line that starts with #. The next line still runs."><Editor><div className="text-slate-500"># Add the tax before checkout</div><div><span className="text-rose-400">total</span><span className="text-slate-300"> = </span><span className="text-rose-400">subtotal</span><span className="text-slate-300"> * </span><span className="text-amber">1.08</span></div></Editor></Scene>; }

function KeywordScene() { const words = ["if", "for", "while", "def", "class", "return"]; return <Scene title="Keywords are reserved" icon={<LockKeyhole className="size-6" />} note="Keywords have a meaning in Python. Do not use them as names."><div className="grid grid-cols-3 gap-3">{words.map((word, index) => <motion.div key={word} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className="flex h-20 w-28 items-center justify-center rounded-xl border border-mint/30 bg-mint/10 font-mono text-lg text-mint shadow-lg">{word}</motion.div>)}</div></Scene>; }

function NameScene() { return <Scene title="Identifiers are names" icon={<Braces className="size-6" />} note="Names such as customer_name and total_price help you refer to values in a program."><div className="grid w-full max-w-2xl grid-cols-2 gap-4"><NameCard label="Valid" value="customer_name" tone="mint" /><NameCard label="Valid" value="order2" tone="mint" /><NameCard label="Invalid" value="2orders" tone="rose" /><NameCard label="Invalid" value="order-total" tone="rose" /></div></Scene>; }
function NameCard({ label, value, tone }: { label: string; value: string; tone: "mint" | "rose" }) { return <div className={`rounded-xl border p-5 ${tone === "mint" ? "border-mint/30 bg-mint/10" : "border-rose-400/30 bg-rose-400/10"}`}><div className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</div><div className={`mt-2 font-mono text-lg ${tone === "mint" ? "text-mint" : "text-rose-400"}`}>{value}</div></div>; }

function IndentScene() { return <Scene title="Indentation groups code" icon={<IndentIncrease className="size-6" />} note="The indented line belongs to the if statement. Four spaces is the usual indentation level."><Editor><div><span className="text-violet">if</span><span className="text-slate-300"> </span><span className="text-rose-400">score</span><span className="text-slate-300"> &gt;= </span><span className="text-amber">50</span><span className="text-slate-300">:</span></div><motion.div initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="border-l-2 border-mint pl-5"><span className="text-blue-400">print</span><span className="text-slate-300">(</span><span className="text-amber">"Passed"</span><span className="text-slate-300">)</span></motion.div></Editor></Scene>; }
