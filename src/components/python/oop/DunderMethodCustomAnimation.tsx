import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
   RotateCcw, ChevronLeft, ChevronRight, Play, Pause,
   Terminal, Code2, Cpu, Box, ScanLine, ShoppingCart, Plus, CheckCircle, PackageSearch
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DunderMethodsCustomAnimation() {
   const [step, setStep] = useState(0);
   const [playing, setPlaying] = useState(true);
   const [isHovered, setIsHovered] = useState(false);
   const totalSteps = 5;

   const STEP_DURATIONS = [6000, 7000, 6000, 6000, 8000];

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
               {step === 0 && <Step1InitStr key="step0" />}
               {step === 1 && <Step2LenEq key="step1" />}
               {step === 2 && <Step3Add key="step2" />}
               {step === 3 && <Step4Call key="step3" />}
               {step === 4 && <Step5Summary key="step4" />}
            </AnimatePresence>
         </div>

         {/* Control Bar */}
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

function Step1InitStr() {
   const [phase, setPhase] = useState(0);

   useEffect(() => {
      const id1 = setTimeout(() => setPhase(1), 2000);
      const id2 = setTimeout(() => setPhase(2), 4000);
      return () => { clearTimeout(id1); clearTimeout(id2); };
   }, []);

   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
         <h3 className="text-xl font-bold font-mono mb-2 text-foreground">1. Setup & Printing</h3>
         <p className="text-sm text-muted-foreground mb-12 text-center max-w-md">Python silently translates your standard syntax into special method calls.</p>

         <div className="flex flex-row w-full gap-16 items-center justify-center">

            {/* Code Side */}
            <div className="flex flex-col gap-6">
               <div className="bg-surface-2 border border-hairline p-4 rounded-xl shadow-sm w-72">
                  <div className="font-mono text-xs mb-2 text-muted-foreground">You write:</div>
                  <div className="font-mono text-[11px] p-2 text-muted-foreground bg-surface rounded mb-2 border border-hairline leading-relaxed">
                     <span className="text-pink-600 dark:text-pink-400">class</span> Product:<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">def</span> <span className="text-indigo-500 font-bold">__init__</span>(self, name):<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.name = name<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">def</span> <span className="text-amber-500 font-bold">__str__</span>(self):<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">return</span> <span className="text-emerald-600 dark:text-emerald-400">f"{self.name} - $900"</span>
                  </div>
                  <motion.div 
                     className={cn("font-mono text-[13px] font-bold p-2 rounded transition-colors", phase === 0 || phase === 1 ? "bg-indigo-500/10 text-indigo-500" : "")}
                  >
                     <span className="text-pink-600 dark:text-pink-400">p</span> = Product(<span className="text-emerald-600 dark:text-emerald-400">"Laptop"</span>)
                  </motion.div>
                  <motion.div 
                     className={cn("font-mono text-[13px] font-bold p-2 rounded transition-colors mt-1", phase === 2 ? "bg-amber-500/10 text-amber-500" : "")}
                  >
                     <span className="text-blue-600 dark:text-blue-400">print</span>(p)
                  </motion.div>
               </div>
            </div>

            {/* Translation Engine */}
            <div className="relative w-[340px] h-[240px] flex items-center justify-center border-2 border-hairline border-dashed rounded-3xl bg-surface-2/30">
               
               <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                  <Cpu className="size-4" /> Translation Engine
               </div>

               <AnimatePresence mode="wait">
                  {phase === 0 && (
                     <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Terminal className="size-8 opacity-50" />
                        <span className="font-mono text-xs">Waiting for command...</span>
                     </motion.div>
                  )}

                  {phase === 1 && (
                     <motion.div key="init" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-4">
                        <div className="bg-indigo-500 text-white px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-lg flex items-center gap-2">
                           Translates to <ChevronRight className="size-3" /> p.__init__("Laptop")
                        </div>
                        <div className="w-32 h-32 bg-indigo-500/10 border-2 border-indigo-500/50 rounded-2xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                           <Box className="size-10 text-indigo-500 mb-2" />
                           <span className="font-mono text-xs font-bold text-indigo-500">Object Created!</span>
                        </div>
                     </motion.div>
                  )}

                  {phase === 2 && (
                     <motion.div key="str" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-4">
                        <div className="bg-amber-500 text-white px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-lg flex items-center gap-2">
                           Translates to <ChevronRight className="size-3" /> p.__str__()
                        </div>
                        <div className="w-48 bg-amber-500/10 border-2 border-amber-500/50 rounded-xl p-4 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                           <Code2 className="size-6 text-amber-500 mb-2" />
                           <span className="font-mono text-sm text-amber-600 dark:text-amber-400">"Laptop - $900"</span>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

            </div>
         </div>
      </motion.div>
   );
}

function Step2LenEq() {
   const [phase, setPhase] = useState(0);

   useEffect(() => {
      const id1 = setTimeout(() => setPhase(1), 2500);
      const id2 = setTimeout(() => setPhase(2), 5000);
      return () => { clearTimeout(id1); clearTimeout(id2); };
   }, []);

   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
         <h3 className="text-xl font-bold font-mono mb-2 text-foreground">2. Counting & Comparing</h3>
         <p className="text-sm text-muted-foreground mb-12 text-center max-w-md">Operations like `len()` and `==` trigger `__len__()` and `__eq__()` under the hood.</p>

         <div className="flex flex-row w-full gap-16 items-center justify-center">

            {/* Code Side */}
            <div className="flex flex-col gap-6">
               <div className="bg-surface-2 border border-hairline p-4 rounded-xl shadow-sm w-72">
                  <div className="font-mono text-xs mb-2 text-muted-foreground">You write:</div>
                  <div className="font-mono text-[11px] p-2 text-muted-foreground bg-surface rounded mb-2 border border-hairline leading-relaxed">
                     <span className="text-pink-600 dark:text-pink-400">class</span> ShoppingCart:<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">def</span> <span className="text-sky-500 font-bold">__len__</span>(self):<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">return</span> <span className="text-blue-600 dark:text-blue-400">len</span>(self.items)<br/><br/>
                     <span className="text-pink-600 dark:text-pink-400">class</span> Product:<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">def</span> <span className="text-emerald-500 font-bold">__eq__</span>(self, other):<br/>
                     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">return</span> self.sku <span className="text-pink-600 dark:text-pink-400">==</span> other.sku
                  </div>
                  <motion.div 
                     className={cn("font-mono text-[13px] font-bold p-2 rounded transition-colors", phase === 0 || phase === 1 ? "bg-sky-500/10 text-sky-500" : "")}
                  >
                     <span className="text-blue-600 dark:text-blue-400">len</span>(cart)
                  </motion.div>
                  <motion.div 
                     className={cn("font-mono text-[13px] font-bold p-2 rounded transition-colors mt-1", phase === 2 ? "bg-emerald-500/10 text-emerald-500" : "")}
                  >
                     p1 <span className="text-pink-600 dark:text-pink-400">==</span> p2
                  </motion.div>
               </div>
            </div>

            {/* Translation Engine */}
            <div className="relative w-[340px] h-[240px] flex items-center justify-center border-2 border-hairline border-dashed rounded-3xl bg-surface-2/30">
               
               <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                  <Cpu className="size-4" /> Translation Engine
               </div>

               <AnimatePresence mode="wait">
                  {phase === 0 && (
                     <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Terminal className="size-8 opacity-50" />
                        <span className="font-mono text-xs">Waiting for command...</span>
                     </motion.div>
                  )}

                  {phase === 1 && (
                     <motion.div key="len" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-4">
                        <div className="bg-sky-500 text-white px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-lg flex items-center gap-2">
                           Translates to <ChevronRight className="size-3" /> cart.__len__()
                        </div>
                        <div className="w-48 bg-sky-500/10 border-2 border-sky-500/50 rounded-xl p-4 flex items-center justify-between shadow-[0_0_30px_rgba(14,165,233,0.2)]">
                           <div className="relative">
                              <ShoppingCart className="size-8 text-sky-500" />
                              <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold size-5 rounded-full flex items-center justify-center">3</div>
                           </div>
                           <div className="font-mono text-2xl font-black text-sky-500">3</div>
                        </div>
                     </motion.div>
                  )}

                  {phase === 2 && (
                     <motion.div key="eq" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-4">
                        <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full font-mono text-xs font-bold shadow-lg flex items-center gap-2">
                           Translates to <ChevronRight className="size-3" /> p1.__eq__(p2)
                        </div>
                        <div className="w-56 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl p-4 flex flex-col items-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                           <div className="flex items-center gap-4 mb-2">
                              <div className="flex flex-col items-center bg-surface px-2 py-1 rounded border border-hairline"><ScanLine className="size-4 text-emerald-500 mb-1" /><span className="font-mono text-[9px]">SKU-A</span></div>
                              <span className="font-mono font-bold text-emerald-500">==</span>
                              <div className="flex flex-col items-center bg-surface px-2 py-1 rounded border border-hairline"><ScanLine className="size-4 text-emerald-500 mb-1" /><span className="font-mono text-[9px]">SKU-A</span></div>
                           </div>
                           <div className="font-mono text-sm font-bold text-emerald-500 flex items-center gap-1"><CheckCircle className="size-4" /> True</div>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

            </div>
         </div>
      </motion.div>
   );
}

function Step3Add() {
   const [adding, setAdding] = useState(false);

   useEffect(() => {
      const id = setTimeout(() => setAdding(true), 2000);
      return () => clearTimeout(id);
   }, []);

   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
         <h3 className="text-xl font-bold font-mono mb-2 text-foreground">3. Operator Overloading (`__add__`)</h3>
         <p className="text-sm text-muted-foreground mb-12 text-center max-w-md">By defining `__add__()`, you control what the `+` operator does when applied to your custom objects.</p>

         <div className="flex flex-col items-center w-full gap-8">
            <div className="font-mono text-[11px] p-2 text-muted-foreground bg-surface rounded border border-hairline leading-relaxed w-72">
               <span className="text-pink-600 dark:text-pink-400">class</span> ShoppingCart:<br/>
               &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">def</span> <span className="text-rose-500 font-bold">__add__</span>(self, other):<br/>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">return</span> ShoppingCart(self.items + other.items)
            </div>
            
            <div className="bg-rose-500 text-white px-6 py-2 rounded-full font-mono text-sm font-bold shadow-lg flex items-center gap-2 mb-4">
               cart1 <Plus className="size-4" /> cart2 <ChevronRight className="size-4" /> cart1.__add__(cart2)
            </div>

            <div className="flex items-center gap-8 relative h-[140px]">
               
               <motion.div 
                  animate={adding ? { x: 90, opacity: 0, scale: 0.5 } : { x: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "backIn" }}
                  className="bg-surface-2 border border-hairline p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 z-10 relative w-28"
               >
                  <ShoppingCart className="size-8 text-rose-500" />
                  <div className="flex gap-1">
                     <div className="size-2 bg-rose-500 rounded-full" />
                     <div className="size-2 bg-rose-500 rounded-full" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">cart1</span>
               </motion.div>

               <motion.div 
                  animate={adding ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                  className="bg-surface rounded-full p-2 border border-hairline shadow-sm z-0"
               >
                  <Plus className="size-6 text-rose-500" />
               </motion.div>

               <motion.div 
                  animate={adding ? { x: -90, opacity: 0, scale: 0.5 } : { x: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "backIn" }}
                  className="bg-surface-2 border border-hairline p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 z-10 relative w-28"
               >
                  <ShoppingCart className="size-8 text-rose-500" />
                  <div className="flex gap-1">
                     <div className="size-2 bg-rose-500 rounded-full" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">cart2</span>
               </motion.div>

               {/* Combined Cart */}
               <AnimatePresence>
                  {adding && (
                     <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-500/10 border-2 border-rose-500/50 p-6 rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.3)] flex flex-col items-center gap-3 w-40 z-20"
                     >
                        <ShoppingCart className="size-10 text-rose-500" />
                        <div className="flex gap-1.5">
                           <div className="size-2.5 bg-rose-500 rounded-full" />
                           <div className="size-2.5 bg-rose-500 rounded-full" />
                           <div className="size-2.5 bg-rose-500 rounded-full" />
                        </div>
                        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">combined</span>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>
      </motion.div>
   );
}

function Step4Call() {
   const [called, setCalled] = useState(false);

   useEffect(() => {
      const id = setTimeout(() => setCalled(true), 2500);
      return () => clearTimeout(id);
   }, []);

   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
         <h3 className="text-xl font-bold font-mono mb-2 text-foreground">4. Callable Objects (`__call__`)</h3>
         <p className="text-sm text-muted-foreground mb-12 text-center max-w-md">An object can behave exactly like a function.</p>

         <div className="flex flex-col items-center w-full gap-8">
            <div className="font-mono text-[11px] p-2 text-muted-foreground bg-surface rounded border border-hairline leading-relaxed w-72">
               <span className="text-pink-600 dark:text-pink-400">class</span> Discount:<br/>
               &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">def</span> <span className="text-indigo-500 font-bold">__call__</span>(self, price):<br/>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-pink-600 dark:text-pink-400">return</span> price * (1 - self.percent / 100)
            </div>
            
            <div className="bg-indigo-500 text-white px-6 py-2 rounded-full font-mono text-sm font-bold shadow-lg flex items-center gap-2 mb-4">
               summer_sale(100) <ChevronRight className="size-4" /> summer_sale.__call__(100)
            </div>

            <div className="flex items-center gap-4 relative h-[140px]">
               
               <motion.div 
                  animate={called ? { x: 120, opacity: 0, scale: 0.5 } : { x: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: "backIn" }}
                  className="bg-surface border border-hairline px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 font-mono font-bold text-lg text-foreground z-10"
               >
                  100
               </motion.div>

               <div className="bg-indigo-500/10 border-2 border-indigo-500/50 p-6 rounded-3xl flex flex-col items-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.2)] z-0 w-48 relative">
                  <PackageSearch className="size-8 text-indigo-500" />
                  <span className="font-mono text-xs font-bold text-indigo-500">summer_sale</span>
                  <span className="text-[9px] font-mono opacity-80 text-indigo-400">State: 20% off</span>
                  
                  <AnimatePresence>
                     {called && (
                        <motion.div 
                           initial={{ x: -10, opacity: 0 }}
                           animate={{ x: 20, opacity: 1 }}
                           transition={{ delay: 0.8 }}
                           className="absolute -right-20 bg-surface border border-hairline px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 font-mono font-bold text-xl text-emerald-500"
                        >
                           80
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>
      </motion.div>
   );
}

function Step5Summary() {
   return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
         <h3 className="text-xl font-bold font-mono mb-2 text-foreground">Dunder Method Mapping</h3>
         <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">Python relies on these hidden methods to make custom objects feel like native types.</p>

         <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full max-w-lg bg-surface-2/30 p-6 rounded-2xl border border-hairline shadow-sm">
            
            <div className="font-mono text-xs text-muted-foreground font-bold border-b border-hairline pb-2 mb-2">Python Syntax</div>
            <div className="font-mono text-xs text-muted-foreground font-bold border-b border-hairline pb-2 mb-2">Dunder Method</div>

            <SyntaxRow syntax="Product()" dunder="__init__()" color="text-indigo-500" />
            <SyntaxRow syntax="print(product)" dunder="__str__()" color="text-amber-500" />
            <SyntaxRow syntax="repr(product)" dunder="__repr__()" color="text-amber-500" />
            <SyntaxRow syntax="len(cart)" dunder="__len__()" color="text-sky-500" />
            <SyntaxRow syntax="cart1 + cart2" dunder="__add__()" color="text-rose-500" />
            <SyntaxRow syntax="p1 == p2" dunder="__eq__()" color="text-emerald-500" />
            <SyntaxRow syntax="sale(100)" dunder="__call__()" color="text-indigo-500" />
            
         </div>
      </motion.div>
   );
}

function SyntaxRow({ syntax, dunder, color }: { syntax: string, dunder: string, color: string }) {
   return (
      <>
         <div className="font-mono text-sm bg-surface px-3 py-1.5 rounded-lg border border-hairline flex justify-center items-center shadow-sm">{syntax}</div>
         <div className={cn("font-mono text-sm px-3 py-1.5 rounded-lg border-2 border-current bg-current/10 flex justify-center items-center shadow-sm font-bold", color)}>{dunder}</div>
      </>
   );
}
