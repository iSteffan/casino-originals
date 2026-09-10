import type {
  MinesCellAssets,
  MinesCellContent,
  MinesCellGridSize,
  MinesCellRevealStyle,
} from '#ui/features/games/originals/mines/mines-cell/mines-cell.types';

export type MinesGridSize = MinesCellGridSize;

export interface MinesGridCell {
  revealed: boolean;
  content?: MinesCellContent | null;
  revealStyle?: MinesCellRevealStyle;
  selected?: boolean;
  cashoutLabel?: string | null;
  disabled?: boolean;
}

export interface MinesGridProps {
  gridSize: MinesGridSize;
  cells: readonly MinesGridCell[];
  assets: MinesCellAssets;
  theatreMode?: boolean;
  reducedMotion?: boolean;
  selectionMode?: boolean;
  disabled?: boolean;
  onCellClick?: (index: number) => void;
  className?: string;
  'aria-label': string;
  getCellAriaLabel: (cell: MinesGridCell, row: number, column: number) => string;
}
