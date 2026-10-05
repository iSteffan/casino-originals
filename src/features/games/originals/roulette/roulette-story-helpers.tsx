import type { ReactNode } from 'react';

import type { RouletteCellAssets, RouletteCellChip } from './roulette-cell/roulette-cell.types';
import { ROULETTE_CHIPS } from './roulette.constants';

import { Image } from '#ui/primitives/data-display/image/image';

export const rouletteStoryCellAssets: RouletteCellAssets = {
  redSm: {
    desktop: '/img/games/roulette/red-tile-sm.png',
    mobile: '/img/games/roulette/red-tile-sm_mobile.png',
  },
  redMd: {
    desktop: '/img/games/roulette/red-tile-md.png',
    mobile: '/img/games/roulette/red-tile-md_mobile.png',
  },
  blackSm: {
    desktop: '/img/games/roulette/black-tile-sm.png',
    mobile: '/img/games/roulette/black-tile-sm_mobile.png',
  },
  blackMd: {
    desktop: '/img/games/roulette/black-tile-md.png',
    mobile: '/img/games/roulette/black-tile-md_mobile.png',
  },
  blackLg: {
    desktop: '/img/games/roulette/black-tile-lg.png',
    mobile: '/img/games/roulette/black-tile-lg_mobile.png',
  },
  green: {
    desktop: '/img/games/roulette/green-tile.png',
    mobile: '/img/games/roulette/green-tile_mobile.png',
  },
};

export function formatRouletteChipTotal(total: number): string {
  if (!Number.isFinite(total) || total <= 0) return '';
  return total % 1 === 0 ? String(total) : total.toFixed(2);
}

export function createRouletteStoryChips(
  amounts: readonly number[],
  idPrefix = 'chip',
): RouletteCellChip[] {
  return amounts.map((amount, index) => {
    const chip =
      ROULETTE_CHIPS.find((item) => item.value === amount) ?? ROULETTE_CHIPS[0]!;
    return {
      id: `${idPrefix}-${index}-${amount}`,
      src: chip.src,
      amountLabel:
        index === amounts.length - 1
          ? formatRouletteChipTotal(amounts.reduce((sum, value) => sum + value, 0))
          : undefined,
    };
  });
}

export const rouletteStoryCurrencyIcon: ReactNode = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={20}
    height={20}
    wrapperClassName="size-5 shrink-0 rounded-ds-full"
    className="size-5 object-contain"
    showSkeleton={false}
  />
);

export const rouletteStoryUndoIconSrc = '/img/games/roulette/undo.svg';
export const rouletteStoryClearIconSrc = '/img/games/roulette/clear.svg';
