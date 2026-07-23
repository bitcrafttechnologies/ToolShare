import * as React from "react";
import { cn } from "@toolshare/lib";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading icon (e.g. search). */
  startIcon?: React.ReactNode;
  /** Optional trailing icon. */
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", startIcon, endIcon, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <div className="relative flex items-center">
          {startIcon && (
            <span className="absolute left-3 flex items-center text-muted-foreground [&_svg]:size-4">
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-danger-400 aria-invalid:focus-visible:ring-danger-400",
              startIcon && "pl-9",
              endIcon && "pr-9",
              className
            )}
            {...props}
          />
          {endIcon && (
            <span className="absolute right-3 flex items-center text-muted-foreground [&_svg]:size-4">
              {endIcon}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-danger-400 aria-invalid:focus-visible:ring-danger-400",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

/**
 * SearchInput
 * ----------------------------------------------------------------------
 * Pre-configured Input with a search icon — the primary entry point for
 * browsing tools. Kept as a thin wrapper so the icon/markup stays
 * consistent everywhere search appears.
 */
export const SearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, "startIcon" | "type">
>(({ placeholder = "Search tools…", ...props }, ref) => (
  <Input
    ref={ref}
    type="search"
    placeholder={placeholder}
    startIcon={
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    }
    {...props}
  />
));
SearchInput.displayName = "SearchInput";
