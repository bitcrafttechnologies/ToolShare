import type { Metadata } from 'next';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Toolbox } from '@/components/Toolbox';

export const metadata: Metadata = { title: 'Reset your password' };

export default function ForgotPasswordPage() {
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
        <h1 className="font-heading text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll email you a link to choose a new one.
        </p>

        <div className="mt-6">
          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-600">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
