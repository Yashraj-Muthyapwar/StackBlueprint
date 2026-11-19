import type { ReactNode } from "react";
import { motion } from "motion/react";
import { StoryPlayer } from "../CloudFrame";
import { Equals, FailOverlay, Flow, Server } from "./AvailabilityZoneVisuals";
import { LabelChip, Panel, Person, Pill, T, Tag, type Tone } from "./RegionsVisuals";

/* ---------------------------------------------------------------------
   Visuals for the High Availability and Fault Tolerance lesson.
   Static Tailwind classes only.
   --------------------------------------------------------------------- */

/** Shows a block between `from` and `to` seconds, then fades it out. */
function Timed({ from, to, children }: { from: number; to: number; children: ReactNode }) {
  const d = to - from + 0.4;
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ delay: from, duration: d, times: [0, 0.2 / d, (to - from + 0.2) / d, 1] }}>
      {children}
    </motion.g>
  );
}

/** A status line that changes from one text to another at `at` seconds. */
function Swap({ x, y, at, from, to, fromTone, toTone, anchor = "middle" }: { x: number; y: number; at: number; from: string; to: string; fromTone: Tone; toTone: Tone; anchor?: "start" | "middle" }) {
  return (
    <>
      <motion.text x={x} y={y} textAnchor={anchor} className={`${T[fromTone].text} font-mono text-[11px] font-bold`} initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ duration: at + 0.3, times: [0, at / (at + 0.3), 1] }}>
        {from}
      </motion.text>
      <motion.text x={x} y={y} textAnchor={anchor} className={`${T[toTone].text} font-mono text-[11px] font-bold`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: at }}>
        {to}
      </motion.text>
    </>
  );
}

function Status({ x, y, text, tone, anchor = "middle" }: { x: number; y: number; text: string; tone: Tone; anchor?: "start" | "middle" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={`${T[tone].text} font-mono text-[11px] font-bold`}>
      {text}
    </text>
  );
}

function Check({ cx, cy, delay = 0.4 }: { cx: number; cy: number; delay?: number }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 260, damping: 12 }}>
      <circle cx={cx} cy={cy} r="9" className="fill-mint/20 stroke-mint" strokeWidth="1.8" />
      <path d={`M${cx - 4.5} ${cy} l3.5 3.5 l6 -7`} className="fill-none stroke-mint" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  );
}

/* ======================================================================
   1. INTUITION: an airplane with backup systems
   ====================================================================== */

const PLANE_SCENES = [
  { label: "Redundancy", note: "Redundancy: Multiple systems can perform the same critical function." },
  { label: "Fault tolerance", note: "Fault tolerance: The airplane continues operating when a component fails." },
  { label: "Failover", note: "Failover: A backup system takes over after a failure." },
  { label: "High availability", note: "High availability: The overall service remains operational with minimal disruption." },
] as const;

function Plane({ x, y }: { x: number; y: number }) {
  return (
    <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
      <g transform={`translate(${x} ${y}) scale(1.5)`}>
        <path d="M0 -14 L3 -4 L16 2 L16 6 L3 3 L2 10 L6 13 L6 15 L0 14 L-6 15 L-6 13 L-2 10 L-3 3 L-16 6 L-16 2 L-3 -4 Z" className="fill-amber stroke-amber" strokeWidth="1" strokeLinejoin="round" />
      </g>
    </motion.g>
  );
}

function Unit({ x, y, letter, standby = false, pulseAt, delay = 0 }: { x: number; y: number; letter: string; standby?: boolean; pulseAt?: number; delay?: number }) {
  const tone: Tone = standby ? "muted" : "amber";
  return (
    <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={x} y={y} width="84" height="50" rx="9" className={T[tone].ink} strokeWidth="2" />
      <circle cx={x + 26} cy={y + 25} r="10" className={`fill-none ${T[tone].line}`} strokeWidth="2.2" strokeDasharray="4 3" />
      <circle cx={x + 26} cy={y + 25} r="3.2" className={T[tone].solid} />
      <text x={x + 58} y={y + 32} textAnchor="middle" className={`${T[tone].text} font-mono text-[20px] font-bold`}>{letter}</text>
      {pulseAt !== undefined ? (
        <motion.rect x={x - 3} y={y - 3} width="90" height="56" rx="11" className="fill-none stroke-amber" strokeWidth="2.4" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 1, 0] }} transition={{ delay: pulseAt, duration: 1.6 }} />
      ) : null}
    </motion.g>
  );
}

function PlaneScene({ s }: { s: number }) {
  const aFail = s >= 1;
  const bActive = s >= 2;
  const LA = "M160 98 L100 122";
  const LB = "M160 98 L220 122";
  const RA = "M480 106 L420 122";
  const RB = "M480 106 L540 122";
  const line = (d: string, cls: string, delay: number) => (
    <motion.path d={d} className={`fill-none ${cls}`} strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay, duration: 0.4 }} />
  );
  const chips = ["Redundancy", "Fault tolerance", "Failover", "High availability"];
  const pills = ["Backup systems exist before anything fails", "A component fails and the service keeps operating", "The backup takes over", "Minimal disruption for the whole service"];
  return (
    <g>
      <Panel x={12} title="Airplane" tone="amber" />
      <Panel x={332} title="AWS" tone="mint" />
      <Equals k={s} />

      {/* airplane side */}
      <Plane x={160} y={74} />
      {line(LA, aFail ? "stroke-red-500/60" : "stroke-amber", 0.3)}
      {line(LB, bActive ? "stroke-amber" : "stroke-muted-foreground/40", 0.4)}
      {!aFail ? <Flow d={LA} tone="amber" count={2} dur={1.3} delay={0.8} /> : null}
      {bActive ? <Flow d={LB} tone="amber" count={2} dur={1.3} delay={s === 2 ? 1.6 : 0.8} /> : null}
      <Unit x={58} y={122} letter="A" delay={0.2} />
      <Unit x={178} y={122} letter="B" standby={!bActive} pulseAt={s === 2 ? 0.9 : undefined} delay={0.35} />
      {aFail ? <FailOverlay x={58} y={122} w={84} h={50} delay={0.8} /> : null}
      <Status x={100} y={190} text={aFail ? "System A: Failed" : "System A: Active"} tone={aFail ? "red" : "amber"} />
      {s === 2 ? (
        <Swap x={220} y={190} at={0.9} from="System B: Standby" to="System B: Active" fromTone="muted" toTone="amber" />
      ) : (
        <Status x={220} y={190} text={bActive ? "System B: Active" : "System B: Standby"} tone={bActive ? "amber" : "muted"} />
      )}

      {/* AWS side */}
      {[456, 480, 504].map((x, i) => (
        <Person key={x} x={x} y={88} tone="amber" delay={i * 0.2} />
      ))}
      {line(RA, aFail ? "stroke-red-500/60" : "stroke-mint", 0.3)}
      {line(RB, bActive ? "stroke-mint" : "stroke-muted-foreground/40", 0.4)}
      {!aFail ? <Flow d={RA} tone="mint" count={2} dur={1.3} delay={0.8} /> : null}
      {bActive ? <Flow d={RB} tone="mint" count={2} dur={1.3} delay={s === 2 ? 1.6 : 0.8} /> : null}
      <Server x={378} y={122} w={84} h={50} tone="mint" delay={0.2} />
      <Server x={498} y={122} w={84} h={50} tone={bActive ? "mint" : "muted"} delay={0.35} />
      {aFail ? <FailOverlay x={378} y={122} w={84} h={50} delay={0.8} /> : null}
      <Status x={420} y={190} text={aFail ? "EC2 A: Failed" : "EC2 A: Active"} tone={aFail ? "red" : "mint"} />
      {s === 2 ? (
        <Swap x={540} y={190} at={0.9} from="EC2 B: Standby" to="EC2 B: Active" fromTone="muted" toTone="mint" />
      ) : (
        <Status x={540} y={190} text={bActive ? "EC2 B: Active" : "EC2 B: Standby"} tone={bActive ? "mint" : "muted"} />
      )}

      {s === 3 ? (
        <g>
          <Check cx={196} cy={64} delay={0.6} />
          <Check cx={516} cy={74} delay={0.8} />
        </g>
      ) : null}

      <LabelChip cx={160} y={208} text={chips[s]} tone="amber" />
      <LabelChip cx={480} y={208} text={chips[s]} tone="mint" />
      <Pill x={320} y={262} w={470} text={pills[s]} tone="mint" delay={1.2} />
    </g>
  );
}

export function AirplaneHaVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={PLANE_SCENES} viewBox="0 0 640 302" sceneMs={8500} render={(s) => <PlaneScene s={s} />} />;
}

/* ======================================================================
   2. HOW: a common high-availability design
   ====================================================================== */

const HOW_SCENES = [
  { label: "1. Multiple AZs", note: "EC2 instances run in multiple Availability Zones." },
  { label: "2. Load balancer", note: "An Application Load Balancer (ALB) receives customer requests and spreads them across the instances." },
  { label: "3. Health checks", note: "Health checks identify unhealthy instances, so the load balancer stops sending requests to them." },
  { label: "4. Healthy capacity", note: "Sufficient healthy capacity must remain to handle requests during failures." },
] as const;

const R_A1 = "M222 160 H290 V92 H360";
const R_A2 = "M222 160 H290 V58 H515 V70";
const R_B1 = "M222 160 H290 V222 H360";
const R_B2 = "M222 160 H290 V190 H515 V200";

function Inst({ x, y, bad = false, failAt = 0.7, swap = false, checkAt, delay = 0 }: { x: number; y: number; bad?: boolean; failAt?: number; swap?: boolean; checkAt?: number; delay?: number }) {
  return (
    <g>
      <Server x={x} y={y} w={70} h={44} tone="mint" delay={delay} />
      <text x={x + 84} y={y + 20} className="fill-foreground/80 text-[11.5px]">EC2</text>
      {bad && swap ? <Swap x={x} y={y + 62} at={failAt} from="Healthy" to="Unhealthy" fromTone="mint" toTone="red" anchor="start" /> : <Status x={x} y={y + 62} text={bad ? "Unhealthy" : "Healthy"} tone={bad ? "red" : "mint"} anchor="start" />}
      {bad ? <FailOverlay x={x} y={y} w={70} h={44} rx={7} delay={failAt} /> : null}
      {checkAt !== undefined ? <Check cx={x + 78} cy={y + 8} delay={checkAt} /> : null}
    </g>
  );
}

function AzBox({ y, label, delay }: { y: number; label: string; delay: number }) {
  return (
    <motion.g initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
      <rect x="340" y={y} width="268" height="116" rx="12" className={`${T.mint.box} fill-background/60`} strokeWidth="2" strokeDasharray="5 4" />
      <text x="356" y={y + 18} className="fill-foreground font-mono text-[12px] font-bold">{label}</text>
    </motion.g>
  );
}

function HowScene({ s }: { s: number }) {
  const a1Bad = s >= 2;
  const a2Bad = s === 3;
  const pills = ["Instances spread across Availability Zones", "The load balancer spreads requests across instances", "Health checks find the unhealthy instance", "Enough healthy capacity must remain"];
  const route = (d: string, bad: boolean, delay: number, turnAt?: number) => (
    <g>
      {turnAt !== undefined ? (
        <>
          <motion.path d={d} className="fill-none stroke-mint" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }} transition={{ pathLength: { delay, duration: 0.7 }, opacity: { duration: turnAt + 0.3, times: [0, turnAt / (turnAt + 0.3), 1] } }} />
          <motion.path d={d} className="fill-none stroke-red-500/60" strokeWidth="2" strokeDasharray="5 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: turnAt }} />
        </>
      ) : (
        <motion.path d={d} className={`fill-none ${bad ? "stroke-red-500/60" : "stroke-mint"}`} strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay, duration: 0.7 }} />
      )}
    </g>
  );
  return (
    <g>
      {/* customers and load balancer */}
      {s >= 1 ? (
        <g>
          {[0, 1, 2].map((i) => (
            <Person key={i} x={34 + i * 24} y={166} tone="amber" delay={i * 0.2} />
          ))}
          <text x="58" y="194" textAnchor="middle" className="fill-amber font-mono text-[10px] font-bold uppercase tracking-wider">Customers</text>
          <motion.path d="M100 160 H128" className="fill-none stroke-amber" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />
          <motion.g initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.2, type: "spring", stiffness: 160, damping: 14 }}>
            <rect x="128" y="126" width="94" height="68" rx="10" className={T.amber.ink} strokeWidth="2.2" />
            <text x="175" y="156" textAnchor="middle" className="fill-amber font-mono text-[10.5px] font-bold">Application</text>
            <text x="175" y="171" textAnchor="middle" className="fill-amber font-mono text-[10.5px] font-bold">Load Balancer</text>
          </motion.g>
        </g>
      ) : null}

      <AzBox y={30} label="AZ A" delay={0.1} />
      <AzBox y={160} label="AZ B" delay={0.3} />
      <Inst x={360} y={70} bad={a1Bad} swap={s === 2} failAt={s === 2 ? 3.4 : 0.7} checkAt={s === 2 ? 1 : undefined} delay={0.4} />
      <Inst x={480} y={70} bad={a2Bad} checkAt={s === 2 ? 1.3 : undefined} delay={0.55} />
      <Inst x={360} y={200} checkAt={s === 2 ? 1.6 : undefined} delay={0.7} />
      <Inst x={480} y={200} checkAt={s === 2 ? 1.9 : undefined} delay={0.85} />

      {/* routes */}
      {s >= 1 ? (
        <g>
          {route(R_A1, s === 3, 0.4, s === 2 ? 3.4 : undefined)}
          {route(R_A2, a2Bad, 0.5)}
          {route(R_B1, false, 0.6)}
          {route(R_B2, false, 0.7)}
          <Flow d="M100 160 H128" tone="amber" count={3} dur={1.2} delay={1} />
          {s === 1 ? <Flow d={R_A1} count={1} dur={2.4} delay={1.2} /> : null}
          {s === 2 ? <Flow d={R_A1} count={2} dur={1.6} delay={0.5} once /> : null}
          {s === 1 ? <Flow d={R_A2} count={1} dur={3} delay={1.4} /> : null}
          {s === 2 ? <Flow d={R_A2} count={1} dur={3} delay={1.4} /> : null}
          <Flow d={R_B1} count={s === 3 ? 3 : 1} dur={2.4} delay={1.6} />
          <Flow d={R_B2} count={s === 3 ? 3 : 1} dur={3} delay={1.8} />
        </g>
      ) : null}
      {s === 2 ? (
        <Timed from={0.4} to={3.3}>
          <Tag x={175} y={108} text="Health checks" tone="amber" delay={0} />
        </Timed>
      ) : null}
      {s === 3 ? (
        <g>
          <Tag x={560} y={48} text="AZ A fails" tone="red" delay={0.9} />
          <Tag x={100} y={232} text="Needs 2 instances" tone="amber" delay={1.2} />
          <Tag x={100} y={258} text="2 healthy remain" tone="mint" delay={1.8} />
        </g>
      ) : null}

      <Pill x={320} y={292} w={440} text={pills[s]} tone={s === 3 ? "mint" : "amber"} delay={1.4} />
    </g>
  );
}

export function HaHowVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={HOW_SCENES} viewBox="0 0 640 322" sceneMs={9000} render={(s) => <HowScene s={s} />} />;
}

/* ======================================================================
   3. EXAMPLE: an e-commerce application with two instances
   ====================================================================== */

const EX_SCENES = [
  { label: "Two instances", note: "An e-commerce application has two EC2 instances in different AZs." },
  { label: "Failure detected", note: "One instance fails. The load balancer detects that it is unhealthy." },
  { label: "Rerouted", note: "Requests are directed to the healthy instance." },
  { label: "Replacement", note: "EC2 Auto Scaling can launch replacement capacity when configured appropriately." },
] as const;

const E_A = "M250 150 C300 150 310 95 360 95";
const E_B = "M250 150 C300 150 310 227 360 227";

function ExampleScene({ s }: { s: number }) {
  const aDown = s === 1 || s === 2;
  const pills = ["Two instances, two Availability Zones", "The load balancer sees an unhealthy instance", "Traffic goes to the healthy instance", "Replacement capacity restores redundancy"];
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <Person key={i} x={34 + i * 24} y={156} tone="amber" delay={i * 0.2} />
      ))}
      <text x="58" y="184" textAnchor="middle" className="fill-amber font-mono text-[10px] font-bold uppercase tracking-wider">Customers</text>
      <motion.path d="M112 150 H140" className="fill-none stroke-amber" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />
      <motion.g initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.2, type: "spring", stiffness: 160, damping: 14 }}>
        <rect x="140" y="116" width="110" height="68" rx="10" className={T.amber.ink} strokeWidth="2.2" />
        <text x="195" y="146" textAnchor="middle" className="fill-amber font-mono text-[11px] font-bold">Application</text>
        <text x="195" y="162" textAnchor="middle" className="fill-amber font-mono text-[11px] font-bold">Load Balancer</text>
      </motion.g>

      {/* Auto Scaling group */}
      <motion.rect x="330" y="22" width="288" height="276" rx="16" className={`fill-none ${T.amber.line}`} strokeWidth="1.8" strokeDasharray="2 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} />
      <Tag x={474} y={14} text="Auto Scaling group" tone="amber" delay={0.3} />

      {/* AZ A */}
      <motion.g initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <rect x="340" y="36" width="268" height="116" rx="12" className={`${T.mint.box} fill-background/60`} strokeWidth="2" strokeDasharray="5 4" />
        <text x="356" y="56" className="fill-foreground font-mono text-[12px] font-bold">AZ A</text>
      </motion.g>
      <Server x={360} y={70} tone="mint" delay={0.6} />
      <text x="444" y="92" className="fill-foreground/80 text-[12px]">EC2 instance</text>
      {s === 3 ? (
        <Swap x={444} y={112} at={1.6} from="Replacing" to="Healthy" fromTone="amber" toTone="mint" anchor="start" />
      ) : (
        <Status x={444} y={112} text={aDown ? "Unhealthy" : "Healthy"} tone={aDown ? "red" : "mint"} anchor="start" />
      )}
      {aDown ? <FailOverlay x={340} y={36} w={268} h={116} rx={12} delay={0.7} bx={395} by={95} /> : null}
      {s === 3 ? (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ delay: 0.3, duration: 1.8, times: [0, 0.15, 0.8, 1] }}>
          <rect x="356" y="64" width="78" height="56" rx="9" className="fill-none stroke-amber" strokeWidth="2.2" strokeDasharray="4 3" />
          <Tag x={395} y={134} text="New instance" tone="amber" delay={0} />
        </motion.g>
      ) : null}

      {/* AZ B */}
      <motion.g initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        <rect x="340" y="168" width="268" height="116" rx="12" className={`${T.mint.box} fill-background/60`} strokeWidth="2" strokeDasharray="5 4" />
        <text x="356" y="188" className="fill-foreground font-mono text-[12px] font-bold">AZ B</text>
      </motion.g>
      <Server x={360} y={202} tone="mint" delay={0.8} />
      <text x="444" y="224" className="fill-foreground/80 text-[12px]">EC2 instance</text>
      <Status x={444} y={244} text="Healthy" tone="mint" anchor="start" />

      {/* routes */}
      <motion.path d={E_A} className={`fill-none ${aDown ? "stroke-red-500/60" : "stroke-mint"}`} strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.7 }} />
      <motion.path d={E_B} className="fill-none stroke-mint" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.7 }} />
      <Flow d="M112 150 H140" tone="amber" count={s === 0 ? 3 : 4} dur={1.2} delay={1} />
      {s === 0 ? <Flow d={E_A} count={2} dur={2} delay={1.2} /> : null}
      {s === 1 ? <Flow d={E_A} count={1} dur={1.8} delay={0.4} once /> : null}
      {s === 3 ? <Flow d={E_A} count={2} dur={2} delay={2.4} /> : null}
      <Flow d={E_B} count={s === 0 ? 2 : 4} dur={s === 0 ? 2 : 2.4} delay={1.4} />
      {s === 1 ? (
        <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 1.4, type: "spring", stiffness: 220, damping: 13 }}>
          <rect x="262" y="82" width="70" height="20" rx="6" className="fill-background/90" />
          <rect x="262" y="82" width="70" height="20" rx="6" className={T.red.pill} />
          <text x="297" y="96" textAnchor="middle" className="fill-red-500 font-mono text-[10px] font-bold uppercase tracking-wider">Unhealthy</text>
        </motion.g>
      ) : null}
      {s === 2 ? (
        <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.8, type: "spring", stiffness: 220, damping: 13 }}>
          <rect x="268" y="82" width="62" height="20" rx="6" className="fill-background/90" />
          <rect x="268" y="82" width="62" height="20" rx="6" className={T.red.pill} />
          <text x="299" y="96" textAnchor="middle" className="fill-red-500 font-mono text-[10px] font-bold uppercase tracking-wider">Skipped</text>
        </motion.g>
      ) : null}
      {s === 2 ? <Check cx={58} cy={124} delay={1.6} /> : null}

      <Pill x={320} y={304} w={440} text={pills[s]} tone={s === 1 ? "red" : s === 3 ? "mint" : "amber"} delay={1.4} />
    </g>
  );
}

export function HaExampleVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={EX_SCENES} viewBox="0 0 640 334" sceneMs={9000} render={(s) => <ExampleScene s={s} />} />;
}

/* ======================================================================
   4. EXAMPLE: active-active and active-passive
   ====================================================================== */

const MODE_SCENES = [
  { label: "Active-active", note: "Active-active: Multiple resources serve traffic simultaneously." },
  { label: "One fails", note: "The other resource is already serving traffic, so service continues. This needs coordination and capacity planning." },
  { label: "Active-passive", note: "Active-passive: One resource serves traffic while another waits to take over." },
  { label: "Failover", note: "When the active resource fails, the standby takes over. Failover may introduce downtime." },
] as const;

const M1 = "M112 156 C240 156 280 94 396 94";
const M2 = "M112 156 C240 156 280 218 396 218";

function ModesScene({ s }: { s: number }) {
  const passive = s >= 2;
  const s1Fail = s === 1 || s === 3;
  const pills = ["Both resources serve traffic", "The other keeps serving without a pause", "One serves, one waits", "Failover may introduce downtime"];
  const tag = ["Active-active", "Active-active", "Active-passive", "Active-passive"][s];
  return (
    <g>
      <LabelChip cx={320} y={8} text={tag} tone={passive ? "amber" : "mint"} />

      {[0, 1, 2].map((i) => (
        <Person key={i} x={40 + i * 24} y={162} tone="amber" delay={i * 0.2} />
      ))}
      <text x="64" y="190" textAnchor="middle" className="fill-amber font-mono text-[10px] font-bold uppercase tracking-wider">Users</text>

      {/* paths */}
      <motion.path d={M1} className={`fill-none ${s1Fail ? "stroke-red-500/60" : "stroke-mint"}`} strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.7 }} />
      <motion.path d={M2} className={`fill-none ${s === 2 ? "stroke-muted-foreground/40" : "stroke-mint"}`} strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.7 }} />
      {s === 0 ? (
        <g>
          <Flow d={M1} count={3} dur={2.2} delay={1} />
          <Flow d={M2} count={3} dur={2.2} delay={1.1} />
        </g>
      ) : null}
      {s === 1 ? <Flow d={M2} count={5} dur={2.2} delay={1} /> : null}
      {s === 2 ? <Flow d={M1} count={3} dur={2.2} delay={1} /> : null}
      {s === 3 ? (
        <g>
          <Flow d={M1} count={2} dur={1.4} delay={0.2} once />
          <Flow d={M2} count={3} dur={2.2} delay={4.2} />
        </g>
      ) : null}

      {/* server 1 */}
      <Server x={396} y={66} w={112} h={56} tone="mint" delay={0.3} />
      <text x="526" y="86" className="fill-foreground/80 text-[12px]">Server 1</text>
      <Status x={526} y={106} text={s1Fail ? "Failed" : "Active"} tone={s1Fail ? "red" : "mint"} anchor="start" />
      {s1Fail ? <FailOverlay x={396} y={66} w={112} h={56} delay={s === 3 ? 1.2 : 0.8} /> : null}

      {/* server 2 */}
      {s === 3 ? (
        <>
          <motion.g initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ duration: 4.3, times: [0, 0.93, 1] }}>
            <Server x={396} y={190} w={112} h={56} tone="muted" delay={0.5} />
          </motion.g>
          <Server x={396} y={190} w={112} h={56} tone="mint" delay={4.2} />
        </>
      ) : (
        <Server x={396} y={190} w={112} h={56} tone={s === 2 ? "muted" : "mint"} delay={0.5} />
      )}
      <text x="526" y="210" className="fill-foreground/80 text-[12px]">Server 2</text>
      {s === 3 ? (
        <Swap x={526} y={230} at={4.2} from="Standby" to="Active" fromTone="muted" toTone="mint" anchor="start" />
      ) : (
        <Status x={526} y={230} text={s === 2 ? "Standby" : "Active"} tone={s === 2 ? "muted" : "mint"} anchor="start" />
      )}

      {s === 1 ? <Tag x={260} y={156} text="No interruption" tone="mint" delay={1.6} /> : null}
      {s === 3 ? (
        <Timed from={1.8} to={4.1}>
          <Tag x={260} y={156} text="Possible downtime" tone="red" delay={0} />
        </Timed>
      ) : null}

      <Pill x={320} y={262} w={420} text={pills[s]} tone={s === 3 ? "red" : "mint"} delay={1.4} />
    </g>
  );
}

export function HaModesVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={MODE_SCENES} viewBox="0 0 640 302" sceneMs={9500} render={(s) => <ModesScene s={s} />} />;
}
