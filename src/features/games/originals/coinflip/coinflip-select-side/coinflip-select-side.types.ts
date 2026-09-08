import type { ReactNode } from 'react';

import type { CoinflipSide } from '#ui/features/games/originals/coinflip/coinflip.types';

export type { CoinflipSide } from '#ui/features/games/originals/coinflip/coinflip.types';

export interface CoinflipSelectSideOption {
  value: CoinflipSide;
  label: string;
  visual: ReactNode;
}

export interface CoinflipSelectSideLabels {
  title: string;
}

export interface CoinflipSelectSideProps {
  value: CoinflipSide;
  onChange: (value: CoinflipSide) => void;
  options: readonly [CoinflipSelectSideOption, CoinflipSelectSideOption];
  labels: CoinflipSelectSideLabels;
  disabled?: boolean;
  className?: string;
}
