import type { Metadata } from 'next';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = { title: 'Book tool' };

interface Props {
  // Next 16 delivers both as Promises.
  params: Promise<{ toolId: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function BookingPage({ params, searchParams }: Props) {
  const [{ toolId }, { start, end }] = await Promise.all([params, searchParams]);

  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <BookingFlow toolId={toolId} initialStart={start} initialEnd={end} />
      </main>
    </>
  );
}
