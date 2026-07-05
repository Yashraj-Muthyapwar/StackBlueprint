import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Lock, Layers, Terminal } from "lucide-react";
import { useState } from "react";

import { roadmap } from "@/lessons/roadmap";
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
          <div className="grid size-7 shrink-0 place-items-center rounded-md bg-mint/15 text-mint ring-1 ring-mint/30">
            <Layers className="size-4" />
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


        {roadmap.map((cat) => (
          <SidebarGroup key={cat.slug}>
            <SidebarGroupLabel className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <cat.icon className="size-3" />
              {cat.overviewPath === "/patterns" ? (
                <Link
                  to="/patterns"
                  onClick={closeMobile}
                  className="transition-colors hover:text-foreground"
                >
                  {cat.title}
                </Link>
              ) : cat.overviewPath === "/sql" ? (
                <Link
                  to="/sql"
                  onClick={closeMobile}
                  className="transition-colors hover:text-foreground"
                >
                  {cat.title}
                </Link>
              ) : cat.overviewPath === "/data-warehouses" ? (
                <Link
                  to="/data-warehouses"
                  onClick={closeMobile}
                  className="transition-colors hover:text-foreground"
                >
                  {cat.title}
                </Link>
              ) : cat.overviewPath === "/docker" ? (
                <Link
                  to="/docker"
                  onClick={closeMobile}
                  className="transition-colors hover:text-foreground"
                >
                  {cat.title}
                </Link>
              ) : (
                <span>{cat.title}</span>
              )}
              {cat.locked && <Lock className="ml-auto size-3 opacity-60" />}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {cat.locked ? (
                  <LockedCategoryItem cat={cat} pathname={pathname} onNavigate={closeMobile} />
                ) : cat.sections && cat.sections.length > 0 ? (
                  cat.sections.map((sec) => (
                    <SectionMaster
                      key={sec.title}
                      title={sec.title}
                      patterns={sec.patterns}
                      pathname={pathname}
                      onNavigate={closeMobile}
                    />
                  ))
                ) : cat.sectionTitle ? (
                  <SectionMaster
                    title={cat.sectionTitle}
                    patterns={cat.patterns}
                    pathname={pathname}
                    onNavigate={closeMobile}
                  />
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
          </SidebarGroup>
        ))}
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
  void pathname;
  const [open, setOpen] = useState<boolean>(true);
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

  if (!hasLessons) {
    if (pat.path) {
      return (
        <SidebarMenuSubItem>
          <SidebarMenuSubButton asChild isActive={patternActive}>
            <Link to={pat.path as any} onClick={onNavigate}>
              <ChevronRight className="size-3.5" />
              <span>{pat.title}</span>
            </Link>
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
                      <les.icon className="size-3.5" />
                      <span>{les.title}</span>
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

  if (!hasLessons) {
    if (pat.path) {
      return (
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={patternActive} tooltip={pat.title}>
            <Link to={pat.path as any} onClick={onNavigate}>
              <ChevronRight className="size-3.5" />
              <span>{pat.title}</span>
            </Link>
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
            <ChevronRight className="size-3.5" />
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
            <ChevronRight
              className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
            />
            <span className="flex-1 truncate text-left">{pat.title}</span>
            <ChevronDown
              className={`ml-auto size-3 opacity-60 transition-transform group-data-[collapsible=icon]:hidden ${
                open ? "rotate-180" : ""
              }`}
            />
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
                      <les.icon className="size-3.5" />
                      <span>{les.title}</span>
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
            <Lock className="size-3.5" />
            <span className="flex-1 truncate text-left">
              {isSql ? "Syllabus" : "Preview syllabus"}
            </span>
            <ChevronDown
              className={`ml-auto size-3 opacity-60 transition-transform group-data-[collapsible=icon]:hidden ${
                open ? "rotate-180" : ""
              }`}
            />
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
