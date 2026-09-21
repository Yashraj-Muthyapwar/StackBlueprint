import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  FileKey2,
  Handshake,
  Truck,
  Map,
  Link as LinkIcon,
  Cable,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Cpu,
  MonitorSmartphone,
  Server,
  CheckCircle2,
} from "lucide-react";

const osiLayers = [
  {
    num: 7,
    name: "Application",
    icon: Globe,
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
    header: "HTTP",
    description: "Closest to the end-user. Provides network services to the user's applications.",
    protocols: "HTTP, HTTPS, FTP, SMTP, DNS",
    dataUnit: "Data",
    encapsulationExample: "Browser creates an HTTP GET request to stackblueprint.vercel.app.",
    decapsulationExample: "Web server processes the request and sends back HTML.",
  },
  {
    num: 6,
    name: "Presentation",
    icon: FileKey2,
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    header: "TLS",
    description:
      "Translates data into application-readable format. Handles encryption and compression.",
    protocols: "SSL/TLS, JPEG, GIF",
    dataUnit: "Data",
    encapsulationExample:
      "Encrypts the HTTP request via SSL/TLS for secure transmission to Vercel.",
    decapsulationExample:
      "Decrypts the data (SSL/TLS). Ensures it's in a format the browser understands.",
  },
  {
    num: 5,
    name: "Session",
    icon: Handshake,
    color: "text-teal-600",
    bgColor: "bg-teal-600/10",
    header: "SESSION",
    description: "Manages sessions (open, maintain, close) between applications.",
    protocols: "NetBIOS, RPC, Sockets",
    dataUnit: "Data",
    encapsulationExample: "Establishes a session with the stackblueprint.vercel.app web server.",
    decapsulationExample: "Maintains the session and manages connection state.",
  },
  {
    num: 4,
    name: "Transport",
    icon: Truck,
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    header: "TCP",
    description: "Ensures end-to-end communication, reliability, and flow control.",
    protocols: "TCP, UDP",
    dataUnit: "Segments",
    encapsulationExample: "Breaks data into segments, adds TCP header with Dest Port 443 (HTTPS).",
    decapsulationExample: "Removes TCP header, reassembles segments.",
  },
  {
    num: 3,
    name: "Network",
    icon: Map,
    color: "text-yellow-600",
    bgColor: "bg-yellow-600/10",
    header: "IP",
    description: "Responsible for routing and logical addressing (IP) between networks.",
    protocols: "IPv4, IPv6, ICMP",
    dataUnit: "Packets",
    encapsulationExample:
      "Adds IP header with Source IP (You) and Dest IP (stackblueprint server).",
    decapsulationExample: "Removes IP header, routes data to server.",
  },
  {
    num: 2,
    name: "Data Link",
    icon: LinkIcon,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    header: "MAC",
    description: "Handles node-to-node communication. Provides MAC addressing and error detection.",
    protocols: "Ethernet, Wi-Fi",
    dataUnit: "Frames",
    encapsulationExample: "Adds MAC header for local delivery to your home Wi-Fi router.",
    decapsulationExample: "Removes MAC header, checks for errors.",
  },
  {
    num: 1,
    name: "Physical",
    icon: Cable,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    header: "BITS",
    description: "Transmission of raw bits (0s and 1s) over physical medium.",
    protocols: "Cables, Hubs, Wi-Fi RF",
    dataUnit: "Bits",
    encapsulationExample: "Converts the frame into Wi-Fi radio waves or electrical signals.",
    decapsulationExample: "Converts signals back into bits.",
  },
];

export function OsiModelDiagram() {
  const [step, setStep] = useState<number>(-1);
  const [hoveredState, setHoveredState] = useState<{
    num: number;
    side: "sender" | "receiver";
  } | null>(null);
  const [selectedState, setSelectedState] = useState<{
    num: number;
    side: "sender" | "receiver";
  } | null>(null);

  const startAnimation = () => {
    if (step !== -1) return;
    setSelectedState(null); // Unlock the detail view so it follows the animation
    setStep(0);
  };

  useEffect(() => {
    if (step >= 0 && step < 15) {
      const timer = setTimeout(() => {
        setStep((s) => s + 1);
      }, 2500); // Slowed down from 1500 to 2500 for readability
      return () => clearTimeout(timer);
    } else if (step === 15) {
      const timer = setTimeout(() => {
        setStep(-1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const activeSide =
    step === -1
      ? null
      : step <= 6
        ? "sender"
        : step === 7
          ? "network"
          : step <= 14
            ? "receiver"
            : "done";
  const activeLayerNum =
    step === -1 || step === 15 ? null : step <= 6 ? 7 - step : step === 7 ? 1 : step - 7;

  const getActiveHeaders = () => {
    if (step === -1 || step === 15) return [];

    let depth = 0;
    if (step <= 6) depth = step;
    else if (step === 7) depth = 6;
    else depth = 14 - step;

    const headers = [];
    if (depth >= 6) headers.push(osiLayers.find((l) => l.num === 2)!);
    if (depth >= 5) headers.push(osiLayers.find((l) => l.num === 3)!);
    if (depth >= 4) headers.push(osiLayers.find((l) => l.num === 4)!);
    if (depth >= 3) headers.push(osiLayers.find((l) => l.num === 5)!);
    if (depth >= 2) headers.push(osiLayers.find((l) => l.num === 6)!);

    return headers;
  };

  const isBinary = step >= 6 && step <= 8;

  const displayState =
    selectedState !== null
      ? selectedState
      : hoveredState !== null
        ? hoveredState
        : activeLayerNum !== null
          ? { num: activeLayerNum, side: activeSide as "sender" | "receiver" }
          : null;
  const displayLayer =
    displayState !== null ? osiLayers.find((l) => l.num === displayState.num) : null;

  return (
    <div className="my-10 w-full rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-background to-background pointer-events-none" />

      {/* Header Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-white/10 bg-white/[0.02]">
        <div>
          <h3 className="text-xl font-bold text-white/90">
            OSI Model: Encapsulation & Decapsulation
          </h3>
          <p className="text-sm text-white/50">
            Click a layer to lock details, or play the animation.
          </p>
        </div>
        <button
          onClick={startAnimation}
          disabled={step !== -1}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-mint/10 hover:bg-mint/20 border border-mint/20 text-sm font-bold text-mint transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === -1 ? (
            <>
              <ArrowDown size={16} /> Send Web Request
            </>
          ) : step < 15 ? (
            <>
              <Cpu size={16} className="animate-spin-slow" /> Transmitting...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} /> Delivered
            </>
          )}
        </button>
      </div>

      <div className="relative z-10 w-full overflow-x-auto p-6 scrollbar-thin">
        <div className="min-w-[860px] grid grid-cols-[280px_1fr_280px] gap-6">
          {/* SENDER COLUMN */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2 px-2 text-white/80 font-bold tracking-tight">
              <MonitorSmartphone size={20} className="text-blue-400" />
              SENDER <span className="text-sm font-normal text-white/40">(Browser)</span>
            </div>
            {osiLayers.map((layer) => {
              const isLocked = selectedState?.num === layer.num && selectedState?.side === "sender";
              return (
                <div
                  key={`sender-${layer.num}`}
                  onMouseEnter={() => setHoveredState({ num: layer.num, side: "sender" })}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() =>
                    setSelectedState(isLocked ? null : { num: layer.num, side: "sender" })
                  }
                  className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer
                  ${
                    activeSide === "sender" && activeLayerNum === layer.num
                      ? `${layer.bgColor} border-${layer.color.replace("text-", "")}/40 shadow-[0_0_15px_rgba(0,0,0,0.2)] shadow-${layer.color.replace("text-", "")}/20 scale-[1.02] z-10`
                      : isLocked
                        ? `bg-white/[0.06] border-${layer.color.replace("text-", "")}/50 shadow-[0_0_10px_rgba(255,255,255,0.05)] z-10 scale-[1.01]`
                        : `bg-white/[0.02] border-white/5 hover:bg-white/[0.04] ${activeSide ? "opacity-40" : "opacity-100"} z-0`
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg font-mono font-bold text-sm shrink-0 transition-colors duration-300 ${activeSide === "sender" && activeLayerNum === layer.num ? `bg-${layer.color.replace("text-", "")}/20 ${layer.color}` : "bg-white/5 text-white/40"}`}
                  >
                    L{layer.num}
                  </div>
                  <div
                    className={`shrink-0 transition-colors duration-300 ${(activeSide === "sender" && activeLayerNum === layer.num) || isLocked ? layer.color : "text-white/40"}`}
                  >
                    <layer.icon size={20} />
                  </div>
                  <div
                    className={`flex-1 font-semibold truncate text-sm ${(activeSide === "sender" && activeLayerNum === layer.num) || isLocked ? "text-white" : "text-white/90"}`}
                  >
                    {layer.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ANIMATION CHUTE (MIDDLE) */}
          <div className="relative flex flex-col items-center">
            {/* Encapsulation Label */}
            <div className="absolute top-0 w-full flex justify-between px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
              <span className="flex items-center gap-1">
                <ArrowDown size={12} /> Encapsulate
              </span>
              <span className="flex items-center gap-1">
                Decapsulate <ArrowUp size={12} />
              </span>
            </div>

            {/* The Payload */}
            <AnimatePresence>
              {step !== -1 && step < 15 && (
                <motion.div
                  key="payload"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    y: step <= 6 ? step * 60 + 36 : step >= 8 ? (14 - step) * 60 + 36 : 6 * 60 + 36,
                    x: step <= 6 ? -60 : step >= 8 ? 60 : 0,
                    scale: isBinary ? 0.9 : 1,
                  }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0 }}
                  className={`absolute left-1/2 -ml-[160px] w-[320px] flex justify-center items-center gap-1.5 p-2 rounded-lg bg-black/60 border border-white/20 shadow-xl backdrop-blur-md z-20 overflow-hidden`}
                >
                  {isBinary ? (
                    <div className="font-mono text-emerald-400 text-xs font-bold tracking-[0.3em] overflow-hidden whitespace-nowrap px-2 animate-pulse w-full text-center">
                      101010101010101010
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 w-full justify-center py-0.5">
                      <AnimatePresence mode="popLayout">
                        {getActiveHeaders().map((h) => (
                          <motion.div
                            key={h.num}
                            initial={{
                              opacity: 0,
                              scale: 0.5,
                              width: 0,
                              marginLeft: 0,
                              marginRight: 0,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              width: "auto",
                              marginLeft: 2,
                              marginRight: 2,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.5,
                              width: 0,
                              marginLeft: 0,
                              marginRight: 0,
                            }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            className={`shrink-0 px-2 py-1 rounded-[4px] bg-${h.color.replace("text-", "")}/20 border border-${h.color.replace("text-", "")}/50 ${h.color} text-[10px] font-bold tracking-wider overflow-hidden shadow-sm`}
                          >
                            {h.header}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {/* Core Data Block */}
                      <motion.div
                        layout
                        className="shrink-0 mx-0.5 px-3 py-1 rounded-[4px] bg-purple-600/30 border border-purple-600/50 text-purple-300 text-[10px] font-bold shadow-sm"
                      >
                        DATA (HTTP)
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Network Line */}
            <div className="absolute bottom-[24px] w-full h-[2px] bg-white/10 rounded-full flex items-center justify-center">
              <div className="bg-[#0a0a0a] px-4 text-[10px] font-bold text-white/30 tracking-widest relative z-10 flex items-center gap-2">
                NETWORK <Globe size={10} />
              </div>
              {step >= 7 && step <= 8 && (
                <motion.div
                  initial={{ width: "0%", left: "0%", opacity: 1 }}
                  animate={
                    step === 7
                      ? { width: "100%", left: "0%", opacity: 1 }
                      : { width: "0%", left: "100%", opacity: 0 }
                  }
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute h-full bg-emerald-500 shadow-[0_0_15px_#10b981] z-0"
                />
              )}
            </div>
          </div>

          {/* RECEIVER COLUMN */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-end gap-2 mb-2 px-2 text-white/80 font-bold tracking-tight">
              <span className="text-sm font-normal text-white/40">(Web Server)</span> RECEIVER
              <Server size={20} className="text-purple-400" />
            </div>
            {osiLayers.map((layer) => {
              const isLocked =
                selectedState?.num === layer.num && selectedState?.side === "receiver";
              return (
                <div
                  key={`receiver-${layer.num}`}
                  onMouseEnter={() => setHoveredState({ num: layer.num, side: "receiver" })}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() =>
                    setSelectedState(isLocked ? null : { num: layer.num, side: "receiver" })
                  }
                  className={`relative flex items-center justify-end gap-3 p-3 rounded-xl border transition-all duration-300 cursor-pointer
                  ${
                    activeSide === "receiver" && activeLayerNum === layer.num
                      ? `${layer.bgColor} border-${layer.color.replace("text-", "")}/40 shadow-[0_0_15px_rgba(0,0,0,0.2)] shadow-${layer.color.replace("text-", "")}/20 scale-[1.02] z-10`
                      : isLocked
                        ? `bg-white/[0.06] border-${layer.color.replace("text-", "")}/50 shadow-[0_0_10px_rgba(255,255,255,0.05)] z-10 scale-[1.01]`
                        : `bg-white/[0.02] border-white/5 hover:bg-white/[0.04] ${activeSide ? "opacity-40" : "opacity-100"} z-0`
                  }`}
                >
                  <div
                    className={`flex-1 font-semibold truncate text-right text-sm ${(activeSide === "receiver" && activeLayerNum === layer.num) || isLocked ? "text-white" : "text-white/90"}`}
                  >
                    {layer.name}
                  </div>
                  <div
                    className={`shrink-0 transition-colors duration-300 ${(activeSide === "receiver" && activeLayerNum === layer.num) || isLocked ? layer.color : "text-white/40"}`}
                  >
                    <layer.icon size={20} />
                  </div>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg font-mono font-bold text-sm shrink-0 transition-colors duration-300 ${activeSide === "receiver" && activeLayerNum === layer.num ? `bg-${layer.color.replace("text-", "")}/20 ${layer.color}` : "bg-white/5 text-white/40"}`}
                  >
                    L{layer.num}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Panel at the bottom */}
      <AnimatePresence mode="wait">
        {displayLayer ? (
          <motion.div
            key={displayLayer.num}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`w-full p-6 sm:p-8 border-t border-white/5 bg-white/[0.02] z-20`}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
                <div className="flex-1">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 ${displayLayer.bgColor} ${displayLayer.color} border border-current/20`}
                  >
                    Layer {displayLayer.num}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <displayLayer.icon className={displayLayer.color} size={24} />
                    {displayLayer.name}
                  </h2>
                  <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
                    {displayLayer.description}
                  </p>
                </div>
                <div className="w-full md:w-64 space-y-3 shrink-0">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                      Protocol Data Unit
                    </h4>
                    <span className={`font-mono text-sm ${displayLayer.color}`}>
                      {displayLayer.dataUnit}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">
                      Protocols
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {displayLayer.protocols.split(", ").map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-white/80"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 border-l-4"
                style={{
                  borderLeftColor: displayLayer.color.includes("purple")
                    ? "#9333ea"
                    : displayLayer.color.includes("blue")
                      ? "#2563eb"
                      : displayLayer.color.includes("teal")
                        ? "#0d9488"
                        : displayLayer.color.includes("green")
                          ? "#16a34a"
                          : displayLayer.color.includes("yellow")
                            ? "#ca8a04"
                            : displayLayer.color.includes("orange")
                              ? "#f97316"
                              : "#ef4444",
                }}
              >
                <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">
                  {displayState?.side === "receiver"
                    ? "Decapsulation Example"
                    : "Encapsulation Example"}
                </h4>
                <p className="text-sm text-white/80">
                  {displayState?.side === "receiver"
                    ? displayLayer.decapsulationExample
                    : displayLayer.encapsulationExample}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="w-full p-8 border-t border-white/5 bg-white/[0.01] flex flex-col gap-2 items-center justify-center min-h-[220px]">
            <p className="text-white/40 text-base font-medium">
              Hover over a layer to view details.
            </p>
            <p className="text-white/20 text-sm">Click a layer to lock it in place.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
