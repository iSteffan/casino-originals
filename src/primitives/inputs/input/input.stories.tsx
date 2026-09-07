'use client';

import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from './input';

import { BetAmountInput } from '#ui/features/games/originals/shared/bet-amount-input/bet-amount-input';
import { RoundsInput } from '#ui/features/games/originals/shared/rounds-input/rounds-input';

const currencyIcon = (
  <img
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={20}
    height={20}
    className="rounded-ds-full size-5"
  />
);

const meta = {
  title: 'Primitives/Inputs/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

function parseAmount(value: string) {
  return Number.parseFloat(value.replace(/,/g, ''));
}

function parseRounds(value: string) {
  if (value === 'Infinity') return Number.POSITIVE_INFINITY;
  return Number.parseInt(value.replace(/,/g, ''), 10);
}

function OriginalsFields() {
  const [betAmount, setBetAmount] = useState('0.50');
  const [rounds, setRounds] = useState('0');
  const [errorsReady, setErrorsReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setErrorsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const parsedBet = parseAmount(betAmount);
  const betError =
    errorsReady && (!Number.isFinite(parsedBet) || parsedBet < 1)
      ? 'Minimum bet is 1.00'
      : undefined;

  const parsedRounds = parseRounds(rounds);
  const roundsError =
    errorsReady && (!Number.isFinite(parsedRounds) || parsedRounds < 1)
      ? 'Enter at least 1 round'
      : undefined;

  return (
    <div className="p-ds-6">
      <div className="w-[280px] max-w-full">
        <div className="ds-originals-config-shell h-auto lg:h-auto lg:!w-full lg:!max-w-full">
          <BetAmountInput
            label="Bet amount"
            value={betAmount}
            onChange={setBetAmount}
            conversionText="0.000145 BTC"
            currencyIcon={currencyIcon}
            error={betError}
            quickActions={[
              {
                label: '½',
                onClick: () => {
                  const next = parseAmount(betAmount);
                  if (!Number.isFinite(next)) return;
                  setBetAmount((next / 2).toFixed(2));
                },
              },
              {
                label: '2x',
                onClick: () => {
                  const next = parseAmount(betAmount);
                  if (!Number.isFinite(next)) return;
                  setBetAmount((next * 2).toFixed(2));
                },
              },
            ]}
          />
          <RoundsInput
            label="Rounds"
            value={rounds}
            onChange={setRounds}
            error={roundsError}
          />
          <BetAmountInput
            label="Bet amount"
            value="1,250.00"
            onChange={() => undefined}
            currencyIcon={currencyIcon}
            disabled
          />
        </div>
      </div>
    </div>
  );
}

export const OriginalsUsage: Story = {
  name: 'Originals usage',
  render: () => <OriginalsFields />,
};
