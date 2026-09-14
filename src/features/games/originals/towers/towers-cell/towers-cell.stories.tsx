'use client';

import type { ReactNode } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { TowersCell, type TowersCellProps } from './towers-cell';
import type { TowersCellState } from './towers-cell.types';

import {
  towersStoryAmountLabel,
  towersStoryCellAssets,
  towersStoryCellAssetsCompact,
  towersStoryPotentialWin,
} from '#ui/features/games/originals/towers/towers-story-helpers';
import { Button } from '#ui/primitives/actions/button/button';
import { Typography } from '#ui/primitives/foundation/typography/typography';

const towersCellStates: TowersCellState[] = [
  'idle',
  'active',
  'safe',
  'trap',
  'revealed-safe',
  'revealed-trap',
  'auto-selected',
  'auto-selectable',
  'auto-planned',
  'auto-planned-active',
];

const towersCellStateLabels: Record<TowersCellState, string> = {
  idle: 'Idle',
  active: 'Active',
  safe: 'Safe',
  trap: 'Trap',
  'revealed-safe': 'Revealed safe',
  'revealed-trap': 'Revealed trap',
  'auto-selected': 'Auto selected',
  'auto-selectable': 'Auto selectable',
  'auto-planned': 'Auto planned',
  'auto-planned-active': 'Auto planned active',
};

function getStoryAssets(density: TowersCellPlaygroundArgs['density']) {
  return density === 'compact' ? towersStoryCellAssetsCompact : towersStoryCellAssets;
}

function getStoryFrameClassName(density: TowersCellPlaygroundArgs['density']) {
  if (density === 'compact') return 'ds-towers-cell-frame-compact';
  if (density === 'theatre') return 'ds-towers-cell-frame-theatre';
  return 'ds-towers-cell-frame-desktop';
}

interface TowersCellPlaygroundArgs extends TowersCellProps {
  density: 'desktop' | 'compact' | 'theatre';
}

function TowersCellPlayground() {
  const [args, updateArgs] = useArgs<TowersCellPlaygroundArgs>();
  const assets = getStoryAssets(args.density);

  const setState = (state: TowersCellState) => {
    updateArgs({ state });
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4">
      <div className={getStoryFrameClassName(args.density)}>
        <TowersCell
          state={args.state}
          assets={assets}
          amountLabel={args.amountLabel}
          potentialWin={args.potentialWin}
          disabled={args.disabled}
          reducedMotion={args.reducedMotion}
          aria-label={args['aria-label']}
          className={args.className}
          onClick={args.onClick ?? (() => undefined)}
        />
      </div>

      <Typography as="p" kind="secondary-12-400" className="text-center">
        Use the controls to switch every Towers cell face, including auto-bet marks.
      </Typography>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {towersCellStates.map((state) => (
          <Button
            key={state}
            type="button"
            variant={args.state === state ? 'primary' : 'secondary'}
            onClick={() => setState(state)}
          >
            {towersCellStateLabels[state]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function CellFrame({
  label,
  density,
  children,
}: {
  label: string;
  density: TowersCellPlaygroundArgs['density'];
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={getStoryFrameClassName(density)}>{children}</div>
      <Typography as="p" kind="secondary-10-400" className="m-0 w-full text-center">
        {label}
      </Typography>
    </div>
  );
}

const meta = {
  title: 'Features/Games/Originals/Towers/Towers Cell',
  component: TowersCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
    controls: {
      include: ['state', 'disabled', 'reducedMotion', 'density'],
    },
  },
  argTypes: {
    state: {
      control: { type: 'select' },
      options: towersCellStates,
    },
    disabled: { control: { type: 'boolean' } },
    reducedMotion: { control: { type: 'boolean' } },
    density: {
      control: { type: 'inline-radio' },
      options: ['desktop', 'compact', 'theatre'],
    },
    assets: { control: false },
    mobileAssets: { control: false },
    amountLabel: { control: false },
    potentialWin: { control: false },
    onClick: { control: false },
    className: { control: false },
    'aria-label': { control: false },
  },
  args: {
    state: 'idle',
    assets: towersStoryCellAssets,
    amountLabel: towersStoryAmountLabel,
    potentialWin: towersStoryPotentialWin,
    disabled: false,
    reducedMotion: false,
    density: 'desktop',
    'aria-label': 'Towers cell',
  },
} satisfies Meta<TowersCellPlaygroundArgs>;

export default meta;

type Story = StoryObj<TowersCellPlaygroundArgs>;

export const Playground: Story = {
  render: TowersCellPlayground,
};

export const AllStates: Story = {
  render: (args) => {
    const assets = getStoryAssets(args.density);

    return (
      <div className="flex flex-wrap gap-4 sm:gap-6">
        {towersCellStates.map((state) => (
          <CellFrame
            key={state}
            label={towersCellStateLabels[state]}
            density={args.density}
          >
            <TowersCell
              state={state}
              assets={assets}
              amountLabel={args.amountLabel}
              potentialWin={args.potentialWin}
              disabled={args.disabled}
              reducedMotion={args.reducedMotion}
            />
          </CellFrame>
        ))}
      </div>
    );
  },
};

export const ReducedMotion: Story = {
  args: {
    state: 'safe',
    reducedMotion: true,
  },
  render: TowersCellPlayground,
};

export const LongLocalizedAmount: Story = {
  args: {
    density: 'compact',
    state: 'active',
    potentialWin: {
      whole: '₴123,456,789',
      fraction: '99',
    },
    'aria-label': 'Ряд 1, плитка 1, доступно, потенційний виграш ₴123,456,789.99',
  },
  render: TowersCellPlayground,
};
