'use client';

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { RouletteWheel } from './roulette-wheel';
import type { RouletteWheelProps } from './roulette-wheel.types';

import {
  ROULETTE_WHEEL_NUMBERS,
  type RouletteWheelNumber,
} from '#ui/features/games/originals/roulette/roulette.constants';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function randomWinner(): RouletteWheelNumber {
  const index = Math.floor(Math.random() * ROULETTE_WHEEL_NUMBERS.length);
  return ROULETTE_WHEEL_NUMBERS[index]!;
}

function RouletteWheelPlayground(args: RouletteWheelProps) {
  const [start, setStart] = useState(false);
  const [winningBet, setWinningBet] = useState<RouletteWheelNumber | '-1'>('-1');
  const [lastWinner, setLastWinner] = useState<string>('—');

  const spin = () => {
    const winner = randomWinner();
    setWinningBet(winner);
    setStart(true);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
      <RouletteWheel
        {...args}
        start={start}
        winningBet={winningBet}
        onSpinningEnd={(winner) => {
          setStart(false);
          setLastWinner(winner);
          args.onSpinningEnd?.(winner);
        }}
      />
      <Typography as="p" kind="secondary-12-400">
        Last result: {lastWinner}
      </Typography>
      <Button type="button" onClick={spin} disabled={start}>
        {start ? 'Spinning…' : 'Spin'}
      </Button>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Roulette/Roulette Wheel',
  component: RouletteWheel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
    controls: {
      include: ['automaticSpinning', 'spinLaps', 'spinDuration', 'isStopping'],
    },
  },
  argTypes: {
    automaticSpinning: { control: { type: 'boolean' } },
    spinLaps: { control: { type: 'number', min: 1, max: 10, step: 1 } },
    spinDuration: { control: { type: 'number', min: 1, max: 12, step: 0.5 } },
    isStopping: { control: { type: 'boolean' } },
    start: { control: false },
    winningBet: { control: false },
    onSpinningEnd: { control: false },
    layoutType: { control: false },
    spinEaseFunction: { control: false },
    className: { control: false },
  },
  args: {
    start: false,
    winningBet: '-1',
    automaticSpinning: true,
    spinLaps: 5,
    spinDuration: 7,
    spinEaseFunction: 'cubic-bezier(0.73, 0.03, 0.14, 0.96)',
    isStopping: false,
  },
  render: (args) => <RouletteWheelPlayground {...args} />,
} satisfies Meta<typeof RouletteWheel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const IdleNoAutoSpin: Story = {
  args: {
    automaticSpinning: false,
  },
};

export const FastSpin: Story = {
  args: {
    spinLaps: 2,
    spinDuration: 2,
  },
};
