'use client';

import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Icon } from '#ui/primitives/foundation/icon/icon';

export interface RoundsInputInfiniteToggleProps {
  isActive: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}

export function RoundsInputInfiniteToggle({
  isActive,
  disabled = false,
  label,
  onClick,
}: RoundsInputInfiniteToggleProps) {
  return (
    <Button
      type="button"
      variant="link-white"
      iconOnly
      size="md"
      disabled={disabled}
      aria-pressed={isActive}
      aria-label={label}
      className={cn(
        'h-6 w-6 p-0',
        'disabled:text-ds-text-tertiary disabled:opacity-100',
        isActive && !disabled && 'text-ds-text-primary',
      )}
      onClick={onClick}
    >
      <Icon name="infinite" color="none" className="size-5" />
    </Button>
  );
}
