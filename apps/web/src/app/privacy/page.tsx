import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument } from '@/components/LegalDocument';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: 'https://toolshare.app/privacy' },
};

/*
 * PILOT DRAFT. Describes the data the app actually collects and how it's
 * stored (Supabase, private buckets, 30-day auto-deletion of ID docs). NOT
 * reviewed by a lawyer — have counsel review before scaling, and fill in the
 * [bracketed] contact details.
 */
export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy Policy" lastUpdated="July 20, 2026">
      <p>
        This policy explains what information Toolshare collects, how we use it, and the choices
        you have. It covers the Toolshare web and mobile apps during our Phoenix-area pilot.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — your name, email address, and optionally a photo,
          bio, and phone number.
        </li>
        <li>
          <strong>Listings and bookings</strong> — the tools you list, the rentals you request or
          approve, dates, and prices.
        </li>
        <li>
          <strong>Messages</strong> — the messages you send to another user about a booking.
        </li>
        <li>
          <strong>Approximate location</strong> — used to show tools near you and to place your
          listings on the map. You can deny location access; we then default to the Phoenix metro
          area.
        </li>
        <li>
          <strong>Identity verification documents</strong> — if you choose to verify your identity,
          the documents you upload.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use your information to operate the marketplace: showing listings, connecting renters
        and owners, enabling messaging and reviews, and keeping the community safe. During the
        pilot we do not process payments, so we do not collect card or bank details on the web.
      </p>

      <h2>Identity documents</h2>
      <p>
        Identity verification documents are stored in a private storage bucket that other users
        cannot access, and are <strong>automatically deleted 30 days</strong> after upload. They
        are used only to verify your identity.
      </p>

      <h2>What we share</h2>
      <ul>
        <li>
          <strong>With other users</strong> — when you book or list, the other party sees the
          information needed to complete the rental, such as your name and the pickup details you
          share in messages.
        </li>
        <li>
          <strong>With service providers</strong> — we use Supabase to host our database, storage,
          and authentication. When online payments are enabled in the future, Stripe will process
          payments; it is not used during the cash pilot.
        </li>
        <li>
          <strong>For legal reasons</strong> — if required by law or to protect the safety of our
          users.
        </li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>Security and retention</h2>
      <p>
        Your data is stored with row-level access controls so that, in general, you can only read
        and change your own records. We keep your information for as long as your account is active.
        You can ask us to access or delete your data using the contact below.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy, or want your data deleted? Reach the Toolshare team at
        [pilot-contact-email]. See also our <Link href="/terms">Terms of Service</Link>.
      </p>
    </LegalDocument>
  );
}
