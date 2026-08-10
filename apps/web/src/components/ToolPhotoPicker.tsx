'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@toolshare/lib';

// Must line up with the `tools` bucket's allowed_mime_types / file_size_limit.
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 6;

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  /**
   * Photos already saved on the listing. They count toward MAX_FILES too —
   * without this the cap only saw newly picked files, so editing a listing
   * that already had 6 photos let you add 6 more.
   */
  existingCount?: number;
}

/**
 * Multi-photo picker for the listing form. Holds `File`s in the parent so
 * the submit handler can upload them; previews are object URLs created and
 * revoked here. The first photo is the listing's cover.
 */
export function ToolPhotoPicker({ files, onChange, disabled, existingCount = 0 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const rejected: string[] = [];
    const accepted: File[] = [];

    for (const file of Array.from(incoming)) {
      if (!ACCEPTED.includes(file.type)) {
        rejected.push(`${file.name} isn't a JPEG, PNG or WebP`);
      } else if (file.size > MAX_BYTES) {
        rejected.push(`${file.name} is over 10 MB`);
      } else {
        accepted.push(file);
      }
    }

    const room = MAX_FILES - existingCount - files.length;
    const next = [...files, ...accepted.slice(0, Math.max(0, room))];
    if (accepted.length > room) rejected.push(`Up to ${MAX_FILES} photos`);

    setError(rejected.length ? rejected.join(' · ') : null);
    onChange(next);
    if (inputRef.current) inputRef.current.value = ''; // let the same file re-trigger change
  }

  function removeAt(index: number) {
    setError(null);
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {previews.map((src, i) => (
          <div
            key={src}
            className="group relative aspect-square overflow-hidden rounded-sm border border-border bg-surface-muted"
          >
            {/* object-URL blob; next/image can't optimize it, so plain img */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Photo ${i + 1}`} className="size-full object-cover" />
            {i === 0 ? (
              <span className="absolute left-1 top-1 rounded-sm bg-stone-900/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-50">
                Cover
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => removeAt(i)}
              disabled={disabled}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-stone-900/70 text-stone-50 transition-opacity hover:bg-stone-900"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}

        {existingCount + files.length < MAX_FILES ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed border-border-strong text-muted-foreground transition-colors hover:border-primary-400 hover:text-primary',
              disabled && 'pointer-events-none opacity-50',
            )}
          >
            <ImagePlus size={22} aria-hidden="true" />
            <span className="text-xs font-medium">Add photos</span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
      />

      <p className="mt-2 text-xs text-muted-foreground">
        Up to {MAX_FILES} photos · JPEG, PNG or WebP · 10 MB each. The first is the cover.
      </p>
      {error ? <p className="mt-1 text-xs text-danger-600">{error}</p> : null}
    </div>
  );
}

/** Uploads picked files to the public `tools` bucket, returns public URLs. */
export async function uploadToolPhotos(
  supabase: import('@supabase/supabase-js').SupabaseClient,
  userId: string,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];
  const stamp = Date.now();

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    // owner-scoped path so the storage RLS policy (owner = auth.uid()) passes.
    const key = `tools/${userId}/${stamp}-${i}.${ext}`;
    const { error } = await supabase.storage
      .from('tools')
      .upload(key, file, { contentType: file.type, upsert: false });
    // Do NOT swallow this — the mobile client did, so failed uploads produced
    // photoless listings with no signal. Surface it to the caller.
    if (error) throw error;
    urls.push(supabase.storage.from('tools').getPublicUrl(key).data.publicUrl);
  }

  return urls;
}

/** Public URL prefix Supabase Storage serves the `tools` bucket from. */
const PUBLIC_PREFIX = '/storage/v1/object/public/tools/';

/**
 * Deletes photos that an edit removed from a listing.
 *
 * Nothing used to clean these up, so every removed photo stayed in the bucket
 * and its public URL kept returning 200 — which is part of why the stale
 * cached listing page in TKT-00004 looked perfectly intact instead of showing
 * broken images.
 *
 * Deliberately scoped to the signing user's own `tools/<userId>/` prefix.
 * `photo_urls` is owner-written data, and turning an arbitrary string back
 * into a storage key is exactly the sort of thing that should not be able to
 * reach another owner's objects.
 */
export async function deleteToolPhotos(
  supabase: import('@supabase/supabase-js').SupabaseClient,
  userId: string,
  urls: string[],
): Promise<void> {
  const ownPrefix = `tools/${userId}/`;

  const keys = urls.flatMap((url) => {
    const at = url.indexOf(PUBLIC_PREFIX);
    if (at === -1) return [];
    const key = decodeURIComponent(url.slice(at + PUBLIC_PREFIX.length));
    return key.startsWith(ownPrefix) ? [key] : [];
  });

  if (keys.length === 0) return;

  const { error } = await supabase.storage.from('tools').remove(keys);
  // Best-effort. The listing has already saved correctly at this point; an
  // orphaned file is wasted storage, not a broken listing, and it must not
  // surface as a failure the owner has to act on.
  if (error) console.error('[toolshare] could not remove replaced photos:', error);
}
