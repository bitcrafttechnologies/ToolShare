'use client';

import { useReviewsForTool } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const { Avatar, Rating, Spinner } = Components;

interface Props {
  toolId: string;
}

export function ReviewList({ toolId }: Props) {
  const supabase = getSupabaseBrowserClient();
  const { data: reviews, isLoading } = useReviewsForTool(supabase, toolId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
        <span className="sr-only">Loading reviews…</span>
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <div>
        <h2 className="font-heading text-xl font-bold">Reviews</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No reviews yet — be the first to rent this tool.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-bold">
        Reviews <span className="text-muted-foreground">({reviews.length})</span>
      </h2>

      <ul className="mt-4 flex list-none flex-col gap-6 pl-0">
        {reviews.map((review) => (
          <li key={review.id} className="flex gap-3">
            <Avatar
              src={review.reviewer?.avatar_url ?? undefined}
              name={review.reviewer?.display_name ?? 'Renter'}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium">{review.reviewer?.display_name ?? 'Renter'}</span>
                <Rating value={review.rating} size="sm" />
                {review.created_at ? (
                  <time dateTime={review.created_at} className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                ) : null}
              </div>
              {review.comment ? (
                <p className="mt-1 text-sm leading-relaxed">{review.comment}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
