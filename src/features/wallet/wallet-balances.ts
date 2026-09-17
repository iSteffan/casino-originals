import BigNumber from 'bignumber.js';

import type {
  CashierCurrencyId,
  CashierFormattedAmount,
} from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';

/** Crypto balances shown in the demo cashier (no backend). */
export const INITIAL_WALLET_BALANCES: Record<CashierCurrencyId, string> = {
  btc: '0.02541',
  eth: '1.204',
  usdt: '1250',
};

/** USD per 1 unit of crypto — keeps fiat toggle aligned with the old static demo. */
export const WALLET_FIAT_RATES: Record<CashierCurrencyId, string> = {
  btc: '96340',
  eth: '3231',
  usdt: '1',
};

export const WALLET_CRYPTO_FRACTION_DIGITS: Record<CashierCurrencyId, number> = {
  btc: 8,
  eth: 8,
  usdt: 8,
};

export const WALLET_FIAT_FRACTION_DIGITS = 2;

/** Soft-launch single-bet warning threshold (USD), matches Storybook / Payload. */
export const SINGLE_BET_THRESHOLD_USD = 5000;

function splitAmount(
  value: BigNumber,
  fractionDigits: number,
): { whole: string; fraction: string } {
  const fixed = value.toFixed(fractionDigits, BigNumber.ROUND_DOWN);
  const [wholeRaw, fractionRaw = ''] = fixed.split('.');
  const whole = Number(wholeRaw).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  });
  const fraction = fractionRaw.padEnd(fractionDigits, '0').slice(0, fractionDigits);
  return { whole, fraction };
}

export function formatWalletAmount(
  amount: string,
  currencyId: CashierCurrencyId,
  displayFiat: boolean,
): CashierFormattedAmount {
  const crypto = new BigNumber(amount);
  const safe = crypto.isFinite() ? crypto : new BigNumber(0);

  if (displayFiat) {
    const fiat = safe.times(WALLET_FIAT_RATES[currencyId]);
    const { whole, fraction } = splitAmount(fiat, WALLET_FIAT_FRACTION_DIGITS);
    return {
      prefix: '$',
      whole,
      wholeValue: Number(whole.replaceAll(',', '')),
      fraction: `.${fraction}`,
      fractionValue: Number(fraction),
      fractionDigits: WALLET_FIAT_FRACTION_DIGITS,
    };
  }

  const digits = WALLET_CRYPTO_FRACTION_DIGITS[currencyId];
  const { whole, fraction } = splitAmount(safe, digits);
  return {
    whole,
    wholeValue: Number(whole.replaceAll(',', '')),
    fraction: `.${fraction}`,
    fractionValue: Number(fraction),
    fractionDigits: digits,
  };
}

export function formatWalletAmountLabel(amount: CashierFormattedAmount): string {
  return `${amount.prefix ?? ''}${amount.whole}${amount.fraction ?? ''}${amount.suffix ?? ''}`;
}

/** Crypto → USD using the demo rate table. */
export function cryptoToFiatAmount(
  cryptoAmount: string,
  currencyId: CashierCurrencyId,
): string {
  const crypto = new BigNumber(cryptoAmount);
  const rate = new BigNumber(WALLET_FIAT_RATES[currencyId]);
  if (!crypto.isFinite() || crypto.lte(0) || !rate.isFinite() || rate.lte(0)) {
    return '';
  }
  return crypto.times(rate).toFixed(WALLET_FIAT_FRACTION_DIGITS, BigNumber.ROUND_DOWN);
}

/** USD → crypto using the demo rate table. */
export function fiatToCryptoAmount(
  fiatAmount: string,
  currencyId: CashierCurrencyId,
): string {
  const fiat = new BigNumber(fiatAmount);
  const rate = new BigNumber(WALLET_FIAT_RATES[currencyId]);
  if (!fiat.isFinite() || fiat.lte(0) || !rate.isFinite() || rate.lte(0)) {
    return '';
  }
  return fiat.div(rate).toFixed(WALLET_CRYPTO_FRACTION_DIGITS[currencyId]);
}

/**
 * Conversion caption under the bet field.
 * When the input shows fiat, caption is crypto — and the reverse.
 */
export function formatConversionText(
  cryptoAmount: string,
  currencyId: CashierCurrencyId,
  displayFiat: boolean,
): string {
  const crypto = new BigNumber(cryptoAmount);
  if (!crypto.isFinite() || crypto.lte(0)) {
    return displayFiat ? `0 ${currencyId.toUpperCase()}` : '$0.00';
  }

  if (displayFiat) {
    return `${crypto.toFixed(WALLET_CRYPTO_FRACTION_DIGITS[currencyId])} ${currencyId.toUpperCase()}`;
  }

  const fiat = crypto.times(WALLET_FIAT_RATES[currencyId]);
  return `$${fiat.toFixed(2)}`;
}

export function formatSignedAmountLabel(
  amount: string,
  currencyId: CashierCurrencyId,
  displayFiat: boolean,
): string {
  const value = new BigNumber(amount);
  if (!value.isFinite()) return '—';
  const abs = formatWalletAmountLabel(
    formatWalletAmount(value.abs().toFixed(), currencyId, displayFiat),
  );
  if (value.isZero()) return abs;
  return `${value.isNegative() ? '-' : '+'}${abs}`;
}

export function formatWinRate(wins: number, losses: number): string {
  const total = wins + losses;
  if (total <= 0) return '0%';
  return `${Math.round((wins / total) * 100)}%`;
}

export function getDefaultCryptoBetAmount(currencyId: CashierCurrencyId): string {
  switch (currencyId) {
    case 'btc':
      return '0.0001';
    case 'eth':
      return '0.01';
    case 'usdt':
      return '1';
  }
}

/** Stake floor rate so `rate * 0.01` ≈ $0.01 in crypto. */
export function getCryptoStakeFloorRate(currencyId: CashierCurrencyId): string {
  const rate = new BigNumber(WALLET_FIAT_RATES[currencyId]);
  if (!rate.isFinite() || rate.lte(0)) return '1';
  return new BigNumber(1).div(rate).toFixed();
}

export function getFiatStakeUsd(
  cryptoAmount: string,
  currencyId: CashierCurrencyId,
): BigNumber {
  const crypto = new BigNumber(cryptoAmount);
  const rate = new BigNumber(WALLET_FIAT_RATES[currencyId]);
  if (!crypto.isFinite() || !rate.isFinite()) return new BigNumber(0);
  return crypto.times(rate);
}
