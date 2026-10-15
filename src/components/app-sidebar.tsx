import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronRight, Database, Lock, Terminal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { roadmap, categoryPatterns, sectionPatterns, type RoadmapCategory, type RoadmapPattern } from "@/lessons/roadmap";
import logoImg from "@/images/logos/new-logo.png";
import { useProgress } from "@/hooks/use-progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";

/* ───────────────────────── helpers ───────────────────────── */

type IsDone = (patSlug: string, lessonSlug: string) => boolean;

function countLessons(patterns: RoadmapPattern[], isDone: IsDone) {
  let total = 0;
  let done = 0;
  for (const p of patterns) {
    if (p.locked) continue;
    for (const l of p.lessons) {
      total++;
      if (isDone(p.slug, l.slug)) done++;
    }
  }
  return { total, done };
}

/** Prefix match on whole path segments, so "/sql" does not match "/sql-playground". */
function within(pathname: string, base?: string) {
  if (!base) return false;
  return pathname === base || pathname.startsWith(`${base}/`);
}

function isCategoryCurrent(cat: RoadmapCategory, pathname: string) {
  if (within(pathname, cat.overviewPath)) return true;
  if (cat.locked) return pathname === `/tracks/${cat.slug}`;
  return categoryPatterns(cat).some(
    (p) => within(pathname, p.path) || p.lessons.some((l) => l.path === pathname),
  );
}

function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

/* ───────────────────────── sidebar ───────────────────────── */

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile, isMobile } = useSidebar();
  const { completedLessons } = useProgress();
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const completed = useMemo(() => new Set(completedLessons), [completedLessons]);
  const isDone: IsDone = (patSlug, lessonSlug) =>
    completed.has(lessonSlug) || completed.has(`${patSlug}-${lessonSlug}`);

  // Keep the current lesson in view after navigation. On a track overview
  // there is no current lesson, so bring the track header to the top instead;
  // otherwise collapsing the previous track leaves it scrolled out of view.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const step = document.querySelector('[data-sb-current-step="true"]');
      if (step) {
        step.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
      }
      document
        .querySelector('.sb-track[data-current="true"]')
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 260);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <Sidebar collapsible="offcanvas" className="sb-root border-r border-sidebar-border">
      <SidebarHeader className="sb-header">
        <Link to="/" onClick={closeMobile} className="sb-brand" aria-label="StackBlueprint home">
          <span className="sb-brand-logo">
            <img src={logoImg} alt="" />
          </span>
          <span className="sb-brand-text">
            <span className="sb-brand-name">StackBlueprint</span>
            <span className="sb-brand-tag">Roadmap to mastery</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="sb-content">
        <nav aria-label="Tools">
          <div className="sb-label">Tools</div>
          <div className="sb-tools">
            <ToolTile
              to="/playground"
              active={pathname === "/playground"}
              title="Python"
              sub="Playground"
              icon={<Terminal />}
              tone="python"
              onNavigate={closeMobile}
            />
            <ToolTile
              to="/sql-playground"
              active={pathname === "/sql-playground"}
              title="SQL"
              sub="Playground"
              icon={<Database />}
              tone="sql"
              onNavigate={closeMobile}
            />
          </div>
        </nav>

        <nav aria-label="Roadmap">
          <div className="sb-label">
            <span>Tracks</span>
            <span className="sb-label-count">{roadmap.length}</span>
          </div>
          <div className="sb-tracks">
            {roadmap.map((cat) => (
              <TrackItem
                key={cat.slug}
                cat={cat}
                pathname={pathname}
                isDone={isDone}
                onNavigate={closeMobile}
              />
            ))}
          </div>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}

/* ───────────────────────── tools ───────────────────────── */

function ToolTile({
  to,
  active,
  title,
  sub,
  icon,
  tone,
  onNavigate,
}: {
  to: string;
  active: boolean;
  title: string;
  sub: string;
  icon: React.ReactNode;
  tone: "python" | "sql";
  onNavigate: () => void;
}) {
  return (
    <Link
      to={to as any}
      onClick={onNavigate}
      className="sb-tool"
      data-tone={tone}
      data-active={active}
      aria-current={active ? "page" : undefined}
    >
      <span className="sb-tool-icon">{icon}</span>
      <span>
        <span className="sb-tool-title">{title}</span>
        <span className="sb-tool-sub">{sub}</span>
      </span>
      <ArrowUpRight className="sb-tool-arrow" />
    </Link>
  );
}

/* ───────────────────────── tracks ───────────────────────── */

function TrackLogo({ cat }: { cat: RoadmapCategory }) {
  return (
    <span className="sb-track-logo">
      {typeof cat.icon === "string" ? (
        <img src={cat.icon} alt="" />
      ) : (
        <cat.icon className={cat.iconColor || ""} />
      )}
    </span>
  );
}

function TrackItem({
  cat,
  pathname,
  isDone,
  onNavigate,
}: {
  cat: RoadmapCategory;
  pathname: string;
  isDone: IsDone;
  onNavigate: () => void;
}) {
  const current = isCategoryCurrent(cat, pathname);
  const [open, setOpen] = useState(current);
  // Follow the active track: open on entering it, collapse on leaving it.
  // Manual toggles in between are kept until the next track change.
  useEffect(() => {
    setOpen(current);
  }, [current]);

  const patterns = categoryPatterns(cat);
  const { total, done } = countLessons(patterns, isDone);

  const meta = cat.locked ? (
    <span className="sb-soon">Soon</span>
  ) : total > 0 ? (
    <>
      <span className="sb-mini-bar">
        <span style={{ width: `${pct(done, total)}%` }} />
      </span>
      <span className="sb-track-count">
        {done}/{total}
      </span>
    </>
  ) : (
    <span className="sb-track-count">{patterns.length} modules</span>
  );

  const label = (
    <>
      <TrackLogo cat={cat} />
      <span className="sb-track-text">
        <span className="sb-track-title">{cat.title}</span>
        <span className="sb-track-meta">{meta}</span>
      </span>
    </>
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="sb-track" data-current={current}>
      <div className="sb-track-row">
        {cat.overviewPath ? (
          <Link
            to={cat.overviewPath as any}
            onClick={(e) => {
              // Toggle: an open track just closes; a closed track opens and shows its overview.
              if (open) {
                e.preventDefault();
                setOpen(false);
                return;
              }
              setOpen(true);
              onNavigate();
            }}
            className="sb-track-link"
            aria-expanded={open}
            aria-current={pathname === cat.overviewPath ? "page" : undefined}
          >
            {label}
          </Link>
        ) : (
          <CollapsibleTrigger className="sb-track-link">{label}</CollapsibleTrigger>
        )}
        <CollapsibleTrigger className="sb-icon-btn" aria-label={`${open ? "Collapse" : "Expand"} ${cat.title}`}>
          <ChevronRight />
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="sb-collapse">
        <div className="sb-track-body">
          {cat.locked ? (
            <LockedSyllabus cat={cat} onNavigate={onNavigate} />
          ) : cat.sections?.length ? (
            cat.sections.map((sec, i) => {
              const parts = sec.title ? sec.title.split(" — ") : [];
              const heading = parts.length === 2 ? parts[1] : sec.title || "Chapters";
              return (
                <div key={heading} className="sb-section">
                  <div className="sb-section-label">
                    <span className="sb-section-num">{String(i + 1).padStart(2, "0")}</span>
                    <span>{heading}</span>
                  </div>
                  <ModuleList patterns={sectionPatterns(sec)} pathname={pathname} isDone={isDone} onNavigate={onNavigate} />
                </div>
              );
            })
          ) : (
            <div className="sb-section">
              {cat.sectionTitle && (
                <div className="sb-section-label">
                  <span className="sb-section-num">01</span>
                  <span>{cat.sectionTitle}</span>
                </div>
              )}
              <ModuleList patterns={cat.patterns} pathname={pathname} isDone={isDone} onNavigate={onNavigate} />
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ───────────────────────── modules & lessons ───────────────────────── */

function ModuleList({
  patterns,
  pathname,
  isDone,
  onNavigate,
}: {
  patterns: RoadmapPattern[];
  pathname: string;
  isDone: IsDone;
  onNavigate: () => void;
}) {
  // Modules without lessons render as a single timeline of direct links.
  const leaves = patterns.filter((p) => p.lessons.length === 0);
  const modules = patterns.filter((p) => p.lessons.length > 0);

  return (
    <>
      {modules.map((pat) => (
        <ModuleItem key={pat.slug} pat={pat} pathname={pathname} isDone={isDone} onNavigate={onNavigate} />
      ))}
      {leaves.length > 0 && (
        <ol className="sb-timeline">
          {leaves.map((pat) => {
            const href = pat.path ?? `/patterns/${pat.slug}`;
            return (
              <Step
                key={pat.slug}
                to={href}
                title={pat.title}
                current={within(pathname, href)}
                locked={pat.locked}
                onNavigate={onNavigate}
              />
            );
          })}
        </ol>
      )}
    </>
  );
}

function ModuleItem({
  pat,
  pathname,
  isDone,
  onNavigate,
}: {
  pat: RoadmapPattern;
  pathname: string;
  isDone: IsDone;
  onNavigate: () => void;
}) {
  const active = within(pathname, pat.path) || pat.lessons.some((l) => l.path === pathname);
  const [open, setOpen] = useState(active);
  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  if (pat.locked) {
    return (
      <div className="sb-module-btn" data-locked="true" title={`${pat.title} (coming soon)`}>
        <Lock className="sb-module-chev" />
        <span className="sb-module-title">{pat.title}</span>
      </div>
    );
  }

  const done = pat.lessons.filter((l) => isDone(pat.slug, l.slug)).length;
  const total = pat.lessons.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="sb-module-btn" data-active={active} data-complete={done === total}>
        <ChevronRight className="sb-module-chev" />
        <span className="sb-module-title">{pat.title}</span>
        <span className="sb-module-count">
          {done === total ? <Check /> : `${done}/${total}`}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="sb-collapse">
        <ol className="sb-timeline">
          {pat.lessons.map((les) => (
            <Step
              key={les.slug}
              to={les.path}
              title={les.title}
              current={pathname === les.path}
              done={isDone(pat.slug, les.slug)}
              onNavigate={onNavigate}
            />
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Step({
  to,
  title,
  current,
  done,
  locked,
  onNavigate,
}: {
  to: string;
  title: string;
  current?: boolean;
  done?: boolean;
  locked?: boolean;
  onNavigate: () => void;
}) {
  if (locked) {
    return (
      <li className="sb-step" data-locked="true" title={`${title} (coming soon)`}>
        <span className="sb-step-dot">
          <Lock />
        </span>
        <span className="sb-step-text">{title}</span>
      </li>
    );
  }
  return (
    <li>
      <Link
        to={to as any}
        onClick={onNavigate}
        className="sb-step"
        data-current={current}
        data-done={done}
        data-sb-current-step={current}
        aria-current={current ? "page" : undefined}
      >
        <span className="sb-step-dot">{done && !current ? <Check /> : null}</span>
        <span className="sb-step-text">{title}</span>
      </Link>
    </li>
  );
}

function LockedSyllabus({ cat, onNavigate }: { cat: RoadmapCategory; onNavigate: () => void }) {
  const isSql = cat.slug === "sql-mastery";
  return (
    <ol className="sb-timeline">
      {cat.patterns.map((pat) => (
        <li key={pat.slug}>
          {isSql ? (
            <Link to="/sql" onClick={onNavigate} className="sb-step" data-locked="true">
              <span className="sb-step-dot">
                <Lock />
              </span>
              <span className="sb-step-text">{pat.title}</span>
            </Link>
          ) : (
            <Link
              to="/tracks/$track"
              params={{ track: cat.slug }}
              onClick={onNavigate}
              className="sb-step"
              data-locked="true"
            >
              <span className="sb-step-dot">
                <Lock />
              </span>
              <span className="sb-step-text">{pat.title}</span>
            </Link>
          )}
        </li>
      ))}
    </ol>
  );
}
