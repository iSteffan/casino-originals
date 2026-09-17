'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import BigNumber from 'bignumber.js';

import {
  formatWalletAmount,
  formatWalletAmountLabel,
  INITIAL_WALLET_BALANCES,
  WALLET_FIAT_RATES,
} from './wallet-balances';

import type {
  CashierBalance,
  CashierCurrencyId,
  CashierDropdownItem,
  CashierFormattedAmount,
} from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';
import { APP_HEADER_BALANCES } from '#ui/layouts/app-header/app-header-balances';

interface WalletState {
  currencyId: CashierCurrencyId;
  displayFiat: boolean;
  balances: Record<CashierCurrencyId, string>;
  currentBalance: CashierBalance;
  currentFormattedAmount: CashierFormattedAmount;
  items: CashierDropdownItem[];
  /** USD per 1 crypto unit. */
  fiatRate: string;
  onSelectBalance: (balance: CashierBalance) => void;
  onDisplayFiatChange: (checked: boolean) => void;
  /** `cryptoAmount` is always in the selected currency's crypto units. */
  canAfford: (cryptoAmount: string) => boolean;
  applyRound: (input: {
    betAmount: string;
    payoutAmount: string;
  }) => boolean;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [currencyId, setCurrencyId] = useState<CashierCurrencyId>('btc');
  const [displayFiat, setDisplayFiat] = useState(false);
  const [balances, setBalances] = useState(INITIAL_WALLET_BALANCES);

  const currentBalance =
    APP_HEADER_BALANCES.find((balance) => balance.id === currencyId) ??
    APP_HEADER_BALANCES[0];

  const currentFormattedAmount = useMemo(
    () => formatWalletAmount(balances[currencyId], currencyId, displayFiat),
    [balances, currencyId, displayFiat],
  );

  const items = useMemo<CashierDropdownItem[]>(
    () =>
      APP_HEADER_BALANCES.map((balance) => ({
        balance,
        formattedAmount: formatWalletAmountLabel(
          formatWalletAmount(balances[balance.id], balance.id, displayFiat),
        ),
      })),
    [balances, displayFiat],
  );

  const fiatRate = WALLET_FIAT_RATES[currencyId];

  const onSelectBalance = useCallback((balance: CashierBalance) => {
    setCurrencyId(balance.id);
  }, []);

  const canAfford = useCallback(
    (cryptoAmount: string) => {
      const stake = new BigNumber(cryptoAmount);
      if (!stake.isFinite() || !stake.gt(0)) return false;
      return new BigNumber(balances[currencyId]).gte(stake);
    },
    [balances, currencyId],
  );

  const applyRound = useCallback(
    ({ betAmount, payoutAmount }: { betAmount: string; payoutAmount: string }) => {
      const stake = new BigNumber(betAmount);
      const payout = new BigNumber(payoutAmount || 0);
      if (!stake.isFinite() || !stake.gt(0)) return false;

      const available = new BigNumber(balances[currencyId]);
      if (available.lt(stake)) return false;

      setBalances((current) => ({
        ...current,
        [currencyId]: new BigNumber(current[currencyId])
          .minus(stake)
          .plus(payout.isFinite() ? payout : 0)
          .toFixed(),
      }));
      return true;
    },
    [balances, currencyId],
  );

  const value = useMemo<WalletState>(
    () => ({
      currencyId,
      displayFiat,
      balances,
      currentBalance,
      currentFormattedAmount,
      items,
      fiatRate,
      onSelectBalance,
      onDisplayFiatChange: setDisplayFiat,
      canAfford,
      applyRound,
    }),
    [
      applyRound,
      balances,
      canAfford,
      currencyId,
      currentBalance,
      currentFormattedAmount,
      displayFiat,
      fiatRate,
      items,
      onSelectBalance,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const value = useContext(WalletContext);
  if (!value) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return value;
}
