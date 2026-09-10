'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { MinesBoard } from './mines-board';
import type { MinesBoardProps } from './mines-board.types';

import {
  createMinesGridCells,
  getMinesGridCellCount,
  getMinesStoryCellAriaLabel,
  minesStoryCellAssets,
} from '#ui/features/games/originals/mines/mines-story-helpers';

function MinesBoardPlayground(args: MinesBoardProps) {
  const [, updateArgs] = useArgs<MinesBoardProps>();
  const cells =
    args.cells.length === getMinesGridCellCount(args.gridSize)
      ? args.cells
      : createMinesGridCells(args.gridSize);

  return (
    <div
      className={
        args.theatreMode
          ? 'mx-auto flex h-[80vh] w-full max-w-[1100px] flex-col'
          : 'mx-auto flex w-full max-w-xl flex-col'
      }
    >
      <MinesBoard
        gridSize={args.gridSize}
        cells={cells}
        assets={args.assets}
        theatreMode={args.theatreMode}
        reducedMotion={args.reducedMotion}
        selectionMode={args.selectionMode}
        disabled={args.disabled}
        gridAriaLabel={args.gridAriaLabel}
        getCellAriaLabel={args.getCellAriaLabel}
        resultAnnouncement={args.resultAnnouncement}
        overlay={args.overlay}
        className={args.className}
        gridClassName={args.gridClassName}
        onCellClick={(index) => {
          if (args.disabled) return;

          updateArgs({
            cells: cells.map((cell, cellIndex) => {
              if (cellIndex !== index || cell.revealed || cell.disabled) return cell;

              if (args.selectionMode) {
                return { ...cell, selected: !cell.selected };
              }

              return {
                ...cell,
                revealed: true,
                content: 'safe',
                revealStyle: 'player',
                selected: false,
                cashoutLabel: '1.24',
              };
            }),
          });
          args.onCellClick?.(index);
        }}
      />
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Mines/Mines Board',
  component: MinesBoard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['gridSize', 'theatreMode', 'selectionMode', 'disabled', 'reducedMotion'],
    },
  },
  argTypes: {
    gridSize: {
      control: { type: 'inline-radio' },
      options: [4, 5, 6, 8],
    },
    theatreMode: { control: { type: 'boolean' } },
    selectionMode: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    cells: { control: false },
    assets: { control: false },
    onCellClick: { control: false },
    gridAriaLabel: { control: false },
    getCellAriaLabel: { control: false },
    resultAnnouncement: { control: false },
    overlay: { control: false },
    className: { control: false },
    gridClassName: { control: false },
  },
  args: {
    gridSize: 5,
    cells: createMinesGridCells(5),
    assets: minesStoryCellAssets,
    theatreMode: false,
    reducedMotion: false,
    selectionMode: false,
    disabled: false,
    gridAriaLabel: 'Mines board',
    getCellAriaLabel: getMinesStoryCellAriaLabel,
  },
} satisfies Meta<typeof MinesBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: MinesBoardPlayground,
};

export const AutoPick: Story = {
  args: {
    selectionMode: true,
  },
  render: MinesBoardPlayground,
};

export const TheatreMode: Story = {
  args: {
    theatreMode: true,
  },
  render: MinesBoardPlayground,
};

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
  },
  render: MinesBoardPlayground,
};
