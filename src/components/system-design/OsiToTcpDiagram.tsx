import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Network, Lock, RefreshCw, Send, Globe, Cpu, Cable } from "lucide-react";

const osiLayers = [
  { num: 7, name: "Application", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: Globe, yCenter: 24, top: 0 },
  { num: 6, name: "Presentation", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: Lock, yCenter: 80, top: 56 },
  { num: 5, name: "Session", color: "bg-blue-500/10 text-blue-500 border-blue-500/30", icon: RefreshCw, yCenter: 136, top: 112 },
  { num: 4, name: "Transport", color: "bg-violet-500/10 text-violet-500 border-violet-500/30", icon: Send, yCenter: 192, top: 168 },
  { num: 3, name: "Network", color: "bg-mint/10 text-mint border-mint/30", icon: Network, yCenter: 248, top: 224 },
  { num: 2, name: "Data Link", color: "bg-amber/10 text-amber border-amber/30", icon: Cpu, yCenter: 304, top: 280 },
  { num: 1, name: "Physical", color: "bg-amber/10 text-amber border-amber/30", icon: Cable, yCenter: 360, top: 336 },
];

const tcpLayers = [
  { 
    name: "Application", 
    color: "bg-blue-500/10 border-blue-500/30", 
    textColor: "text-blue-500",
    top: 0, height: 160, yCenter: 80,
    desc: "HTTP, FTP, DNS" 
  },
  { 
    name: "Transport", 
    color: "bg-violet-500/10 border-violet-500/30", 
    textColor: "text-violet-500",
    top: 168, height: 48, yCenter: 192,
    desc: "TCP, UDP" 
  },
  { 
    name: "Internet", 
    color: "bg-mint/10 border-mint/30", 
    textColor: "text-mint",
    top: 224, height: 48, yCenter: 248,
    desc: "IPv4, IPv6" 
  },
  { 
    name: "Network Access", 
    color: "bg-amber/10 border-amber/30", 
    textColor: "text-amber",
    top: 280, height: 104, yCenter: 332,
    desc: "Ethernet, MAC, Fiber" 
  },
];

const connectionPaths = [
  // Application (Blue)
  { d: "M 0,24 C 40,24 60,80 100,80", stroke: "#3b82f6" },
  { d: "M 0,80 L 100,80", stroke: "#3b82f6" },
  { d: "M 0,136 C 40,136 60,80 100,80", stroke: "#3b82f6" },
  // Transport (Violet)
  { d: "M 0,192 L 100,192", stroke: "#8b5cf6" },
  // Internet (Mint)
  { d: "M 0,248 L 100,248", stroke: "#10b981" },
  // Network Access (Amber)
  { d: "M 0,304 C 40,304 60,332 100,332", stroke: "#f59e0b" },
  { d: "M 0,360 C 40,360 60,332 100,332", stroke: "#f59e0b" },
];

export function OsiToTcpDiagram() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      <div className="flex items-center gap-2 border-b border-hairline bg-muted/20 px-4 py-3">
        <Layers className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">OSI vs TCP/IP Mapping</span>
      </div>

      <div className="relative p-6 md:p-10 bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] flex justify-center">
        
        <div className="relative flex w-full max-w-[700px] h-[384px]">
          
          {/* OSI Column */}
          <div className="relative w-[180px] md:w-[220px] h-full z-20">
            <h3 className="absolute -top-8 left-0 right-0 text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider">OSI Model (7 Layers)</h3>
            {osiLayers.map((layer, i) => (
              <motion.div 
                key={layer.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`absolute left-0 right-0 flex items-center gap-2.5 rounded-lg border px-3 shadow-sm backdrop-blur transition-all duration-300 cursor-default ${layer.color} ${hoveredIndex !== null && hoveredIndex !== i ? 'opacity-30 scale-[0.98]' : 'scale-100 hover:shadow-md hover:border-opacity-50'}`}
                style={{ top: layer.top, height: 48 }}
              >
                <span className="font-mono text-[10px] opacity-70">L{layer.num}</span>
                <layer.icon className="size-3.5" />
                <span className="text-xs md:text-sm font-bold truncate">{layer.name}</span>
              </motion.div>
            ))}
          </div>

          {/* SVG Connections Area */}
          <div className="relative flex-1 h-full mx-2 md:mx-6 z-10">
            <svg 
              className="absolute inset-0 w-full h-full overflow-visible" 
              viewBox="0 0 100 384" 
              preserveAspectRatio="none"
            >
              {connectionPaths.map((path, i) => {
                // Determine if this path should be highlighted based on hovered index
                const isHovered = hoveredIndex === null || 
                                  (hoveredIndex >= 0 && hoveredIndex <= 2 && i <= 2) || 
                                  (hoveredIndex === 3 && i === 3) ||
                                  (hoveredIndex === 4 && i === 4) ||
                                  (hoveredIndex >= 5 && i >= 5);

                return (
                  <g key={i}>
                    {/* Background faint path */}
                    <path 
                      d={path.d} 
                      stroke={path.stroke} 
                      strokeWidth="2" 
                      fill="none" 
                      opacity="0.15" 
                      vectorEffect="non-scaling-stroke" 
                    />
                    
                    {/* Animated bright path */}
                    <motion.path
                      d={path.d}
                      stroke={path.stroke}
                      strokeWidth="2.5"
                      fill="none"
                      opacity={isHovered ? 0.7 : 0.1}
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "easeInOut" }}
                      className="transition-opacity duration-300"
                    />

                    {/* Traveling data dot */}
                    {isHovered && hoveredIndex !== null && (
                      <motion.circle
                        r="3"
                        fill={path.stroke}
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{ offsetPath: `path('${path.d}')` }}
                        className="drop-shadow-md hidden md:block"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* TCP/IP Column */}
          <div className="relative w-[180px] md:w-[220px] h-full z-20">
            <h3 className="absolute -top-8 left-0 right-0 text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider">TCP/IP Model (4 Layers)</h3>
            {tcpLayers.map((layer, i) => {
              // Determine if this TCP layer should be highlighted based on hovered index
              const isHovered = hoveredIndex === null || 
                                (hoveredIndex >= 0 && hoveredIndex <= 2 && i === 0) || 
                                (hoveredIndex === 3 && i === 1) ||
                                (hoveredIndex === 4 && i === 2) ||
                                (hoveredIndex >= 5 && i === 3);

              return (
                <motion.div 
                  key={layer.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 + 0.5, duration: 0.5 }}
                  className={`absolute left-0 right-0 flex flex-col justify-center rounded-lg border px-4 shadow-sm backdrop-blur transition-all duration-300 ${layer.color} ${isHovered ? 'opacity-100 scale-100' : 'opacity-30 scale-[0.98]'}`}
                  style={{ top: layer.top, height: layer.height }}
                >
                  <span className={`text-sm md:text-base font-bold ${layer.textColor}`}>{layer.name}</span>
                  <span className={`text-[9px] md:text-[10px] font-mono mt-1 opacity-70 ${layer.textColor}`}>{layer.desc}</span>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>

      <div className="border-t border-hairline bg-muted/20 p-4 md:p-6">
        <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">
          The 7-layer OSI Model is a theoretical framework useful for understanding network flow and troubleshooting. However, real-world networks (like the internet) are built on the simpler 4-layer <strong>TCP/IP Model</strong>. The top 3 OSI layers (Application, Presentation, Session) are handled by the application itself, combining them into one TCP/IP "Application" layer. The bottom 2 hardware layers (Data Link, Physical) are combined into the "Network Access" layer.
        </p>
      </div>
    </div>
  );
}
