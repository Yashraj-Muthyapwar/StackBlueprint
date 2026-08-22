import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Terminal, Cpu, HardDrive, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export function FileBasicsCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const totalSteps = 3;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), 3500);
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
          {step === 0 && <Step1Memory key="step1" />}
          {step === 1 && <Step2Disk key="step2" />}
          {step === 2 && <Step3Read key="step3" />}
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

function Step1Memory() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-violet/30 bg-violet/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-mint">contacts</span> = [<span className="text-amber">'Ada Reed'</span>, <span className="text-amber">'John Doe'</span>, <span className="text-amber">'Bob Smith'</span>]
      </div>
      <div className="flex justify-center gap-16 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-violet/10 border border-violet/20 flex flex-col items-center relative min-w-[160px] shadow-sm">
             <Cpu className="size-8 text-violet mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold">Memory (RAM)</span>
             
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4 }}
               className="mt-5 flex flex-col gap-2 w-full"
             >
               <div className="px-3 py-1.5 rounded bg-surface border border-hairline text-sm shadow-sm text-foreground text-center">Ada Reed</div>
               <div className="px-3 py-1.5 rounded bg-surface border border-hairline text-sm shadow-sm text-foreground text-center">John Doe</div>
               <div className="px-3 py-1.5 rounded bg-surface border border-hairline text-sm shadow-sm text-foreground text-center">Bob Smith</div>
             </motion.div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 opacity-30 saturate-0 pointer-events-none">
          <div className="p-6 rounded-2xl bg-surface-2/40 border border-hairline flex flex-col items-center min-w-[160px]">
             <HardDrive className="size-8 text-muted-foreground mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Disk</span>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">Variables only live in temporary memory. When the script exits, they disappear.</p>
    </motion.div>
  )
}

function Step2Disk() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-mint/30 bg-mint/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(<span className="text-amber">'contacts.txt'</span>, <span className="text-amber">'w'</span>) <span className="text-blue-400">as</span> file:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">for</span> name <span className="text-blue-400">in</span> <span className="text-mint">contacts</span>:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;file.write(name + <span className="text-amber">'\\n'</span>)
      </div>
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-violet/10 border border-violet/20 flex flex-col items-center min-w-[160px] shadow-sm">
             <Cpu className="size-8 text-violet mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold">Memory</span>
             <div className="mt-5 flex flex-col gap-2 w-full">
               <div className="px-3 py-1.5 rounded bg-surface border border-hairline text-sm shadow-sm text-foreground text-center">Ada Reed</div>
               <div className="px-3 py-1.5 rounded bg-surface border border-hairline text-sm shadow-sm text-foreground text-center">John Doe</div>
               <div className="px-3 py-1.5 rounded bg-surface border border-hairline text-sm shadow-sm text-foreground text-center">Bob Smith</div>
             </div>
          </div>
        </div>
        
        {/* Animated flow */}
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 30, opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <ArrowRight className="size-6 text-mint" />
            </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-mint/10 border border-mint/20 flex flex-col items-center min-w-[160px] shadow-sm relative overflow-hidden">
             <HardDrive className="size-8 text-mint mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint font-semibold">Disk</span>
             
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: "auto" }}
               transition={{ delay: 0.8 }}
               className="mt-5 w-full bg-surface border border-mint/30 rounded shadow-inner p-2 relative"
             >
                <div className="text-[10px] uppercase font-mono text-muted-foreground mb-1 border-b border-hairline pb-1 flex items-center gap-1">
                    <FileText className="size-3" /> contacts.txt
                </div>
                <div className="font-mono text-xs text-foreground/80 leading-relaxed">
                   Ada Reed<br/>
                   John Doe<br/>
                   Bob Smith
                </div>
             </motion.div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">Opening in <code className="bg-surface-2 px-1 rounded">"w"</code> mode permanently writes the data to the hard drive.</p>
    </motion.div>
  )
}

function Step3Read() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 font-mono text-sm shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(<span className="text-amber">'contacts.txt'</span>, <span className="text-amber">'r'</span>) <span className="text-blue-400">as</span> file:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;saved = file.read()<br/>
        <br/>
        <span className="text-blue-400">print</span>(saved)
      </div>
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[160px] shadow-sm">
             <HardDrive className="size-8 text-muted-foreground mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Disk</span>
             <div className="mt-5 w-full bg-surface-2 border border-hairline rounded shadow-inner p-2">
                <div className="text-[10px] uppercase font-mono text-muted-foreground mb-1 border-b border-hairline pb-1 flex items-center gap-1">
                    <FileText className="size-3" /> contacts.txt
                </div>
                <div className="font-mono text-xs text-muted-foreground leading-relaxed">
                   Ada Reed<br/>
                   John Doe<br/>
                   Bob Smith
                </div>
             </div>
          </div>
        </div>
        
        {/* Animated flow (reversed) */}
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 30, opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <ArrowRight className="size-6 text-sky-500" />
            </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center min-w-[160px] shadow-sm">
             <Terminal className="size-8 text-sky-500 mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold">Terminal Output</span>
             
             <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: "auto" }}
               transition={{ delay: 0.8 }}
               className="mt-5 flex flex-col w-full font-mono text-xs text-foreground/90 p-3 bg-slate-900 rounded shadow-inner text-green-400 text-left whitespace-nowrap"
             >
               Ada Reed<br/>
               John Doe<br/>
               Bob Smith
             </motion.div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">Using <code className="bg-surface-2 px-1 rounded">"r"</code> mode reads the stored bytes back into a string in memory.</p>
    </motion.div>
  )
}
