'use client';

import type { BlackjackInsuranceProps } from './blackjack-insurance.types';

import { Button } from '#ui/primitives/actions/button/button';

export function BlackjackInsurance({
  label,
  acceptLabel,
  declineLabel,
  onChoose,
  className,
}: BlackjackInsuranceProps) {
  return (
    <div className={className ?? 'flex flex-col gap-2'}>
      <p className="text-ds-text-primary text-ds-sm">{label}</p>
      <Button type="button" onClick={() => onChoose(true)}>
        {acceptLabel}
      </Button>
      <Button type="button" variant="secondary" onClick={() => onChoose(false)}>
        {declineLabel}
      </Button>
    </div>
  );
}

export type { BlackjackInsuranceProps } from './blackjack-insurance.types';
