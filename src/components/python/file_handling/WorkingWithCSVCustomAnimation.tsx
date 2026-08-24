import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, FileText, Database, ShieldAlert, CheckCircle2, AlertCircle, FileDigit, Replace } from "lucide-react";

export function WorkingWithCSVCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const totalSteps = 3;

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
      <div className="relative px-4 py-8 lg:px-8 lg:py-10 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step1Flow key="step1" />}
          {step === 1 && <Step2Validation key="step2" />}
          {step === 2 && <Step3Atomic key="step3" />}
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

function Step1Flow() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-2xl gap-6">
      <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-500 font-bold flex items-center gap-2"><Database className="size-4" /> Python Dict to CSV</h4>
      
      <div className="flex gap-4 w-full">
        <div className="flex-1 p-4 rounded-xl bg-surface-2 border border-hairline font-mono text-xs flex flex-col gap-2">
           <div className="text-muted-foreground uppercase text-[10px] tracking-wider mb-2">Python Dictionary</div>
           <div><span className="text-blue-400">"name"</span>: <span className="text-amber">"Lee Park"</span></div>
           <div><span className="text-blue-400">"email"</span>: <span className="text-amber">"lee@example.com"</span></div>
           <div><span className="text-blue-400">"note"</span>: <span className="text-amber">"Calls, not email"</span></div>
        </div>

        <div className="flex flex-col justify-center text-muted-foreground">
          <ChevronRight className="size-6" />
        </div>

        <div className="flex-1 p-4 rounded-xl bg-surface border border-emerald-500/30 shadow-sm font-mono text-xs flex flex-col gap-2 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
           <div className="text-emerald-500 uppercase text-[10px] tracking-wider mb-2 font-bold">CSV Output</div>
           <div className="text-muted-foreground border-b border-hairline pb-1">name,email,note</div>
           <div>Lee Park,lee@example.com,<span className="bg-amber/20 text-amber px-1 rounded">"Calls, not email"</span></div>
           <div className="text-[10px] text-amber mt-4 italic">Automatically quoted because of the comma!</div>
        </div>
      </div>
    </motion.div>
  );
}

function Step2Validation() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-2xl gap-6">
      <h4 className="font-mono text-xs uppercase tracking-widest text-blue-500 font-bold flex items-center gap-2"><ShieldAlert className="size-4" /> Schema Contract</h4>
      
      <div className="w-full p-4 rounded-xl bg-surface-2 border border-hairline font-mono text-sm flex flex-col gap-4">
         <div className="flex items-center gap-3 border-b border-hairline pb-3 text-muted-foreground">
            <div className="w-8">Row</div>
            <div className="flex-1 grid grid-cols-3">
               <div>name</div>
               <div>email <span className="text-rose-500">*</span></div>
               <div>note</div>
            </div>
         </div>
         
         <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-3">
            <div className="w-8 text-emerald-500"><CheckCircle2 className="size-4" /></div>
            <div className="flex-1 grid grid-cols-3 p-2 bg-emerald-500/10 rounded border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
               <div>Ari Stone</div>
               <div>ari@test.com</div>
               <div>(empty)</div>
            </div>
         </motion.div>

         <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 }} className="flex items-center gap-3">
            <div className="w-8 text-rose-500"><AlertCircle className="size-4" /></div>
            <div className="flex-1 grid grid-cols-3 p-2 bg-rose-500/10 rounded border border-rose-500/20 text-rose-500">
               <div>Lee Park</div>
               <div className="font-bold underline decoration-rose-500 decoration-wavy">(missing)</div>
               <div>Calls</div>
            </div>
         </motion.div>
         
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-2 text-rose-500 text-xs italic flex items-center gap-2">
            ValueError: Missing email on CSV line 3.
         </motion.div>
      </div>
    </motion.div>
  );
}

function Step3Atomic() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-2xl gap-8">
      <h4 className="font-mono text-xs uppercase tracking-widest text-purple-500 font-bold flex items-center gap-2"><Replace className="size-4" /> Atomic Replacement</h4>
      
      <div className="flex flex-col gap-6 w-full font-mono text-sm">
         <div className="flex items-center gap-4">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 p-4 border border-hairline rounded bg-surface-2 flex flex-col items-center gap-2">
               <FileText className="size-6 text-muted-foreground" />
               <span className="text-xs">contacts.csv (old)</span>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} transition={{ delay: 0.5 }} className="text-xs text-muted-foreground">
               writing to...
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }} className="flex-1 p-4 border border-amber/30 bg-amber/10 text-amber rounded flex flex-col items-center gap-2 relative">
               <FileDigit className="size-6" />
               <span className="text-xs">contacts.tmp</span>
               <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber animate-ping"></div>
            </motion.div>
         </div>

         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5 }} className="flex items-center justify-center p-4 border border-purple-500/30 bg-purple-500/10 text-purple-500 dark:text-purple-400 rounded-xl gap-3">
            <Replace className="size-5" />
            <span>os.replace('contacts.tmp', 'contacts.csv')</span>
         </motion.div>
      </div>
    </motion.div>
  );
}
