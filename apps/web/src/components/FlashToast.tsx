'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Components } from '@toolshare/ui';

const { useToast } = Components;

/**
 * FlashToast
 * ----------------------------------------------------------------------
 * Renders nothing; turns a redirect's query flag into a toast. A form that
 * finishes on another page redirects here with the flag set
 * (e.g. router.push('/?waitlist=1')) and this shows the matching message.
 *
 * Add a flag by adding a key below — the key IS the query param name.
 */
const FLASH_MESSAGES: Record<string, { title: string; variant: Components.ToastVariant }> = {
  waitlist: {
    title:
      'Thank you, while we are still testing the pilot, you are free to explore what is currently on the site.',
    variant: 'success',
  },
};

export function FlashToast() {
  const searchParams = useSearchParams();
  const { show } = useToast();
  // Guards against a second fire in React's development double-effect, and
  // against re-firing if the URL changes for an unrelated reason.
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;

    const param = Object.keys(FLASH_MESSAGES).find((key) => searchParams.get(key));
    const message = param ? FLASH_MESSAGES[param] : undefined;
    if (!param || !message) return;

    shown.current = true;
    show(message);

    // Drop the flag so a refresh or a back-navigation doesn't replay the
    // toast. history.replaceState rather than router.replace: this stays
    // client-side, with no server round trip and no re-render of the page.
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [searchParams, show]);

  return null;
}
