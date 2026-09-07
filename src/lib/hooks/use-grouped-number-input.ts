'use client';

import { useState } from 'react';

export interface GroupedNumberInputConfig {
  value: string;
  onChange: (value: string) => void;
  validate: (next: string) => boolean;
  toEditable: (value: string) => string;
  toGrouped: (value: string) => string;
  normalizeChange: (next: string) => string;
  normalizeBlur?: (source: string) => string;
  locked?: boolean;
}

export interface GroupedNumberInput {
  displayValue: string;
  effectiveValue: string;
  isFocused: boolean;
  handleFocus: () => void;
  handleBlur: () => void;
  handleChange: (next: string) => void;
}

export function useGroupedNumberInput(
  config: GroupedNumberInputConfig,
): GroupedNumberInput {
  const {
    value,
    onChange,
    validate,
    toEditable,
    toGrouped,
    normalizeChange,
    normalizeBlur,
    locked = false,
  } = config;

  const [localInput, setLocalInput] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Every keystroke emits `normalizeChange(localInput)` and the parent echoes it back as `value`.
  // When they diverge under focus the parent changed `value` itself (quick actions, autobet,
  // resets) — even with focus held by preventDefault — so show the incoming value, not stale input.
  const localMatchesValue = localInput !== null && normalizeChange(localInput) === value;

  let displayValue: string;
  if (locked) {
    displayValue = '';
  } else if (isFocused && localInput !== null) {
    displayValue = localMatchesValue ? localInput : toEditable(value);
  } else {
    displayValue = toGrouped(value);
  }

  const effectiveValue =
    isFocused && localInput !== null && normalizeChange(localInput) === value
      ? localInput
      : value;

  const handleFocus = () => {
    if (locked) return;
    setLocalInput(toEditable(value));
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (normalizeBlur && localInput !== null) {
      const source = normalizeChange(localInput) === value ? localInput : value;
      const canonical = normalizeBlur(source);
      if (canonical !== value) {
        onChange(canonical);
      }
    }
    setLocalInput(null);
    setIsFocused(false);
  };

  const handleChange = (next: string) => {
    if (locked || !validate(next)) return;
    const normalized = normalizeChange(next);
    setLocalInput(normalized);
    onChange(normalized);
  };

  return {
    displayValue,
    effectiveValue,
    isFocused,
    handleFocus,
    handleBlur,
    handleChange,
  };
}
