import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolForm } from '@/components/ToolForm';

// Stub everything that talks to Supabase or the network; these tests are about
// the payload the form hands to `onSubmit`, which is what actually reaches the
// database.
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => ({}) }));
vi.mock('@toolshare/supabase', () => ({
  useCategories: () => ({ data: [{ id: 1, name: 'Power Tools', slug: 'power-tools' }] }),
  useServiceAreas: () => ({
    data: [
      { slug: 'mesa', label: 'Mesa, AZ', lat: 33.4152, lng: -111.8315, sort_order: 20 },
      { slug: 'tempe', label: 'Tempe, AZ', lat: 33.4255, lng: -111.94, sort_order: 50 },
    ],
  }),
}));

// next/image needs loader config that isn't worth wiring up for a unit test.
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

// The picker owns file selection; the form only needs to know what came back
// from the upload. Stub it as a button that hands the form one new file, so
// tests can drive the "added a photo" path without faking a file input, and
// stub the uploader so nothing touches the network.
const uploadToolPhotos = vi.fn(async () => ['https://cdn.test/new.jpg']);
vi.mock('@/components/ToolPhotoPicker', () => ({
  ToolPhotoPicker: ({
    onChange,
    existingCount,
  }: {
    onChange: (files: File[]) => void;
    existingCount?: number;
  }) => (
    <button
      type="button"
      onClick={() => onChange([new File(['x'], 'new.jpg', { type: 'image/jpeg' })])}
    >
      add photo (existing: {existingCount ?? 0})
    </button>
  ),
  uploadToolPhotos: (...args: unknown[]) => uploadToolPhotos(...(args as [])),
}));

function renderForm(overrides: Partial<React.ComponentProps<typeof ToolForm>> = {}) {
  const onSubmit = vi.fn(async () => {});
  render(<ToolForm userId="u1" submitLabel="List my tool" onSubmit={onSubmit} {...overrides} />);
  return { onSubmit };
}

const submittedPayload = (onSubmit: ReturnType<typeof vi.fn>) => onSubmit.mock.calls[0]![0];

beforeEach(() => {
  uploadToolPhotos.mockClear();
});

describe('ToolForm', () => {
  // TKT-00003: a new listing must carry a resolvable service area. Search is
  // geo-filtered on location_point, which the DB derives from this slug — a
  // listing saved without one was invisible to everyone but its owner.
  it('sends the chosen service area, and the matching city label, to the server', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByRole('textbox', { name: /title/i }), 'DeWalt Circular Saw');
    await user.selectOptions(screen.getByRole('combobox', { name: /city/i }), 'tempe');
    await user.click(screen.getByRole('button', { name: 'List my tool' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(submittedPayload(onSubmit)).toMatchObject({
      title: 'DeWalt Circular Saw',
      service_area_slug: 'tempe',
      // Kept in step with the slug so the listing can't display one city while
      // being searchable in another.
      address_display: 'Tempe, AZ',
    });
  });

  // TKT-00003: the form must not let a listing through without a city at all —
  // that is exactly the state the reported listings were saved in.
  it('refuses to submit a listing with no city chosen', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByRole('textbox', { name: /title/i }), 'Orphan Listing');
    await user.click(screen.getByRole('button', { name: 'List my tool' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  // TKT-00003: editing an existing listing must preselect its area, so a save
  // that doesn't touch location can't blank it out.
  it('preselects the service area when editing an existing listing', () => {
    renderForm({
      initial: {
        id: 't1',
        service_area_slug: 'mesa',
        title: 'Existing',
        photo_urls: [],
      } as never,
      submitLabel: 'Save changes',
    });

    expect(screen.getByRole('combobox', { name: /city/i })).toHaveValue('mesa');
  });

  // TKT-00004: "I removed my photo and added another, but it kept the old
  // photos." The saved payload must be the full replacement set — if removal
  // ever became an append, the reported symptom would be a real data bug
  // rather than the caching one it actually was.
  it('drops a removed photo from the saved set instead of appending to it', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm({
      initial: {
        id: 't1',
        service_area_slug: 'mesa',
        title: 'Chainsaw',
        photo_urls: ['https://cdn.test/selfie.jpg', 'https://cdn.test/chainsaw.jpg'],
      } as never,
      submitLabel: 'Save changes',
    });

    await user.click(screen.getByRole('button', { name: 'Remove current photo 1' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(submittedPayload(onSubmit).photo_urls).toEqual(['https://cdn.test/chainsaw.jpg']);
  });

  // TKT-00004: the exact sequence from the report — remove one photo, add
  // another, save. The surviving photo keeps its place and the upload lands
  // after it, so the cover photo stays predictable.
  it('replaces a removed photo with a newly uploaded one, in order', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm({
      initial: {
        id: 't1',
        service_area_slug: 'mesa',
        title: 'Chainsaw',
        photo_urls: ['https://cdn.test/selfie.jpg', 'https://cdn.test/chainsaw.jpg'],
      } as never,
      submitLabel: 'Save changes',
    });

    await user.click(screen.getByRole('button', { name: 'Remove current photo 1' }));
    await user.click(screen.getByRole('button', { name: /add photo/i }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(uploadToolPhotos).toHaveBeenCalledTimes(1);
    expect(submittedPayload(onSubmit).photo_urls).toEqual([
      'https://cdn.test/chainsaw.jpg',
      'https://cdn.test/new.jpg',
    ]);
  });

  // TKT-00004: the picker has to be told how many photos are already saved, or
  // its six-photo cap only sees the new ones.
  it('tells the picker how many photos the listing already has', () => {
    renderForm({
      initial: {
        id: 't1',
        service_area_slug: 'mesa',
        title: 'Chainsaw',
        photo_urls: ['a', 'b', 'c'],
      } as never,
      submitLabel: 'Save changes',
    });

    expect(screen.getByRole('button', { name: /add photo \(existing: 3\)/i })).toBeInTheDocument();
  });
});
