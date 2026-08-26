import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Braces,
  Check,
  ChevronLeft,
  ChevronRight,
  Database,
  FileJson,
  FileText,
  FolderOpen,
  Pause,
  Play,
  Replace,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const STEP_TIME = 7600;
const TOTAL_STEPS = 7;

export function WorkingWithJSONCustomAnimation() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!playing || isHovered) return;

    const timer = window.setTimeout(() => {
      setStep((current) => (current + 1) % TOTAL_STEPS);
    }, STEP_TIME);

    return () => window.clearTimeout(timer);
  }, [playing, step, isHovered]);

  const go = useCallback((delta: number) => {
    setPlaying(false);
    setStep((current) => (current + delta + TOTAL_STEPS) % TOTAL_STEPS);
  }, []);

  return (
    <div className="relative z-10 flex w-full flex-col" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative flex h-[600px] w-full min-w-0 items-center justify-center overflow-hidden px-4 py-7 lg:px-8 lg:py-9">
        <AnimatePresence mode="wait">
          {step === 0 && <DecodeScene key="decode" />}
          {step === 1 && <EncodeScene key="encode" />}
          {step === 2 && <FourFunctionsScene key="functions" />}
          {step === 3 && <FormattingScene key="formatting" />}
          {step === 4 && <ValidationScene key="validation" />}
          {step === 5 && <SafeSaveScene key="safe-save" />}
          {step === 6 && <JsonLinesScene key="jsonl" />}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Restart animation"
          >
            <RotateCcw className="size-3.5" />
          </button>

          <button
            onClick={() => go(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Previous step"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          <button
            onClick={() => setPlaying((value) => !value)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label={playing ? "Pause animation" : "Play animation"}
          >
            {playing ? (
              <Pause className="size-3.5" />
            ) : (
              <Play className="size-3.5" />
            )}
          </button>

          <button
            onClick={() => go(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Next step"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="font-mono text-xs text-muted-foreground">
          {step + 1} / {TOTAL_STEPS}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. DECODING — JSON TEXT BECOMES PYTHON                                     */
/* -------------------------------------------------------------------------- */

function DecodeScene() {
  return (
    <Scene>
      <CodeCard accent="sky">
        <Muted># JSON text → Python values</Muted>
        <br />
        text = <StringToken>'{"{"}"name":"Ana","active":true,"note":null{"}"}'</StringToken>
        <br />
        user = json.<FunctionToken>loads</FunctionToken>(text)
      </CodeCard>

      <div className="w-full max-w-4xl">
        <SceneCaption>json.loads() translates JSON syntax into Python syntax</SceneCaption>

        <div className="grid grid-cols-[1fr_120px_1fr] items-center gap-4">
          <Workbench title="JSON text" icon={<FileText className="size-4" />} tone="sky">
            <div className="relative min-h-[190px] overflow-hidden rounded-xl border border-sky-500/20 bg-sky-500/[0.05] p-4 font-mono text-[13px] leading-7">
              <JsonTextRows />

              <motion.div
                initial={{ left: "4%" }}
                animate={{ left: "96%" }}
                transition={{ duration: 3.1, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute bottom-3 top-3 w-[2px] bg-sky-500/70 shadow-[0_0_12px_2px_rgba(14,165,233,0.28)]"
              />
            </div>
          </Workbench>

          <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.45, type: "spring" }}
              className="flex size-20 flex-col items-center justify-center rounded-2xl border border-sky-500/25 bg-sky-500/[0.07]"
            >
              <Braces className="mb-1 size-5 text-sky-500" />
              <span className="font-mono text-[10px] font-bold text-sky-500">
                loads()
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <ArrowRight className="size-5 text-sky-500" />
            </motion.div>
          </div>

          <Workbench title="Python object" icon={<Braces className="size-4" />} tone="emerald">
            <div className="min-h-[190px] rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
              <PythonValueRow
                delay={0.8}
                keyName='"name"'
                value='"Ana"'
                type="str"
              />
              <PythonValueRow
                delay={1.25}
                keyName='"active"'
                value="True"
                type="bool"
              />
              <PythonValueRow
                delay={1.7}
                keyName='"note"'
                value="None"
                type="NoneType"
              />
            </div>
          </Workbench>
        </div>
      </div>

      <MemoryLine delay={2.05}>
        <b>true → True</b> and <b>null → None</b>. After parsing, you work with normal Python values.
      </MemoryLine>
    </Scene>
  );
}

function JsonTextRows() {
  return (
    <>
      <div>{"{"}</div>
      <div className="pl-4">
        <span className="text-amber">"name"</span>:{" "}
        <span className="text-amber">"Ana"</span>,
      </div>
      <div className="pl-4">
        <span className="text-amber">"active"</span>:{" "}
        <motion.span
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ delay: 1, duration: 1.2 }}
          className="font-bold text-sky-500"
        >
          true
        </motion.span>
        ,
      </div>
      <div className="pl-4">
        <span className="text-amber">"note"</span>:{" "}
        <motion.span
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ delay: 1.45, duration: 1.2 }}
          className="font-bold text-sky-500"
        >
          null
        </motion.span>
      </div>
      <div>{"}"}</div>
    </>
  );
}

function PythonValueRow({
  delay,
  keyName,
  value,
  type,
}: {
  delay: number;
  keyName: string;
  value: string;
  type: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="mb-3 flex items-center justify-between rounded-lg border border-hairline bg-surface px-3 py-2.5 last:mb-0"
    >
      <div className="font-mono text-xs">
        <span className="text-amber">{keyName}</span>
        <span className="text-muted-foreground"> → </span>
        <span className="font-bold text-emerald-500">{value}</span>
      </div>
      <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] text-emerald-500">
        {type}
      </span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. ENCODING — PYTHON BECOMES JSON TEXT                                     */
/* -------------------------------------------------------------------------- */

function EncodeScene() {
  return (
    <Scene>
      <CodeCard accent="emerald">
        <Muted># Python values → JSON text</Muted>
        <br />
        user = {"{"}<StringToken>"name"</StringToken>: <StringToken>"Ana"</StringToken>,{" "}
        <StringToken>"active"</StringToken>: <BoolToken>True</BoolToken>{"}"}
        <br />
        text = json.<FunctionToken>dumps</FunctionToken>(user)
      </CodeCard>

      <div className="w-full max-w-4xl">
        <SceneCaption>json.dumps() packs Python data into portable JSON text</SceneCaption>

        <div className="relative rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
          <div className="grid grid-cols-[1fr_150px_1fr] items-center gap-6">
            <div>
              <SmallLabel>PYTHON VALUES</SmallLabel>

              <div className="space-y-2">
                <PackingChip
                  delay={0.15}
                  left='"name"'
                  right='"Ana"'
                  tone="emerald"
                />
                <PackingChip
                  delay={0.45}
                  left='"active"'
                  right="True"
                  tone="emerald"
                />
                <PackingChip
                  delay={0.75}
                  left='"score"'
                  right="9.5"
                  tone="emerald"
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="relative flex size-28 items-center justify-center rounded-[28px] border border-violet/30 bg-violet/10"
              >
                <motion.div
                  animate={{ scale: [1, 0.92, 1] }}
                  transition={{ duration: 1.7, repeat: Infinity }}
                  className="text-center"
                >
                  <Sparkles className="mx-auto mb-2 size-5 text-violet" />
                  <div className="font-mono text-[10px] font-bold text-violet">
                    dumps()
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 26 }}
                transition={{ delay: 1.2 }}
                className="w-px bg-violet/40"
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.35 }}
              >
                <ArrowRight className="size-5 text-violet" />
              </motion.div>
            </div>

            <div>
              <SmallLabel>ONE JSON STRING</SmallLabel>

              <motion.div
                initial={{ opacity: 0, scaleX: 0.78 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.55 }}
                className="origin-left rounded-xl border border-sky-500/25 bg-sky-500/[0.06] p-4 font-mono text-[12px] leading-6"
              >
                {'{"name":"Ana","active":true,"score":9.5}'}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.75 }}
                className="mt-3 flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 font-mono text-[10px] text-muted-foreground"
              >
                <FileText className="size-4 text-sky-500" />
                <span>type(text) → <b className="text-foreground">str</b></span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <MemoryLine delay={2.05}>
        <b>dumps()</b> does not create a file. It returns a <b>string in memory</b>.
      </MemoryLine>
    </Scene>
  );
}

function PackingChip({
  delay,
  left,
  right,
  tone,
}: {
  delay: number;
  left: string;
  right: string;
  tone: "emerald";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between rounded-xl border border-hairline bg-surface-2/55 px-3 py-2.5 font-mono text-xs"
    >
      <span className="text-amber">{left}</span>
      <ArrowRight className="size-3.5 text-muted-foreground" />
      <span className={tone === "emerald" ? "font-bold text-emerald-500" : ""}>
        {right}
      </span>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. THE FOUR FUNCTIONS — A SINGLE MAP                                       */
/* -------------------------------------------------------------------------- */

function FourFunctionsScene() {
  return (
    <Scene>
      <CodeCard accent="amber">
        <Muted># The only question: STRING or FILE?</Muted>
        <br />
        json.<FunctionToken>loads</FunctionToken>(text) &nbsp;&nbsp;
        json.<FunctionToken>load</FunctionToken>(file)
        <br />
        json.<FunctionToken>dumps</FunctionToken>(data) &nbsp;&nbsp;
        json.<FunctionToken>dump</FunctionToken>(data, file)
      </CodeCard>

      <div className="w-full max-w-4xl">
        <SceneCaption>Put Python in the middle. Strings and files are just two doors.</SceneCaption>

        <div className="relative mx-auto h-[305px] max-w-3xl">
          <div className="absolute left-1/2 top-1/2 z-20 flex size-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/[0.07] shadow-sm">
            <Braces className="mb-2 size-7 text-emerald-500" />
            <div className="font-mono text-xs font-bold text-emerald-500">
              PYTHON
            </div>
            <div className="mt-1 font-mono text-[9px] text-muted-foreground">
              dict · list · str...
            </div>
          </div>

          <Door
            side="left"
            icon={<FileText className="size-6" />}
            title="JSON STRING"
            note="already in memory"
          />

          <Door
            side="right"
            icon={<FileJson className="size-6" />}
            title="JSON FILE"
            note="open text file"
          />

          <FunctionArrow
            from="left"
            direction="toward"
            label="loads()"
            delay={0.35}
          />
          <FunctionArrow
            from="left"
            direction="away"
            label="dumps()"
            delay={0.95}
          />

          <FunctionArrow
            from="right"
            direction="toward"
            label="load()"
            delay={0.65}
          />
          <FunctionArrow
            from="right"
            direction="away"
            label="dump()"
            delay={1.25}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, type: "spring" }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-amber/30 bg-amber/10 px-4 py-1.5 font-mono text-[10px] font-bold text-amber"
          >
            the extra “s” = STRING
          </motion.div>
        </div>
      </div>

      <MemoryLine delay={2.2}>
        <b>load</b> moves JSON into Python. <b>dump</b> moves Python out to JSON.
      </MemoryLine>
    </Scene>
  );
}

function Door({
  side,
  icon,
  title,
  note,
}: {
  side: "left" | "right";
  icon: ReactNode;
  title: string;
  note: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.12 }}
      className={`absolute top-1/2 w-44 -translate-y-1/2 rounded-2xl border border-hairline bg-surface p-4 text-center shadow-sm ${side === "left" ? "left-0" : "right-0"
        }`}
    >
      <div className="mx-auto mb-2 flex size-11 items-center justify-center rounded-xl bg-surface-2 text-sky-500">
        {icon}
      </div>
      <div className="font-mono text-[10px] font-bold text-foreground">{title}</div>
      <div className="mt-1 font-mono text-[9px] text-muted-foreground">{note}</div>
    </motion.div>
  );
}

function FunctionArrow({
  from,
  direction,
  label,
  delay,
}: {
  from: "left" | "right";
  direction: "toward" | "away";
  label: string;
  delay: number;
}) {
  const leftSide = from === "left";

  const position =
    leftSide
      ? direction === "toward"
        ? "left-[23%] top-[37%]"
        : "left-[23%] top-[61%]"
      : direction === "toward"
        ? "right-[23%] top-[37%]"
        : "right-[23%] top-[61%]";

  let arrow: ReactNode;

  if (leftSide) {
    arrow =
      direction === "toward" ? (
        <ArrowRight className="size-4" />
      ) : (
        <ArrowLeft className="size-4" />
      );
  } else {
    arrow =
      direction === "toward" ? (
        <ArrowLeft className="size-4" />
      ) : (
        <ArrowRight className="size-4" />
      );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring" }}
      className={`absolute ${position} flex items-center gap-2 text-sky-500`}
    >
      {leftSide && direction === "away" ? (
        <>
          {arrow}
          <FnBubble>{label}</FnBubble>
        </>
      ) : leftSide ? (
        <>
          <FnBubble>{label}</FnBubble>
          {arrow}
        </>
      ) : direction === "toward" ? (
        <>
          {arrow}
          <FnBubble>{label}</FnBubble>
        </>
      ) : (
        <>
          <FnBubble>{label}</FnBubble>
          {arrow}
        </>
      )}
    </motion.div>
  );
}

function FnBubble({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-sky-500/20 bg-sky-500/[0.07] px-2.5 py-1 font-mono text-[9px] font-bold">
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. FORMATTING — SAME DATA, DIFFERENT WHITESPACE                             */
/* -------------------------------------------------------------------------- */

function FormattingScene() {
  const [mode, setMode] = useState<"pretty" | "compact">("pretty");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMode((current) => (current === "pretty" ? "compact" : "pretty"));
    }, 2300);

    return () => window.clearInterval(timer);
  }, []);

  const pretty = mode === "pretty";

  return (
    <Scene>
      <CodeCard accent="violet">
        <Muted># Same data. Only the whitespace changes.</Muted>
        <br />
        pretty = json.<FunctionToken>dumps</FunctionToken>(data, indent=<NumberToken>2</NumberToken>)
        <br />
        compact = json.<FunctionToken>dumps</FunctionToken>(
        data, separators=(<StringToken>","</StringToken>, <StringToken>":"</StringToken>))
      </CodeCard>

      <div className="w-full max-w-3xl">
        <SceneCaption>
          Watch one JSON document change shape without changing its values
        </SceneCaption>

        <div className="overflow-hidden rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
          {/* Data stays fixed while presentation changes */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <DataPill label="name" value='"Ana"' />
            <DataPill label="active" value="true" />
            <DataPill label="count" value="12" />
          </div>

          <div className="mb-4 flex items-center justify-center">
            <div className="inline-flex rounded-xl border border-hairline bg-surface-2/60 p-1">
              <FormatModePill active={pretty} label="indent=2" />
              <FormatModePill active={!pretty} label='separators=(",", ":")' />
            </div>
          </div>

          <div className="relative min-h-[190px] overflow-hidden rounded-xl border border-hairline bg-surface-2/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <FileJson className="size-4 text-violet" />
                output.json
              </div>

              <motion.span
                key={mode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-full px-2.5 py-1 font-mono text-[9px] font-bold ${pretty
                  ? "bg-violet/10 text-violet"
                  : "bg-amber/10 text-amber"
                  }`}
              >
                {pretty ? "HUMAN FRIENDLY" : "SPACE EFFICIENT"}
              </motion.span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {pretty ? (
                <motion.div
                  key="pretty-json"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                  className="mx-auto max-w-md rounded-lg border border-violet/20 bg-violet/[0.045] p-4 font-mono text-[12px] leading-6"
                >
                  <div>{"{"}</div>
                  <motion.div
                    initial={{ paddingLeft: 0 }}
                    animate={{ paddingLeft: 18 }}
                    transition={{ duration: 0.45 }}
                  >
                    "name": "Ana",
                  </motion.div>
                  <motion.div
                    initial={{ paddingLeft: 0 }}
                    animate={{ paddingLeft: 18 }}
                    transition={{ duration: 0.45, delay: 0.08 }}
                  >
                    "active": true,
                  </motion.div>
                  <motion.div
                    initial={{ paddingLeft: 0 }}
                    animate={{ paddingLeft: 18 }}
                    transition={{ duration: 0.45, delay: 0.16 }}
                  >
                    "count": 12
                  </motion.div>
                  <div>{"}"}</div>
                </motion.div>
              ) : (
                <motion.div
                  key="compact-json"
                  initial={{ opacity: 0, scaleX: 0.92 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0.92 }}
                  transition={{ duration: 0.28 }}
                  className="mx-auto flex min-h-[122px] max-w-xl items-center justify-center rounded-lg border border-amber/20 bg-amber/[0.045] px-4 py-5"
                >
                  <div className="break-all text-center font-mono text-[12px] leading-6">
                    {'{"name":"Ana","active":true,"count":12}'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              key={`explain-${mode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-center font-mono text-[9px] text-muted-foreground"
            >
              {pretty
                ? "Extra spaces + new lines make the structure easier to scan."
                : "Optional spaces disappear. The values are exactly the same."}
            </motion.div>
          </div>
        </div>
      </div>

      <MemoryLine delay={0.45}>
        Formatting changes <b>how JSON looks</b>, not <b>what the JSON means</b>.
      </MemoryLine>
    </Scene>
  );
}

function DataPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface-2/55 px-3 py-1.5 font-mono text-[10px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}

function FormatModePill({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <motion.div
      animate={{
        opacity: active ? 1 : 0.42,
        scale: active ? 1 : 0.97,
      }}
      className={`rounded-lg px-3 py-1.5 font-mono text-[9px] font-bold ${active
        ? "bg-surface text-foreground shadow-sm"
        : "text-muted-foreground"
        }`}
    >
      {label}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. VALIDATION — TWO DIFFERENT QUESTIONS                                     */
/* -------------------------------------------------------------------------- */

function ValidationScene() {
  return (
    <Scene>
      <CodeCard accent="rose">
        <Muted># Parsing and validation solve different problems</Muted>
        <br />
        settings = json.<FunctionToken>loads</FunctionToken>(text)
        <br />
        <span className="text-mint font-medium">if</span>{" "}
        <span className="text-blue-400">type</span>(settings[<StringToken>"version"</StringToken>]){" "}
        <span className="text-mint font-medium">is not</span>{" "}
        <NumberToken>int</NumberToken>: ...
      </CodeCard>

      <div className="w-full max-w-4xl">
        <SceneCaption>A JSON document must pass two different checks</SceneCaption>

        <div className="relative rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
          <div className="grid grid-cols-[180px_1fr_1fr] gap-5">
            <div className="flex flex-col justify-center">
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/[0.06] p-4 font-mono text-[11px] leading-5">
                {"{"}
                <br />
                &nbsp;&nbsp;"version":{" "}
                <span className="font-bold text-amber">"one"</span>,
                <br />
                &nbsp;&nbsp;"columns": ["name"]
                <br />
                {"}"}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-center font-mono text-[9px] text-muted-foreground"
              >
                incoming settings
              </motion.div>
            </div>

            <Checkpoint
              delay={0.6}
              icon={<Braces className="size-5" />}
              title="1. PARSE"
              question="Is the JSON syntax valid?"
              success
              answer="YES"
              detail='Quotes, braces and commas are valid.'
            />

            <Checkpoint
              delay={1.35}
              icon={<ShieldCheck className="size-5" />}
              title="2. VALIDATE"
              question="Does the data match our rules?"
              success={false}
              answer="NO"
              detail='"version" should be int 1, not string "one".'
            />
          </div>

          <motion.div
            initial={{ left: "20%", opacity: 0 }}
            animate={{
              left: ["20%", "48%", "78%"],
              opacity: [1, 1, 0],
            }}
            transition={{
              delay: 0.35,
              duration: 1.65,
              times: [0, 0.55, 1],
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute top-[54%] hidden size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500 shadow-[0_0_12px_2px_rgba(14,165,233,0.35)] md:block"
          />
        </div>
      </div>

      <MemoryLine delay={2.05}>
        <b>Syntax valid</b> and <b>data valid</b> are two separate wins.
      </MemoryLine>
    </Scene>
  );
}

function Checkpoint({
  delay,
  icon,
  title,
  question,
  success,
  answer,
  detail,
}: {
  delay: number;
  icon: ReactNode;
  title: string;
  question: string;
  success: boolean;
  answer: string;
  detail: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl border p-4 ${success
        ? "border-emerald-500/25 bg-emerald-500/[0.05]"
        : "border-rose-500/25 bg-rose-500/[0.05]"
        }`}
    >
      <div className={`mb-3 flex items-center gap-2 font-mono text-[10px] font-bold ${success ? "text-emerald-500" : "text-rose-500"
        }`}>
        {icon}
        {title}
      </div>

      <div className="font-mono text-[10px] leading-5 text-muted-foreground">
        {question}
      </div>

      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 0.28, type: "spring" }}
        className={`my-3 flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-[11px] font-bold ${success
          ? "bg-emerald-500/10 text-emerald-500"
          : "bg-rose-500/10 text-rose-500"
          }`}
      >
        {success ? <Check className="size-4" /> : <X className="size-4" />}
        {answer}
      </motion.div>

      <div className="font-mono text-[9px] leading-4 text-muted-foreground">
        {detail}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. SAFE SAVE — FILL TEMP, THEN SWAP                                        */
/* -------------------------------------------------------------------------- */

function SafeSaveScene() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % 4);
    }, 1450);

    return () => window.clearInterval(timer);
  }, []);

  const writing = phase === 1 || phase === 2;
  const complete = phase >= 2;
  const replaced = phase === 3;

  return (
    <Scene>
      <CodeCard accent="teal">
        <Muted># Safe update: finish a temp file, then swap it in</Muted>
        <br />
        json.<FunctionToken>dump</FunctionToken>(data, temporary_file)
        <br />
        temporary_path.<FunctionToken>replace</FunctionToken>(path)
      </CodeCard>

      <div className="w-full max-w-3xl">
        <SceneCaption>
          Think of the folder as a desk: prepare the replacement beside the live file
        </SceneCaption>

        <div className="overflow-hidden rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-hairline pb-3">
            <FolderOpen className="size-4 text-teal-500" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              config/
            </span>
          </div>

          <div className="space-y-3">
            <motion.div
              animate={{
                opacity: replaced ? 0.45 : 1,
              }}
              className="rounded-xl border border-hairline bg-surface-2/55 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <FileJson className="size-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="truncate font-mono text-[11px] font-bold">
                      settings.json
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                      {"{"}"theme":"light"{"}"}
                    </div>
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-1 font-mono text-[8px] font-bold text-emerald-500">
                  LIVE + VALID
                </span>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {!replaced ? (
                <motion.div
                  key="temp-file"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: phase === 0 ? 0.35 : 1, y: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  className="rounded-xl border-2 border-dashed border-teal-500/30 bg-teal-500/[0.055] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileJson className="size-5 shrink-0 text-teal-500" />
                      <div className="min-w-0">
                        <div className="truncate font-mono text-[11px] font-bold text-teal-500">
                          .settings.json.tmp
                        </div>
                        <div className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                          {phase === 0
                            ? "waiting to write"
                            : writing
                              ? "writing new JSON..."
                              : "complete new JSON"}
                        </div>
                      </div>
                    </div>

                    <span className="shrink-0 font-mono text-[9px] font-bold text-teal-500">
                      {phase === 0 ? "0%" : phase === 1 ? "55%" : "100%"}
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-teal-500/10">
                    <motion.div
                      animate={{
                        width:
                          phase === 0
                            ? "0%"
                            : phase === 1
                              ? "55%"
                              : "100%",
                      }}
                      transition={{ duration: 0.45 }}
                      className="h-full rounded-full bg-teal-500"
                    />
                  </div>

                  <AnimatePresence>
                    {complete && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-lg bg-surface px-3 py-2 font-mono text-[9px] text-muted-foreground">
                          {'{"theme":"dark"}'}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="new-live-file"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-teal-500/30 bg-teal-500/[0.06] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileJson className="size-5 shrink-0 text-teal-500" />
                      <div className="min-w-0">
                        <div className="truncate font-mono text-[11px] font-bold">
                          settings.json
                        </div>
                        <div className="mt-0.5 font-mono text-[9px] font-bold text-teal-500">
                          {"{"}"theme":"dark"{"}"}
                        </div>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-teal-500/10 px-2 py-1 font-mono text-[8px] font-bold text-teal-500">
                      NEW LIVE FILE
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex min-h-10 items-center justify-center border-t border-hairline pt-3">
            <AnimatePresence mode="wait">
              {phase === 0 && (
                <SaveStatus key="status-0" tone="muted">
                  Old file continues serving readers.
                </SaveStatus>
              )}

              {phase === 1 && (
                <SaveStatus key="status-1" tone="teal">
                  Writing happens in the temp file — not the live file.
                </SaveStatus>
              )}

              {phase === 2 && (
                <SaveStatus key="status-2" tone="teal">
                  Temp file is complete. Now replacement is safe.
                </SaveStatus>
              )}

              {phase === 3 && (
                <SaveStatus key="status-3" tone="teal" icon={<Replace className="size-3.5" />}>
                  replace() swaps the complete document into place.
                </SaveStatus>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <MemoryLine delay={0.35}>
        If writing fails early, <b>settings.json is still untouched</b>.
      </MemoryLine>
    </Scene>
  );
}

function SaveStatus({
  children,
  tone,
  icon,
}: {
  children: ReactNode;
  tone: "muted" | "teal";
  icon?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={`flex items-center gap-2 text-center font-mono text-[10px] ${tone === "teal" ? "text-teal-500" : "text-muted-foreground"
        }`}
    >
      {icon}
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. JSON LINES — CONVEYOR BELT                                              */
/* -------------------------------------------------------------------------- */

function JsonLinesScene() {
  const records = [
    { raw: '{"event":"start","count":0}', event: "start", count: 0 },
    { raw: '{"event":"running","count":1}', event: "running", count: 1 },
    { raw: '{"event":"running","count":2}', event: "running", count: 2 },
    { raw: '{"event":"finish","count":3}', event: "finish", count: 3 },
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % records.length);
    }, 1250);

    return () => window.clearInterval(timer);
  }, [records.length]);

  const current = records[active];

  return (
    <Scene>
      <CodeCard accent="teal">
        <Muted># Read one JSON record, use it, then move on</Muted>
        <br />
        <span className="text-mint font-medium">for</span> line{" "}
        <span className="text-mint font-medium">in</span> file:
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;record = json.<FunctionToken>loads</FunctionToken>(line)
      </CodeCard>

      <div className="w-full max-w-3xl">
        <SceneCaption>
          JSONL behaves like a queue: only the current line needs to be in memory
        </SceneCaption>

        <div className="overflow-hidden rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
          <div className="grid min-w-0 grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <FileJson className="size-4 text-teal-500" />
                events.jsonl
              </div>

              <div className="space-y-2 rounded-xl border border-hairline bg-surface-2/45 p-3">
                {records.map((record, index) => {
                  const selected = index === active;

                  return (
                    <motion.div
                      key={record.raw}
                      animate={{
                        opacity: selected ? 1 : 0.46,
                        scale: selected ? 1 : 0.985,
                      }}
                      transition={{ duration: 0.22 }}
                      className={`flex min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 ${selected
                        ? "border-teal-500/35 bg-teal-500/[0.08]"
                        : "border-hairline bg-surface"
                        }`}
                    >
                      <motion.span
                        animate={{
                          backgroundColor: selected
                            ? "rgba(20,184,166,0.13)"
                            : "rgba(20,184,166,0.04)",
                        }}
                        className="w-8 shrink-0 rounded px-1 py-0.5 text-center font-mono text-[8px] font-bold text-teal-500"
                      >
                        {index + 1}
                      </motion.span>

                      <span className="min-w-0 flex-1 truncate font-mono text-[9px] text-muted-foreground">
                        {record.raw}
                      </span>

                      {selected && (
                        <motion.span
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="shrink-0"
                        >
                          <ArrowRight className="size-3.5 text-teal-500" />
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                <Database className="size-4 text-sky-500" />
                memory window
              </div>

              <div className="flex min-h-[188px] flex-col justify-between rounded-xl border border-sky-500/25 bg-sky-500/[0.05] p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 9 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -9 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-sky-500/10 px-2 py-1 font-mono text-[8px] font-bold text-sky-500">
                        json.loads(line)
                      </span>
                      <span className="font-mono text-[8px] text-muted-foreground">
                        line {active + 1}
                      </span>
                    </div>

                    <div className="rounded-lg border border-hairline bg-surface p-3 font-mono text-[10px] leading-5">
                      <div>{"{"}</div>
                      <div className="pl-4">
                        "event": <span className="font-bold text-sky-500">"{current.event}"</span>,
                      </div>
                      <div className="pl-4">
                        "count": <span className="font-bold text-sky-500">{current.count}</span>
                      </div>
                      <div>{"}"}</div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-3 border-t border-sky-500/15 pt-3">
                  <div className="flex items-center justify-between font-mono text-[9px]">
                    <span className="text-muted-foreground">records held</span>
                    <span className="font-bold text-sky-500">1</span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sky-500/10">
                    <motion.div
                      animate={{ width: "28%" }}
                      className="h-full rounded-full bg-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-4 grid grid-cols-3 gap-2 border-t border-hairline pt-3"
          >
            <JsonlAction number="1" label="READ LINE" />
            <JsonlAction number="2" label="PROCESS" />
            <JsonlAction number="3" label="DISCARD" />
          </motion.div>
        </div>
      </div>

      <MemoryLine delay={0.35}>
        A million-line file can still be processed with roughly <b>one record in memory</b>.
      </MemoryLine>
    </Scene>
  );
}

function JsonlAction({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-surface-2/50 px-2 py-2 font-mono text-[9px]">
      <span className="flex size-5 items-center justify-center rounded-full bg-teal-500/10 font-bold text-teal-500">
        {number}
      </span>
      <span className="font-bold text-muted-foreground">{label}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SHARED                                                                      */
/* -------------------------------------------------------------------------- */

function Scene({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="flex w-full min-w-0 flex-col items-center overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

function CodeCard({
  children,
  accent,
}: {
  children: ReactNode;
  accent: "sky" | "emerald" | "amber" | "violet" | "rose" | "teal";
}) {
  const border = {
    sky: "border-sky-500/30",
    emerald: "border-emerald-500/30",
    amber: "border-amber/30",
    violet: "border-violet/30",
    rose: "border-rose-500/30",
    teal: "border-teal-500/30",
  }[accent];

  return (
    <div
      className={`mb-5 w-full min-w-0 max-w-lg rounded-xl border ${border} bg-surface p-4 text-left font-mono text-[13px] leading-relaxed text-foreground shadow-sm`}
    >
      {children}
    </div>
  );
}

function SceneCaption({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </div>
  );
}

function Workbench({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: ReactNode;
  tone: "sky" | "emerald";
  children: ReactNode;
}) {
  const toneClass =
    tone === "sky" ? "text-sky-500" : "text-emerald-500";

  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
      <div
        className={`mb-4 flex items-center gap-2 border-b border-hairline pb-2 font-mono text-[10px] font-bold uppercase tracking-widest ${toneClass}`}
      >
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function MemoryLine({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mt-4 w-full min-w-0 max-w-4xl rounded-xl border border-sky-500/20 bg-sky-500/[0.055] px-4 py-2.5 text-center font-mono text-[11px] text-sky-700 dark:text-sky-300"
    >
      {children}
    </motion.div>
  );
}

function SmallLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </div>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

function FunctionToken({ children }: { children: ReactNode }) {
  return <span className="text-blue-400">{children}</span>;
}

function StringToken({ children }: { children: ReactNode }) {
  return <span className="text-amber">{children}</span>;
}

function BoolToken({ children }: { children: ReactNode }) {
  return <span className="text-purple-400">{children}</span>;
}

function NumberToken({ children }: { children: ReactNode }) {
  return <span className="text-purple-400">{children}</span>;
}