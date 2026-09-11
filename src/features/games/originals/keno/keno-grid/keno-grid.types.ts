import type {
  KenoCellAssets,
  KenoCellState,
} from '#ui/features/games/originals/keno/keno-cell/keno-cell.types';

export interface KenoGridCell {
  number: number;
  state?: KenoCellState;
  disabled?: boolean;
}

export interface KenoGridProps {
  cells: readonly KenoGridCell[];
  assets: KenoCellAssets;
  theatreMode?: boolean;
  reducedMotion?: boolean;
  disabled?: boolean;
  onCellClick?: (number: number) => void;
  className?: string;
  'aria-label': string;
  getCellAriaLabel: (cell: KenoGridCell) => string;
}
