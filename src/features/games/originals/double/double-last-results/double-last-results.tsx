'use client';

import type { DoubleLastResultsLabels, DoubleLastResultsProps } from './double-last-results.types';

import {
  DOUBLE_LAST_100_IMAGES,
  getDoubleSmallTileImage,
} from '#ui/features/games/originals/double/double.constants';
import type { DoubleLast100Stats } from '#ui/features/games/originals/double/double.types';
import { LastResults } from '#ui/features/games/originals/shared/last-results/last-results';
import { cn } from '#ui/lib/cn';
import { Typography, type TypographyKind } from '#ui/primitives/foundation/typography/typography';

const DEFAULT_LABELS: DoubleLastResultsLabels = {
  previousRolls: 'Previous rolls',
  last100: 'Last 100',
};

const STAT_CHIPS: readonly {
  key: keyof DoubleLast100Stats;
  letter: string;
  kind: TypographyKind;
}[] = [
  { key: 'red', letter: 'R', kind: 'error-12-500' },
  { key: 'black', letter: 'B', kind: 'tertiary-12-500' },
  { key: 'green', letter: 'G', kind: 'success-12-500' },
  { key: 'joker', letter: 'J', kind: 'tertiary-12-500' },
];

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 0,
});

/**
 * Legacy `double-last-results`: last 10 small tiles (newest on the right) and
 * the last-100 R/B/G/J counters.
 */
export function DoubleLastResults({
  items,
  stats,
  labels,
  className,
  'aria-label': ariaLabel = 'Double previous rolls',
}: DoubleLastResultsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };

  return (
    <div
      data-slot="double-last-results"
      className={cn('flex w-full min-w-0 items-end justify-between gap-1 sm:gap-4', className)}
    >
      <div className="flex min-w-0 max-w-[278px] flex-1 flex-col gap-1 overflow-hidden">
        <Typography as="p" kind="secondary-12-400" className="m-0">
          {text.previousRolls}
        </Typography>
        <div className="relative flex h-6 w-full min-w-0 items-center overflow-hidden">
          <LastResults
            items={items}
            getItemKey={(item) => item.id}
            flow="toward-start"
            aria-label={ariaLabel}
            gap={4}
            className="h-full min-h-6 [--last-results-track-min-height:1.5rem]"
            renderItem={(item) => (
              <div
                role="img"
                aria-label={item.hasJoker ? `${item.color.toLowerCase()} joker` : item.color.toLowerCase()}
                className="size-6 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${getDoubleSmallTileImage(item)})` }}
              />
            )}
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <Typography as="p" kind="secondary-12-400" className="m-0">
          {text.last100}
        </Typography>
        <div className="flex items-center gap-0.5">
          {STAT_CHIPS.map((chip) => (
            <div
              key={chip.key}
              data-stat={chip.key}
              className="flex h-6 w-10 items-center justify-center gap-1 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${DOUBLE_LAST_100_IMAGES[chip.key]})` }}
            >
              <Typography as="span" kind={chip.kind} className="m-0">
                {chip.letter}
              </Typography>
              <Typography as="span" kind="white-12-500" className="m-0 tabular-nums">
                {compactFormatter.format(stats[chip.key])}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type {
  DoubleLastResultsLabels,
  DoubleLastResultsProps,
} from './double-last-results.types';
