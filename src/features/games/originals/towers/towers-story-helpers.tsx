import type { ReactNode } from 'react';

import type { TowersCellAssets, TowersCellState } from './towers-cell/towers-cell.types';
import type {
  TowersDifficultyLabels,
  TowersDifficultyOption,
} from './towers-difficulty/towers-difficulty';
import { buildTowersAdornment } from './towers-difficulty/towers-difficulty.utils';
import type { TowersGridCell, TowersGridRow } from './towers-grid/towers-grid.types';

import { Image } from '#ui/primitives/data-display/image/image';

type TowersStoryCell = Omit<TowersGridCell, 'aria-label'>;
type TowersStoryRow = Omit<TowersGridRow, 'cells'> & { cells: TowersStoryCell[] };

export const towersStoryCellAssets: TowersCellAssets = {
  idle: '/img/games/towers/cell.png',
  active: '/img/games/towers/selected-cell.png',
  safe: '/img/games/towers/green-rectangle.png',
  trap: '/img/games/towers/red-rectangle.png',
  bomb: '/img/games/towers/bomb.png',
  revealedSafe: '/img/games/towers/inactive-win-tile.svg',
  revealedTrap: '/img/games/towers/inactive-lose-tile.svg',
};

export const towersStoryCellAssetsCompact: TowersCellAssets = {
  idle: '/img/games/towers/cell-mobile.png',
  active: '/img/games/towers/selected-cell-mobile.png',
  safe: '/img/games/towers/green-rectangle-mobile.png',
  trap: '/img/games/towers/red-rectangle-mobile.png',
  bomb: '/img/games/towers/bomb.png',
  revealedSafe: '/img/games/towers/inactive-win-tile-mobile.svg',
  revealedTrap: '/img/games/towers/inactive-lose-tile-mobile.svg',
};

export const towersStoryPotentialWin = {
  whole: '$1',
  fraction: '25',
};

export const towersStoryAmountLabel = '$1.25';

export const towersStoryBoardAriaLabel = 'Towers board';

function getTowersStoryCellStateDescription(state: TowersCellState) {
  switch (state) {
    case 'active':
    case 'auto-selectable':
      return 'selectable';
    case 'safe':
      return 'safe';
    case 'trap':
      return 'bomb';
    case 'revealed-safe':
      return 'revealed safe';
    case 'revealed-trap':
      return 'revealed bomb';
    case 'auto-selected':
      return 'selected';
    case 'auto-planned':
      return 'planned';
    case 'auto-planned-active':
      return 'planned, active';
    default:
      return undefined;
  }
}

function getTowersStoryCellAriaLabel({
  rowIndex,
  colIndex,
  state,
  amountLabel,
  potentialWin,
}: {
  rowIndex: number;
  colIndex: number;
  state: TowersCellState;
  amountLabel?: string;
  potentialWin?: TowersGridCell['potentialWin'];
}) {
  const parts = [`Row ${rowIndex + 1}, tile ${colIndex + 1}`];
  const stateDescription = getTowersStoryCellStateDescription(state);
  if (stateDescription) parts.push(stateDescription);

  const amount =
    amountLabel ??
    (potentialWin ? `${potentialWin.whole}.${potentialWin.fraction}` : undefined);
  if (
    amount &&
    (state === 'safe' || state === 'active' || state === 'auto-planned-active')
  ) {
    parts.push(amount);
  }

  return parts.join(', ');
}

function withStoryCellAriaLabels(rows: TowersStoryRow[]): TowersGridRow[] {
  return rows.map((row, rowIndex) => ({
    ...row,
    cells: row.cells.map((cell, colIndex) => ({
      ...cell,
      'aria-label': getTowersStoryCellAriaLabel({
        rowIndex,
        colIndex,
        state: cell.state,
        amountLabel: cell.amountLabel,
        potentialWin: cell.potentialWin,
      }),
    })),
  }));
}

export function getTowersStoryBombAnnouncementMessage(rowIndex: number) {
  return `Hit a bomb on row ${rowIndex + 1}.`;
}

export function getTowersStoryTopReachedAnnouncementMessage() {
  return 'You reached the top.';
}

function computeMultiplier(cols: number, trapsPerRow: number, row: number): number {
  return (cols / (cols - trapsPerRow)) ** (row + 1) * 0.98;
}

function makeIdleRow(cols: number): TowersStoryCell[] {
  return Array.from({ length: cols }, (): TowersStoryCell => ({ state: 'idle' }));
}

export interface TowersStoryGridConfig {
  rows: number;
  cols: number;
  trapsPerRow: number;
}

const TOWERS_STORY_ROW_COUNT = 10;

export const TOWERS_STORY_EASY: TowersStoryGridConfig = {
  rows: TOWERS_STORY_ROW_COUNT,
  cols: 3,
  trapsPerRow: 1,
};
export const TOWERS_STORY_MEDIUM: TowersStoryGridConfig = {
  rows: TOWERS_STORY_ROW_COUNT,
  cols: 2,
  trapsPerRow: 1,
};
export const TOWERS_STORY_HARD: TowersStoryGridConfig = {
  rows: TOWERS_STORY_ROW_COUNT,
  cols: 3,
  trapsPerRow: 2,
};

export const towersStoryDifficultyLabels: TowersDifficultyLabels = {
  title: 'Difficulty',
};

const towersStoryDifficultyConfigs = [
  { label: 'Easy Mode', config: TOWERS_STORY_EASY },
  { label: 'Medium Mode', config: TOWERS_STORY_MEDIUM },
  { label: 'Hard Mode', config: TOWERS_STORY_HARD },
] as const;

export function createTowersStoryDifficultyOptions(
  labels: readonly string[] = towersStoryDifficultyConfigs.map(({ label }) => label),
): TowersDifficultyOption[] {
  return labels.map((label, value) => {
    const difficulty =
      towersStoryDifficultyConfigs[
        Math.min(value, towersStoryDifficultyConfigs.length - 1)
      ] ?? towersStoryDifficultyConfigs[0];
    const { config } = difficulty;

    return {
      value,
      label,
      adornment: (selected: boolean) =>
        buildTowersAdornment(
          config.cols - config.trapsPerRow,
          config.trapsPerRow,
          selected,
        ),
    };
  });
}

export const towersStoryDifficultyOptions = createTowersStoryDifficultyOptions();

export function createTowersStoryIdleRows(
  config: TowersStoryGridConfig,
): TowersGridRow[] {
  return withStoryCellAriaLabels(
    Array.from(
      { length: config.rows },
      (_, i): TowersStoryRow => ({
        multiplier: {
          label: `x${computeMultiplier(config.cols, config.trapsPerRow, i).toFixed(2)}`,
          highlight: 'upcoming',
        },
        cells: makeIdleRow(config.cols),
      }),
    ),
  );
}

function makeRevealedRow(
  config: TowersStoryGridConfig,
  rowIndex: number,
): TowersStoryCell[] {
  const safeIndex = rowIndex % config.cols;

  return Array.from({ length: config.cols }, (_, colIndex): TowersStoryCell => {
    if (colIndex === safeIndex) {
      return { state: 'safe', amountLabel: towersStoryAmountLabel };
    }

    const trapOffset = colIndex > safeIndex ? colIndex - 1 : colIndex;
    return {
      state: trapOffset < config.trapsPerRow ? 'revealed-trap' : 'revealed-safe',
    };
  });
}

export function createTowersStoryPreviewRows(
  config: TowersStoryGridConfig,
): TowersGridRow[] {
  const passedRows = 4;
  const activeRow = 4;

  return withStoryCellAriaLabels(
    Array.from({ length: config.rows }, (_, i): TowersStoryRow => {
      let cells: TowersStoryCell[];
      let highlight: 'passed' | 'active' | 'upcoming';

      if (i < passedRows) {
        cells = makeRevealedRow(config, i);
        highlight = 'passed';
      } else if (i === activeRow) {
        cells = Array.from(
          { length: config.cols },
          (): TowersStoryCell => ({
            state: 'active',
            potentialWin: towersStoryPotentialWin,
          }),
        );
        highlight = 'active';
      } else {
        cells = makeIdleRow(config.cols);
        highlight = 'upcoming';
      }

      return {
        multiplier: {
          label: `x${computeMultiplier(config.cols, config.trapsPerRow, i).toFixed(2)}`,
          highlight,
        },
        cells,
      };
    }),
  );
}

export function getTowersStoryGridConfig(
  columns: 2 | 3,
  bombsPerRow: 1 | 2,
): TowersStoryGridConfig {
  if (columns === 2) return TOWERS_STORY_MEDIUM;
  return bombsPerRow === 2 ? TOWERS_STORY_HARD : TOWERS_STORY_EASY;
}

export function getTowersStoryGridConfigFromDifficulty(
  difficulty: number,
): TowersStoryGridConfig {
  switch (difficulty) {
    case 0:
      return TOWERS_STORY_EASY;
    case 2:
      return TOWERS_STORY_HARD;
    default:
      return TOWERS_STORY_MEDIUM;
  }
}

export const TOWERS_PLAYGROUND_NEXT_ROW_DELAY_MS = 400;
export const TOWERS_STORY_CLEAR_BOARD_DELAY_MS = 2000;
export const TOWERS_STORY_CLEAR_RESET_MS = 100;
export const TOWERS_STORY_CLEAR_END_MS = 300;

export function acceptTowersStoryRowSelection(
  acceptedRows: Set<number>,
  rowIndex: number,
): boolean {
  if (acceptedRows.has(rowIndex)) return false;
  acceptedRows.add(rowIndex);
  return true;
}

export const towersStoryBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

export const towersStoryStopConditionsLabels = {
  onWin: 'On Win',
  onLoss: 'On Loss',
  stopProfit: 'Stop on Profit',
  stopLoss: 'Stop on Loss',
  reset: 'Reset',
  increaseBy: 'Increase by',
};

export function getTowersStoryMultiplierLabel(
  config: TowersStoryGridConfig,
  rowIndex: number,
): string {
  return `x${computeMultiplier(config.cols, config.trapsPerRow, rowIndex).toFixed(2)}`;
}

export function getTowersStoryWinAmount(betAmount: string, multiplier: number): string {
  const bet = Number.parseFloat(betAmount);
  if (Number.isNaN(bet)) return '0.00';
  return (bet * multiplier).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
export function isTowersStoryBombColumn(
  colIndex: number,
  config: TowersStoryGridConfig,
): boolean {
  return colIndex >= config.cols - config.trapsPerRow;
}

export function pickTowersStoryRandomColumn(cols: number): number {
  return Math.floor(Math.random() * cols);
}

export function getTowersStoryPickOutcome(
  rowIndex: number,
  colIndex: number,
  config: TowersStoryGridConfig,
): 'bomb' | 'top' | 'safe' {
  if (isTowersStoryBombColumn(colIndex, config)) return 'bomb';
  if (rowIndex + 1 >= config.rows) return 'top';
  return 'safe';
}

function createTowersStoryPlaygroundResolvedCell(
  colIndex: number,
  pickedColIndex: number,
  config: TowersStoryGridConfig,
): TowersStoryCell {
  const isBomb = isTowersStoryBombColumn(colIndex, config);

  if (colIndex === pickedColIndex) {
    return isBomb
      ? { state: 'trap', disabled: true }
      : { state: 'safe', amountLabel: towersStoryAmountLabel, disabled: true };
  }

  return isBomb
    ? { state: 'revealed-trap', disabled: true }
    : { state: 'revealed-safe', disabled: true };
}

export function createTowersStoryPlaygroundRows(
  config: TowersStoryGridConfig,
  picks: Record<number, number>,
  activeRowIndex: number,
  roundStarted: boolean,
  isClearing = false,
  roundSettled = false,
): TowersGridRow[] {
  if (isClearing) {
    return withStoryCellAriaLabels(
      createTowersStoryIdleRows(config).map((row) => ({
        ...row,
        multiplier: { ...row.multiplier, highlight: 'upcoming' },
        cells: row.cells.map(() => ({
          state: 'idle',
          disabled: true,
        })),
      })),
    );
  }

  if (!roundStarted) {
    return withStoryCellAriaLabels(
      createTowersStoryIdleRows(config).map((row) => ({
        ...row,
        cells: row.cells.map(() => ({
          state: 'idle',
          disabled: true,
        })),
      })),
    );
  }

  const pickedRowCount = Object.keys(picks).length;
  const finalPickedRowIndex =
    pickedRowCount > 0 ? Math.max(...Object.keys(picks).map((key) => Number(key))) : -1;
  const finalPickedColIndex =
    finalPickedRowIndex >= 0 ? picks[finalPickedRowIndex] : undefined;
  const isGameOver =
    finalPickedRowIndex >= 0 &&
    finalPickedColIndex !== undefined &&
    isTowersStoryBombColumn(finalPickedColIndex, config);

  return withStoryCellAriaLabels(
    createTowersStoryIdleRows(config).map((row, rowIndex) => {
      const pickedColIndex = picks[rowIndex];

      if (pickedColIndex !== undefined) {
        const keepActiveHighlight = !isGameOver && rowIndex === activeRowIndex;

        return {
          multiplier: {
            ...row.multiplier,
            highlight:
              (isGameOver && rowIndex === finalPickedRowIndex) || keepActiveHighlight
                ? 'active'
                : 'passed',
          },
          cells: row.cells.map((_, colIndex) =>
            createTowersStoryPlaygroundResolvedCell(colIndex, pickedColIndex, config),
          ),
        };
      }

      const isActiveRow =
        !isGameOver &&
        !roundSettled &&
        rowIndex === activeRowIndex &&
        activeRowIndex < config.rows;

      if (isActiveRow) {
        return {
          multiplier: { ...row.multiplier, highlight: 'active' },
          cells: row.cells.map(() => ({
            state: 'active',
            potentialWin: towersStoryPotentialWin,
          })),
        };
      }

      return {
        ...row,
        cells: row.cells.map(() => ({
          state: 'idle',
          disabled: true,
        })),
      };
    }),
  );
}

export const towersStoryCurrencyIcon: ReactNode = (
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

export const towersStoryWinCurrencyIcon: ReactNode = (
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

const TOWERS_STORY_SOUNDS = {
  win: '/sounds/games/towers/win.wav',
  lose: '/sounds/games/towers/lose.wav',
} as const;

export type TowersStorySoundName = keyof typeof TOWERS_STORY_SOUNDS;

const towersStorySoundTemplates = new Map<string, HTMLAudioElement>();

function getTowersStorySoundTemplate(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  const cached = towersStorySoundTemplates.get(src);
  if (cached) return cached;

  const template = new Audio(src);
  template.preload = 'auto';
  towersStorySoundTemplates.set(src, template);
  return template;
}

export function preloadTowersStorySounds(): void {
  Object.values(TOWERS_STORY_SOUNDS).forEach((src) => {
    getTowersStorySoundTemplate(src);
  });
}

function getSafeTowersStorySoundVolume(volume: number): number {
  return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
}

export function setTowersStorySoundsVolume(
  sounds: Iterable<HTMLAudioElement>,
  volume: number,
): void {
  const safeVolume = getSafeTowersStorySoundVolume(volume);
  for (const sound of sounds) {
    sound.volume = safeVolume;
  }
}

export function stopTowersStorySounds(sounds: Set<HTMLAudioElement>): void {
  for (const sound of sounds) {
    sound.pause();
    sound.currentTime = 0;
  }
  sounds.clear();
}

export function playTowersStorySound(
  name: TowersStorySoundName,
  volume: number,
  onSettled?: (audio: HTMLAudioElement) => void,
): HTMLAudioElement | null {
  const safeVolume = getSafeTowersStorySoundVolume(volume);
  if (safeVolume <= 0) return null;

  const template = getTowersStorySoundTemplate(TOWERS_STORY_SOUNDS[name]);
  if (!template) return null;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  const settle = () => onSettled?.(audio);
  audio.volume = safeVolume;
  audio.addEventListener('ended', settle, { once: true });
  audio.addEventListener('error', settle, { once: true });
  void audio.play().catch(settle);
  return audio;
}
