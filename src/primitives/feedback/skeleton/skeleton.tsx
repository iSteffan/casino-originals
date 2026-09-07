import type { ComponentProps } from 'react';

import { cn } from '#ui/lib/cn';

export function Skeleton({
  className,
  role,
  'aria-hidden': ariaHidden,
  'aria-label': ariaLabel,
  ...props
}: ComponentProps<'div'>) {
  const resolvedRole = role ?? (ariaHidden ? undefined : 'status');
  const resolvedAriaLabel = ariaHidden
    ? undefined
    : resolvedRole === 'status'
      ? (ariaLabel ?? 'Loading')
      : ariaLabel;

  return (
    <div
      data-slot="skeleton"
      role={resolvedRole}
      aria-hidden={ariaHidden}
      aria-label={resolvedAriaLabel}
      className={cn(
        'bg-ds-surface-tertiary rounded-ds-xs animate-pulse motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
