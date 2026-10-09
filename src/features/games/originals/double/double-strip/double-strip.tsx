'use client';

import type { DoubleStripProps } from './double-strip.types';
import { getDoubleStripOffsetPx, getDoubleStripTargetIndex } from './double-strip.utils';

import {
  DOUBLE_ROLL_EASING,
  DOUBLE_ROLLING_MARKER_SRC,
  DOUBLE_STRIP_REPEATS,
  DOUBLE_TILE_GAP_PX,
  DOUBLE_TILES,
} from '#ui/features/games/originals/double/double.constants';
import { DoubleTile } from '#ui/features/games/originals/double/double-tile/double-tile';
import type { DoubleTileState } from '#ui/features/games/originals/double/double-tile/double-tile.types';
import { cn } from '#ui/lib/cn';

const STRIP_TILES = Array.from({ length: DOUBLE_STRIP_REPEATS }, () => DOUBLE_TILES).flat();

function getTileState(
  phase: DoubleStripProps['phase'],
  isTarget: boolean,
): DoubleTileState {
  if (phase === 'FINISHED') return isTarget ? 'win' : 'dimmed';
  if (phase === 'LOCKED' || phase === 'RESOLVING') return 'active';
  return 'dimmed';
}

/**
 * Horizontal Double strip with the center marker (betstrike legacy `double-board`).
 * The strip only animates during RESOLVING; every other phase snaps without a transition.
 */
export function DoubleStrip({
  phase,
  tileIndex,
  rollDurationMs,
  reducedMotion = false,
  className,
}: DoubleStripProps) {
  const targetIndex = getDoubleStripTargetIndex(phase, tileIndex);
  const offset = getDoubleStripOffsetPx(targetIndex);
  const rolling = phase === 'RESOLVING' && !reducedMotion;

  return (
    <div
      data-slot="double-strip"
      data-phase={phase}
      className={cn('relative h-24 w-full overflow-hidden', className)}
    >
      <div
        className="absolute left-1/2 top-1/2 flex"
        style={{
          gap: DOUBLE_TILE_GAP_PX,
          transform: `translate3d(${offset}px, -50%, 0)`,
          transition: rolling ? `transform ${rollDurationMs}ms ${DOUBLE_ROLL_EASING}` : 'none',
        }}
        aria-hidden
      >
        {STRIP_TILES.map((tile, index) => (
          <DoubleTile
            // Strip slots are static; the index is the identity.
            key={index}
            tile={tile}
            state={getTileState(phase, index === targetIndex)}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-1/2 top-1/2 h-24 w-3 -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat transition-opacity duration-300',
          phase === 'BETTING' ? 'opacity-0' : 'opacity-100',
        )}
        style={{ backgroundImage: `url(${DOUBLE_ROLLING_MARKER_SRC})` }}
      />
    </div>
  );
}

export type { DoubleStripProps } from './double-strip.types';
