import BigNumber from 'bignumber.js';

export interface OriginalStopConditions {
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  onWin: number;
  onLoss: number;
  stopProfit: string;
  stopLoss: string;
}

export interface OriginalAutobetMetrics {
  roundsCompleted: number;
  totalWagered: string;
  netProfit: string;
  wins: number;
  losses: number;
}

export type OriginalAutobetStatus =
  | { kind: 'idle' | 'running' | 'stopping' | 'paused' }
  | { kind: 'failed'; reason: 'insufficient-balance' | 'disconnected' | 'generic' };

export interface OriginalBetContext {
  readonly auto: boolean;
  readonly initialBet: string;
  readonly stopConditions: Readonly<OriginalStopConditions>;
  readonly fiatRate: string;
}

export const DEFAULT_ORIGINAL_STOP_CONDITIONS: OriginalStopConditions = {
  isActiveOnWin: false,
  isActiveOnLoss: false,
  onWin: 50,
  onLoss: 50,
  stopProfit: '',
  stopLoss: '',
};

export const EMPTY_ORIGINAL_AUTOBET_METRICS: OriginalAutobetMetrics = {
  roundsCompleted: 0,
  totalWagered: '0',
  netProfit: '0',
  wins: 0,
  losses: 0,
};

export function isAutobetActive(auto: OriginalAutobetStatus): boolean {
  return auto.kind === 'running' || auto.kind === 'stopping';
}

export function getConfiguredMaxRounds(rounds: string): number {
  if (rounds === 'Infinity') return Number.POSITIVE_INFINITY;
  const count = Number(rounds);
  return Number.isSafeInteger(count) && count >= 0 ? count : 0;
}

/** An authored edit starts a new run using the paused run's remaining budget. */
export function prepareAutobetEdit({
  auto,
  rounds,
  metrics,
}: {
  auto: OriginalAutobetStatus;
  rounds: string;
  metrics: OriginalAutobetMetrics;
}) {
  if (auto.kind !== 'paused' && auto.kind !== 'failed') {
    return { auto, rounds, metrics };
  }
  const max = getConfiguredMaxRounds(rounds);
  return {
    auto: { kind: 'idle' } as OriginalAutobetStatus,
    rounds:
      max === Number.POSITIVE_INFINITY
        ? rounds
        : String(Math.max(0, max - metrics.roundsCompleted)),
    metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
  };
}

export function canContinueAutobet(
  state: {
    rounds: string;
    metrics: OriginalAutobetMetrics;
    stopConditions: OriginalStopConditions;
  },
  fiatRate = '1',
): boolean {
  const profit = new BigNumber(state.metrics.netProfit);
  const rate = new BigNumber(fiatRate);
  const conversion = rate.isFinite() && rate.gt(0) ? rate : 1;
  const stopProfit = new BigNumber(state.stopConditions.stopProfit || 0);
  const stopLoss = new BigNumber(state.stopConditions.stopLoss || 0);
  return (
    state.metrics.roundsCompleted < getConfiguredMaxRounds(state.rounds) &&
    !(stopProfit.gt(0) && profit.gte(stopProfit.times(conversion))) &&
    !(stopLoss.gt(0) && profit.lte(stopLoss.times(conversion).negated()))
  );
}

/** Call once for an accepted round, before presentation starts. */
export function settleAutobetRound(
  previous: { metrics: OriginalAutobetMetrics; nextBet: string },
  result: { win: boolean; betAmount: string; payoutAmount: string },
  context: OriginalBetContext,
): { metrics: OriginalAutobetMetrics; nextBet: string } {
  if (!context.auto) return previous;
  const wager = new BigNumber(result.betAmount);
  const metrics = {
    roundsCompleted: previous.metrics.roundsCompleted + 1,
    totalWagered: new BigNumber(previous.metrics.totalWagered).plus(wager).toString(10),
    netProfit: new BigNumber(previous.metrics.netProfit)
      .plus(result.payoutAmount)
      .minus(wager)
      .toFixed(),
    wins: previous.metrics.wins + (result.win ? 1 : 0),
    losses: previous.metrics.losses + (result.win ? 0 : 1),
  };
  if (!wager.gt(0)) return { metrics, nextBet: previous.nextBet };
  const rules = context.stopConditions;
  const increase = result.win ? rules.isActiveOnWin : rules.isActiveOnLoss;
  const percentage = result.win ? rules.onWin : rules.onLoss;
  const stake = increase
    ? wager.times(new BigNumber(percentage).div(100).plus(1))
    : new BigNumber(context.initialBet);
  const rate = new BigNumber(context.fiatRate);
  const minimum =
    rate.isFinite() && rate.gt(0) ? rate.times('0.01') : new BigNumber(0);
  return {
    metrics,
    nextBet: (stake.lt(minimum) ? minimum : stake).toFixed(),
  };
}
