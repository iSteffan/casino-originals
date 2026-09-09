import type { CSSProperties } from 'react';

import type { DiceDirection } from '#ui/features/games/originals/dice/dice.types';

export type DiceSliderDirection = DiceDirection;

export interface DiceSliderProps {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (values: number[]) => void;
  onValueCommit?: (values: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  direction?: DiceSliderDirection;
  showValueLabel?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  style?: CSSProperties;
  className?: string;
}
