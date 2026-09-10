'use client';

import { MINES_GRID_SIZE_OPTIONS } from '#ui/features/games/originals/mines/mines-config/mines-config.utils';
import {
  OptionGroup,
  type OptionGroupOption,
} from '#ui/features/games/originals/shared/option-group/option-group';

const defaultMinesGridOptions: OptionGroupOption<number>[] = MINES_GRID_SIZE_OPTIONS.map(
  ({ value, label }) => ({ value, label }),
);

export type MinesGridSizeProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options?: OptionGroupOption<number>[];
  disabled?: boolean;
};

export function MinesGridSize({
  label,
  value,
  onChange,
  options = defaultMinesGridOptions,
  disabled = false,
}: MinesGridSizeProps) {
  return (
    <OptionGroup
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      layout="row"
      emphasizeActive
      disabled={disabled}
    />
  );
}
