'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@toolshare/lib';

interface Props {
  photos: string[];
  title: string;
}

const VISIBLE_THUMBS = 4;

/**
 * Photo gallery — Figma "screen-tool-detail" (2023:360): one large frame
 * with a thumbnail strip beneath, the last tile showing a "+N more" count.
 * Clicking a thumbnail swaps the main image.
 */
export function ToolGallery({ photos, title }: Props) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-md bg-surface-muted text-muted-foreground">
        <ImageOff size={40} aria-hidden="true" />
        <span className="sr-only">No photos provided for this tool</span>
      </div>
    );
  }

  const thumbs = photos.slice(0, VISIBLE_THUMBS);
  const overflow = photos.length - VISIBLE_THUMBS;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-surface-muted">
        <Image
          src={photos[active]!}
          alt={`${title} — photo ${active + 1} of ${photos.length}`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      </div>

      {photos.length > 1 ? (
        <ul className="mt-3 flex list-none gap-3 pl-0">
          {thumbs.map((photo, i) => {
            const isLastVisible = i === VISIBLE_THUMBS - 1 && overflow > 0;

            return (
              <li key={photo}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={active === i ? 'true' : undefined}
                  className={cn(
                    'relative size-20 overflow-hidden rounded-sm border-2 transition-colors',
                    active === i ? 'border-primary' : 'border-transparent hover:border-border-strong'
                  )}
                >
                  <Image
                    src={photo}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {/* The overflow count sits on the last visible thumb, which
                      still selects its own photo — it's a hint, not a lightbox. */}
                  {isLastVisible ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-stone-900/70 text-sm font-semibold text-stone-50">
                      +{overflow} more
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
