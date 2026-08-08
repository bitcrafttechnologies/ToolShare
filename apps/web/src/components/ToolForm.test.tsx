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
// from the upload, so stub the uploader rather than faking File objects.
const uploadToolPhotos = vi.fn(async () => ['https://cdn.test/new.jpg']);
vi.mock('@/components/ToolPhotoPicker', () => ({
  ToolPhotoPicker: () => <div data-slot="photo-picker" />,
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
});
