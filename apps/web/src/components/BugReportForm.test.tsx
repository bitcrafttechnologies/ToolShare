import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BugReportForm } from '@/components/BugReportForm';

const ENDPOINT = 'https://formspree.io/f/bug-form';

// The form reads the signed-in tester off the session to prefill reply-to.
vi.mock('@/hooks/useSessionUser', () => ({
  useSessionUser: () => ({ id: 'u1', email: 'tester@example.com' }),
}));

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}), ...response });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const payloadOf = (fetchMock: ReturnType<typeof mockFetch>) =>
  JSON.parse(fetchMock.mock.calls[0]![1].body as string);

/** Fills the two required controls and submits. */
async function submitMinimal(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByLabelText(/what were you doing, and what went wrong/i),
    'Booking button did nothing',
  );
  await user.click(screen.getByRole('radio', { name: /Medium/ }));
  await user.click(screen.getByRole('button', { name: /send bug report/i }));
}

describe('BugReportForm', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_BUGREPORT_ENDPOINT', ENDPOINT);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('prefills the reply-to address from the session', async () => {
    mockFetch({ ok: true });
    render(<BugReportForm />);
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /your email/i })).toHaveValue(
        'tester@example.com',
      ),
    );
  });

  it('sends the report under the template’s numbered field names', async () => {
    const fetchMock = mockFetch({ ok: true });
    const user = userEvent.setup();
    render(<BugReportForm />);

    await user.type(
      screen.getByLabelText(/what were you doing, and what went wrong/i),
      'Booking button did nothing',
    );
    await user.type(screen.getByLabelText(/telling a friend/i), '1. Open tool\n2. Tap Book');
    await user.type(screen.getByLabelText('Expected'), 'A booking');
    await user.type(screen.getByLabelText('Actual'), 'Nothing');
    await user.type(screen.getByLabelText(/screen \/ page \/ url/i), '/tools/123');
    await user.type(screen.getByLabelText(/device & os/i), 'iPhone 15, iOS 18.1');
    await user.type(screen.getByLabelText(/exact text/i), 'TypeError: undefined');
    await user.click(screen.getByRole('radio', { name: /High/ }));
    await user.type(screen.getByLabelText(/cool if/i), 'Dark mode');
    await user.click(screen.getByRole('button', { name: /send bug report/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(fetchMock.mock.calls[0]![0]).toBe(ENDPOINT);
    expect(payloadOf(fetchMock)).toMatchObject({
      '1. What happened': 'Booking button did nothing',
      '2. Steps to reproduce': '1. Open tool\n2. Tap Book',
      '3. Expected': 'A booking',
      '3. Actual': 'Nothing',
      '4. Screen / page / URL': '/tools/123',
      '4. App version': 'Beta',
      '4. Device & OS': 'iPhone 15, iOS 18.1',
      '5. Error messages': 'TypeError: undefined',
      '6. How bad is it': '🔴 High',
      '7. Improvement ideas': 'Dark mode',
      'Reported by': 'tester@example.com',
      _replyto: 'tester@example.com',
    });
  });

  it('puts the severity in the subject so triage is possible from the inbox', async () => {
    const fetchMock = mockFetch({ ok: true });
    const user = userEvent.setup();
    render(<BugReportForm />);

    await submitMinimal(user);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(payloadOf(fetchMock)._subject).toContain('🟡 Medium');
  });

  it('confirms in place and offers another report', async () => {
    mockFetch({ ok: true });
    const user = userEvent.setup();
    render(<BugReportForm />);

    await submitMinimal(user);

    expect(await screen.findByText(/report sent/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /report another bug/i }));

    // Back to a blank form, not the previous answers.
    expect(screen.getByLabelText(/what were you doing, and what went wrong/i)).toHaveValue('');
  });

  it('surfaces a Formspree error and keeps the tester’s input', async () => {
    mockFetch({ ok: false, json: async () => ({ errors: [{ message: 'Form is disabled' }] }) });
    const user = userEvent.setup();
    render(<BugReportForm />);

    await submitMinimal(user);

    expect(await screen.findByText('Form is disabled')).toBeInTheDocument();
    expect(screen.getByLabelText(/what were you doing, and what went wrong/i)).toHaveValue(
      'Booking button did nothing',
    );
  });

  it('does not attempt a submit when the endpoint is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_BUGREPORT_ENDPOINT', '');
    const fetchMock = mockFetch({ ok: true });
    const user = userEvent.setup();
    render(<BugReportForm />);

    await submitMinimal(user);

    expect(await screen.findByText(/aren’t being collected/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
