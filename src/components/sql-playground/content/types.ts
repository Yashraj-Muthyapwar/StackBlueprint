import type { Engine } from "../db/db-client";

export interface Example {
  title: string;
  note: string;
  sql: string;
  /** Restrict to one engine when the syntax is dialect-specific. */
  only?: Engine;
}

export interface ExampleGroup {
  group: string;
  blurb: string;
  items: Example[];
}

/** Drop the groups and items that do not apply to the active engine. */
export function forEngine(groups: ExampleGroup[], engine: Engine): ExampleGroup[] {
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.only || i.only === engine) }))
    .filter((g) => g.items.length > 0);
}
