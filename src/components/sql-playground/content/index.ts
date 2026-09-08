import type { Engine } from "../db/db-client";
import type { DatasetId } from "../db/datasets";
import { forEngine, type ExampleGroup } from "./types";

import { CYCLE_DEPOT_EXAMPLES } from "./cycledepot";
import { COSMETICS_48H_EXAMPLES } from "./cosmetics-48h";
import { ERGAST_EXAMPLES } from "./ergast";
import { MARVEL_EXAMPLES } from "./marvel";
import { OLIST_EXAMPLES } from "./olist";
import { SQL_LAB_EXAMPLES } from "./sql-lab";

const LIBRARY: Record<DatasetId, ExampleGroup[]> = {
  cosmetics_48h: COSMETICS_48H_EXAMPLES,
  cycledepot: CYCLE_DEPOT_EXAMPLES,
  ergast: ERGAST_EXAMPLES,
  marvel: MARVEL_EXAMPLES,
  "my-workspace": [],
  olist: OLIST_EXAMPLES,
  sql_lab: SQL_LAB_EXAMPLES,
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
