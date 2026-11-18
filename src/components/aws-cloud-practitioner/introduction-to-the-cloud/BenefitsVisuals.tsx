import { motion } from "motion/react";
import { StoryPlayer } from "../CloudFrame";
import { MAP_EUROPE, MAP_LAND, MAP_PINS, MAP_US } from "./map-data";

/* ---------------------------------------------------------------------
   Shared bits
   --------------------------------------------------------------------- */

function Person({ x, y, tone = "amber", delay = 0, scale = 1 }: { x: number; y: number; tone?: "amber" | "mint"; delay?: number; scale?: number }) {
  const head = tone === "amber" ? "fill-amber" : "fill-mint";
  const body = tone === "amber" ? "fill-amber/60" : "fill-mint/60";
  return (
    <motion.g animate={{ y: [0, -2.5, 0] }} transition={{ duration: 0.8 + (delay % 0.4), repeat: Infinity, delay }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <circle cx="0" cy="-22" r="5.5" className={head} />
        <rect x="-6" y="-15" width="12" height="17" rx="5" className={body} />
      </g>
    </motion.g>
  );
}

function Pill({ x, y, w, text, tone, delay = 0.3 }: { x: number; y: number; w: number; text: string; tone: "amber" | "mint" | "red"; delay?: number }) {
  const box = tone === "amber" ? "fill-amber/15 stroke-amber/70" : tone === "red" ? "fill-red-500/15 stroke-red-500/70" : "fill-mint/15 stroke-mint/70";
  const txt = tone === "amber" ? "fill-amber" : tone === "red" ? "fill-red-500" : "fill-mint";
  return (
    <motion.g key={text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={x - w / 2} y={y} width={w} height="26" rx="13" className={box} />
      <text x={x} y={y + 17} textAnchor="middle" className={`${txt} font-mono text-[10.5px] font-semibold uppercase tracking-wider`}>{text}</text>
    </motion.g>
  );
}

/* ======================================================================
   1. INTUITION: opening a restaurant
   ====================================================================== */

const REST_SCENES = [
  { label: "Traditional IT", note: "With traditional IT, you build a large kitchen before knowing how many customers will arrive." },
  { label: "Cloud", note: "With cloud computing, you can rent kitchen capacity based on demand." },
  { label: "It gets popular", note: "When your restaurant becomes popular, you increase the capacity." },
] as const;

type Stove = "off" | "mint" | "idle" | "amber";
const REST_STATES: Stove[][] = [
  ["amber", "amber", "idle", "idle", "idle", "idle", "idle", "idle"],
  ["mint", "mint", "off", "off", "off", "off", "off", "off"],
  ["mint", "mint", "mint", "mint", "mint", "mint", "off", "off"],
];
const REST_PREV: Stove[][] = [Array(8).fill("off") as Stove[], REST_STATES[0].map(() => "off") as Stove[], REST_STATES[1]];
// scene 1 follows scene 0, so keep the big kitchen for the previous state of scene 1
REST_PREV[1] = REST_STATES[0];
const REST_CUSTOMERS = [2, 2, 8];

function StoveSlot({ i, state, prev }: { i: number; state: Stove; prev: Stove }) {
  const x = 40 + (i % 4) * 92;
  const y = 58 + Math.floor(i / 4) * 94;
  const visible = state !== "off";
  const cls =
    state === "mint" ? "fill-mint/15 stroke-mint" : state === "amber" ? "fill-amber/15 stroke-amber" : state === "idle" ? "fill-muted-foreground/10 stroke-muted-foreground/50" : "fill-none stroke-hairline";
  const flame = state === "mint" || state === "amber";
  const flameCls = state === "mint" ? "fill-mint" : "fill-amber";
  return (
    <motion.g
      initial={{ opacity: prev === "off" ? 0 : 1, y: prev === "off" ? -30 : 0 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -30 }}
      transition={{ type: "spring", stiffness: 170, damping: 15, delay: visible && prev === "off" ? i * 0.09 : !visible ? (7 - i) * 0.07 : 0 }}
    >
      <rect x={x} y={y} width="76" height="78" rx="9" className={cls} strokeWidth="2" strokeDasharray={visible ? undefined : "4 4"} />
      <rect x={x + 8} y={y + 10} width="60" height="10" rx="4" className="fill-background/60" />
      {[0, 1].map((b) => (
        <g key={b}>
          <circle cx={x + 22 + b * 32} cy={y + 44} r="11" className="fill-background/60 stroke-foreground/30" strokeWidth="1.5" />
          {flame ? (
            <motion.path d={`M${x + 22 + b * 32} ${y + 52} q-6 -8 0 -16 q6 8 0 16`} className={flameCls}
              animate={{ scaleY: [0.8, 1.15, 0.8], opacity: [0.7, 1, 0.7] }} style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
              transition={{ duration: 0.7 + b * 0.2, repeat: Infinity }} />
          ) : null}
        </g>
      ))}
      <rect x={x + 18} y={y + 64} width="40" height="5" rx="2.5" className="fill-background/50" />
    </motion.g>
  );
}

function RestaurantScene({ s }: { s: number }) {
  const n = REST_CUSTOMERS[s];
  return (
    <g>
      <text x="212" y="30" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.16em]">Kitchen</text>
      <text x="530" y="30" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.16em]">Customers</text>
      <line x1="424" y1="22" x2="424" y2="232" className="stroke-hairline" strokeDasharray="4 6" strokeWidth="2" />
      {REST_STATES[s].map((st, i) => <StoveSlot key={i} i={i} state={st} prev={REST_PREV[s][i]} />)}
      {Array.from({ length: 8 }, (_, i) => {
        const x = 466 + (i % 4) * 40;
        const y = 98 + Math.floor(i / 4) * 78;
        return (
          <motion.g key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: i < n ? 1 : 0, x: i < n ? 0 : 30 }} transition={{ delay: i < n ? 0.4 + i * 0.1 : 0 }}>
            <Person x={x + 10} y={y + 24} tone={s === 0 ? "amber" : "mint"} delay={i * 0.15} />
            <rect x={x - 6} y={y + 30} width="32" height="6" rx="3" className="fill-surface-2 stroke-hairline" />
          </motion.g>
        );
      })}
      {s === 0 ? (
        <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <circle cx="490" cy="58" r="16" className="fill-amber/15 stroke-amber/70" />
          <text x="490" y="64" textAnchor="middle" className="fill-amber font-mono text-[16px] font-bold">?</text>
          <text x="516" y="62" className="fill-amber font-mono text-[10px] uppercase tracking-wider">How many?</text>
        </motion.g>
      ) : null}
      {s === 0 ? <Pill x={212} y={240} w={250} text="Built before demand is known" tone="amber" /> : null}
      {s === 1 ? <Pill x={212} y={240} w={230} text="Rented to match demand" tone="mint" /> : null}
      {s === 2 ? <Pill x={212} y={240} w={250} text="Capacity added as it grows" tone="mint" /> : null}
    </g>
  );
}

export function RestaurantVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={REST_SCENES} viewBox="0 0 640 275" sceneMs={7000} render={(s) => <RestaurantScene s={s} />} />;
}

/* ======================================================================
   2. HOW: six advantages
   ====================================================================== */

const SIX = [
  { label: "Variable cost", note: "1. Trade fixed expenses for variable expenses: Instead of purchasing expensive servers upfront, pay according to the cloud service's pricing model." },
  { label: "Scale", note: "2. Benefit from economies of scale: AWS operates infrastructure at a massive scale, helping it offer competitive resource pricing." },
  { label: "No guessing", note: "3. Stop guessing capacity: Provision resources based on demand instead of purchasing hardware for uncertain future traffic." },
  { label: "Agility", note: "4. Increase speed and agility: Provision resources in minutes instead of waiting for physical hardware procurement." },
  { label: "No upkeep", note: "5. Stop spending money running and maintaining data centers: AWS operates the physical infrastructure so teams can focus more on applications and business needs." },
  { label: "Global", note: "6. Go global in minutes: Deploy applications in AWS Regions closer to users around the world." },
] as const;

function PanelTitle({ x, text, tone }: { x: number; text: string; tone: "amber" | "mint" }) {
  return <text x={x} y="26" textAnchor="middle" className={`${tone === "amber" ? "fill-amber" : "fill-mint"} font-mono text-[11px] font-semibold uppercase tracking-[0.16em]`}>{text}</text>;
}

function VariableScene() {
  const phases = [0.5, 0.9, 0.3, 0.7, 1, 0.4, 0.8, 0.2];
  return (
    <g>
      <PanelTitle x={160} text="Fixed expense" tone="amber" />
      <PanelTitle x={480} text="Variable expense" tone="mint" />
      <line x1="320" y1="20" x2="320" y2="236" className="stroke-hairline" strokeDasharray="4 6" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <motion.g key={i} initial={{ y: -120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 14, delay: i * 0.25 }}>
          <rect x="105" y={180 - i * 36} width="110" height="30" rx="6" className="fill-amber/15 stroke-amber" strokeWidth="2" />
          {[0, 1, 2].map((l) => <circle key={l} cx={120 + l * 12} cy={195 - i * 36} r="3" className="fill-amber" />)}
        </motion.g>
      ))}
      <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 10 }} style={{ transformOrigin: "160px 48px" }}>
        <rect x="108" y="32" width="104" height="30" rx="15" className="fill-amber/20 stroke-amber" strokeWidth="2" />
        <text x="160" y="52" textAnchor="middle" className="fill-amber font-mono text-[13px] font-bold">$$$$ upfront</text>
      </motion.g>
      <line x1="360" y1="190" x2="600" y2="190" className="stroke-hairline" strokeWidth="2" />
      {phases.map((p, i) => (
        <motion.rect key={i} x={366 + i * 29} width="20" rx="4" className="fill-mint/60 stroke-mint" strokeWidth="1.5"
          initial={{ y: 190, height: 0 }}
          animate={{ y: [190 - p * 110, 190 - (1 - p) * 110 - 10, 190 - p * 110], height: [p * 110, (1 - p) * 110 + 10, p * 110] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut" }} />
      ))}
      <text x="480" y="210" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider">Usage over time</text>
      <Pill x={160} y={228} w={150} text="Pay up front" tone="amber" />
      <Pill x={480} y={228} w={200} text="Pay by pricing model" tone="mint" />
    </g>
  );
}

function ScaleScene() {
  return (
    <g>
      <PanelTitle x={200} text="AWS at massive scale" tone="mint" />
      <PanelTitle x={500} text="Resource pricing" tone="mint" />
      <line x1="400" y1="20" x2="400" y2="236" className="stroke-hairline" strokeDasharray="4 6" strokeWidth="2" />
      {Array.from({ length: 60 }, (_, i) => {
        const c = i % 10;
        const r = Math.floor(i / 10);
        return (
          <motion.g key={i} initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05, type: "spring", stiffness: 220, damping: 14 }} style={{ transformOrigin: `${52 + c * 31 + 12}px ${52 + r * 30 + 11}px` }}>
            <rect x={52 + c * 31} y={52 + r * 30} width="24" height="22" rx="4" className="fill-mint/15 stroke-mint" strokeWidth="1.5" />
            <circle cx={58 + c * 31} cy={58 + r * 30} r="2" className="fill-mint" />
            <circle cx={66 + c * 31} cy={58 + r * 30} r="2" className="fill-mint" />
          </motion.g>
        );
      })}
      {/* price tag sliding down as the fleet grows */}
      <motion.g initial={{ y: 0 }} animate={{ y: 78 }} transition={{ duration: 3.2, ease: "easeInOut", delay: 0.3 }}>
        <path d="M440 70 H540 L560 90 L540 110 H440 Z" className="fill-mint/20 stroke-mint" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="448" cy="90" r="4" className="fill-background" />
        <text x="496" y="95" textAnchor="middle" className="fill-mint font-mono text-[12px] font-bold">PRICE</text>
      </motion.g>
      <motion.path d="M580 68 V140 M570 128 L580 142 L590 128" className="fill-none stroke-mint" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.4, delay: 0.6 }} />
      <Pill x={500} y={206} w={230} text="Competitive resource pricing" tone="mint" delay={2.6} />
    </g>
  );
}

function CapacityScene() {
  const demand = "M60 170 C110 160 140 110 190 125 S280 60 330 88 S420 172 470 140 S540 90 580 100";
  const follow = "M60 160 C110 150 140 100 190 115 S280 50 330 78 S420 162 470 130 S540 80 580 90";
  return (
    <g>
      <line x1="56" y1="40" x2="56" y2="200" className="stroke-muted-foreground/50" strokeWidth="2" />
      <line x1="56" y1="200" x2="590" y2="200" className="stroke-muted-foreground/50" strokeWidth="2" />
      <text x="50" y="36" textAnchor="end" className="fill-muted-foreground font-mono text-[9px] uppercase tracking-wider">Traffic</text>
      <text x="590" y="218" textAnchor="end" className="fill-muted-foreground font-mono text-[9px] uppercase tracking-wider">Time</text>
      {/* guessed hardware */}
      <motion.line x1="60" x2="580" y1="118" y2="118" className="stroke-amber" strokeWidth="2.5" strokeDasharray="8 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
      <text x="70" y="110" className="fill-amber font-mono text-[10px] uppercase tracking-wider">Guessed hardware</text>
      {/* uncertain traffic */}
      <motion.path d={demand} className="fill-none stroke-foreground/70" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.6, delay: 0.5, ease: "easeInOut" }} />
      {[{ x: 330, y: 52 }, { x: 440, y: 190 }].map((q, i) => (
        <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.8 + i * 0.3 }} style={{ transformOrigin: `${q.x}px ${q.y}px` }}>
          <circle cx={q.x} cy={q.y} r="13" className="fill-red-500/15 stroke-red-500/70" />
          <text x={q.x} y={q.y + 5} textAnchor="middle" className="fill-red-500 font-mono text-[14px] font-bold">{i === 0 ? "!" : "?"}</text>
        </motion.g>
      ))}
      <text x="330" y="40" textAnchor="middle" className="fill-red-500 font-mono text-[9px] uppercase tracking-wider">Too little</text>
      <text x="440" y="176" textAnchor="middle" className="fill-red-500 font-mono text-[9px] uppercase tracking-wider">Wasted</text>
      {/* demand based */}
      <motion.path d={follow} className="fill-none stroke-mint" strokeWidth="3.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, delay: 3.4, ease: "easeInOut" }} />
      <Pill x={470} y={232} w={250} text="Provision from demand" tone="mint" delay={5.2} />
    </g>
  );
}

function AgilityScene() {
  return (
    <g>
      <text x="40" y="56" className="fill-amber font-mono text-[11px] font-semibold uppercase tracking-wider">Physical hardware</text>
      <rect x="40" y="70" width="540" height="16" rx="8" className="fill-surface-2 stroke-hairline" />
      <motion.rect x="40" y="70" height="16" rx="8" className="fill-amber/70" initial={{ width: 0 }} animate={{ width: 540 }} transition={{ duration: 5.6, ease: "linear" }} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={40 + (i + 1) * 54} x2={40 + (i + 1) * 54} y1="66" y2="90" className="stroke-background/70" />)}
      <motion.g initial={{ x: 0 }} animate={{ x: 500 }} transition={{ duration: 5.6, ease: "linear" }}>
        <rect x="36" y="94" width="38" height="20" rx="3" className="fill-amber/25 stroke-amber" strokeWidth="1.8" />
        <circle cx="46" cy="116" r="4" className="fill-surface-2 stroke-foreground/60" /><circle cx="64" cy="116" r="4" className="fill-surface-2 stroke-foreground/60" />
      </motion.g>
      <text x="580" y="132" textAnchor="end" className="fill-amber font-mono text-[10px] uppercase tracking-wider">Waiting for physical hardware procurement</text>

      <text x="40" y="170" className="fill-mint font-mono text-[11px] font-semibold uppercase tracking-wider">AWS</text>
      <rect x="40" y="184" width="540" height="16" rx="8" className="fill-surface-2 stroke-hairline" />
      <motion.rect x="40" y="184" height="16" rx="8" className="fill-mint" initial={{ width: 0 }} animate={{ width: 540 }} transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }} />
      <motion.g initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6, type: "spring", stiffness: 220, damping: 12 }} style={{ transformOrigin: "560px 192px" }}>
        <circle cx="560" cy="192" r="15" className="fill-mint stroke-background" strokeWidth="3" />
        <path d="M552 192 l6 6 l10 -12" className="fill-none stroke-background" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      <Pill x={150} y={216} w={230} text="Provisioned in minutes" tone="mint" delay={1.8} />
    </g>
  );
}

function UpkeepScene() {
  const chores = [
    { t: "Power", y: 64 },
    { t: "Cooling", y: 108 },
    { t: "Hardware", y: 152 },
  ];
  return (
    <g>
      <motion.path d="M250 80 a28 28 0 0 1 54 -12 a22 22 0 0 1 34 20 a18 18 0 0 1 -6 34 H262 a22 22 0 0 1 -12 -42 Z" className="fill-mint/15 stroke-mint" strokeWidth="2.5"
        animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }} />
      <text x="292" y="108" textAnchor="middle" className="fill-mint font-mono text-[13px] font-bold">AWS</text>
      <text x="292" y="150" textAnchor="middle" className="fill-mint font-mono text-[9px] uppercase tracking-wider">Operates the physical</text>
      <text x="292" y="162" textAnchor="middle" className="fill-mint font-mono text-[9px] uppercase tracking-wider">infrastructure</text>
      {chores.map((c, i) => (
        <motion.g key={c.t} animate={{ x: [0, 190, 190], opacity: [1, 1, 0] }} transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.9, times: [0, 0.7, 1], ease: "easeInOut" }}>
          <rect x="30" y={c.y} width="86" height="30" rx="15" className="fill-amber/15 stroke-amber/70" />
          <text x="73" y={c.y + 19} textAnchor="middle" className="fill-amber font-mono text-[10.5px] font-semibold uppercase">{c.t}</text>
        </motion.g>
      ))}
      <text x="73" y="222" textAnchor="middle" className="fill-amber font-mono text-[9px] uppercase tracking-wider">Running and maintaining</text>
      {/* teams refocus */}
      <rect x="400" y="46" width="210" height="104" rx="10" className="fill-background/60 stroke-mint/60" strokeWidth="2" />
      <rect x="400" y="46" width="210" height="16" rx="8" className="fill-mint/20" />
      {[0, 1, 2].map((i) => <circle key={i} cx={412 + i * 10} cy="54" r="2.6" className="fill-mint" />)}
      {[0, 1, 2].map((i) => (
        <motion.rect key={i} x="414" y={74 + i * 20} height="8" rx="4" className="fill-mint/60" initial={{ width: 0 }} animate={{ width: [0, 120 - i * 24] }} transition={{ duration: 1.2, delay: 1 + i * 0.4, repeat: Infinity, repeatDelay: 2 }} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <motion.rect key={i} x={540 + i * 14} width="9" rx="2" className="fill-mint" initial={{ y: 140, height: 0 }} animate={{ y: [140, 140 - (22 + i * 8)], height: [0, 22 + i * 8] }} transition={{ duration: 1.4, delay: 1.4 + i * 0.2, repeat: Infinity, repeatDelay: 2 }} />
      ))}
      {[0, 1, 2].map((i) => <Person key={i} x={436 + i * 50} y={206} tone="mint" delay={i * 0.2} />)}
      <text x="505" y="232" textAnchor="middle" className="fill-mint font-mono text-[9px] uppercase tracking-wider">Applications and business needs</text>
    </g>
  );
}

function GlobalScene() {
  const pins = [
    { x: 250, y: 98 },
    { x: 360, y: 86 },
    { x: 410, y: 150 },
    { x: 280, y: 182 },
    { x: 350, y: 186 },
  ];
  const users: [number, number][] = [[226, 120], [388, 106], [436, 176], [252, 206], [378, 210], [320, 128], [300, 150]];
  return (
    <g>
      <circle cx="320" cy="140" r="104" className="fill-mint/5 stroke-mint/60" strokeWidth="2.5" />
      {[100, 62, 26].map((rx) => <ellipse key={rx} cx="320" cy="140" rx={rx} ry="104" className="fill-none stroke-mint/25" strokeWidth="1.5" />)}
      {[-60, -20, 20, 60].map((dy) => <ellipse key={dy} cx="320" cy={140 + dy} rx={Math.sqrt(104 * 104 - dy * dy)} ry="10" className="fill-none stroke-mint/20" strokeWidth="1.2" />)}
      {users.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="3.5" className="fill-amber" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.7] }} transition={{ delay: 0.3 + i * 0.15, duration: 1 }} />
      ))}
      {pins.map((p, i) => (
        <motion.g key={i} initial={{ opacity: 0, y: -26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.5, type: "spring", stiffness: 200, damping: 12 }}>
          <motion.circle cx={p.x} cy={p.y} r="8" className="fill-none stroke-mint" strokeWidth="2" animate={{ scale: [1, 2.6], opacity: [0.8, 0] }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3 }} />
          <circle cx={p.x} cy={p.y} r="7" className="fill-mint stroke-background" strokeWidth="2.5" />
        </motion.g>
      ))}
      <text x="110" y="136" textAnchor="middle" className="fill-mint font-mono text-[10px] font-semibold uppercase tracking-wider">AWS Regions</text>
      <circle cx="68" cy="136" r="5" className="fill-mint" />
      <text x="530" y="136" textAnchor="middle" className="fill-amber font-mono text-[10px] font-semibold uppercase tracking-wider">Users nearby</text>
      <circle cx="580" cy="136" r="4" className="fill-amber" />
      <Pill x={320} y={246} w={250} text="Deploy closer to users" tone="mint" delay={3} />
    </g>
  );
}

export function SixAdvantagesVisual({ caption }: { caption: string }) {
  return (
    <StoryPlayer
      caption={caption}
      scenes={SIX}
      viewBox="0 0 640 275"
      sceneMs={9000}
      render={(s) => [<VariableScene key="a" />, <ScaleScene key="b" />, <CapacityScene key="c" />, <AgilityScene key="d" />, <UpkeepScene key="e" />, <GlobalScene key="f" />][s]}
    />
  );
}

/* ======================================================================
   3. EXAMPLE: expanding from the United States to Europe
   ====================================================================== */

const EU_SCENES = [
  { label: "Expand", note: "An e-commerce startup operates in the United States and wants to expand to Europe." },
  { label: "Deploy", note: "With AWS, the company can deploy application infrastructure in a European AWS Region, and provision it without building a European data center." },
  { label: "Major sale", note: "The company can add computing capacity during major sales." },
  { label: "Afterward", note: "Afterward, the company can reduce unnecessary capacity." },
] as const;

type Srv = "off" | "on" | "extra";
const EU_STATES: Srv[][] = [
  ["off", "off", "off", "off", "off", "off"],
  ["on", "on", "off", "off", "off", "off"],
  ["on", "on", "extra", "extra", "extra", "extra"],
  ["on", "on", "off", "off", "off", "off"],
];
const EU_PREV: Srv[][] = [EU_STATES[0], EU_STATES[0], EU_STATES[1], EU_STATES[2]];

function EuSlot({ i, x, y, state, prev }: { i: number; x: number; y: number; state: Srv; prev: Srv }) {
  const visible = state !== "off";
  const cls = state === "extra" ? "fill-amber/20 stroke-amber" : state === "on" ? "fill-mint/20 stroke-mint" : "fill-none stroke-hairline";
  return (
    <motion.g
      initial={{ opacity: prev === "off" ? 0 : 1, y: prev === "off" ? -26 : 0 }}
      animate={{ opacity: visible ? 1 : 0.25, y: visible ? 0 : -26 }}
      transition={{ type: "spring", stiffness: 170, damping: 15, delay: visible && prev === "off" ? 0.3 + i * 0.1 : !visible ? (5 - i) * 0.08 : 0 }}
    >
      <rect x={x} y={y} width="24" height="32" rx="5" className={cls} strokeWidth="1.8" strokeDasharray={visible ? undefined : "3 3"} />
      {visible ? <><circle cx={x + 8} cy={y + 8} r="2" className={state === "extra" ? "fill-amber" : "fill-mint"} /><circle cx={x + 16} cy={y + 8} r="2" className={state === "extra" ? "fill-amber" : "fill-mint"} /></> : null}
    </motion.g>
  );
}

const [USX, USY] = MAP_PINS.usRegion;
const [EUX, EUY] = MAP_PINS.euRegion;
const ARC = `M${USX} ${USY} Q ${(USX + EUX) / 2} 34 ${EUX} ${EUY}`;
const US_CARD = { x: USX - 100, y: 252, w: 200 };
const EU_CARD = { x: EUX - 112, y: 252, w: 224 };

function RegionPin({ x, y, tone, delay = 0 }: { x: number; y: number; tone: "mint"; delay?: number }) {
  return (
    <motion.g initial={{ opacity: 0, y: -26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 200, damping: 12 }}>
      <motion.circle cx={x} cy={y} r="8" className={"fill-none stroke-mint"} strokeWidth="2" animate={{ scale: [1, 2.8], opacity: [0.8, 0] }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ duration: 1.8, repeat: Infinity }} />
      <circle cx={x} cy={y} r="7" className="fill-mint stroke-background" strokeWidth="2.5" />
    </motion.g>
  );
}

function EuropeScene({ s }: { s: number }) {
  const euActive = s >= 1;
  return (
    <g>
      {/* real map outline: land, then the two countries groups on top */}
      <defs>
        <clipPath id="eu-map-clip"><rect x="8" y="30" width="624" height="202" rx="14" /></clipPath>
      </defs>
      <rect x="8" y="30" width="624" height="202" rx="14" className="fill-sky-500/5 stroke-hairline" />
      <g clipPath="url(#eu-map-clip)">
      <path d={MAP_LAND} className="fill-muted-foreground/15 stroke-muted-foreground/35" strokeWidth="0.8" strokeLinejoin="round" />
      <path d={MAP_US} className="fill-mint/25 stroke-mint" strokeWidth="1" strokeLinejoin="round" />
      <path d={MAP_EUROPE} className={euActive ? "fill-mint/25 stroke-mint" : "fill-muted-foreground/25 stroke-muted-foreground/50"} strokeWidth="1" strokeLinejoin="round" />
      </g>
      <text x="120" y="112" textAnchor="middle" className="fill-mint font-mono text-[10px] font-semibold uppercase tracking-wider">United States</text>
      <text x="462" y="62" textAnchor="middle" className={`${euActive ? "fill-mint" : "fill-muted-foreground"} font-mono text-[10px] font-semibold uppercase tracking-wider`}>Europe</text>

      {/* users */}
      {MAP_PINS.usUsers.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" className="fill-amber stroke-background" strokeWidth="1" />)}
      {MAP_PINS.euUsers.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="3.4" className="fill-amber stroke-background" strokeWidth="1" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }} />
      ))}

      {/* US region and its card */}
      <line x1={USX} y1={USY} x2={USX} y2={US_CARD.y} className="stroke-mint/60" strokeWidth="1.5" strokeDasharray="4 4" />
      <RegionPin x={USX} y={USY} tone="mint" />
      <rect x={US_CARD.x} y={US_CARD.y} width={US_CARD.w} height="62" rx="10" className="fill-mint/10 stroke-mint/70" strokeWidth="2" />
      <text x={USX} y={US_CARD.y + 17} textAnchor="middle" className="fill-mint font-mono text-[9.5px] uppercase tracking-wider">US Region</text>
      {[0, 1].map((i) => (
        <g key={i}>
          <rect x={USX - 29 + i * 34} y={US_CARD.y + 22} width="24" height="32" rx="5" className="fill-mint/20 stroke-mint" strokeWidth="1.8" />
          <circle cx={USX - 21 + i * 34} cy={US_CARD.y + 30} r="2" className="fill-mint" /><circle cx={USX - 13 + i * 34} cy={US_CARD.y + 30} r="2" className="fill-mint" />
        </g>
      ))}

      {/* before: a long way from European users */}
      {s === 0 ? (
        <>
          <path d={ARC} className="fill-none stroke-muted-foreground/60" strokeWidth="2" strokeDasharray="5 6" />
          <motion.circle r="4" className="fill-amber" style={{ offsetPath: `path("${ARC}")` }} initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }} />
          <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <circle cx={(USX + EUX) / 2} cy="96" r="15" className="fill-amber/20 stroke-amber/80" />
            <text x={(USX + EUX) / 2} y="102" textAnchor="middle" className="fill-amber font-mono text-[15px] font-bold">?</text>
          </motion.g>
          <text x={(USX + EUX) / 2} y="128" textAnchor="middle" className="fill-amber font-mono text-[10px] font-semibold uppercase tracking-wider">Far from users</text>
        </>
      ) : null}

      {/* after: a European Region next to the users */}
      {euActive ? (
        <>
          <motion.path d={ARC} className="fill-none stroke-mint" strokeWidth="2.5" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4 }} />
          <line x1={EUX} y1={EUY} x2={EUX} y2={EU_CARD.y} className="stroke-mint/60" strokeWidth="1.5" strokeDasharray="4 4" />
          {MAP_PINS.euUsers.map(([x, y], i) => (
            <g key={i}>
              <line x1={x} y1={y} x2={EUX} y2={EUY} className="stroke-mint/40" strokeWidth="1" />
              <motion.circle r="2.4" className="fill-mint" style={{ offsetPath: `path("M${x} ${y} L${EUX} ${EUY}")` }} initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear", delay: i * 0.15 }} />
            </g>
          ))}
          <RegionPin x={EUX} y={EUY} tone="mint" delay={0.2} />
          <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <rect x={EU_CARD.x} y={EU_CARD.y} width={EU_CARD.w} height="62" rx="10" className="fill-mint/10 stroke-mint" strokeWidth="2" />
            <text x={EUX} y={EU_CARD.y + 17} textAnchor="middle" className="fill-mint font-mono text-[9.5px] uppercase tracking-wider">European Region</text>
            {EU_STATES[s].map((st, i) => <EuSlot key={i} i={i} x={EU_CARD.x + 12 + i * 34} y={EU_CARD.y + 22} state={st} prev={EU_PREV[s][i]} />)}
          </motion.g>
        </>
      ) : null}

      {s === 0 ? <Pill x={320} y={0} w={290} text="Wants to expand to Europe" tone="amber" delay={0.2} /> : null}
      {s === 1 ? <Pill x={320} y={0} w={320} text="No European data center built" tone="mint" delay={1.2} /> : null}
      {s === 2 ? <Pill x={320} y={0} w={320} text="Add capacity during major sales" tone="amber" delay={0.8} /> : null}
      {s === 3 ? <Pill x={320} y={0} w={320} text="Reduce unnecessary capacity" tone="mint" delay={0.6} /> : null}
    </g>
  );
}

export function EuropeExpansionVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={EU_SCENES} viewBox="0 0 640 320" sceneMs={7500} render={(s) => <EuropeScene s={s} />} />;
}
