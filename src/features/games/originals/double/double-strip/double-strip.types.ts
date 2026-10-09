import type { DoublePhase } from '#ui/features/games/originals/double/double.types';

export interface DoubleStripProps {
  phase: DoublePhase;
  /** Index (0-13) of the rolled tile, or of the previous result while betting. */
  tileIndex: number;
  /** Duration of the RESOLVING roll; the strip eases onto the tile over this time. */
  rollDurationMs: number;
  reducedMotion?: boolean;
  className?: string;
}
