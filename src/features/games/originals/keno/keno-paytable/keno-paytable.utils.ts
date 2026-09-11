import type { KenoPaytableItem } from './keno-paytable.types';

export function getKenoPaytableReachedIndex(
  items: readonly KenoPaytableItem[],
  reachedHits: number | null | undefined,
): number {
  if (reachedHits == null) return -1;
  return items.findIndex((item) => item.hits === reachedHits);
}
