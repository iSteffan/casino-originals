'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  APP_HEADER_BALANCES,
  formatAppHeaderAmount,
  getAppHeaderAmount,
} from './app-header-balances';

import type {
  CashierBalance,
  CashierCurrencyId,
  CashierDropdownItem,
  CashierFormattedAmount,
} from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';

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

export function AppHeaderProvider({ children }: { children: ReactNode }) {
  const [currencyId, setCurrencyId] = useState<CashierCurrencyId>('btc');
  const [displayFiat, setDisplayFiat] = useState(false);
  const currentBalance =
    APP_HEADER_BALANCES.find((balance) => balance.id === currencyId) ??
    APP_HEADER_BALANCES[0];
  const currentFormattedAmount = getAppHeaderAmount(currentBalance.id, displayFiat);
  const items = useMemo<CashierDropdownItem[]>(
    () =>
      APP_HEADER_BALANCES.map((balance) => ({
        balance,
        formattedAmount: formatAppHeaderAmount(
          getAppHeaderAmount(balance.id, displayFiat),
        ),
      })),
    [displayFiat],
  );
  const onSelectBalance = useCallback((balance: CashierBalance) => {
    setCurrencyId(balance.id);
  }, []);

  return (
    <AppHeaderContext.Provider
      value={{
        currencyId,
        displayFiat,
        currentBalance,
        currentFormattedAmount,
        items,
        onSelectBalance,
        onDisplayFiatChange: setDisplayFiat,
      }}
    >
      {children}
    </AppHeaderContext.Provider>
  );
}

export function useAppHeaderState(): AppHeaderState {
  const value = useContext(AppHeaderContext);
  if (!value) {
    throw new Error('useAppHeaderState must be used within AppHeaderProvider');
  }
  return value;
}
