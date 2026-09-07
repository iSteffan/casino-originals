'use client';

import { OriginalsConfig } from './originals-config';
import { OriginalsConfigModeStack } from './originals-config-mode-stack';
import type {
  OriginalsGameConfigProps,
  OriginalsGameConfigStopConditionsProps,
} from './originals-game-config.types';

import { BetAmountInput } from '#ui/features/games/originals/shared/bet-amount-input/bet-amount-input';
import { RoundsInput } from '#ui/features/games/originals/shared/rounds-input/rounds-input';
import { StopConditions } from '#ui/features/games/originals/shared/stop-conditions/stop-conditions';

function OriginalsGameConfigStopConditions({
  stopConditions,
  disabled,
}: {
  stopConditions: OriginalsGameConfigStopConditionsProps;
  disabled: boolean;
}) {
  return (
    <StopConditions
      labels={stopConditions.labels}
      onWinValue={stopConditions.onWinValue}
      onLossValue={stopConditions.onLossValue}
      stopProfitValue={stopConditions.stopProfitValue}
      stopLossValue={stopConditions.stopLossValue}
      isActiveOnWin={stopConditions.isActiveOnWin}
      isActiveOnLoss={stopConditions.isActiveOnLoss}
      onWinChange={stopConditions.onWinChange}
      onLossChange={stopConditions.onLossChange}
      onStopProfitChange={stopConditions.onStopProfitChange}
      onStopLossChange={stopConditions.onStopLossChange}
      onWinToggle={stopConditions.onWinToggle}
      onLossToggle={stopConditions.onLossToggle}
      onResetOnWinFromActive={stopConditions.onResetOnWinFromActive}
      onResetOnLossFromActive={stopConditions.onResetOnLossFromActive}
      disabled={disabled}
    />
  );
}

function OriginalsGameConfigAutoFields({
  rounds,
  stopConditions,
  fieldsDisabled,
}: Pick<OriginalsGameConfigProps, 'rounds' | 'stopConditions' | 'fieldsDisabled'>) {
  const roundsField = rounds ? (
    <RoundsInput
      label={rounds.label ?? 'Number of Bets'}
      value={rounds.value}
      onChange={rounds.onChange}
      error={rounds.error}
      max={rounds.max}
      placeholder={rounds.placeholder}
      disabled={fieldsDisabled}
    />
  ) : null;

  const stopConditionsField = stopConditions ? (
    <OriginalsGameConfigStopConditions
      stopConditions={stopConditions}
      disabled={fieldsDisabled ?? false}
    />
  ) : null;

  if (!roundsField && !stopConditionsField) {
    return null;
  }

  if (roundsField && !stopConditionsField) {
    return roundsField;
  }

  return (
    <div className="gap-ds-3 flex flex-col">
      {roundsField}
      {stopConditionsField}
    </div>
  );
}

export function OriginalsGameConfig({
  shell,
  betAmount,
  rounds,
  stopConditions,
  fieldsDisabled = false,
  actionPrefix,
  children,
}: OriginalsGameConfigProps) {
  const { mode, theatreMode = false } = shell;

  return (
    <OriginalsConfig
      mode={shell.mode}
      onModeChange={shell.onModeChange}
      tabsDisabled={shell.tabsDisabled}
      manualTabLabel={shell.manualTabLabel}
      autoTabLabel={shell.autoTabLabel}
      manualActionLabel={shell.manualActionLabel}
      autoActionLabel={shell.autoActionLabel}
      autoActionVariant={shell.autoActionVariant}
      onManualAction={shell.onManualAction}
      onAutoAction={shell.onAutoAction}
      manualActionDisabled={shell.manualActionDisabled}
      autoActionDisabled={shell.autoActionDisabled}
      manualActionPending={shell.manualActionPending}
      manualSecondaryActionLabel={shell.manualSecondaryActionLabel}
      onManualSecondaryAction={shell.onManualSecondaryAction}
      manualSecondaryActionVisible={shell.manualSecondaryActionVisible}
      manualSecondaryActionDisabled={shell.manualSecondaryActionDisabled}
      autoSecondaryActionLabel={shell.autoSecondaryActionLabel}
      onAutoSecondaryAction={shell.onAutoSecondaryAction}
      autoSecondaryActionDisabled={shell.autoSecondaryActionDisabled}
      autobetSession={shell.autobetSession}
      actionPrefix={actionPrefix}
      width={shell.width}
      theatreMode={shell.theatreMode}
      className={shell.className}
      style={shell.style}
    >
      <div className="gap-ds-3 flex flex-col">
        <BetAmountInput
          label={betAmount.label ?? 'Bet Amount'}
          value={betAmount.value}
          onChange={betAmount.onChange}
          conversionText={betAmount.conversionText}
          tooltip={betAmount.tooltip}
          currencyIcon={betAmount.currencyIcon}
          quickActions={betAmount.quickActions}
          error={betAmount.error}
          thresholdWarning={betAmount.thresholdWarning}
          isLoading={betAmount.isLoading}
          placeholder={betAmount.placeholder}
          precision={betAmount.precision}
          inputMode={betAmount.inputMode}
          disabled={fieldsDisabled}
        />

        {children}

        <OriginalsConfigModeStack
          mode={mode}
          reserveInactiveHeight={!theatreMode}
          manual={null}
          auto={
            <OriginalsGameConfigAutoFields
              rounds={rounds}
              stopConditions={stopConditions}
              fieldsDisabled={fieldsDisabled}
            />
          }
        />
      </div>
    </OriginalsConfig>
  );
}

export type {
  OriginalsGameConfigAutobetFields,
  OriginalsGameConfigAutobetSessionProps,
  OriginalsGameConfigBetAmountFields,
  OriginalsGameConfigBetAmountProps,
  OriginalsGameConfigProps,
  OriginalsGameConfigRoundsFields,
  OriginalsGameConfigRoundsProps,
  OriginalsGameConfigSharedFields,
  OriginalsGameConfigShellFields,
  OriginalsGameConfigShellProps,
  OriginalsGameConfigStopConditionsProps,
} from './originals-game-config.types';
export {
  buildOriginalsGameConfigBetAmount,
  buildOriginalsGameConfigProps,
  buildOriginalsGameConfigRounds,
  buildOriginalsGameConfigShell,
} from './originals-game-config.utils';
