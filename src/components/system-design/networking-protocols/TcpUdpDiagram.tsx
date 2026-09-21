import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  MonitorSmartphone,
  FileDown,
  Tv,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Play,
  FileIcon,
  Video,
} from "lucide-react";

export function TcpUdpDiagram() {
  const [protocol, setProtocol] = useState<"TCP" | "UDP">("TCP");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const maxSteps = protocol === "TCP" ? 9 : 3;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= maxSteps) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 2500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, maxSteps, protocol]);

  const handleProtocolSwitch = (p: "TCP" | "UDP") => {
    setProtocol(p);
    setStep(0);
    setIsPlaying(false);
  };

  const reset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col rounded-xl border border-hairline bg-card/50 overflow-hidden shadow-sm my-6">
      <div className="flex items-center justify-between border-b border-hairline bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-hairline bg-background p-1">
            <button
              onClick={() => handleProtocolSwitch("TCP")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                protocol === "TCP"
                  ? "bg-mint text-mint-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              TCP (Reliable)
            </button>
            <button
              onClick={() => handleProtocolSwitch("UDP")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                protocol === "UDP"
                  ? "bg-amber text-amber-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              UDP (Fast)
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button
            onClick={() => {
              if (step >= maxSteps) setStep(0);
              setIsPlaying(!isPlaying);
            }}
            className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 transition-colors shadow-sm"
          >
            {isPlaying ? "Pause" : step >= maxSteps ? "Replay" : "Play Animation"}
          </button>
        </div>
      </div>

      <div className="relative h-[240px] w-full bg-grid-slate-900/[0.04] dark:bg-grid-slate-50/[0.02] overflow-hidden">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-24 right-24 h-[2px] -translate-y-1/2 border-t-2 border-dashed border-border/50" />

        {/* Client Side */}
        <div className="absolute left-4 md:left-12 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 w-[140px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
            <MonitorSmartphone className="size-8 text-foreground" />

            {/* Client Context UI Box */}
            <div className="absolute -bottom-14 w-32 bg-background border border-hairline rounded-md p-2 shadow-sm flex items-center justify-center gap-2">
              {protocol === "TCP" ? (
                <>
                  <FileIcon className="size-3 text-mint" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mint transition-all duration-700"
                        style={{
                          width: step >= 9 ? "100%" : step >= 7 ? "66%" : step >= 5 ? "33%" : "0%",
                        }}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-muted-foreground block text-center">
                      Downloading
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Video className="size-3 text-amber" />
                  <div className="flex-1 flex items-center justify-center">
                    {step === 2 ? (
                      <span className="text-[9px] font-mono text-destructive flex items-center gap-1">
                        <AlertTriangle className="size-3" /> Glitch
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                        <Play className="size-3 text-amber" /> Live
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-muted-foreground mt-12">CLIENT</span>
        </div>

        {/* Server Side */}
        <div className="absolute right-4 md:right-12 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 w-[140px] z-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-muted-foreground/20 bg-background shadow-lg relative">
            <Server className="size-8 text-foreground" />
            <div className="absolute -bottom-14 w-32 bg-background border border-hairline rounded-md p-2 shadow-sm flex items-center justify-center gap-2">
              {protocol === "TCP" ? (
                <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">
                  <FileDown className="size-3" /> Sending File
                </span>
              ) : (
                <span className="text-[9px] font-mono font-medium text-muted-foreground flex items-center gap-1">
                  <Tv className="size-3" /> Broadcasting
                </span>
              )}
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-muted-foreground mt-12">SERVER</span>
        </div>

        {/* Animation Track */}
        <div className="absolute inset-0 mx-[100px] md:mx-[140px] z-10">
          <AnimatePresence mode="wait">
            {protocol === "TCP" ? (
              <TcpAnimation trackStep={step} key="tcp" />
            ) : (
              <UdpAnimation trackStep={step} key="udp" />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-hairline bg-muted/20 p-4">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              {protocol === "TCP" ? (
                <>
                  <FileDown className="size-4 text-mint" />
                  Real-World Example: File Download
                </>
              ) : (
                <>
                  <Tv className="size-4 text-amber" />
                  Real-World Example: Live Video Stream
                </>
              )}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground min-h-[60px]">
              {protocol === "TCP"
                ? "When downloading a file, TCP ensures perfection. It establishes a connection first. The server sends chunks of the file, and the client constantly sends back receipts (ACKs). If a chunk gets lost, the download pauses and the chunk is resent. You receive an uncorrupted file."
                : "When watching a live stream, UDP prioritizes speed. The server blasts out video frames continuously. If a frame drops due to a bad signal, the stream doesn't pause to fetch it. The player simply glitches for a millisecond and keeps playing the live action."}
            </p>
          </div>

          <div className="w-px h-16 bg-hairline hidden md:block" />

          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-bold text-foreground">What is happening?</h3>
            <p className="text-xs leading-relaxed text-muted-foreground font-mono bg-background p-2 rounded-md border border-hairline min-h-[60px] overflow-y-auto max-h-[80px]">
              {protocol === "TCP" && step === 0 && "Step 0: Ready to download file."}
              {protocol === "TCP" && step === 1 && "Step 1 (SYN): Client requests connection."}
              {protocol === "TCP" && step === 2 && "Step 2 (SYN-ACK): Server accepts connection."}
              {protocol === "TCP" &&
                step === 3 &&
                "Step 3 (ACK): Client acknowledges connection. Handshake complete!"}
              {protocol === "TCP" && step === 4 && "Step 4: Server sends Chunk 1."}
              {protocol === "TCP" && step === 5 && "Step 5 (ACK): Client acknowledges Chunk 1."}
              {protocol === "TCP" && step === 6 && "Step 6: Server sends Chunk 2."}
              {protocol === "TCP" && step === 7 && "Step 7 (ACK): Client acknowledges Chunk 2."}
              {protocol === "TCP" && step === 8 && "Step 8: Server sends Chunk 3."}
              {protocol === "TCP" &&
                step === 9 &&
                "Step 9 (ACK): Client acknowledges Chunk 3. File download complete!"}

              {protocol === "UDP" && step === 0 && "Step 0: Ready to broadcast stream."}
              {protocol === "UDP" &&
                step === 1 &&
                "Step 1: Server blasts Frames 1 & 2. No handshake required."}
              {protocol === "UDP" &&
                step === 2 &&
                "Step 2: Server blasts Frames 3 & 4. Frame 3 drops in transit. Video player glitches briefly but keeps playing."}
              {protocol === "UDP" &&
                step === 3 &&
                "Step 3: Server blasts Frames 5 & 6. Stream continues smoothly. No retransmissions."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Packet({
  label,
  from,
  color,
  delay = 0,
  dropped = false,
}: {
  label: React.ReactNode;
  from: "left" | "right";
  color: "mint" | "violet" | "blue" | "amber";
  delay?: number;
  dropped?: boolean;
}) {
  const startLeft = from === "left" ? "0%" : "100%";
  const endLeft = from === "left" ? "100%" : "0%";
  const dropLeft = "50%";

  const colorMap = {
    mint: "border-mint/30 bg-mint/10 text-mint",
    violet: "border-violet/30 bg-violet/10 text-violet",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-500",
    amber: "border-amber/30 bg-amber/10 text-amber",
  };

  return (
    <motion.div
      initial={{ left: startLeft, opacity: 0, x: "-50%", y: "-50%" }}
      animate={
        dropped
          ? { left: dropLeft, opacity: [0, 1, 0], scale: [1, 1, 0.5] }
          : { left: endLeft, opacity: [0, 1, 1, 0] }
      }
      transition={{
        duration: 1.8,
        ease: "linear",
        delay,
        times: dropped ? [0, 0.5, 1] : [0, 0.1, 0.9, 1],
      }}
      className={`absolute top-1/2 flex items-center justify-center h-8 px-3 rounded-full border shadow-sm backdrop-blur text-[10px] font-bold ${colorMap[color]} whitespace-nowrap`}
    >
      {label}
    </motion.div>
  );
}

function TcpAnimation({ trackStep }: { trackStep: number }) {
  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {trackStep === 1 && (
          <Packet
            key="syn"
            label={
              <>
                SYN <div className="ml-1 h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
              </>
            }
            from="left"
            color="mint"
          />
        )}

        {trackStep === 2 && (
          <Packet
            key="synack"
            label={
              <>
                <div className="mr-1 h-1.5 w-1.5 rounded-full bg-violet animate-pulse" /> SYN-ACK
              </>
            }
            from="right"
            color="violet"
          />
        )}

        {trackStep === 3 && (
          <Packet
            key="ack"
            label={
              <>
                ACK <CheckCircle2 className="ml-1 size-3" />
              </>
            }
            from="left"
            color="mint"
          />
        )}

        {trackStep === 4 && (
          <Packet
            key="chunk1"
            label={
              <>
                <FileIcon className="size-3 mr-1" /> Chunk 1
              </>
            }
            from="right"
            color="blue"
          />
        )}

        {trackStep === 5 && (
          <Packet
            key="ack1"
            label={
              <>
                ACK 1 <CheckCircle2 className="ml-1 size-3" />
              </>
            }
            from="left"
            color="mint"
          />
        )}

        {trackStep === 6 && (
          <Packet
            key="chunk2"
            label={
              <>
                <FileIcon className="size-3 mr-1" /> Chunk 2
              </>
            }
            from="right"
            color="blue"
          />
        )}

        {trackStep === 7 && (
          <Packet
            key="ack2"
            label={
              <>
                ACK 2 <CheckCircle2 className="ml-1 size-3" />
              </>
            }
            from="left"
            color="mint"
          />
        )}

        {trackStep === 8 && (
          <Packet
            key="chunk3"
            label={
              <>
                <FileIcon className="size-3 mr-1" /> Chunk 3
              </>
            }
            from="right"
            color="blue"
          />
        )}

        {trackStep === 9 && (
          <Packet
            key="ack3"
            label={
              <>
                ACK 3 <CheckCircle2 className="ml-1 size-3" />
              </>
            }
            from="left"
            color="mint"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UdpAnimation({ trackStep }: { trackStep: number }) {
  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {trackStep === 1 && (
          <>
            <Packet
              key="f1"
              label={
                <>
                  <Video className="size-3 mr-1" /> Frame 1
                </>
              }
              from="right"
              color="amber"
            />
            <Packet
              key="f2"
              label={
                <>
                  <Video className="size-3 mr-1" /> Frame 2
                </>
              }
              from="right"
              color="amber"
              delay={0.8}
            />
          </>
        )}

        {trackStep === 2 && (
          <>
            <Packet
              key="f3"
              label={
                <>
                  <Video className="size-3 mr-1" /> Frame 3
                </>
              }
              from="right"
              color="amber"
              dropped={true}
            />
            <Packet
              key="f4"
              label={
                <>
                  <Video className="size-3 mr-1" /> Frame 4
                </>
              }
              from="right"
              color="amber"
              delay={0.8}
            />
          </>
        )}

        {trackStep === 3 && (
          <>
            <Packet
              key="f5"
              label={
                <>
                  <Video className="size-3 mr-1" /> Frame 5
                </>
              }
              from="right"
              color="amber"
            />
            <Packet
              key="f6"
              label={
                <>
                  <Video className="size-3 mr-1" /> Frame 6
                </>
              }
              from="right"
              color="amber"
              delay={0.8}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
