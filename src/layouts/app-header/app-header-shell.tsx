'use client';

import type { ReactNode } from 'react';

import { AppHeader } from './app-header';
import { AppHeaderProvider } from './app-header-provider';
import { AppLayoutProvider, useAppLayoutState } from './app-layout-provider';

import { AppSidebar } from '#ui/layouts/app-sidebar/app-sidebar';
import { cn } from '#ui/lib/cn';

interface AppHeaderShellProps {
  children: ReactNode;
  activeGameHref?: string;
  showSidebar?: boolean;
  navigate?: boolean;
}

function AppHeaderShellFrame({
  children,
  activeGameHref,
  showSidebar = true,
  navigate = false,
}: AppHeaderShellProps) {
  const { effectiveSideMenuExpanded, toggleSideMenu, theatreModeActive } =
    useAppLayoutState();

  return (
    <div
      className={cn(
        'flex flex-col',
        theatreModeActive ? 'h-dvh overflow-hidden' : 'min-h-dvh',
      )}
    >
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        {showSidebar ? (
          <AppSidebar
            activeHref={activeGameHref}
            expanded={effectiveSideMenuExpanded}
            onToggle={toggleSideMenu}
            navigate={navigate}
          />
        ) : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
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
