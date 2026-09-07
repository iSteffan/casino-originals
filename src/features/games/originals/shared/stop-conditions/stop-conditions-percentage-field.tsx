'use client';

import { useId } from 'react';

import { parseStopConditionsPercentageInput } from './stop-conditions-format.utils';

import { formControlFocusRing } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { useGroupedNumberInput } from '#ui/lib/hooks/use-grouped-number-input';
import { Input } from '#ui/primitives/inputs/input/input';
import { Label } from '#ui/primitives/inputs/label/label';

const toggleButtonClass = cn(
  'text-ds-body-md font-ds-medium px-ds-2 rounded-ds-2xs h-6 w-fit cursor-pointer whitespace-nowrap transition-colors',
  'disabled:cursor-not-allowed disabled:opacity-50',
  formControlFocusRing,
);
const activeToggleClass = 'bg-ds-brand-secondary text-ds-text-primary';
const inactiveToggleClass =
  'bg-ds-surface-tertiary text-ds-text-primary enabled:hover:bg-ds-gray-700';

export interface StopConditionsPercentageFieldProps {
  label: string;
  value: number;
  isActive: boolean;
  resetLabel: string;
  activeLabel: string;
  disabled?: boolean;
  onToggle: (active: boolean) => void;
  onChange: (value: number) => void;
  onResetFromActive?: () => void;
}

export function StopConditionsPercentageField({
  label,
  value,
  isActive,
  resetLabel,
  activeLabel,
  disabled = false,
  onToggle,
  onChange,
  onResetFromActive,
}: StopConditionsPercentageFieldProps) {
  const labelId = useId();
  const isInputDisabled = disabled || !isActive;

  const field = useGroupedNumberInput({
    value: String(value),
    onChange: (next) => onChange(parseStopConditionsPercentageInput(next) ?? 0),
    validate: (next) => next === '' || /^\d*$/.test(next),
    toEditable: (current) => (Number(current) > 0 ? current : ''),
    toGrouped: (current) => current,
    normalizeChange: (next) => next,
  });

  const handleResetClick = () => {
    if (disabled || !isActive) return;

    onResetFromActive?.();
    onToggle(false);
  };

  const handleIncreaseClick = () => {
    if (disabled || isActive) return;

    onToggle(true);
  };

  const isValueMuted = !isActive || value <= 0;

  return (
    <div>
      <Label id={labelId}>{label}</Label>

      <div role="group" aria-labelledby={labelId} className="gap-ds-1 flex items-end">
        <button
          type="button"
          disabled={disabled}
          onClick={handleResetClick}
          aria-pressed={!isActive}
          className={cn(
            toggleButtonClass,
            !isActive ? activeToggleClass : inactiveToggleClass,
          )}
        >
          {resetLabel}
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={handleIncreaseClick}
          aria-pressed={isActive}
          className={cn(
            toggleButtonClass,
            isActive ? activeToggleClass : inactiveToggleClass,
          )}
        >
          {activeLabel}
        </button>

        <div className="min-w-0 flex-1">
          <Input
            aria-labelledby={labelId}
            type="text"
            inputMode="numeric"
            value={field.displayValue}
            placeholder="0"
            disabled={isInputDisabled}
            containerClassName="ds-originals-field ds-stop-conditions-percentage-field border-transparent bg-ds-surface-tertiary h-8 py-0 pl-ds-3 pr-0"
            className={cn(
              'text-ds-body-lg font-ds-medium',
              !isInputDisabled &&
                (isValueMuted ? 'text-ds-text-secondary' : 'text-ds-text-primary'),
            )}
            trailing={
              <span
                className={cn(
                  'text-ds-body-md pr-ds-3 group-data-[disabled]:text-ds-text-tertiary',
                  !isInputDisabled &&
                    (isValueMuted ? 'text-ds-text-secondary' : 'text-ds-text-primary'),
                )}
              >
                %
              </span>
            }
            onFocus={field.handleFocus}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
