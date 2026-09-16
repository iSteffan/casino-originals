'use client';

import { APP_SIDEBAR_GAMES } from './app-sidebar-games';

import { SideMenuGameList } from '#ui/layouts/side-menu/side-menu-game-list';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Icon } from '#ui/primitives/foundation/icon/icon';

interface AppSidebarProps {
  activeHref?: string;
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function AppSidebar({
  activeHref,
  expanded = true,
  onToggle,
  className,
}: AppSidebarProps) {
  return (
    <aside
      data-slot="app-sidebar"
      data-expanded={expanded || undefined}
      className={cn('ds-app-sidebar', className)}
    >
      <div className="ds-app-sidebar-content">
        <div className="ds-app-sidebar-toolbar" aria-hidden={!onToggle} />
        <div className="ds-app-sidebar-games" aria-hidden={!expanded}>
          <SideMenuGameList
            title="Originals"
            items={APP_SIDEBAR_GAMES}
            activeHref={activeHref}
          />
        </div>
      </div>

      {onToggle ? (
        <Button
          variant="ghost"
          size="md"
          iconOnly
          onClick={onToggle}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
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
  );
}

export type { AppSidebarProps };
