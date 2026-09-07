'use client';

import { useId } from 'react';

import { cn } from '#ui/lib/cn';
import { Toggle } from '#ui/primitives/controls/toggle/toggle';
import { Label } from '#ui/primitives/inputs/label/label';

export type TurboModeProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function TurboMode({
  checked,
  onCheckedChange,
  label = 'Turbo Mode',
  disabled = false,
  className,
}: TurboModeProps) {
  const toggleId = useId();
  const labelId = useId();

  return (
    <div className={cn('flex w-full shrink-0 items-center justify-between', className)}>
      <Label
        id={labelId}
        htmlFor={toggleId}
        className={cn(disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
      >
        {label}
      </Label>
      <Toggle
        id={toggleId}
        aria-labelledby={labelId}
        size="lg"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="ds-turbo-mode-toggle"
      />
    </div>
  );
}
