'use client';

import type { DoubleTileProps } from './double-tile.types';

import { DOUBLE_TILE_SIZE_PX, getDoubleTileImage } from '#ui/features/games/originals/double/double.constants';
import { cn } from '#ui/lib/cn';

/** One 64x64 strip tile (betstrike legacy `double-board` cell). */
export function DoubleTile({
  tile,
  state = 'active',
  reducedMotion = false,
  className,
}: DoubleTileProps) {
  const isWin = state === 'win';

  return (
    <div
      data-slot="double-tile"
      data-state={state}
      data-reduced-motion={reducedMotion ? 'true' : undefined}
      className={cn('relative shrink-0', isWin && 'ds-double-tile-win', className)}
      style={{ width: DOUBLE_TILE_SIZE_PX, height: DOUBLE_TILE_SIZE_PX }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getDoubleTileImage(tile, isWin)})` }}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 blur-[20px] transition-all duration-300',
          state === 'dimmed' ? 'bg-black opacity-80' : 'bg-transparent opacity-100',
        )}
      />
    </div>
  );
}

export type { DoubleTileProps, DoubleTileState } from './double-tile.types';
