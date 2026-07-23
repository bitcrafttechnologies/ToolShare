import Link from 'next/link';
import { Toolbox } from '@/components/Toolbox';
import { HeaderAccount } from '@/components/HeaderAccount';

const NAV_LINKS = [
  { href: '/search', label: 'Browse' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/add-tool', label: 'Lend a Tool' },
];

/**
 * Site header — Figma "screen-browse-home" (2023:6) top bar.
 *
 * Intentionally free of any session read: everything auth-dependent lives
 * in <HeaderAccount>, a client island. That keeps this component (and so
 * every page that renders it, including the statically-generated
 * /tools/[id]) eligible for static rendering.
 */
export function SiteHeader({
  /** Detail/search pages put the search field in the bar; home puts it in the hero. */
  showSearch = false,
}: {
  showSearch?: boolean;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-primary transition-opacity hover:opacity-80"
        >
          <Toolbox className="size-7" />
          <span className="font-heading text-xl font-bold tracking-tight">ToolShare</span>
        </Link>

        {showSearch ? (
          <form action="/search" className="hidden min-w-0 flex-1 justify-center md:flex">
            <label className="sr-only" htmlFor="header-search">
              Search tools
            </label>
            <div className="relative w-full max-w-md">
              <SearchGlyph />
              <input
                id="header-search"
                name="q"
                type="search"
                placeholder="Search tools near you..."
                className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </form>
        ) : (
          <div className="flex-1" />
        )}

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center">
          <HeaderAccount />
        </div>
      </div>
    </header>
  );
}

function SearchGlyph() {
  return (
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
