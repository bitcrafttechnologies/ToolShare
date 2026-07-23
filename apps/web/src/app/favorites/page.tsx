import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { FavoritesView } from '@/components/FavoritesView';

export const metadata: Metadata = { title: 'Saved tools' };

export default function FavoritesPage() {
  return (
    <>
      <SiteHeader showSearch />
      <main className="w-full mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Saved tools</h1>
        <p className="mt-2 text-muted-foreground">Tools you&apos;ve saved for later.</p>
        <FavoritesView />
      </main>
    </>
  );
}
