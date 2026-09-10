'use client';

import { useEffect } from 'react';

import type { MinesGridProps } from './mines-grid.types';
import { resolveMinesGridCells } from './mines-grid.utils';

import { MinesCell } from '#ui/features/games/originals/mines/mines-cell/mines-cell';
import type { MinesCellAssets } from '#ui/features/games/originals/mines/mines-cell/mines-cell.types';
import { cn } from '#ui/lib/cn';

function preloadMinesCellAssets(assets: MinesCellAssets) {
  for (const src of Object.values(assets)) {
    const image = new window.Image();
    image.decoding = 'async';
    image.src = src;
  }
}

export function MinesGrid({
  gridSize,
  cells,
  assets,
  theatreMode = false,
  reducedMotion = false,
  selectionMode = false,
  disabled = false,
  onCellClick,
  className,
  'aria-label': ariaLabel,
  getCellAriaLabel,
}: MinesGridProps) {
  const resolvedCells = resolveMinesGridCells(gridSize, cells);

  useEffect(() => {
    preloadMinesCellAssets(assets);
  }, [
    assets.gold,
    assets.logo,
    assets.lose,
    assets.loseTile,
    assets.mine,
    assets.tile,
    assets.win,
    assets.winTile,
  ]);

  return (
    <div
      className={cn(
        // Legacy board slot: fill width up to 597px, or theatre square fit.
        'relative mx-auto flex w-full items-center justify-center',
        theatreMode && 'ds-mines-grid-theatre',
        theatreMode
          ? 'lg:h-full lg:max-h-[calc(100vh-12rem)] lg:min-h-0 lg:max-w-[min(calc(100vw-20rem),calc(100vh-12rem))]'
          : 'max-w-[597px]',
        className,
      )}
    >
      <div
        role="group"
        aria-label={ariaLabel}
        className="grid w-full gap-1.5 p-3 py-6 lg:gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {resolvedCells.map((cell, index) => {
          const row = Math.floor(index / gridSize) + 1;
          const column = (index % gridSize) + 1;
          const cellDisabled = disabled || Boolean(cell.disabled);

          return (
            <MinesCell
              key={index}
              revealed={cell.revealed}
              content={cell.content}
              revealStyle={cell.revealStyle}
              selected={cell.selected}
              selectionMode={selectionMode}
              cashoutLabel={cell.cashoutLabel}
              gridSize={gridSize}
              assets={assets}
              disabled={cellDisabled}
              reducedMotion={reducedMotion}
              aria-label={getCellAriaLabel(cell, row, column)}
              className="min-w-0"
              onClick={
                onCellClick
                  ? () => {
                      onCellClick(index);
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

export type { MinesGridProps } from './mines-grid.types';
