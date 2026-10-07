import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

type TupleStep = {
  title: string;
  code: string;
  values: string[];
  note: string;
  active?: number;
  blocked?: boolean;
  labels?: string[];
};

const steps: TupleStep[] = [
  { title: "A tuple keeps values in order", code: "point = (12, 18)", values: ["12", "18"], note: "Each position has an index, just like a list." },
  { title: "Indexes read a fixed position", code: "print(point[1])  # 18", values: ["12", "18"], active: 1, note: "Index 1 reads the second value without changing the tuple." },
  { title: "Tuple positions cannot be replaced", code: "point[0] = 20  # TypeError", values: ["12", "18"], active: 0, blocked: true, note: "The attempted update is rejected because the tuple is immutable." },
  { title: "Create a new tuple for a changed record", code: "point = (20, 18)", values: ["20", "18"], active: 0, note: "The variable now refers to a new tuple. The old tuple was not modified." },
  { title: "Unpacking names each position", code: "x, y = point", values: ["20", "18"], labels: ["x", "y"], note: "Unpacking assigns each ordered value to its own variable." },
  { title: "A starred target gathers the middle", code: "first, *middle, last = (10, 20, 30, 40)", values: ["10", "20", "30", "40"], labels: ["first", "middle", "middle", "last"], note: "middle receives [20, 30], which is a list." },
];

export function TuplesCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = steps[step];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % steps.length), 2400);
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
          <div className={"rounded-2xl border px-5 py-4 font-mono text-sm shadow-2xl " + (current.blocked ? "border-rose-400/50 bg-rose-950/20 text-rose-100" : "border-hairline bg-slate-950 text-slate-100")}>
            <span className={current.blocked ? "text-rose-300" : "text-mint"}>{current.code}</span>
          </div>
          <div className="mt-10 overflow-x-auto pb-3">
            <div className="mx-auto flex min-w-max justify-center gap-3 px-2">
              <span className="self-center font-mono text-3xl text-muted-foreground">(</span>
              {current.values.map((value, index) => {
                const isActive = index === current.active;
                const label = current.labels?.[index];
                return (
                  <motion.div
                    key={String(step) + value + index}
                    initial={{ opacity: 0, y: 16, scale: 0.94 }}
                    animate={{ opacity: current.blocked && isActive ? 0.58 : 1, y: 0, scale: isActive ? 1.05 : 1 }}
                    transition={{ duration: 0.28, delay: index * 0.06 }}
                    className={"relative flex h-28 w-28 flex-col items-center justify-center rounded-2xl border font-mono shadow-sm " + (current.blocked && isActive ? "border-rose-400/70 bg-rose-500/10 text-rose-300" : isActive ? "border-violet/60 bg-violet/10 text-violet" : "border-hairline bg-surface text-foreground")}
                  >
                    <span className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">{label ?? "index " + index}</span>
                    <span className="text-lg font-medium">{value}</span>
                    {current.blocked && isActive ? <span className="mt-1 text-[10px] uppercase tracking-widest">locked</span> : null}
                  </motion.div>
                );
              })}
              <span className="self-center font-mono text-3xl text-muted-foreground">)</span>
            </div>
          </div>
          <div className={"mx-auto mt-10 max-w-2xl rounded-xl border px-5 py-4 text-center text-sm leading-relaxed text-foreground " + (current.blocked ? "border-rose-400/30 bg-rose-500/10" : "border-mint/30 bg-mint/10")}>{current.note}</div>
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
