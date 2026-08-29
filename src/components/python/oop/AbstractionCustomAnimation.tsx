import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw, ChevronLeft, ChevronRight, Play, Pause,
  CreditCard, Wallet, CircleDollarSign, XCircle, CheckCircle,
  FileText, Table, FileSpreadsheet, Download, ShieldAlert, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AbstractionCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 4;

  const STEP_DURATIONS = [6000, 7000, 7000, 8000];

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), STEP_DURATIONS[step] || 6000);
    return () => window.clearTimeout(id);
  }, [playing, step, isHovered, totalSteps]);

  const go = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStep((s) => (s + delta + totalSteps) % totalSteps);
    },
    [totalSteps]
  );

  return (
    <div 
      className="flex flex-col relative z-10 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative px-4 py-8 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step0Contract key="step0" />}
          {step === 1 && <Step1ABC key="step1" />}
          {step === 2 && <Step2Enforcement key="step2" />}
          {step === 3 && <Step3Exporter key="step3" />}
        </AnimatePresence>
      </div>
      
      {/* Control Bar without PHASE chip */}
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button onClick={() => { setPlaying(false); setStep(0); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <RotateCcw className="size-3.5" />
          </button>
          <button onClick={() => go(-1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <ChevronLeft className="size-3.5" />
          </button>
          <button onClick={() => setPlaying((p) => !p)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button onClick={() => go(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          {step + 1} / {totalSteps}
        </div>
      </div>
    </div>
  );
}

function Step0Contract() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">1. The Contract vs Implementation</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">An abstract class defines what an object must do, while child classes define how it does it.</p>
      
      <div className="flex flex-row w-full gap-12 items-center justify-center">
        {/* Diagram */}
        <div className="relative w-[320px] h-[300px] shrink-0">
          {/* Base Class */}
          <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 z-20" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <NodeCard icon={BookOpen} title="Payment (ABC)" subtitle="@abstractmethod pay()" color="indigo" />
          </motion.div>
          
          {/* Connector Lines */}
          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 300">
            <motion.path d="M 160,70 L 160,110 L 80,110 L 80,140" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} />
            <motion.path d="M 160,70 L 160,110 L 240,110 L 240,140" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} />
          </svg>
          
          {/* Subclasses */}
          <motion.div className="absolute top-[140px] left-[80px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <NodeCard icon={CreditCard} title="CreditCard" subtitle="def pay(self, amount):" color="emerald" />
          </motion.div>
          
          <motion.div className="absolute top-[140px] left-[240px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <NodeCard icon={Wallet} title="PayPal" subtitle="def pay(self, amount):" color="emerald" />
          </motion.div>

          <motion.div className="absolute top-[230px] left-[160px] -translate-x-1/2 bg-surface-2/80 backdrop-blur px-4 py-2 rounded-full border border-hairline flex flex-col items-center shadow-sm" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0 }}>
             <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Shared Interface</span>
             <span className="text-sm font-semibold text-emerald-500 font-mono mt-1">payment.pay(100)</span>
          </motion.div>
        </div>
        
        {/* Code Snippet */}
        <div className="w-[420px] shrink-0 bg-surface-2/30 rounded-lg p-4 font-mono text-xs border border-hairline relative text-left">
          <pre className="text-left leading-relaxed whitespace-pre-wrap">
            <span className="text-pink-500">class</span> <span className="text-amber-300">Payment</span>(<span className="text-blue-300">ABC</span>):<br />
            {"    "}<span className="text-emerald-300">@abstractmethod</span><br />
            {"    "}<span className="text-pink-500">def</span> <span className="text-blue-300">pay</span>(self, amount):<br />
            {"        "}<span className="text-pink-500">pass</span><br />
            <br />
            <span className="text-pink-500">class</span> <span className="text-amber-300">CreditCard</span>(<span className="text-blue-300">Payment</span>):<br />
            {"    "}<span className="text-pink-500">def</span> <span className="text-blue-300">pay</span>(self, amount):<br />
            {"        "}<span className="text-blue-300">print</span>(<span className="text-emerald-300">"Charging card"</span>)<br />
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

function Step1ABC() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">2. Abstract Base Classes (ABC)</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">Python prevents you from directly instantiating an abstract class.</p>
      
      <div className="flex flex-col items-center justify-center gap-8">
         <div className="relative w-[320px] h-[100px] flex items-center justify-center">
            <motion.div className="z-20 relative" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
               <NodeCard icon={BookOpen} title="Payment (ABC)" subtitle="@abstractmethod pay()" color="indigo" />
            </motion.div>
         </div>

         <div className="flex items-center gap-6">
            <motion.div className="flex items-center gap-4 bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl relative overflow-hidden" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
               <div className="bg-rose-500/20 p-2 rounded-full">
                  <XCircle className="size-6 text-rose-500" />
               </div>
               <div className="flex flex-col">
                  <span className="font-mono text-sm font-semibold">payment = Payment()</span>
                  <span className="text-xs text-rose-400 mt-1">TypeError: Can't instantiate abstract class</span>
               </div>
            </motion.div>
         </div>
         
         <div className="w-[480px] bg-surface-2/30 rounded-lg p-4 font-mono text-xs border border-hairline text-left" dangerouslySetInnerHTML={{ __html: `<span class="text-pink-500">from</span> <span class="text-emerald-300">abc</span> <span class="text-pink-500">import</span> ABC, abstractmethod<br /><br /><span class="text-pink-500">class</span> <span class="text-amber-300">Payment</span>(<span class="text-blue-300">ABC</span>):<br />    <span class="text-emerald-300">@abstractmethod</span><br />    <span class="text-pink-500">def</span> <span class="text-blue-300">pay</span>(self, amount):<br />        <span class="text-pink-500">pass</span>` }} />
      </div>
    </motion.div>
  );
}

function Step2Enforcement() {
  const [showFix, setShowFix] = useState(false);

  useEffect(() => {
     const id = setTimeout(() => setShowFix(true), 3500);
     return () => clearTimeout(id);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">3. Enforcing the Contract</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">Child classes MUST implement all abstract methods before they can be used.</p>
      
      <div className="flex flex-col w-full gap-8 items-center justify-center">
         
         <div className="flex items-center gap-8 h-[80px]">
            <AnimatePresence mode="wait">
               {!showFix ? (
                  <motion.div key="broken" className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 10 }}>
                     <div className="flex items-center gap-4">
                        <NodeCard icon={ShieldAlert} title="GiftCard" subtitle="Missing pay() method" color="rose" />
                        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
                           <XCircle className="size-5 text-rose-500" />
                           <span className="font-mono text-xs">TypeError: Can't instantiate class GiftCard</span>
                        </div>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div key="fixed" className="flex flex-col items-center gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                     <div className="flex items-center gap-4">
                        <NodeCard icon={CircleDollarSign} title="GiftCard" subtitle="def pay(self, amount):" color="emerald" />
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
                           <CheckCircle className="size-5 text-emerald-500" />
                           <span className="font-mono text-xs">Instantiated successfully</span>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="w-[420px] bg-surface-2/30 rounded-lg p-4 font-mono text-xs border border-hairline relative text-left">
          <pre className="text-left leading-relaxed whitespace-pre-wrap">
            <span className="text-pink-500">class</span> <span className="text-amber-300">GiftCard</span>(<span className="text-blue-300">Payment</span>):<br />
            <AnimatePresence mode="wait">
               {!showFix ? (
                  <motion.span key="badcode" className="text-pink-500 block h-[40px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     {"    pass"}
                  </motion.span>
               ) : (
                  <motion.span key="goodcode" className="block h-[40px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     {"    "}<span className="text-pink-500">def</span> <span className="text-blue-300">pay</span>(self, amount):<br />
                     {"        "}<span className="text-blue-300">print</span>(<span className="text-emerald-300">"Deducting from balance"</span>)
                  </motion.span>
               )}
            </AnimatePresence>
            <br />
            <span className="text-slate-400"># Usage:</span><br />
            <span className={showFix ? "text-emerald-400 transition-colors" : "text-rose-400 transition-colors"}>card = GiftCard()</span>
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

function Step3Exporter() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">4. A Real-World Example</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">Your program can interact with the shared contract without worrying about the specifics of each format.</p>
      
      <div className="flex flex-row w-full gap-8 items-center justify-center">
        {/* Diagram */}
        <div className="relative w-[340px] h-[340px] shrink-0">
          
          <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-surface-2/80 backdrop-blur px-6 py-3 rounded-full border border-hairline flex gap-2 items-center shadow-sm" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
             <Download className="size-4 text-emerald-500" />
             <span className="text-sm font-semibold text-emerald-500 font-mono">export_report(exporter, data)</span>
          </motion.div>

          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 340 340">
            <motion.path d="M 170,40 L 170,75" fill="none" stroke="var(--hairline)" strokeWidth="3" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} />
            <motion.path d="M 170,145 L 170,175 L 70,175 L 70,205" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7 }} />
            <motion.path d="M 170,145 L 170,205" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7 }} />
            <motion.path d="M 170,145 L 170,175 L 270,175 L 270,205" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7 }} />
          </svg>
          
          <motion.div className="absolute top-[75px] left-1/2 -translate-x-1/2 z-20" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}>
            <NodeCard icon={BookOpen} title="Exporter (ABC)" subtitle="@abstractmethod export()" color="indigo" />
          </motion.div>
          
          <motion.div className="absolute top-[205px] left-[70px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0 }}>
            <NodeCard icon={FileText} title="PDFExporter" color="emerald" small />
          </motion.div>
          
          <motion.div className="absolute top-[205px] left-[170px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }}>
            <NodeCard icon={Table} title="CSVExporter" color="emerald" small />
          </motion.div>

          <motion.div className="absolute top-[205px] left-[270px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2 }}>
            <NodeCard icon={FileSpreadsheet} title="ExcelExporter" color="emerald" small />
          </motion.div>
        </div>
        
        {/* Code Snippet */}
        <div className="w-[360px] shrink-0 bg-surface-2/30 rounded-lg p-4 font-mono text-[10px] border border-hairline relative text-left">
          <pre className="text-left leading-relaxed whitespace-pre-wrap">
            <span className="text-pink-500">class</span> <span className="text-amber-300">PDFExporter</span>(<span className="text-blue-300">Exporter</span>):<br />
            {"    "}<span className="text-pink-500">def</span> <span className="text-blue-300">export</span>(self, data):<br />
            {"        "}<span className="text-blue-300">print</span>(<span className="text-emerald-300">"Making PDF"</span>)<br />
            <br />
            <span className="text-pink-500">def</span> <span className="text-blue-300">export_report</span>(exporter, data):<br />
            {"    "}<span className="text-slate-400"># We only care that the method exists</span><br />
            {"    "}exporter.export(data)<br />
            <br />
            export_report(PDFExporter(), data)<br />
            export_report(CSVExporter(), data)<br />
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

// Custom Node Card for diagrams
function NodeCard({ icon: Icon, title, subtitle, color, small = false }: { icon: any, title: string, subtitle?: string, color: 'emerald' | 'rose' | 'indigo', small?: boolean }) {
  const colors = {
    emerald: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    rose: "text-rose-500 border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    indigo: "text-indigo-500 border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]",
  };
  
  return (
    <div className={cn(`rounded-xl border-2 flex flex-col items-center justify-center backdrop-blur-md relative overflow-hidden text-center`, colors[color], small ? "w-24 p-2 gap-1" : "w-36 p-3 gap-1.5")}>
      <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-current opacity-10" />
      <Icon className={small ? "size-4" : "size-5"} />
      <span className={cn("font-mono font-bold leading-tight", small ? "text-[9px]" : "text-xs")}>{title}</span>
      {subtitle && <span className="text-[9px] font-mono opacity-80 leading-tight">{subtitle}</span>}
    </div>
  );
}
