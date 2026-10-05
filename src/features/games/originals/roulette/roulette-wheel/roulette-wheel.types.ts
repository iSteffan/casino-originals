import type { CSSProperties } from 'react';

import type { RouletteWheelNumber } from '../roulette.constants';

export interface RouletteWheelProps {
  start: boolean;
  winningBet: RouletteWheelNumber | '-1';
  onSpinningEnd?: (winner: RouletteWheelNumber) => void;
  layoutType?: 'european';
  automaticSpinning?: boolean;
  spinLaps?: number;
  spinDuration?: number;
  spinEaseFunction?: CSSProperties['transitionTimingFunction'];
  isStopping?: boolean;
  className?: string;
}
