import { motion } from "motion/react";
import { VisualPlayer } from "../window-functions/VisualPlayer";

type Order = { id: number; amount: number };
type Customer = { name: string; orders: Order[]; total: number; average: number; count: number };

const CUSTOMERS: Customer[] = [
  {
    name: "Customer A",
    orders: [
      { id: 101, amount: 100 },
      { id: 102, amount: 200 },
      { id: 103, amount: 300 },
    ],
    total: 600,
    average: 200,
    count: 3,
  },
  {
    name: "Customer B",
    orders: [
      { id: 104, amount: 400 },
      { id: 105, amount: 600 },
    ],
    total: 1000,
    average: 500,
    count: 2,
  },
];

const STEPS = [
  { label: "Orders by customer", note: "Five orders belong to two customers. Each order shows only its own amount." },
  { label: "A report card per customer", note: "Each customer has a report card with three statistics: total spending, average order amount, and number of orders." },
  { label: "Every order shows the card", note: "Each order keeps its own amount and also displays the statistics of its customer. Nothing is compressed into one row." },
] as const;

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

function Card({ c, step }: { c: Customer; step: number }) {
  const stats: [string, string][] = [
    ["Total", fmt(c.total)],
    ["Average", fmt(c.average)],
    ["Count", String(c.count)],
  ];
  return (
    <motion.div
      initial={false}
      animate={{ opacity: step >= 1 ? 1 : 0.25 }}
      className="mb-3 grid grid-cols-3 gap-2 rounded-lg border border-mint/40 bg-mint/10 p-2"
    >
      {stats.map(([k, v]) => (
        <div key={k} className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{k}</div>
          <div className="font-mono text-[13px] font-semibold text-mint">{step >= 1 ? v : "?"}</div>
        </div>
      ))}
    </motion.div>
  );
}

function Body({ step }: { step: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CUSTOMERS.map((c) => (
        <div key={c.name} className="rounded-xl border border-dashed border-hairline p-4">
          <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>{c.name}</span>
            <span>{c.orders.length} orders</span>
          </div>
          <Card c={c} step={step} />
          <div className="flex flex-col gap-2">
            {c.orders.map((o) => (
              <div
                key={o.id}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 font-mono text-[12.5px] ${
                  step >= 2 ? "border-mint/40 bg-mint/5 text-foreground" : "border-hairline bg-surface/70 text-foreground"
                }`}
              >
                <span>Order {o.id}</span>
                <span className="font-semibold">{fmt(o.amount)}</span>
                {step >= 2 ? (
                  <span className="text-[11px] text-mint">
                    {fmt(c.total)} · {fmt(c.average)} · {c.count}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportCardVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={420} />;
}
