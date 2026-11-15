import { motion } from "motion/react";
import { StoryPlayer } from "./CloudFrame";

/* ---------------------------------------------------------------------
   1. INTUITION: buying a car versus renting a car
   --------------------------------------------------------------------- */

const CAR_SCENES = [
  { label: "Buy a car", note: "Traditional IT: buying a car. You purchase and maintain it even when you are not using it." },
  { label: "Rent a car", note: "Cloud Computing: renting a car. You use it when needed and pay according to the rental agreement." },
  { label: "Over a week", note: "The cloud provides flexibility without requiring you to own the underlying infrastructure." },
] as const;

function Car({ tone, x, y, scale = 1, moving = false, lights = false }: { tone: "amber" | "mint"; x: number; y: number; scale?: number; moving?: boolean; lights?: boolean }) {
  const body = tone === "amber" ? "fill-amber/30 stroke-amber" : "fill-mint/30 stroke-mint";
  const wheel = (cx: number) => (
    <g>
      <circle cx={cx} cy="42" r="10" className="fill-surface-2 stroke-foreground/70" strokeWidth="2.5" />
      <motion.g style={{ transformOrigin: `${cx}px 42px` }} animate={moving ? { rotate: 360 } : { rotate: 0 }} transition={moving ? { duration: 0.5, repeat: Infinity, ease: "linear" } : undefined}>
        <line x1={cx - 7} y1="42" x2={cx + 7} y2="42" className="stroke-foreground/50" strokeWidth="2" />
        <line x1={cx} y1="35" x2={cx} y2="49" className="stroke-foreground/50" strokeWidth="2" />
      </motion.g>
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="48" cy="54" rx="46" ry="4" className="fill-foreground/10" />
      <path d="M2 38 Q2 28 11 26 L21 11 Q25 5 33 5 H60 Q68 5 74 11 L84 24 Q96 26 96 36 V44 H2 Z" className={body} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M24 13 Q27 9 33 9 H44 V24 H17 Z" className="fill-background/75" />
      <path d="M49 9 H59 Q64 9 68 13 L76 24 H49 Z" className="fill-background/75" />
      <rect x="2" y="32" width="5" height="5" rx="2" className="fill-red-500/70" />
      <circle cx="91" cy="32" r="3.2" className={lights ? "fill-amber" : "fill-muted-foreground/50"} />
      {lights ? <path d="M94 29 L120 20 V44 L94 35 Z" className="fill-amber/20" /> : null}
      {wheel(24)}
      {wheel(74)}
    </g>
  );
}

function CostMeter({ tone, label, times, widths, duration = 8 }: { tone: "amber" | "mint"; label: string; times: number[]; widths: string[]; duration?: number }) {
  return (
    <g>
      <text x="26" y="267" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider">{label}</text>
      <rect x="150" y="258" width="456" height="11" rx="5.5" className="fill-surface-2 stroke-hairline" />
      <motion.rect x="150" y="258" height="11" rx="5.5" className={tone === "amber" ? "fill-amber" : "fill-mint"}
        initial={{ width: "0%" }} animate={{ width: widths }} transition={{ duration, repeat: Infinity, times, ease: "linear" }} />
    </g>
  );
}

function Coin({ x, delay }: { x: number; delay: number }) {
  return (
    <motion.g animate={{ y: [0, 70], opacity: [0, 1, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay, ease: "easeIn", times: [0, 0.15, 0.8, 1] }}>
      <circle cx={x} cy={60} r="9" className="fill-amber/30 stroke-amber" strokeWidth="1.8" />
      <text x={x} y={64} textAnchor="middle" className="fill-amber font-mono text-[11px] font-bold">$</text>
    </motion.g>
  );
}

function BuyScene() {
  return (
    <g>
      <line x1="20" y1="226" x2="620" y2="226" className="stroke-hairline" strokeWidth="2" />
      {/* house + driveway */}
      <path d="M60 226 V120 L150 62 L240 120 V226" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="126" y="162" width="48" height="64" rx="3" className="fill-background/60 stroke-muted-foreground/50" strokeWidth="1.5" />
      <rect x="86" y="132" width="26" height="26" rx="2" className="fill-amber/25 stroke-muted-foreground/50" strokeWidth="1.5" />
      <rect x="188" y="132" width="26" height="26" rx="2" className="fill-amber/25 stroke-muted-foreground/50" strokeWidth="1.5" />
      <rect x="250" y="218" width="250" height="8" rx="3" className="fill-surface-2" />
      {/* parked car */}
      <Car tone="amber" x={296} y={156} scale={1.3} />
      <motion.g animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "302px 128px" }}>
        <line x1="302" y1="128" x2="302" y2="150" className="stroke-muted-foreground/60" strokeWidth="1.5" />
        <rect x="278" y="106" width="48" height="22" rx="5" className="fill-amber/20 stroke-amber/70" />
        <text x="302" y="121" textAnchor="middle" className="fill-amber font-mono text-[9px] font-bold uppercase">Bought</text>
      </motion.g>
      {[0, 1, 2].map((i) => (
        <motion.text key={i} x={410 + i * 10} y={170} className="fill-muted-foreground font-mono text-[14px] font-bold"
          animate={{ y: [170, 118], opacity: [0, 1, 0] }} transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.9 }}>z</motion.text>
      ))}
      <Coin x={470} delay={0} /><Coin x={520} delay={0.8} /><Coin x={570} delay={1.6} />
      <text x="440" y="44" className="fill-amber font-mono text-[10px] uppercase tracking-wider">Insurance and repairs</text>
      <CostMeter tone="amber" label="Cost over time" times={[0, 1]} widths={["0%", "100%"]} />
      <text x="320" y="246" textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-[0.14em]">Idle in the driveway, the cost keeps running</text>
    </g>
  );
}

function RentScene() {
  const T = [0, 0.22, 0.7, 0.92, 1];
  return (
    <g>
      {/* sky and hills scroll while the car drives */}
      <motion.g animate={{ x: [0, 0, -140, -140, 0] }} transition={{ duration: 8, repeat: Infinity, times: T, ease: "easeInOut" }}>
        <path d="M-200 214 Q-60 140 80 214 Q200 120 340 214 Q470 150 600 214 Q720 130 860 214 Z" className="fill-mint/10" />
      </motion.g>
      <motion.g animate={{ x: [0, 0, -280, -280, 0] }} transition={{ duration: 8, repeat: Infinity, times: T, ease: "easeInOut" }}>
        <path d="M60 64 a14 14 0 0 1 26 -6 a11 11 0 0 1 17 9 H64 a9 9 0 0 1 -4 -3 Z" className="fill-foreground/10" />
        <path d="M360 84 a14 14 0 0 1 26 -6 a11 11 0 0 1 17 9 H364 a9 9 0 0 1 -4 -3 Z" className="fill-foreground/10" />
        <path d="M560 52 a14 14 0 0 1 26 -6 a11 11 0 0 1 17 9 H564 a9 9 0 0 1 -4 -3 Z" className="fill-foreground/10" />
      </motion.g>
      <rect x="20" y="200" width="600" height="30" className="fill-surface-2" />
      <motion.line x1="20" y1="215" x2="620" y2="215" className="stroke-muted-foreground/50" strokeWidth="2" strokeDasharray="16 14"
        animate={{ strokeDashoffset: [0, -60] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      {/* rental office slides away and back */}
      <motion.g animate={{ x: [0, -260, -260, 0, 0] }} transition={{ duration: 8, repeat: Infinity, times: [0, 0.3, 0.7, 0.92, 1], ease: "easeInOut" }}>
        <rect x="40" y="130" width="116" height="76" rx="4" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="2" />
        <rect x="40" y="120" width="116" height="14" rx="3" className="fill-mint/70" />
        <text x="98" y="164" textAnchor="middle" className="fill-foreground font-mono text-[11px] font-semibold uppercase tracking-wider">Rental</text>
        <text x="98" y="182" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px] uppercase tracking-wider">on demand</text>
      </motion.g>
      {/* the car */}
      <motion.g animate={{ y: [0, 0, -1.5, 0, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>
        <Car tone="mint" x={250} y={158} scale={1.3} moving lights />
      </motion.g>
      {/* tags */}
      <motion.g animate={{ opacity: [0, 1, 1, 0, 0], y: [8, 0, 0, 8, 8] }} transition={{ duration: 8, repeat: Infinity, times: [0.18, 0.28, 0.66, 0.74, 1] }}>
        <rect x="440" y="62" width="120" height="26" rx="13" className="fill-mint/15 stroke-mint/70" />
        <text x="500" y="79" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold uppercase">Pay for use</text>
      </motion.g>
      <motion.g animate={{ opacity: [0, 0, 1, 1, 0], y: [8, 8, 0, 0, 8] }} transition={{ duration: 8, repeat: Infinity, times: [0, 0.8, 0.88, 0.98, 1] }}>
        <rect x="440" y="100" width="120" height="26" rx="13" className="fill-mint/15 stroke-mint/70" />
        <text x="500" y="117" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold uppercase">Returned</text>
      </motion.g>
      <CostMeter tone="mint" label="Cost over time" times={[0, 0.22, 0.7, 0.92, 1]} widths={["0%", "0%", "34%", "34%", "34%"]} />
      <text x="320" y="246" textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-[0.14em]">Cost only moves while you use it</text>
    </g>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const USED = new Set([1, 4]);

function WeekScene() {
  const colX = (i: number) => 164 + i * 60;
  return (
    <g>
      {DAYS.map((d, i) => (
        <text key={d} x={colX(i) + 24} y="26" textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-wider">{d}</text>
      ))}
      <text x="22" y="72" className="fill-amber font-mono text-[12px] font-semibold uppercase tracking-wider">Own it</text>
      <text x="22" y="88" className="fill-muted-foreground font-mono text-[9px] uppercase tracking-wider">Traditional IT</text>
      <text x="22" y="148" className="fill-mint font-mono text-[12px] font-semibold uppercase tracking-wider">Rent it</text>
      <text x="22" y="164" className="fill-muted-foreground font-mono text-[9px] uppercase tracking-wider">Cloud</text>
      {DAYS.map((_, i) => {
        const used = USED.has(i);
        return (
          <g key={i}>
            <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i, type: "spring", stiffness: 200, damping: 16 }}>
              <rect x={colX(i)} y="38" width="48" height="56" rx="9" className="fill-amber/15 stroke-amber/70" strokeWidth="1.5" />
              <Car tone="amber" x={colX(i) + 5} y={50} scale={0.34} />
              <text x={colX(i) + 24} y="88" textAnchor="middle" className="fill-amber font-mono text-[11px] font-bold">$</text>
            </motion.g>
            <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 + 0.12 * i, type: "spring", stiffness: 200, damping: 16 }}>
              <rect x={colX(i)} y="114" width="48" height="56" rx="9" className={used ? "fill-mint/20 stroke-mint" : "fill-none stroke-hairline"} strokeWidth="1.5" strokeDasharray={used ? undefined : "4 4"} />
              {used ? (
                <>
                  <motion.g animate={{ x: [0, 3, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    <Car tone="mint" x={colX(i) + 5} y={126} scale={0.34} moving />
                  </motion.g>
                  <text x={colX(i) + 24} y="164" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold">$</text>
                </>
              ) : (
                <text x={colX(i) + 24} y="148" textAnchor="middle" className="fill-muted-foreground/50 font-mono text-[11px]">no cost</text>
              )}
            </motion.g>
          </g>
        );
      })}
      {/* totals */}
      <text x="22" y="204" className="fill-amber font-mono text-[10px] uppercase tracking-wider">Pay every day</text>
      <rect x="164" y="193" width="420" height="12" rx="6" className="fill-surface-2 stroke-hairline" />
      <motion.rect x="164" y="193" height="12" rx="6" className="fill-amber" initial={{ width: 0 }} animate={{ width: 420 }} transition={{ delay: 1.2, duration: 1.6, ease: "easeOut" }} />
      <text x="22" y="230" className="fill-mint font-mono text-[10px] uppercase tracking-wider">Pay days used</text>
      <rect x="164" y="219" width="420" height="12" rx="6" className="fill-surface-2 stroke-hairline" />
      <motion.rect x="164" y="219" height="12" rx="6" className="fill-mint" initial={{ width: 0 }} animate={{ width: 420 * (2 / 7) }} transition={{ delay: 2.8, duration: 1.2, ease: "easeOut" }} />
    </g>
  );
}

export function CarAnalogyVisual({ caption }: { caption: string }) {
  return (
    <StoryPlayer
      caption={caption}
      scenes={CAR_SCENES}
      viewBox="0 0 640 285"
      sceneMs={8000}
      render={(s) => (s === 0 ? <BuyScene /> : s === 1 ? <RentScene /> : <WeekScene />)}
    />
  );
}

/* ---------------------------------------------------------------------
   2. HOW: two workflows side by side, each step illustrated
   --------------------------------------------------------------------- */

const FLOW_SCENES = [
  { label: "Step 1", note: "Traditional IT starts by purchasing hardware. Cloud computing starts by requesting resources." },
  { label: "Step 2", note: "Traditional IT installs and configures the hardware. In the cloud, you configure and deploy." },
  { label: "Step 3", note: "Traditional IT maintains the hardware. In the cloud, you adjust capacity when needed." },
] as const;

const TRAD_STEPS = ["Purchase hardware", "Install and configure", "Maintain hardware"];
const CLOUD_STEPS = ["Request resources", "Configure and deploy", "Adjust capacity"];

function PanelFrame({ ox, tone, title, steps, active }: { ox: number; tone: "amber" | "mint"; title: string; steps: string[]; active: number }) {
  const stroke = tone === "amber" ? "stroke-amber" : "stroke-mint";
  const fill = tone === "amber" ? "fill-amber" : "fill-mint";
  const text = tone === "amber" ? "fill-amber" : "fill-mint";
  return (
    <g>
      <rect x={ox} y="10" width="296" height="250" rx="14" className={`fill-none ${tone === "amber" ? "stroke-amber/40" : "stroke-mint/40"}`} />
      <text x={ox + 148} y="34" textAnchor="middle" className={`${text} font-mono text-[12px] font-semibold uppercase tracking-[0.14em]`}>{title}</text>
      {/* step tracker */}
      {steps.map((_, i) => {
        const cx = ox + 62 + i * 86;
        const state = i === active ? "active" : i < active ? "done" : "todo";
        return (
          <g key={i}>
            {i > 0 ? <line x1={cx - 86 + 11} y1="54" x2={cx - 11} y2="54" className={i <= active ? stroke : "stroke-hairline"} strokeWidth="2" /> : null}
            <circle cx={cx} cy="54" r="11" className={state === "todo" ? "fill-none stroke-hairline" : `${fill}/20 ${stroke}`} strokeWidth="2" />
            {state === "active" ? <motion.circle cx={cx} cy="54" r="11" className={`fill-none ${stroke}`} animate={{ scale: [1, 1.6], opacity: [0.7, 0] }} style={{ transformOrigin: `${cx}px 54px` }} transition={{ duration: 1.4, repeat: Infinity }} /> : null}
            <text x={cx} y="58" textAnchor="middle" className={`font-mono text-[11px] font-bold ${state === "todo" ? "fill-muted-foreground" : text}`}>{state === "done" ? "✓" : i + 1}</text>
          </g>
        );
      })}
      <motion.text key={`${title}-${active}`} x={ox + 148} y="244" textAnchor="middle" className="fill-foreground font-mono text-[12px] font-semibold uppercase tracking-wider"
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        {steps[active]}
      </motion.text>
      <line x1={ox + 20} y1="226" x2={ox + 276} y2="226" className="stroke-hairline" />
    </g>
  );
}

/* --- traditional illustrations --- */
function TruckScene({ ox }: { ox: number }) {
  return (
    <g transform={`translate(${ox} 0)`}>
      <line x1="16" y1="196" x2="280" y2="196" className="stroke-hairline" strokeWidth="2" />
      <rect x="196" y="128" width="84" height="68" rx="4" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="2" />
      <text x="238" y="120" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px] uppercase tracking-wider">Your data center</text>
      <rect x="222" y="160" width="28" height="36" className="fill-background/60 stroke-muted-foreground/50" />
      <motion.g animate={{ x: [-190, 20, 20, 20] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.6, 0.8, 1], ease: "easeOut" }}>
        <rect x="30" y="156" width="68" height="34" rx="3" className="fill-amber/25 stroke-amber" strokeWidth="2" />
        <path d="M98 166 H116 L128 178 V190 H98 Z" className="fill-amber/25 stroke-amber" strokeWidth="2" strokeLinejoin="round" />
        <rect x="46" y="140" width="30" height="16" rx="2" className="fill-surface-2 stroke-amber" strokeWidth="1.8" />
        <line x1="61" y1="140" x2="61" y2="156" className="stroke-amber/60" />
        {[48, 118].map((cx) => (
          <motion.g key={cx} style={{ transformOrigin: `${cx}px 192px` }} animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}>
            <circle cx={cx} cy="192" r="7" className="fill-surface-2 stroke-foreground/70" strokeWidth="2" />
            <line x1={cx - 5} y1="192" x2={cx + 5} y2="192" className="stroke-foreground/50" />
          </motion.g>
        ))}
      </motion.g>
      <motion.g animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.55, 0.65, 1] }}>
        <text x="40" y="96" className="fill-amber font-mono text-[11px] font-semibold uppercase tracking-wider">Waiting for delivery</text>
        {[0, 1, 2].map((i) => (
          <motion.circle key={i} cx={48 + i * 12} cy="110" r="3" className="fill-amber" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }} />
        ))}
      </motion.g>
      <motion.g animate={{ opacity: [0, 0, 1, 1], y: [8, 8, 0, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.6, 0.72, 1] }}>
        <rect x="52" y="86" width="104" height="26" rx="13" className="fill-amber/15 stroke-amber/70" />
        <text x="104" y="103" textAnchor="middle" className="fill-amber font-mono text-[11px] font-semibold uppercase">$ Paid up front</text>
      </motion.g>
    </g>
  );
}

function InstallScene({ ox }: { ox: number }) {
  return (
    <g transform={`translate(${ox} 0)`}>
      <rect x="40" y="80" width="110" height="126" rx="8" className="fill-surface-2 stroke-amber/70" strokeWidth="2.5" />
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          <rect x="50" y={90 + r * 29} width="90" height="22" rx="4" className="fill-amber/10 stroke-amber/50" />
          {[0, 1, 2].map((l) => (
            <motion.circle key={l} cx={60 + l * 12} cy={101 + r * 29} r="3" className="fill-amber"
              animate={{ opacity: [0.15, 0.15, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.15 + r * 0.15, 0.25 + r * 0.15, 1] }} />
          ))}
          <motion.path d={`M112 ${101 + r * 29} H${176 + r * 8} Q ${196 + r * 4} ${101 + r * 29} 196 ${72 + r * 40}`} className="fill-none stroke-amber/70" strokeWidth="2.5"
            initial={{ pathLength: 0 }} animate={{ pathLength: [0, 0, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.05 + r * 0.15, 0.2 + r * 0.15, 1] }} />
        </g>
      ))}
      {/* terminal */}
      <rect x="170" y="78" width="104" height="70" rx="6" className="fill-background/70 stroke-amber/60" strokeWidth="1.5" />
      <rect x="170" y="78" width="104" height="12" rx="6" className="fill-amber/20" />
      {[0, 1, 2].map((i) => (
        <motion.rect key={i} x="178" y={98 + i * 14} height="6" rx="3" className="fill-amber/70" initial={{ width: 0 }} animate={{ width: [0, 0, 70 - i * 12, 70 - i * 12] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.1 + i * 0.2, 0.3 + i * 0.2, 1] }} />
      ))}
      {/* wrench */}
      <motion.g style={{ transformOrigin: "246px 186px" }} animate={{ rotate: [-18, 18, -18] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="218" y="182" width="52" height="9" rx="4.5" className="fill-amber/40 stroke-amber" strokeWidth="1.5" />
        <circle cx="218" cy="186.5" r="9" className="fill-none stroke-amber" strokeWidth="3" strokeDasharray="14 6" />
      </motion.g>
    </g>
  );
}

function MaintainScene({ ox }: { ox: number }) {
  return (
    <g transform={`translate(${ox} 0)`}>
      <rect x="40" y="80" width="110" height="126" rx="8" className="fill-surface-2 stroke-amber/70" strokeWidth="2.5" />
      {[0, 1, 2, 3].map((r) => (
        <rect key={r} x="50" y={90 + r * 29} width="90" height="22" rx="4" className={r === 1 ? "fill-red-500/10 stroke-red-500/60" : "fill-amber/10 stroke-amber/50"} />
      ))}
      {/* failing unit swaps */}
      <motion.rect x="50" y="119" width="90" height="22" rx="4" animate={{ fill: ["rgba(239,68,68,0.25)", "rgba(239,68,68,0.25)", "rgba(34,197,94,0.25)", "rgba(34,197,94,0.25)"] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.5, 0.65, 1] }} className="stroke-red-500/60" />
      <motion.circle cx="64" cy="130" r="4" animate={{ fill: ["#ef4444", "#ef4444", "#22c55e", "#22c55e"], opacity: [1, 0.3, 1, 1, 1] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.25, 0.5, 0.65, 1] }} />
      {[0, 2, 3].map((r) => (
        <g key={r}>{[0, 1, 2].map((l) => <circle key={l} cx={60 + l * 12} cy={101 + r * 29} r="3" className="fill-amber" opacity="0.8" />)}</g>
      ))}
      <motion.g animate={{ opacity: [1, 1, 0, 0] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.45, 0.55, 1] }}>
        <rect x="170" y="100" width="104" height="26" rx="13" className="fill-red-500/15 stroke-red-500/70" />
        <text x="222" y="117" textAnchor="middle" className="fill-red-500 font-mono text-[10px] font-semibold uppercase">Hardware failed</text>
      </motion.g>
      <motion.g animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 5, repeat: Infinity, times: [0, 0.6, 0.7, 1] }}>
        <rect x="170" y="100" width="104" height="26" rx="13" className="fill-mint/15 stroke-mint/70" />
        <text x="222" y="117" textAnchor="middle" className="fill-mint font-mono text-[10px] font-semibold uppercase">Replaced</text>
      </motion.g>
      <motion.g style={{ transformOrigin: "222px 168px" }} animate={{ rotate: [-25, 25, -25] }} transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="194" y="164" width="56" height="9" rx="4.5" className="fill-amber/40 stroke-amber" strokeWidth="1.5" />
        <circle cx="194" cy="168.5" r="9" className="fill-none stroke-amber" strokeWidth="3" strokeDasharray="14 6" />
      </motion.g>
      <text x="222" y="204" textAnchor="middle" className="fill-amber font-mono text-[9px] uppercase tracking-wider">You handle it</text>
    </g>
  );
}

/* --- cloud illustrations --- */
function CloudShape({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 40 a22 22 0 0 1 42 -10 a18 18 0 0 1 27 16 a15 15 0 0 1 -4 28 H10 a18 18 0 0 1 -10 -34 Z" className="fill-mint/15 stroke-mint" strokeWidth="2" />
    </g>
  );
}

function RequestScene({ ox }: { ox: number }) {
  const T = [0, 0.2, 0.35, 0.5, 0.9, 1];
  return (
    <g transform={`translate(${ox} 0)`}>
      <CloudShape x={170} y={72} />
      <text x="204" y="124" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold">AWS</text>
      {/* request button */}
      <motion.g style={{ transformOrigin: "80px 190px" }} animate={{ scale: [1, 1, 0.92, 1, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: T }}>
        <rect x="30" y="172" width="100" height="36" rx="18" className="fill-mint/20 stroke-mint" strokeWidth="2" />
        <text x="80" y="195" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold uppercase tracking-wider">Request</text>
      </motion.g>
      {/* cursor */}
      <motion.path d="M0 0 L0 18 L5 14 L9 22 L12 20 L8 12 L15 12 Z" className="fill-foreground stroke-background" strokeWidth="1"
        animate={{ x: [150, 90, 90, 90, 90, 150], y: [120, 192, 192, 192, 192, 120] }} transition={{ duration: 4, repeat: Infinity, times: T, ease: "easeInOut" }} />
      {/* beam */}
      <motion.path d="M130 190 Q 160 190 190 128" className="fill-none stroke-mint" strokeWidth="3" strokeDasharray="6 6"
        animate={{ opacity: [0, 0, 1, 1, 0, 0] }} transition={{ duration: 4, repeat: Infinity, times: T }} />
      {/* servers pop out */}
      {[0, 1, 2].map((i) => (
        <motion.g key={i} animate={{ opacity: [0, 0, 0, 1, 1, 0], y: [-30, -30, -30, 0, 0, -30], scale: [0.6, 0.6, 0.6, 1, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.4 + i * 0.05, 0.55 + i * 0.05, 0.9, 1] }} style={{ transformOrigin: `${170 + i * 36}px 178px` }}>
          <rect x={156 + i * 38} y="160" width="30" height="40" rx="6" className="fill-mint/20 stroke-mint" strokeWidth="2" />
          {[0, 1].map((l) => <circle key={l} cx={166 + i * 38 + l * 10} cy="171" r="2.4" className="fill-mint" />)}
          <rect x={162 + i * 38} y="182" width="18" height="5" rx="2.5" className="fill-mint/60" />
        </motion.g>
      ))}
      <motion.text x="190" y="216" textAnchor="middle" className="fill-mint font-mono text-[10px] font-semibold uppercase tracking-wider"
        animate={{ opacity: [0, 0, 0, 1, 1, 0] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.4, 0.6, 0.9, 1] }}>Ready on demand</motion.text>
    </g>
  );
}

function DeployScene({ ox }: { ox: number }) {
  return (
    <g transform={`translate(${ox} 0)`}>
      <rect x="30" y="76" width="150" height="116" rx="8" className="fill-background/70 stroke-mint/60" strokeWidth="2" />
      <rect x="30" y="76" width="150" height="16" rx="8" className="fill-mint/20" />
      {[0, 1, 2].map((i) => <circle key={i} cx={42 + i * 10} cy="84" r="2.6" className="fill-mint" />)}
      {[0, 1, 2, 3].map((i) => (
        <motion.rect key={i} x="42" y={102 + i * 14} height="7" rx="3.5" className="fill-mint/60" initial={{ width: 0 }}
          animate={{ width: [0, 0, 100 - i * 18, 100 - i * 18] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.05 + i * 0.12, 0.2 + i * 0.12, 1] }} />
      ))}
      <rect x="42" y="166" width="126" height="10" rx="5" className="fill-surface-2 stroke-hairline" />
      <motion.rect x="42" y="166" height="10" rx="5" className="fill-mint" initial={{ width: 0 }} animate={{ width: [0, 0, 126, 126] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.6, 1] }} />
      <CloudShape x={200} y={74} />
      <text x="234" y="126" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold">AWS</text>
      <motion.path d="M180 134 H200" className="fill-none stroke-mint" strokeWidth="3" strokeDasharray="5 5" animate={{ strokeDashoffset: [0, -20] }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
      {[0, 1].map((i) => (
        <motion.g key={i} animate={{ opacity: [0, 0, 1, 1], scale: [0.4, 0.4, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.6 + i * 0.1, 0.72 + i * 0.1, 1] }} style={{ transformOrigin: `${214 + i * 42}px 180px` }}>
          <rect x={198 + i * 42} y="162" width="34" height="34" rx="8" className="fill-mint/20 stroke-mint" strokeWidth="2" />
          <path d={`M${207 + i * 42} 180 l6 6 l11 -12`} className="fill-none stroke-mint" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      ))}
      <motion.text x="232" y="216" textAnchor="middle" className="fill-mint font-mono text-[10px] font-semibold uppercase tracking-wider" animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.65, 0.78, 1] }}>Deployed</motion.text>
    </g>
  );
}

function AdjustScene({ ox }: { ox: number }) {
  const T = [0, 0.3, 0.55, 0.85, 1];
  const counts = [2, 6, 6, 2, 2];
  return (
    <g transform={`translate(${ox} 0)`}>
      <text x="40" y="92" className="fill-mint font-mono text-[10px] uppercase tracking-wider">Capacity</text>
      <rect x="40" y="102" width="216" height="10" rx="5" className="fill-surface-2 stroke-hairline" />
      <motion.rect x="40" y="102" height="10" rx="5" className="fill-mint/60" initial={{ width: 40 }} animate={{ width: [40, 216, 216, 40, 40] }} transition={{ duration: 5, repeat: Infinity, times: T, ease: "easeInOut" }} />
      <motion.circle cy="107" r="10" className="fill-mint stroke-background" strokeWidth="2" initial={{ cx: 80 }} animate={{ cx: [80, 256, 256, 80, 80] }} transition={{ duration: 5, repeat: Infinity, times: T, ease: "easeInOut" }} />
      {Array.from({ length: 6 }, (_, i) => {
        const on = [i < counts[0], i < counts[1], i < counts[2], i < counts[3], i < counts[4]];
        return (
          <motion.g key={i} animate={{ opacity: on.map((v) => (v ? 1 : 0)), scale: on.map((v) => (v ? 1 : 0.5)), y: on.map((v) => (v ? 0 : -14)) }}
            transition={{ duration: 5, repeat: Infinity, times: T, ease: "easeInOut" }} style={{ transformOrigin: `${56 + i * 38}px 168px` }}>
            <rect x={40 + i * 38} y="140" width="32" height="44" rx="6" className="fill-mint/20 stroke-mint" strokeWidth="2" />
            {[0, 1].map((l) => <circle key={l} cx={50 + i * 38 + l * 12} cy="152" r="2.4" className="fill-mint" />)}
            <rect x={46 + i * 38} y="166" width="20" height="6" rx="3" className="fill-mint/60" />
          </motion.g>
        );
      })}
      <motion.text x="148" y="206" textAnchor="middle" className="fill-mint font-mono text-[10px] font-semibold uppercase tracking-wider"
        animate={{ opacity: [1, 1, 1, 1, 1] }}>Scale up or down when needed</motion.text>
    </g>
  );
}

const TRAD_ART = [TruckScene, InstallScene, MaintainScene];
const CLOUD_ART = [RequestScene, DeployScene, AdjustScene];

export function WorkflowCompareVisual({ caption }: { caption: string }) {
  return (
    <StoryPlayer
      caption={caption}
      scenes={FLOW_SCENES}
      viewBox="0 0 640 270"
      sceneMs={7000}
      render={(s) => {
        const Trad = TRAD_ART[s];
        const Cloud = CLOUD_ART[s];
        return (
          <g>
            <PanelFrame ox={14} tone="amber" title="Traditional IT" steps={TRAD_STEPS} active={s} />
            <PanelFrame ox={330} tone="mint" title="Cloud Computing" steps={CLOUD_STEPS} active={s} />
            <defs>
              <clipPath id="how-clip-l"><rect x="24" y="70" width="276" height="152" /></clipPath>
              <clipPath id="how-clip-r"><rect x="340" y="70" width="276" height="152" /></clipPath>
            </defs>
            <g clipPath="url(#how-clip-l)"><Trad ox={14} /></g>
            <g clipPath="url(#how-clip-r)"><Cloud ox={330} /></g>
          </g>
        );
      }}
    />
  );
}

/* ---------------------------------------------------------------------
   3. EXAMPLE: Black Friday
   --------------------------------------------------------------------- */

type SlotState = "off" | "base" | "extra" | "idle";
const BF_SCENES = [
  { label: "Before the sale", note: "An e-commerce company needs additional servers during Black Friday. Traditional IT purchases more physical servers before the sale.", load: [0.45, 0.1] },
  { label: "Black Friday", note: "AWS provisions additional EC2 instances during peak demand, while the purchased servers are all in use.", load: [0.9, 0.9] },
  { label: "After the sale", note: "Traditional IT servers may remain underused. With AWS, the company terminates the extra instances afterward.", load: [0.45, 0] },
] as const;

const TRAD_STATES: SlotState[][] = [
  ["base", "base", "extra", "extra", "extra", "extra"],
  ["base", "base", "extra", "extra", "extra", "extra"],
  ["base", "base", "idle", "idle", "idle", "idle"],
];
const TRAD_PREV: SlotState[][] = [
  ["base", "base", "off", "off", "off", "off"],
  TRAD_STATES[0],
  TRAD_STATES[1],
];
const AWS_STATES: SlotState[][] = [
  ["base", "base", "off", "off", "off", "off"],
  ["base", "base", "extra", "extra", "extra", "extra"],
  ["base", "base", "off", "off", "off", "off"],
];
const AWS_PREV: SlotState[][] = [AWS_STATES[2], AWS_STATES[0], AWS_STATES[1]];

const TRAD_TAGS = ["Buy servers early", "All in use", "Underused"];
const AWS_TAGS = ["Normal capacity", "Add EC2 instances", "Terminate extras"];

function BfSlot({ i, x, y, state, prev, load }: { i: number; x: number; y: number; state: SlotState; prev: SlotState; load: number }) {
  const visible = state !== "off";
  const cls =
    state === "base" ? "fill-mint/15 stroke-mint" : state === "extra" ? "fill-amber/15 stroke-amber" : state === "idle" ? "fill-muted-foreground/10 stroke-muted-foreground/50" : "fill-none stroke-hairline";
  const bar = state === "base" ? "fill-mint" : state === "extra" ? "fill-amber" : "fill-muted-foreground/50";
  const startY = prev === "off" ? -34 : 0;
  return (
    <motion.g
      initial={{ opacity: prev === "off" ? 0 : 1, y: startY }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -34 }}
      transition={{ type: "spring", stiffness: 170, damping: 15, delay: visible && prev === "off" ? (i - 2) * 0.12 : !visible ? (5 - i) * 0.1 : 0 }}
    >
      <rect x={x} y={y} width="44" height="52" rx="7" className={cls} strokeWidth="1.8" />
      {state !== "idle" ? [0, 1, 2].map((l) => (
        <motion.circle key={l} cx={x + 10 + l * 12} cy={y + 11} r="2.6" className={bar}
          animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1 + l * 0.3, repeat: Infinity }} />
      )) : (
        <motion.text x={x + 22} y={y + 16} textAnchor="middle" className="fill-muted-foreground font-mono text-[12px] font-bold"
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>z</motion.text>
      )}
      <rect x={x + 7} y={y + 28} width="30" height="7" rx="3.5" className="fill-background/60" />
      <motion.rect x={x + 7} y={y + 28} height="7" rx="3.5" className={bar} initial={{ width: 0 }} animate={{ width: 30 * (state === "idle" ? 0.03 : load) }} transition={{ duration: 0.8, delay: 0.3 }} />
      <rect x={x + 7} y={y + 40} width="30" height="3" rx="1.5" className="fill-background/50" />
    </motion.g>
  );
}

function Lane({ y, title, sub, tone, states, prev, load, tag }: { y: number; title: string; sub: string; tone: "amber" | "mint"; states: SlotState[]; prev: SlotState[]; load: number; tag: string }) {
  return (
    <g>
      <rect x="14" y={y - 14} width="612" height="82" rx="12" className="fill-none stroke-hairline" />
      <text x="28" y={y + 18} className={`${tone === "amber" ? "fill-amber" : "fill-mint"} font-mono text-[12px] font-semibold uppercase tracking-wider`}>{title}</text>
      <text x="28" y={y + 36} className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider">{sub}</text>
      {states.map((st, i) => (
        <BfSlot key={i} i={i} x={150 + i * 56} y={y} state={st} prev={prev[i]} load={i < 2 ? 0.45 : load} />
      ))}
      <motion.g key={tag} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
        <rect x="492" y={y + 12} width="124" height="28" rx="14" className={tone === "amber" ? "fill-amber/15 stroke-amber/60" : "fill-mint/15 stroke-mint/60"} />
        <text x="554" y={y + 30} textAnchor="middle" className={`${tone === "amber" ? "fill-amber" : "fill-mint"} font-mono text-[10px] font-semibold uppercase`}>{tag}</text>
      </motion.g>
    </g>
  );
}

export function BlackFridayVisual({ caption }: { caption: string }) {
  return (
    <StoryPlayer
      caption={caption}
      scenes={BF_SCENES}
      viewBox="0 0 640 230"
      sceneMs={6500}
      render={(s) => (
        <g>
          <Lane y={20} title="Traditional IT" sub="Physical servers" tone="amber" states={TRAD_STATES[s]} prev={TRAD_PREV[s]} load={BF_SCENES[s].load[0]} tag={TRAD_TAGS[s]} />
          <Lane y={126} title="AWS" sub="EC2 instances" tone="mint" states={AWS_STATES[s]} prev={AWS_PREV[s]} load={BF_SCENES[s].load[1] === 0.1 ? 0.45 : BF_SCENES[s].load[1]} tag={AWS_TAGS[s]} />
        </g>
      )}
    />
  );
}
