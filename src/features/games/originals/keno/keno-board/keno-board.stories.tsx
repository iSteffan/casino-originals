'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { KenoBoard } from './keno-board';
import type { KenoBoardProps } from './keno-board.types';

import {
  countKenoStoryPickedCells,
  createKenoGridCells,
  createKenoStoryPaytableItems,
  getKenoGridCellCount,
  getKenoStoryCellAriaLabel,
  getKenoStoryPaytableItemAriaLabel,
  kenoStoryCellAssets,
  kenoStoryHitsIconSrc,
  kenoStoryPaytableEmptyLabel,
  toggleKenoStoryCell,
} from '#ui/features/games/originals/keno/keno-story-helpers';

function KenoBoardPlayground(args: KenoBoardProps) {
  const [, updateArgs] = useArgs<KenoBoardProps>();
  const expectedCellCount = getKenoGridCellCount();
  const cells =
    args.cells?.length === expectedCellCount ? args.cells : createKenoGridCells();
  const pickedCount = countKenoStoryPickedCells(cells);

  return (
    <div
      className={
        args.theatreMode
          ? 'mx-auto flex h-[80vh] w-full max-w-[1100px] flex-col'
          : 'mx-auto flex w-full max-w-xl flex-col'
      }
    >
      <KenoBoard
        cells={cells}
        assets={args.assets}
        theatreMode={args.theatreMode}
        reducedMotion={args.reducedMotion}
        disabled={args.disabled}
        overlay={args.overlay}
        resultAnnouncement={args.resultAnnouncement}
        gridAriaLabel={args.gridAriaLabel}
        getCellAriaLabel={args.getCellAriaLabel}
        paytable={{
          items: createKenoStoryPaytableItems(Math.max(pickedCount, 1)),
          reachedHits: args.paytable.reachedHits,
          empty: pickedCount === 0,
          emptyLabel: args.paytable.emptyLabel,
          hitsIconSrc: args.paytable.hitsIconSrc,
          'aria-label': args.paytable['aria-label'],
          getItemAriaLabel: args.paytable.getItemAriaLabel,
        }}
        className={args.className}
        onCellClick={(number) => {
          if (args.disabled) return;
          updateArgs({ cells: toggleKenoStoryCell(cells, number) });
          args.onCellClick?.(number);
        }}
      />
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Keno/Keno Board',
  component: KenoBoard,
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
    overlay: { control: false },
    resultAnnouncement: { control: false },
    gridAriaLabel: { control: false },
    getCellAriaLabel: { control: false },
    paytable: { control: false },
    className: { control: false },
  },
  args: {
    cells: createKenoGridCells(),
    assets: kenoStoryCellAssets,
    theatreMode: false,
    reducedMotion: false,
    disabled: false,
    gridAriaLabel: 'Keno grid',
    getCellAriaLabel: getKenoStoryCellAriaLabel,
    paytable: {
      items: createKenoStoryPaytableItems(1),
      reachedHits: null,
      empty: true,
      emptyLabel: kenoStoryPaytableEmptyLabel,
      hitsIconSrc: kenoStoryHitsIconSrc,
      'aria-label': 'Keno paytable',
      getItemAriaLabel: getKenoStoryPaytableItemAriaLabel,
    },
  },
} satisfies Meta<typeof KenoBoard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: KenoBoardPlayground,
};

export const TheatreMode: Story = {
  args: {
    theatreMode: true,
  },
  render: KenoBoardPlayground,
};

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
  },
  render: KenoBoardPlayground,
};
