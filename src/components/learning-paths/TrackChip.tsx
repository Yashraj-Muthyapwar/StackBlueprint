import * as React from "react";
import { cn } from "@/lib/utils";

export interface TrackChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "muted";
}

export function TrackChip({
  className,
  variant = "default",
  ...props
}: TrackChipProps) {
  return (
    <span
      className={cn(
        "shrink truncate max-w-[150px] sm:max-w-[190px] xl:max-w-[240px] rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-hairline bg-background",
        variant === "default" ? "text-foreground" : "text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}
