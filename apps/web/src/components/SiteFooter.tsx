import Link from 'next/link';
import { Toolbox } from '@/components/Toolbox';

const LINKS = [
  { href: '/search', label: 'Browse tools' },
  { href: '/add-tool', label: 'Lend a tool' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-muted">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Toolbox className="size-6" />
          <span className="font-heading text-lg font-bold tracking-tight">ToolShare</span>
        </Link>

        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Toolshare · Phoenix, AZ
        </p>
      </div>
    </footer>
  );
}
