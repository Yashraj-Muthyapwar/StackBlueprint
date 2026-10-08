import { useEffect, useId, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export type RivetState = "idle" | "thinking" | "speaking";

interface RivetOrbProps {
  size?: number;
  state?: RivetState;
  /** Disable the idle floating motion (e.g. when used as a small avatar). */
  still?: boolean;
  /** Pupils track the cursor and the head tilts toward it. */
  follow?: boolean;
  className?: string;
}

/**
 * Rivet, the StackBlueprint tutor: a friendly site-foreman character with a
 * hard hat, big expressive eyes and a smile. Idle floats, blinks and looks
 * around; thinking scans side to side with thought dots; speaking opens
 * the mouth. Larger sizes add sparkles while it talks.
 */
export function RivetOrb({
  size = 56,
  state = "idle",
  still = false,
  follow = false,
  className,
}: RivetOrbProps) {
  const reduce = useReducedMotion();
  const animate = !reduce;
  const thinking = state === "thinking";
  const speaking = state === "speaking";
  const uid = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const lookX = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 });
  const lookY = useSpring(useMotionValue(0), { stiffness: 140, damping: 16 });
  const tilt = useTransform(lookX, (v) => v * 1.1);
  const rich = size >= 44; // sparkles need room to read
  const fill = { transformBox: "fill-box", transformOrigin: "center" } as const;

  useEffect(() => {
    if (!follow || !animate) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const clamp = (v: number) => Math.max(-1, Math.min(1, v / 220));
      lookX.set(clamp(dx) * 3.6);
      lookY.set(clamp(dy) * 2.6);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [follow, animate, lookX, lookY]);

  const eye = (cx: number) => <ellipse key={cx} cx={cx} cy="66" rx="8.2" ry="9" fill="white" />;
  const pupil = (cx: number) => (
    <g key={cx}>
      <circle cx={cx} cy="67" r="4.8" style={{ fill: "oklch(0.2 0.02 260)" }} />
      <circle cx={cx + 1.6} cy="64.8" r="1.5" fill="white" />
    </g>
  );

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
      animate={animate && !still ? { y: [0, -size * 0.06, 0] } : undefined}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-[-18%] rounded-full blur-xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--mint) 50%, transparent), color-mix(in oklab, var(--amber) 28%, transparent) 60%, transparent 75%)",
        }}
        animate={
          animate
            ? { opacity: thinking ? [0.55, 1, 0.55] : [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }
            : undefined
        }
        transition={{ duration: thinking ? 1.2 : 3.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 100 100" className="relative h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "oklch(0.93 0.07 175)" }} />
            <stop offset="100%" style={{ stopColor: "oklch(0.78 0.11 200)" }} />
          </linearGradient>
          <linearGradient id={`${uid}-hat`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "oklch(0.86 0.15 80)" }} />
            <stop offset="100%" style={{ stopColor: "var(--amber)" }} />
          </linearGradient>
        </defs>

        {/* soft ground shadow that breathes with the float */}
        {!still && (
          <motion.ellipse
            cx="50"
            cy="99"
            rx="24"
            ry="2.4"
            style={{ ...fill, fill: "var(--foreground)" }}
            animate={
              animate ? { opacity: [0.14, 0.07, 0.14], scaleX: [1, 0.85, 1] } : { opacity: 0.1 }
            }
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <motion.g style={follow ? { ...fill, rotate: tilt } : undefined}>
          {/* head */}
          <circle cx="50" cy="60" r="33" fill={`url(#${uid}-face)`} />
          <ellipse cx="38" cy="46" rx="14" ry="6" fill="white" fillOpacity="0.18" />

          {/* cheeks */}
          <circle cx="30" cy="77" r="4.5" style={{ fill: "var(--rose)" }} fillOpacity="0.35" />
          <circle cx="70" cy="77" r="4.5" style={{ fill: "var(--rose)" }} fillOpacity="0.35" />

          {/* eyes: whites blink, pupils look around */}
          <motion.g
            style={fill}
            animate={animate && !thinking ? { scaleY: [1, 1, 0.08, 1] } : undefined}
            transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
          >
            {[37, 63].map(eye)}
            <motion.g style={follow ? { x: lookX, y: lookY } : undefined}>
              <motion.g
                animate={animate && thinking ? { x: [-3.5, 3.5, -3.5] } : { x: 0 }}
                transition={{ duration: 1.4, repeat: thinking ? Infinity : 0, ease: "easeInOut" }}
              >
                {[37, 63].map(pupil)}
              </motion.g>
            </motion.g>
          </motion.g>

          {/* mouth */}
          {speaking ? (
            <motion.ellipse
              cx="50"
              cy="82"
              rx="5"
              ry="4"
              style={{ ...fill, fill: "oklch(0.25 0.04 20)" }}
              animate={animate ? { scaleY: [0.5, 1.1, 0.5], scaleX: [0.9, 1, 0.9] } : undefined}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          ) : thinking ? (
            <ellipse cx="50" cy="82" rx="2.6" ry="2.2" style={{ fill: "oklch(0.25 0.04 20)" }} />
          ) : (
            <path
              d="M41 80 Q50 89 59 80"
              fill="none"
              strokeWidth="2.6"
              strokeLinecap="round"
              style={{ stroke: "oklch(0.25 0.04 20)" }}
            />
          )}

          {/* shadow the brim casts on the forehead */}
          <ellipse
            cx="50"
            cy="55"
            rx="31"
            ry="4.5"
            style={{ fill: "oklch(0.3 0.05 200)" }}
            opacity="0.16"
          />

          {/* hard hat */}
          <path d="M17 47 A33 31 0 0 1 83 47 Z" fill={`url(#${uid}-hat)`} />
          <rect x="43" y="16" width="14" height="31" rx="3" fill="white" fillOpacity="0.28" />
          <path
            d="M26 30 Q32 22 40 19"
            fill="none"
            stroke="white"
            strokeOpacity="0.55"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="11" y="44" width="78" height="9" rx="4.5" style={{ fill: "var(--amber)" }} />
          <rect x="11" y="44" width="78" height="4" rx="2" fill="white" fillOpacity="0.3" />
          {/* StackBlueprint logo stripes on the hat */}
          <rect
            x="44"
            y="26"
            width="12"
            height="2.6"
            rx="1.3"
            style={{ fill: "oklch(0.24 0.045 215)" }}
          />
          <rect
            x="45"
            y="30.2"
            width="10"
            height="2.6"
            rx="1.3"
            style={{ fill: "oklch(0.7 0.12 188)" }}
          />
          <rect
            x="46"
            y="34.4"
            width="8"
            height="2.6"
            rx="1.3"
            style={{ fill: "oklch(0.93 0.05 185)" }}
          />
        </motion.g>

        {speaking &&
          rich &&
          animate &&
          [18, 50, 82].map((x, i) => (
            <motion.path
              key={x}
              d="M0 -5 L1.4 -1.4 L5 0 L1.4 1.4 L0 5 L-1.4 1.4 L-5 0 L-1.4 -1.4Z"
              style={{ fill: "var(--amber)" }}
              initial={{ x, y: 30, opacity: 0, scale: 0.4 }}
              animate={{ y: [30, 6], opacity: [0, 1, 0], scale: [0.4, 1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.45 }}
            />
          ))}
      </svg>

      {/* thought dots while thinking */}
      {thinking && animate && (
        <div className="absolute flex gap-[7%]" style={{ right: "-8%", top: "-4%" }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="rounded-full"
              style={{ width: size * 0.09, height: size * 0.09, background: "var(--mint)" }}
              animate={{ y: [0, -size * 0.08, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
