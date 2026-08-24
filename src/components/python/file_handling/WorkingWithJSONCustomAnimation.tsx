import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ListTree, Filter, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, 
  FileJson, ArrowRightLeft, ShieldCheck, Settings, AlertTriangle, 
  FileText, CheckCircle2, XCircle, Database, Braces, FileCode, 
  Server, FileWarning, HelpCircle, AlertCircle, ShieldAlert,
  AlignLeft, Minimize2, SplitSquareHorizontal, Zap, Package
} from "lucide-react";

export function WorkingWithJSONCustomAnimation() {
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
          {step === 0 && <Step1StringConvert key="step1" />}
          {step === 1 && <Step2FileConvert key="step2" />}
          {step === 2 && <Step3ReadableCompact key="step3" />}
          {step === 3 && <Step4ErrorAndValidation key="step4" />}
          {step === 4 && <Step5AtomicWrite key="step5" />}
          {step === 5 && <Step6Dataclass key="step6" />}
          {step === 6 && <Step7ObjectHook key="step7" />}
          {step === 7 && <Step8JsonLines key="step8" />}
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

function Step1StringConvert() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-sky-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 1. Serialize in-memory Python objects to JSON strings</span><br />
        <span className="text-mint font-medium">import</span> <span className="text-blue-400">json</span><br />
        document = json.<span className="text-blue-400">dumps</span>(settings, indent=<span className="text-purple-400">2</span>)
      </div>

      <div className="flex items-center gap-6 w-full max-w-3xl">
        <div className="flex-1 flex flex-col gap-3 font-mono text-xs p-5 bg-surface rounded-2xl border border-hairline shadow-sm">
           <h4 className="text-xs tracking-widest text-muted-foreground font-bold flex items-center gap-2 border-b border-hairline pb-2 justify-center"><Braces className="size-4" /> Python dict</h4>
           <div className="flex flex-col gap-1 p-2 bg-surface-2 rounded text-muted-foreground">
             <div><span className="text-sky-500">settings</span> = {`{`}</div>
             <div className="pl-4">"version": <span className="text-purple-400">1</span>,</div>
             <div className="pl-4">"columns": [<span className="text-amber">"name"</span>],</div>
             <div className="pl-4">"include_notes": <span className="text-purple-400">True</span></div>
             <div>{`}`}</div>
           </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-sky-500 font-mono text-xs font-bold">
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/30 flex items-center gap-2">
             json.dumps() <ArrowRightLeft className="size-3" />
           </motion.div>
        </div>

        <div className="flex-1 flex flex-col gap-3 font-mono text-xs p-5 bg-surface rounded-2xl border border-sky-500/30 shadow-sm relative overflow-hidden">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-sky-500/5 pointer-events-none" />
           <h4 className="text-xs tracking-widest text-sky-500 font-bold flex items-center gap-2 border-b border-hairline pb-2 justify-center relative z-10"><FileCode className="size-4" /> JSON string</h4>
           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="flex flex-col gap-1 p-2 bg-sky-500/10 border border-sky-500/20 rounded text-sky-700 dark:text-sky-300 relative z-10">
             <div><span className="text-muted-foreground opacity-50"># indent=2</span></div>
             <div>{`{`}</div>
             <div className="pl-4">"version": 1,</div>
             <div className="pl-4">"columns": [</div>
             <div className="pl-8">"name"</div>
             <div className="pl-4">],</div>
             <div className="pl-4">"include_notes": <span className="text-purple-500">true</span></div>
             <div>{`}`}</div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Step2FileConvert() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-8 p-4 rounded-xl border border-amber/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 2. Read and Write directly to files</span><br />
        <span className="text-mint font-medium">with</span> path.<span className="text-blue-400">open</span>(<span className="text-amber">"w"</span>, encoding=<span className="text-amber">"utf-8"</span>) <span className="text-mint font-medium">as</span> file:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;json.<span className="text-blue-400">dump</span>(settings, file, indent=<span className="text-purple-400">2</span>)
      </div>

      <div className="flex gap-4 w-full max-w-2xl justify-center items-center">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline shadow-sm flex flex-col font-mono text-xs h-full">
           <h4 className="uppercase tracking-widest text-muted-foreground mb-4 font-bold flex items-center justify-center gap-2"><Server className="size-4" /> Python Memory</h4>
           <div className="flex flex-col gap-2 p-3 bg-surface-2 rounded-xl text-center">
             <Braces className="size-6 text-amber mx-auto mb-2" />
             <div className="font-bold">settings dict</div>
             <div className="text-[10px] text-muted-foreground">in-memory object</div>
           </div>
        </div>

        <div className="flex flex-col gap-4 font-mono text-[10px] uppercase font-bold text-amber">
           <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 px-3 py-1.5 bg-amber/10 border border-amber/30 rounded-full">
             json.dump() <ChevronRight className="size-3" />
           </motion.div>
           <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full">
             <ChevronLeft className="size-3" /> json.load()
           </motion.div>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline shadow-sm flex flex-col font-mono text-xs h-full relative overflow-hidden">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }} className="absolute inset-0 bg-amber/5 pointer-events-none" />
           <h4 className="uppercase tracking-widest text-amber mb-4 font-bold flex items-center justify-center gap-2 relative z-10"><Database className="size-4" /> File System</h4>
           <motion.div initial={{ scale: 0.9, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 }} className="flex flex-col gap-2 p-3 bg-amber/10 border border-amber/20 rounded-xl text-amber text-center relative z-10">
             <FileJson className="size-6 mx-auto mb-2" />
             <div className="font-bold">settings.json</div>
             <div className="text-[10px] opacity-80">UTF-8 Encoded File</div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Step3ReadableCompact() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-indigo-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 3. Choose readable or compact output</span><br />
        <span className="text-muted-foreground opacity-70"># Human-readable configuration</span><br />
        pretty = json.<span className="text-blue-400">dumps</span>(data, indent=<span className="text-purple-400">2</span>)<br /><br />
        <span className="text-muted-foreground opacity-70"># Space-sensitive network payload</span><br />
        compact = json.<span className="text-blue-400">dumps</span>(data, separators=(<span className="text-amber">","</span>, <span className="text-amber">":"</span>))
      </div>

      <div className="flex gap-4 w-full max-w-3xl justify-center items-stretch">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-indigo-500/30 shadow-sm flex flex-col font-mono text-xs relative overflow-hidden">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
           <h4 className="text-xs tracking-widest text-indigo-500 font-bold flex items-center justify-center gap-2 border-b border-indigo-500/20 pb-2 relative z-10"><AlignLeft className="size-4" /> indent=2</h4>
           <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 text-indigo-700 dark:text-indigo-300 relative z-10 leading-relaxed">
             {`{`}<br />
             &nbsp;&nbsp;<span className="text-amber">"name"</span>: <span className="text-amber">"Ana"</span>,<br />
             &nbsp;&nbsp;<span className="text-amber">"active"</span>: <span className="text-purple-500">true</span><br />
             {`}`}
           </motion.div>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline shadow-sm flex flex-col font-mono text-xs relative overflow-hidden">
           <h4 className="text-xs tracking-widest text-muted-foreground font-bold flex items-center justify-center gap-2 border-b border-hairline pb-2 relative z-10"><Minimize2 className="size-4" /> separators=(",",":")</h4>
           <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 }} className="mt-3 text-muted-foreground relative z-10 leading-relaxed flex items-center justify-center h-full">
             <div className="bg-surface-2 px-3 py-1.5 rounded-lg border border-hairline break-all">
                {`{"name":"Ana","active":true}`}
             </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Step4ErrorAndValidation() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 4. Handle bad JSON & wrong shapes</span><br />
        <span className="text-mint font-medium">try</span>:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;settings = json.<span className="text-blue-400">load</span>(file)<br />
        <span className="text-mint font-medium">except</span> json.<span className="text-rose-500">JSONDecodeError</span> <span className="text-mint font-medium">as</span> error:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">raise</span> ValueError(f"Invalid JSON: {`{error}`}")<br /><br />
        <span className="text-mint font-medium">if</span> <span className="text-blue-400">type</span>(settings.get(<span className="text-amber">"version"</span>)) <span className="text-mint font-medium">is not</span> <span className="text-purple-400">int</span>:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">raise</span> ValueError(<span className="text-amber">"version must be int"</span>)
      </div>

      <div className="flex gap-4 w-full max-w-3xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col shadow-sm font-mono text-sm relative">
           <h4 className="text-xs uppercase tracking-widest text-rose-500 mb-4 font-bold flex items-center gap-2 border-b border-hairline pb-2"><AlertCircle className="size-4" /> JSONDecodeError</h4>
           <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-3 p-3 bg-surface-2 border border-hairline rounded-xl">
                 <XCircle className="size-5 text-rose-500" />
                 <div>
                    <div className="font-bold text-rose-500 text-xs">Malformed Syntax</div>
                    <div className="text-[10px] text-muted-foreground">{`{ "name": "Ari", }`}</div>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-emerald-500/30 bg-emerald-500/5 flex flex-col shadow-sm font-mono text-sm relative">
           <h4 className="text-xs uppercase tracking-widest text-emerald-500 mb-4 font-bold flex items-center gap-2 border-b border-emerald-500/20 pb-2"><ShieldCheck className="size-4" /> Schema Validation</h4>
           <div className="flex flex-col gap-3 mt-2">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                 <div className="flex flex-col">
                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">Version Check</span>
                    <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">{`{ "version": 1 }`}</span>
                 </div>
                 <div className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Passed
                 </div>
              </motion.div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step5AtomicWrite() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-teal-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 5. Atomic Overwrite</span><br />
        tmp_path = path.with_name(f".{`{path.name}`}.tmp")<br />
        <span className="text-mint font-medium">with</span> tmp_path.<span className="text-blue-400">open</span>(<span className="text-amber">"w"</span>) <span className="text-mint font-medium">as</span> file:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;json.<span className="text-blue-400">dump</span>(data, file)<br />
        &nbsp;&nbsp;&nbsp;&nbsp;file.<span className="text-blue-400">flush</span>()<br />
        tmp_path.<span className="text-blue-400">replace</span>(path)
      </div>

      <div className="w-full max-w-3xl bg-surface border border-hairline rounded-2xl p-5 shadow-sm font-mono text-sm relative overflow-hidden">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
         <h4 className="text-xs uppercase tracking-widest text-teal-500 mb-6 font-bold flex items-center justify-center gap-2 border-b border-hairline pb-3 relative z-10"><Zap className="size-4" /> Zero-Downtime Swap</h4>
         
         <div className="flex items-center justify-center gap-8 relative z-10">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-2 p-3 border-2 border-dashed border-teal-500/40 bg-surface-2 rounded-xl text-xs text-center w-32">
               <FileJson className="size-8 text-teal-500" />
               <div className="font-bold text-teal-500">.settings.tmp</div>
               <div className="text-[10px] text-muted-foreground">Writing fully...</div>
            </motion.div>
            
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }} className="flex flex-col items-center text-teal-500">
               <ArrowRightLeft className="size-6" />
               <span className="text-[10px] font-bold mt-1 uppercase tracking-widest bg-teal-500/20 px-2 py-0.5 rounded">.replace()</span>
            </motion.div>
            
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="flex flex-col items-center gap-2 p-3 border border-hairline bg-surface-2 rounded-xl text-xs text-center w-32">
               <FileJson className="size-8 text-muted-foreground" />
               <div className="font-bold text-foreground">settings.json</div>
               <div className="text-[10px] text-muted-foreground line-through decoration-rose-500">Old Data</div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
}

function Step6Dataclass() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-fuchsia-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 6. Convert Python-only values deliberately</span><br />
        <span className="text-mint font-medium">@dataclass</span><br />
        <span className="text-mint font-medium">class</span> User:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;id: <span className="text-purple-400">int</span><br />
        &nbsp;&nbsp;&nbsp;&nbsp;created: datetime<br /><br />
        user = User(id=<span className="text-purple-400">1</span>, created=datetime.now())<br />
        json.<span className="text-blue-400">dumps</span>(<br />
        &nbsp;&nbsp;&nbsp;&nbsp;asdict(user), <br />
        &nbsp;&nbsp;&nbsp;&nbsp;default=serialize_unknown<br />
        )
      </div>

      <div className="flex gap-4 w-full max-w-3xl">
        <div className="flex-1 flex flex-col gap-3 font-mono text-xs p-5 bg-surface rounded-2xl border border-hairline shadow-sm relative">
           <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center justify-center gap-2 border-b border-hairline pb-2"><Package className="size-4" /> asdict()</h4>
           <div className="flex items-center justify-between mt-2">
             <div className="flex flex-col items-center p-2 text-muted-foreground">
                <span className="font-bold text-foreground">User()</span>
                <span className="text-[10px]">dataclass</span>
             </div>
             <ChevronRight className="size-4 text-muted-foreground" />
             <div className="flex flex-col items-center p-2 bg-surface-2 rounded-lg text-muted-foreground border border-hairline">
                <span className="font-bold text-foreground">{`{dict}`}</span>
                <span className="text-[10px] opacity-70">natively encodable</span>
             </div>
           </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 font-mono text-xs p-5 bg-surface rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/5 shadow-sm relative overflow-hidden">
           <h4 className="text-[10px] uppercase tracking-widest text-fuchsia-500 font-bold flex items-center justify-center gap-2 border-b border-fuchsia-500/20 pb-2"><Filter className="size-4" /> default= Fallback</h4>
           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-between mt-2">
             <div className="flex flex-col items-center p-2 text-fuchsia-700 dark:text-fuchsia-300">
                <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">datetime</span>
                <span className="text-[10px]">object</span>
             </div>
             <ChevronRight className="size-4 text-fuchsia-500" />
             <div className="flex flex-col items-center p-2 bg-fuchsia-500/10 rounded-lg text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-500/20">
                <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400">"2026-08..."</span>
                <span className="text-[10px] opacity-70">ISO string</span>
             </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Step7ObjectHook() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-blue-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 7. Decode special values with hooks</span><br />
        <span className="text-mint font-medium">def</span> <span className="text-blue-400">parse_known_dates</span>(value: <span className="text-purple-400">dict</span>) -&gt; <span className="text-purple-400">dict</span>:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">if</span> value.get(<span className="text-amber">"_type"</span>) == <span className="text-amber">"export_event"</span>:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;value[<span className="text-amber">"created_at"</span>] = datetime.<span className="text-blue-400">fromisoformat</span>(value[<span className="text-amber">"created_at"</span>])<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">return</span> value<br /><br />
        json.<span className="text-blue-400">loads</span>(text, object_hook=parse_known_dates)
      </div>

      <div className="w-full max-w-2xl bg-surface border border-hairline rounded-2xl p-6 shadow-sm font-mono text-sm relative overflow-hidden">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
         <h4 className="text-xs uppercase tracking-widest text-blue-500 mb-6 font-bold flex items-center justify-center gap-2 border-b border-hairline pb-3 relative z-10"><Filter className="size-4" /> object_hook Pipeline</h4>
         
         <div className="flex items-center justify-between gap-4 relative z-10">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-2 p-3 border border-hairline bg-surface-2 rounded-xl text-xs text-center flex-1">
               <FileCode className="size-6 text-muted-foreground" />
               <div className="font-bold text-muted-foreground">Parsed Dict</div>
               <div className="text-[10px] bg-surface px-2 py-1 rounded text-amber">"created_at": "2026..."</div>
            </motion.div>
            
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }} className="flex flex-col items-center text-blue-500">
               <ArrowRightLeft className="size-5" />
               <span className="text-[10px] font-bold mt-1 uppercase tracking-widest">Hook Runs</span>
            </motion.div>
            
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="flex flex-col items-center gap-2 p-3 border border-blue-500/30 bg-blue-500/10 rounded-xl text-xs text-center flex-1">
               <Settings className="size-6 text-blue-500" />
               <div className="font-bold text-blue-500">Final Dict</div>
               <div className="text-[10px] bg-blue-500/20 px-2 py-1 rounded text-blue-400 flex items-center gap-1"><CheckCircle2 className="size-3" /> datetime object</div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
}

function Step8JsonLines() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-teal-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 8. Stream multi-gigabyte collections with JSON Lines</span><br />
        <span className="text-mint font-medium">with</span> path.<span className="text-blue-400">open</span>(encoding=<span className="text-amber">"utf-8"</span>) <span className="text-mint font-medium">as</span> file:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">for</span> line <span className="text-mint font-medium">in</span> file:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;record = json.<span className="text-blue-400">loads</span>(line)<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">print</span>(record)
      </div>

      <div className="w-full max-w-3xl bg-surface border border-hairline rounded-2xl p-5 shadow-sm font-mono text-sm relative overflow-hidden">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
         <h4 className="text-xs uppercase tracking-widest text-teal-500 mb-4 font-bold flex items-center justify-center gap-2 border-b border-hairline pb-2 relative z-10"><ListTree className="size-4" /> large_dataset.jsonl</h4>
         
         <div className="flex flex-col gap-2 relative z-10">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 p-2 bg-teal-500/10 border border-teal-500/20 rounded text-teal-600 dark:text-teal-400 text-xs">
               <div className="bg-teal-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Line 1</div>
               <div>{`{"event": "start", "count": 0}`}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="flex items-center gap-3 p-2 bg-teal-500/10 border border-teal-500/20 rounded text-teal-600 dark:text-teal-400 text-xs">
               <div className="bg-teal-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Line 2</div>
               <div>{`{"event": "running", "count": 1}`}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8 }} className="flex items-center gap-3 p-2 bg-teal-500/10 border border-teal-500/20 rounded text-teal-600 dark:text-teal-400 text-xs">
               <div className="bg-teal-500/20 px-2 py-0.5 rounded text-[10px] font-bold">Line 3</div>
               <div>{`{"event": "finish", "count": 3}`}</div>
            </motion.div>
         </div>
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-teal-500/80 relative z-10">
           Independent objects, bounded memory!
         </motion.div>
      </div>
    </motion.div>
  );
}
