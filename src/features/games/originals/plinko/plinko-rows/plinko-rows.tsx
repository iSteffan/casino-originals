'use client';

import {
  OptionGroup,
  type OptionGroupOption,
} from '#ui/features/games/originals/shared/option-group/option-group';

export type PlinkoRowsOption = OptionGroupOption<number>;

export interface PlinkoRowsLabels {
  title: string;
}

export type PlinkoRowsProps = {
  value: number;
  onChange: (value: number) => void;
  options: readonly PlinkoRowsOption[];
  labels: PlinkoRowsLabels;
  disabled?: boolean;
};

export function PlinkoRows({
  value,
  onChange,
  options,
  labels,
  disabled = false,
}: PlinkoRowsProps) {
  const displayOptions = options.map((option) => ({
    value: option.value,
    label: option.label,
    ariaLabel:
      option.ariaLabel ?? (typeof option.label === 'string' ? option.label : undefined),
    adornment: option.adornment,
    disabled: option.disabled,
  }));

  return (
    <OptionGroup
      label={labels.title}
      value={value}
      onChange={onChange}
      options={displayOptions}
      layout="grid"
      columns={3}
      disabled={disabled}
    />
  );
}
