'use client';

import { createContext, useContext } from 'react';

import type { TabsStyleContextValue } from './tabs.types';

const TabsStyleContext = createContext<TabsStyleContextValue>({
  color: 'default',
  orientation: 'horizontal',
  variant: 'bordered',
});

function useTabsStyle() {
  return useContext(TabsStyleContext);
}

export { TabsStyleContext, useTabsStyle };
