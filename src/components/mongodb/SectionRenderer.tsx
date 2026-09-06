import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Quiz } from "@/components/lesson/Quiz";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { MongoSection } from "@/lessons/mongodb/nosql-concepts-content";
import {
  DocumentLab,
  DocumentPractice,
  ModelExplorer,
} from "@/components/mongodb/NoSQLInteractions";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    ) : part.startsWith("`") && part.endsWith("`") ? (
      <code key={index} className="rounded bg-mint/10 px-1 font-mono text-[0.85em] text-mint">
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export function SectionRenderer({
  section,
  onQuizActiveChange,
}: {
  section: MongoSection;
  onQuizActiveChange?: (active: boolean) => void;
}) {
  if (section.kind === "callout") {
    const Icon = section.tone === "warn" ? AlertTriangle : Info;
    return (
      <Alert
        className={
          section.tone === "warn"
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-mint/30 bg-mint/5"
        }
      >
        <Icon className="size-4" />
        <AlertTitle>{section.title}</AlertTitle>
        <AlertDescription className="mt-2 leading-relaxed">{inline(section.body)}</AlertDescription>
      </Alert>
    );
  }
  const heading = (
    <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">{section.heading}</h2>
  );
  switch (section.kind) {
    case "prose":
      return (
        <section className="space-y-3">
          {heading}
          {section.body.map((paragraph, index) => (
            <p key={index} className="leading-relaxed text-muted-foreground lg:text-lg">
              {inline(paragraph)}
            </p>
          ))}
        </section>
      );
    case "table":
      return (
        <section className="space-y-4">
          {heading}
          <div className="rounded-xl border border-hairline">
            <Table>
              <TableHeader>
                <TableRow>
                  {section.headers.map((header) => (
                    <TableHead key={header} className="min-w-36">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.rows.map((row) => (
                  <TableRow key={row[0]}>
                    {row.map((cell, index) => (
                      <TableCell
                        key={index}
                        className={
                          index === 0
                            ? "align-top font-medium"
                            : "min-w-56 align-top leading-relaxed text-muted-foreground"
                        }
                      >
                        {inline(cell)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      );
    case "model-explorer":
      return (
        <section className="space-y-4">
          {heading}
          <ModelExplorer />
        </section>
      );
    case "document-lab":
      return (
        <section className="space-y-4">
          {heading}
          <DocumentLab />
        </section>
      );
    case "document-practice":
      return (
        <section className="space-y-4">
          {heading}
          <DocumentPractice />
        </section>
      );
    case "sources":
      return (
        <section className="space-y-3">
          {heading}
          <ul className="space-y-2 text-sm">
            {section.links.map((link) => (
              <li key={link.href}>
                <a
                  className="text-mint underline underline-offset-4 hover:text-foreground"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      );
    case "takeaways":
      return (
        <section className="space-y-4 rounded-xl border border-mint/30 bg-mint/5 p-5">
          {heading}
          <ul className="space-y-3">
            {section.items.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>{inline(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    case "quiz":
      return (
        <section className="space-y-4">
          {heading}
          <Quiz data={{ questions: section.questions }} onActiveChange={onQuizActiveChange} />
        </section>
      );
  }
}
