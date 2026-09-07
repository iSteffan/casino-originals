'use client';

import { useEffect, useId, useRef } from 'react';

import type { RoundsInputProps } from './rounds-input.types';
import { defaultRoundsInputLabels } from './rounds-input.types';
import {
  formatRoundsEditable,
  formatRoundsGrouped,
  isValidRoundsInput,
  normalizeRoundsValue,
  stripRoundsGrouping,
} from './rounds-input-format.utils';
import { RoundsInputInfiniteToggle } from './rounds-input-infinite-toggle';

import { OriginalsFieldReveal } from '#ui/features/games/originals/shared/originals-field-reveal';
import { cn } from '#ui/lib/cn';
import { useGroupedNumberInput } from '#ui/lib/hooks/use-grouped-number-input';
import { Typography } from '#ui/primitives/foundation/typography/typography';
import { Input } from '#ui/primitives/inputs/input/input';
import { Label } from '#ui/primitives/inputs/label/label';

const INFINITY_VALUE = 'Infinity';

export function RoundsInput({
  value,
  onChange,
  label,
  disabled = false,
  error,
  max,
  placeholder = '0',
  labels = defaultRoundsInputLabels,
  className,
}: RoundsInputProps) {
  const inputId = useId();
  const errorId = useId();
  const lastFiniteValueRef = useRef<string | null>(null);
  const isInfiniteMode = value === INFINITY_VALUE;

  useEffect(() => {
    if (value === INFINITY_VALUE) return;

    lastFiniteValueRef.current = normalizeRoundsValue(value, max);
  }, [max, value]);

  const field = useGroupedNumberInput({
    value,
    onChange,
    validate: isValidRoundsInput,
    toEditable: formatRoundsEditable,
    toGrouped: formatRoundsGrouped,
    normalizeChange: (next) => normalizeRoundsValue(stripRoundsGrouping(next), max),
    locked: isInfiniteMode,
  });

  const handleInfiniteClick = () => {
    if (disabled) return;

    if (isInfiniteMode) {
      onChange(lastFiniteValueRef.current || '1');
      return;
    }

    onChange(INFINITY_VALUE);
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-ds-1">
        <Label htmlFor={inputId} className="min-w-0">
          {label}
        </Label>
      </div>

      <Input
        id={inputId}
        type="text"
        inputMode="numeric"
        value={field.displayValue}
        placeholder={isInfiniteMode ? '∞' : placeholder}
        disabled={disabled}
        readOnly={isInfiniteMode && !disabled}
        invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        containerClassName={cn(
          'ds-originals-field bg-ds-surface-tertiary h-8 border-transparent py-0',
          isInfiniteMode && 'ds-rounds-input-field--infinite',
        )}
        className="text-ds-body-lg font-ds-medium"
        trailing={
          <RoundsInputInfiniteToggle
            isActive={isInfiniteMode}
            disabled={disabled}
            label={labels.infinity}
            onClick={handleInfiniteClick}
          />
        }
        onFocus={field.handleFocus}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />

      <OriginalsFieldReveal open={Boolean(error)} offset="1">
        <Typography kind="error-12-400" role="alert" id={errorId}>
          {error}
        </Typography>
      </OriginalsFieldReveal>
    </div>
  );
}
