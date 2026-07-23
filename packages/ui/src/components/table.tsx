import * as React from "react";
import { cn } from "@toolshare/lib";

/**
 * Table
 * ----------------------------------------------------------------------
 * Raw table/th/td tags are already styled at the base layer in
 * globals.css. This wrapper just adds a horizontally-scrollable
 * container so wide tables degrade gracefully on mobile.
 */
export function Table({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-border">
      <table className={cn("min-w-full", className)} {...props} />
    </div>
  );
}
