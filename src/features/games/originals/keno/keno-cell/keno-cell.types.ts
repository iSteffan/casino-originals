export type KenoCellState = 'idle' | 'selected' | 'win' | 'lose' | 'missed';

export interface KenoCellAssets {
  cell: string;
  selected: string;
  guessed: string;
  missed: string;
}

export interface KenoCellProps {
  number: number;
  state?: KenoCellState;
  assets: KenoCellAssets;
  disabled?: boolean;
  reducedMotion?: boolean;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}
