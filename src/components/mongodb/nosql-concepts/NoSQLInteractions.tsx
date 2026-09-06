import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { AnimationControls } from "@/components/mongodb/AnimationControls";
import { catalog } from "./fixtures";

const steps = [
  {
    concept: "A record",
    title: "Start with the source rows",
    note: "These two products and their values come from Cycle Depot. We are showing four columns from products.csv.",
  },
  {
    concept: "A record",
    title: "Choose Aero Sprint Pro",
    note: "Row 7 describes one product. Keep its identity and values while changing how the record is represented.",
  },
  {
    concept: "Named fields",
    title: "Carry the name into a field",
    note: 'The name column becomes a named field: "name": "Aero Sprint Pro". The value stays the same.',
  },
  {
    concept: "Named fields",
    title: "Keep the price numeric",
    note: 'The price becomes "price": 5400. Quotes surround the field name, but not the number.',
  },
  {
    concept: "A collection",
    title: "Group the product documents",
    note: "The products collection contains two documents. Each describes one Cycle Depot product using the same verified values.",
  },
  {
    concept: "A collection",
    title: "Let an optional field vary",
    note: "This proposed view includes in_stock: 99 for Aero Sprint Pro. Omitting it from Switchback's document means unknown here, not zero. The source row still says 10.",
  },
];
const fields = ["id", "name", "price", "in_stock"] as const;
const sourceProduct = catalog.find((product) => product.id === 7)!;

function DocumentPreview({
  id,
  showStock,
  activeField,
  reduced,
}: {
  id: number;
  showStock: boolean;
  activeField?: string;
  reduced: boolean;
}) {
  const product = catalog.find((item) => item.id === id)!;
  const entries = Object.entries({
    id: product.id,
    name: product.name,
    price: product.price,
    ...(showStock ? { in_stock: product.in_stock } : {}),
  });
  return (
    <div className="min-w-0 rounded-lg border border-hairline bg-background/70 px-3 py-2 font-mono text-[11px] leading-5 sm:text-xs">
      <div className="text-muted-foreground">{"{"}</div>
      {entries.map(([field, value], index) => (
        <motion.div
          key={field}
          initial={reduced ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduced ? 0 : 0.35 }}
          className={`whitespace-pre-wrap break-words rounded px-2 ${activeField === field ? "bg-mint/15 ring-1 ring-mint/30" : ""}`}
        >
          <span className="text-violet">"{field}"</span>:{" "}
          <span className={typeof value === "number" ? "text-amber" : "text-mint"}>
            {JSON.stringify(value)}
          </span>
          {index < entries.length - 1 ? "," : ""}
        </motion.div>
      ))}
      <div className="text-muted-foreground">{"}"}</div>
    </div>
  );
}

export function CatalogWalkthrough({ caption }: { caption: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = !!useReducedMotion();
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setStep((value) => (value + 1) % steps.length), 2600);
    return () => window.clearTimeout(timer);
  }, [playing, step]);
  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);
  useEffect(() => {
    const pause = () => setPlaying(false);
    window.addEventListener("quiz-started", pause);
    return () => window.removeEventListener("quiz-started", pause);
  }, []);
  const go = (delta: number) => {
    setPlaying(false);
    setStep((value) => (value + delta + steps.length) % steps.length);
  };
  const activeField =
    step === 2 ? "name" : step === 3 ? "price" : step === 5 ? "in_stock" : undefined;
  return (
    <figure className="relative overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <figcaption className="border-b border-hairline bg-surface/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {caption}
      </figcaption>
      <div className="space-y-4 px-5 py-6 lg:px-7 lg:py-8">
        <div className="rounded-lg border border-violet/25 bg-violet/5 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-violet">
              Concept {Math.floor(step / 2) + 1} / 3
            </span>
            <h3 className="text-sm font-medium">{steps[step].concept}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{steps[step].title}</p>
        </div>
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)]">
          <div className="min-w-0 overflow-hidden rounded-lg border border-hairline">
            <div className="border-b border-hairline bg-surface-2/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Source · products table
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[10px] sm:text-[11px]">
                <thead>
                  <tr>
                    {fields.map((field) => (
                      <th
                        key={field}
                        className={`px-2 py-2 font-medium ${activeField === field ? "bg-mint/10 text-mint" : "text-muted-foreground"}`}
                      >
                        {field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catalog.map((product) => (
                    <motion.tr
                      key={product.id}
                      animate={{ opacity: step > 0 && step < 4 && product.id !== 7 ? 0.35 : 1 }}
                      transition={{ duration: reduced ? 0 : 0.35 }}
                      className={`border-t border-hairline ${step > 0 && product.id === 7 ? "bg-mint/5" : ""}`}
                    >
                      {fields.map((field) => (
                        <td
                          key={field}
                          className={`px-2 py-3 ${field === "name" ? "min-w-28" : ""} ${product.id === 7 && activeField === field ? "bg-mint/20 text-mint" : ""}`}
                        >
                          {product[field]}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-hairline px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
              Real CSV values. Prices are in USD.
            </p>
          </div>
          <div className="flex justify-center pt-2 text-mint lg:pt-20" aria-hidden="true">
            <ArrowRight className="hidden size-5 lg:block" />
            <ArrowDown className="size-5 lg:hidden" />
          </div>
          <div className="min-w-0 overflow-hidden rounded-lg border border-hairline">
            <div className="border-b border-hairline bg-surface-2/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {step < 4 ? "Document · JSON view" : "Collection · products"}
            </div>
            <div className="min-h-[290px] space-y-2 p-3">
              {step === 0 ? (
                <div className="flex min-h-64 items-center justify-center text-center text-xs leading-relaxed text-muted-foreground">
                  Press Play or Next step to follow
                  <br />a row into a document.
                </div>
              ) : (
                <>
                  <DocumentPreview
                    id={sourceProduct.id}
                    showStock={step === 5}
                    activeField={activeField}
                    reduced={reduced}
                  />
                  {step >= 4 && <DocumentPreview id={4} showStock={false} reduced={reduced} />}
                </>
              )}
            </div>
          </div>
        </div>
        <p
          role="status"
          className="min-h-20 rounded-lg border border-mint/25 bg-mint/5 px-3 py-2 text-xs leading-relaxed text-foreground sm:min-h-14"
        >
          {steps[step].note}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Proposed document representation of selected source fields. No database is changed.
        </p>
      </div>
      <AnimationControls
        step={step}
        total={steps.length}
        playing={playing}
        onReset={() => {
          setPlaying(false);
          setStep(0);
        }}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onPlayToggle={() => setPlaying((value) => !value)}
        stageForStep={(i) => Math.floor(i / 2)}
      />
    </figure>
  );
}
