'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect, useRef, useState } from 'storybook/preview-api';

import { KenoBoard } from '#ui/features/games/originals/keno/keno-board/keno-board';
import type { KenoBoardProps } from '#ui/features/games/originals/keno/keno-board/keno-board.types';
import { KenoConfig } from '#ui/features/games/originals/keno/keno-config/keno-config';
import type { KenoConfigProps } from '#ui/features/games/originals/keno/keno-config/keno-config.types';
import type { KenoGridCell } from '#ui/features/games/originals/keno/keno-grid/keno-grid.types';
import {
  autoPickKenoStoryCells,
  countKenoStoryPickedCells,
  createKenoGridCells,
  createKenoStoryPaytableItems,
  createKenoStoryPickedCells,
  getKenoGridCellCount,
  getKenoStoryCellAriaLabel,
  getKenoStoryPaytableItemAriaLabel,
  getKenoStoryPickedNumbers,
  kenoStoryBetAmountTooltip,
  kenoStoryCellAssets,
  kenoStoryCurrencyIcon,
  kenoStoryHitsIconSrc,
  kenoStoryPaytableEmptyLabel,
  kenoStoryRiskLabels,
  kenoStoryRiskOptions,
  kenoStoryStopConditionsLabels,
  kenoStoryWinCurrencyIcon,
  playKenoStorySound,
  preloadKenoStorySounds,
  scheduleKenoStoryManualRound,
  setKenoStorySoundsVolume,
  settleKenoStoryCells,
  stopKenoStorySounds,
  toggleKenoStoryCell,
} from '#ui/features/games/originals/keno/keno-story-helpers';
import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
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
  risk: string;
  reducedMotion: boolean;
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  autoPickLabel: string;
  autoPickDisabled: boolean;
  clearTableLabel: string;
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
  cells: KenoGridCell[];
  reachedHits: number | null;
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
  previewWidth?: string;
  previewHeight?: string;
  resultAnnouncement?: KenoBoardProps['resultAnnouncement'];
}

function KenoCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const [isRoundPlaying, setIsRoundPlaying] = useState(false);
  const isRoundPlayingRef = useRef(false);
  const roundRunIdRef = useRef(0);
  const roundTimersRef = useRef<number[]>([]);
  const volumeRef = useRef(args.volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const expectedCellCount = getKenoGridCellCount();
  const cells =
    args.cells?.length === expectedCellCount ? args.cells : createKenoGridCells();
  const pickedCount = countKenoStoryPickedCells(cells);
  const hasSelection = pickedCount > 0;
  const hasBoardState = cells.some((cell) => (cell.state ?? 'idle') !== 'idle');
  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: args.autoActionVariant === 'stop',
    isInsufficientBalance: args.autoActionVariant === 'retry',
    startAutobetLabel: args.autoActionLabel,
  });
  const fieldsDisabled = args.fieldsDisabled || isRoundPlaying;
  const resetRoundPresentation = {
    reachedHits: null,
    showWinModal: false,
    resultAnnouncement: undefined,
  };

  const clearRoundTimers = () => {
    roundTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    roundTimersRef.current = [];
  };

  const cancelRound = () => {
    roundRunIdRef.current += 1;
    clearRoundTimers();
    stopKenoStorySounds(activeSoundsRef.current);
    isRoundPlayingRef.current = false;
    setIsRoundPlaying(false);
  };

  const playSound = (name: 'cell' | 'win' | 'lose') => {
    const audio = playKenoStorySound(name, volumeRef.current, (settledAudio) => {
      activeSoundsRef.current.delete(settledAudio);
    });
    if (audio) {
      activeSoundsRef.current.add(audio);
    }
  };

  useEffect(() => {
    volumeRef.current = args.volume;
    setKenoStorySoundsVolume(activeSoundsRef.current, args.volume);
  }, [args.volume]);

  useEffect(() => {
    preloadKenoStorySounds();
  }, []);

  useEffect(() => {
    return () => {
      roundRunIdRef.current += 1;
      roundTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      roundTimersRef.current = [];
      stopKenoStorySounds(activeSoundsRef.current);
    };
  }, []);

  const config = {
    shell: {
      mode: args.mode,
      onModeChange: (mode) => updateArgs({ mode }),
      tabsDisabled: args.tabsDisabled || isRoundPlaying,
      autobetSession: {
        state: args.autobetSessionState,
        totalWagered: args.autobetTotalWagered,
        netProfit: args.autobetNetProfit,
        winRate: args.autobetWinRate,
      },
      manualActionLabel: args.manualActionLabel,
      autoActionLabel: autobetAction.label,
      autoActionVariant: autobetAction.variant,
      manualActionDisabled: args.manualActionDisabled || !hasSelection,
      manualActionPending: isRoundPlaying,
      autoActionDisabled: args.autoActionDisabled || fieldsDisabled || !hasSelection,
      theatreMode: args.theatreMode,
      onManualAction: () => {
        const pickedNumbers = getKenoStoryPickedNumbers(cells);
        if (pickedNumbers.length === 0 || isRoundPlayingRef.current) return;

        roundRunIdRef.current += 1;
        const runId = roundRunIdRef.current;
        clearRoundTimers();
        isRoundPlayingRef.current = true;
        setIsRoundPlaying(true);

        scheduleKenoStoryManualRound({
          cells,
          pickedNumbers,
          risk: args.risk,
          reducedMotion: args.reducedMotion || shouldReduceMotion(),
          betAmount: args.betAmount,
          isActive: () => roundRunIdRef.current === runId,
          schedule: (callback, delayMs) => {
            const timer = window.setTimeout(callback, delayMs);
            roundTimersRef.current.push(timer);
          },
          onUpdate: (patch) => {
            if (roundRunIdRef.current !== runId) return;

            updateArgs(patch);

            if (patch.reachedHits === null) {
              isRoundPlayingRef.current = false;
              setIsRoundPlaying(false);
            }
          },
          onReveal: (result) => {
            playSound(result === 'win' ? 'win' : 'lose');
          },
        });
      },
      onAutoAction: () => undefined,
    },
    betAmount: {
      value: args.betAmount,
      onChange: (betAmount) => updateArgs({ betAmount }),
      conversionText: '0.000145 BTC',
      tooltip: kenoStoryBetAmountTooltip,
      currencyIcon: kenoStoryCurrencyIcon,
      isLoading: args.betAmountLoading,
      error: args.betAmountError || undefined,
      thresholdWarning: args.showBetAmountThresholdWarning
        ? {
            title: args.betAmountThresholdTitle,
            description: args.betAmountThresholdDescription,
          }
        : null,
      quickActions: [
        {
          label: '½',
          onClick: () => {
            const value = Number.parseFloat(args.betAmount);
            if (!Number.isNaN(value)) {
              updateArgs({ betAmount: (value * 0.5).toFixed(2) });
            }
          },
        },
        {
          label: '2x',
          onClick: () => {
            const value = Number.parseFloat(args.betAmount);
            if (!Number.isNaN(value)) {
              updateArgs({ betAmount: (value * 2).toFixed(2) });
            }
          },
        },
      ],
    },
    rounds: {
      value: args.rounds,
      onChange: (rounds) => updateArgs({ rounds }),
      error: args.roundsError || undefined,
    },
    fieldsDisabled,
    risk: {
      value: args.risk,
      onChange: (risk) => updateArgs({ risk }),
      options: kenoStoryRiskOptions,
      labels: kenoStoryRiskLabels,
    },
    stopConditions: {
      labels: kenoStoryStopConditionsLabels,
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
    actions: {
      autoPick: {
        label: args.autoPickLabel,
        disabled: args.autoPickDisabled || fieldsDisabled,
        onClick: () => {
          cancelRound();
          playSound('cell');
          updateArgs({
            cells: autoPickKenoStoryCells(cells),
            ...resetRoundPresentation,
          });
        },
      },
      clearTable: {
        label: args.clearTableLabel,
        disabled: fieldsDisabled || !hasBoardState,
        onClick: () => {
          cancelRound();
          updateArgs({
            cells: createKenoGridCells(),
            ...resetRoundPresentation,
          });
        },
      },
    },
  } satisfies KenoConfigProps;
  const board = {
    cells,
    assets: kenoStoryCellAssets,
    theatreMode: args.theatreMode,
    reducedMotion: args.reducedMotion,
    disabled: fieldsDisabled,
    gridAriaLabel: 'Keno grid',
    getCellAriaLabel: getKenoStoryCellAriaLabel,
    paytable: {
      items: createKenoStoryPaytableItems(Math.max(pickedCount, 1), args.risk),
      reachedHits: args.reachedHits,
      empty: pickedCount === 0,
      emptyLabel: kenoStoryPaytableEmptyLabel,
      hitsIconSrc: kenoStoryHitsIconSrc,
      'aria-label': 'Keno paytable',
      getItemAriaLabel: getKenoStoryPaytableItemAriaLabel,
    },
    resultAnnouncement: args.showWinModal ? undefined : args.resultAnnouncement,
    overlay: (
      <GameWinModal
        open={args.showWinModal}
        title="You win!"
        multiplierLabel="Multiplier"
        multiplier={args.winMultiplier}
        formattedWinAmount={args.winAmount}
        currencyIcon={kenoStoryWinCurrencyIcon}
      />
    ),
    onCellClick: (number) => {
      if (fieldsDisabled) return;
      const nextCells = toggleKenoStoryCell(cells, number);
      const didChange = nextCells.some(
        (cell, index) => cell.state !== cells[index]?.state,
      );
      if (!didChange) return;

      cancelRound();
      playSound('cell');
      updateArgs({
        cells: nextCells,
        ...resetRoundPresentation,
      });
    },
  } satisfies KenoBoardProps;

  return (
    <div
      style={{ width: args.previewWidth, height: args.previewHeight }}
      className={cn(
        'bg-ds-black p-ds-4 md:p-ds-8 w-full',
        args.theatreMode
          ? !args.previewHeight && 'h-dvh'
          : !args.previewHeight && 'min-h-screen',
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
              title="Keno"
              onBackClick={() => undefined}
              showVolumeControl
              volume={args.volume}
              onVolumeChange={(volume) => updateArgs({ volume })}
              isTheatreMode={args.theatreMode}
              onTheatreToggle={() => updateArgs({ theatreMode: !args.theatreMode })}
            />
          }
          config={
            <KenoConfig
              shell={config.shell}
              betAmount={config.betAmount}
              rounds={config.rounds}
              stopConditions={config.stopConditions}
              fieldsDisabled={config.fieldsDisabled}
              risk={config.risk}
              actions={config.actions}
            />
          }
          board={
            <KenoBoard
              cells={board.cells}
              assets={board.assets}
              theatreMode={board.theatreMode}
              reducedMotion={board.reducedMotion}
              disabled={board.disabled}
              gridAriaLabel={board.gridAriaLabel}
              getCellAriaLabel={board.getCellAriaLabel}
              paytable={board.paytable}
              overlay={board.overlay}
              resultAnnouncement={board.resultAnnouncement}
              onCellClick={board.onCellClick}
            />
          }
          theatreMode={args.theatreMode}
        />
      </div>
    </div>
  );
}

const defaultArgs = {
  mode: 'manual',
  tabsDisabled: false,
  fieldsDisabled: false,
  betAmountLoading: false,
  betAmount: '1.00',
  risk: 'medium',
  reducedMotion: false,
  rounds: '100',
  manualActionLabel: 'Place Bet',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  autoPickLabel: 'Auto Pick',
  autoPickDisabled: false,
  clearTableLabel: 'Clear Table',
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
  cells: createKenoGridCells(),
  reachedHits: null,
  showWinModal: false,
  winMultiplier: 'x16.00',
  winAmount: '16.00',
  resultAnnouncement: undefined,
} satisfies PlaygroundArgs;

const meta = {
  title: 'Features/Games/Originals/Keno/Keno Composition',
  render: KenoCompositionStory,
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
        'reducedMotion',
        'rounds',
        'manualActionLabel',
        'autoActionLabel',
        'autoActionVariant',
        'manualActionDisabled',
        'autoActionDisabled',
        'theatreMode',
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
    risk: {
      control: { type: 'select' },
      options: ['classic', 'low', 'medium', 'high'],
    },
    reducedMotion: { control: { type: 'boolean' } },
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
    resultAnnouncement: { control: false },
    previewWidth: { control: false },
    previewHeight: { control: false },
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

export const AutobetRunning: Story = {
  args: {
    mode: 'auto',
    tabsDisabled: true,
    fieldsDisabled: true,
    autoActionLabel: 'Stop',
    autoActionVariant: 'stop',
    autoPickDisabled: true,
    manualActionDisabled: true,
    autobetSessionState: 'live',
    autobetTotalWagered: '$1,250.00',
    autobetNetProfit: '+$320.50',
    autobetWinRate: '62%',
    cells: createKenoStoryPickedCells(),
  },
};

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
    cells: createKenoStoryPickedCells(),
  },
};

export const WithWinModal: Story = {
  args: {
    cells: settleKenoStoryCells(
      createKenoStoryPickedCells(),
      [1, 2, 3, 11, 12, 13, 14, 15, 16, 17],
    ),
    reachedHits: 3,
    showWinModal: true,
    winMultiplier: 'x1.5',
    winAmount: '1.50',
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};

export const ShortLandscapeTheatre: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'shortLandscape',
      options: {
        shortLandscape: {
          name: 'Short landscape',
          styles: { width: '1024px', height: '375px' },
          type: 'desktop',
        },
      },
    },
  },
  args: {
    theatreMode: true,
    previewWidth: '1024px',
    previewHeight: '375px',
  },
};
