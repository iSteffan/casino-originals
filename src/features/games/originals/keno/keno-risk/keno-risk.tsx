'use client';

import {
  OptionGroup,
  type OptionGroupOption,
} from '#ui/features/games/originals/shared/option-group/option-group';

export interface KenoRiskOption extends OptionGroupOption {
  shortLabel?: string;
}

export interface KenoRiskLabels {
  title: string;
}

export type KenoRiskProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly KenoRiskOption[];
  labels: KenoRiskLabels;
  disabled?: boolean;
};

export function KenoRisk({
  value,
  onChange,
  options,
  labels,
  disabled = false,
}: KenoRiskProps) {
  const displayOptions = options.map((option) => ({
    value: option.value,
    label: option.shortLabel ?? option.label,
    ariaLabel:
      option.ariaLabel ??
      (option.shortLabel && typeof option.label === 'string' ? option.label : undefined),
    adornment: option.adornment,
    disabled: option.disabled,
  }));

  return (
    <OptionGroup
      label={labels.title}
      value={value}
      onChange={onChange}
      options={displayOptions}
      layout="row"
      truncateLabel
      disabled={disabled}
    />
  );
}
