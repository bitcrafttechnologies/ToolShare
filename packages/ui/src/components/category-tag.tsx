import { cn } from "@toolshare/lib";

/**
 * CategoryTag
 * ----------------------------------------------------------------------
 * Renders one of ToolShare's ten tool categories using the matching token
 * colors defined in globals.css (--color-cat-*).
 *
 * The set is closed on purpose, and it is closed against the database:
 * `ToolCategory` is exactly the `slug` column of the `categories` table.
 * An 11th category is a migration + a token pair in globals.css + an
 * entry here — never an arbitrary color at the call site.
 *
 * `labels` intentionally mirrors `categories.name` so server-rendered
 * copy matches a tag rendered from a slug alone. Prefer passing the
 * category name straight from the query when you have the row; this map
 * is the fallback for when all you hold is the slug.
 */
export type ToolCategory =
  | "power-tools"
  | "hand-tools"
  | "landscaping"
  | "concrete"
  | "automotive"
  | "plumbing"
  | "electrical"
  | "trailers"
  | "aerial"
  | "welding";

const categoryLabels: Record<ToolCategory, string> = {
  "power-tools": "Power Tools",
  "hand-tools": "Hand Tools",
  landscaping: "Landscaping",
  concrete: "Concrete/Masonry",
  automotive: "Automotive",
  plumbing: "Plumbing",
  electrical: "Electrical",
  trailers: "Trailers/Hauling",
  aerial: "Aerial/Lifts",
  welding: "Welding",
};

// Tailwind's arbitrary-value syntax referencing the CSS variables directly,
// since these aren't part of the generated @theme palette (they're a
// closed domain-specific set rather than general-purpose utilities).
const categoryStyles: Record<ToolCategory, string> = {
  "power-tools": "bg-[var(--color-cat-power-tools-bg)] text-[var(--color-cat-power-tools)]",
  "hand-tools": "bg-[var(--color-cat-hand-tools-bg)] text-[var(--color-cat-hand-tools)]",
  landscaping: "bg-[var(--color-cat-landscaping-bg)] text-[var(--color-cat-landscaping)]",
  concrete: "bg-[var(--color-cat-concrete-bg)] text-[var(--color-cat-concrete)]",
  automotive: "bg-[var(--color-cat-automotive-bg)] text-[var(--color-cat-automotive)]",
  plumbing: "bg-[var(--color-cat-plumbing-bg)] text-[var(--color-cat-plumbing)]",
  electrical: "bg-[var(--color-cat-electrical-bg)] text-[var(--color-cat-electrical)]",
  trailers: "bg-[var(--color-cat-trailers-bg)] text-[var(--color-cat-trailers)]",
  aerial: "bg-[var(--color-cat-aerial-bg)] text-[var(--color-cat-aerial)]",
  welding: "bg-[var(--color-cat-welding-bg)] text-[var(--color-cat-welding)]",
};

/** Type guard for the many places a category arrives as a plain string. */
export function isToolCategory(value: string): value is ToolCategory {
  return value in categoryStyles;
}

export interface CategoryTagProps {
  category: ToolCategory;
  /** Overrides the slug-derived label — pass `categories.name` when you have it. */
  label?: string | undefined;
  className?: string | undefined;
}

export function CategoryTag({ category, label, className }: CategoryTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        categoryStyles[category],
        className
      )}
    >
      {label ?? categoryLabels[category]}
    </span>
  );
}
