import type { DoubleLastResultsLabels } from '#ui/features/games/originals/double/double-last-results/double-last-results.types';
import type { DoubleRoundStatusLabels } from '#ui/features/games/originals/double/double-round-status/double-round-status.types';
import type {
  DoubleHistoryItem,
  DoubleLast100Stats,
  DoublePhase,
  DoubleResultAnnouncement,
} from '#ui/features/games/originals/double/double.types';

export interface DoubleBoardProps {
  phase: DoublePhase;
  /** Epoch ms when the current phase ends (0 before the loop starts). */
  phaseEndsAt: number;
  bettingDurationMs: number;
  rollDurationMs: number;
  /** Strip slot (0-13) of the current roll, or the previous result while betting. */
  tileIndex: number;
  lastResults: readonly DoubleHistoryItem[];
  stats: DoubleLast100Stats;
  title?: string;
  statusLabels?: Partial<DoubleRoundStatusLabels>;
  lastResultsLabels?: Partial<DoubleLastResultsLabels>;
  lastResultsAriaLabel?: string;
  resultAnnouncement?: DoubleResultAnnouncement;
  reducedMotion?: boolean;
  theatreMode?: boolean;
  className?: string;
}
