import { Suspense, lazy, useState, type ReactNode } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { AlertTriangle, Check, CheckCircle2, Copy, Info } from "lucide-react";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { ApartmentSharedVisual, SharedResponsibilityHowVisual, SharedResponsibilityTerraformVisual } from "./aws-security-and-iam/SharedResponsibilityVisuals";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { HolidayScalingVisual, PowerPlantVisual } from "./introduction-to-the-cloud/CloudVisuals";
import { EuropeExpansionVisual, RestaurantVisual, SixAdvantagesVisual } from "./introduction-to-the-cloud/BenefitsVisuals";
import { AwsServicesVisual, ShoppingArchitectureVisual, ToolboxVisual } from "./introduction-to-the-cloud/AwsIntroVisuals";
import { HotelChainVisual, MumbaiToIrelandVisual, RegionDeployVisual } from "./global-infrastructure/RegionsVisuals";
import { CloudFrontHowVisual, EdgeExampleVisual, RestaurantChainVisual } from "./global-infrastructure/EdgeLocationVisuals";
import { AirplaneHaVisual, HaExampleVisual, HaHowVisual, HaModesVisual } from "./global-infrastructure/HaFaultToleranceVisuals";
import { AzHowVisual, HospitalAzVisual, MultiAzExampleVisual } from "./global-infrastructure/AvailabilityZoneVisuals";
import { BankHybridVisual, DeploymentModelsVisual, HousingVisual } from "./introduction-to-the-cloud/DeploymentVisuals";
import { FoodModelsVisual, PythonAppVisual, ResponsibilityVisual } from "./introduction-to-the-cloud/ServiceModelsVisuals";
import { BlackFridayVisual, CarAnalogyVisual, WorkflowCompareVisual } from "./introduction-to-the-cloud/TraditionalVsCloudVisuals";
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

const ModuleAssessment = lazy(() => import("./introduction-to-the-cloud/ModuleAssessment"));
const ModuleCheatsheet = lazy(() => import("./introduction-to-the-cloud/ModuleCheatsheet"));
const Module2Cheatsheet = lazy(() => import("./global-infrastructure/Module2Cheatsheet"));

const HCL_BLOCKS = new Set(["terraform", "required_providers", "provider", "data", "resource", "output", "variable", "locals", "module"]);

/** Small line-based highlighter for HCL (Terraform) and shell commands. */
function highlightCode(line: string, language: string): ReactNode {
  if (!line) return " ";
  const nodes: ReactNode[] = [];
  const re =
    language === "hcl"
      ? /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w-]*)(?=\s*=(?!=))|([A-Za-z_][\w-]*)/g
      : /(#.*$)|("(?:[^"\\]|\\.)*")|(\b\d+\b)|(--?[A-Za-z][\w-]*)|([A-Za-z_][\w-]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) nodes.push(line.slice(last, m.index));
    const [text, comment, str, num, a, b] = m;
    let cls = "";
    if (comment) cls = "italic text-muted-foreground/70";
    else if (str) cls = "text-mint";
    else if (num) cls = "text-amber";
    else if (language === "hcl") {
      if (a) cls = "text-sky-500 dark:text-sky-400";
      else if (b && HCL_BLOCKS.has(b) && line.trimStart().startsWith(b)) cls = "font-semibold text-violet";
      else if (b === "true" || b === "false") cls = "text-amber";
    } else if (b && line.trimStart().startsWith(b) && !line.slice(0, m.index).trim()) cls = "font-semibold text-violet";
    else if (a) cls = "text-sky-500 dark:text-sky-400";
    nodes.push(cls ? <span key={k++} className={cls}>{text}</span> : text);
    last = m.index + text.length;
  }
  if (last < line.length) nodes.push(line.slice(last));
  return nodes;
}

function CodeBlock({ code, caption, language }: { code: string; caption: string; language: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <figure className="w-full max-w-full overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="flex min-w-0 items-center justify-between border-b border-hairline/60 bg-surface-2/40 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="size-2.5 shrink-0 rounded-full bg-rose-500/80" />
          <div className="size-2.5 shrink-0 rounded-full bg-amber-500/80" />
          <div className="size-2.5 shrink-0 rounded-full bg-emerald-500/80" />
          <span className="ml-2 truncate font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{caption}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Copy code"
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 rounded-md border border-hairline/60 bg-surface/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            {copied ? <Check className="size-3.5 text-mint" /> : <Copy className="size-3.5" />}
            <span className={copied ? "text-mint" : ""}>{copied ? "Copied" : "Copy"}</span>
          </button>
          <span className="rounded-md border border-hairline/60 bg-surface/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{language}</span>
        </div>
      </div>
      <pre className="lesson-code overflow-x-auto px-4 py-4 font-mono shadow-inner">
        <code className="block min-w-max">
          {code.split("\n").map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 inline-block w-6 shrink-0 select-none text-right text-muted-foreground/50">{i + 1}</span>
              <span className="text-foreground/90">{highlightCode(line, language)}</span>
            </div>
          ))}
        </code>
      </pre>
    </figure>
  );
}

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
        case "hospital-az":
          return <HospitalAzVisual caption={section.caption} />;
        case "az-how":
          return <AzHowVisual caption={section.caption} />;
        case "multi-az-example":
          return <MultiAzExampleVisual caption={section.caption} />;
        case "restaurant-chain":
          return <RestaurantChainVisual caption={section.caption} />;
        case "cloudfront-how":
          return <CloudFrontHowVisual caption={section.caption} />;
        case "edge-example":
          return <EdgeExampleVisual caption={section.caption} />;
        case "airplane-ha":
          return <AirplaneHaVisual caption={section.caption} />;
        case "ha-how":
          return <HaHowVisual caption={section.caption} />;
        case "ha-example":
          return <HaExampleVisual caption={section.caption} />;
        case "ha-modes":
          return <HaModesVisual caption={section.caption} />;
        case "apartment-shared":
          return <ApartmentSharedVisual caption={section.caption} />;
        case "sr-how":
          return <SharedResponsibilityHowVisual caption={section.caption} />;
        case "sr-terraform":
          return <SharedResponsibilityTerraformVisual caption={section.caption} />;
        case "aws-toolbox":
          return <ToolboxVisual caption={section.caption} />;
        case "aws-services":
          return <AwsServicesVisual caption={section.caption} />;
        case "shopping-architecture":
          return <ShoppingArchitectureVisual caption={section.caption} />;
      }
      return null;
    case "image-carousel":
      return <ImageCarousel images={section.images} />;
    case "code":
      return <CodeBlock code={section.code} caption={section.caption} language={section.language} />;
    case "assessment":
      return (
        <ClientOnly fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2/40" />}>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2/40" />}>
            <ModuleAssessment moduleId={section.assessmentId} />
          </Suspense>
        </ClientOnly>
      );
    case "cheatsheet":
      return (
        <ClientOnly fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2/40" />}>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2/40" />}>
            {section.cheatsheetId === "module-2" ? <Module2Cheatsheet /> : <ModuleCheatsheet />}
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
            {section.items.map((item, i) => (
              <li key={item} className="lesson-prose flex gap-2.5 text-muted-foreground">
                {section.ordered ? (
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-mint/40 bg-mint/10 font-mono text-[12px] font-semibold text-mint">
                    {i + 1}
                  </span>
                ) : (
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-mint" />
                )}
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
