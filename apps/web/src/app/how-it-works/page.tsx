import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, CalendarCheck, Handshake, ShieldCheck, Plus } from 'lucide-react';
import { Components } from '@toolshare/ui';
import { SiteHeader } from '@/components/SiteHeader';

const { Card, Separator } = Components;

export const metadata: Metadata = {
  title: 'How Toolshare works',
  description:
    'Rent tools from neighbors across the Phoenix metro, or lend your own. Here is how renting and lending work on Toolshare.',
  alternates: { canonical: 'https://toolshare.app/how-it-works' },
};

const RENTING = [
  {
    icon: Search,
    title: 'Find a tool nearby',
    body: 'Search by tool, category or project across the Phoenix metro — Buckeye to Apache Junction, Florence to Surprise.',
  },
  {
    icon: CalendarCheck,
    title: 'Pick your dates',
    body: "Choose your rental window and see the full cost up front — daily or weekly rate, plus a refundable deposit. You aren't charged until the owner accepts.",
  },
  {
    icon: Handshake,
    title: 'Collect and get to work',
    body: 'Arrange pickup or delivery with the owner in the booking chat. Your deposit is released once the tool comes back in the same condition.',
  },
];

const LENDING = [
  {
    icon: Plus,
    title: 'List what you already own',
    body: 'Add photos, set your daily and weekly rates, and choose a deposit. Listing is free.',
  },
  {
    icon: ShieldCheck,
    title: 'Approve the requests you want',
    body: 'Every request needs your approval. Renters sign a rental agreement, and licence or age requirements are enforced before anyone can book.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-surface-muted">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              How Toolshare works
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Borrow the tool you need for a weekend instead of buying it — or earn from the one
              sitting in your garage.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <section>
            <h2 className="font-heading text-2xl font-bold">Renting a tool</h2>
            <ol className="mt-6 flex list-none flex-col gap-4 pl-0">
              {RENTING.map((step, i) => (
                <li key={step.title}>
                  <Card className="flex gap-4 p-5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
                      <step.icon size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">
                        <span className="text-muted-foreground">{i + 1}. </span>
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
            <Link
              href="/search"
              className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
            >
              Browse tools near you
            </Link>
          </section>

          <Separator className="my-12" />

          <section>
            <h2 className="font-heading text-2xl font-bold">Lending your tools</h2>
            <ol className="mt-6 flex list-none flex-col gap-4 pl-0">
              {LENDING.map((step, i) => (
                <li key={step.title}>
                  <Card className="flex gap-4 p-5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
                      <step.icon size={20} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">
                        <span className="text-muted-foreground">{i + 1}. </span>
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
            <Link
              href="/add-tool"
              className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-600"
            >
              List a tool
            </Link>
          </section>

          <Separator className="my-12" />

          <section>
            <h2 className="font-heading text-2xl font-bold">Safety and the legal bits</h2>
            <ul className="mt-4 flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
              <li>
                Some equipment carries a minimum age of 21 or requires a valid operator licence
                under Arizona law and OSHA 1926.453 — Toolshare checks both before a booking can
                be completed.
              </li>
              <li>
                Every rental includes a digital agreement, signed electronically and valid under
                the Arizona Electronic Transactions Act (A.R.S. § 44-7001 et seq.).
              </li>
              <li>
                Renters are advised to carry personal liability insurance. Toolshare does not
                provide equipment insurance.
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
