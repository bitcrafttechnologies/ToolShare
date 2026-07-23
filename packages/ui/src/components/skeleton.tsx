import * as React from "react";
import { cn } from "@toolshare/lib";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-sm bg-surface-muted",
        className
      )}
      {...props}
    />
  );
}
