'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BadgeCheck, CalendarDays, Heart, Package, Plus, Star } from 'lucide-react';
import { useProfile } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import { formatDate } from '@/lib/format';

const { Avatar, Button, Card, EmptyState, Spinner, Badge, Separator } = Components;

export function ProfileView() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();
  const { data: profile, isLoading } = useProfile(supabase, user?.id ?? '');
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    // refresh() so any Server Component that read the session re-renders.
    router.push('/');
    router.refresh();
  }

  if (!user) {
    return (
      <EmptyState
        title="You're signed out"
        description="Sign in to see your profile, listings and rentals."
        action={
          <Link
            href="/login?next=/profile"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            Sign in
          </Link>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
        <span className="sr-only">Loading profile…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <Avatar
          src={profile?.avatar_url ?? undefined}
          name={profile?.display_name ?? user.email ?? 'You'}
          size="xl"
        />
        <h1 className="mt-4 font-heading text-2xl font-bold">
          {profile?.display_name ?? 'Toolshare member'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {profile?.is_identity_verified ? (
            <Badge variant="gold">
              <BadgeCheck size={12} aria-hidden="true" />
              Identity verified
            </Badge>
          ) : (
            <Badge variant="neutral">Not verified</Badge>
          )}
          {profile?.created_at ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays size={12} aria-hidden="true" />
              Member since {formatDate(profile.created_at.slice(0, 10), {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          ) : null}
        </div>
      </div>

      {profile?.bio ? (
        <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground">
          {profile.bio}
        </p>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <p className="flex items-center justify-center gap-1 font-heading text-2xl font-bold text-primary">
            <Star size={18} className="fill-gold-400 text-gold-400" aria-hidden="true" />
            {profile && profile.review_count_owner > 0
              ? profile.owner_rating.toFixed(1)
              : '—'}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            As a lender ({profile?.review_count_owner ?? 0})
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="flex items-center justify-center gap-1 font-heading text-2xl font-bold text-primary">
            <Star size={18} className="fill-gold-400 text-gold-400" aria-hidden="true" />
            {profile && profile.review_count_renter > 0
              ? profile.renter_rating.toFixed(1)
              : '—'}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            As a renter ({profile?.review_count_renter ?? 0})
          </p>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="flex flex-col gap-3">
        <Link href="/my-listings">
          <Button size="lg" className="w-full">
            <Package size={16} aria-hidden="true" />
            My listings
          </Button>
        </Link>
        <Link href="/bookings">
          <Button variant="outline" size="lg" className="w-full">
            <CalendarDays size={16} aria-hidden="true" />
            My bookings
          </Button>
        </Link>
        <Link href="/favorites">
          <Button variant="outline" size="lg" className="w-full">
            <Heart size={16} aria-hidden="true" />
            Saved tools
          </Button>
        </Link>
        <Link href="/add-tool">
          <Button variant="outline" size="lg" className="w-full">
            <Plus size={16} aria-hidden="true" />
            List a tool
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="lg"
          className="w-full text-danger-600"
          isLoading={signingOut}
          onClick={() => void handleSignOut()}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
