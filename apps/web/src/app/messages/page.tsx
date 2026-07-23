import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { ConversationsView } from '@/components/messages/ConversationsView';

export const metadata: Metadata = { title: 'Messages' };

export default function MessagesPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Messages</h1>
        <p className="mt-2 text-muted-foreground">Your booking conversations.</p>
        <ConversationsView />
      </main>
    </>
  );
}
