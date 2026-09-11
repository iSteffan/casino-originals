import type { KenoGridCell } from './keno-grid.types';

export const KENO_GRID_COLUMNS = 8;
const KENO_GRID_ROWS = 5;
const KENO_GRID_CELL_COUNT = KENO_GRID_COLUMNS * KENO_GRID_ROWS;

export function getKenoGridCellCount(): number {
  return KENO_GRID_CELL_COUNT;
}

export function resolveKenoGridCells(cells: readonly KenoGridCell[]): KenoGridCell[] {
  const cellsByNumber = new Map(cells.map((cell) => [cell.number, cell]));

  return Array.from({ length: KENO_GRID_CELL_COUNT }, (_, index) => {
    const number = index + 1;
    const cell = cellsByNumber.get(number);

    if (!cell) {
      return {
        number,
        state: 'idle',
        disabled: false,
      };
    }

    return {
      number,
      state: cell.state ?? 'idle',
      disabled: cell.disabled,
    };
  });
}
