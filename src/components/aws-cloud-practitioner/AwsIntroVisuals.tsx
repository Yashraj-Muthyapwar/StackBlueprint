import type { ReactNode } from "react";
import { motion } from "motion/react";
import { StoryPlayer } from "./CloudFrame";

/* ---------------------------------------------------------------------
   Shared bits (static Tailwind classes only)
   --------------------------------------------------------------------- */

type Tone = "mint" | "amber" | "red" | "muted";
const T = {
  mint: { box: "fill-mint/10 stroke-mint/70", ink: "fill-mint/20 stroke-mint", solid: "fill-mint", text: "fill-mint", line: "stroke-mint", pill: "fill-mint/15 stroke-mint/70" },
  amber: { box: "fill-amber/10 stroke-amber/70", ink: "fill-amber/20 stroke-amber", solid: "fill-amber", text: "fill-amber", line: "stroke-amber", pill: "fill-amber/15 stroke-amber/70" },
  red: { box: "fill-red-500/10 stroke-red-500/70", ink: "fill-red-500/20 stroke-red-500", solid: "fill-red-500", text: "fill-red-500", line: "stroke-red-500", pill: "fill-red-500/15 stroke-red-500/70" },
  muted: { box: "fill-muted-foreground/5 stroke-muted-foreground/30", ink: "fill-muted-foreground/10 stroke-muted-foreground/40", solid: "fill-muted-foreground/50", text: "fill-muted-foreground", line: "stroke-muted-foreground/40", pill: "fill-muted-foreground/10 stroke-muted-foreground/40" },
} as const;

function Pill({ x, y, w, text, tone, delay = 0.9 }: { x: number; y: number; w: number; text: string; tone: Tone; delay?: number }) {
  const t = T[tone];
  return (
    <motion.g key={text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={x - w / 2} y={y} width={w} height="26" rx="13" className={t.pill} />
      <text x={x} y={y + 17} textAnchor="middle" className={`${t.text} font-mono text-[10.5px] font-semibold uppercase tracking-wider`}>{text}</text>
    </motion.g>
  );
}

function Person({ x, y, tone, delay = 0 }: { x: number; y: number; tone: Tone; delay?: number }) {
  return (
    <motion.g animate={{ y: [0, -2.5, 0] }} transition={{ duration: 1 + (delay % 0.4), repeat: Infinity, delay }}>
      <g transform={`translate(${x} ${y})`}>
        <circle cx="0" cy="-20" r="5.5" className={T[tone].solid} />
        <rect x="-6.5" y="-13" width="13" height="16" rx="5" className={`${T[tone].solid} opacity-60`} />
      </g>
    </motion.g>
  );
}

function Dot({ x1, y1, x2, y2, tone, delay = 0, dur = 1.8 }: { x1: number; y1: number; x2: number; y2: number; tone: Tone; delay?: number; dur?: number }) {
  return (
    <motion.circle r="4" className={T[tone].solid} initial={{ cx: x1, cy: y1, opacity: 0 }} animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 1, 0] }} transition={{ duration: dur, repeat: Infinity, delay, ease: "linear" }} />
  );
}

function Link({ x1, y1, x2, y2, tone = "mint", delay = 0, dots = 2 }: { x1: number; y1: number; x2: number; y2: number; tone?: Tone; delay?: number; dots?: number }) {
  return (
    <g>
      <motion.line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-foreground/30" strokeWidth="2.5" strokeDasharray="5 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay, duration: 0.6 }} />
      {Array.from({ length: dots }, (_, i) => (
        <Dot key={i} x1={x1} y1={y1} x2={x2} y2={y2} tone={tone} delay={delay + 0.6 + i * 0.9} />
      ))}
    </g>
  );
}

type Kind = "ec2" | "s3" | "rds" | "vpc" | "iam" | "cw";

/** Small drawn icon for each service, centred on (cx, cy), about 36px square. */
function ServiceIcon({ kind, cx, cy, tone = "mint" }: { kind: Kind; cx: number; cy: number; tone?: Tone }) {
  const t = T[tone];
  const stroke = `${t.ink}`;
  switch (kind) {
    case "ec2":
      return (
        <g>
          <rect x={cx - 17} y={cy - 17} width="34" height="14" rx="3.5" className={stroke} strokeWidth="2" />
          <rect x={cx - 17} y={cy + 3} width="34" height="14" rx="3.5" className={stroke} strokeWidth="2" />
          <circle cx={cx + 10} cy={cy - 10} r="2.2" className={t.solid} />
          <circle cx={cx + 10} cy={cy + 10} r="2.2" className={t.solid} />
          <line x1={cx - 11} y1={cy - 10} x2={cx - 1} y2={cy - 10} className={`${t.line}`} strokeWidth="2" strokeLinecap="round" />
          <line x1={cx - 11} y1={cy + 10} x2={cx - 1} y2={cy + 10} className={`${t.line}`} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "s3":
      return (
        <g>
          <path d={`M${cx - 17} ${cy - 10} L${cx - 12} ${cy + 17} H${cx + 12} L${cx + 17} ${cy - 10} Z`} className={stroke} strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx={cx} cy={cy - 10} rx="17" ry="5.5" className={`${t.ink}`} strokeWidth="2" />
          <ellipse cx={cx} cy={cy - 10} rx="10" ry="2.5" className={t.solid} opacity="0.5" />
        </g>
      );
    case "rds":
      return (
        <g>
          <path d={`M${cx - 15} ${cy - 11} V${cy + 11} a15 5.5 0 0 0 30 0 V${cy - 11}`} className={stroke} strokeWidth="2" />
          <ellipse cx={cx} cy={cy - 11} rx="15" ry="5.5" className={stroke} strokeWidth="2" />
          <path d={`M${cx - 15} ${cy} a15 5.5 0 0 0 30 0`} className={`fill-none ${t.line}`} strokeWidth="1.6" />
        </g>
      );
    case "vpc":
      return (
        <g>
          <rect x={cx - 18} y={cy - 17} width="36" height="34" rx="7" className={`fill-none ${t.line}`} strokeWidth="2" strokeDasharray="4 3" />
          <circle cx={cx - 7} cy={cy - 5} r="4" className={t.solid} />
          <circle cx={cx + 8} cy={cy + 7} r="4" className={t.solid} />
          <line x1={cx - 7} y1={cy - 5} x2={cx + 8} y2={cy + 7} className={t.line} strokeWidth="2" />
        </g>
      );
    case "iam":
      return (
        <g>
          <path d={`M${cx} ${cy - 18} L${cx + 15} ${cy - 11} V${cy + 2} C${cx + 15} ${cy + 11} ${cx + 6} ${cy + 16} ${cx} ${cy + 19} C${cx - 6} ${cy + 16} ${cx - 15} ${cy + 11} ${cx - 15} ${cy + 2} V${cy - 11} Z`} className={stroke} strokeWidth="2" strokeLinejoin="round" />
          <circle cx={cx} cy={cy - 4} r="4" className={t.solid} />
          <rect x={cx - 6} y={cy + 2} width="12" height="7" rx="3.5" className={`${t.solid} opacity-60`} />
        </g>
      );
    default:
      return (
        <g>
          <rect x={cx - 18} y={cy - 16} width="36" height="32" rx="6" className={stroke} strokeWidth="2" />
          <motion.path d={`M${cx - 12} ${cy + 6} L${cx - 5} ${cy - 3} L${cx + 1} ${cy + 3} L${cx + 11} ${cy - 9}`} className={`fill-none ${t.line}`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        </g>
      );
  }
}

function Gear({ cx, cy, tone = "mint" }: { cx: number; cy: number; tone?: Tone }) {
  return (
    <motion.g animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <circle cx={cx} cy={cy} r="8" className={`fill-none ${T[tone].line}`} strokeWidth="3" strokeDasharray="3 2.4" />
      <circle cx={cx} cy={cy} r="3" className={T[tone].solid} />
    </motion.g>
  );
}

/* ======================================================================
   1. INTUITION: a toolbox
   ====================================================================== */

const TOOLBOX_SCENES = [
  { label: "Toolbox", note: "Think of AWS as a toolbox for building software applications. Each tool solves a different problem." },
  { label: "Right tool", note: "You would not use a storage service to perform the same job as a virtual server." },
] as const;

const TOOLS: { label: string; kind: Kind }[] = [
  { label: "Compute", kind: "ec2" },
  { label: "Storage", kind: "s3" },
  { label: "Database", kind: "rds" },
  { label: "Network", kind: "vpc" },
  { label: "Security", kind: "iam" },
  { label: "Monitoring", kind: "cw" },
];

function ToolboxScene() {
  return (
    <g>
      {TOOLS.map((tool, i) => {
        const x = 14 + i * 104;
        return (
          <motion.g key={tool.label} initial={{ opacity: 0, y: 70, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.4 + i * 0.22, type: "spring", stiffness: 150, damping: 12 }}>
            <rect x={x} y="22" width="92" height="96" rx="12" className={T.mint.box} strokeWidth="2" />
            <ServiceIcon kind={tool.kind} cx={x + 46} cy={58} />
            <text x={x + 46} y="102" textAnchor="middle" className="fill-foreground font-mono text-[10px] font-bold uppercase tracking-wider">{tool.label}</text>
          </motion.g>
        );
      })}
      {/* the toolbox itself */}
      <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <path d="M262 150 v-12 a8 8 0 0 1 8 -8 h100 a8 8 0 0 1 8 8 v12" className="fill-none stroke-amber" strokeWidth="5" strokeLinecap="round" />
        <rect x="190" y="148" width="260" height="76" rx="12" className="fill-amber/15 stroke-amber" strokeWidth="3" />
        <line x1="190" y1="182" x2="450" y2="182" className="stroke-amber/70" strokeWidth="2" />
        <rect x="300" y="172" width="40" height="22" rx="5" className="fill-amber stroke-amber" />
        <text x="320" y="209" textAnchor="middle" className="fill-amber font-mono text-[12px] font-bold uppercase tracking-[0.18em]">AWS</text>
      </motion.g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.path key={i} d={`M${60 + i * 104} 124 L${i < 3 ? 280 + i * 30 : 320 + (i - 3) * 30} 146`} className="fill-none stroke-hairline" strokeWidth="2" strokeDasharray="3 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }} />
      ))}
      <Pill x={320} y={238} w={320} text="Each tool solves a different problem" tone="mint" delay={2.2} />
    </g>
  );
}

function RightToolScene() {
  return (
    <g>
      <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <rect x="24" y="82" width="208" height="86" rx="12" className={T.amber.box} strokeWidth="2" />
        <text x="128" y="112" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.16em]">The job</text>
        <text x="128" y="143" textAnchor="middle" className="fill-foreground text-[16px] font-semibold">Run the application</text>
      </motion.g>
      {/* storage tool: wrong */}
      <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <rect x="408" y="28" width="206" height="86" rx="12" className={T.red.box} strokeWidth="2" />
        <ServiceIcon kind="s3" cx={450} cy={71} tone="red" />
        <text x="486" y="66" className="fill-foreground text-[14px] font-semibold">Storage service</text>
        <text x="486" y="84" className="fill-muted-foreground text-[11.5px]">Stores files and objects</text>
      </motion.g>
      <motion.path d="M232 110 L408 76" className="fill-none stroke-red-500/70" strokeWidth="3" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.7 }} />
      <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6, type: "spring", stiffness: 260, damping: 12 }} style={{ transformOrigin: "320px 93px" }}>
        <circle cx="320" cy="93" r="14" className="fill-red-500/20 stroke-red-500" strokeWidth="2" />
        <path d="M314 87 l12 12 M326 87 l-12 12" className="stroke-red-500" strokeWidth="2.6" strokeLinecap="round" />
      </motion.g>
      {/* compute tool: right */}
      <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
        <rect x="408" y="136" width="206" height="86" rx="12" className={T.mint.box} strokeWidth="2" />
        <ServiceIcon kind="ec2" cx={450} cy={179} />
        <text x="486" y="174" className="fill-foreground text-[14px] font-semibold">Virtual server</text>
        <text x="486" y="192" className="fill-muted-foreground text-[11.5px]">Runs applications</text>
      </motion.g>
      <motion.path d="M232 140 L408 176" className="fill-none stroke-mint" strokeWidth="3" strokeDasharray="6 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 2.6, duration: 0.7 }} />
      <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 3.3, type: "spring", stiffness: 260, damping: 12 }} style={{ transformOrigin: "320px 158px" }}>
        <circle cx="320" cy="158" r="14" className="fill-mint/20 stroke-mint" strokeWidth="2" />
        <path d="M313 158 l5 5 l9 -11" className="fill-none stroke-mint" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      <Pill x={320} y={238} w={320} text="Match the service to the job" tone="mint" delay={3.6} />
    </g>
  );
}

export function ToolboxVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={TOOLBOX_SCENES} viewBox="0 0 640 272" sceneMs={8000} render={(s) => (s === 0 ? <ToolboxScene /> : <RightToolScene />)} />;
}

/* ======================================================================
   2. HOW: ways to use AWS and foundational services
   ====================================================================== */

const HOW_SCENES = [
  { label: "Ways in", note: "AWS provides services through the AWS Management Console, Command Line Interface (CLI), APIs, and infrastructure-as-code tools." },
  { label: "Services", note: "Some foundational services are Amazon EC2, Amazon S3, Amazon RDS, Amazon VPC, AWS IAM, and Amazon CloudWatch." },
  { label: "You choose", note: "You select and configure these services based on your application's requirements." },
] as const;

const ACCESS = [
  { label: "Management Console", glyph: "▢" },
  { label: "Command Line Interface", glyph: ">_" },
  { label: "APIs", glyph: "{ }" },
  { label: "Infrastructure as code", glyph: "</>" },
];

function AccessScene() {
  return (
    <g>
      {ACCESS.map((a, i) => {
        const y = 22 + i * 54;
        return (
          <g key={a.label}>
            <motion.g initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}>
              <rect x="20" y={y} width="238" height="44" rx="10" className={T.amber.box} strokeWidth="2" />
              <rect x="30" y={y + 8} width="34" height="28" rx="6" className={T.amber.ink} strokeWidth="1.6" />
              <text x="47" y={y + 27} textAnchor="middle" className="fill-amber font-mono text-[12px] font-bold">{a.glyph}</text>
              <text x="76" y={y + 27} className="fill-foreground text-[13.5px] font-medium">{a.label}</text>
            </motion.g>
            <Link x1={258} y1={y + 22} x2={402} y2={y + 22} tone="amber" delay={0.8 + i * 0.25} dots={1} />
          </g>
        );
      })}
      <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} style={{ transformOrigin: "510px 120px" }}>
        <rect x="402" y="22" width="216" height="206" rx="16" className="fill-mint/5 stroke-mint/70" strokeWidth="2" strokeDasharray="7 5" />
        <text x="510" y="48" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">AWS services</text>
        {(["ec2", "s3", "rds", "vpc", "iam", "cw"] as Kind[]).map((k, i) => (
          <motion.g key={k} initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.9 + i * 0.1, type: "spring", stiffness: 200, damping: 12 }}>
            <rect x={424 + (i % 3) * 62} y={72 + Math.floor(i / 3) * 70} width="52" height="56" rx="10" className={T.mint.box} strokeWidth="1.6" />
            <ServiceIcon kind={k} cx={450 + (i % 3) * 62} cy={100 + Math.floor(i / 3) * 70} />
          </motion.g>
        ))}
      </motion.g>
    </g>
  );
}

const SERVICES: { kind: Kind; name: string; l1: string; l2: string }[] = [
  { kind: "ec2", name: "Amazon EC2", l1: "Run applications", l2: "on virtual servers" },
  { kind: "s3", name: "Amazon S3", l1: "Store files", l2: "and objects" },
  { kind: "rds", name: "Amazon RDS", l1: "Run managed", l2: "relational databases" },
  { kind: "vpc", name: "Amazon VPC", l1: "Create logically isolated", l2: "cloud networks" },
  { kind: "iam", name: "AWS IAM", l1: "Manage identities and", l2: "access permissions" },
  { kind: "cw", name: "Amazon CloudWatch", l1: "Monitor resources", l2: "and applications" },
];

function ServicesScene({ picked }: { picked?: Kind[] }) {
  return (
    <g>
      {SERVICES.map((sv, i) => {
        const x = 14 + (i % 3) * 211;
        const y = 16 + Math.floor(i / 3) * 106;
        const on = !picked || picked.includes(sv.kind);
        const tone: Tone = on ? "mint" : "muted";
        return (
          <motion.g key={sv.kind} initial={{ opacity: 0, y: 16 }} animate={{ opacity: on ? 1 : 0.4, y: 0 }} transition={{ delay: picked ? 0.1 : i * 0.18, type: "spring", stiffness: 150, damping: 16 }}>
            <rect x={x} y={y} width="199" height="94" rx="12" className={T[tone].box} strokeWidth="2" />
            <ServiceIcon kind={sv.kind} cx={x + 36} cy={y + 47} tone={tone} />
            <text x={x + 68} y={y + 36} className="fill-foreground text-[12.5px] font-semibold">{sv.name}</text>
            <text x={x + 68} y={y + 55} className="fill-muted-foreground text-[10.5px]">{sv.l1}</text>
            <text x={x + 68} y={y + 69} className="fill-muted-foreground text-[10.5px]">{sv.l2}</text>
            {picked && on ? <Gear cx={x + 178} cy={y + 18} /> : null}
          </motion.g>
        );
      })}
      {picked ? <Pill x={320} y={232} w={380} text="Selected and configured for the application" tone="mint" /> : <Pill x={320} y={232} w={330} text="Foundational AWS services" tone="mint" delay={1.4} />}
    </g>
  );
}

export function AwsServicesVisual({ caption }: { caption: string }) {
  const render = (s: number): ReactNode => (s === 0 ? <AccessScene /> : s === 1 ? <ServicesScene /> : <ServicesScene picked={["ec2", "s3", "rds"]} />);
  return <StoryPlayer caption={caption} scenes={HOW_SCENES} viewBox="0 0 640 268" sceneMs={8000} render={render} />;
}

/* ======================================================================
   3. EXAMPLE: online shopping application
   ====================================================================== */

const SHOP_SCENES = [
  { label: "Customers", note: "Customers access your shopping application." },
  { label: "Compute", note: "Amazon EC2 runs your application." },
  { label: "Data", note: "Amazon RDS stores orders and customer records. Amazon S3 stores product images." },
  { label: "Together", note: "These AWS services work together to support a single application." },
] as const;

function NodeCard({ x, y, w = 150, kind, name, l1, l2, delay = 0 }: { x: number; y: number; w?: number; kind: Kind; name: string; l1: string; l2: string; delay?: number }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 170, damping: 14 }}>
      <rect x={x} y={y} width={w} height="96" rx="12" className={T.mint.box} strokeWidth="2" />
      <ServiceIcon kind={kind} cx={x + w / 2} cy={y + 24} />
      <text x={x + w / 2} y={y + 56} textAnchor="middle" className="fill-foreground text-[12.5px] font-semibold">{name}</text>
      <text x={x + w / 2} y={y + 71} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">{l1}</text>
      <text x={x + w / 2} y={y + 84} textAnchor="middle" className="fill-muted-foreground text-[10.5px]">{l2}</text>
    </motion.g>
  );
}

const SHOP_PILLS = [
  { text: "Customers visit the shop", tone: "amber" as Tone, w: 270 },
  { text: "Compute runs the shop", tone: "mint" as Tone, w: 260 },
  { text: "Data lives in managed services", tone: "mint" as Tone, w: 320 },
  { text: "One application, many services", tone: "mint" as Tone, w: 320 },
];

function ShopScene({ s }: { s: number }) {
  const pill = SHOP_PILLS[s];
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Person x={40 + i * 40} y={150} tone="amber" delay={i * 0.2} />
        </g>
      ))}
      <text x="80" y="178" textAnchor="middle" className="fill-amber font-mono text-[10.5px] font-semibold uppercase tracking-wider">Customers</text>
      {s === 0 ? (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <rect x="220" y="88" width="140" height="96" rx="12" className="fill-none stroke-foreground/30" strokeWidth="2" strokeDasharray="6 5" />
          <text x="290" y="132" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">Your shopping</text>
          <text x="290" y="150" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">application</text>
          <Link x1={150} y1={136} x2={220} y2={136} tone="amber" delay={0.6} dots={2} />
        </motion.g>
      ) : (
        <g>
          <NodeCard x={220} y={88} w={140} kind="ec2" name="Amazon EC2" l1="Runs your" l2="application" delay={s === 1 ? 0.2 : 0} />
          <Link x1={150} y1={136} x2={220} y2={136} tone="amber" delay={s === 1 ? 0.8 : 0.2} dots={2} />
        </g>
      )}
      {s >= 2 ? (
        <g>
          <NodeCard x={460} y={24} kind="rds" name="Amazon RDS" l1="Stores orders and" l2="customer records" delay={s === 2 ? 0.2 : 0} />
          <NodeCard x={460} y={148} kind="s3" name="Amazon S3" l1="Stores product" l2="images" delay={s === 2 ? 0.7 : 0} />
          <Link x1={360} y1={124} x2={460} y2={78} delay={s === 2 ? 1.1 : 0.3} dots={2} />
          <Link x1={360} y1={150} x2={460} y2={198} delay={s === 2 ? 1.5 : 0.4} dots={2} />
        </g>
      ) : null}
      <Pill x={s >= 2 ? 300 : 320} y={s >= 2 ? 236 : 220} w={pill.w} text={pill.text} tone={pill.tone} />
    </g>
  );
}

export function ShoppingArchitectureVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={SHOP_SCENES} viewBox="0 0 640 272" sceneMs={7500} render={(s) => <ShopScene s={s} />} />;
}
