import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Container,
  HardDrive,
  Layers,
  Network,
  LockKeyhole,
  Server,
  Terminal,
  ShieldAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { FOUNDATION_TOPICS } from "@/lessons/docker/foundations-content";

export const Route = createFileRoute("/docker/")({
  head: () => ({
    meta: [
      { title: "Docker — StackBlueprint" },
      {
        name: "description",
        content:
          "From container foundations to advanced multi-container orchestration.",
      },
      { property: "og:title", content: "Docker — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Interactive, animated Docker roadmap: images, containers, volumes, networking, and compose.",
      },
    ],
  }),
  component: DockerIndex,
});

type Topic = {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  modules: string[];
  unlocked?: boolean;
  routeBase?: "foundations" | "networking-storage" | "compose" | "advanced";
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
    groupBlurb:
      "The mental model for containers understanding the difference between VMs and containers, images, and the Docker runtime.",
    topics: [
      {
        slug: "what-is-docker",
        title: "Docker & Containers",
        blurb: "Why Docker exists, how it beats VMs, and how to run your first container.",
        icon: Container,
        modules: [
          "Why Docker Exists",
          "Containers vs VMs",
          "Docker Architecture",
          "Installing Docker",
          "Your First Container",
        ],
        unlocked: true,
        routeBase: "foundations",
        completedCount: 3,
      },
      {
        slug: "images-and-containers",
        title: "Images and Containers",
        blurb: "Master the core lifecycle of Docker: building images, running containers, and debugging running environments.",
        icon: Layers,
        modules: [
          "Docker Images",
          "Running Containers",
          "Lifecycle & Cleanup",
          "Debugging",
          "Writing Dockerfiles",
          "Image Building",
        ],
        unlocked: true,
        routeBase: "foundations",
      },
    ],
  },
  {
    group: "Connectivity & Persistence",
    groupBlurb: "How containers talk to each other and how to keep your data safe when containers stop.",
    topics: [
      {
        slug: "networking",
        title: "Docker Networking",
        blurb: "Bridge, host, none, and overlay networks. How port mapping works.",
        icon: Network,
        modules: ["Bridge Network", "Host & None", "Port Mapping", "Custom Networks"],
        unlocked: true,
        routeBase: "networking-storage",
      },
      {
        slug: "storage",
        title: "Volumes & Storage",
        blurb: "Bind mounts, volumes, and tmpfs. Managing state in stateless containers.",
        icon: HardDrive,
        modules: ["Bind Mounts", "Named Volumes", "tmpfs", "Volume Management"],
        unlocked: true,
        routeBase: "networking-storage",
      },
    ],
  },
  {
    group: "Orchestration & Advanced",
    groupBlurb: "Running multi-container applications and advanced image building techniques.",
    topics: [
      {
        slug: "docker-compose",
        title: "Docker Compose",
        blurb: "Declarative multi-container applications with docker-compose.yml.",
        icon: Boxes,
        modules: ["Compose YAML", "Services", "Environment Vars", "Depends On"],
      },
      {
        slug: "advanced-builds",
        title: "Advanced Docker",
        blurb: "Multi-stage builds, caching, security scanning, and registry management.",
        icon: Terminal,
        modules: ["Multi-stage Builds", "Build Cache", "Docker Security", "Registries"],
      },
    ],
  },
];

function DockerIndex() {
  const { isCompleted } = useProgress();

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-mint/10 text-mint ring-1 ring-mint/20 lg:size-20">
            <Server className="size-8 lg:size-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Docker
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Master containerization. Learn how to package, distribute, and run your applications consistently across any environment.
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
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {sec.group}
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {sec.groupBlurb}
                </p>
              </div>

              <div className="flex w-full flex-col gap-4">
                {sec.topics.map((t) => {
                  const Icon = t.icon;
                  const isLocked = !t.unlocked;
                  
                  const realTopic = FOUNDATION_TOPICS[t.slug as keyof typeof FOUNDATION_TOPICS];
                  const completedCount = realTopic 
                    ? realTopic.lessons.filter(l => isCompleted(l.slug)).length 
                    : (t.completedCount || 0);
                  const totalCount = realTopic ? realTopic.lessons.length : t.modules.length;

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

                  const toPath = t.to || `/docker/${t.routeBase}/${t.slug}`;
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
