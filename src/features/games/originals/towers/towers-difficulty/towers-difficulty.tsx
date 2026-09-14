'use client';

import {
  OptionGroup,
  type OptionGroupOption,
} from '#ui/features/games/originals/shared/option-group/option-group';

export type TowersDifficultyOption = OptionGroupOption<number>;

export interface TowersDifficultyLabels {
  title: string;
}

export type TowersDifficultyProps = {
  value: number;
  onChange: (value: number) => void;
  options: readonly TowersDifficultyOption[];
  labels: TowersDifficultyLabels;
  disabled?: boolean;
};

export function TowersDifficulty({
  value,
  onChange,
  options,
  labels,
  disabled = false,
}: TowersDifficultyProps) {
  const accessibleOptions = options.map((option) => ({
    ...option,
    ariaLabel:
      option.ariaLabel ?? (typeof option.label === 'string' ? option.label : undefined),
  }));

  return (
    <OptionGroup
      label={labels.title}
      value={value}
      onChange={onChange}
      options={accessibleOptions}
      layout="row"
      truncateLabel
      disabled={disabled}
    />
  );
}
