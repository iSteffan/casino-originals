export type TowersCellState =
  | 'idle'
  | 'active'
  | 'safe'
  | 'trap'
  | 'revealed-safe'
  | 'revealed-trap'
  | 'auto-selected'
  | 'auto-selectable'
  | 'auto-planned'
  | 'auto-planned-active';

export interface TowersCellAssets {
  idle: string;
  active: string;
  safe: string;
  trap: string;
  bomb: string;
  revealedSafe: string;
  revealedTrap: string;
}

export interface TowersCellPotentialWin {
  whole: string;
  fraction: string;
}

export interface TowersCellProps {
  state?: TowersCellState;
  assets: TowersCellAssets;
  amountLabel?: string;
  potentialWin?: TowersCellPotentialWin;
  disabled?: boolean;
  reducedMotion?: boolean;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
  mobileAssets?: TowersCellAssets;
}
