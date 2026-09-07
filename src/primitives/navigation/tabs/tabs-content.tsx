'use client';

import type { ComponentProps } from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { formControlFocusRing } from '#ui/lib/class-presets';
import { cn } from '#ui/lib/cn';

interface TabsContentProps extends ComponentProps<typeof TabsPrimitive.Content> {
  animated?: boolean;
}

function TabsContent({ className, animated = true, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'rounded-ds-xs pt-4',
        formControlFocusRing,
        animated && 'ds-tabs-content-appear',
        className,
      )}
      {...props}
    />
  );
}

export { TabsContent };
