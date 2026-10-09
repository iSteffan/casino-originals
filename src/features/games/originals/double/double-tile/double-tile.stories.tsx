'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DoubleTile } from './double-tile';

import { DOUBLE_TILES } from '#ui/features/games/originals/double/double.constants';
import { getDoubleTile } from '#ui/features/games/originals/double/double-engine';

const UNIQUE_TILE_INDEXES = [1, 4, 0, 11, 2, 7];

const meta = {
  title: 'Features/Games/Originals/Double/Double Tile',
  component: DoubleTile,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  argTypes: {
    tile: { control: false },
    state: { control: { type: 'inline-radio' }, options: ['dimmed', 'active', 'win'] },
    reducedMotion: { control: { type: 'boolean' } },
    className: { control: false },
  },
  args: {
    tile: getDoubleTile(1),
    state: 'active',
    reducedMotion: false,
  },
} satisfies Meta<typeof DoubleTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Win: Story = {
  args: { tile: getDoubleTile(11), state: 'win' },
};

export const AllTiles: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['active', 'dimmed', 'win'] as const).map((state) => (
        <div key={state} className="flex gap-1">
          {UNIQUE_TILE_INDEXES.map((index) => (
            <DoubleTile
              key={`${state}-${index}`}
              tile={DOUBLE_TILES[index] ?? getDoubleTile(index)}
              state={state}
              reducedMotion={args.reducedMotion}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};
