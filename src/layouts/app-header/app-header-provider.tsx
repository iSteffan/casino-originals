'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type {
  CashierBalance,
  CashierCurrencyId,
  CashierDropdownItem,
  CashierFormattedAmount,
} from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';
import { useWallet } from '#ui/features/wallet/wallet-provider';

interface AppHeaderState {
  currencyId: CashierCurrencyId;
  displayFiat: boolean;
  currentBalance: CashierBalance;
  currentFormattedAmount: CashierFormattedAmount;
  items: CashierDropdownItem[];
  onSelectBalance: (balance: CashierBalance) => void;
  onDisplayFiatChange: (checked: boolean) => void;
}

const AppHeaderContext = createContext<AppHeaderState | null>(null);

/** Adapts the local demo wallet into the header cashier props. */
export function AppHeaderProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();

  const value = useMemo<AppHeaderState>(
    () => ({
      currencyId: wallet.currencyId,
      displayFiat: wallet.displayFiat,
      currentBalance: wallet.currentBalance,
      currentFormattedAmount: wallet.currentFormattedAmount,
      items: wallet.items,
      onSelectBalance: wallet.onSelectBalance,
      onDisplayFiatChange: wallet.onDisplayFiatChange,
    }),
    [wallet],
  );

  return (
    <AppHeaderContext.Provider value={value}>{children}</AppHeaderContext.Provider>
  );
}

export function useAppHeaderState(): AppHeaderState {
  const value = useContext(AppHeaderContext);
  if (!value) {
    throw new Error('useAppHeaderState must be used within AppHeaderProvider');
  }
  return value;
}
