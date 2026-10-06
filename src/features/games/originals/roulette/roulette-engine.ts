import {
  ROULETTE_BLACK_NUMBERS,
  ROULETTE_CHIPS,
  ROULETTE_EVEN_NUMBERS,
  ROULETTE_ODD_NUMBERS,
  ROULETTE_RANGE_MAP,
  ROULETTE_RED_NUMBERS,
  ROULETTE_ROW_1,
  ROULETTE_ROW_2,
  ROULETTE_ROW_3,
  type RouletteChipDef,
} from './roulette.constants';

/** One chip placement on a table cell (matches RouletteField cell ids). */
export interface RouletteBet {
  id: string;
  cellId: string;
  amount: number;
}

export interface RouletteSettleResult {
  /** Net profit across all bets (negative when the round loses). */
  profit: number;
  /** Gross return paid on winning bets only (0 when nothing hits). */
  payout: number;
  /** Sum of stakes on bets that hit. */
  winningStake: number;
  /** Total stake for the round. */
  totalStake: number;
}

const NUMBER_CELL_RE = /^number-(\d+)$/;

export function getRouletteCellNumbers(cellId: string): readonly number[] {
  const match = NUMBER_CELL_RE.exec(cellId);
  if (match) {
    const n = Number(match[1]);
    return Number.isFinite(n) && n >= 0 && n <= 36 ? [n] : [];
  }
  return ROULETTE_RANGE_MAP[cellId] ?? [];
}

/** European payout ratio as profit multiplier (straight 35, dozen/column 2, even-money 1). */
export function getRouletteProfitMultiplier(cellId: string): number {
  const numbers = getRouletteCellNumbers(cellId);
  if (numbers.length === 0) return 0;
  return 36 / numbers.length - 1;
}

export function addRouletteChip(
  bets: readonly RouletteBet[],
  cellId: string,
  amount: number,
  maxStack = 5,
): RouletteBet[] {
  if (!Number.isFinite(amount) || amount <= 0) return [...bets];
  if (getRouletteCellNumbers(cellId).length === 0) return [...bets];
  const stackCount = bets.filter((bet) => bet.cellId === cellId).length;
  if (stackCount >= maxStack) return [...bets];
  return [
    ...bets,
    {
      id: `${cellId}-${Date.now()}-${bets.length}`,
      cellId,
      amount,
    },
  ];
}

/** Demo settlement. Outside bets never win on zero (numbers lists exclude 0). */
export function settleRouletteBets(
  bets: readonly RouletteBet[],
  result: number,
): RouletteSettleResult {
  let profit = 0;
  let payout = 0;
  let winningStake = 0;
  let totalStake = 0;

  for (const bet of bets) {
    totalStake += bet.amount;
    const numbers = getRouletteCellNumbers(bet.cellId);
    if (numbers.includes(result)) {
      const multiplier = getRouletteProfitMultiplier(bet.cellId);
      profit += bet.amount * multiplier;
      payout += bet.amount * (multiplier + 1);
      winningStake += bet.amount;
    } else {
      profit -= bet.amount;
    }
  }

  return { profit, payout, winningStake, totalStake };
}

export function getRandomRouletteNumber(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0]! % 37;
  }
  return Math.floor(Math.random() * 37);
}

export function getRouletteChipDef(amount: number): RouletteChipDef {
  return ROULETTE_CHIPS.find((chip) => chip.value === amount) ?? ROULETTE_CHIPS[2]!;
}

export function sumRouletteStake(bets: readonly RouletteBet[]): number {
  return bets.reduce((sum, bet) => sum + bet.amount, 0);
}

export {
  ROULETTE_BLACK_NUMBERS,
  ROULETTE_CHIPS,
  ROULETTE_EVEN_NUMBERS,
  ROULETTE_ODD_NUMBERS,
  ROULETTE_RED_NUMBERS,
  ROULETTE_ROW_1,
  ROULETTE_ROW_2,
  ROULETTE_ROW_3,
};
