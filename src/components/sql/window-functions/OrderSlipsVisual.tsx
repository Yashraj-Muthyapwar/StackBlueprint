import { AnimatePresence, motion } from "motion/react";
import { FileText } from "lucide-react";
import { VisualPlayer } from "./VisualPlayer";

type Slip = { order: number; amount: number };
type Room = { customer: string; slips: Slip[]; tone: "mint" | "amber" };

const ROOMS: Room[] = [
  { customer: "A", tone: "mint", slips: [{ order: 101, amount: 100 }, { order: 102, amount: 200 }] },
  { customer: "B", tone: "amber", slips: [{ order: 103, amount: 150 }, { order: 104, amount: 250 }, { order: 105, amount: 100 }] },
];
const ALL_SLIPS = ROOMS.flatMap((r) => r.slips.map((s) => ({ ...s, customer: r.customer, tone: r.tone })));
const money = (n: number) => `$${n}`;
const total = (room: Room) => room.slips.reduce((sum, s) => sum + s.amount, 0);

const TONE = {
  mint: { box: "border-mint/40 bg-mint/5", text: "text-mint", chip: "border-mint/40 bg-mint/10 text-mint" },
  amber: { box: "border-amber/40 bg-amber/5", text: "text-amber", chip: "border-amber/40 bg-amber/10 text-amber" },
} as const;

const STEPS = [
  {
    label: "Five order slips on a desk",
    note: "Imagine five customers' order slips on a desk. Each slip shows an order and its amount.",
  },
  {
    label: "Separate rooms by customer_id",
    note: "You place the slips into separate rooms according to their customer_id. This is what PARTITION BY customer_id does.",
  },
  {
    label: "Each room has its own total",
    note: "SUM(amount) is calculated independently in each room. Customer A totals $300 and customer B totals $500.",
  },
  {
    label: "Every order keeps its slip",
    note: "Every order remains in the result. Each order receives the total from its own customer's partition.",
  },
] as const;

function SlipCard({ order, amount, tone, seen }: { order: number; amount: number; tone: Room["tone"]; seen?: number }) {
  const t = TONE[tone];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex w-24 flex-col items-center gap-1 rounded-lg border border-hairline bg-surface/70 px-2 py-2"
    >
      <FileText className={`size-5 ${t.text}`} />
      <div className="font-mono text-[11px] text-muted-foreground">Order {order}</div>
      <div className="font-mono text-[13px] text-foreground/90">{money(amount)}</div>
      <div className="flex h-6 items-center">
        <AnimatePresence>
          {seen !== undefined ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${t.chip}`}
            >
              {money(seen)}
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
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Desk</div>
        <div className="flex flex-wrap justify-center gap-3">
          {ALL_SLIPS.map((s) => (
            <SlipCard key={s.order} order={s.order} amount={s.amount} tone="mint" />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {ROOMS.map((room) => {
        const t = TONE[room.tone];
        return (
          <div key={room.customer} className={`flex min-h-[250px] flex-1 flex-col rounded-xl border p-4 ${t.box}`}>
            <div className={`font-mono text-[11px] uppercase tracking-[0.14em] ${t.text}`}>
              Customer {room.customer}
            </div>
            <div className="flex flex-1 flex-wrap items-center justify-center gap-3 py-3">
              {room.slips.map((s) => (
                <SlipCard
                  key={s.order}
                  order={s.order}
                  amount={s.amount}
                  tone={room.tone}
                  seen={step === 3 ? total(room) : undefined}
                />
              ))}
            </div>
            <div className="flex h-7 items-center justify-center">
              <AnimatePresence>
                {step >= 2 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`font-mono text-[12px] ${t.text}`}
                  >
                    Total: {money(total(room))}
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

export function OrderSlipsVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={430} />;
}
