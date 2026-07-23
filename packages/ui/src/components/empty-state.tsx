import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * EmptyState
 * ----------------------------------------------------------------------
 * Used wherever a list/collection has nothing to show yet (Browse with
 * no results, "My Tools" before a first listing, empty Requests inbox).
 * Always frame as an invitation to act, per copy guidelines — not just
 * an apology.
 */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border-strong px-6 py-12 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-muted-foreground [&_svg]:size-6">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="font-heading font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
