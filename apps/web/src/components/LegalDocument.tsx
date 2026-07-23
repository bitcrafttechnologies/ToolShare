import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';

interface Props {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Shared shell for the terms/privacy pages. The globals.css base layer
 * already styles headings, paragraphs, lists and links, so this only adds
 * prose rhythm (spacing between blocks) via arbitrary-variant selectors.
 */
export function LegalDocument({ title, lastUpdated, children }: Props) {
  return (
    <>
      <SiteHeader />
      <main className="w-full mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {lastUpdated}</p>

        <div className="mt-8 text-[0.95rem] leading-relaxed [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_li]:mb-1 [&_p]:mb-4 [&_ul]:mb-4">
          {children}
        </div>
      </main>
    </>
  );
}
