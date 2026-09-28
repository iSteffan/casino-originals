import type { ReactNode } from 'react';

import type { BlackjackActionItem } from '#ui/features/games/originals/blackjack/blackjack-actions/blackjack-actions.types';
import type {
  BetAmountInputTooltip,
  BetAmountQuickAction,
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
  currencyIcon?: ReactNode;
  amountQuickActions?: BetAmountQuickAction[];
  amountError?: string;
  amountLoading?: boolean;
  startLabel: string;
  onStart: () => void;
  startDisabled: boolean;
  playing: boolean;
  insurance: BlackjackConfigInsurance | null;
  actions: readonly BlackjackActionItem[];
  className?: string;
}
