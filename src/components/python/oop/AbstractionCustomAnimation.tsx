import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw, ChevronLeft, ChevronRight, Play, Pause,
  CreditCard, Wallet, CircleDollarSign, XCircle, CheckCircle,
  FileText, Table, FileSpreadsheet, Download, ShieldAlert, BookOpen,
  ArrowRight, Activity, Building, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AbstractionCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 4;

  const STEP_DURATIONS = [7000, 7000, 8000, 8000];

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
          {step === 1 && <Step1Hidden key="step1" />}
          {step === 2 && <Step2Enforcement key="step2" />}
          {step === 3 && <Step3ABC key="step3" />}
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
          <button onClick={() => setPlaying((p) => !p)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button onClick={() => go(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-xs text-muted-foreground">
            {step + 1} / {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step0Contract() {
  const [clicked, setClicked] = useState(false);
  const [method, setMethod] = useState<"card" | "paypal">("card");

  useEffect(() => {
    const id = setInterval(() => {
       setClicked(true);
       setTimeout(() => setClicked(false), 1500);
       setTimeout(() => setMethod(m => m === "card" ? "paypal" : "card"), 2000);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">The Simple Interface</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">An abstract class defines what an object must do, hiding how it actually processes the payment.</p>
      
      <div className="flex flex-row w-full gap-12 items-center justify-center">
        
        {/* Interactive Diagram */}
        <div className="relative w-[340px] h-[340px] shrink-0">
          
          <motion.div className="absolute top-[30px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
             <motion.button 
                animate={{ scale: clicked ? 0.95 : 1, backgroundColor: clicked ? "var(--surface-2)" : "var(--surface)" }}
                className="bg-surface border border-hairline shadow-sm px-6 py-3 rounded-full flex items-center gap-2 font-mono font-bold text-sm text-foreground transition-colors"
             >
                <CircleDollarSign className="size-5 text-emerald-500" />
                Checkout $100
             </motion.button>
          </motion.div>

          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 340 340">
            <motion.path d="M 170,80 L 170,120" fill="none" stroke="var(--hairline)" strokeWidth="2" strokeDasharray="4 4" />
            <motion.path d="M 170,180 L 170,220 L 90,220 L 90,250" fill="none" stroke="var(--hairline)" strokeWidth="2" />
            <motion.path d="M 170,180 L 170,220 L 250,220 L 250,250" fill="none" stroke="var(--hairline)" strokeWidth="2" />
          </svg>

          {/* Animated Signal */}
          <AnimatePresence>
             {clicked && (
                <motion.div 
                   initial={{ top: 80, left: 170, opacity: 0 }} 
                   animate={{ top: 120, left: 170, opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.3 }}
                   className="absolute w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] -translate-x-1/2 -translate-y-1/2 z-30"
                />
             )}
          </AnimatePresence>

          <AnimatePresence>
             {clicked && (
                <motion.div 
                   initial={{ top: 180, left: 170, opacity: 0 }} 
                   animate={method === "card" ? { top: 250, left: 90, opacity: 1 } : { top: 250, left: 250, opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.5, delay: 0.3 }}
                   className="absolute w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] -translate-x-1/2 -translate-y-1/2 z-30"
                />
             )}
          </AnimatePresence>

          {/* Base Class */}
          <motion.div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-20" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
            <NodeCard icon={BookOpen} title="Payment (ABC)" subtitle="@abstractmethod pay()" color="indigo" />
          </motion.div>
          
          {/* Subclasses */}
          <motion.div className="absolute top-[250px] left-[90px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <NodeCard icon={CreditCard} title="CreditCard" subtitle="def pay(amount):" color={method === "card" && clicked ? "emerald" : "slate"} highlight={method === "card" && clicked} />
          </motion.div>
          
          <motion.div className="absolute top-[250px] left-[250px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <NodeCard icon={Wallet} title="PayPal" subtitle="def pay(amount):" color={method === "paypal" && clicked ? "emerald" : "slate"} highlight={method === "paypal" && clicked} />
          </motion.div>
        </div>
        
        {/* Code Snippet */}
        <div className="w-[420px] shrink-0 bg-surface-2/30 rounded-lg p-5 font-mono text-xs border border-hairline relative text-left shadow-lg">
          <div dangerouslySetInnerHTML={{ __html: `
<span class="text-pink-600 dark:text-pink-400">class</span> <span class="text-amber-600 dark:text-amber-400">Payment</span>(<span class="text-blue-600 dark:text-blue-400">ABC</span>):<br />
&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-emerald-600 dark:text-emerald-400">@abstractmethod</span><br />
&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">def</span> <span class="text-blue-600 dark:text-blue-400">pay</span>(self, amount):<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">pass</span><br />
<br />
<span class="text-pink-600 dark:text-pink-400">class</span> <span class="text-amber-600 dark:text-amber-400">CreditCard</span>(<span class="text-blue-600 dark:text-blue-400">Payment</span>):<br />
&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">def</span> <span class="text-blue-600 dark:text-blue-400">pay</span>(self, amount):<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-blue-600 dark:text-blue-400">print</span>(<span class="text-emerald-600 dark:text-emerald-400">"Charging card..."</span>)<br />
          `}} />
        </div>
      </div>
    </motion.div>
  );
}

function Step1Hidden() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Hidden Complexity</h3>
      <p className="text-sm text-muted-foreground mb-12 text-center max-w-md">Inside the `CreditCard` class, processing a payment requires complex network steps. The Checkout interface doesn't need to know them.</p>
      
      <div className="flex items-center gap-12 justify-center w-full">
        
        <div className="flex flex-col items-center gap-4">
           <div className="w-56 h-40 bg-surface-2 border-2 border-hairline rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group">
              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                 <div className="flex items-center gap-2 text-blue-500">
                    <Lock className="size-4" />
                    <span className="text-[10px] font-mono font-bold">Encrypt Token</span>
                 </div>
                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                    <Activity className="size-4 text-muted-foreground/50" />
                 </motion.div>
              </div>
              
              <div className="flex items-center justify-center h-full z-10 my-2">
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="bg-emerald-500/20 p-2 rounded-full text-emerald-500">
                    <Building className="size-6" />
                 </motion.div>
              </div>

              <div className="flex justify-between items-end z-10">
                 <div className="flex items-center gap-2 text-amber-500">
                    <ArrowRight className="size-4" />
                    <span className="text-[10px] font-mono font-bold">Bank API Auth</span>
                 </div>
              </div>
           </div>
           <div className="font-mono text-xs text-muted-foreground text-center">
              The Implementation<br />
              <span className="text-[9px] opacity-70">(Hidden from user)</span>
           </div>
        </div>

        {/* Code Snippet */}
        <div className="w-[440px] shrink-0 bg-surface-2/30 rounded-lg p-5 font-mono text-[10px] border border-hairline relative text-left shadow-lg">
          <div dangerouslySetInnerHTML={{ __html: `
<span class="text-pink-600 dark:text-pink-400">class</span> <span class="text-amber-600 dark:text-amber-400">CreditCard</span>(<span class="text-blue-600 dark:text-blue-400">Payment</span>):<br />
&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">def</span> <span class="text-blue-600 dark:text-blue-400">pay</span>(self, amount):<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-400"># Hidden complexity inside the method</span><br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;token = self._encrypt_details()<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;auth = bank_api.authenticate(token)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">if</span> auth.success:<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;bank_api.deduct(amount)<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">return</span> <span class="text-blue-600 dark:text-blue-400">True</span><br />
          `}} />
        </div>

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
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Enforcing the Contract</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">Child classes MUST implement all abstract methods before they can be used. Python enforces this rule.</p>
      
      <div className="flex flex-col w-full gap-8 items-center justify-center">
         
         <div className="flex items-center gap-8 h-[80px]">
            <AnimatePresence mode="wait">
               {!showFix ? (
                  <motion.div key="broken" className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: 10 }}>
                     <div className="flex items-center gap-4">
                        <NodeCard icon={ShieldAlert} title="GiftCard" subtitle="Missing pay() method" color="rose" />
                        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl shadow-sm">
                           <XCircle className="size-5 text-rose-500" />
                           <span className="font-mono text-xs">TypeError: Can't instantiate class GiftCard</span>
                        </div>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div key="fixed" className="flex flex-col items-center gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                     <div className="flex items-center gap-4">
                        <NodeCard icon={CircleDollarSign} title="GiftCard" subtitle="def pay(self, amount):" color="emerald" highlight />
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl shadow-sm">
                           <CheckCircle className="size-5 text-emerald-500" />
                           <span className="font-mono text-xs">Instantiated successfully</span>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="w-[420px] bg-surface-2/30 rounded-lg p-5 font-mono text-xs border border-hairline relative text-left shadow-lg">
          <div dangerouslySetInnerHTML={{ __html: `
<span class="text-pink-600 dark:text-pink-400">class</span> <span class="text-amber-600 dark:text-amber-400">GiftCard</span>(<span class="text-blue-600 dark:text-blue-400">Payment</span>):<br />
          `}} />
          <AnimatePresence mode="wait">
             {!showFix ? (
                <motion.div key="badcode" className="text-pink-600 dark:text-pink-400 h-[40px] mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                   &nbsp;&nbsp;&nbsp;&nbsp;pass
                </motion.div>
             ) : (
                <motion.div key="goodcode" className="h-[40px] mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">def</span> <span className="text-blue-600 dark:text-blue-400">pay</span>(self, amount):<br />
                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-600 dark:text-blue-400">print</span>(<span className="text-emerald-600 dark:text-emerald-400">"Deducting from balance"</span>)
                </motion.div>
             )}
          </AnimatePresence>
          <div className="mt-2" dangerouslySetInnerHTML={{ __html: `
<span class="text-slate-400"># Usage:</span><br />
<span class="${showFix ? 'text-emerald-500 dark:text-emerald-400 transition-colors' : 'text-rose-500 dark:text-rose-400 transition-colors'}">card = GiftCard()</span>
          `}} />
        </div>
      </div>
    </motion.div>
  );
}

function Step3ABC() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Abstract Base Classes (ABC)</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">Python prevents you from directly instantiating an abstract class because it's incomplete.</p>
      
      <div className="flex flex-col items-center justify-center gap-8 w-full">
         <div className="flex items-center gap-6">
            <motion.div className="flex items-center gap-4 bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl relative overflow-hidden shadow-sm" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
               <div className="bg-rose-500/20 p-2 rounded-full">
                  <XCircle className="size-6 text-rose-500" />
               </div>
               <div className="flex flex-col">
                  <span className="font-mono text-sm font-semibold">payment = Payment()</span>
                  <span className="text-xs text-rose-500 mt-1 font-mono">TypeError: Can't instantiate abstract class</span>
               </div>
            </motion.div>
         </div>
         
         <div className="w-[480px] bg-surface-2/30 rounded-lg p-5 font-mono text-sm border border-hairline text-left shadow-lg" dangerouslySetInnerHTML={{ __html: `
<span class="text-pink-600 dark:text-pink-400">from</span> abc <span class="text-pink-600 dark:text-pink-400">import</span> ABC, abstractmethod<br /><br />
<span class="text-pink-600 dark:text-pink-400">class</span> <span class="text-amber-600 dark:text-amber-400">Payment</span>(<span class="text-blue-600 dark:text-blue-400">ABC</span>):<br />
&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-emerald-600 dark:text-emerald-400">@abstractmethod</span><br />
&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">def</span> <span class="text-blue-600 dark:text-blue-400">pay</span>(self, amount):<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">pass</span>
         ` }} />
      </div>
    </motion.div>
  );
}

// Custom Node Card for diagrams
function NodeCard({ icon: Icon, title, subtitle, color, highlight = false }: { icon: any, title: string, subtitle?: string, color: 'emerald' | 'rose' | 'indigo' | 'slate', highlight?: boolean }) {
  const colors = {
    emerald: "text-emerald-500 border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    rose: "text-rose-500 border-rose-500/50 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    indigo: "text-indigo-500 border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]",
    slate: "text-muted-foreground border-hairline bg-surface-2/50 shadow-sm",
  };
  
  return (
    <div className={cn(`rounded-2xl border-2 flex flex-col items-center justify-center backdrop-blur-md relative overflow-hidden text-center transition-all duration-300`, colors[color], "w-36 p-4 gap-2", highlight && "scale-105")}>
      {highlight && <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-current" />}
      <Icon className="size-6 relative z-10" />
      <span className="font-mono font-bold leading-tight text-xs relative z-10">{title}</span>
      {subtitle && <span className="text-[10px] font-mono opacity-80 leading-tight relative z-10">{subtitle}</span>}
    </div>
  );
}
