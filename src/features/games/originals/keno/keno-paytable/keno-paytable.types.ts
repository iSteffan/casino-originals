export interface KenoPaytableItem {
  hits: number;
  multiplierLabel: string;
}

export interface KenoPaytableProps {
  items: readonly KenoPaytableItem[];
  reachedHits?: number | null;
  empty?: boolean;
  emptyLabel: string;
  hitsIconSrc: string;
  theatreMode?: boolean;
  reducedMotion?: boolean;
  className?: string;
  'aria-label': string;
  getItemAriaLabel: (item: KenoPaytableItem, reached: boolean) => string;
}
