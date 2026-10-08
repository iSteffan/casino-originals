'use client';

import {
  OptionGroup,
  type OptionGroupOption,
} from '#ui/features/games/originals/shared/option-group/option-group';

export type PlinkoRiskOption = OptionGroupOption;

export interface PlinkoRiskLabels {
  title: string;
}

export type PlinkoRiskProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly PlinkoRiskOption[];
  labels: PlinkoRiskLabels;
  disabled?: boolean;
};

export function PlinkoRisk({
  value,
  onChange,
  options,
  labels,
  disabled = false,
}: PlinkoRiskProps) {
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
      truncateLabel
      disabled={disabled}
    />
  );
}
