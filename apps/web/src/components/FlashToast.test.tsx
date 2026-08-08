import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Components } from '@toolshare/ui';
import { FlashToast } from '@/components/FlashToast';

const { ToastProvider } = Components;

let searchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({ useSearchParams: () => searchParams }));

function renderAt(url: string) {
  const parsed = new URL(url, 'http://localhost');
  window.history.replaceState(null, '', parsed.pathname + parsed.search);
  searchParams = new URLSearchParams(parsed.search);
  return render(
    <ToastProvider>
      <FlashToast />
    </ToastProvider>,
  );
}

describe('FlashToast', () => {
  beforeEach(() => {
    searchParams = new URLSearchParams();
  });

  it('shows the waiting-list thank-you when redirected with ?waitlist=1', () => {
    renderAt('/?waitlist=1');
    expect(
      screen.getByText(
        'Thank you, while we are still testing the pilot, you are free to explore what is currently on the site.',
      ),
    ).toBeInTheDocument();
  });

  it('strips the flag from the URL so a refresh does not replay the toast', () => {
    renderAt('/?waitlist=1');
    expect(window.location.search).toBe('');
  });

  it('leaves unrelated query params alone', () => {
    renderAt('/?waitlist=1&q=drill');
    expect(window.location.search).toBe('?q=drill');
  });

  it('shows nothing without a flag', () => {
    renderAt('/');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
