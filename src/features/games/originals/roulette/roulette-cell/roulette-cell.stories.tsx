'use client';

import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { RouletteCell } from './roulette-cell';
import type { RouletteCellProps } from './roulette-cell.types';

import {
  createRouletteStoryChips,
  rouletteStoryCellAssets,
} from '#ui/features/games/originals/roulette/roulette-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function CellFrame({
  label,
  widthClass,
  children,
}: {
  label: string;
  widthClass: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col items-center gap-2 ${widthClass}`}>
      <div className={`h-14 w-full md:h-[54px]`}>{children}</div>
      <Typography as="p" kind="secondary-10-400" className="m-0 w-full text-center">
        {label}
      </Typography>
    </div>
  );
}

function RouletteCellPlayground() {
  const [args, updateArgs] = useArgs<RouletteCellProps>();

  const placeChip = () => {
    const next = [
      ...(args.chips ?? []),
      ...createRouletteStoryChips([1], `play-${Date.now()}`),
    ].slice(-5);
    const totalLabel = next.length
      ? String(
          next.length *
            (Number.parseFloat(next[next.length - 1]?.amountLabel ?? '1') || 1),
        )
      : undefined;
    // Rebuild with cumulative label on top chip
    const rebuilt = createRouletteStoryChips(
      Array.from({ length: next.length }, () => 1),
      `play-${Date.now()}`,
    );
    updateArgs({ chips: rebuilt, highlighted: true });
    void totalLabel;
  };

  const clear = () => updateArgs({ chips: [], highlighted: false, winning: false });

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <div className="h-14 w-16 md:h-[54px] md:w-[54px]">
        <RouletteCell
          {...args}
          onClick={placeChip}
          onHoverChange={(hovered) => updateArgs({ highlighted: hovered || (args.chips?.length ?? 0) > 0 })}
        />
      </div>
      <Typography as="p" kind="secondary-12-400" className="text-center">
        Click the cell to stack chips. Use controls below for win/highlight states.
      </Typography>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={placeChip}>
          Add chip
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => updateArgs({ winning: !args.winning })}
        >
          Toggle win blink
        </Button>
        <Button type="button" variant="secondary" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Roulette/Roulette Cell',
  component: RouletteCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    appHeader: false,
    controls: {
      include: ['label', 'color', 'size', 'highlighted', 'winning', 'disabled', 'rotateLabel'],
    },
  },
  argTypes: {
    label: { control: { type: 'text' } },
    color: { control: { type: 'select' }, options: ['red', 'black', 'green'] },
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    highlighted: { control: { type: 'boolean' } },
    winning: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    rotateLabel: { control: { type: 'boolean' } },
    assets: { control: false },
    chips: { control: false },
    onClick: { control: false },
    onHoverChange: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  args: {
    label: '17',
    color: 'black',
    size: 'sm',
    assets: rouletteStoryCellAssets,
    highlighted: false,
    winning: false,
    disabled: false,
    rotateLabel: false,
    chips: [],
    'aria-label': 'Roulette cell 17',
  },
} satisfies Meta<typeof RouletteCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: RouletteCellPlayground,
};

export const AllColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 sm:gap-6">
      <CellFrame label="Red 7" widthClass="w-16">
        <RouletteCell label="7" color="red" assets={rouletteStoryCellAssets} />
      </CellFrame>
      <CellFrame label="Black 8" widthClass="w-16">
        <RouletteCell label="8" color="black" assets={rouletteStoryCellAssets} />
      </CellFrame>
      <CellFrame label="Green 0" widthClass="w-16">
        <RouletteCell label="0" color="green" assets={rouletteStoryCellAssets} />
      </CellFrame>
      <CellFrame label="Highlighted" widthClass="w-16">
        <RouletteCell
          label="19"
          color="red"
          assets={rouletteStoryCellAssets}
          highlighted
        />
      </CellFrame>
      <CellFrame label="With chips" widthClass="w-16">
        <RouletteCell
          label="12"
          color="red"
          assets={rouletteStoryCellAssets}
          chips={createRouletteStoryChips([1, 5, 10])}
        />
      </CellFrame>
      <CellFrame label="Winning blink" widthClass="w-16">
        <RouletteCell
          label="0"
          color="green"
          assets={rouletteStoryCellAssets}
          winning
        />
      </CellFrame>
      <CellFrame label="Dozen (lg)" widthClass="w-40">
        <RouletteCell
          label="1-12"
          color="black"
          size="lg"
          assets={rouletteStoryCellAssets}
        />
      </CellFrame>
      <CellFrame label="Red outside (md)" widthClass="w-28">
        <RouletteCell
          label="Red"
          color="red"
          size="md"
          assets={rouletteStoryCellAssets}
        />
      </CellFrame>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    chips: createRouletteStoryChips([5]),
  },
};
