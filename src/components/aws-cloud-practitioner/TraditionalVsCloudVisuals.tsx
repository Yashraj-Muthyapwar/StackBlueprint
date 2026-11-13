import { motion } from "motion/react";
import { Cloud, MonitorUp, ShoppingCart, Server, SlidersHorizontal, Wrench, Check } from "lucide-react";
import { StoryPlayer } from "./CloudFrame";

/* ---------------------------------------------------------------------
   1. INTUITION: buying a car versus renting a car
   --------------------------------------------------------------------- */

const CAR_SCENES = [
  { label: "Buy a car", note: "Traditional IT: buying a car. You purchase and maintain it even when you are not using it." },
  { label: "Rent a car", note: "Cloud Computing: renting a car. You use it when needed and pay according to the rental agreement." },
  { label: "Over a week", note: "The cloud provides flexibility without requiring you to own the underlying infrastructure." },
] as const;

function Car({ tone, x, y, scale = 1 }: { tone: "amber" | "mint"; x: number; y: number; scale?: number }) {
  const body = tone === "amber" ? "fill-amber/25 stroke-amber" : "fill-mint/25 stroke-mint";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 30 L6 14 Q9 6 18 6 H52 Q60 6 66 14 L76 22 Q84 24 84 32 V38 H0 Z" className={body} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M16 14 H34 V24 H10 Z M40 14 H56 L66 24 H40 Z" className="fill-background/70" />
      <circle cx="20" cy="40" r="9" className="fill-surface-2 stroke-foreground/60" strokeWidth="2.5" />
      <circle cx="66" cy="40" r="9" className="fill-surface-2 stroke-foreground/60" strokeWidth="2.5" />
      <circle cx="20" cy="40" r="3" className="fill-foreground/50" />
      <circle cx="66" cy="40" r="3" className="fill-foreground/50" />
    </g>
  );
}

function FloatTag({ x, y, text, delay, tone }: { x: number; y: number; text: string; delay: number; tone: "amber" | "mint" }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: [0, 1, 1, 0], y: [14, 0, -4, -16] }}
      transition={{ duration: 4.5, repeat: Infinity, delay, times: [0, 0.15, 0.8, 1] }}
    >
      <rect x={x} y={y} width="118" height="26" rx="13" className={tone === "amber" ? "fill-amber/15 stroke-amber/60" : "fill-mint/15 stroke-mint/60"} />
      <text x={x + 59} y={y + 17} textAnchor="middle" className={`font-mono text-[11px] ${tone === "amber" ? "fill-amber" : "fill-mint"}`}>{text}</text>
    </motion.g>
  );
}

function BuyScene() {
  return (
    <g>
      <line x1="20" y1="226" x2="620" y2="226" className="stroke-hairline" strokeWidth="2" />
      {/* garage */}
      <path d="M90 226 V120 L220 76 L350 120 V226" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="124" y="150" width="192" height="76" className="fill-background/50 stroke-muted-foreground/40" strokeWidth="1.5" />
      <Car tone="amber" x={174} y={178} />
      {/* idle zzz */}
      {[0, 1, 2].map((i) => (
        <motion.text key={i} x={262 + i * 8} y={168} className="fill-muted-foreground font-mono text-[13px] font-bold"
          animate={{ y: [168, 120], opacity: [0, 1, 0] }} transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.8 }}>
          z
        </motion.text>
      ))}
      <motion.g style={{ transformOrigin: "400px 170px" }} animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
        <circle cx="400" cy="170" r="14" className="fill-none stroke-amber/70" strokeWidth="5" strokeDasharray="5 4" />
        <circle cx="400" cy="170" r="5" className="fill-amber/70" />
      </motion.g>
      <FloatTag x={440} y={60} text="Purchase" delay={0} tone="amber" />
      <FloatTag x={484} y={96} text="Maintain" delay={1.4} tone="amber" />
      <FloatTag x={440} y={132} text="Still paying" delay={2.8} tone="amber" />
      <text x="220" y="256" textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-[0.14em]">Parked and idle, still yours to maintain</text>
    </g>
  );
}

function RentScene() {
  return (
    <g>
      {/* road */}
      <rect x="20" y="196" width="600" height="42" rx="6" className="fill-surface-2 stroke-hairline" />
      <motion.line x1="20" y1="217" x2="620" y2="217" className="stroke-muted-foreground/50" strokeWidth="2" strokeDasharray="14 14"
        animate={{ strokeDashoffset: [0, -28] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      {/* rental office */}
      <rect x="40" y="110" width="110" height="86" rx="4" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="2" />
      <rect x="40" y="100" width="110" height="14" rx="3" className="fill-mint/60" />
      <text x="95" y="150" textAnchor="middle" className="fill-foreground font-mono text-[11px] font-semibold uppercase tracking-wider">Rental</text>
      <text x="95" y="168" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider">on demand</text>
      {/* driving car */}
      <motion.g animate={{ x: [0, 330, 330, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, 0.4, 0.55, 1], ease: "easeInOut" }}>
        <Car tone="mint" x={170} y={166} />
      </motion.g>
      {/* destination */}
      <circle cx="560" cy="150" r="9" className="fill-mint" />
      <rect x="550" y="160" width="20" height="30" rx="8" className="fill-mint/60" />
      <FloatTag x={300} y={56} text="Pay for use" delay={0.3} tone="mint" />
      <FloatTag x={420} y={96} text="Return it" delay={2.2} tone="mint" />
      <text x="320" y="262" textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-[0.14em]">Use it when needed, hand it back when done</text>
    </g>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const USED = new Set([1, 4]);

function WeekScene() {
  return (
    <g>
      {DAYS.map((d, i) => (
        <text key={d} x={170 + i * 64} y={50} textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-wider">{d}</text>
      ))}
      <text x="20" y="104" className="fill-amber font-mono text-[11px] font-semibold uppercase tracking-wider">Own it</text>
      <text x="20" y="196" className="fill-mint font-mono text-[11px] font-semibold uppercase tracking-wider">Rent it</text>
      {DAYS.map((_, i) => {
        const used = USED.has(i);
        return (
          <g key={i}>
            {/* owned: paid every day */}
            <motion.rect x={142 + i * 64} y={70} width="56" height="50" rx="8" className="fill-amber/20 stroke-amber/70" strokeWidth="1.5"
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.2, type: "spring", stiffness: 200, damping: 14 }}
              style={{ transformOrigin: `${170 + i * 64}px 95px` }} />
            <motion.text x={170 + i * 64} y={101} textAnchor="middle" className="fill-amber font-mono text-[13px] font-bold"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.2 + 0.2 }}>$</motion.text>
            {/* rented: only on days used */}
            <motion.rect x={142 + i * 64} y={162} width="56" height="50" rx="8"
              className={used ? "fill-mint/25 stroke-mint" : "fill-none stroke-hairline"} strokeWidth="1.5" strokeDasharray={used ? undefined : "4 4"}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6 + i * 0.1, type: "spring", stiffness: 200, damping: 14 }}
              style={{ transformOrigin: `${170 + i * 64}px 187px` }} />
            {used ? (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 + i * 0.1 }}>
                <Car tone="mint" x={150 + i * 64} y={176} scale={0.4} />
              </motion.g>
            ) : null}
          </g>
        );
      })}
      <text x="320" y="248" textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-[0.14em]">You pay for ownership every day, or for the days you rent</text>
    </g>
  );
}

export function CarAnalogyVisual({ caption }: { caption: string }) {
  return (
    <StoryPlayer
      caption={caption}
      scenes={CAR_SCENES}
      viewBox="0 0 640 270"
      render={(s) => (s === 0 ? <BuyScene /> : s === 1 ? <RentScene /> : <WeekScene />)}
    />
  );
}

/* ---------------------------------------------------------------------
   2. HOW: two workflows side by side
   --------------------------------------------------------------------- */

const FLOW_SCENES = [
  { label: "Start", note: "Traditional IT starts by purchasing hardware. Cloud computing starts by requesting resources." },
  { label: "Set up", note: "Traditional IT installs and configures the hardware. In the cloud, you configure and deploy." },
  { label: "Run", note: "Traditional IT maintains the hardware. In the cloud, you adjust capacity when needed." },
] as const;

const TRAD = [
  { icon: ShoppingCart, text: "Purchase hardware" },
  { icon: Server, text: "Install and configure" },
  { icon: Wrench, text: "Maintain hardware" },
];
const CLOUD = [
  { icon: Cloud, text: "Request resources" },
  { icon: MonitorUp, text: "Configure and deploy" },
  { icon: SlidersHorizontal, text: "Adjust capacity" },
];

function FlowColumn({ cx, title, steps, active, tone }: { cx: number; title: string; steps: typeof TRAD; active: number; tone: "amber" | "mint" }) {
  const on = tone === "amber" ? "fill-amber/15 stroke-amber" : "fill-mint/15 stroke-mint";
  const txt = tone === "amber" ? "fill-amber" : "fill-mint";
  return (
    <g>
      <text x={cx} y="34" textAnchor="middle" className={`${txt} font-mono text-[12px] font-semibold uppercase tracking-[0.14em]`}>{title}</text>
      {steps.map((s, i) => {
        const y = 52 + i * 70;
        const state = i === active ? "active" : i < active ? "done" : "todo";
        const Icon = s.icon;
        return (
          <g key={s.text}>
            <motion.rect
              x={cx - 100} y={y} width="200" height="50" rx="12"
              className={state === "todo" ? "fill-none stroke-hairline" : on}
              strokeWidth={state === "active" ? 2.5 : 1.5}
              animate={{ opacity: state === "todo" ? 0.5 : 1 }}
              transition={{ duration: 0.4 }}
            />
            {state === "active" ? (
              <motion.rect x={cx - 100} y={y} width="200" height="50" rx="12" className={`fill-none ${tone === "amber" ? "stroke-amber" : "stroke-mint"}`}
                animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.06, 1] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ transformOrigin: `${cx}px ${y + 25}px` }} />
            ) : null}
            <Icon x={cx - 86} y={y + 14} width={22} height={22} className={state === "todo" ? "text-muted-foreground" : tone === "amber" ? "text-amber" : "text-mint"} />
            <text x={cx - 52} y={y + 30} className={`font-mono text-[12px] ${state === "todo" ? "fill-muted-foreground" : "fill-foreground"}`}>{s.text}</text>
            {state === "done" ? <Check x={cx + 72} y={y + 14} width={22} height={22} className={tone === "amber" ? "text-amber" : "text-mint"} /> : null}
            {i < steps.length - 1 ? (
              <g>
                <line x1={cx} y1={y + 52} x2={cx} y2={y + 68} className="stroke-muted-foreground/50" strokeWidth="2" />
                {i < active ? (
                  <motion.circle cx={cx} r="3.5" className={tone === "amber" ? "fill-amber" : "fill-mint"}
                    initial={{ cy: y + 52 }} animate={{ cy: y + 68 }} transition={{ duration: 0.9, repeat: Infinity }} />
                ) : null}
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

export function WorkflowCompareVisual({ caption }: { caption: string }) {
  return (
    <StoryPlayer
      caption={caption}
      scenes={FLOW_SCENES}
      viewBox="0 0 640 270"
      sceneMs={5000}
      render={(s) => (
        <g>
          <FlowColumn cx={170} title="Traditional IT" steps={TRAD} active={s} tone="amber" />
          <line x1="320" y1="30" x2="320" y2="250" className="stroke-hairline" strokeDasharray="4 6" />
          <FlowColumn cx={470} title="Cloud Computing" steps={CLOUD} active={s} tone="mint" />
        </g>
      )}
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
