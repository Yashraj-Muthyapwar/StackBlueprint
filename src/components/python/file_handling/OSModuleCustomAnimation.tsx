import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Folder, FileText, File, ListTree, Search, Eye, Server, Laptop, Database, Key, Trash2, CheckCircle2, AlertCircle, FolderSearch, Clock, Hash, Lock, Replace, Terminal, ShieldAlert, Fingerprint, FolderTree } from "lucide-react";

export function OSModuleCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const totalSteps = 8;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), 7000);
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
          {step === 0 && <Step1EnvPath key="step1" />}
          {step === 1 && <Step2ListdirVsScandir key="step2" />}
          {step === 2 && <Step3Walk key="step3" />}
          {step === 3 && <Step4Makedirs key="step4" />}
          {step === 4 && <Step5Inspect key="step5" />}
          {step === 5 && <Step6Stat key="step6" />}
          {step === 6 && <Step7Secure key="step7" />}
          {step === 7 && <Step8Cleanup key="step8" />}
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

function Step1EnvPath() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-sky-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Resolve configured paths safely</span><br />
        <span className="text-mint font-medium">import</span> <span className="text-blue-400">os</span><br />
        project = os.<span className="text-blue-400">getenv</span>(<span className="text-amber">"PROJECT_DIR"</span>, <span className="text-amber">"data"</span>)<br />
        workspace = os.path.<span className="text-blue-400">abspath</span>(project)
      </div>

      <div className="flex gap-4 w-full max-w-3xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm">
          <h4 className="font-mono text-xs uppercase tracking-widest text-amber mb-4 font-bold flex items-center gap-2"><Laptop className="size-4" /> Local Run</h4>
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2 w-full p-2 border border-hairline rounded bg-surface-2 text-muted-foreground font-mono text-sm justify-center">
              No PROJECT_DIR set
            </div>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: "spring" }} className="px-3 py-1 rounded-full bg-amber/20 text-amber font-mono text-xs font-bold border border-amber/30 text-center">
              workspace = "/Users/dev/data"
            </motion.div>
          </div>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm">
          <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-4 font-bold flex items-center gap-2"><Server className="size-4" /> Production</h4>
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2 w-full p-2 border border-hairline rounded bg-surface-2 text-emerald-500 font-mono text-sm justify-center font-bold">
              PROJECT_DIR="/var/exports"
            </div>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, type: "spring" }} className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 font-mono text-xs font-bold border border-emerald-500/30 text-center">
              workspace = "/var/exports"
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step2ListdirVsScandir() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-sky-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Legacy flat iteration (just names)</span><br />
        names = os.<span className="text-blue-400">listdir</span>(<span className="text-amber">'./project'</span>)<br />
        <br />
        <span className="text-muted-foreground"># Modern flat iteration (fast cached metadata)</span><br />
        <span className="text-mint font-medium">with</span> os.<span className="text-blue-400">scandir</span>(<span className="text-amber">'./project'</span>) <span className="text-mint font-medium">as</span> entries:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">for</span> entry <span className="text-mint font-medium">in</span> entries:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">print</span>(entry.name, entry.is_dir())
      </div>

      <div className="flex gap-4 w-full max-w-4xl">
        {/* listdir */}
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
              <FileText className="size-4" /> main.py <span className="text-[10px] uppercase ml-2 font-semibold opacity-70">(Not visited)</span>
            </div>
          </div>

          <div className="mt-6 font-mono text-[11px] text-sky-700 dark:text-sky-400 p-2 bg-sky-500/10 rounded border border-sky-500/20 text-center flex-1 flex items-center justify-center">
            ['README.md', 'src']
          </div>
        </div>

        {/* scandir */}
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col shadow-sm font-mono text-sm">
          <h4 className="text-xs uppercase tracking-widest text-amber mb-4 font-bold flex items-center gap-2 border-b border-hairline pb-2"><FolderSearch className="size-4" /> os.scandir()</h4>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-amber"><Folder className="size-4" /> project</div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-between pl-6 py-1 rounded bg-amber/10 border border-amber/30 text-amber">
              <div className="flex items-center gap-2"><FileText className="size-4" /> README.md</div>
              <span className="text-[10px] uppercase font-bold pr-2">is_dir() = False</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex items-center justify-between pl-6 py-1 rounded bg-amber/10 border border-amber/30 text-amber">
              <div className="flex items-center gap-2"><Folder className="size-4" /> src</div>
              <span className="text-[10px] uppercase font-bold pr-2">is_dir() = True</span>
            </motion.div>
            <div className="flex items-center gap-2 pl-12 py-1 text-muted-foreground/70">
              <FileText className="size-4" /> main.py <span className="text-[10px] uppercase ml-2 font-semibold opacity-70">(Not visited)</span>
            </div>
          </div>

          <div className="mt-6 font-mono text-[11px] text-amber p-2 bg-amber/10 rounded border border-amber/30 flex-1 flex items-center justify-center">
            <div className="text-center font-bold leading-relaxed">
               README.md False<br/>
               src True
            </div>
          </div>
        </div>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-4 font-mono text-[13px] text-amber p-3 bg-amber/10 rounded-xl border border-amber/30 w-full max-w-4xl text-center shadow-sm">
         <span className="font-bold">os.scandir()</span> yields DirEntry objects with fast cached metadata. <br/>
         <span className="italic opacity-90">Avoids extra os.stat() calls for file types!</span>
      </motion.div>
    </motion.div>
  );
}

function Step3Walk() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-violet/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Recursively visit EVERY folder</span><br />
        <span className="text-mint font-medium">for</span> root, dirs, files <span className="text-mint font-medium">in</span> os.<span className="text-blue-400">walk</span>(<span className="text-amber">'./project'</span>):<br />
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
  );
}

function Step4Makedirs() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Idempotent directory creation</span><br />
        os.<span className="text-blue-400">makedirs</span>(<span className="text-amber">"data/exports"</span>, exist_ok=<span className="text-purple-400">True</span>)<br />
        os.<span className="text-blue-400">chdir</span>(<span className="text-amber">"data/exports"</span>)
      </div>

      <div className="flex gap-4 w-full max-w-3xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm">
          <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-4 font-bold flex items-center gap-2"><FolderTree className="size-4" /> Run 1</h4>
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="text-muted-foreground font-mono text-sm">
              Directory does not exist
            </div>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: "spring" }} className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 font-mono text-xs font-bold border border-emerald-500/30">
              <CheckCircle2 className="size-3" /> Created "data/exports"
            </motion.div>
          </div>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col items-center shadow-sm">
          <h4 className="font-mono text-xs uppercase tracking-widest text-blue-500 mb-4 font-bold flex items-center gap-2"><FolderTree className="size-4" /> Run 2</h4>
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="text-muted-foreground font-mono text-sm">
              Directory already exists
            </div>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, type: "spring" }} className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 font-mono text-xs font-bold border border-blue-500/30">
              <CheckCircle2 className="size-3" /> Safely ignored (No-op)
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step5Inspect() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-indigo-500/30 bg-surface shadow-sm w-full max-w-md text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Check identity and decompose paths</span><br />
        is_f = os.path.<span className="text-blue-400">isfile</span>(<span className="text-amber">'README.md'</span>)<br />
        is_d = os.path.<span className="text-blue-400">isdir</span>(<span className="text-amber">'src'</span>)<br />
        root, ext = os.path.<span className="text-blue-400">splitext</span>(<span className="text-amber">'main.py'</span>)
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
          <h4 className="font-mono text-xs uppercase tracking-widest text-emerald-500 mb-4 font-bold flex items-center gap-2"><Search className="size-4" /> os.path.splitext()</h4>
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2 w-full p-2 border border-hairline rounded bg-surface-2 text-muted-foreground font-mono text-sm justify-center">
              <FileText className="size-4" /> main.py
            </div>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, type: "spring" }} className="flex gap-1 text-xs font-mono font-bold">
              <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">'main'</span>
              <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-500 border border-sky-500/30">'.py'</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step6Stat() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-amber/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Inspect deep metadata</span><br />
        metadata = os.<span className="text-blue-400">stat</span>(<span className="text-amber">"config.json"</span>)<br />
        <span className="text-mint font-medium">print</span>(metadata.st_size, metadata.st_mtime)<br />
        mode = oct(metadata.st_mode & 0o777)
      </div>

      <div className="w-full max-w-2xl bg-surface border border-hairline rounded-xl p-5 shadow-sm font-mono text-sm">
        <h4 className="text-xs uppercase tracking-widest text-amber mb-4 font-bold flex items-center gap-2 border-b border-hairline pb-2"><Fingerprint className="size-4" /> os.stat()</h4>

        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 p-3 bg-surface-2 border border-hairline rounded">
            <Hash className="size-4 text-amber" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground">st_size</span>
              <span>1024 bytes</span>
            </div>
          </motion.div>

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-3 p-3 bg-surface-2 border border-hairline rounded">
            <Clock className="size-4 text-sky-500" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground">st_mtime</span>
              <span>1714521000.0</span>
            </div>
          </motion.div>

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }} className="flex items-center gap-3 p-3 bg-surface-2 border border-hairline rounded col-span-2">
            <Lock className="size-4 text-rose-500" />
            <div className="flex flex-col flex-1">
              <span className="text-[10px] uppercase text-muted-foreground">st_mode (Permissions & Type)</span>
              <span className="text-rose-500 font-bold">33188 <span className="text-muted-foreground font-normal ml-2"># oct(mode & 0o777) == '0o644'</span></span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Step7Secure() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-purple-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Secure & update files predictably</span><br />
        os.<span className="text-blue-400">chmod</span>(<span className="text-amber">"settings.json"</span>, 0o600)<br />
        <span className="text-muted-foreground"># Atomically swap a fully written temp file</span><br />
        os.<span className="text-blue-400">replace</span>(<span className="text-amber">"settings.tmp"</span>, <span className="text-amber">"settings.json"</span>)
      </div>

      <div className="flex gap-4 w-full max-w-2xl">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col gap-4 p-5 rounded-2xl border border-purple-500/30 bg-purple-500/10 shadow-sm items-center justify-center text-center">
          <Lock className="size-8 text-purple-500" />
          <div className="font-mono text-sm">
            <div className="font-bold text-purple-500">0o600</div>
            <div className="text-xs text-muted-foreground mt-1 px-4">Locks access to owner only (POSIX).</div>
          </div>
        </motion.div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline shadow-sm flex flex-col font-mono">
          <h4 className="text-xs uppercase tracking-widest text-emerald-500 mb-4 font-bold flex items-center gap-2 border-b border-hairline pb-2"><Replace className="size-4" /> Atomic Update</h4>
          <div className="flex items-center justify-between gap-4 h-full">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }} className="flex-1 p-3 border border-hairline bg-surface-2 rounded-xl text-center">
              <div className="text-[10px] text-muted-foreground">settings.tmp</div>
              <div className="mt-2 text-[10px] bg-amber/20 text-amber px-2 py-1 rounded inline-block font-bold">Writing...</div>
            </motion.div>

            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5 }}>
              <ChevronRight className="size-5 text-emerald-500" />
            </motion.div>

            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }} className="flex-1 p-3 border border-hairline bg-surface-2 rounded-xl text-center relative">
              <div className="text-[10px] text-muted-foreground">settings.json</div>
              <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 1.8, duration: 0.1 }} className="mt-2 text-[10px] bg-rose-500/20 text-rose-500 px-2 py-1 rounded inline-block">Old</motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 0.1 }} className="mt-2 text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded inline-block absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-bold shadow-md">Atomic Swap!</motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step8Cleanup() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># Delete narrowly and deliberately</span><br />
        os.<span className="text-blue-400">unlink</span>(temporary_file) <span className="text-muted-foreground"># One file</span><br />
        os.<span className="text-blue-400">rmdir</span>(empty_dir) <span className="text-muted-foreground"># Fails if not empty</span><br />
        shutil.<span className="text-blue-400">rmtree</span>(workspace) <span className="text-muted-foreground"># Nukes everything</span>
      </div>

      <div className="flex justify-center gap-6 w-full max-w-2xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col shadow-sm font-mono text-sm relative">
          <h4 className="text-xs uppercase tracking-widest text-rose-500 mb-4 font-bold flex items-center gap-2 border-b border-hairline pb-2"><Trash2 className="size-4" /> Narrow vs Broad Cleanup</h4>

          <div className="flex flex-col gap-3 mt-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-between p-3 bg-surface-2 border border-hairline rounded-xl">
              <div>
                <div className="font-bold text-sky-500 flex items-center gap-2"><FileText className="size-3" /> os.unlink(file)</div>
                <div className="text-[10px] text-muted-foreground mt-1">Removes a single known file.</div>
              </div>
              <div className="px-2 py-1 text-[10px] bg-sky-500/20 text-sky-500 rounded uppercase font-bold tracking-wider">Safe</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex items-center justify-between p-3 bg-surface-2 border border-hairline rounded-xl">
              <div>
                <div className="font-bold text-amber flex items-center gap-2"><Folder className="size-3" /> os.rmdir(empty_dir)</div>
                <div className="text-[10px] text-muted-foreground mt-1">Fails safely if dir is not empty.</div>
              </div>
              <div className="px-2 py-1 text-[10px] bg-amber/20 text-amber rounded uppercase font-bold tracking-wider">Safe</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <div>
                <div className="font-bold text-rose-500 flex items-center gap-2"><AlertCircle className="size-3" /> shutil.rmtree(workspace)</div>
                <div className="text-[10px] text-rose-400 mt-1">Nukes directory and all contents recursively.</div>
              </div>
              <div className="px-2 py-1 text-[10px] bg-rose-500/20 text-rose-500 rounded uppercase font-bold tracking-wider">Danger</div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
