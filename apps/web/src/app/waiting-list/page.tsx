import type { Metadata } from 'next';
import Link from 'next/link';
import { WaitingListForm } from '@/components/auth/WaitingListForm';
import { Toolbox } from '@/components/Toolbox';

export const metadata: Metadata = {
  title: 'Join the waiting list',
  description:
    'Toolshare is invite-only while we test in the Phoenix metro. Join the waiting list to hear from us when the full app releases.',
  alternates: { canonical: 'https://toolshare.app/waiting-list' },
};

export default function WaitingListPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-primary transition-opacity hover:opacity-80"
      >
        <Toolbox className="size-8" />
        <span className="font-heading text-2xl font-bold tracking-tight">ToolShare</span>
      </Link>

      <div className="w-full max-w-md rounded-md border border-border bg-surface p-8 shadow-md">
        <h1 className="font-heading text-2xl font-bold">Join the waiting list</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toolshare is in Beta and invite-only while we test across the Phoenix metro. Add your
          email to the waiting list for the full app release, and we&apos;ll let you know as soon
          as it&apos;s ready.
        </p>

        <div className="mt-6">
          <WaitingListForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have a pilot code?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary-600">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
