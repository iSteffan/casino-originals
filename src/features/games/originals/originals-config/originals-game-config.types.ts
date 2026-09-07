import type { CSSProperties, ReactNode } from 'react';

import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from './originals-config.types';

import type {
  AutobetSessionState,
  AutobetSessionStatusLabels,
} from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';
import type {
  BetAmountInputTooltip,
  BetAmountQuickAction,
  BetAmountThresholdWarningContent,
} from '#ui/features/games/originals/shared/bet-amount-input/bet-amount-input.types';
import type { StopConditionsLabels } from '#ui/features/games/originals/shared/stop-conditions/stop-conditions.types';

export interface OriginalsGameConfigAutobetSessionProps {
  state: AutobetSessionState;
  totalWagered: string;
  netProfit: string;
  winRate: string;
  labels?: Partial<AutobetSessionStatusLabels>;
}

export interface OriginalsGameConfigShellProps {
  mode: OriginalsConfigMode;
  onModeChange?: (mode: OriginalsConfigMode) => void;
  tabsDisabled?: boolean;
  manualTabLabel?: string;
  autoTabLabel?: string;
  manualActionLabel?: string;
  autoActionLabel?: string;
  autoActionVariant?: OriginalsConfigAutoActionVariant;
  onManualAction?: () => void;
  onAutoAction?: () => void;
  manualActionDisabled?: boolean;
  autoActionDisabled?: boolean;
  manualActionPending?: boolean;
  manualSecondaryActionLabel?: string;
  onManualSecondaryAction?: () => void;
  manualSecondaryActionVisible?: boolean;
  manualSecondaryActionDisabled?: boolean;
  autoSecondaryActionLabel?: string;
  onAutoSecondaryAction?: () => void;
  autoSecondaryActionDisabled?: boolean;
  autobetSession?: OriginalsGameConfigAutobetSessionProps;
  width?: number;
  theatreMode?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface OriginalsGameConfigBetAmountProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  tooltip?: BetAmountInputTooltip;
  conversionText?: string | null;
  currencyIcon?: ReactNode;
  isLoading?: boolean;
  error?: string;
  placeholder?: string;
  precision?: number;
  inputMode?: 'decimal' | 'numeric';
  quickActions?: BetAmountQuickAction[];
  thresholdWarning?: BetAmountThresholdWarningContent | null;
}

export interface OriginalsGameConfigRoundsProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  max?: number;
  placeholder?: string;
}

export interface OriginalsGameConfigStopConditionsProps {
  labels: StopConditionsLabels;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  onWinChange: (value: number) => void;
  onLossChange: (value: number) => void;
  onStopProfitChange: (value: string) => void;
  onStopLossChange: (value: string) => void;
  onWinToggle: (active: boolean) => void;
  onLossToggle: (active: boolean) => void;
  onResetOnWinFromActive?: () => void;
  onResetOnLossFromActive?: () => void;
}

/** Flat shell fields for per-game config public APIs. */
export type OriginalsGameConfigShellFields = OriginalsGameConfigShellProps;

/** Flat bet-amount fields for per-game config public APIs. */
export type OriginalsGameConfigBetAmountFields = {
  betAmount: OriginalsGameConfigBetAmountProps['value'];
  onBetAmountChange: OriginalsGameConfigBetAmountProps['onChange'];
  betAmountLabel?: OriginalsGameConfigBetAmountProps['label'];
  betAmountConversionText?: OriginalsGameConfigBetAmountProps['conversionText'];
  betAmountTooltip?: OriginalsGameConfigBetAmountProps['tooltip'];
  currencyIcon?: OriginalsGameConfigBetAmountProps['currencyIcon'];
  betAmountQuickActions?: OriginalsGameConfigBetAmountProps['quickActions'];
  betAmountError?: OriginalsGameConfigBetAmountProps['error'];
  betAmountLoading?: OriginalsGameConfigBetAmountProps['isLoading'];
  betAmountThresholdWarning?: OriginalsGameConfigBetAmountProps['thresholdWarning'];
  betAmountPlaceholder?: OriginalsGameConfigBetAmountProps['placeholder'];
  betAmountPrecision?: OriginalsGameConfigBetAmountProps['precision'];
  betAmountInputMode?: OriginalsGameConfigBetAmountProps['inputMode'];
};

/** Flat rounds fields for per-game config public APIs. */
export type OriginalsGameConfigRoundsFields = {
  rounds?: OriginalsGameConfigRoundsProps['value'];
  onRoundsChange?: OriginalsGameConfigRoundsProps['onChange'];
  roundsError?: OriginalsGameConfigRoundsProps['error'];
  roundsLabel?: OriginalsGameConfigRoundsProps['label'];
  roundsMax?: OriginalsGameConfigRoundsProps['max'];
  roundsPlaceholder?: OriginalsGameConfigRoundsProps['placeholder'];
};

export type OriginalsGameConfigAutobetFields = {
  stopConditions?: OriginalsGameConfigStopConditionsProps;
  autobetSession?: OriginalsGameConfigAutobetSessionProps;
  fieldsDisabled?: boolean;
};

export type OriginalsGameConfigSharedFields = OriginalsGameConfigShellFields &
  OriginalsGameConfigBetAmountFields &
  OriginalsGameConfigRoundsFields &
  OriginalsGameConfigAutobetFields;

export interface OriginalsGameConfigProps {
  shell: OriginalsGameConfigShellProps;
  betAmount: OriginalsGameConfigBetAmountProps;
  rounds?: OriginalsGameConfigRoundsProps;
  stopConditions?: OriginalsGameConfigStopConditionsProps;
  fieldsDisabled?: boolean;
  /** Content above the action buttons in both modes (e.g. Keno auto pick row). */
  actionPrefix?: ReactNode;
  children?: ReactNode;
}
