'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { DoubleConfig } from './double-config';

import type { DoubleBetType } from '#ui/features/games/originals/double/double.types';
import { toggleDoubleBetType } from '#ui/features/games/originals/double/double-engine';
import {
  doubleStoryBetAmountTooltip,
  doubleStoryBetTypeOptions,
  doubleStoryCurrencyIcon,
  doubleStoryLabels,
} from '#ui/features/games/originals/double/double-story-helpers';
import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import { OriginalsConfigStoryLayout } from '#ui/features/games/originals/originals-config-theatre-decorator';

interface PlaygroundArgs {
  mode: OriginalsConfigMode;
  tabsDisabled: boolean;
  fieldsDisabled: boolean;
  betAmount: string;
  betTypes: DoubleBetType[];
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  theatreMode: boolean;
  betAmountError?: string;
}

type UpdateArgs = (patch: Partial<PlaygroundArgs>) => void;

function DoubleConfigPlayground({
  args,
  updateArgs,
}: {
  args: PlaygroundArgs;
  updateArgs: UpdateArgs;
}) {
  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: args.autoActionVariant === 'stop',
    startAutobetLabel: args.autoActionLabel,
  });

  const multiplyBetAmount = (multiplier: number) => {
    const parsed = Number.parseFloat(args.betAmount);
    if (!Number.isNaN(parsed)) updateArgs({ betAmount: (parsed * multiplier).toFixed(2) });
  };

  return (
    <OriginalsConfigStoryLayout theatreMode={args.theatreMode}>
      <DoubleConfig
        shell={{
          mode: args.mode,
          onModeChange: (mode) => updateArgs({ mode }),
          tabsDisabled: args.tabsDisabled,
          manualActionLabel: args.manualActionLabel,
          autoActionLabel: autobetAction.label,
          autoActionVariant: autobetAction.variant,
          manualActionDisabled: args.manualActionDisabled,
          autoActionDisabled: args.autoActionDisabled,
          theatreMode: args.theatreMode,
          onManualAction: () => undefined,
          onAutoAction: () => undefined,
        }}
        fieldsDisabled={args.fieldsDisabled}
        betAmount={{
          value: args.betAmount,
          onChange: (betAmount) => updateArgs({ betAmount }),
          conversionText: '0.000145 BTC',
          tooltip: doubleStoryBetAmountTooltip,
          currencyIcon: doubleStoryCurrencyIcon,
          error: args.betAmountError || undefined,
          quickActions: [
            { label: '½', onClick: () => multiplyBetAmount(0.5) },
            { label: '2x', onClick: () => multiplyBetAmount(2) },
          ],
        }}
        rounds={{
          value: args.rounds,
          onChange: (rounds) => updateArgs({ rounds }),
        }}
        betTypes={{
          value: args.betTypes,
          onToggle: (type) => updateArgs({ betTypes: toggleDoubleBetType(args.betTypes, type) }),
          options: doubleStoryBetTypeOptions,
          label: doubleStoryLabels.yourBet,
        }}
      />
    </OriginalsConfigStoryLayout>
  );
}

/** Storybook preview hooks only; the playground stays a plain component. */
function DoubleConfigStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  return <DoubleConfigPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Double/Double Config',
  component: DoubleConfig,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    appHeader: false,
  },
  argTypes: {
    mode: { control: { type: 'inline-radio' }, options: ['manual', 'auto'] },
    tabsDisabled: { control: { type: 'boolean' } },
    fieldsDisabled: { control: { type: 'boolean' } },
    betAmount: { control: { type: 'text' } },
    betTypes: { control: { type: 'check' }, options: ['RED', 'BLACK', 'GREEN', 'JOKER'] },
    rounds: { control: { type: 'text' } },
    manualActionLabel: { control: { type: 'text' } },
    autoActionLabel: { control: { type: 'text' } },
    autoActionVariant: { control: { type: 'select' }, options: ['start', 'stop'] },
    manualActionDisabled: { control: { type: 'boolean' } },
    autoActionDisabled: { control: { type: 'boolean' } },
    theatreMode: { control: { type: 'boolean' } },
    betAmountError: { control: { type: 'text' } },
  },
} satisfies Meta;

export default meta;

const playgroundDefaultArgs = {
  mode: 'manual',
  tabsDisabled: false,
  fieldsDisabled: false,
  betAmount: '1000.00',
  betTypes: ['RED'],
  rounds: '10',
  manualActionLabel: doubleStoryLabels.placeBet,
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  theatreMode: false,
  betAmountError: '',
} satisfies PlaygroundArgs;

export const Playground: StoryObj<PlaygroundArgs> = {
  args: playgroundDefaultArgs,
  render: DoubleConfigStory,
};

export const Rolling: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    tabsDisabled: true,
    fieldsDisabled: true,
    manualActionLabel: doubleStoryLabels.rolling,
    manualActionDisabled: true,
  },
  render: DoubleConfigStory,
};

export const Auto: StoryObj<PlaygroundArgs> = {
  args: { ...playgroundDefaultArgs, mode: 'auto', betTypes: ['BLACK', 'JOKER'] },
  render: DoubleConfigStory,
};
