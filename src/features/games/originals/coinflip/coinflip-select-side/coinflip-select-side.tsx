'use client';

import { useId } from 'react';

import type { CoinflipSelectSideProps, CoinflipSide } from './coinflip-select-side.types';

import { formControlFocusRingWithin } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

const glowClassBySide: Record<CoinflipSide, string> = {
  HEADS: 'ds-coinflip-select-side-heads-glow',
  TAILS: 'ds-coinflip-select-side-tails-glow',
};

export function CoinflipSelectSide({
  value,
  onChange,
  options,
  labels,
  disabled = false,
  className,
}: CoinflipSelectSideProps) {
  const groupName = useId();

  return (
    <fieldset disabled={disabled} className={cn('min-w-0 border-0 p-0', className)}>
      <legend className="mb-ds-1">
        <Typography kind="white-12-700" as="span">
          {labels.title}
        </Typography>
      </legend>

      <div className="flex min-w-0 items-center justify-center gap-2">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <label
              key={option.value}
              className={cn(
                formControlFocusRingWithin,
                'duration-ds-base ease-ds-standard motion-reduce:transition-none',
                'transition-[background-color,border-color,box-shadow]',
                'p-ds-3 relative min-w-0 flex-1 cursor-pointer overflow-visible border text-left',
                // 6px: off-token radius, no exact DS token (radius-xxs=4px, xs=8px)
                'rounded-ds-2xs',
                selected
                  ? 'bg-ds-brand-secondary cursor-default border-transparent'
                  : 'border-ds-border-secondary bg-ds-surface-tertiary',
                !selected && !disabled && 'hover:bg-ds-gray-700',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />

              <Typography
                as="span"
                kind={selected ? 'white-14-400' : 'secondary-14-400'}
                className="mb-ds-1 leading-ds-solid block text-start"
              >
                {option.label}
              </Typography>

              <span
                aria-hidden="true"
                className={cn(
                  'ds-coinflip-select-side-coin rounded-ds-full mx-auto block',
                  selected && glowClassBySide[option.value],
                )}
              >
                {option.visual}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export type {
  CoinflipSelectSideLabels,
  CoinflipSelectSideOption,
  CoinflipSelectSideProps,
  CoinflipSide,
} from './coinflip-select-side.types';
