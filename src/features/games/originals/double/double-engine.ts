import BigNumber from 'bignumber.js';

import {
  DOUBLE_BET_TYPES,
  DOUBLE_MAX_COLOR_PICKS,
  DOUBLE_PAYOUT_MULTIPLIERS,
  DOUBLE_PHASE_DURATION_MS,
  DOUBLE_STATS_WINDOW,
  DOUBLE_TILES,
} from './double.constants';
import type {
  DoubleBetType,
  DoubleColor,
  DoubleLast100Stats,
  DoubleOutcome,
  DoublePhase,
  DoublePlacedBet,
  DoubleTileDefinition,
} from './double.types';

/**
 * Local Double rules (no server). Mirrors the betstrike runtime engine
 * (`toggleDoubleBet`, `createDoubleBetBatch`) and adds the offline roll/settlement
 * the server normally performs.
 */

const DOUBLE_PHASE_ORDER: readonly DoublePhase[] = ['BETTING', 'LOCKED', 'RESOLVING', 'FINISHED'];

export function isDoubleColor(type: DoubleBetType): type is DoubleColor {
  return type !== 'JOKER';
}

/** Betstrike `toggleDoubleBet`: Joker is always addable, colors are capped at two. */
export function toggleDoubleBetType(
  types: readonly DoubleBetType[],
  type: DoubleBetType,
): DoubleBetType[] {
  if (types.includes(type)) return types.filter((current) => current !== type);
  if (!DOUBLE_BET_TYPES.includes(type)) return [...types];
  if (isDoubleColor(type) && types.filter(isDoubleColor).length >= DOUBLE_MAX_COLOR_PICKS) {
    return [...types];
  }
  return [...types, type];
}

function toStake(amount: string): BigNumber | null {
  const stake = new BigNumber(amount);
  return stake.isFinite() && stake.gt(0) ? stake : null;
}

/** Same stake is placed on every pick, so the round costs stake x picks. */
export function getDoubleTotalStake(amount: string, types: readonly DoubleBetType[]): string {
  const stake = toStake(amount);
  if (!stake) return '0';
  return stake.times(Math.max(1, types.length)).toFixed();
}

/** Betstrike `createDoubleBetBatch` validation: the whole selection or nothing. */
export function createDoubleBets({
  amount,
  types,
  available,
}: {
  amount: string;
  types: readonly DoubleBetType[];
  available: string;
}): DoublePlacedBet[] | null {
  const stake = toStake(amount);
  const balance = new BigNumber(available);
  if (
    !stake ||
    !balance.isFinite() ||
    balance.isNegative() ||
    types.length === 0 ||
    types.some((type) => !DOUBLE_BET_TYPES.includes(type)) ||
    types.filter(isDoubleColor).length > DOUBLE_MAX_COLOR_PICKS ||
    new Set(types).size !== types.length ||
    stake.times(types.length).gt(balance)
  ) {
    return null;
  }
  return types.map((type) => ({ type, amount: stake.toFixed() }));
}

export function rollDoubleTileIndex(random: () => number = Math.random): number {
  const index = Math.floor(random() * DOUBLE_TILES.length);
  return Math.min(DOUBLE_TILES.length - 1, Math.max(0, index));
}

export function getDoubleTile(index: number): DoubleTileDefinition {
  const length = DOUBLE_TILES.length;
  return DOUBLE_TILES[((index % length) + length) % length] ?? DOUBLE_TILES[0];
}

export function toDoubleOutcome(tile: DoubleOutcome): DoubleOutcome {
  return { color: tile.color, hasJoker: tile.hasJoker };
}

/** Color picks win on their color (Joker tiles included); the Joker pick wins on any Joker tile. */
export function isDoubleBetWin(type: DoubleBetType, outcome: DoubleOutcome): boolean {
  return type === 'JOKER' ? outcome.hasJoker : outcome.color === type;
}

export function getDoubleMultiplier(type: DoubleBetType): number {
  return DOUBLE_PAYOUT_MULTIPLIERS[type];
}

export interface DoubleSettlement {
  betAmount: string;
  payoutAmount: string;
  winningTypes: DoubleBetType[];
  win: boolean;
}

export function settleDoubleBets(
  bets: readonly DoublePlacedBet[],
  outcome: DoubleOutcome,
): DoubleSettlement {
  let betAmount = new BigNumber(0);
  let payoutAmount = new BigNumber(0);
  const winningTypes: DoubleBetType[] = [];
  for (const bet of bets) {
    betAmount = betAmount.plus(bet.amount);
    if (isDoubleBetWin(bet.type, outcome)) {
      winningTypes.push(bet.type);
      payoutAmount = payoutAmount.plus(new BigNumber(bet.amount).times(getDoubleMultiplier(bet.type)));
    }
  }
  return {
    betAmount: betAmount.toFixed(),
    payoutAmount: payoutAmount.toFixed(),
    winningTypes,
    win: payoutAmount.gt(0),
  };
}

/** Legacy board label: `Red`, `Red Joker`. */
export function formatDoubleOutcome(outcome: DoubleOutcome): string {
  const color = outcome.color.charAt(0) + outcome.color.slice(1).toLowerCase();
  return outcome.hasJoker ? `${color} Joker` : color;
}

/** Counts over the newest 100 rolls; Joker tiles count for their color and for Joker. */
export function getDoubleLast100Stats(history: readonly DoubleOutcome[]): DoubleLast100Stats {
  const stats: DoubleLast100Stats = { red: 0, black: 0, green: 0, joker: 0 };
  for (const outcome of history.slice(0, DOUBLE_STATS_WINDOW)) {
    if (outcome.color === 'RED') stats.red += 1;
    else if (outcome.color === 'BLACK') stats.black += 1;
    else stats.green += 1;
    if (outcome.hasJoker) stats.joker += 1;
  }
  return stats;
}

export function getDoublePhaseDuration(phase: DoublePhase): number {
  return DOUBLE_PHASE_DURATION_MS[phase];
}

export function getNextDoublePhase(phase: DoublePhase): DoublePhase {
  const index = DOUBLE_PHASE_ORDER.indexOf(phase);
  return DOUBLE_PHASE_ORDER[(index + 1) % DOUBLE_PHASE_ORDER.length] ?? 'BETTING';
}
