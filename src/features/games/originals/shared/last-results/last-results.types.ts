import type { ReactNode } from 'react';

/** Newest items appear at the start edge and push older items toward the end. */
export type LastResultsFlow = 'toward-end' | 'toward-start';

export interface LastResultsProps<T> {
  items: readonly T[];
  getItemKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Where new items enter and push the row in the opposite direction. */
  flow?: LastResultsFlow;
  /** Fixed slot at the entry edge (left for toward-end, right for toward-start). */
  lead?: ReactNode;
  /** Gap between items in pixels. */
  gap?: number;
  /** Slide duration in seconds. */
  duration?: number;
  className?: string;
  'aria-label'?: string;
}
