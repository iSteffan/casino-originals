import type { KenoCellAssets, KenoCellState } from './keno-cell.types';

export function getKenoCellFaceSrc(assets: KenoCellAssets, state: KenoCellState): string {
  switch (state) {
    case 'win':
      return assets.guessed;
    case 'missed':
      return assets.missed;
    case 'selected':
    case 'lose':
      return assets.selected;
    case 'idle':
    default:
      return assets.cell;
  }
}

export function isKenoCellSelectable(state: KenoCellState): boolean {
  return state === 'idle' || state === 'selected';
}

export function isKenoCellPicked(state: KenoCellState): boolean {
  return state === 'selected' || state === 'win' || state === 'lose';
}
