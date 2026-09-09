'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';

import { DiceConfig } from './dice-config';

import {
  applyDiceDirectionToggle,
  applyDiceDisplayValueUpdate,
  applyDiceMultiplierUpdate,
  applyDiceWinChanceUpdate,
  DICE_DEFAULT_RTP,
  normalizeDiceRtp,
} from '#ui/features/games/originals/dice/dice-controls/dice-controls.story-math';
import type {
  DiceControlsActiveField,
  DiceControlsDirection,
} from '#ui/features/games/originals/dice/dice-controls/dice-controls.types';
import {
  diceStoryBetAmountTooltip,
  diceStoryControlsLabels,
  diceStoryCurrencyIcon,
  diceStoryStopConditionsLabels,
} from '#ui/features/games/originals/dice/dice-story-helpers';
import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import { OriginalsConfigStoryLayout } from '#ui/features/games/originals/originals-config-theatre-decorator';
import type { AutobetSessionState } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';

interface PlaygroundArgs {
  mode: OriginalsConfigMode;
  tabsDisabled: boolean;
  fieldsDisabled: boolean;
  betAmountLoading: boolean;
  betAmount: string;
  direction: DiceControlsDirection;
  displayValue: number;
  winChance: number;
  multiplier: number;
  activeField: DiceControlsActiveField;
  rtp: number;
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  theatreMode: boolean;
  betAmountError: string;
  showBetAmountThresholdWarning: boolean;
  betAmountThresholdTitle: string;
  betAmountThresholdDescription: string;
  roundsError: string;
  autobetSessionState: AutobetSessionState;
  autobetTotalWagered: string;
  autobetNetProfit: string;
  autobetWinRate: string;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
}

function DiceConfigPlayground() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const rtpValue = normalizeDiceRtp(args.rtp);
  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: args.autoActionVariant === 'stop',
    isInsufficientBalance: args.autoActionVariant === 'retry',
    startAutobetLabel: args.autoActionLabel,
  });

  const updateBetAmount = (factor: number) => {
    const value = Number.parseFloat(args.betAmount);
    if (!Number.isNaN(value)) {
      updateArgs({ betAmount: (value * factor).toFixed(2) });
    }
  };

  const applyLinked = (linked: {
    direction?: DiceControlsDirection;
    displayValue: number;
    winChance: number;
    multiplier: number;
  }) => {
    updateArgs({
      ...(linked.direction ? { direction: linked.direction } : {}),
      displayValue: linked.displayValue,
      winChance: linked.winChance,
      multiplier: linked.multiplier,
    });
  };

  return (
    <OriginalsConfigStoryLayout theatreMode={args.theatreMode}>
      <DiceConfig
        shell={{
          mode: args.mode,
          onModeChange: (mode) => updateArgs({ mode }),
          tabsDisabled: args.tabsDisabled,
          autobetSession: {
            state: args.autobetSessionState,
            totalWagered: args.autobetTotalWagered,
            netProfit: args.autobetNetProfit,
            winRate: args.autobetWinRate,
          },
          manualActionLabel: args.manualActionLabel,
          autoActionLabel: autobetAction.label,
          autoActionVariant: autobetAction.variant,
          manualActionDisabled: args.manualActionDisabled,
          autoActionDisabled: args.autoActionDisabled,
          theatreMode: args.theatreMode,
          onManualAction: () => undefined,
          onAutoAction: () => undefined,
        }}
        betAmount={{
          value: args.betAmount,
          onChange: (betAmount) => updateArgs({ betAmount }),
          conversionText: '0.000145 BTC',
          tooltip: diceStoryBetAmountTooltip,
          currencyIcon: diceStoryCurrencyIcon,
          isLoading: args.betAmountLoading,
          error: args.betAmountError || undefined,
          thresholdWarning: args.showBetAmountThresholdWarning
            ? {
                title: args.betAmountThresholdTitle,
                description: args.betAmountThresholdDescription,
              }
            : null,
          quickActions: [
            { label: '½', onClick: () => updateBetAmount(0.5) },
            { label: '2x', onClick: () => updateBetAmount(2) },
          ],
        }}
        rounds={{
          value: args.rounds,
          onChange: (rounds) => updateArgs({ rounds }),
          error: args.roundsError || undefined,
        }}
        stopConditions={{
          labels: diceStoryStopConditionsLabels,
          onWinValue: args.onWinValue,
          onLossValue: args.onLossValue,
          stopProfitValue: args.stopProfitValue,
          stopLossValue: args.stopLossValue,
          isActiveOnWin: args.isActiveOnWin,
          isActiveOnLoss: args.isActiveOnLoss,
          onWinChange: (onWinValue) => updateArgs({ onWinValue }),
          onLossChange: (onLossValue) => updateArgs({ onLossValue }),
          onStopProfitChange: (stopProfitValue) => updateArgs({ stopProfitValue }),
          onStopLossChange: (stopLossValue) => updateArgs({ stopLossValue }),
          onWinToggle: (isActiveOnWin) => updateArgs({ isActiveOnWin }),
          onLossToggle: (isActiveOnLoss) => updateArgs({ isActiveOnLoss }),
        }}
        fieldsDisabled={args.fieldsDisabled}
        diceControls={{
          direction: args.direction,
          onDirectionToggle: () =>
            applyLinked(
              applyDiceDirectionToggle(args.direction, args.displayValue, rtpValue),
            ),
          displayValue: args.displayValue,
          winChance: args.winChance,
          multiplier: args.multiplier,
          onDisplayValueChange: (value) =>
            applyLinked(applyDiceDisplayValueUpdate(value, args.direction, rtpValue)),
          onWinChanceChange: (value) =>
            applyLinked(applyDiceWinChanceUpdate(value, args.direction, rtpValue)),
          onMultiplierChange: (value) =>
            applyLinked(applyDiceMultiplierUpdate(value, args.direction, rtpValue)),
          activeField: args.activeField,
          onActiveFieldChange: (activeField) => updateArgs({ activeField }),
          labels: diceStoryControlsLabels,
        }}
      />
    </OriginalsConfigStoryLayout>
  );
}

const initialLinked = applyDiceDisplayValueUpdate(50.25, 'UNDER', DICE_DEFAULT_RTP);

const defaultArgs = {
  mode: 'manual',
  tabsDisabled: false,
  fieldsDisabled: false,
  betAmountLoading: false,
  betAmount: '1000.00',
  direction: 'UNDER',
  displayValue: initialLinked.displayValue,
  winChance: initialLinked.winChance,
  multiplier: initialLinked.multiplier,
  activeField: null,
  rtp: DICE_DEFAULT_RTP,
  rounds: '100',
  manualActionLabel: 'Roll Dice',
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
  autobetSessionState: 'ready-to-start',
  autobetTotalWagered: '$0.00',
  autobetNetProfit: '$0.00',
  autobetWinRate: '0%',
  onWinValue: 50,
  onLossValue: 50,
  stopProfitValue: '',
  stopLossValue: '',
  isActiveOnWin: false,
  isActiveOnLoss: false,
} satisfies PlaygroundArgs;

const meta = {
  title: 'Features/Games/Originals/Dice/Dice Config',
  render: DiceConfigPlayground,
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
        'direction',
        'displayValue',
        'rtp',
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
    direction: {
      control: { type: 'inline-radio' },
      options: ['UNDER', 'OVER'],
    },
    displayValue: { control: { type: 'number', min: 3, max: 97, step: 0.01 } },
    rtp: { control: { type: 'number', min: 90, max: 99, step: 0.1 } },
    rounds: { control: { type: 'text' } },
    manualActionLabel: { control: { type: 'text' } },
    autoActionLabel: { control: { type: 'text' } },
    autoActionVariant: {
      control: { type: 'select' },
      options: ['start', 'stop', 'retry'],
    },
    manualActionDisabled: { control: { type: 'boolean' } },
    autoActionDisabled: { control: { type: 'boolean' } },
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
  args: defaultArgs,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Manual: Story = {
  args: {
    mode: 'manual',
    displayValue: applyDiceDisplayValueUpdate(33.33, 'UNDER', DICE_DEFAULT_RTP)
      .displayValue,
    winChance: applyDiceDisplayValueUpdate(33.33, 'UNDER', DICE_DEFAULT_RTP).winChance,
    multiplier: applyDiceDisplayValueUpdate(33.33, 'UNDER', DICE_DEFAULT_RTP).multiplier,
  },
};

export const ManualRolling: Story = {
  args: {
    mode: 'manual',
    tabsDisabled: true,
    fieldsDisabled: true,
    manualActionLabel: 'Rolling...',
    manualActionDisabled: true,
  },
};

export const BetAmountLoading: Story = {
  args: {
    betAmountLoading: true,
  },
};

export const ValidationErrors: Story = {
  args: {
    mode: 'auto',
    betAmountError: 'Enter an amount within your available balance.',
    roundsError: 'Enter a whole number of rounds.',
  },
};

export const LongActionLabel: Story = {
  args: {
    mode: 'auto',
    autoActionLabel: 'Start automatic betting with these settings',
  },
};

export const RollOver: Story = {
  args: {
    mode: 'manual',
    direction: 'OVER',
    displayValue: applyDiceDisplayValueUpdate(62.5, 'OVER', DICE_DEFAULT_RTP)
      .displayValue,
    winChance: applyDiceDisplayValueUpdate(62.5, 'OVER', DICE_DEFAULT_RTP).winChance,
    multiplier: applyDiceDisplayValueUpdate(62.5, 'OVER', DICE_DEFAULT_RTP).multiplier,
  },
};

export const Auto: Story = {
  args: {
    mode: 'auto',
    manualActionDisabled: true,
  },
};

export const AutobetRunning: Story = {
  args: {
    mode: 'auto',
    tabsDisabled: true,
    fieldsDisabled: true,
    autoActionLabel: 'Stop',
    autoActionVariant: 'stop',
    manualActionDisabled: true,
    autobetSessionState: 'live',
    autobetTotalWagered: '$1,250.00',
    autobetNetProfit: '+$320.50',
    autobetWinRate: '62%',
  },
};

export const InsufficientBalance: Story = {
  args: {
    mode: 'auto',
    autoActionLabel: 'Retry',
    autoActionVariant: 'retry',
    autobetSessionState: 'insufficient-balance',
    autobetTotalWagered: '$500.00',
    autobetNetProfit: '-$500.00',
    autobetWinRate: '40%',
  },
};

export const Paused: Story = {
  args: {
    mode: 'auto',
    autoActionLabel: 'Start 99 Bets',
    autobetSessionState: 'paused',
    autobetTotalWagered: '$10.00',
    autobetNetProfit: '+$2.00',
    autobetWinRate: '100%',
  },
};

export const PausedInfiniteBets: Story = {
  args: {
    mode: 'auto',
    rounds: 'Infinity',
    autoActionLabel: 'Start ∞ Bets',
    autobetSessionState: 'paused',
    autobetTotalWagered: '$25.00',
    autobetNetProfit: '-$5.00',
    autobetWinRate: '50%',
  },
};

export const TheatreMode: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: {
    theatreMode: true,
  },
};
