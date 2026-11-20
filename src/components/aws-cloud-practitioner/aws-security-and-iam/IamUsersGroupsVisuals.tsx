import type { ReactNode } from "react";
import { motion } from "motion/react";
import { StoryPlayer } from "../CloudFrame";
import { Equals, Flow } from "../global-infrastructure/AvailabilityZoneVisuals";
import { Fence, LabelChip, Panel, Person, Pill, T, Tag, type Tone } from "../global-infrastructure/RegionsVisuals";

/* ---------------------------------------------------------------------
   Visuals for the IAM Users and Groups lesson.
   Amber is the company side, mint is AWS. Static Tailwind classes only.
   --------------------------------------------------------------------- */

function Doc({ x, y, tone, delay = 0.3 }: { x: number; y: number; tone: Tone; delay?: number }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 220, damping: 13 }}>
      <rect x={x - 13} y={y - 17} width="26" height="34" rx="4" className={T[tone].ink} strokeWidth="2" />
      {[-8, -1, 6].map((d) => (
        <rect key={d} x={x - 8} y={y + d} width="16" height="3" rx="1.5" className={T[tone].solid} opacity={0.6} />
      ))}
    </motion.g>
  );
}

function Tick({ cx, cy, delay = 0.4, bad = false }: { cx: number; cy: number; delay?: number; bad?: boolean }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 260, damping: 12 }}>
      <circle cx={cx} cy={cy} r="9" className={bad ? "fill-red-500/20 stroke-red-500" : "fill-mint/20 stroke-mint"} strokeWidth="1.8" />
      {bad ? (
        <path d={`M${cx - 4} ${cy - 4} l8 8 M${cx + 4} ${cy - 4} l-8 8`} className="stroke-red-500" strokeWidth="2.2" strokeLinecap="round" />
      ) : (
        <path d={`M${cx - 4.5} ${cy} l3.5 3.5 l6 -7`} className="fill-none stroke-mint" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </motion.g>
  );
}

function Line({ d, tone, delay = 0.3, dashed = true }: { d: string; tone: Tone; delay?: number; dashed?: boolean }) {
  return <motion.path d={d} className={`fill-none ${T[tone].line}`} strokeWidth="2" strokeDasharray={dashed ? "5 5" : undefined} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay, duration: 0.6 }} />;
}

/* ======================================================================
   1. INTUITION: a company office compared with IAM
   ====================================================================== */

const OFFICE_SCENES = [
  { label: "Employee / user", note: "IAM User: An individual employee." },
  { label: "Department / group", note: "IAM Group: A department, such as Developers." },
  { label: "Rules / policy", note: "IAM Policy: Rules defining what the department can access." },
  { label: "Many departments", note: "An employee can belong to multiple departments, just as an IAM user can belong to multiple groups." },
] as const;

function OfficeScene({ s }: { s: number }) {
  const L = 160;
  const R = 480;
  const leftChip = ["Employee", "Department", "Department rules", "Many departments"];
  const rightChip = ["IAM user", "IAM group", "IAM policy", "Many groups"];
  const pills = [
    "An IAM user is one identity in the account",
    "A group is a collection of IAM users",
    "The rules apply to everyone in the group",
    "One user can belong to several groups",
  ];
  const side = (cx: number, tone: Tone, names: [string, string], who: string) => (
    <g>
      {s === 0 ? (
        <>
          <Person x={cx} y={148} tone={tone} scale={3} delay={0.1} />
          <Tag x={cx} y={184} text={who} tone={tone} delay={0.6} />
        </>
      ) : null}
      {s === 1 || s === 2 ? (
        <>
          <Fence x={cx - 100} y={90} w={150} h={90} tone={tone} label={names[0]} delay={0.1} />
          {[-75, -25, 25].map((d, i) => (
            <Person key={d} x={cx + d} y={150} tone={tone} scale={2} delay={0.2 + i * 0.15} />
          ))}
        </>
      ) : null}
      {s === 2 ? (
        <>
          <Line d={`M${cx + 70} 134 H${cx + 54}`} tone={tone} delay={0.5} />
          <Doc x={cx + 90} y={134} tone={tone} delay={0.4} />
        </>
      ) : null}
      {s === 3 ? (
        <>
          <Fence x={cx - 122} y={90} w={108} h={90} tone={tone} label={names[0]} delay={0.1} />
          <Fence x={cx + 14} y={90} w={108} h={90} tone={tone} label={names[1]} delay={0.2} />
          <Person x={cx - 82} y={152} tone="muted" scale={1.8} delay={0.3} />
          <Person x={cx + 82} y={152} tone="muted" scale={1.8} delay={0.4} />
          <Line d={`M${cx} 142 H${cx - 14}`} tone={tone} delay={0.6} />
          <Line d={`M${cx} 142 H${cx + 14}`} tone={tone} delay={0.6} />
          <Person x={cx} y={152} tone={tone} scale={2.4} delay={0.5} />
          <Tag x={cx} y={190} text="Alice" tone={tone} delay={0.9} />
        </>
      ) : null}
    </g>
  );
  return (
    <g>
      <Panel x={12} title="Company office" tone="amber" />
      <Panel x={332} title="AWS IAM" tone="mint" />
      <Equals k={s} />
      {side(L, "amber", ["Developers", "Security"], "Alice")}
      {side(R, "mint", ["Developers", "Security"], "Alice")}
      <LabelChip cx={L} y={208} text={leftChip[s]} tone="amber" />
      <LabelChip cx={R} y={208} text={rightChip[s]} tone="mint" />
      <Pill x={320} y={262} w={470} text={pills[s]} tone="mint" delay={1.2} />
    </g>
  );
}

export function OfficeIamVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={OFFICE_SCENES} viewBox="0 0 640 302" sceneMs={8500} render={(s) => <OfficeScene s={s} />} />;
}

/* ======================================================================
   2. HOW: a group, its users, and its permissions
   ====================================================================== */

const HOW_SCENES = [
  { label: "1. Group and users", note: "A Developers group contains IAM users such as Alice and Bob." },
  { label: "2. Attach permissions", note: "Permissions can be attached to the group." },
  { label: "3. Members receive them", note: "Group permissions are available to its members, so Alice and Bob both get them." },
  { label: "4. Important rules", note: "Groups contain users, not groups. A user can be in many groups or none. Creating a user or group alone grants no application permissions." },
] as const;

function UserCard({ x, y, name, delay, ok }: { x: number; y: number; name: string; delay: number; ok?: boolean }) {
  return (
    <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <rect x={x} y={y} width="116" height="82" rx="10" className={T.mint.ink} strokeWidth="2" />
      <Person x={x + 58} y={y + 40} tone="mint" scale={2.2} delay={delay} />
      <text x={x + 58} y={y + 66} textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold">{name}</text>
      <text x={x + 58} y={y + 78} textAnchor="middle" className="fill-foreground/60 font-mono text-[9px]">IAM user</text>
      {ok ? <Tick cx={x + 104} cy={y + 12} delay={delay + 0.8} /> : null}
    </motion.g>
  );
}

function MiniBox({ x, y, w, h, label, tone = "mint", delay = 0.2, children }: { x: number; y: number; w: number; h: number; label: string; tone?: Tone; delay?: number; children?: ReactNode }) {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
      <rect x={x} y={y} width={w} height={h} rx="8" className={`fill-none ${T[tone].line}`} strokeWidth="1.8" strokeDasharray="5 4" />
      <text x={x + 6} y={y + 12} className={`${T[tone].text} font-mono text-[9.5px] font-bold`}>{label}</text>
      {children}
    </motion.g>
  );
}

function RuleCell({ x, y, title, children }: { x: number; y: number; title: string; children: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width="300" height="120" rx="12" className="fill-background/40 stroke-hairline" strokeWidth="1.6" />
      <text x={x + 12} y={y + 20} className="fill-foreground font-mono text-[11px] font-bold">{title}</text>
      {children}
    </g>
  );
}

function RulesScene() {
  const X1 = 10;
  const X2 = 330;
  const Y1 = 8;
  const Y2 = 134;
  return (
    <g>
      <RuleCell x={X1} y={Y1} title="1. Groups hold users, not groups">
        <MiniBox x={X1 + 18} y={Y1 + 38} w={112} h={66} label="Group">
          <Person x={X1 + 74} y={Y1 + 90} tone="mint" scale={1.8} />
        </MiniBox>
        <Tick cx={X1 + 142} cy={Y1 + 48} delay={0.5} />
        <MiniBox x={X1 + 164} y={Y1 + 38} w={122} h={66} label="Group" tone="muted">
          <rect x={X1 + 184} y={Y1 + 60} width="82" height="36" rx="6" className="fill-none stroke-muted-foreground/60" strokeWidth="1.6" strokeDasharray="4 3" />
          <text x={X1 + 225} y={Y1 + 82} textAnchor="middle" className="fill-muted-foreground font-mono text-[9.5px] font-bold">Group</text>
        </MiniBox>
        <Tick cx={X1 + 274} cy={Y1 + 48} delay={0.7} bad />
      </RuleCell>

      <RuleCell x={X2} y={Y1} title="2. Many groups, or none">
        <Person x={X2 + 46} y={Y1 + 70} tone="mint" scale={1.8} />
        <text x={X2 + 46} y={Y1 + 90} textAnchor="middle" className="fill-mint font-mono text-[9.5px] font-bold">Alice</text>
        <MiniBox x={X2 + 130} y={Y1 + 34} w={150} h={32} label="Developers" />
        <MiniBox x={X2 + 130} y={Y1 + 74} w={150} h={32} label="Security" />
        <Line d={`M${X2 + 62} ${Y1 + 62} L${X2 + 130} ${Y1 + 50}`} tone="mint" delay={0.4} />
        <Line d={`M${X2 + 62} ${Y1 + 66} L${X2 + 130} ${Y1 + 90}`} tone="mint" delay={0.5} />
        <Person x={X2 + 46} y={Y1 + 112} tone="muted" scale={1} />
        <text x={X2 + 64} y={Y1 + 111} className="fill-muted-foreground font-mono text-[9.5px]">Bob: no group</text>
      </RuleCell>

      <RuleCell x={X1} y={Y2} title="3. Group permissions reach members">
        <Doc x={X1 + 42} y={Y2 + 70} tone="mint" delay={0.3} />
        <Line d={`M${X1 + 60} ${Y2 + 70} H${X1 + 96}`} tone="mint" delay={0.5} />
        <MiniBox x={X1 + 96} y={Y2 + 38} w={110} h={66} label="Group" delay={0.3}>
          <Person x={X1 + 126} y={Y2 + 92} tone="mint" scale={1.6} />
          <Person x={X1 + 176} y={Y2 + 92} tone="mint" scale={1.6} />
        </MiniBox>
        <Flow d={`M${X1 + 60} ${Y2 + 70} H${X1 + 130}`} tone="mint" count={2} dur={1.6} delay={0.8} />
        <Tick cx={X1 + 250} cy={Y2 + 70} delay={1} />
      </RuleCell>

      <RuleCell x={X2} y={Y2} title="4. Creating alone grants nothing">
        <Person x={X2 + 56} y={Y2 + 82} tone="mint" scale={2} />
        <rect x={X2 + 96} y={Y2 + 52} width="24" height="20" rx="4" className="fill-muted-foreground/15 stroke-muted-foreground/60" strokeWidth="1.8" />
        <path d={`M${X2 + 102} ${Y2 + 52} v-6 a6 6 0 0 1 12 0 v6`} className="fill-none stroke-muted-foreground/60" strokeWidth="2" />
        <Tag x={X2 + 210} y={Y2 + 64} text="New user or group" tone="mint" delay={0.4} />
        <Tag x={X2 + 210} y={Y2 + 92} text="No permissions yet" tone="red" delay={0.8} />
      </RuleCell>
    </g>
  );
}

function HowScene({ s }: { s: number }) {
  if (s === 3) return <RulesScene />;
  const pills = ["A group holds IAM users", "Permissions attach to the group, not each user", "Members receive the group permissions", ""];
  return (
    <g>
      <Fence x={24} y={64} w={332} h={170} tone="mint" label="Developers group" delay={0.1} />
      <UserCard x={44} y={100} name="Alice" delay={0.3} ok={s === 2} />
      <UserCard x={200} y={100} name="Bob" delay={0.45} ok={s === 2} />
      <text x={190} y={222} textAnchor="middle" className="fill-foreground/60 font-mono text-[10px]">Members of the group</text>

      {s >= 1 ? (
        <>
          <Line d="M440 150 H356" tone="amber" delay={0.2} />
          <motion.g initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <rect x="440" y="94" width="176" height="112" rx="12" className={T.amber.ink} strokeWidth="2" />
            <text x="528" y="116" textAnchor="middle" className="fill-amber font-mono text-[11px] font-bold">Permissions</text>
            {["Read project data", "Deploy applications"].map((t, i) => (
              <g key={t}>
                <rect x="456" y={130 + i * 28} width="144" height="22" rx="6" className="fill-background/70 stroke-amber/50" strokeWidth="1.4" />
                <text x="528" y={145 + i * 28} textAnchor="middle" className="fill-foreground/80 font-mono text-[10px]">{t}</text>
              </g>
            ))}
          </motion.g>
          <Tag x={398} y={136} text="attached to group" tone="amber" delay={0.7} />
        </>
      ) : null}

      {s === 2 ? (
        <>
          <Flow d="M440 150 H190 V150" tone="amber" count={2} dur={2} delay={0.6} />
          <Flow d="M356 150 H300 V142" tone="amber" count={1} dur={1.4} delay={1} />
        </>
      ) : null}

      <Pill x={320} y={270} w={470} text={pills[s]} tone={s === 1 || s === 2 ? "amber" : "mint"} delay={1.1} />
    </g>
  );
}

export function GroupHowVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={HOW_SCENES} viewBox="0 0 640 306" sceneMs={8500} render={(s) => <HowScene s={s} />} />;
}

/* ======================================================================
   3. EXAMPLE: Terraform creates a user, a group, and a membership
   ====================================================================== */

const TF_SCENES = [
  { label: "1. aws_iam_user", note: "The aws_iam_user resource creates Alice." },
  { label: "2. aws_iam_group", note: "The aws_iam_group resource creates the Developers group." },
  { label: "3. Membership", note: "The aws_iam_user_group_membership resource adds Alice to the group." },
  { label: "4. Not created", note: "The code creates no access keys, console passwords, or IAM policies. Alice cannot sign in with a console password from this configuration." },
] as const;

function TfScene({ s }: { s: number }) {
  const blocks = [
    { y: 82, head: 'resource "aws_iam_user" "alice"', note: "# creates Alice" },
    { y: 130, head: 'resource "aws_iam_group" "developers"', note: "# creates the Developers group" },
    { y: 178, head: 'resource "aws_iam_user_group_membership"', note: "# adds Alice to the group" },
  ];
  const pills = ["One IAM user", "One IAM group", "Alice is now a member of Developers", "Identities exist, but nothing grants access yet"];
  return (
    <g>
      <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <rect x="14" y="40" width="278" height="190" rx="10" className="fill-background/70 stroke-amber/70" strokeWidth="2" />
        <rect x="14" y="40" width="278" height="24" rx="10" className="fill-amber/15" />
        <circle cx="28" cy="52" r="3" className="fill-amber/70" />
        <circle cx="40" cy="52" r="3" className="fill-amber/50" />
        <circle cx="52" cy="52" r="3" className="fill-amber/30" />
        <text x="280" y="56" textAnchor="end" className="fill-amber font-mono text-[10.5px] font-bold">main.tf</text>
        {blocks.map((b, i) => (
          <g key={b.head} opacity={s === i ? 1 : 0.55}>
            {s === i ? <rect x="20" y={b.y - 14} width="266" height="36" rx="6" className="fill-amber/15" /> : null}
            <text x="28" y={b.y} className="fill-foreground font-mono text-[10px] font-bold">{b.head}</text>
            <text x="28" y={b.y + 16} className="fill-muted-foreground font-mono text-[10px]">{b.note}</text>
          </g>
        ))}
      </motion.g>

      <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <rect x="316" y="40" width="310" height="190" rx="12" className={`${T.mint.box} fill-background/40`} strokeWidth="2" />
        <text x="471" y="62" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold uppercase tracking-[0.18em]">AWS account</text>
      </motion.g>

      {s <= 2 ? <Line d="M292 135 H316" tone="amber" delay={0.2} /> : null}

      {s <= 2 ? (
        <>
          <motion.g key={`u${s}`} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: s === 0 ? 0.6 : 0.1, type: "spring", stiffness: 180, damping: 14 }}>
            <rect x="334" y="92" width="118" height="92" rx="10" className={T.mint.ink} strokeWidth="2" />
            <Person x={393} y={138} tone="mint" scale={2.4} />
            <text x="393" y="172" textAnchor="middle" className="fill-mint font-mono text-[9.5px] font-bold">aws-learning-alice</text>
          </motion.g>
          {s >= 1 ? (
            <motion.g key={`g${s}`} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: s === 1 ? 0.6 : 0.1, type: "spring", stiffness: 180, damping: 14 }}>
              <rect x="492" y="92" width="118" height="92" rx="10" className="fill-none stroke-mint" strokeWidth="2" strokeDasharray="6 4" />
              <Person x={522} y={132} tone="muted" scale={1.4} />
              <Person x={552} y={132} tone="muted" scale={1.4} />
              <Person x={582} y={132} tone="muted" scale={1.4} />
              <text x="551" y="166" textAnchor="middle" className="fill-mint font-mono text-[9.5px] font-bold">aws-learning-</text>
              <text x="551" y="178" textAnchor="middle" className="fill-mint font-mono text-[9.5px] font-bold">developers</text>
            </motion.g>
          ) : null}
          {s === 2 ? (
            <>
              <Line d="M452 138 H492" tone="mint" delay={0.4} dashed={false} />
              <Tag x={472} y={106} text="member of" tone="mint" delay={0.9} />
              <Flow d="M452 138 H492" tone="mint" count={2} dur={1.2} delay={1} />
            </>
          ) : null}
        </>
      ) : (
        <g>
          {["No access keys created", "No console password created", "No IAM policies created"].map((t, i) => (
            <motion.g key={t} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.3 }}>
              <rect x="338" y={78 + i * 46} width="266" height="36" rx="9" className={T.red.ink} strokeWidth="2" />
              <text x="384" y={101 + i * 46} className="fill-red-500 font-mono text-[11px] font-bold">{t}</text>
              <Tick cx={358} cy={96 + i * 46} bad delay={0.5 + i * 0.3} />
            </motion.g>
          ))}
        </g>
      )}

      <Pill x={320} y={246} w={560} text={pills[s]} tone={s === 3 ? "red" : "mint"} delay={1.2} />
    </g>
  );
}

export function IamTerraformVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={TF_SCENES} viewBox="0 0 640 282" sceneMs={8500} render={(s) => <TfScene s={s} />} />;
}
