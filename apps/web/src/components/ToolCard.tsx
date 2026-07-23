import Link from 'next/link';
import Image from 'next/image';
import type { Tool } from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { FavoriteButton } from '@/components/FavoriteButton';

const { CategoryTag, Rating, CategoryIcon } = Components;

interface Props {
  tool: Tool;
  /** Renders the favorite heart. Omit on grids where favouriting isn't offered. */
  favoritable?: boolean;
  priority?: boolean;
}

/**
 * Tool card — Figma "screen-browse-home" (2023:6) "Popular near you" grid.
 * Image with a category tag and favorite heart overlaid, then title, owner,
 * rating and rate.
 */
export function ToolCard({ tool, favoritable = true, priority = false }: Props) {
  const photo = tool.photo_urls[0];
  const slug = tool.category?.slug;

  const unavailable = tool.available_now === false;

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface-muted">
        {photo ? (
          <Image
            src={photo}
            alt={tool.title}
            fill
            priority={priority}
            className={
              unavailable
                ? 'object-cover opacity-60'
                : 'object-cover transition-transform duration-300 group-hover:scale-105'
            }
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <CategoryIcon category={slug ?? ''} size={40} />
          </div>
        )}

        {slug ? (
          <CategoryTag
            category={slug as never}
            label={tool.category?.name}
            className="absolute left-3 top-3 uppercase tracking-wide shadow-sm"
          />
        ) : null}

        {unavailable ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-stone-50">
            Unavailable
          </span>
        ) : null}

        {favoritable ? (
          <FavoriteButton toolId={tool.id} className="absolute right-3 top-3 z-10" />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3">
        <h3 className="font-heading text-base font-semibold leading-snug">
          {/* Stretched link so the whole card is one hit target, while the
              favorite button stays a sibling rather than a nested control.
              `text-foreground` must sit on the anchor itself: globals.css
              styles bare `a` as primary-600, which beats an inherited
              color from the heading. */}
          <Link
            href={`/tools/${tool.id}`}
            className="text-foreground after:absolute after:inset-0 hover:text-primary"
          >
            {tool.title}
          </Link>
        </h3>

        <p className="text-sm text-muted-foreground">
          {tool.owner?.display_name ?? tool.address_display ?? 'Phoenix Metro Area'}
        </p>

        {tool.review_count > 0 ? (
          <Rating value={tool.rating} count={tool.review_count} size="sm" />
        ) : (
          <span className="text-sm text-muted-foreground">No reviews yet</span>
        )}

        <PriceLabel tool={tool} />
      </div>
    </article>
  );
}

function PriceLabel({ tool }: { tool: Tool }) {
  const [amount, unit] =
    tool.daily_rate != null
      ? [tool.daily_rate, 'day']
      : tool.hourly_rate != null
        ? [tool.hourly_rate, 'hr']
        : tool.weekly_rate != null
          ? [tool.weekly_rate, 'week']
          : [null, null];

  if (amount == null) {
    return <span className="mt-1 text-sm text-muted-foreground">Contact for price</span>;
  }

  return (
    <p className="mt-1">
      <span className="font-heading text-lg font-bold text-primary">${amount}</span>
      <span className="text-sm text-muted-foreground"> / {unit}</span>
    </p>
  );
}
