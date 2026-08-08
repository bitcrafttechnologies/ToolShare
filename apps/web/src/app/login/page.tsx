import type { Metadata } from 'next';
import Link from 'next/link';
import { Components } from '@toolshare/ui';
import { LoginForm } from '@/components/auth/LoginForm';
import { Toolbox } from '@/components/Toolbox';

const { Alert } = Components;

interface Props {
  // Next 16: searchParams is a Promise and must be awaited before use.
  searchParams: Promise<{ next?: string; error?: string }>;
}

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;

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
        <h1 className="font-heading text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your Toolshare account</p>

        {error ? (
          <Alert variant="danger" className="mt-6">
            Authentication failed. Please try again.
          </Alert>
        ) : null}

        <div className="mt-6">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Toolshare?{' '}
          <Link href="/register" className="font-medium text-primary hover:text-primary-600">
            Create an account
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-muted-foreground">
          No pilot code yet?{' '}
          <Link href="/waiting-list" className="font-medium text-primary hover:text-primary-600">
            Ask to be added to the waiting list
          </Link>
        </p>
      </div>
    </main>
  );
}
