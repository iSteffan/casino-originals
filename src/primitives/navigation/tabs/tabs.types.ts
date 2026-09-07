import type { ComponentProps } from 'react';

import type * as TabsPrimitive from '@radix-ui/react-tabs';

type TabsColor = 'default' | 'brand' | 'white' | 'glow';
type TabsVariant = 'bordered' | 'filled' | 'game';
type TabsOrientation = 'horizontal' | 'vertical';

interface TabsStyleContextValue {
  color: TabsColor;
  orientation: TabsOrientation;
  variant: TabsVariant;
}

interface TabsIndicatorState {
  left: number;
  width: number;
  top: number;
  height: number;
  visible: boolean;
}

interface TabsProps extends Omit<
  ComponentProps<typeof TabsPrimitive.Root>,
  'defaultValue' | 'onValueChange' | 'value'
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void | Promise<void>;
  values?: readonly string[];
}

export type {
  TabsColor,
  TabsIndicatorState,
  TabsOrientation,
  TabsProps,
  TabsStyleContextValue,
  TabsVariant,
};
