'use client';

import type { ComponentProps } from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { floatingAnimationClasses, formControlFocusRing } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';

export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

export function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

export function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export function PopoverClose(props: ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

type PopoverAccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

type PopoverContentProps = ComponentProps<typeof PopoverPrimitive.Content> &
  PopoverAccessibleName;

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 8,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'rounded-ds-xs border-ds-border-tertiary bg-ds-surface-primary ds-shadow-overlay p-ds-4 z-50 border',
          'origin-[var(--radix-popover-content-transform-origin)]',
          formControlFocusRing,
          floatingAnimationClasses,
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
