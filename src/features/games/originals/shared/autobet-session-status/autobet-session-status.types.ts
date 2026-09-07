export type AutobetSessionState =
  | 'live'
  | 'paused'
  | 'complete'
  | 'insufficient-balance'
  | 'interrupted'
  | 'awaiting-bets'
  | 'ready-to-start';

type AutobetSessionStatusIndicator = 'live-pulse' | 'ready-dot' | 'complete-check' | null;

export interface AutobetSessionStatusContent {
  indicator: AutobetSessionStatusIndicator;
  title: string;
  titleClassName: string;
  subtitle?: string;
  subtitleClassName?: string;
}

interface AutobetSessionStatusStatLabels {
  totalWagered: string;
  netProfit: string;
  winRate: string;
}

export interface AutobetSessionStatusLabels extends AutobetSessionStatusStatLabels {
  live: string;
  liveSubtitle: string;
  paused: string;
  complete: string;
  completeSubtitle: string;
  insufficientBalance: string;
  insufficientBalanceSubtitle: string;
  interrupted: string;
  interruptedSubtitle: string;
  awaitingBets: string;
  readyToStart: string;
}

export interface AutobetSessionStatusProps {
  state: AutobetSessionState;
  totalWagered: string;
  netProfit: string;
  winRate: string;
  labels?: Partial<AutobetSessionStatusLabels>;
  className?: string;
}
