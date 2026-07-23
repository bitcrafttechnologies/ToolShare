import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { ProfileView } from '@/components/ProfileView';

export const metadata: Metadata = { title: 'Your profile' };

export default function ProfilePage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <ProfileView />
      </main>
    </>
  );
}
