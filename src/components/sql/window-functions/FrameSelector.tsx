import { useState } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";

type Txn = { id: number; date: string; amount: number };

const TXNS: Txn[] = [
  { id: 1, date: "Jan 1", amount: 100 },
  { id: 2, date: "Jan 2", amount: 200 },
  { id: 3, date: "Jan 2", amount: 50 },
  { id: 4, date: "Jan 3", amount: 150 },
];

const order = ["Jan 1", "Jan 2", "Jan 3"];
const sameOrBefore = (t: Txn, current: Txn) => order.indexOf(t.date) <= order.indexOf(current.date);

function Selector() {
  const [selected, setSelected] = useState(2);
  const current = TXNS.find((t) => t.id === selected)!;
  const frame = TXNS.filter((t) => sameOrBefore(t, current));
  const total = frame.reduce((sum, t) => sum + t.amount, 0);
  const peers = TXNS.filter((t) => t.date === current.date);

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Default PostgreSQL frame with ORDER BY txn_date
      </p>
      <p className="lesson-supporting text-foreground/85">
        Select the current transaction to see which rows contribute to its total.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="tablist" aria-label="Current transaction">
        {TXNS.map((t) => {
          const included = frame.some((f) => f.id === t.id);
          const isCurrent = t.id === selected;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              onClick={() => setSelected(t.id)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-3 transition-colors ${
                isCurrent
                  ? "border-mint/60 bg-mint/15 text-mint"
                  : included
                    ? "border-violet/50 bg-violet/10 text-foreground"
                    : "border-hairline bg-surface text-muted-foreground opacity-60"
              }`}
            >
              <span className="font-mono text-[11px] uppercase tracking-wider">Txn {t.id}</span>
              <span className="font-mono text-[12px]">{t.date}</span>
              <span className="font-mono text-[14px]">${t.amount}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-mint/40 bg-mint/5 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mint">Transaction {current.id}</p>
        <p className="mt-2 font-mono text-[13px] text-foreground/90">
          Included amounts: {frame.map((t) => t.amount).join(" + ")}
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Calculated total</p>
        <p className="font-mono text-2xl text-mint">${total}</p>
      </div>

      <p className="lesson-supporting min-h-[3.5rem] text-foreground/85">
        {peers.length > 1
          ? "Both January 2 transactions are peers. They are included together, even when only one is the current row."
          : current.date === "Jan 1"
            ? "Transaction 1 is alone on January 1, so its frame holds only itself."
            : "Transaction 4 is alone on January 3. Its frame holds every earlier row and itself."}
      </p>
    </div>
  );
}

export function FrameSelector({ caption }: { caption?: string }) {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
      {caption ? (
        <figcaption className="border-b border-hairline bg-surface/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
      <ClientOnly fallback={<div className="h-80 animate-pulse bg-surface-2/40" />}>
        <Selector />
      </ClientOnly>
    </figure>
  );
}
