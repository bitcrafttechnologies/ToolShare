'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * One auth session for the whole app.
 *
 * Every island that needs the user (header, both notifiers, and a favorite
 * heart on EACH card) used to call `supabase.auth.getUser()` on mount — so a
 * grid of 12 cards fired ~15 `/user` requests per page load. That floods the
 * auth logs and can trip Supabase's rate limits mid-pilot. This provider makes
 * the single call + one `onAuthStateChange` subscription; `useSessionUser`
 * reads from context.
 *
 * `undefined` = still resolving; `null` = resolved, signed out.
 */
const SessionContext = createContext<User | null | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    void supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (active) setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

/** The signed-in user, or null. `undefined` briefly while the session resolves. */
export function useSessionContext() {
  return useContext(SessionContext);
}
