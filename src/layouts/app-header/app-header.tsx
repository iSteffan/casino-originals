'use client';

import { useAppLayoutState } from './app-layout-provider';

import { CASHIER_DROPDOWN_LABELS } from '#ui/features/cashier/cashier-balances';
import type {
  CashierBalance,
  CashierDropdownItem,
  CashierFormattedAmount,
} from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';
import { CashierDropdown } from '#ui/features/cashier/cashier-dropdown/cashier-dropdown';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import { Typography } from '#ui/primitives/foundation/typography/typography';

interface AppHeaderProps {
  className?: string;
  showMenuTrigger?: boolean;
  sideMenuId?: string;
  currentBalance: CashierBalance;
  currentFormattedAmount: CashierFormattedAmount;
  items: readonly CashierDropdownItem[];
  onSelectBalance: (balance: CashierBalance) => void;
  displayFiat: boolean;
  onDisplayFiatChange: (checked: boolean) => void;
}

export function AppHeader({
  className,
  showMenuTrigger = false,
  sideMenuId = 'app-side-menu',
  currentBalance,
  currentFormattedAmount,
  items,
  onSelectBalance,
  displayFiat,
  onDisplayFiatChange,
}: AppHeaderProps) {
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
        labels={CASHIER_DROPDOWN_LABELS}
      />
    </header>
  );
}

export type { AppHeaderProps };
