'use client';

import type { StopConditionsProps } from './stop-conditions.types';
import { StopConditionsCurrencyField } from './stop-conditions-currency-field';
import { StopConditionsPercentageField } from './stop-conditions-percentage-field';

import { cn } from '#ui/lib/cn';

export function StopConditions({
  labels,
  onWinValue,
  onLossValue,
  stopProfitValue,
  stopLossValue,
  isActiveOnWin,
  isActiveOnLoss,
  onWinChange,
  onLossChange,
  onStopProfitChange,
  onStopLossChange,
  onWinToggle,
  onLossToggle,
  onResetOnWinFromActive,
  onResetOnLossFromActive,
  disabled = false,
  className,
}: StopConditionsProps) {
  return (
    <div className={cn('gap-ds-3 flex flex-col', className)}>
      <StopConditionsPercentageField
        label={labels.onWin}
        value={onWinValue}
        isActive={isActiveOnWin}
        resetLabel={labels.reset}
        activeLabel={labels.increaseBy}
        disabled={disabled}
        onToggle={onWinToggle}
        onChange={onWinChange}
        onResetFromActive={onResetOnWinFromActive}
      />

      <StopConditionsPercentageField
        label={labels.onLoss}
        value={onLossValue}
        isActive={isActiveOnLoss}
        resetLabel={labels.reset}
        activeLabel={labels.increaseBy}
        disabled={disabled}
        onToggle={onLossToggle}
        onChange={onLossChange}
        onResetFromActive={onResetOnLossFromActive}
      />

      <div className="gap-ds-2 grid grid-cols-2">
        <StopConditionsCurrencyField
          label={labels.stopProfit}
          value={stopProfitValue}
          onChange={onStopProfitChange}
          disabled={disabled}
        />
        <StopConditionsCurrencyField
          label={labels.stopLoss}
          value={stopLossValue}
          onChange={onStopLossChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export type { StopConditionsProps } from './stop-conditions.types';
