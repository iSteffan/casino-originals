'use client';

import type { BlackjackConfigProps } from './blackjack-config.types';

import { BlackjackActions } from '#ui/features/games/originals/blackjack/blackjack-actions/blackjack-actions';
import { BlackjackInsurance } from '#ui/features/games/originals/blackjack/blackjack-insurance/blackjack-insurance';
import { BetAmountInput } from '#ui/features/games/originals/shared/bet-amount-input/bet-amount-input';
import { Button } from '#ui/primitives/actions/button/button';

export function BlackjackConfig({
  amount,
  onAmountChange,
  amountLabel,
  amountTooltip,
  currencyIcon,
  amountQuickActions,
  amountError,
  amountLoading,
  startLabel,
  onStart,
  startDisabled,
  playing,
  insurance,
  actions,
  className,
}: BlackjackConfigProps) {
  return (
    <div
      className={
        className ??
        'bg-ds-surface-secondary rounded-ds-sm flex w-full flex-col gap-4 p-4 lg:w-80'
      }
    >
      <BetAmountInput
        label={amountLabel}
        value={amount}
        onChange={onAmountChange}
        disabled={playing}
        precision={2}
        tooltip={amountTooltip}
        currencyIcon={currencyIcon}
        quickActions={amountQuickActions}
        error={amountError}
        isLoading={amountLoading}
      />
      <Button type="button" onClick={onStart} disabled={startDisabled}>
        {startLabel}
      </Button>
      {insurance ? (
        <BlackjackInsurance
          label={insurance.label}
          acceptLabel={insurance.acceptLabel}
          declineLabel={insurance.declineLabel}
          onChoose={insurance.onChoose}
        />
      ) : (
        <BlackjackActions actions={actions} />
      )}
    </div>
  );
}

export type {
  BlackjackConfigInsurance,
  BlackjackConfigProps,
} from './blackjack-config.types';
