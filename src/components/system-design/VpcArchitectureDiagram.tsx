import { Cloud, Globe, Server, Database, Lock, Router, FileText, Download, Search, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

function Packet({ label, icon: Icon, color, path, duration, delay, repeatDelay }: any) {
  return (
    <motion.div
      style={{ 
        offsetPath: `path("${path}")`,
        offsetRotate: "0deg",
        offsetAnchor: "center center"
      }}
      initial={{ offsetDistance: "0%", opacity: 0 }}
      animate={{ 
        offsetDistance: ["0%", "100%"], 
        opacity: [0, 1, 1, 0] 
      }}
      transition={{ 
        duration, 
        delay, 
        repeatDelay, 
        repeat: Infinity, 
        ease: "linear",
        times: [0, 0.1, 0.9, 1]
      }}
      className={`absolute top-0 left-0 flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider shadow-sm -translate-x-1/2 -translate-y-1/2 ${color}`}
    >
      <Icon className="size-2.5" /> {label}
    </motion.div>
  );
}

export function VpcArchitectureDiagram() {
  return (
    <figure className="my-8 overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
      <figcaption className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
        <span>Cloud VPC Architecture</span>
        <span className="text-[9px] opacity-70">Left-to-Right Flow: Public to Private</span>
      </figcaption>

      <div className="overflow-x-auto p-4 sm:p-8 flex justify-center bg-slate-50/30 dark:bg-slate-900/10">
        <div className="relative w-[800px] h-[420px] min-w-[800px] text-sm">
          
          {/* Static Wires (SVG) */}
          <svg className="absolute inset-0 z-10" width="800" height="420">
            {/* Internet to IGW */}
            <path d="M 400 40 L 400 72" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-300 dark:text-slate-600" />
            {/* IGW to LB */}
            <path d="M 310 90 L 220 90 L 220 155" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-emerald-300 dark:text-emerald-700" />
            {/* LB to App */}
            <path d="M 340 180 L 460 180" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-emerald-300 dark:text-emerald-700" />
            {/* App to DB */}
            <path d="M 580 205 L 580 285" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-amber-300 dark:text-amber-700" />
            {/* App to NAT */}
            <path d="M 460 195 L 400 195 L 400 310 L 340 310" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-rose-300 dark:text-rose-700" />
            {/* NAT to IGW */}
            <path d="M 220 285 L 220 240 L 400 240 L 400 108" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-rose-300 dark:text-rose-700" />
          </svg>

          {/* Animated Packets using offsetPath */}
          <div className="absolute inset-0 z-30 pointer-events-none">
            
            {/* CYCLE 1: User Web Request (Total Loop: 12s, Active: 0s-6s) */}
            
            {/* 1. Inbound Web Request: Internet -> App Server */}
            <Packet 
              label="GET /api"
              icon={FileText}
              color="bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/80 dark:border-blue-700 dark:text-blue-300"
              path="M 400 20 L 400 90 L 220 90 L 220 180 L 580 180"
              duration={2}
              delay={0}
              repeatDelay={10}
            />

            {/* 2. DB Query: App Server -> DB Server */}
            <Packet 
              label="SELECT"
              icon={Search}
              color="bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/80 dark:border-amber-700 dark:text-amber-300"
              path="M 580 180 L 580 310"
              duration={1}
              delay={2}
              repeatDelay={11}
            />

            {/* 3. DB Result: DB Server -> App Server */}
            <Packet 
              label="ROWS"
              icon={Database}
              color="bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/80 dark:border-amber-700 dark:text-amber-300"
              path="M 580 310 L 580 180"
              duration={1}
              delay={3}
              repeatDelay={11}
            />

            {/* 4. Web Response: App Server -> Internet */}
            <Packet 
              label="200 OK"
              icon={CheckCircle2}
              color="bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/80 dark:border-emerald-700 dark:text-emerald-300"
              path="M 580 180 L 220 180 L 220 90 L 400 90 L 400 20"
              duration={2}
              delay={4}
              repeatDelay={10}
            />

            {/* CYCLE 2: System Update via NAT (Total Loop: 12s, Active: 6s-12s) */}

            {/* Outbound Request: App Server -> NAT -> IGW -> Internet */}
            <Packet 
              label="GET Patch"
              icon={Download}
              color="bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/80 dark:border-rose-700 dark:text-rose-300"
              path="M 580 180 L 400 180 L 400 310 L 220 310 L 220 240 L 400 240 L 400 90 L 400 20"
              duration={3}
              delay={6}
              repeatDelay={9}
            />
            
            {/* Download Response: Internet -> IGW -> NAT -> App Server */}
            <Packet 
              label="Binary"
              icon={Download}
              color="bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/80 dark:border-rose-700 dark:text-rose-300"
              path="M 400 20 L 400 90 L 400 240 L 220 240 L 220 310 L 400 310 L 400 180 L 580 180"
              duration={3}
              delay={9}
              repeatDelay={9}
            />

          </div>

          {/* 1. Internet Node */}
          <div className="absolute flex flex-col items-center justify-center gap-1.5 z-20 text-blue-600 dark:text-blue-400 font-medium bg-slate-50/30 dark:bg-slate-900/10 px-4 py-2" style={{ left: 320, top: 0, width: 160, height: 60 }}>
            <Globe className="size-8" />
            <span className="font-bold">The Internet</span>
          </div>

          {/* 2. Region Box */}
          <div className="absolute rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-4 z-0" style={{ left: 20, top: 50, width: 760, height: 350 }}>
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Cloud className="size-5" />
              <span>Cloud Region (us-east-1)</span>
            </div>
          </div>

          {/* 3. VPC Box */}
          <div className="absolute rounded-xl border border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/20 z-0" style={{ left: 40, top: 90, width: 720, height: 290 }}>
            <div className="absolute top-0 right-0 rounded-bl-lg rounded-tr-lg border-b border-l border-emerald-300 dark:border-emerald-700/50 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 font-mono text-[10px] text-emerald-800 dark:text-emerald-300">
              VPC (10.0.0.0/16)
            </div>
          </div>

          {/* 4. IGW Node */}
          <div className="absolute flex items-center justify-center gap-2 rounded-lg border border-purple-300 bg-purple-100 px-4 text-purple-700 shadow-sm z-20 dark:border-purple-700/50 dark:bg-purple-900/80 dark:text-purple-300" style={{ left: 310, top: 72, width: 180, height: 36 }}>
            <Router className="size-4" />
            <span className="text-xs font-semibold">Internet Gateway</span>
          </div>

          {/* 5. Public Subnet Box */}
          <div className="absolute rounded-xl border border-blue-300 bg-blue-50/50 dark:bg-blue-950/30 z-0" style={{ left: 60, top: 130, width: 320, height: 230 }}>
            <div className="absolute top-0 right-0 rounded-bl-lg rounded-tr-lg border-b border-l border-blue-300 dark:border-blue-700/50 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 font-mono text-[9px] text-blue-800 dark:text-blue-300">
              Public (10.0.1.0/24)
            </div>
            <div className="absolute top-2 left-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Globe className="size-4" />
              <span className="text-sm font-semibold">Public Subnet</span>
            </div>
          </div>

          {/* 6. Private Subnet Box */}
          <div className="absolute rounded-xl border border-slate-300 bg-slate-100/50 dark:bg-slate-800/50 z-0" style={{ left: 420, top: 130, width: 320, height: 230 }}>
            <div className="absolute top-0 right-0 rounded-bl-lg rounded-tr-lg border-b border-l border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 font-mono text-[9px] text-slate-700 dark:text-slate-300">
              Private (10.0.2.0/24)
            </div>
            <div className="absolute top-2 left-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Lock className="size-4" />
              <span className="text-sm font-semibold">Private Subnet</span>
            </div>
          </div>

          {/* Load Balancer */}
          <div className="absolute flex flex-col justify-center rounded border border-blue-200 bg-white px-3 shadow-sm z-20 dark:border-blue-800 dark:bg-slate-800" style={{ left: 100, top: 155, width: 240, height: 50 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Server className="size-4 text-blue-500" />
                <span className="text-xs font-medium">Load Balancer</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">10.0.1.20</span>
            </div>
          </div>

          {/* NAT Gateway */}
          <div className="absolute flex flex-col justify-center rounded border border-blue-200 bg-white px-3 shadow-sm z-20 dark:border-blue-800 dark:bg-slate-800" style={{ left: 100, top: 285, width: 240, height: 50 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Router className="size-4 text-rose-500" />
                <span className="text-xs font-medium">NAT Gateway</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">10.0.1.10</span>
            </div>
          </div>

          {/* App Server */}
          <div className="absolute flex flex-col justify-center rounded border border-slate-200 bg-white px-3 shadow-sm z-20 dark:border-slate-700 dark:bg-slate-900" style={{ left: 460, top: 155, width: 240, height: 50 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Server className="size-4 text-emerald-500" />
                <span className="text-xs font-medium">App Server</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">10.0.2.15</span>
            </div>
          </div>

          {/* DB Server */}
          <div className="absolute flex flex-col justify-center rounded border border-slate-200 bg-white px-3 shadow-sm z-20 dark:border-slate-700 dark:bg-slate-900" style={{ left: 460, top: 285, width: 240, height: 50 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Database className="size-4 text-amber-500" />
                <span className="text-xs font-medium">Database Server</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">10.0.2.50</span>
            </div>
          </div>

        </div>
      </div>
    </figure>
  );
}
