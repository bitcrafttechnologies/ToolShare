import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Toolbox } from '@/components/Toolbox';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
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
        <h1 className="font-heading text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start renting tools in Phoenix today
        </p>

        <div className="mt-6">
          {/* Suspense boundary required: RegisterForm reads ?invite= via useSearchParams. */}
          <Suspense fallback={<div className="h-96" />}>
            <RegisterForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-primary hover:text-primary-600">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:text-primary-600">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-600">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
