export interface PlinkoLastResultItem {
  id: string;
  multiplier: number;
  color: string;
}

export interface PlinkoLastResultsProps {
  items: readonly PlinkoLastResultItem[];
  className?: string;
  'aria-label': string;
}
