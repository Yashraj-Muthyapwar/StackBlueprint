import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Folder, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Terminal, ArrowRight, ArrowDownRight, FolderOpen } from "lucide-react";

export function WorkingWithPathsCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const totalSteps = 4;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), 4000);
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
          {step === 0 && <Step1Paths key="step1" />}
          {step === 1 && <Step2Cwd key="step2" />}
          {step === 2 && <Step3Builder key="step3" />}
          {step === 3 && <Step4Folders key="step4" />}
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

function Step1Paths() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-8 p-4 rounded-xl border border-violet/30 bg-violet/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        <span className="text-muted-foreground"># Absolute path</span><br/>
        <span className="text-amber">/Users/sam/project/data/contacts.txt</span><br/><br/>
        <span className="text-muted-foreground"># Relative path (starts from CWD)</span><br/>
        <span className="text-amber">data/contacts.txt</span>
      </div>
      
      <div className="flex w-full max-w-lg items-center justify-center p-6 rounded-2xl bg-surface border border-hairline shadow-sm">
        <div className="flex flex-col gap-2 font-mono text-[13px]">
           <div className="flex items-center gap-2 text-muted-foreground"><Folder className="size-4" /> Users</div>
           <div className="flex items-center gap-2 pl-4 text-muted-foreground"><ArrowDownRight className="size-3 opacity-50"/> <Folder className="size-4" /> sam</div>
           <div className="flex items-center gap-2 pl-8 font-semibold text-mint"><ArrowDownRight className="size-3 opacity-50"/> <FolderOpen className="size-4" /> project (CWD)</div>
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
             className="flex items-center gap-2 pl-12 text-violet"
           >
             <ArrowDownRight className="size-3 opacity-50"/> <Folder className="size-4" /> data
           </motion.div>
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
             className="flex items-center gap-2 pl-16 text-amber"
           >
             <ArrowDownRight className="size-3 opacity-50"/> <FileText className="size-4" /> contacts.txt
           </motion.div>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">Absolute paths trace from the root. Relative paths start at your current folder.</p>
    </motion.div>
  )
}

function Step2Cwd() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-8 p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        <span className="text-blue-400">from</span> pathlib <span className="text-blue-400">import</span> Path<br/><br/>
        <span className="text-mint">print</span>(Path.cwd())
      </div>
      
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner w-full max-w-lg text-left">
        <div className="flex items-center gap-2 w-full mb-3 text-muted-foreground/50 border-b border-slate-800 pb-2 font-mono text-xs">
          <Terminal className="size-4" /> Terminal
        </div>
        <div className="w-full font-mono text-[13px] text-green-400">
          $ python script.py<br/>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-2 text-sky-300">
            /Users/sam/project
          </motion.div>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center"><code className="bg-surface-2 px-1 rounded">cwd()</code> (Current Working Directory) is the folder you are in when you run the command, NOT always where the script lives.</p>
    </motion.div>
  )
}

function Step3Builder() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-10 p-4 rounded-xl border border-amber/30 bg-amber/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        data_folder = Path(<span className="text-amber">'data'</span>)<br/>
        contacts_path = data_folder / <span className="text-amber">'contacts.txt'</span>
      </div>
      
      <div className="flex justify-center items-center gap-4 w-full max-w-lg">
        <motion.div 
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-hairline font-mono text-sm text-foreground shadow-sm"
        >
          <Folder className="size-4 text-violet" /> data
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
          <div className="flex items-center justify-center size-8 rounded-full bg-amber/20 text-amber font-mono font-bold text-lg">/</div>
        </motion.div>
        
        <motion.div 
          initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-hairline font-mono text-sm text-foreground shadow-sm"
        >
          <FileText className="size-4 text-mint" /> contacts.txt
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5 }}
        className="mt-8 flex flex-col items-center"
      >
        <ArrowRight className="size-6 text-muted-foreground/50 rotate-90 mb-2" />
        <div className="px-6 py-3 rounded-xl bg-amber/10 border border-amber/30 font-mono text-sm text-amber shadow-sm">
          data/contacts.txt
        </div>
      </motion.div>
      
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">The <code className="bg-surface-2 px-1 rounded">/</code> operator joins parts safely, using <code className="bg-surface-2 px-1 rounded">\</code> on Windows and <code className="bg-surface-2 px-1 rounded">/</code> on Mac/Linux.</p>
    </motion.div>
  )
}

function Step4Folders() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full"
    >
      <div className="mb-8 p-4 rounded-xl border border-mint/30 bg-mint/5 font-mono text-[13px] shadow-sm w-full max-w-lg">
        contacts_path.parent.mkdir(exist_ok=<span className="text-mint">True</span>)<br/><br/>
        <span className="text-blue-400">with</span> contacts_path.open(<span className="text-amber">'w'</span>) <span className="text-blue-400">as</span> file:<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;file.write(<span className="text-amber">'Ada Reed\\n'</span>)
      </div>
      
      <div className="flex gap-4 items-end justify-center w-full max-w-lg">
        <div className="flex flex-col gap-2 font-mono text-[13px] p-6 rounded-2xl bg-surface border border-hairline shadow-sm flex-1">
           <div className="flex items-center gap-2 font-semibold text-mint"><FolderOpen className="size-4" /> project</div>
           <motion.div 
             initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
             className="flex items-center gap-2 pl-4 text-violet bg-violet/10 pr-2 py-1 rounded"
           >
             <ArrowDownRight className="size-3 opacity-50"/> <Folder className="size-4" /> data <span className="text-[10px] uppercase ml-auto tracking-wider text-violet/70">mkdir()</span>
           </motion.div>
           <motion.div 
             initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }}
             className="flex items-center gap-2 pl-8 text-amber bg-amber/10 pr-2 py-1 rounded"
           >
             <ArrowDownRight className="size-3 opacity-50"/> <FileText className="size-4" /> contacts.txt <span className="text-[10px] uppercase ml-auto tracking-wider text-amber/70">open('w')</span>
           </motion.div>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground/80 max-w-sm text-center">You cannot write a file into a folder that doesn't exist yet! Create <code className="bg-surface-2 px-1 rounded">parent</code> folders first.</p>
    </motion.div>
  )
}
