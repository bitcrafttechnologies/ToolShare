import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BadgeCheck, CalendarDays } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createProfileRepository, createToolRepository } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { SiteHeader } from '@/components/SiteHeader';
import { ToolCard } from '@/components/ToolCard';
import { formatDate } from '@/lib/format';

const { Avatar, Badge, Rating, EmptyState } = Components;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const profile = await createProfileRepository(supabase)
    .getProfile(id)
    .catch(() => null);
  if (!profile) return {};
  return {
    title: `${profile.display_name}'s tools for rent | Toolshare`,
    description: `Rent tools from ${profile.display_name} in the Phoenix metro area.`,
  };
}

export default async function LenderProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const profileRepo = createProfileRepository(supabase);
  const toolRepo = createToolRepository(supabase);

  const [profile, tools] = await Promise.all([
    profileRepo.getProfile(id).catch(() => null),
    toolRepo.getToolsByOwner(id).catch(() => []),
  ]);

  if (!profile) notFound();

  // Public view: only their live listings. Ones blocked today still show, with
  // the "Unavailable" pill ToolCard renders from available_now.
  const listed = tools.filter((t) => t.is_available);

  return (
    <>
      <SiteHeader showSearch />

      <main className="w-full mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={profile.avatar_url ?? undefined}
            name={profile.display_name}
            size="xl"
            verified={profile.is_identity_verified}
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-3xl font-bold tracking-tight">
                {profile.display_name}
              </h1>
              {profile.is_identity_verified ? (
                <Badge variant="gold">
                  <BadgeCheck size={12} aria-hidden="true" />
                  Verified
                </Badge>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {profile.review_count_owner > 0 ? (
                <Rating value={profile.owner_rating} count={profile.review_count_owner} size="sm" />
              ) : (
                <span>No reviews yet</span>
              )}
              {profile.created_at ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={14} aria-hidden="true" />
                  Since {formatDate(profile.created_at.slice(0, 10), {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {profile.bio ? (
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        ) : null}

        <section className="mt-10">
          <h2 className="mb-6 font-heading text-2xl font-bold">
            {listed.length > 0
              ? `${listed.length} tool${listed.length === 1 ? '' : 's'} for rent`
              : 'Tools for rent'}
          </h2>

          {listed.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listed.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`${profile.display_name} isn't lending anything yet`}
              description="Check back later, or browse tools from other neighbors."
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
        </section>
      </main>
    </>
  );
}
