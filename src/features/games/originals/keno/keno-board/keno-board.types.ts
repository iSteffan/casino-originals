import type { ReactNode } from 'react';

import type { KenoCellAssets } from '#ui/features/games/originals/keno/keno-cell/keno-cell.types';
import type { KenoGridCell } from '#ui/features/games/originals/keno/keno-grid/keno-grid.types';
import type { KenoPaytableItem } from '#ui/features/games/originals/keno/keno-paytable/keno-paytable.types';

export interface KenoResultAnnouncement {
  id: string;
  message: string;
}

export interface KenoBoardPaytable {
  items: readonly KenoPaytableItem[];
  reachedHits?: number | null;
  empty?: boolean;
  emptyLabel: string;
  hitsIconSrc: string;
  'aria-label': string;
  getItemAriaLabel: (item: KenoPaytableItem, reached: boolean) => string;
}

export interface KenoBoardProps {
  cells: readonly KenoGridCell[];
  assets: KenoCellAssets;
  onCellClick?: (number: number) => void;
  gridAriaLabel: string;
  getCellAriaLabel: (cell: KenoGridCell) => string;
  paytable: KenoBoardPaytable;
  theatreMode?: boolean;
  reducedMotion?: boolean;
  disabled?: boolean;
  overlay?: ReactNode;
  /** Identifiable polite announcement for the latest settled round. */
  resultAnnouncement?: KenoResultAnnouncement;
  className?: string;
}
