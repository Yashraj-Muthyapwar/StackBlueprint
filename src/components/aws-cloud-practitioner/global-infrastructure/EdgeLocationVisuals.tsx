import type { ReactNode } from "react";
import { motion } from "motion/react";
import { StoryPlayer } from "../CloudFrame";
import { Equals, Flow, Server } from "./AvailabilityZoneVisuals";
import { Arc, FULL, LabelChip, Marker, Panel, Person, Pill, T, Tag, WorldMap, at, atXY, type Tone } from "./RegionsVisuals";

/* ---------------------------------------------------------------------
   Visuals for the Edge Locations lesson. Static Tailwind classes only.
   --------------------------------------------------------------------- */

function ImageIcon({ x, y, s = 1, tone = "mint", dim = false }: { x: number; y: number; s?: number; tone?: Tone; dim?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={dim ? 0.5 : 1}>
      <rect width="28" height="22" rx="3" className={T[tone].ink} strokeWidth="1.6" />
      <circle cx="8" cy="8" r="3" className={T[tone].solid} />
      <path d="M3 19 L11 11 L16 16 L20 12 L25 19 Z" className={T[tone].solid} opacity={0.7} />
    </g>
  );
}

/* ======================================================================
   1. INTUITION: a restaurant chain compared with AWS
   ====================================================================== */

const CHAIN_SCENES = [
  { label: "Central kitchen", note: "Think of a restaurant chain. The AWS Region is the central kitchen preparing food." },
  { label: "Distribution center", note: "An Edge Location is a local distribution center storing popular prepared items." },
  { label: "Customer", note: "The customer receives available items from the nearby distribution center instead of waiting for delivery from the central kitchen." },
  { label: "Not stocked", note: "If an item is not stocked nearby, it comes from the central kitchen first and is then kept close for the next customer." },
] as const;

function ChainSide({ x0, food, s }: { x0: number; food: boolean; s: number }) {
  const tone: Tone = food ? "amber" : "mint";
  const ox = x0 + 30;
  const ex = x0 + 140;
  const px = x0 + 262;
  const names = food ? ["Kitchen", "Local center", "Customer"] : ["Region", "Edge Location", "User"];
  return (
    <g>
      {/* origin */}
      <motion.g initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 140, damping: 15 }}>
        {food ? (
          <g>
            <rect x={ox} y="92" width="60" height="56" rx="6" className={T.amber.ink} strokeWidth="2" />
            <rect x={ox + 6} y="82" width="48" height="10" rx="3" className="fill-amber" />
            <rect x={ox + 16} y="108" width="28" height="18" rx="4" className="fill-amber" opacity={0.8} />
            <path d={`M${ox + 12} 114 h4 M${ox + 44} 114 h4`} className="stroke-amber" strokeWidth="2.4" strokeLinecap="round" />
            <path d={`M${ox + 18} 106 q4 -8 8 0 M${ox + 30} 106 q4 -8 8 0`} className="fill-none stroke-amber" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <rect x={ox} y="92" width="60" height="56" rx="8" className={`${T.mint.box} fill-background/60`} strokeWidth="2" strokeDasharray="4 3" />
            <Server x={ox + 8} y={99} w={44} h={22} tone="mint" delay={0.4} />
            <Server x={ox + 8} y={123} w={44} h={22} tone="mint" delay={0.55} />
          </g>
        )}
        <text x={ox + 30} y="74" textAnchor="middle" className={`${T[tone].text} font-mono text-[10px] font-bold uppercase tracking-wider`}>{names[0]}</text>
      </motion.g>

      {/* local distribution center / edge */}
      {s >= 1 ? (
        <g>
          <motion.path d={`M${ox + 60} 120 H${ex}`} className={`fill-none ${T[tone].line}`} strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
          <motion.g initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.3, type: "spring", stiffness: 190, damping: 13 }}>
            <rect x={ex} y="100" width="50" height="40" rx="6" className={T[tone].ink} strokeWidth="2" />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={ex + 7 + i * 13} y="118" width="10" height="10" rx="2" className={T[tone].solid} opacity={s === 3 && i === 2 ? 0 : 1} />
            ))}
            {s === 3 ? <rect x={ex + 33} y="118" width="10" height="10" rx="2" className={`fill-none ${T[tone].line}`} strokeDasharray="2 2" strokeWidth="1.2" /> : null}
          </motion.g>
          <text x={ex + 25} y="92" textAnchor="middle" className={`${T[tone].text} font-mono text-[10px] font-bold uppercase tracking-wider`}>{names[1]}</text>
          {s === 1 ? <Flow d={`M${ox + 60} 120 H${ex}`} tone={tone} count={2} dur={2.2} delay={1.2} /> : null}
          {s === 3 ? <motion.rect x={ex + 33} y="118" width="10" height="10" rx="2" className={T[tone].solid} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 4.6, type: "spring", stiffness: 260, damping: 12 }} /> : null}
        </g>
      ) : null}

      {/* customer */}
      {s >= 2 ? (
        <g>
          <Person x={px} y={158} tone={tone} delay={0.2} />
          <text x={px} y="180" textAnchor="middle" className={`${T[tone].text} font-mono text-[10px] font-bold uppercase tracking-wider`}>{names[2]}</text>
          {s === 2 ? (
            <g>
              <motion.path d={`M${ox + 30} 148 Q ${x0 + 150} 214 ${px - 6} 164`} className="fill-none stroke-muted-foreground/50" strokeWidth="1.8" strokeDasharray="3 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.8 }} />
              <Tag x={x0 + 150} y={194} text="Longer trip" tone="muted" delay={0.9} />
              <motion.path d={`M${ex + 50} 124 L${px - 8} 146`} className={`fill-none ${T[tone].line}`} strokeWidth="2.4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 0.5 }} />
              <Flow d={`M${ex + 50} 124 L${px - 8} 146`} tone={tone} count={3} dur={1.4} delay={1.8} />
            </g>
          ) : null}
          {s === 3 ? (
            <g>
              <motion.path d={`M${px - 8} 146 L${ex + 50} 124`} className={`fill-none ${T[tone].line}`} strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />
              <Flow d={`M${px - 8} 146 L${ex + 50} 124`} tone={tone} count={1} dur={1} delay={0.9} once />
              <Flow d={`M${ex} 120 H${ox + 60}`} tone="red" count={1} dur={1} delay={1.9} once />
              <Flow d={`M${ox + 60} 120 H${ex}`} tone={tone} count={1} dur={1.2} delay={3.2} once />
              <Flow d={`M${ex + 50} 124 L${px - 8} 146`} tone={tone} count={1} dur={1} delay={4.4} once />
            </g>
          ) : null}
        </g>
      ) : null}
    </g>
  );
}

function ChainScene({ s }: { s: number }) {
  const lefts = ["Central kitchen", "Local distribution center", "Nearby delivery", "Kitchen restocks the center"];
  const rights = ["AWS Region", "Edge Location", "Content from nearby", "Origin fetch, then cached"];
  const pills = ["Region = the central kitchen", "Edge Location = local distribution center", "Served from the nearby center", "Not stocked? Fetch it from the source"];
  return (
    <g>
      <Panel x={12} title="Restaurant chain" tone="amber" />
      <Panel x={332} title="AWS" tone="mint" />
      <Equals k={s} />
      <ChainSide x0={12} food s={s} />
      <ChainSide x0={332} food={false} s={s} />
      <LabelChip cx={160} y={208} text={lefts[s]} tone="amber" />
      <LabelChip cx={480} y={208} text={rights[s]} tone="mint" />
      <Pill x={320} y={262} w={470} text={pills[s]} tone="mint" delay={1.2} />
    </g>
  );
}

export function RestaurantChainVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={CHAIN_SCENES} viewBox="0 0 640 302" sceneMs={9000} render={(s) => <ChainScene s={s} />} />;
}

/* ======================================================================
   2. HOW: a CloudFront request, cache hit and cache miss
   ====================================================================== */

const HOW_SCENES = [
  { label: "1. Request", note: "A user in India requests an image. The request is routed through CloudFront to the nearest Edge Location." },
  { label: "2. Check cache", note: "The CloudFront Edge Location checks whether the image is cached." },
  { label: "3. Cache hit", note: "A cache hit means the requested content is available in the cache, so CloudFront serves the cached image to the user." },
  { label: "4. Cache miss", note: "A cache miss means CloudFront needs to retrieve it from another cache layer or the origin. It fetches the image from the origin, then delivers it." },
] as const;

const SLOT_X = [224, 288, 352];

function HowScene({ s }: { s: number }) {
  const hit = s === 2;
  const miss = s === 3;
  const pills = ["Request routed through CloudFront", "Edge checks whether the image is cached", "Cache hit: serve the cached image", "Cache miss: fetch from the origin, then deliver"];
  return (
    <g>
      {/* user */}
      <Person x={68} y={186} tone="amber" scale={1.9} />
      <text x="68" y="214" textAnchor="middle" className="fill-amber font-mono text-[10px] font-bold uppercase tracking-wider">User in India</text>
      <Pill x={68} y={112} w={110} text="Get image" tone="amber" delay={0.3} />

      {/* edge */}
      <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <rect x="215" y="60" width="200" height="200" rx="14" className={`${T.mint.box} fill-background/70`} strokeWidth="2" />
        <text x="315" y="84" textAnchor="middle" className="fill-mint font-mono text-[11px] font-bold tracking-wider">CloudFront Edge Location</text>
        <text x="315" y="116" textAnchor="middle" className="fill-muted-foreground font-mono text-[9.5px] uppercase tracking-[0.18em]">Cache</text>
      </motion.g>
      {SLOT_X.map((x, i) => {
        const requested = i === 1;
        const empty = requested && miss;
        return (
          <g key={x}>
            <rect x={x} y="126" width="50" height="44" rx="8" className={requested ? (s === 1 ? "fill-amber/10 stroke-amber" : T.mint.box) : "fill-muted-foreground/5 stroke-hairline"} strokeWidth="1.8" strokeDasharray={requested && miss ? "4 3" : undefined} />
            {!empty ? <ImageIcon x={x + 11} y={137} tone={requested ? "mint" : "muted"} /> : null}
            {requested && miss ? (
              <g>
                <motion.text x={x + 25} y="154" textAnchor="middle" className="fill-red-500 font-mono text-[16px] font-bold" initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ delay: 0.2, duration: 3.4, times: [0, 0.97, 1] }}>?</motion.text>
                <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 3.6, type: "spring", stiffness: 240, damping: 12 }}>
                  <rect x={x} y="126" width="50" height="44" rx="8" className="fill-background" />
                  <rect x={x} y="126" width="50" height="44" rx="8" className={T.mint.box} strokeWidth="1.8" />
                  <ImageIcon x={x + 11} y={137} tone="mint" />
                </motion.g>
              </g>
            ) : null}
          </g>
        );
      })}
      <text x="313" y="188" textAnchor="middle" className="fill-muted-foreground text-[10.5px]">Requested image</text>
      {s === 1 ? (
        <motion.rect y="122" width="58" height="52" rx="10" className="fill-none stroke-amber" strokeWidth="2.4" initial={{ x: SLOT_X[0] - 4 }} animate={{ x: [SLOT_X[0] - 4, SLOT_X[1] - 4, SLOT_X[2] - 4, SLOT_X[1] - 4] }} transition={{ duration: 3, delay: 0.4, times: [0, 0.35, 0.7, 1] }} />
      ) : null}
      {s === 1 ? <Pill x={315} y={216} w={130} text="Cached?" tone="amber" delay={0.5} /> : null}
      {hit ? (
        <g>
          <Pill x={315} y={216} w={130} text="Cache hit" tone="mint" delay={0.5} />
          <motion.g initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 12 }}>
            <circle cx="398" cy="130" r="9" className="fill-mint/20 stroke-mint" strokeWidth="1.8" />
            <path d="M393 130 l3.5 3.5 l6 -7" className="fill-none stroke-mint" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </g>
      ) : null}
      {miss ? <Pill x={315} y={216} w={130} text="Cache miss" tone="red" delay={0.5} /> : null}

      {/* origin */}
      <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: hit ? 0.45 : 1, y: 0 }} transition={{ delay: 0.2 }}>
        <rect x="470" y="100" width="150" height="150" rx="12" className={`${T.amber.box} fill-background/70`} strokeWidth="2" />
        <text x="545" y="122" textAnchor="middle" className="fill-amber font-mono text-[11px] font-bold tracking-wider">ORIGIN</text>
        <Server x={510} y={138} tone="amber" delay={0.4} />
        <text x="545" y="212" textAnchor="middle" className="fill-foreground/80 text-[11px]">Amazon S3</text>
        <text x="545" y="228" textAnchor="middle" className="fill-muted-foreground text-[11px]">or a web server</text>
      </motion.g>
      {hit ? <Tag x={443} y={166} text="Not contacted" tone="muted" delay={0.9} /> : null}

      {/* lines */}
      <path d="M104 176 H215" className="fill-none stroke-hairline" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M415 176 H470" className="fill-none stroke-hairline" strokeWidth="2" strokeDasharray="4 4" />
      {s === 0 ? (
        <g>
          <Flow d="M104 176 H215" tone="amber" count={3} dur={1.6} delay={0.8} />
          <Tag x={160} y={156} text="CloudFront" tone="mint" delay={0.5} />
        </g>
      ) : null}
      {hit ? <Flow d="M215 192 H104" tone="mint" count={3} dur={1.6} delay={1.2} /> : null}
      {miss ? (
        <g>
          <Flow d="M415 176 H470" tone="red" count={1} dur={1} delay={0.8} once />
          <Flow d="M470 192 H415" tone="mint" count={1} dur={1} delay={2.2} once />
          <Flow d="M215 192 H104" tone="mint" count={3} dur={1.6} delay={4} />
        </g>
      ) : null}

      <Pill x={320} y={296} w={460} text={pills[s]} tone={miss ? "amber" : "mint"} delay={1.3} />
    </g>
  );
}

export function CloudFrontHowVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={HOW_SCENES} viewBox="0 0 640 336" sceneMs={9000} render={(s) => <HowScene s={s} />} />;
}

/* ======================================================================
   3. EXAMPLE: Virginia origin, customers in India
   ====================================================================== */

const EX_SCENES = [
  { label: "Origin", note: "An e-commerce website runs in the AWS Virginia Region. Customers in India frequently request product images." },
  { label: "Without CloudFront", note: "Without CloudFront, these images may need to be fetched from the US origin." },
  { label: "With CloudFront", note: "With CloudFront, frequently requested images can be cached at Edge Locations closer to Indian users." },
  { label: "Result", note: "Cached images reach Indian users from nearby, reducing delivery latency." },
] as const;

function EdgeNode({ x, y, delay = 0, cachedAt = null }: { x: number; y: number; delay?: number; cachedAt?: number | null }) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay, type: "spring", stiffness: 220, damping: 13 }}>
      <g transform={`translate(${x} ${y}) scale(0.4)`}>
        <motion.circle r="16" className="fill-amber/20" animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.7, 0, 0.7] }} transition={{ duration: 2, repeat: Infinity, delay }} />
        <rect x="-12" y="-12" width="24" height="24" rx="6" className="fill-background" />
        <rect x="-12" y="-12" width="24" height="24" rx="6" className="fill-amber/25 stroke-amber" strokeWidth="2.2" />
        <motion.g initial={{ opacity: 1 }} animate={{ opacity: cachedAt === null ? 1 : 0 }} transition={{ delay: cachedAt ?? 0, duration: 0.3 }}>
          <path d="M-6 -4 H6 M-6 0 H6 M-6 4 H6" className="fill-none stroke-amber" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
        {cachedAt !== null ? (
          <motion.g initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: cachedAt, type: "spring", stiffness: 240, damping: 12 }}>
            <g transform="translate(-7 -5) scale(0.5)">
              <rect width="28" height="22" rx="3" className="fill-mint/30 stroke-mint" strokeWidth="2.4" />
              <circle cx="8" cy="8" r="3" className="fill-mint" />
              <path d="M3 19 L11 11 L16 16 L20 12 L25 19 Z" className="fill-mint" opacity={0.8} />
            </g>
          </motion.g>
        ) : null}
      </g>
    </motion.g>
  );
}

function Fade({ until, children }: { until: number; children: ReactNode }) {
  return (
    <motion.g initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ duration: until + 0.4, times: [0, until / (until + 0.4), 1] }}>
      {children}
    </motion.g>
  );
}

function ExampleScene({ s }: { s: number }) {
  const L = FULL;
  const us = at(L, "us-east-1");
  const users = [[724, 188], [743, 213], [749, 171]].map((p) => atXY(L, p));
  const edges = [[711.6, 196.6], [730, 222], [757.1, 181.7]].map((p) => atXY(L, p));
  const pts = [...users, ...edges];
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const zoom = s >= 2;
  const zs = s === 2 ? 3.6 : 0.3;
  const k = zoom ? 2.6 : 1;
  const tx = 320 - k * cx;
  const ty = 140 - k * cy;
  const proj = (p: number[]): [number, number] => (zoom ? [tx + k * p[0], ty + k * p[1]] : [p[0], p[1]]);
  const personScale = zoom ? 0.55 : 0.85;
  const pills = ["Origin in Virginia, customers in India", "Images travel from the US origin", "First request fills a nearby Edge Location", "Zoomed in: served from the nearest Edge Location"];
  const ready = s === 2 ? zs + 2.2 : zs + 1.8;
  return (
    <g>
      <motion.g key={zoom ? "z" + s : "n"} initial={zoom ? { x: 0, y: 0, scale: 1 } : false} animate={{ x: zoom ? tx : 0, y: zoom ? ty : 0, scale: k }} transition={{ delay: zs, duration: 1.8, ease: "easeInOut" }} style={{ transformBox: "view-box", originX: 0, originY: 0 }}>
        <WorldMap L={L} india />
        <Marker x={us[0]} y={us[1]} r={5} delay={0.2} />
        {users.map(([x, y], i) => (
          <Person key={i} x={x} y={y} tone="amber" scale={personScale} delay={i * 0.2} />
        ))}

        {s === 1
          ? users.map(([x, y], i) => <Arc key={i} a={[us[0], us[1]]} b={[x, y]} tone="red" lift={46 + i * 8} delay={0.4 + i * 0.2} dots={2} dur={3.6} />)
          : null}

        {s >= 2
          ? edges.map(([x, y], i) => <EdgeNode key={i} x={x} y={y} delay={0.4 + i * 0.25} cachedAt={s === 3 ? 0.4 : i === 0 ? ready + 0.2 : null} />)
          : null}
        {s === 2 ? <Arc a={[us[0], us[1]]} b={[edges[0][0], edges[0][1]]} tone="amber" lift={52} delay={1} dots={1} dur={2.6} /> : null}
        {zoom
          ? (s === 2 ? [0] : [0, 1, 2]).map((i) => (
              <g key={i}>
                <motion.line x1={users[i][0]} y1={users[i][1]} x2={edges[i][0]} y2={edges[i][1]} className="stroke-mint" strokeWidth={1} strokeDasharray="3 3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: ready + i * 0.15, duration: 0.5 }} />
                <motion.circle r="2.2" cx={edges[i][0]} cy={edges[i][1]} className="fill-mint" initial={{ opacity: 0 }} animate={{ cx: [edges[i][0], users[i][0]], cy: [edges[i][1], users[i][1]], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.4, repeat: Infinity, delay: ready + 0.8 + i * 0.4, repeatDelay: 0.6 }} />
              </g>
            ))
          : null}
      </motion.g>

      {/* labels stay at a fixed size, outside the zoomed group */}
      {s <= 1 ? <Tag x={us[0] + 2} y={us[1] + 24} text="Origin us-east-1" tone="mint" delay={0.5} /> : null}
      {s === 2 ? (
        <Fade until={zs}>
          <Tag x={us[0] + 2} y={us[1] + 24} text="Origin us-east-1" tone="mint" delay={0.5} />
          <Tag x={(us[0] + edges[0][0]) / 2} y={us[1] - 40} text="First request only" tone="amber" delay={1.6} />
        </Fade>
      ) : null}
      {s === 0 ? <Tag x={users[0][0]} y={users[0][1] - 30} text="Customers in India" tone="amber" delay={0.6} /> : null}
      {s === 1 ? <Tag x={(us[0] + users[0][0]) / 2} y={us[1] - 44} text="Long distance" tone="red" delay={1.6} /> : null}
      {s === 2 ? (
        <g>
          <Tag x={proj(edges[1])[0] - 10} y={proj(edges[1])[1] + 70} text="Edge Locations" tone="amber" delay={zs + 1.6} />
          <Tag x={proj(edges[0])[0] - 62} y={proj(edges[0])[1] + 36} text="Image cached here" tone="mint" delay={ready + 0.4} />
        </g>
      ) : null}
      {s === 3 ? (
        <g>
          <Tag x={proj(edges[1])[0] - 10} y={proj(edges[1])[1] + 70} text="Edge Locations with cached images" tone="amber" delay={2.4} />
          <Tag x={proj(users[2])[0] + 20} y={proj(users[2])[1] - 44} text="Users nearby" tone="mint" delay={2.6} />
        </g>
      ) : null}

      <Pill x={320} y={288} w={440} text={pills[s]} tone={s === 1 ? "red" : s === 2 ? "amber" : "mint"} delay={1.4} />
    </g>
  );
}

export function EdgeExampleVisual({ caption }: { caption: string }) {
  return <StoryPlayer caption={caption} scenes={EX_SCENES} viewBox="0 0 640 322" sceneMs={9000} render={(s) => <ExampleScene s={s} />} />;
}
