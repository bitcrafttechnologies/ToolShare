import * as React from "react";
import { cn } from "@toolshare/lib";
import { IconButton } from "../components/icon-button";
// No stylesheet import here — a component pulling in toolshare.css makes it
// a second CSS entry point, and because that file imports tailwindcss the
// bundler emits an entire duplicate utility build. The app imports it once.

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  className,
  page,
  pageCount,
  onPageChange,
  ...props
}: PaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-2", className)}
      {...props}
    >
      <IconButton
        label="Previous page"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      </IconButton>
      <span className="px-2 text-sm text-muted-foreground" aria-live="polite">
        Page {page} of {pageCount}
      </span>
      <IconButton
        label="Next page"
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      </IconButton>
    </nav>
  );
}
