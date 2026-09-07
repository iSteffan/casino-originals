import type {
  OriginalsGameConfigBetAmountFields,
  OriginalsGameConfigBetAmountProps,
  OriginalsGameConfigProps,
  OriginalsGameConfigRoundsFields,
  OriginalsGameConfigRoundsProps,
  OriginalsGameConfigSharedFields,
  OriginalsGameConfigShellFields,
  OriginalsGameConfigShellProps,
} from './originals-game-config.types';

export function buildOriginalsGameConfigShell(
  props: OriginalsGameConfigShellFields,
): OriginalsGameConfigShellProps {
  return {
    mode: props.mode,
    onModeChange: props.onModeChange,
    tabsDisabled: props.tabsDisabled,
    manualActionLabel: props.manualActionLabel,
    autoActionLabel: props.autoActionLabel,
    autoActionVariant: props.autoActionVariant,
    onManualAction: props.onManualAction,
    onAutoAction: props.onAutoAction,
    manualActionDisabled: props.manualActionDisabled,
    autoActionDisabled: props.autoActionDisabled,
    manualActionPending: props.manualActionPending,
    manualSecondaryActionLabel: props.manualSecondaryActionLabel,
    onManualSecondaryAction: props.onManualSecondaryAction,
    manualSecondaryActionVisible: props.manualSecondaryActionVisible,
    manualSecondaryActionDisabled: props.manualSecondaryActionDisabled,
    autoSecondaryActionLabel: props.autoSecondaryActionLabel,
    onAutoSecondaryAction: props.onAutoSecondaryAction,
    autoSecondaryActionDisabled: props.autoSecondaryActionDisabled,
    autobetSession: props.autobetSession,
    width: props.width,
    theatreMode: props.theatreMode,
    className: props.className,
    style: props.style,
  };
}

export function buildOriginalsGameConfigBetAmount(
  props: OriginalsGameConfigBetAmountFields,
): OriginalsGameConfigBetAmountProps {
  return {
    value: props.betAmount,
    onChange: props.onBetAmountChange,
    label: props.betAmountLabel,
    conversionText: props.betAmountConversionText,
    tooltip: props.betAmountTooltip,
    currencyIcon: props.currencyIcon,
    quickActions: props.betAmountQuickActions,
    error: props.betAmountError,
    thresholdWarning: props.betAmountThresholdWarning,
    isLoading: props.betAmountLoading,
    placeholder: props.betAmountPlaceholder,
    precision: props.betAmountPrecision,
    inputMode: props.betAmountInputMode,
  };
}

export function buildOriginalsGameConfigRounds(
  props: OriginalsGameConfigRoundsFields,
): OriginalsGameConfigRoundsProps | undefined {
  if (!props.onRoundsChange) {
    return undefined;
  }

  return {
    value: props.rounds ?? '',
    onChange: props.onRoundsChange,
    error: props.roundsError,
    label: props.roundsLabel,
    max: props.roundsMax,
    placeholder: props.roundsPlaceholder,
  };
}

export function buildOriginalsGameConfigProps(
  props: OriginalsGameConfigSharedFields,
  children?: OriginalsGameConfigProps['children'],
): Pick<
  OriginalsGameConfigProps,
  'shell' | 'betAmount' | 'rounds' | 'stopConditions' | 'fieldsDisabled' | 'children'
> {
  return {
    shell: buildOriginalsGameConfigShell(props),
    betAmount: buildOriginalsGameConfigBetAmount(props),
    rounds: buildOriginalsGameConfigRounds(props),
    stopConditions: props.stopConditions,
    fieldsDisabled: props.fieldsDisabled,
    children,
  };
}
