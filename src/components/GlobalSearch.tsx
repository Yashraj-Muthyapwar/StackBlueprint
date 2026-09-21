import * as React from "react";
import { Search } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { buildSearchItems, searchItems, type SearchItem } from "@/lib/lesson-search";

const ALL = buildSearchItems();

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const results = React.useMemo(() => searchItems(ALL, query), [query]);
  const groups = React.useMemo(() => {
    const m = new Map<string, SearchItem[]>();
    results.forEach((r) => (m.get(r.track) ?? m.set(r.track, []).get(r.track)!).push(r));
    return [...m.entries()];
  }, [results]);

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    router.navigate({ to: path });
  };
  const [isMac, setIsMac] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    const platform = (navigator as any).userAgentData?.platform || navigator.platform || "";
    setIsMac(/mac|iphone|ipad/i.test(platform));
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
      >
        <Search className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors md:flex border-hairline bg-background text-muted-foreground hover:bg-accent hover:text-foreground dark:border-mint/20 dark:bg-mint/10 dark:text-mint/90 dark:hover:bg-mint/20 dark:hover:text-mint"
      >
        <Search className="size-4" />
        <span>Search…</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium dark:bg-mint/20 dark:border-mint/30 dark:text-mint">
          <span className={mounted ? "opacity-100" : "opacity-0"}>{isMac ? "⌘ K" : "Ctrl K"}</span>
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Search lessons and topics…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {query.trim() === "" ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Start typing to search every lesson and topic.
            </div>
          ) : (
            <CommandEmpty>No results for “{query}”.</CommandEmpty>
          )}
          {groups.map(([track, items]) => (
            <CommandGroup key={track} heading={track}>
              {items.map((item) => (
                <CommandItem key={item.id} value={item.id} onSelect={() => go(item.path)}>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.context}
                      {item.kind === "topic" ? " · topic" : ""}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
