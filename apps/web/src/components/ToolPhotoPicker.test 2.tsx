import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolPhotoPicker } from '@/components/ToolPhotoPicker';

// jsdom implements neither of these, and the picker builds preview URLs on
// every render.
beforeEach(() => {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn((f: File) => `blob:${f.name}`),
    revokeObjectURL: vi.fn(),
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

const jpeg = (name: string) => new File(['x'], name, { type: 'image/jpeg' });

function renderPicker(props: Partial<React.ComponentProps<typeof ToolPhotoPicker>> = {}) {
  const onChange = vi.fn();
  const { container } = render(
    <ToolPhotoPicker files={[]} onChange={onChange} {...props} />,
  );
  // The file input is intentionally sr-only and has no accessible name, so
  // there is nothing better to query it by.
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  return { onChange, input };
}

describe('ToolPhotoPicker', () => {
  // TKT-00004: the six-photo cap only counted newly picked files, so editing a
  // listing that already had six photos accepted six more — twelve in
  // photo_urls, well past what the listing page or the bucket expects.
  it('counts photos already on the listing toward the six-photo cap', async () => {
    const user = userEvent.setup();
    const { onChange, input } = renderPicker({ existingCount: 5 });

    await user.upload(input, [jpeg('a.jpg'), jpeg('b.jpg'), jpeg('c.jpg')]);

    // Five already saved leaves room for exactly one more.
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]![0]).toHaveLength(1);
    // Exact match: the standing helper text also mentions the limit, but its
    // full text is longer, so this only matches the rejection message.
    expect(screen.getByText('Up to 6 photos')).toBeInTheDocument();
  });

  // TKT-00004: and the "Add photos" tile has to disappear at the same point,
  // or the cap is enforced only after the user has picked files.
  it('hides the add tile once existing and new photos reach the cap', () => {
    renderPicker({ existingCount: 6 });

    expect(screen.queryByRole('button', { name: /add photos/i })).not.toBeInTheDocument();
  });

  it('still accepts a full set when the listing has no photos yet', async () => {
    const user = userEvent.setup();
    const { onChange, input } = renderPicker();

    await user.upload(input, [jpeg('a.jpg'), jpeg('b.jpg')]);

    expect(onChange.mock.calls[0]![0]).toHaveLength(2);
  });
});
