import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Box, Code2, Copy, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Fingerprint, Layers, Cpu, TerminalSquare, ArrowRight } from "lucide-react";
import { CarSVG } from "./CarSVG";

export function ClassesAndObjectsCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 4;

  const STEP_DURATIONS = [6000, 5000, 7000, 6000];

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
      <div className="relative px-4 py-8 lg:px-8 lg:py-10 h-[500px] overflow-hidden flex flex-col items-center justify-center w-full bg-slate-900/5 dark:bg-black/20">
        <AnimatePresence mode="wait">
          {step === 0 && <Step0Concept key="step0" />}
          {step === 1 && <Step1Blueprint key="step1" />}
          {step === 2 && <Step2Objects key="step2" />}
          {step === 3 && <Step3Methods key="step3" />}
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

function Step0Concept() {
  const [selectedObj, setSelectedObj] = useState<number | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center"
    >
      <div className="flex w-full max-w-4xl gap-16 items-center justify-center">
        
        {/* Class (Blueprint) */}
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
             <h3 className="font-mono text-xl text-foreground font-light mb-1">The Class</h3>
             <p className="text-xs text-muted-foreground uppercase tracking-widest">The Blueprint</p>
          </div>
          
          <motion.div className="w-56 aspect-[4/5] rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-transparent shadow-[0_0_40px_rgba(59,130,246,0.15)] backdrop-blur-md p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <Layers className="size-8 text-blue-400 absolute top-6 left-6 z-20" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <CarSVG className="w-44 h-auto opacity-30 text-blue-400 drop-shadow-sm" />
            </div>
            
            <div className="w-full space-y-2 mt-auto z-10 mb-2">
               <div className="w-full flex items-center justify-between px-2 py-1.5 border border-dashed border-blue-500/30 rounded bg-blue-500/5 backdrop-blur-md">
                  <span className="font-mono text-[10px] text-blue-400/70">color:</span>
                  <span className="font-mono text-[10px] text-blue-400/30">____</span>
               </div>
            </div>
            <div className="font-mono text-[10px] text-blue-400/80 z-10">Defines shape & features</div>
          </motion.div>
        </div>
        
        {/* Animated Arrow Line */}
        <div className="flex flex-col items-center justify-center relative w-16 h-32">
           <svg className="w-full h-full absolute" viewBox="0 0 100 100" preserveAspectRatio="none">
             <motion.path 
               d="M 10 50 L 90 50" 
               stroke="currentColor" 
               strokeWidth="2" 
               strokeDasharray="5,5" 
               fill="none" 
               className="text-muted-foreground/30"
             />
             <motion.path 
               d="M 10 50 L 90 50" 
               stroke="currentColor" 
               strokeWidth="2" 
               strokeDasharray="5,5" 
               fill="none" 
               className="text-blue-400"
               animate={{ strokeDashoffset: [-20, 0] }}
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
             />
             <path d="M 85 45 L 95 50 L 85 55 Z" fill="currentColor" className="text-muted-foreground/30" />
           </svg>
           <div className="bg-surface-2/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-muted-foreground z-10 border border-hairline mt-10">Instantiates</div>
        </div>

        {/* Objects (Real Things) */}
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
             <h3 className="font-mono text-xl text-foreground font-light mb-1">The Objects</h3>
             <p className="text-xs text-muted-foreground uppercase tracking-widest">The Real Things</p>
          </div>
          
          <div className="relative w-64 h-72 flex items-center justify-center">
             {/* Object 1 */}
             <motion.div 
               layoutId="obj1"
               initial={{ x: -40, y: -40, opacity: 0, scale: 0.8 }}
               animate={{ 
                 x: -40, 
                 y: -40, 
                 opacity: (selectedObj !== null && selectedObj !== 1) ? 0.6 : 1, 
                 scale: selectedObj === 1 ? 1.1 : (selectedObj !== null ? 0.95 : 1),
                 zIndex: selectedObj === 1 ? 50 : 10
               }}
               transition={{ delay: selectedObj === null ? 0.5 : 0, type: "spring", bounce: 0.4 }}
               onMouseEnter={() => setSelectedObj(1)}
               onMouseLeave={() => setSelectedObj(null)}
               className="absolute w-36 aspect-[4/5] rounded-2xl border border-rose-500/30 bg-surface shadow-2xl backdrop-blur-md flex flex-col items-center p-4 cursor-pointer hover:border-rose-500/80 transition-colors"
             >
                <div className="font-mono text-[9px] text-rose-400/80 uppercase tracking-widest mb-auto w-full text-center">Object A</div>
                <CarSVG className="w-full h-auto drop-shadow-md my-auto" color="#f43f5e" />
                <div className="w-full mt-auto bg-rose-500/10 border border-rose-500/20 rounded py-1 text-center font-mono text-[9px] text-rose-400">color: "red"</div>
             </motion.div>

             {/* Object 2 */}
             <motion.div 
               layoutId="obj2"
               initial={{ x: 0, y: 0, opacity: 0, scale: 0.8 }}
               animate={{ 
                 x: 0, 
                 y: 0, 
                 opacity: (selectedObj !== null && selectedObj !== 2) ? 0.6 : 1, 
                 scale: selectedObj === 2 ? 1.1 : (selectedObj !== null ? 0.95 : 1),
                 zIndex: selectedObj === 2 ? 50 : 20
               }}
               transition={{ delay: selectedObj === null ? 0.8 : 0, type: "spring", bounce: 0.4 }}
               onMouseEnter={() => setSelectedObj(2)}
               onMouseLeave={() => setSelectedObj(null)}
               className="absolute w-36 aspect-[4/5] rounded-2xl border border-emerald-500/30 bg-surface shadow-2xl backdrop-blur-md flex flex-col items-center p-4 cursor-pointer hover:border-emerald-500/80 transition-colors"
             >
                <div className="font-mono text-[9px] text-emerald-400/80 uppercase tracking-widest mb-auto w-full text-center">Object B</div>
                <CarSVG className="w-full h-auto drop-shadow-md my-auto" color="#10b981" />
                <div className="w-full mt-auto bg-emerald-500/10 border border-emerald-500/20 rounded py-1 text-center font-mono text-[9px] text-emerald-400">color: "green"</div>
             </motion.div>

             {/* Object 3 */}
             <motion.div 
               layoutId="obj3"
               initial={{ x: 40, y: 40, opacity: 0, scale: 0.8 }}
               animate={{ 
                 x: 40, 
                 y: 40, 
                 opacity: (selectedObj !== null && selectedObj !== 3) ? 0.6 : 1, 
                 scale: selectedObj === 3 ? 1.1 : (selectedObj !== null ? 0.95 : 1),
                 zIndex: selectedObj === 3 ? 50 : 30
               }}
               transition={{ delay: selectedObj === null ? 1.1 : 0, type: "spring", bounce: 0.4 }}
               onMouseEnter={() => setSelectedObj(3)}
               onMouseLeave={() => setSelectedObj(null)}
               className="absolute w-36 aspect-[4/5] rounded-2xl border border-amber/30 bg-surface shadow-2xl backdrop-blur-md flex flex-col items-center p-4 cursor-pointer hover:border-amber/80 transition-colors"
             >
                <div className="font-mono text-[9px] text-amber/80 uppercase tracking-widest mb-auto w-full text-center">Object C</div>
                <CarSVG className="w-full h-auto drop-shadow-md my-auto" color="#fbbf24" />
                <div className="w-full mt-auto bg-amber/10 border border-amber/20 rounded py-1 text-center font-mono text-[9px] text-amber">color: "yellow"</div>
             </motion.div>
          </div>
        </div>

      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-lg text-center">
        {selectedObj === null ? "Hover over an object card to isolate it! " : ""}
        Before looking at code, remember the core concept: A <strong className="text-foreground">Class</strong> is just a blueprint. An <strong className="text-foreground">Object</strong> is the actual thing built from it.
      </p>
    </motion.div>
  )
}

function Step1Blueprint() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center"
    >
      <div className="flex w-full max-w-4xl gap-12 items-center justify-center">
        {/* Code Snippet */}
        <div className="flex-1 p-6 bg-surface-2/80 backdrop-blur border border-hairline rounded-2xl shadow-xl font-mono text-[13px] leading-relaxed">
          <span className="text-blue-400">class</span> <span className="text-mint font-bold">Car</span>:<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">def</span> <span className="text-blue-400">__init__</span>(<span className="text-rose-400">self</span>, brand, speed):<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">self</span>.brand = brand<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-rose-400">self</span>.speed = speed<br/>
          <br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">def</span> <span className="text-violet">drive</span>(<span className="text-rose-400">self</span>):<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">print</span>(<span className="text-amber">f"</span>{'{'}<span className="text-rose-400">self</span>.brand{'}'}<span className="text-amber"> is driving."</span>)
        </div>

        {/* Visual Blueprint */}
        <div className="flex-1 flex justify-center relative">
          <motion.div layoutId="blueprint_card" className="w-64 aspect-[4/5] rounded-3xl border border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-transparent shadow-[0_0_40px_rgba(59,130,246,0.15)] backdrop-blur-md p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400"><Layers className="size-5" /></div>
              <div className="font-mono text-xs text-blue-400 uppercase tracking-widest font-semibold">Blueprint</div>
            </div>
            
            <div className="font-mono text-3xl font-light text-foreground mb-4">Car</div>
            
            <div className="flex-1 flex items-center justify-center relative">
              <CarSVG className="w-40 h-auto opacity-10 absolute" color="#3b82f6" />
            </div>
            
            <div className="space-y-4 mb-6 mt-auto">
              <div className="w-full h-8 rounded-lg border border-dashed border-muted flex items-center px-3 opacity-50">
                 <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">brand</span>
              </div>
              <div className="w-full h-8 rounded-lg border border-dashed border-muted flex items-center px-3 opacity-50">
                 <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">speed</span>
              </div>
            </div>
            
            <div className="w-full h-10 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center mt-auto">
               <span className="font-mono text-xs text-violet font-semibold tracking-wider">drive()</span>
            </div>
          </motion.div>
        </div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-lg text-center">A class is a theoretical blueprint. It defines what data it <span className="italic">will</span> hold and what actions it <span className="italic">can</span> perform, but it doesn't hold actual data itself.</p>
    </motion.div>
  )
}

function Step2Objects() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center"
    >
      <div className="flex w-full max-w-4xl gap-12 items-center justify-center">
        {/* Code Snippet */}
        <div className="flex-1 p-6 bg-surface-2/80 backdrop-blur border border-hairline rounded-2xl shadow-xl font-mono text-[13px] leading-relaxed relative overflow-hidden">
          <div className="relative z-10">
            car1 = <span className="text-mint font-bold">Car</span>(<span className="text-amber">"Toyota"</span>, <span className="text-mint">120</span>)<br/>
            car2 = <span className="text-mint font-bold">Car</span>(<span className="text-amber">"Ford"</span>, <span className="text-mint">140</span>)<br/>
            <br/>
            <span className="text-blue-400">print</span>(car1.brand)  <span className="text-muted-foreground"># "Toyota"</span><br/>
            <span className="text-blue-400">print</span>(car2.brand)  <span className="text-muted-foreground"># "Ford"</span>
          </div>
        </div>

        {/* Visual Independence */}
        <div className="flex-1 flex gap-6 items-center justify-center relative h-80">
          
          <motion.div 
            initial={{ x: -20, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-48 aspect-[4/5] rounded-2xl border border-amber/30 bg-surface shadow-2xl backdrop-blur-md p-5 flex flex-col cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
               <div className="font-mono text-[10px] text-amber font-semibold bg-amber/10 px-2 py-1 rounded w-fit">car1</div>
               <Fingerprint className="size-4 text-muted-foreground opacity-50" />
            </div>
            <div className="font-mono text-xl text-foreground font-light mb-2">Car</div>
            
            <div className="flex-1 flex items-center justify-center">
              <CarSVG className="w-32 h-auto drop-shadow-md" color="#fbbf24" />
            </div>

            <div className="space-y-3 mt-auto">
              <div className="w-full bg-amber/5 rounded-lg p-2 flex justify-between items-center text-xs font-mono border border-amber/20">
                 <span className="text-muted-foreground">brand</span> <span className="text-amber">"Toyota"</span>
              </div>
              <div className="w-full bg-surface-2 rounded-lg p-2 flex justify-between items-center text-xs font-mono border border-hairline">
                 <span className="text-muted-foreground">speed</span> <span className="text-foreground">120</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
            className="w-48 aspect-[4/5] rounded-2xl border border-mint/30 bg-surface shadow-2xl backdrop-blur-md p-5 flex flex-col cursor-default mt-10"
          >
            <div className="flex items-center justify-between mb-4">
               <div className="font-mono text-[10px] text-mint font-semibold bg-mint/10 px-2 py-1 rounded w-fit">car2</div>
               <Fingerprint className="size-4 text-muted-foreground opacity-50" />
            </div>
            <div className="font-mono text-xl text-foreground font-light mb-2">Car</div>
            
            <div className="flex-1 flex items-center justify-center">
              <CarSVG className="w-32 h-auto drop-shadow-md" color="#34d399" />
            </div>

            <div className="space-y-3 mt-auto">
              <div className="w-full bg-amber/5 rounded-lg p-2 flex justify-between items-center text-xs font-mono border border-amber/20">
                 <span className="text-muted-foreground">brand</span> <span className="text-amber">"Ford"</span>
              </div>
              <div className="w-full bg-surface-2 rounded-lg p-2 flex justify-between items-center text-xs font-mono border border-hairline">
                 <span className="text-muted-foreground">speed</span> <span className="text-foreground">140</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-lg text-center">Calling the class creates instances (objects). They are independent entities living in memory that share the same blueprint structure but hold their own unique state.</p>
    </motion.div>
  )
}

function Step3Methods() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center w-full h-full justify-center"
    >
      <div className="flex w-full max-w-4xl gap-12 items-center justify-center">
        {/* Code Snippet */}
        <div className="flex-1 p-6 bg-surface-2/80 backdrop-blur border border-hairline rounded-2xl shadow-xl font-mono text-[13px] leading-relaxed relative">
          <div className="text-muted-foreground/60 mb-2"># Using the object</div>
          car1.drive()<br/>
          <br/>
          
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 p-4 bg-slate-950/80 rounded-xl text-green-400 font-mono text-sm shadow-inner flex items-center gap-3 border border-slate-800"
          >
             <TerminalSquare className="size-4 text-slate-500" />
             &gt; Toyota is driving.
          </motion.div>
        </div>

        {/* Visual Method Call */}
        <div className="flex-1 flex gap-8 items-center justify-center relative h-80">
          
          <motion.div className="w-56 aspect-[4/5] rounded-2xl border border-amber/30 bg-surface shadow-2xl backdrop-blur-md p-6 flex flex-col relative z-20">
            <div className="font-mono text-[10px] text-amber font-semibold bg-amber/10 px-2 py-1 rounded w-fit mb-2">car1</div>
            
            <div className="flex-1 flex items-center justify-center relative group">
               <motion.div
                 animate={{ scale: [1, 1.03, 1] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
               >
                 <CarSVG className="w-36 h-auto drop-shadow-xl" color="#fbbf24" />
               </motion.div>
            </div>

            <div className="space-y-3 mb-6 mt-auto">
              <motion.div 
                initial={{ backgroundColor: "rgba(251, 191, 36, 0.05)" }}
                animate={{ backgroundColor: ["rgba(251, 191, 36, 0.05)", "rgba(251, 191, 36, 0.2)", "rgba(251, 191, 36, 0.05)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="w-full rounded-lg p-2 flex justify-between items-center text-xs font-mono border border-amber/20"
              >
                 <span className="text-muted-foreground">brand</span> <span className="text-amber">"Toyota"</span>
              </motion.div>
              <div className="w-full bg-surface-2 rounded-lg p-2 flex justify-between items-center text-xs font-mono border border-hairline">
                 <span className="text-muted-foreground">speed</span> <span className="text-foreground">120</span>
              </div>
            </div>
            
            <motion.div 
              initial={{ scale: 1, backgroundColor: "rgba(139, 92, 246, 0.05)" }}
              animate={{ scale: [1, 1.05, 1], backgroundColor: ["rgba(139, 92, 246, 0.05)", "rgba(139, 92, 246, 0.2)", "rgba(139, 92, 246, 0.05)"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-full h-10 rounded-xl border border-violet/30 flex items-center justify-center mt-auto cursor-pointer shadow-sm"
            >
               <span className="font-mono text-xs text-violet font-semibold tracking-wider flex items-center gap-2">
                 <Cpu className="size-3" /> drive()
               </span>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-2 p-4 rounded-xl border border-hairline bg-surface-2/80 max-w-[160px] shadow-sm backdrop-blur"
          >
             <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1 border-b border-hairline pb-2">
                <ArrowRight className="size-3" /> Under the hood
             </div>
             <div className="text-xs font-mono text-foreground/80 leading-relaxed mt-1">
                Python passes <span className="text-amber font-semibold">car1</span> into <span className="text-rose-400 font-semibold bg-rose-400/10 px-1 rounded">self</span> automatically.
             </div>
          </motion.div>

        </div>
      </div>
      <p className="mt-12 text-sm text-muted-foreground/80 max-w-xl text-center">Objects carry both their data and their capabilities. Methods act on the object's own distinct data (via <code className="bg-surface-2 px-1 rounded">self</code>).</p>
    </motion.div>
  )
}
