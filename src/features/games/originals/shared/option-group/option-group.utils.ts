import type { ReactNode } from 'react';

import type { OptionGroupLayout } from './option-group.types';

/** Max options in a single row before switching `layout="row"` to column. */
export const OPTION_GROUP_ROW_MAX = 5;

export function truncateOptionLabel(label: ReactNode) {
  if (typeof label !== 'string') return label;

  const trimmed = label.trim();
  if (!trimmed) return label;

  return trimmed.split(/\s+/)[0] ?? label;
}

export function resolveOptionGroupLayout(
  layout: OptionGroupLayout,
  optionCount: number,
  autoRowMax = 4,
  rowMax = OPTION_GROUP_ROW_MAX,
): Exclude<OptionGroupLayout, 'auto'> {
  if (layout === 'grid') return 'grid';
  if (layout === 'column') return 'column';

  const prefersRow = layout === 'row' ? true : optionCount <= autoRowMax;

  return prefersRow && optionCount <= rowMax ? 'row' : 'column';
}
