'use client';

import { useId } from 'react';

import type { BetAmountInputProps } from './bet-amount-input.types';
import { BetAmountLabelTooltip } from './bet-amount-input-label-tooltip';
import { BetAmountQuickActions } from './bet-amount-input-quick-actions';
import { BetAmountInputThresholdWarning } from './bet-amount-input-threshold-warning';

import { OriginalsFieldReveal } from '#ui/features/games/originals/shared/originals-field-reveal';
import { cn } from '#ui/lib/cn';
import {
  formatNumberEditable,
  formatNumberGrouped,
  isGroupedNumberEmpty,
  isValidGroupedNumberInput,
  normalizeGroupedNumber,
  stripNumberGrouping,
} from '#ui/lib/grouped-number-format';
import { useGroupedNumberInput } from '#ui/lib/hooks/use-grouped-number-input';
import { Skeleton } from '#ui/primitives/feedback/skeleton/skeleton';
import { Typography } from '#ui/primitives/foundation/typography/typography';
import { Input } from '#ui/primitives/inputs/input/input';
import { Label } from '#ui/primitives/inputs/label/label';

const LOADING_SKELETON_CLASS = 'bg-ds-gray-600';

function BetAmountCurrencyIcon({ children }: { children: React.ReactNode }) {
  return <div className="ds-bet-amount-input-currency-icon">{children}</div>;
}

export function BetAmountInput({
  value,
  onChange,
  label,
  tooltip,
  conversionText,
  currencyIcon,
  isLoading = false,
  disabled = false,
  error,
  placeholder = '0.00',
  precision = 2,
  inputMode = 'decimal',
  quickActions,
  thresholdWarning,
  className,
}: BetAmountInputProps) {
  const inputId = useId();
  const errorId = useId();
  const warningId = useId();
  const isFieldDisabled = disabled || isLoading;

  const field = useGroupedNumberInput({
    value,
    onChange,
    validate: (next) => isValidGroupedNumberInput(next, precision),
    toEditable: (current) => formatNumberEditable(current, precision),
    toGrouped: (current) => formatNumberGrouped(current, precision),
    normalizeChange: stripNumberGrouping,
    normalizeBlur: normalizeGroupedNumber,
  });

  const areQuickActionsDisabled = isGroupedNumberEmpty(field.effectiveValue);
  const displayValue = isLoading ? '' : field.displayValue;
  const describedBy =
    [error ? errorId : null, thresholdWarning ? warningId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-ds-1-5 gap-ds-2 flex items-center justify-between">
        <Label
          htmlFor={inputId}
          adornment={
            tooltip ? (
              <BetAmountLabelTooltip
                label={tooltip.label}
                title={tooltip.title}
                description={tooltip.description}
              />
            ) : undefined
          }
          className="min-w-0"
        >
          {label}
        </Label>
        {conversionText ? (
          <Typography kind="brand-primary-12-400" as="span" className="shrink-0">
            {conversionText}
          </Typography>
        ) : null}
      </div>

      <div className="relative">
        <Input
          id={inputId}
          type="text"
          inputMode={inputMode}
          value={displayValue}
          placeholder={isLoading ? '' : placeholder}
          disabled={isFieldDisabled}
          readOnly={isLoading}
          invalid={Boolean(error)}
          aria-busy={isLoading}
          aria-describedby={describedBy}
          containerClassName="ds-originals-field bg-ds-surface-tertiary h-10 border-transparent py-0"
          className={cn(
            'text-ds-body-lg font-ds-medium',
            isLoading && 'text-transparent caret-transparent',
          )}
          leading={
            isLoading ? (
              <Skeleton
                className={cn(
                  'rounded-ds-full size-[22px] shrink-0',
                  LOADING_SKELETON_CLASS,
                )}
              />
            ) : currencyIcon ? (
              <BetAmountCurrencyIcon>{currencyIcon}</BetAmountCurrencyIcon>
            ) : undefined
          }
          trailing={
            quickActions?.length ? (
              <BetAmountQuickActions
                actions={quickActions}
                isLoading={isLoading}
                isEmpty={areQuickActionsDisabled}
                isDisabled={disabled}
              />
            ) : undefined
          }
          onFocus={field.handleFocus}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
        />
        {isLoading ? (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex h-10 items-center pl-12 pr-14"
            aria-hidden
          >
            <Skeleton className={cn('rounded-ds-xxs h-5 w-20', LOADING_SKELETON_CLASS)} />
          </div>
        ) : null}
      </div>

      <OriginalsFieldReveal open={Boolean(error)} offset="1">
        <Typography kind="error-12-400" role="alert" id={errorId}>
          {error}
        </Typography>
      </OriginalsFieldReveal>

      <BetAmountInputThresholdWarning
        id={warningId}
        visible={Boolean(thresholdWarning)}
        title={thresholdWarning?.title ?? ''}
        description={thresholdWarning?.description ?? ''}
      />
    </div>
  );
}

export type { BetAmountInputProps } from './bet-amount-input.types';
