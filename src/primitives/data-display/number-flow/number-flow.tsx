'use client';

import type { ComponentProps } from 'react';

import RawNumberFlow from '@number-flow/react';

import { cn } from '#ui/lib/cn';

export function NumberFlow({
  className,
  ...props
}: ComponentProps<typeof RawNumberFlow>) {
  return (
    <RawNumberFlow
      data-slot="number-flow"
      className={cn('tabular-nums', className)}
      {...props}
    />
  );
}

export type NumberFlowProps = ComponentProps<typeof RawNumberFlow>;
