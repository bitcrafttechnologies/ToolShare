'use client';

import { Wallet } from 'lucide-react';
import type { Tool, PaymentMethodType } from '@toolshare/types';
import type { PriceSummary } from '@toolshare/domain';
import { PAYMENT_METHOD_LABELS } from '@toolshare/types';
import { Components } from '@toolshare/ui';
import { ONLINE_PAYMENTS_ENABLED } from '@/lib/flags';

const { Button, Card, Radio } = Components;

interface Props {
  tool: Tool;
  summary: PriceSummary;
  startDate: string;
  endDate: string;
  paymentMethod: PaymentMethodType;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
  onBack: () => void;
  onNext: () => void;
}

const PAYMENT_METHODS: PaymentMethodType[] = ['stripe_card', 'cash_app', 'in_person'];

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export function ReviewStep({
  tool,
  summary,
  startDate,
  endDate,
  paymentMethod,
  onPaymentMethodChange,
  onBack,
  onNext,
}: Props) {
  return (
    <div>
      <h2 className="mb-6 font-heading text-xl font-bold">Review your booking</h2>

      <Card className="mb-6 p-4">
        <h3 className="font-heading font-semibold">{tool.title}</h3>
        <p className="text-sm text-muted-foreground">
          {tool.address_display ?? 'Phoenix Metro Area'}
        </p>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Dates:</dt>
            <dd>
              {formatDate(startDate)} → {formatDate(endDate)}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Duration:</dt>
            <dd>{summary.rateDescription}</dd>
          </div>
        </dl>
      </Card>

      <dl className="mb-6 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Rental</dt>
          <dd>${summary.subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Deposit (refundable)</dt>
          <dd>${summary.deposit.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>${summary.total.toFixed(2)}</dd>
        </div>
      </dl>

      {ONLINE_PAYMENTS_ENABLED ? (
        <fieldset className="mb-6">
          <legend className="mb-2 text-sm font-medium">Payment method</legend>
          <div className="flex flex-col gap-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method}
                className={
                  paymentMethod === method
                    ? 'flex cursor-pointer items-center gap-3 rounded-sm border border-primary bg-primary-50 p-3'
                    : 'flex cursor-pointer items-center gap-3 rounded-sm border border-border p-3 transition-colors hover:border-primary-400'
                }
              >
                <Radio
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => onPaymentMethodChange(method)}
                />
                <span className="text-sm font-medium">{PAYMENT_METHOD_LABELS[method]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        // Cash-only pilot: no method to choose — payment is arranged in
        // person. The picker above returns automatically when
        // ONLINE_PAYMENTS_ENABLED flips back on.
        <div className="mb-6 flex items-start gap-3 rounded-sm border border-border bg-surface-muted p-4">
          <Wallet size={18} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            You&apos;ll pay <span className="font-medium text-foreground">${summary.total.toFixed(2)}</span>{' '}
            (rental plus refundable deposit) directly to the owner in cash at pickup. The deposit is
            returned when you bring the tool back.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button size="lg" onClick={onNext} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
