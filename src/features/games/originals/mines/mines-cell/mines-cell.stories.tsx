'use client';

import { type ReactNode, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { MinesCell, type MinesCellProps } from './mines-cell';
import type { MinesCellContent, MinesCellRevealStyle } from './mines-cell.types';

import { minesStoryCellAssets } from '#ui/features/games/originals/mines/mines-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function MinesCellPlayground() {
  const [args, updateArgs] = useArgs<MinesCellProps>();

  const reset = () => {
    updateArgs({
      revealed: false,
      selected: false,
      cashoutLabel: null,
    });
  };

  const reveal = (content: NonNullable<MinesCellProps['content']>) => {
    updateArgs({
      revealed: true,
      content,
      selected: false,
      cashoutLabel: null,
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <div className="size-32 shrink-0">
        <MinesCell
          revealed={args.revealed}
          content={args.content}
          revealStyle={args.revealStyle}
          selected={args.selected}
          selectionMode={args.selectionMode}
          cashoutLabel={args.cashoutLabel}
          gridSize={args.gridSize}
          assets={args.assets}
          disabled={args.disabled}
          reducedMotion={args.reducedMotion}
          aria-label={args['aria-label']}
          className={args.className}
          onClick={() => {
            if (args.revealed || args.disabled) return;
            reveal(args.content ?? 'safe');
            args.onClick?.();
          }}
        />
      </div>

      <Typography as="p" kind="secondary-12-400" className="text-center">
        Click the cell to reveal, or use the controls below.
      </Typography>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={() => reveal('safe')}>
          Reveal safe
        </Button>
        <Button type="button" variant="secondary" onClick={() => reveal('mine')}>
          Reveal mine
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

interface AllStatesCellConfig {
  label: string;
  finalRevealed: boolean;
  content?: MinesCellContent;
  revealStyle?: MinesCellRevealStyle;
  selected?: boolean;
  disabled?: boolean;
  cashoutLabel?: string | null;
}

const ALL_STATES_CELLS: AllStatesCellConfig[] = [
  { label: 'Hidden', finalRevealed: false },
  { label: 'Selected', finalRevealed: false, selected: true },
  { label: 'Player safe', finalRevealed: true, content: 'safe', revealStyle: 'player' },
  { label: 'Board safe', finalRevealed: true, content: 'safe', revealStyle: 'board' },
  { label: 'Player mine', finalRevealed: true, content: 'mine', revealStyle: 'player' },
  { label: 'Board mine', finalRevealed: true, content: 'mine', revealStyle: 'board' },
  { label: 'Disabled', finalRevealed: false, disabled: true },
  {
    label: 'Cashout',
    finalRevealed: true,
    content: 'safe',
    revealStyle: 'player',
    cashoutLabel: '2.48',
  },
];

function FlipCellFrame({
  label,
  finalRevealed,
  content = 'safe',
  revealStyle = 'player',
  selected = false,
  disabled = false,
  cashoutLabel = null,
  gridSize,
  assets,
}: AllStatesCellConfig & Pick<MinesCellProps, 'gridSize' | 'assets'>) {
  const [revealed, setRevealed] = useState(finalRevealed);

  return (
    <div className="flex w-36 flex-col items-center gap-2">
      <div className="size-32 shrink-0">
        <MinesCell
          revealed={revealed}
          content={content}
          revealStyle={revealStyle}
          selected={selected}
          cashoutLabel={cashoutLabel}
          gridSize={gridSize}
          assets={assets}
          disabled={disabled}
          aria-label={label}
          className="z-0"
          onClick={
            disabled
              ? () => undefined
              : () => {
                  if (!revealed) setRevealed(true);
                }
          }
        />
      </div>

      <Typography as="p" kind="secondary-12-400" className="m-0 w-full text-center">
        {label}
      </Typography>

      <div className="flex w-full flex-col gap-1">
        <Button
          type="button"
          size="sm"
          variant="gray-muted"
          disabled={!revealed}
          onClick={() => setRevealed(false)}
        >
          Initial
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={revealed === finalRevealed}
          onClick={() => setRevealed(finalRevealed)}
        >
          Final
        </Button>
      </div>
    </div>
  );
}

function AllStatesGrid({
  gridSize,
  assets,
}: Pick<MinesCellProps, 'gridSize' | 'assets'>): ReactNode {
  return (
    <div className="grid w-max grid-cols-3 gap-x-8 gap-y-10">
      {ALL_STATES_CELLS.map((cell) => (
        <FlipCellFrame
          key={cell.label}
          label={cell.label}
          finalRevealed={cell.finalRevealed}
          content={cell.content}
          revealStyle={cell.revealStyle}
          selected={cell.selected}
          disabled={cell.disabled}
          cashoutLabel={cell.cashoutLabel}
          gridSize={gridSize}
          assets={assets}
        />
      ))}
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Mines/Mines Cell',
  component: MinesCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: [
        'revealed',
        'content',
        'revealStyle',
        'selected',
        'selectionMode',
        'cashoutLabel',
        'gridSize',
        'disabled',
        'reducedMotion',
      ],
    },
  },
  argTypes: {
    revealed: { control: { type: 'boolean' } },
    content: {
      control: { type: 'select' },
      options: ['safe', 'mine'],
    },
    revealStyle: {
      control: { type: 'inline-radio' },
      options: ['player', 'board'],
    },
    selected: { control: { type: 'boolean' } },
    selectionMode: { control: { type: 'boolean' } },
    cashoutLabel: { control: { type: 'text' } },
    gridSize: {
      control: { type: 'inline-radio' },
      options: [4, 5, 6, 8],
    },
    disabled: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    assets: { control: false },
    onClick: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  args: {
    revealed: false,
    content: 'safe',
    revealStyle: 'player',
    selected: false,
    selectionMode: false,
    cashoutLabel: null,
    gridSize: 5,
    assets: minesStoryCellAssets,
    disabled: false,
    reducedMotion: false,
    'aria-label': 'Mines cell',
  },
} satisfies Meta<typeof MinesCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: MinesCellPlayground,
};

export const AllStates: Story = {
  render: (args) => <AllStatesGrid gridSize={args.gridSize} assets={args.assets} />,
};
