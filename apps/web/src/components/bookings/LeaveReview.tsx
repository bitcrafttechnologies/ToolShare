'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useBooking,
  createReviewRepository,
  reviewKeys,
  profileKeys,
  toolKeys,
} from '@toolshare/supabase';
import type { CreateReviewRequest } from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { cn } from '@toolshare/lib';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';

const { Button, Card, EmptyState, Spinner, Textarea, Alert } = Components;

interface Props {
  bookingId: string;
}

export function LeaveReview({ bookingId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();
  const { data: booking, isLoading } = useBooking(supabase, bookingId);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState<boolean | null>(null);

  const isOwner = !!user && !!booking && user.id === booking.owner_id;
  const isRenter = !!user && !!booking && user.id === booking.renter_id;
  const isParticipant = isOwner || isRenter;
  const isCompleted = booking?.booking_status === 'completed';

  // The renter's review is the tool review; the owner reviews the renter.
  const primaryType = isOwner ? 'renter' : 'tool';

  // Has this user already reviewed this booking? Checked once the role is known.
  useEffect(() => {
    if (!user || !booking || !isParticipant || !isCompleted) return;
    let active = true;
    const repo = createReviewRepository(supabase);
    void repo
      .hasReviewed(bookingId, user.id, primaryType)
      .then((done) => {
        if (active) setAlreadyReviewed(done);
      })
      .catch(() => {
        if (active) setAlreadyReviewed(false);
      });
    return () => {
      active = false;
    };
  }, [user, booking, isParticipant, isCompleted, supabase, bookingId, primaryType]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (!booking || !isParticipant) {
    return (
      <EmptyState
        title="Review unavailable"
        description="This booking can't be reviewed from here."
        action={
          <Link
            href="/bookings"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Back to bookings
          </Link>
        }
      />
    );
  }

  if (!isCompleted) {
    return (
      <EmptyState
        title="Not ready to review"
        description="You can leave a review once the rental is marked returned."
        action={
          <Link
            href={`/bookings/${bookingId}`}
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            View booking
          </Link>
        }
      />
    );
  }

  if (alreadyReviewed) {
    return (
      <EmptyState
        title="You've already reviewed this rental"
        description="Thanks — you can only leave one review per booking."
        action={
          <Link
            href={`/bookings/${bookingId}`}
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Back to booking
          </Link>
        }
      />
    );
  }

  const revieweeName = isOwner
    ? (booking.renter?.display_name ?? 'the renter')
    : (booking.owner?.display_name ?? 'the owner');

  async function submit() {
    if (!user || !booking || rating < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      const repo = createReviewRepository(supabase);
      const trimmed = comment.trim();
      const base: Pick<CreateReviewRequest, 'booking_id' | 'reviewer_id' | 'rating'> = {
        booking_id: bookingId,
        reviewer_id: user.id,
        rating,
      };

      if (isOwner) {
        // Owner rates the renter.
        await repo.createReview({
          ...base,
          review_type: 'renter',
          reviewee_id: booking.renter_id,
          ...(trimmed ? { comment: trimmed } : {}),
        });
      } else {
        // Renter rates the tool (feeds the listing rating shown everywhere)
        // and the owner (feeds their profile rating) with the same score.
        if (booking.tool_id) {
          await repo.createReview({
            ...base,
            review_type: 'tool',
            tool_id: booking.tool_id,
            reviewee_id: booking.owner_id,
            ...(trimmed ? { comment: trimmed } : {}),
          });
        }
        await repo.createReview({
          ...base,
          review_type: 'owner',
          reviewee_id: booking.owner_id,
          ...(trimmed ? { comment: trimmed } : {}),
        });
      }

      // The trigger has now updated the DB ratings; refresh the client caches
      // that show them. (The tool detail page's headline rating is statically
      // generated, so it reflects on the next ISR revalidation — the review
      // list and profile ratings update immediately.)
      const revieweeId = isOwner ? booking.renter_id : booking.owner_id;
      void qc.invalidateQueries({ queryKey: profileKeys.detail(revieweeId) });
      void qc.invalidateQueries({ queryKey: reviewKeys.forUser(revieweeId) });
      if (booking.tool_id) {
        void qc.invalidateQueries({ queryKey: reviewKeys.forTool(booking.tool_id) });
        void qc.invalidateQueries({ queryKey: toolKeys.detail(booking.tool_id) });
      }

      router.push(`/bookings/${bookingId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your review');
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        href={`/bookings/${bookingId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600"
      >
        <span aria-hidden="true">←</span> Booking
      </Link>

      <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">Leave a review</h1>
      <p className="mt-2 text-muted-foreground">
        How was your rental of{' '}
        <span className="font-medium text-foreground">{booking.tool?.title ?? 'this tool'}</span>{' '}
        with {revieweeName}?
      </p>

      <Card className="mt-6 flex flex-col gap-5 p-6">
        <div>
          <p className="mb-2 text-sm font-medium">Rating</p>
          <div
            className="flex gap-1"
            role="radiogroup"
            aria-label="Star rating"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const filled = (hover || rating) >= value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  onMouseEnter={() => setHover(value)}
                  onClick={() => setRating(value)}
                  className="rounded-sm p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    aria-hidden="true"
                    className={cn(
                      'transition-colors',
                      filled ? 'fill-gold-400 text-gold-400' : 'text-stone-300',
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="review-comment" className="mb-2 block text-sm font-medium">
            Comment <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="review-comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Was the tool as described? How did pickup and return go?"
          />
        </div>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <Button size="lg" disabled={rating < 1} isLoading={submitting} onClick={() => void submit()}>
          Submit review
        </Button>
      </Card>
    </div>
  );
}
