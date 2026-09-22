'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect, useRef, useState } from 'storybook/preview-api';

import type {
  OriginalsConfigAutoActionVariant,
  OriginalsConfigMode,
} from '#ui/features/games/originals/originals-config/originals-config.types';
import { resolveOriginalsAutobetAction } from '#ui/features/games/originals/originals-config/originals-config-autobet.utils';
import { OriginalsGameShell } from '#ui/features/games/originals/originals-game-shell/originals-game-shell';
import type { AutobetSessionState } from '#ui/features/games/originals/shared/autobet-session-status/autobet-session-status.types';
import { GameWinModal } from '#ui/features/games/originals/shared/game-win-modal/game-win-modal';
import { TowersConfig } from '#ui/features/games/originals/towers/towers-config/towers-config';
import type { TowersConfigProps } from '#ui/features/games/originals/towers/towers-config/towers-config.types';
import { TowersGrid } from '#ui/features/games/originals/towers/towers-grid/towers-grid';
import type { TowersResultAnnouncement } from '#ui/features/games/originals/towers/towers-grid/towers-grid.types';
import {
  acceptTowersStoryRowSelection,
  createTowersStoryPlaygroundRows,
  getTowersStoryBombAnnouncementMessage,
  getTowersStoryGridConfigFromDifficulty,
  getTowersStoryMultiplierLabel,
  getTowersStoryPickOutcome,
  getTowersStoryWinAmount,
  isTowersStoryBombColumn,
  pickTowersStoryRandomColumn,
  playTowersStorySound,
  preloadTowersStorySounds,
  setTowersStorySoundsVolume,
  stopTowersStorySounds,
  TOWERS_PLAYGROUND_NEXT_ROW_DELAY_MS,
  TOWERS_STORY_CLEAR_BOARD_DELAY_MS,
  TOWERS_STORY_CLEAR_END_MS,
  TOWERS_STORY_CLEAR_RESET_MS,
  towersStoryBetAmountTooltip,
  towersStoryBoardAriaLabel,
  towersStoryCellAssets,
  towersStoryCellAssetsCompact,
  towersStoryCurrencyIcon,
  towersStoryDifficultyLabels,
  towersStoryDifficultyOptions,
  towersStoryStopConditionsLabels,
  towersStoryWinCurrencyIcon,
} from '#ui/features/games/originals/towers/towers-story-helpers';
import { GameHeader } from '#ui/features/games/shared/game-player/game-header/game-header';
import { TheatreModeSync } from '#ui/layouts/app-header/app-layout-provider';
import { cn } from '#ui/lib/cn';
import { shouldReduceMotion } from '#ui/lib/motion';

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
  clearSelectionDisabled: boolean;
  theatreMode: boolean;
  reducedMotion: boolean;
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
  initialRoundStarted?: boolean;
  initialIsWin?: boolean;
  initialPicks?: Record<number, number>;
  previewWidth?: string;
  previewHeight?: string;
}

function getWinResultFromPicks(
  picks: Record<number, number>,
  config: ReturnType<typeof getTowersStoryGridConfigFromDifficulty>,
  betAmount: string,
) {
  const pickedRowCount = Object.keys(picks).length;
  if (pickedRowCount === 0) {
    return {
      multiplier: getTowersStoryMultiplierLabel(config, 0),
      amount: getTowersStoryWinAmount(betAmount, 1),
    };
  }

  const lastClearedRowIndex = pickedRowCount - 1;
  const multiplierLabel = getTowersStoryMultiplierLabel(config, lastClearedRowIndex);
  const multiplierValue = Number.parseFloat(multiplierLabel.slice(1));

  return {
    multiplier: multiplierLabel,
    amount: getTowersStoryWinAmount(betAmount, multiplierValue),
  };
}

function TowersCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const storyRootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [picks, setPicks] = useState<Record<number, number>>(args.initialPicks ?? {});
  const [activeRowIndex, setActiveRowIndex] = useState(
    args.initialPicks ? Object.keys(args.initialPicks).length : 0,
  );
  const [roundStarted, setRoundStarted] = useState(args.initialRoundStarted ?? false);
  const [isWin, setIsWin] = useState(args.initialIsWin ?? false);
  const [isClearing, setIsClearing] = useState(false);
  const [winResult, setWinResult] = useState<{
    multiplier: string;
    amount: string;
  } | null>(() =>
    args.initialIsWin
      ? getWinResultFromPicks(
          args.initialPicks ?? {},
          getTowersStoryGridConfigFromDifficulty(args.difficulty),
          args.betAmount,
        )
      : null,
  );
  const [resultAnnouncement, setResultAnnouncement] = useState<
    TowersResultAnnouncement | undefined
  >(undefined);
  const announcementSeqRef = useRef(0);
  const acceptedRowsRef = useRef(
    new Set(Object.keys(args.initialPicks ?? {}).map((rowIndex) => Number(rowIndex))),
  );
  const advanceTimerRef = useRef<number | undefined>(undefined);
  const clearBoardTimerRef = useRef<number | undefined>(undefined);
  const clearResetTimerRef = useRef<number | undefined>(undefined);
  const clearEndTimerRef = useRef<number | undefined>(undefined);
  const previousDifficultyRef = useRef(args.difficulty);
  const volumeRef = useRef(args.volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const gridConfig = getTowersStoryGridConfigFromDifficulty(args.difficulty);
  const effectiveReducedMotion = args.reducedMotion || shouldReduceMotion();
  const effectiveReducedMotionRef = useRef(effectiveReducedMotion);
  const pickedRowCount = Object.keys(picks).length;
  const finalPickedRowIndex =
    pickedRowCount > 0 ? Math.max(...Object.keys(picks).map((key) => Number(key))) : -1;
  const finalPickedColIndex =
    finalPickedRowIndex >= 0 ? picks[finalPickedRowIndex] : undefined;
  const isGameOver =
    roundStarted &&
    !isWin &&
    finalPickedRowIndex >= 0 &&
    finalPickedColIndex !== undefined &&
    isTowersStoryBombColumn(finalPickedColIndex, gridConfig);
  const roundInProgress = roundStarted && !isGameOver && !isWin && !isClearing;
  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: args.autoActionVariant === 'stop',
    isInsufficientBalance: args.autoActionVariant === 'retry',
    startAutobetLabel: args.autoActionLabel,
  });

  const playSound = (name: 'win' | 'lose') => {
    const audio = playTowersStorySound(name, volumeRef.current, (settledAudio) => {
      activeSoundsRef.current.delete(settledAudio);
    });
    if (audio) {
      activeSoundsRef.current.add(audio);
    }
  };

  const announceResult = (message: string) => {
    announcementSeqRef.current += 1;
    setResultAnnouncement({
      id: String(announcementSeqRef.current),
      message,
    });
  };

  const clearClearBoardTimers = () => {
    window.clearTimeout(clearBoardTimerRef.current);
    window.clearTimeout(clearResetTimerRef.current);
    window.clearTimeout(clearEndTimerRef.current);
    clearBoardTimerRef.current = undefined;
    clearResetTimerRef.current = undefined;
    clearEndTimerRef.current = undefined;
  };

  const resetRoundState = () => {
    window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = undefined;
    setPicks({});
    acceptedRowsRef.current.clear();
    setActiveRowIndex(0);
    setRoundStarted(false);
    setIsWin(false);
    setResultAnnouncement(undefined);
  };

  const clearBoard = () => {
    if (boardRef.current?.contains(document.activeElement)) {
      const activeAction = Array.from(
        storyRootRef.current?.querySelectorAll<HTMLButtonElement>(
          '.ds-originals-config-action',
        ) ?? [],
      ).find((button) => !button.closest('[inert]') && !button.disabled);
      activeAction?.focus({ preventScroll: true });
    }

    clearClearBoardTimers();
    setIsClearing(true);
    setIsWin(false);

    if (effectiveReducedMotionRef.current) {
      resetRoundState();
      setIsClearing(false);
      setWinResult(null);
      return;
    }

    clearResetTimerRef.current = window.setTimeout(() => {
      resetRoundState();
    }, TOWERS_STORY_CLEAR_RESET_MS);

    clearEndTimerRef.current = window.setTimeout(() => {
      setIsClearing(false);
      setWinResult(null);
    }, TOWERS_STORY_CLEAR_END_MS);
  };

  const resetRound = () => {
    clearClearBoardTimers();
    resetRoundState();
    setIsClearing(false);
    setWinResult(null);
  };

  useEffect(() => {
    volumeRef.current = args.volume;
    setTowersStorySoundsVolume(activeSoundsRef.current, args.volume);
  }, [args.volume]);

  useEffect(() => {
    preloadTowersStorySounds();
  }, []);

  useEffect(() => {
    if (previousDifficultyRef.current === args.difficulty) return;
    previousDifficultyRef.current = args.difficulty;
    resetRound();
  }, [args.difficulty]);

  useEffect(() => {
    effectiveReducedMotionRef.current = effectiveReducedMotion;
    if (!effectiveReducedMotion || !isClearing) return;

    clearClearBoardTimers();
    resetRoundState();
    setIsClearing(false);
    setWinResult(null);
  }, [effectiveReducedMotion, isClearing]);

  useEffect(() => {
    if (!isGameOver && !isWin) return;
    if (args.initialIsWin && isWin) return;

    clearBoardTimerRef.current = window.setTimeout(() => {
      clearBoard();
    }, TOWERS_STORY_CLEAR_BOARD_DELAY_MS);

    return () => {
      window.clearTimeout(clearBoardTimerRef.current);
    };
  }, [args.initialIsWin, isGameOver, isWin]);

  useEffect(() => {
    const activeSounds = activeSoundsRef.current;
    return () => {
      window.clearTimeout(advanceTimerRef.current);
      clearClearBoardTimers();
      stopTowersStorySounds(activeSounds);
    };
  }, []);

  const updateBetAmount = (factor: number) => {
    const value = Number.parseFloat(args.betAmount);
    if (!Number.isNaN(value)) updateArgs({ betAmount: (value * factor).toFixed(2) });
  };

  const revealCell = (rowIndex: number, colIndex: number) => {
    if (!roundInProgress || rowIndex !== activeRowIndex) return;

    if (!acceptTowersStoryRowSelection(acceptedRowsRef.current, rowIndex)) return;
    setPicks((current) => ({ ...current, [rowIndex]: colIndex }));
    const outcome = getTowersStoryPickOutcome(rowIndex, colIndex, gridConfig);

    if (outcome === 'bomb') {
      playSound('lose');
      announceResult(getTowersStoryBombAnnouncementMessage(rowIndex));
      return;
    }

    if (outcome === 'top') {
      const result = getWinResultFromPicks(
        { ...picks, [rowIndex]: colIndex },
        gridConfig,
        args.betAmount,
      );
      setResultAnnouncement(undefined);
      setWinResult(result);
      setIsWin(true);
      return;
    }

    window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(
      () => {
        advanceTimerRef.current = undefined;
        setActiveRowIndex((current) =>
          current === rowIndex ? Math.min(rowIndex + 1, gridConfig.rows) : current,
        );
      },
      effectiveReducedMotion ? 0 : TOWERS_PLAYGROUND_NEXT_ROW_DELAY_MS,
    );
  };

  const handleRandomPick = () => {
    if (!roundInProgress || args.mode !== 'manual') return;
    const columnIndex = pickTowersStoryRandomColumn(gridConfig.cols);
    revealCell(activeRowIndex, columnIndex);
  };

  const handleManualAction = () => {
    if (roundInProgress) {
      if (pickedRowCount === 0) return;
      const result = getWinResultFromPicks(picks, gridConfig, args.betAmount);
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = undefined;
      setResultAnnouncement(undefined);
      setWinResult(result);
      setIsWin(true);
      return;
    }

    setResultAnnouncement(undefined);
    setRoundStarted(true);
    setActiveRowIndex(0);
  };

  const config = {
    shell: {
      mode: args.mode,
      onModeChange: (mode) => updateArgs({ mode }),
      tabsDisabled:
        args.tabsDisabled || roundInProgress || isGameOver || isWin || isClearing,
      manualActionLabel: roundStarted ? 'Cashout' : args.manualActionLabel,
      autoActionLabel: autobetAction.label,
      autoActionVariant: autobetAction.variant,
      manualActionDisabled:
        args.manualActionDisabled || (roundInProgress && pickedRowCount === 0),
      manualActionPending: isGameOver || isWin || isClearing,
      autoActionDisabled: args.autoActionDisabled,
      autobetSession: {
        state: args.autobetSessionState,
        totalWagered: args.autobetTotalWagered,
        netProfit: args.autobetNetProfit,
        winRate: args.autobetWinRate,
      },
      theatreMode: args.theatreMode,
      onManualAction: handleManualAction,
      onAutoAction: () => undefined,
    },
    betAmount: {
      value: args.betAmount,
      onChange: (betAmount) => updateArgs({ betAmount }),
      conversionText: '0.000145 BTC',
      tooltip: towersStoryBetAmountTooltip,
      currencyIcon: towersStoryCurrencyIcon,
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
    difficulty: {
      value: args.difficulty,
      onChange: (difficulty) => updateArgs({ difficulty }),
      options: towersStoryDifficultyOptions,
      labels: towersStoryDifficultyLabels,
    },
    rounds: {
      value: args.rounds,
      onChange: (rounds) => updateArgs({ rounds }),
      error: args.roundsError || undefined,
    },
    stopConditions: {
      labels: towersStoryStopConditionsLabels,
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
    fieldsDisabled:
      args.fieldsDisabled || roundInProgress || isGameOver || isWin || isClearing,
    actions: {
      clearSelection: {
        label: 'Clear Selection',
        disabled: args.clearSelectionDisabled || roundInProgress || isGameOver || isWin,
        onClick: () => undefined,
      },
      random: {
        label: 'Random',
        visible: roundInProgress && args.mode === 'manual',
        disabled: isClearing,
        onClick: handleRandomPick,
      },
    },
  } satisfies TowersConfigProps;

  return (
    <div
      ref={storyRootRef}
      style={{ width: args.previewWidth, height: args.previewHeight }}
      className={cn(
        'bg-ds-black px-ds-4 py-ds-2 md:px-ds-8 md:py-ds-4 w-full',
        args.theatreMode
          ? !args.previewHeight && 'h-dvh overflow-hidden'
          : !args.previewHeight && 'min-h-screen',
      )}
    >
      <TheatreModeSync
        theatreMode={args.theatreMode}
        onExitTheatre={() => updateArgs({ theatreMode: false })}
      />
      <div
        className={cn(
          'mx-auto flex w-full min-w-0 flex-col',
          args.theatreMode ? 'h-full max-w-[1750px]' : 'max-w-[1400px]',
        )}
      >
        <OriginalsGameShell
          className={args.theatreMode ? 'h-full min-h-0 flex-1' : undefined}
          header={
            <GameHeader
              title="Towers"
              onBackClick={() => undefined}
              showVolumeControl
              volume={args.volume}
              onVolumeChange={(volume) => updateArgs({ volume })}
              isTheatreMode={args.theatreMode}
              onTheatreToggle={() => updateArgs({ theatreMode: !args.theatreMode })}
            />
          }
          config={
            <TowersConfig
              shell={config.shell}
              betAmount={config.betAmount}
              rounds={config.rounds}
              stopConditions={config.stopConditions}
              fieldsDisabled={config.fieldsDisabled}
              difficulty={config.difficulty}
              actions={config.actions}
            />
          }
          board={
            <div
              ref={boardRef}
              className={cn(
                'bg-ds-black rounded-ds-sm relative flex min-h-0 w-full flex-1 flex-col',
                args.theatreMode && 'h-full',
              )}
            >
              <TowersGrid
                rows={createTowersStoryPlaygroundRows(
                  gridConfig,
                  picks,
                  activeRowIndex,
                  roundStarted,
                  isClearing,
                  isWin,
                )}
                assets={towersStoryCellAssets}
                mobileAssets={towersStoryCellAssetsCompact}
                theatreMode={args.theatreMode}
                reducedMotion={effectiveReducedMotion}
                className="min-h-0 flex-1"
                aria-label={towersStoryBoardAriaLabel}
                resultAnnouncement={isWin ? undefined : resultAnnouncement}
                onCellClick={
                  roundStarted && !isClearing && args.mode === 'manual'
                    ? (rowIndex, colIndex) => revealCell(rowIndex, colIndex)
                    : undefined
                }
              />
              <GameWinModal
                open={isWin}
                title="You win!"
                multiplierLabel="Multiplier"
                multiplier={winResult?.multiplier ?? 'x1.00'}
                formattedWinAmount={winResult?.amount ?? '0.00'}
                currencyIcon={towersStoryWinCurrencyIcon}
                reducedMotion={effectiveReducedMotion}
                volume={args.volume}
              />
            </div>
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
  difficulty: 1,
  rounds: '100',
  manualActionLabel: 'Place Bet',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  clearSelectionDisabled: true,
  theatreMode: false,
  reducedMotion: false,
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
} satisfies PlaygroundArgs;

const meta = {
  title: 'Features/Games/Originals/Towers/Towers Composition',
  render: TowersCompositionStory,
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
        'clearSelectionDisabled',
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
    clearSelectionDisabled: { control: { type: 'boolean' } },
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

export const WithWinModal: Story = {
  args: {
    initialRoundStarted: true,
    initialIsWin: true,
    initialPicks: { 0: 0, 1: 0, 2: 0 },
  },
};

export const ReducedMotion: Story = {
  args: { reducedMotion: true },
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

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
