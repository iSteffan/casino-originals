'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect, useRef } from 'storybook/preview-api';

import { DiceBoard } from '#ui/features/games/originals/dice/dice-board/dice-board';
import type { DiceBoardProps } from '#ui/features/games/originals/dice/dice-board/dice-board.types';
import { DiceConfig } from '#ui/features/games/originals/dice/dice-config/dice-config';
import type { DiceConfigProps } from '#ui/features/games/originals/dice/dice-config/dice-config.types';
import {
  applyDiceDirectionToggle,
  applyDiceDisplayValueUpdate,
  applyDiceMultiplierUpdate,
  applyDiceWinChanceUpdate,
  DICE_DEFAULT_RTP,
  isDiceStoryWin,
  normalizeDiceRtp,
} from '#ui/features/games/originals/dice/dice-controls/dice-controls.story-math';
import type {
  DiceControlsActiveField,
  DiceControlsDirection,
} from '#ui/features/games/originals/dice/dice-controls/dice-controls.types';
import type {
  DiceCubeAnimationDirection,
  DiceCubeMarkerState,
} from '#ui/features/games/originals/dice/dice-cube/dice-cube.types';
import { DICE_CUBE_ANIMATION_DURATION_MS } from '#ui/features/games/originals/dice/dice-cube/dice-cube.utils';
import type { DiceLastResultItem } from '#ui/features/games/originals/dice/dice-last-results/dice-last-results.types';
import {
  createDiceStoryLastResult,
  diceStoryBetAmountTooltip,
  diceStoryBoardLabels,
  diceStoryControlsLabels,
  diceStoryCurrencyIcon,
  diceStoryLastResults,
  diceStoryLastResultsAriaLabel,
  diceStoryLastResultsAssets,
  diceStoryLastResultsLabels,
  diceStoryStopConditionsLabels,
  diceStoryWinCurrencyIcon,
  diceStoryWinModalContentClassName,
} from '#ui/features/games/originals/dice/dice-story-helpers';
import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import type { AutobetSessionState } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';
import { GameWinModal } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { cn } from '#ui/lib/cn';
import { shouldReduceMotion } from '#ui/lib/motion';

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
  volume: number;
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
  rolledNumber: number;
  markerValue: number | null;
  markerState: DiceCubeMarkerState;
  isAnimating: boolean;
  animationDirection: DiceCubeAnimationDirection;
  reducedMotion: boolean;
  lastResults: DiceLastResultItem[];
  resultAnnouncement?: DiceBoardProps['resultAnnouncement'];
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
}

function DiceCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResultsRef = useRef(args.lastResults);

  useEffect(() => {
    lastResultsRef.current = args.lastResults;
  }, [args.lastResults]);

  useEffect(
    () => () => {
      if (settleTimeoutRef.current !== null) {
        clearTimeout(settleTimeoutRef.current);
      }
    },
    [],
  );

  const rtpValue = normalizeDiceRtp(args.rtp);

  const clearSettleTimeout = () => {
    if (settleTimeoutRef.current !== null) {
      clearTimeout(settleTimeoutRef.current);
      settleTimeoutRef.current = null;
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

  const updateBetAmount = (factor: number) => {
    const value = Number.parseFloat(args.betAmount);
    if (!Number.isNaN(value)) {
      updateArgs({ betAmount: (value * factor).toFixed(2) });
    }
  };

  const simulateRoll = (targetValue: number) => {
    if (args.isAnimating) return;

    clearSettleTimeout();

    const threshold = args.displayValue;
    const prev = args.markerValue ?? threshold;
    const isWin = isDiceStoryWin(targetValue, threshold, args.direction);
    const betAmount = args.betAmount;
    const multiplier = args.multiplier;

    const settle = () => {
      const result = createDiceStoryLastResult(targetValue, isWin ? 'green' : 'red');
      updateArgs({
        isAnimating: false,
        markerState: isWin ? 'win' : 'lose',
        lastResults: [result, ...lastResultsRef.current].slice(0, 40),
        resultAnnouncement: {
          id: result.id,
          message: `${targetValue.toFixed(2)}. ${isWin ? 'Win' : 'Loss'}.`,
        },
        showWinModal: isWin,
        winMultiplier: `x${multiplier.toFixed(2)}`,
        winAmount: (Number.parseFloat(betAmount) * multiplier || 0).toFixed(2),
      });
      settleTimeoutRef.current = null;
    };

    if (args.reducedMotion || shouldReduceMotion()) {
      const result = createDiceStoryLastResult(targetValue, isWin ? 'green' : 'red');
      updateArgs({
        markerState: isWin ? 'win' : 'lose',
        isAnimating: false,
        animationDirection: targetValue > prev ? 'right' : 'left',
        rolledNumber: targetValue,
        markerValue: targetValue,
        lastResults: [result, ...lastResultsRef.current].slice(0, 40),
        resultAnnouncement: {
          id: result.id,
          message: `${targetValue.toFixed(2)}. ${isWin ? 'Win' : 'Loss'}.`,
        },
        showWinModal: isWin,
        winMultiplier: `x${multiplier.toFixed(2)}`,
        winAmount: (Number.parseFloat(betAmount) * multiplier || 0).toFixed(2),
      });
      return;
    }

    updateArgs({
      markerState: 'play',
      isAnimating: true,
      animationDirection: targetValue > prev ? 'right' : 'left',
      rolledNumber: targetValue,
      markerValue: targetValue,
      resultAnnouncement: undefined,
      showWinModal: false,
    });

    settleTimeoutRef.current = setTimeout(settle, DICE_CUBE_ANIMATION_DURATION_MS);
  };

  const fieldsDisabled = args.fieldsDisabled || args.isAnimating;
  const config = {
    shell: {
      mode: args.mode,
      onModeChange: (mode) => updateArgs({ mode }),
      tabsDisabled: args.tabsDisabled || args.isAnimating,
      autobetSession: {
        state: args.autobetSessionState,
        totalWagered: args.autobetTotalWagered,
        netProfit: args.autobetNetProfit,
        winRate: args.autobetWinRate,
      },
      manualActionLabel: args.isAnimating ? 'Rolling...' : args.manualActionLabel,
      autoActionLabel: args.autoActionLabel,
      autoActionVariant: args.autoActionVariant,
      manualActionDisabled: args.manualActionDisabled,
      manualActionPending: args.isAnimating,
      autoActionDisabled: args.autoActionDisabled || args.isAnimating,
      theatreMode: args.theatreMode,
      onManualAction: () => simulateRoll(Math.random() * 94 + 3),
      onAutoAction: () => undefined,
    },
    betAmount: {
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
    },
    rounds: {
      value: args.rounds,
      onChange: (rounds) => updateArgs({ rounds }),
      error: args.roundsError || undefined,
    },
    fieldsDisabled,
    diceControls: {
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
    },
    stopConditions: {
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
    },
  } satisfies DiceConfigProps;

  return (
    <div
      className={cn(
        'bg-ds-black p-ds-4 md:p-ds-8 w-full',
        args.theatreMode ? 'h-dvh' : 'min-h-screen',
      )}
    >
      <div
        className={cn(
          'mx-auto flex w-full min-w-0 flex-col',
          args.theatreMode ? 'h-full max-w-[1750px]' : 'max-w-[1400px]',
        )}
      >
        <OriginalsGameShell
          header={
            <GameHeader
              title="Dice"
              onBackClick={() => undefined}
              showVolumeControl
              volume={args.volume}
              onVolumeChange={(volume) => updateArgs({ volume })}
              isTheatreMode={args.theatreMode}
              onTheatreToggle={() => updateArgs({ theatreMode: !args.theatreMode })}
            />
          }
          config={
            <DiceConfig
              shell={config.shell}
              betAmount={config.betAmount}
              rounds={config.rounds}
              stopConditions={config.stopConditions}
              fieldsDisabled={config.fieldsDisabled}
              diceControls={config.diceControls}
            />
          }
          board={
            <DiceBoard
              displayValue={args.displayValue}
              rolledNumber={args.rolledNumber}
              markerValue={args.markerValue}
              markerState={args.markerState}
              isAnimating={args.isAnimating}
              animationDirection={args.animationDirection}
              reducedMotion={args.reducedMotion}
              labels={diceStoryBoardLabels}
              lastResults={args.lastResults}
              lastResultsAssets={diceStoryLastResultsAssets}
              lastResultsLabels={diceStoryLastResultsLabels}
              lastResultsAriaLabel={diceStoryLastResultsAriaLabel}
              resultAnnouncement={args.showWinModal ? undefined : args.resultAnnouncement}
              sliderValue={args.displayValue}
              onSliderValueChange={(value) =>
                applyLinked(applyDiceDisplayValueUpdate(value, args.direction, rtpValue))
              }
              sliderDisabled={fieldsDisabled}
              direction={args.direction}
              theatreMode={args.theatreMode}
              overlay={
                <GameWinModal
                  open={args.showWinModal}
                  title="You win!"
                  multiplierLabel="Multiplier"
                  multiplier={args.winMultiplier}
                  formattedWinAmount={args.winAmount}
                  currencyIcon={diceStoryWinCurrencyIcon}
                  contentClassName={diceStoryWinModalContentClassName}
                />
              }
            />
          }
          theatreMode={args.theatreMode}
        />
      </div>
    </div>
  );
}

const initialLinked = applyDiceDisplayValueUpdate(50.25, 'UNDER', DICE_DEFAULT_RTP);

const defaultArgs = {
  mode: 'manual',
  tabsDisabled: false,
  fieldsDisabled: false,
  betAmountLoading: false,
  betAmount: '1.00',
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
  volume: 0.75,
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
  rolledNumber: 42.18,
  markerValue: 42.18,
  markerState: 'win',
  isAnimating: false,
  animationDirection: 'right',
  reducedMotion: false,
  lastResults: diceStoryLastResults,
  showWinModal: false,
  winMultiplier: 'x1.96',
  winAmount: '1.96',
} satisfies PlaygroundArgs;

const meta = {
  title: 'Features/Games/Originals/Dice/Dice Composition',
  render: DiceCompositionStory,
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
        'reducedMotion',
        'volume',
        'betAmountError',
        'showBetAmountThresholdWarning',
        'betAmountThresholdTitle',
        'betAmountThresholdDescription',
        'roundsError',
        'autobetSessionState',
        'autobetTotalWagered',
        'autobetNetProfit',
        'autobetWinRate',
        'showWinModal',
        'winMultiplier',
        'winAmount',
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
    reducedMotion: { control: { type: 'boolean' } },
    volume: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
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
    showWinModal: { control: { type: 'boolean' } },
    winMultiplier: { control: { type: 'text' } },
    winAmount: { control: { type: 'text' } },
  },
  args: defaultArgs,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TheatreMode: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: { theatreMode: true },
};

export const ReducedMotion: Story = {
  args: { reducedMotion: true },
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

export const WithWinModal: Story = {
  args: { showWinModal: true },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
