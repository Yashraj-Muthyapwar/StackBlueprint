import type { ReactNode } from "react";
import { motion } from "motion/react";
import { StoryPlayer } from "../CloudFrame";
import { REGION_PINS, USER_SPOTS, WORLD_INDIA, WORLD_LAND, WORLD_VIEW } from "./world-map-data";

/* ---------------------------------------------------------------------
   Shared bits. Static Tailwind classes only.
   --------------------------------------------------------------------- */

type Tone = "mint" | "amber" | "red" | "muted";
const T = {
  mint: { box: "fill-mint/10 stroke-mint/70", ink: "fill-mint/20 stroke-mint", solid: "fill-mint", text: "fill-mint", line: "stroke-mint", pill: "fill-mint/15 stroke-mint/70" },
  amber: { box: "fill-amber/10 stroke-amber/70", ink: "fill-amber/20 stroke-amber", solid: "fill-amber", text: "fill-amber", line: "stroke-amber", pill: "fill-amber/15 stroke-amber/70" },
  red: { box: "fill-red-500/10 stroke-red-500/70", ink: "fill-red-500/20 stroke-red-500", solid: "fill-red-500", text: "fill-red-500", line: "stroke-red-500", pill: "fill-red-500/15 stroke-red-500/70" },
  muted: { box: "fill-muted-foreground/5 stroke-muted-foreground/40", ink: "fill-muted-foreground/15 stroke-muted-foreground/50", solid: "fill-muted-foreground/60", text: "fill-muted-foreground", line: "stroke-muted-foreground/50", pill: "fill-muted-foreground/10 stroke-muted-foreground/40" },
} as const;

function Pill({ x, y, w, text, tone, delay = 0.9 }: { x: number; y: number; w: number; text: string; tone: Tone; delay?: number }) {
  const t = T[tone];
  return (
    <motion.g key={text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={x - w / 2} y={y} width={w} height="26" rx="13" className={`${t.pill} fill-background/80`} />
      <rect x={x - w / 2} y={y} width={w} height="26" rx="13" className={t.pill} />
      <text x={x} y={y + 17} textAnchor="middle" className={`${t.text} font-mono text-[10.5px] font-semibold uppercase tracking-wider`}>{text}</text>
    </motion.g>
  );
}

function Person({ x, y, tone, scale = 1, delay = 0 }: { x: number; y: number; tone: Tone; scale?: number; delay?: number }) {
  return (
    <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 1.1 + (delay % 0.4), repeat: Infinity, delay }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <circle cx="0" cy="-12" r="4.2" className={T[tone].solid} />
        <rect x="-5" y="-7" width="10" height="11" rx="4" className={`${T[tone].solid} opacity-70`} />
      </g>
    </motion.g>
  );
}

/* ---------------------------------------------------------------------
   World map. The land comes from Natural Earth (public domain), projected
   once into a 1000 x 500 box; each layout places that box on the canvas.
   --------------------------------------------------------------------- */

type Layout = { id: string; x: number; y: number; s: number };
const FULL: Layout = { id: "full", x: 8, y: 6, s: 0.624 };
const SPLIT: Layout = { id: "split", x: 8, y: 26, s: 0.38 };

const PIN = Object.fromEntries(REGION_PINS.map((p) => [p.code, p]));
const at = (L: Layout, code: string): [number, number] => [L.x + PIN[code].x * L.s, L.y + PIN[code].y * L.s];
const atXY = (L: Layout, p: number[]): [number, number] => [L.x + p[0] * L.s, L.y + p[1] * L.s];

function WorldMap({ L, india = false, delay = 0 }: { L: Layout; india?: boolean; delay?: number }) {
  const w = WORLD_VIEW.width * L.s;
  const h = WORLD_VIEW.height * L.s;
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.5 }}>
      <clipPath id={`world-clip-${L.id}`}>
        <rect x={L.x} y={L.y} width={w} height={h} rx={12} />
      </clipPath>
      <rect x={L.x} y={L.y} width={w} height={h} rx={12} className="fill-mint/5 stroke-hairline" strokeWidth="1.5" />
      <g clipPath={`url(#world-clip-${L.id})`}>
        <g transform={`translate(${L.x} ${L.y}) scale(${L.s})`}>
          <path d={WORLD_LAND} className="fill-muted-foreground/20 stroke-muted-foreground/45" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          {india ? <path d={WORLD_INDIA} className="fill-amber/25 stroke-amber" strokeWidth="1.4" vectorEffect="non-scaling-stroke" /> : null}
        </g>
      </g>
    </motion.g>
  );
}

/** A Region marker with a soft pulse. */
function Marker({ x, y, tone = "mint", r = 3.2, pulse = true, delay = 0, ring = false }: { x: number; y: number; tone?: Tone; r?: number; pulse?: boolean; delay?: number; ring?: boolean }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 260, damping: 14 }}>
      {pulse ? (
        <motion.circle cx={x} cy={y} r={r * 1.7} className={`${T[tone].solid} opacity-30`} animate={{ scale: [0.6, 1.2], opacity: [0.45, 0] }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ duration: 1.8, repeat: Infinity, delay: delay % 1.2 }} />
      ) : null}
      <circle cx={x} cy={y} r={r} className={ring ? `fill-background ${T[tone].line}` : T[tone].solid} strokeWidth={ring ? 2 : 0} strokeDasharray={ring ? "3 2.5" : undefined} />
    </motion.g>
  );
}

function Arc({ a, b, tone = "mint", delay = 0, dashed = true, lift = 40, dots = 0, dur = 2.4 }: { a: number[]; b: number[]; tone?: Tone; delay?: number; dashed?: boolean; lift?: number; dots?: number; dur?: number }) {
  const mx = (a[0] + b[0]) / 2;
  const my = Math.min(a[1], b[1]) - lift;
  const d = `M${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  return (
    <g>
      <motion.path d={d} className={`fill-none ${T[tone].line}`} strokeWidth="2" strokeLinecap="round" strokeDasharray={dashed ? "5 5" : undefined} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay, duration: 0.9 }} />
      {Array.from({ length: dots }, (_, i) => (
        <motion.circle key={i} r="3.4" className={T[tone].solid} style={{ offsetPath: `path('${d}')` }} initial={{ offsetDistance: "0%", opacity: 0 }} animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 1, 0] }} transition={{ duration: dur, repeat: Infinity, delay: delay + 0.9 + (i * dur) / dots, ease: "linear" }} />
      ))}
    </g>
  );
}

function Tag({ x, y, text, tone, anchor = "middle", delay = 0.4 }: { x: number; y: number; text: string; tone: Tone; anchor?: "middle" | "start" | "end"; delay?: number }) {
  const w = text.length * 6.3 + 16;
  const rx = anchor === "middle" ? x - w / 2 : anchor === "start" ? x : x - w;
  return (
    <motion.g initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={rx} y={y - 12} width={w} height="20" rx="6" className="fill-background/90" />
      <rect x={rx} y={y - 12} width={w} height="20" rx="6" className={T[tone].pill} />
      <text x={rx + w / 2} y={y + 2} textAnchor="middle" className={`${T[tone].text} font-mono text-[10px] font-bold tracking-wider`}>{text}</text>
    </motion.g>
  );
}

/* ======================================================================
   1. INTUITION: AWS as a hotel chain
   ====================================================================== */

const HOTEL_SCENES = [
  { label: "AWS", note: "AWS: The hotel company." },
  { label: "Region", note: "Region: A hotel location in a particular city." },
  { label: "Availability Zone", note: "Availability Zone: A separate building within that location." },
  { label: "Independent", note: "Different Regions operate independently, although AWS provides ways to connect them." },
] as const;

function Hotel({ x, base, w, h, tone = "mint", delay = 0, label }: { x: number; base: number; w: number; h: number; tone?: Tone; delay?: number; label?: string }) {
  const cols = Math.max(2, Math.floor(w / 26));
  const rows = Math.max(1, Math.floor((h - 34) / 24));
  return (
    <motion.g initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 130, damping: 15 }}>
      <rect x={x} y={base - h} width={w} height={h} rx="6" className={T[tone].ink} strokeWidth="2" />
      <rect x={x + 6} y={base - h - 12} width={w - 12} height="12" rx="3" className={T[tone].solid} />
      {Array.from({ length: rows * cols }, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const gap = (w - 16) / cols;
        return (
          <motion.rect key={i} x={x + 8 + c * gap + gap * 0.12} y={base - h + 12 + r * 24} width={gap * 0.64} height="13" rx="2.5" className={T[tone].solid} initial={{ opacity: 0.25 }} animate={{ opacity: [0.25, 0.9, 0.25] }} transition={{ duration: 2.4 + (i % 4) * 0.5, repeat: Infinity, delay: (i * 0.37) % 2 }} />
        );
      })}
      <rect x={x + w / 2 - 9} y={base - 24} width="18" height="24" rx="4" className="fill-background/70 stroke-foreground/30" strokeWidth="1.5" />
      {label ? <text x={x + w / 2} y={base + 18} textAnchor="middle" className={`${T[tone].text} font-mono text-[11px] font-bold uppercase tracking-wider`}>{label}</text> : null}
    </motion.g>
  );
}

function Fence({ x, y, w, h, tone, label, delay = 0.4 }: { x: number; y: number; w: number; h: number; tone: Tone; label: string; delay?: number }) {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
      <rect x={x} y={y} width={w} height={h} rx="14" className={`fill-none ${T[tone].line}`} strokeWidth="2" strokeDasharray="7 5" />
      <text x={x + w / 2} y={y - 8} textAnchor="middle" className={`${T[tone].text} font-mono text-[11px] font-bold uppercase tracking-[0.14em]`}>{label}</text>
    </motion.g>
  );
}

const MINI: Layout = { id: "mini", x: 340, y: 66, s: 0.28 };
const LEFT_CX = 160;
const RIGHT_CX = 480;

function Panel({ x, title, tone }: { x: number; title: string; tone: Tone }) {
  return (
    <g>
      <rect x={x} y="32" width="296" height="214" rx="14" className={`${T[tone].box} fill-background/40`} strokeWidth="2" />
      <text x={x + 148} y="54" textAnchor="middle" className={`${T[tone].text} font-mono text-[11px] font-bold uppercase tracking-[0.18em]`}>{title}</text>
    </g>
  );
}

function SmallSkyline({ x0, x1, base }: { x0: number; x1: number; base: number }) {
  const blocks: [number, number, number][] = [[0, 26, 40], [30, 22, 62], [x1 - x0 - 52, 22, 54], [x1 - x0 - 26, 26, 36]];
  return (
    <g>
      {blocks.map(([dx, w, h], i) => (
        <motion.rect key={i} x={x0 + dx} y={base - h} width={w} height={h} rx="3" className="fill-muted-foreground/15 stroke-muted-foreground/30" strokeWidth="1.4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }} />
      ))}
      <line x1={x0} y1={base} x2={x1} y2={base} className="stroke-foreground/25" strokeWidth="2" />
    </g>
  );
}

function LabelChip({ cx, y, text, tone, delay = 0.9 }: { cx: number; y: number; text: string; tone: Tone; delay?: number }) {
  const w = text.length * 7 + 28;
  return (
    <motion.g key={text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={cx - w / 2} y={y} width={w} height="26" rx="13" className={`${T[tone].pill} fill-background/80`} />
      <rect x={cx - w / 2} y={y} width={w} height="26" rx="13" className={T[tone].pill} />
      <text x={cx} y={y + 17} textAnchor="middle" className={`${T[tone].text} font-mono text-[11px] font-bold uppercase tracking-wider`}>{text}</text>
    </motion.g>
  );
}

function MiniMap({ pins, hot = [], link, delay = 0 }: { pins: boolean; hot?: string[]; link?: [string, string]; delay?: number }) {
  return (
    <g>
      <WorldMap L={MINI} delay={delay} />
      {pins
        ? REGION_PINS.map((p, i) => {
            const [x, y] = atXY(MINI, [p.x, p.y]);
            return <Marker key={p.code} x={x} y={y} r={2.6} delay={0.4 + i * 0.07} />;
          })
        : REGION_PINS.filter((p) => !hot.includes(p.code)).map((p) => {
            const [x, y] = atXY(MINI, [p.x, p.y]);
            return <Marker key={p.code} x={x} y={y} r={1.6} pulse={false} tone="muted" delay={0.1} />;
          })}
      {hot.map((code, i) => {
        const [x, y] = at(MINI, code);
        return (
          <g key={code}>
            <Marker x={x} y={y} r={4.6} delay={0.6 + i * 0.3} />
            <Tag x={x + (code === "eu-west-1" ? -34 : code === "us-east-1" ? 4 : 0)} y={y + (code === "us-east-1" ? 22 : -16)} text={code} tone="mint" delay={0.9 + i * 0.3} />
          </g>
        );
      })}
      {link ? <Arc a={at(MINI, link[0])} b={at(MINI, link[1])} tone="mint" lift={30} delay={1.4} dots={2} dur={2.6} /> : null}
    </g>
  );
}

function HotelScene({ s }: { s: number }) {
  const base = 178;
  return (
    <g>
      <Panel x={12} title="Hotel chain" tone="amber" />
      <Panel x={332} title="AWS" tone="mint" />
      <motion.g key={`eq${s}`} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: "spring", stiffness: 240, damping: 12 }} style={{ transformOrigin: "320px 139px" }}>
        <circle cx="320" cy="139" r="14" className="fill-background stroke-foreground/50" strokeWidth="2" />
        <text x="320" y="144" textAnchor="middle" className="fill-foreground font-mono text-[16px] font-bold">=</text>
      </motion.g>

      {s === 0 ? (
        <g>
          {/* left: the hotel company */}
          <motion.g initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 150, damping: 14 }}>
            <rect x={LEFT_CX - 62} y="70" width="124" height="46" rx="10" className={T.amber.ink} strokeWidth="2.4" />
            <text x={LEFT_CX} y="99" textAnchor="middle" className="fill-amber font-mono text-[14px] font-bold tracking-[0.12em]">HOTEL CO.</text>
          </motion.g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <path d={`M${LEFT_CX} 116 L${LEFT_CX - 84 + i * 56} 142`} className="fill-none stroke-hairline" strokeWidth="2" strokeDasharray="3 4" />
              <Hotel x={LEFT_CX - 104 + i * 56} base={190} w={40} h={50} delay={0.4 + i * 0.15} />
            </g>
          ))}
          <LabelChip cx={LEFT_CX} y={208} text="Hotel company" tone="amber" />
          {/* right: AWS */}
          <MiniMap pins delay={0.2} />
          <LabelChip cx={RIGHT_CX} y={208} text="AWS" tone="mint" />
        </g>
      ) : null}

      {s === 1 ? (
        <g>
          <SmallSkyline x0={34} x1={286} base={base} />
          <Fence x={96} y={92} w={128} h={base - 92} tone="amber" label="One location" />
          <Hotel x={118} base={base - 4} w={84} h={70} delay={0.4} />
          <text x={LEFT_CX} y={base + 16} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.16em]">A particular city</text>
          <LabelChip cx={LEFT_CX} y={208} text="Hotel location" tone="amber" />
          <MiniMap pins={false} hot={["eu-west-1"]} />
          <LabelChip cx={RIGHT_CX} y={208} text="Region" tone="mint" />
        </g>
      ) : null}

      {s === 2 ? (
        <g>
          <SmallSkyline x0={34} x1={286} base={base} />
          <Fence x={50} y={78} w={220} h={base - 78} tone="amber" label="One location" />
          {[0, 1, 2].map((i) => (
            <Hotel key={i} x={64 + i * 68} base={base - 6} w={54} h={64} delay={0.4 + i * 0.3} label={`B${i + 1}`} />
          ))}
          <LabelChip cx={LEFT_CX} y={208} text="Separate building" tone="amber" />
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <rect x="352" y="70" width="256" height="122" rx="12" className={`${T.mint.box} fill-background/60`} strokeWidth="2" />
            <text x="368" y="90" className="fill-foreground text-[12px] font-semibold">Region</text>
            <text x="368" y="104" className="fill-mint font-mono text-[10px] font-bold">eu-west-1</text>
          </motion.g>
          {[0, 1, 2].map((i) => (
            <motion.g key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.3 }}>
              <rect x={364 + i * 80} y="114" width="72" height="68" rx="8" className="fill-mint/5 stroke-mint/60" strokeWidth="1.6" strokeDasharray="4 3" />
              <text x={400 + i * 80} y="132" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold">AZ {i + 1}</text>
              <rect x={376 + i * 80} y="142" width="48" height="28" rx="5" className="fill-mint/20 stroke-mint" strokeWidth="1.3" />
            </motion.g>
          ))}
          <LabelChip cx={RIGHT_CX} y={208} text="Availability Zone" tone="mint" />
        </g>
      ) : null}

      {s === 3 ? (
        <g>
          <SmallSkyline x0={26} x1={294} base={base} />
          <Fence x={40} y={96} w={98} h={base - 96} tone="amber" label="City A" />
          <Fence x={182} y={96} w={98} h={base - 96} tone="amber" label="City B" />
          <Hotel x={58} base={base - 4} w={62} h={64} delay={0.3} />
          <Hotel x={200} base={base - 4} w={62} h={64} delay={0.5} />
          <line x1="138" y1="140" x2="182" y2="140" className="stroke-foreground/40" strokeWidth="2.5" strokeDasharray="5 5" />
          {[0, 1].map((i) => (
            <motion.circle key={i} cy="140" r="3.4" className="fill-foreground/70" initial={{ cx: 138, opacity: 0 }} animate={{ cx: [138, 182], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 1 + i * 0.9, ease: "linear" }} />
          ))}
          <LabelChip cx={LEFT_CX} y={208} text="Run independently" tone="amber" />
          <MiniMap pins={false} hot={["us-east-1", "eu-west-1"]} link={["us-east-1", "eu-west-1"]} />
          <LabelChip cx={RIGHT_CX} y={208} text="Independent Regions" tone="mint" />
        </g>
      ) : null}

      <Pill x={320} y={262} w={460} text={["Company = AWS", "Location = Region", "Building = Availability Zone", "Independent, yet connectable"][s]} tone="mint" delay={1.2} />
    </g>
  );
}

export function HotelChainVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={HOTEL_SCENES} viewBox="0 0 640 302" sceneMs={8000} render={(s) => <HotelScene s={s} />} />;
}

/* ======================================================================
   2. HOW: deploying into a Region
   ====================================================================== */

const HOW_SCENES = [
  { label: "1. Select", note: "1. Select an AWS Region." },
  { label: "2. Create", note: "2. Create resources such as EC2 or RDS in that Region." },
  { label: "3. Hosted", note: "3. AWS hosts those resources within its regional infrastructure." },
  { label: "4. Separately", note: "4. Deploy resources in other Regions separately when needed. Creating an EC2 instance in Virginia does not automatically create another in Ireland." },
] as const;

const STEPS = ["Select an AWS Region", "Create resources in it", "AWS hosts them regionally", "Other Regions are separate"];

function Steps({ s }: { s: number }) {
  return (
    <g>
      {STEPS.map((t, i) => (
        <g key={t} opacity={i === s ? 1 : 0.45}>
          <circle cx="22" cy={246 + i * 20} r="7.5" className={i === s ? "fill-mint/25 stroke-mint" : "fill-none stroke-muted-foreground/50"} strokeWidth="1.6" />
          <text x="22" y={250 + i * 20} textAnchor="middle" className={`${i === s ? "fill-mint" : "fill-muted-foreground"} font-mono text-[9.5px] font-bold`}>{i + 1}</text>
          <text x="38" y={250 + i * 20} className={`${i === s ? "fill-foreground" : "fill-muted-foreground"} text-[12px] ${i === s ? "font-semibold" : ""}`}>{t}</text>
        </g>
      ))}
    </g>
  );
}

function Chip({ x, y, w, text, tone, delay = 0, h = 26 }: { x: number; y: number; w: number; text: string; tone: Tone; delay?: number; h?: number }) {
  return (
    <motion.g initial={{ opacity: 0, y: -26, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, type: "spring", stiffness: 170, damping: 14 }}>
      <rect x={x} y={y} width={w} height={h} rx="7" className={T[tone].ink} strokeWidth="1.8" />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" className={`${T[tone].text} font-mono text-[10.5px] font-bold uppercase tracking-wider`}>{text}</text>
    </motion.g>
  );
}

function HowScene({ s }: { s: number }) {
  const L = SPLIT;
  const us = at(L, "us-east-1");
  const eu = at(L, "eu-west-1");
  const px = 404;
  return (
    <g>
      <WorldMap L={L} />
      <text x={L.x + 4} y="18" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.16em]">AWS Global Infrastructure</text>
      {REGION_PINS.filter((p) => p.code !== "us-east-1" && p.code !== "eu-west-1").map((p, i) => {
        const [x, y] = atXY(L, [p.x, p.y]);
        return <Marker key={p.code} x={x} y={y} r={1.9} pulse={false} tone="muted" delay={0.1 + i * 0.02} />;
      })}
      <Marker x={us[0]} y={us[1]} r={s === 0 ? 4.6 : 4} delay={0.2} tone="mint" />
      {s === 3 ? <Marker x={eu[0]} y={eu[1]} r={4} delay={0.4} tone="amber" /> : <Marker x={eu[0]} y={eu[1]} r={2.6} pulse={false} tone="muted" delay={0.2} />}
      <Tag x={us[0] - 4} y={us[1] + 22} text="us-east-1" tone="mint" anchor="middle" delay={0.5} />
      {s === 3 ? <Tag x={eu[0] + 20} y={eu[1] - 18} text="eu-west-1" tone="amber" anchor="middle" delay={0.5} /> : null}
      <Steps s={s} />

      {/* right panel */}
      {s === 0 ? (
        <g>
          <motion.rect x={px} y="28" width="228" height="212" rx="12" className="fill-background/70 stroke-hairline" strokeWidth="1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
          <text x={px + 114} y="52" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.16em]">Choose a Region</text>
          {[
            { n: "US East (N. Virginia)", c: "us-east-1", pick: true },
            { n: "Europe (Ireland)", c: "eu-west-1" },
            { n: "Asia Pacific (Mumbai)", c: "ap-south-1" },
            { n: "Asia Pacific (Tokyo)", c: "ap-northeast-1" },
          ].map((r, i) => (
            <motion.g key={r.c} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }}>
              <rect x={px + 12} y={66 + i * 42} width="204" height="34" rx="8" className={r.pick ? "fill-mint/10 stroke-mint/60" : "fill-muted-foreground/5 stroke-hairline"} strokeWidth="1.6" />
              <text x={px + 24} y={80 + i * 42} className="fill-foreground text-[11.5px] font-medium">{r.n}</text>
              <text x={px + 24} y={93 + i * 42} className="fill-muted-foreground font-mono text-[9.5px]">{r.c}</text>
              {r.pick ? (
                <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6, type: "spring", stiffness: 260, damping: 12 }} style={{ transformOrigin: `${px + 198}px ${83}px` }}>
                  <circle cx={px + 198} cy="83" r="9" className="fill-mint/20 stroke-mint" strokeWidth="1.8" />
                  <path d={`M${px + 193} 83 l3.5 3.5 l6 -7`} className="fill-none stroke-mint" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </motion.g>
              ) : null}
            </motion.g>
          ))}
          <motion.g initial={{ x: 40, y: 70, opacity: 0 }} animate={{ x: [40, 0, 0], y: [70, 0, 0], opacity: [0, 1, 1] }} transition={{ delay: 0.9, duration: 0.9 }}>
            <path d={`M${px + 150} 90 l0 20 l5 -5 l4 9 l4 -2 l-4 -9 l7 0 Z`} className="fill-foreground stroke-background" strokeWidth="1" />
          </motion.g>
          <Pill x={px + 114} y={248} w={200} text="Region: us-east-1" tone="mint" delay={1.8} />
        </g>
      ) : null}

      {s === 1 ? (
        <g>
          <RegionCard x={px} y={28} w={228} h={212} title="US East (N. Virginia)" code="us-east-1" tone="mint" />
          <Chip x={px + 20} y={96} w={90} text="EC2" tone="mint" delay={0.6} h={44} />
          <Chip x={px + 118} y={96} w={90} text="RDS" tone="mint" delay={1.2} h={44} />
          <motion.text x={px + 114} y={178} textAnchor="middle" className="fill-muted-foreground text-[11.5px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>Resources created in this Region</motion.text>
          <Pill x={px + 114} y={248} w={200} text="Created in us-east-1" tone="mint" delay={1.9} />
        </g>
      ) : null}

      {s === 2 ? (
        <g>
          <RegionCard x={px} y={28} w={228} h={212} title="US East (N. Virginia)" code="us-east-1" tone="mint" />
          {[0, 1, 2].map((i) => (
            <motion.g key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.25 }}>
              <rect x={px + 14 + i * 68} y="92" width="60" height="112" rx="8" className="fill-mint/5 stroke-mint/60" strokeWidth="1.6" strokeDasharray="4 3" />
              <text x={px + 44 + i * 68} y="108" textAnchor="middle" className="fill-mint font-mono text-[10px] font-bold">AZ {i + 1}</text>
              {[0, 1].map((r) => (
                <rect key={r} x={px + 22 + i * 68} y={118 + r * 34} width="44" height="26" rx="5" className="fill-mint/20 stroke-mint" strokeWidth="1.3" />
              ))}
            </motion.g>
          ))}
          <Chip x={px + 22} y={118} w={44} text="EC2" tone="mint" delay={1.4} h={26} />
          <Chip x={px + 90} y={152} w={44} text="RDS" tone="mint" delay={1.8} h={26} />
          <Chip x={px + 158} y={118} w={44} text="EC2" tone="mint" delay={2.2} h={26} />
          <text x={px + 114} y="222" textAnchor="middle" className="fill-muted-foreground text-[10px]">Conceptual illustration</text>
          <Pill x={px + 114} y={248} w={220} text="Hosted regionally" tone="mint" delay={2.4} />
        </g>
      ) : null}

      {s === 3 ? (
        <g>
          <RegionCard x={px} y={28} w={228} h={98} title="US East (N. Virginia)" code="us-east-1" tone="mint" />
          <Chip x={px + 20} y={76} w={90} text="EC2" tone="mint" delay={0.3} h={34} />
          <RegionCard x={px} y={142} w={228} h={98} title="Europe (Ireland)" code="eu-west-1" tone="amber" delay={0.5} />
          <motion.g initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ delay: 0.5, duration: 3.2, times: [0, 0.8, 1] }}>
            <rect x={px + 20} y={190} width="90" height="34" rx="7" className="fill-none stroke-muted-foreground/60" strokeWidth="1.6" strokeDasharray="4 3" />
            <text x={px + 65} y={211} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">no EC2 yet</text>
          </motion.g>
          <Chip x={px + 20} y={190} w={90} text="EC2" tone="amber" delay={3.4} h={34} />
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1] }} transition={{ delay: 1.2, duration: 1.2 }}>
            <circle cx={px + 190} cy="134" r="12" className="fill-red-500/15 stroke-red-500" strokeWidth="1.8" />
            <path d={`M${px + 184} 128 l12 12 M${px + 196} 128 l-12 12`} className="stroke-red-500" strokeWidth="2.2" strokeLinecap="round" />
            <text x={px + 172} y="138" textAnchor="end" className="fill-red-500 font-mono text-[9px] font-bold uppercase">No copy</text>
          </motion.g>
          <Pill x={px + 114} y={248} w={226} text="Deployed separately" tone="amber" delay={3.6} />
        </g>
      ) : null}
    </g>
  );
}

function RegionCard({ x, y, w, h, title, code, tone, delay = 0 }: { x: number; y: number; w: number; h: number; title: string; code: string; tone: Tone; delay?: number }) {
  return (
    <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={x} y={y} width={w} height={h} rx="12" className={`${T[tone].box} fill-background/70`} strokeWidth="2" />
      <rect x={x} y={y} width={w} height={h} rx="12" className={T[tone].box} strokeWidth="2" />
      <text x={x + 14} y={y + 22} className="fill-foreground text-[12px] font-semibold">{title}</text>
      <text x={x + 14} y={y + 38} className={`${T[tone].text} font-mono text-[10px] font-bold`}>{code}</text>
    </motion.g>
  );
}

export function RegionDeployVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={HOW_SCENES} viewBox="0 0 640 336" sceneMs={9000} render={(s) => <HowScene s={s} />} />;
}

/* ======================================================================
   3. EXAMPLE: from Mumbai to Ireland
   ====================================================================== */

const EX_SCENES = [
  { label: "Customers", note: "An e-commerce company serves customers primarily in India." },
  { label: "Mumbai", note: "It selects the Mumbai Region (ap-south-1) because it is geographically closer to many of its users." },
  { label: "Europe", note: "Later, it expands into Europe and considers deploying additional infrastructure in Ireland." },
  { label: "Replication", note: "The company must explicitly configure any necessary cross-Region data replication." },
] as const;

function ExampleScene({ s }: { s: number }) {
  const L = FULL;
  const mum = at(L, "ap-south-1");
  const ire = at(L, "eu-west-1");
  const indiaUsers = USER_SPOTS.india.map((p) => atXY(L, p));
  const euUsers = USER_SPOTS.europe.map((p) => atXY(L, p));
  const nodes: ReactNode[] = [];
  return (
    <g>
      <WorldMap L={L} india />
      {s === 0 ? <Tag x={mum[0] - 6} y={mum[1] - 54} text="INDIA" tone="amber" delay={0.3} /> : null}
      {indiaUsers.map(([x, y], i) => (
        <Person key={i} x={x} y={y} tone="amber" scale={0.85} delay={i * 0.2} />
      ))}
      {s >= 1 ? <Marker x={mum[0]} y={mum[1]} r={5} delay={0.4} /> : null}
      {s >= 1 ? <Tag x={mum[0] + 4} y={mum[1] + 24} text="Mumbai ap-south-1" tone="mint" delay={0.7} /> : null}
      {s >= 1
        ? indiaUsers.slice(0, 4).map(([x, y], i) => (
            <motion.line key={i} x1={x} y1={y} x2={mum[0]} y2={mum[1]} className="stroke-mint/70" strokeWidth="1.6" strokeDasharray="3 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 + i * 0.12, duration: 0.5 }} />
          ))
        : null}
      {s >= 2
        ? euUsers.map(([x, y], i) => (
            <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }}>
              <Person x={x} y={y} tone="amber" scale={0.85} delay={i * 0.2} />
            </motion.g>
          ))
        : null}
      {s === 2 ? (
        <g>
          <Marker x={ire[0]} y={ire[1]} r={5} tone="amber" ring pulse={false} delay={0.8} />
          <motion.text x={ire[0]} y={ire[1] + 4} textAnchor="middle" className="fill-amber font-mono text-[9px] font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>?</motion.text>
          <Tag x={ire[0] - 62} y={ire[1] - 2} text="Ireland eu-west-1?" tone="amber" delay={1.2} />
          <Arc a={[euUsers[3][0], euUsers[3][1]]} b={[mum[0], mum[1]]} tone="red" lift={22} delay={1.6} dots={2} dur={3.4} />
          <Tag x={(ire[0] + mum[0]) / 2} y={ire[1] - 26} text="far from Mumbai" tone="red" delay={2.2} />
        </g>
      ) : null}
      {s === 3 ? (
        <g>
          <Marker x={ire[0]} y={ire[1]} r={5} tone="mint" delay={0.2} />
          <Tag x={ire[0] - 62} y={ire[1] - 2} text="Ireland eu-west-1" tone="mint" delay={0.4} />
          <Arc a={[ire[0], ire[1]]} b={[mum[0], mum[1]]} tone="amber" lift={52} delay={0.8} dots={3} dur={3} />
          <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.2, type: "spring", stiffness: 200, damping: 12 }} style={{ transformOrigin: `${(ire[0] + mum[0]) / 2}px ${ire[1] + 36}px` }}>
            <rect x={(ire[0] + mum[0]) / 2 - 86} y={ire[1] + 26} width="172" height="22" rx="11" className="fill-background/90" />
            <rect x={(ire[0] + mum[0]) / 2 - 86} y={ire[1] + 26} width="172" height="22" rx="11" className={T.amber.pill} />
            <text x={(ire[0] + mum[0]) / 2} y={ire[1] + 41} textAnchor="middle" className="fill-amber font-mono text-[9.5px] font-bold uppercase tracking-wider">You configure replication</text>
          </motion.g>
        </g>
      ) : null}
      {nodes}
      {s === 0 ? <Pill x={320} y={288} w={330} text="Customers primarily in India" tone="amber" delay={0.9} /> : null}
      {s === 1 ? <Pill x={320} y={288} w={330} text="Closer to many of its users" tone="mint" delay={1.4} /> : null}
      {s === 2 ? <Pill x={320} y={288} w={330} text="Expanding into Europe" tone="amber" delay={2.4} /> : null}
      {s === 3 ? <Pill x={320} y={288} w={380} text="Replication is not automatic" tone="amber" delay={2.6} /> : null}
    </g>
  );
}

export function MumbaiToIrelandVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={EX_SCENES} viewBox="0 0 640 322" sceneMs={8500} render={(s) => <ExampleScene s={s} />} />;
}

export { T, Pill, Person, Arc, LabelChip, Fence, Panel, WorldMap, Marker, Tag, at, atXY, FULL };
export type { Tone };
