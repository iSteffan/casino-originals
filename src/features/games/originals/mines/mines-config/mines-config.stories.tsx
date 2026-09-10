'use client';

import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { MinesConfig } from './mines-config';
import type { MinesGridSizeValue } from './mines-config.utils';

import {
  getMinesStoryGridSettings,
  getMinesStoryGridSizeUpdate,
} from '#ui/features/games/originals/mines/mines-story-helpers';
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
  gridSize: MinesGridSizeValue;
  numberOfMines: number;
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  clearSelectionLabel?: string;
  clearSelectionDisabled?: boolean;
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

function MinesConfigPlayground() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const {
    mode,
    tabsDisabled,
    fieldsDisabled,
    betAmountLoading,
    betAmount,
    gridSize,
    numberOfMines,
    rounds = '100',
    manualActionLabel,
    autoActionLabel,
    autoActionVariant = 'start',
    manualActionDisabled,
    autoActionDisabled,
    clearSelectionLabel = 'Clear Selection',
    clearSelectionDisabled = true,
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
  const gridSettings = getMinesStoryGridSettings(gridSize);

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

  const updateGridSize = (nextGridSize: number) => {
    const gridSize = nextGridSize as MinesGridSizeValue;
    updateArgs(getMinesStoryGridSizeUpdate(gridSize, numberOfMines));
  };

  return (
    <OriginalsConfigStoryLayout theatreMode={theatreMode}>
      <MinesConfig
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
        board={{
          gridSize,
          onGridSizeChange: updateGridSize,
          gridSizeLabel: 'Grid Size',
          numberOfMines,
          minNumberOfMines: gridSettings.minNumberOfMines,
          maxNumberOfMines: gridSettings.maxNumberOfMines,
          totalCells: gridSettings.totalCells,
          onNumberOfMinesChange: (numberOfMines) => updateArgs({ numberOfMines }),
          minesSliderLabel: 'Number of Mines',
          sliderAssets: {
            thumb: '/img/games/mines/mines-thumb.svg',
            safe: '/img/games/mines/gold.svg',
            mine: '/img/games/mines/mine.svg',
          },
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
        clearSelection={{
          label: clearSelectionLabel,
          disabled: clearSelectionDisabled,
          onClick: () => undefined,
        }}
      />
    </OriginalsConfigStoryLayout>
  );
}

const meta = {
  title: 'Features/Games/Originals/Mines/Mines Config',
  component: MinesConfig,
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
        'gridSize',
        'numberOfMines',
        'rounds',
        'manualActionLabel',
        'autoActionLabel',
        'autoActionVariant',
        'manualActionDisabled',
        'autoActionDisabled',
        'clearSelectionLabel',
        'clearSelectionDisabled',
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
    gridSize: {
      control: { type: 'select' },
      options: [4, 5, 6, 8],
    },
    numberOfMines: { control: { type: 'number', min: 1, max: 63 } },
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
  gridSize: 5,
  numberOfMines: 3,
  rounds: '100',
  manualActionLabel: 'Place Bet',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  clearSelectionLabel: 'Clear Selection',
  clearSelectionDisabled: true,
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
  render: MinesConfigPlayground,
};

export const Manual: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'manual',
    gridSize: 4,
    numberOfMines: 1,
  },
  render: MinesConfigPlayground,
};

export const ManualRoundInProgress: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'manual',
    gridSize: 5,
    numberOfMines: 5,
    fieldsDisabled: true,
    tabsDisabled: true,
    manualActionLabel: 'Payout',
  },
  render: MinesConfigPlayground,
};

export const Auto: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    gridSize: 6,
    numberOfMines: 10,
    clearSelectionDisabled: false,
  },
  render: MinesConfigPlayground,
};

export const AutobetRunning: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    tabsDisabled: true,
    fieldsDisabled: true,
    gridSize: 5,
    numberOfMines: 3,
    autoActionLabel: 'Stop',
    autoActionVariant: 'stop',
    manualActionDisabled: true,
    autobetSessionState: 'live',
    autobetTotalWagered: '$1,250.00',
    autobetNetProfit: '+$320.50',
    autobetWinRate: '62%',
  },
  render: MinesConfigPlayground,
};

export const InsufficientBalance: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    gridSize: 5,
    numberOfMines: 3,
    autoActionLabel: 'Retry',
    autoActionVariant: 'retry',
    clearSelectionDisabled: false,
    autobetSessionState: 'insufficient-balance',
    autobetTotalWagered: '$500.00',
    autobetNetProfit: '-$500.00',
    autobetWinRate: '40%',
  },
  render: MinesConfigPlayground,
};

export const Paused: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    gridSize: 4,
    numberOfMines: 2,
    autoActionLabel: 'Start 99 Bets',
    clearSelectionDisabled: false,
    autobetSessionState: 'paused',
    autobetTotalWagered: '$10.00',
    autobetNetProfit: '+$2.00',
    autobetWinRate: '100%',
  },
  render: MinesConfigPlayground,
};

export const PausedInfiniteBets: StoryObj<PlaygroundArgs> = {
  args: {
    ...playgroundDefaultArgs,
    mode: 'auto',
    gridSize: 8,
    numberOfMines: 20,
    rounds: 'Infinity',
    autoActionLabel: 'Start ∞ Bets',
    clearSelectionDisabled: false,
    autobetSessionState: 'paused',
    autobetTotalWagered: '$25.00',
    autobetNetProfit: '-$5.00',
    autobetWinRate: '50%',
  },
  render: MinesConfigPlayground,
};

export const TheatreMode: StoryObj<PlaygroundArgs> = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: {
    ...playgroundDefaultArgs,
    theatreMode: true,
  },
  render: MinesConfigPlayground,
};
