'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs, useEffect, useRef } from 'storybook/preview-api';

import { MinesBoard } from '#ui/features/games/originals/mines/mines-board/mines-board';
import type { MinesBoardProps } from '#ui/features/games/originals/mines/mines-board/mines-board.types';
import { MinesConfig } from '#ui/features/games/originals/mines/mines-config/mines-config';
import type { MinesConfigProps } from '#ui/features/games/originals/mines/mines-config/mines-config.types';
import type { MinesGridSizeValue } from '#ui/features/games/originals/mines/mines-config/mines-config.utils';
import type { MinesGridCell } from '#ui/features/games/originals/mines/mines-grid/mines-grid.types';
import {
  applyMinesStorySelection,
  countMinesStorySafeRevealed,
  createMinesGridCells,
  createMinesStoryAnnouncement,
  createMinesStoryMineIndexes,
  focusFirstAvailableMinesStoryCell,
  formatMinesStoryCashoutLabel,
  formatMinesStoryMultiplierLabel,
  getMinesStoryCellAriaLabel,
  getMinesStoryGridSettings,
  getMinesStoryGridSizeUpdate,
  getMinesStoryMultiplier,
  MINES_STORY_AUTOBET_NEXT_ROUND_DELAY_MS,
  MINES_STORY_AUTOBET_REVEAL_DELAY_MS,
  MINES_STORY_BOARD_CLEAR_DELAY_MS,
  minesStoryBetAmountTooltip,
  minesStoryCellAssets,
  minesStoryCurrencyIcon,
  minesStorySliderAssets,
  minesStoryStopConditionsLabels,
  minesStoryWinCurrencyIcon,
  playMinesStorySound,
  preloadMinesStorySounds,
  revealMinesStoryBoard,
  setMinesStorySoundsVolume,
  stopMinesStorySounds,
} from '#ui/features/games/originals/mines/mines-story-helpers';
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
  gridSize: MinesGridSizeValue;
  numberOfMines: number;
  cells: MinesGridCell[];
  mineIndexes: number[];
  selectedIndexes: number[];
  roundActive: boolean;
  reducedMotion: boolean;
  rounds: string;
  manualActionLabel: string;
  autoActionLabel: string;
  autoActionVariant: OriginalsConfigAutoActionVariant;
  manualActionDisabled: boolean;
  autoActionDisabled: boolean;
  clearSelectionLabel: string;
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
  resultAnnouncement?: MinesBoardProps['resultAnnouncement'];
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
}

function MinesCompositionStory() {
  const [args, updateArgs] = useArgs<PlaygroundArgs>();
  const clearBoardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autobetTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autobetRunningRef = useRef(false);
  const volumeRef = useRef(args.volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const boardControllerRef = useRef<HTMLDivElement>(null);
  const focusFirstCellOnManualStartRef = useRef(false);
  const reducedMotion = args.reducedMotion || shouldReduceMotion();

  useEffect(() => {
    if (
      !focusFirstCellOnManualStartRef.current ||
      !args.roundActive ||
      args.mode !== 'manual'
    ) {
      return;
    }

    if (focusFirstAvailableMinesStoryCell(boardControllerRef.current)) {
      focusFirstCellOnManualStartRef.current = false;
    }
  }, [args.cells, args.mode, args.roundActive]);

  useEffect(() => {
    preloadMinesStorySounds();
  }, []);

  useEffect(() => {
    volumeRef.current = args.volume;
    setMinesStorySoundsVolume(activeSoundsRef.current, args.volume);
  }, [args.volume]);

  const playSound = (name: 'cell' | 'mine' | 'cashout') => {
    const audio = playMinesStorySound(name, volumeRef.current, (settledAudio) => {
      activeSoundsRef.current.delete(settledAudio);
    });
    if (audio) {
      activeSoundsRef.current.add(audio);
    }
  };

  const cancelScheduledBoardClear = () => {
    if (clearBoardTimeoutRef.current == null) return;
    clearTimeout(clearBoardTimeoutRef.current);
    clearBoardTimeoutRef.current = null;
  };

  const cancelAutobetTimers = () => {
    for (const timer of autobetTimersRef.current) {
      clearTimeout(timer);
    }
    autobetTimersRef.current = [];
  };

  const queueAutobetTimer = (callback: () => void, delayMs: number) => {
    const timer = setTimeout(() => {
      autobetTimersRef.current = autobetTimersRef.current.filter(
        (entry) => entry !== timer,
      );
      callback();
    }, delayMs);
    autobetTimersRef.current.push(timer);
  };

  const clearBoardToIdle = (
    gridSize: MinesGridSizeValue,
    selectedIndexes: readonly number[] = [],
  ) => {
    updateArgs({
      cells: applyMinesStorySelection(createMinesGridCells(gridSize), selectedIndexes),
      mineIndexes: [],
      selectedIndexes: [...selectedIndexes],
      showWinModal: false,
      roundActive: false,
      resultAnnouncement: undefined,
    });
  };

  const scheduleBoardClear = (
    gridSize: MinesGridSizeValue,
    {
      selectedIndexes = [],
      onCleared,
    }: {
      selectedIndexes?: readonly number[];
      onCleared?: () => void;
    } = {},
  ) => {
    cancelScheduledBoardClear();
    clearBoardTimeoutRef.current = setTimeout(() => {
      clearBoardTimeoutRef.current = null;
      clearBoardToIdle(gridSize, selectedIndexes);
      onCleared?.();
    }, MINES_STORY_BOARD_CLEAR_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      cancelScheduledBoardClear();
      cancelAutobetTimers();
      autobetRunningRef.current = false;
      stopMinesStorySounds(activeSoundsRef.current);
    };
  }, []);

  const gridSettings = getMinesStoryGridSettings(args.gridSize);
  const safeCellCount = gridSettings.totalCells - args.mineIndexes.length;
  const revealedSafeCount = countMinesStorySafeRevealed(args.cells, args.mineIndexes);
  const canCashout = args.roundActive && revealedSafeCount > 0;
  const isAutobetRunning = args.autoActionVariant === 'stop';
  const boardSettingsLocked = args.roundActive || args.fieldsDisabled || isAutobetRunning;
  const autobetAction = resolveOriginalsAutobetAction({
    isRunning: isAutobetRunning,
    isInsufficientBalance: args.autoActionVariant === 'retry',
    startAutobetLabel: args.autoActionLabel,
  });

  const updateBetAmount = (factor: number) => {
    const value = Number.parseFloat(args.betAmount);
    if (!Number.isNaN(value)) updateArgs({ betAmount: (value * factor).toFixed(2) });
  };

  const startRound = () => {
    cancelScheduledBoardClear();
    stopMinesStorySounds(activeSoundsRef.current);
    focusFirstCellOnManualStartRef.current = true;
    const mineIndexes = createMinesStoryMineIndexes(args.gridSize, args.numberOfMines);
    updateArgs({
      cells: createMinesGridCells(args.gridSize),
      mineIndexes,
      selectedIndexes: [],
      roundActive: true,
      showWinModal: false,
      resultAnnouncement: createMinesStoryAnnouncement(
        'Round started. Pick a safe tile.',
      ),
      manualActionLabel: 'Cashout',
    });
  };

  const resolveWinPresentation = (
    betAmount: string,
    gridSize: MinesGridSizeValue,
    numberOfMines: number,
    safeRevealedCount: number,
  ) => {
    const multiplier = getMinesStoryMultiplier(
      gridSize,
      numberOfMines,
      safeRevealedCount,
    );
    return {
      winMultiplier: formatMinesStoryMultiplierLabel(multiplier),
      winAmount: formatMinesStoryCashoutLabel(betAmount, multiplier),
    };
  };

  const cashout = () => {
    if (!canCashout) return;

    const win = resolveWinPresentation(
      args.betAmount,
      args.gridSize,
      args.numberOfMines,
      revealedSafeCount,
    );

    updateArgs({
      cells: revealMinesStoryBoard({
        cells: args.cells,
        mineIndexes: args.mineIndexes,
      }),
      roundActive: false,
      showWinModal: true,
      ...win,
      resultAnnouncement: createMinesStoryAnnouncement('Cashed out.'),
      manualActionLabel: 'Place Bet',
    });
    playSound('cashout');
    scheduleBoardClear(args.gridSize);
  };

  const handleManualAction = () => {
    if (args.roundActive) {
      cashout();
      return;
    }
    startRound();
  };

  function playAutobetRound(
    selectedIndexes: readonly number[],
    gridSize: MinesGridSizeValue,
    numberOfMines: number,
    betAmount: string,
    reduceMotion: boolean,
  ) {
    cancelScheduledBoardClear();
    const mineIndexes = createMinesStoryMineIndexes(gridSize, numberOfMines);
    const idleCells = applyMinesStorySelection(
      createMinesGridCells(gridSize),
      selectedIndexes,
    );

    const continueIfRunning = () => {
      if (!autobetRunningRef.current) {
        updateArgs({
          autoActionVariant: 'start',
          autobetSessionState: 'ready-to-start',
        });
        return;
      }

      queueAutobetTimer(() => {
        if (!autobetRunningRef.current) {
          updateArgs({
            autoActionVariant: 'start',
            autobetSessionState: 'ready-to-start',
          });
          return;
        }
        playAutobetRound(
          selectedIndexes,
          gridSize,
          numberOfMines,
          betAmount,
          reduceMotion,
        );
      }, MINES_STORY_AUTOBET_NEXT_ROUND_DELAY_MS);
    };

    updateArgs({
      cells: idleCells,
      mineIndexes,
      selectedIndexes: [...selectedIndexes],
      roundActive: true,
      showWinModal: false,
      resultAnnouncement: createMinesStoryAnnouncement('Autobet round started.'),
      autoActionVariant: 'stop',
      autobetSessionState: 'live',
    });

    queueAutobetTimer(
      () => {
        if (!autobetRunningRef.current) {
          updateArgs({
            roundActive: false,
            autoActionVariant: 'start',
            autobetSessionState: 'ready-to-start',
          });
          return;
        }

        const mineSet = new Set(mineIndexes);
        const hitIndex = selectedIndexes.find((index) => mineSet.has(index));
        const orderedPicks = [...selectedIndexes].sort((left, right) => left - right);

        if (hitIndex != null) {
          const preRevealCells = idleCells.map((cell, index) => {
            if (!selectedIndexes.includes(index)) return cell;
            return {
              ...cell,
              revealed: true,
              content: mineSet.has(index) ? ('mine' as const) : ('safe' as const),
              revealStyle: 'player' as const,
              selected: false,
              cashoutLabel: null,
              disabled: true,
            };
          });

          updateArgs({
            cells: revealMinesStoryBoard({
              cells: preRevealCells,
              mineIndexes,
              hitIndex,
            }),
            roundActive: false,
            showWinModal: false,
            resultAnnouncement: createMinesStoryAnnouncement('Mine hit. Round lost.'),
          });

          playSound('mine');

          scheduleBoardClear(gridSize, {
            selectedIndexes,
            onCleared: continueIfRunning,
          });
          return;
        }

        let safeCount = 0;
        const revealedSelected = idleCells.map((cell, index) => {
          if (!orderedPicks.includes(index)) {
            return { ...cell, selected: false };
          }

          safeCount += 1;
          const multiplier = getMinesStoryMultiplier(gridSize, numberOfMines, safeCount);
          return {
            revealed: true,
            content: 'safe' as const,
            revealStyle: 'player' as const,
            selected: false,
            cashoutLabel: formatMinesStoryCashoutLabel(betAmount, multiplier),
            disabled: false,
          };
        });

        const win = resolveWinPresentation(
          betAmount,
          gridSize,
          numberOfMines,
          orderedPicks.length,
        );

        updateArgs({
          cells: revealMinesStoryBoard({
            cells: revealedSelected,
            mineIndexes,
          }),
          roundActive: false,
          showWinModal: true,
          ...win,
          resultAnnouncement: createMinesStoryAnnouncement('Autobet round won.'),
        });

        playSound('cashout');

        scheduleBoardClear(gridSize, {
          selectedIndexes,
          onCleared: continueIfRunning,
        });
      },
      reduceMotion ? 0 : MINES_STORY_AUTOBET_REVEAL_DELAY_MS,
    );
  }

  const handleAutoAction = () => {
    if (args.autoActionVariant === 'stop') {
      autobetRunningRef.current = false;
      cancelAutobetTimers();
      stopMinesStorySounds(activeSoundsRef.current);
      updateArgs({
        autoActionVariant: 'start',
        autobetSessionState: 'ready-to-start',
        roundActive: false,
        resultAnnouncement: undefined,
      });
      return;
    }

    if (args.selectedIndexes.length === 0) return;

    autobetRunningRef.current = true;
    cancelScheduledBoardClear();
    playAutobetRound(
      args.selectedIndexes,
      args.gridSize,
      args.numberOfMines,
      args.betAmount,
      args.reducedMotion || shouldReduceMotion(),
    );
  };

  const handleCellClick = (index: number) => {
    const cell = args.cells[index];
    if (!cell || cell.revealed || cell.disabled) return;

    if (args.mode === 'auto' && !args.roundActive && !isAutobetRunning) {
      const selected = new Set(args.selectedIndexes);
      if (selected.has(index)) selected.delete(index);
      else selected.add(index);

      const selectedIndexes = Array.from(selected).sort((left, right) => left - right);
      updateArgs({
        cells: applyMinesStorySelection(args.cells, selectedIndexes),
        selectedIndexes,
      });
      return;
    }

    if (!args.roundActive) return;

    const isMine = args.mineIndexes.includes(index);

    if (isMine) {
      updateArgs({
        cells: revealMinesStoryBoard({
          cells: args.cells,
          mineIndexes: args.mineIndexes,
          hitIndex: index,
        }),
        roundActive: false,
        showWinModal: false,
        resultAnnouncement: createMinesStoryAnnouncement('Mine hit. Round lost.'),
        manualActionLabel: 'Place Bet',
      });
      playSound('mine');
      scheduleBoardClear(args.gridSize);
      return;
    }

    const nextSafeRevealed = revealedSafeCount + 1;
    const multiplier = getMinesStoryMultiplier(
      args.gridSize,
      args.numberOfMines,
      nextSafeRevealed,
    );
    const nextCells = args.cells.map((entry, cellIndex) =>
      cellIndex === index
        ? {
            revealed: true,
            content: 'safe' as const,
            revealStyle: 'player' as const,
            selected: false,
            cashoutLabel: formatMinesStoryCashoutLabel(args.betAmount, multiplier),
            disabled: false,
          }
        : entry,
    );
    const clearedBoard = nextSafeRevealed >= safeCellCount;
    const win = resolveWinPresentation(
      args.betAmount,
      args.gridSize,
      args.numberOfMines,
      nextSafeRevealed,
    );

    updateArgs({
      cells: clearedBoard
        ? revealMinesStoryBoard({
            cells: nextCells,
            mineIndexes: args.mineIndexes,
          })
        : nextCells,
      roundActive: !clearedBoard,
      showWinModal: clearedBoard,
      ...(clearedBoard ? win : {}),
      resultAnnouncement: createMinesStoryAnnouncement(
        clearedBoard ? 'All safe tiles cleared.' : 'Safe tile revealed.',
      ),
      manualActionLabel: clearedBoard ? 'Place Bet' : 'Cashout',
    });

    playSound('cell');
    if (clearedBoard) {
      playSound('cashout');
      scheduleBoardClear(args.gridSize);
    }
  };

  const updateGridSize = (nextGridSize: number) => {
    const gridSize = nextGridSize as MinesGridSizeValue;
    const gridSizeUpdate = getMinesStoryGridSizeUpdate(gridSize, args.numberOfMines);
    cancelScheduledBoardClear();
    cancelAutobetTimers();
    autobetRunningRef.current = false;
    stopMinesStorySounds(activeSoundsRef.current);
    updateArgs({
      gridSize: gridSizeUpdate.gridSize,
      numberOfMines: gridSizeUpdate.numberOfMines,
      cells: createMinesGridCells(gridSize),
      mineIndexes: [],
      selectedIndexes: [],
      roundActive: false,
      showWinModal: false,
      resultAnnouncement: undefined,
      manualActionLabel: 'Place Bet',
      autoActionVariant: 'start',
      autobetSessionState: 'ready-to-start',
    });
  };

  const config = {
    shell: {
      mode: args.mode,
      onModeChange: (mode) => {
        if (args.roundActive || isAutobetRunning) {
          updateArgs({ mode });
          return;
        }

        cancelAutobetTimers();
        autobetRunningRef.current = false;
        stopMinesStorySounds(activeSoundsRef.current);
        updateArgs({
          mode,
          cells: createMinesGridCells(args.gridSize),
          mineIndexes: [],
          selectedIndexes: [],
          showWinModal: false,
          resultAnnouncement: undefined,
          autoActionVariant: 'start',
          autobetSessionState: 'ready-to-start',
        });
      },
      tabsDisabled: args.tabsDisabled || args.roundActive || isAutobetRunning,
      autobetSession: {
        state: args.autobetSessionState,
        totalWagered: args.autobetTotalWagered,
        netProfit: args.autobetNetProfit,
        winRate: args.autobetWinRate,
      },
      manualActionLabel: args.roundActive ? 'Cashout' : args.manualActionLabel,
      autoActionLabel: autobetAction.label,
      autoActionVariant: autobetAction.variant,
      manualActionDisabled:
        args.manualActionDisabled || (args.roundActive && !canCashout),
      autoActionDisabled:
        args.autoActionDisabled ||
        (autobetAction.variant !== 'stop' && args.selectedIndexes.length === 0),
      theatreMode: args.theatreMode,
      onManualAction: handleManualAction,
      onAutoAction: handleAutoAction,
    },
    betAmount: {
      value: args.betAmount,
      onChange: (betAmount) => updateArgs({ betAmount }),
      conversionText: '0.000145 BTC',
      tooltip: minesStoryBetAmountTooltip,
      currencyIcon: minesStoryCurrencyIcon,
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
    fieldsDisabled: boardSettingsLocked,
    board: {
      gridSize: args.gridSize,
      onGridSizeChange: updateGridSize,
      gridSizeLabel: 'Grid Size',
      numberOfMines: args.numberOfMines,
      minNumberOfMines: gridSettings.minNumberOfMines,
      maxNumberOfMines: gridSettings.maxNumberOfMines,
      totalCells: gridSettings.totalCells,
      onNumberOfMinesChange: (numberOfMines) => updateArgs({ numberOfMines }),
      minesSliderLabel: 'Number of Mines',
      sliderAssets: minesStorySliderAssets,
    },
    clearSelection: {
      label: args.clearSelectionLabel,
      disabled: args.selectedIndexes.length === 0 || args.roundActive || isAutobetRunning,
      onClick: () => {
        updateArgs({
          selectedIndexes: [],
          cells: applyMinesStorySelection(args.cells, []),
        });
      },
    },
    stopConditions: {
      labels: minesStoryStopConditionsLabels,
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
  } satisfies MinesConfigProps;

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
              title="Mines"
              onBackClick={() => undefined}
              showVolumeControl
              volume={args.volume}
              onVolumeChange={(volume) => updateArgs({ volume })}
              isTheatreMode={args.theatreMode}
              onTheatreToggle={() => updateArgs({ theatreMode: !args.theatreMode })}
            />
          }
          config={
            <MinesConfig
              shell={config.shell}
              betAmount={config.betAmount}
              rounds={config.rounds}
              stopConditions={config.stopConditions}
              fieldsDisabled={config.fieldsDisabled}
              board={config.board}
              clearSelection={config.clearSelection}
            />
          }
          board={
            <div ref={boardControllerRef} className="contents">
              <MinesBoard
                theatreMode={args.theatreMode}
                gridSize={args.gridSize}
                cells={args.cells}
                assets={minesStoryCellAssets}
                reducedMotion={reducedMotion}
                selectionMode={args.mode === 'auto'}
                disabled={
                  isAutobetRunning ||
                  (!args.roundActive && args.mode !== 'auto') ||
                  (args.mode === 'auto' && args.roundActive)
                }
                onCellClick={handleCellClick}
                gridAriaLabel="Mines board"
                getCellAriaLabel={getMinesStoryCellAriaLabel}
                resultAnnouncement={
                  args.showWinModal ? undefined : args.resultAnnouncement
                }
                overlay={
                  <GameWinModal
                    open={args.showWinModal}
                    title="You win!"
                    multiplierLabel="Multiplier"
                    multiplier={args.winMultiplier}
                    formattedWinAmount={args.winAmount}
                    currencyIcon={minesStoryWinCurrencyIcon}
                  />
                }
              />
            </div>
          }
          theatreMode={args.theatreMode}
        />
      </div>
    </div>
  );
}

const defaultGridSize = 5 as MinesGridSizeValue;

const defaultArgs = {
  mode: 'manual',
  tabsDisabled: false,
  fieldsDisabled: false,
  betAmountLoading: false,
  betAmount: '1.00',
  gridSize: defaultGridSize,
  numberOfMines: 3,
  cells: createMinesGridCells(defaultGridSize),
  mineIndexes: [],
  selectedIndexes: [],
  roundActive: false,
  reducedMotion: false,
  rounds: '100',
  manualActionLabel: 'Place Bet',
  autoActionLabel: 'Start Autobet',
  autoActionVariant: 'start',
  manualActionDisabled: false,
  autoActionDisabled: false,
  clearSelectionLabel: 'Clear Selection',
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
  showWinModal: false,
  winMultiplier: 'x2.40',
  winAmount: '2.40',
} satisfies PlaygroundArgs;

const meta = {
  title: 'Features/Games/Originals/Mines/Mines Composition',
  render: MinesCompositionStory,
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
    gridSize: {
      control: { type: 'inline-radio' },
      options: [4, 5, 6, 8],
    },
    numberOfMines: { control: { type: 'number', min: 1, max: 63 } },
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
    cells: { control: false },
    mineIndexes: { control: false },
    selectedIndexes: { control: false },
    roundActive: { control: false },
    resultAnnouncement: { control: false },
    clearSelectionLabel: { control: false },
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

export const RoundInProgress: Story = {
  args: {
    roundActive: true,
    mineIndexes: createMinesStoryMineIndexes(defaultGridSize, 3),
    cells: createMinesGridCells(defaultGridSize).map((cell, index) => {
      if (index === 0) {
        return {
          revealed: true,
          content: 'safe' as const,
          revealStyle: 'player' as const,
          selected: false,
          cashoutLabel: formatMinesStoryCashoutLabel(
            defaultArgs.betAmount,
            getMinesStoryMultiplier(defaultGridSize, 3, 1),
          ),
          disabled: false,
        };
      }
      if (index === 1) {
        return {
          revealed: true,
          content: 'safe' as const,
          revealStyle: 'player' as const,
          selected: false,
          cashoutLabel: formatMinesStoryCashoutLabel(
            defaultArgs.betAmount,
            getMinesStoryMultiplier(defaultGridSize, 3, 2),
          ),
          disabled: false,
        };
      }
      return cell;
    }),
    manualActionLabel: 'Cashout',
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

export const ReducedMotion: Story = {
  args: {
    reducedMotion: true,
    roundActive: true,
    mineIndexes: createMinesStoryMineIndexes(defaultGridSize, 3),
    cells: createMinesGridCells(defaultGridSize),
    manualActionLabel: 'Cashout',
  },
};

export const WithWinModal: Story = {
  args: { showWinModal: true },
};

export const ShortTheatre: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  args: {
    theatreMode: true,
    gridSize: 8,
    cells: createMinesGridCells(8),
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
};
