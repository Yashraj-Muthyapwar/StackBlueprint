import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  LockKeyhole,
  Globe,
  Edit3,
  RotateCcw,
  Search,
  Users,
  PlayCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import gitLogo from "@/images/logos/git-logo.png";

export const Route = createFileRoute("/git-github/")({
  head: () => ({
    meta: [
      { title: "Git & GitHub — StackBlueprint" },
      {
        name: "description",
        content:
          "Version control, branching strategies, and collaboration workflows.",
      },
      { property: "og:title", content: "Git & GitHub — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Interactive, animated Git roadmap: commits, branches, merges, and GitHub Actions.",
      },
    ],
  }),
  component: GitGithubIndex,
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
    group: "Version Control Foundations",
    groupBlurb: "The mental model for Git — understanding the working tree, staging area, and commits.",
    topics: [
      {
        slug: "git-fundamentals",
        title: "Git Fundamentals",
        blurb: "Commits, history, and the working tree.",
        icon: GitCommit,
        modules: ["The .git Directory", "Staging & Committing", "git log & status", "Ignoring Files"],
        unlocked: false,
        routeBase: "foundations",
      },
      {
        slug: "branching-merging",
        title: "Branching & Merging",
        blurb: "Parallel development and combining work.",
        icon: GitBranch,
        modules: ["Creating Branches", "Fast-forward Merges", "3-way Merges", "Merge Conflicts"],
        unlocked: false,
        routeBase: "foundations",
      },
      {
        slug: "remotes",
        title: "Remotes & Collaboration",
        blurb: "Working with remote repositories.",
        icon: Globe,
        modules: ["git clone", "Pushing & Pulling", "Fetch vs Pull", "Tracking Branches"],
        unlocked: false,
        routeBase: "foundations",
      },
    ],
  },
  {
    group: "Advanced Git",
    groupBlurb: "Rewriting history, undoing mistakes, and detective work.",
    topics: [
      {
        slug: "rewriting-history",
        title: "Rewriting History",
        blurb: "Cleaning up commits before sharing them.",
        icon: Edit3,
        modules: ["git commit --amend", "Interactive Rebase", "Squashing Commits", "Rebase vs Merge"],
        unlocked: false,
        routeBase: "advanced",
      },
      {
        slug: "undoing-things",
        title: "Undoing Mistakes",
        blurb: "Recovering lost work and reverting changes.",
        icon: RotateCcw,
        modules: ["Soft/Mixed/Hard Reset", "git revert", "The Reflog", "git stash"],
        unlocked: false,
        routeBase: "advanced",
      },
      {
        slug: "detective-work",
        title: "Detective Work",
        blurb: "Finding bugs and tracing history.",
        icon: Search,
        modules: ["git blame", "git bisect", "Searching History"],
        unlocked: false,
        routeBase: "advanced",
      }
    ]
  },
  {
    group: "GitHub Ecosystem",
    groupBlurb: "Code review, project management, and CI/CD pipelines.",
    topics: [
      {
        slug: "pull-requests",
        title: "Pull Requests & Review",
        blurb: "Collaborating on code with teams.",
        icon: GitPullRequest,
        modules: ["Creating PRs", "Code Review Workflows", "Branch Protection", "CODEOWNERS"],
        unlocked: false,
        routeBase: "github",
      },
      {
        slug: "github-actions",
        title: "GitHub Actions",
        blurb: "Automating tests and deployments.",
        icon: PlayCircle,
        modules: ["Workflows & Runners", "Jobs and Steps", "Triggers", "Secrets and Variables"],
        unlocked: false,
        routeBase: "github",
      },
      {
        slug: "workflows",
        title: "Team Workflows",
        blurb: "Standardized branching strategies for teams.",
        icon: Users,
        modules: ["GitHub Flow", "GitFlow", "Trunk-based Development", "Forks & Open Source"],
        unlocked: false,
        routeBase: "github",
      }
    ]
  },
  {
    group: "Capstone",
    groupBlurb: "Put it all together in a collaborative environment.",
    topics: [
      {
        slug: "capstone",
        title: "Team Collaboration Capstone",
        blurb: "Simulate a real-world team project: branching, reviewing, and releasing.",
        icon: GitMerge,
        modules: ["Setting up the Monorepo", "Feature Branches & PRs", "Resolving Merge Conflicts", "Automated Release with Actions"],
        unlocked: false,
        routeBase: "capstone",
      }
    ]
  }
];

function GitGithubIndex() {
  const { isCompleted } = useProgress();

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img src={gitLogo} alt="Git Logo" className="size-16 object-contain drop-shadow-sm lg:size-20" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            Git & GitHub
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Version Control. Learn how to track changes, collaborate efficiently, and automate deployments.
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

                  const toPath = t.to || `/git-github/${t.routeBase}/${t.slug}`;
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
