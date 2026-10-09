import type { DoubleOutcome, DoublePhase } from '#ui/features/games/originals/double/double.types';

export interface DoubleRoundStatusLabels {
  rollingIn: string;
  now: string;
  rolling: string;
  rolled: string;
}

export interface DoubleRoundStatusProps {
  phase: DoublePhase;
  /** Epoch ms when the current phase ends; 0 while the round loop has not started. */
  phaseEndsAt: number;
  /** Full betting countdown, shown before the first tick. */
  bettingDurationMs: number;
  /** Rolled tile, shown during FINISHED. */
  outcome: DoubleOutcome | null;
  labels?: Partial<DoubleRoundStatusLabels>;
  className?: string;
}

export interface DoubleRoundProgressProps {
  phase: DoublePhase;
  phaseEndsAt: number;
  bettingDurationMs: number;
  className?: string;
}
