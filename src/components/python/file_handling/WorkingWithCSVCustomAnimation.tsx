import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight, FileText, 
  Database, ShieldAlert, CheckCircle2, AlertCircle, FileDigit, 
  Replace, FileCode, Zap, SplitSquareHorizontal, ShieldCheck, 
  ArrowRightLeft, AlignLeft, Package, AlertTriangle, Layers, Merge
} from "lucide-react";

export function WorkingWithCSVCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 8;

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), 7000);
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
          {step === 0 && <Step1CoreIdea key="step1" />}
          {step === 1 && <Step2Reader key="step2" />}
          {step === 2 && <Step3DictReader key="step3" />}
          {step === 3 && <Step4DictWriter key="step4" />}
          {step === 4 && <Step5Dialects key="step5" />}
          {step === 5 && <Step6FormulaInjection key="step6" />}
          {step === 6 && <Step7Atomic key="step7" />}
          {step === 7 && <Step8HashJoin key="step8" />}
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

function Step1CoreIdea() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 1. The Danger of .split(",")</span><br />
        raw = <span className="text-amber">'"Anker, Wireless Mouse",29.99'</span><br />
        <span className="text-blue-400">print</span>(raw.<span className="text-blue-400">split</span>(<span className="text-amber">","</span>))
      </div>

      <div className="flex gap-4 w-full max-w-3xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-rose-500/30 bg-rose-500/5 flex flex-col shadow-sm font-mono text-xs relative overflow-hidden">
           <h4 className="text-[10px] uppercase tracking-widest text-rose-500 mb-4 font-bold flex items-center justify-center gap-2 border-b border-rose-500/20 pb-2 relative z-10"><AlertTriangle className="size-4" /> Manual Split</h4>
           
           <div className="flex flex-col gap-2 relative z-10 mt-2">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-rose-700 dark:text-rose-300">
                 [<span className="text-amber">'"Anker'</span>, <span className="text-amber">' Wireless Mouse"'</span>, <span className="text-amber">'29.99'</span>]
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-[10px] text-rose-500 font-bold uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1">
                 <ShieldAlert className="size-3" /> Fails on quoted commas!
              </motion.div>
           </div>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-sky-500/30 bg-sky-500/5 flex flex-col shadow-sm font-mono text-xs relative overflow-hidden">
           <h4 className="text-[10px] uppercase tracking-widest text-sky-500 mb-4 font-bold flex items-center justify-center gap-2 border-b border-sky-500/20 pb-2 relative z-10"><CheckCircle2 className="size-4" /> csv.reader</h4>
           
           <div className="flex flex-col gap-2 relative z-10 mt-2">
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className="p-2 bg-sky-500/10 border border-sky-500/20 rounded text-sky-700 dark:text-sky-300">
                 [<span className="text-amber">'Anker, Wireless Mouse'</span>, <span className="text-amber">'29.99'</span>]
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="text-[10px] text-sky-500 font-bold uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1">
                 <CheckCircle2 className="size-3" /> Safely unescapes quotes!
              </motion.div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step2Reader() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-indigo-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 2. Read rows and convert types deliberately</span><br />
        <span className="text-mint font-medium">for</span> row <span className="text-mint font-medium">in</span> csv.<span className="text-blue-400">reader</span>(file):<br />
        &nbsp;&nbsp;&nbsp;&nbsp;price = <span className="text-blue-400">Decimal</span>(row[<span className="text-purple-400">2</span>])
      </div>

      <div className="flex gap-4 w-full max-w-3xl">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline flex flex-col shadow-sm font-mono text-xs relative overflow-hidden">
           <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center justify-center gap-2 border-b border-hairline pb-2"><FileText className="size-4" /> CSV File (Text)</h4>
           <div className="flex items-center justify-between mt-4 text-foreground bg-surface-2 p-3 rounded-lg border border-hairline">
             <span>"P001"</span>
             <span>"Mouse"</span>
             <span className="text-rose-500 font-bold bg-rose-500/10 px-2 rounded">"29.99"</span>
           </div>
        </div>

        <div className="flex flex-col items-center justify-center text-indigo-500">
           <ArrowRightLeft className="size-6" />
           <span className="text-[10px] font-bold uppercase mt-1">Decimal()</span>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-indigo-500/30 bg-indigo-500/5 flex flex-col shadow-sm font-mono text-xs relative overflow-hidden">
           <h4 className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold flex items-center justify-center gap-2 border-b border-indigo-500/20 pb-2"><Database className="size-4" /> Python Memory</h4>
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-between mt-4 text-foreground bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
             <span>"P001"</span>
             <span>"Mouse"</span>
             <span className="text-indigo-600 dark:text-indigo-400 font-bold">29.99</span>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Step3DictReader() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 3. Read named columns with a strict contract</span><br />
        reader = csv.<span className="text-blue-400">DictReader</span>(file, strict=<span className="text-purple-400">True</span>)<br />
        <span className="text-mint font-medium">if</span> reader.fieldnames != [<span className="text-amber">"name"</span>, <span className="text-amber">"email"</span>]:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">raise</span> ValueError(<span className="text-amber">"Invalid Schema!"</span>)
      </div>

      <div className="flex flex-col items-center w-full max-w-2xl bg-surface border border-hairline rounded-2xl p-5 shadow-sm font-mono text-sm relative overflow-hidden">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
         <h4 className="text-xs uppercase tracking-widest text-emerald-500 mb-6 font-bold flex items-center justify-center gap-2 border-b border-hairline pb-3 relative z-10"><Package className="size-4" /> DictReader Mapping</h4>
         
         <div className="flex items-center justify-center gap-4 w-full relative z-10">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col gap-2 p-3 border border-hairline bg-surface-2 rounded-xl text-xs">
               <div className="text-[10px] text-muted-foreground bg-surface px-2 py-1 rounded text-center border border-hairline font-bold">Header</div>
               <div className="flex justify-between px-2 text-emerald-600 dark:text-emerald-400"><span>name</span><span>email</span></div>
               <div className="h-px bg-hairline w-full my-1" />
               <div className="text-[10px] text-muted-foreground bg-surface px-2 py-1 rounded text-center border border-hairline">Row 1</div>
               <div className="flex justify-between px-2"><span>"Ari"</span><span>"ari@t.co"</span></div>
            </motion.div>
            
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }} className="flex flex-col items-center text-emerald-500 px-4">
               <ArrowRightLeft className="size-5" />
            </motion.div>
            
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="flex-1 flex flex-col items-center justify-center gap-2 p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-xl text-xs">
               <div className="text-emerald-700 dark:text-emerald-300">
                 {`{`}<br />
                 &nbsp;&nbsp;<span className="text-emerald-600 dark:text-emerald-400 font-bold">"name"</span>: <span className="text-amber">"Ari"</span>,<br />
                 &nbsp;&nbsp;<span className="text-emerald-600 dark:text-emerald-400 font-bold">"email"</span>: <span className="text-amber">"ari@t.co"</span><br />
                 {`}`}
               </div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
}

function Step4DictWriter() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-blue-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 4. Write a spreadsheet-ready export</span><br />
        writer = csv.<span className="text-blue-400">DictWriter</span>(<br />
        &nbsp;&nbsp;&nbsp;&nbsp;file, fieldnames=cols, extrasaction=<span className="text-amber">"raise"</span><br />
        )<br />
        writer.<span className="text-blue-400">writeheader</span>()<br />
        writer.<span className="text-blue-400">writerows</span>(contacts)
      </div>

      <div className="flex flex-col items-center w-full max-w-2xl bg-surface border border-hairline rounded-2xl p-5 shadow-sm font-mono text-sm relative overflow-hidden">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
         <h4 className="text-xs uppercase tracking-widest text-blue-500 mb-6 font-bold flex items-center justify-center gap-2 border-b border-hairline pb-3 relative z-10"><FileDigit className="size-4" /> DictWriter Output</h4>
         
         <div className="flex items-center justify-center gap-4 w-full relative z-10">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col items-center justify-center gap-2 p-4 border border-blue-500/30 bg-blue-500/10 rounded-xl text-xs">
               <div className="text-blue-700 dark:text-blue-300">
                 {`{`}<br />
                 &nbsp;&nbsp;<span className="text-blue-600 dark:text-blue-400 font-bold">"id"</span>: <span className="text-purple-400">9</span>,<br />
                 &nbsp;&nbsp;<span className="text-blue-600 dark:text-blue-400 font-bold">"name"</span>: <span className="text-amber">"Lee, Sr."</span><br />
                 {`}`}
               </div>
            </motion.div>
            
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }} className="flex flex-col items-center text-blue-500 px-4">
               <ArrowRightLeft className="size-5" />
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="flex-1 flex flex-col gap-2 p-3 border border-hairline bg-surface-2 rounded-xl text-xs">
               <div className="text-[10px] text-muted-foreground bg-surface px-2 py-1 rounded text-center border border-hairline font-bold">CSV Output</div>
               <div className="flex flex-col px-2 text-foreground font-bold">
                 <span>id,name</span>
                 <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>9,"Lee, Sr."</motion.span>
               </div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
}

function Step5Dialects() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-fuchsia-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 5. Adapt to delimiters, dialects, and unknown files</span><br />
        <span className="text-muted-foreground opacity-70"># Semicolons used when commas are decimals in EU formats</span><br />
        writer = csv.<span className="text-blue-400">writer</span>(file, delimiter=<span className="text-amber">";"</span>)<br />
        writer.<span className="text-blue-400">writerow</span>([<span className="text-amber">"Mouse"</span>, <span className="text-amber">"19,99"</span>])
      </div>

      <div className="flex gap-4 w-full max-w-3xl justify-center items-stretch">
        <div className="flex-1 p-5 rounded-2xl bg-surface border border-hairline shadow-sm flex flex-col font-mono text-xs relative overflow-hidden">
           <h4 className="text-xs tracking-widest text-muted-foreground font-bold flex items-center justify-center gap-2 border-b border-hairline pb-2 relative z-10"><AlignLeft className="size-4" /> delimiter=","</h4>
           <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 text-muted-foreground relative z-10 leading-relaxed flex items-center justify-center h-full">
             <div className="bg-surface-2 px-3 py-1.5 rounded-lg border border-hairline break-all">
                product_id,name,price<br/>
                P001,Mouse,19.99
             </div>
           </motion.div>
        </div>

        <div className="flex-1 p-5 rounded-2xl bg-surface border border-fuchsia-500/30 shadow-sm flex flex-col font-mono text-xs relative overflow-hidden">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-fuchsia-500/5 pointer-events-none" />
           <h4 className="text-xs tracking-widest text-fuchsia-500 font-bold flex items-center justify-center gap-2 border-b border-fuchsia-500/20 pb-2 relative z-10"><SplitSquareHorizontal className="size-4" /> delimiter=";"</h4>
           <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1 }} className="mt-3 text-fuchsia-700 dark:text-fuchsia-300 relative z-10 leading-relaxed flex items-center justify-center h-full">
             <div className="bg-fuchsia-500/10 px-3 py-1.5 rounded-lg border border-fuchsia-500/20 break-all font-bold">
                product_id;name;price<br/>
                P001;Mouse;19,99
             </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function Step6FormulaInjection() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-amber/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 6. Protect spreadsheet users and report bad rows</span><br />
        <span className="text-mint font-medium">def</span> <span className="text-blue-400">spreadsheet_safe</span>(value) -&gt; <span className="text-purple-400">str</span>:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;text = <span className="text-blue-400">str</span>(value)<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">if</span> text.<span className="text-blue-400">startswith</span>((<span className="text-amber">"="</span>, <span className="text-amber">"+"</span>, <span className="text-amber">"-"</span>, <span className="text-amber">"@"</span>)):<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">return</span> <span className="text-amber">"'"</span> + text<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-mint font-medium">return</span> text
      </div>

      <div className="w-full max-w-2xl bg-surface border border-amber/30 rounded-2xl p-5 shadow-sm font-mono text-sm relative overflow-hidden bg-amber/5">
         <h4 className="text-xs uppercase tracking-widest text-amber mb-6 font-bold flex items-center justify-center gap-2 border-b border-amber/20 pb-3 relative z-10"><ShieldCheck className="size-4" /> Formula Injection Protection</h4>
         
         <div className="flex items-center justify-center gap-8 w-full relative z-10">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col gap-2 p-3 border border-amber/20 bg-amber/10 rounded-xl text-xs text-amber font-bold">
               <div className="text-center">=HYPERLINK("evil.sh")</div>
               <div className="text-[10px] opacity-70 text-center uppercase tracking-widest mt-1">Malicious Input</div>
            </motion.div>
            
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }} className="flex flex-col items-center text-amber px-2">
               <ArrowRightLeft className="size-5" />
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="flex-1 flex flex-col gap-2 p-3 border border-emerald-500/30 bg-emerald-500/10 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold">
               <div className="text-center">'=HYPERLINK("evil.sh")</div>
               <div className="text-[10px] opacity-70 text-center uppercase tracking-widest mt-1 flex items-center justify-center gap-1"><CheckCircle2 className="size-3" /> Safe string</div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
}

function Step7Atomic() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-teal-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 7. Write complete exports, then replace the old file</span><br />
        tmp_path = path.with_name(f".{"{path.name}"}.tmp")<br />
        <span className="text-mint font-medium">with</span> tmp_path.<span className="text-blue-400">open</span>(<span className="text-amber">"w"</span>) <span className="text-mint font-medium">as</span> file:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;writer.<span className="text-blue-400">writerows</span>(rows)<br />
        &nbsp;&nbsp;&nbsp;&nbsp;file.<span className="text-blue-400">flush</span>()<br />
        tmp_path.<span className="text-blue-400">replace</span>(path)
      </div>

      <div className="w-full max-w-3xl bg-surface border border-hairline rounded-2xl p-5 shadow-sm font-mono text-sm relative overflow-hidden">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-teal-500/5 pointer-events-none" />
         <h4 className="text-xs uppercase tracking-widest text-teal-500 mb-6 font-bold flex items-center justify-center gap-2 border-b border-hairline pb-3 relative z-10"><Zap className="size-4" /> Zero-Downtime Swap</h4>
         
         <div className="flex items-center justify-center gap-8 relative z-10">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center gap-2 p-3 border-2 border-dashed border-teal-500/40 bg-surface-2 rounded-xl text-xs text-center w-32">
               <FileDigit className="size-8 text-teal-500" />
               <div className="font-bold text-teal-500">.products.tmp</div>
               <div className="text-[10px] text-muted-foreground">Writing fully...</div>
            </motion.div>
            
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }} className="flex flex-col items-center text-teal-500">
               <ArrowRightLeft className="size-6" />
               <span className="text-[10px] font-bold mt-1 uppercase tracking-widest bg-teal-500/20 px-2 py-0.5 rounded">.replace()</span>
            </motion.div>
            
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="flex flex-col items-center gap-2 p-3 border border-hairline bg-surface-2 rounded-xl text-xs text-center w-32">
               <FileDigit className="size-8 text-muted-foreground" />
               <div className="font-bold text-foreground">products.csv</div>
               <div className="text-[10px] text-muted-foreground line-through decoration-rose-500">Old Data</div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
}

function Step8HashJoin() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full">
      <div className="mb-6 p-4 rounded-xl border border-sky-500/30 bg-surface shadow-sm w-full max-w-lg text-left font-mono text-[13px] leading-relaxed text-foreground">
        <span className="text-muted-foreground"># 8. Complete O(n+m) import, join, and export pipeline</span><br />
        <span className="text-muted-foreground opacity-70"># 1. Build an O(m) hash map of reviews</span><br />
        ratings = defaultdict(<span className="text-mint font-medium">lambda</span>: [<span className="text-purple-400">0</span>, <span className="text-purple-400">0</span>])<br />
        <span className="text-muted-foreground opacity-70"># 2. Stream products in O(n) and lookup in O(1)</span><br />
        <span className="text-mint font-medium">for</span> product <span className="text-mint font-medium">in</span> csv.<span className="text-blue-400">DictReader</span>(products_file):<br />
        &nbsp;&nbsp;&nbsp;&nbsp;rating_total, count = ratings.get(product[<span className="text-amber">"id"</span>], [<span className="text-purple-400">0</span>,<span className="text-purple-400">0</span>])
      </div>

      <div className="w-full max-w-3xl bg-surface border border-hairline rounded-2xl p-5 shadow-sm font-mono text-sm relative overflow-hidden">
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="absolute inset-0 bg-sky-500/5 pointer-events-none" />
         <h4 className="text-xs uppercase tracking-widest text-sky-500 mb-6 font-bold flex items-center justify-center gap-2 border-b border-hairline pb-3 relative z-10"><Merge className="size-4" /> Hash Map Join Pipeline</h4>
         
         <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex flex-col gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 p-3 border border-sky-500/20 bg-sky-500/10 rounded-xl text-xs text-sky-700 dark:text-sky-300">
                 <Database className="size-4" /> <span>products.csv O(n)</span>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex items-center gap-2 p-3 border border-indigo-500/20 bg-indigo-500/10 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
                 <Layers className="size-4" /> <span>reviews.csv O(m)</span>
              </motion.div>
            </div>
            
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5 }} className="flex flex-col items-center px-2">
               <div className="bg-surface-2 border border-hairline px-3 py-1.5 rounded-lg text-[10px] font-bold text-foreground">Hash Map Lookup O(1)</div>
               <div className="h-px bg-hairline w-full my-2" />
               <ArrowRightLeft className="size-4 text-muted-foreground" />
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 2.2 }} className="flex flex-col items-center gap-2 p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-bold">
               <FileDigit className="size-6" />
               <div>summary.csv</div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
}
