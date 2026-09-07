'use client';

import { forwardRef, type KeyboardEvent } from 'react';

import { cva } from 'class-variance-authority';

import { truncateOptionLabel } from './option-group.utils';

import { formControlFocusRing } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';

const optionGroupItemVariants = cva(
  cn(
    'ds-option-group-item inline-flex cursor-pointer items-center transition-colors',
    'text-ds-body-md font-ds-medium leading-ds-solid min-w-0',
    'disabled:cursor-not-allowed disabled:opacity-50',
    formControlFocusRing,
  ),
  {
    variants: {
      selected: {
        true: cn(
          'bg-ds-purple-500 text-ds-text-primary',
          'hover:bg-ds-purple-500 hover:text-ds-text-primary',
          'disabled:bg-ds-purple-500 disabled:text-ds-text-primary',
        ),
        false: cn(
          'bg-ds-gray-800 text-ds-text-secondary',
          'hover:bg-ds-gray-700 hover:text-ds-text-primary',
          'disabled:bg-ds-gray-800 disabled:text-ds-text-secondary',
        ),
      },
      stacked: {
        true: 'px-ds-2 pt-ds-3 pb-ds-2 h-[60px] flex-col justify-between',
        false: 'px-ds-2 h-8 justify-center',
      },
    },
    defaultVariants: {
      selected: false,
      stacked: false,
    },
  },
);

interface OptionGroupItemProps {
  selected: boolean;
  disabled?: boolean;
  stacked?: boolean;
  className?: string;
  label: React.ReactNode;
  ariaLabel?: string;
  adornment?: React.ReactNode;
  truncateLabel?: boolean;
  tabIndex?: number;
  onClick: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

export const OptionGroupItem = forwardRef<HTMLButtonElement, OptionGroupItemProps>(
  function OptionGroupItem(
    {
      selected,
      disabled = false,
      stacked = false,
      className,
      label,
      ariaLabel,
      adornment,
      truncateLabel = false,
      tabIndex = -1,
      onClick,
      onKeyDown,
    },
    ref,
  ) {
    const displayLabel = truncateLabel ? truncateOptionLabel(label) : label;

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={ariaLabel}
        disabled={disabled}
        tabIndex={tabIndex}
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={cn(optionGroupItemVariants({ selected, stacked }), className)}
      >
        {adornment ? (
          <span className="gap-ds-1 flex flex-wrap items-center justify-center">
            {adornment}
          </span>
        ) : null}
        <span
          className={cn(
            'max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
            stacked && 'text-ds-body-lg font-ds-medium capitalize',
          )}
        >
          {displayLabel}
        </span>
      </button>
    );
  },
);
