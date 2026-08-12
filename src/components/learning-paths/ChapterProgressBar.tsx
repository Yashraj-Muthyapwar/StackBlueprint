import { cn } from "@/lib/utils";

interface ChapterProgressBarProps {
  completedCount: number;
  totalCount: number;
  className?: string;
}

export function ChapterProgressBar({
  completedCount,
  totalCount,
  className,
}: ChapterProgressBarProps) {
  if (totalCount === 0) return null;

  const percentage = Math.min(100, Math.max(0, (completedCount / totalCount) * 100));

  return (
    <div className={cn("mt-6 flex items-center gap-2 pr-12", className)}>
      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-mint transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        {completedCount}/{totalCount} lessons complete
      </span>
    </div>
  );
}
