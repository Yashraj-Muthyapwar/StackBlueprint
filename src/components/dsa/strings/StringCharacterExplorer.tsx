import { useMemo, useState } from "react";

const samples = ["stack", "python", "level"];

export function StringCharacterExplorer() {
  const [text, setText] = useState("stack");
  const [selectedIndex, setSelectedIndex] = useState(2);
  const safeIndex = Math.min(selectedIndex, Math.max(0, text.length - 1));
  const selectedCharacter = text[safeIndex] ?? "";
  const negativeIndex = safeIndex - text.length;
  const characters = useMemo(() => text.split(""), [text]);

  const chooseText = (next: string) => {
    setText(next);
    setSelectedIndex(Math.min(safeIndex, next.length - 1));
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="border-b border-hairline bg-surface-2/40 px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Interactive character explorer
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a sample, then select a character to read it with positive and negative indices.
        </p>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {samples.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => chooseText(sample)}
              className={`rounded-lg border px-3 py-2 font-mono text-sm ${text === sample ? "border-mint bg-mint/10 text-mint" : "border-hairline bg-background text-muted-foreground hover:text-foreground"}`}
            >
              {sample}
            </button>
          ))}
        </div>
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-2">
            {characters.map((character, index) => (
              <button
                key={`${character}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`min-w-20 rounded-xl border px-3 py-3 text-center transition-colors ${safeIndex === index ? "border-mint bg-mint/10 shadow-sm" : "border-hairline bg-background hover:border-mint/50"}`}
              >
                <span className="block font-mono text-xl font-semibold text-foreground">
                  {character}
                </span>
                <span className="mt-2 block font-mono text-[11px] text-muted-foreground">
                  [{index}]
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-mint/30 bg-mint/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              From the start
            </p>
            <p className="mt-2 font-mono text-lg text-foreground">
              <span className="text-mint">text[{safeIndex}]</span> = &quot;{selectedCharacter}&quot;
            </p>
          </div>
          <div className="rounded-xl border border-hairline bg-background p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              From the end
            </p>
            <p className="mt-2 font-mono text-lg text-foreground">
              <span className="text-violet">text[{negativeIndex}]</span> = &quot;{selectedCharacter}
              &quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
