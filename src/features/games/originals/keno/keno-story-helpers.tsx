import type { ReactNode } from 'react';

import type { KenoResultAnnouncement } from './keno-board/keno-board.types';
import type { KenoCellAssets, KenoCellState } from './keno-cell/keno-cell.types';
import type { KenoGridCell } from './keno-grid/keno-grid.types';
import { getKenoGridCellCount } from './keno-grid/keno-grid.utils';
import type { KenoPaytableItem } from './keno-paytable/keno-paytable.types';
import type { KenoRiskLabels, KenoRiskOption } from './keno-risk/keno-risk';

import { Image } from '#ui/primitives/data-display/image/image';

export const kenoStoryCellAssets: KenoCellAssets = {
  cell: '/img/games/keno/cell.png',
  selected: '/img/games/keno/selected-cell.png',
  guessed: '/img/games/keno/guessed-cell.png',
  missed: '/img/games/keno/missed-cell.png',
};

export const kenoStoryRiskOptions: readonly KenoRiskOption[] = [
  { value: 'classic', label: 'Classic Risk', shortLabel: 'Classic' },
  { value: 'low', label: 'Low Risk', shortLabel: 'Low' },
  { value: 'medium', label: 'Medium Risk', shortLabel: 'Medium' },
  { value: 'high', label: 'High Risk', shortLabel: 'High' },
];

export const kenoStoryRiskLabels: KenoRiskLabels = {
  title: 'Risk',
};

const KENO_STORY_DRAW_COUNT = 10;
const kenoStoryRapidPickNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

let nextKenoStoryAnnouncementId = 1;

function createKenoStoryResultAnnouncement({
  hits,
  pickedCount,
  isWin,
}: {
  hits: number;
  pickedCount: number;
  isWin: boolean;
}): KenoResultAnnouncement {
  const id = `keno-story-${nextKenoStoryAnnouncementId}`;
  nextKenoStoryAnnouncementId += 1;

  return {
    id,
    message: isWin
      ? `${hits} of ${pickedCount} hits. You win.`
      : `${hits} of ${pickedCount} hits. No win.`,
  };
}

export { getKenoGridCellCount };

export function createKenoGridCells(
  overrides: Partial<KenoGridCell> = {},
): KenoGridCell[] {
  return Array.from({ length: getKenoGridCellCount() }, (_, index) => ({
    state: 'idle',
    disabled: false,
    ...overrides,
    number: index + 1,
  }));
}

export function getKenoStoryCellAriaLabel(cell: KenoGridCell): string {
  const state = cell.state ?? 'idle';
  const stateLabel: Record<KenoCellState, string> = {
    idle: 'not selected',
    selected: 'selected',
    win: 'selected and drawn',
    lose: 'selected, not drawn',
    missed: 'drawn, not selected',
  };

  return `Keno number ${cell.number}, ${stateLabel[state]}`;
}

export function setKenoStoryCellState(
  cells: readonly KenoGridCell[],
  number: number,
  state: KenoCellState,
): KenoGridCell[] {
  return cells.map((cell) =>
    cell.number === number
      ? {
          number: cell.number,
          state,
          disabled: cell.disabled,
        }
      : cell,
  );
}

export const kenoStoryHitsIconSrc = '/icon/fill-icons/games_originals.svg';

export const KENO_STORY_MAX_PICKS = 10;

type KenoStoryRisk = 'classic' | 'low' | 'medium' | 'high';

// Representative Storybook fixtures. Production paytables belong to the app API/controller.
const kenoStoryPaytableFixtures: Record<KenoStoryRisk, readonly (readonly number[])[]> = {
  classic: [
    [0, 3.92],
    [0, 1.8, 5],
    [0, 1, 3, 11],
    [0, 0.8, 1.7, 5.2, 25],
    [0, 0.2, 1.3, 4.2, 17, 50],
    [0, 0, 1, 3.6, 7.1, 17, 50],
    [0, 0, 0.47, 3, 4.3, 14, 35, 75],
    [0, 0, 0, 2.2, 4, 12, 24, 70, 100],
    [0, 0, 0, 1.5, 3, 8, 16, 50, 70, 100],
    [0, 0, 0, 1.4, 2.2, 4.4, 8, 20, 75, 100, 150],
  ],
  low: [
    [0.6, 2.1],
    [0, 1.9, 4.35],
    [0, 1, 1.45, 28],
    [0, 0, 2, 8.2, 100],
    [0, 0, 1.5, 4, 13.4, 310],
    [0, 0, 1, 2, 6.6, 105, 800],
    [0, 0, 1.1, 1.5, 3.6, 15, 240, 1000],
    [0, 0, 1.1, 1.5, 2, 5, 36, 150, 1000],
    [0, 0, 1.1, 1.3, 1.6, 2.4, 8, 60, 350, 1000],
    [0, 0, 1, 1.2, 1.3, 2, 5, 20, 100, 500, 1000],
  ],
  medium: [
    [0.3, 3],
    [0, 1.7, 5.7],
    [0, 0, 2.6, 51.5],
    [0, 0, 1.6, 10.1, 105],
    [0, 0, 1.3, 4, 15, 420],
    [0, 0, 0, 3, 9, 175, 770],
    [0, 0, 0, 2, 7, 28, 410, 1000],
    [0, 0, 0, 2, 4, 11, 56, 500, 1000],
    [0, 0, 0, 2, 2.4, 5, 15, 110, 600, 1000],
    [0, 0, 0, 1.5, 2.1, 4, 7.5, 27, 125, 600, 1000],
  ],
  high: [
    [0, 3.92],
    [0, 0.3, 15],
    [0, 0, 0.5, 75],
    [0, 0, 0, 7, 305],
    [0, 0, 0, 4.5, 45, 500],
    [0, 0, 0, 0, 11.5, 330, 1000],
    [0, 0, 0, 0, 7, 90, 370, 1000],
    [0, 0, 0, 0, 5, 20, 260, 650, 1000],
    [0, 0, 0, 0, 4, 11, 52, 520, 850, 1000],
    [0, 0, 0, 0, 3.5, 8, 13, 50, 500, 850, 1000],
  ],
};

function getKenoStoryPaytableFixture(risk: string): readonly (readonly number[])[] {
  switch (risk) {
    case 'classic':
    case 'low':
    case 'medium':
    case 'high':
      return kenoStoryPaytableFixtures[risk];
    default:
      return kenoStoryPaytableFixtures.medium;
  }
}

export function createKenoStoryPaytableItems(
  selectedCount: number,
  risk = 'medium',
): KenoPaytableItem[] {
  const clampedCount = Math.min(Math.max(selectedCount, 1), KENO_STORY_MAX_PICKS);
  const multipliers = getKenoStoryPaytableFixture(risk)[clampedCount - 1] ?? [];

  return multipliers.map((multiplier, hits) => ({
    hits,
    multiplierLabel: String(multiplier),
  }));
}

export function getKenoStoryPaytableItemAriaLabel(
  item: KenoPaytableItem,
  reached: boolean,
): string {
  return `${item.hits} hits, ${item.multiplierLabel}x${reached ? ', reached' : ''}`;
}

export const kenoStoryPaytableEmptyLabel = 'Select 1 - 10 Numbers to Play';

function isKenoStoryPickedState(state: KenoGridCell['state']): boolean {
  return state === 'selected' || state === 'win' || state === 'lose';
}

function countKenoStorySelectedCells(cells: readonly KenoGridCell[]): number {
  return cells.filter((cell) => cell.state === 'selected').length;
}

export function countKenoStoryPickedCells(cells: readonly KenoGridCell[]): number {
  return cells.filter((cell) => isKenoStoryPickedState(cell.state)).length;
}

export function getKenoStoryPickedNumbers(cells: readonly KenoGridCell[]): number[] {
  return cells
    .filter((cell) => isKenoStoryPickedState(cell.state))
    .map((cell) => cell.number)
    .sort((left, right) => left - right);
}

export function toggleKenoStoryCell(
  cells: readonly KenoGridCell[],
  number: number,
  maxPicks = KENO_STORY_MAX_PICKS,
): KenoGridCell[] {
  const cell = cells.find((item) => item.number === number);
  if (!cell || cell.disabled) return [...cells];
  if (cell.state === 'selected') {
    return setKenoStoryCellState(cells, number, 'idle');
  }
  if (cell.state !== 'idle') return [...cells];
  if (countKenoStorySelectedCells(cells) >= maxPicks) return [...cells];
  return setKenoStoryCellState(cells, number, 'selected');
}

export function autoPickKenoStoryCells(
  cells: readonly KenoGridCell[],
  pickCount = KENO_STORY_MAX_PICKS,
): KenoGridCell[] {
  return selectKenoStoryCells(cells, drawKenoStoryNumbers(cells, pickCount));
}

function selectKenoStoryCells(
  cells: readonly KenoGridCell[],
  numbers: readonly number[],
): KenoGridCell[] {
  const picked = new Set(numbers);

  return cells.map((cell) => ({
    number: cell.number,
    state: picked.has(cell.number) ? 'selected' : 'idle',
    disabled: cell.disabled,
  }));
}

export function createKenoStoryPickedCells(
  numbers: readonly number[] = kenoStoryRapidPickNumbers,
): KenoGridCell[] {
  return selectKenoStoryCells(createKenoGridCells(), numbers);
}

function drawKenoStoryNumbers(
  cells: readonly KenoGridCell[],
  drawCount: number,
): number[] {
  const numbers = cells.map((cell) => cell.number);
  const shuffled = [...numbers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(0, Math.min(drawCount, shuffled.length)));
}

const KENO_STORY_REVEAL_INTERVAL_MS = 100;
const KENO_STORY_REVEAL_START_DELAY_CAP_MS = 600;
const KENO_STORY_RESET_DELAY_MS = 3000;

function getKenoStoryRevealStartDelayMs(drawnCount: number): number {
  return Math.min(
    KENO_STORY_REVEAL_START_DELAY_CAP_MS,
    (drawnCount * KENO_STORY_REVEAL_INTERVAL_MS) / 2,
  );
}

function shuffleKenoStoryNumbers(numbers: readonly number[]): number[] {
  return [...numbers].sort(() => Math.random() - 0.5);
}

export function settleKenoStoryCells(
  cells: readonly KenoGridCell[],
  drawnNumbers: readonly number[],
): KenoGridCell[] {
  const drawnSet = new Set(drawnNumbers);

  return cells.map((cell) => {
    const isSelected = cell.state === 'selected';
    const isDrawn = drawnSet.has(cell.number);

    if (isSelected && isDrawn) {
      return { number: cell.number, state: 'win', disabled: cell.disabled };
    }

    if (isSelected) {
      return { number: cell.number, state: 'lose', disabled: cell.disabled };
    }

    if (isDrawn) {
      return { number: cell.number, state: 'missed', disabled: cell.disabled };
    }

    return { number: cell.number, state: 'idle', disabled: cell.disabled };
  });
}

function revealKenoStoryDrawnCell(
  cells: readonly KenoGridCell[],
  number: number,
  pickedNumbers: ReadonlySet<number>,
): KenoGridCell[] {
  return cells.map((cell) => {
    if (cell.number !== number) return cell;

    return {
      number: cell.number,
      state: pickedNumbers.has(number) ? 'win' : 'missed',
      disabled: cell.disabled,
    };
  });
}

function markKenoStoryUnhitLosses(
  cells: readonly KenoGridCell[],
  pickedNumbers: ReadonlySet<number>,
): KenoGridCell[] {
  return cells.map((cell) => {
    if (cell.state === 'selected' && pickedNumbers.has(cell.number)) {
      return { number: cell.number, state: 'lose', disabled: cell.disabled };
    }

    return cell;
  });
}

export interface KenoStoryManualRoundUpdate {
  cells: KenoGridCell[];
  reachedHits: number | null;
  showWinModal: boolean;
  winMultiplier?: string;
  winAmount?: string;
  resultAnnouncement?: KenoResultAnnouncement;
}

export function scheduleKenoStoryManualRound({
  cells,
  pickedNumbers,
  risk,
  reducedMotion,
  betAmount,
  isActive,
  schedule,
  onUpdate,
  onReveal,
}: {
  cells: readonly KenoGridCell[];
  pickedNumbers: readonly number[];
  risk: string;
  reducedMotion: boolean;
  betAmount: string;
  isActive: () => boolean;
  schedule: (callback: () => void, delayMs: number) => void;
  onUpdate: (patch: KenoStoryManualRoundUpdate) => void;
  onReveal?: (result: 'win' | 'missed') => void;
}): void {
  const pickedSet = new Set(pickedNumbers);
  const drawnNumbers = drawKenoStoryNumbers(cells, KENO_STORY_DRAW_COUNT);
  const hitsTotal = pickedNumbers.filter((number) =>
    drawnNumbers.includes(number),
  ).length;
  const multiplierLabel =
    getKenoStoryMultiplierLabel(pickedNumbers.length, hitsTotal, risk) ?? '0';
  const multiplierValue = Number.parseFloat(multiplierLabel);
  const betAmountValue = Number.parseFloat(betAmount);
  const winAmount =
    Number.isFinite(multiplierValue) && Number.isFinite(betAmountValue)
      ? (betAmountValue * multiplierValue).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '0.00';
  const isWin = multiplierValue > 0;
  let workingCells = selectKenoStoryCells(cells, pickedNumbers);

  onUpdate({
    cells: workingCells,
    reachedHits: 0,
    showWinModal: false,
    resultAnnouncement: undefined,
  });

  const settleRound = () => {
    if (!isActive()) return;

    workingCells = markKenoStoryUnhitLosses(workingCells, pickedSet);
    onUpdate({
      cells: workingCells,
      reachedHits: hitsTotal,
      showWinModal: isWin,
      winMultiplier: `x${multiplierLabel}`,
      winAmount,
      resultAnnouncement: createKenoStoryResultAnnouncement({
        hits: hitsTotal,
        pickedCount: pickedNumbers.length,
        isWin,
      }),
    });

    schedule(() => {
      if (!isActive()) return;

      onUpdate({
        cells: selectKenoStoryCells(workingCells, pickedNumbers),
        reachedHits: null,
        showWinModal: false,
        resultAnnouncement: undefined,
      });
    }, KENO_STORY_RESET_DELAY_MS);
  };

  if (reducedMotion || drawnNumbers.length === 0) {
    workingCells = settleKenoStoryCells(workingCells, drawnNumbers);
    if (drawnNumbers.length > 0) {
      onReveal?.(hitsTotal > 0 ? 'win' : 'missed');
    }
    settleRound();
    return;
  }

  const revealOrder = shuffleKenoStoryNumbers(drawnNumbers);
  const startDelayMs = getKenoStoryRevealStartDelayMs(drawnNumbers.length);

  const scheduleReveal = (index: number, delayMs: number) => {
    const number = revealOrder[index];
    if (number === undefined) return;

    schedule(() => {
      if (!isActive()) return;

      workingCells = revealKenoStoryDrawnCell(workingCells, number, pickedSet);
      const hitsSoFar = workingCells.filter((cell) => cell.state === 'win').length;
      const isLastReveal = index === revealOrder.length - 1;

      onReveal?.(pickedSet.has(number) ? 'win' : 'missed');

      onUpdate({
        cells: workingCells,
        reachedHits: hitsSoFar,
        showWinModal: false,
      });

      if (isLastReveal) {
        schedule(settleRound, KENO_STORY_REVEAL_INTERVAL_MS);
        return;
      }

      scheduleReveal(index + 1, KENO_STORY_REVEAL_INTERVAL_MS);
    }, delayMs);
  };

  scheduleReveal(0, startDelayMs);
}

export function getKenoStoryMultiplierLabel(
  selectedCount: number,
  hits: number,
  risk = 'medium',
): string | null {
  const items = createKenoStoryPaytableItems(selectedCount, risk);
  const matchedItem = items.find((item) => item.hits === hits);
  return matchedItem?.multiplierLabel ?? null;
}

export const kenoStoryCurrencyIcon: ReactNode = (
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

export const kenoStoryWinCurrencyIcon: ReactNode = (
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

export const kenoStoryBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

export const kenoStoryStopConditionsLabels = {
  onWin: 'On Win',
  onLoss: 'On Loss',
  stopProfit: 'Stop on Profit',
  stopLoss: 'Stop on Loss',
  reset: 'Reset',
  increaseBy: 'Increase by',
};

const kenoStorySoundSrc = {
  cell: '/sounds/games/keno/select.wav',
  win: '/sounds/games/keno/win.wav',
  lose: '/sounds/games/keno/lose.mp3',
} as const;

export type KenoStorySoundName = keyof typeof kenoStorySoundSrc;

const kenoStorySoundTemplates = new Map<string, HTMLAudioElement>();

function getKenoStorySoundTemplate(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  const cached = kenoStorySoundTemplates.get(src);
  if (cached) return cached;

  const template = new Audio(src);
  template.preload = 'auto';
  kenoStorySoundTemplates.set(src, template);
  return template;
}

export function preloadKenoStorySounds(): void {
  Object.values(kenoStorySoundSrc).forEach((src) => {
    getKenoStorySoundTemplate(src);
  });
}

function getSafeKenoStorySoundVolume(volume: number): number {
  return Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 1;
}

export function setKenoStorySoundsVolume(
  sounds: Iterable<HTMLAudioElement>,
  volume: number,
): void {
  const safeVolume = getSafeKenoStorySoundVolume(volume);
  for (const sound of sounds) {
    sound.volume = safeVolume;
  }
}

export function stopKenoStorySounds(sounds: Set<HTMLAudioElement>): void {
  for (const sound of sounds) {
    sound.pause();
    sound.currentTime = 0;
  }
  sounds.clear();
}

export function playKenoStorySound(
  name: KenoStorySoundName,
  volume: number,
  onSettled?: (audio: HTMLAudioElement) => void,
): HTMLAudioElement | null {
  const safeVolume = getSafeKenoStorySoundVolume(volume);
  if (safeVolume <= 0) return null;

  const template = getKenoStorySoundTemplate(kenoStorySoundSrc[name]);
  if (!template) return null;

  const audio = template.cloneNode(true) as HTMLAudioElement;
  const settle = () => onSettled?.(audio);
  audio.volume = safeVolume;
  audio.addEventListener('ended', settle, { once: true });
  audio.addEventListener('error', settle, { once: true });
  void audio.play().catch(settle);
  return audio;
}
