export const MINES_GRID_SIZE_OPTIONS = [
  { value: 4, label: '16' },
  { value: 5, label: '25' },
  { value: 6, label: '36' },
  { value: 8, label: '64' },
] as const;

export type MinesGridSizeValue = (typeof MINES_GRID_SIZE_OPTIONS)[number]['value'];
