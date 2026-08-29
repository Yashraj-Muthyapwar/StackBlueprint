import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  User, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Laptop,
  Headphones
} from "lucide-react";

export function InstanceAndClassAttributesCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 5;

  const STEP_DURATIONS = [7000, 9000, 9000, 8000, 9000];

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), STEP_DURATIONS[step] || 5000);
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
    <div 
      className="flex flex-col relative z-10 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative px-4 py-8 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step0CoreIdea key="step0" />}
          {step === 1 && <Step1InstanceAttributes key="step1" />}
          {step === 2 && <Step2ClassAttributes key="step2" />}
          {step === 3 && <Step3Sorting key="step3" />}
          {step === 4 && <Step4ProductExample key="step4" />}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setPlaying(false); setStep(0); }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Restart"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Previous step"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Next step"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="font-mono text-xs text-muted-foreground mr-2">
             {step + 1} / {totalSteps}
           </span>
          {Array.from({ length: totalSteps }).map((_, i) => {
            const isActive = i === step;
            return (
              <motion.span
                key={i}
                animate={{
                  backgroundColor: isActive
                    ? "var(--mint, #40e0b4)"
                    : "var(--hairline, #2a2a35)",
                  width: isActive ? 24 : 8,
                }}
                transition={{ duration: 0.2 }}
                className="h-1 rounded-full cursor-pointer"
                onClick={() => { setPlaying(false); setStep(i); }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step0CoreIdea() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">The Core Idea</h3>
      <p className="text-sm text-muted-foreground mb-12 text-center">
        A <span className="text-emerald-500 font-bold">Class Attribute</span> is shared.<br/>
        An <span className="text-blue-500 font-bold">Instance Attribute</span> is unique to one object.
      </p>

      <div className="relative flex flex-col items-center w-full">
        
        {/* Class Attribute */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
           className="relative z-10 px-6 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.1)] flex items-center gap-3 backdrop-blur-sm"
        >
           <Building2 className="text-emerald-500 size-5" />
           <div className="font-mono text-sm text-foreground">
             <span className="text-emerald-500">company</span> = <span className="text-amber-500">"Stack Blueprint"</span>
           </div>
           <div className="absolute -top-3 -right-2 px-2 py-0.5 bg-emerald-500 text-white font-bold text-[10px] rounded-full uppercase tracking-wider">Shared</div>
        </motion.div>

        {/* SVG Connectors */}
        <svg className="absolute top-10 left-0 w-full h-24 pointer-events-none opacity-40 z-0" viewBox="0 0 600 100">
           <path d="M300,0 C300,50 150,50 150,100" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
           <path d="M300,0 C300,50 300,50 300,100" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
           <path d="M300,0 C300,50 450,50 450,100" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Instances */}
        <div className="flex gap-4 md:gap-10 mt-16 relative z-10 w-full justify-center">
          {[
            { name: '"Maya"', salary: "70000", delay: 0.5 },
            { name: '"Leo"', salary: "82000", delay: 0.7 },
            { name: '"Zane"', salary: "65000", delay: 0.9 },
          ].map((emp, idx) => (
            <motion.div 
               key={idx}
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: emp.delay }}
               className="w-36 md:w-40 bg-surface border border-blue-500/30 rounded-xl overflow-hidden shadow-lg relative"
            >
               <div className="bg-blue-500/10 py-2 border-b border-blue-500/30 flex justify-center items-center gap-2">
                 <User className="size-4 text-blue-500" />
                 <span className="font-mono text-xs text-blue-500 font-semibold">employee{idx + 1}</span>
               </div>
               <div className="p-3 space-y-2">
                 <div className="flex flex-col">
                   <span className="text-[10px] text-muted-foreground font-mono">name</span>
                   <span className="text-xs font-mono text-amber-500">{emp.name}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] text-muted-foreground font-mono">salary</span>
                   <span className="text-xs font-mono text-violet-500">{emp.salary}</span>
                 </div>
               </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  )
}

function Step1InstanceAttributes() {
  const [val, setVal] = useState("70000");

  useEffect(() => {
    const id = setTimeout(() => setVal("75000"), 3500);
    return () => clearTimeout(id);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Instance Attributes are Isolated</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center">Changing one object does not affect the other.</p>
      
      <div className="relative font-mono text-sm bg-surface border border-hairline rounded-lg px-4 py-2 mb-8 shadow-sm">
        <span className="text-blue-500">employee1</span>.<span className="text-foreground">salary</span> = <span className="text-violet-500">75000</span>
      </div>

      <div className="flex gap-12 relative z-10 w-full justify-center">
        {/* Maya */}
        <motion.div 
           className="w-48 bg-surface border-2 border-blue-500/50 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.15)] relative"
        >
           <div className="bg-blue-500/10 py-2 border-b border-blue-500/50 flex justify-center items-center gap-2">
             <User className="size-4 text-blue-500" />
             <span className="font-mono text-sm text-blue-500 font-bold">employee1</span>
           </div>
           <div className="p-4 space-y-3">
             <div className="flex justify-between items-center bg-surface-2 px-3 py-1.5 rounded border border-hairline">
               <span className="text-xs text-muted-foreground font-mono">name</span>
               <span className="text-xs font-mono text-amber-500">"Maya"</span>
             </div>
             <motion.div 
               animate={{ 
                 backgroundColor: val === "75000" ? ["rgba(167,139,250,0.4)", "var(--surface-2)"] : "var(--surface-2)",
                 scale: val === "75000" ? [1.05, 1] : 1
               }}
               transition={{ duration: 0.5 }}
               className="flex justify-between items-center px-3 py-1.5 rounded border border-violet-500/30"
             >
               <span className="text-xs text-violet-500 font-mono">salary</span>
               <span className="text-xs font-mono text-violet-500 font-bold">{val}</span>
             </motion.div>
           </div>
        </motion.div>

        {/* Leo */}
        <motion.div 
           className="w-48 bg-surface border border-hairline rounded-xl overflow-hidden shadow-sm relative opacity-70"
        >
           <div className="bg-surface-2 py-2 border-b border-hairline flex justify-center items-center gap-2">
             <User className="size-4 text-muted-foreground" />
             <span className="font-mono text-sm text-muted-foreground font-semibold">employee2</span>
           </div>
           <div className="p-4 space-y-3">
             <div className="flex justify-between items-center bg-surface-2 px-3 py-1.5 rounded border border-hairline">
               <span className="text-xs text-muted-foreground font-mono">name</span>
               <span className="text-xs font-mono text-amber-500">"Leo"</span>
             </div>
             <div className="flex justify-between items-center bg-surface-2 px-3 py-1.5 rounded border border-hairline">
               <span className="text-xs text-muted-foreground font-mono">salary</span>
               <span className="text-xs font-mono text-violet-500">82000</span>
             </div>
           </div>
        </motion.div>
      </div>

    </motion.div>
  )
}

function Step2ClassAttributes() {
  const [company, setCompany] = useState('"Global Corp"');

  useEffect(() => {
    const id = setTimeout(() => setCompany('"Stack Blueprint"'), 3500);
    return () => clearTimeout(id);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-3xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Class Attributes are Shared</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center">Changing the class updates the value for all objects.</p>
      
      <div className="relative font-mono text-sm bg-surface border border-hairline rounded-lg px-4 py-2 mb-6 shadow-sm">
        <span className="text-emerald-500 font-bold">Employee</span>.<span className="text-foreground">company</span> = <span className="text-amber-500">"Stack Blueprint"</span>
      </div>

      <div className="relative flex flex-col items-center w-full">
        {/* Class Attribute */}
        <motion.div 
           animate={{ scale: company === '"Global Corp"' ? [1.1, 1] : 1 }}
           className="relative z-10 px-6 py-3 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-3"
        >
           <Building2 className="text-emerald-500 size-5" />
           <div className="font-mono text-sm text-foreground">
             <span className="text-emerald-500 font-bold">company</span> = 
             <motion.span 
               key={company} 
               initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} 
               className="text-amber-500 ml-2 inline-block font-bold"
             >
               {company}
             </motion.span>
           </div>
        </motion.div>

        {/* SVG Connectors */}
        <svg className="absolute top-10 left-0 w-full h-24 pointer-events-none opacity-60 z-0" viewBox="0 0 600 100">
           <path d="M300,10 Q200,50 200,100" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" />
           <path d="M300,10 Q400,50 400,100" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" />
           {company === '"Stack Blueprint"' && (
             <>
                <motion.circle cx="200" cy="100" r="4" fill="#10b981" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 0.8 }} style={{ offsetPath: 'path("M300,10 Q200,50 200,100")' }} />
                <motion.circle cx="400" cy="100" r="4" fill="#10b981" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 0.8 }} style={{ offsetPath: 'path("M300,10 Q400,50 400,100")' }} />
             </>
           )}
        </svg>

        {/* Instances */}
        <div className="flex gap-20 mt-16 relative z-10 w-full justify-center">
          {[1, 2].map((idx) => (
            <div key={idx} className="w-40 bg-surface border border-hairline rounded-xl overflow-hidden shadow-sm">
               <div className="bg-surface-2 py-1.5 border-b border-hairline flex justify-center items-center gap-2">
                 <User className="size-3 text-muted-foreground" />
                 <span className="font-mono text-[11px] text-muted-foreground font-semibold">employee{idx}</span>
               </div>
               <div className="p-3">
                 <div className="text-[10px] text-muted-foreground font-mono text-center mb-1">sees company as:</div>
                 <motion.div 
                   key={company}
                   initial={{ backgroundColor: "rgba(16,185,129,0)" }}
                   animate={{ backgroundColor: ["rgba(16,185,129,0.3)", "rgba(16,185,129,0)"] }}
                   transition={{ duration: 1 }}
                   className="text-xs font-mono text-emerald-500 text-center py-1 rounded"
                 >
                   {company}
                 </motion.div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function Step3Sorting() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id1 = setTimeout(() => setPhase(1), 1000);
    const id2 = setTimeout(() => setPhase(2), 2500);
    const id3 = setTimeout(() => setPhase(3), 4000);
    const id4 = setTimeout(() => setPhase(4), 5500);
    return () => { clearTimeout(id1); clearTimeout(id2); clearTimeout(id3); clearTimeout(id4); };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-4xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Knowing Which to Use</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center">Does the value differ per object, or is it a shared default?</p>
      
      <div className="relative w-full h-64 flex justify-between px-10">
         
         {/* Instance Bucket */}
         <div className="w-56 h-full flex flex-col items-center justify-end pb-4 border-2 border-dashed border-blue-500/30 rounded-2xl bg-blue-500/5 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 font-bold font-mono text-blue-500 tracking-wider">INSTANCE</div>
            <div className="w-full px-4 flex flex-col gap-2">
               <AnimatePresence>
                 {phase >= 1 && (
                   <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-blue-600/80 text-white font-mono text-sm py-2 px-3 rounded-md text-center shadow-sm">
                     name
                   </motion.div>
                 )}
                 {phase >= 3 && (
                   <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-blue-600/80 text-white font-mono text-sm py-2 px-3 rounded-md text-center shadow-sm">
                     balance
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
         </div>

         {/* Source Deck (Hidden conceptually, items animate from center) */}
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center -top-32 text-foreground">
            <AnimatePresence mode="popLayout">
               {phase === 0 && (
                 <motion.div exit={{ scale: 0 }} className="bg-surface border border-hairline font-mono text-sm py-2 px-6 rounded-md shadow-lg font-bold">name</motion.div>
               )}
               {phase === 1 && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="bg-surface border border-hairline font-mono text-sm py-2 px-6 rounded-md shadow-lg font-bold">tax_rate</motion.div>
               )}
               {phase === 2 && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="bg-surface border border-hairline font-mono text-sm py-2 px-6 rounded-md shadow-lg font-bold">balance</motion.div>
               )}
               {phase === 3 && (
                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="bg-surface border border-hairline font-mono text-sm py-2 px-6 rounded-md shadow-lg font-bold">species</motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Class Bucket */}
         <div className="w-56 h-full flex flex-col items-center justify-end pb-4 border-2 border-dashed border-emerald-500/30 rounded-2xl bg-emerald-500/5 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 font-bold font-mono text-emerald-500 tracking-wider">CLASS</div>
            <div className="w-full px-4 flex flex-col gap-2">
               <AnimatePresence>
                 {phase >= 2 && (
                   <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-emerald-600/80 text-white font-mono text-sm py-2 px-3 rounded-md text-center shadow-sm">
                     tax_rate
                   </motion.div>
                 )}
                 {phase >= 4 && (
                   <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-emerald-600/80 text-white font-mono text-sm py-2 px-3 rounded-md text-center shadow-sm">
                     species
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
         </div>
         
      </div>
    </motion.div>
  )
}

function Step4ProductExample() {
  const [tax, setTax] = useState("0.08");

  useEffect(() => {
    const id = setTimeout(() => setTax("0.09"), 3500);
    return () => clearTimeout(id);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center max-w-4xl"
    >
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">A Practical Example</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center">Products have different prices, but share the same tax rate.</p>
      
      <div className="relative flex flex-col items-center w-full">
        {/* Class Attribute */}
        <motion.div 
           animate={{ scale: tax === "0.09" ? [1.1, 1] : 1 }}
           className="relative z-10 px-8 py-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg shadow-sm flex flex-col items-center backdrop-blur-sm"
        >
           <span className="text-[10px] text-emerald-500 uppercase tracking-widest mb-1 font-bold">Class Attribute</span>
           <div className="font-mono text-base text-foreground">
             <span className="text-emerald-500 font-bold">Product.tax_rate</span> = 

             <motion.span 
               key={tax} 
               initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} 
               className="text-white ml-2 inline-block font-bold bg-emerald-500 px-2 rounded"
             >
               {tax}
             </motion.span>
           </div>
        </motion.div>

        {/* SVG Connectors */}
        <svg className="absolute top-10 left-0 w-full h-32 pointer-events-none opacity-50 z-0" viewBox="0 0 600 150">
           <path d="M300,15 Q200,80 200,130" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" />
           <path d="M300,15 Q400,80 400,130" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" />
           {tax === "0.09" && (
             <>
                <motion.circle cx="200" cy="130" r="5" fill="#10b981" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 0.8 }} style={{ offsetPath: 'path("M300,15 Q200,80 200,130")' }} />
                <motion.circle cx="400" cy="130" r="5" fill="#10b981" initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 0.8 }} style={{ offsetPath: 'path("M300,15 Q400,80 400,130")' }} />
             </>
           )}
        </svg>

        {/* Instances */}
        <div className="flex gap-16 mt-20 relative z-10 w-full justify-center">
          {/* Laptop */}
          <div className="w-56 bg-surface border-2 border-blue-500/30 rounded-xl overflow-hidden shadow-md">
             <div className="bg-blue-500/10 py-2 border-b border-blue-500/30 flex justify-center items-center gap-2">
               <Laptop className="size-4 text-blue-500" />
               <span className="font-mono text-sm text-blue-500 font-bold">laptop</span>
             </div>
             <div className="p-4 space-y-2">
               <div className="flex justify-between font-mono text-xs border-b border-hairline pb-2">
                 <span className="text-muted-foreground">price</span>
                 <span className="text-amber-500">900</span>
               </div>
               <div className="flex justify-between font-mono text-xs pt-2 text-foreground">
                 <span className="text-muted-foreground">price_with_tax()</span>
                 <motion.span 
                    key={tax}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded"
                 >
                    {tax === "0.08" ? "972.0" : "981.0"}
                 </motion.span>
               </div>
             </div>
          </div>

          {/* Headphones */}
          <div className="w-56 bg-surface border-2 border-blue-500/30 rounded-xl overflow-hidden shadow-md">
             <div className="bg-blue-500/10 py-2 border-b border-blue-500/30 flex justify-center items-center gap-2">
               <Headphones className="size-4 text-blue-500" />
               <span className="font-mono text-sm text-blue-500 font-bold">headphones</span>
             </div>
             <div className="p-4 space-y-2">
               <div className="flex justify-between font-mono text-xs border-b border-hairline pb-2">
                 <span className="text-muted-foreground">price</span>
                 <span className="text-amber-500">100</span>
               </div>
               <div className="flex justify-between font-mono text-xs pt-2 text-foreground">
                 <span className="text-muted-foreground">price_with_tax()</span>
                 <motion.span 
                    key={tax}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded"
                 >
                    {tax === "0.08" ? "108.0" : "109.0"}
                 </motion.span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
