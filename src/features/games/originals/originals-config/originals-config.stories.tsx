'use client';

import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  type OriginalsConfigAutoActionVariant,
  type OriginalsConfigMode,
} from './originals-config';
import {
  buildOriginalsGameConfigProps,
  OriginalsGameConfig,
} from './originals-game-config';

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
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  betAmountDisabled: boolean;
  betAmountLoading: boolean;
  width: number;
  theatreMode: boolean;
  showAutobetSession: boolean;
  betAmountError?: string;
  showBetAmountThresholdWarning?: boolean;
  betAmountThresholdTitle?: string;
  betAmountThresholdDescription?: string;
  roundsError?: string;
  roundsMax?: number;
  roundsPlaceholder?: string;
  autobetSessionState?: AutobetSessionState;
  autobetTotalWagered?: string;
  autobetNetProfit?: string;
  autobetWinRate?: string;
}

function OriginalsConfigPlayground({
  mode: modeArg,
  tabsDisabled,
  manualActionLabel,
  autoActionLabel,
  autoActionVariant = 'start',
  manualActionDisabled,
  autoActionDisabled,
  betAmountDisabled,
  betAmountLoading,
  width,
  theatreMode,
  showAutobetSession,
  betAmountError = '',
  showBetAmountThresholdWarning = false,
  betAmountThresholdTitle = 'High payout warning',
  betAmountThresholdDescription = 'This bet exceeds the recommended payout threshold.',
  roundsError = '',
  roundsMax,
  roundsPlaceholder,
  autobetSessionState = 'ready-to-start',
  autobetTotalWagered = '$0.00',
  autobetNetProfit = '$0.00',
  autobetWinRate = '0%',
}: PlaygroundArgs) {
  const [mode, setMode] = useState<OriginalsConfigMode>(modeArg);
  const [betAmount, setBetAmount] = useState('1.00');
  const [rounds, setRounds] = useState('100');
  const [isActiveOnWin, setIsActiveOnWin] = useState(false);
  const [isActiveOnLoss, setIsActiveOnLoss] = useState(false);
  const [onWinValue, setOnWinValue] = useState(50);
  const [onLossValue, setOnLossValue] = useState(50);
  const [stopProfitValue, setStopProfitValue] = useState('');
  const [stopLossValue, setStopLossValue] = useState('');

  useEffect(() => {
    setMode(modeArg);
  }, [modeArg]);

  const resolvedAutoActionLabel =
    autoActionVariant === 'stop'
      ? 'Stop'
      : autoActionVariant === 'retry'
        ? 'Retry'
        : autoActionLabel;

  return (
    <OriginalsConfigStoryLayout theatreMode={theatreMode}>
      <OriginalsGameConfig
        {...buildOriginalsGameConfigProps({
          mode,
          onModeChange: setMode,
          tabsDisabled,
          manualActionLabel,
          autoActionLabel: resolvedAutoActionLabel,
          autoActionVariant,
          manualActionDisabled,
          autoActionDisabled,
          autobetSession: showAutobetSession
            ? {
                state: autobetSessionState,
                totalWagered: autobetTotalWagered,
                netProfit: autobetNetProfit,
                winRate: autobetWinRate,
              }
            : undefined,
          width,
          theatreMode,
          onManualAction: () => undefined,
          onAutoAction: () => undefined,
          betAmount,
          onBetAmountChange: setBetAmount,
          betAmountLabel: 'Bet Amount',
          betAmountConversionText: '0.000145 BTC',
          betAmountTooltip,
          currencyIcon,
          betAmountLoading,
          betAmountError: betAmountError || undefined,
          betAmountThresholdWarning: showBetAmountThresholdWarning
            ? {
                title: betAmountThresholdTitle,
                description: betAmountThresholdDescription,
              }
            : null,
          betAmountQuickActions: [
            {
              label: '½',
              onClick: () =>
                setBetAmount((current) => {
                  const parsed = Number.parseFloat(current);
                  if (Number.isNaN(parsed)) return current;
                  return (parsed / 2).toFixed(2);
                }),
            },
            {
              label: '2x',
              onClick: () =>
                setBetAmount((current) => {
                  const parsed = Number.parseFloat(current);
                  if (Number.isNaN(parsed)) return current;
                  return (parsed * 2).toFixed(2);
                }),
            },
          ],
          rounds,
          onRoundsChange: setRounds,
          roundsError: roundsError || undefined,
          roundsMax,
          roundsPlaceholder,
          stopConditions: {
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
          },
          fieldsDisabled: betAmountDisabled,
        })}
      />
    </OriginalsConfigStoryLayout>
  );
}

const meta = {
  title: 'Features/Games/Originals/Originals Config',
  component: OriginalsGameConfig,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: {
      include: [
        'mode',
        'tabsDisabled',
        'manualActionLabel',
        'autoActionLabel',
        'autoActionVariant',
        'manualActionDisabled',
        'autoActionDisabled',
        'betAmountDisabled',
        'betAmountLoading',
        'width',
        'theatreMode',
        'showAutobetSession',
        'betAmountError',
        'showBetAmountThresholdWarning',
        'betAmountThresholdTitle',
        'betAmountThresholdDescription',
        'roundsError',
        'roundsMax',
        'roundsPlaceholder',
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
    manualActionLabel: { control: { type: 'text' } },
    autoActionLabel: { control: { type: 'text' } },
    autoActionVariant: {
      control: { type: 'select' },
      options: ['start', 'stop', 'retry'],
    },
    manualActionDisabled: { control: { type: 'boolean' } },
    autoActionDisabled: { control: { type: 'boolean' } },
    betAmountDisabled: { control: { type: 'boolean' }, name: 'Bet amount disabled' },
    betAmountLoading: { control: { type: 'boolean' }, name: 'Bet amount loading' },
    width: { control: { type: 'number', min: 240, max: 360, step: 4 } },
    theatreMode: { control: { type: 'boolean' } },
    showAutobetSession: { control: { type: 'boolean' } },
    betAmountError: { control: { type: 'text' } },
    showBetAmountThresholdWarning: { control: { type: 'boolean' } },
    betAmountThresholdTitle: { control: { type: 'text' } },
    betAmountThresholdDescription: { control: { type: 'text' } },
    roundsError: { control: { type: 'text' } },
    roundsMax: { control: { type: 'number', min: 1, max: 100000, step: 1 } },
    roundsPlaceholder: { control: { type: 'text' } },
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
  manualActionLabel: 'Place Bet',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  betAmountDisabled: false,
  betAmountLoading: false,
  width: 280,
  theatreMode: false,
  showAutobetSession: true,
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
  render: (args) => <OriginalsConfigPlayground {...args} />,
};

export const Manual: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'manual',
  },
  render: (args) => <OriginalsConfigPlayground {...args} />,
};

export const Auto: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
  },
  render: (args) => <OriginalsConfigPlayground {...args} />,
};

export const TheatreMode: StoryObj<PlaygroundArgs> = {
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
  args: {
    ...playgroundDefaultArgs,
    mode: 'manual',
    theatreMode: true,
    autobetSessionState: 'paused',
    autobetTotalWagered: '$15.00',
    autobetNetProfit: '+$4.00',
    autobetWinRate: '67%',
  },
  render: (args) => <OriginalsConfigPlayground {...args} />,
};
