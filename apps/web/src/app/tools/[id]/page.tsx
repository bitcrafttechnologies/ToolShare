import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MapPin, Check, ShieldAlert } from 'lucide-react';
import { createStaticSupabaseClient } from '@/lib/supabase/server';
import { createToolRepository } from '@toolshare/supabase';
import { TOOL_CONDITION_LABELS } from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { ToolBookingPanel } from '@/components/ToolBookingPanel';
import { ReviewList } from '@/components/ReviewList';
import { ToolGallery } from '@/components/ToolGallery';
import { SiteHeader } from '@/components/SiteHeader';
import { FavoriteButton } from '@/components/FavoriteButton';
import { AvailabilityPill } from '@/components/AvailabilityPill';
import { ViewCounter } from '@/components/ViewCounter';

const { CategoryTag, Rating, Avatar, Badge, isToolCategory } = Components;

interface Props {
  // Next 16 hands route params in as a Promise — must be awaited.
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = createStaticSupabaseClient();
  const { data } = await supabase
    .from('tools')
    .select('id')
    .eq('is_available', true)
    .order('view_count', { ascending: false })
    .limit(500);
  return (data ?? []).map((t) => ({ id: t.id as string }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // Statically rendered route — same no-cookies constraint as above.
  const supabase = createStaticSupabaseClient();
  const { data: tool } = await supabase
    .from('tools')
    .select('title, description, photo_urls, address_display, daily_rate')
    .eq('id', id)
    .single();

  if (!tool) return {};

  const photos = (tool.photo_urls ?? []) as string[];

  return {
    title: `Rent ${tool.title as string} in Phoenix`,
    description:
      (tool.description as string | null) ??
      `Rent a ${tool.title as string} near ${(tool.address_display as string | null) ?? 'Phoenix, AZ'} for $${tool.daily_rate as number}/day.`,
    openGraph: {
      images: photos[0] ? [{ url: photos[0], width: 1200, height: 630 }] : [],
    },
    alternates: { canonical: `https://toolshare.app/tools/${id}` },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { id } = await params;
  // Static client on purpose. A listing is public, and this route is
  // prerendered + ISR'd for SEO (see CLAUDE.md) — reading cookies here
  // would silently opt the whole route into dynamic rendering. Anything
  // user-specific on this page is a client island (header, favorites).
  const supabase = createStaticSupabaseClient();
  const repo = createToolRepository(supabase);
  const tool = await repo.getToolById(id).catch(() => null);

  if (!tool) notFound();

  const owner = tool.owner;
  const slug = tool.category?.slug;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tool.title,
    description: tool.description,
    image: tool.photo_urls,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: tool.daily_rate ?? tool.hourly_rate,
      availability: tool.is_available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(tool.review_count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: tool.rating,
            reviewCount: tool.review_count,
          },
        }
      : {}),
  };

  return (
    <>
      <SiteHeader showSearch />
      <ViewCounter toolId={tool.id} />

      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-600"
          >
            <span aria-hidden="true">←</span> Search results
          </Link>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ToolGallery photos={tool.photo_urls} title={tool.title} />

              <div className="mt-8 flex items-start justify-between gap-4">
                <div>
                <div className="flex flex-wrap items-center gap-2">
                  {slug && isToolCategory(slug) ? (
                    <CategoryTag
                      category={slug}
                      label={tool.category?.name}
                      className="uppercase tracking-wide"
                    />
                  ) : null}
                  <AvailabilityPill toolId={tool.id} isAvailable={tool.is_available} />
                </div>

                <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">
                  {tool.title}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {tool.review_count > 0 ? (
                    <Rating value={tool.rating} count={tool.review_count} size="sm" />
                  ) : (
                    <span>No reviews yet</span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} aria-hidden="true" />
                    {tool.address_display ?? 'Phoenix Metro Area'}
                  </span>
                </div>

                <p className="mt-3 flex items-center gap-2 text-sm">
                  <span className="font-semibold uppercase tracking-wide text-muted-foreground">
                    Condition
                  </span>
                  <span className="font-medium text-success-600">
                    {TOOL_CONDITION_LABELS[tool.condition]}
                  </span>
                </p>
                </div>
                <FavoriteButton toolId={tool.id} variant="button" className="shrink-0" />
              </div>

              {tool.description ? (
                <section className="mt-8">
                  <h2 className="font-heading text-xl font-bold">About this tool</h2>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground">
                    {tool.description}
                  </p>
                </section>
              ) : null}

              {Object.keys(tool.specifications ?? {}).length > 0 ? (
                <section className="mt-8">
                  <h2 className="font-heading text-xl font-bold">What&apos;s included</h2>
                  <ul className="mt-3 list-none space-y-2 pl-0">
                    {Object.entries(tool.specifications).map(([key, value]) => (
                      <li key={key} className="flex items-start gap-2 text-sm">
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-success-600"
                          aria-hidden="true"
                        />
                        <span>
                          <span className="text-muted-foreground">{key}:</span> {value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {tool.requires_license || tool.min_age >= 21 || tool.safety_notes ? (
                <section className="mt-8 rounded-md border border-warning-100 bg-warning-50 p-4">
                  <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-warning-600">
                    <ShieldAlert size={18} aria-hidden="true" />
                    Before you book
                  </h2>
                  <ul className="mt-2 space-y-1 text-sm text-foreground">
                    {tool.requires_license ? (
                      <li>
                        Requires a valid operator license
                        {tool.license_type ? ` (${tool.license_type})` : ''}.
                      </li>
                    ) : null}
                    {tool.min_age >= 21 ? (
                      <li>Renters must be {tool.min_age} or older.</li>
                    ) : null}
                    {tool.safety_notes ? <li>{tool.safety_notes}</li> : null}
                  </ul>
                </section>
              ) : null}

              <section className="mt-10 border-t border-border pt-8">
                <ReviewList toolId={tool.id} />
              </section>
            </div>

            <div className="lg:col-span-1">
              <ToolBookingPanel tool={tool} />
            </div>
          </div>
        </div>

        {/* Owner band — Figma screen-tool-detail (2023:360) footer section */}
        {owner ? (
          <section className="mt-12 border-t border-border bg-surface-muted">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <Link
                  href={`/users/${owner.id}`}
                  className="group flex items-center gap-4"
                >
                  <Avatar
                    src={owner.avatar_url ?? undefined}
                    name={owner.display_name}
                    size="lg"
                    verified={owner.is_identity_verified}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-lg font-bold group-hover:text-primary">
                        {owner.display_name}
                      </h2>
                      {owner.is_identity_verified ? <Badge variant="gold">Verified</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {owner.created_at
                        ? `Member since ${new Date(owner.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}`
                        : 'Toolshare member'}
                      {owner.review_count_owner > 0
                        ? ` · ★ ${owner.owner_rating.toFixed(1)} rating`
                        : ''}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`/users/${owner.id}`}
                  className="shrink-0 text-sm font-medium text-primary hover:text-primary-600"
                >
                  See their tools →
                </Link>
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
                <Stat label="Owner rating" value={
                  owner.review_count_owner > 0 ? owner.owner_rating.toFixed(1) : '—'
                } />
                <Stat label="Reviews" value={String(owner.review_count_owner)} />
                <Stat label="Times viewed" value={tool.view_count.toLocaleString()} />
              </dl>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-heading text-2xl font-bold text-primary">{value}</dd>
      <dt className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
    </div>
  );
}
