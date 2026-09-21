import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Layers,
  Settings,
  HardDrive,
  LockKeyhole,
  Lightbulb,
  FileCode,
  Terminal,
  Server,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import terraformLogo from "@/images/logos/terraform-logo.png";

export const Route = createFileRoute("/terraform/")({
  head: () => ({
    meta: [
      { title: "Terraform — StackBlueprint" },
      {
        name: "description",
        content: "Infrastructure as Code for provisioning and managing cloud resources.",
      },
      { property: "og:title", content: "Terraform — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Interactive, animated Terraform roadmap: providers, resources, state, and modules.",
      },
    ],
  }),
  component: TerraformIndex,
});

type Topic = {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  modules: string[];
  unlocked?: boolean;
  routeBase?: string;
  to?: string;
  completedCount?: number;
};

type Section = {
  group: string;
  groupBlurb: string;
  topics: Topic[];
};

const sections: Section[] = [
  {
    group: "Foundations",
    groupBlurb: "The mental model for Infrastructure as Code and the core Terraform workflow.",
    topics: [
      {
        slug: "iac-fundamentals",
        title: "Infrastructure as Code",
        blurb: "Why IaC, declarative vs imperative, and Terraform vs the rest.",
        icon: Lightbulb,
        modules: [
          "Why IaC?",
          "Declarative vs Imperative",
          "Terraform vs Ansible",
          "The Core Workflow",
        ],
        unlocked: false,
        routeBase: "foundations",
      },
      {
        slug: "basics",
        title: "Terraform Basics",
        blurb: "Providers, resources, and data sources.",
        icon: Layers,
        modules: ["Providers", "Resources", "Data Sources", "State File Intro"],
        unlocked: false,
        routeBase: "foundations",
      },
      {
        slug: "variables-outputs",
        title: "Variables & Outputs",
        blurb: "Parameterizing your infrastructure.",
        icon: FileCode,
        modules: ["Input Variables", "Local Values", "Outputs", "Sensitive Data", "tfvars files"],
        unlocked: false,
        routeBase: "foundations",
      },
    ],
  },
  {
    group: "Advanced HCL & Reusability",
    groupBlurb: "Writing DRY (Don't Repeat Yourself) infrastructure code with logic and modules.",
    topics: [
      {
        slug: "hcl-logic",
        title: "HCL Logic",
        blurb: "Loops, conditionals, and built-in functions.",
        icon: Terminal,
        modules: ["Count & for_each", "Conditionals", "Dynamic Blocks", "Built-in Functions"],
        unlocked: false,
        routeBase: "advanced-hcl",
      },
      {
        slug: "modules",
        title: "Modules",
        blurb: "Creating and consuming reusable infrastructure components.",
        icon: Settings,
        modules: ["Module Structure", "Calling Modules", "Module Registry", "Composition"],
        unlocked: false,
        routeBase: "advanced-hcl",
      },
    ],
  },
  {
    group: "State & Production",
    groupBlurb: "Managing state securely and running Terraform in a team environment.",
    topics: [
      {
        slug: "state-management",
        title: "State Management",
        blurb: "Remote backends, state locking, and state manipulation.",
        icon: HardDrive,
        modules: ["Remote Backends (S3/GCS)", "State Locking", "terraform import", "State mv & rm"],
        unlocked: false,
        routeBase: "production",
      },
      {
        slug: "workspaces-envs",
        title: "Environments",
        blurb: "Managing dev, staging, and production environments.",
        icon: Server,
        modules: ["Terraform Workspaces", "Directory Separation", "Multi-Account Deployments"],
        unlocked: false,
        routeBase: "production",
      },
      {
        slug: "ci-cd-terraform",
        title: "CI/CD & Automation",
        blurb: "Automating Terraform deployments with pipelines.",
        icon: Activity,
        modules: ["GitHub Actions for TF", "Atlantis", "Terraform Cloud", "Drift Detection"],
        unlocked: false,
        routeBase: "production",
      },
    ],
  },
  {
    group: "Capstone",
    groupBlurb: "Put it all together in a realistic, multi-environment architecture.",
    topics: [
      {
        slug: "capstone",
        title: "Terraform Capstone",
        blurb: "Provision a highly-available cloud architecture from scratch.",
        icon: Server,
        modules: [
          "Network & VPC",
          "Compute & Load Balancing",
          "Database Provisioning",
          "CI/CD Pipeline Setup",
        ],
        unlocked: false,
        routeBase: "capstone",
      },
    ],
  },
];

function TerraformIndex() {
  const { isCompleted } = useProgress();

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img
              src={terraformLogo}
              alt="Terraform Logo"
              className="size-16 object-contain drop-shadow-sm lg:size-20"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Terraform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Infrastructure as Code. Learn how to provision, manage, and scale cloud resources
            automatically and reliably.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-24">
          {sections.map((sec, i) => (
            <div key={sec.group} className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
              <div className="mb-8 w-full shrink-0 lg:sticky lg:top-24 lg:mb-0 lg:w-64 xl:w-72">
                <div className="flex items-center gap-3">
                  <div className="grid size-6 place-items-center rounded-full bg-border text-xs font-bold text-foreground">
                    {i + 1}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{sec.group}</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {sec.groupBlurb}
                </p>
              </div>

              <div className="flex w-full flex-col gap-4">
                {sec.topics.map((t) => {
                  const Icon = t.icon;
                  const isLocked = !t.unlocked;

                  const completedCount = t.completedCount || 0;
                  const totalCount = t.modules.length;

                  const card = (
                    <div
                      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border border-hairline transition-all duration-300 sm:flex-row ${
                        isLocked
                          ? "bg-card/20 opacity-80 grayscale"
                          : "bg-card hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-background/20"
                      }`}
                    >
                      <div className="flex shrink-0 items-center justify-center border-b border-hairline bg-background/50 p-6 sm:w-40 sm:border-b-0 sm:border-r">
                        <Icon
                          className={`size-10 ${isLocked ? "text-muted-foreground" : "text-mint"}`}
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="flex flex-1 flex-col p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            {t.title}
                          </h3>
                          {isLocked && <LockKeyhole className="size-5 text-muted-foreground" />}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {t.blurb}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2 pr-12">
                          {t.modules.map((m) => (
                            <span
                              key={m}
                              className="rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-hairline"
                            >
                              {m}
                            </span>
                          ))}
                        </div>

                        {!isLocked && (
                          <div className="mt-6 flex items-center gap-2">
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
                              <div
                                className="h-full bg-mint transition-all duration-500 ease-out"
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">
                              {completedCount}/{totalCount} lessons complete
                            </span>
                          </div>
                        )}
                      </div>

                      {!isLocked && (
                        <div className="absolute bottom-6 right-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-sm:hidden">
                          <div className="grid size-8 place-items-center rounded-full bg-mint/10 text-mint">
                            <ArrowRight className="size-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  );

                  if (isLocked) {
                    return <div key={t.slug}>{card}</div>;
                  }

                  const toPath = t.to || `/terraform/${t.routeBase}/${t.slug}`;
                  return (
                    <Link key={t.slug} to={toPath} className="block w-full outline-none">
                      {card}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
