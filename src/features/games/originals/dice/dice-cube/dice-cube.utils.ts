import type { DiceCubeAnimationDirection, DiceCubeMarkerState } from './dice-cube.types';

export const DICE_CUBE_MARKER_BOTTOM = '16px';

export const DICE_CUBE_ANIMATION_DURATION_MS = 750;

export const DICE_CUBE_MARKER_STATES: DiceCubeMarkerState[] = ['play', 'win', 'lose'];

const DICE_MARKER_ICON: Record<DiceCubeMarkerState, string> = {
  play: '/img/games/dice/dice-play.svg',
  win: '/img/games/dice/dice-win.svg',
  lose: '/img/games/dice/dice-lose.svg',
};

export function getDiceMarkerIconSrc(state: DiceCubeMarkerState): string {
  return DICE_MARKER_ICON[state];
}

export function getDiceCubeMarkerTransform(markerValue: number): string {
  const position = Number.isFinite(markerValue) ? markerValue : 50;
  const clamped = Math.min(100, Math.max(0, position));

  return `translateX(${clamped}%)`;
}

export function getDiceCubeMarkerAnimationClass(
  direction: DiceCubeAnimationDirection,
): string {
  return direction === 'right'
    ? 'dice-cube-marker-animate-right'
    : 'dice-cube-marker-animate-left';
}

export function getDiceCubeShadowAnimationClass(
  direction: DiceCubeAnimationDirection,
): string {
  return direction === 'right'
    ? 'dice-cube-shadow-animate-right'
    : 'dice-cube-shadow-animate-left';
}
