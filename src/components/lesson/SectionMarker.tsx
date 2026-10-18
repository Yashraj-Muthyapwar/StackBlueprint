/** Numbered section marker such as "1 · Why"; it also names the section in the table of contents. */
export function SectionMarker({ label }: { label: string }) {
  const match = label.match(/^(\d+)\s*·\s*(.+)$/);
  return (
    <div className="!mb-2 flex items-center gap-3">
      {match ? (
        <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-mint/15 px-2 font-mono text-sm font-bold text-mint">
          {match[1].padStart(2, "0")}
        </span>
      ) : null}
      <span className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-mint sm:text-base">
        {match ? match[2] : label}
      </span>
      <span className="h-px flex-1 bg-mint/20" />
    </div>
  );
}
