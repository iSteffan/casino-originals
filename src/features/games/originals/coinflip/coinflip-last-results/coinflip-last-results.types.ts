import type { CoinflipSide } from '#ui/features/games/originals/coinflip/coinflip.types';

export type { CoinflipSide } from '#ui/features/games/originals/coinflip/coinflip.types';

export interface CoinflipLastResultItem {
  id: string;
  side: CoinflipSide;
}

export interface CoinflipLastResultsLabels {
  HEADS: string;
  TAILS: string;
}

export interface CoinflipLastResultsAssets {
  HEADS: string;
  TAILS: string;
  lead: string;
}

export interface CoinflipLastResultsProps {
  items: readonly CoinflipLastResultItem[];
  assets: CoinflipLastResultsAssets;
  labels: CoinflipLastResultsLabels;
  className?: string;
  'aria-label': string;
}
