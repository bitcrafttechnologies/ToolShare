import Link from 'next/link';
import type { Category } from '@toolshare/types';
import { Components } from '@toolshare/ui';

const { CategoryIcon, isToolCategory } = Components;

interface Props {
  categories: Category[];
  /** Tool counts keyed by category id, as shown under each tile in the design. */
  counts?: Record<number, number>;
}

/**
 * Category tiles — Figma "screen-browse-home" (2023:6) "Browse by category".
 * Each tile is tinted and outlined in its own category color.
 */
export function CategoryGrid({ categories, counts }: Props) {
  return (
    <ul className="grid list-none grid-cols-2 gap-4 pl-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {categories.map((cat) => {
        const known = isToolCategory(cat.slug);
        const count = counts?.[cat.id];

        return (
          <li key={cat.id}>
            <Link
              href={`/search?category=${cat.id}`}
              className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-border px-3 py-6 text-center transition-transform hover:-translate-y-0.5"
              style={
                known
                  ? {
                      borderColor: `var(--color-cat-${cat.slug})`,
                      backgroundColor: `var(--color-cat-${cat.slug}-bg)`,
                    }
                  : undefined
              }
            >
              <CategoryIcon category={cat.slug} size={28} tinted />
              <span className="font-heading text-sm font-semibold text-foreground">
                {cat.name}
              </span>
              {count != null ? (
                <span className="text-xs text-muted-foreground">
                  {count.toLocaleString()} {count === 1 ? 'tool' : 'tools'}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
