import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { ConfirmReturn } from '@/components/bookings/ConfirmReturn';

export const metadata: Metadata = { title: 'Confirm return' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConfirmReturnPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <ConfirmReturn bookingId={id} />
      </main>
    </>
  );
}
