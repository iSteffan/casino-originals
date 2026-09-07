export interface RoundsInputLabels {
  infinity: string;
}

export const defaultRoundsInputLabels: RoundsInputLabels = {
  infinity: 'Infinity',
};

export interface RoundsInputProps {
  /** Integer string without grouping (for example `100`). Use `Infinity` for infinite mode. */
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  error?: string;
  /** Optional controller-owned maximum. When omitted, valid digit input is not clamped. */
  max?: number;
  placeholder?: string;
  labels?: RoundsInputLabels;
  className?: string;
}
