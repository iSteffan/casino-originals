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
    theatreLayoutActive,
  } = useAppLayoutState();

  useEffect(() => {
    closeMobileMenu();
  }, [activeGameHref, closeMobileMenu]);

  return (
    <div
      className="bg-ds-surface-primary flex h-dvh flex-col overflow-hidden"
      data-mobile-menu-open={mobileMenuOpen || undefined}
      data-theatre-mode={theatreModeActive || undefined}
      data-theatre-layout={theatreLayoutActive || undefined}
    >
      <AppHeader showMenuTrigger={showSidebar} sideMenuId={APP_SIDE_MENU_ID} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
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
        <div
          className={cn(
            'bg-ds-black flex min-h-0 min-w-0 flex-1 flex-col',
            theatreLayoutActive ? 'overflow-hidden' : 'overflow-y-auto',
          )}
        >
          {children}
        </div>
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
