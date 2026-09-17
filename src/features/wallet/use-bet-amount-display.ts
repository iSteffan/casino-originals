'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

import BigNumber from 'bignumber.js';

import type { CashierCurrencyId } from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';
import {
  cryptoToFiatAmount,
  fiatToCryptoAmount,
  formatConversionText,
  WALLET_FIAT_FRACTION_DIGITS,
} from '#ui/features/wallet/wallet-balances';

interface UseBetAmountDisplayOptions {
  /** Stake stored in crypto units of the selected currency. */
  cryptoValue: string;
  currencyId: CashierCurrencyId;
  displayFiat: boolean;
  /** Persist crypto stake; return the accepted value (may be clamped). */
  commitCryptoValue: (cryptoAmount: string) => string;
}

/**
 * Payload parity: the bet field always shows the USD equivalent (2 dp).
 * Cashier "Display in Fiat" only toggles the conversion caption.
 */
export function useBetAmountDisplay({
  cryptoValue,
  currencyId,
  displayFiat,
  commitCryptoValue,
}: UseBetAmountDisplayOptions) {
  const [fiatValue, setFiatValue] = useState(() =>
    cryptoToFiatAmount(cryptoValue, currencyId),
  );
  const expectedCryptoEchoRef = useRef<string | null>(null);

  const formatCurrentFiat = useEffectEvent((value: string) =>
    cryptoToFiatAmount(value, currencyId),
  );

  // Sync fiat display only when the stored crypto stake changes externally
  // (½ / 2× / autobet / currency reset) — not on every typed keystroke echo.
  useEffect(() => {
    const expectedCryptoEcho = expectedCryptoEchoRef.current;
    expectedCryptoEchoRef.current = null;
    if (cryptoValue === expectedCryptoEcho) return;
    setFiatValue(formatCurrentFiat(cryptoValue));
  }, [cryptoValue, currencyId]);

  const onDisplayChange = (displayInput: string) => {
    setFiatValue(displayInput);

    const cryptoConverted = fiatToCryptoAmount(displayInput, currencyId);
    const nextCryptoValue =
      displayInput && cryptoConverted !== '' ? cryptoConverted : '0';
    const acceptedCryptoValue = commitCryptoValue(nextCryptoValue);
    expectedCryptoEchoRef.current = acceptedCryptoValue;

    if (acceptedCryptoValue !== nextCryptoValue) {
      setFiatValue(cryptoToFiatAmount(acceptedCryptoValue, currencyId));
    }
  };

  // Payload: displayFiat ON → $ caption; OFF → crypto caption.
  const conversionText = formatConversionText(cryptoValue, currencyId, !displayFiat);

  return {
    displayValue: fiatValue,
    onDisplayChange,
    conversionText:
      cryptoValue.trim() === '' || new BigNumber(cryptoValue).isZero()
        ? null
        : conversionText,
    precision: WALLET_FIAT_FRACTION_DIGITS,
  };
}
