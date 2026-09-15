'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'storybook/preview-api';

import { CashierDropdown } from './cashier-dropdown';
import type { CashierCurrencyId } from './cashier-dropdown.types';

import {
  APP_HEADER_BALANCES,
  APP_HEADER_CASHIER_LABELS,
  formatAppHeaderAmount,
  getAppHeaderAmount,
} from '#ui/layouts/app-header/app-header-balances';

function CashierDropdownPlayground() {
  const [currencyId, setCurrencyId] = useState<CashierCurrencyId>('btc');
  const [displayFiat, setDisplayFiat] = useState(false);
  const currentBalance =
    APP_HEADER_BALANCES.find((balance) => balance.id === currencyId) ??
    APP_HEADER_BALANCES[0];

  return (
    <CashierDropdown
      currentBalance={currentBalance}
      currentFormattedAmount={getAppHeaderAmount(currentBalance.id, displayFiat)}
      items={APP_HEADER_BALANCES.map((balance) => ({
        balance,
        formattedAmount: formatAppHeaderAmount(
          getAppHeaderAmount(balance.id, displayFiat),
        ),
      }))}
      onSelectBalance={(balance) => setCurrencyId(balance.id)}
      displayFiat={displayFiat}
      onDisplayFiatChange={setDisplayFiat}
      labels={APP_HEADER_CASHIER_LABELS}
      defaultOpen
    />
  );
}

const meta = {
  title: 'Features/Cashier/Cashier Dropdown',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  render: CashierDropdownPlayground,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
