import type { ReactNode } from 'react';

import type { MinesCellAssets } from './mines-cell/mines-cell.types';
import type { MinesGridCell, MinesGridSize } from './mines-grid/mines-grid.types';
import { getMinesGridCellCount } from './mines-grid/mines-grid.utils';
import type { MinesSliderAssets } from './mines-slider/mines-slider';

import { Image } from '#ui/primitives/data-display/image/image';

let nextStoryAnnouncementId = 1;

export const minesStoryCurrencyIcon: ReactNode = (
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

export const minesStoryWinCurrencyIcon: ReactNode = (
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

export const minesStoryBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

export const minesStoryStopConditionsLabels = {
  onWin: 'On Win',
  onLoss: 'On Loss',
  stopProfit: 'Stop on Profit',
  stopLoss: 'Stop on Loss',
  reset: 'Reset',
  increaseBy: 'Increase by',
};

export const minesStorySliderAssets: MinesSliderAssets = {
  thumb: '/img/games/mines/mines-thumb.svg',
  safe: '/img/games/mines/gold.svg',
  mine: '/img/games/mines/mine.svg',
};

export const minesStoryCellAssets: MinesCellAssets = {
  tile: '/img/games/mines/tile.png',
  logo: '/img/games/mines/logo.svg',
  win: '/img/games/mines/win.png',
  winTile: '/img/games/mines/win-tile.svg',
  lose: '/img/games/mines/lose.png',
  loseTile: '/img/games/mines/lose-tile.svg',
  gold: '/img/games/mines/gold.png',
  mine: '/img/games/mines/mine.png',
};

export { getMinesGridCellCount };

export function getMinesStoryGridSettings(gridSize: MinesGridSize) {
  const totalCells = getMinesGridCellCount(gridSize);

  return {
    minNumberOfMines: 1,
    maxNumberOfMines: totalCells - 1,
    totalCells,
  };
}

export function getMinesStoryGridSizeUpdate(
  gridSize: MinesGridSize,
  numberOfMines: number,
) {
  const { minNumberOfMines, maxNumberOfMines } = getMinesStoryGridSettings(gridSize);

  return {
    gridSize,
    numberOfMines: Math.min(Math.max(numberOfMines, minNumberOfMines), maxNumberOfMines),
  };
}

export function createMinesGridCells(
  gridSize: MinesGridSize,
  overrides: Partial<MinesGridCell> = {},
): MinesGridCell[] {
  return Array.from({ length: getMinesGridCellCount(gridSize) }, () => ({
    revealed: false,
    content: null,
    selected: false,
    cashoutLabel: null,
    disabled: false,
    ...overrides,
  }));
}

export function getMinesStoryCellAriaLabel(
  cell: MinesGridCell,
  row: number,
  column: number,
): string {
  const position = `Mines cell ${row}, ${column}`;

  if (cell.revealed) {
    if (cell.content === 'mine') return `${position}, mine`;

    return cell.cashoutLabel
      ? `${position}, safe, cashout ${cell.cashoutLabel}`
      : `${position}, safe`;
  }

  return `${position}, ${cell.selected ? 'selected' : 'hidden'}`;
}

export function focusFirstAvailableMinesStoryCell(
  container: HTMLElement | null,
): boolean {
  const cell = container?.querySelector<HTMLButtonElement>(
    'button[data-slot="mines-cell"]:not(:disabled):not([aria-disabled="true"])',
  );
  if (!cell) return false;

  cell.focus();
  return true;
}

const MINES_STORY_SOUNDS = {
  cell: '/sounds/games/mines/cell.wav',
  mine: '/sounds/games/mines/mine.wav',
  cashout: '/sounds/games/mines/cashout.wav',
} as const;

export type MinesStorySoundName = keyof typeof MINES_STORY_SOUNDS;

const minesStorySoundTemplates = new Map<string, HTMLAudioElement>();

function getMinesStorySoundTemplate(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  const cached = minesStorySoundTemplates.get(src);
  if (cached) return cached;

  const template = new Audio(src);
  template.preload = 'auto';
  minesStorySoundTemplates.set(src, template);
  return template;
}

export function preloadMinesStorySounds(): void {
  Object.values(MINES_STORY_SOUNDS).forEach((src) => {
    getMinesStorySoundTemplate(src);
  });
}

function getSafeMinesStorySoundVolume(volume: number): number {
  return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
}

export function setMinesStorySoundsVolume(
  sounds: Iterable<HTMLAudioElement>,
  volume: number,
): void {
  const safeVolume = getSafeMinesStorySoundVolume(volume);
  for (const sound of sounds) {
    sound.volume = safeVolume;
  }
}

export function stopMinesStorySounds(sounds: Set<HTMLAudioElement>): void {
  for (const sound of sounds) {
    sound.pause();
    sound.currentTime = 0;
  }
  sounds.clear();
}

export function playMinesStorySound(
  name: MinesStorySoundName,
  volume: number,
  onSettled?: (audio: HTMLAudioElement) => void,
): HTMLAudioElement | null {
  const safeVolume = getSafeMinesStorySoundVolume(volume);
  if (safeVolume <= 0) return null;

  const template = getMinesStorySoundTemplate(MINES_STORY_SOUNDS[name]);
  if (!template) return null;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  const settle = () => onSettled?.(audio);
  audio.volume = safeVolume;
  audio.addEventListener('ended', settle, { once: true });
  audio.addEventListener('error', settle, { once: true });
  void audio.play().catch(settle);
  return audio;
}

export function createMinesStoryAnnouncement(message: string) {
  const id = `mines-story-${nextStoryAnnouncementId}`;
  nextStoryAnnouncementId += 1;
  return { id, message };
}

export function createMinesStoryMineIndexes(
  gridSize: MinesGridSize,
  numberOfMines: number,
): number[] {
  const cellCount = getMinesGridCellCount(gridSize);
  const mineCount = Math.min(Math.max(numberOfMines, 1), cellCount - 1);
  const indexes = Array.from({ length: cellCount }, (_, index) => index);

  for (let index = cellCount - 1; index > 0; index -= 1) {
    const swapIndex = (index * 7 + mineCount * 3) % (index + 1);
    const current = indexes[index]!;
    indexes[index] = indexes[swapIndex]!;
    indexes[swapIndex] = current;
  }

  return indexes.slice(0, mineCount).sort((left, right) => left - right);
}

/** Legacy manual `mines:end` → `clearBoard(true)` delay. */
export const MINES_STORY_BOARD_CLEAR_DELAY_MS = 2000;

/** Gap after board clear before the next autobet round (legacy next-bet chain). */
export const MINES_STORY_AUTOBET_NEXT_ROUND_DELAY_MS = 1000;

/** Delay before revealing selected auto tiles after round start. */
export const MINES_STORY_AUTOBET_REVEAL_DELAY_MS = 150;

/** Demo house-edge factor for story multipliers (not real game math). */
const MINES_STORY_HOUSE_EDGE = 0.99;

export function getMinesStoryMultiplier(
  gridSize: MinesGridSize,
  numberOfMines: number,
  safeRevealedCount: number,
): number {
  const cellCount = getMinesGridCellCount(gridSize);
  const mines = Math.min(Math.max(numberOfMines, 1), cellCount - 1);
  const picks = Math.min(Math.max(safeRevealedCount, 0), cellCount - mines);

  let multiplier = 1;
  for (let pick = 0; pick < picks; pick += 1) {
    const remaining = cellCount - pick;
    const remainingSafe = remaining - mines;
    if (remainingSafe <= 0) break;
    multiplier *= remaining / remainingSafe;
  }

  return multiplier * MINES_STORY_HOUSE_EDGE;
}

export function formatMinesStoryCashoutLabel(
  betAmount: string,
  multiplier: number,
): string {
  const bet = Number.parseFloat(betAmount);
  const stake = Number.isFinite(bet) && bet > 0 ? bet : 1;
  return (stake * multiplier).toFixed(2);
}

export function formatMinesStoryMultiplierLabel(multiplier: number): string {
  return `${multiplier.toFixed(2)}x`;
}

export function applyMinesStorySelection(
  cells: readonly MinesGridCell[],
  selectedIndexes: readonly number[],
): MinesGridCell[] {
  const selected = new Set(selectedIndexes);
  return cells.map((cell, index) => ({
    ...cell,
    selected: selected.has(index),
  }));
}

export function revealMinesStoryBoard({
  cells,
  mineIndexes,
  hitIndex,
}: {
  cells: readonly MinesGridCell[];
  mineIndexes: readonly number[];
  hitIndex?: number;
}): MinesGridCell[] {
  const mineSet = new Set(mineIndexes);

  return cells.map((cell, index) => {
    const isMine = mineSet.has(index);
    const wasPlayerReveal = cell.revealed && cell.revealStyle === 'player';
    const isPlayerHit = hitIndex === index;

    return {
      revealed: true,
      content: isMine ? 'mine' : 'safe',
      revealStyle: wasPlayerReveal || isPlayerHit ? 'player' : 'board',
      selected: false,
      cashoutLabel: wasPlayerReveal || isPlayerHit ? (cell.cashoutLabel ?? null) : null,
      disabled: true,
    };
  });
}

export function countMinesStorySafeRevealed(
  cells: readonly MinesGridCell[],
  mineIndexes: readonly number[],
): number {
  const mineSet = new Set(mineIndexes);
  return cells.reduce((count, cell, index) => {
    if (mineSet.has(index)) return count;
    return cell.revealed ? count + 1 : count;
  }, 0);
}
