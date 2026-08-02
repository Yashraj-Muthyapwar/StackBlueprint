import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  FileKey2,
  Handshake,
  Truck,
  Map,
  Link,
  Cable,
  ArrowDown,
  ArrowUp,
  Cpu
} from "lucide-react";

type LayerData = {
  num: number;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
  protocols: string;
  dataUnit: string;
  example: string;
};

const osiLayers: LayerData[] = [
  {
    num: 7,
    name: "Application",
    icon: Globe,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    description: "Closest to the end-user. Provides network services to the user's applications.",
    protocols: "HTTP, HTTPS, FTP, SMTP, DNS",
    dataUnit: "Data",
    example: "Clicking 'Send' on an email in Gmail or typing a URL in a web browser.",
  },
  {
    num: 6,
    name: "Presentation",
    icon: FileKey2,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Translates data into application-readable format. Handles encryption and compression.",
    protocols: "SSL/TLS, JPEG, GIF, MPEG",
    dataUnit: "Data",
    example: "Encrypting the email via TLS so it can't be read by interceptors.",
  },
  {
    num: 5,
    name: "Session",
    icon: Handshake,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    description: "Manages sessions (open, maintain, close) between applications.",
    protocols: "NetBIOS, RPC, SQL sessions",
    dataUnit: "Data",
    example: "Establishing a connection to the email server and keeping it open until the email is sent.",
  },
  {
    num: 4,
    name: "Transport",
    icon: Truck,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Ensures end-to-end communication, reliability, and flow control.",
    protocols: "TCP, UDP",
    dataUnit: "Segments (TCP) / Datagrams (UDP)",
    example: "Breaking the encrypted email into smaller TCP segments and numbering them for reassembly.",
  },
  {
    num: 3,
    name: "Network",
    icon: Map,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    description: "Responsible for routing and logical addressing (IP) between networks.",
    protocols: "IPv4, IPv6, ICMP",
    dataUnit: "Packets",
    example: "Adding source and destination IP addresses to the segments (now packets) so routers know where to send them.",
  },
  {
    num: 2,
    name: "Data Link",
    icon: Link,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    description: "Handles node-to-node communication. Provides MAC addressing and error detection.",
    protocols: "Ethernet, PPP, Switch, Bridge",
    dataUnit: "Frames",
    example: "Adding MAC addresses (creating frames) to hop from your laptop's WiFi card to your home router.",
  },
  {
    num: 1,
    name: "Physical",
    icon: Cable,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Transmission of raw bits (0s and 1s) over physical medium.",
    protocols: "Cables, Hubs, Voltages, RF",
    dataUnit: "Bits",
    example: "Converting the frames into radio frequencies (WiFi) or electrical pulses (Ethernet cable).",
  },
];

export function OsiModelDiagram() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [animatingDirection, setAnimatingDirection] = useState<"down" | "up" | null>(null);

  const triggerDataFlow = (direction: "down" | "up") => {
    if (animatingDirection) return;
    setAnimatingDirection(direction);
    
    let currentLayer = direction === "down" ? 7 : 1;
    setActiveLayer(currentLayer);
    
    const interval = setInterval(() => {
      currentLayer = direction === "down" ? currentLayer - 1 : currentLayer + 1;
      
      if (currentLayer >= 1 && currentLayer <= 7) {
        setActiveLayer(currentLayer);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setActiveLayer(null);
          setAnimatingDirection(null);
        }, 800);
      }
    }, 2500); // Much slower animation interval
  };

  return (
    <div className="my-10 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-8 shadow-2xl relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-stretch">
        
        {/* Left side: The Stack */}
        <div className="flex-1 flex flex-col gap-2 relative">
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-xl font-bold text-white/90">The OSI Stack</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => triggerDataFlow("down")}
                disabled={animatingDirection !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white/70 transition-all disabled:opacity-50"
              >
                <ArrowDown size={14} className={animatingDirection === "down" ? "animate-bounce text-pink-400" : ""} />
                Send
              </button>
              <button 
                onClick={() => triggerDataFlow("up")}
                disabled={animatingDirection !== null}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white/70 transition-all disabled:opacity-50"
              >
                <ArrowUp size={14} className={animatingDirection === "up" ? "animate-bounce text-emerald-400" : ""} />
                Receive
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 relative">
            {osiLayers.map((layer) => {
              const isActive = activeLayer === layer.num;
              const isHovered = activeLayer === null || isActive;
              
              return (
                <motion.div
                  key={layer.num}
                  onHoverStart={() => !animatingDirection && setActiveLayer(layer.num)}
                  onHoverEnd={() => !animatingDirection && setActiveLayer(null)}
                  className={`
                    relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300
                    ${isActive 
                      ? `${layer.bgColor} border-${layer.color.replace('text-', '')}/30 shadow-[0_0_15px_rgba(0,0,0,0.2)] shadow-${layer.color.replace('text-', '')}/20 scale-[1.02] z-10` 
                      : `bg-white/[0.02] border-white/5 hover:bg-white/[0.04] ${isHovered ? 'opacity-100' : 'opacity-40'} z-0`
                    }
                  `}
                  layout
                >
                  {/* Layer Number Badge */}
                  <div className={`
                    flex items-center justify-center min-w-8 h-8 rounded-lg font-mono font-bold text-sm shrink-0 transition-colors
                    ${isActive ? `bg-${layer.color.replace('text-', '')}/20 ${layer.color}` : 'bg-white/5 text-white/40'}
                  `}>
                    L{layer.num}
                  </div>
                  
                  {/* Icon */}
                  <div className={`shrink-0 transition-colors ${isActive ? layer.color : 'text-white/40'}`}>
                    <layer.icon size={24} />
                  </div>
                  
                  {/* Name */}
                  <div className="flex-1 font-semibold text-lg tracking-tight text-white/90 truncate">
                    {layer.name}
                  </div>
                  
                  {/* Data Unit (Hidden on small screens) */}
                  <div className={`hidden sm:block text-xs font-mono px-3 py-1.5 rounded-md border text-right transition-colors shrink-0 max-w-[140px] leading-tight ${isActive ? `border-${layer.color.replace('text-', '')}/30 ${layer.color} bg-${layer.color.replace('text-', '')}/10` : 'border-white/10 text-white/40'}`}>
                    {layer.dataUnit}
                  </div>

                  {/* Flow Indicator (during animation) */}
                  {isActive && animatingDirection && (
                    <motion.div 
                      layoutId="data-packet"
                      className={`absolute right-4 ${animatingDirection === 'down' ? '-bottom-3' : '-top-3'} z-20 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)]`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Cpu size={12} className="text-black" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right side: Details Panel */}
        <div className="flex-1 min-h-[300px] flex items-center">
          <AnimatePresence mode="wait">
            {activeLayer ? (
              <motion.div
                key={activeLayer}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col justify-center p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden group"
              >
                {(() => {
                  const layer = osiLayers.find(l => l.num === activeLayer)!;
                  return (
                    <>
                      {/* Background large icon */}
                      <div className="absolute -right-8 -bottom-8 opacity-5 transition-transform group-hover:scale-110 duration-700 pointer-events-none">
                        <layer.icon size={200} className={layer.color} />
                      </div>
                      
                      <div className="relative z-10">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${layer.bgColor} ${layer.color} border border-current/20`}>
                          Layer {layer.num}
                        </div>
                        
                        <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
                          <layer.icon className={layer.color} size={32} />
                          {layer.name}
                        </h2>
                        
                        <p className="text-white/70 text-lg leading-relaxed mb-8">
                          {layer.description}
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Protocols / Technologies</h4>
                            <div className="flex flex-wrap gap-2">
                              {layer.protocols.split(', ').map(p => (
                                <span key={p} className="px-2 py-1 rounded text-sm bg-white/5 border border-white/10 text-white/80">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Protocol Data Unit (PDU)</h4>
                            <span className="font-mono text-sm text-white/90">
                              {layer.dataUnit}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Real-World Example</h4>
                            <p className="text-sm text-white/80 leading-relaxed border-l-2 border-current/30 pl-3 italic">
                              "{layer.example}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-white/10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
                  <Cpu size={32} />
                </div>
                <h3 className="text-xl font-medium text-white/60 mb-2">Interactive OSI Model</h3>
                <p className="text-white/40 text-sm max-w-xs">
                  Hover over any layer in the stack to see its details, or use the Send/Receive buttons to simulate data flow.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
