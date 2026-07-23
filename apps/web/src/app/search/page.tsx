import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createToolRepository } from '@toolshare/supabase';
import { searchByProjectType } from '@toolshare/domain';
import { Components } from '@toolshare/ui';
import { ToolCard } from '@/components/ToolCard';
import { SearchBar } from '@/components/SearchBar';
import { SiteHeader } from '@/components/SiteHeader';

const { EmptyState, CategoryTag, isToolCategory } = Components;

interface Props {
  searchParams: Promise<{ q?: string; category?: string; project?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" tools for rent near Phoenix` : 'Search tools for rent | Toolshare',
  };
}

const PHOENIX_CENTER = { lat: 33.4484, lng: -112.074 };

export default async function SearchPage({ searchParams }: Props) {
  const { q, category, project } = await searchParams;
  const supabase = createServerSupabaseClient();
  const repo = createToolRepository(supabase);

  const categoryId = category ? Number(category) : undefined;

  const [categories, projectTypes] = await Promise.all([
    repo.getCategories().catch(() => []),
    repo.getProjectTypes().catch(() => []),
  ]);

  // A project spans several categories (e.g. "Building a Deck" → power +
  // hand tools), but the search RPC only filters one category at a time, so
  // searchByProjectType fans out per category and dedupes. When a project is
  // selected it takes precedence over q/category.
  const tools = project
    ? await searchByProjectType({
        projectSlug: project,
        projectTypes,
        fetchToolsByCategory: (id) => repo.getTools({ ...PHOENIX_CENTER, categoryId: id }),
      }).catch(() => [])
    : await repo
        .getTools({
          ...PHOENIX_CENTER,
          ...(q ? { query: q } : {}),
          ...(categoryId != null && !Number.isNaN(categoryId) ? { categoryId } : {}),
        })
        .catch(() => []);

  const activeCategory = categories.find((c) => c.id === categoryId);
  const activeProject = projectTypes.find((p) => p.slug === project);

  return (
    <>
      <SiteHeader showSearch />

      <main className="w-full mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 md:hidden">
          <SearchBar defaultValue={q ?? ''} variant="inline" />
        </div>

        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">
              {activeProject
                ? activeProject.name
                : q
                  ? `Results for "${q}"`
                  : activeCategory
                    ? activeCategory.name
                    : 'Browse tools'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
              {activeProject ? ` for ${activeProject.name.toLowerCase()}` : ''} near Phoenix
            </p>
          </div>

          {activeCategory || activeProject ? (
            <div className="flex items-center gap-2">
              {activeCategory && isToolCategory(activeCategory.slug) ? (
                <CategoryTag category={activeCategory.slug} label={activeCategory.name} />
              ) : null}
              <Link
                href={q && !activeProject ? `/search?q=${encodeURIComponent(q)}` : '/search'}
                className="text-sm font-medium text-primary hover:text-primary-600"
              >
                Clear filter
              </Link>
            </div>
          ) : null}
        </div>

        {/* Category rail — keeps faceted URLs one click away and indexable. */}
        <nav aria-label="Filter by category" className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = cat.id === categoryId;
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (!active) params.set('category', String(cat.id));

            return (
              <Link
                key={cat.id}
                href={params.size ? `/search?${params.toString()}` : '/search'}
                aria-current={active ? 'true' : undefined}
                className={
                  active
                    ? 'inline-flex items-center rounded-full border border-primary bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700'
                    : 'inline-flex items-center rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:border-primary-400 hover:text-primary'
                }
              >
                {cat.name}
              </Link>
            );
          })}
        </nav>

        {tools.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} priority={i < 4} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tools matched"
            description={
              q
                ? `Nothing came back for "${q}". Try a broader term, or browse a category.`
                : 'Nothing is listed in this category yet. Try another one.'
            }
            action={
              <Link
                href="/search"
                className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
              >
                Browse all tools
              </Link>
            }
          />
        )}
      </main>
    </>
  );
}
