import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaitingListForm } from '@/components/auth/WaitingListForm';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const ENDPOINT = 'https://formspree.io/f/test-form';

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}), ...response });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** The JSON body of the nth (default: first) fetch call. */
function payloadOf(fetchMock: ReturnType<typeof mockFetch>, call = 0) {
  return JSON.parse(fetchMock.mock.calls[call]![1].body as string);
}

describe('WaitingListForm', () => {
  beforeEach(() => {
    push.mockReset();
    vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ENDPOINT', ENDPOINT);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('posts the email and both opt-ins to Formspree, then redirects home with the toast flag', async () => {
    const fetchMock = mockFetch({ ok: true });
    const user = userEvent.setup();
    render(<WaitingListForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'neighbor@example.com');
    await user.click(screen.getByRole('checkbox', { name: /beta program/i }));
    await user.click(screen.getByRole('checkbox', { name: /email list/i }));
    await user.click(screen.getByRole('button', { name: /join the waiting list/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock.mock.calls[0]![0]).toBe(ENDPOINT);
    expect(payloadOf(fetchMock)).toMatchObject({
      email: 'neighbor@example.com',
      beta_program: 'Yes',
      email_list: 'Yes',
    });

    // The flag is what makes the home page show the "thank you" toast.
    expect(push).toHaveBeenCalledWith('/?waitlist=1');
  });

  it('records unchecked opt-ins as No', async () => {
    const fetchMock = mockFetch({ ok: true });
    const user = userEvent.setup();
    render(<WaitingListForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'neighbor@example.com');
    await user.click(screen.getByRole('button', { name: /join the waiting list/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(payloadOf(fetchMock)).toMatchObject({ beta_program: 'No', email_list: 'No' });
  });

  it('surfaces the Formspree error and stays on the page', async () => {
    mockFetch({
      ok: false,
      json: async () => ({ errors: [{ message: 'Email is not valid' }] }),
    });
    const user = userEvent.setup();
    render(<WaitingListForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'neighbor@example.com');
    await user.click(screen.getByRole('button', { name: /join the waiting list/i }));

    expect(await screen.findByText('Email is not valid')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('does not attempt a submit when the endpoint is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ENDPOINT', '');
    const fetchMock = mockFetch({ ok: true });
    const user = userEvent.setup();
    render(<WaitingListForm />);

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'neighbor@example.com');
    await user.click(screen.getByRole('button', { name: /join the waiting list/i }));

    expect(await screen.findByText(/isn’t accepting signups/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
