'use client';

import { Children, type ComponentProps, type ReactNode } from 'react';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { triggerVariants } from './tabs.styles';
import { useTabsStyle } from './tabs-context';

import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function isRenderableText(value: ReactNode) {
  return (typeof value === 'string' && value.trim() !== '') || typeof value === 'number';
}

function TabsTriggerText({ children }: { children: ReactNode }) {
  return (
    <Typography kind="tertiary-14-500" as="span" className="text-current">
      {children}
    </Typography>
  );
}

function renderTabsTriggerChildren(children: ReactNode) {
  return Children.map(children, (child) =>
    isRenderableText(child) ? <TabsTriggerText>{child}</TabsTriggerText> : child,
  );
}

function TabsTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { color, orientation, variant } = useTabsStyle();

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(triggerVariants({ color, orientation, variant }), className)}
      {...props}
    >
      {renderTabsTriggerChildren(children)}
    </TabsPrimitive.Trigger>
  );
}

export { TabsTrigger };
