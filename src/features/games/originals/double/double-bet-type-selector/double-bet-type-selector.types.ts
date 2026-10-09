import type { DoubleBetType } from '#ui/features/games/originals/double/double.types';

export interface DoubleBetTypeOption {
  type: DoubleBetType;
  label: string;
  /** Legacy `config-*-tile.svg` icon. */
  image: string;
}

export interface DoubleBetTypeSelectorProps {
  /** Selected picks in click order (max two colors + Joker). */
  value: readonly DoubleBetType[];
  onToggle: (type: DoubleBetType) => void;
  options: readonly DoubleBetTypeOption[];
  label?: string;
  disabled?: boolean;
  className?: string;
}
