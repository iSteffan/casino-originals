import type { ReactNode } from 'react';

import type { RouletteFieldProps } from '../roulette-field/roulette-field.types';
import type { RouletteLastResultsProps } from '../roulette-last-results/roulette-last-results.types';
import type { RouletteWheelProps } from '../roulette-wheel/roulette-wheel.types';

export interface RouletteBoardProps {
  lastResults: RouletteLastResultsProps;
  wheel: RouletteWheelProps;
  field: RouletteFieldProps;
  overlay?: ReactNode;
  className?: string;
}
