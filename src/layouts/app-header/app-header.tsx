'use client';

import { APP_HEADER_CASHIER_LABELS } from './app-header-balances';
import { useAppHeaderState } from './app-header-provider';

import { CashierDropdown } from '#ui/features/cashier/cashier-dropdown/cashier-dropdown';
import { cn } from '#ui/lib/cn';
import { Typography } from '#ui/primitives/foundation/typography/typography';

interface AppHeaderProps {
  className?: string;
}

export function AppHeader({ className }: AppHeaderProps) {
  const {
    currentBalance,
    currentFormattedAmount,
    items,
    onSelectBalance,
    displayFiat,
    onDisplayFiatChange,
  } = useAppHeaderState();

  return (
    <header className={cn('ds-app-header', className)}>
      <Typography kind="white-16-700" as="p" className="m-0">
        Originals
      </Typography>
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
