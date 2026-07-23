import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Session-less client for build-time code.
 *
 * `generateStaticParams` and `generateMetadata` for statically-rendered
 * routes run without an HTTP request, so touching `cookies()` there throws
 * ("used `cookies()` inside `generateStaticParams`"). There is no user to
 * authenticate at build time anyway — this reads public, RLS-visible rows
 * with the anon key and nothing else.
 */
export function createStaticSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(async ({ name, value, options }) =>
              (await cookieStore).set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component — cookies set by middleware already
          }
        },
      },
    },
  );
}
