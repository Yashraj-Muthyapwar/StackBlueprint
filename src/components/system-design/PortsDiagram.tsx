import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Database, Terminal, Send, Server, Network, Check, ShieldAlert, X } from "lucide-react";

type Service = {
  id: string;
  name: string;
  port: number;
  protocol: string;
  icon: any;
  color: string;
  bg: string;
  description: string;
  isBlocked?: boolean;
  successMessage?: string;
};

const SERVICES: Service[] = [
  {
    id: "web",
    name: "Web Server",
    port: 443,
    protocol: "TCP",
    icon: Globe,
    color: "text-mint",
    bg: "bg-mint/10 border-mint/30",
    description: "Handles HTTPS traffic for website visitors.",
    successMessage: "TLS handshake successful. HTTP/1.1 200 OK.",
  },
  {
    id: "db",
    name: "PostgreSQL",
    port: 5432,
    protocol: "TCP",
    icon: Database,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    description: "Database for storing application data.",
    successMessage: "PostgreSQL handshake completed. Ready for queries.",
  },
  {
    id: "ssh",
    name: "SSH Service",
    port: 22,
    protocol: "TCP",
    icon: Terminal,
    color: "text-violet",
    bg: "bg-violet/10 border-violet/30",
    description: "Secure terminal access for administrators.",
    successMessage: "SSH-2.0-OpenSSH negotiated. Awaiting credentials.",
  },
  {
    id: "telnet",
    name: "Legacy Telnet",
    port: 23,
    protocol: "TCP",
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/30",
    description: "Insecure protocol, blocked by firewall.",
    isBlocked: true,
  },
];

type PacketState = "idle" | "syn_out" | "syn_firewall" | "syn_server" | "syn_ack_in" | "syn_ack_client" | "ack_out" | "ack_server" | "established" | "rst_in";

export function PortsDiagram() {
  const [selectedService, setSelectedService] = useState<Service>(SERVICES[0]);
  const [isSending, setIsSending] = useState(false);
  const [packetState, setPacketState] = useState<PacketState>("idle");
  const [sourcePort, setSourcePort] = useState(52345);

  const handleSend = () => {
    if (isSending) return;
    setIsSending(true);
    setPacketState("idle");
    setSourcePort(Math.floor(Math.random() * (65535 - 49152 + 1)) + 49152);

    let t = 0;
    const step = (state: PacketState, delay: number) => {
      t += delay;
      setTimeout(() => setPacketState(state), t);
    };

    // 1. Client sends SYN
    step("syn_out", 300);
    // 2. Hits firewall
    step("syn_firewall", 1800);

    if (selectedService.isBlocked) {
      // 3. Firewall rejects, sends RST
      step("rst_in", 2500);
      setTimeout(() => {
        setIsSending(false);
        setPacketState("idle");
      }, t + 3000);
    } else {
      // 3. Firewall allows, reaches server
      step("syn_server", 1800);
      // 4. Server responds with SYN-ACK
      step("syn_ack_in", 1800);
      // 5. Reaches client
      step("syn_ack_client", 1800);
      // 6. Client sends ACK
      step("ack_out", 1800);
      // 7. Reaches server
      step("ack_server", 1800);
      // 8. Connection established at Port
      step("established", 1200);
      
      setTimeout(() => {
        setIsSending(false);
        setPacketState("idle");
      }, t + 4500);
    }
  };

  const getPacketPosition = () => {
    switch (packetState) {
      case "idle": return { x: -180, y: 0, opacity: 0, scale: 0.8 };
      case "syn_out": return { x: -30, y: 0, opacity: 1, scale: 1 };
      case "syn_firewall": return { x: 70, y: 0, opacity: 1, scale: 1 };
      case "rst_in": return { x: -80, y: 40, opacity: 0, scale: 0.5 };
      case "syn_server": return { x: 120, y: 0, opacity: 1, scale: 1 };
      case "syn_ack_in": return { x: -30, y: 0, opacity: 1, scale: 1 };
      case "syn_ack_client": return { x: -180, y: 0, opacity: 1, scale: 1 };
      case "ack_out": return { x: 70, y: 0, opacity: 1, scale: 1 };
      case "ack_server": return { x: 120, y: 0, opacity: 1, scale: 1 };
      case "established": 
        const yOffsets: Record<string, number> = { web: -70, db: 0, ssh: 70 };
        return { x: 200, y: yOffsets[selectedService.id] || 0, opacity: 0, scale: 0.5 };
      default: return { x: -180, y: 0, opacity: 0, scale: 0.8 };
    }
  };

  const getPacketFlag = () => {
    switch (packetState) {
      case "syn_ack_in":
      case "syn_ack_client": return "SYN, ACK";
      case "ack_out":
      case "ack_server":
      case "established": return "ACK";
      case "rst_in": return "RST";
      default: return "SYN";
    }
  };

  return (
    <figure className="my-8 overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm relative">
      <figcaption className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
        <span>Port Routing & Firewall Visualization</span>
        <span className="text-[9px] opacity-70 hidden sm:inline">IP = Building, Port = Apartment</span>
      </figcaption>

      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_260px] gap-6 items-center">
          
          {/* Client Side */}
          <div className="flex flex-col items-center gap-4 z-20">
            <div className="rounded-xl border border-hairline bg-surface-2/80 p-5 text-center shadow-lg backdrop-blur-md w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-blue-500/10 text-blue-500 shadow-inner border border-blue-500/20">
                <Network className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground tracking-tight">Client Device</h3>
              <div className="mt-1 font-mono text-[10px] text-muted-foreground bg-black/10 dark:bg-white/5 py-1 px-2 rounded w-fit mx-auto border border-hairline/50 flex flex-col gap-0.5 relative group cursor-help">
                <span>IP: 192.168.1.5</span>
                <span className="text-[9px] opacity-80 border-b border-dashed border-muted-foreground/50 pb-px">Src Port (Ephemeral): {isSending ? sourcePort : '...'}</span>
                
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 p-2.5 bg-surface-2 border border-hairline rounded shadow-lg text-[10px] text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case font-sans">
                  The OS automatically assigns a random high-numbered port (49152-65535) for each outgoing request to uniquely identify the connection on the client side.
                </div>
              </div>
              
              <div className="mt-6 flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 text-left px-1">Destination Port:</p>
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => !isSending && setSelectedService(s)}
                    disabled={isSending}
                    className={`group relative flex items-center gap-3 rounded-lg border px-3 py-2 text-xs transition-all duration-300 ${
                      selectedService.id === s.id
                        ? `border-${s.color.split("-")[1]}/50 bg-${s.color.split("-")[1]}/10 ${s.color} shadow-sm`
                        : "border-hairline bg-transparent hover:bg-surface-2 text-muted-foreground"
                    } ${isSending ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <s.icon className={`size-4 ${selectedService.id === s.id ? s.color : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <span className="font-mono font-medium">Port {s.port}</span>
                    {s.isBlocked && <ShieldAlert className="size-3 absolute right-2 opacity-50" />}
                  </button>
                ))}
                
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-semibold transition-all hover:bg-foreground/90 active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg disabled:hover:shadow-none"
                >
                  <Send className="size-4" />
                  {isSending ? "Sending..." : "Send Request"}
                </button>
              </div>
            </div>
          </div>

          {/* Network / Animation Area */}
          <div className="relative h-[250px] md:h-[350px] w-full flex items-center justify-center">
            {/* Animated Packet */}
            <AnimatePresence>
              {isSending && (
                <motion.div
                  initial={{ x: -180, y: 0, opacity: 0, scale: 0.8 }}
                  animate={getPacketPosition()}
                  transition={{ 
                    duration: packetState === "rst_in" || packetState === "established" ? 1.0 : 1.6, 
                    type: "spring", 
                    bounce: 0.1 
                  }}
                  className={`absolute z-30 flex flex-col items-center justify-center rounded-lg border bg-surface/95 backdrop-blur-sm p-2 shadow-xl w-36 ${packetState === 'rst_in' ? 'border-red-500/50 bg-red-500/10' : selectedService.bg}`}
                >
                  {packetState === 'rst_in' ? (
                     <div className="flex flex-col items-center gap-1 text-red-500 py-1">
                        <X className="size-5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight">TCP RST<br/>(Blocked)</span>
                     </div>
                  ) : (
                    <>
                      <div className="bg-black/10 dark:bg-white/10 w-[110%] -mt-2 mb-2 py-0.5 text-[8px] font-bold text-center tracking-widest uppercase opacity-80">
                        {selectedService.protocol} Segment <span className="text-[7px] ml-0.5 px-0.5 border border-current rounded-sm opacity-90">{getPacketFlag()}</span>
                      </div>
                      <div className="flex flex-col w-full gap-0.5 border-b border-hairline/50 pb-1.5 mb-1.5">
                        <div className="flex justify-between items-center w-full">
                           <span className="font-mono text-[8px] text-muted-foreground">SRC:</span>
                           <span className="font-mono text-[8px]">
                             {["syn_ack_in", "syn_ack_client", "rst_in"].includes(packetState) ? `203.0.113.45:${selectedService.port}` : `192.168.1.5:${sourcePort}`}
                           </span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                           <span className="font-mono text-[8px] text-muted-foreground">DST:</span>
                           <span className={`font-mono text-[9px] font-bold ${selectedService.color}`}>
                             {["syn_ack_in", "syn_ack_client", "rst_in"].includes(packetState) ? `192.168.1.5:${sourcePort}` : `203.0.113.45:${selectedService.port}`}
                           </span>
                        </div>
                      </div>
                      <div className={`grid size-6 place-items-center rounded-full ${selectedService.color} bg-white/5`}>
                        <selectedService.icon className="size-3.5" />
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connecting Lines and Firewall */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <svg className="w-full h-full absolute inset-0 hidden md:block" style={{ overflow: 'visible' }}>
                 <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="currentColor" className="text-hairline" strokeWidth="2" strokeDasharray="4 4" />
                 <motion.line 
                    x1="0%" y1="50%" x2="100%" y2="50%" 
                    stroke="currentColor" 
                    className={selectedService.isBlocked && packetState === 'rst_in' ? "text-red-500" : "text-mint/50"} 
                    strokeWidth="2" 
                    initial={{ strokeDashoffset: 100, strokeDasharray: "20 100" }}
                    animate={isSending ? { 
                      strokeDashoffset: ["syn_ack_in", "syn_ack_client", "rst_in"].includes(packetState) ? 100 : -100 
                    } : { strokeDashoffset: 100 }}
                    transition={{ duration: 1.5, repeat: isSending ? Infinity : 0, ease: "linear" }}
                 />
               </svg>
               
               {/* Firewall Element */}
               <div className="absolute right-[5%] md:right-[15%] h-48 w-1.5 rounded-full bg-gradient-to-b from-transparent via-red-500/30 to-transparent">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-hairline rounded-full p-1.5 text-red-500/70 shadow-sm backdrop-blur-md">
                     <ShieldAlert className="size-4" />
                  </div>
               </div>
            </div>
          </div>

          {/* Server Side */}
          <div className="flex flex-col items-center gap-4 z-20">
            <div className="rounded-xl border border-hairline bg-surface/80 p-5 text-center shadow-lg backdrop-blur-md w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-bl from-slate-500/5 to-transparent pointer-events-none" />
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-inner border border-hairline">
                <Server className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground tracking-tight">Production Server</h3>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground bg-black/10 dark:bg-white/5 py-1 px-2 rounded w-fit mx-auto border border-hairline/50">IP: 203.0.113.45</p>
              
              <div className="mt-6 flex flex-col gap-3 relative">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground text-left px-1">Active Services</p>
                {SERVICES.filter(s => !s.isBlocked).map((s) => {
                  const isTarget = isSending && selectedService.id === s.id && packetState === "established";
                  return (
                    <motion.div
                      key={s.id}
                      animate={{
                        scale: isTarget ? 1.05 : 1,
                        borderColor: isTarget ? "var(--tw-colors-mint-500)" : "transparent",
                        backgroundColor: isTarget ? "var(--tw-colors-mint-500/10)" : "",
                      }}
                      className={`relative flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-300 ${s.bg} ${isTarget ? 'shadow-lg ring-4 ring-mint/20 z-10' : 'opacity-80'}`}
                    >
                      <div className={`grid size-8 shrink-0 place-items-center rounded-md bg-white/50 dark:bg-black/20 ${s.color} shadow-sm`}>
                        <s.icon className="size-4" />
                      </div>
                      <div className="flex flex-col items-start text-left flex-1 min-w-0">
                        <span className="font-mono text-xs font-bold text-foreground">{s.protocol} / {s.port}</span>
                        <span className="text-[10px] text-muted-foreground truncate w-full">{s.name}</span>
                      </div>
                      {isTarget && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -left-3 top-1/2 -translate-y-1/2 grid size-6 place-items-center rounded-full bg-mint text-black shadow-md border-2 border-surface"
                        >
                          <Check className="size-3.5" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
        
        {/* Description Box */}
        <div className="mt-8 rounded-xl bg-surface-2/40 p-4 border border-hairline relative overflow-hidden shadow-inner">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-mint" />
          <div className="flex items-start gap-3 pl-2">
             <div className="mt-0.5 text-muted-foreground">
                <Terminal className="size-4" />
             </div>
             <p className="text-sm text-foreground/80 leading-relaxed font-mono">
               {isSending ? (
                 <span className="animate-pulse">
                    {packetState === 'syn_out' || packetState === 'syn_firewall' ? `Initiating TCP Handshake. Sending SYN packet to port ${selectedService.port}...` : 
                     packetState === 'rst_in' ? <span className="text-red-500 font-bold">Connection to port {selectedService.port} refused. Firewall returned TCP RST.</span> :
                     packetState === 'syn_server' ? `Firewall allowed SYN. Server evaluating request...` :
                     packetState === 'syn_ack_in' || packetState === 'syn_ack_client' ? `Server accepted connection. Returning SYN-ACK packet...` :
                     packetState === 'ack_out' || packetState === 'ack_server' ? `Client received SYN-ACK. Sending final ACK to establish connection...` :
                     packetState === 'established' ? <span className="text-mint font-bold">{selectedService.successMessage}</span> :
                     `Routing packet to ${selectedService.name} on port ${selectedService.port}...`}
                 </span>
               ) : (
                 <span>Select a destination port and send a request. Watch how the firewall processes or rejects the incoming socket request.</span>
               )}
             </p>
          </div>
        </div>

      </div>
    </figure>
  );
}
