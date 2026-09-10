'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { MinesGrid, type MinesGridProps } from './mines-grid';
import type {
  MinesGridCell,
  MinesGridSize as MinesGridSizeValue,
} from './mines-grid.types';

import type { MinesCellContent } from '#ui/features/games/originals/mines/mines-cell/mines-cell.types';
import { MinesGridSize } from '#ui/features/games/originals/mines/mines-grid-size/mines-grid-size';
import {
  createMinesGridCells,
  getMinesStoryCellAriaLabel,
  minesStoryCellAssets,
} from '#ui/features/games/originals/mines/mines-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';

function updateCell(
  cells: readonly MinesGridCell[],
  index: number,
  patch: Partial<MinesGridCell>,
): MinesGridCell[] {
  return cells.map((cell, cellIndex) =>
    cellIndex === index
      ? {
          revealed: cell.revealed,
          content: cell.content,
          revealStyle: cell.revealStyle,
          selected: cell.selected,
          cashoutLabel: cell.cashoutLabel,
          disabled: cell.disabled,
          ...patch,
        }
      : cell,
  );
}

function MinesGridPlayground() {
  const [args, updateArgs] = useArgs<MinesGridProps>();
  const expectedCellCount = args.gridSize * args.gridSize;
  const cells =
    args.cells?.length === expectedCellCount
      ? args.cells
      : createMinesGridCells(args.gridSize);

  const setGridSize = (gridSize: number) => {
    const nextSize = gridSize as MinesGridSizeValue;
    updateArgs({
      gridSize: nextSize,
      cells: createMinesGridCells(nextSize),
    });
  };

  const revealCell = (index: number, content: MinesCellContent) => {
    const cell = cells[index];
    if (!cell || cell.revealed || cell.disabled || args.disabled) return;

    updateArgs({
      cells: updateCell(cells, index, {
        revealed: true,
        content,
        revealStyle: 'player',
        selected: false,
        cashoutLabel: content === 'safe' ? '1.24' : null,
      }),
    });
  };

  const reset = () => {
    updateArgs({
      cells: createMinesGridCells(args.gridSize),
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="w-full max-w-[280px]">
        <MinesGridSize
          label="Grid Size"
          value={args.gridSize}
          onChange={setGridSize}
          disabled={args.disabled}
        />
      </div>

      <MinesGrid
        gridSize={args.gridSize}
        cells={cells}
        assets={args.assets}
        reducedMotion={args.reducedMotion}
        selectionMode={args.selectionMode}
        disabled={args.disabled}
        aria-label={args['aria-label']}
        getCellAriaLabel={args.getCellAriaLabel}
        className={args.className}
        onCellClick={(index) => {
          revealCell(index, 'safe');
          args.onCellClick?.(index);
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
  title: 'Features/Games/Originals/Mines/Mines Grid',
  component: MinesGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['gridSize', 'selectionMode', 'disabled', 'reducedMotion'],
    },
  },
  argTypes: {
    gridSize: {
      control: { type: 'inline-radio' },
      options: [4, 5, 6, 8],
    },
    disabled: { control: { type: 'boolean' } },
    selectionMode: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    cells: { control: false },
    assets: { control: false },
    onCellClick: { control: false },
    className: { control: false },
    'aria-label': { control: false },
    getCellAriaLabel: { control: false },
  },
  args: {
    gridSize: 5,
    cells: createMinesGridCells(5),
    assets: minesStoryCellAssets,
    disabled: false,
    selectionMode: false,
    reducedMotion: false,
    'aria-label': 'Mines grid',
    getCellAriaLabel: getMinesStoryCellAriaLabel,
  },
} satisfies Meta<typeof MinesGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: MinesGridPlayground,
};

export const MixedReveal: Story = {
  args: {
    gridSize: 5,
    cells: createMinesGridCells(5).map((cell, index) => {
      if (index === 6) {
        return {
          revealed: true,
          content: 'safe',
          revealStyle: 'player',
          cashoutLabel: '1.24',
        };
      }
      if (index === 12) {
        return {
          revealed: true,
          content: 'mine',
          revealStyle: 'player',
        };
      }
      if (index === 7 || index === 8) {
        return {
          revealed: true,
          content: 'safe',
          revealStyle: 'board',
        };
      }
      if (index === 18) {
        return {
          revealed: false,
          selected: true,
        };
      }
      return cell;
    }),
  },
};
