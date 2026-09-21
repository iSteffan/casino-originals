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

import { CASHIER_BALANCES } from '#ui/features/cashier/cashier-balances';
import type {
  CashierBalance,
  CashierCurrencyId,
  CashierDropdownItem,
  CashierFormattedAmount,
} from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';

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
  /** Sets the absolute crypto balance for a currency (demo cashier editor). */
  setBalance: (currencyId: CashierCurrencyId, cryptoAmount: string) => void;
}

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [currencyId, setCurrencyId] = useState<CashierCurrencyId>('btc');
  const [displayFiat, setDisplayFiat] = useState(false);
  const [balances, setBalances] = useState(INITIAL_WALLET_BALANCES);

  const currentBalance =
    CASHIER_BALANCES.find((balance) => balance.id === currencyId) ??
    CASHIER_BALANCES[0];

  const currentFormattedAmount = useMemo(
    () => formatWalletAmount(balances[currencyId], currencyId, displayFiat),
    [balances, currencyId, displayFiat],
  );

  const items = useMemo<CashierDropdownItem[]>(
    () =>
      CASHIER_BALANCES.map((balance) => ({
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

  const setBalance = useCallback(
    (targetCurrencyId: CashierCurrencyId, cryptoAmount: string) => {
      const next = new BigNumber(cryptoAmount || 0);
      if (!next.isFinite() || next.lt(0)) return;

      setBalances((current) => ({
        ...current,
        [targetCurrencyId]: next.toFixed(),
      }));
    },
    [],
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
      setBalance,
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
      setBalance,
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
