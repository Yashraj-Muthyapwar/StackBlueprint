import { Suspense, lazy, type ReactNode } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { HolidayScalingVisual, PowerPlantVisual } from "./CloudVisuals";
import { EuropeExpansionVisual, RestaurantVisual, SixAdvantagesVisual } from "./BenefitsVisuals";
import { AwsServicesVisual, ShoppingArchitectureVisual, ToolboxVisual } from "./AwsIntroVisuals";
import { HotelChainVisual, MumbaiToIrelandVisual, RegionDeployVisual } from "./RegionsVisuals";
import { BankHybridVisual, DeploymentModelsVisual, HousingVisual } from "./DeploymentVisuals";
import { FoodModelsVisual, PythonAppVisual, ResponsibilityVisual } from "./ServiceModelsVisuals";
import { BlackFridayVisual, CarAnalogyVisual, WorkflowCompareVisual } from "./TraditionalVsCloudVisuals";
import { Quiz } from "@/components/lesson/Quiz";
import type { AwsSection } from "@/lessons/aws-cloud-practitioner/introduction-to-the-cloud-content";

function inline(text: string): ReactNode {
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="rounded bg-mint/10 px-1.5 py-0.5 font-mono text-[0.85em] text-mint">
          {part.slice(1, -1)}
        </code>
      );
    return part;
  });
}

const ModuleAssessment = lazy(() => import("./ModuleAssessment"));
const ModuleCheatsheet = lazy(() => import("./ModuleCheatsheet"));

export function SectionRenderer({
  section,
  onQuizActiveChange,
}: {
  section: AwsSection;
  onQuizActiveChange?: (active: boolean) => void;
}) {
  switch (section.kind) {
    case "prose":
      return (
        <section className="space-y-3">
          {section.heading ? (
            <h2 className="lesson-section-title font-semibold tracking-tight">{section.heading}</h2>
          ) : null}
          {section.body.map((p, i) => (
            <p key={i} className="lesson-prose text-muted-foreground">
              {inline(p)}
            </p>
          ))}
        </section>
      );
    case "callout": {
      const Icon = section.tone === "warn" ? AlertTriangle : Info;
      return (
        <Alert
          className={section.tone === "warn" ? "border-amber/40 bg-amber/10" : "border-violet/30 bg-violet/10"}
        >
          <Icon className="size-5" />
          <AlertTitle className="text-lg font-semibold">{section.title}</AlertTitle>
          <AlertDescription className="mt-2 text-lg leading-relaxed text-foreground">{inline(section.body)}</AlertDescription>
        </Alert>
      );
    }
    case "visual":
      switch (section.id) {
        case "power-plant":
          return <PowerPlantVisual caption={section.caption} />;
        case "holiday-scaling":
          return <HolidayScalingVisual caption={section.caption} />;
        case "car-analogy":
          return <CarAnalogyVisual caption={section.caption} />;
        case "workflow-compare":
          return <WorkflowCompareVisual caption={section.caption} />;
        case "black-friday":
          return <BlackFridayVisual caption={section.caption} />;
        case "restaurant":
          return <RestaurantVisual caption={section.caption} />;
        case "six-advantages":
          return <SixAdvantagesVisual caption={section.caption} />;
        case "europe-expansion":
          return <EuropeExpansionVisual caption={section.caption} />;
        case "food-models":
          return <FoodModelsVisual caption={section.caption} />;
        case "responsibility-stack":
          return <ResponsibilityVisual caption={section.caption} />;
        case "python-app-models":
          return <PythonAppVisual caption={section.caption} />;
        case "housing-models":
          return <HousingVisual caption={section.caption} />;
        case "deployment-models":
          return <DeploymentModelsVisual caption={section.caption} />;
        case "bank-hybrid":
          return <BankHybridVisual caption={section.caption} />;
        case "hotel-chain":
          return <HotelChainVisual caption={section.caption} />;
        case "region-deploy":
          return <RegionDeployVisual caption={section.caption} />;
        case "mumbai-ireland":
          return <MumbaiToIrelandVisual caption={section.caption} />;
        case "aws-toolbox":
          return <ToolboxVisual caption={section.caption} />;
        case "aws-services":
          return <AwsServicesVisual caption={section.caption} />;
        case "shopping-architecture":
          return <ShoppingArchitectureVisual caption={section.caption} />;
      }
      return null;
    case "assessment":
      return (
        <ClientOnly fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2/40" />}>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2/40" />}>
            <ModuleAssessment />
          </Suspense>
        </ClientOnly>
      );
    case "cheatsheet":
      return (
        <ClientOnly fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2/40" />}>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2/40" />}>
            <ModuleCheatsheet />
          </Suspense>
        </ClientOnly>
      );
    case "list":
      return (
        <section className="space-y-3">
          {section.heading ? (
            <h2 className="lesson-section-title font-semibold tracking-tight">{section.heading}</h2>
          ) : null}
          {section.lead ? <p className="lesson-prose text-muted-foreground">{inline(section.lead)}</p> : null}
          <ul className="space-y-2">
            {section.items.map((item) => (
              <li key={item} className="lesson-prose flex gap-2.5 text-muted-foreground">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-mint" />
                <span>{inline(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    case "table":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
          <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {section.caption}
          </figcaption>
          <Table>
            <TableHeader className="bg-surface-2">
              <TableRow>
                {section.headers.map((h) => (
                  <TableHead key={h} className="px-4 font-mono text-[11px] uppercase tracking-[0.14em]">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {section.rows.map((row) => (
                <TableRow key={row[0]}>
                  {row.map((cell, i) => (
                    <TableCell key={i} className="px-4 py-2.5 align-top">
                      {inline(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </figure>
      );
    case "takeaways":
      return (
        <section className="rounded-xl border border-mint/30 bg-mint/5 p-5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">Key Takeaways</h2>
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
