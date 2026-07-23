import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createToolRepository } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ToolCard } from '@/components/ToolCard';
import { SearchBar } from '@/components/SearchBar';
import { SiteHeader } from '@/components/SiteHeader';

const { EmptyState } = Components;

export const metadata: Metadata = {
  title: 'Rent Tools in Phoenix | Toolshare',
};

const PHOENIX_CENTER = { lat: 33.4484, lng: -112.074 };

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const repo = createToolRepository(supabase);

  const [categories, projectTypes, nearbyTools] = await Promise.all([
    repo.getCategories().catch(() => []),
    repo.getProjectTypes().catch(() => []),
    repo.getTools({ ...PHOENIX_CENTER, radiusMiles: 75 }).catch(() => []),
  ]);

  // Counts come off the tools we already fetched rather than a second
  // round-trip — and "N tools" then genuinely means "near you", which is
  // what the tile claims, instead of a global total.
  const counts = nearbyTools.reduce<Record<number, number>>((acc, tool) => {
    acc[tool.category_id] = (acc[tool.category_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero — Figma screen-browse-home (2023:6) */}
        <section className="border-b border-border bg-surface-muted">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              What do you need for your next project?
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Browse by category, or search {nearbyTools.length.toLocaleString()}+ tools near you
            </p>
            <div className="mt-8">
              <SearchBar />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <section className="py-12">
            <h2 className="mb-6 font-heading text-2xl font-bold">Browse by category</h2>
            <CategoryGrid categories={categories} counts={counts} />
          </section>

          {projectTypes.length > 0 ? (
            <section className="flex flex-wrap items-center gap-3 border-t border-border py-8">
              <h2 className="font-heading text-sm font-semibold text-foreground">
                Browse by project:
              </h2>
              <ul className="flex list-none flex-wrap gap-2 pl-0">
                {projectTypes.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/search?project=${project.slug}`}
                      className="inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:border-primary-400 hover:text-primary"
                    >
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="border-t border-border py-12">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="font-heading text-2xl font-bold">Popular near you</h2>
              <Link
                href="/search"
                className="shrink-0 text-sm font-medium text-primary hover:text-primary-600"
              >
                View all
              </Link>
            </div>

            {nearbyTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {nearbyTools.slice(0, 12).map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} priority={i < 3} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No tools nearby yet"
                description="Nothing is listed in the Phoenix metro area right now. Check back soon, or be the first to lend something."
                action={
                  <Link
                    href="/add-tool"
                    className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
                  >
                    Lend a tool
                  </Link>
                }
              />
            )}
          </section>
        </div>
      </main>
    </>
  );
}
