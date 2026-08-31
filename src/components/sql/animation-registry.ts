import { aggrStages, cubeStages, grpStages, havingStages } from "./querying/aggregation";
import { introHow, introQuerying, introStorage, introTypes, introWhatIs } from "./foundations/database-introduction";
import { algosStages, semiStages, selfStages, vennStages } from "./querying/joins";
import { pipelineStages } from "./querying-fundamentals/logical-query-order";
import { introSqlClientServer } from "./foundations/client-server";
import { commentsStages, calculationAliasStages } from "./querying-fundamentals/sql-basics-comments-calculations-aliases";
import { operatorStages } from "./querying-fundamentals/sql-operators";
import { whereFilteringStages } from "./querying-fundamentals/where-filters";
import { offsetStages } from "./querying-fundamentals/order-by-and-limit";
import { queryStructureStages } from "./querying-fundamentals/query-structure";
import { distinctStages } from "./querying-fundamentals/select-distinct";
import { commandsMapStages } from "./foundations/sql-command-families";
import { existsStages, corrStages, scalarStages } from "./querying/subqueries";
import { fkStages, tableBuildStages, typeStages } from "./foundations/table-design";
import { fkDeepStages, normStages, pkStages, tableAnatomyStages } from "./foundations/relational-design";
import { setopsStages } from "./querying/set-operations";
import { boolStages, likeStages, null3vlStages, rangeStages } from "./querying/where-filters";
import { projStages } from "./querying-fundamentals/your-first-query";

/** Maps stable lesson variant IDs to their lesson-scoped animation stages. */
export const STAGES_REGISTRY = {
  "q-bool": boolStages, "q-range": rangeStages, "q-like": likeStages, "q-null3vl": null3vlStages,
  "q-aggr": aggrStages, "q-grpby": grpStages, "q-having": havingStages, "q-cube": cubeStages,
  "q-venn": vennStages, "q-self": selfStages, "q-semianti": semiStages, "q-algos": algosStages,
  "q-scalar": scalarStages, "q-corr": corrStages, "q-existsin": existsStages, "q-setops": setopsStages,
  pipeline: pipelineStages, "select-projection": projStages, "table-build": tableBuildStages,
  "foreign-key": fkStages, "null-truth": null3vlStages, "type-sizes": typeStages,
  "where-filter": boolStages, "group-by-agg": grpStages, "join-types": vennStages, "set-ops": setopsStages,
  "table-anatomy": tableAnatomyStages, "pk-anatomy": pkStages, "fk-deep": fkDeepStages, normalization: normStages,
  "intro-what-is-db": introWhatIs, "intro-db-types": introTypes, "intro-how-db-works": introHow,
  "intro-querying": introQuerying, "intro-storage": introStorage, "intro-sql-client-server": introSqlClientServer,
  "commands-map": commandsMapStages, "query-structure": queryStructureStages, "select-distinct": distinctStages,
  "offset-pagination": offsetStages, "sql-comments": commentsStages,
  "sql-calculations-aliases": calculationAliasStages, "sql-operators": operatorStages,
  "where-filtering": whereFilteringStages,
} as const;

export type AnyVariant = keyof typeof STAGES_REGISTRY;
