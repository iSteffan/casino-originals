'use client';

import { useId } from 'react';

import type { DoubleBetTypeSelectorProps } from './double-bet-type-selector.types';

import { formControlFocusRing } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function SelectedBadge() {
  return (
    <span
      aria-hidden
      className="bg-ds-purple-500 absolute -left-1 -top-1 flex size-4 items-center justify-center rounded-ds-full"
    >
      <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
        <path
          d="M2.5 6.2 4.9 8.5 9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ds-text-primary"
        />
      </svg>
    </span>
  );
}

/**
 * Multi-select "Your bet" grid (betstrike legacy `bet-type-selector`): four 58px tiles,
 * selected tiles get the brand border and a check badge.
 */
export function DoubleBetTypeSelector({
  value,
  onToggle,
  options,
  label = 'Your bet',
  disabled = false,
  className,
}: DoubleBetTypeSelectorProps) {
  const labelId = useId();

  return (
    <div data-slot="double-bet-type-selector" className={cn('flex w-full flex-col', className)}>
      <Typography kind="white-12-700" as="span" id={labelId} className="mb-ds-1 block">
        {label}
      </Typography>
      <div role="group" aria-labelledby={labelId} className="grid w-full grid-cols-4 gap-1">
        {options.map((option) => {
          const selected = value.includes(option.type);
          return (
            <button
              key={option.type}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onToggle(option.type)}
              className={cn(
                'relative flex h-[58px] min-w-0 cursor-pointer flex-col items-center justify-between rounded-[6px] border p-2 transition-colors',
                'bg-ds-gray-800 hover:border-ds-purple-500',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-ds-gray-700',
                selected ? 'border-ds-purple-500' : 'border-ds-gray-700',
                formControlFocusRing,
              )}
            >
              {selected ? <SelectedBadge /> : null}
              <span
                aria-hidden
                className="size-6 shrink-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${option.image})` }}
              />
              <Typography as="span" kind="secondary-12-500" wrap="truncate" className="max-w-full">
                {option.label}
              </Typography>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type {
  DoubleBetTypeOption,
  DoubleBetTypeSelectorProps,
} from './double-bet-type-selector.types';
