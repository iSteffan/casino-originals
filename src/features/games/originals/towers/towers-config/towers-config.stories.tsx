'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useState } from 'storybook/preview-api';

import { TowersConfig } from './towers-config';

import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import { OriginalsConfigStoryLayout } from '#ui/features/games/originals/originals-config-theatre-decorator';
import type { AutobetSessionState } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';
import {
  towersStoryCurrencyIcon,
  towersStoryDifficultyLabels,
  towersStoryDifficultyOptions,
} from '#ui/features/games/originals/towers/towers-story-helpers';

const betAmountTooltip = {
  label: 'Bet amount information',
  title: 'Max payout per round: $15,000',
  description:
    'During soft launch, winnings are capped across all games. Please choose your bet size accordingly.',
};

const stopConditionsLabels = {
  onWin: 'On Win',
  onLoss: 'On Loss',
  stopProfit: 'Stop on Profit',
  stopLoss: 'Stop on Loss',
  reset: 'Reset',
  increaseBy: 'Increase by',
};

interface PlaygroundArgs {
  mode: OriginalsConfigMode;
  tabsDisabled: boolean;
  fieldsDisabled: boolean;
  betAmountLoading: boolean;
  betAmount: string;
  difficulty: number;
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  clearSelectionLabel?: string;
  clearSelectionDisabled?: boolean;
  randomLabel?: string;
  randomVisible?: boolean;
  randomDisabled?: boolean;
  theatreMode: boolean;
  betAmountError?: string;
  showBetAmountThresholdWarning?: boolean;
  betAmountThresholdTitle?: string;
  betAmountThresholdDescription?: string;
  roundsError?: string;
  autobetSessionState?: AutobetSessionState;
  autobetTotalWagered?: string;
  autobetNetProfit?: string;
  autobetWinRate?: string;
}

function resolvePlaygroundAutobetAction({
  autoActionVariant,
  autoActionLabel,
}: Pick<PlaygroundArgs, 'autoActionVariant' | 'autoActionLabel'>) {
  return resolveOriginalsAutobetAction({
    isRunning: autoActionVariant === 'stop',
    isInsufficientBalance: autoActionVariant === 'retry',
    startAutobetLabel: autoActionLabel,
  });
}

function TowersConfigPlayground() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const {
    mode,
    tabsDisabled,
    fieldsDisabled,
    betAmountLoading,
    betAmount,
    difficulty,
    rounds = '100',
    manualActionLabel,
    autoActionLabel,
    autoActionVariant = 'start',
    manualActionDisabled,
    autoActionDisabled,
    clearSelectionLabel = 'Clear Selection',
    clearSelectionDisabled = true,
    randomLabel = 'Random',
    randomVisible = false,
    randomDisabled = false,
    theatreMode,
    betAmountError = '',
    showBetAmountThresholdWarning = false,
    betAmountThresholdTitle = 'High payout warning',
    betAmountThresholdDescription = 'This bet exceeds the recommended payout threshold.',
    roundsError = '',
    autobetSessionState = 'ready-to-start',
    autobetTotalWagered = '$0.00',
    autobetNetProfit = '$0.00',
    autobetWinRate = '0%',
  } = args;
  const autobetAction = resolvePlaygroundAutobetAction({
    autoActionVariant,
    autoActionLabel,
  });

  const [isActiveOnWin, setIsActiveOnWin] = useState(false);
  const [isActiveOnLoss, setIsActiveOnLoss] = useState(false);
  const [onWinValue, setOnWinValue] = useState(50);
  const [onLossValue, setOnLossValue] = useState(50);
  const [stopProfitValue, setStopProfitValue] = useState('');
  const [stopLossValue, setStopLossValue] = useState('');

  const multiplyBetAmount = (multiplier: number) => {
    const parsed = Number.parseFloat(betAmount);
    if (!Number.isNaN(parsed)) {
      updateArgs({ betAmount: (parsed * multiplier).toFixed(2) });
    }
  };

  return (
    <OriginalsConfigStoryLayout theatreMode={theatreMode}>
      <TowersConfig
        shell={{
          mode,
          onModeChange: (mode) => updateArgs({ mode }),
          tabsDisabled,
          manualActionLabel,
          autoActionLabel: autobetAction.label,
          autoActionVariant: autobetAction.variant,
          manualActionDisabled,
          autoActionDisabled,
          autobetSession: {
            state: autobetSessionState,
            totalWagered: autobetTotalWagered,
            netProfit: autobetNetProfit,
            winRate: autobetWinRate,
          },
          theatreMode,
          onManualAction: () => undefined,
          onAutoAction: () => undefined,
        }}
        fieldsDisabled={fieldsDisabled}
        betAmount={{
          value: betAmount,
          onChange: (betAmount) => updateArgs({ betAmount }),
          conversionText: '0.000145 BTC',
          tooltip: betAmountTooltip,
          currencyIcon: towersStoryCurrencyIcon,
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
        difficulty={{
          value: difficulty,
          onChange: (difficulty) => updateArgs({ difficulty }),
          options: towersStoryDifficultyOptions,
          labels: towersStoryDifficultyLabels,
        }}
        rounds={{
          value: rounds,
          onChange: (rounds) => updateArgs({ rounds }),
          error: roundsError || undefined,
        }}
        stopConditions={{
          labels: stopConditionsLabels,
          onWinValue,
          onLossValue,
          stopProfitValue,
          stopLossValue,
          isActiveOnWin,
          isActiveOnLoss,
          onWinChange: setOnWinValue,
          onLossChange: setOnLossValue,
          onStopProfitChange: setStopProfitValue,
          onStopLossChange: setStopLossValue,
          onWinToggle: setIsActiveOnWin,
          onLossToggle: setIsActiveOnLoss,
        }}
        actions={{
          clearSelection: {
            label: clearSelectionLabel,
            disabled: clearSelectionDisabled,
            onClick: () => undefined,
          },
          random: {
            label: randomLabel,
            visible: randomVisible,
            disabled: randomDisabled,
            onClick: () => undefined,
          },
        }}
      />
    </OriginalsConfigStoryLayout>
  );
}

const meta = {
  title: 'Features/Games/Originals/Towers/Towers Config',
  component: TowersConfig,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: {
      include: [
        'mode',
        'tabsDisabled',
        'fieldsDisabled',
        'betAmountLoading',
        'betAmount',
        'difficulty',
        'rounds',
        'manualActionLabel',
        'autoActionLabel',
        'autoActionVariant',
        'manualActionDisabled',
        'autoActionDisabled',
        'clearSelectionLabel',
        'clearSelectionDisabled',
        'randomLabel',
        'randomVisible',
        'randomDisabled',
        'theatreMode',
        'betAmountError',
        'showBetAmountThresholdWarning',
        'betAmountThresholdTitle',
        'betAmountThresholdDescription',
        'roundsError',
        'autobetSessionState',
        'autobetTotalWagered',
        'autobetNetProfit',
        'autobetWinRate',
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
    difficulty: {
      control: { type: 'select' },
      options: [0, 1, 2],
    },
    rounds: { control: { type: 'text' } },
    manualActionLabel: { control: { type: 'text' } },
    autoActionLabel: { control: { type: 'text' } },
    autoActionVariant: {
      control: { type: 'select' },
      options: ['start', 'stop', 'retry'],
    },
    manualActionDisabled: { control: { type: 'boolean' } },
    autoActionDisabled: { control: { type: 'boolean' } },
    clearSelectionLabel: { control: { type: 'text' } },
    clearSelectionDisabled: { control: { type: 'boolean' } },
    randomLabel: { control: { type: 'text' } },
    randomVisible: { control: { type: 'boolean' } },
    randomDisabled: { control: { type: 'boolean' } },
    theatreMode: { control: { type: 'boolean' } },
    betAmountError: { control: { type: 'text' } },
    showBetAmountThresholdWarning: { control: { type: 'boolean' } },
    betAmountThresholdTitle: { control: { type: 'text' } },
    betAmountThresholdDescription: { control: { type: 'text' } },
    roundsError: { control: { type: 'text' } },
    autobetSessionState: {
      control: { type: 'select' },
      options: [
        'live',
        'paused',
        'complete',
        'insufficient-balance',
        'awaiting-bets',
        'ready-to-start',
      ],
    },
    autobetTotalWagered: { control: { type: 'text' } },
    autobetNetProfit: { control: { type: 'text' } },
    autobetWinRate: { control: { type: 'text' } },
  },
} satisfies Meta;

export default meta;

const playgroundDefaultArgs = {
  mode: 'manual',
  tabsDisabled: false,
  fieldsDisabled: false,
  betAmountLoading: false,
  betAmount: '1.00',
  difficulty: 1,
  rounds: '100',
  manualActionLabel: 'Place Bet',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  clearSelectionLabel: 'Clear Selection',
  clearSelectionDisabled: true,
  randomLabel: 'Random',
  randomVisible: false,
  randomDisabled: false,
  theatreMode: false,
  betAmountError: '',
  showBetAmountThresholdWarning: false,
  betAmountThresholdTitle: 'High payout warning',
  betAmountThresholdDescription: 'This bet exceeds the recommended payout threshold.',
  roundsError: '',
  autobetSessionState: 'ready-to-start',
  autobetTotalWagered: '$0.00',
  autobetNetProfit: '$0.00',
  autobetWinRate: '0%',
} satisfies PlaygroundArgs;

export const Playground: StoryObj<PlaygroundArgs> = {
  args: playgroundDefaultArgs,
  render: TowersConfigPlayground,
};

export const Manual: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'manual',
    difficulty: 0,
  },
  render: TowersConfigPlayground,
};

export const ManualRoundInProgress: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'manual',
    difficulty: 1,
    fieldsDisabled: true,
    tabsDisabled: true,
    randomVisible: true,
    manualActionLabel: 'Cashout',
  },
  render: TowersConfigPlayground,
};

export const Auto: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    difficulty: 2,
    clearSelectionDisabled: false,
  },
  render: TowersConfigPlayground,
};

export const AutobetRunning: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    tabsDisabled: true,
    fieldsDisabled: true,
    difficulty: 1,
    autoActionLabel: 'Stop',
    autoActionVariant: 'stop',
    manualActionDisabled: true,
    autobetSessionState: 'live',
    autobetTotalWagered: '$1,250.00',
    autobetNetProfit: '+$320.50',
    autobetWinRate: '62%',
  },
  render: TowersConfigPlayground,
};

export const InsufficientBalance: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    difficulty: 1,
    autoActionLabel: 'Retry',
    autoActionVariant: 'retry',
    clearSelectionDisabled: false,
    autobetSessionState: 'insufficient-balance',
    autobetTotalWagered: '$500.00',
    autobetNetProfit: '-$500.00',
    autobetWinRate: '40%',
  },
  render: TowersConfigPlayground,
};

export const Paused: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    difficulty: 0,
    autoActionLabel: 'Start 99 Bets',
    clearSelectionDisabled: false,
    autobetSessionState: 'paused',
    autobetTotalWagered: '$10.00',
    autobetNetProfit: '+$2.00',
    autobetWinRate: '100%',
  },
  render: TowersConfigPlayground,
};

export const PausedInfiniteBets: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    difficulty: 2,
    rounds: 'Infinity',
    autoActionLabel: 'Start ∞ Bets',
    clearSelectionDisabled: false,
    autobetSessionState: 'paused',
    autobetTotalWagered: '$25.00',
    autobetNetProfit: '-$5.00',
    autobetWinRate: '50%',
  },
  render: TowersConfigPlayground,
};

export const TheatreMode: StoryObj<PlaygroundArgs> = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: {
    ...playgroundDefaultArgs,
    theatreMode: true,
  },
  render: TowersConfigPlayground,
};
