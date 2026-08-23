import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument } from '@/components/LegalDocument';

export const metadata: Metadata = {
  title: 'Terms of Service',
  alternates: { canonical: 'https://toolshare.app/terms' },
};

/*
 * PILOT DRAFT. Plain-language terms written to accurately describe how
 * Toolshare works during the cash-only pilot. NOT reviewed by a lawyer —
 * have counsel review before scaling beyond a small trusted group, and fill
 * in the [bracketed] contact details.
 */
export default function TermsPage() {
  return (
    <LegalDocument title="Terms of Service" lastUpdated="July 20, 2026">
      <p>
        Toolshare is a marketplace that connects neighbors in the Phoenix metro area who want to
        rent tools and equipment to one another. By creating an account or using Toolshare, you
        agree to these terms. If you don&apos;t agree, please don&apos;t use the service.
      </p>

      <h2>Who can use Toolshare</h2>
      <p>
        You must be at least 18 years old to use Toolshare. Certain equipment carries a higher
        minimum age (21+) or requires a valid operator license under Arizona law and OSHA
        1926.453; you may only book that equipment if you meet those requirements, and Toolshare
        enforces the check before a booking can be completed.
      </p>

      <h2>How rentals work</h2>
      <ul>
        <li>Owners list tools with a description, photos, rate, and a refundable deposit.</li>
        <li>Renters request specific dates, and the owner approves or declines each request.</li>
        <li>
          During this pilot, all payments and deposits are arranged <strong>directly between the
          renter and the owner in cash</strong> at pickup. Toolshare does not process payments,
          hold funds, or collect deposits, and is not a party to the rental agreement between
          users.
        </li>
        <li>
          Each booking includes a rental agreement that you sign electronically. That signature is
          a valid electronic signature under the Arizona Electronic Transactions Act (A.R.S. §
          44-7001 et seq.).
        </li>
      </ul>

      <h2>Responsibilities</h2>
      <p>
        Owners are responsible for listing tools accurately and for ensuring they are safe to use.
        Renters are responsible for using tools only for their intended purpose, following all
        safety guidance, and returning them in the same condition, normal wear excepted. The renter
        is responsible for loss or damage beyond normal wear; the owner and renter resolve any
        deposit deductions between themselves.
      </p>

      <h2>Insurance and liability</h2>
      <p>
        Tools are rented as-is. Toolshare provides the platform only and does not inspect,
        guarantee, insure, or take responsibility for any tool or rental. We do not provide
        equipment or liability insurance, and we strongly advise renters to carry their own
        personal liability insurance. To the fullest extent permitted by law, Toolshare disclaims
        all warranties and is not liable for any injury, loss, or damage arising from a rental
        arranged through the service.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t post false or misleading listings, use the service for anything unlawful, or
        misuse another person&apos;s information. We may suspend or remove accounts that violate
        these terms.
      </p>

      <h2>Changes</h2>
      <p>
        Toolshare is an early-stage pilot, and these terms may change as the service develops.
        We&apos;ll update the date above when they do. See our{' '}
        <Link href="/privacy">Privacy Policy</Link> for how we handle your information.
      </p>

      <h2>Contact</h2>
      <p>Questions about these terms? Reach the Toolshare team at {' '}<a href="mailto:support@bitcrafttech.com">support@bitcrafttech.com</a>.</p>
    </LegalDocument>
  );
}
