import { motion } from "motion/react";
import { StoryPlayer } from "../CloudFrame";
import { Arc, Fence, LabelChip, Panel, Person, Pill, T, type Tone } from "./RegionsVisuals";

/* ---------------------------------------------------------------------
   Shared pieces for the Availability Zone lesson. Static Tailwind classes only.
   --------------------------------------------------------------------- */

function Flow({ d, tone = "mint", count = 2, dur = 2.2, delay = 0, once = false }: { d: string; tone?: Tone; count?: number; dur?: number; delay?: number; once?: boolean }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <motion.circle
          key={i}
          r="3.4"
          className={T[tone].solid}
          style={{ offsetPath: `path('${d}')` }}
          initial={{ offsetDistance: "0%", opacity: 0 }}
          animate={{ offsetDistance: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: dur, repeat: once ? 0 : Infinity, delay: delay + (i * dur) / count, ease: "linear" }}
        />
      ))}
    </>
  );
}

function Server({ x, y, w = 70, h = 50, tone, delay = 0 }: { x: number; y: number; w?: number; h?: number; tone: Tone; delay?: number }) {
  const small = h < 30;
  const pad = small ? 4 : 8;
  const row = (h - pad * 2) / 3;
  return (
    <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 180, damping: 14 }}>
      <rect x={x} y={y} width={w} height={h} rx="7" className={T[tone].ink} strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + 8} y={y + pad + i * row} width={w - 28} height={Math.max(2, row - (small ? 1.5 : 4))} rx="2" className={T[tone].solid} opacity={0.55} />
      ))}
      <circle cx={x + w - 12} cy={y + h / 2} r="3.2" className={T[tone].solid} />
    </motion.g>
  );
}

function Rack({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="36" height="48" rx="4" className={T.mint.ink} strokeWidth="1.8" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={x + 5} y={y + 7 + k * 13} width="26" height="6" rx="2" className="fill-mint" opacity={0.55} />
      ))}
    </g>
  );
}

/** Dims a box, outlines it in red and drops an X on it. */
function FailOverlay({ x, y, w, h, rx = 8, delay = 0.8, bx, by }: { x: number; y: number; w: number; h: number; rx?: number; delay?: number; bx?: number; by?: number }) {
  const cx = bx ?? x + w / 2;
  const cy = by ?? y + h / 2;
  return (
    <g>
      <motion.rect x={x} y={y} width={w} height={h} rx={rx} className="fill-background" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay, duration: 0.5 }} />
      <motion.rect x={x} y={y} width={w} height={h} rx={rx} className="fill-red-500/10 stroke-red-500" strokeWidth="2.2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.5 }} />
      <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: delay + 0.2, type: "spring", stiffness: 260, damping: 12 }}>
        <circle cx={cx} cy={cy} r="12" className="fill-red-500/25 stroke-red-500" strokeWidth="2" />
        <path d={`M${cx - 5} ${cy - 5} l10 10 M${cx + 5} ${cy - 5} l-10 10`} className="stroke-red-500" strokeWidth="2.4" strokeLinecap="round" />
      </motion.g>
    </g>
  );
}

function Equals({ k }: { k: number }) {
  return (
    <motion.g key={`eq${k}`} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: "spring", stiffness: 240, damping: 12 }} style={{ transformOrigin: "320px 139px" }}>
      <circle cx="320" cy="139" r="14" className="fill-background stroke-foreground/50" strokeWidth="2" />
      <text x="320" y="144" textAnchor="middle" className="fill-foreground font-mono text-[16px] font-bold">=</text>
    </motion.g>
  );
}

/* ======================================================================
   1. INTUITION: a hospital with several independent buildings
   ====================================================================== */

const HOSPITAL_SCENES = [
  { label: "Many buildings", note: "Think of a hospital with multiple independent buildings." },
  { label: "Independent", note: "Each AZ has independent power, networking, and cooling infrastructure, just like each building has its own power supply." },
  { label: "One fails", note: "If one building loses power, the others are not affected." },
  { label: "Others carry on", note: "Another building can continue providing essential services. Applications deployed across multiple AZs can remain operational when one AZ fails, provided the application is designed correctly." },
] as const;

function Clinic({ cx, base, off = false, power = false, label, delay = 0 }: { cx: number; base: number; off?: boolean; power?: boolean; label?: string; delay?: number }) {
  const w = 64;
  const h = 60;
  const x = cx - w / 2;
  return (
    <g>
      <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 130, damping: 15 }}>
        <rect x={x} y={base - h} width={w} height={h} rx="6" className={T.amber.ink} strokeWidth="2" />
        <rect x={x + 6} y={base - h - 12} width={w - 12} height="12" rx="3" className="fill-amber" />
        <path d={`M${cx} ${base - h - 10} v8 M${cx - 4} ${base - h - 6} h8`} className="stroke-background" strokeWidth="2" strokeLinecap="round" />
        {[0, 1].map((r) =>
          [0, 1].map((c) => (
            <motion.rect key={`${r}${c}`} x={x + 10 + c * 30} y={base - h + 8 + r * 18} width="14" height="10" rx="2" className="fill-amber" initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 0.95, 0.3] }} transition={{ duration: 2.4 + (r + c) * 0.6, repeat: Infinity, delay: (r * 2 + c) * 0.4 }} />
          )),
        )}
        <rect x={cx - 8} y={base - 20} width="16" height="20" rx="3" className="fill-background/70 stroke-foreground/30" strokeWidth="1.4" />
      </motion.g>
      {off ? <FailOverlay x={x} y={base - h - 12} w={w} h={h + 12} rx={6} delay={0.8} /> : null}
      {power ? (
        <motion.g initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + delay }}>
          <rect x={cx - 17} y={base + 5} width="34" height="14" rx="4" className={T.amber.ink} strokeWidth="1.4" />
          <path d={`M${cx + 1} ${base + 6.5} l-5 6.5 h4 l-1.5 5 l6 -7 h-4 Z`} className="fill-amber" />
        </motion.g>
      ) : label ? (
        <text x={cx} y={base + 16} textAnchor="middle" className="fill-amber font-mono text-[10.5px] font-bold uppercase tracking-wider">{label}</text>
      ) : null}
    </g>
  );
}

const AZX = (i: number) => 364 + i * 80;

function MiniAz({ i, down = false, chips = false, delay = 0 }: { i: number; down?: boolean; chips?: boolean; delay?: number }) {
  const x = AZX(i);
  return (
    <g>
      <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        <rect x={x} y="108" width="72" height="84" rx="8" className={`${T.mint.box} fill-background/60`} strokeWidth="1.8" strokeDasharray="4 3" />
        <text x={x + 36} y="124" textAnchor="middle" className="fill-mint font-mono text-[10.5px] font-bold">AZ {i + 1}</text>
        <Server x={x + 12} y={130} w={48} h={22} tone="mint" delay={delay + 0.15} />
        {chips
          ? ["P", "N", "C"].map((c, j) => (
              <motion.g key={c} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.3 + i * 0.2 + j * 0.15, type: "spring", stiffness: 240, damping: 14 }}>
                <rect x={x + 7 + j * 20} y="160" width="18" height="18" rx="4" className={T.mint.ink} strokeWidth="1.4" />
                <text x={x + 16 + j * 20} y="173" textAnchor="middle" className="fill-mint font-mono text-[10px] font-bold">{c}</text>
              </motion.g>
            ))
          : null}
      </motion.g>
      {down ? <FailOverlay x={x} y={108} w={72} h={84} delay={0.8} /> : null}
    </g>
  );
}

function HospitalScene({ s }: { s: number }) {
  const base = 172;
  const cxs = [80, 160, 240];
  const lefts = ["Separate buildings", "Own power supply", "One building down", "Others carry on"];
  const rights = ["Availability Zones", "P Power · N Network · C Cooling", "One AZ down", "Others carry on"];
  const pills = ["Separate buildings, separate AZs", "Independent power, networking, cooling", "One fails, the others keep going", "Works when designed correctly"];
  const shiftLeft = s === 3;
  return (
    <g>
      <Panel x={12} title="Hospital" tone="amber" />
      <Panel x={332} title="AWS" tone="mint" />
      <Equals k={s} />

      <Fence x={36} y={86} w={248} h={110} tone="amber" label="Hospital campus" />
      {cxs.map((cx, i) => (
        <Clinic key={i} cx={cx} base={base} off={s >= 2 && i === 0} power={s === 1} label={`B${i + 1}`} delay={0.2 + i * 0.25} />
      ))}
      {shiftLeft
        ? [1, 2].map((i) => <Arc key={i} a={[80, 100]} b={[cxs[i], 100]} tone="amber" lift={i === 1 ? 22 : 30} delay={0.5 + i * 0.3} dots={2} dur={2.6} />)
        : null}

      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <rect x="352" y="64" width="256" height="136" rx="12" className={`${T.mint.box} fill-background/60`} strokeWidth="2" />
        <text x="480" y="82" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold tracking-wider">Region us-east-1</text>
      </motion.g>
      {[0, 1, 2].map((i) => (
        <MiniAz key={i} i={i} down={s >= 2 && i === 0} chips={s === 1} delay={0.2 + i * 0.25} />
      ))}
      {shiftLeft
        ? [1, 2].map((i) => <Arc key={i} a={[AZX(0) + 36, 108]} b={[AZX(i) + 36, 108]} tone="mint" lift={i === 1 ? 24 : 32} delay={0.5 + i * 0.3} dots={2} dur={2.6} />)
        : null}

      <LabelChip cx={160} y={208} text={lefts[s]} tone="amber" />
      <LabelChip cx={480} y={208} text={rights[s]} tone="mint" />
      <Pill x={320} y={262} w={470} text={pills[s]} tone="mint" delay={1.2} />
    </g>
  );
}

export function HospitalAzVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={HOSPITAL_SCENES} viewBox="0 0 640 302" sceneMs={8500} render={(s) => <HospitalScene s={s} />} />;
}

/* ======================================================================
   2. HOW: Availability Zones inside a Region
   ====================================================================== */

const HOW_SCENES = [
  { label: "1. Isolated AZs", note: "A Region such as us-east-1 has multiple isolated Availability Zones: us-east-1a, us-east-1b, and us-east-1c." },
  { label: "2. Independent", note: "Each AZ has its own independent infrastructure." },
  { label: "3. Connected", note: "AWS connects AZs within a Region through highly redundant networking with low-latency, high-bandwidth connections." },
  { label: "4. Spread", note: "An application can run instances across multiple AZs. When one AZ fails, healthy instances in another AZ can continue serving users." },
  { label: "5. You configure", note: "However, AWS does not automatically distribute every application across AZs. You must configure the relevant architecture." },
] as const;

const AZ_NAMES = ["us-east-1a", "us-east-1b", "us-east-1c"];
const hx = (i: number) => 48 + i * 190;
const hcx = (i: number) => hx(i) + 85;

function HowScene({ s }: { s: number }) {
  const ground = s >= 3;
  const pills = ["Isolated from each other", "Independent infrastructure", "Low-latency, high-bandwidth links", "Healthy AZs keep serving users", "You configure the architecture"];
  const tone: Tone = s === 4 ? "amber" : "mint";
  return (
    <g>
      <motion.rect x="20" y="20" width="600" height="264" rx="16" className={`${T.mint.box} fill-background/40`} strokeWidth="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      <text x="36" y="40" className="fill-mint font-mono text-[11px] font-bold tracking-wider">AWS Region us-east-1</text>

      {[0, 1, 2].map((i) => {
        const x = hx(i);
        const down = s === 3 && i === 0;
        const ghost = s === 4 && i > 0;
        return (
          <g key={i}>
            <motion.g initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.25 }}>
              <rect x={x} y="52" width="170" height="176" rx="10" className={`${ghost ? T.muted.box : T.mint.box} fill-background/70`} strokeWidth="2" strokeDasharray="5 4" />
              <text x={x + 12} y="74" className="fill-foreground font-mono text-[12px] font-bold">{AZ_NAMES[i]}</text>
              {ghost ? (
                <motion.rect x={x} y="52" width="170" height="176" rx="10" className="fill-none stroke-mint" strokeWidth="2" strokeDasharray="5 4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.4 }} />
              ) : null}
            </motion.g>

            {!ground ? (
              <g>
                {[0, 1, 2].map((k) => (
                  <motion.g key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.25 + k * 0.1 }}>
                    <Rack x={x + 15 + k * 50} y={88} />
                  </motion.g>
                ))}
                <text x={x + 85} y="152" textAnchor="middle" className="fill-muted-foreground font-mono text-[9.5px] uppercase tracking-wider">One or more data centers</text>
              </g>
            ) : null}

            {s === 1 || s === 2
              ? ["Own power", "Own network", "Own cooling"].map((t, r) => (
                  <motion.g key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (s === 1 ? 0.5 : 0.1) + i * 0.2 + r * 0.15 }}>
                    <rect x={x + 12} y={164 + r * 20} width="146" height="16" rx="5" className={T.mint.ink} strokeWidth="1.3" opacity={s === 2 ? 0.6 : 1} />
                    <text x={x + 85} y={175.5 + r * 20} textAnchor="middle" className="fill-mint font-mono text-[10px] font-bold">{t}</text>
                  </motion.g>
                ))
              : null}

            {ground && !ghost ? (
              <g>
                <Server x={x + 50} y={90} tone="mint" delay={0.3 + i * 0.15} />
                <text x={x + 85} y="162" textAnchor="middle" className="fill-muted-foreground text-[11px]">EC2 instance</text>
                <text x={x + 85} y="182" textAnchor="middle" className={`${down ? "fill-red-500" : "fill-mint"} font-mono text-[11px] font-bold`}>{down ? "Failed" : s === 4 ? "Only one so far" : "Healthy"}</text>
                {s === 3 && !down ? <Flow d={`M${hx(i) + 108} 46 V92`} count={3} dur={1.5} delay={0.4 + i * 0.2} /> : null}
                {down ? <Flow d={`M${hx(0) + 108} 46 V92`} count={1} dur={1} delay={0} once /> : null}
                {down ? <FailOverlay x={x} y={52} w={170} h={176} rx={10} delay={1} /> : null}
              </g>
            ) : null}

            {ghost ? (
              <g>
                <motion.g initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ delay: 0.3, duration: 3.1, times: [0, 0.9, 1] }}>
                  <rect x={x + 50} y="90" width="70" height="50" rx="7" className="fill-none stroke-muted-foreground/60" strokeWidth="1.8" strokeDasharray="5 4" />
                  <text x={x + 85} y="120" textAnchor="middle" className="fill-muted-foreground font-mono text-[14px] font-bold">?</text>
                  <text x={x + 85} y="168" textAnchor="middle" className="fill-muted-foreground text-[11px]">Not created for you</text>
                </motion.g>
                <Server x={x + 50} y={90} tone="mint" delay={3.6} />
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.9 }}>
                  <text x={x + 85} y="162" textAnchor="middle" className="fill-muted-foreground text-[11px]">EC2 instance</text>
                  <text x={x + 85} y="182" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold">You added it</text>
                </motion.g>
              </g>
            ) : null}
          </g>
        );
      })}

      {s === 3 ? <text x="320" y="40" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.16em]">User requests</text> : null}

      {s === 2 ? (
        <g>
          {[0, 1, 2].map((i) => (
            <motion.line key={i} x1={hcx(i)} y1="228" x2={hcx(i)} y2="250" className="stroke-mint" strokeWidth="2.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }} />
          ))}
          <motion.line x1={hcx(0)} y1="250" x2={hcx(2)} y2="250" className="stroke-mint" strokeWidth="2.2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.8 }} />
          <Flow d={`M${hcx(0)} 228 V250 H${hcx(2)} V228`} count={2} dur={2.6} delay={1.2} />
          <Flow d={`M${hcx(2)} 228 V250 H${hcx(1)} V228`} count={2} dur={2} delay={1.4} />
          <Flow d={`M${hcx(1)} 228 V250 H${hcx(0)} V228`} count={2} dur={2} delay={1.6} />
          <motion.text x="320" y="272" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold tracking-wider" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>Low-latency, high-bandwidth connections</motion.text>
        </g>
      ) : null}

      <Pill x={320} y={298} w={420} text={pills[s]} tone={tone} delay={1.3} />
    </g>
  );
}

export function AzHowVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={HOW_SCENES} viewBox="0 0 640 336" sceneMs={9000} render={(s) => <HowScene s={s} />} />;
}

/* ======================================================================
   3. EXAMPLE: an online shopping application across two AZs
   ====================================================================== */

const EX_SCENES = [
  { label: "Two instances", note: "An online shopping application runs on two EC2 instances, one in AZ A and one in AZ B." },
  { label: "Routing", note: "Customer requests go to an Application Load Balancer, which routes requests to healthy instances." },
  { label: "AZ A fails", note: "AZ A fails. The load balancer can direct requests to the healthy instance in AZ B." },
  { label: "Multi-AZ", note: "Customers are still served. This is an example of Multi-AZ deployment." },
] as const;

const PATH_A = "M250 150 C300 150 310 95 360 95";
const PATH_B = "M250 150 C300 150 310 227 360 227";

function ExampleScene({ s }: { s: number }) {
  const aDown = s >= 2;
  const pills = ["Two instances, two AZs", "The load balancer routes to healthy instances", "AZ A fails, AZ B keeps serving", "Multi-AZ deployment"];
  return (
    <g>
      {/* customers */}
      {[0, 1, 2].map((i) => (
        <Person key={i} x={34 + i * 24} y={156} tone="amber" delay={i * 0.2} />
      ))}
      <text x="58" y="184" textAnchor="middle" className="fill-amber font-mono text-[10px] font-bold uppercase tracking-wider">Customers</text>
      <motion.path d="M112 150 H140" className="fill-none stroke-amber" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />

      {/* load balancer */}
      <motion.g initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.2, type: "spring", stiffness: 160, damping: 14 }}>
        <rect x="140" y="116" width="110" height="68" rx="10" className={T.amber.ink} strokeWidth="2.2" />
        <text x="195" y="146" textAnchor="middle" className="fill-amber font-mono text-[11px] font-bold">Application</text>
        <text x="195" y="162" textAnchor="middle" className="fill-amber font-mono text-[11px] font-bold">Load Balancer</text>
      </motion.g>

      {/* AZ A */}
      <motion.g initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <rect x="340" y="36" width="268" height="116" rx="12" className={`${T.mint.box} fill-background/60`} strokeWidth="2" strokeDasharray="5 4" />
        <text x="356" y="56" className="fill-foreground font-mono text-[12px] font-bold">AZ A</text>
      </motion.g>
      <Server x={360} y={70} tone="mint" delay={0.6} />
      <text x="444" y="92" className="fill-foreground/80 text-[12px]">EC2 instance</text>
      <text x="444" y="112" className={`${aDown ? "fill-red-500" : "fill-mint"} font-mono text-[12px] font-bold`}>{aDown ? "Failed" : "Healthy"}</text>
      {aDown ? <FailOverlay x={340} y={36} w={268} h={116} rx={12} delay={0.7} bx={395} by={95} /> : null}

      {/* AZ B */}
      <motion.g initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        <rect x="340" y="168" width="268" height="116" rx="12" className={`${T.mint.box} fill-background/60`} strokeWidth="2" strokeDasharray="5 4" />
        <text x="356" y="188" className="fill-foreground font-mono text-[12px] font-bold">AZ B</text>
      </motion.g>
      <Server x={360} y={202} tone="mint" delay={0.8} />
      <text x="444" y="224" className="fill-foreground/80 text-[12px]">EC2 instance</text>
      <text x="444" y="244" className="fill-mint font-mono text-[12px] font-bold">Healthy</text>

      {/* routes */}
      {s >= 1 ? (
        <g>
          <motion.path d={PATH_A} className={`fill-none ${aDown ? "stroke-red-500/60" : "stroke-mint"}`} strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.7 }} />
          <motion.path d={PATH_B} className="fill-none stroke-mint" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.7 }} />
          <Flow d="M112 150 H140" tone="amber" count={s === 1 ? 3 : 4} dur={1.2} delay={1} />
          {s === 1 ? <Flow d={PATH_A} count={2} dur={2} delay={1.2} /> : null}
          <Flow d={PATH_B} count={s === 1 ? 2 : 4} dur={s === 1 ? 2 : 2.4} delay={1.4} />
          {aDown ? (
            <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 1.4, type: "spring", stiffness: 220, damping: 13 }}>
              <rect x="268" y="82" width="62" height="20" rx="6" className="fill-background/90" />
              <rect x="268" y="82" width="62" height="20" rx="6" className={T.red.pill} />
              <text x="299" y="96" textAnchor="middle" className="fill-red-500 font-mono text-[10px] font-bold uppercase tracking-wider">Skipped</text>
            </motion.g>
          ) : null}
        </g>
      ) : null}

      {s === 3 ? (
        <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.5, type: "spring", stiffness: 240, damping: 12 }}>
          <circle cx="58" cy="124" r="12" className="fill-mint/20 stroke-mint" strokeWidth="1.8" />
          <path d="M52 124 l4.5 4.5 l8 -9" className="fill-none stroke-mint" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
      ) : null}

      <Pill x={320} y={292} w={440} text={pills[s]} tone={s >= 2 ? "mint" : "amber"} delay={1.4} />
    </g>
  );
}

export function MultiAzExampleVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={EX_SCENES} viewBox="0 0 640 322" sceneMs={8500} render={(s) => <ExampleScene s={s} />} />;
}

export { Server, Flow, Equals };
