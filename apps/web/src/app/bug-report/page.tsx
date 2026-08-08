import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { BugReportForm } from '@/components/BugReportForm';

// Signed-in testers only — the route is also listed in PROTECTED_PATHS in
// src/middleware.ts, which is what actually enforces it.
export const metadata: Metadata = {
  title: 'Report a bug',
  robots: { index: false, follow: false },
};

export default function BugReportPage() {
  return (
    <>
      <SiteHeader showSearch />

      <main className="w-full mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">🐛 Bug Report</h1>
        <p className="mt-3 text-muted-foreground">
          Thanks for testing! Fill out what you can — even a rough version helps a ton. Only the
          first question and the severity are required, so don&apos;t let a blank box stop you from
          sending.
        </p>

        <div className="mt-8">
          <BugReportForm />
        </div>
      </main>
    </>
  );
}
