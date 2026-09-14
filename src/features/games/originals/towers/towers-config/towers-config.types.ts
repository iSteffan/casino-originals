import type {
  OriginalsGameConfigAutobetSessionProps,
  OriginalsGameConfigBetAmountProps,
  OriginalsGameConfigRoundsProps,
  OriginalsGameConfigShellProps,
  OriginalsGameConfigStopConditionsProps,
} from '#ui/features/games/originals/originals-config/originals-game-config.types';
import type {
  TowersDifficultyLabels,
  TowersDifficultyOption,
} from '#ui/features/games/originals/towers/towers-difficulty/towers-difficulty';

export type TowersConfigStopConditionsProps = OriginalsGameConfigStopConditionsProps;
export type TowersConfigAutobetSessionProps = OriginalsGameConfigAutobetSessionProps;

export interface TowersConfigDifficultyProps {
  value: number;
  onChange: (value: number) => void;
  options: readonly TowersDifficultyOption[];
  labels: TowersDifficultyLabels;
}

export interface TowersConfigProps {
  shell: OriginalsGameConfigShellProps;
  betAmount: OriginalsGameConfigBetAmountProps;
  rounds?: OriginalsGameConfigRoundsProps;
  stopConditions?: OriginalsGameConfigStopConditionsProps;
  fieldsDisabled?: boolean;
  difficulty: TowersConfigDifficultyProps;
  actions: {
    clearSelection: { label: string; onClick: () => void; disabled?: boolean };
    random: {
      label: string;
      onClick: () => void;
      visible: boolean;
      disabled?: boolean;
    };
  };
}

export type {
  TowersDifficultyLabels,
  TowersDifficultyOption,
} from '#ui/features/games/originals/towers/towers-difficulty/towers-difficulty';
