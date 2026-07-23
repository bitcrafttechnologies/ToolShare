'use client';

import type { User } from '@supabase/supabase-js';
import { useSessionContext } from '@/components/SessionProvider';

/**
 * The signed-in user in Client Components, or null when signed out.
 *
 * Backed by a single app-wide session (see SessionProvider) rather than a
 * per-component `getUser()` call — many islands use this hook at once
 * (header, notifiers, one favorite heart per card), and independent calls
 * flooded the auth endpoint. Return type is unchanged (`User | null`), so
 * callers didn't change; the brief `undefined` "resolving" state is
 * normalized to null here.
 *
 * Server Components should still read the user from
 * `createServerSupabaseClient()` directly.
 */
export function useSessionUser(): User | null {
  return useSessionContext() ?? null;
}
