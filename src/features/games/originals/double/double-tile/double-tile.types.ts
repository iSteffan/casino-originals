import type { DoubleOutcome } from '#ui/features/games/originals/double/double.types';

/**
 * Legacy tile states: `dimmed` (dark blurred veil while betting / after the result),
 * `active` (bright while the strip rolls), `win` (win artwork + shake + glow).
 */
export type DoubleTileState = 'dimmed' | 'active' | 'win';

export interface DoubleTileProps {
  tile: DoubleOutcome;
  state?: DoubleTileState;
  reducedMotion?: boolean;
  className?: string;
}
