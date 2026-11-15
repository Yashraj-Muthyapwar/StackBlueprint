import { motion } from "motion/react";
import { StoryPlayer } from "./CloudFrame";

/* Static class maps so Tailwind can see every class. */
type Tone = "mint" | "amber" | "muted";
const T = {
  mint: { box: "fill-mint/10 stroke-mint/70", ink: "fill-mint/25 stroke-mint", solid: "fill-mint", text: "fill-mint", line: "stroke-mint", pill: "fill-mint/15 stroke-mint/70" },
  amber: { box: "fill-amber/10 stroke-amber/70", ink: "fill-amber/25 stroke-amber", solid: "fill-amber", text: "fill-amber", line: "stroke-amber", pill: "fill-amber/15 stroke-amber/70" },
  muted: { box: "fill-muted-foreground/10 stroke-muted-foreground/50", ink: "fill-muted-foreground/20 stroke-muted-foreground/60", solid: "fill-muted-foreground", text: "fill-muted-foreground", line: "stroke-muted-foreground", pill: "fill-muted-foreground/10 stroke-muted-foreground/50" },
} as const;

function Pill({ x, y, w, text, tone }: { x: number; y: number; w: number; text: string; tone: Tone }) {
  const t = T[tone];
  return (
    <motion.g key={text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
      <rect x={x - w / 2} y={y} width={w} height="26" rx="13" className={t.pill} />
      <text x={x} y={y + 17} textAnchor="middle" className={`${t.text} font-mono text-[10.5px] font-semibold uppercase tracking-wider`}>{text}</text>
    </motion.g>
  );
}

function Label({ x, y, lines, tone = "muted" }: { x: number; y: number; lines: string[]; tone?: Tone }) {
  return (
    <g>
      {lines.map((l, i) => (
        <text key={l} x={x} y={y + i * 15} textAnchor="middle" className={`${T[tone].text} font-mono text-[10.5px] font-semibold uppercase tracking-wider`}>{l}</text>
      ))}
    </g>
  );
}

function Person({ x, y, tone, delay = 0 }: { x: number; y: number; tone: Tone; delay?: number }) {
  return (
    <motion.g animate={{ y: [0, -2.5, 0] }} transition={{ duration: 1 + (delay % 0.4), repeat: Infinity, delay }}>
      <g transform={`translate(${x} ${y})`}>
        <circle cx="0" cy="-20" r="5" className={T[tone].solid} />
        <rect x="-6" y="-13" width="12" height="15" rx="5" className={`${T[tone].solid} opacity-60`} />
      </g>
    </motion.g>
  );
}

function Lock({ x, y, tone }: { x: number; y: number; tone: Tone }) {
  return (
    <g>
      <path d={`M${x - 4} ${y} v-4 a4 4 0 0 1 8 0 v4`} className={`fill-none ${T[tone].line}`} strokeWidth="1.8" />
      <rect x={x - 6} y={y} width="12" height="9" rx="2" className={T[tone].solid} />
    </g>
  );
}

/** A stream of dots travelling along a straight horizontal line. */
function Flow({ x1, x2, y, tone, count = 3, dur = 2.2 }: { x1: number; x2: number; y: number; tone: Tone; count?: number; dur?: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <motion.circle key={i} cy={y} r="4" className={T[tone].solid} initial={{ cx: x1, opacity: 0 }} animate={{ cx: [x1, x2], opacity: [0, 1, 1, 0] }} transition={{ duration: dur, repeat: Infinity, delay: i * (dur / count), ease: "linear" }} />
      ))}
    </g>
  );
}

/* ======================================================================
   1. INTUITION: housing
   ====================================================================== */

const HOUSING_SCENES = [
  { label: "Public", note: "Public Cloud: An apartment building. Different tenants use separate spaces within shared infrastructure." },
  { label: "Private", note: "Private Cloud: A private house dedicated to one household." },
  { label: "Hybrid", note: "Hybrid Cloud: A private house plus rented space used when additional capacity is needed." },
] as const;

function Building({ x, y, cols, rows, tenants, unit = 44, gap = 10, delay = 0, hot }: { x: number; y: number; cols: number; rows: number; tenants: Tone[]; unit?: number; gap?: number; delay?: number; hot?: number }) {
  const w = cols * unit + (cols - 1) * gap + 28;
  const h = rows * (unit - 10) + (rows - 1) * gap + 28;
  return (
    <g>
      <motion.rect x={x} y={y} width={w} height={h} rx="10" className="fill-surface-2/60 stroke-foreground/30" strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} />
      {Array.from({ length: rows * cols }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const tone = hot === i ? "amber" : tenants[i % tenants.length];
        const ux = x + 14 + c * (unit + gap);
        const uy = y + 14 + r * (unit - 10 + gap);
        return (
          <motion.g key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: delay + 0.15 + (rows - 1 - r) * 0.18 + c * 0.05, type: "spring", stiffness: 200, damping: 14 }}>
            <rect x={ux} y={uy} width={unit} height={unit - 10} rx="6" className={T[tone].ink} strokeWidth="1.8" />
            <circle cx={ux + unit / 2} cy={uy + (unit - 10) / 2 - 3} r="4" className={T[tone].solid} />
            <rect x={ux + unit / 2 - 6} y={uy + (unit - 10) / 2 + 3} width="12" height="7" rx="3" className={`${T[tone].solid} opacity-60`} />
          </motion.g>
        );
      })}
    </g>
  );
}

function House({ cx, base, scale = 1, delay = 0, tone = "amber" as Tone }: { cx: number; base: number; scale?: number; delay?: number; tone?: Tone }) {
  const t = T[tone];
  return (
    <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 140, damping: 16 }}>
      <g transform={`translate(${cx} ${base}) scale(${scale})`}>
        <rect x="-70" y="-90" width="140" height="90" rx="6" className={t.ink} strokeWidth="2.2" />
        <path d="M-84 -88 L0 -150 L84 -88 Z" className={t.box} strokeWidth="2.2" strokeLinejoin="round" />
        <rect x="-14" y="-52" width="28" height="52" rx="5" className="fill-background/60 stroke-foreground/30" strokeWidth="1.8" />
        <rect x="-56" y="-74" width="30" height="26" rx="4" className="fill-background/60 stroke-foreground/30" strokeWidth="1.8" />
        <rect x="26" y="-74" width="30" height="26" rx="4" className="fill-background/60 stroke-foreground/30" strokeWidth="1.8" />
        <motion.circle cx="-41" cy="-61" r="4" className={t.solid} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="41" cy="-61" r="4" className={t.solid} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
      </g>
    </motion.g>
  );
}

function HousingScene({ s }: { s: number }) {
  if (s === 0) {
    const tenants: Tone[] = ["mint", "amber", "muted", "mint", "muted", "amber"];
    return (
      <g>
        <Building x={214} y={22} cols={4} rows={4} tenants={tenants} />
        <Label x={100} y={110} lines={["Shared", "infrastructure"]} tone="mint" />
        <path d="M184 40 q-14 0 -14 14 v120 q0 14 14 14" className="fill-none stroke-mint/60" strokeWidth="2" strokeLinecap="round" />
        <Label x={548} y={104} lines={["Separate", "tenants"]} />
        <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4, type: "spring", stiffness: 200, damping: 12 }} style={{ transformOrigin: "548px 140px" }}>
          <Lock x={548} y={132} tone="mint" />
          <text x="548" y="162" textAnchor="middle" className="fill-mint font-mono text-[10px] font-semibold uppercase tracking-wider">Isolated</text>
        </motion.g>
        <Pill x={320} y={238} w={300} text="Shared building, separate spaces" tone="mint" />
      </g>
    );
  }
  if (s === 1) {
    return (
      <g>
        <House cx={320} base={208} scale={1.15} />
        {[0, 1, 2].map((i) => <Person key={i} x={262 + i * 28} y={228} tone="amber" delay={i * 0.2} />)}
        <Label x={96} y={118} lines={["Dedicated", "infrastructure"]} tone="amber" />
        <Label x={548} y={118} lines={["One", "household"]} tone="amber" />
        <Pill x={320} y={238} w={280} text="Dedicated to one household" tone="amber" />
      </g>
    );
  }
  return (
    <g>
      <House cx={128} base={196} scale={1} />
      <Label x={128} y={222} lines={["Your house"]} tone="amber" />
      <Building x={380} y={40} cols={3} rows={3} tenants={["mint", "muted", "mint"]} unit={52} delay={0.3} hot={4} />
      <Label x={472} y={222} lines={["Rented space"]} tone="mint" />
      <path d="M214 130 C270 130 300 130 380 130" className="fill-none stroke-hairline" strokeWidth="2.5" strokeDasharray="5 6" />
      <Flow x1={214} x2={400} y={130} tone="amber" count={4} dur={2.6} />
      <Pill x={320} y={238} w={300} text="House plus rented capacity" tone="amber" />
    </g>
  );
}

export function HousingVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={HOUSING_SCENES} viewBox="0 0 640 272" sceneMs={7500} render={(s) => <HousingScene s={s} />} />;
}

/* ======================================================================
   2. HOW: public, private, hybrid
   ====================================================================== */

const MODEL_SCENES = [
  { label: "Public", note: "Public: provider infrastructure shared by multiple isolated customers." },
  { label: "Private", note: "Private: dedicated infrastructure for one organization, with resource pooling, automation, and self-service provisioning." },
  { label: "Hybrid", note: "Hybrid: connected private and public environments." },
] as const;

function Chip({ x, y, w, text, tone, delay }: { x: number; y: number; w: number; text: string; tone: Tone; delay: number }) {
  return (
    <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 160, damping: 16 }}>
      <rect x={x} y={y} width={w} height="34" rx="9" className={T[tone].ink} strokeWidth="2" />
      <text x={x + w / 2} y={y + 21} textAnchor="middle" className={`${T[tone].text} font-mono text-[10.5px] font-bold uppercase tracking-wider`}>{text}</text>
    </motion.g>
  );
}

function ModelScene({ s }: { s: number }) {
  if (s === 0) {
    const tenants: { name: string; tone: Tone }[] = [
      { name: "Customer A", tone: "mint" },
      { name: "Customer B", tone: "amber" },
      { name: "Customer C", tone: "muted" },
    ];
    return (
      <g>
        <motion.rect x="150" y="26" width="340" height="190" rx="16" className="fill-mint/5 stroke-mint/70" strokeWidth="2" strokeDasharray="7 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <text x="320" y="52" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">Provider infrastructure</text>
        {tenants.map((t, i) => (
          <motion.g key={t.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.3, type: "spring", stiffness: 150, damping: 15 }}>
            <rect x={170 + i * 108} y="72" width="98" height="120" rx="10" className={T[t.tone].box} strokeWidth="2" />
            <Lock x={219 + i * 108} y={84} tone={t.tone} />
            <Person x={219 + i * 108} y={160} tone={t.tone} delay={i * 0.2} />
            <text x={219 + i * 108} y="182" textAnchor="middle" className={`${T[t.tone].text} font-mono text-[9.5px] font-bold uppercase tracking-wider`}>{t.name}</text>
          </motion.g>
        ))}
        <Pill x={320} y={232} w={310} text="Multiple isolated customers" tone="mint" />
      </g>
    );
  }
  if (s === 1) {
    return (
      <g>
        <Person x={70} y={128} tone="amber" />
        <Person x={96} y={128} tone="amber" delay={0.2} />
        <Person x={122} y={128} tone="amber" delay={0.4} />
        <Label x={96} y={152} lines={["One", "organization"]} tone="amber" />
        <Flow x1={150} x2={196} y={110} tone="amber" count={2} dur={1.4} />
        <motion.rect x="196" y="26" width="418" height="190" rx="16" className="fill-amber/5 stroke-amber/70" strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <text x="405" y="52" textAnchor="middle" className="fill-amber font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">Dedicated infrastructure</text>
        <Chip x={216} y={72} w={178} text="Resource pooling" tone="amber" delay={0.5} />
        <Chip x={416} y={72} w={178} text="Automation" tone="amber" delay={0.9} />
        <Chip x={316} y={122} w={178} text="Self-service" tone="amber" delay={1.3} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.rect key={i} x={226 + i * 62} y="176" width="46" height="24" rx="5" className="fill-amber/20 stroke-amber" strokeWidth="1.6" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ delay: 1.8 + i * 0.12, duration: 1.6 }} />
        ))}
        <Pill x={320} y={232} w={320} text="Not just a traditional server room" tone="amber" />
      </g>
    );
  }
  return (
    <g>
      <motion.rect x="24" y="30" width="230" height="170" rx="14" className="fill-amber/5 stroke-amber/70" strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <text x="139" y="56" textAnchor="middle" className="fill-amber font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">Private / on-premises</text>
      <Chip x={44} y={80} w={190} text="Existing systems" tone="amber" delay={0.3} />
      <Chip x={44} y={128} w={190} text="Dedicated servers" tone="amber" delay={0.6} />
      <motion.rect x="386" y="30" width="230" height="170" rx="14" className="fill-mint/5 stroke-mint/70" strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
      <text x="501" y="56" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">Public cloud</text>
      <Chip x={406} y={80} w={190} text="Cloud services" tone="mint" delay={0.9} />
      <Chip x={406} y={128} w={190} text="Flexible capacity" tone="mint" delay={1.2} />
      <motion.line x1="254" y1="115" x2="386" y2="115" className="stroke-foreground/40" strokeWidth="3" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.5, duration: 0.8 }} />
      <Flow x1={254} x2={386} y={115} tone="amber" count={3} dur={2.4} />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>
        <Lock x={320} y={78} tone="mint" />
        <text x="320" y="104" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider">Connected</text>
      </motion.g>
      <Pill x={320} y={232} w={310} text="Connected private and public" tone="mint" />
    </g>
  );
}

export function DeploymentModelsVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={MODEL_SCENES} viewBox="0 0 640 268" sceneMs={8000} render={(s) => <ModelScene s={s} />} />;
}

/* ======================================================================
   3. EXAMPLE: a bank with a hybrid cloud
   ====================================================================== */

const BANK_SCENES = [
  { label: "Private data center", note: "A bank operates a sensitive legacy application in its private data center." },
  { label: "AWS", note: "It uses AWS for customer-facing web applications." },
  { label: "Connected", note: "It securely connects both environments through a VPN or a dedicated network connection. This is a hybrid cloud architecture." },
] as const;

function BankScene({ s }: { s: number }) {
  return (
    <g>
      <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <rect x="24" y="52" width="196" height="152" rx="14" className="fill-amber/5 stroke-amber/70" strokeWidth="2" />
        <text x="122" y="76" textAnchor="middle" className="fill-amber font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]">Bank data center</text>
        <rect x="44" y="94" width="156" height="46" rx="9" className="fill-amber/20 stroke-amber" strokeWidth="2" />
        <text x="122" y="115" textAnchor="middle" className="fill-amber font-mono text-[10px] font-bold uppercase tracking-wider">Legacy application</text>
        <text x="122" y="129" textAnchor="middle" className="fill-amber/80 font-mono text-[9px] uppercase tracking-wider">Sensitive</text>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={44 + i * 54} y="154" width="48" height="30" rx="6" className="fill-amber/10 stroke-amber/60" strokeWidth="1.6" />
        ))}
        <Lock x={186} y={98} tone="amber" />
      </motion.g>
      {s >= 1 ? (
        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <rect x="420" y="86" width="196" height="118" rx="14" className="fill-mint/5 stroke-mint/70" strokeWidth="2" />
          <text x="518" y="110" textAnchor="middle" className="fill-mint font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]">AWS</text>
          <rect x="440" y="124" width="156" height="60" rx="9" className="fill-mint/20 stroke-mint" strokeWidth="2" />
          <text x="518" y="150" textAnchor="middle" className="fill-mint font-mono text-[10px] font-bold uppercase tracking-wider">Customer-facing</text>
          <text x="518" y="166" textAnchor="middle" className="fill-mint font-mono text-[10px] font-bold uppercase tracking-wider">web applications</text>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <Person x={470 + i * 48} y={50} tone="mint" delay={i * 0.25} />
              <motion.path d={`M${470 + i * 48} 54 V84`} className="fill-none stroke-mint/60" strokeWidth="2" strokeDasharray="3 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 + i * 0.2, duration: 0.5 }} />
            </g>
          ))}
          <text x="616" y="14" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-wider" textAnchor="end">Customers</text>
        </motion.g>
      ) : null}
      {s >= 2 ? (
        <g>
          <motion.path d="M220 144 H420" className="fill-none stroke-foreground/50" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
          <motion.path d="M220 144 H420" className="fill-none stroke-background" strokeWidth="1.6" strokeDasharray="2 8" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
          <Flow x1={220} x2={420} y={144} tone="amber" count={3} dur={2.2} />
          <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, type: "spring", stiffness: 200, damping: 12 }} style={{ transformOrigin: "320px 114px" }}>
            <rect x="240" y="98" width="160" height="30" rx="15" className="fill-surface-2 stroke-foreground/30" strokeWidth="1.8" />
            <text x="320" y="117" textAnchor="middle" className="fill-foreground font-mono text-[10px] font-bold uppercase tracking-wider">VPN or direct link</text>
          </motion.g>
          <Pill x={320} y={228} w={290} text="Hybrid cloud architecture" tone="mint" />
        </g>
      ) : null}
    </g>
  );
}

export function BankHybridVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={BANK_SCENES} viewBox="0 0 640 264" sceneMs={7500} render={(s) => <BankScene s={s} />} />;
}
