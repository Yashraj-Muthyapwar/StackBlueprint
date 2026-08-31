import type { Row, Stage, StageStep, RowState, Tone } from "@/components/lesson/MultiStage";
import { bucketPanel, pass, r, sidePanel, st } from "../animation-shared";

// ---------- commands-map: visual tree of SQL command families ----------
type CmdNode = { key: string; verbs: string[]; tone: Tone; desc: string };
const CMD_FAMILIES: CmdNode[] = [
  {
    key: "DDL",
    tone: "violet",
    desc: "Data Definition — schema/structure",
    verbs: ["CREATE", "ALTER", "DROP", "TRUNCATE", "RENAME"],
  },
  {
    key: "DML",
    tone: "mint",
    desc: "Data Manipulation — rows in tables",
    verbs: ["INSERT", "UPDATE", "DELETE", "MERGE"],
  },
  { key: "DQL", tone: "amber", desc: "Data Query — pure reads", verbs: ["SELECT"] },
  { key: "DCL", tone: "rose", desc: "Data Control — permissions", verbs: ["GRANT", "REVOKE"] },
  {
    key: "TCL",
    tone: "neutral",
    desc: "Transaction Control — atomic units",
    verbs: ["BEGIN", "COMMIT", "ROLLBACK", "SAVEPOINT"],
  },
];

const toneRing: Record<Tone, string> = {
  mint: "border-mint/50 bg-mint/10 text-mint",
  rose: "border-rose/50 bg-rose/10 text-rose",
  amber: "border-amber/50 bg-amber/10 text-amber",
  violet: "border-violet/50 bg-violet/10 text-violet",
  neutral: "border-hairline bg-surface-2/60 text-foreground/80",
};

const CommandsMap = ({ active }: { active: string | null }) => (
  <div className="rounded-lg border border-hairline bg-slate-50 dark:bg-surface-2/30 p-4 shadow-sm">
    <div className="mx-auto mb-3 w-fit rounded-md border border-mint/40 bg-mint/10 px-3 py-1 text-center font-mono text-[12px] text-mint shadow-sm">
      SQL Commands
    </div>
    <div className="grid grid-cols-5 gap-2">
      {CMD_FAMILIES.map((f) => {
        const isActive = active === f.key || active === "all";
        const dim = active && active !== "all" && active !== f.key;
        return (
          <div key={f.key} className={`transition-opacity ${dim ? "opacity-30" : "opacity-100"}`}>
            <div
              className={`rounded-md border px-2 py-1 text-center font-mono text-[11px] shadow-sm ${isActive ? toneRing[f.tone] : "border-hairline bg-white dark:bg-surface text-muted-foreground"}`}
            >
              {f.key}
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {f.verbs.map((v) => (
                <div
                  key={v}
                  className={`rounded border px-1.5 py-0.5 text-center font-mono text-[10.5px] ${isActive ? "border-mint/30 bg-mint/5 text-foreground/90" : "border-hairline/60 bg-surface text-muted-foreground"}`}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    {active && active !== "all" ? (
      <div className="mt-3 rounded-md border border-hairline bg-surface px-3 py-2 font-mono text-[11.5px] text-foreground/85">
        <span className="text-mint">{active}</span> —{" "}
        {CMD_FAMILIES.find((f) => f.key === active)?.desc}
      </div>
    ) : null}
  </div>
);

export const commandsMapStages: Stage[] = [
  {
    name: "All five families at a glance",
    blurb: "Every SQL statement belongs to exactly one",
    sql: ["-- SQL = DDL + DML + DQL + DCL + TCL"],
    steps: [
      st(
        [0],
        "kept",
        "Five families. Each has a different blast radius and is granted to different roles in production.",
        { side: <CommandsMap active="all" />, noteTone: "violet" },
      ),
    ],
  },
  {
    name: "DDL — Data Definition",
    sql: [
      "CREATE TABLE products (",
      "  id BIGSERIAL PRIMARY KEY,",
      "  name TEXT NOT NULL",
      ");",
      "ALTER  TABLE products ADD COLUMN sku TEXT;",
      "DROP   TABLE products;",
    ],
    steps: [
      st(
        [0, 1, 2, 3],
        "kept",
        "CREATE builds the shape. ALTER changes it. DROP removes it. In most engines DDL is auto-committed — DROP is final the instant it returns.",
        { side: <CommandsMap active="DDL" />, noteTone: "violet" },
      ),
    ],
  },
  {
    name: "DML — Data Manipulation",
    sql: [
      "INSERT INTO products (name) VALUES ('Pen');",
      "UPDATE products SET name = 'Gel Pen' WHERE id = 1;",
      "DELETE FROM products WHERE id = 1;",
    ],
    steps: [
      st(
        [0, 1, 2],
        "kept",
        "DML moves rows in and out. Always transactional — wrap in BEGIN / COMMIT so you can ROLLBACK on mistakes.",
        { side: <CommandsMap active="DML" />, noteTone: "mint" },
      ),
    ],
  },
  {
    name: "DQL — Data Query",
    sql: [
      "SELECT id, name, price",
      "FROM   products",
      "WHERE  price < 50",
      "ORDER  BY price DESC;",
    ],
    steps: [
      st(
        [0, 1, 2, 3],
        "kept",
        "DQL is read-only. The safest permission you can grant — give analytics roles DQL and nothing else.",
        { side: <CommandsMap active="DQL" />, noteTone: "amber" },
      ),
    ],
  },
  {
    name: "DCL — Data Control",
    sql: [
      "GRANT  SELECT, INSERT ON products TO app_user;",
      "REVOKE DELETE ON products FROM app_user;",
    ],
    steps: [
      st(
        [0, 1],
        "kept",
        "DCL controls WHO can do WHAT. Usually managed by DBAs / migrations, never by application code.",
        { side: <CommandsMap active="DCL" />, noteTone: "rose" },
      ),
    ],
  },
  {
    name: "TCL — Transaction Control",
    sql: [
      "BEGIN;",
      "  UPDATE accounts SET balance = balance - 100 WHERE id = 1;",
      "  SAVEPOINT after_debit;",
      "  UPDATE accounts SET balance = balance + 100 WHERE id = 2;",
      "COMMIT;",
    ],
    steps: [
      st(
        [0, 1, 2, 3, 4],
        "kept",
        "TCL bundles statements into an atomic unit. SAVEPOINT lets you roll back a slice without losing the whole transaction.",
        { side: <CommandsMap active="TCL" />, noteTone: "neutral" },
      ),
    ],
  },
];
