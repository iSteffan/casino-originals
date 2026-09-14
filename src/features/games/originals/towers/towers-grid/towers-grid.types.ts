import type {
  TowersCellAssets,
  TowersCellPotentialWin,
  TowersCellState,
} from '#ui/features/games/originals/towers/towers-cell/towers-cell.types';

export type TowersMultiplierHighlight = 'active' | 'passed' | 'upcoming';

export interface TowersGridMultiplier {
  label: string;
  highlight: TowersMultiplierHighlight;
}

export interface TowersGridCell {
  state: TowersCellState;
  amountLabel?: string;
  potentialWin?: TowersCellPotentialWin;
  disabled?: boolean;
  'aria-label': string;
}

export interface TowersGridRow {
  multiplier: TowersGridMultiplier;
  cells: TowersGridCell[];
}

export interface TowersResultAnnouncement {
  id: string;
  message: string;
}

export interface TowersGridProps {
  rows: TowersGridRow[];
  assets: TowersCellAssets;
  mobileAssets?: TowersCellAssets;
  theatreMode?: boolean;
  reducedMotion?: boolean;
  onCellClick?: (rowIndex: number, colIndex: number) => void;
  className?: string;
  'aria-label'?: string;
  /** Identifiable polite announcement for the latest settled round. */
  resultAnnouncement?: TowersResultAnnouncement;
}
