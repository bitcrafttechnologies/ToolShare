'use client';

import Link from 'next/link';
import { useFavoriteTools } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import { ToolCard } from '@/components/ToolCard';

const { EmptyState, Spinner } = Components;

export function FavoritesView() {
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();
  const { data: tools, isLoading } = useFavoriteTools(supabase, user?.id);

  if (!user) {
    return (
      <EmptyState
        className="mt-8"
        title="Sign in to see your saved tools"
        description="Tap the heart on any tool to save it here for later."
        action={
          <Link
            href="/login?next=/favorites"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
        <span className="sr-only">Loading saved tools…</span>
      </div>
    );
  }

  if (!tools?.length) {
    return (
      <EmptyState
        className="mt-8"
        title="No saved tools yet"
        description="Tap the heart on any tool and it'll show up here."
        action={
          <Link
            href="/search"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Browse tools
          </Link>
        }
      />
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
