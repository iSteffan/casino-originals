export type DiceLastResultColor = 'green' | 'red';

export interface DiceLastResultItem {
  id: string;
  value: number;
  color: DiceLastResultColor;
}

export interface DiceLastResultsLabels {
  green: string;
  red: string;
}

export interface DiceLastResultsAssets {
  green: string;
  red: string;
  lead: string;
}

export interface DiceLastResultsProps {
  items: readonly DiceLastResultItem[];
  assets: DiceLastResultsAssets;
  labels: DiceLastResultsLabels;
  className?: string;
  'aria-label': string;
}
