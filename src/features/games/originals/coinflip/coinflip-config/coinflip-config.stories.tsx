'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { CoinflipConfig, type CoinflipConfigProps } from './coinflip-config';

import {
  coinflipStoryBetAmountTooltip,
  coinflipStoryCurrencyIcon,
  coinflipStorySelectSideOptions,
  coinflipStoryStopConditionsLabels,
} from '#ui/features/games/originals/coinflip/coinflip-story-helpers';
import { OriginalsConfigStoryLayout } from '#ui/features/games/originals/originals-config-theatre-decorator';

const noop = () => undefined;

const baseShell = {
  mode: 'manual',
  onModeChange: noop,
  tabsDisabled: false,
  autobetSession: {
    state: 'ready-to-start',
    totalWagered: '$0.00',
    netProfit: '$0.00',
    winRate: '0%',
  },
  manualActionLabel: 'Place Bet',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  theatreMode: false,
  onManualAction: noop,
  onAutoAction: noop,
} satisfies CoinflipConfigProps['shell'];

const baseBetAmount = {
  value: '1.00',
  onChange: noop,
  conversionText: '0.000145 BTC',
  tooltip: coinflipStoryBetAmountTooltip,
  currencyIcon: coinflipStoryCurrencyIcon,
  isLoading: false,
} satisfies CoinflipConfigProps['betAmount'];

const baseRounds = {
  value: '100',
  onChange: noop,
} satisfies NonNullable<CoinflipConfigProps['rounds']>;

const baseStopConditions = {
  labels: coinflipStoryStopConditionsLabels,
  onWinValue: 50,
  onLossValue: 50,
  stopProfitValue: '',
  stopLossValue: '',
  isActiveOnWin: false,
  isActiveOnLoss: false,
  onWinChange: noop,
  onLossChange: noop,
  onStopProfitChange: noop,
  onStopLossChange: noop,
  onWinToggle: noop,
  onLossToggle: noop,
} satisfies NonNullable<CoinflipConfigProps['stopConditions']>;

const baseSelectSide = {
  value: 'HEADS',
  onChange: noop,
  options: coinflipStorySelectSideOptions,
  labels: { title: 'Select Side' },
} satisfies CoinflipConfigProps['selectSide'];

const baseTurboMode = {
  checked: false,
  onCheckedChange: noop,
} satisfies CoinflipConfigProps['turboMode'];

const baseArgs = {
  shell: baseShell,
  betAmount: baseBetAmount,
  rounds: baseRounds,
  stopConditions: baseStopConditions,
  fieldsDisabled: false,
  selectSide: baseSelectSide,
  turboMode: baseTurboMode,
} satisfies CoinflipConfigProps;

function CoinflipConfigPlayground() {
  const [args, updateArgs] = useArgs<CoinflipConfigProps>();
  const rounds = args.rounds;
  const stopConditions = args.stopConditions;

  const updateBetAmount = (value: string) => {
    updateArgs({ betAmount: { ...args.betAmount, value } });
  };

  const multiplyBetAmount = (multiplier: number) => {
    const value = Number.parseFloat(args.betAmount.value);
    if (!Number.isNaN(value)) {
      updateBetAmount((value * multiplier).toFixed(2));
    }
  };

  return (
    <OriginalsConfigStoryLayout theatreMode={args.shell.theatreMode}>
      <CoinflipConfig
        shell={{
          ...args.shell,
          onModeChange: (mode) => updateArgs({ shell: { ...args.shell, mode } }),
        }}
        betAmount={{
          ...args.betAmount,
          onChange: updateBetAmount,
          quickActions: [
            { label: '½', onClick: () => multiplyBetAmount(0.5) },
            { label: '2x', onClick: () => multiplyBetAmount(2) },
          ],
        }}
        rounds={
          rounds
            ? {
                ...rounds,
                onChange: (value) => updateArgs({ rounds: { ...rounds, value } }),
              }
            : undefined
        }
        stopConditions={
          stopConditions
            ? {
                ...stopConditions,
                onWinChange: (onWinValue) =>
                  updateArgs({
                    stopConditions: { ...stopConditions, onWinValue },
                  }),
                onLossChange: (onLossValue) =>
                  updateArgs({
                    stopConditions: { ...stopConditions, onLossValue },
                  }),
                onStopProfitChange: (stopProfitValue) =>
                  updateArgs({
                    stopConditions: { ...stopConditions, stopProfitValue },
                  }),
                onStopLossChange: (stopLossValue) =>
                  updateArgs({
                    stopConditions: { ...stopConditions, stopLossValue },
                  }),
                onWinToggle: (isActiveOnWin) =>
                  updateArgs({
                    stopConditions: { ...stopConditions, isActiveOnWin },
                  }),
                onLossToggle: (isActiveOnLoss) =>
                  updateArgs({
                    stopConditions: { ...stopConditions, isActiveOnLoss },
                  }),
              }
            : undefined
        }
        fieldsDisabled={args.fieldsDisabled}
        selectSide={{
          ...args.selectSide,
          onChange: (value) => updateArgs({ selectSide: { ...args.selectSide, value } }),
        }}
        turboMode={{
          ...args.turboMode,
          onCheckedChange: (checked) =>
            updateArgs({ turboMode: { ...args.turboMode, checked } }),
        }}
      />
    </OriginalsConfigStoryLayout>
  );
}

const meta = {
  title: 'Features/Games/Originals/Coinflip/Coinflip Config',
  component: CoinflipConfig,
  render: CoinflipConfigPlayground,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: { include: ['fieldsDisabled'] },
  },
  argTypes: {
    shell: { control: false },
    betAmount: { control: false },
    rounds: { control: false },
    stopConditions: { control: false },
    fieldsDisabled: { control: { type: 'boolean' } },
    selectSide: { control: false },
    turboMode: { control: false },
  },
  args: baseArgs,
} satisfies Meta<typeof CoinflipConfig>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ManualFlipping: Story = {
  args: {
    shell: {
      ...baseShell,
      tabsDisabled: true,
      manualActionDisabled: true,
    },
    fieldsDisabled: true,
    selectSide: { ...baseSelectSide, value: 'TAILS' },
    turboMode: { ...baseTurboMode, checked: true },
  },
};

export const Auto: Story = {
  args: {
    shell: {
      ...baseShell,
      mode: 'auto',
      manualActionDisabled: true,
    },
    selectSide: { ...baseSelectSide, value: 'TAILS' },
    turboMode: { ...baseTurboMode, checked: true },
  },
};

export const AutobetRunning: Story = {
  args: {
    shell: {
      ...baseShell,
      mode: 'auto',
      tabsDisabled: true,
      autobetSession: {
        state: 'live',
        totalWagered: '$1,250.00',
        netProfit: '+$320.50',
        winRate: '62%',
      },
      autoActionLabel: 'Stop',
      autoActionVariant: 'stop',
      manualActionDisabled: true,
    },
    fieldsDisabled: true,
    turboMode: { ...baseTurboMode, checked: true },
  },
};

export const InsufficientBalance: Story = {
  args: {
    shell: {
      ...baseShell,
      mode: 'auto',
      autobetSession: {
        state: 'insufficient-balance',
        totalWagered: '$500.00',
        netProfit: '-$500.00',
        winRate: '40%',
      },
      autoActionLabel: 'Retry',
      autoActionVariant: 'retry',
    },
  },
};

export const AwaitingResult: Story = {
  args: {
    shell: {
      ...baseShell,
      mode: 'auto',
      tabsDisabled: true,
      autobetSession: {
        ...baseShell.autobetSession,
        state: 'interrupted',
        labels: {
          interrupted: 'Awaiting result',
          interruptedSubtitle: 'Waiting for confirmation of the submitted wager.',
        },
      },
      autoActionLabel: 'Awaiting result',
      autoActionVariant: 'retry',
      autoActionDisabled: true,
    },
    fieldsDisabled: true,
  },
};

export const BalanceUnavailable: Story = {
  args: {
    shell: { ...baseShell, tabsDisabled: true, manualActionLabel: 'Retry' },
    betAmount: {
      ...baseBetAmount,
      conversionText: null,
      error: 'Balance is unavailable. Please retry.',
    },
    fieldsDisabled: true,
  },
};

export const Stopping: Story = {
  args: {
    ...AutobetRunning.args,
    shell: {
      ...baseShell,
      ...AutobetRunning.args?.shell,
      autoActionDisabled: true,
    },
  },
};

export const Paused: Story = {
  args: {
    shell: {
      ...baseShell,
      mode: 'auto',
      autobetSession: {
        state: 'paused',
        totalWagered: '$10.00',
        netProfit: '+$2.00',
        winRate: '100%',
      },
      autoActionLabel: 'Start 99 Bets',
    },
    selectSide: { ...baseSelectSide, value: 'TAILS' },
  },
};

export const PausedInfiniteBets: Story = {
  args: {
    shell: {
      ...baseShell,
      mode: 'auto',
      autobetSession: {
        state: 'paused',
        totalWagered: '$25.00',
        netProfit: '-$5.00',
        winRate: '50%',
      },
      autoActionLabel: 'Start ∞ Bets',
    },
    rounds: { ...baseRounds, value: 'Infinity' },
  },
};

export const TheatreMode: Story = {
  globals: {
    viewport: { value: 'desktop' },
  },
  args: {
    shell: { ...baseShell, theatreMode: true },
  },
};
