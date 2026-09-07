'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';

import type { TabsProps } from './tabs.types';
import { useTabsValue } from './use-tabs-value';

function Tabs({ values, value, defaultValue, onValueChange, ...props }: TabsProps) {
  const tabsValue = useTabsValue({
    value,
    defaultValue,
    values,
    onValueChange,
  });

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-interacted={tabsValue.hasInteracted || undefined}
      data-optimistic={tabsValue.isOptimistic || undefined}
      value={tabsValue.value}
      onValueChange={tabsValue.onValueChange}
      {...props}
    />
  );
}

export { Tabs };
