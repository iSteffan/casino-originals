'use client';

import { APP_SIDEBAR_GAMES } from './app-sidebar-games';
import { AppSidebarCashier } from './app-sidebar-cashier';

import { SideMenuGameList } from '#ui/layouts/side-menu/side-menu-game-list';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Icon } from '#ui/primitives/foundation/icon/icon';

interface AppSidebarProps {
  activeHref?: string;
  expanded?: boolean;
  mobileOpen?: boolean;
  onToggle?: () => void;
  onMobileClose?: () => void;
  navigate?: boolean;
  id?: string;
  className?: string;
}

export function AppSidebar({
  activeHref,
  expanded = true,
  mobileOpen = false,
  onToggle,
  onMobileClose,
  navigate = false,
  id = 'app-side-menu',
  className,
}: AppSidebarProps) {
  const contentExpanded = expanded || mobileOpen;

  return (
    <>
      {onMobileClose ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          aria-label="Close side menu"
          onClick={onMobileClose}
          data-mobile-open={mobileOpen || undefined}
          className="ds-app-sidebar-backdrop"
        />
      ) : null}

      <aside
        id={id}
        data-slot="app-sidebar"
        data-expanded={contentExpanded || undefined}
        data-mobile-open={mobileOpen || undefined}
        role={mobileOpen ? 'dialog' : undefined}
        aria-modal={mobileOpen || undefined}
        aria-label="Site navigation"
        className={cn('ds-app-sidebar', className)}
      >
        <div className="ds-app-sidebar-content">
          <div className="ds-app-sidebar-toolbar" aria-hidden={!onToggle} />
          <div className="ds-app-sidebar-expanded" aria-hidden={!contentExpanded}>
            <div className="ds-app-sidebar-games">
              <SideMenuGameList
                title="Originals"
                items={APP_SIDEBAR_GAMES}
                activeHref={activeHref}
                navigate={navigate}
              />
            </div>
            <AppSidebarCashier />
          </div>
        </div>

        {onToggle ? (
          <Button
            variant="ghost"
            size="md"
            iconOnly
            onClick={onToggle}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-controls={id}
            aria-expanded={expanded}
            className="ds-app-sidebar-toggle"
          >
            <span className="ds-app-sidebar-toggle-icon">
              <Icon
                name="side-menu-collapse-open"
                color="none"
                className="ds-app-sidebar-toggle-icon-expanded"
              />
              <Icon
                name="side-menu-collapse-closed"
                color="none"
                className="ds-app-sidebar-toggle-icon-collapsed"
              />
            </span>
          </Button>
        ) : null}
      </aside>
    </>
  );
}

export type { AppSidebarProps };
