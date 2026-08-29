import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  RotateCcw, ChevronLeft, ChevronRight, Play, Pause,
  Users, Briefcase, Laptop, PenTool,
  Sparkles, FileText, Mic, Presentation, Car, BatteryCharging
} from "lucide-react";
import { cn } from "../../../lib/utils";

export function InheritanceTypesCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const totalSteps = 5;

  const STEP_DURATIONS = [6000, 6000, 6000, 6000, 6000];

  useEffect(() => {
    if (!playing || isHovered) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % totalSteps), STEP_DURATIONS[step] || 6000);
    return () => window.clearTimeout(id);
  }, [playing, step, isHovered]);

  const go = useCallback((delta: number) => {
    setPlaying(false);
    setStep((s) => (s + delta + totalSteps) % totalSteps);
  }, [totalSteps]);

  return (
    <div 
      className="flex flex-col relative z-10 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative px-4 py-8 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {step === 0 && <Step0Single key="step0" />}
          {step === 1 && <Step1Multiple key="step1" />}
          {step === 2 && <Step2Multilevel key="step2" />}
          {step === 3 && <Step3Hierarchical key="step3" />}
          {step === 4 && <Step4Hybrid key="step4" />}
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

function Step0Single() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">1. Single Inheritance</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">One child class inherits from one parent class.</p>
      
      <div className="flex flex-row w-full gap-8 items-center justify-center">
        {/* Diagram */}
        <div className="relative w-[320px] h-[250px] shrink-0">
          <motion.div className="absolute top-[20px] left-[160px] -translate-x-1/2 z-20" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <NodeCard icon={Users} title="Employee" color="blue" />
          </motion.div>
          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 250">
            <motion.path d="M 160,68 L 160,120" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }} />
            <motion.circle r="4" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)", offsetPath: 'path("M 160,68 L 160,120")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }} />
          </svg>
          <motion.div className="absolute top-[120px] left-[160px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <NodeCard icon={Laptop} title="Developer" color="emerald" />
          </motion.div>
        </div>
        
        {/* Code Snippet */}
        <div className="w-[380px] shrink-0 bg-surface-2/30 rounded-lg p-4 font-mono text-xs border border-hairline relative text-left">
          <pre className="text-left leading-relaxed whitespace-pre-wrap">
            <span className="text-pink-600">class</span> <span className="text-blue-600">Employee</span>:{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">introduce</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">Developer</span>(<span className="text-emerald-600">Employee</span>):{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">write_code</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

function Step1Multiple() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">2. Multiple Inheritance</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">One child inherits from more than one parent.</p>
      
      <div className="flex flex-row w-full gap-8 items-center justify-center">
        {/* Diagram */}
        <div className="relative w-[320px] h-[250px] shrink-0">
          <motion.div className="absolute top-[20px] left-[80px] -translate-x-1/2 z-20" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <NodeCard icon={FileText} title="Writer" color="amber" />
          </motion.div>
          <motion.div className="absolute top-[20px] left-[240px] -translate-x-1/2 z-20" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <NodeCard icon={Mic} title="Speaker" color="rose" />
          </motion.div>
          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 250">
            <motion.path d="M 80,68 L 160,120" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }} />
            <motion.path d="M 240,68 L 160,120" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} />
            <motion.circle r="4" fill="#f59e0b" style={{ filter: "drop-shadow(0 0 4px #f59e0b)", offsetPath: 'path("M 80,68 L 160,120")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }} />
            <motion.circle r="4" fill="#f43f5e" style={{ filter: "drop-shadow(0 0 4px #f43f5e)", offsetPath: 'path("M 240,68 L 160,120")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }} />
          </svg>
          <motion.div className="absolute top-[120px] left-[160px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <NodeCard icon={Presentation} title="Presenter" color="indigo" />
          </motion.div>
        </div>
        
        {/* Code Snippet */}
        <div className="w-[380px] shrink-0 bg-surface-2/30 rounded-lg p-4 font-mono text-xs border border-hairline relative text-left">
          <pre className="text-left leading-relaxed whitespace-pre-wrap">
            <span className="text-pink-600">class</span> <span className="text-blue-600">Writer</span>:{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">write</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">Speaker</span>:{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">speak</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">Presenter</span>(<span className="text-amber-600">Writer</span>, <span className="text-rose-600">Speaker</span>):{"\n"}
            {"    "}<span className="text-pink-600">pass</span>{"\n"}
            {"\n"}
            <span className="text-indigo-500">print</span>(<span className="text-blue-600">Presenter</span>.mro()){"\n"}
            <span className="text-muted-foreground"># [&lt;class 'Presenter'&gt;, &lt;class 'Writer'&gt;, &lt;class 'Speaker'&gt;, &lt;class 'object'&gt;]</span>
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

function Step2Multilevel() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">3. Multilevel Inheritance</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">Inheriting from a class that already inherits from another class.</p>
      
      <div className="flex flex-row w-full gap-8 items-center justify-center">
        {/* Diagram */}
        <div className="relative w-[320px] h-[250px] shrink-0">
          <motion.div className="absolute top-[20px] left-[160px] -translate-x-1/2 z-20" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <NodeCard icon={Briefcase} title="Vehicle" color="slate" />
          </motion.div>
          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 250">
            <motion.path d="M 160,68 L 160,110" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }} />
            <motion.circle r="4" fill="#64748b" style={{ filter: "drop-shadow(0 0 4px #64748b)", offsetPath: 'path("M 160,68 L 160,110")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }} />
          </svg>
          <motion.div className="absolute top-[110px] left-[160px] -translate-x-1/2 z-20" initial={{ y: 0, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <NodeCard icon={Car} title="Car" color="blue" />
          </motion.div>
          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 250">
            <motion.path d="M 160,158 L 160,200" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9 }} />
            <motion.circle r="4" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)", offsetPath: 'path("M 160,158 L 160,200")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }} />
          </svg>
          <motion.div className="absolute top-[200px] left-[160px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }}>
            <NodeCard icon={BatteryCharging} title="ElectricCar" color="emerald" />
          </motion.div>
        </div>
        
        {/* Code Snippet */}
        <div className="w-[380px] shrink-0 bg-surface-2/30 rounded-lg p-4 font-mono text-xs border border-hairline relative text-left">
          <pre className="text-left leading-relaxed whitespace-pre-wrap">
            <span className="text-pink-600">class</span> <span className="text-blue-600">Vehicle</span>:{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">move</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">Car</span>(<span className="text-slate-400">Vehicle</span>):{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">drive</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">ElectricCar</span>(<span className="text-blue-600">Car</span>):{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">charge</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

function Step3Hierarchical() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">4. Hierarchical Inheritance</h3>
      <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">Multiple child classes inherit from a single parent class.</p>
      
      <div className="flex flex-row w-full gap-8 items-center justify-center">
        {/* Diagram */}
        <div className="relative w-[320px] h-[250px] shrink-0">
          <motion.div className="absolute top-[20px] left-[160px] -translate-x-1/2 z-20" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <NodeCard icon={Users} title="Employee" color="blue" />
          </motion.div>
          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 250">
            <motion.path d="M 160,68 L 160,90 L 80,90 L 80,120" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }} />
            <motion.path d="M 160,68 L 160,90 L 240,90 L 240,120" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4 }} />
            <motion.circle r="4" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)", offsetPath: 'path("M 160,68 L 160,90 L 80,90 L 80,120")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }} />
            <motion.circle r="4" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)", offsetPath: 'path("M 160,68 L 160,90 L 240,90 L 240,120")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }} />
          </svg>
          <motion.div className="absolute top-[120px] left-[80px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
            <NodeCard icon={Laptop} title="Developer" color="emerald" />
          </motion.div>
          <motion.div className="absolute top-[120px] left-[240px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
            <NodeCard icon={PenTool} title="Designer" color="purple" />
          </motion.div>
        </div>
        
        {/* Code Snippet */}
        <div className="w-[380px] shrink-0 bg-surface-2/30 rounded-lg p-4 font-mono text-xs border border-hairline relative text-left">
          <pre className="text-left leading-relaxed whitespace-pre-wrap">
            <span className="text-pink-600">class</span> <span className="text-blue-600">Employee</span>:{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">introduce</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">Developer</span>(<span className="text-blue-600">Employee</span>):{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">write_code</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">Designer</span>(<span className="text-blue-600">Employee</span>):{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">create_design</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

function Step4Hybrid() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center w-full max-w-4xl px-4">
      <h3 className="text-xl font-bold font-mono mb-2 text-foreground">5. Hybrid Inheritance</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">A combination of multiple inheritance structures.</p>
      
      <div className="flex flex-row w-full gap-8 items-center justify-center">
        {/* Diagram */}
        <div className="relative w-[320px] h-[250px] shrink-0 scale-95 origin-top">
          <motion.div className="absolute top-[10px] left-[160px] -translate-x-1/2 z-20" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <NodeCard icon={Users} title="Employee" color="blue" />
          </motion.div>
          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 250">
            <motion.path d="M 160,58 L 160,75 L 80,75 L 80,95" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} />
            <motion.path d="M 160,58 L 160,75 L 240,75 L 240,95" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} />
            <motion.circle r="4" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)", offsetPath: 'path("M 160,58 L 160,75 L 80,75 L 80,95")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }} />
            <motion.circle r="4" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)", offsetPath: 'path("M 160,58 L 160,75 L 240,75 L 240,95")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }} />
          </svg>
          <motion.div className="absolute top-[95px] left-[80px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <NodeCard icon={Laptop} title="Developer" color="emerald" />
          </motion.div>
          <motion.div className="absolute top-[95px] left-[240px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <NodeCard icon={PenTool} title="Designer" color="purple" />
          </motion.div>
          
          <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 320 250">
            <motion.path d="M 80,143 L 80,165 L 160,165 L 160,185" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }} />
            <motion.path d="M 240,143 L 240,165 L 160,165 L 160,185" fill="none" stroke="var(--hairline)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 }} />
            <motion.circle r="4" fill="#10b981" style={{ filter: "drop-shadow(0 0 4px #10b981)", offsetPath: 'path("M 80,143 L 80,165 L 160,165 L 160,185")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }} />
            <motion.circle r="4" fill="#a855f7" style={{ filter: "drop-shadow(0 0 4px #a855f7)", offsetPath: 'path("M 240,143 L 240,165 L 160,165 L 160,185")' }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1.3 }} />
          </svg>

          <motion.div className="absolute top-[185px] left-[160px] -translate-x-1/2 z-20" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }}>
            <NodeCard icon={Sparkles} title="TeamLead" color="indigo" />
          </motion.div>
        </div>
        
        {/* Code Snippet */}
        <div className="w-[380px] shrink-0 bg-surface-2/30 rounded-lg p-4 font-mono text-xs border border-hairline relative text-left">
          <pre className="text-left leading-relaxed whitespace-pre-wrap">
            <span className="text-pink-600">class</span> <span className="text-blue-600">Employee</span>: <span className="text-muted-foreground">...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">Developer</span>(<span className="text-blue-600">Employee</span>): <span className="text-muted-foreground">...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">Designer</span>(<span className="text-blue-600">Employee</span>): <span className="text-muted-foreground">...</span>{"\n"}
            {"\n"}
            <span className="text-pink-600">class</span> <span className="text-blue-600">TeamLead</span>(<span className="text-emerald-600">Developer</span>, <span className="text-purple-600">Designer</span>):{"\n"}
            {"    "}<span className="text-pink-600">def</span> <span className="text-amber-600">manage_team</span>(self):{"\n"}
            {"        "}<span className="text-muted-foreground"># ...</span>{"\n"}
            {"\n"}
            <span className="text-indigo-500">print</span>(<span className="text-blue-600">TeamLead</span>.mro()){"\n"}
            <span className="text-muted-foreground"># [&lt;class 'TeamLead'&gt;, &lt;class 'Developer'&gt;, &lt;class 'Designer'&gt;, &lt;class 'Employee'&gt;, &lt;class 'object'&gt;]</span>
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

function NodeCard({ icon: Icon, title, color }: { icon: any, title: string, color: string }) {
  const colors: Record<string, string> = {
    blue: "text-blue-500 border-blue-500/30 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    emerald: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    purple: "text-purple-500 border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    amber: "text-amber-500 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    rose: "text-rose-500 border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    indigo: "text-indigo-500 border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]",
    slate: "text-slate-500 border-slate-500/30 bg-slate-500/10 shadow-[0_0_15px_rgba(100,116,139,0.15)]",
  };
  
  return (
    <div className={cn("p-2.5 rounded-xl border-2 flex items-center justify-center gap-2 backdrop-blur-md w-28 h-12 relative overflow-hidden", colors[color])}>
      <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-current opacity-10" />
      <Icon className="size-4 relative z-10 shrink-0" />
      <div className="font-mono font-bold text-xs relative z-10">{title}</div>
    </div>
  );
}
