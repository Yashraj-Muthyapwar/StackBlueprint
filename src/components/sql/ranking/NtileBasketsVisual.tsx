import { motion } from "motion/react";
import { ShoppingBasket } from "lucide-react";
import { VisualPlayer } from "../window-functions/VisualPlayer";

type Customer = { id: string; spent: number };

const CUSTOMERS: Customer[] = [
  { id: "A", spent: 1000 },
  { id: "B", spent: 900 },
  { id: "C", spent: 800 },
  { id: "D", spent: 700 },
  { id: "E", spent: 600 },
  { id: "F", spent: 500 },
  { id: "G", spent: 400 },
  { id: "H", spent: 300 },
];
const MIXED: Customer[] = ["D", "G", "A", "F", "C", "H", "B", "E"].map((id) => CUSTOMERS.find((c) => c.id === id)!);
const LABELS = ["Highest spending", "Next group", "Next group", "Lowest spending"];

const STEPS = [
  { label: "Eight customers", note: "You have eight customers with different total spending." },
  { label: "Sort by spending", note: "Sort all eight customers from highest spending to lowest spending." },
  { label: "Four baskets", note: "Place the sorted customers into four baskets, with two customers in each basket." },
  {
    label: "Position, not amount",
    note: "NTILE() groups rows by their ordered positions. It does not group them by equal numerical ranges.",
  },
] as const;

function Chip({ customer }: { customer: Customer }) {
  return (
    <motion.div
      layout
      transition={{ duration: 0.35 }}
      className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-surface/70 px-3 py-1.5 font-mono text-[12.5px]"
    >
      <span className="text-foreground">{customer.id}</span>
      <span className="text-foreground/80">${customer.spent.toLocaleString("en-US")}</span>
    </motion.div>
  );
}

function Body({ step }: { step: number }) {
  if (step < 2) {
    const list = step === 0 ? MIXED : CUSTOMERS;
    return (
      <div className="rounded-xl border border-dashed border-hairline p-4">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {step === 0 ? "Customers" : "Sorted by total_spent DESC"}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {list.map((c) => (
            <Chip key={c.id} customer={c} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[0, 1, 2, 3].map((b) => (
        <div
          key={b}
          className={`flex flex-col gap-2 rounded-xl border p-3 ${b % 2 === 0 ? "border-mint/40 bg-mint/5" : "border-amber/40 bg-amber/5"}`}
        >
          <div className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] ${b % 2 === 0 ? "text-mint" : "text-amber"}`}>
            <ShoppingBasket className="size-4" />
            Bucket {b + 1}
          </div>
          {CUSTOMERS.slice(b * 2, b * 2 + 2).map((c) => (
            <Chip key={c.id} customer={c} />
          ))}
          <div className="font-mono text-[11px] text-muted-foreground">{LABELS[b]}</div>
        </div>
      ))}
    </div>
  );
}

export function NtileBasketsVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={420} />;
}
