import { AnimatePresence, motion } from "motion/react";
import { FileText, Ticket } from "lucide-react";
import { VisualPlayer } from "../window-functions/VisualPlayer";

type Slip = { order: number };
type Queue = { customer: string; tone: "mint" | "amber"; slips: Slip[] };

const QUEUES: Queue[] = [
  { customer: "A", tone: "mint", slips: [{ order: 101 }, { order: 102 }, { order: 105 }] },
  { customer: "B", tone: "amber", slips: [{ order: 103 }, { order: 104 }] },
];
const DESK = [101, 102, 103, 104, 105];

const TONE = {
  mint: { box: "border-mint/40 bg-mint/5", text: "text-mint", chip: "border-mint/40 bg-mint/10 text-mint" },
  amber: { box: "border-amber/40 bg-amber/5", text: "text-amber", chip: "border-amber/40 bg-amber/10 text-amber" },
} as const;

const STEPS = [
  {
    label: "Five orders arrive",
    note: "Imagine customers A and B. Their five orders arrive at the ticket desk in a mixed pile.",
  },
  {
    label: "Separate queues by customer",
    note: "Each customer gets a separate queue. This is what PARTITION BY customer_id does.",
  },
  {
    label: "Tickets follow the order date",
    note: "Orders stand in each queue by order date, and each order takes the next ticket number: 1, 2, 3.",
  },
  {
    label: "Each queue restarts at 1",
    note: "Customer A ends at 3 and customer B ends at 2. ROW_NUMBER() gives a position in a partition. It does not sum or average anything.",
  },
] as const;

function Slip({ order, ticket, tone }: { order: number; ticket?: number; tone: Queue["tone"] }) {
  const t = TONE[tone];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex w-[76px] flex-col items-center gap-1 rounded-lg border border-hairline bg-surface/70 px-2 py-2"
    >
      <FileText className={`size-5 ${t.text}`} />
      <div className="font-mono text-[11px] text-muted-foreground">Order {order}</div>
      <div className="flex h-6 items-center">
        <AnimatePresence>
          {ticket !== undefined ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[12px] font-semibold ${t.chip}`}
            >
              <Ticket className="size-3" />
              {ticket}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Body({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="rounded-xl border border-dashed border-hairline p-4">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Ticket desk</div>
        <div className="flex min-h-[170px] flex-wrap items-center justify-center gap-3">
          {DESK.map((order) => (
            <Slip key={order} order={order} tone="mint" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {QUEUES.map((queue) => {
        const t = TONE[queue.tone];
        return (
          <div key={queue.customer} className={`flex flex-1 flex-col rounded-xl border p-4 ${t.box}`}>
            <div className={`font-mono text-[11px] uppercase tracking-[0.14em] ${t.text}`}>
              Customer {queue.customer} queue
            </div>
            <div className="flex min-h-[170px] flex-wrap items-center justify-center gap-3 py-3">
              {queue.slips.map((slip, i) => (
                <Slip
                  key={slip.order}
                  order={slip.order}
                  tone={queue.tone}
                  ticket={step >= 2 ? i + 1 : undefined}
                />
              ))}
            </div>
            <div className="flex h-7 items-center justify-center">
              <AnimatePresence>
                {step === 3 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`font-mono text-[12px] ${t.text}`}
                  >
                    Numbers 1 to {queue.slips.length}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function QueueTicketsVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={400} />;
}
