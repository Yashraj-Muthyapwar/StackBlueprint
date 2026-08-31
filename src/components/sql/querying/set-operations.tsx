import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ----- q-setops: UNION ALL, UNION, INTERSECT, EXCEPT -----
const A_SET: Row[] = [r("a1", 1, "alpha"), r("a2", 2, "beta"), r("a3", 3, "gamma")];
const B_SET: Row[] = [r("b1", 2, "beta"), r("b2", 3, "gamma"), r("b3", 4, "delta")];

export const setopsStages: Stage[] = [
  {
    name: "UNION ALL — append, no dedup",
    sql: ["SELECT id, name FROM a", "UNION ALL", "SELECT id, name FROM b"],
    table: { name: "result", cols: ["id", "name"], rows: [...A_SET, ...B_SET] },
    steps: [
      st(
        [1],
        "added",
        "Cheapest set op — pure stream-append. Use whenever you KNOW inputs are disjoint, or when duplicates are meaningful.",
        { noteTone: "mint" },
      ),
    ],
  },
  {
    name: "UNION — append + deduplicate",
    sql: ["SELECT id, name FROM a", "UNION", "SELECT id, name FROM b"],
    table: {
      name: "result",
      cols: ["id", "name"],
      rows: [r("a1", 1, "alpha"), r("a2", 2, "beta"), r("a3", 3, "gamma"), r("b3", 4, "delta")],
    },
    steps: [
      st(
        [1],
        "added",
        "Implicit DISTINCT — hash or sort dedup. Adds O(N) memory and may spill. Don't pay that cost if you don't need it.",
        { noteTone: "amber" },
      ),
    ],
  },
  {
    name: "INTERSECT — rows in BOTH",
    sql: ["SELECT id, name FROM a", "INTERSECT", "SELECT id, name FROM b"],
    table: {
      name: "result",
      cols: ["id", "name"],
      rows: [r("i1", 2, "beta"), r("i2", 3, "gamma")],
    },
    steps: [st([1], "added", "Set intersection. NULLs compare equal here (unlike normal = NULL).")],
  },
  {
    name: "EXCEPT — rows in A but not B",
    sql: ["SELECT id, name FROM a", "EXCEPT", "SELECT id, name FROM b"],
    table: { name: "result", cols: ["id", "name"], rows: [r("e1", 1, "alpha")] },
    steps: [
      st(
        [1],
        "added",
        "Anti-set. Equivalent to NOT EXISTS but operates on whole rows. Use for diff reports.",
      ),
    ],
  },
];
