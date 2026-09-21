import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Globe,
  Search,
  Database,
  Compass,
  Settings,
  LockKeyhole,
  Repeat,
  Boxes,
  Server,
  ShieldAlert,
  Activity,
  Terminal,
  Bot,
  FileCode,
} from "lucide-react";
import { FOUNDATION_TOPICS } from "@/lessons/web-scraping/foundations-content";
import { useProgress } from "@/hooks/use-progress";

const ICONS: Record<string, any> = {
  globe: Globe,
  search: Search,
  database: Database,
  compass: Compass,
  settings: Settings,
  lockKeyhole: LockKeyhole,
  repeat: Repeat,
  boxes: Boxes,
  server: Server,
  shieldAlert: ShieldAlert,
  activity: Activity,
  terminal: Terminal,
  bot: Bot,
  fileCode: FileCode,
};

export const Route = createFileRoute("/web-scraping/foundations/$topic/")({
  component: FoundationTopicPage,
});

function FoundationTopicPage() {
  const { topic } = Route.useParams();
  const t = FOUNDATION_TOPICS[topic];
  const { isCompleted } = useProgress();

  if (!t) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Topic not found.{" "}
        <Link to="/web-scraping" className="text-mint underline-offset-4 hover:underline">
          Back to Web Scraping
        </Link>
      </div>
    );
  }

  const Icon = ICONS[t.iconKey] || Globe;

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <Link to="/web-scraping" className="hover:text-foreground">
            Web Scraping
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/web-scraping" className="hover:text-foreground">
            Foundations
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{t.title}</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-md bg-mint/15 text-mint ring-1 ring-mint/30">
            <Icon className="size-6" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {t.category} · Topic
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">{t.title}</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-balance text-muted-foreground lg:text-lg">{t.blurb}</p>

        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {t.lessons.map((les, i) => (
            <Link
              to="/web-scraping/foundations/$topic/$lesson"
              params={{ topic: t.slug, lesson: les.slug }}
              key={les.slug}
              className="group relative overflow-hidden rounded-2xl border border-hairline/60 bg-surface/40 p-5 transition-colors hover:border-mint/40 hover:bg-surface/70"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} / {String(t.lessons.length).padStart(2, "0")}
                </span>
                {isCompleted(les.slug) ? (
                  <div className="grid size-5 place-items-center rounded-full bg-mint/15 text-mint ring-1 ring-mint/30">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-mint/40 bg-mint/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mint">
                    Planned
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-base font-medium">{les.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{les.subtitle}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-mint">
                Start lesson
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
