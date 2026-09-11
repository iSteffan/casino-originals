'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { KenoGrid, type KenoGridProps } from './keno-grid';
import type { KenoGridCell } from './keno-grid.types';

import {
  createKenoGridCells,
  getKenoGridCellCount,
  getKenoStoryCellAriaLabel,
  kenoStoryCellAssets,
  setKenoStoryCellState,
} from '#ui/features/games/originals/keno/keno-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';

const KENO_STORY_MAX_PICKS = 10;

function countSelected(cells: readonly KenoGridCell[]): number {
  return cells.filter((cell) => cell.state === 'selected').length;
}

function KenoGridPlayground() {
  const [args, updateArgs] = useArgs<KenoGridProps>();
  const expectedCellCount = getKenoGridCellCount();
  const cells =
    args.cells?.length === expectedCellCount ? args.cells : createKenoGridCells();

  const toggleCell = (number: number) => {
    const cell = cells.find((item) => item.number === number);
    if (!cell || cell.disabled || args.disabled) return;

    if (cell.state === 'selected') {
      updateArgs({ cells: setKenoStoryCellState(cells, number, 'idle') });
      return;
    }

    if (cell.state !== 'idle') return;
    if (countSelected(cells) >= KENO_STORY_MAX_PICKS) return;

    updateArgs({ cells: setKenoStoryCellState(cells, number, 'selected') });
  };

  const reset = () => {
    updateArgs({ cells: createKenoGridCells() });
  };

  return (
    <div
      className={
        args.theatreMode
          ? 'mx-auto flex w-full max-w-[1100px] flex-col gap-4'
          : 'mx-auto flex w-full max-w-xl flex-col gap-4'
      }
    >
      <KenoGrid
        cells={cells}
        assets={args.assets}
        theatreMode={args.theatreMode}
        reducedMotion={args.reducedMotion}
        disabled={args.disabled}
        aria-label={args['aria-label']}
        getCellAriaLabel={args.getCellAriaLabel}
        className={args.className}
        onCellClick={(number) => {
          toggleCell(number);
          args.onCellClick?.(number);
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Keno/Keno Grid',
  component: KenoGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['theatreMode', 'disabled', 'reducedMotion'],
    },
  },
  argTypes: {
    theatreMode: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    cells: { control: false },
    assets: { control: false },
    onCellClick: { control: false },
    className: { control: false },
    'aria-label': { control: false },
    getCellAriaLabel: { control: false },
  },
  args: {
    cells: createKenoGridCells(),
    assets: kenoStoryCellAssets,
    theatreMode: false,
    disabled: false,
    reducedMotion: false,
    'aria-label': 'Keno grid',
    getCellAriaLabel: getKenoStoryCellAriaLabel,
  },
} satisfies Meta<typeof KenoGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: KenoGridPlayground,
};

export const MixedReveal: Story = {
  args: {
    cells: createKenoGridCells().map((cell) => {
      if (cell.number === 6 || cell.number === 11) {
        return { number: cell.number, state: 'selected' };
      }
      if (cell.number === 17) {
        return { number: cell.number, state: 'win' };
      }
      if (cell.number === 18) {
        return { number: cell.number, state: 'lose' };
      }
      if (cell.number === 24) {
        return { number: cell.number, state: 'missed' };
      }
      return cell;
    }),
  },
};

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
  },
  render: KenoGridPlayground,
};
