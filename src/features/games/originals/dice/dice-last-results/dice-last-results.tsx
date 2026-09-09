import type { DiceLastResultsProps } from './dice-last-results.types';

import { LastResults } from '#ui/features/games/originals/shared/last-results/last-results';
import { cn } from '#ui/lib/cn';
import { Image } from '#ui/primitives/data-display/image/image';
import { Typography } from '#ui/primitives/foundation/typography/typography';

export function DiceLastResults({
  items,
  assets,
  labels,
  className,
  'aria-label': ariaLabel,
}: DiceLastResultsProps) {
  return (
    <LastResults
      items={items}
      getItemKey={(item) => item.id}
      flow="toward-end"
      className={cn('ds-dice-last-results', className)}
      aria-label={ariaLabel}
      lead={
        <Image
          src={assets.lead}
          alt=""
          wrapperClassName="size-4 shrink-0"
          className="size-4 object-contain"
          showSkeleton={false}
        />
      }
      renderItem={(item) => (
        <div className="flex items-center gap-2">
          <Typography
            kind="white-10-400"
            as="span"
            aria-hidden
            className="text-ds-text-secondary"
          >
            •
          </Typography>

          <div className="flex items-center gap-1">
            <Image
              src={assets[item.color]}
              alt={labels[item.color]}
              wrapperClassName="h-4 w-3.5 shrink-0"
              className="h-4 w-3.5 object-contain"
              showSkeleton={false}
            />
            <Typography kind="white-12-700" as="span">
              {item.value.toFixed(2)}
            </Typography>
          </div>
        </div>
      )}
    />
  );
}

export type {
  DiceLastResultColor,
  DiceLastResultItem,
  DiceLastResultsAssets,
  DiceLastResultsLabels,
  DiceLastResultsProps,
} from './dice-last-results.types';
