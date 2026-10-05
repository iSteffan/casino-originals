import {
  ROULETTE_RANGE_MAP,
  getRouletteNumberColor,
} from '../roulette.constants';

export function getRouletteFieldStraightId(n: number): string {
  return `number-${n}`;
}

export function getRouletteFieldGroupNumbers(groupId: string): readonly number[] {
  return ROULETTE_RANGE_MAP[groupId] ?? [];
}

export function getRouletteFieldCellColor(cellId: string) {
  if (cellId.startsWith('number-')) {
    const n = Number(cellId.replace('number-', ''));
    return getRouletteNumberColor(n);
  }
  if (cellId === 'Red') return 'red' as const;
  return 'black' as const;
}
