import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * ButtonGroup
 * ----------------------------------------------------------------------
 * Lays out a set of buttons together. Use for segmented-style actions
 * (e.g. filter toggles) or simple toolbars. Not a single focus group —
 * each Button keeps its own native semantics.
 */
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "inline-flex",
          orientation === "horizontal"
            ? "flex-row [&>button]:rounded-none [&>button:first-child]:rounded-l-sm [&>button:last-child]:rounded-r-sm [&>button:not(:first-child)]:-ml-px"
            : "flex-col [&>button]:rounded-none [&>button:first-child]:rounded-t-sm [&>button:last-child]:rounded-b-sm [&>button:not(:first-child)]:-mt-px",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";
