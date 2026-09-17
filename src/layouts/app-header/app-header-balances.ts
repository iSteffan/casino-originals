import type {
  CashierBalance,
  CashierCurrencyId,
} from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';

export const APP_HEADER_BALANCES: readonly CashierBalance[] = [
  {
    id: 'btc',
    label: 'BTC',
    icon: '/icon/payment-icons/bitcoin.svg',
  },
  {
    id: 'eth',
    label: 'ETH',
    icon: '/icon/payment-icons/ethereum.svg',
  },
  {
    id: 'usdt',
    label: 'USDT',
    icon: '/icon/payment-icons/usdt.svg',
  },
] as const satisfies readonly CashierBalance[];

export type { CashierCurrencyId };

export const APP_HEADER_CASHIER_LABELS = {
  menu: 'Balances',
  displayInFiat: 'Display in Fiat',
};
