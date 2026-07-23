'use client';

import type { Tool } from '@toolshare/types';
import { Components } from '@toolshare/ui';

const { Button, Checkbox } = Components;

interface Props {
  tool: Tool;
  accepted: boolean;
  onAcceptChange: (v: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

export function WaiverStep({ tool, accepted, onAcceptChange, onBack, onNext }: Props) {
  return (
    <div>
      <h2 className="mb-4 font-heading text-xl font-bold">Rental agreement &amp; waiver</h2>

      <div className="mb-6 max-h-64 overflow-y-auto rounded-md border border-border bg-surface-muted p-4 text-sm">
        <h3 className="mb-2 font-heading font-semibold">Toolshare Rental Agreement</h3>
        <p className="mb-3">
          By accepting this agreement, you acknowledge that you are renting{' '}
          <strong>{tool.title}</strong> and agree to the following terms:
        </p>
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            You will use the tool only for its intended purpose and in accordance with all
            applicable safety guidelines.
          </li>
          <li>You are responsible for any damage beyond normal wear and tear.</li>
          {tool.requires_license ? (
            <li>
              You hold a valid {tool.license_type} as required by OSHA 1926.453 and Arizona law.
            </li>
          ) : null}
          {tool.min_age >= 21 ? (
            <li>
              You confirm you are at least {tool.min_age} years of age as required for this
              equipment under Arizona law.
            </li>
          ) : null}
          <li>
            The deposit (${tool.deposit_amount}) will be released upon return in satisfactory
            condition.
          </li>
          <li>
            This agreement constitutes a valid electronic signature under UETA (AZ Rev. Stat. §
            44-7001 et seq.).
          </li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          You are advised to carry personal liability insurance for rental equipment.
        </p>
      </div>

      <label className="mb-6 flex cursor-pointer items-start gap-3">
        <Checkbox
          checked={accepted}
          onChange={(e) => onAcceptChange(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm">
          I have read and agree to the Toolshare rental agreement and waiver. I understand this is
          a legally binding electronic signature.
        </span>
      </label>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={!accepted} className="flex-1">
          Accept &amp; continue
        </Button>
      </div>
    </div>
  );
}
