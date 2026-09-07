import type { ReactNode } from 'react';

export interface BetAmountQuickAction {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface BetAmountThresholdWarningContent {
  title: string;
  description: string;
}

export interface BetAmountInputTooltip {
  label: string;
  title: string;
  description: string;
}

export interface BetAmountInputProps {
  /** Normalized decimal string without grouping (for example `1000.00`). */
  value: string;
  onChange: (value: string) => void;
  label: string;
  tooltip?: BetAmountInputTooltip;
  /** Secondary amount in the label row (for example crypto equivalent). */
  conversionText?: string | null;
  currencyIcon?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  /** Decimal places for display formatting. Defaults to `2`. */
  precision?: number;
  inputMode?: 'decimal' | 'numeric';
  quickActions?: BetAmountQuickAction[];
  /** Caller decides visibility by passing content or `null`. */
  thresholdWarning?: BetAmountThresholdWarningContent | null;
  className?: string;
}
