'use client';

import { type ReactNode, useEffect } from 'react';

import { AppHeader } from './app-header';
import { AppHeaderProvider } from './app-header-provider';
import { AppLayoutProvider, useAppLayoutState } from './app-layout-provider';

import { AppSidebar } from '#ui/layouts/app-sidebar/app-sidebar';
import { cn } from '#ui/lib/cn';

const APP_SIDE_MENU_ID = 'app-side-menu';

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
  const {
    effectiveSideMenuExpanded,
    mobileMenuOpen,
    toggleSideMenu,
    closeMobileMenu,
    theatreModeActive,
  } = useAppLayoutState();

  useEffect(() => {
    closeMobileMenu();
  }, [activeGameHref, closeMobileMenu]);

  return (
    <div
      className={cn(
        'flex flex-col',
        theatreModeActive ? 'h-dvh overflow-hidden' : 'min-h-dvh',
      )}
      data-mobile-menu-open={mobileMenuOpen || undefined}
    >
      <AppHeader showMenuTrigger={showSidebar} sideMenuId={APP_SIDE_MENU_ID} />
      <div className="flex min-h-0 flex-1">
        {showSidebar ? (
          <AppSidebar
            id={APP_SIDE_MENU_ID}
            activeHref={activeGameHref}
            expanded={effectiveSideMenuExpanded}
            mobileOpen={mobileMenuOpen}
            onToggle={toggleSideMenu}
            onMobileClose={closeMobileMenu}
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
