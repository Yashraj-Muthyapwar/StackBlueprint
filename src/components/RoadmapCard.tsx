import React, { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { categoryPatterns, isCategoryUnlocked, type RoadmapCategory } from "@/lessons/roadmap";

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

  const hasContent = isCategoryUnlocked(cat);

  const cardContent = (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
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
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex size-11 items-center justify-center rounded-xl transition-all duration-300 ${
            typeof cat.icon === "string"
              ? "bg-surface-2 ring-1 ring-hairline/60"
              : hasContent
                ? "bg-mint/10 text-mint ring-1 ring-mint/30 group-hover:bg-mint/20 group-hover:scale-105 group-hover:ring-mint/50"
                : "bg-surface-2 text-muted-foreground/70 ring-1 ring-hairline"
          }`}
        >
          {typeof cat.icon === "string" ? (
            <img
              src={cat.icon}
              alt={`${cat.title} logo`}
              className="size-6 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <cat.icon className="size-5" />
          )}
        </div>

        <div className="flex items-center">
          {hasContent ? (
            <span className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-mint shadow-[0_0_10px_-2px_rgba(94,234,212,0.2)]">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-background/50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
              <Lock className="size-3" />
              Coming Soon
            </span>
          )}
        </div>
      </div>

      {/* Title & Blurb with unified fixed slots */}
      <div className="flex min-h-[3rem] items-start">
        <h3 className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-mint line-clamp-2 leading-snug">
          {cat.title}
        </h3>
      </div>
      <div className="mt-1 flex min-h-[2.5rem] items-start">
        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {cat.blurb}
        </p>
      </div>

      {/* Card Action Link Bottom */}
      <div className="mt-auto pt-5">
        <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors">
          {hasContent ? (
            <span className="text-mint flex items-center">
              Open track
              <ArrowRight className="ml-1.5 size-3.5 transition-transform group-hover:translate-x-1.5" />
            </span>
          ) : (
            <span className="text-muted-foreground flex items-center group-hover:text-foreground/80">
              Preview syllabus
              <ArrowRight className="ml-1.5 size-3.5 transition-transform group-hover:translate-x-1.5" />
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
