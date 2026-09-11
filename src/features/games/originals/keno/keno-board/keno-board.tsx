'use client';

import type { KenoBoardProps } from './keno-board.types';

import { KenoGrid } from '#ui/features/games/originals/keno/keno-grid/keno-grid';
import { KenoPaytable } from '#ui/features/games/originals/keno/keno-paytable/keno-paytable';
import { cn } from '#ui/lib/cn';

export function KenoBoard({
  cells,
  assets,
  onCellClick,
  gridAriaLabel,
  getCellAriaLabel,
  paytable,
  theatreMode = false,
  reducedMotion = false,
  disabled = false,
  overlay,
  resultAnnouncement,
  className,
}: KenoBoardProps) {
  return (
    <div
      className={cn(
        'bg-ds-black rounded-ds-sm relative flex w-full flex-col',
        theatreMode
          ? 'ds-keno-board-theatre-frame p-ds-3 py-ds-4 lg:px-ds-5 lg:pb-ds-6 lg:pt-ds-4 max-lg:shrink-0 lg:h-full lg:justify-center'
          : 'p-ds-3 py-ds-6 max-lg:shrink-0 lg:min-h-0 lg:flex-1 lg:justify-center',
        className,
      )}
    >
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultAnnouncement ? (
          <span key={resultAnnouncement.id}>{resultAnnouncement.message}</span>
        ) : null}
      </span>
      {overlay}

      <div
        className={cn(
          'gap-ds-6 mx-auto flex flex-col',
          theatreMode
            ? 'ds-keno-board-theatre-stack lg:min-h-0'
            : 'ds-keno-surface-max w-full',
        )}
      >
        <KenoGrid
          cells={cells}
          assets={assets}
          theatreMode={theatreMode}
          reducedMotion={reducedMotion}
          disabled={disabled}
          onCellClick={onCellClick}
          aria-label={gridAriaLabel}
          getCellAriaLabel={getCellAriaLabel}
          className="w-full"
        />
        <KenoPaytable
          items={paytable.items}
          reachedHits={paytable.reachedHits}
          empty={paytable.empty}
          emptyLabel={paytable.emptyLabel}
          hitsIconSrc={paytable.hitsIconSrc}
          theatreMode={theatreMode}
          reducedMotion={reducedMotion}
          aria-label={paytable['aria-label']}
          getItemAriaLabel={paytable.getItemAriaLabel}
        />
      </div>
    </div>
  );
}

export type {
  KenoBoardPaytable,
  KenoBoardProps,
  KenoResultAnnouncement,
} from './keno-board.types';
