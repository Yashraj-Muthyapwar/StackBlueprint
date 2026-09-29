import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

type ListStep = {
  title: string;
  code: string;
  items: string[];
  active?: number;
  added?: number;
  removed?: number;
  note: string;
};

const steps: ListStep[] = [
  { title: "A list stores values in order", code: 'tasks = ["plan", "build", "test"]', items: ["plan", "build", "test"], note: "Each value has a position, starting at index 0." },
  { title: "An index reads one item", code: 'print(tasks[1])  # build', items: ["plan", "build", "test"], active: 1, note: "Index 1 points to the second item: build." },
  { title: "append() adds at the end", code: 'tasks.append("ship")', items: ["plan", "build", "test", "ship"], added: 3, note: "append() changes the existing list." },
  { title: "insert() adds at a position", code: 'tasks.insert(1, "design")', items: ["plan", "design", "build", "test", "ship"], added: 1, note: "The items after index 1 shift right." },
  { title: "pop() removes and returns an item", code: 'finished = tasks.pop(2)', items: ["plan", "design", "test", "ship"], removed: 2, note: "pop(2) removes build and gives it back to the program." },
  { title: "A slice makes a new portion", code: 'next_up = tasks[1:3]', items: ["design", "test"], active: 0, note: "The start is included and the end is excluded." },
];

export function ListsCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = steps[step];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % steps.length), 2000);
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
          <h3 className="mb-8 text-center text-2xl font-light text-foreground">{current.title}</h3>
          <div className="rounded-2xl border border-hairline bg-slate-950 px-5 py-4 font-mono text-sm text-slate-100 shadow-2xl">
            <span className="text-mint">{current.code.split(" ")[0]}</span>
            <span>{current.code.slice(current.code.indexOf(" "))}</span>
          </div>
          <div className="mt-10 overflow-x-auto pb-3">
            <div className="mx-auto flex min-w-max justify-center gap-3 px-2">
              {current.items.map((item, index) => {
                const isActive = index === current.active;
                const isAdded = index === current.added;
                return (
                  <motion.div
                    key={`${step}-${item}-${index}`}
                    initial={{ opacity: 0, y: 16, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: isActive || isAdded ? 1.05 : 1 }}
                    transition={{ duration: 0.28, delay: index * 0.06 }}
                    className={`relative flex h-24 w-32 flex-col items-center justify-center rounded-2xl border font-mono shadow-sm ${isActive ? "border-violet/60 bg-violet/10 text-violet" : isAdded ? "border-mint/60 bg-mint/10 text-mint" : "border-hairline bg-surface text-foreground"}`}
                  >
                    <span className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">index {index}</span>
                    <span className="text-sm font-medium">{item}</span>
                  </motion.div>
                );
              })}
              {current.removed !== undefined && (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex h-24 w-32 flex-col items-center justify-center rounded-2xl border border-rose-400/40 bg-rose-500/10 font-mono text-rose-400 line-through">
                  build
                  <span className="mt-2 text-[10px] uppercase tracking-widest no-underline">removed</span>
                </motion.div>
              )}
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-mint/30 bg-mint/10 px-5 py-4 text-center text-sm leading-relaxed text-foreground">{current.note}</div>
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
