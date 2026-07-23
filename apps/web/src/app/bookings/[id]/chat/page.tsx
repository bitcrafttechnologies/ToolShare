import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { BookingChat } from '@/components/bookings/BookingChat';

export const metadata: Metadata = { title: 'Messages' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookingChatPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 sm:px-6">
        <BookingChat bookingId={id} />
      </main>
    </>
  );
}
