import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * Select
 * ----------------------------------------------------------------------
 * Wraps the native <select> rather than building a custom listbox —
 * full keyboard/screen-reader support for free, at the cost of less
 * visual control over the open dropdown (a deliberate tradeoff).
 */
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-10 w-full appearance-none rounded-sm border border-border-strong bg-surface pl-3 pr-9 text-sm text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-danger-400",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  }
);
Select.displayName = "Select";
