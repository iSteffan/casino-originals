import type {
  DiceControlsActiveField,
  DiceControlsDirection,
  DiceControlsLabels,
} from '#ui/features/games/originals/dice/dice-controls/dice-controls.types';
import type {
  OriginalsGameConfigAutobetSessionProps,
  OriginalsGameConfigBetAmountProps,
  OriginalsGameConfigRoundsProps,
  OriginalsGameConfigShellProps,
  OriginalsGameConfigStopConditionsProps,
} from '#ui/features/games/originals/originals-config/originals-game-config.types';

export type DiceConfigStopConditionsProps = OriginalsGameConfigStopConditionsProps;
export type DiceConfigAutobetSessionProps = OriginalsGameConfigAutobetSessionProps;

export interface DiceConfigControlsProps {
  direction: DiceControlsDirection;
  onDirectionToggle: () => void;
  displayValue: number;
  winChance: number;
  multiplier: number;
  onDisplayValueChange: (value: number) => void;
  onWinChanceChange: (value: number) => void;
  onMultiplierChange: (value: number) => void;
  activeField?: DiceControlsActiveField;
  onActiveFieldChange?: (field: DiceControlsActiveField) => void;
  labels: DiceControlsLabels;
}

export interface DiceConfigProps {
  shell: OriginalsGameConfigShellProps;
  betAmount: OriginalsGameConfigBetAmountProps;
  rounds?: OriginalsGameConfigRoundsProps;
  stopConditions?: OriginalsGameConfigStopConditionsProps;
  fieldsDisabled?: boolean;
  diceControls: DiceConfigControlsProps;
}

export type {
  DiceControlsActiveField,
  DiceControlsDirection,
  DiceControlsLabels,
  DiceDirection,
} from '#ui/features/games/originals/dice/dice-controls/dice-controls.types';
