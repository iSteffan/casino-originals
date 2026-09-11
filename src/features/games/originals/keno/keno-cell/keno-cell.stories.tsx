'use client';

import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { KenoCell, type KenoCellProps } from './keno-cell';
import type { KenoCellState } from './keno-cell.types';

import { kenoStoryCellAssets } from '#ui/features/games/originals/keno/keno-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

function KenoCellPlayground() {
  const [args, updateArgs] = useArgs<KenoCellProps>();

  const setState = (state: KenoCellState) => {
    updateArgs({ state });
  };

  const toggleSelection = () => {
    if (args.state === 'idle') {
      updateArgs({ state: 'selected' });
      return;
    }
    if (args.state === 'selected') {
      updateArgs({ state: 'idle' });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <div className="size-20 shrink-0 sm:size-24">
        <KenoCell
          number={args.number}
          state={args.state}
          assets={args.assets}
          disabled={args.disabled}
          reducedMotion={args.reducedMotion}
          aria-label={args['aria-label']}
          className={args.className}
          onClick={
            args.onClick ??
            (() => {
              toggleSelection();
            })
          }
        />
      </div>

      <Typography as="p" kind="secondary-12-400" className="text-center">
        Click the cell to toggle idle/selected, or use the controls below.
      </Typography>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={() => setState('idle')}>
          Idle
        </Button>
        <Button type="button" variant="secondary" onClick={() => setState('selected')}>
          Selected
        </Button>
        <Button type="button" variant="secondary" onClick={() => setState('win')}>
          Win
        </Button>
        <Button type="button" variant="secondary" onClick={() => setState('lose')}>
          Lose
        </Button>
        <Button type="button" variant="secondary" onClick={() => setState('missed')}>
          Missed
        </Button>
      </div>
    </div>
  );
}

function CellFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex w-20 flex-col items-center gap-2 sm:w-24">
      <div className="size-20 w-full shrink-0 sm:size-24">{children}</div>
      <Typography as="p" kind="secondary-10-400" className="m-0 w-full text-center">
        {label}
      </Typography>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Keno/Keno Cell',
  component: KenoCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['number', 'state', 'disabled', 'reducedMotion'],
    },
  },
  argTypes: {
    number: {
      control: { type: 'number', min: 1, max: 40, step: 1 },
    },
    state: {
      control: { type: 'select' },
      options: ['idle', 'selected', 'win', 'lose', 'missed'],
    },
    disabled: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    assets: { control: false },
    onClick: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  args: {
    number: 17,
    state: 'idle',
    assets: kenoStoryCellAssets,
    disabled: false,
    reducedMotion: false,
    'aria-label': 'Keno cell 17',
  },
} satisfies Meta<typeof KenoCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: KenoCellPlayground,
};

export const AllStates: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4 sm:gap-6">
      <CellFrame label="Idle">
        <KenoCell
          number={args.number}
          state="idle"
          assets={args.assets}
          reducedMotion={args.reducedMotion}
          aria-label="Idle cell"
        />
      </CellFrame>
      <CellFrame label="Selected">
        <KenoCell
          number={args.number}
          state="selected"
          assets={args.assets}
          reducedMotion={args.reducedMotion}
          aria-label="Selected cell"
        />
      </CellFrame>
      <CellFrame label="Win">
        <KenoCell
          number={args.number}
          state="win"
          assets={args.assets}
          reducedMotion={args.reducedMotion}
          aria-label="Win cell"
        />
      </CellFrame>
      <CellFrame label="Lose">
        <KenoCell
          number={args.number}
          state="lose"
          assets={args.assets}
          reducedMotion={args.reducedMotion}
          aria-label="Lose cell"
        />
      </CellFrame>
      <CellFrame label="Missed">
        <KenoCell
          number={args.number}
          state="missed"
          assets={args.assets}
          reducedMotion={args.reducedMotion}
          aria-label="Missed cell"
        />
      </CellFrame>
    </div>
  ),
};

export const ReducedMotion: Story = {
  args: {
    state: 'win',
    reducedMotion: true,
  },
  render: KenoCellPlayground,
};
