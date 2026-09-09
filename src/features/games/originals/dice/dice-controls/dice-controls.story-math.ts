/**
 * Storybook / demo linked-field math and outcome helpers.
 * Not part of the runtime `ui/dice-controls` export — app engines own wagering rules.
 */
import type { DiceControlsDirection } from './dice-controls.types';

import type { DiceDirection } from '#ui/features/games/originals/dice/dice.types';
import type { DiceLastResultColor } from '#ui/features/games/originals/dice/dice-last-results/dice-last-results.types';

export const DICE_DEFAULT_RTP = 98;
const DICE_CONTROLS_MAX_MULTIPLIER = 9800;
const DICE_CONTROLS_MAX_WIN_CHANCE_INTERNAL = 99.99;
const DICE_CONTROLS_MIN_MULTIPLIER = 1.01;
const DICE_CONTROLS_SAFE_ROLL_MIN = 3;
const DICE_CONTROLS_SAFE_ROLL_MAX = 97;

export type DiceControlsLinkedValues = {
  displayValue: number;
  winChance: number;
  multiplier: number;
};

function clampDiceDisplayValue(value: number): number {
  return Math.min(
    DICE_CONTROLS_SAFE_ROLL_MAX,
    Math.max(DICE_CONTROLS_SAFE_ROLL_MIN, value),
  );
}

export function normalizeDiceRtp(rtp: number): number {
  return rtp < 10 ? rtp * 100 : rtp;
}

function calculateDiceFromDisplayValue(
  value: number,
  direction: DiceControlsDirection,
  rtpValue: number,
) {
  const chance = direction === 'UNDER' ? value : 100 - value;
  const multiplier = +(rtpValue / chance).toFixed(2);

  return {
    chance: +chance.toFixed(2),
    multiplier,
  };
}

function calculateDiceFromWinChance(
  chance: number,
  direction: DiceControlsDirection,
  rtpValue: number,
) {
  const displayValue = direction === 'UNDER' ? chance : 100 - chance;
  const multiplier = +(rtpValue / chance).toFixed(2);

  return {
    displayValue: +displayValue.toFixed(2),
    multiplier,
  };
}

function calculateDiceFromMultiplier(
  multiplier: number,
  direction: DiceControlsDirection,
  rtpValue: number,
) {
  const chance = +(rtpValue / multiplier).toFixed(2);
  const displayValue = direction === 'UNDER' ? chance : 100 - chance;

  return {
    chance,
    displayValue: +displayValue.toFixed(2),
  };
}

export function applyDiceDisplayValueUpdate(
  value: number,
  direction: DiceControlsDirection,
  rtpValue: number,
): DiceControlsLinkedValues {
  const displayValue = clampDiceDisplayValue(value);
  const { chance, multiplier } = calculateDiceFromDisplayValue(
    displayValue,
    direction,
    rtpValue,
  );

  return {
    displayValue,
    winChance: chance,
    multiplier,
  };
}

export function applyDiceWinChanceUpdate(
  value: number,
  direction: DiceControlsDirection,
  rtpValue: number,
): DiceControlsLinkedValues {
  const winChance = Math.min(
    DICE_CONTROLS_MAX_WIN_CHANCE_INTERNAL,
    Math.max(0.01, value),
  );
  const { displayValue: rawDisplayValue } = calculateDiceFromWinChance(
    winChance,
    direction,
    rtpValue,
  );
  const displayValue = clampDiceDisplayValue(rawDisplayValue);
  const { chance, multiplier } = calculateDiceFromDisplayValue(
    displayValue,
    direction,
    rtpValue,
  );

  return {
    displayValue,
    winChance: chance,
    multiplier,
  };
}

export function applyDiceMultiplierUpdate(
  value: number,
  direction: DiceControlsDirection,
  rtpValue: number,
): DiceControlsLinkedValues {
  const multiplier = Math.min(
    DICE_CONTROLS_MAX_MULTIPLIER,
    Math.max(DICE_CONTROLS_MIN_MULTIPLIER, value),
  );
  const { displayValue: rawDisplayValue } = calculateDiceFromMultiplier(
    multiplier,
    direction,
    rtpValue,
  );
  const displayValue = clampDiceDisplayValue(rawDisplayValue);
  const { chance, multiplier: nextMultiplier } = calculateDiceFromDisplayValue(
    displayValue,
    direction,
    rtpValue,
  );

  return {
    displayValue,
    winChance: chance,
    multiplier: nextMultiplier,
  };
}

export function applyDiceDirectionToggle(
  direction: DiceControlsDirection,
  displayValue: number,
  rtpValue: number,
): DiceControlsLinkedValues & { direction: DiceControlsDirection } {
  const nextDirection = direction === 'UNDER' ? 'OVER' : 'UNDER';

  return {
    direction: nextDirection,
    ...applyDiceDisplayValueUpdate(100 - displayValue, nextDirection, rtpValue),
  };
}

/** Story outcome mock: under ≤ threshold, over ≥ threshold. */
export function isDiceStoryWin(
  rolledValue: number,
  threshold: number,
  direction: DiceDirection,
): boolean {
  return direction === 'UNDER' ? rolledValue <= threshold : rolledValue >= threshold;
}

export function getDiceStoryResultColor(
  rolledValue: number,
  threshold: number,
  direction: DiceDirection,
): DiceLastResultColor {
  return isDiceStoryWin(rolledValue, threshold, direction) ? 'green' : 'red';
}
