'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useState } from 'storybook/preview-api';

import { KenoConfig } from './keno-config';

import {
  kenoStoryRiskLabels,
  kenoStoryRiskOptions,
} from '#ui/features/games/originals/keno/keno-story-helpers';
import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import { OriginalsConfigStoryLayout } from '#ui/features/games/originals/originals-config-theatre-decorator';
import type { AutobetSessionState } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';

const currencyIcon = (
  <img
    src="/icon/animate-icons/strike-coin.svg"
    alt=""
    width={20}
    height={20}
    className="rounded-ds-full size-5"
  />
);

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
  risk: string;
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  autoPickLabel: string;
  autoPickDisabled: boolean;
  clearTableLabel: string;
  clearTableDisabled: boolean;
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

function KenoConfigPlayground() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const {
    mode,
    tabsDisabled,
    fieldsDisabled,
    betAmountLoading,
    betAmount,
    risk,
    rounds = '100',
    manualActionLabel,
    autoActionLabel,
    autoActionVariant = 'start',
    manualActionDisabled,
    autoActionDisabled,
    autoPickLabel = 'Auto Pick',
    autoPickDisabled = false,
    clearTableLabel = 'Clear Table',
    clearTableDisabled = true,
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
      <KenoConfig
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
          currencyIcon,
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
          options: kenoStoryRiskOptions,
          labels: kenoStoryRiskLabels,
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
          autoPick: {
            label: autoPickLabel,
            disabled: autoPickDisabled,
            onClick: () => undefined,
          },
          clearTable: {
            label: clearTableLabel,
            disabled: clearTableDisabled,
            onClick: () => undefined,
          },
        }}
      />
    </OriginalsConfigStoryLayout>
  );
}

const meta = {
  title: 'Features/Games/Originals/Keno/Keno Config',
  component: KenoConfig,
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
        'risk',
        'rounds',
        'manualActionLabel',
        'autoActionLabel',
        'autoActionVariant',
        'manualActionDisabled',
        'autoActionDisabled',
        'autoPickLabel',
        'autoPickDisabled',
        'clearTableLabel',
        'clearTableDisabled',
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
    risk: {
      control: { type: 'select' },
      options: ['classic', 'low', 'medium', 'high'],
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
    autoPickLabel: { control: { type: 'text' } },
    autoPickDisabled: { control: { type: 'boolean' } },
    clearTableLabel: { control: { type: 'text' } },
    clearTableDisabled: { control: { type: 'boolean' } },
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
  risk: 'medium',
  rounds: '100',
  manualActionLabel: 'Place Bet',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: true,
  autoActionDisabled: false,
  autoPickLabel: 'Auto Pick',
  autoPickDisabled: false,
  clearTableLabel: 'Clear Table',
  clearTableDisabled: true,
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
  render: KenoConfigPlayground,
};

export const Manual: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'manual',
    risk: 'low',
    manualActionDisabled: false,
    clearTableDisabled: false,
  },
  render: KenoConfigPlayground,
};

export const Auto: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    risk: 'high',
    manualActionDisabled: true,
    clearTableDisabled: false,
  },
  render: KenoConfigPlayground,
};

export const AutobetRunning: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    tabsDisabled: true,
    fieldsDisabled: true,
    risk: 'medium',
    autoActionLabel: 'Stop',
    autoActionVariant: 'stop',
    autoPickDisabled: true,
    clearTableDisabled: true,
    manualActionDisabled: true,
    autobetSessionState: 'live',
    autobetTotalWagered: '$1,250.00',
    autobetNetProfit: '+$320.50',
    autobetWinRate: '62%',
  },
  render: KenoConfigPlayground,
};

export const InsufficientBalance: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    risk: 'medium',
    autoActionLabel: 'Retry',
    autoActionVariant: 'retry',
    clearTableDisabled: false,
    autobetSessionState: 'insufficient-balance',
    autobetTotalWagered: '$500.00',
    autobetNetProfit: '-$500.00',
    autobetWinRate: '40%',
  },
  render: KenoConfigPlayground,
};

export const Paused: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    risk: 'classic',
    autoActionLabel: 'Start 99 Bets',
    clearTableDisabled: false,
    autobetSessionState: 'paused',
    autobetTotalWagered: '$10.00',
    autobetNetProfit: '+$2.00',
    autobetWinRate: '100%',
  },
  render: KenoConfigPlayground,
};

export const PausedInfiniteBets: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    risk: 'high',
    rounds: 'Infinity',
    autoActionLabel: 'Start ∞ Bets',
    clearTableDisabled: false,
    autobetSessionState: 'paused',
    autobetTotalWagered: '$25.00',
    autobetNetProfit: '-$5.00',
    autobetWinRate: '50%',
  },
  render: KenoConfigPlayground,
};

export const TheatreMode: StoryObj<PlaygroundArgs> = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: {
    ...playgroundDefaultArgs,
    theatreMode: true,
    manualActionDisabled: false,
    clearTableDisabled: false,
  },
  render: KenoConfigPlayground,
};
