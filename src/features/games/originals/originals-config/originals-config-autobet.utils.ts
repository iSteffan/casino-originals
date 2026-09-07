import type { OriginalsConfigAutoActionVariant } from './originals-config.types';

export function getConfiguredMaxRounds(rounds: string): number {
  if (rounds === 'Infinity') return Number.POSITIVE_INFINITY;
  const n = Number(rounds ?? 0);
  if (Number.isNaN(n) || n < 0) return 0;
  return n;
}

export interface ResolveOriginalsAutobetActionOptions {
  isRunning: boolean;
  isGracefulStopPending?: boolean;
  isInsufficientBalance?: boolean;
  isInterrupted?: boolean;
  isPaused?: boolean;
  rounds?: string;
  roundsCompleted?: number;
  startAutobetLabel?: string;
  stopLabel?: string;
  retryLabel?: string;
  formatStartRemainingLabel?: (remaining: number) => string;
}

export interface OriginalsAutobetAction {
  variant: OriginalsConfigAutoActionVariant;
  label: string;
}

function formatDefaultStartRemainingLabel(remaining: number): string {
  if (remaining === Number.POSITIVE_INFINITY) {
    return 'Start ∞ Bets';
  }

  return `Start ${remaining} Bets`;
}

export function resolveOriginalsAutobetAction(
  options: ResolveOriginalsAutobetActionOptions,
): OriginalsAutobetAction {
  const {
    isRunning,
    isGracefulStopPending = false,
    isInsufficientBalance = false,
    isInterrupted = false,
    isPaused = false,
    rounds = '',
    roundsCompleted = 0,
    startAutobetLabel = 'Start Autobet',
    stopLabel = 'Stop',
    retryLabel = 'Retry',
    formatStartRemainingLabel = formatDefaultStartRemainingLabel,
  } = options;

  if (isRunning || isGracefulStopPending) {
    return { variant: 'stop', label: stopLabel };
  }

  if (isInsufficientBalance || isInterrupted) {
    return { variant: 'retry', label: retryLabel };
  }

  if (isPaused) {
    const maxR = getConfiguredMaxRounds(rounds);
    if (maxR === Number.POSITIVE_INFINITY) {
      return {
        variant: 'start',
        label: formatStartRemainingLabel(Number.POSITIVE_INFINITY),
      };
    }

    const remaining = Math.max(0, maxR - roundsCompleted);
    if (remaining === 0) {
      return { variant: 'start', label: startAutobetLabel };
    }

    return { variant: 'start', label: formatStartRemainingLabel(remaining) };
  }

  return { variant: 'start', label: startAutobetLabel };
}
