export type DiceCubeMarkerState = 'play' | 'win' | 'lose';

export type DiceCubeAnimationDirection = 'left' | 'right';

export interface DiceCubeProps {
  markerValue: number;
  markerState?: DiceCubeMarkerState;
  isAnimating?: boolean;
  animationDirection?: DiceCubeAnimationDirection;
  reducedMotion?: boolean;
  markerClassName?: string;
  shadowClassName?: string;
}
