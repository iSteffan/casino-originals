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
};
