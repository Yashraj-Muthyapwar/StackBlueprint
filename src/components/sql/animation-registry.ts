import { aggrStages, cubeStages, grpStages, havingStages } from "./querying/aggregation";
import { introHow, introQuerying, introStorage, introTypes, introWhatIs } from "./foundations/database-introduction";
import { algosStages, semiStages, selfStages, vennStages } from "./querying/joins";
import { pipelineStages } from "./querying-fundamentals/logical-query-order";
import { introSqlClientServer } from "./foundations/client-server";
import { commentsStages, calculationAliasStages } from "./querying-fundamentals/sql-basics-comments-calculations-aliases";
import { operatorStages } from "./querying-fundamentals/sql-operators";
import { whereFilteringStages } from "./querying-fundamentals/where-filters";
import { caseWhenStages } from "./querying-fundamentals/case-when";
import { distinctOrderLimitStages } from "./querying-fundamentals/distinct-order-by-and-limit";
import { queryStructureStages } from "./querying-fundamentals/query-structure";
import { distinctStages } from "./querying-fundamentals/select-distinct";
import { commandsMapStages } from "./foundations/sql-command-families";
import { existsStages, corrStages, scalarStages } from "./querying/subqueries";
import { fkStages, tableBuildStages, typeStages } from "./foundations/table-design";
import { fkDeepStages, normStages, pkStages, tableAnatomyStages } from "./foundations/relational-design";
import { setopsStages } from "./querying/set-operations";
import { boolStages, rangeStages } from "./querying/where-filters";
import { nullThreeValuedLogicStages } from "./querying/null-three-valued-logic";
import { patternMatchingStages } from "./querying/pattern-matching";
import { sargabilityStages } from "./querying/sargability";
import { projStages } from "./querying-fundamentals/your-first-query";
import { concatSubstringStages } from "./string-functions/concat-substring";

/** Maps stable lesson variant IDs to their lesson-scoped animation stages. */
export const STAGES_REGISTRY = {
  "q-bool": boolStages, "q-range": rangeStages, "q-like": patternMatchingStages, "q-null3vl": nullThreeValuedLogicStages, "q-sargability": sargabilityStages,
  "q-aggr": aggrStages, "q-grpby": grpStages, "q-having": havingStages, "q-cube": cubeStages,
  "q-venn": vennStages, "q-self": selfStages, "q-semianti": semiStages, "q-algos": algosStages,
  "q-scalar": scalarStages, "q-corr": corrStages, "q-existsin": existsStages, "q-setops": setopsStages,
  pipeline: pipelineStages, "select-projection": projStages, "table-build": tableBuildStages,
  "foreign-key": fkStages, "null-truth": nullThreeValuedLogicStages, "type-sizes": typeStages,
  "where-filter": boolStages, "group-by-agg": grpStages, "join-types": vennStages, "set-ops": setopsStages,
  "table-anatomy": tableAnatomyStages, "pk-anatomy": pkStages, "fk-deep": fkDeepStages, normalization: normStages,
  "intro-what-is-db": introWhatIs, "intro-db-types": introTypes, "intro-how-db-works": introHow,
  "intro-querying": introQuerying, "intro-storage": introStorage, "intro-sql-client-server": introSqlClientServer,
  "commands-map": commandsMapStages, "query-structure": queryStructureStages, "select-distinct": distinctStages,
  "distinct-order-limit": distinctOrderLimitStages, "sql-comments": commentsStages,
  "sql-calculations-aliases": calculationAliasStages, "sql-operators": operatorStages,
  "where-filtering": whereFilteringStages,
  "case-when": caseWhenStages,
  "q-concat-substring": concatSubstringStages,
} as const;

export type AnyVariant = keyof typeof STAGES_REGISTRY;
