'use server';

import { revalidatePath } from 'next/cache';

/**
 * Drops the cached render of a listing page after it changes.
 *
 * `/tools/[id]` is prerendered with `revalidate = 3600` for SEO, so an edit
 * saved to the database was invisible on the listing itself for up to an hour
 * — the owner removed a photo, was redirected to their listing, and saw the
 * old photos still there (TKT-00004). `router.refresh()` cannot fix this: it
 * clears the client Router Cache, while the stale HTML lives in the server's
 * Full Route Cache, and only `revalidatePath` reaches that.
 *
 * Only the detail route needs this. Every other tool surface (`/`, `/search`,
 * `/my-listings`) reads cookies or runs client-side, so none of them is
 * statically cached in the first place.
 */
export async function revalidateTool(id: string): Promise<void> {
  revalidatePath(`/tools/${id}`);
}
