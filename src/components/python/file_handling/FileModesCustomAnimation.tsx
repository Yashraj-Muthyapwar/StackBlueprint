import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, HardDrive, FileText, Lock, ShieldAlert, Cpu } from "lucide-react";

export function FileModesCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const totalSteps = 4;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), 6000);
    return () => window.clearTimeout(id);
  }, [playing, step]);

  const go = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStep((s) => (s + delta + totalSteps) % totalSteps);
    },
    []
  );

  return (
    <div className="flex flex-col relative z-10 w-full">
      <div className="relative px-4 py-8 lg:px-8 lg:py-10 min-h-[460px] flex flex-col items-center justify-start w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step1Read key="step1" />}
          {step === 1 && <Step2WriteExclusive key="step2" />}
          {step === 2 && <Step3Plus key="step3" />}
          {step === 3 && <Step4Binary key="step4" />}
        </AnimatePresence>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button onClick={() => { setPlaying(false); setStep(0); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <RotateCcw className="size-3.5" />
          </button>
          <button onClick={() => go(-1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <ChevronLeft className="size-3.5" />
          </button>
          <button onClick={() => setPlaying(!playing)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button onClick={() => go(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {step + 1} / {totalSteps}
        </div>
      </div>
    </div>
  );
}

function Step1Read() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 font-mono text-[13px] shadow-sm w-full max-w-md text-center">
        open('data.txt', <span className="text-sky-400 font-bold">'r'</span>)
      </div>
      
      <div className="flex justify-center gap-6 w-full max-w-2xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm">
           <h4 className="font-mono text-xs uppercase tracking-widest text-sky-500 mb-4 font-bold flex items-center gap-2"><FileText className="size-4" /> Default: Read Mode</h4>
           
           <div className="flex flex-wrap gap-2 justify-center mb-6">
             <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[11px] font-mono border border-sky-500/30">CAN READ</span>
             <span className="px-2 py-1 rounded bg-surface-2 text-muted-foreground/50 text-[11px] font-mono border border-hairline line-through">CAN WRITE</span>
           </div>

           <div className="text-sm text-muted-foreground/90 space-y-3 text-center">
             <p>The cursor starts at the <strong>beginning</strong> of the file.</p>
             <div className="flex items-center justify-center text-rose-500 gap-1.5 text-xs bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 mt-4">
               <ShieldAlert className="size-4" /> Fails if file does not exist
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  )
}

function Step2WriteExclusive() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 font-mono text-[13px] shadow-sm w-full max-w-md text-center">
        open('data.txt', <span className="text-rose-400 font-bold">'w'</span>) vs open('data.txt', <span className="text-amber font-bold">'x'</span>)
      </div>
      
      <div className="flex gap-4 w-full max-w-3xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm">
           <h4 className="font-mono text-xs uppercase tracking-widest text-rose-500 mb-4 font-bold flex items-center gap-2">Write ('w')</h4>
           <div className="flex flex-wrap gap-2 justify-center mb-6">
             <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-mono border border-rose-500/30">CAN WRITE</span>
             <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-mono border border-rose-500/30">TRUNCATES</span>
           </div>
           <p className="text-xs text-muted-foreground/90 text-center">Creates file if missing. <br/>If it exists, <strong>wipes it clean</strong> instantly.</p>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-amber/5 border border-amber/20 flex flex-col items-center shadow-sm">
           <h4 className="font-mono text-xs uppercase tracking-widest text-amber mb-4 font-bold flex items-center gap-2"><Lock className="size-4" /> Exclusive ('x')</h4>
           <div className="flex flex-wrap gap-2 justify-center mb-6">
             <span className="px-2 py-1 rounded bg-amber/20 text-amber text-[11px] font-mono border border-amber/30">CAN WRITE</span>
             <span className="px-2 py-1 rounded bg-amber/20 text-amber text-[11px] font-mono border border-amber/30">SAFE CREATE</span>
           </div>
           <p className="text-xs text-muted-foreground/90 text-center">Creates file if missing. <br/>If it exists, <strong>fails with an error</strong> to protect data.</p>
        </div>
      </div>
    </motion.div>
  )
}

function Step3Plus() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-violet/30 bg-violet/5 font-mono text-[13px] shadow-sm w-full max-w-md text-center flex justify-center items-center gap-4">
        <span><span className="text-violet font-bold">'r+'</span> (Read & Write)</span>
        <span className="text-muted-foreground/40">|</span>
        <span><span className="text-violet font-bold">'w+'</span> (Write & Read)</span>
      </div>
      
      <div className="flex justify-center gap-6 w-full max-w-2xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm">
           <h4 className="font-mono text-xs uppercase tracking-widest text-violet mb-4 font-bold flex items-center gap-2">The '+' Modifier</h4>
           
           <div className="flex flex-wrap gap-2 justify-center mb-6">
             <span className="px-2 py-1 rounded bg-violet/20 text-violet text-[11px] font-mono border border-violet/30">CAN READ</span>
             <span className="px-2 py-1 rounded bg-violet/20 text-violet text-[11px] font-mono border border-violet/30 flex items-center gap-1">AND</span>
             <span className="px-2 py-1 rounded bg-violet/20 text-violet text-[11px] font-mono border border-violet/30">CAN WRITE</span>
           </div>

           <div className="text-sm text-muted-foreground/90 space-y-3 text-center">
             <p>Adding <code className="text-violet bg-violet/10 px-1 rounded">+</code> to any mode adds the missing capability.</p>
             <p className="text-xs"><code>'r+'</code> reads and writes without truncating.<br/><code>'w+'</code> reads and writes but truncates first.</p>
           </div>
        </div>
      </div>
    </motion.div>
  )
}

function Step4Binary() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 font-mono text-[13px] shadow-sm w-full max-w-md text-center">
        open('image.jpg', <span className="text-emerald-400 font-bold">'rb'</span>)
      </div>
      
      <div className="flex gap-4 w-full max-w-3xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
           <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 font-bold">Text Mode ('t')</h4>
           <div className="p-3 bg-surface-2 rounded font-mono text-[10px] text-muted-foreground mb-4 w-full text-center">
             "Hello, World!\n"
           </div>
           <p className="text-xs text-muted-foreground/80 text-center">Default. Decodes bytes into strings using an encoding (like UTF-8).</p>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center shadow-sm">
           <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-4 font-bold flex items-center gap-2"><Cpu className="size-4" /> Binary Mode ('b')</h4>
           <div className="p-3 bg-surface border border-emerald-500/20 rounded font-mono text-[10px] text-emerald-500 mb-4 w-full text-center tracking-widest break-words leading-relaxed">
             48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21 0a
           </div>
           <p className="text-xs text-muted-foreground/90 text-center">Raw bytes. Essential for non-text files like <strong>images, PDFs, or zips</strong>.</p>
        </div>
      </div>
    </motion.div>
  )
}
