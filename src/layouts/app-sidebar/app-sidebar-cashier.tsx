'use client';

import { useEffect, useState } from 'react';

import BigNumber from 'bignumber.js';

import { CASHIER_BALANCES } from '#ui/features/cashier/cashier-balances';
import type { CashierCurrencyId } from '#ui/features/cashier/cashier-dropdown/cashier-dropdown.types';
import {
  cryptoToFiatAmount,
  fiatToCryptoAmount,
  WALLET_FIAT_FRACTION_DIGITS,
} from '#ui/features/wallet/wallet-balances';
import { cn } from '#ui/lib/cn';
import { Button } from '#ui/primitives/actions/button/button';
import { Image } from '#ui/primitives/data-display/image/image';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import { Typography } from '#ui/primitives/foundation/typography/typography';
import { Input, InputPrefix } from '#ui/primitives/inputs/input/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#ui/primitives/overlays/popover/popover';

function CurrencyIcon({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={16}
      height={16}
      showSkeleton={false}
      wrapperClassName="size-4 shrink-0 rounded-ds-full"
      className="size-full object-contain"
    />
  );
}

function fiatDraftFromCrypto(cryptoAmount: string, currencyId: CashierCurrencyId) {
  const fiat = cryptoToFiatAmount(cryptoAmount, currencyId);
  return fiat === '' ? '0' : fiat;
}

interface AppSidebarCashierProps {
  className?: string;
  balances: Record<CashierCurrencyId, string>;
  setBalance: (currencyId: CashierCurrencyId, cryptoAmount: string) => void;
}

export function AppSidebarCashier({
  className,
  balances,
  setBalance,
}: AppSidebarCashierProps) {
  const [currencyId, setCurrencyId] = useState<CashierCurrencyId>('btc');
  const [draft, setDraft] = useState(() =>
    fiatDraftFromCrypto(balances.btc, 'btc'),
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const selected =
    CASHIER_BALANCES.find((balance) => balance.id === currencyId) ??
    CASHIER_BALANCES[0];

  useEffect(() => {
    setDraft(fiatDraftFromCrypto(balances[currencyId], currencyId));
  }, [balances, currencyId]);

  const applyDraft = () => {
    const nextFiat = new BigNumber(draft.trim() || 0);
    if (!nextFiat.isFinite() || nextFiat.lt(0)) return;

    const normalizedFiat = nextFiat.toFixed(WALLET_FIAT_FRACTION_DIGITS);
    const cryptoConverted = fiatToCryptoAmount(normalizedFiat, currencyId);
    const cryptoAmount = cryptoConverted === '' ? '0' : cryptoConverted;

    setBalance(currencyId, cryptoAmount);
    setDraft(fiatDraftFromCrypto(cryptoAmount, currencyId));
  };

  const resetBalance = () => {
    setBalance(currencyId, '0');
    setDraft('0');
  };

  return (
    <div className={cn('ds-app-sidebar-cashier', className)}>
      <Typography
        kind="secondary-10-500"
        as="p"
        transform="uppercase"
        className="m-0 px-ds-1 tracking-[0.04em]"
      >
        Cashier
      </Typography>
      <Typography kind="tertiary-12-400" as="p" className="m-0 px-ds-1">
        Demo balance editor. Enter a USD amount for the selected currency; it is
        converted to crypto for bets in the header cashier.
      </Typography>

      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Currency ${selected.label}`}
            className="ds-app-sidebar-cashier-trigger focus-visible:ds-focus-ring"
          >
            <span className="gap-ds-2 flex min-w-0 items-center">
              <CurrencyIcon src={selected.icon} />
              <Typography kind="primary-14-500" as="span">
                {selected.label}
              </Typography>
            </span>
            <Icon
              name="chevron-down"
              size="md"
              color="none"
              className={cn(
                'text-ds-text-tertiary duration-ds-base ease-ds-standard shrink-0 transition-transform motion-reduce:transition-none',
                menuOpen ? 'rotate-180' : 'rotate-0',
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Select currency"
          align="start"
          className="flex w-[var(--radix-popover-trigger-width)] min-w-[12rem] flex-col overflow-hidden p-0"
        >
          <div className="px-ds-2 py-ds-2 flex flex-col">
            {CASHIER_BALANCES.map((balance) => {
              const isSelected = balance.id === currencyId;
              return (
                <button
                  key={balance.id}
                  type="button"
                  aria-pressed={isSelected}
                  data-selected={isSelected || undefined}
                  onClick={() => {
                    setCurrencyId(balance.id);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    'text-ds-text-secondary gap-ds-2 px-ds-2 py-ds-2 rounded-ds-xs focus-visible:ds-focus-ring flex h-auto w-full min-w-0 cursor-pointer items-center outline-none',
                    'hover:bg-ds-surface-secondary focus-visible:bg-ds-surface-secondary',
                    isSelected &&
                      'ds-button-ghost-glow hover:bg-transparent [&[data-selected]::before]:opacity-100',
                  )}
                >
                  <CurrencyIcon src={balance.icon} />
                  <Typography kind="primary-14-500" as="span">
                    {balance.label}
                  </Typography>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        aria-label={`${selected.label} balance in USD`}
        leading={<InputPrefix>$</InputPrefix>}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            applyDraft();
          }
        }}
      />

      <div className="ds-app-sidebar-cashier-actions">
        <Button type="button" variant="primary" size="md" className="flex-1" onClick={applyDraft}>
          Apply
        </Button>
        <Button type="button" variant="gray" size="md" className="flex-1" onClick={resetBalance}>
          Reset
        </Button>
      </div>
    </div>
  );
}

export type { AppSidebarCashierProps };

