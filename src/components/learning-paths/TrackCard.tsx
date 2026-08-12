import { Link } from "@tanstack/react-router";
import { ArrowRight, LockKeyhole, LucideIcon } from "lucide-react";
import { ChapterProgressBar } from "./ChapterProgressBar";
import { TrackChip } from "./TrackChip";

export interface TrackCardProps {
  title: string;
  blurb?: string;
  icon: LucideIcon;
  isLocked?: boolean;
  lessons?: { slug: string; title: string }[];
  completedCount?: number;
  totalCount?: number;
  href?: string;
}

export function TrackCard({
  title,
  blurb,
  icon: Icon,
  isLocked,
  lessons,
  completedCount = 0,
  totalCount = 0,
  href,
}: TrackCardProps) {
  const cardContent = (
    <div
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border border-hairline transition-all duration-300 sm:h-[220px] sm:flex-row ${
        isLocked
          ? "bg-card/20 opacity-80 grayscale"
          : "bg-card hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-background/20"
      }`}
    >
      <div className="flex shrink-0 items-center justify-center border-b border-hairline bg-background/50 p-6 sm:w-40 sm:border-b-0 sm:border-r">
        <Icon
          className={`size-12 ${isLocked ? "text-muted-foreground" : "text-mint"}`}
          strokeWidth={1.5}
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold tracking-tight text-foreground line-clamp-1">
            {title}
          </h3>
          {isLocked && <LockKeyhole className="size-5 shrink-0 text-muted-foreground" />}
        </div>
        
        {blurb && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {blurb}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pr-12">
          {lessons?.slice(0, 2).map((m) => (
            <TrackChip key={m.slug}>{m.title}</TrackChip>
          ))}
          {lessons && lessons.length > 2 && (
            <TrackChip variant="muted">+{lessons.length - 2} more</TrackChip>
          )}
        </div>

        {!isLocked && totalCount > 0 && (
          <ChapterProgressBar completedCount={completedCount} totalCount={totalCount} />
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

  if (isLocked || !href) {
    return <div>{cardContent}</div>;
  }

  return (
    <Link to={href} className="block w-full outline-none">
      {cardContent}
    </Link>
  );
}
