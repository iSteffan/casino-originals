'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { RouletteConfig } from './roulette-config';

import { ROULETTE_CHIPS } from '#ui/features/games/originals/roulette/roulette.constants';
import {
  rouletteStoryClearIconSrc,
  rouletteStoryUndoIconSrc,
} from '#ui/features/games/originals/roulette/roulette-story-helpers';
import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { OriginalsConfigStoryLayout } from '#ui/features/games/originals/originals-config-theatre-decorator';

interface PlaygroundArgs {
  mode: OriginalsConfigMode;
  tabsDisabled: boolean;
  fieldsDisabled: boolean;
  selectedChip: number;
  totalStake: number;
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  theatreMode: boolean;
}

function IconImg({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} width={16} height={16} className="size-4" />;
}

function RouletteConfigPlayground() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();

  return (
    <OriginalsConfigStoryLayout theatreMode={args.theatreMode}>
      <RouletteConfig
        shell={{
          mode: args.mode,
          onModeChange: (mode) => updateArgs({ mode }),
          tabsDisabled: args.tabsDisabled,
          theatreMode: args.theatreMode,
          manualTabLabel: 'Manual',
          autoTabLabel: 'Auto',
          manualActionLabel: args.manualActionLabel,
          autoActionLabel: args.autoActionLabel,
          autoActionVariant: args.autoActionVariant,
          manualActionDisabled: args.manualActionDisabled,
          autoActionDisabled: args.autoActionDisabled,
          onManualAction: () => undefined,
          onAutoAction: () => undefined,
        }}
        chips={ROULETTE_CHIPS.map((chip) => ({
          value: chip.value,
          label: String(chip.value),
          src: chip.src,
        }))}
        selectedChip={args.selectedChip}
        onSelectChip={(selectedChip) => updateArgs({ selectedChip })}
        onUndo={() =>
          updateArgs({
            totalStake: Math.max(0, Number((args.totalStake - args.selectedChip).toFixed(2))),
          })
        }
        onClear={() => updateArgs({ totalStake: 0 })}
        fieldsDisabled={args.fieldsDisabled}
        totalLabel={`Total stake: ${args.totalStake.toFixed(2)} credits`}
        rounds={args.rounds}
        onRoundsChange={(rounds) => updateArgs({ rounds })}
        undoIcon={<IconImg src={rouletteStoryUndoIconSrc} alt="" />}
        clearIcon={<IconImg src={rouletteStoryClearIconSrc} alt="" />}
        labels={{
          chips: 'Demo chips',
          undo: 'Undo last chip',
          clear: 'Clear bets',
          rounds: 'Demo rounds',
        }}
      />
    </OriginalsConfigStoryLayout>
  );
}

const meta = {
  title: 'Features/Games/Originals/Roulette/Roulette Config',
  component: RouletteConfig,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    appHeader: false,
    controls: {
      include: [
        'mode',
        'tabsDisabled',
        'fieldsDisabled',
        'selectedChip',
        'totalStake',
        'rounds',
        'manualActionLabel',
        'autoActionLabel',
        'autoActionVariant',
        'manualActionDisabled',
        'autoActionDisabled',
        'theatreMode',
      ],
    },
  },
  argTypes: {
    mode: {
      control: { type: 'inline-radio' },
      options: ['manual', 'auto'],
    },
    tabsDisabled: { control: { type: 'boolean' } },
    fieldsDisabled: { control: { type: 'boolean' } },
    selectedChip: {
      control: { type: 'select' },
      options: ROULETTE_CHIPS.map((chip) => chip.value),
    },
    totalStake: { control: { type: 'number', min: 0, step: 0.1 } },
    rounds: { control: { type: 'text' } },
    manualActionLabel: { control: { type: 'text' } },
    autoActionLabel: { control: { type: 'text' } },
    autoActionVariant: {
      control: { type: 'inline-radio' },
      options: ['start', 'stop', 'retry'],
    },
    manualActionDisabled: { control: { type: 'boolean' } },
    autoActionDisabled: { control: { type: 'boolean' } },
    theatreMode: { control: { type: 'boolean' } },
  },
  args: {
    mode: 'manual',
    tabsDisabled: false,
    fieldsDisabled: false,
    selectedChip: 1,
    totalStake: 15,
    rounds: '10',
    manualActionLabel: 'Spin',
    autoActionLabel: 'Start autobet',
    autoActionVariant: 'start',
    manualActionDisabled: false,
    autoActionDisabled: false,
    theatreMode: false,
  } satisfies PlaygroundArgs,
  render: RouletteConfigPlayground,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Manual: Story = {};

export const Auto: Story = {
  args: {
    mode: 'auto',
  },
};

export const SpinningLocked: Story = {
  args: {
    fieldsDisabled: true,
    tabsDisabled: true,
    manualActionDisabled: true,
    manualActionLabel: 'Spinning…',
  },
};

export const Theatre: Story = {
  args: {
    theatreMode: true,
  },
};
