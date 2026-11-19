import type { ReactNode } from "react";
import { motion } from "motion/react";
import { StoryPlayer } from "../CloudFrame";
import { Equals, Flow } from "../global-infrastructure/AvailabilityZoneVisuals";
import { LabelChip, Panel, Person, Pill, T, Tag, type Tone } from "../global-infrastructure/RegionsVisuals";

/* ---------------------------------------------------------------------
   Visuals for the AWS Shared Responsibility Model lesson.
   Amber is the customer, mint is AWS. Static Tailwind classes only.
   --------------------------------------------------------------------- */

function Shield({ x, y, tone, delay = 0.3 }: { x: number; y: number; tone: Tone; delay?: number }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 220, damping: 13 }}>
      <path d={`M${x} ${y - 13} l11 4 v8 c0 8 -5 13 -11 16 c-6 -3 -11 -8 -11 -16 v-8 z`} className={T[tone].ink} strokeWidth="2" strokeLinejoin="round" />
      <path d={`M${x - 4.5} ${y + 1} l3.5 3.5 l6 -7.5`} className={`fill-none ${T[tone].line}`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </motion.g>
  );
}

function Key({ x, y, tone, delay = 0.3, scale = 1 }: { x: number; y: number; tone: Tone; delay?: number; scale?: number }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 240, damping: 12 }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <circle cx="0" cy="0" r="4.6" className={`fill-none ${T[tone].line}`} strokeWidth="2.2" />
        <path d="M4.6 0 H15 M11 0 v4 M15 0 v3" className={`fill-none ${T[tone].line}`} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </motion.g>
  );
}

function Padlock({ x, y, tone, delay = 0.3 }: { x: number; y: number; tone: Tone; delay?: number }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 220, damping: 13 }}>
      <path d={`M${x - 7} ${y - 4} v-5 a7 7 0 0 1 14 0 v5`} className={`fill-none ${T[tone].line}`} strokeWidth="2.4" />
      <rect x={x - 11} y={y - 4} width="22" height="17" rx="4" className={T[tone].ink} strokeWidth="2" />
      <circle cx={x} cy={y + 4.5} r="2.2" className={T[tone].solid} />
    </motion.g>
  );
}

/** Apartment block (amber) or data center (mint), 120 x 84 centered on cx. */
function Block({ cx, tone, kind, delay = 0 }: { cx: number; tone: Tone; kind: "apartment" | "datacenter"; delay?: number }) {
  const x = cx - 60;
  return (
    <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={x} y="88" width="120" height="84" rx="8" className={T[tone].box} strokeWidth="2" />
      {kind === "apartment" ? (
        <>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={x + 12 + i * 34} y="100" width="22" height="18" rx="3" className={T[tone].ink} strokeWidth="1.6" />
          ))}
          <rect x={x + 12} y="132" width="22" height="40" rx="3" className={T[tone].ink} strokeWidth="1.6" />
          <rect x={x + 46} y="130" width="22" height="18" rx="3" className={T[tone].ink} strokeWidth="1.6" />
          <rect x={x + 80} y="130" width="22" height="18" rx="3" className={T[tone].ink} strokeWidth="1.6" />
        </>
      ) : (
        <>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={x + 12} y={98 + i * 24} width="96" height="18" rx="4" className={T[tone].ink} strokeWidth="1.6" />
              <circle cx={x + 24} cy={107 + i * 24} r="2.6" className={T[tone].solid} />
              <rect x={x + 36} y={105 + i * 24} width="50" height="4" rx="2" className={T[tone].solid} opacity={0.5} />
            </g>
          ))}
        </>
      )}
    </motion.g>
  );
}

/* ======================================================================
   1. INTUITION: renting an apartment compared with using AWS
   ====================================================================== */

const APT_SCENES = [
  { label: "Landlord / AWS", note: "Landlord (AWS): Maintains the building, physical security, and shared infrastructure." },
  { label: "Keys / IAM", note: "Tenant (Customer): Controls who receives keys." },
  { label: "Belongings / Data", note: "Tenant (Customer): Protects personal belongings." },
  { label: "Your mistake", note: "The landlord secures the building, but you must still manage access to your apartment." },
] as const;

function ApartmentScene({ s }: { s: number }) {
  const L = 160;
  const R = 480;
  const leftChip = ["Landlord: the building", "Tenant: the keys", "Tenant: belongings", "Tenant: access"];
  const rightChip = ["AWS: the infrastructure", "Customer: IAM access", "Customer: data", "Customer: IAM access"];
  const pills = [
    "The provider secures the building and shared infrastructure",
    "The customer controls who receives access",
    "Protecting belongings and data is the customer's job",
    "AWS does not automatically correct that mistake",
  ];
  return (
    <g>
      <Panel x={12} title="Apartment" tone="amber" />
      <Panel x={332} title="AWS" tone="mint" />
      <Equals k={s} />

      <Block cx={L} tone="amber" kind="apartment" delay={0.1} />
      <Block cx={R} tone="mint" kind="datacenter" delay={0.1} />

      {s === 0 ? (
        <>
          <Shield x={L} y={72} tone="amber" delay={0.5} />
          <Shield x={R} y={72} tone="mint" delay={0.6} />
          <Tag x={L} y={190} text="Physical security" tone="amber" delay={0.9} />
          <Tag x={R} y={190} text="Physical security" tone="mint" delay={1} />
        </>
      ) : null}

      {s === 1 ? (
        <>
          <Person x={L - 84} y={152} tone="amber" scale={1.5} delay={0.1} />
          <Person x={L + 84} y={152} tone="amber" scale={1.5} delay={0.3} />
          <Key x={L - 84} y={120} tone="amber" delay={0.6} />
          <Key x={L + 76} y={120} tone="amber" delay={0.8} />
          <Person x={R - 84} y={152} tone="mint" scale={1.5} delay={0.1} />
          <Person x={R + 84} y={152} tone="mint" scale={1.5} delay={0.3} />
          <Key x={R - 84} y={120} tone="mint" delay={0.6} />
          <Key x={R + 76} y={120} tone="mint" delay={0.8} />
          <Tag x={L} y={190} text="Keys you hand out" tone="amber" delay={1} />
          <Tag x={R} y={190} text="IAM users and roles" tone="mint" delay={1.1} />
        </>
      ) : null}

      {s === 2 ? (
        <>
          <Padlock x={L} y={118} tone="amber" delay={0.5} />
          <Padlock x={R} y={118} tone="mint" delay={0.6} />
          <Tag x={L} y={190} text="Your belongings" tone="amber" delay={0.9} />
          <Tag x={R} y={190} text="Your data" tone="mint" delay={1} />
        </>
      ) : null}

      {s === 3 ? (
        <>
          <Shield x={L} y={72} tone="amber" delay={0.2} />
          <Shield x={R} y={72} tone="mint" delay={0.3} />
          <Person x={L + 84} y={152} tone="red" scale={1.5} delay={0.2} />
          <Key x={L + 76} y={120} tone="red" delay={0.7} />
          <Person x={R + 84} y={152} tone="red" scale={1.5} delay={0.2} />
          <Key x={R + 76} y={120} tone="red" delay={0.7} />
          <Tag x={L} y={190} text="Too many keys handed out" tone="red" delay={1} />
          <Tag x={R} y={190} text="Excessive IAM permissions" tone="red" delay={1.1} />
        </>
      ) : null}

      <LabelChip cx={L} y={208} text={leftChip[s]} tone="amber" />
      <LabelChip cx={R} y={208} text={rightChip[s]} tone="mint" />
      <Pill x={320} y={262} w={470} text={pills[s]} tone={s === 3 ? "red" : "mint"} delay={1.2} />
    </g>
  );
}

export function ApartmentSharedVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={APT_SCENES} viewBox="0 0 640 302" sceneMs={8500} render={(s) => <ApartmentScene s={s} />} />;
}

/* ======================================================================
   2. HOW: the shared responsibility diagram, layer by layer
   ====================================================================== */

const HOW_SCENES = [
  { label: "1. Of the cloud", note: "AWS secures the cloud itself: software, compute, storage, database, networking, and the global infrastructure of Regions, Availability Zones, and Edge Locations." },
  { label: "2. In the cloud", note: "Customers secure what they put in the cloud: their data, applications, IAM, operating system and firewall configuration, and encryption." },
  { label: "3. Managed services", note: "With managed services like Amazon RDS, AWS manages more underlying components than it does for an EC2-based database." },
  { label: "4. IAM duties", note: "For IAM, AWS runs the infrastructure and compliance, while you manage identities, MFA, keys, permissions, and access reviews." },
] as const;

/** One block of the diagram. `lines` are drawn centered, one per line. */
function Cell({ x, y, w, h, lines, tone, dim, delay, tag }: { x: number; y: number; w: number; h: number; lines: string[]; tone: Tone; dim: boolean; delay: number; tag?: string }) {
  const first = y + h / 2 - ((lines.length - 1) * 6.5) + 3.5;
  return (
    <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: dim ? 0.28 : 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <rect x={x} y={y} width={w} height={h} rx="7" className={T[tone].ink} strokeWidth="1.8" />
      {lines.map((t, i) => (
        <text key={t} x={x + w / 2} y={first + i * 13} textAnchor="middle" className={`${T[tone].text} font-mono text-[10.5px] font-bold`}>{t}</text>
      ))}
      {tag ? (
        <g>
          <rect x={x + w - 46} y={y - 7} width="40" height="16" rx="5" className="fill-background stroke-mint" strokeWidth="1.6" />
          <text x={x + w - 26} y={y + 5} textAnchor="middle" className="fill-mint font-mono text-[9.5px] font-bold">{tag}</text>
        </g>
      ) : null}
    </motion.g>
  );
}

function Side({ y, h, tone, title, line1, line2, dim }: { y: number; h: number; tone: Tone; title: string; line1: string; line2: string; dim: boolean }) {
  const mid = y + h / 2;
  return (
    <motion.g initial={{ opacity: 0, x: -10 }} animate={{ opacity: dim ? 0.3 : 1, x: 0 }}>
      <path d={`M12 ${y} H128 L146 ${mid} L128 ${y + h} H12 Z`} className={T[tone].box} strokeWidth="2" strokeLinejoin="round" />
      <text x="70" y={mid - 8} textAnchor="middle" className={`${T[tone].text} font-mono text-[13px] font-bold uppercase tracking-wider`}>{title}</text>
      <text x="70" y={mid + 10} textAnchor="middle" className="fill-foreground/80 font-mono text-[10.5px]">{line1}</text>
      <text x="70" y={mid + 24} textAnchor="middle" className="fill-foreground/80 font-mono text-[10.5px] font-bold">{line2}</text>
    </motion.g>
  );
}

function StackScene({ s }: { s: number }) {
  const X = 156;
  const W = 472;
  const cust = s === 1 || s === 2;
  const aws = s === 0 || s === 2;
  const dimC = !cust;
  const dimA = !aws;
  const c3 = (W - 12) / 3;
  const c4 = (W - 18) / 4;
  const rds = s === 2;
  return (
    <g>
      <Side y={12} h={138} tone="amber" title="Customer" line1="Security" line2="IN the cloud" dim={dimC} />
      <Side y={158} h={122} tone="mint" title="AWS" line1="Security" line2="OF the cloud" dim={dimA} />

      <Cell x={X} y={12} w={W} h={28} lines={["Customer data"]} tone="amber" dim={dimC} delay={0.1} />
      <Cell x={X} y={44} w={W} h={28} lines={["Platform, applications, identity and access management"]} tone="amber" dim={dimC} delay={0.17} />
      {rds ? (
        <Cell x={X} y={76} w={W} h={28} lines={["Operating system and database patching, managed by AWS"]} tone="mint" dim={false} delay={0.2} tag="RDS" />
      ) : (
        <Cell x={X} y={76} w={W} h={28} lines={["Operating system, network and firewall configuration"]} tone="amber" dim={dimC} delay={0.24} />
      )}
      <Cell x={X} y={108} w={c3} h={42} lines={["Client-side encryption", "and data integrity"]} tone="amber" dim={dimC} delay={0.3} />
      <Cell x={X + c3 + 6} y={108} w={c3} h={42} lines={["Server-side encryption", "file system and data"]} tone="amber" dim={dimC} delay={0.34} />
      <Cell x={X + 2 * (c3 + 6)} y={108} w={c3} h={42} lines={["Network traffic", "protection"]} tone="amber" dim={dimC} delay={0.38} />

      <Cell x={X} y={158} w={W} h={26} lines={["Software"]} tone="mint" dim={dimA} delay={0.42} />
      {["Compute", "Storage", "Database", "Networking"].map((t, i) => (
        <Cell key={t} x={X + i * (c4 + 6)} y={188} w={c4} h={28} lines={[t]} tone="mint" dim={dimA} delay={0.46 + i * 0.04} />
      ))}
      <Cell x={X} y={220} w={W} h={26} lines={["Hardware / AWS global infrastructure"]} tone="mint" dim={dimA} delay={0.58} />
      {["Regions", "Availability Zones", "Edge Locations"].map((t, i) => (
        <Cell key={t} x={X + i * (c3 + 6)} y={250} w={c3} h={30} lines={[t]} tone="mint" dim={dimA} delay={0.62 + i * 0.04} />
      ))}

      <Pill x={320} y={290} w={470} text={s === 0 ? "AWS owns the security OF the cloud" : s === 1 ? "The customer owns the security IN the cloud" : "Responsibilities vary by service"} tone={s === 1 ? "amber" : "mint"} delay={1.1} />
    </g>
  );
}

const AWS_DUTIES = [["Infrastructure", "(global network security)"], ["Configuration and", "vulnerability analysis"], ["Compliance validation"]];
const YOU_DUTIES = [["Users, groups, roles, policies", "management and monitoring"], ["Enable MFA on all accounts"], ["Rotate all your keys often"], ["Use IAM tools to apply", "appropriate permissions"], ["Analyze access patterns", "and review permissions"]];

function IamScene() {
  return (
    <g>
      <Panel x={12} title="AWS" tone="mint" />
      <Panel x={332} title="You" tone="amber" />
      {AWS_DUTIES.map((lines, i) => (
        <Cell key={lines[0]} x={30} y={68 + i * 54} w={260} h={44} lines={lines} tone="mint" dim={false} delay={0.2 + i * 0.12} />
      ))}
      {YOU_DUTIES.map((lines, i) => (
        <g key={lines[0]}>
          <Cell x={350} y={64 + i * 36} w={260} h={32} lines={lines} tone="amber" dim={false} delay={0.2 + i * 0.12} />
        </g>
      ))}
      <Pill x={320} y={262} w={470} text="Identity and access stays with the customer" tone="amber" delay={1.1} />
    </g>
  );
}

function HowScene({ s }: { s: number }) {
  return s === 3 ? <IamScene /> : <StackScene s={s} />;
}

export function SharedResponsibilityHowVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={HOW_SCENES} viewBox="0 0 640 322" sceneMs={8500} render={(s) => <HowScene s={s} />} />;
}

/* ======================================================================
   3. EXAMPLE: Terraform reads the caller identity
   ====================================================================== */

const TF_SCENES = [
  { label: "1. Credentials", note: "The aws provider configures Terraform to communicate with AWS using your existing credentials." },
  { label: "2. Data source", note: "The aws_caller_identity data source retrieves information about the authenticated AWS identity. It only reads, so nothing is created." },
  { label: "3. Outputs", note: "The output blocks display the account ID and the identity ARN." },
  { label: "4. Your job", note: "Terraform can use AWS credentials, but it does not automatically secure them. Identity and access stay your responsibility." },
] as const;

function Terminal({ x, y, w, h, title, children }: { x: number; y: number; w: number; h: number; title: string; children?: ReactNode }) {
  return (
    <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <rect x={x} y={y} width={w} height={h} rx="10" className="fill-background/70 stroke-amber/70" strokeWidth="2" />
      <rect x={x} y={y} width={w} height="24" rx="10" className="fill-amber/15" />
      <circle cx={x + 14} cy={y + 12} r="3" className="fill-amber/70" />
      <circle cx={x + 26} cy={y + 12} r="3" className="fill-amber/50" />
      <circle cx={x + 38} cy={y + 12} r="3" className="fill-amber/30" />
      <text x={x + w - 12} y={y + 16} textAnchor="end" className="fill-amber font-mono text-[10.5px] font-bold">{title}</text>
      {children}
    </motion.g>
  );
}

function TfScene({ s }: { s: number }) {
  const OUT = "M196 112 H452";
  const BACK = "M452 150 H196";
  const pills = ["Terraform signs requests with the identity you already use", "A read-only question: who is calling?", "Two values come back as outputs", "Protecting your credentials is your job"];
  return (
    <g>
      {/* terminal */}
      <Terminal x={16} y={40} w={180} h={172} title="main.tf">
        <text x="30" y="82" className="fill-foreground/80 font-mono text-[11px]">provider "aws" &#123;</text>
        <text x="42" y="98" className="fill-foreground/60 font-mono text-[11px]">region = "us-east-1"</text>
        <text x="30" y="114" className="fill-foreground/80 font-mono text-[11px]">&#125;</text>
        <text x="30" y="138" className={`${s === 1 ? "fill-amber" : "fill-foreground/80"} font-mono text-[11px]`}>data "aws_caller_</text>
        <text x="30" y="152" className={`${s === 1 ? "fill-amber" : "fill-foreground/80"} font-mono text-[11px]`}>identity" "current"</text>
        <text x="30" y="176" className={`${s === 2 ? "fill-amber" : "fill-foreground/80"} font-mono text-[11px]`}>output "account_id"</text>
        <text x="30" y="192" className={`${s === 2 ? "fill-amber" : "fill-foreground/80"} font-mono text-[11px]`}>output "identity_arn"</text>
      </Terminal>

      {/* AWS */}
      <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <rect x="452" y="40" width="172" height="172" rx="12" className={`${T.mint.box} fill-background/40`} strokeWidth="2" />
        <text x="538" y="62" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold uppercase tracking-[0.18em]">AWS</text>
        <rect x="470" y="80" width="136" height="48" rx="8" className={T.mint.ink} strokeWidth="2" />
        <text x="538" y="101" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold">Account</text>
        <text x="538" y="116" textAnchor="middle" className="fill-foreground/70 font-mono text-[10px]">123456789012</text>
        <rect x="470" y="138" width="136" height="60" rx="8" className={T.mint.ink} strokeWidth="2" />
        <text x="538" y="159" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold">Your identity</text>
        <text x="538" y="175" textAnchor="middle" className="fill-foreground/70 font-mono text-[10px]">IAM role or user</text>
        <text x="538" y="189" textAnchor="middle" className="fill-foreground/50 font-mono text-[10px]">authenticated</text>
      </motion.g>

      {s === 0 ? (
        <>
          <motion.path d={OUT} className="fill-none stroke-amber" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.7 }} />
          <Key x={300} y={96} tone="amber" delay={0.9} scale={1.3} />
          <Tag x={324} y={132} text="existing credentials" tone="amber" delay={1.1} />
          <Flow d={OUT} tone="amber" count={2} dur={1.6} delay={1} />
        </>
      ) : null}

      {s === 1 ? (
        <>
          <motion.path d={OUT} className="fill-none stroke-amber" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.6 }} />
          <motion.path d={BACK} className="fill-none stroke-mint" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.6 }} />
          <Tag x={324} y={96} text="Who am I?" tone="amber" delay={0.8} />
          <Flow d={OUT} tone="amber" count={2} dur={1.6} delay={0.8} />
          <Flow d={BACK} tone="mint" count={2} dur={1.6} delay={1.6} />
          <Tag x={324} y={170} text="Read-only, creates nothing" tone="mint" delay={1.8} />
        </>
      ) : null}

      {s === 2 ? (
        <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <rect x="218" y="72" width="222" height="110" rx="10" className="fill-background/80 stroke-mint/70" strokeWidth="2" />
          <text x="230" y="94" className="fill-mint font-mono text-[10.5px] font-bold">terraform output</text>
          <text x="230" y="118" className="fill-foreground/80 font-mono text-[10.5px]">account_id =</text>
          <text x="244" y="134" className="fill-foreground font-mono text-[10.5px] font-bold">"123456789012"</text>
          <text x="230" y="156" className="fill-foreground/80 font-mono text-[10.5px]">identity_arn =</text>
          <text x="244" y="171" className="fill-foreground font-mono text-[10.5px] font-bold">"arn:aws:iam::123456789012:..."</text>
        </motion.g>
      ) : null}

      {s === 3 ? (
        <g>
          {[
            { y: 62, text: "Use an IAM role", ok: true },
            { y: 108, text: "Don't use root credentials", ok: false },
            { y: 154, text: "Don't put keys in code", ok: false },
          ].map((r, i) => (
            <motion.g key={r.text} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.3 }}>
              <rect x="212" y={r.y} width="230" height="38" rx="9" className={r.ok ? T.mint.ink : T.red.ink} strokeWidth="2" />
              <text x="256" y={r.y + 23} className={`${r.ok ? "fill-mint" : "fill-red-500"} font-mono text-[10.5px] font-bold`}>{r.text}</text>
              {r.ok ? (
                <>
                  <circle cx="232" cy={r.y + 19} r="9" className="fill-mint/20 stroke-mint" strokeWidth="1.8" />
                  <path d={`M227.5 ${r.y + 19} l3.5 3.5 l6 -7`} className="fill-none stroke-mint" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <>
                  <circle cx="232" cy={r.y + 19} r="9" className="fill-red-500/20 stroke-red-500" strokeWidth="1.8" />
                  <path d={`M228 ${r.y + 15} l8 8 M236 ${r.y + 15} l-8 8`} className="stroke-red-500" strokeWidth="2.2" strokeLinecap="round" />
                </>
              )}
            </motion.g>
          ))}
        </g>
      ) : null}

      <Pill x={320} y={242} w={560} text={pills[s]} tone={s === 3 ? "amber" : "mint"} delay={1.2} />
    </g>
  );
}

export function SharedResponsibilityTerraformVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={TF_SCENES} viewBox="0 0 640 282" sceneMs={8500} render={(s) => <TfScene s={s} />} />;
}
