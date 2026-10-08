'use client';

import type { PlinkoLastResultsProps } from './plinko-last-results.types';

import { LastResults } from '#ui/features/games/originals/shared/last-results/last-results';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

export function PlinkoLastResults({
  items,
  className,
  'aria-label': ariaLabel,
}: PlinkoLastResultsProps) {
  return (
    <LastResults
      items={items}
      getItemKey={(item) => item.id}
      flow="toward-start"
      gap={6}
      className={cn('ds-plinko-last-results', className)}
      aria-label={ariaLabel}
      renderItem={(item) => (
        <div
          className="ds-plinko-last-results-pill"
          style={{ backgroundColor: item.color }}
        >
          <Typography kind="white-12-500" as="span">
            x {item.multiplier}
          </Typography>
        </div>
      )}
    />
  );
}

export type {
  PlinkoLastResultItem,
  PlinkoLastResultsProps,
} from './plinko-last-results.types';
