'use client';

import type { ComponentProps } from 'react';

import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Icon } from '#ui/primitives/foundation/icon/icon';

type TheatreButtonProps = Omit<
  ComponentProps<typeof Button>,
  | 'aria-pressed'
  | 'asChild'
  | 'children'
  | 'iconOnly'
  | 'left'
  | 'loading'
  | 'loadingLabel'
  | 'onClick'
  | 'right'
  | 'size'
  | 'textKind'
  | 'type'
  | 'variant'
> & {
  isTheatreMode?: boolean;
  onTheatreToggle?: () => void;
  iconClassName?: string;
};

export function TheatreButton({
  isTheatreMode = false,
  onTheatreToggle,
  className,
  iconClassName,
  'aria-label': ariaLabel = 'Theatre mode',
  ...props
}: TheatreButtonProps) {
  return (
    <Button
      {...props}
      type="button"
      className={cn('hidden lg:inline-flex', className)}
      onClick={onTheatreToggle}
      size="md"
      variant={isTheatreMode ? 'white' : 'gray-muted'}
      aria-label={ariaLabel}
      aria-pressed={isTheatreMode}
    >
      <Icon
        name="wide"
        size="sm"
        color="none"
        className={cn(isTheatreMode ? 'text-ds-black' : 'text-ds-white', iconClassName)}
      />
    </Button>
  );
}

export type { TheatreButtonProps };
