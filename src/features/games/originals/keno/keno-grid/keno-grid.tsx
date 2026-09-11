'use client';

import { useEffect } from 'react';

import type { KenoGridProps } from './keno-grid.types';
import { KENO_GRID_COLUMNS, resolveKenoGridCells } from './keno-grid.utils';

import { KenoCell } from '#ui/features/games/originals/keno/keno-cell/keno-cell';
import type { KenoCellAssets } from '#ui/features/games/originals/keno/keno-cell/keno-cell.types';
import { cn } from '#ui/lib/cn';

function preloadKenoCellAssets(assets: KenoCellAssets) {
  for (const src of Object.values(assets)) {
    const image = new window.Image();
    image.decoding = 'async';
    image.src = src;
  }
}

export function KenoGrid({
  cells,
  assets,
  theatreMode = false,
  reducedMotion = false,
  disabled = false,
  onCellClick,
  className,
  'aria-label': ariaLabel,
  getCellAriaLabel,
}: KenoGridProps) {
  const resolvedCells = resolveKenoGridCells(cells);

  useEffect(() => {
    preloadKenoCellAssets(assets);
  }, [assets.cell, assets.guessed, assets.missed, assets.selected]);

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-lg:shrink-0',
        theatreMode ? 'max-w-none' : 'ds-keno-surface-max',
        className,
      )}
    >
      <div
        role="group"
        aria-label={ariaLabel}
        className="grid w-full gap-1"
        style={{
          gridTemplateColumns: `repeat(${KENO_GRID_COLUMNS}, minmax(0, 1fr))`,
        }}
      >
        {resolvedCells.map((cell) => {
          const cellDisabled = disabled || Boolean(cell.disabled);

          return (
            <KenoCell
              key={cell.number}
              number={cell.number}
              state={cell.state}
              assets={assets}
              disabled={cellDisabled}
              reducedMotion={reducedMotion}
              aria-label={getCellAriaLabel(cell)}
              className="min-w-0"
              onClick={
                onCellClick
                  ? () => {
                      onCellClick(cell.number);
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export type { KenoGridProps } from './keno-grid.types';
