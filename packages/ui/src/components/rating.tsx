import { cn } from "@toolshare/lib";

/**
 * Rating
 * ----------------------------------------------------------------------
 * Star rating display (read-only). Used on ToolCard, owner profiles,
 * and review summaries. Supports partial stars via a clipped overlay.
 */
export interface RatingProps {
  value: number; // e.g. 4.5
  // `| undefined` throughout — the repo sets exactOptionalPropertyTypes,
  // so an optional prop must accept an explicit undefined to be passed one.
  count?: number | undefined; // number of reviews
  size?: "sm" | "default" | undefined;
  className?: string | undefined;
}

function Star({ fillPct }: { fillPct: number }) {
  return (
    <span className="relative inline-block">
      <svg viewBox="0 0 24 24" className="size-full text-stone-300" fill="currentColor" aria-hidden="true">
        <path d="M12 2.5 14.9 9l7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.6 9.1 9 12 2.5Z" />
      </svg>
      <span
        className="absolute inset-0 overflow-hidden text-gold-400"
        style={{ width: `${fillPct * 100}%` }}
      >
        <svg viewBox="0 0 24 24" className="size-full" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5 14.9 9l7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.6 9.1 9 12 2.5Z" />
        </svg>
      </span>
    </span>
  );
}

export function Rating({ value, count, size = "default", className }: RatingProps) {
  const stars = [0, 1, 2, 3, 4].map((i) => {
    const fill = Math.min(1, Math.max(0, value - i));
    return <Star key={i} fillPct={fill} />;
  });

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      <span
        className={cn("flex gap-0.5", size === "sm" ? "[&>span]:size-3.5" : "[&>span]:size-4")}
        role="img"
        aria-label={`Rated ${value.toFixed(1)} out of 5${count ? ` from ${count} reviews` : ""}`}
      >
        {stars}
      </span>
      <span className="font-medium text-foreground" aria-hidden="true">
        {value.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-muted-foreground" aria-hidden="true">
          ({count})
        </span>
      )}
    </span>
  );
}
