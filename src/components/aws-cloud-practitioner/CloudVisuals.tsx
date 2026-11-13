import { motion } from "motion/react";
import { StoryPlayer } from "./CloudFrame";

/* ======================================================================
   1. INTUITION: own a power plant, plug in, or use the cloud
   ====================================================================== */

const SCENES = [
  { id: "own", label: "Own it", note: "Owning infrastructure is like running your own power plant: you buy, maintain, and upgrade everything yourself." },
  { id: "plug", label: "Plug in", note: "With electricity you just plug in. The plant belongs to someone else, and you use what you need." },
  { id: "cloud", label: "Cloud", note: "AWS provides computing resources without requiring you to own a data center." },
] as const;
const SCENE_MS = 7000;

function House({ x, y, lit, scale = 1 }: { x: number; y: number; lit: boolean; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-22 0 L0 -20 L22 0 Z" className="fill-muted-foreground/40 stroke-muted-foreground/60" strokeWidth="1.5" />
      <rect x="-18" y="0" width="36" height="26" rx="2" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="1.5" />
      <motion.rect
        x="-8" y="6" width="16" height="14" rx="1.5"
        className="fill-amber"
        animate={{ opacity: lit ? [0.85, 1, 0.85] : 0.12 }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
    </g>
  );
}

function Pulse({ d, delay = 0, color = "fill-mint", dur = 2.2 }: { d: string; delay?: number; color?: string; dur?: number }) {
  return (
    <motion.circle
      r="4"
      className={color}
      style={{ offsetPath: `path("${d}")` }}
      initial={{ offsetDistance: "0%", opacity: 0 }}
      animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
      transition={{ duration: dur, repeat: Infinity, ease: "linear", delay }}
    />
  );
}

function Smoke({ x, delay }: { x: number; delay: number }) {
  return (
    <motion.circle
      cx={x} cy={118} r="7"
      className="fill-muted-foreground/50"
      animate={{ cy: [118, 50], r: [6, 18], opacity: [0.7, 0], cx: [x, x + 22] }}
      transition={{ duration: 3.4, repeat: Infinity, delay, ease: "easeOut" }}
    />
  );
}

function Tag({ x, y, text, delay, tone = "amber" }: { x: number; y: number; text: string; delay: number; tone?: "amber" | "mint" }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: [0, 1, 1, 0], y: [14, 0, -4, -16] }}
      transition={{ duration: 4.5, repeat: Infinity, delay, times: [0, 0.15, 0.8, 1] }}
    >
      <rect x={x} y={y} width="104" height="26" rx="13" className={tone === "amber" ? "fill-amber/15 stroke-amber/60" : "fill-mint/15 stroke-mint/60"} />
      <text x={x + 52} y={y + 17} textAnchor="middle" className={`font-mono text-[11px] ${tone === "amber" ? "fill-amber" : "fill-mint"}`}>
        {text}
      </text>
    </motion.g>
  );
}

function OwnScene() {
  return (
    <g>
      {/* ground */}
      <line x1="20" y1="196" x2="620" y2="196" className="stroke-hairline" strokeWidth="2" />
      {/* plant */}
      <rect x="70" y="118" width="150" height="78" rx="4" className="fill-amber/15 stroke-amber/70" strokeWidth="2" />
      <rect x="92" y="70" width="26" height="48" className="fill-amber/20 stroke-amber/70" strokeWidth="2" />
      <rect x="150" y="84" width="26" height="34" className="fill-amber/20 stroke-amber/70" strokeWidth="2" />
      <Smoke x={105} delay={0} /><Smoke x={105} delay={1.7} /><Smoke x={163} delay={0.9} /><Smoke x={163} delay={2.6} />
      <motion.path
        d="M140 140 L124 168 H138 L130 190 L158 158 H144 Z"
        className="fill-amber"
        animate={{ opacity: [1, 0.35, 1, 0.6, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      {/* gears: maintenance */}
      <motion.g style={{ transformOrigin: "245px 160px" }} animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
        <circle cx="245" cy="160" r="14" className="fill-none stroke-amber/70" strokeWidth="5" strokeDasharray="5 4" />
        <circle cx="245" cy="160" r="5" className="fill-amber/70" />
      </motion.g>
      {/* wire + house */}
      <path d="M220 170 H430" className="stroke-amber/50" strokeWidth="3" fill="none" />
      <Pulse d="M220 170 H430" color="fill-amber" />
      <Pulse d="M220 170 H430" color="fill-amber" delay={1.1} />
      <House x={470} y={170} lit scale={1.5} />
      {/* costs */}
      <Tag x={400} y={36} text="Buy" delay={0} />
      <Tag x={470} y={62} text="Maintain" delay={1.4} />
      <Tag x={420} y={88} text="Upgrade" delay={2.8} />
      <text x="320" y="230" textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-[0.14em]">You run everything yourself</text>
    </g>
  );
}

function PlugScene() {
  const wire = "M150 150 H560";
  return (
    <g>
      <line x1="20" y1="196" x2="620" y2="196" className="stroke-hairline" strokeWidth="2" />
      {/* distant plant */}
      <rect x="40" y="136" width="70" height="60" rx="3" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="2" />
      <rect x="54" y="106" width="14" height="30" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="2" />
      <text x="75" y="220" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]">Power company</text>
      {/* pylons */}
      {[190, 270, 350, 430].map((x) => (
        <g key={x} className="stroke-muted-foreground/70" strokeWidth="2" fill="none">
          <path d={`M${x - 12} 196 L${x} 140 L${x + 12} 196 M${x - 16} 150 H${x + 16}`} />
        </g>
      ))}
      <path d={wire} className="stroke-mint/60" strokeWidth="3" fill="none" />
      {[0, 0.7, 1.4].map((d) => <Pulse key={d} d={wire} delay={d} />)}
      {/* houses */}
      <House x={500} y={170} lit scale={1.1} />
      <House x={560} y={170} lit scale={1.1} />
      {/* meter */}
      <g transform="translate(300 52)">
        <rect width="150" height="58" rx="10" className="fill-mint/10 stroke-mint/60" strokeWidth="1.5" />
        <text x="75" y="20" textAnchor="middle" className="fill-mint font-mono text-[10px] uppercase tracking-[0.14em]">Pay for usage</text>
        <motion.text
          x="75" y="46" textAnchor="middle" className="fill-foreground font-mono text-[18px] font-semibold"
          animate={{ opacity: [0.75, 1, 0.75] }} transition={{ duration: 1.4, repeat: Infinity }}
        >
          kWh meter
        </motion.text>
      </g>
      <text x="320" y="240" textAnchor="middle" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-[0.14em]">Plug in, use what you need</text>
    </g>
  );
}

function Client({ x, y, label, delay }: { x: number; y: number; label: string; delay: number }) {
  const path = `M${x} ${y} Q ${x - 70} ${y - 60} 330 70`;
  return (
    <g>
      <path d={path} className="stroke-mint/30" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
      <Pulse d={path} delay={delay} dur={2.4} />
      <rect x={x - 34} y={y - 4} width="68" height="38" rx="8" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="1.5" />
      <text x={x} y={y + 20} textAnchor="middle" className="fill-foreground font-mono text-[10px] uppercase tracking-[0.1em]">{label}</text>
    </g>
  );
}

function Rack({ y, seed }: { y: number; seed: number }) {
  return (
    <g>
      <rect x="130" y={y} width="130" height="26" rx="4" className="fill-surface-2 stroke-mint/60" strokeWidth="1.5" />
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle
          key={i} cx={146 + i * 14} cy={y + 13} r="3.5" className="fill-mint"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.1 + ((i * seed) % 5) * 0.25, repeat: Infinity, delay: (i * 0.17 * seed) % 1 }}
        />
      ))}
      <rect x="220" y={y + 8} width="28" height="10" rx="2" className="fill-mint/20" />
    </g>
  );
}

function CloudScene() {
  return (
    <g>
      <motion.path
        d="M290 78 a30 30 0 0 1 56 -14 a24 24 0 0 1 36 22 a20 20 0 0 1 -6 38 H300 a24 24 0 0 1 -10 -46 Z"
        className="fill-mint/15 stroke-mint/70" strokeWidth="2"
        animate={{ y: [0, -4, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <text x="338" y="94" textAnchor="middle" className="fill-mint font-mono text-[12px] font-semibold">AWS</text>
      <Client x={500} y={150} label="Laptop" delay={0} />
      <Client x={540} y={90} label="Phone" delay={0.8} />
      <Client x={500} y={30} label="Web store" delay={1.6} />
      {/* data center */}
      <line x1="20" y1="236" x2="620" y2="236" className="stroke-hairline" strokeWidth="2" />
      <rect x="110" y="132" width="170" height="104" rx="6" className="fill-mint/5 stroke-mint/40" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => <Rack key={i} y={140 + i * 23} seed={i + 2} />)}
      <path d="M190 132 Q 250 100 316 108" className="stroke-mint/40" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
      <text x="195" y="256" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]">AWS data center</text>
      <text x="520" y="206" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]">Request over the internet</text>
    </g>
  );
}

export function PowerPlantVisual({ caption }: { caption: string }) {
  return (
    <StoryPlayer
      caption={caption}
      scenes={SCENES}
      viewBox="0 0 640 270"
      sceneMs={SCENE_MS}
      render={(scene) => (scene === 0 ? <OwnScene /> : scene === 1 ? <PlugScene /> : <CloudScene />)}
    />
  );
}

/* ======================================================================
   2. EXAMPLE: a holiday sale, told as an illustrated story
   ====================================================================== */

const SALE = [
  { label: "Normal day", note: "The online store normally needs two servers, and they handle the traffic comfortably.", servers: 2, prevServers: 2, shoppers: 2, prevShoppers: 2, mode: "calm" },
  { label: "Sale starts", note: "The holiday sale brings a surge of shoppers. Two servers are overloaded, and the store needs ten.", servers: 2, prevServers: 2, shoppers: 10, prevShoppers: 2, mode: "overload" },
  { label: "Scale up", note: "With AWS, the store adds capacity during the sale. Ten servers share the load.", servers: 10, prevServers: 2, shoppers: 10, prevShoppers: 10, mode: "scaled" },
  { label: "Sale ends", note: "Afterward, the extra capacity is removed and you stop paying for it.", servers: 2, prevServers: 10, shoppers: 2, prevShoppers: 10, mode: "calm" },
] as const;

function Shopper({ i, on, wasOn }: { i: number; on: boolean; wasOn: boolean }) {
  const col = i % 5;
  const row = Math.floor(i / 5);
  const x = 34 + col * 24 + row * 10;
  const y = 214 - row * 34;
  return (
    <motion.g
      initial={{ opacity: wasOn ? 1 : 0, x: wasOn ? 0 : -40 }}
      animate={{ opacity: on ? 1 : 0, x: on ? 0 : -40 }}
      transition={{ duration: 0.6, delay: (on && !wasOn ? i * 0.07 : 0) + (!on && wasOn ? i * 0.05 : 0) }}
    >
      <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 0.7 + (i % 3) * 0.15, repeat: Infinity, delay: i * 0.1 }}>
        <circle cx={x} cy={y - 24} r="5.5" className="fill-amber" />
        <rect x={x - 6} y={y - 17} width="12" height="18" rx="5" className="fill-amber/70" />
        <rect x={x - 5} y={y + 1} width="3.5" height="8" rx="1.5" className="fill-amber/70" />
        <rect x={x + 1.5} y={y + 1} width="3.5" height="8" rx="1.5" className="fill-amber/70" />
      </motion.g>
    </motion.g>
  );
}

function Store({ sale }: { sale: boolean }) {
  return (
    <g>
      <rect x="196" y="132" width="104" height="82" rx="4" className="fill-surface-2 stroke-muted-foreground/60" strokeWidth="2" />
      {/* awning */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${196 + i * 20.8} 132 h20.8 l-4 22 h-12.8 Z`} className={i % 2 ? "fill-surface-2" : "fill-mint/50"} stroke="none" />
      ))}
      <rect x="196" y="128" width="104" height="8" rx="3" className="fill-mint/70" />
      <rect x="208" y="164" width="34" height="50" rx="2" className="fill-mint/10 stroke-mint/50" strokeWidth="1.5" />
      <rect x="254" y="164" width="34" height="30" rx="2" className="fill-mint/10 stroke-mint/50" strokeWidth="1.5" />
      <text x="248" y="124" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.14em]">Online store</text>
      {sale ? (
        <motion.g
          style={{ transformOrigin: "248px 70px" }}
          initial={{ opacity: 0, scale: 0.4, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: [-3, 3, -3] }}
          transition={{ opacity: { duration: 0.3 }, scale: { type: "spring", stiffness: 220, damping: 12 }, rotate: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
        >
          <line x1="222" y1="70" x2="222" y2="108" className="stroke-muted-foreground/60" strokeWidth="2" />
          <line x1="274" y1="70" x2="274" y2="108" className="stroke-muted-foreground/60" strokeWidth="2" />
          <rect x="204" y="50" width="88" height="34" rx="6" className="fill-amber stroke-amber" />
          <text x="248" y="64" textAnchor="middle" className="fill-background font-mono text-[9px] font-bold tracking-[0.12em]">HOLIDAY</text>
          <text x="248" y="77" textAnchor="middle" className="fill-background font-mono text-[11px] font-bold tracking-[0.12em]">SALE</text>
        </motion.g>
      ) : null}
    </g>
  );
}

function Slot({ i, on, wasOn, mode }: { i: number; on: boolean; wasOn: boolean; mode: string }) {
  const col = i % 5;
  const row = Math.floor(i / 5);
  const x = 384 + col * 48;
  const y = 132 + row * 58;
  const extra = i >= 2;
  const overloaded = on && mode === "overload";
  const stroke = overloaded ? "stroke-red-500" : extra ? "stroke-amber" : "stroke-mint";
  const fill = overloaded ? "fill-red-500" : extra ? "fill-amber" : "fill-mint";
  const body = overloaded ? "fill-red-500/15" : extra ? "fill-amber/10" : "fill-mint/10";
  const load = mode === "overload" ? 1 : mode === "scaled" ? 0.55 : 0.45;
  return (
    <motion.g
      initial={{ opacity: wasOn ? 1 : 0.2, y: wasOn ? 0 : -46 }}
      animate={{ opacity: on ? 1 : 0.2, y: on ? 0 : -46 }}
      transition={{ type: "spring", stiffness: 180, damping: 15, delay: on && !wasOn ? (i - 2) * 0.11 : !on && wasOn ? (9 - i) * 0.08 : 0 }}
    >
      <motion.g animate={overloaded ? { x: [0, -1.6, 1.6, -1.6, 0] } : { x: 0 }} transition={{ duration: 0.28, repeat: overloaded ? Infinity : 0 }}>
        <rect x={x} y={y} width="40" height="48" rx="6" className={`${on ? body : "fill-none"} ${on ? stroke : "stroke-muted-foreground/50"}`} strokeWidth="1.8" strokeDasharray={on ? undefined : "3 3"} />
        {on
          ? [0, 1, 2].map((l) => (
              <motion.circle
                key={l} cx={x + 9 + l * 11} cy={y + 10} r="2.6" className={fill}
                animate={{ opacity: overloaded ? [1, 0.2, 1] : [0.25, 1, 0.25] }}
                transition={{ duration: overloaded ? 0.35 : 1 + l * 0.3, repeat: Infinity }}
              />
            ))
          : null}
        {on ? (
          <>
            <rect x={x + 6} y={y + 24} width="28" height="6" rx="3" className="fill-background/60" />
            <motion.rect
              x={x + 6} y={y + 24} height="6" rx="3" className={fill}
              initial={{ width: 0 }} animate={{ width: 28 * load }} transition={{ duration: 0.8, delay: 0.3 }}
            />
            <rect x={x + 6} y={y + 35} width="28" height="3" rx="1.5" className="fill-background/50" />
          </>
        ) : null}
      </motion.g>
    </motion.g>
  );
}

function Packets({ count, overloaded }: { count: number; overloaded: boolean }) {
  const d = "M170 186 H300 H378";
  return (
    <g>
      <path d={d} className="stroke-hairline" strokeWidth="2" strokeDasharray="4 5" fill="none" />
      {Array.from({ length: count }, (_, i) => (
        <motion.circle
          key={i}
          r="3.6"
          className={overloaded ? "fill-red-500" : "fill-amber"}
          style={{ offsetPath: `path("${d}")` }}
          initial={{ offsetDistance: "0%", opacity: 0 }}
          animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: overloaded ? 1 : 1.8, repeat: Infinity, ease: "linear", delay: (i / count) * (overloaded ? 1 : 1.8) }}
        />
      ))}
    </g>
  );
}

function SaleScene({ index }: { index: number }) {
  const s = SALE[index];
  const sale = index === 1 || index === 2;
  return (
    <g>
      <line x1="20" y1="226" x2="620" y2="226" className="stroke-hairline" strokeWidth="2" />
      {/* shoppers */}
      {Array.from({ length: 10 }, (_, i) => (
        <Shopper key={i} i={i} on={i < s.shoppers} wasOn={i < s.prevShoppers} />
      ))}
      <Store sale={sale} />
      <Packets count={s.shoppers} overloaded={s.mode === "overload"} />

      {/* cloud */}
      <motion.path
        d="M440 70 a22 22 0 0 1 42 -10 a18 18 0 0 1 27 16 a15 15 0 0 1 -4 28 H448 a18 18 0 0 1 -8 -34 Z"
        className={s.mode === "scaled" ? "fill-mint/20 stroke-mint" : "fill-mint/5 stroke-mint/40"}
        strokeWidth="2"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <text x="478" y="86" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold">AWS</text>

      {/* fleet */}
      {Array.from({ length: 10 }, (_, i) => (
        <Slot key={i} i={i} on={i < s.servers} wasOn={i < s.prevServers} mode={s.mode} />
      ))}

      {/* status badges */}
      {s.mode === "overload" ? (
        <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: "400px 110px" }}>
          <motion.g animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ transformOrigin: "374px 111px" }}>
            <rect x="318" y="98" width="112" height="26" rx="13" className="fill-red-500/15 stroke-red-500/70" />
            <text x="374" y="115" textAnchor="middle" className="fill-red-500 font-mono text-[11px] font-semibold uppercase tracking-wider">Overloaded</text>
          </motion.g>
        </motion.g>
      ) : null}
      {s.mode === "scaled" ? (
        <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <rect x="506" y="48" width="104" height="26" rx="13" className="fill-amber/15 stroke-amber/70" />
          <text x="558" y="65" textAnchor="middle" className="fill-amber font-mono text-[11px] font-semibold uppercase tracking-wider">+8 servers</text>
        </motion.g>
      ) : null}
      {s.mode === "calm" && index === 3 ? (
        <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <rect x="500" y="48" width="112" height="26" rx="13" className="fill-mint/15 stroke-mint/70" />
          <text x="556" y="65" textAnchor="middle" className="fill-mint font-mono text-[11px] font-semibold uppercase tracking-wider">Extra released</text>
        </motion.g>
      ) : null}

      {/* cost pill */}
      <rect x="384" y="244" width="232" height="26" rx="13" className="fill-surface-2 stroke-hairline" />
      <text x="500" y="261" textAnchor="middle" className="fill-foreground font-mono text-[11px] uppercase tracking-wider">
        You pay for {s.servers} servers
      </text>
      <text x="34" y="261" className="fill-muted-foreground font-mono text-[11px] uppercase tracking-wider">
        {s.shoppers > 2 ? "Shoppers: sale rush" : "Shoppers: steady"}
      </text>
    </g>
  );
}

export function HolidayScalingVisual({ caption }: { caption: string }) {
  return (
    <StoryPlayer
      caption={caption}
      scenes={SALE}
      viewBox="0 0 640 280"
      sceneMs={6500}
      render={(scene) => <SaleScene index={scene} />}
    />
  );
}
