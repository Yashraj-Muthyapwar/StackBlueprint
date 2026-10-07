import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Cloud, FileText, Folder, Pause, Play, RotateCcw } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type Kind = "pkg" | "dep" | "tool" | "file" | "ref" | "ret" | "no";
type Tone = "mint" | "violet" | "amber" | "slate";

// One line in the terminal. `p` overrides the prompt prefix, `a` marks the
// line that program output should fly to.
type TLine = { t: "cmd" | "out" | "err"; text: string; p?: string; a?: boolean };

// A value that flies between two anchors: "term" (terminal), "cons" (program
// output), "pypi", tree rows ("t_<id>"), environments ("env_<id>") and package
// chips ("pk_<env>_<pkg>"). Delays are counted from the end of line `on`.
type Flt = { from: string; to: string; text: string; kind: Kind; at?: number; on?: number; dur?: number };

type Node = { id: string; name: string; depth: number; tone: Tone; folder?: boolean; detail?: string };
type Pkg = { id: string; name: string; ver: string; kind: "pkg" | "dep" | "tool" };
type EnvSpec = { id: string; title: string; hint: string; tone: Tone };
type EnvEntry = { env: EnvSpec; pkgs: Pkg[] };
type Mark = { id: string; text: string; state: "decl" | "lock" | "inst"; at?: number };

type Step = {
  label: string;
  note: string;
  lines?: TLine[];
  setPrompt?: string; // prompt from the next step on
  use?: string; // which environment python and pip currently point to
  add?: Node[]; // files added to the project tree
  edit?: Record<string, string>; // new detail text for existing tree rows
  envs?: EnvEntry[]; // environments created or updated
  dropEnvs?: string[];
  miss?: string[]; // environments that visibly lack the package (this step only)
  flights?: Flt[];
  marks?: Mark[];
};

type Scene = {
  eyebrow: string;
  title: string;
  tree: Node[];
  envs: EnvEntry[];
  use?: string;
  steps: Step[];
};

type View = {
  tree: Node[];
  envs: EnvEntry[];
  use?: string;
  lines: (TLine & { p: string })[];
};

type Timed = Flt & { delay: number; dur: number };
type Reg = (id: string) => (el: HTMLElement | null) => void;
type Flight = Timed & { x0: number; y0: number; x1: number; y1: number };
type Ctx = { step: Step; view: View; prev?: View; reg: Reg; reduce: boolean; timed: Timed[]; sid: string };

/* -------------------------------------------------------------------------- */
/* Timing                                                                      */
/* -------------------------------------------------------------------------- */

const FLY = 0.85;
const CHIP_H = 24;
const CHAR = 0.026; // seconds per typed character

// When each terminal line starts and ends, relative to the start of the step.
function lineTimes(lines: TLine[] = []) {
  let t = 0.25;
  return lines.map((l) => {
    if (l.t === "cmd") {
      const start = t;
      const end = start + l.text.length * CHAR + 0.05;
      t = end + 0.3;
      return { start, end };
    }
    const start = t + 0.05;
    const end = start + 0.2;
    t = end + 0.15;
    return { start, end };
  });
}

const timedOf = (s: Step): Timed[] => {
  const times = lineTimes(s.lines);
  const first = (s.lines ?? []).findIndex((l) => l.t === "cmd");
  return (s.flights ?? []).map((f, i) => {
    const base = times[f.on ?? first]?.end ?? 0;
    return { ...f, delay: base + (f.at ?? 0.1 + i * 0.14), dur: f.dur ?? FLY };
  });
};

const landOf = (timed: Timed[], id: string, fallback = 0.15) => {
  const hits = timed.filter((f) => f.to === id);
  return hits.length ? Math.max(...hits.map((f) => f.delay + f.dur)) - 0.08 : fallback;
};

const stepMs = (s: Step) => {
  const times = lineTimes(s.lines);
  const lines = times.length ? times[times.length - 1].end : 0;
  const fly = Math.max(0, ...timedOf(s).map((f) => f.delay + f.dur));
  return Math.max(3200, Math.max(lines, fly) * 1000 + 1500);
};

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const P = (id: string, ver: string, kind: Pkg["kind"]): Pkg => ({ id, name: id, ver, kind });
const PIP = P("pip", "24.0", "tool");
const REQ = P("requests", "2.32.3", "pkg");
const ALL: Pkg[] = [
  REQ,
  P("urllib3", "2.2.2", "dep"),
  P("idna", "3.7", "dep"),
  P("charset-normalizer", "3.3.2", "dep"),
  P("certifi", "2024.7.4", "dep"),
];

const SYS: EnvSpec = { id: "sys", title: "system Python", hint: "shared by every project", tone: "slate" };
const VENV: EnvSpec = { id: "venv", title: ".venv", hint: "this project only", tone: "mint" };
const MATE: EnvSpec = { id: "mate", title: "teammate's .venv", hint: "a different machine", tone: "violet" };

// One chip flies to each package slot of an environment.
const toEnv = (from: string, env: string, pkgs: Pkg[], at0 = 0.1, gap = 0.14): Flt[] =>
  pkgs.map((p, i) => ({ from, to: `pk_${env}_${p.id}`, text: p.name, kind: p.kind, at: at0 + i * gap }));

const scenes: Scene[] = [
  /* 1 pip + venv ----------------------------------------------------------- */
  {
    eyebrow: "pip and venv",
    title: "Isolate a project, install into it, then share the package list",
    tree: [
      { id: "root", name: "weather-app/", depth: 0, tone: "slate", folder: true },
      { id: "main", name: "main.py", depth: 1, tone: "mint", detail: "import requests" },
    ],
    envs: [{ env: SYS, pkgs: [PIP] }],
    use: "sys",
    steps: [
      {
        label: "Create",
        lines: [{ t: "cmd", text: "python -m venv .venv" }],
        add: [{ id: "venv", name: ".venv/", depth: 1, tone: "mint", folder: true, detail: "own Python + site-packages" }],
        envs: [{ env: VENV, pkgs: [PIP] }],
        flights: [
          { from: "term", to: "t_venv", text: ".venv/", kind: "file", at: 0.1 },
          { from: "env_sys", to: "env_venv", text: "python copy", kind: "ref", at: 0.8 },
        ],
        note: "python -m venv .venv builds a folder with its own Python and its own empty site-packages. The system Python is untouched.",
      },
      {
        label: "Activate",
        lines: [{ t: "cmd", text: "source .venv/bin/activate" }],
        setPrompt: "(.venv)",
        use: "venv",
        flights: [{ from: "t_venv", to: "env_venv", text: "python + pip", kind: "ref", at: 0.2 }],
        note: "Activation makes python and pip mean this environment's copies, and the prompt shows (.venv). On Windows the script is .venv\\Scripts\\activate.",
      },
      {
        label: "Install",
        lines: [
          { t: "cmd", text: "python -m pip install requests" },
          { t: "out", text: "Downloading requests-2.32.3" },
          { t: "out", text: "Successfully installed requests-2.32.3 + 4 dependencies" },
        ],
        envs: [{ env: VENV, pkgs: ALL }],
        flights: toEnv("pypi", "venv", ALL, 0.2),
        note: "pip downloads requests and the packages it depends on from PyPI and installs them into the active environment. The system Python does not change.",
      },
      {
        label: "Run",
        lines: [
          { t: "cmd", text: "python main.py" },
          { t: "out", text: "2.32.3", a: true },
        ],
        flights: [
          { from: "t_main", to: "pk_venv_requests", text: "import requests", kind: "ref", at: 0.1 },
          { from: "pk_venv_requests", to: "cons", text: "2.32.3", kind: "ret", at: 1.0 },
        ],
        note: "The import searches the active environment's site-packages and finds requests, so the program runs.",
      },
      {
        label: "Outside",
        lines: [
          { t: "cmd", text: "deactivate", p: "(.venv)" },
          { t: "cmd", text: "python main.py", p: "" },
          { t: "err", text: "ModuleNotFoundError: No module named 'requests'" },
        ],
        setPrompt: "",
        use: "sys",
        miss: ["sys"],
        flights: [{ from: "t_main", to: "env_sys", text: "import requests", kind: "no", on: 1, at: 0.1 }],
        note: "Outside the environment, python is the system Python, which never received requests. The error shows the isolation works.",
      },
      {
        label: "Freeze",
        lines: [
          { t: "cmd", text: "source .venv/bin/activate", p: "" },
          { t: "cmd", text: "python -m pip freeze > requirements.txt", p: "(.venv)" },
        ],
        setPrompt: "(.venv)",
        use: "venv",
        add: [
          { id: "req", name: "requirements.txt", depth: 1, tone: "amber", detail: "5 pinned versions" },
          { id: "gi", name: ".gitignore", depth: 1, tone: "slate", detail: ".venv/" },
        ],
        flights: ALL.map((p, i): Flt => ({
          from: `pk_venv_${p.id}`, to: "t_req", text: `${p.name}==${p.ver}`, kind: "file", on: 1, at: 0.1 + i * 0.16,
        })),
        note: "pip freeze lists every installed package with its exact version, and > writes the list to requirements.txt. Share that file and keep .venv out of version control.",
      },
      {
        label: "Reproduce",
        lines: [
          { t: "cmd", text: "python -m venv .venv", p: "" },
          { t: "cmd", text: "source .venv/bin/activate", p: "" },
          { t: "cmd", text: "python -m pip install -r requirements.txt", p: "(.venv)" },
          { t: "out", text: "Successfully installed requests-2.32.3 + 4 dependencies" },
        ],
        setPrompt: "(.venv)",
        use: "mate",
        dropEnvs: ["sys"],
        envs: [{ env: MATE, pkgs: ALL }],
        flights: [
          { from: "t_req", to: "pypi", text: "pinned list", kind: "file", on: 2, at: 0.1 },
          ...toEnv("pypi", "mate", ALL, 0.9),
        ],
        note: "On a teammate's machine the same pinned versions install into a fresh environment, so their packages match yours without copying .venv.",
      },
    ],
  },
  /* 2 uv ------------------------------------------------------------------- */
  {
    eyebrow: "uv",
    title: "Declare dependencies, lock them, and run without activating",
    tree: [],
    envs: [],
    steps: [
      {
        label: "Init",
        lines: [
          { t: "cmd", text: "uv init weather-app" },
          { t: "out", text: "Initialized project `weather-app`" },
          { t: "cmd", text: "cd weather-app" },
        ],
        add: [
          { id: "root", name: "weather-app/", depth: 0, tone: "slate", folder: true },
          { id: "pyver", name: ".python-version", depth: 1, tone: "slate", detail: "3.12" },
          { id: "main", name: "main.py", depth: 1, tone: "mint", detail: "imports requests" },
          { id: "pyproject", name: "pyproject.toml", depth: 1, tone: "violet", detail: "dependencies = []" },
        ],
        flights: [
          { from: "term", to: "t_pyver", text: "Python 3.12", kind: "file", at: 0.1 },
          { from: "term", to: "t_main", text: "main.py", kind: "file", at: 0.25 },
          { from: "term", to: "t_pyproject", text: "metadata", kind: "file", at: 0.4 },
        ],
        note: "uv init creates the project files. pyproject.toml is the declaration layer: it describes the project and will list its dependencies.",
      },
      {
        label: "Add",
        lines: [
          { t: "cmd", text: "uv add requests" },
          { t: "out", text: "Resolved 6 packages in 0.3s" },
          { t: "out", text: "Installed 5 packages in 0.1s" },
        ],
        edit: { pyproject: 'dependencies = ["requests"]' },
        add: [
          { id: "lock", name: "uv.lock", depth: 1, tone: "amber", detail: "exact resolved versions" },
          { id: "venv", name: ".venv/", depth: 1, tone: "mint", folder: true, detail: "synced environment" },
        ],
        envs: [{ env: { id: "venv", title: ".venv", hint: "synced by uv", tone: "mint" }, pkgs: ALL }],
        flights: [
          { from: "term", to: "t_pyproject", text: "requests", kind: "pkg", at: 0.1 },
          { from: "pypi", to: "t_lock", text: "resolved graph", kind: "file", at: 0.9 },
          ...ALL.map((p, i): Flt => ({ from: "t_lock", to: `pk_venv_${p.id}`, text: p.name, kind: p.kind, at: 1.8 + i * 0.14 })),
        ],
        note: "One command does three jobs: it declares requests in pyproject.toml, resolves every version into uv.lock, and syncs the .venv to match.",
      },
      {
        label: "Run",
        lines: [
          { t: "cmd", text: "uv run main.py" },
          { t: "out", text: "Forecast ready", a: true },
        ],
        flights: [
          { from: "t_main", to: "pk_venv_requests", text: "import requests", kind: "ref", at: 0.1 },
          { from: "pk_venv_requests", to: "cons", text: "Forecast ready", kind: "ret", at: 1.0 },
        ],
        note: "uv run makes sure the environment matches the lock, then runs main.py inside it. No activation step is needed.",
      },
      {
        label: "Sync",
        lines: [
          { t: "cmd", text: "uv sync" },
          { t: "out", text: "Creating virtual environment at: .venv" },
          { t: "out", text: "Installed 5 packages in 0.1s" },
        ],
        use: undefined,
        envs: [{ env: { id: "mate", title: "teammate's .venv", hint: "fresh checkout", tone: "violet" }, pkgs: ALL }],
        marks: [{ id: "lock", text: "read by uv sync", state: "lock", at: 0.3 }],
        flights: ALL.map((p, i): Flt => ({ from: "t_lock", to: `pk_mate_${p.id}`, text: p.name, kind: p.kind, at: 0.6 + i * 0.14, on: 0 })),
        note: "A teammate clones the repo and has no .venv. uv sync reads uv.lock and builds an environment with exactly the locked versions.",
      },
      {
        label: "Layers",
        marks: [
          { id: "pyproject", text: "declared", state: "decl", at: 0.3 },
          { id: "lock", text: "locked", state: "lock", at: 0.9 },
          { id: "venv", text: "installed", state: "inst", at: 1.5 },
        ],
        flights: [
          { from: "t_pyproject", to: "t_lock", text: "requests", kind: "ref", at: 0.2 },
          { from: "t_lock", to: "env_venv", text: "5 packages", kind: "file", at: 0.8 },
        ],
        note: "Three layers: pyproject.toml says what you want, uv.lock records exactly what was resolved, and .venv holds what is installed. Commit the first two; recreate the third any time.",
      },
    ],
  },
];

// Turn per-step deltas into the full picture at each step.
function compile(scene: Scene): View[] {
  let tree = scene.tree;
  let envs = scene.envs;
  let use = scene.use;
  let prompt = "";
  return scene.steps.map((st) => {
    for (const n of st.add ?? []) if (!tree.some((t) => t.id === n.id)) tree = [...tree, n];
    if (st.edit) tree = tree.map((n) => (st.edit![n.id] !== undefined ? { ...n, detail: st.edit![n.id] } : n));
    envs = envs.filter((e) => !st.dropEnvs?.includes(e.env.id));
    for (const b of st.envs ?? []) {
      const i = envs.findIndex((e) => e.env.id === b.env.id);
      if (i < 0) envs = [...envs, b];
      else {
        const pkgs = [...envs[i].pkgs];
        for (const p of b.pkgs) if (!pkgs.some((q) => q.id === p.id)) pkgs.push(p);
        envs = envs.map((e, k) => (k === i ? { env: b.env, pkgs } : e));
      }
    }
    if ("use" in st) use = st.use;
    const lines = (st.lines ?? []).map((l) => ({ ...l, p: l.p ?? prompt }));
    if (st.setPrompt !== undefined) prompt = st.setPrompt;
    return { tree, envs, use, lines };
  });
}

/* -------------------------------------------------------------------------- */
/* Styling                                                                     */
/* -------------------------------------------------------------------------- */

const chipBase =
  "inline-flex h-6 items-center whitespace-pre rounded-md border px-1.5 font-mono text-[12px] leading-none";

const chipClass: Record<Kind, string> = {
  pkg: "border-mint/40 bg-mint/15 text-mint",
  dep: "border-sky-400/40 bg-sky-400/15 text-sky-300",
  tool: "border-white/20 bg-white/5 text-slate-300",
  file: "border-amber/40 bg-amber/15 text-amber",
  ref: "border-violet/40 bg-violet/15 text-violet",
  ret: "border-white/30 bg-white/10 text-white",
  no: "border-rose-400/40 bg-rose-400/15 text-rose-300",
};

const toneText: Record<Tone, string> = {
  mint: "text-mint",
  violet: "text-violet",
  amber: "text-amber",
  slate: "text-slate-400",
};

const toneChip: Record<Tone, Kind> = { mint: "pkg", violet: "ref", amber: "file", slate: "tool" };

const markClass: Record<Mark["state"], string> = {
  decl: "border-violet/60 bg-violet/10 text-violet",
  lock: "border-amber/60 bg-amber/10 text-amber",
  inst: "border-mint/60 bg-mint/10 text-mint",
};

const controlBtn =
  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground";

function PanelHeader({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-white/10 bg-slate-900 px-4 py-1.5 font-mono text-[10px] tracking-[0.16em] text-slate-300">
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Terminal                                                                    */
/* -------------------------------------------------------------------------- */

function useTypewriter(text: string, delayMs: number, instant: boolean) {
  const [count, setCount] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let timer: number | undefined;
    const kickoff = window.setTimeout(() => {
      let i = 0;
      timer = window.setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) window.clearInterval(timer);
      }, CHAR * 1000);
    }, delayMs);
    return () => {
      window.clearTimeout(kickoff);
      if (timer) window.clearInterval(timer);
    };
  }, [text, delayMs, instant]);
  return text.slice(0, count);
}

function TermLine({
  line, start, reduce, anchor,
}: {
  line: TLine & { p: string }; start: number; reduce: boolean; anchor?: (el: HTMLElement | null) => void;
}) {
  const typed = useTypewriter(line.text, Math.round(start * 1000), reduce || line.t !== "cmd");
  if (line.t === "cmd") {
    return (
      <div className="break-all">
        {line.p && <span className="mr-1.5 text-sky-300">{line.p}</span>}
        <span className="text-mint">$</span> <span className="text-slate-100">{typed}</span>
      </div>
    );
  }
  return (
    <motion.div
      ref={anchor}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0 : start, duration: 0.2 }}
      className={`min-h-6 break-words ${line.t === "err" ? "text-rose-300" : "text-slate-300"}`}
    >
      {line.text}
    </motion.div>
  );
}

function Terminal({ ctx }: { ctx: Ctx }) {
  const { view, step, reg, reduce, sid } = ctx;
  const times = lineTimes(step.lines);
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>terminal</PanelHeader>
      <div ref={reg("term")} className="min-h-[132px] p-2.5 font-mono text-[13px] leading-6">
        {view.lines.length === 0 && <div className="text-slate-500">(no command in this step)</div>}
        {view.lines.map((l, i) => (
          <TermLine
            key={`${sid}:${i}`}
            line={l}
            start={times[i].start}
            reduce={reduce}
            anchor={l.a ? reg("cons") : undefined}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Project tree                                                                */
/* -------------------------------------------------------------------------- */

function TreeRow({ node, ctx }: { node: Node; ctx: Ctx }) {
  const { step, prev, reg, reduce, timed, sid } = ctx;
  const before = prev?.tree.find((n) => n.id === node.id);
  const fresh = !reduce && !before;
  const land = landOf(timed, `t_${node.id}`, 0.25);
  const changed = !reduce && !!before && before.detail !== node.detail;
  const mark = step.marks?.find((m) => m.id === node.id);
  const Icon = node.folder ? Folder : FileText;

  return (
    <motion.div
      initial={fresh ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ delay: fresh ? land : 0, duration: 0.25 }}
      className="relative flex items-center gap-2 rounded-md py-0.5 pr-2"
      style={{ paddingLeft: 8 + node.depth * 16 }}
    >
      {mark && (
        <motion.span
          key={`mark:${sid}`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : (mark.at ?? 0.3), duration: 0.25 }}
          className={`pointer-events-none absolute inset-0 rounded-md border ${markClass[mark.state]}`}
        />
      )}
      <Icon className={`relative size-3.5 shrink-0 ${toneText[node.tone]}`} />
      <span ref={reg(`t_${node.id}`)} className={`relative ${toneText[node.tone]}`}>
        {node.name}
      </span>
      {mark ? (
        <motion.span
          key={`tag:${sid}`}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : (mark.at ?? 0.3), duration: 0.25 }}
          className={`relative ml-auto whitespace-pre text-[9px] tracking-wider ${markClass[mark.state].split(" ").pop()}`}
        >
          {mark.text}
        </motion.span>
      ) : (
        node.detail && (
          <motion.span
            key={node.detail}
            initial={changed ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: changed ? land : 0, duration: 0.25 }}
            className="relative ml-auto truncate text-[10px] text-slate-500"
          >
            {node.detail}
          </motion.span>
        )
      )}
    </motion.div>
  );
}

function Tree({ ctx }: { ctx: Ctx }) {
  const nodes = ctx.view.tree;
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>project</PanelHeader>
      <div className="flex min-h-[132px] flex-col gap-0.5 p-2 font-mono text-xs">
        {nodes.length === 0 && <div className="p-2 text-slate-500">no project yet</div>}
        {nodes.map((n) => (
          <TreeRow key={n.id} node={n} ctx={ctx} />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Environments                                                                */
/* -------------------------------------------------------------------------- */

function EnvCard({ entry, ctx }: { entry: EnvEntry; ctx: Ctx }) {
  const { step, view, prev, reg, reduce, timed } = ctx;
  const { env, pkgs } = entry;
  const before = prev?.envs.find((e) => e.env.id === env.id);
  const fresh = !reduce && !before;
  const active = view.use === env.id;
  const miss = !!step.miss?.includes(env.id);

  return (
    <motion.div
      initial={fresh ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ delay: fresh ? landOf(timed, `env_${env.id}`, 0.15) : 0, duration: 0.3 }}
      className={`min-w-0 rounded-lg border p-2.5 transition-colors duration-500 ${miss ? "border-rose-400/60 bg-rose-400/5" : active ? "border-mint/50 bg-mint/5" : "border-white/10 bg-white/[0.03]"
        }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span ref={reg(`env_${env.id}`)} className={`${chipBase} ${chipClass[toneChip[env.tone]]}`}>
          {env.title}
        </span>
        <span className="font-mono text-[10px] text-slate-500">{env.hint}</span>
        {active && (
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] tracking-wider text-mint">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="size-1.5 rounded-full bg-mint"
            />
            python and pip
          </span>
        )}
        {miss && <span className="ml-auto font-mono text-[9px] tracking-wider text-rose-300">requests: not found</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {pkgs.map((p) => {
          const id = `pk_${env.id}_${p.id}`;
          const isNew = !reduce && !before?.pkgs.some((q) => q.id === p.id);
          return (
            <motion.span
              key={p.id}
              ref={reg(id)}
              initial={isNew ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: isNew ? landOf(timed, id, 0.15) : 0, duration: 0.25 }}
              className={`${chipBase} ${chipClass[p.kind]}`}
            >
              {p.name} <span className="ml-1 opacity-60">{p.ver}</span>
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
}

function EnvPanel({ ctx }: { ctx: Ctx }) {
  const { view, timed, reduce } = ctx;
  const downloading = !reduce && timed.some((f) => f.from === "pypi");
  const first = Math.min(99, ...timed.filter((f) => f.from === "pypi").map((f) => f.delay));
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-xl">
      <PanelHeader>python environments</PanelHeader>
      <div className="grid grid-cols-1 gap-2 p-2.5 md:grid-cols-[8.5rem_minmax(0,1fr)]" style={{ minHeight: 150 }}>
        <motion.div
          key={`${ctx.sid}:${downloading}`}
          animate={
            downloading
              ? { boxShadow: ["0 0 0 0 rgba(56,189,248,0)", "0 0 14px 2px rgba(56,189,248,0.35)", "0 0 0 0 rgba(56,189,248,0)"] }
              : undefined
          }
          transition={{ delay: downloading ? first : 0, duration: 1.4 }}
          className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-400/5 p-2.5 text-center"
        >
          <Cloud className="size-5 text-sky-300" />
          <span ref={ctx.reg("pypi")} className={`${chipBase} ${chipClass.dep}`}>PyPI</span>
          <span className="font-mono text-[9px] tracking-wider text-slate-500">package index</span>
        </motion.div>
        <div className="grid min-w-0 grid-cols-1 content-start gap-2 sm:grid-cols-2">
          {view.envs.length === 0 && (
            <div className="flex min-h-[110px] items-center justify-center rounded-lg border border-dashed border-white/10 font-mono text-xs text-slate-500 sm:col-span-2">
              no environment yet
            </div>
          )}
          {view.envs.map((e) => (
            <EnvCard key={e.env.id} entry={e} ctx={ctx} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Flying chip                                                                 */
/* -------------------------------------------------------------------------- */

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
        x: { duration: f.dur, delay: f.delay, ease: "easeInOut" },
        y: { duration: f.dur, delay: f.delay, times: [0, 0.45, 1], ease: "easeInOut" },
        opacity: { duration: f.dur, delay: f.delay, times: [0, 0.1, 0.86, 1] },
        scale: { duration: f.dur, delay: f.delay, times: [0, 0.3, 0.86, 1] },
      }}
    >
      <span className={`${chipBase} ${chipClass[f.kind]}`}>{f.text}</span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                              */
/* -------------------------------------------------------------------------- */

export function PackageManagementCustomAnimation() {
  const reduce = !!useReducedMotion();
  const [scene, setScene] = useState(0);
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

  const current = scenes[scene];
  const last = current.steps.length - 1;
  const at = Math.min(phase, last);
  const views = useMemo(() => compile(current), [current]);
  const step = current.steps[at];
  const view = views[at];
  const prev = views[at - 1];
  const timed = useMemo(() => timedOf(step), [step]);

  // Autoplay: step through the phases, then move to the next scene.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (at < last) setPhase(at + 1);
      else {
        setScene((value) => (value + 1) % scenes.length);
        setPhase(0);
      }
    }, stepMs(step));
    return () => window.clearTimeout(timer);
  }, [at, playing, scene, last, step]);

  // Measure where each value starts and ends, then launch the flying chips.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) {
      setFlights([]);
      return;
    }
    const rr = root.getBoundingClientRect();
    const next: Flight[] = [];
    for (const t of timed) {
      const from = anchors.current[t.from];
      const to = anchors.current[t.to];
      if (!from || !to) continue;
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      // The terminal and tree rows are wide: fly from/to their left edge.
      next.push({
        ...t,
        x0: a.left - rr.left + (t.from === "term" ? 16 : 0),
        y0: a.top - rr.top + (t.from === "term" ? 18 : a.height / 2) - CHIP_H / 2,
        x1: b.left - rr.left,
        y1: b.top - rr.top + b.height / 2 - CHIP_H / 2,
      });
    }
    setFlights(next);
  }, [scene, at, reduce, timed]);

  const goScene = (target: number) => {
    setPlaying(false);
    setScene((target + scenes.length) % scenes.length);
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

  const ctx: Ctx = { step, view, prev, reg, reduce, timed, sid: `${scene}-${at}` };

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div
        ref={rootRef}
        className="relative flex min-h-[600px] w-full min-w-0 flex-col overflow-hidden px-4 py-4 sm:px-6"
      >
        {/* Fade only (no translate) so measured chip positions stay exact. */}
        <motion.div
          key={scene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mx-auto w-full min-w-0 max-w-5xl"
        >
          <div className="text-center">
            <p className="font-mono text-[10px] tracking-[0.2em] text-violet">{current.eyebrow}</p>
            <h3 className="mt-1 text-xl font-light text-foreground">{current.title}</h3>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {current.steps.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => goPhase(i)}
                aria-current={i === at ? "step" : undefined}
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] transition-colors ${i === at
                    ? "border-mint/50 bg-mint/15 text-mint"
                    : i < at
                      ? "border-hairline text-foreground/70 hover:text-foreground"
                      : "border-hairline text-muted-foreground hover:text-foreground"
                  }`}
              >
                {i + 1}. {s.label}
              </button>
            ))}
          </div>

          {/* Narration sits above the panels so nothing above them ever moves. */}
          <div className="mx-auto mt-2 min-h-[72px] max-w-3xl text-center" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${scene}-${at}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm leading-6 text-muted-foreground"
              >
                <span className="mr-2 font-mono text-[10px] tracking-[0.16em] text-mint">Step {at + 1}</span>
                {step.note}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* md: (768px) so the two-column layout applies inside a lesson column;
              minmax(0, ...) keeps wide content from widening the page. */}
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
            <Terminal ctx={ctx} />
            <Tree ctx={ctx} />
          </div>

          <div className="mt-3">
            <EnvPanel ctx={ctx} />
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          {flights.map((f) => (
            <FlyingChip key={`${scene}-${at}-${f.from}-${f.to}-${f.delay}`} f={f} />
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div
          className="absolute left-0 top-0 h-0.5 bg-mint/70 transition-[width] duration-500"
          style={{ width: `${((at + 1) / current.steps.length) * 100}%` }}
        />
        <div className="flex items-center gap-1">
          <button type="button" onClick={replay} className={controlBtn} aria-label="Replay scene">
            <RotateCcw className="size-3.5" />
          </button>
          <button type="button" onClick={() => goScene(scene - 1)} className={controlBtn} aria-label="Previous scene">
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
          <button type="button" onClick={() => goScene(scene + 1)} className={controlBtn} aria-label="Next scene">
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {scenes.map((s, i) => (
              <button
                key={s.eyebrow}
                type="button"
                onClick={() => goScene(i)}
                aria-label={`Go to scene ${i + 1}: ${s.eyebrow}`}
                className={`h-1.5 rounded-full transition-all ${i === scene ? "w-4 bg-mint" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"
                  }`}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {scene + 1} / {scenes.length}
          </span>
        </div>
      </div>
    </div>
  );
}