import type {
  DoubleHistoryItem,
  DoubleLast100Stats,
} from '#ui/features/games/originals/double/double.types';

export interface DoubleLastResultsLabels {
  previousRolls: string;
  last100: string;
}

export interface DoubleLastResultsProps {
  /** Newest first; the legacy board shows the last 10 rolls. */
  items: readonly DoubleHistoryItem[];
  stats: DoubleLast100Stats;
  labels?: Partial<DoubleLastResultsLabels>;
  className?: string;
  'aria-label'?: string;
}
