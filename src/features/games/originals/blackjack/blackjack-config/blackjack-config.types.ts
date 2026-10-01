import type { ReactNode } from 'react';

import type { BlackjackActionItem } from '#ui/features/games/originals/blackjack/blackjack-actions/blackjack-actions.types';
import type {
  BetAmountInputTooltip,
  BetAmountQuickAction,
  BetAmountThresholdWarningContent,
} from '#ui/features/games/originals/shared/bet-amount-input/bet-amount-input.types';

export interface BlackjackConfigInsurance {
  label: string;
  acceptLabel: string;
  declineLabel: string;
  onChoose: (accepted: boolean) => void;
}

export interface BlackjackConfigProps {
  amount: string;
  onAmountChange: (value: string) => void;
  amountLabel: string;
  amountTooltip?: BetAmountInputTooltip;
  /** Secondary amount in the label row (crypto/fiat conversion). */
  conversionText?: string | null;
  currencyIcon?: ReactNode;
  amountQuickActions?: BetAmountQuickAction[];
  amountError?: string;
  amountLoading?: boolean;
  /** Caller decides visibility by passing content or `null`. */
  thresholdWarning?: BetAmountThresholdWarningContent | null;
  startLabel: string;
  onStart: () => void;
  startDisabled: boolean;
  playing: boolean;
  insurance: BlackjackConfigInsurance | null;
  actions: readonly BlackjackActionItem[];
  className?: string;
}