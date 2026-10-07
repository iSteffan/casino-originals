'use client';

import { RouletteField } from '../roulette-field/roulette-field';
import { RouletteLastResults } from '../roulette-last-results/roulette-last-results';
import { RouletteWheel } from '../roulette-wheel/roulette-wheel';
import type { RouletteBoardProps } from './roulette-board.types';

import { cn } from '#ui/lib/cn';

export function RouletteBoard({
  lastResults,
  wheel,
  field,
  theatreMode = false,
  overlay,
  className,
}: RouletteBoardProps) {
  return (
    <div
      className={cn(
        // No overflow-x-clip: CSS makes overflow-x:clip force overflow-y:clip too,
        // which cuts off stacked chips / win glows above the top row of the table.
        'bg-ds-surface-secondary relative flex w-full min-w-0 flex-col rounded-ds-sm p-4',
        theatreMode && 'min-h-0 flex-1 lg:h-full',
        className,
      )}
    >
      <RouletteLastResults
        items={lastResults.items}
        assets={lastResults.assets}
        label={lastResults.label}
        aria-label={lastResults['aria-label']}
        className={lastResults.className}
      />

      <div
        className={cn(
          'relative flex w-full flex-col items-center gap-6',
          theatreMode && 'min-h-0 flex-1 justify-center',
        )}
      >
        {/* w-full: GameWinModal positions absolute inset-x; wheel-only width (~262px) forces flex-wrap stack */}
        <div className="relative flex w-full justify-center">
          <RouletteWheel {...wheel} />
          {overlay ? (
            <div className="pointer-events-none absolute inset-0 z-20">
              {overlay}
            </div>
          ) : null}
        </div>

        <div className="flex w-full min-w-0 justify-center">
          <RouletteField {...field} />
        </div>
      </div>
    </div>
  );
}

export type { RouletteBoardProps } from './roulette-board.types';
