'use client';

import type { ReactNode } from 'react';

import { AppHeader } from './app-header';
import { AppHeaderProvider } from './app-header-provider';
import { AppLayoutProvider, useAppLayoutState } from './app-layout-provider';

import { AppSidebar } from '#ui/layouts/app-sidebar/app-sidebar';

interface AppHeaderShellProps {
  children: ReactNode;
  activeGameHref?: string;
  showSidebar?: boolean;
}

function AppHeaderShellFrame({
  children,
  activeGameHref,
  showSidebar = true,
}: AppHeaderShellProps) {
  const { effectiveSideMenuExpanded, toggleSideMenu } = useAppLayoutState();

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        {showSidebar ? (
          <AppSidebar
            activeHref={activeGameHref}
            expanded={effectiveSideMenuExpanded}
            onToggle={toggleSideMenu}
          />
        ) : null}
        <div className="min-h-0 min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function AppHeaderShell(props: AppHeaderShellProps) {
  return (
    <AppHeaderProvider>
      <AppLayoutProvider>
        <AppHeaderShellFrame {...props} />
      </AppLayoutProvider>
    </AppHeaderProvider>
  );
}

export type { AppHeaderShellProps };
