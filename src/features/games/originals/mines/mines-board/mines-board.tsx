'use client';

import type { MinesBoardProps } from './mines-board.types';

import { MinesGrid } from '#ui/features/games/originals/mines/mines-grid/mines-grid';
import { cn } from '#ui/lib/cn';

export function MinesBoard({
  gridSize,
  cells,
  assets,
  theatreMode = false,
  reducedMotion = false,
  selectionMode = false,
  disabled = false,
  onCellClick,
  gridAriaLabel,
  getCellAriaLabel,
  resultAnnouncement,
  overlay,
  className,
  gridClassName,
}: MinesBoardProps) {
  return (
    <div
      className={cn(
        'bg-ds-black rounded-ds-sm relative flex w-full flex-col lg:min-h-0 lg:flex-1',
        theatreMode && 'ds-mines-board-theatre',
        className,
      )}
    >
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultAnnouncement ? (
          <span key={resultAnnouncement.id}>{resultAnnouncement.message}</span>
        ) : null}
      </span>

      <div
        className={cn(
          'flex min-h-0 flex-1 items-center justify-center',
          theatreMode && 'ds-mines-board-theatre-content',
        )}
      >
        <MinesGrid
          gridSize={gridSize}
          cells={cells}
          assets={assets}
          theatreMode={theatreMode}
          reducedMotion={reducedMotion}
          selectionMode={selectionMode}
          disabled={disabled}
          onCellClick={onCellClick}
          aria-label={gridAriaLabel}
          getCellAriaLabel={getCellAriaLabel}
          className={gridClassName}
        />
      </div>

      {overlay}
    </div>
  );
}

export type { MinesBoardProps, MinesResultAnnouncement } from './mines-board.types';
