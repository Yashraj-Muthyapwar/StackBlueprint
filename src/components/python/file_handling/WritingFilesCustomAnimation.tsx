import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Cpu, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, HardDrive, ArrowRight, CornerDownRight, XCircle } from "lucide-react";

export function WritingFilesCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const totalSteps = 3;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), 5000);
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
          {step === 0 && <Step1Write key="step1" />}
          {step === 1 && <Step2Append key="step2" />}
          {step === 2 && <Step3Newline key="step3" />}
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

function Step1Write() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(<span className="text-amber">'log.txt'</span>, <span className="text-amber">'w'</span>) <span className="text-blue-400">as</span> file:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;file.write(<span className="text-amber">'New entry\\n'</span>)
      </div>
      
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[160px] shadow-sm relative overflow-hidden">
             <Cpu className="size-8 text-rose-500 mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-500 font-semibold">Memory</span>
             <motion.div 
               className="mt-5 flex flex-col w-full font-mono text-xs text-foreground/90 p-3 bg-surface-2 border border-hairline rounded shadow-sm text-amber"
             >
               "New entry\n"
             </motion.div>
          </div>
        </div>
        
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
            <motion.div
              initial={{ x: -10, opacity: 0 }} animate={{ x: 30, opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <ArrowRight className="size-6 text-rose-500" />
            </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center min-w-[160px] shadow-sm relative">
             <HardDrive className="size-8 text-rose-500 mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-500 font-semibold">Disk</span>
             
             <div className="mt-5 w-full bg-surface border border-rose-500/30 rounded p-3 text-xs font-mono text-muted-foreground/80 leading-relaxed whitespace-pre-wrap relative overflow-hidden">
               <motion.div 
                 initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 0.8, duration: 0.2 }}
                 className="absolute inset-0 bg-surface flex flex-col items-start p-3"
               >
                 <span className="text-muted-foreground line-through decoration-rose-500">Old entry 1</span>
                 <span className="text-muted-foreground line-through decoration-rose-500">Old entry 2</span>
                 <XCircle className="absolute right-2 top-2 size-4 text-rose-500" />
               </motion.div>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-foreground">
                 New entry\n
               </motion.div>
             </div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">Using <code className="bg-surface-2 px-1 rounded text-rose-400">'w'</code> mode will <strong>completely overwrite</strong> the file if it exists, erasing all old data.</p>
    </motion.div>
  )
}

function Step2Append() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-mint/30 bg-mint/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(<span className="text-amber">'log.txt'</span>, <span className="text-amber">'a'</span>) <span className="text-blue-400">as</span> file:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;file.write(<span className="text-amber">'New entry\\n'</span>)
      </div>
      
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[160px] shadow-sm relative overflow-hidden">
             <Cpu className="size-8 text-mint mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint font-semibold">Memory</span>
             <motion.div 
               className="mt-5 flex flex-col w-full font-mono text-xs text-foreground/90 p-3 bg-surface-2 border border-hairline rounded shadow-sm text-amber"
             >
               "New entry\n"
             </motion.div>
          </div>
        </div>
        
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
            <motion.div
              initial={{ x: -10, opacity: 0 }} animate={{ x: 30, opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <ArrowRight className="size-6 text-mint" />
            </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-mint/10 border border-mint/20 flex flex-col items-center min-w-[160px] shadow-sm relative">
             <HardDrive className="size-8 text-mint mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint font-semibold">Disk</span>
             
             <div className="mt-5 w-full bg-surface border border-mint/30 rounded p-3 text-xs font-mono text-muted-foreground/80 leading-relaxed whitespace-pre-wrap relative">
               <div className="text-muted-foreground/50">Old entry 1</div>
               <div className="text-muted-foreground/50">Old entry 2</div>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-mint font-semibold">
                 New entry\n
               </motion.div>
             </div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">Using <code className="bg-surface-2 px-1 rounded text-mint">'a'</code> mode preserves the old data and safely adds the new data to the very end.</p>
    </motion.div>
  )
}

function Step3Newline() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-amber/30 bg-amber/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(<span className="text-amber">'log.txt'</span>, <span className="text-amber">'a'</span>) <span className="text-blue-400">as</span> file:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;file.write(<span className="text-amber">'Apple'</span>)<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;file.write(<span className="text-amber">'Orange'</span>)
      </div>
      
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-amber/10 border border-amber/20 flex flex-col items-center min-w-[200px] shadow-sm relative">
             <HardDrive className="size-8 text-amber mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber font-semibold">Result on Disk</span>
             
             <div className="mt-5 w-full bg-surface border border-amber/30 rounded p-4 text-sm font-mono text-foreground leading-relaxed flex">
               <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Apple</motion.span>
               <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-amber">Orange</motion.span>
             </div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">Because there is no <code className="bg-surface-2 px-1 rounded text-amber">\n</code>, Python does not start a new line. It squashes the text together as <strong>AppleOrange</strong>.</p>
    </motion.div>
  )
}
