import React, { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import type { RoadmapCategory } from "@/lessons/roadmap";

interface RoadmapCardProps {
  cat: RoadmapCategory;
}

export function RoadmapCard({ cat }: RoadmapCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, isHovered: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, isHovered: false }));
  };

  const isUnlocked = !cat.locked;
  const isSql = cat.slug === "sql-mastery";
  const hasContent = isUnlocked || isSql;

  const cardContent = (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 sm:p-7 transition-all duration-300 ${
        hasContent
          ? "border-hairline/60 bg-surface/30 backdrop-blur-md hover:-translate-y-1.5 hover:border-mint/60 hover:bg-surface/50 hover:shadow-[0_20px_48px_-12px_rgba(94,234,212,0.22)]"
          : "border-hairline/40 bg-surface/10 backdrop-blur-sm hover:-translate-y-1 hover:border-foreground/20 hover:bg-surface/25 hover:shadow-xl"
      }`}
    >
      {/* Ambient background glow card corner */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-mint/5 blur-[35px] transition-all duration-500 group-hover:bg-mint/15 group-hover:scale-125" />

      {/* Spotlight cursor glow */}
      {mousePos.isHovered && hasContent && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(94,234,212,0.16), transparent 75%)`,
          }}
        />
      )}

      {/* Top Header: Icon & Badges */}
      <div className="mb-6 flex items-start justify-between">
        <div
          className={`flex min-w-[48px] items-center justify-center rounded-xl transition-all duration-300 ${
            typeof cat.icon === "string"
              ? cat.slug === "data-engineering"
                ? "h-16"
                : "h-12"
              : hasContent
                ? "h-12 bg-mint/10 text-mint ring-1 ring-mint/30 group-hover:bg-mint/20 group-hover:scale-105 group-hover:ring-mint/50"
                : "h-12 bg-surface-2 text-muted-foreground/70 ring-1 ring-hairline"
          }`}
        >
          {typeof cat.icon === "string" ? (
            <img
              src={cat.icon}
              alt={`${cat.title} logo`}
              className={`${
                cat.slug === "data-engineering" ? "h-16 -ml-2" : "h-8"
              } w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105`}
            />
          ) : (
            <cat.icon className="size-6" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasContent ? (
            <span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-mint shadow-[0_0_10px_-2px_rgba(94,234,212,0.2)]">
              {isUnlocked ? "Active" : "In Progress"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-background/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
              <Lock className="size-3" />
              Locked
            </span>
          )}
        </div>
      </div>

      {/* Title & Blurb */}
      <h3 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-mint">
        {cat.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {cat.blurb}
      </p>

      {/* Pattern Badges */}
      <div className="mt-6 flex flex-wrap gap-1.5 sm:gap-2">
        {cat.patterns.slice(0, 4).map((p) => (
          <span
            key={p.slug}
            className={
              hasContent
                ? "rounded-md border border-mint/20 bg-mint/5 px-2.5 py-1 text-[11px] font-medium text-mint/90 transition-colors group-hover:border-mint/40 group-hover:bg-mint/10"
                : "rounded-md border border-hairline bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted-foreground/80"
            }
          >
            {p.title}
          </span>
        ))}
        {cat.patterns.length > 4 && (
          <span
            className={
              hasContent
                ? "rounded-md border border-mint/20 px-2.5 py-1 text-[11px] font-medium text-mint/60"
                : "rounded-md border border-hairline px-2.5 py-1 text-[11px] font-medium text-muted-foreground/50"
            }
          >
            +{cat.patterns.length - 4} more
          </span>
        )}
      </div>

      {/* Card Action Link Bottom */}
      <div className="mt-auto pt-6">
        <div className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors">
          {hasContent ? (
            <span className="text-mint flex items-center">
              {isSql && !isUnlocked ? "Open syllabus" : "Open track"}
              <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1.5" />
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center group-hover:text-foreground/80">
              Preview syllabus
              <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (cat.overviewPath) {
    return (
      <Link to={cat.overviewPath as any} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return (
    <Link to="/tracks/$track" params={{ track: cat.slug }} className="block h-full">
      {cardContent}
    </Link>
  );
}
