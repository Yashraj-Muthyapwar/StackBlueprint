import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
   RotateCcw, ChevronLeft, ChevronRight, Play, Pause,
   Bot, Battery, Crosshair, Droplets, ArrowRight, Zap, Combine, GitBranch, ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CompositionCustomAnimation() {
   const [step, setStep] = useState(0);
   const [playing, setPlaying] = useState(true);
   const [isHovered, setIsHovered] = useState(false);
   const totalSteps = 4;

   const STEP_DURATIONS = [6000, 8000, 8000, 8000];

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
               {step === 0 && <Step0Concept key="step0" />}
               {step === 1 && <Step1Assemble key="step1" />}
               {step === 2 && <Step2Delegation key="step2" />}
               {step === 3 && <Step3Flexibility key="step3" />}
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

function Step0Concept() {
   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
         <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Is-A vs Has-A</h3>
         <p className="text-sm text-muted-foreground mb-12 text-center max-w-md">Inheritance forces objects into rigid family trees. Composition builds objects out of smaller parts.</p>

         <div className="flex flex-row w-full gap-16 items-center justify-center">

            {/* Inheritance Side */}
            <div className="flex flex-col items-center p-6 border-2 border-hairline bg-surface-2/30 rounded-2xl relative w-64 h-[280px]">
               <div className="absolute -top-3 bg-indigo-500/10 text-indigo-500 border border-indigo-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1"><GitBranch className="size-3" /> Inheritance</div>

               <div className="mt-4 flex flex-col items-center">
                  <div className="bg-surface p-3 rounded-xl border border-hairline shadow-sm flex flex-col items-center gap-1 w-32">
                     <Bot className="size-6 text-muted-foreground" />
                     <span className="font-mono text-[10px] font-bold">Robot</span>
                  </div>

                  <div className="h-10 w-[2px] bg-indigo-500/30 flex items-center justify-center relative">
                     <div className="absolute bg-indigo-500 text-white px-2 py-0.5 text-[9px] font-mono font-bold rounded-full whitespace-nowrap z-10 shadow-sm">IS A</div>
                  </div>

                  <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/30 shadow-sm flex flex-col items-center gap-1 w-40">
                     <div className="flex gap-2 text-indigo-500">
                        <Bot className="size-5" />
                        <Crosshair className="size-5" />
                     </div>
                     <span className="font-mono text-[10px] font-bold text-indigo-500">LaserRobot</span>
                  </div>
               </div>
            </div>

            {/* Composition Side */}
            <div className="flex flex-col items-center p-6 border-2 border-emerald-500/30 bg-emerald-500/5 rounded-2xl relative w-64 h-[280px] shadow-[0_0_30px_rgba(16,185,129,0.1)]">
               <div className="absolute -top-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm"><Combine className="size-3" /> Composition</div>

               <div className="mt-8 flex flex-col items-center">
                  <div className="bg-surface p-4 rounded-xl border border-emerald-500/50 shadow-sm flex flex-col items-center w-48 relative overflow-hidden">
                     <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />

                     <div className="flex flex-col items-center gap-2 relative z-10 w-full">
                        <div className="flex items-center gap-2 text-emerald-500 border-b border-emerald-500/30 pb-2 w-full justify-center">
                           <Bot className="size-6" />
                           <span className="font-mono text-xs font-bold">Robot</span>
                        </div>

                        <div className="flex flex-col gap-2 w-full mt-2">
                           <div className="flex items-center justify-between bg-surface-2 px-3 py-1.5 rounded-lg border border-hairline w-full">
                              <span className="text-[9px] font-mono font-bold text-muted-foreground flex items-center gap-1"><div className="size-1.5 rounded-full bg-emerald-500" /> HAS A</span>
                              <div className="flex items-center gap-1 text-emerald-500"><Crosshair className="size-3" /> <span className="text-[10px] font-mono font-bold">Weapon</span></div>
                           </div>

                           <div className="flex items-center justify-between bg-surface-2 px-3 py-1.5 rounded-lg border border-hairline w-full">
                              <span className="text-[9px] font-mono font-bold text-muted-foreground flex items-center gap-1"><div className="size-1.5 rounded-full bg-emerald-500" /> HAS A</span>
                              <div className="flex items-center gap-1 text-emerald-500"><Battery className="size-3" /> <span className="text-[10px] font-mono font-bold">Battery</span></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </motion.div>
   );
}

function Step1Assemble() {
   const [phase, setPhase] = useState(0);

   useEffect(() => {
      const id1 = setTimeout(() => setPhase(1), 1000);
      const id2 = setTimeout(() => setPhase(2), 2500);
      return () => { clearTimeout(id1); clearTimeout(id2); };
   }, []);

   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
         <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Assembling the Robot</h3>
         <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">You build the Robot by passing smaller, independent objects into it.</p>

         <div className="flex flex-col items-center gap-8 w-full mt-8">

            <div className="flex items-center justify-center gap-8 w-full relative h-[180px]">

               {/* Parts */}
               <div className="flex flex-col gap-4 absolute left-10">
                  <motion.div
                     animate={phase >= 1 ? { x: 160, y: 25, scale: 0.8, opacity: 0 } : { x: 0, y: 0, scale: 1, opacity: 1 }}
                     transition={{ duration: 0.8, ease: "backIn" }}
                     className="bg-surface p-3 border-2 border-amber-500/50 rounded-xl shadow-lg flex items-center gap-3 w-40"
                  >
                     <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500"><Battery className="size-5" /></div>
                     <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold">Battery()</span>
                     </div>
                  </motion.div>

                  <motion.div
                     animate={phase >= 2 ? { x: 160, y: -45, scale: 0.8, opacity: 0 } : { x: 0, y: 0, scale: 1, opacity: 1 }}
                     transition={{ duration: 0.8, ease: "backIn" }}
                     className="bg-surface p-3 border-2 border-rose-500/50 rounded-xl shadow-lg flex items-center gap-3 w-40"
                  >
                     <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500"><Crosshair className="size-5" /></div>
                     <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold">Laser()</span>
                     </div>
                  </motion.div>
               </div>

               {/* Robot Shell */}
               <div className="w-56 h-48 border-4 border-dashed border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between absolute z-10 bg-surface/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between w-full">
                     <div className="flex items-center gap-2 text-emerald-500">
                        <Bot className="size-6" />
                        <span className="font-mono font-bold">Robot</span>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-2">
                     <div className={cn("h-12 w-full rounded-xl border-2 flex items-center justify-center transition-all duration-300", phase >= 1 ? "bg-amber-500/10 border-amber-500" : "bg-surface-2 border-hairline border-dashed")}>
                        {phase >= 1 ? (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-amber-500 font-mono text-[10px] font-bold">
                              <Battery className="size-4" /> self.power
                           </motion.div>
                        ) : <span className="text-[9px] text-muted-foreground font-mono">Empty Slot</span>}
                     </div>

                     <div className={cn("h-12 w-full rounded-xl border-2 flex items-center justify-center transition-all duration-300", phase >= 2 ? "bg-rose-500/10 border-rose-500" : "bg-surface-2 border-hairline border-dashed")}>
                        {phase >= 2 ? (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-rose-500 font-mono text-[10px] font-bold">
                              <Crosshair className="size-4" /> self.weapon
                           </motion.div>
                        ) : <span className="text-[9px] text-muted-foreground font-mono">Empty Slot</span>}
                     </div>
                  </div>
               </div>

            </div>

            {/* Code Snippet */}
            <div className="w-[480px] bg-surface-2/30 rounded-lg p-5 font-mono text-sm border border-hairline text-left shadow-lg mt-4 flex flex-col items-center">
               <div className="bg-black/5 dark:bg-white/5 px-4 py-2 rounded-lg border border-hairline text-center w-full">
                  <span className="text-pink-600 dark:text-pink-400">my_robot</span> = <span className="text-amber-600 dark:text-amber-400">Robot</span>(<span className="text-emerald-600 dark:text-emerald-400">power</span>=<span className="text-amber-600 dark:text-amber-400">Battery</span>(), <span className="text-emerald-600 dark:text-emerald-400">weapon</span>=<span className="text-amber-600 dark:text-amber-400">Laser</span>())
               </div>
            </div>

         </div>
      </motion.div>
   );
}

function Step2Delegation() {
   const [attacking, setAttacking] = useState(false);

   useEffect(() => {
      const id = setInterval(() => {
         setAttacking(true);
         setTimeout(() => setAttacking(false), 1500);
      }, 2500);
      return () => clearInterval(id);
   }, []);

   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
         <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Delegation</h3>
         <p className="text-sm text-muted-foreground mb-12 text-center max-w-md">The Robot doesn't know how to shoot. When you call `attack()`, it passes the job to its weapon.</p>

         <div className="flex items-center gap-16 justify-center w-full">

            <div className="flex flex-col items-center gap-4">
               <motion.button
                  animate={{ scale: attacking ? 0.95 : 1, backgroundColor: attacking ? "rgba(239, 68, 68, 0.1)" : "var(--surface)" }}
                  className="font-mono text-xs font-bold px-4 py-2 border-2 border-hairline rounded-xl shadow-sm hover:bg-surface-2 transition-colors relative z-20"
               >
                  my_robot.attack()
               </motion.button>
               <ArrowDown className="size-4 text-muted-foreground" />

               <div className="w-56 h-48 border-2 border-emerald-500 rounded-2xl p-4 flex flex-col justify-between relative bg-emerald-500/5">
                  <motion.div animate={{ opacity: attacking ? [0, 0.5, 0] : 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-rose-500/10 rounded-2xl" />

                  <div className="flex items-center justify-between w-full relative z-10">
                     <div className="flex items-center gap-2 text-emerald-500">
                        <Bot className="size-6" />
                        <span className="font-mono font-bold">Robot Class</span>
                     </div>
                  </div>

                  <div className="h-20 w-full rounded-xl border-2 bg-rose-500/10 border-rose-500 relative flex items-center justify-center overflow-hidden z-10">
                     <AnimatePresence>
                        {attacking && (
                           <motion.div
                              initial={{ x: "-100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0 flex items-center justify-center bg-rose-500 shadow-[inset_0_0_20px_rgba(225,29,72,0.5)] text-white gap-2 font-mono text-[10px] font-bold"
                           >
                              <Zap className="size-4" /> PEW PEW!
                           </motion.div>
                        )}
                     </AnimatePresence>

                     {!attacking && (
                        <div className="flex items-center gap-2 text-rose-500 font-mono text-[10px] font-bold">
                           <Crosshair className="size-5" /> Laser Component
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="w-[380px] bg-surface-2/30 rounded-lg p-5 font-mono text-sm border border-hairline text-left shadow-lg">
               <div dangerouslySetInnerHTML={{
                  __html: `
<span class="text-pink-600 dark:text-pink-400">class</span> <span class="text-amber-600 dark:text-amber-400">Robot</span>:<br />
&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">def</span> <span class="text-blue-600 dark:text-blue-400">__init__</span>(self, weapon):<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.weapon = weapon<br /><br />
&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-pink-600 dark:text-pink-400">def</span> <span class="text-blue-600 dark:text-blue-400">attack</span>(self):<br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-slate-400"># Delegate the action</span><br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.weapon.fire()
            `}} />
            </div>

         </div>
      </motion.div>
   );
}

function Step3Flexibility() {
   const [weapon, setWeapon] = useState<"laser" | "water">("laser");

   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
         <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Extreme Flexibility</h3>
         <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">You can swap out components at runtime without changing the Robot class at all.</p>

         <div className="flex items-center gap-16 justify-center w-full">

            <div className="flex flex-col items-center gap-6">

               <div className="w-56 h-48 border-2 border-emerald-500 rounded-2xl p-4 flex flex-col justify-between relative bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]">

                  <div className="flex items-center justify-between w-full">
                     <div className="flex items-center gap-2 text-emerald-500">
                        <Bot className="size-6" />
                        <span className="font-mono font-bold">Robot</span>
                     </div>
                  </div>

                  <AnimatePresence mode="wait">
                     {weapon === "laser" ? (
                        <motion.div key="laser" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="h-20 w-full rounded-xl border-2 bg-rose-500/10 border-rose-500 flex items-center justify-center shadow-sm">
                           <div className="flex items-center gap-2 text-rose-500 font-mono text-[10px] font-bold">
                              <Crosshair className="size-5" /> Laser
                           </div>
                        </motion.div>
                     ) : (
                        <motion.div key="water" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="h-20 w-full rounded-xl border-2 bg-blue-500/10 border-blue-500 flex items-center justify-center shadow-sm">
                           <div className="flex items-center gap-2 text-blue-500 font-mono text-[10px] font-bold">
                              <Droplets className="size-5" /> WaterCannon
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               <div className="flex items-center gap-4 bg-surface px-4 py-2 rounded-xl border border-hairline shadow-sm">
                  <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Swap Weapon:</span>
                  <button
                     onClick={() => setWeapon("laser")}
                     className={cn("p-2 rounded-lg transition-colors border", weapon === "laser" ? "bg-rose-500/20 border-rose-500 text-rose-500" : "bg-transparent border-transparent text-muted-foreground hover:bg-surface-2")}
                  >
                     <Crosshair className="size-4" />
                  </button>
                  <button
                     onClick={() => setWeapon("water")}
                     className={cn("p-2 rounded-lg transition-colors border", weapon === "water" ? "bg-blue-500/20 border-blue-500 text-blue-500" : "bg-transparent border-transparent text-muted-foreground hover:bg-surface-2")}
                  >
                     <Droplets className="size-4" />
                  </button>
               </div>
            </div>

            <div className="w-[380px] bg-surface-2/30 rounded-lg p-5 font-mono text-sm border border-hairline text-left shadow-lg">
               <div dangerouslySetInnerHTML={{
                  __html: `
<span class="text-pink-600 dark:text-pink-400">my_robot</span>.<span class="text-blue-600 dark:text-blue-400">attack</span>()<br />
<span class="text-slate-400"># Output: PEW PEW!</span><br /><br />

<span class="text-slate-400"># Swap component at runtime!</span><br />
<span class="text-pink-600 dark:text-pink-400">my_robot</span>.weapon = <span class="text-amber-600 dark:text-amber-400">WaterCannon</span>()<br /><br />

<span class="text-pink-600 dark:text-pink-400">my_robot</span>.<span class="text-blue-600 dark:text-blue-400">attack</span>()<br />
<span class="text-slate-400"># Output: SPLASH!</span>
            `}} />
            </div>

         </div>
      </motion.div>
   );
}