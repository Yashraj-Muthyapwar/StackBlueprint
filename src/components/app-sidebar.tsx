import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Lock, Terminal, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { roadmap } from "@/lessons/roadmap";
import logoImg from "@/images/logos/logo.png";
import { useProgress } from "@/hooks/use-progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarGroupAction,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile, isMobile } = useSidebar();
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-hairline">
      <SidebarHeader className="border-b border-hairline">
        <Link
          to="/"
          onClick={closeMobile}
          className="flex items-center gap-2 px-2 py-1.5 text-foreground transition-colors hover:text-mint"
        >
          <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md">
            <img src={logoImg} alt="StackBlueprint" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">StackBlueprint</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Roadmap to mastery
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/playground"}
                  tooltip="Python Playground"
                >
                  <Link to="/playground" onClick={closeMobile}>
                    <Terminal className="size-3.5" />
                    <span>Python Playground</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        {roadmap.map((cat) => {
          const isCategoryActive = cat.overviewPath ? pathname.startsWith(cat.overviewPath) : false;
          
          return (
            <Collapsible key={cat.slug} defaultOpen={isCategoryActive} className="group/collapsible">
              <SidebarGroup className="py-0">
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex w-full cursor-pointer items-center justify-between text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground">
                    <div className="flex flex-1 items-center gap-2">
                      {typeof cat.icon === "string" ? (
                        <img src={cat.icon} alt={`${cat.title} logo`} className="size-3 object-contain drop-shadow-sm opacity-80" />
                      ) : (
                        <cat.icon className="size-3" />
                      )}
                      {cat.overviewPath ? (
                        <Link
                          to={cat.overviewPath as any}
                          onClick={closeMobile}
                          className="flex-1 text-left transition-colors hover:text-foreground outline-none"
                        >
                          {cat.title}
                        </Link>
                      ) : (
                        <span className="flex-1 text-left">{cat.title}</span>
                      )}
                      {cat.locked && <Lock className="size-3 opacity-60" />}
                    </div>
                  </SidebarGroupLabel>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {cat.locked ? (
                        <LockedCategoryItem cat={cat} pathname={pathname} onNavigate={closeMobile} />
                      ) : cat.sectionTitle ? (
                        <SectionMaster
                          title={cat.sectionTitle}
                          patterns={cat.patterns}
                          pathname={pathname}
                          onNavigate={closeMobile}
                        />
                      ) : cat.sections && cat.sections.length > 0 ? (
                        cat.sections.map((sec) => {
                          const parts = sec.title ? sec.title.split(" — ") : [];
                          const heading = parts.length === 2 ? parts[1] : (sec.title || "Chapters");
                          return (
                            <SectionMaster
                              key={heading}
                              title={heading}
                              patterns={sec.patterns}
                              pathname={pathname}
                              onNavigate={closeMobile}
                            />
                          );
                        })
                      ) : (
                        cat.patterns.map((pat) => (
                          <PatternItem
                            key={pat.slug}
                            pat={pat}
                            pathname={pathname}
                            onNavigate={closeMobile}
                          />
                        ))
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}

function SectionMaster({
  title,
  patterns,
  pathname,
  onNavigate,
}: {
  title: string;
  patterns: import("@/lessons/roadmap").RoadmapPattern[];
  pathname: string;
  onNavigate: () => void;
}) {
  const isSectionActive = patterns.some((p) => p.path && pathname.startsWith(p.path));
  const [open, setOpen] = useState<boolean>(isSectionActive);
  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={title} className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80 hover:text-foreground">
            <ChevronRight
              className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
            />
            <span className="flex-1 truncate text-left">{title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-hairline">
            {patterns.map((pat) => (
              <NestedPatternItem
                key={pat.slug}
                pat={pat}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function NestedPatternItem({
  pat,
  pathname,
  onNavigate,
}: {
  pat: import("@/lessons/roadmap").RoadmapPattern;
  pathname: string;
  onNavigate: () => void;
}) {
  const patternActive = !!pat.path && pathname.startsWith(pat.path);
  const [open, setOpen] = useState(patternActive);
  const hasLessons = pat.lessons.length > 0;
  const { isCompleted } = useProgress();

  if (pat.locked) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton tooltip={`${pat.title} (Coming soon)`} className="text-muted-foreground/70 cursor-not-allowed">
          <Lock className="size-3" />
          <span>{pat.title}</span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  if (!hasLessons) {
    if (pat.path) {
      return (
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={patternActive}>
            <a href={pat.path} onClick={onNavigate}>
              <ChevronRight className="size-3.5" />
              <span>{pat.title}</span>
            </a>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      );
    }

    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={patternActive}>
          <Link
            to="/patterns/$pattern"
            params={{ pattern: pat.slug }}
            onClick={onNavigate}
          >
            <ChevronRight className="size-3.5" />
            <span>{pat.title}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuSubButton isActive={patternActive} className="cursor-pointer">
            <ChevronRight
              className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
            />
            <span className="flex-1 truncate text-left">{pat.title}</span>
          </SidebarMenuSubButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-hairline">
            {pat.lessons.map((les) => {
              const active = pathname === les.path;
              return (
                <SidebarMenuSubItem key={les.slug}>
                  <SidebarMenuSubButton asChild isActive={active}>
                    <Link to={les.path} onClick={onNavigate}>
                      {isCompleted(les.slug) ? (
                        <CheckCircle2 className="size-3.5 text-mint" />
                      ) : (
                        <les.icon className="size-3.5" />
                      )}
                      <span className={isCompleted(les.slug) ? "text-mint/90 font-medium" : ""}>
                        {les.title}
                      </span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  );
}

function PatternItem({
  pat,
  pathname,
  onNavigate,
}: {
  pat: import("@/lessons/roadmap").RoadmapPattern;
  pathname: string;
  onNavigate: () => void;
}) {
  const patternActive = !!pat.path && pathname.startsWith(pat.path);
  const [open, setOpen] = useState(patternActive);
  const hasLessons = pat.lessons.length > 0;
  const { isCompleted } = useProgress();

  if (pat.locked) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={`${pat.title} (Coming soon)`} className="text-muted-foreground/70 cursor-not-allowed">
          <Lock className="size-3" />
          <span>{pat.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (!hasLessons) {
    if (pat.path) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={patternActive} tooltip={pat.title}>
            <a href={pat.path} onClick={onNavigate}>
              <span>{pat.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={patternActive} tooltip={pat.title}>
          <Link
            to="/patterns/$pattern"
            params={{ pattern: pat.slug }}
            onClick={onNavigate}
          >
            <span>{pat.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={patternActive} tooltip={pat.title}>
            <span className="flex-1 truncate text-left">{pat.title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-hairline">
            {pat.lessons.map((les) => {
              const active = pathname === les.path;
              return (
                <SidebarMenuSubItem key={les.slug}>
                  <SidebarMenuSubButton asChild isActive={active}>
                    <Link to={les.path} onClick={onNavigate}>
                      {isCompleted(les.slug) ? (
                        <CheckCircle2 className="size-3.5 text-mint" />
                      ) : (
                        <les.icon className="size-3.5" />
                      )}
                      <span className={isCompleted(les.slug) ? "text-mint/90 font-medium" : ""}>
                        {les.title}
                      </span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function LockedCategoryItem({
  cat,
  pathname,
  onNavigate,
}: {
  cat: import("@/lessons/roadmap").RoadmapCategory;
  pathname: string;
  onNavigate: () => void;
}) {
  const isSql = cat.slug === "sql-mastery";
  const active = isSql
    ? pathname === "/sql" || pathname.startsWith("/sql/")
    : pathname === `/tracks/${cat.slug}`;
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={active}
            tooltip={`${cat.title} — preview syllabus`}
            className="text-muted-foreground/80"
          >
            <ChevronRight
              className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
            />
            <span className="flex-1 truncate text-left">
              {isSql ? "Syllabus" : "Preview syllabus"}
            </span>
            <Lock className="ml-auto size-3 opacity-60" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-hairline">
            {cat.patterns.map((pat) => (
              <SidebarMenuSubItem key={pat.slug}>
                <SidebarMenuSubButton asChild className="text-muted-foreground/70">
                  {isSql ? (
                    <Link to="/sql" onClick={onNavigate}>
                      <Lock className="size-3" />
                      <span>{pat.title}</span>
                    </Link>
                  ) : (
                    <Link
                      to="/tracks/$track"
                      params={{ track: cat.slug }}
                      onClick={onNavigate}
                    >
                      <Lock className="size-3" />
                      <span>{pat.title}</span>
                    </Link>
                  )}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
