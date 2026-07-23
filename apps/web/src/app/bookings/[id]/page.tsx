import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { BookingDetail } from '@/components/bookings/BookingDetail';

export const metadata: Metadata = { title: 'Booking' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <BookingDetail bookingId={id} />
      </main>
    </>
  );
}
