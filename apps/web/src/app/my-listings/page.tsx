import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { MyListings } from '@/components/MyListings';

export const metadata: Metadata = { title: 'Your listings' };

export default function MyListingsPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <MyListings />
      </main>
    </>
  );
}
