'use client';

import type { GameWinModalProps } from './game-win-modal.types';

import { cn } from '#ui/lib/cn';
import { GradientCard } from '#ui/primitives/data-display/gradient-card/gradient-card';
import { Typography } from '#ui/primitives/foundation/typography/typography';

export function GameWinModal({
  open,
  title,
  multiplierLabel,
  multiplier,
  formattedWinAmount,
  currencyIcon,
  reducedMotion = false,
  contentClassName,
}: GameWinModalProps) {
  return (
    <>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {open ? (
          <span key={`${formattedWinAmount}-${multiplier}`}>
            {title} {formattedWinAmount}. {multiplierLabel} {multiplier}.
          </span>
        ) : null}
      </span>

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-4 top-1/2 z-[150] -translate-y-1/2',
          contentClassName,
        )}
      >
        <GradientCard
          radius="xs"
          className={cn(
            'ds-game-win-modal-card mx-auto min-h-[66px] w-max min-w-[min(312px,100%)] max-w-full overflow-hidden p-4',
            reducedMotion
              ? 'transition-none'
              : 'duration-ds-base ease-ds-standard transition-[opacity,transform] motion-reduce:transition-none',
            open ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
        >
          <div className="flex max-w-full flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="shrink-0">
              <Typography kind="white-16-700" as="p" className="whitespace-nowrap">
                {title}
              </Typography>
              <Typography
                kind="white-14-400"
                as="p"
                className="text-ds-gray-600 whitespace-nowrap"
              >
                {multiplierLabel}
                <span className="text-ds-text-brand-primary ml-[5px]">{multiplier}</span>
              </Typography>
            </div>
            <div className="flex min-w-0 max-w-full items-center gap-2">
              {currencyIcon ? (
                <span
                  aria-hidden
                  className="ds-game-win-modal-currency-icon rounded-ds-full flex size-8 shrink-0 items-center justify-center overflow-hidden"
                >
                  {currencyIcon}
                </span>
              ) : null}
              <Typography kind="white-20-700" as="p" className="min-w-0 break-all">
                {formattedWinAmount}
              </Typography>
            </div>
          </div>
        </GradientCard>
      </div>
    </>
  );
}

export type { GameWinModalProps } from './game-win-modal.types';
