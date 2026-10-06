import type { RouletteCellAssets, RouletteCellChip } from '../roulette-cell/roulette-cell.types';

export type RouletteFieldCellId = string;

export interface RouletteFieldCellBets {
  chips: readonly RouletteCellChip[];
}

export interface RouletteFieldProps {
  assets: RouletteCellAssets;
  /** Map of cell id → chips currently on that spot. */
  bets?: Readonly<Record<string, RouletteFieldCellBets>>;
  /** Numbers highlighted via outside-bet hover. */
  highlightedNumbers?: readonly number[];
  /** Winning straight number (blinks). Use null when idle. */
  winningNumber?: number | null;
  disabled?: boolean;
  /** When true (desktop sidebar expanded), slightly caps fit-scale for breathing room (betstrike chat-open analogue). */
  compact?: boolean;
  onCellClick?: (cellId: string) => void;
  onHoverNumbersChange?: (numbers: readonly number[]) => void;
  className?: string;
  'aria-label'?: string;
}
