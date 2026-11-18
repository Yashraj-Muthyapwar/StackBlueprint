import type { ReactNode } from "react";
import { motion } from "motion/react";
import { StoryPlayer } from "../CloudFrame";

/* ---------------------------------------------------------------------
   Shared bits. Static class strings only so Tailwind can see them.
   --------------------------------------------------------------------- */

type Owner = "you" | "provider";

const TONE = {
  you: {
    card: "fill-amber/10 stroke-amber/70",
    ink: "fill-amber/20 stroke-amber",
    solid: "fill-amber",
    text: "fill-amber",
    pill: "fill-amber/15 stroke-amber/70",
  },
  provider: {
    card: "fill-mint/10 stroke-mint/70",
    ink: "fill-mint/20 stroke-mint",
    solid: "fill-mint",
    text: "fill-mint",
    pill: "fill-mint/15 stroke-mint/70",
  },
} as const;

function Pill({ x, y, w, text, tone, delay = 0.3 }: { x: number; y: number; w: number; text: string; tone: "amber" | "mint"; delay?: number }) {
  const t = tone === "amber" ? TONE.you : TONE.provider;
  return (
    <motion.g key={text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={x - w / 2} y={y} width={w} height="26" rx="13" className={t.pill} />
      <text x={x} y={y + 17} textAnchor="middle" className={`${t.text} font-mono text-[10.5px] font-semibold uppercase tracking-wider`}>{text}</text>
    </motion.g>
  );
}

function Tick({ x, y, delay, owner }: { x: number; y: number; delay: number; owner: Owner }) {
  const t = TONE[owner];
  return (
    <g>
      <motion.circle cx={x} cy={y} r="10" className={t.ink} strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 260, damping: 14 }} />
      <motion.path d={`M${x - 4.5} ${y + 0.5} l3.5 3.5 l6 -7`} className={`fill-none ${owner === "you" ? "stroke-amber" : "stroke-mint"}`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: delay + 0.1, duration: 0.35 }} />
    </g>
  );
}

/* ======================================================================
   1. INTUITION: getting food
   ====================================================================== */

const FOOD_SCENES = [
  { label: "IaaS", note: "IaaS: Rent a kitchen. You get the infrastructure but prepare the meal yourself." },
  { label: "PaaS", note: "PaaS: Meal kit service. Much of the preparation is handled, but you still create the meal." },
  { label: "SaaS", note: "SaaS: Restaurant. You receive a finished meal." },
] as const;

const FOOD_STAGES = ["Kitchen", "Prep", "Cook", "Serve"] as const;
const FOOD_OWNERS: Owner[][] = [
  ["provider", "you", "you", "you"],
  ["provider", "provider", "you", "you"],
  ["provider", "provider", "provider", "provider"],
];
const FOOD_PILL = [
  { text: "You prepare the meal", tone: "amber" as const, w: 220 },
  { text: "You still create the meal", tone: "amber" as const, w: 250 },
  { text: "A finished meal arrives", tone: "mint" as const, w: 240 },
];

function FoodIcon({ i, owner, cx, cy }: { i: number; owner: Owner; cx: number; cy: number }) {
  const t = TONE[owner];
  if (i === 0) {
    // stove
    return (
      <g>
        <rect x={cx - 26} y={cy - 18} width="52" height="38" rx="6" className={t.ink} strokeWidth="2" />
        <circle cx={cx - 11} cy={cy - 6} r="7" className="fill-background/60 stroke-foreground/30" strokeWidth="1.5" />
        <circle cx={cx + 11} cy={cy - 6} r="7" className="fill-background/60 stroke-foreground/30" strokeWidth="1.5" />
        <rect x={cx - 16} y={cy + 8} width="32" height="6" rx="3" className="fill-background/50" />
      </g>
    );
  }
  if (i === 1) {
    // cutting board with chopped pieces
    return (
      <g>
        <rect x={cx - 28} y={cy - 14} width="56" height="34" rx="6" className={t.ink} strokeWidth="2" />
        {[-16, -4, 8].map((dx, k) => (
          <motion.circle key={k} cx={cx + dx + 3} cy={cy + 3} r="5" className={t.solid} animate={{ y: [0, -4, 0] }} transition={{ duration: 1.1, repeat: Infinity, delay: k * 0.18 }} />
        ))}
        <rect x={cx + 14} y={cy - 22} width="6" height="22" rx="2" className="fill-foreground/40" transform={`rotate(25 ${cx + 17} ${cy - 11})`} />
      </g>
    );
  }
  if (i === 2) {
    // pot with steam
    return (
      <g>
        {[-12, 0, 12].map((dx, k) => (
          <motion.path key={k} d={`M${cx + dx} ${cy - 14} q-5 -7 0 -13`} className={`fill-none ${owner === "you" ? "stroke-amber" : "stroke-mint"}`} strokeWidth="2.2" strokeLinecap="round" animate={{ opacity: [0, 0.9, 0], y: [4, -5, -10] }} transition={{ duration: 1.8, repeat: Infinity, delay: k * 0.4 }} />
        ))}
        <rect x={cx - 24} y={cy - 8} width="48" height="28" rx="7" className={t.ink} strokeWidth="2" />
        <rect x={cx - 28} y={cy - 12} width="56" height="7" rx="3.5" className={t.solid} />
        <rect x={cx - 33} y={cy + 2} width="9" height="5" rx="2.5" className="fill-foreground/30" />
        <rect x={cx + 24} y={cy + 2} width="9" height="5" rx="2.5" className="fill-foreground/30" />
      </g>
    );
  }
  // plate
  return (
    <g>
      <circle cx={cx} cy={cy + 2} r="24" className={t.ink} strokeWidth="2" />
      <circle cx={cx} cy={cy + 2} r="14" className="fill-background/50 stroke-foreground/20" strokeWidth="1.5" />
      <motion.circle cx={cx} cy={cy + 2} r="8" className={t.solid} animate={{ scale: [1, 1.12, 1] }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ duration: 1.4, repeat: Infinity }} />
      <path d={`M${cx - 34} ${cy - 16} v28 M${cx - 38} ${cy - 16} v10 M${cx - 30} ${cy - 16} v10`} className="fill-none stroke-foreground/35" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

const CARD_W = 140;
const CARD_GAP = 16;
const CARD_X = (i: number) => 16 + i * (CARD_W + CARD_GAP);
const CARD_CX = (i: number) => CARD_X(i) + CARD_W / 2;

function FoodScene({ s }: { s: number }) {
  const owners = FOOD_OWNERS[s];
  const pill = FOOD_PILL[s];
  return (
    <g>
      {FOOD_STAGES.map((label, i) => {
        const owner = owners[i];
        const t = TONE[owner];
        return (
          <motion.g key={label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.14, type: "spring", stiffness: 160, damping: 16 }}>
            <rect x={CARD_X(i)} y="22" width={CARD_W} height="138" rx="12" className={t.card} strokeWidth="2" />
            <text x={CARD_CX(i)} y="46" textAnchor="middle" className="fill-foreground font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">{label}</text>
            <FoodIcon i={i} owner={owner} cx={CARD_CX(i)} cy={92} />
            <rect x={CARD_CX(i) - 38} y="130" width="76" height="20" rx="10" className={t.pill} />
            <text x={CARD_CX(i)} y="144" textAnchor="middle" className={`${t.text} font-mono text-[10px] font-bold uppercase tracking-wider`}>{owner === "you" ? "You" : "Provider"}</text>
          </motion.g>
        );
      })}
      {/* conveyor */}
      <line x1={CARD_CX(0)} y1="192" x2={CARD_CX(3)} y2="192" className="stroke-hairline" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      {FOOD_STAGES.map((_, i) => (
        <circle key={i} cx={CARD_CX(i)} cy="192" r="5" className={TONE[owners[i]].solid} />
      ))}
      <motion.g
        initial={{ x: CARD_CX(0) }}
        animate={{ x: [CARD_CX(0), CARD_CX(1), CARD_CX(2), CARD_CX(3)] }}
        transition={{ delay: 0.9, duration: 4.2, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}
      >
        <circle cx="0" cy="192" r="11" className="fill-background stroke-foreground/60" strokeWidth="2" />
        <circle cx="0" cy="192" r="5" className="fill-foreground/60" />
      </motion.g>
      <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 5.2, type: "spring", stiffness: 220, damping: 12 }} style={{ transformOrigin: `${CARD_CX(3) + 50}px 192px` }}>
        <circle cx={CARD_CX(3) + 50} cy="192" r="13" className="fill-mint/20 stroke-mint" strokeWidth="2" />
        <path d={`M${CARD_CX(3) + 44} 192 l4 4 l8 -9`} className="fill-none stroke-mint" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      <Pill x={320} y={232} w={pill.w} text={pill.text} tone={pill.tone} delay={0.9} />
    </g>
  );
}

export function FoodModelsVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={FOOD_SCENES} viewBox="0 0 640 268" sceneMs={7500} render={(s) => <FoodScene s={s} />} />;
}

/* ======================================================================
   2. HOW: who manages what
   ====================================================================== */

const RESP_SCENES = [
  { label: "IaaS", note: "IaaS: the customer manages the application and the runtime / OS. The provider manages the physical infrastructure." },
  { label: "PaaS", note: "PaaS: the customer manages the application. The provider manages the runtime / OS and the physical infrastructure." },
  { label: "SaaS", note: "SaaS: the provider manages the application, the runtime / OS, and the physical infrastructure." },
] as const;

const LAYERS = ["Application", "Runtime / OS", "Physical infrastructure"] as const;
const MODELS = ["IaaS", "PaaS", "SaaS"] as const;
const RESP: Owner[][] = [
  // columns: IaaS, PaaS, SaaS. rows: application, runtime/os, physical
  ["you", "you", "provider"],
  ["you", "provider", "provider"],
  ["provider", "provider", "provider"],
];
const COL_X = (c: number) => 214 + c * 138;
const ROW_Y = (r: number) => 52 + r * 58;

function ResponsibilityScene({ s }: { s: number }) {
  const mine = RESP[s].filter((o) => o === "you").length;
  return (
    <g>
      {LAYERS.map((l, r) => (
        <text key={l} x="196" y={ROW_Y(r) + 31} textAnchor="end" className="fill-muted-foreground font-mono text-[10.5px] uppercase tracking-wider">{l}</text>
      ))}
      {MODELS.map((m, c) => {
        const active = c === s;
        return (
          <motion.g key={m} initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0.32 }} transition={{ duration: 0.5 }}>
            <text x={COL_X(c) + 60} y="32" textAnchor="middle" className={`${active ? "fill-foreground" : "fill-muted-foreground"} font-mono text-[13px] font-bold tracking-wider`}>{m}</text>
            {active ? (
              <motion.rect x={COL_X(c) - 6} y="40" width="132" height="184" rx="14" className="fill-none stroke-foreground/40" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }} />
            ) : null}
            {LAYERS.map((_, r) => {
              const owner = RESP[r][c];
              const t = TONE[owner];
              const on = active;
              return (
                <motion.g key={r} initial={{ opacity: 0, scaleX: 0.2 }} animate={{ opacity: 1, scaleX: 1 }} style={{ transformBox: "fill-box", transformOrigin: "left" }} transition={{ delay: on ? 0.3 + (2 - r) * 0.28 : 0.1, duration: 0.5 }}>
                  <rect x={COL_X(c)} y={ROW_Y(r)} width="120" height="48" rx="9" className={t.card} strokeWidth="2" />
                  <text x={COL_X(c) + 60} y={ROW_Y(r) + 29} textAnchor="middle" className={`${t.text} font-mono text-[11px] font-bold uppercase tracking-wider`}>{owner === "you" ? "Customer" : "Provider"}</text>
                </motion.g>
              );
            })}
          </motion.g>
        );
      })}
      {/* ownership line follows the active column */}
      <Pill x={400} y={236} w={280} text={mine === 0 ? "You manage no infrastructure" : `You manage ${mine} of 3 layers`} tone={mine === 0 ? "mint" : "amber"} delay={1.1} />
      <g>
        <rect x="24" y="30" width="12" height="12" rx="3" className="fill-amber/20 stroke-amber" strokeWidth="1.5" />
        <text x="42" y="40" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider">Customer</text>
        <rect x="24" y="50" width="12" height="12" rx="3" className="fill-mint/20 stroke-mint" strokeWidth="1.5" />
        <text x="42" y="60" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider">Provider</text>
      </g>
    </g>
  );
}

export function ResponsibilityVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={RESP_SCENES} viewBox="0 0 640 272" sceneMs={7500} render={(s) => <ResponsibilityScene s={s} />} />;
}

/* ======================================================================
   3. EXAMPLE: deploying a Python web application
   ====================================================================== */

const APP_SCENES = [
  { label: "IaaS", note: "IaaS, Amazon EC2: you configure the server, the OS, and the application." },
  { label: "PaaS", note: "PaaS, AWS Elastic Beanstalk: you provide the application code and configure the environment." },
  { label: "SaaS", note: "SaaS, Google Workspace: you use and configure an existing application. There is no code of yours to deploy." },
] as const;

type Task = { text: string; owner: Owner };
const APP_TASKS: Task[][] = [
  [
    { text: "Configure the server", owner: "you" },
    { text: "Configure the OS", owner: "you" },
    { text: "Deploy the application", owner: "you" },
    { text: "AWS runs the data center", owner: "provider" },
  ],
  [
    { text: "Provide the application code", owner: "you" },
    { text: "Configure the environment", owner: "you" },
    { text: "AWS runs servers and OS", owner: "provider" },
  ],
  [
    { text: "Use the application", owner: "you" },
    { text: "Configure the application", owner: "you" },
    { text: "Google runs the software", owner: "provider" },
  ],
];

function TaskRow({ y, task, delay }: { y: number; task: Task; delay: number }) {
  const t = TONE[task.owner];
  return (
    <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.45 }}>
      <rect x="16" y={y} width="292" height="42" rx="10" className={t.card} strokeWidth="1.8" />
      <Tick x={40} y={y + 21} delay={delay + 0.4} owner={task.owner} />
      <text x="62" y={y + 26} className="fill-foreground text-[14px]">{task.text}</text>
    </motion.g>
  );
}

function Block({ x, y, w, h = 36, label, owner, delay, from = "top" }: { x: number; y: number; w: number; h?: number; label: string; owner: Owner; delay: number; from?: "top" | "fade" }) {
  const t = TONE[owner];
  return (
    <motion.g initial={from === "top" ? { opacity: 0, y: -90 } : { opacity: 0, scale: 0.85 }} animate={from === "top" ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 150, damping: 15 }}>
      <rect x={x} y={y} width={w} height={h} rx="8" className={t.ink} strokeWidth="2" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" className={`${t.text} font-mono text-[11px] font-bold uppercase tracking-wider`}>{label}</text>
    </motion.g>
  );
}

function IaasApp() {
  return (
    <g>
      <text x="470" y="34" textAnchor="middle" className="fill-amber font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">Amazon EC2</text>
      <Block x={360} y={206} w={220} label="AWS data center" owner="provider" delay={0.2} />
      <Block x={360} y={160} w={220} label="Server" owner="you" delay={0.9} />
      <Block x={360} y={114} w={220} label="Operating system" owner="you" delay={1.6} />
      <Block x={360} y={68} w={220} label="Python web app" owner="you" delay={2.3} />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.1 }}>
        <motion.circle cx="598" cy="86" r="5" className="fill-mint" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
        <text x="540" y="52" textAnchor="middle" className="fill-mint font-mono text-[10px] font-semibold uppercase tracking-wider">Running</text>
      </motion.g>
    </g>
  );
}

function PaasApp() {
  return (
    <g>
      <text x="480" y="34" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">AWS Elastic Beanstalk</text>
      <motion.rect x="372" y="48" width="236" height="194" rx="14" className="fill-mint/5 stroke-mint/70" strokeWidth="2" strokeDasharray="6 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
      <Block x={388} y={198} w={204} h={32} label="Servers" owner="provider" delay={1.4} from="fade" />
      <Block x={388} y={158} w={204} h={32} label="OS and runtime" owner="provider" delay={1.7} from="fade" />
      <Block x={388} y={118} w={204} h={32} label="Scaling" owner="provider" delay={2.0} from="fade" />
      {/* code packet flies in from the left */}
      <motion.g initial={{ x: -70, opacity: 0 }} animate={{ x: [-70, 0, 0], opacity: [0, 1, 1] }} transition={{ delay: 0.5, duration: 1.8, times: [0, 0.6, 1], ease: "easeOut" }}>
        <rect x="388" y="62" width="204" height="44" rx="9" className="fill-amber/20 stroke-amber" strokeWidth="2" />
        <text x="490" y="89" textAnchor="middle" className="fill-amber font-mono text-[12px] font-bold">your app code</text>
      </motion.g>
      <motion.path d="M330 84 H372" className="fill-none stroke-amber" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 1, 0.4] }} transition={{ delay: 0.3, duration: 1 }} />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }}>
        <circle cx="446" cy="262" r="5" className="fill-mint" />
        <text x="458" y="266" textAnchor="start" className="fill-mint font-mono text-[10px] font-semibold uppercase tracking-wider">Running</text>
      </motion.g>
    </g>
  );
}

function SaasApp() {
  const lines = [180, 150, 196, 120, 168];
  return (
    <g>
      <text x="480" y="34" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">Google Workspace</text>
      <motion.g initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 140, damping: 16 }}>
        <rect x="364" y="48" width="232" height="178" rx="12" className="fill-mint/5 stroke-mint/70" strokeWidth="2" />
        <path d="M364 60 a12 12 0 0 1 12 -12 h208 a12 12 0 0 1 12 12 v14 h-232 Z" className="fill-mint/20" />
        {[0, 1, 2].map((d) => <circle key={d} cx={380 + d * 14} cy="61" r="3.5" className="fill-mint/70" />)}
        {lines.map((w, i) => (
          <motion.rect key={i} x="382" y={92 + i * 24} height="10" rx="5" className={i === 0 ? "fill-mint/60" : "fill-muted-foreground/35"} initial={{ width: 0 }} animate={{ width: w }} transition={{ delay: 1 + i * 0.55, duration: 0.6 }} />
        ))}
      </motion.g>
      <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: "480px 238px" }} transition={{ delay: 3.4, type: "spring", stiffness: 220, damping: 12 }}>
        <rect x="396" y="236" width="168" height="24" rx="12" className="fill-mint/15 stroke-mint/70" />
        <text x="480" y="252" textAnchor="middle" className="fill-mint font-mono text-[10px] font-semibold uppercase tracking-wider">No code to deploy</text>
      </motion.g>
    </g>
  );
}

function AppScene({ s }: { s: number }): ReactNode {
  const tasks = APP_TASKS[s];
  return (
    <g>
      <text x="16" y="30" className="fill-muted-foreground font-mono text-[10.5px] uppercase tracking-[0.16em]">Deploying a Python web app</text>
      {tasks.map((t, i) => (
        <TaskRow key={t.text} y={46 + i * 52} task={t} delay={0.3 + i * 0.7} />
      ))}
      <line x1="326" y1="28" x2="326" y2="262" className="stroke-hairline" strokeDasharray="4 6" strokeWidth="2" />
      {s === 0 ? <IaasApp /> : s === 1 ? <PaasApp /> : <SaasApp />}
    </g>
  );
}

export function PythonAppVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={APP_SCENES} viewBox="0 0 640 276" sceneMs={8000} render={(s) => <AppScene s={s} />} />;
}
