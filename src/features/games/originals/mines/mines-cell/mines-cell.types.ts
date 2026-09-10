export type MinesCellContent = 'safe' | 'mine';

/** Player-hit tiles use full art + icon; board-wide reveal uses muted tiles only. */
export type MinesCellRevealStyle = 'player' | 'board';

export type MinesCellGridSize = 4 | 5 | 6 | 8;

export interface MinesCellAssets {
  tile: string;
  logo: string;
  win: string;
  winTile: string;
  lose: string;
  loseTile: string;
  gold: string;
  mine: string;
}

export interface MinesCellProps {
  /** Whether the tile face is revealed. Flip choreography runs on false → true. */
  revealed: boolean;
  /** What is under the tile when revealed. */
  content?: MinesCellContent | null;
  revealStyle?: MinesCellRevealStyle;
  /** Auto-bet pick overlay while the tile is still hidden. */
  selected?: boolean;
  /** Exposes auto-bet picks as pressed/unpressed toggle buttons. */
  selectionMode?: boolean;
  /** Formatted cashout amount without a leading "+". */
  cashoutLabel?: string | null;
  gridSize?: MinesCellGridSize;
  assets: MinesCellAssets;
  disabled?: boolean;
  onClick?: () => void;
  /** Skip the flip and show the revealed face immediately. */
  reducedMotion?: boolean;
  className?: string;
  'aria-label'?: string;
}
