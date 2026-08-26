import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Crosshair, ArrowRightCircle } from "lucide-react";

export function FileMethodsCustomAnimation() {
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
          {step === 0 && <Step1Tell key="step1" />}
          {step === 1 && <Step2Seek key="step2" />}
          {step === 2 && <Step3ReadSeek key="step3" />}
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

function Step1Tell() {
  const characters = "HELLO WORLD".split('');
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-10 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        file.read(6)<br/>
        pos = file.<span className="text-sky-400 font-bold">tell()</span><br/>
        print(f"Cursor is at byte: {'{pos}'}") <span className="text-muted-foreground"># Cursor is at byte: 6</span>
      </div>
      
      <div className="flex justify-center w-full max-w-2xl relative mt-8">
        <div className="flex gap-1 relative p-4 bg-surface rounded-xl border border-hairline shadow-sm">
          {characters.map((char, i) => (
             <div key={i} className="flex flex-col items-center gap-2">
               <div className={`w-8 h-10 flex items-center justify-center font-mono font-bold text-lg rounded ${i < 6 ? 'bg-surface-2 text-muted-foreground/40' : 'bg-surface border border-hairline text-foreground'}`}>
                 {char === ' ' ? '␣' : char}
               </div>
               <div className="text-[9px] font-mono text-muted-foreground">{i}</div>
             </div>
          ))}
          
          <motion.div 
             initial={{ x: 0, opacity: 0 }} 
             animate={{ x: 6 * 36, opacity: 1 }} 
             transition={{ duration: 1.2, ease: "easeOut" }}
             className="absolute top-0 bottom-0 flex flex-col items-center justify-start pointer-events-none w-8 -translate-y-6"
             style={{ left: "16px" }}
          >
             <div className="bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap flex items-center gap-1">
               <Crosshair className="size-3" /> tell() = 6
             </div>
             <div className="w-0.5 h-full bg-sky-500 rounded-full" />
          </motion.div>
        </div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-sm text-center"><code>tell()</code> returns the <strong>current byte position</strong> of the cursor.</p>
    </motion.div>
  )
}

function Step2Seek() {
  const characters = "HELLO WORLD".split('');
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-10 p-4 rounded-xl border border-violet/30 bg-violet/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        file.read(6) <span className="text-muted-foreground"># Cursor is at 6</span><br/>
        file.<span className="text-violet font-bold">seek(0)</span> <span className="text-muted-foreground"># Jump back to 0</span><br/>
      </div>
      
      <div className="flex justify-center w-full max-w-2xl relative mt-8">
        <div className="flex gap-1 relative p-4 bg-surface rounded-xl border border-hairline shadow-sm">
          {characters.map((char, i) => (
             <div key={i} className="flex flex-col items-center gap-2">
               <div className="w-8 h-10 flex items-center justify-center font-mono font-bold text-lg rounded bg-surface border border-hairline text-foreground">
                 {char === ' ' ? '␣' : char}
               </div>
               <div className="text-[9px] font-mono text-muted-foreground">{i}</div>
             </div>
          ))}
          
          <motion.div 
             initial={{ x: 6 * 36 }} 
             animate={{ x: 0 }} 
             transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
             className="absolute top-0 bottom-0 flex flex-col items-center justify-start pointer-events-none w-8 -translate-y-6"
             style={{ left: "16px" }}
          >
             <div className="bg-violet text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap flex items-center gap-1">
               <ArrowRightCircle className="size-3" /> seek(0)
             </div>
             <div className="w-0.5 h-full bg-violet rounded-full" />
          </motion.div>
        </div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-sm text-center"><code>seek(0)</code> physically moves the cursor to a specific byte index, allowing you to re-read or overwrite data.</p>
    </motion.div>
  )
}

function Step3ReadSeek() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-10 p-4 rounded-xl border border-mint/30 bg-mint/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        content = file.<span className="text-mint font-bold">read(5)</span> <span className="text-muted-foreground"># Read 5 bytes</span>
      </div>
      
      <div className="flex justify-center w-full max-w-2xl relative mt-8 gap-8 items-center">
        <div className="flex flex-col items-center">
           <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">File System</div>
           <div className="flex gap-1 p-2 bg-surface rounded border border-hairline">
             {"HELLO WORLD".split('').map((char, i) => (
                <div key={i} className={`w-6 h-8 flex items-center justify-center font-mono font-bold text-sm rounded ${i < 5 ? 'bg-mint/20 text-mint' : 'bg-surface-2 text-muted-foreground/40'}`}>
                  {char === ' ' ? '␣' : char}
                </div>
             ))}
           </div>
        </div>
        
        <ArrowRightCircle className="size-6 text-mint mt-4" />

        <div className="flex flex-col items-center">
           <div className="font-mono text-[10px] uppercase tracking-widest text-mint mb-2 font-bold">Memory</div>
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} 
             animate={{ opacity: 1, scale: 1 }} 
             transition={{ delay: 0.8 }}
             className="px-4 py-2 bg-mint/10 border border-mint/30 rounded font-mono text-sm text-mint font-bold shadow-sm"
           >
             "HELLO"
           </motion.div>
        </div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-sm text-center"><code>read(n)</code> reads exactly <strong>n bytes</strong> and advances the cursor by n. Crucial for binary or huge files.</p>
    </motion.div>
  )
}
