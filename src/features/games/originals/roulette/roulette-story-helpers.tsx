import type { ReactNode } from 'react';

import type { RouletteBet } from './roulette-engine';
import { getRouletteChipDef, sumRouletteStake } from './roulette-engine';
import type { RouletteCellAssets, RouletteCellChip } from './roulette-cell/roulette-cell.types';
import type { RouletteFieldCellBets } from './roulette-field/roulette-field.types';
import type {
  RouletteLastResultItem,
  RouletteLastResultsAssets,
} from './roulette-last-results/roulette-last-results.types';
import { ROULETTE_CHIPS, getRouletteNumberColor } from './roulette.constants';
import type { RouletteHistoryItem } from './use-roulette-session';

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

export const rouletteStoryLastResultsAssets: RouletteLastResultsAssets = {
  red: '/img/games/roulette/last-red.png',
  black: '/img/games/roulette/last-black.png',
  green: '/img/games/roulette/last-green.png',
};

export function formatRouletteChipTotal(total: number): string {
  if (!Number.isFinite(total) || total <= 0) return '';
  return total % 1 === 0 ? String(total) : total.toFixed(2);
}

export function formatRouletteMoney(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

/** Group session bets into field cell chip stacks (max 5 visible per cell). */
export function betsToRouletteFieldMap(
  bets: readonly RouletteBet[],
): Record<string, RouletteFieldCellBets> {
  const byCell = new Map<string, RouletteBet[]>();
  for (const bet of bets) {
    const list = byCell.get(bet.cellId) ?? [];
    list.push(bet);
    byCell.set(bet.cellId, list);
  }

  const result: Record<string, RouletteFieldCellBets> = {};
  for (const [cellId, cellBets] of byCell) {
    const visible = cellBets.slice(-5);
    const total = cellBets.reduce((sum, bet) => sum + bet.amount, 0);
    result[cellId] = {
      chips: visible.map((bet, index) => {
        const chip = getRouletteChipDef(bet.amount);
        return {
          id: bet.id,
          src: chip.src,
          amountLabel:
            index === visible.length - 1 ? formatRouletteChipTotal(total) : undefined,
        };
      }),
    };
  }
  return result;
}

export function historyToRouletteLastResults(
  history: readonly RouletteHistoryItem[],
): RouletteLastResultItem[] {
  return history.map((item) => ({
    id: item.id,
    number: item.number,
    color: getRouletteNumberColor(item.number),
  }));
}

export function canPlaceRouletteChip(
  bets: readonly RouletteBet[],
  chip: number,
  balance: number,
): boolean {
  return sumRouletteStake(bets) + chip <= balance + 1e-9;
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

export const rouletteStoryWinCurrencyIcon: ReactNode = (
  <Image
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={32}
    height={32}
    wrapperClassName="size-8 shrink-0 rounded-ds-full"
    className="size-8 object-contain"
    showSkeleton={false}
  />
);

export const rouletteStoryUndoIconSrc = '/img/games/roulette/undo.svg';
export const rouletteStoryClearIconSrc = '/img/games/roulette/clear.svg';

export const rouletteStoryChipOptions = ROULETTE_CHIPS.map((chip) => ({
  value: chip.value,
  label: String(chip.value),
  src: chip.src,
}));
