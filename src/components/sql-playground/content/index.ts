import type { Engine } from "../db/db-client";
import type { DatasetId } from "../db/datasets";
import { forEngine, type ExampleGroup } from "./types";

import { CYCLE_DEPOT_EXAMPLES } from "./cycledepot";
import { ERGAST_EXAMPLES } from "./ergast";
import { OLIST_EXAMPLES } from "./olist";

const LIBRARY: Record<DatasetId, ExampleGroup[]> = {
  cycledepot: CYCLE_DEPOT_EXAMPLES,
  ergast: ERGAST_EXAMPLES,
  olist: OLIST_EXAMPLES,
};

/** Queries for this dataset, minus anything the active engine cannot run. */
export function examplesFor(dataset: DatasetId, engine: Engine): ExampleGroup[] {
  return forEngine(LIBRARY[dataset] ?? [], engine);
}

/** The query the editor opens with for a dataset. */
export function starterFor(dataset: DatasetId, engine: Engine): string {
  const groups = examplesFor(dataset, engine);
  return groups[0]?.items[0]?.sql ?? "SELECT 1;";
}

export type { Example, ExampleGroup } from "./types";
