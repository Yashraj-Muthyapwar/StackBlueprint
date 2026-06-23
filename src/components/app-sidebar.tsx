import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Lock, Layers } from "lucide-react";

import { roadmap } from "@/lessons/roadmap";
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
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-hairline">
      <SidebarHeader className="border-b border-hairline">
        <Link
          to="/"
          className="flex items-center gap-2 px-2 py-1.5 text-foreground transition-colors hover:text-mint"
        >
          <div className="grid size-7 place-items-center rounded-md bg-mint/15 text-mint ring-1 ring-mint/30">
            <Layers className="size-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight">DataVizCore</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Roadmap to mastery
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1 py-3">
        {roadmap.map((cat) => {
          const categoryActive = cat.locked && pathname === `/tracks/${cat.slug}`;
          return (
            <SidebarGroup key={cat.slug}>
              <SidebarGroupLabel className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <cat.icon className="size-3" />
                {cat.title}
                {cat.locked && <Lock className="ml-auto size-3 opacity-60" />}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {cat.locked ? (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={categoryActive}
                        tooltip={`${cat.title} — preview syllabus`}
                        className="text-muted-foreground/80"
                      >
                        <Link to="/tracks/$track" params={{ track: cat.slug }}>
                          <Lock className="size-3.5" />
                          <span>Preview syllabus</span>
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuSub className="border-hairline">
                        {cat.patterns.map((pat) => (
                          <SidebarMenuSubItem key={pat.slug}>
                            <SidebarMenuSubButton
                              asChild
                              className="text-muted-foreground/70"
                            >
                              <Link to="/tracks/$track" params={{ track: cat.slug }}>
                                <Lock className="size-3" />
                                <span>{pat.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  ) : (
                    cat.patterns.map((pat) => {
                      const patternActive = pat.path && pathname.startsWith(pat.path);
                      return (
                        <SidebarMenuItem key={pat.slug}>
                          <SidebarMenuButton
                            asChild
                            isActive={!!patternActive}
                            tooltip={pat.title}
                          >
                            <Link to="/patterns/$pattern" params={{ pattern: pat.slug }}>
                              <ChevronRight className="size-3.5" />
                              <span>{pat.title}</span>
                            </Link>
                          </SidebarMenuButton>

                          {pat.lessons.length > 0 && (
                            <SidebarMenuSub className="border-hairline">
                              {pat.lessons.map((les) => {
                                const active = pathname === les.path;
                                return (
                                  <SidebarMenuSubItem key={les.slug}>
                                    <SidebarMenuSubButton asChild isActive={active}>
                                      <Link
                                        to="/patterns/$pattern/$lesson"
                                        params={{ pattern: pat.slug, lesson: les.slug }}
                                      >
                                        <les.icon className="size-3.5" />
                                        <span>{les.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuItem>
                      );
                    })
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
