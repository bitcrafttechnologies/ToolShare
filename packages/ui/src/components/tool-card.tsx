import { cn } from "@toolshare/lib";
import { Card } from "./card";
import { Avatar } from "./avatar";
import { StatusBadge, type ToolStatus } from "./status-badge";
import { CategoryTag, type ToolCategory } from "./category-tag";
import { Rating } from "./rating";

/**
 * ToolCard
 * ----------------------------------------------------------------------
 * The core browsing/listing unit — used identically whether the current
 * user is looking at someone else's listing (borrower context) or their
 * own (lender context); the `isOwner` flag only changes the footer
 * action, not the overall structure, so both roles share one visual
 * language as discussed in the unified-flow design direction.
 *
 * Pricing is optional by design: when `price` is omitted the card shows
 * a "Free" tag instead of an empty/broken price slot, since listings
 * may be free or paid (deposit included).
 */
export interface ToolCardProps {
  imageUrl?: string;
  title: string;
  category: ToolCategory;
  status: ToolStatus;
  /** Price per day/use. Omit for free listings. */
  price?: number;
  /** Optional refundable deposit, only shown when price is set. */
  deposit?: number;
  distance?: string; // e.g. "0.4 mi away"
  owner: {
    name: string;
    avatarUrl?: string;
    verified?: boolean;
    rating?: number;
    reviewCount?: number;
  };
  isOwner?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ToolCard({
  imageUrl,
  title,
  category,
  status,
  price,
  deposit,
  distance,
  owner,
  isOwner,
  onClick,
  className,
}: ToolCardProps) {
  const isFree = price === undefined;

  return (
    <Card
      className={cn(
        "group flex flex-col transition-shadow duration-150",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
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
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-stone-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-10" aria-hidden="true">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
            </svg>
          </div>
        )}
        <div className="absolute left-2.5 top-2.5">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold leading-snug">
            {title}
          </h3>
          <span
            className={cn(
              "shrink-0 whitespace-nowrap text-sm font-semibold",
              isFree ? "text-secondary-600" : "text-foreground"
            )}
          >
            {isFree ? "Free" : `$${price}/day`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CategoryTag category={category} />
          {!isFree && deposit !== undefined && (
            <span className="text-xs text-muted-foreground">
              ${deposit} deposit
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={owner.avatarUrl}
              name={owner.name}
              size="sm"
              verified={owner.verified}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight">
                {isOwner ? "You" : owner.name}
              </p>
              {owner.rating !== undefined && (
                <Rating
                  value={owner.rating}
                  count={owner.reviewCount}
                  size="sm"
                />
              )}
            </div>
          </div>
          {distance && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {distance}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
