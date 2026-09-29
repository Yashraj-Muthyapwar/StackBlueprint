import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

type Pair = { key: string; value: string; tone: "mint" | "violet" };
type DictionaryStep = { title: string; code: string; note: string; pairs: Pair[]; highlight?: string };

const steps: DictionaryStep[] = [
  {
    title: "A dictionary maps keys to values",
    code: 'student = {"name": "Ava", "age": 21}',
    note: "Each unique key points to one value.",
    pairs: [{ key: "name", value: "Ava", tone: "mint" }, { key: "age", value: "21", tone: "violet" }],
  },
  {
    title: "A key reads one value",
    code: 'student["name"]  # "Ava"',
    note: "Square brackets use a key to retrieve its value.",
    highlight: "name",
    pairs: [{ key: "name", value: "Ava", tone: "mint" }, { key: "age", value: "21", tone: "violet" }],
  },
  {
    title: "A new key adds a pair",
    code: 'student["course"] = "Python"',
    note: "Assigning through a missing key adds a new entry.",
    highlight: "course",
    pairs: [{ key: "name", value: "Ava", tone: "mint" }, { key: "age", value: "21", tone: "violet" }, { key: "course", value: "Python", tone: "mint" }],
  },
  {
    title: "An existing key updates its value",
    code: 'student["age"] = 22',
    note: "Using an existing key replaces only that value.",
    highlight: "age",
    pairs: [{ key: "name", value: "Ava", tone: "mint" }, { key: "age", value: "22", tone: "violet" }, { key: "course", value: "Python", tone: "mint" }],
  },
  {
    title: "get() provides a safe fallback",
    code: 'student.get("score", "Not available")',
    note: "get() returns the fallback instead of raising a KeyError.",
    highlight: "score",
    pairs: [{ key: "name", value: "Ava", tone: "mint" }, { key: "age", value: "22", tone: "violet" }, { key: "course", value: "Python", tone: "mint" }, { key: "score", value: "Not available", tone: "violet" }],
  },
  {
    title: "items() gives key-value pairs",
    code: "for key, value in student.items():",
    note: "items() is useful when a loop needs both the key and its value.",
    pairs: [{ key: "name", value: "Ava", tone: "mint" }, { key: "age", value: "22", tone: "violet" }, { key: "course", value: "Python", tone: "mint" }],
  },
];

export function DictionariesCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = steps[step];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % steps.length), 2800);
    return () => window.clearTimeout(timer);
  }, [playing, step]);

  const move = (offset: number) => {
    setPlaying(false);
    setStep((value) => (value + offset + steps.length) % steps.length);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
        <div className="w-full max-w-4xl">
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-violet">Dictionary operations</p>
          <h3 className="mb-6 text-center text-2xl font-light text-foreground">{current.title}</h3>
          <div className="rounded-2xl border border-hairline bg-slate-950 px-5 py-4 font-mono text-sm text-mint shadow-2xl">{current.code}</div>
          <div className="mt-7 grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.75fr)]">
            <div className="rounded-2xl border border-hairline bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-md bg-violet/10 px-2.5 py-1 font-mono text-xs font-semibold text-violet">student</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">key → value</span>
              </div>
              <div className="space-y-2">
                {current.pairs.map((pair, index) => {
                  const active = current.highlight === pair.key;
                  return (
                    <motion.div
                      key={pair.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className={"flex items-center gap-3 rounded-xl border px-3 py-2.5 " + (active ? "border-violet/50 bg-violet/10 ring-1 ring-violet/20" : "border-hairline bg-surface-2/40")}
                    >
                      <span className={"min-w-[84px] rounded-md px-2 py-1 text-center font-mono text-xs font-semibold " + (pair.tone === "mint" ? "bg-mint/15 text-mint" : "bg-violet/15 text-violet")}>"{pair.key}"</span>
                      <span className="font-mono text-muted-foreground">→</span>
                      <span className="rounded-md bg-slate-950 px-2 py-1 font-mono text-xs text-slate-100">{pair.value}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-2xl border border-mint/30 bg-mint/10 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mint">What to notice</p>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{current.note}</p>
              {current.highlight === "score" ? <p className="mt-4 rounded-lg border border-violet/30 bg-violet/10 p-3 font-mono text-xs text-foreground">score is absent, so the fallback is returned.</p> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setPlaying(false); setStep(0); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Restart"><RotateCcw className="size-3.5" /></button>
          <button type="button" onClick={() => move(-1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Previous"><ChevronLeft className="size-3.5" /></button>
          <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}</button>
          <button type="button" onClick={() => move(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Next"><ChevronRight className="size-3.5" /></button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">{step + 1} / {steps.length}</div>
      </div>
    </div>
  );
}
