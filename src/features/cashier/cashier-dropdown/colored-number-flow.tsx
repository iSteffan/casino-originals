'use client';

import type { ComponentProps } from 'react';

import type { CashierFormattedAmount } from './cashier-dropdown.types';

import { cn } from '#ui/lib/cn';
import {
  NumberFlow,
  type NumberFlowProps,
} from '#ui/primitives/data-display/number-flow/number-flow';
import { Typography } from '#ui/primitives/foundation/typography/typography';

interface ColoredNumberFlowProps {
  amount: CashierFormattedAmount;
  locales?: NumberFlowProps['locales'];
  kind?: ComponentProps<typeof Typography>['kind'];
  integerClassName?: string;
  fractionClassName?: string;
  className?: string;
}

function AnimatedAffix({
  value,
  fallback,
  className,
}: {
  value?: string;
  fallback: string;
  className?: string;
}) {
  return (
    <span data-slot="cashier-affix" data-open={value ? '' : undefined}>
      <span data-slot="cashier-affix-clip">
        <span data-slot="cashier-affix-value" className={className}>
          {value || fallback}
        </span>
      </span>
    </span>
  );
}

export function ColoredNumberFlow({
  amount,
  locales,
  kind = 'primary-14-500',
  integerClassName = 'text-ds-text-primary',
  fractionClassName = 'text-ds-text-tertiary',
  className,
}: ColoredNumberFlowProps) {
  const value = `${amount.prefix ?? ''}${amount.whole}${amount.fraction ?? ''}${amount.suffix ?? ''}`;

  if (amount.wholeValue === undefined) {
    return (
      <Typography
        kind={kind}
        as="span"
        className={cn('inline-flex max-w-full min-w-0 items-baseline', className)}
      >
        <span className={integerClassName}>{value}</span>
      </Typography>
    );
  }

  const hasFraction =
    amount.fraction !== undefined &&
    amount.fractionValue !== undefined &&
    amount.fractionDigits > 0;

  return (
    <Typography
      kind={kind}
      as="span"
      className={cn('inline-flex max-w-full min-w-0 items-baseline', className)}
    >
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex items-baseline">
        <AnimatedAffix
          value={amount.prefix}
          fallback="$"
          className={integerClassName}
        />
        <NumberFlow
          value={amount.wholeValue}
          format={{
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            style: 'decimal',
          }}
          locales={locales}
          className={integerClassName}
        />
        {hasFraction ? (
          <span className={fractionClassName}>
            {amount.fraction?.slice(0, amount.fraction.length - amount.fractionDigits)}
          </span>
        ) : null}
        {hasFraction ? (
          <NumberFlow
            value={amount.fractionValue ?? 0}
            format={{
              useGrouping: false,
              minimumIntegerDigits: amount.fractionDigits,
            }}
            locales={locales}
            className={fractionClassName}
          />
        ) : null}
        <AnimatedAffix
          value={amount.suffix}
          fallback=""
          className={integerClassName}
        />
      </span>
    </Typography>
  );
}

export type { ColoredNumberFlowProps };
