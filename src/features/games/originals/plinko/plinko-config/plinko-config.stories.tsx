'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { PlinkoConfig } from './plinko-config';

import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import { OriginalsConfigStoryLayout } from '#ui/features/games/originals/originals-config-theatre-decorator';
import {
  PLINKO_STORY_DEFAULT_ROWS,
  PLINKO_STORY_ROW_COUNTS,
  plinkoStoryBetAmountTooltip,
  plinkoStoryCurrencyIcon,
  plinkoStoryRiskLabels,
  plinkoStoryRiskOptions,
  plinkoStoryRowsLabels,
  plinkoStoryRowsOptions,
} from '#ui/features/games/originals/plinko/plinko-story-helpers';

interface PlaygroundArgs {
  mode: OriginalsConfigMode;
  tabsDisabled: boolean;
  fieldsDisabled: boolean;
  betAmountLoading: boolean;
  betAmount: string;
  risk: string;
  rows: number;
  turboMode: boolean;
  turboModeLabel: string;
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  theatreMode: boolean;
  betAmountError?: string;
  showBetAmountThresholdWarning?: boolean;
  betAmountThresholdTitle?: string;
  betAmountThresholdDescription?: string;
  roundsError?: string;
}

function resolvePlaygroundAutobetAction({
  autoActionVariant,
  autoActionLabel,
}: Pick<PlaygroundArgs, 'autoActionVariant' | 'autoActionLabel'>) {
  return resolveOriginalsAutobetAction({
    isRunning: autoActionVariant === 'stop',
    startAutobetLabel: autoActionLabel,
  });
}

type UpdateArgs = (patch: Partial<PlaygroundArgs>) => void;

function PlinkoConfigPlayground({
  args,
  updateArgs,
}: {
  args: PlaygroundArgs;
  updateArgs: UpdateArgs;
}) {
  const {
    mode,
    tabsDisabled,
    fieldsDisabled,
    betAmountLoading,
    betAmount,
    risk,
    rows,
    turboMode,
    turboModeLabel,
    rounds,
    manualActionLabel,
    autoActionLabel,
    autoActionVariant = 'start',
    manualActionDisabled,
    autoActionDisabled,
    theatreMode,
    betAmountError = '',
    showBetAmountThresholdWarning = false,
    betAmountThresholdTitle = 'High payout warning',
    betAmountThresholdDescription = 'This bet exceeds the recommended payout threshold.',
    roundsError = '',
  } = args;
  const autobetAction = resolvePlaygroundAutobetAction({
    autoActionVariant,
    autoActionLabel,
  });

  const multiplyBetAmount = (multiplier: number) => {
    const parsed = Number.parseFloat(betAmount);
    if (!Number.isNaN(parsed)) {
      updateArgs({ betAmount: (parsed * multiplier).toFixed(2) });
    }
  };

  return (
    <OriginalsConfigStoryLayout theatreMode={theatreMode}>
      <PlinkoConfig
        shell={{
          mode,
          onModeChange: (mode) => updateArgs({ mode }),
          tabsDisabled,
          manualActionLabel,
          autoActionLabel: autobetAction.label,
          autoActionVariant: autobetAction.variant,
          manualActionDisabled,
          autoActionDisabled,
          theatreMode,
          onManualAction: () => undefined,
          onAutoAction: () => undefined,
        }}
        fieldsDisabled={fieldsDisabled}
        betAmount={{
          value: betAmount,
          onChange: (betAmount) => updateArgs({ betAmount }),
          conversionText: '0.000145 BTC',
          tooltip: plinkoStoryBetAmountTooltip,
          currencyIcon: plinkoStoryCurrencyIcon,
          isLoading: betAmountLoading,
          error: betAmountError || undefined,
          thresholdWarning: showBetAmountThresholdWarning
            ? {
                title: betAmountThresholdTitle,
                description: betAmountThresholdDescription,
              }
            : null,
          quickActions: [
            { label: '½', onClick: () => multiplyBetAmount(0.5) },
            { label: '2x', onClick: () => multiplyBetAmount(2) },
          ],
        }}
        risk={{
          value: risk,
          onChange: (risk) => updateArgs({ risk }),
          options: plinkoStoryRiskOptions,
          labels: plinkoStoryRiskLabels,
        }}
        rows={{
          value: rows,
          onChange: (rows) => updateArgs({ rows }),
          options: plinkoStoryRowsOptions,
          labels: plinkoStoryRowsLabels,
        }}
        turboMode={{
          checked: turboMode,
          onCheckedChange: (turboMode) => updateArgs({ turboMode }),
          label: turboModeLabel,
        }}
        rounds={{
          value: rounds,
          onChange: (rounds) => updateArgs({ rounds }),
          error: roundsError || undefined,
        }}
      />
    </OriginalsConfigStoryLayout>
  );
}

/** Storybook preview hooks only; the playground stays a plain component. */
function PlinkoConfigStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  return <PlinkoConfigPlayground args={args} updateArgs={updateArgs} />;
}

const meta = {
  title: 'Features/Games/Originals/Plinko/Plinko Config',
  component: PlinkoConfig,
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
        'betAmountLoading',
        'betAmount',
        'risk',
        'rows',
        'turboMode',
        'turboModeLabel',
        'rounds',
        'manualActionLabel',
        'autoActionLabel',
        'autoActionVariant',
        'manualActionDisabled',
        'autoActionDisabled',
        'theatreMode',
        'betAmountError',
        'showBetAmountThresholdWarning',
        'betAmountThresholdTitle',
        'betAmountThresholdDescription',
        'roundsError',
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
    betAmountLoading: { control: { type: 'boolean' } },
    betAmount: { control: { type: 'text' } },
    risk: {
      control: { type: 'select' },
      options: plinkoStoryRiskOptions.map((option) => option.value),
    },
    rows: {
      control: { type: 'select' },
      options: [...PLINKO_STORY_ROW_COUNTS],
    },
    turboMode: { control: { type: 'boolean' } },
    turboModeLabel: { control: { type: 'text' } },
    rounds: { control: { type: 'text' } },
    manualActionLabel: { control: { type: 'text' } },
    autoActionLabel: { control: { type: 'text' } },
    autoActionVariant: {
      control: { type: 'select' },
      options: ['start', 'stop'],
    },
    manualActionDisabled: { control: { type: 'boolean' } },
    autoActionDisabled: { control: { type: 'boolean' } },
    theatreMode: { control: { type: 'boolean' } },
    betAmountError: { control: { type: 'text' } },
    showBetAmountThresholdWarning: { control: { type: 'boolean' } },
    betAmountThresholdTitle: { control: { type: 'text' } },
    betAmountThresholdDescription: { control: { type: 'text' } },
    roundsError: { control: { type: 'text' } },
  },
} satisfies Meta;

export default meta;

const playgroundDefaultArgs = {
  mode: 'manual',
  tabsDisabled: false,
  fieldsDisabled: false,
  betAmountLoading: false,
  betAmount: '1000.00',
  risk: 'medium',
  rows: PLINKO_STORY_DEFAULT_ROWS,
  turboMode: false,
  turboModeLabel: 'Turbo mode',
  rounds: '100',
  manualActionLabel: 'Drop Ball',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  theatreMode: false,
  betAmountError: '',
  showBetAmountThresholdWarning: false,
  betAmountThresholdTitle: 'High payout warning',
  betAmountThresholdDescription: 'This bet exceeds the recommended payout threshold.',
  roundsError: '',
} satisfies PlaygroundArgs;

export const Playground: StoryObj<PlaygroundArgs> = {
  args: playgroundDefaultArgs,
  render: PlinkoConfigStory,
};

export const Manual: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'manual',
    rows: 16,
    turboMode: false,
  },
  render: PlinkoConfigStory,
};

export const Auto: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    risk: 'low',
    rows: 10,
    turboMode: true,
  },
  render: PlinkoConfigStory,
};

export const AutobetRunning: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    tabsDisabled: true,
    fieldsDisabled: true,
    risk: 'medium',
    rows: 12,
    turboMode: true,
    autoActionLabel: 'Stop',
    autoActionVariant: 'stop',
    manualActionDisabled: true,
  },
  render: PlinkoConfigStory,
};

export const TheatreMode: StoryObj<PlaygroundArgs> = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: {
    ...playgroundDefaultArgs,
    theatreMode: true,
    rows: 16,
    turboMode: false,
  },
  render: PlinkoConfigStory,
};
