import type { ReactNode } from "react";
import { ZoomableImage } from "@/components/ui/zoomable-image";
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
import { CatalogWalkthrough } from "@/components/mongodb/nosql-concepts/NoSQLInteractions";

function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic text-foreground">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-mint/10 text-mint px-1.5 py-0.5 font-mono text-[0.85em] font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function SectionRenderer({
  section,
  onQuizActiveChange,
}: {
  section: MongoSection;
  onQuizActiveChange?: (active: boolean) => void;
}) {
  switch (section.kind) {
    case "image":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
          <div className="w-full flex justify-center bg-surface-2/30 py-4">
            <ZoomableImage
              src={section.src}
              alt={section.alt}
              className="h-auto w-full max-w-full object-contain px-4 lg:max-w-4xl"
            />
          </div>
          <figcaption className="border-t border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {section.caption}
          </figcaption>
        </figure>
      );
    case "prose":
      return (
        <section className="space-y-3">
          <h2 className="lesson-section-title font-semibold tracking-tight">{section.heading}</h2>
          {section.body.map((paragraph, index) => (
            <p key={index} className="lesson-prose text-muted-foreground">
              {inline(paragraph)}
            </p>
          ))}
        </section>
      );
    case "catalog-walkthrough":
      return <CatalogWalkthrough caption={section.caption} />;
    case "table":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
          <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {section.caption}
          </figcaption>
          <Table className="min-w-[44rem]">
            <TableHeader className="bg-surface-2">
              <TableRow>
                {section.headers.map((header) => (
                  <TableHead
                    key={header}
                    className="px-4 font-mono text-[11px] uppercase tracking-[0.14em]"
                  >
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
                      className={`px-4 py-2.5 align-top ${index === 0 ? "font-medium" : "text-muted-foreground"}`}
                    >
                      {inline(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </figure>
      );
    case "callout": {
      const Icon = section.tone === "warn" ? AlertTriangle : Info;
      return (
        <Alert
          className={
            section.tone === "warn"
              ? "border-amber/40 bg-amber/10"
              : "border-violet/30 bg-violet/10"
          }
        >
          <Icon className="size-4" />
          <AlertTitle>{section.title}</AlertTitle>
          <AlertDescription className="mt-2 leading-relaxed">
            {inline(section.body)}
          </AlertDescription>
        </Alert>
      );
    }
    case "takeaways":
      return (
        <section className="rounded-xl border border-mint/30 bg-mint/5 p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">
            Key Takeaways
          </h2>
          <ul className="mt-3 space-y-2">
            {section.items.map((item) => (
              <li key={item} className="lesson-supporting flex gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>{inline(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    case "quiz":
      return <Quiz data={{ questions: section.questions }} onActiveChange={onQuizActiveChange} />;
  }
}
