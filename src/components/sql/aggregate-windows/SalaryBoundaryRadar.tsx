import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Layers3,
  MoveHorizontal,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisualPlayer, type VisualControls } from "../window-functions/VisualPlayer";

type Employee = { id: number; department: string; salary: number };
const money = (n: number) => `$${n / 1000}k`;
const position = (n: number) => ((n - 60000) / 70000) * 100;
const STEPS = [
  {
    label: "01 / Separate the departments",
    note: "Imagine that each department has a salary range.",
  },
  {
    label: "02 / Lock onto the minimum",
    note: "MIN() returns the smallest non-NULL value in a set of rows.",
  },
  {
    label: "03 / Lock onto the maximum",
    note: "MAX() returns the largest non-NULL value in a set of rows.",
  },
  {
    label: "04 / Measure the distance",
    note: "Each employee can be compared against the minimum and maximum salary of their own department.",
  },
];
const PHASES = [
  { label: "Partitions", Icon: Layers3 },
  { label: "Find MIN", Icon: ArrowDownToLine },
  { label: "Find MAX", Icon: ArrowUpToLine },
  { label: "Compare", Icon: MoveHorizontal },
];

function Controls({ step, playing, selectStep, togglePlay, restart }: VisualControls) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-hairline bg-surface-2/40 p-2 sm:px-4">
      <div
        className="grid flex-1 basis-full grid-cols-4 gap-1.5 sm:basis-0 sm:gap-2"
        role="group"
        aria-label="Salary boundary stages"
      >
        {PHASES.map(({ label, Icon }, index) => (
          <Button
            key={label}
            variant={step === index ? "default" : "outline"}
            className="relative h-9 min-w-0 gap-1 overflow-hidden px-1 text-[10px] sm:text-xs"
            aria-pressed={step === index}
            onClick={() => selectStep(index)}
          >
            <span className="flex items-center gap-1.5">
              <span className="hidden opacity-60 lg:inline">0{index + 1}</span>
              <Icon className="hidden size-4 sm:block" />
            </span>
            {label}
            {step === index && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-current opacity-50" />
            )}
          </Button>
        ))}
      </div>
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:hidden">
          {step + 1} / 4
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Replay salary boundaries"
            onClick={restart}
          >
            <RotateCcw />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlay}
            aria-label={playing ? "Pause salary animation" : "Play salary animation"}
          >
            {playing ? <Pause /> : <Play />}
            {playing ? "Pause" : "Play"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BoundaryScene({ employees, step }: { employees: Employee[]; step: number }) {
  const reduced = useReducedMotion();
  return (
    <div className="relative isolate overflow-hidden rounded-xl border border-hairline bg-background/70 p-2.5 sm:p-3">
      <div className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-violet/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 -z-10 size-64 rounded-full bg-mint/15 blur-3xl" />
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Salary boundary radar.</h3>
        </div>
        <div className="relative grid size-7 shrink-0 place-items-center rounded-full border border-mint/40 bg-mint/10 text-mint">
          <motion.div
            key={step}
            className="absolute inset-0 rounded-full border border-mint/50"
            animate={reduced ? {} : { scale: [1, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 1 }}
          />
          <ScanLine className="size-3.5" />
        </div>
      </div>
      <div className="grid items-start gap-2.5 sm:grid-cols-2">
        {["Engineering", "Sales"].map((department, departmentIndex) => {
          const staff = employees.filter((e) => e.department === department);
          const min = Math.min(...staff.map((e) => e.salary));
          const max = Math.max(...staff.map((e) => e.salary));
          return (
            <div
              key={department}
              className="relative overflow-hidden rounded-xl border border-hairline bg-surface/80 p-2.5"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${departmentIndex === 0 ? "bg-mint" : "bg-violet"}`}
                  />
                  <h4 className="text-sm font-semibold">{department}</h4>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {staff.length} rows
                  </span>
                </div>
                <div className="flex gap-2 font-mono text-[10px] sm:text-xs">
                  <span
                    className={`rounded-md border px-2 py-1 transition-colors ${step >= 1 ? "border-mint/40 bg-mint/10 text-mint" : "border-hairline text-muted-foreground"}`}
                  >
                    MIN {step >= 1 ? money(min) : "?"}
                  </span>
                  <span
                    className={`rounded-md border px-2 py-1 transition-colors ${step >= 2 ? "border-violet/40 bg-violet/10 text-violet" : "border-hairline text-muted-foreground"}`}
                  >
                    MAX {step >= 2 ? money(max) : "?"}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                {staff.map((employee, index) => {
                  const gap = max - employee.salary;
                  const active =
                    step === 1
                      ? employee.salary === min
                      : step >= 2
                        ? employee.salary === max
                        : false;
                  return (
                    <div
                      key={employee.id}
                      className="grid grid-cols-[64px_minmax(0,1fr)_48px] items-center gap-2 sm:grid-cols-[64px_minmax(0,1fr)_48px] sm:gap-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`grid size-7 shrink-0 place-items-center rounded-lg border transition-colors ${active ? "border-mint/50 bg-mint/15 text-mint" : "border-hairline text-muted-foreground"}`}
                        >
                          <UserRound className="size-3.5" />
                        </span>
                        <div className="font-mono">
                          <p className="text-[10px]">{employee.id}</p>
                          <p className="text-[9px] text-muted-foreground">
                            {money(employee.salary)}
                          </p>
                        </div>
                      </div>
                      <div
                        className="relative h-8"
                        aria-label={`Employee ${employee.id}: ${money(employee.salary)}${step === 3 ? `, gap ${money(gap)}` : ""}`}
                      >
                        {(step === 1 || step === 2) && !reduced && (
                          <motion.div
                            key={`scan-${employee.id}-${step}`}
                            initial={{ left: "0%", opacity: 0 }}
                            animate={{
                              left: `${position(step === 1 ? min : max)}%`,
                              opacity: [0, 1, 1, 0],
                            }}
                            transition={{ duration: 1.1, delay: index * 0.1 }}
                            className={`absolute inset-y-0 z-20 w-0.5 ${step === 1 ? "bg-mint shadow-[0_0_20px_4px_rgba(64,224,180,0.4)]" : "bg-violet shadow-[0_0_20px_4px_rgba(167,139,250,0.4)]"}`}
                          />
                        )}
                        <div className="absolute inset-x-0 top-1/2 h-px bg-foreground/15" />
                        {[0, 25, 50, 75, 100].map((tick) => (
                          <div
                            key={tick}
                            className="absolute top-3 h-2 border-l border-foreground/15"
                            style={{ left: `${tick}%` }}
                          />
                        ))}
                        <motion.div
                          initial={false}
                          animate={{ opacity: step >= 1 ? 1 : 0 }}
                          className="absolute top-2 h-4 rounded-sm bg-gradient-to-r from-mint/15 to-violet/15"
                          style={{
                            left: `${position(min)}%`,
                            width: `${position(max) - position(min)}%`,
                          }}
                        />
                        <motion.div
                          initial={false}
                          animate={{ opacity: step >= 1 ? 1 : 0 }}
                          className="absolute inset-y-0 border-l-2 border-mint shadow-[0_0_12px_rgba(64,224,180,0.35)]"
                          style={{ left: `${position(min)}%` }}
                        />
                        <motion.div
                          initial={false}
                          animate={{ opacity: step >= 2 ? 1 : 0 }}
                          className="absolute inset-y-0 border-l-2 border-violet shadow-[0_0_12px_rgba(167,139,250,0.4)]"
                          style={{ left: `${position(max)}%` }}
                        />
                        {step === 3 && (
                          <motion.div
                            key={`gap-${employee.id}`}
                            initial={{ scaleX: reduced ? 1 : 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.12 }}
                            className="absolute top-[14px] h-1 origin-left rounded-full bg-violet"
                            style={{
                              left: `${position(employee.salary)}%`,
                              width: `${position(max) - position(employee.salary)}%`,
                            }}
                          />
                        )}
                        <motion.div
                          key={`${employee.id}-${step}`}
                          initial={reduced ? false : { scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 15,
                            delay: index * 0.08,
                          }}
                          className={`absolute top-1/2 z-10 -mt-1.5 -ml-1.5 size-3 rounded-full border-2 border-background ${active ? "bg-mint shadow-[0_0_15px_rgba(64,224,180,0.65)]" : "bg-foreground"}`}
                          style={{ left: `${position(employee.salary)}%` }}
                        />
                      </div>
                      <div className="text-right font-mono">
                        <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
                          {step === 3 ? "gap" : "salary"}
                        </p>
                        <motion.p
                          key={`${step}-${employee.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-xs font-semibold ${step === 3 ? "text-violet" : "text-foreground"}`}
                        >
                          {money(step === 3 ? gap : employee.salary)}
                        </motion.p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-1.5 grid grid-cols-[64px_minmax(0,1fr)_48px] gap-2 sm:grid-cols-[64px_minmax(0,1fr)_48px] sm:gap-2">
                <span />
                <div className="flex justify-between font-mono text-[8px] text-muted-foreground">
                  <span>$60k</span>
                  <span>$130k</span>
                </div>
                <span />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-[10px]">
        <div className="text-mint">MIN = lower boundary</div>
        <div className="text-violet">MAX = upper boundary</div>
      </div>
    </div>
  );
}

export function SalaryBoundaryRadar({
  employees,
  caption,
}: {
  employees: Employee[];
  caption?: string;
}) {
  return (
    <VisualPlayer
      compact
      caption={caption}
      steps={STEPS}
      renderStep={(step) => <BoundaryScene employees={employees} step={step} />}
      renderControls={(controls) => <Controls {...controls} />}
      placeholderHeight={440}
    />
  );
}
