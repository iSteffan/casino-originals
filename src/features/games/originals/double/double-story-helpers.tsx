import type { ReactNode } from 'react';

import type { DoubleBetTypeOption } from './double-bet-type-selector/double-bet-type-selector.types';
import type { DoubleRoundStatusLabels } from './double-round-status/double-round-status.types';
import { DOUBLE_BET_TYPES, DOUBLE_LAST_RESULTS_LIMIT, getDoubleBetTypeImage } from './double.constants';
import type { DoubleBetType, DoubleHistoryItem, DoubleOutcome } from './double.types';
import { getDoubleLast100Stats, getDoubleTile, toDoubleOutcome } from './double-engine';

import { Image } from '#ui/primitives/data-display/image/image';

let nextStoryResultId = 1;

const DOUBLE_BET_TYPE_LABELS: Record<DoubleBetType, string> = {
  RED: 'Red',
  BLACK: 'Black',
  GREEN: 'Green',
  JOKER: 'Joker',
};

export const doubleStoryLastResultsAriaLabel = 'Double previous rolls';

export const doubleStoryLabels = {
  title: 'Double',
  boardTitle: 'Game result',
  placeBet: 'Place Bet',
  betPlaced: 'Bet Placed',
  rolling: 'Rolling',
  yourBet: 'Your bet',
  previousRolls: 'Previous rolls',
  last100: 'Last 100',
  lastResults: doubleStoryLastResultsAriaLabel,
};

export const doubleStoryRoundStatusLabels: DoubleRoundStatusLabels = {
  rollingIn: 'Rolling in',
  now: 'Now',
  rolling: 'Rolling',
  rolled: 'Rolled',
};

/** Legacy `betOptions` (config tile icons + names). */
export const doubleStoryBetTypeOptions: readonly DoubleBetTypeOption[] = DOUBLE_BET_TYPES.map(
  (type) => ({
    type,
    label: DOUBLE_BET_TYPE_LABELS[type],
    image: getDoubleBetTypeImage(type),
  }),
);

export const doubleStoryCurrencyIcon: ReactNode = (
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

export const doubleStoryBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

export function createDoubleStoryHistoryItem(outcome: DoubleOutcome): DoubleHistoryItem {
  const id = `double-story-${nextStoryResultId}`;
  nextStoryResultId += 1;
  return { id, ...toDoubleOutcome(outcome) };
}

/** Fixed sample sequence (strip indexes) so stories render deterministically. */
const STORY_HISTORY_TILE_INDEXES = [
  1, 4, 0, 11, 6, 9, 2, 12, 13, 7, 3, 8, 5, 10, 1, 4, 6, 9, 12, 3,
];

export const doubleStoryHistory: DoubleHistoryItem[] = STORY_HISTORY_TILE_INDEXES.map((index) =>
  createDoubleStoryHistoryItem(getDoubleTile(index)),
);

export const doubleStoryLastResults: DoubleHistoryItem[] = doubleStoryHistory.slice(
  0,
  DOUBLE_LAST_RESULTS_LIMIT,
);

export const doubleStoryLast100Stats = getDoubleLast100Stats(doubleStoryHistory);
