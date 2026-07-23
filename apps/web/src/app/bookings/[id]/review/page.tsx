import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { LeaveReview } from '@/components/bookings/LeaveReview';

export const metadata: Metadata = { title: 'Leave a review' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeaveReviewPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <LeaveReview bookingId={id} />
      </main>
    </>
  );
}
