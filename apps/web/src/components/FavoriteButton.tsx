'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { cn } from '@toolshare/lib';
import { useFavoriteToolIds, useToggleFavorite } from '@toolshare/supabase';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';

interface Props {
  toolId: string;
  /** `overlay` = circular icon over a card image; `button` = labeled button for the detail page. */
  variant?: 'overlay' | 'button';
  className?: string;
}

/**
 * Favorite toggle. The write itself works fine; this component exists mainly
 * to make the *state* unmistakable — a faint gray heart over a photo (the
 * previous design) read as "nothing happened". Signed-out visitors are sent
 * to login rather than silently failing.
 */
export function FavoriteButton({ toolId, variant = 'overlay', className }: Props) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();
  const { data: favoriteIds } = useFavoriteToolIds(supabase, user?.id);
  const toggleFavorite = useToggleFavorite(supabase, user?.id);

  const favorited = favoriteIds?.has(toolId) ?? false;

  function handleClick(e: React.MouseEvent) {
    // Cards wrap a stretched link — don't navigate when hitting the heart.
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/tools/${toolId}`)}`);
      return;
    }
    toggleFavorite.mutate({ toolId, favorited });
  }

  const label = favorited ? 'Saved' : 'Save';
  const aria = favorited ? 'Remove from saved' : 'Save this tool';

  if (variant === 'button') {
    return (
      <button
        type="button"
        aria-label={aria}
        aria-pressed={favorited}
        onClick={handleClick}
        className={cn(
          'inline-flex h-11 items-center justify-center gap-2 rounded-sm border px-4 text-sm font-medium transition-colors',
          favorited
            ? 'border-primary bg-primary-50 text-primary'
            : 'border-border-strong bg-surface text-foreground hover:bg-surface-muted',
          className,
        )}
      >
        <Heart
          size={16}
          aria-hidden="true"
          className={cn('size-4 min-w-4 min-h-4 shrink-0', favorited ? 'fill-primary' : '')}
        />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={aria}
      aria-pressed={favorited}
      onClick={handleClick}
      className={cn(
        // Solid white disc + shadow + hairline ring so it stands out on any
        // photo; pops on click for tactile feedback.
        'inline-flex size-9 items-center justify-center rounded-full bg-surface shadow-md ring-1 ring-stone-900/5 transition-transform active:scale-90',
        className,
      )}
    >
      <Heart
        size={18}
        aria-hidden="true"
        className={cn(
          'size-[18px] min-w-[18px] min-h-[18px] shrink-0 transition-colors',
          favorited ? 'fill-primary text-primary' : 'text-stone-700',
        )}
      />
    </button>
  );
}
