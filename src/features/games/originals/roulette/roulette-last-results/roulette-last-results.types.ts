export type RouletteLastResultColor = 'red' | 'black' | 'green';

export interface RouletteLastResultItem {
  id: string;
  number: number;
  color: RouletteLastResultColor;
}

export interface RouletteLastResultsAssets {
  red: string;
  black: string;
  green: string;
}

export interface RouletteLastResultsProps {
  items: readonly RouletteLastResultItem[];
  assets: RouletteLastResultsAssets;
  label?: string;
  className?: string;
  'aria-label'?: string;
}
