'use client';

import type { ReactNode } from 'react';

import { AppHeader } from './app-header';
import { AppHeaderProvider } from './app-header-provider';

export function AppHeaderShell({ children }: { children: ReactNode }) {
  return (
    <AppHeaderProvider>
      <div className="flex min-h-dvh flex-col">
        <AppHeader />
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </AppHeaderProvider>
  );
}
