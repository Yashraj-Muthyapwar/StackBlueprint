import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type Kind = "required" | "keyword" | "default" | "args" | "kwargs";
type ChipKind = Kind | "ret";

type Binding = {
  param: string; // label shown on the parameter, e.g. "*scores"
  value: string; // the value the parameter holds
  use?: string; // how the value reads inside the body, when different
  kind: Kind;
};

/*
 * Code lines use markers so the animation can find the exact tokens:
 *   ⟦p0:name⟧      parameter slot 0 in the definition
 *   ⟦d1:"x"⟧       default value that belongs to parameter 1
 *   ⟦a0:"x"⟧       argument in the call that feeds binding 0
 *   ⟦c0:greet(⟧    text that belongs to the call expression
 *   ⟦u0:{name}⟧    place in the body that uses binding 0
 *   ⟦g:result⟧     the global variable used by print
 */
type Slide = {
  eyebrow: string;
  title: string;
  fn: string;
  def: string;
  body: string;
  call: string;
  print: string;
  bindings: Binding[];
  result: string;
  output: string;
  bindNote: string;
  runNote: string;
};

type Spec = {
  key: string;
  from: string;
  to: string;
  text: string;
  kind: ChipKind;
  delay: number;
};

type Flight = Spec & { x0: number; y0: number; x1: number; y1: number };

type Reg = (id: string) => (el: HTMLElement | null) => void;

type Ctx = {
  slide: Slide;
  phase: number;
  reg: Reg;
  reduce: boolean;
  useOrder: string[];
};

/* -------------------------------------------------------------------------- */
/* Timeline                                                                    */
/* -------------------------------------------------------------------------- */

const DEFINE = 0;
const CALL = 1;
const BIND = 2;
const RUN = 3;
const RETURN = 4;
const PRINT = 5;

const PHASE_LABELS = ["Define", "Call", "Bind", "Run", "Return", "Print"];
const DURATIONS = [1900, 1900, 2500, 2500, 3000, 3300];

// Line indexes of the program shown in the editor.
const LINE = { def: 0, body: 1, call: 3, print: 4 };
const ACTIVE: number[][] = [[0, 1], [3], [0], [1], [1, 3], [4]];

const FLY = 0.85; // seconds a value spends in the air
const STAGGER = 0.14;
const LIFT = 0.95; // pause before the return value leaves the function
const CHIP_H = 24;

const startAt = (n: number) => 0.2 + n * STAGGER;
const landAt = (n: number) => startAt(n) + FLY - 0.08;

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const slides: Slide[] = [
  {
    eyebrow: "Parameters and arguments",
    title: "A function call gives a parameter a value",
    fn: "greet",
    def: "def greet(⟦p0:name⟧):",
    body: '    return f"Hello, ⟦u0:{name}⟧!"',
    call: 'result = ⟦c0:greet(⟧⟦a0:"Ava"⟧⟦c1:)⟧',
    print: "print(⟦g:result⟧)",
    bindings: [{ param: "name", value: '"Ava"', use: "Ava", kind: "required" }],
    result: '"Hello, Ava!"',
    output: "Hello, Ava!",
    bindNote: 'The argument "Ava" is copied into the parameter name.',
    runNote: "Every use of name in the body now reads Ava.",
  },
  {
    eyebrow: "Positional, required, and default",
    title: "Position fills required parameters; defaults fill gaps",
    fn: "welcome",
    def: 'def welcome(⟦p0:name⟧, ⟦p1:role⟧=⟦d1:"Learner"⟧):',
    body: '    return f"⟦u0:{name}⟧: ⟦u1:{role}⟧"',
    call: 'result = ⟦c0:welcome(⟧⟦a0:"Ava"⟧⟦c1:)⟧',
    print: "print(⟦g:result⟧)",
    bindings: [
      { param: "name", value: '"Ava"', use: "Ava", kind: "required" },
      { param: "role", value: '"Learner"', use: "Learner", kind: "default" },
    ],
    result: '"Ava: Learner"',
    output: "Ava: Learner",
    bindNote:
      'Ava lands in name by position. No argument was given for role, so its default "Learner" is used.',
    runNote: "Both placeholders in the f-string are replaced by their values.",
  },
  {
    eyebrow: "Keyword arguments",
    title: "A keyword names its destination",
    fn: "welcome",
    def: 'def welcome(⟦p0:name⟧, ⟦p1:role⟧=⟦d1:"Learner"⟧):',
    body: '    return f"⟦u0:{name}⟧: ⟦u1:{role}⟧"',
    call: 'result = ⟦c0:welcome(⟧⟦a1:role="Mentor"⟧, ⟦a0:name="Ava"⟧⟦c1:)⟧',
    print: "print(⟦g:result⟧)",
    bindings: [
      { param: "name", value: '"Ava"', use: "Ava", kind: "keyword" },
      { param: "role", value: '"Mentor"', use: "Mentor", kind: "keyword" },
    ],
    result: '"Ava: Mentor"',
    output: "Ava: Mentor",
    bindNote:
      "Each keyword sends its value to the parameter with that name, so call order does not matter. role=\"Mentor\" replaces the default.",
    runNote: "The body reads values that were matched by name, not by position.",
  },
  {
    eyebrow: "Star arguments",
    title: "Extra positional arguments collect into a tuple",
    fn: "average",
    def: "def average(⟦p0:*scores⟧):",
    body: "    return sum(⟦u0:scores⟧) / len(⟦u0b:scores⟧)",
    call: "result = ⟦c0:average(⟧⟦a0:90, 85, 95⟧⟦c1:)⟧",
    print: "print(⟦g:result⟧)",
    bindings: [{ param: "*scores", value: "(90, 85, 95)", kind: "args" }],
    result: "90.0",
    output: "90.0",
    bindNote: "*scores packs 90, 85 and 95 into a single tuple.",
    runNote: "scores appears twice, so both spots read the same tuple.",
  },
  {
    eyebrow: "Double-star keyword arguments",
    title: "Extra keyword arguments collect into a dictionary",
    fn: "profile",
    def: "def profile(⟦p0:**details⟧):",
    body: '    return ⟦u0:details⟧["name"]',
    call: 'result = ⟦c0:profile(⟧⟦a0:name="Ava", city="Austin"⟧⟦c1:)⟧',
    print: "print(⟦g:result⟧)",
    bindings: [
      {
        param: "**details",
        value: '{"name": "Ava", "city": "Austin"}',
        kind: "kwargs",
      },
    ],
    result: '"Ava"',
    output: "Ava",
    bindNote: "**details packs every keyword argument into one dictionary.",
    runNote: 'details["name"] looks up the name key and finds Ava.',
  },
];

function narration(s: Slide, phase: number): string {
  switch (phase) {
    case DEFINE:
      return "Python reads the definition and stores the function. The body does not run yet.";
    case CALL:
      return "The call line runs. Python evaluates the arguments first.";
    case BIND:
      return s.bindNote;
    case RUN:
      return s.runNote;
    case RETURN:
      return "The return value leaves the function and replaces the whole call expression.";
    default:
      return "The frame is gone. print sends the stored value to the console.";
  }
}

/* -------------------------------------------------------------------------- */
/* Styling                                                                     */
/* -------------------------------------------------------------------------- */

const chipBase =
  "inline-flex h-6 items-center whitespace-pre rounded-md border px-1.5 font-mono text-[12px] leading-none";

const chipClass: Record<ChipKind, string> = {
  required: "border-mint/40 bg-mint/15 text-mint",
  keyword: "border-violet/40 bg-violet/15 text-violet",
  default: "border-amber/40 bg-amber/15 text-amber",
  args: "border-sky-400/40 bg-sky-400/15 text-sky-300",
  kwargs: "border-rose-400/40 bg-rose-400/15 text-rose-300",
  ret: "border-white/30 bg-white/10 text-white",
};

const badge: Record<Kind, string> = {
  required: "positional",
  keyword: "keyword",
  default: "default",
  args: "*args",
  kwargs: "**kwargs",
};

const controlBtn =
  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground";

/* -------------------------------------------------------------------------- */
/* Parsing and highlighting                                                    */
/* -------------------------------------------------------------------------- */

type Seg = { id?: string; text: string };

const MARK = /⟦(\w+):([^⟧]*)⟧/g;

function parse(line: string): Seg[] {
  const out: Seg[] = [];
  let last = 0;
  for (const m of line.matchAll(MARK)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: line.slice(last, at) });
    out.push({ id: m[1], text: m[2] });
    last = at + m[0].length;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}

const bindIndex = (id: string) => parseInt(id.slice(1), 10);

function usesOf(s: Slide): string[] {
  return parse(s.body).flatMap((seg) => (seg.id && seg.id[0] === "u" ? [seg.id] : []));
}

const KEYWORDS = new Set(["def", "return"]);
const BUILTINS = new Set(["print", "sum", "len"]);

function tokenize(text: string, state: { inStr: boolean }): ReactNode[] {
  const parts = text.match(/f?"|\s+|[A-Za-z_]\w*|\d+(?:\.\d+)?|./g) ?? [];
  return parts.map((tok, i) => {
    let cls = "text-slate-200";
    if (tok === '"' || tok === 'f"') {
      state.inStr = !state.inStr;
      cls = "text-amber-200";
    } else if (state.inStr) {
      cls = "text-amber-200";
    } else if (KEYWORDS.has(tok)) {
      cls = "text-fuchsia-300";
    } else if (BUILTINS.has(tok)) {
      cls = "text-sky-300";
    } else if (/^\d/.test(tok)) {
      cls = "text-orange-300";
    } else if (/^[^\w\s]$/.test(tok)) {
      cls = "text-slate-400";
    }
    return (
      <span key={i} className={cls}>
        {tok}
      </span>
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Flight planning                                                             */
/* -------------------------------------------------------------------------- */

function planFlights(s: Slide, phase: number): Spec[] {
  if (phase === BIND) {
    return s.bindings.map((b, i) => ({
      key: `bind-${i}`,
      from: b.kind === "default" ? `d${i}` : `a${i}`,
      to: `p${i}`,
      text: b.value,
      kind: b.kind,
      delay: startAt(i),
    }));
  }
  if (phase === RUN) {
    return usesOf(s).map((id, n) => {
      const b = s.bindings[bindIndex(id)];
      return {
        key: `use-${id}`,
        from: `p${bindIndex(id)}`,
        to: id,
        text: b.use ?? b.value,
        kind: b.kind,
        delay: startAt(n),
      };
    });
  }
  if (phase === RETURN) {
    return [{ key: "return", from: "rv", to: "rt", text: s.result, kind: "ret", delay: LIFT }];
  }
  if (phase === PRINT) {
    return [{ key: "print", from: "rt", to: "g", text: s.result, kind: "ret", delay: startAt(0) }];
  }
  return [];
}

/* -------------------------------------------------------------------------- */
/* Small pieces                                                                */
/* -------------------------------------------------------------------------- */

function Slot({
  id,
  reg,
  before,
  after,
  showAfter,
  animate,
  land,
  kind,
  caption,
}: {
  id: string;
  reg: Reg;
  before: ReactNode;
  after: string;
  showAfter: boolean;
  animate: boolean;
  land: number;
  kind: ChipKind;
  caption?: string;
}) {
  if (!showAfter) return <span ref={reg(id)}>{before}</span>;
  const delay = animate ? land : 0;
  return (
    <span ref={reg(id)} className="relative inline-flex align-middle">
      {caption && (
        <motion.span
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute -top-3.5 left-0 font-mono text-[9px] tracking-wider text-slate-400"
        >
          {caption}
        </motion.span>
      )}
      <motion.span
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.2 }}
        className={`${chipBase} ${chipClass[kind]}`}
      >
        {after}
      </motion.span>
      {animate && (
        <motion.span
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay, duration: 0.15 }}
          className="pointer-events-none absolute inset-0 rounded-md border border-dashed border-white/30"
        />
      )}
    </span>
  );
}

function renderSegments(line: string, lineIndex: number, ctx: Ctx): ReactNode[] {
  const { slide, phase, reg, reduce } = ctx;
  const segs = parse(line);
  const state = { inStr: false };
  const live = phase >= BIND && phase < PRINT;
  const isCall = lineIndex === LINE.call;

  let first = -1;
  let last = -1;
  if (isCall) {
    segs.forEach((s, k) => {
      if (s.id && (s.id[0] === "c" || s.id[0] === "a")) {
        if (first < 0) first = k;
        last = k;
      }
    });
  }
  const returned = isCall && phase >= RETURN && first >= 0;
  const nodes: ReactNode[] = [];

  segs.forEach((seg, k) => {
    if (returned && k >= first && k <= last) {
      if (k === first) {
        nodes.push(
          <motion.span
            key="rt"
            ref={reg("rt")}
            initial={phase === RETURN && !reduce ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : LIFT + FLY - 0.08, duration: 0.2 }}
            className={`${chipBase} ${chipClass.ret}`}
          >
            {slide.result}
          </motion.span>,
        );
      }
      return;
    }

    if (!seg.id) {
      nodes.push(<span key={`s${k}`}>{tokenize(seg.text, state)}</span>);
      return;
    }

    const role = seg.id[0];
    const n = bindIndex(seg.id);
    const b = slide.bindings[n];

    if (role === "p") {
      nodes.push(
        <Slot
          key={seg.id}
          id={seg.id}
          reg={reg}
          showAfter={live}
          animate={phase === BIND && !reduce}
          land={landAt(n)}
          kind={b.kind}
          caption={b.param}
          after={b.value}
          before={
            <span
              className={`text-cyan-200 ${phase <= CALL
                ? "underline decoration-cyan-300/60 decoration-dashed underline-offset-4"
                : ""
                }`}
            >
              {seg.text}
            </span>
          }
        />,
      );
    } else if (role === "d") {
      const overridden = phase >= BIND && b?.kind !== "default";
      nodes.push(
        <span
          key={seg.id}
          ref={reg(seg.id)}
          className={`transition-opacity duration-500 ${overridden ? "text-amber-200/40 line-through" : "text-amber-200"
            }`}
        >
          {seg.text}
        </span>,
      );
    } else if (role === "a") {
      const hot = phase >= CALL && phase < RETURN;
      nodes.push(
        <motion.span
          key={seg.id}
          ref={reg(seg.id)}
          animate={phase === CALL && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className={`inline-block rounded-md border px-1 transition-[opacity,background-color,border-color] duration-500 ${hot ? chipClass[b.kind] : "border-transparent text-amber-200"
            } ${phase >= BIND ? "opacity-40" : ""}`}
        >
          {seg.text}
        </motion.span>,
      );
    } else if (role === "c") {
      nodes.push(
        <span key={seg.id} className="text-sky-200">
          {seg.text}
        </span>,
      );
    } else if (role === "u") {
      nodes.push(
        <Slot
          key={seg.id}
          id={seg.id}
          reg={reg}
          showAfter={phase >= RUN && phase < PRINT}
          animate={phase === RUN && !reduce}
          land={landAt(Math.max(0, ctx.useOrder.indexOf(seg.id)))}
          kind={b.kind}
          after={b.use ?? b.value}
          before={<span className="text-cyan-200">{seg.text}</span>}
        />,
      );
    } else if (role === "g") {
      nodes.push(
        <Slot
          key="g"
          id="g"
          reg={reg}
          showAfter={phase >= PRINT}
          animate={phase === PRINT && !reduce}
          land={landAt(0)}
          kind="ret"
          after={slide.result}
          before={<span className="text-cyan-200">{seg.text}</span>}
        />,
      );
    }
  });

  return nodes;
}

function CodeLine({ line, index, ctx }: { line: string; index: number; ctx: Ctx }) {
  const isActive = ACTIVE[ctx.phase].includes(index);
  const gutter = (
    <span className="mr-4 w-4 select-none text-right text-xs text-slate-600">{index + 1}</span>
  );

  if (line === "") {
    return <div className="flex h-5 items-center px-2">{gutter}</div>;
  }

  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: isActive ? "rgba(64,224,180,0.10)" : "rgba(64,224,180,0)" }}
      transition={{ duration: 0.3 }}
      className="relative flex h-9 items-center rounded-md px-2"
    >
      <motion.span
        initial={false}
        animate={{ opacity: isActive ? 1 : 0 }}
        className="absolute inset-y-1.5 left-0 w-0.5 rounded bg-mint"
      />
      {gutter}
      <span className="whitespace-pre">
        {renderSegments(line, index, ctx)}
        {ctx.phase === RETURN && index === LINE.body && (
          <span className="ml-3 inline-flex items-center gap-2 align-middle">
            <span className="text-slate-500">returns</span>
            <motion.span
              ref={ctx.reg("rv")}
              initial={{ opacity: 0 }}
              animate={{ opacity: ctx.reduce ? 1 : [0, 1, 1, 0.2] }}
              transition={
                ctx.reduce
                  ? { duration: 0 }
                  : { duration: LIFT + 0.3, times: [0, 0.15, 0.85, 1] }
              }
              className={`${chipBase} ${chipClass.ret}`}
            >
              {ctx.slide.result}
            </motion.span>
          </span>
        )}
      </span>
    </motion.div>
  );
}

function PanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-white/10 bg-slate-900 px-4 py-2 font-mono text-[10px] tracking-[0.16em] text-slate-300">
      {children}
    </div>
  );
}

function CodeEditor({ ctx }: { ctx: Ctx }) {
  const lines = [ctx.slide.def, ctx.slide.body, "", ctx.slide.call, ctx.slide.print];
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <div className="flex items-center gap-3 border-b border-white/10 bg-slate-900 px-4 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-rose-400/70" />
          <span className="size-2 rounded-full bg-amber/70" />
          <span className="size-2 rounded-full bg-mint/70" />
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-slate-300">main.py</span>
      </div>
      <div className="flex-1 overflow-x-auto p-3 pt-4 font-mono text-[13px] text-slate-100">
        <div className="min-w-max">
          {lines.map((line, i) => (
            <CodeLine key={i} line={line} index={i} ctx={ctx} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MemoryPanel({ slide, phase, reduce }: { slide: Slide; phase: number; reduce: boolean }) {
  const inFrame = phase >= BIND && phase < PRINT;
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>memory</PanelHeader>
      <div className="space-y-3 p-3">
        <div>
          <p className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-slate-500">globals</p>
          <div className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 font-mono text-xs">
            <span className="text-cyan-200">result</span>
            <span className="text-slate-500">=</span>
            {phase >= RETURN ? (
              <motion.span
                key="stored"
                initial={phase === RETURN && !reduce ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: reduce ? 0 : LIFT + FLY - 0.08, duration: 0.2 }}
                className={`${chipBase} ${chipClass.ret}`}
              >
                {slide.result}
              </motion.span>
            ) : (
              <span className="text-slate-500">waiting for a return value</span>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1.5 font-mono text-[10px] tracking-[0.16em] text-slate-500">
            {`frame of ${slide.fn}()`}
          </p>
          <div className="flex min-h-[92px] flex-col gap-1.5">
            {inFrame ? (
              slide.bindings.map((b, i) => (
                <motion.div
                  key={b.param}
                  initial={phase === BIND && !reduce ? { opacity: 0, x: -12 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: reduce ? 0 : landAt(i),
                    type: "spring",
                    stiffness: 260,
                    damping: 22,
                  }}
                  className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-xs"
                >
                  <span className="text-cyan-200">{b.param}</span>
                  <span className="text-slate-500">=</span>
                  <span className={`${chipBase} ${chipClass[b.kind]}`}>{b.value}</span>
                  <span className="ml-auto text-[10px] tracking-wider text-slate-500">
                    {badge[b.kind]}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="flex min-h-[92px] flex-1 items-center justify-center rounded-lg border border-dashed border-white/10 px-3 text-center font-mono text-xs text-slate-500">
                {phase >= PRINT ? "call finished, locals released" : "no active call"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function useTypewriter(text: string, active: boolean, delayMs: number, instant: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    if (instant) {
      setCount(text.length);
      return;
    }
    let timer: number | undefined;
    const kickoff = window.setTimeout(() => {
      let i = 0;
      timer = window.setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) window.clearInterval(timer);
      }, 40);
    }, delayMs);
    return () => {
      window.clearTimeout(kickoff);
      if (timer) window.clearInterval(timer);
    };
  }, [text, active, delayMs, instant]);
  return text.slice(0, count);
}

function ConsolePanel({ slide, phase, reduce }: { slide: Slide; phase: number; reduce: boolean }) {
  const typed = useTypewriter(slide.output, phase >= PRINT, Math.round(landAt(0) * 1000) + 100, reduce);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>console</PanelHeader>
      <div className="min-h-[76px] p-3 font-mono text-sm leading-6">
        <div>
          <span className="text-mint">$</span> <span className="text-slate-300">python main.py</span>
        </div>
        {phase >= PRINT && (
          <div className="text-slate-100">
            {typed}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-0.5 inline-block h-4 w-2 bg-mint align-middle"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FlyingChip({ f }: { f: Flight }) {
  const midY = Math.min(f.y0, f.y1) - 28;
  return (
    <motion.div
      className="absolute left-0 top-0 rounded-md bg-slate-900 shadow-[0_0_18px_rgba(64,224,180,0.35)]"
      initial={{ x: f.x0, y: f.y0, opacity: 0, scale: 0.9 }}
      animate={{
        x: [f.x0, f.x1],
        y: [f.y0, midY, f.y1],
        opacity: [0, 1, 1, 0],
        scale: [0.9, 1.1, 1.1, 1],
      }}
      transition={{
        x: { duration: FLY, delay: f.delay, ease: "easeInOut" },
        y: { duration: FLY, delay: f.delay, times: [0, 0.45, 1], ease: "easeInOut" },
        opacity: { duration: FLY, delay: f.delay, times: [0, 0.1, 0.86, 1] },
        scale: { duration: FLY, delay: f.delay, times: [0, 0.3, 0.86, 1] },
      }}
    >
      <span className={`${chipBase} ${chipClass[f.kind]}`}>{f.text}</span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

export function ArgumentsParametersCustomAnimation() {
  const reduce = !!useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const [flights, setFlights] = useState<Flight[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const anchors = useRef<Record<string, HTMLElement | null>>({});
  const reg = useCallback<Reg>(
    (id) => (el) => {
      anchors.current[id] = el;
    },
    [],
  );

  const current = slides[slide];

  // Autoplay: step through phases, then move to the next example.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (phase < PRINT) {
        setPhase(phase + 1);
      } else {
        setSlide((value) => (value + 1) % slides.length);
        setPhase(0);
      }
    }, DURATIONS[phase]);
    return () => window.clearTimeout(timer);
  }, [phase, playing, slide]);

  // Measure where each value starts and ends, then launch the flying chips.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) {
      setFlights([]);
      return;
    }
    const rr = root.getBoundingClientRect();
    const next: Flight[] = [];
    for (const spec of planFlights(current, phase)) {
      const from = anchors.current[spec.from];
      const to = anchors.current[spec.to];
      if (!from || !to) continue;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      next.push({
        ...spec,
        key: `${slide}-${phase}-${spec.key}`,
        x0: a.left - rr.left,
        y0: a.top - rr.top + a.height / 2 - CHIP_H / 2,
        x1: b.left - rr.left,
        y1: b.top - rr.top + b.height / 2 - CHIP_H / 2,
      });
    }
    setFlights(next);
  }, [slide, phase, reduce, current]);

  const goSlide = (target: number) => {
    setPlaying(false);
    setSlide((target + slides.length) % slides.length);
    setPhase(0);
  };
  const goPhase = (target: number) => {
    setPlaying(false);
    setPhase(target);
  };
  const replay = () => {
    setPhase(0);
    setPlaying(true);
  };

  const ctx: Ctx = { slide: current, phase, reg, reduce, useOrder: usesOf(current) };

  return (
    <div className="flex w-full flex-col">
      <div
        ref={rootRef}
        className="relative flex min-h-[660px] w-full flex-col justify-center overflow-hidden px-5 py-8 sm:px-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mx-auto w-full max-w-6xl"
          >
            <div className="text-center">
              <p className="font-mono text-[10px] tracking-[0.2em] text-violet">{current.eyebrow}</p>
              <h3 className="mt-2 text-2xl font-light text-foreground">{current.title}</h3>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {PHASE_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => goPhase(i)}
                  aria-current={i === phase ? "step" : undefined}
                  className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors ${i === phase
                    ? "border-mint/50 bg-mint/15 text-mint"
                    : i < phase
                      ? "border-hairline text-foreground/70 hover:text-foreground"
                      : "border-hairline text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {i + 1}. {label}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-stretch">
              <CodeEditor ctx={ctx} />
              <div className="flex flex-col gap-4">
                <MemoryPanel slide={current} phase={phase} reduce={reduce} />
                <ConsolePanel slide={current} phase={phase} reduce={reduce} />
              </div>
            </div>

            <div className="mx-auto mt-5 min-h-[52px] max-w-3xl text-center" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${slide}-${phase}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm leading-6 text-muted-foreground"
                >
                  <span className="mr-2 font-mono text-[10px] tracking-[0.16em] text-mint">
                    Step {phase + 1}
                  </span>
                  {narration(current, phase)}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          {flights.map((f) => (
            <FlyingChip key={f.key} f={f} />
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div
          className="absolute left-0 top-0 h-0.5 bg-mint/70 transition-[width] duration-500"
          style={{ width: `${((phase + 1) / PHASE_LABELS.length) * 100}%` }}
        />
        <div className="flex items-center gap-1">
          <button type="button" onClick={replay} className={controlBtn} aria-label="Replay example">
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => goSlide(slide - 1)}
            className={controlBtn}
            aria-label="Previous example"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className={controlBtn}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => goSlide(slide + 1)}
            className={controlBtn}
            aria-label="Next example"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.eyebrow}
                type="button"
                onClick={() => goSlide(i)}
                aria-label={`Go to example ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === slide
                  ? "w-4 bg-mint"
                  : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
                  }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {slide + 1} / {slides.length}
          </span>
        </div>
      </div>
    </div>
  );
}