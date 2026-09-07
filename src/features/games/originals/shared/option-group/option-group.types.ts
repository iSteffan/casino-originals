import type { ReactNode } from 'react';

export type OptionGroupLayout = 'auto' | 'row' | 'column' | 'grid';

export interface OptionGroupOption<T extends string | number = string> {
  value: T;
  label: ReactNode;
  ariaLabel?: string;
  /** Optional render fn for content above the label (e.g. Towers difficulty indicators). Receives the item's selected state. */
  adornment?: (selected: boolean) => ReactNode;
  disabled?: boolean;
}

export interface OptionGroupProps<T extends string | number = string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: OptionGroupOption<T>[];
  disabled?: boolean;
  /**
   * `auto`: row when `options.length <= autoRowMax`, otherwise column.
   * `row`: single row up to 5 options, then column.
   * `grid`: fixed columns (Plinko).
   */
  layout?: OptionGroupLayout;
  /** Row/column breakpoint for `auto` layout. Defaults to `4` (Keno). Use `3` for Towers. */
  autoRowMax?: number;
  /** Row/column breakpoint for `row` layout. Defaults to `5`. */
  rowMax?: number;
  /** Used when `layout` is `grid`. Defaults to `3`. */
  columns?: number;
  /** Show only the first word of string labels (Keno/Plinko). */
  truncateLabel?: boolean;
  /** Active option grows wider in row layout (Mines grid size). */
  emphasizeActive?: boolean;
  className?: string;
  'aria-label'?: string;
}
