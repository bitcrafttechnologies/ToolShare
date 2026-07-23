'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@toolshare/lib';

interface Props {
  defaultValue?: string;
  /** `hero` is the large pill on the home page; `inline` sits above results. */
  variant?: 'hero' | 'inline';
  placeholder?: string;
}

/**
 * Search field — Figma "screen-browse-home" (2023:6) hero, and the compact
 * variant above search results.
 *
 * Preserves every other query param on submit so an active category filter
 * survives a text search.
 */
export function SearchBar({
  defaultValue = '',
  variant = 'hero',
  placeholder = 'Search tools, categories or projects...',
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed) {
      params.set('q', trimmed);
    } else {
      params.delete('q');
    }
    router.push(params.size ? `/search?${params.toString()}` : '/search');
  }

  const hero = variant === 'hero';

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <label htmlFor="tool-search" className="sr-only">
        Search tools
      </label>
      <Search
        size={hero ? 20 : 16}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
          hero ? 'left-5' : 'left-3.5'
        )}
      />
      <input
        id="tool-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-full border border-border bg-surface text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary-400 focus:ring-2 focus:ring-primary-200',
          hero ? 'h-14 pl-13 pr-5 text-base' : 'h-11 pl-10 pr-4 text-sm'
        )}
      />
    </form>
  );
}
