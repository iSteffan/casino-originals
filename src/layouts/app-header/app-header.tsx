'use client';

import { APP_HEADER_CASHIER_LABELS } from './app-header-balances';
import { useAppHeaderState } from './app-header-provider';
import { useAppLayoutState } from './app-layout-provider';

import { CashierDropdown } from '#ui/features/cashier/cashier-dropdown/cashier-dropdown';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import { Typography } from '#ui/primitives/foundation/typography/typography';

interface AppHeaderProps {
  className?: string;
  showMenuTrigger?: boolean;
  sideMenuId?: string;
}

export function AppHeader({
  className,
  showMenuTrigger = false,
  sideMenuId = 'app-side-menu',
}: AppHeaderProps) {
  const {
    currentBalance,
    currentFormattedAmount,
    items,
    onSelectBalance,
    displayFiat,
    onDisplayFiatChange,
  } = useAppHeaderState();
  const { mobileMenuOpen, toggleMobileMenu } = useAppLayoutState();

  return (
    <header className={cn('ds-app-header', className)}>
      <div className="ds-app-header-leading">
        {showMenuTrigger ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            iconOnly
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-controls={sideMenuId}
            aria-expanded={mobileMenuOpen}
            onClick={toggleMobileMenu}
            className="ds-app-header-menu-trigger"
          >
            <Icon name={mobileMenuOpen ? 'close' : 'burger'} size="xl" color="none" />
          </Button>
        ) : null}
        <Typography kind="white-16-700" as="p" className="m-0">
          Originals
        </Typography>
      </div>
      <CashierDropdown
        currentBalance={currentBalance}
        currentFormattedAmount={currentFormattedAmount}
        items={items}
        onSelectBalance={onSelectBalance}
        displayFiat={displayFiat}
        onDisplayFiatChange={onDisplayFiatChange}
        labels={APP_HEADER_CASHIER_LABELS}
      />
    </header>
  );
}

export type { AppHeaderProps };
