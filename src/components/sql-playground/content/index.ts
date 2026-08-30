import type { Engine } from "../db/db-client";
import type { DatasetId } from "../db/datasets";
import { forEngine, type ExampleGroup } from "./types";

import { CYCLE_DEPOT_EXAMPLES } from "./cycledepot";
import { BIKE_STORE_EXAMPLES } from "./bikestore";
import { ADVENTUREWORKS_EXAMPLES } from "./adventureworks";
import { OLIST_EXAMPLES } from "./olist";
import { TPCH_EXAMPLES } from "./tpch";

const LIBRARY: Record<DatasetId, ExampleGroup[]> = {
  cycledepot: CYCLE_DEPOT_EXAMPLES,
  bikestore: BIKE_STORE_EXAMPLES,
  adventureworks: ADVENTUREWORKS_EXAMPLES,
  olist: OLIST_EXAMPLES,
  tpch: TPCH_EXAMPLES,
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
