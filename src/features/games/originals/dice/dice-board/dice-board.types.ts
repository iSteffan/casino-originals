import type { ReactNode } from 'react';

import type { DiceDirection } from '#ui/features/games/originals/dice/dice.types';
import type {
  DiceCubeAnimationDirection,
  DiceCubeMarkerState,
} from '#ui/features/games/originals/dice/dice-cube/dice-cube.types';
import type {
  DiceLastResultItem,
  DiceLastResultsAssets,
  DiceLastResultsLabels,
} from '#ui/features/games/originals/dice/dice-last-results/dice-last-results.types';

export type { DiceDirection } from '#ui/features/games/originals/dice/dice.types';

export type DiceBoardDirection = DiceDirection;

export interface DiceBoardLabels {
  yourNumber: string;
  rolledNumber: string;
  sliderAriaLabel: string;
}

export interface DiceResultAnnouncement {
  id: string;
  message: string;
}

export interface DiceBoardProps {
  displayValue: number;
  rolledNumber: number;
  markerValue: number | null;
  markerState?: DiceCubeMarkerState;
  isAnimating?: boolean;
  animationDirection?: DiceCubeAnimationDirection;
  reducedMotion?: boolean;
  labels: DiceBoardLabels;
  lastResults?: readonly DiceLastResultItem[];
  lastResultsAssets: DiceLastResultsAssets;
  lastResultsLabels: DiceLastResultsLabels;
  lastResultsAriaLabel: string;
  resultAnnouncement?: DiceResultAnnouncement;
  sliderValue: number;
  onSliderValueChange?: (value: number) => void;
  sliderDisabled?: boolean;
  direction?: DiceBoardDirection;
  showSliderValueLabel?: boolean;
  locale?: string;
  theatreMode?: boolean;
  overlay?: ReactNode;
  className?: string;
}
