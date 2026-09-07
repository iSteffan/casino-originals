'use client';

import type { ComponentProps, ReactNode } from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import {
  formControlFocusRing,
  transitionColors,
  transitionTransform,
} from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';

const trackVariants = cva(
  [
    'rounded-ds-full group relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden',
    transitionColors,
    'data-[state=unchecked]:bg-ds-gray-700 data-[state=checked]:bg-ds-brand-secondary',
    formControlFocusRing,
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-ds-4 w-ds-7',
        md: 'h-ds-5 w-ds-9',
        lg: 'h-ds-6 w-ds-11',
        xl: 'h-ds-8 w-ds-15',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const thumbVariants = cva(
  [
    'bg-ds-gray-950 data-[state=checked]:bg-ds-brand-white left-ds-0-5 top-ds-0-5 rounded-ds-full pointer-events-none absolute',
    transitionTransform,
  ],
  {
    variants: {
      size: {
        sm: 'size-ds-3 data-[state=checked]:translate-x-ds-3',
        md: 'size-ds-4 data-[state=checked]:translate-x-ds-4',
        lg: 'size-ds-5 data-[state=checked]:translate-x-ds-5',
        xl: 'size-ds-7 data-[state=checked]:translate-x-ds-7',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const iconSlotClass =
  'pointer-events-none absolute top-1/2 flex -translate-y-1/2 group-data-[state=checked]:left-ds-1 group-data-[state=unchecked]:right-ds-1 group-data-[state=unchecked]:text-ds-gray-700 group-data-[state=checked]:text-ds-black';

interface ToggleProps
  extends
    ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof trackVariants> {
  icon?: ReactNode;
}

export function Toggle({ className, size = 'md', icon, ...props }: ToggleProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="toggle"
      className={cn(trackVariants({ size }), className)}
      {...props}
    >
      {icon && <span className={iconSlotClass}>{icon}</span>}
      <SwitchPrimitive.Thumb className={thumbVariants({ size })} />
    </SwitchPrimitive.Root>
  );
}
