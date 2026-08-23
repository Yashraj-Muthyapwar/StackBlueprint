import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Folder, FileText, File, ListTree, Search, Eye } from "lucide-react";

export function OSModuleCustomAnimation() {
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
      <div className="relative px-4 py-8 lg:px-8 lg:py-10 min-h-[460px] flex flex-col items-center justify-start w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step1ListDir key="step1" />}
          {step === 1 && <Step2IsFile key="step2" />}
          {step === 2 && <Step3Walk key="step3" />}
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

function Step1ListDir() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-sky-500/30 bg-surface shadow-sm w-full max-w-md text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Get only the immediate children</span><br/>
        <span className="text-mint font-medium">import</span> <span className="text-blue-400">os</span><br/>
        files = os.<span className="text-blue-400">listdir</span>(<span className="text-amber">'./project'</span>)<br/>
        <span className="text-mint font-medium">print</span>(files)
      </div>
      
      <div className="flex justify-center gap-6 w-full max-w-2xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col shadow-sm font-mono text-sm">
           <h4 className="text-xs uppercase tracking-widest text-sky-500 mb-4 font-bold flex items-center gap-2 border-b border-hairline pb-2"><ListTree className="size-4" /> os.listdir()</h4>
           
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-400"><Folder className="size-4" /> project</div>
             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 pl-6 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300">
               <FileText className="size-4" /> README.md
             </motion.div>
             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex items-center gap-2 pl-6 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300">
               <Folder className="size-4" /> src
             </motion.div>
             <div className="flex items-center gap-2 pl-12 py-1 text-muted-foreground/70">
               <FileText className="size-4" /> main.py <span className="text-[10px] uppercase ml-2 font-semibold opacity-70">(Ignored)</span>
             </div>
             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 }} className="flex items-center gap-2 pl-6 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300">
               <File className="size-4" /> config.yaml
             </motion.div>
           </div>
           
           <div className="mt-6 font-mono text-[11px] text-sky-700 dark:text-sky-400 p-2 bg-sky-500/10 rounded border border-sky-500/20 text-center">
             ['README.md', 'src', 'config.yaml']
           </div>
        </div>
      </div>
    </motion.div>
  )
}

function Step2IsFile() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-rose-500/30 bg-surface shadow-sm w-full max-w-md text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Check if a path is a file or folder</span><br/>
        <span className="text-mint font-medium">import</span> <span className="text-blue-400">os</span><br/>
        is_file = os.path.<span className="text-blue-400">isfile</span>(<span className="text-amber">'README.md'</span>)<br/>
        is_dir = os.path.<span className="text-blue-400">isdir</span>(<span className="text-amber">'src'</span>)
      </div>
      
      <div className="flex gap-4 w-full max-w-3xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm">
           <h4 className="font-mono text-xs uppercase tracking-widest text-indigo-500 mb-4 font-bold flex items-center gap-2"><Eye className="size-4" /> os.path.isfile()</h4>
           <div className="flex flex-col items-center gap-3 w-full">
             <div className="flex items-center gap-2 w-full p-2 border border-hairline rounded bg-surface-2 text-muted-foreground font-mono text-sm justify-center">
               <FileText className="size-4" /> README.md
             </div>
             <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: "spring" }} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/30">
               True
             </motion.div>
           </div>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm">
           <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-4 font-bold flex items-center gap-2"><Search className="size-4" /> os.path.isdir()</h4>
           <div className="flex flex-col items-center gap-3 w-full">
             <div className="flex items-center gap-2 w-full p-2 border border-hairline rounded bg-surface-2 text-muted-foreground font-mono text-sm justify-center">
               <Folder className="size-4" /> src
             </div>
             <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, type: "spring" }} className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
               True
             </motion.div>
           </div>
        </div>
      </div>
    </motion.div>
  )
}

function Step3Walk() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-violet/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Recursively visit EVERY folder</span><br/>
        <span className="text-mint font-medium">for</span> root, dirs, files <span className="text-mint font-medium">in</span> os.<span className="text-blue-400">walk</span>(<span className="text-amber">'./project'</span>):<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">print</span>(root, files)
      </div>
      
      <div className="flex justify-center gap-6 w-full max-w-2xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col shadow-sm font-mono text-sm">
           
           <h4 className="text-xs uppercase tracking-widest text-violet mb-4 font-bold flex items-center gap-2 border-b border-hairline pb-2 relative z-10"><ListTree className="size-4" /> os.walk()</h4>

           <div className="relative overflow-hidden pb-2 -mx-5 px-5">
             <motion.div 
               initial={{ y: 15 }} animate={{ y: 200 }} transition={{ duration: 3.5, ease: "linear", repeat: Infinity }}
               className="absolute top-0 left-0 w-full h-[2px] bg-violet shadow-[0_0_15px_3px_rgba(139,92,246,0.6)] z-0 pointer-events-none" 
             />
             
             <div className="flex flex-col gap-2 relative z-10">
             <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ delay: 0 }} className="flex items-center gap-2 font-bold text-violet"><Folder className="size-4" /> project</motion.div>
             <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ delay: 0 }} className="flex items-center gap-2 pl-6 py-1 text-violet/80"><FileText className="size-4" /> README.md</motion.div>
             <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-2 pl-6 py-1 font-bold text-violet mt-1"><Folder className="size-4" /> src</motion.div>
             <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 1, color: "var(--violet)" }} transition={{ delay: 0.8 }} className="flex items-center gap-2 pl-12 py-1 text-muted-foreground"><FileText className="size-4" /> main.py</motion.div>
             <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 1, color: "var(--violet)" }} transition={{ delay: 1.6 }} className="flex items-center gap-2 pl-12 py-1 font-bold text-muted-foreground mt-1"><Folder className="size-4" /> utils</motion.div>
             <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 1, color: "var(--violet)" }} transition={{ delay: 1.6 }} className="flex items-center gap-2 pl-16 py-1 text-muted-foreground"><FileText className="size-4" /> helper.py</motion.div>
           </div>
           </div>
           
           <div className="mt-6 font-mono text-[10px] text-violet-700 dark:text-violet-400 p-3 bg-violet-500/10 rounded border border-violet-500/20 flex flex-col gap-1 relative z-10 text-left">
             <div>./project ['src'] ['README.md']</div>
             <div>./project/src ['utils'] ['main.py']</div>
             <div>./project/src/utils [] ['helper.py']</div>
           </div>
        </div>
      </div>
    </motion.div>
  )
}
