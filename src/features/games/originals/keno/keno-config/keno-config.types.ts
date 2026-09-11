import type {
  KenoRiskLabels,
  KenoRiskOption,
} from '#ui/features/games/originals/keno/keno-risk/keno-risk';
import type {
  OriginalsGameConfigAutobetSessionProps,
  OriginalsGameConfigBetAmountProps,
  OriginalsGameConfigRoundsProps,
  OriginalsGameConfigShellProps,
  OriginalsGameConfigStopConditionsProps,
} from '#ui/features/games/originals/originals-config/originals-game-config.types';

export type KenoConfigStopConditionsProps = OriginalsGameConfigStopConditionsProps;
export type KenoConfigAutobetSessionProps = OriginalsGameConfigAutobetSessionProps;

export interface KenoConfigRiskProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly KenoRiskOption[];
  labels: KenoRiskLabels;
}

export interface KenoConfigActionsProps {
  autoPick: { label: string; onClick: () => void; disabled?: boolean };
  clearTable: { label: string; onClick: () => void; disabled?: boolean };
}

export interface KenoConfigProps {
  shell: OriginalsGameConfigShellProps;
  betAmount: OriginalsGameConfigBetAmountProps;
  rounds?: OriginalsGameConfigRoundsProps;
  stopConditions?: OriginalsGameConfigStopConditionsProps;
  fieldsDisabled?: boolean;
  risk: KenoConfigRiskProps;
  actions: KenoConfigActionsProps;
}

export type {
  KenoRiskLabels,
  KenoRiskOption,
} from '#ui/features/games/originals/keno/keno-risk/keno-risk';
