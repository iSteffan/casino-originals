import type { TowersCellAssets, TowersCellState } from './towers-cell.types';

const TOWERS_COMPACT_MAX_WIDTH_PX = 559;

export const TOWERS_DESKTOP_ART_MEDIA_QUERY = `(min-width: ${TOWERS_COMPACT_MAX_WIDTH_PX + 1}px)`;

export function isTowersCellRevealed(state: TowersCellState): boolean {
  switch (state) {
    case 'safe':
    case 'trap':
    case 'revealed-safe':
    case 'revealed-trap':
      return true;
    default:
      return false;
  }
}

export function getTowersCellFaceSrc(
  assets: TowersCellAssets,
  state: TowersCellState,
): string {
  switch (state) {
    case 'active':
    case 'auto-planned-active':
      return assets.active;
    case 'safe':
      return assets.safe;
    case 'trap':
      return assets.trap;
    case 'revealed-safe':
      return assets.revealedSafe;
    case 'revealed-trap':
      return assets.revealedTrap;
    default:
      return assets.idle;
  }
}
