'use client';

import { useId } from 'react';

import { cn } from '#ui/lib/cn';
import {
  formatNumberEditable,
  formatNumberGrouped,
  isValidGroupedNumberInput,
  normalizeGroupedNumber,
  stripNumberGrouping,
} from '#ui/lib/grouped-number-format';
import { useGroupedNumberInput } from '#ui/lib/hooks/use-grouped-number-input';
import { Input } from '#ui/primitives/inputs/input/input';
import { Label } from '#ui/primitives/inputs/label/label';

const PRECISION = 2;

export interface StopConditionsCurrencyFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function StopConditionsCurrencyField({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = '0.00',
}: StopConditionsCurrencyFieldProps) {
  const inputId = useId();
  const hasValue = value !== '' && Number(value) > 0;

  const field = useGroupedNumberInput({
    value,
    onChange,
    validate: (next) => isValidGroupedNumberInput(next, PRECISION),
    toEditable: (current) => formatNumberEditable(current, PRECISION),
    toGrouped: (current) => formatNumberGrouped(current, PRECISION),
    normalizeChange: stripNumberGrouping,
    normalizeBlur: normalizeGroupedNumber,
  });

  return (
    <div className="w-full">
      <div className="mb-ds-1-5">
        <Label htmlFor={inputId} className="min-w-0">
          {label}
        </Label>
      </div>

      <Input
        id={inputId}
        type="text"
        inputMode="decimal"
        value={field.displayValue}
        placeholder={placeholder}
        disabled={disabled}
        containerClassName="ds-originals-field ds-stop-conditions-currency-field border-transparent bg-ds-surface-tertiary h-8 py-0"
        className={cn(
          'text-ds-body-lg font-ds-medium',
          !disabled && (hasValue ? 'text-ds-text-primary' : 'text-ds-text-secondary'),
        )}
        leading={
          <span
            className={cn(
              'text-ds-body-lg group-data-[disabled]:text-ds-text-tertiary shrink-0',
              !disabled && (hasValue ? 'text-ds-text-primary' : 'text-ds-text-secondary'),
            )}
          >
            $
          </span>
        }
        onFocus={field.handleFocus}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
    </div>
  );
}
