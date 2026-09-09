import type { ReactNode } from 'react';

import type { DiceBoardLabels } from './dice-board/dice-board.types';
import type { DiceControlsLabels } from './dice-controls/dice-controls.types';
import type {
  DiceLastResultColor,
  DiceLastResultItem,
  DiceLastResultsAssets,
  DiceLastResultsLabels,
} from './dice-last-results/dice-last-results.types';

import { Image } from '#ui/primitives/data-display/image/image';

let nextStoryResultId = 1;

export const diceStoryCurrencyIcon: ReactNode = (
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

export const diceStoryWinCurrencyIcon: ReactNode = (
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

export const diceStoryBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

export const diceStoryStopConditionsLabels = {
  onWin: 'On Win',
  onLoss: 'On Loss',
  stopProfit: 'Stop on Profit',
  stopLoss: 'Stop on Loss',
  reset: 'Reset',
  increaseBy: 'Increase by',
};

export const diceStoryControlsLabels: DiceControlsLabels = {
  rollUnder: 'Roll Under',
  rollOver: 'Roll Over',
  multiplier: 'Multiplier',
  winChance: 'Win Chance',
  toggleDirection: 'Toggle roll direction',
  decrease: 'Decrease',
  increase: 'Increase',
};

export const diceStoryBoardLabels: DiceBoardLabels = {
  yourNumber: 'Your number',
  rolledNumber: 'Rolled number',
  sliderAriaLabel: 'Dice target value',
};

export const diceStoryLastResultsAssets: DiceLastResultsAssets = {
  green: '/img/games/dice/green-tile.svg',
  red: '/img/games/dice/red-tile.svg',
  lead: '/img/games/dice/undefined-result.svg',
};

export const diceStoryLastResultsLabels: DiceLastResultsLabels = {
  green: 'Win',
  red: 'Loss',
};

export const diceStoryLastResultsAriaLabel = 'Dice last results';

/** Legacy dice board offset: modal sits above the slider, not centered on it. */
export const diceStoryWinModalContentClassName = 'translate-y-[-170%]';

export function createDiceStoryLastResult(
  value: number,
  color: DiceLastResultColor,
  id?: string,
): DiceLastResultItem {
  const nextId = id ?? `dice-story-${nextStoryResultId}`;
  nextStoryResultId += 1;

  return { id: nextId, value, color };
}

export const diceStoryLastResults: DiceLastResultItem[] = [
  createDiceStoryLastResult(42.18, 'green', 'dice-1'),
  createDiceStoryLastResult(71.04, 'red', 'dice-2'),
  createDiceStoryLastResult(19.55, 'green', 'dice-3'),
  createDiceStoryLastResult(88.2, 'red', 'dice-4'),
];
