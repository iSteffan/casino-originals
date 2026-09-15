import type {
  CashierBalance,
  CashierCurrencyId,
  CashierFormattedAmount,
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
];

function createAmount(
  whole: string,
  fraction: string,
  prefix?: string,
): CashierFormattedAmount {
  return {
    prefix,
    whole,
    wholeValue: Number(whole.replaceAll(',', '')),
    fraction: `.${fraction}`,
    fractionValue: Number(fraction),
    fractionDigits: fraction.length,
  };
}

const CRYPTO_AMOUNTS: Record<CashierCurrencyId, CashierFormattedAmount> = {
  btc: createAmount('0', '02541000'),
  eth: createAmount('1', '20400000'),
  usdt: createAmount('1,250', '00000000'),
};

const FIAT_AMOUNTS: Record<CashierCurrencyId, CashierFormattedAmount> = {
  btc: createAmount('2,450', '00', '$'),
  eth: createAmount('3,890', '12', '$'),
  usdt: createAmount('1,250', '00', '$'),
};

export function getAppHeaderAmount(
  id: CashierCurrencyId,
  displayFiat: boolean,
): CashierFormattedAmount {
  return displayFiat ? FIAT_AMOUNTS[id] : CRYPTO_AMOUNTS[id];
}

export function formatAppHeaderAmount(amount: CashierFormattedAmount): string {
  return `${amount.prefix ?? ''}${amount.whole}${amount.fraction ?? ''}${amount.suffix ?? ''}`;
}

export const APP_HEADER_CASHIER_LABELS = {
  menu: 'Balances',
  displayInFiat: 'Display in Fiat',
};
