import type { RouletteCellColor } from '../roulette.constants';

export type RouletteCellSize = 'sm' | 'md' | 'lg';

export interface RouletteCellChip {
  id: string;
  src: string;
  /** Shown centered on the topmost stacked chip once present. */
  amountLabel?: string;
}

export interface RouletteCellTileAssets {
  desktop: string;
  mobile: string;
}

export interface RouletteCellAssets {
  redSm: RouletteCellTileAssets;
  redMd: RouletteCellTileAssets;
  blackSm: RouletteCellTileAssets;
  blackMd: RouletteCellTileAssets;
  blackLg: RouletteCellTileAssets;
  green: RouletteCellTileAssets;
}

export interface RouletteCellProps {
  label: string;
  color: RouletteCellColor;
  size?: RouletteCellSize;
  assets: RouletteCellAssets;
  highlighted?: boolean;
  winning?: boolean;
  disabled?: boolean;
  /** Rotate label 90° (mobile outside-bet columns). */
  rotateLabel?: boolean;
  chips?: readonly RouletteCellChip[];
  onClick?: () => void;
  onHoverChange?: (hovered: boolean) => void;
  className?: string;
  'aria-label'?: string;
}
