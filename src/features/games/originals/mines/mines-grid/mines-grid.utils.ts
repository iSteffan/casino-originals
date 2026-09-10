import type { MinesGridCell, MinesGridSize } from './mines-grid.types';

export function getMinesGridCellCount(gridSize: MinesGridSize): number {
  return gridSize * gridSize;
}

export function resolveMinesGridCells(
  gridSize: MinesGridSize,
  cells: readonly MinesGridCell[],
): MinesGridCell[] {
  const cellCount = getMinesGridCellCount(gridSize);

  return Array.from({ length: cellCount }, (_, index) => {
    const cell = cells[index];
    if (!cell) {
      return {
        revealed: false,
        content: null,
        selected: false,
        cashoutLabel: null,
        disabled: false,
      };
    }

    return cell;
  });
}
