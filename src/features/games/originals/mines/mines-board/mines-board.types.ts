import type { ReactNode } from 'react';

import type { MinesCellAssets } from '#ui/features/games/originals/mines/mines-cell/mines-cell.types';
import type {
  MinesGridCell,
  MinesGridSize,
} from '#ui/features/games/originals/mines/mines-grid/mines-grid.types';

export interface MinesResultAnnouncement {
  id: string;
  message: string;
}

export interface MinesBoardProps {
  gridSize: MinesGridSize;
  cells: readonly MinesGridCell[];
  assets: MinesCellAssets;
  theatreMode?: boolean;
  reducedMotion?: boolean;
  selectionMode?: boolean;
  disabled?: boolean;
  onCellClick?: (index: number) => void;
  gridAriaLabel: string;
  getCellAriaLabel: (cell: MinesGridCell, row: number, column: number) => string;
  resultAnnouncement?: MinesResultAnnouncement;
  overlay?: ReactNode;
  className?: string;
  gridClassName?: string;
}
