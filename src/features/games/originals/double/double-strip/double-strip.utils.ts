import {
  DOUBLE_STRIP_LAND_REPEAT,
  DOUBLE_STRIP_REST_REPEAT,
  DOUBLE_TILE_GAP_PX,
  DOUBLE_TILE_SIZE_PX,
  DOUBLE_TILES,
} from '#ui/features/games/originals/double/double.constants';
import type { DoublePhase } from '#ui/features/games/originals/double/double.types';

export function getDoubleStripIndex(tileIndex: number, repeat: number): number {
  return repeat * DOUBLE_TILES.length + tileIndex;
}

/**
 * Horizontal offset that centers strip tile `stripIndex` under the marker
 * (strip origin sits at the container's horizontal center).
 */
export function getDoubleStripOffsetPx(stripIndex: number): number {
  const step = DOUBLE_TILE_SIZE_PX + DOUBLE_TILE_GAP_PX;
  return -(stripIndex * step + DOUBLE_TILE_SIZE_PX / 2);
}

/**
 * Legacy positions: rest on repeat 1 (betting / locked), roll to repeat 13 while
 * resolving, stay there for the result, then snap back to the same tile on repeat 1.
 */
export function getDoubleStripTargetIndex(phase: DoublePhase, tileIndex: number): number {
  const landed = phase === 'RESOLVING' || phase === 'FINISHED';
  return getDoubleStripIndex(
    tileIndex,
    landed ? DOUBLE_STRIP_LAND_REPEAT : DOUBLE_STRIP_REST_REPEAT,
  );
}
