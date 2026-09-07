'use client';

import type { ComponentProps } from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cva, type VariantProps } from 'class-variance-authority';

import { tooltipAnimationClasses } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';

export function TooltipProvider({
  delayDuration = 300,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

export function Tooltip(props: ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

export function TooltipTrigger(props: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

const tooltipContentVariants = cva(
  [
    'rounded-ds-xs p-ds-3 z-50 origin-[var(--radix-tooltip-content-transform-origin)] text-center',
    ...tooltipAnimationClasses,
  ],
  {
    variants: {
      color: {
        dark: 'bg-ds-surface-secondary text-ds-text-primary',
        light: 'bg-ds-gray-100 text-ds-gray-950 ds-shadow-overlay',
      },
      size: {
        sm: 'text-ds-xs tracking-ds-body-md font-ds-regular leading-ds-body-md',
        md: 'text-ds-sm font-ds-medium leading-ds-body-lg',
      },
      multiline: {
        true: 'max-w-80',
        false: 'whitespace-nowrap',
      },
    },
    defaultVariants: {
      color: 'dark',
      size: 'sm',
      multiline: false,
    },
  },
);

const tooltipArrowVariants = cva('', {
  variants: {
    color: {
      dark: 'fill-ds-surface-secondary',
      light: 'fill-ds-gray-100',
    },
  },
  defaultVariants: {
    color: 'dark',
  },
});

interface TooltipContentProps
  extends
    Omit<ComponentProps<typeof TooltipPrimitive.Content>, 'color'>,
    VariantProps<typeof tooltipContentVariants> {}

export function TooltipContent({
  className,
  children,
  color,
  size,
  multiline,
  sideOffset = 8,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(tooltipContentVariants({ color, size, multiline }), className)}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          width={16}
          height={8}
          className={cn(tooltipArrowVariants({ color }))}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
