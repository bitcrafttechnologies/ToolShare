import * as React from "react";
import { cn } from "@toolshare/lib";
import { StatusBadge, type ToolStatus } from "./status-badge";
import { CategoryTag, type ToolCategory } from "./category-tag";

/**
 * ToolListItem
 * ----------------------------------------------------------------------
 * Compact horizontal row variant of ToolCard — for dense contexts like
 * "My Tools" management or list-view search results, where a full image
 * grid would waste space. Shares the same free/paid handling as ToolCard.
 */
export interface ToolListItemProps {
  imageUrl?: string;
  title: string;
  category: ToolCategory;
  status: ToolStatus;
  price?: number;
  onClick?: () => void;
  className?: string;
}

export function ToolListItem({
  imageUrl,
  title,
  category,
  status,
  price,
  onClick,
  className,
}: ToolListItemProps) {
  const isFree = price === undefined;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "flex items-center gap-3 rounded-default border border-border bg-surface p-3 transition-colors duration-150",
        onClick && "cursor-pointer hover:bg-surface-muted",
        className
      )}
    >
      <div className="size-14 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-stone-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-5" aria-hidden="true">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug">{title}</p>
        <div className="mt-1 flex items-center gap-2">
          <CategoryTag category={category} />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={cn(
            "text-sm font-semibold",
            isFree ? "text-secondary-600" : "text-foreground"
          )}
        >
          {isFree ? "Free" : `$${price}/day`}
        </span>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
