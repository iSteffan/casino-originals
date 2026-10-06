'use client';

import type { RouletteLastResultsProps } from './roulette-last-results.types';

import { LastResults } from '#ui/features/games/originals/shared/last-results/last-results';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function letterFor(color: RouletteLastResultsProps['items'][number]['color']): string {
  if (color === 'green') return 'G';
  if (color === 'red') return 'R';
  return 'B';
}

export function RouletteLastResults({
  items,
  assets,
  label = 'Previous rolls',
  className,
  'aria-label': ariaLabel = 'Previous roulette rolls',
}: RouletteLastResultsProps) {
  return (
    <div className={cn('mb-4 flex w-full flex-col gap-1 overflow-hidden', className)}>
      <Typography as="p" kind="secondary-12-400" className="m-0 pl-1">
        {label}
      </Typography>
      <LastResults
        items={items}
        getItemKey={(item) => item.id}
        flow="toward-start"
        aria-label={ariaLabel}
        gap={4}
        renderItem={(item) => (
          <div
            className="flex h-6 w-10 items-center justify-center rounded-[4px] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${assets[item.color]})` }}
          >
            <Typography as="span" kind="white-10-500" className="m-0">
              {letterFor(item.color)} {item.number}
            </Typography>
          </div>
        )}
      />
    </div>
  );
}

export type {
  RouletteLastResultColor,
  RouletteLastResultItem,
  RouletteLastResultsAssets,
  RouletteLastResultsProps,
} from './roulette-last-results.types';
