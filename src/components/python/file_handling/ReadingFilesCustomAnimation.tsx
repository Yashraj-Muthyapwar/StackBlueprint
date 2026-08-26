import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Cpu, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, HardDrive, ArrowRight, CornerDownRight } from "lucide-react";

export function ReadingFilesCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 3;

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), 5000);
    return () => window.clearTimeout(id);
  }, [playing, step, isHovered]);

  const go = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStep((s) => (s + delta + totalSteps) % totalSteps);
    },
    []
  );

  return (
    <div className="flex flex-col relative z-10 w-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative px-4 py-8 lg:px-8 lg:py-10 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step1Read key="step1" />}
          {step === 1 && <Step2ReadLine key="step2" />}
          {step === 2 && <Step3ReadLines key="step3" />}
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(<span className="text-amber">'poem.txt'</span>) <span className="text-blue-400">as</span> file:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;content = file.read()
      </div>
      
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[160px] shadow-sm relative overflow-hidden">
             <HardDrive className="size-8 text-muted-foreground mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Disk</span>
             <div className="mt-5 w-full bg-surface-2 border border-hairline rounded p-3 text-xs font-mono text-muted-foreground/80 leading-relaxed whitespace-pre-wrap relative">
               <motion.div 
                 initial={{ height: "0%" }} animate={{ height: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }}
                 className="absolute top-0 left-0 w-1 bg-sky-500 rounded-l" 
               />
               Roses are red\nViolets are blue\nPython is awesome
             </div>
          </div>
        </div>
        
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
            <motion.div
              initial={{ x: -10, opacity: 0 }} animate={{ x: 30, opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <ArrowRight className="size-6 text-sky-500" />
            </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex flex-col items-center min-w-[160px] shadow-sm">
             <Cpu className="size-8 text-sky-500 mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-sky-500 font-semibold">Memory</span>
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
               className="mt-5 flex flex-col w-full font-mono text-xs text-foreground/90 p-3 bg-surface border border-hairline rounded shadow-sm text-amber"
             >
               "Roses are red\nViolets are blue\nPython is awesome"
             </motion.div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center"><code>read()</code> pulls the <strong>entire file</strong> into one massive string.</p>
    </motion.div>
  )
}

function Step2ReadLine() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-violet/30 bg-violet/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(<span className="text-amber">'poem.txt'</span>) <span className="text-blue-400">as</span> file:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;line1 = file.readline()
      </div>
      
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[160px] shadow-sm relative overflow-hidden">
             <HardDrive className="size-8 text-muted-foreground mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Disk</span>
             <div className="mt-5 w-full bg-surface-2 border border-hairline rounded p-3 text-xs font-mono text-muted-foreground/80 leading-relaxed whitespace-pre-wrap relative">
               <motion.div 
                 initial={{ height: "0%" }} animate={{ height: "33%" }} transition={{ duration: 0.5, ease: "easeOut" }}
                 className="absolute top-0 left-0 w-1 bg-violet rounded-l" 
               />
               <span className="text-foreground">Roses are red\n</span>Violets are blue\nPython is awesome
             </div>
          </div>
        </div>
        
        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 flex gap-1 z-20">
            <motion.div
              initial={{ x: -10, opacity: 0 }} animate={{ x: 30, opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <ArrowRight className="size-6 text-violet" />
            </motion.div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-violet/10 border border-violet/20 flex flex-col items-center min-w-[160px] shadow-sm">
             <Cpu className="size-8 text-violet mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet font-semibold">Memory</span>
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
               className="mt-5 flex flex-col w-full font-mono text-xs text-foreground/90 p-3 bg-surface border border-hairline rounded shadow-sm text-amber"
             >
               "Roses are red\n"
             </motion.div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center"><code>readline()</code> pulls just one line and advances the cursor to the next line.</p>
    </motion.div>
  )
}

function Step3ReadLines() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-mint/30 bg-mint/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        <span className="text-blue-400">with</span> <span className="text-blue-400">open</span>(<span className="text-amber">'poem.txt'</span>) <span className="text-blue-400">as</span> file:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;lines_list = file.readlines()
      </div>
      
      <div className="flex justify-center gap-8 lg:gap-16 w-full max-w-2xl relative">
        <div className="flex flex-col items-center gap-3">
          <div className="p-6 rounded-2xl bg-surface border border-hairline flex flex-col items-center min-w-[160px] shadow-sm relative overflow-hidden">
             <HardDrive className="size-8 text-muted-foreground mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Disk</span>
             <div className="mt-5 w-full bg-surface-2 border border-hairline rounded p-3 text-xs font-mono text-muted-foreground/80 leading-relaxed whitespace-pre-wrap relative">
               <motion.div 
                 initial={{ height: "0%" }} animate={{ height: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }}
                 className="absolute top-0 left-0 w-1 bg-mint rounded-l" 
               />
               Roses are red\nViolets are blue\nPython is awesome
             </div>
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
          <div className="p-6 rounded-2xl bg-mint/10 border border-mint/20 flex flex-col items-center min-w-[160px] shadow-sm">
             <Cpu className="size-8 text-mint mb-3" />
             <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint font-semibold">Memory</span>
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
               className="mt-5 flex flex-col w-full font-mono text-[10px] text-foreground/90 p-3 bg-surface border border-hairline rounded shadow-sm text-amber whitespace-nowrap"
             >
               [<br/>
               &nbsp;&nbsp;"Roses are red\n",<br/>
               &nbsp;&nbsp;"Violets are blue\n",<br/>
               &nbsp;&nbsp;"Python is awesome"<br/>
               ]
             </motion.div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center"><code>readlines()</code> pulls everything into a <strong>list of strings</strong> (each element is one line).</p>
    </motion.div>
  )
}
