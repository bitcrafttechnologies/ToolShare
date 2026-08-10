'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTool, useUpdateTool } from '@toolshare/supabase';
import { Components } from '@toolshare/ui';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import { ToolForm, type ToolFormValues } from '@/components/ToolForm';
import { BlackoutManager } from '@/components/BlackoutManager';
import { deleteToolPhotos } from '@/components/ToolPhotoPicker';
import { revalidateTool } from '@/app/tools/[id]/actions';

const { Spinner, EmptyState, Separator } = Components;

interface Props {
  toolId: string;
}

/**
 * Edit guard + form. `/tools/[id]/edit` sits under the public `/tools`
 * prefix (not in the middleware allowlist), so ownership is enforced here:
 * only the owner sees the form.
 */
export function EditTool({ toolId }: Props) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const user = useSessionUser();
  const { data: tool, isLoading } = useTool(supabase, toolId);
  const updateTool = useUpdateTool(supabase, user?.id ?? '');

  if (isLoading || user === null) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (!tool) {
    return (
      <EmptyState
        title="Listing not found"
        description="It may have been removed."
        action={
          <Link
            href="/my-listings"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            My listings
          </Link>
        }
      />
    );
  }

  if (tool.owner_id !== user.id) {
    return (
      <EmptyState
        title="You can't edit this listing"
        description="Only the owner can make changes to a listing."
        action={
          <Link
            href={`/tools/${toolId}`}
            className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
          >
            View listing
          </Link>
        }
      />
    );
  }

  const ownerId = user.id;
  const savedPhotos = tool.photo_urls;

  async function handleSubmit(values: ToolFormValues) {
    await updateTool.mutateAsync({ id: toolId, updates: values });

    // Drop the prerendered listing page. Without this the owner lands back on
    // up-to-an-hour-old HTML still showing the photos they just removed —
    // the database was always right, the cached page wasn't (TKT-00004).
    await revalidateTool(toolId);

    const removed = savedPhotos.filter((url) => !values.photo_urls.includes(url));
    await deleteToolPhotos(supabase, ownerId, removed);

    router.push(`/tools/${toolId}`);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Edit listing</h1>
        <Link
          href={`/tools/${toolId}`}
          className="text-sm font-medium text-primary hover:text-primary-600"
        >
          Cancel
        </Link>
      </div>
      <ToolForm
        userId={user.id}
        initial={tool}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />

      <Separator className="my-10" />

      <BlackoutManager toolId={toolId} />
    </>
  );
}
