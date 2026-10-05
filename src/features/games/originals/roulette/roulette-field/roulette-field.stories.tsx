'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { RouletteField } from './roulette-field';
import type { RouletteFieldProps } from './roulette-field.types';
import { getRouletteFieldGroupNumbers } from './roulette-field.utils';

import {
  createRouletteStoryChips,
  formatRouletteChipTotal,
  rouletteStoryCellAssets,
} from '#ui/features/games/originals/roulette/roulette-story-helpers';
import { ROULETTE_CHIPS } from '#ui/features/games/originals/roulette/roulette.constants';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function placeChipOnCell(
  bets: NonNullable<RouletteFieldProps['bets']>,
  cellId: string,
  amount = 1,
): NonNullable<RouletteFieldProps['bets']> {
  const chip = ROULETTE_CHIPS.find((item) => item.value === amount) ?? ROULETTE_CHIPS[2]!;
  const existing = bets[cellId]?.chips ?? [];
  if (existing.length >= 5) return bets;

  const amounts = [...existing.map(() => amount), amount];
  // Prefer reading prior totals from amountLabel on last chip if present
  const priorTotal = Number.parseFloat(existing[existing.length - 1]?.amountLabel ?? '0');
  const base = Number.isFinite(priorTotal) && priorTotal > 0 ? priorTotal : existing.length * amount;
  const total = base + amount;
  const nextChips = [
    ...existing.map((item, index) => ({
      ...item,
      amountLabel: index === existing.length - 1 ? undefined : item.amountLabel,
    })),
    {
      id: `${cellId}-${Date.now()}-${existing.length}`,
      src: chip.src,
      amountLabel: formatRouletteChipTotal(total),
    },
  ];
  void amounts;
  return { ...bets, [cellId]: { chips: nextChips } };
}

function RouletteFieldPlayground() {
  const [args, updateArgs] = useArgs<RouletteFieldProps>();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 overflow-x-auto p-4">
      <Typography as="p" kind="secondary-12-400" className="text-center">
        Click cells to stack chips. Hover outside bets to highlight covered numbers.
      </Typography>
      <RouletteField
        assets={args.assets}
        bets={args.bets}
        highlightedNumbers={args.highlightedNumbers}
        winningNumber={args.winningNumber}
        disabled={args.disabled}
        onCellClick={(cellId) => {
          if (args.disabled) return;
          updateArgs({ bets: placeChipOnCell(args.bets ?? {}, cellId, 1) });
        }}
        onHoverNumbersChange={(numbers) => updateArgs({ highlightedNumbers: [...numbers] })}
      />
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            updateArgs({
              bets: {},
              winningNumber: null,
              highlightedNumbers: [],
            })
          }
        >
          Clear table
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            updateArgs({
              winningNumber: 17,
              highlightedNumbers: getRouletteFieldGroupNumbers('Red'),
            })
          }
        >
          Demo win on 17
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Roulette/Roulette Field',
  component: RouletteField,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    appHeader: false,
    controls: {
      include: ['disabled', 'winningNumber'],
    },
  },
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    winningNumber: { control: { type: 'number', min: 0, max: 36, step: 1 } },
    assets: { control: false },
    bets: { control: false },
    highlightedNumbers: { control: false },
    onCellClick: { control: false },
    onHoverNumbersChange: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  args: {
    assets: rouletteStoryCellAssets,
    bets: {
      'number-7': { chips: createRouletteStoryChips([1, 5]) },
      Red: { chips: createRouletteStoryChips([10]) },
    },
    highlightedNumbers: [],
    winningNumber: null,
    disabled: false,
  },
  render: RouletteFieldPlayground,
} satisfies Meta<typeof RouletteField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Empty: Story = {
  args: {
    bets: {},
  },
};

export const Winning: Story = {
  args: {
    winningNumber: 0,
    bets: {
      'number-0': { chips: createRouletteStoryChips([25]) },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
