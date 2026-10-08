import type { ReactNode } from 'react';

import { getPlinkoMultiplierColor } from './plinko-board/plinko-board.utils';
import type { PlinkoLastResultItem } from './plinko-last-results/plinko-last-results.types';
import type { PlinkoRiskLabels, PlinkoRiskOption } from './plinko-risk/plinko-risk';
import type { PlinkoRowsLabels, PlinkoRowsOption } from './plinko-rows/plinko-rows';
import {
  PLINKO_CONFIGURATIONS,
  PLINKO_DEFAULT_RISK,
  PLINKO_DEFAULT_ROWS,
  PLINKO_ROW_COUNTS,
} from './plinko.constants';
import { getPlinkoMultipliers } from './plinko-engine';

import { Image } from '#ui/primitives/data-display/image/image';

let nextStoryResultId = 1;
let nextStoryEventId = 1;

export const PLINKO_STORY_DEFAULT_RISK = PLINKO_DEFAULT_RISK;
export const PLINKO_STORY_DEFAULT_ROWS = PLINKO_DEFAULT_ROWS;
export const PLINKO_STORY_ROW_COUNTS = PLINKO_ROW_COUNTS;

export const plinkoStoryLastResultsAriaLabel = 'Plinko last results';

export const plinkoStoryCurrencyIcon: ReactNode = (
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

export const plinkoStoryBetAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

/**
 * Betstrike controller maps CMS risk labels to options: first word as the visible
 * label, full label as the accessible name.
 */
export const plinkoStoryRiskOptions: readonly PlinkoRiskOption[] = PLINKO_CONFIGURATIONS.map(
  (config) => ({
    value: config.internalId,
    label: config.label.split(/\s+/)[0] ?? config.label,
    ariaLabel: config.label,
  }),
);

export const plinkoStoryRiskLabels: PlinkoRiskLabels = {
  title: 'Risk',
};

export const plinkoStoryRowsOptions: readonly PlinkoRowsOption[] = PLINKO_ROW_COUNTS.map(
  (row) => ({
    value: row,
    label: String(row),
  }),
);

export const plinkoStoryRowsLabels: PlinkoRowsLabels = {
  title: 'Rows',
};

export const plinkoStoryLabels = {
  title: 'Plinko',
  dropBall: 'Drop Ball',
  turboMode: 'Turbo mode',
  winTitle: 'You win!',
  multiplier: 'Multiplier',
  lastResults: plinkoStoryLastResultsAriaLabel,
};

export function getPlinkoStoryMultipliers(
  rows: number = PLINKO_STORY_DEFAULT_ROWS,
  risk: string = PLINKO_STORY_DEFAULT_RISK,
): readonly number[] {
  return getPlinkoMultipliers(risk, rows);
}

export function createPlinkoStoryEventId(prefix: string) {
  const id = `${prefix}-${nextStoryEventId}`;
  nextStoryEventId += 1;
  return id;
}

export function createPlinkoStoryLastResult(
  multiplier: number,
  color: string,
): PlinkoLastResultItem {
  const id = `plinko-story-${nextStoryResultId}`;
  nextStoryResultId += 1;
  return { id, multiplier, color };
}

export function createPlinkoStoryLastResultAtIndex(
  multipliers: readonly number[],
  index: number,
): PlinkoLastResultItem | undefined {
  const multiplier = multipliers[index];
  if (multiplier === undefined) return undefined;

  return createPlinkoStoryLastResult(
    multiplier,
    getPlinkoMultiplierColor(index, multipliers.length),
  );
}

export const plinkoStoryLastResults: PlinkoLastResultItem[] = [2, 6, 0, 10, 4, 8, 16]
  .map((index) => createPlinkoStoryLastResultAtIndex(getPlinkoStoryMultipliers(), index))
  .filter((item): item is PlinkoLastResultItem => item !== undefined);
