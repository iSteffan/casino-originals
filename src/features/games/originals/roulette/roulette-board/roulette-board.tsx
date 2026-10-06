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
  overlay,
  className,
}: RouletteBoardProps) {
  return (
    <div
      className={cn(
        'bg-ds-surface-secondary relative flex w-full min-w-0 flex-col overflow-x-clip rounded-ds-sm p-4',
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

      <div className="relative flex w-full flex-col items-center gap-6">
        <div className="relative flex justify-center">
          <RouletteWheel {...wheel} />
          {overlay ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              {overlay}
            </div>
          ) : null}
        </div>

        <div className="flex w-full min-w-0 justify-center overflow-x-clip">
          <RouletteField {...field} />
        </div>
      </div>
    </div>
  );
}

export type { RouletteBoardProps } from './roulette-board.types';
