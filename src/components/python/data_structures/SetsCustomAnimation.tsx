import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

type SetStep = {
  title: string;
  code: string;
  groups: { label: string; values: string[]; tone: "mint" | "violet" }[];
  result?: { label: string; values: string[] };
  note: string;
};

const steps: SetStep[] = [
  { title: "A set keeps each value once", code: 'tags = {"python", "sql", "python"}', groups: [{ label: "input values", values: ["python", "sql", "python"], tone: "violet" }], result: { label: "set", values: ["python", "sql"] }, note: "The duplicate python is removed automatically." },
  { title: "Membership does not need an index", code: '"sql" in tags  # True', groups: [{ label: "tags", values: ["python", "sql"], tone: "mint" }], result: { label: "membership", values: ["sql found"] }, note: "Sets have no fixed positions, but checking whether a value exists is their strength." },
  { title: "add() changes the existing set", code: 'tags.add("git")', groups: [{ label: "before", values: ["python", "sql"], tone: "violet" }], result: { label: "after", values: ["python", "sql", "git"] }, note: "Adding an existing value would leave the set unchanged." },
  { title: "Union combines every unique value", code: "morning | afternoon", groups: [{ label: "morning", values: ["ava", "mia", "noah"], tone: "mint" }, { label: "afternoon", values: ["mia", "leo", "noah"], tone: "violet" }], result: { label: "union", values: ["ava", "mia", "noah", "leo"] }, note: "Union keeps values from either group, with no duplicates." },
  { title: "Intersection keeps shared values", code: "morning & afternoon", groups: [{ label: "morning", values: ["ava", "mia", "noah"], tone: "mint" }, { label: "afternoon", values: ["mia", "leo", "noah"], tone: "violet" }], result: { label: "intersection", values: ["mia", "noah"] }, note: "Intersection answers: who appears in both groups?" },
  { title: "Difference keeps values from one side", code: "morning - afternoon", groups: [{ label: "morning", values: ["ava", "mia", "noah"], tone: "mint" }, { label: "afternoon", values: ["mia", "leo", "noah"], tone: "violet" }], result: { label: "difference", values: ["ava"] }, note: "Difference answers: who is in morning but not afternoon?" },
];

function GroupCard({ group }: { group: SetStep["groups"][number] | { label: string; values: string[] } }) {
  const isMint = "tone" in group ? group.tone === "mint" : false;
  return (
    <div className={"min-w-[190px] rounded-2xl border p-4 " + (isMint ? "border-mint/40 bg-mint/5" : "border-violet/40 bg-violet/5")}>
      <p className={"mb-3 font-mono text-[10px] uppercase tracking-[0.18em] " + (isMint ? "text-mint" : "text-violet")}>{group.label}</p>
      <div className="flex flex-wrap gap-2">
        {group.values.map((value, index) => (
          <motion.span key={value + index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.08 }} className="rounded-full border border-hairline bg-surface px-2.5 py-1 font-mono text-xs text-foreground">
            {value}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

export function SetsCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const current = steps[step];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % steps.length), 2500);
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
          <div className="rounded-2xl border border-hairline bg-slate-950 px-5 py-4 font-mono text-sm text-mint shadow-2xl">{current.code}</div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {current.groups.map((group) => <GroupCard key={group.label} group={group} />)}
            {current.result ? (
              <>
                <span className="font-mono text-xl text-muted-foreground">→</span>
                <GroupCard group={current.result} />
              </>
            ) : null}
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
