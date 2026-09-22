import type { ReactNode } from 'react';

export type GameWinModalProps = {
  open: boolean;
  title: string;
  multiplierLabel: string;
  multiplier: ReactNode;
  formattedWinAmount: string;
  /** App-owned current-currency visual; omitted when no currency is available. */
  currencyIcon?: ReactNode;
  reducedMotion?: boolean;
  contentClassName?: string;
  /** Master volume 0–1. When set, plays the shared win-modal cue on open. */
  volume?: number;
};
