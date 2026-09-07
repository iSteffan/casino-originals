import type {
  AutobetSessionState,
  AutobetSessionStatusContent,
  AutobetSessionStatusLabels,
} from './autobet-session-status.types';

const DEFAULT_AUTOBET_SESSION_STATUS_LABELS: AutobetSessionStatusLabels = {
  totalWagered: 'Total Wagered',
  netProfit: 'Net Profit',
  winRate: 'Win rate',
  live: 'LIVE',
  liveSubtitle: 'Fields locked',
  paused: 'PAUSED',
  complete: 'Session complete',
  completeSubtitle: 'Ready to restart',
  insufficientBalance: 'Insufficient balance',
  insufficientBalanceSubtitle: 'Reduce bet or deposit',
  interrupted: 'Bet interrupted',
  interruptedSubtitle: 'Something went wrong. Please try again.',
  awaitingBets: 'Make your bets',
  readyToStart: 'Ready to start',
};

export function resolveAutobetSessionStatusLabels(
  labels?: Partial<AutobetSessionStatusLabels>,
): AutobetSessionStatusLabels {
  return {
    ...DEFAULT_AUTOBET_SESSION_STATUS_LABELS,
    ...labels,
  };
}

export function getAutobetSessionStatusContent(
  state: AutobetSessionState,
  labels: AutobetSessionStatusLabels,
): AutobetSessionStatusContent {
  switch (state) {
    case 'live':
      return {
        indicator: 'live-pulse',
        title: labels.live,
        titleClassName: 'text-ds-success-500',
        subtitle: labels.liveSubtitle,
        subtitleClassName: 'text-ds-success-500',
      };
    case 'paused':
      return {
        indicator: null,
        title: labels.paused,
        titleClassName: 'text-ds-warning-500',
      };
    case 'complete':
      return {
        indicator: 'complete-check',
        title: labels.complete,
        titleClassName: 'text-ds-success-500',
        subtitle: labels.completeSubtitle,
        subtitleClassName: 'text-ds-success-500',
      };
    case 'insufficient-balance':
      return {
        indicator: null,
        title: labels.insufficientBalance,
        titleClassName: 'text-ds-error-500',
        subtitle: labels.insufficientBalanceSubtitle,
        subtitleClassName: 'text-ds-error-500',
      };
    case 'interrupted':
      return {
        indicator: null,
        title: labels.interrupted,
        titleClassName: 'text-ds-error-500',
        subtitle: labels.interruptedSubtitle,
        subtitleClassName: 'text-ds-error-500',
      };
    case 'awaiting-bets':
      return {
        indicator: null,
        title: labels.awaitingBets,
        titleClassName: 'text-ds-success-500',
      };
    case 'ready-to-start':
      return {
        indicator: 'ready-dot',
        title: labels.readyToStart,
        titleClassName: 'text-ds-success-500',
      };
  }
}

export function getNetProfitValueClassName(netProfit: string | undefined) {
  const trimmed = (netProfit ?? '').trim();

  if (trimmed.startsWith('+')) return 'text-ds-success-500';
  if (trimmed.startsWith('-')) return 'text-ds-gray-300';

  return undefined;
}

export function getStatusSeparatorClassName(state: AutobetSessionState) {
  return state === 'insufficient-balance' || state === 'interrupted'
    ? 'text-ds-error-500'
    : 'text-ds-success-500';
}
