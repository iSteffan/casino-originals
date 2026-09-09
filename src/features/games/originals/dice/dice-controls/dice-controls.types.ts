import type { DiceDirection } from '#ui/features/games/originals/dice/dice.types';

export type { DiceDirection } from '#ui/features/games/originals/dice/dice.types';

export type DiceControlsDirection = DiceDirection;

export type DiceControlsActiveField = 'roll' | 'win' | 'multiplier' | null;

export type DiceControlsLabels = {
  rollUnder: string;
  rollOver: string;
  multiplier: string;
  winChance: string;
  toggleDirection: string;
  decrease: string;
  increase: string;
  decreaseMultiplier?: string;
  increaseMultiplier?: string;
  decreaseWinChance?: string;
  increaseWinChance?: string;
};

export type DiceControlsProps = {
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
  disabled?: boolean;
  labels: DiceControlsLabels;
  className?: string;
};
