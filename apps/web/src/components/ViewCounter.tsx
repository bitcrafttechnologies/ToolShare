'use client';

import { useEffect, useRef } from 'react';
import { useIncrementToolViews } from '@toolshare/supabase';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Fires the "Times viewed" counter once per page load (TKT-00010).
 *
 * increment_tool_views() has always existed in the schema, but nothing in
 * the app ever called it — the detail page is statically generated (ISR)
 * with no client-side effect wired to invoke it, so the stat sat at 0
 * regardless of traffic. Renders nothing; a client island purely for this
 * one side effect, same reasoning as <AvailabilityPill>.
 */
export function ViewCounter({ toolId }: { toolId: string }) {
  const supabase = getSupabaseBrowserClient();
  const { mutate } = useIncrementToolViews(supabase);
  // Guards StrictMode's dev-mode double-invoke from counting one visit twice.
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (firedFor.current === toolId) return;
    firedFor.current = toolId;
    mutate(toolId);
  }, [toolId, mutate]);

  return null;
}
