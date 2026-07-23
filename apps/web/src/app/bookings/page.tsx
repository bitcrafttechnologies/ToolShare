import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { BookingsView } from '@/components/bookings/BookingsView';

export const metadata: Metadata = { title: 'Your bookings' };

export default function BookingsPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Your bookings</h1>
        <p className="mt-2 text-muted-foreground">
          Tools you&apos;ve rented, and requests on tools you lend.
        </p>
        <BookingsView />
      </main>
    </>
  );
}
