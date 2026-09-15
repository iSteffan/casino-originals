'use client';

import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import { ColoredNumberFlow } from './colored-number-flow';
import type {
  CashierBalance,
  CashierDropdownProps,
} from './cashier-dropdown.types';

import { cn } from '#ui/lib/cn';
import { Toggle } from '#ui/primitives/controls/toggle/toggle';
import { Image } from '#ui/primitives/data-display/image/image';
import { Icon } from '#ui/primitives/foundation/icon/icon';
import { Typography } from '#ui/primitives/foundation/typography/typography';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#ui/primitives/overlays/popover/popover';

function TruncatingAmount({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const element = valueRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;

    const update = () => {
      setTruncated(element.scrollWidth > element.clientWidth + 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [label, children]);

  return (
    <span
      className={cn('ds-cashier-amount', className)}
      data-truncated={truncated || undefined}
      title={truncated ? label : undefined}
    >
      <span ref={valueRef} className="ds-cashier-amount-value">
        {children}
      </span>
      {truncated ? (
        <span aria-hidden className="ds-cashier-amount-ellipsis">
          …
        </span>
      ) : null}
    </span>
  );
}

function CurrencyIcon({ src, size }: { src: string; size: 16 | 20 }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      showSkeleton={false}
      wrapperClassName={cn(
        'ds-cashier-icon-shadow shrink-0 rounded-ds-full',
        size === 20 ? 'size-5' : 'size-4',
      )}
      className="size-full object-contain"
    />
  );
}

function CashierItem({
  balance,
  formattedAmount,
  isSelected,
  onSelect,
}: {
  balance: CashierBalance;
  formattedAmount: string;
  isSelected: boolean;
  onSelect: (balance: CashierBalance) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(balance)}
      data-selected={isSelected || undefined}
      className={cn(
        'text-ds-text-secondary gap-ds-2 px-ds-2 py-ds-2 rounded-ds-xs focus-visible:ds-focus-ring flex h-auto w-full min-w-0 cursor-pointer select-none items-center justify-between outline-none',
        'hover:bg-ds-surface-secondary focus-visible:bg-ds-surface-secondary',
        isSelected &&
          'ds-button-ghost-glow hover:bg-transparent [&[data-selected]::before]:opacity-100',
      )}
    >
      <div className="gap-ds-2 flex min-w-0 shrink-0 items-center">
        <CurrencyIcon src={balance.icon} size={16} />
        <Typography kind="primary-14-500" as="span">
          {balance.label}
        </Typography>
      </div>
      <div
        title={formattedAmount}
        className="bg-ds-surface-tertiary px-ds-1-5 rounded-ds-2xs flex h-5 min-w-0 items-center justify-end overflow-hidden"
      >
        <Typography
          kind={isSelected ? 'primary-12-500' : 'secondary-12-500'}
          as="span"
          wrap="truncate"
          className="min-w-0 tabular-nums"
        >
          {formattedAmount}
        </Typography>
      </div>
    </button>
  );
}

export function CashierDropdown({
  currentBalance,
  currentFormattedAmount,
  items,
  onSelectBalance,
  displayFiat,
  onDisplayFiatChange,
  labels,
  defaultOpen = false,
}: CashierDropdownProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const amountLabel = `${currentFormattedAmount.prefix ?? ''}${currentFormattedAmount.whole}${currentFormattedAmount.fraction ?? ''}${currentFormattedAmount.suffix ?? ''}`;

  return (
    <div data-slot="cashier" className="ds-cashier flex items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={amountLabel}
            className="gap-ds-2 px-ds-3 focus-visible:ds-focus-ring rounded-ds-2xs flex h-9 w-full min-w-0 cursor-pointer items-center bg-transparent outline-none"
          >
            <CurrencyIcon src={currentBalance.icon} size={20} />
            <span className="gap-ds-1 flex min-w-0 flex-1 items-center">
              <TruncatingAmount label={amountLabel} className="flex-1 tabular-nums">
                <ColoredNumberFlow amount={currentFormattedAmount} locales="en-US" />
              </TruncatingAmount>
              <Icon
                name="chevron-down"
                size="md"
                color="none"
                className={cn(
                  'text-ds-text-tertiary duration-ds-base ease-ds-standard shrink-0 transition-transform motion-reduce:transition-none',
                  isOpen ? 'rotate-180' : 'rotate-0',
                )}
              />
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          aria-label={labels.menu}
          align="end"
          className="flex w-[280px] max-w-[calc(100vw-var(--spacing-ds-8))] flex-col overflow-hidden p-0"
        >
          <div className="px-ds-2 py-ds-2 flex min-w-0 flex-col">
            {items.map((item) => (
              <CashierItem
                key={item.balance.id}
                balance={item.balance}
                formattedAmount={item.formattedAmount}
                isSelected={item.balance.id === currentBalance.id}
                onSelect={(balance) => {
                  onSelectBalance(balance);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
          <div className="bg-ds-border-tertiary h-px w-full" />
          <div className="px-ds-4 pt-ds-3 pb-ds-4 flex min-w-0 items-center justify-between gap-ds-2">
            <Typography kind="primary-14-500" as="span" wrap="truncate">
              {labels.displayInFiat}
            </Typography>
            <Toggle
              aria-label={labels.displayInFiat}
              checked={displayFiat}
              onCheckedChange={onDisplayFiatChange}
              size="md"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export type {
  CashierBalance,
  CashierCurrencyId,
  CashierDropdownItem,
  CashierDropdownProps,
  CashierFormattedAmount,
} from './cashier-dropdown.types';
