import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

type Phase = "break" | "continue" | "pass";

const phases: Array<{ phase: Phase; active: number }> = [
  { phase: "break", active: 0 },
  { phase: "break", active: 1 },
  { phase: "continue", active: 0 },
  { phase: "continue", active: 1 },
  { phase: "pass", active: 0 },
  { phase: "pass", active: 1 },
];

const labels: Record<Phase, string> = {
  break: "break ends the loop immediately",
  continue: "continue skips only this iteration",
  pass: "pass does nothing and the loop continues",
};

const code: Record<Phase, JSX.Element> = {
  break: <><div><span className="text-mint">for</span> number <span className="text-mint">in</span> [4, 7, 12, 18]:</div><div className="pl-5"><span className="text-mint">if</span> number == <span className="text-amber">12</span>:</div><div className="pl-10 text-rose-300">break</div><div className="pl-5 text-blue-300">print(number)</div></>,
  continue: <><div><span className="text-mint">for</span> score <span className="text-mint">in</span> [82, None, 91]:</div><div className="pl-5"><span className="text-mint">if</span> score <span className="text-mint">is</span> None:</div><div className="pl-10 text-amber">continue</div><div className="pl-5 text-blue-300">print(score)</div></>,
  pass: <><div><span className="text-mint">for</span> _ <span className="text-mint">in</span> range(<span className="text-amber">2</span>):</div><div className="pl-5 text-violet-300">pass</div><div className="mt-3 text-blue-300">print(<span className="text-green-300">"Finished"</span>)</div></>,
};

const values: Record<Phase, Array<string | number>> = {
  break: [4, 7, 12, 18],
  continue: [82, "None", 91],
  pass: [1, 2],
};

export function LoopControlCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = phases[step];
  const currentValues = values[current.phase];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % phases.length), 1900);
    return () => window.clearTimeout(timer);
  }, [playing, step]);

  const status = useMemo(() => {
    if (current.phase === "break") return current.active === 0 ? "4 is printed. The loop moves to 7." : "12 matches. break stops before 18.";
    if (current.phase === "continue") return current.active === 0 ? "82 is printed normally." : "None is skipped. The loop continues with 91.";
    return current.active === 0 ? "pass runs during the first iteration." : "pass runs again. The loop finishes normally.";
  }, [current]);

  const move = (offset: number) => {
    setPlaying(false);
    setStep((value) => (value + offset + phases.length) % phases.length);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden px-4 py-8">
        <div className="w-full max-w-3xl">
          <h3 className="mb-8 text-center text-2xl font-light text-foreground">{labels[current.phase]}</h3>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-hairline bg-slate-950 p-6 font-mono text-sm leading-7 text-slate-200 shadow-2xl">
              {code[current.phase]}
            </div>
            <div className="flex flex-col justify-center gap-3">
              <div className="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">Loop iterations</div>
              {currentValues.map((value, index) => {
                const isActive = index === current.active;
                const isSkipped = current.phase === "continue" && value === "None" && current.active === 1;
                const isStopped = current.phase === "break" && index > 2 && current.active === 1;
                return <motion.div key={`${current.phase}-${value}`} animate={{ opacity: isStopped ? 0.28 : 1, scale: isActive ? 1.03 : 1 }} className={`rounded-xl border p-3 text-center font-mono text-sm ${isSkipped ? "border-amber/60 bg-amber/10 text-amber line-through" : isActive ? "border-mint/60 bg-mint/10 text-mint" : "border-hairline bg-surface text-muted-foreground"}`}>{String(value)}</motion.div>;
              })}
            </div>
          </div>
          <div className="mt-8 rounded-xl border border-mint/30 bg-mint/10 p-4 text-center text-sm text-foreground">{status}</div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setPlaying(false); setStep(0); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Restart"><RotateCcw className="size-3.5" /></button>
          <button type="button" onClick={() => move(-1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Previous"><ChevronLeft className="size-3.5" /></button>
          <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}</button>
          <button type="button" onClick={() => move(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground" aria-label="Next"><ChevronRight className="size-3.5" /></button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">{step + 1} / {phases.length}</div>
      </div>
    </div>
  );
}
