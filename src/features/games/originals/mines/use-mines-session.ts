"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import BigNumber from "bignumber.js";

import {
  canContinueAutobet,
  EMPTY_ORIGINAL_AUTOBET_METRICS,
  getConfiguredMaxRounds,
  isAutobetActive,
  type OriginalAutobetMetrics,
  type OriginalAutobetStatus,
  type OriginalStopConditions,
  prepareAutobetEdit,
  settleAutobetRound,
} from "#ui/features/games/originals/core/originals-autobet";
import type { MinesGridSizeValue } from "#ui/features/games/originals/mines/mines-config/mines-config.utils";
import type { MinesGridCell } from "#ui/features/games/originals/mines/mines-grid/mines-grid.types";
import {
  applyMinesStorySelection,
  countMinesStorySafeRevealed,
  createMinesGridCells,
  createMinesStoryAnnouncement,
  createRandomMinesMineIndexes,
  getMinesStoryGridSettings,
  getMinesStoryGridSizeUpdate,
  getMinesStoryMultiplier,
  MINES_STORY_AUTOBET_NEXT_ROUND_DELAY_MS,
  MINES_STORY_AUTOBET_REVEAL_DELAY_MS,
  MINES_STORY_BOARD_CLEAR_DELAY_MS,
  playMinesStorySound,
  preloadMinesStorySounds,
  revealMinesStoryBoard,
  setMinesStorySoundsVolume,
  stopMinesStorySounds,
  type MinesStorySoundName,
} from "#ui/features/games/originals/mines/mines-story-helpers";
import type { OriginalsConfigMode } from "#ui/features/games/originals/originals-config/originals-config.types";
import {
  formatWalletAmount,
  formatWalletAmountLabel,
  getCryptoStakeFloorRate,
  WALLET_CRYPTO_FRACTION_DIGITS,
} from "#ui/features/wallet/wallet-balances";
import { useWallet } from "#ui/features/wallet/wallet-provider";
import { shouldReduceMotion } from "#ui/lib/motion";

const AUTOBET_CONTINUE_DELAY_MS =
  MINES_STORY_BOARD_CLEAR_DELAY_MS + MINES_STORY_AUTOBET_NEXT_ROUND_DELAY_MS;

interface MinesSessionState {
  mode: OriginalsConfigMode;
  /** Always stored in selected-currency crypto units. */
  betAmount: string;
  rounds: string;
  theatreMode: boolean;
  volume: number;
  onWinValue: number;
  onLossValue: number;
  stopProfitValue: string;
  stopLossValue: string;
  isActiveOnWin: boolean;
  isActiveOnLoss: boolean;
  gridSize: MinesGridSizeValue;
  numberOfMines: number;
  cells: MinesGridCell[];
  mineIndexes: number[];
  selectedIndexes: number[];
  isRoundPlaying: boolean;
  resultAnnouncement?: { id: string; message: string };
  showWinModal: boolean;
  winMultiplier: string;
  winAmount: string;
  auto: OriginalAutobetStatus;
  metrics: OriginalAutobetMetrics;
  initialBet: string;
}

function getStopConditions(state: MinesSessionState): OriginalStopConditions {
  return {
    isActiveOnWin: state.isActiveOnWin,
    isActiveOnLoss: state.isActiveOnLoss,
    onWin: state.onWinValue,
    onLoss: state.onLossValue,
    stopProfit: state.stopProfitValue,
    stopLoss: state.stopLossValue,
  };
}

export function useMinesSession() {
  const wallet = useWallet();
  const [state, setState] = useState<MinesSessionState>(() => ({
    mode: "manual",
    betAmount: "0",
    rounds: "0",
    theatreMode: false,
    volume: 0.75,
    onWinValue: 50,
    onLossValue: 50,
    stopProfitValue: "",
    stopLossValue: "",
    isActiveOnWin: false,
    isActiveOnLoss: false,
    gridSize: 5,
    numberOfMines: 3,
    cells: createMinesGridCells(5),
    mineIndexes: [],
    selectedIndexes: [],
    isRoundPlaying: false,
    showWinModal: false,
    winMultiplier: "x0.00",
    winAmount: "0.00",
    auto: { kind: "idle" },
    metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    initialBet: "0",
  }));

  const stateRef = useRef(state);
  const volumeRef = useRef(state.volume);
  const activeSoundsRef = useRef(new Set<HTMLAudioElement>());
  const boardClearTimerRef = useRef<number | null>(null);
  const autobetTimersRef = useRef<number[]>([]);
  const autobetGenerationRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
    volumeRef.current = state.volume;
  });

  const playSound = (name: MinesStorySoundName) => {
    const audio = playMinesStorySound(name, volumeRef.current, (settled) => {
      activeSoundsRef.current.delete(settled);
    });
    if (audio) activeSoundsRef.current.add(audio);
  };

  const patchState = (patch: Partial<MinesSessionState>) => {
    setState((current) => {
      const next = { ...current, ...patch };
      stateRef.current = next;
      return next;
    });
  };

  const clearBoardClearTimer = () => {
    if (boardClearTimerRef.current !== null) {
      window.clearTimeout(boardClearTimerRef.current);
      boardClearTimerRef.current = null;
    }
  };

  const clearAutobetTimers = () => {
    autobetTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    autobetTimersRef.current = [];
  };

  const queueAutobetTimer = (callback: () => void, delayMs: number) => {
    const timer = window.setTimeout(() => {
      autobetTimersRef.current = autobetTimersRef.current.filter(
        (entry) => entry !== timer,
      );
      callback();
    }, delayMs);
    autobetTimersRef.current.push(timer);
  };

  const scheduleBoardClear = (selectedIndexes: readonly number[] = []) => {
    clearBoardClearTimer();
    const gridSize = stateRef.current.gridSize;
    boardClearTimerRef.current = window.setTimeout(() => {
      boardClearTimerRef.current = null;
      const current = stateRef.current;
      const keepSelection = current.mode === "auto" ? selectedIndexes : [];
      const auto =
        current.auto.kind === "stopping"
          ? {
              kind:
                current.metrics.roundsCompleted > 0
                  ? ("paused" as const)
                  : ("idle" as const),
            }
          : current.auto;
      patchState({
        cells: applyMinesStorySelection(
          createMinesGridCells(gridSize),
          keepSelection,
        ),
        mineIndexes: [],
        selectedIndexes: [...keepSelection],
        showWinModal: false,
        resultAnnouncement: undefined,
        auto,
      });
    }, MINES_STORY_BOARD_CLEAR_DELAY_MS);
  };

  useEffect(() => {
    preloadMinesStorySounds();
    const activeSounds = activeSoundsRef.current;
    return () => {
      clearBoardClearTimer();
      clearAutobetTimers();
      stopMinesStorySounds(activeSounds);
    };
  }, []);

  useEffect(() => {
    setMinesStorySoundsVolume(activeSoundsRef.current, state.volume);
  }, [state.volume]);

  const applyAutobetEdit = (patch: Partial<MinesSessionState> = {}) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const edited = prepareAutobetEdit(current);
    const next = { ...current, ...edited, ...patch };
    stateRef.current = next;
    setState(next);
  };

  const formatWinAmount = (payoutAmount: string) =>
    formatWalletAmountLabel(
      formatWalletAmount(payoutAmount, wallet.currencyId, wallet.displayFiat),
    );

  const formatCellCashoutLabel = (betAmount: string, multiplier: number) =>
    formatWinAmount(new BigNumber(betAmount).times(multiplier).toFixed());

  const settleFinishedRound = ({
    betAmount,
    payoutAmount,
    multiplier,
    isWin,
    auto,
    cells,
    announcement,
  }: {
    betAmount: string;
    payoutAmount: string;
    multiplier: number;
    isWin: boolean;
    auto: boolean;
    cells: MinesGridCell[];
    announcement: string;
  }) => {
    const applied = wallet.applyRound({ betAmount, payoutAmount });
    const latest = stateRef.current;

    if (!applied) {
      patchState({
        cells,
        isRoundPlaying: false,
        showWinModal: false,
        resultAnnouncement: createMinesStoryAnnouncement(announcement),
        auto: auto
          ? { kind: "failed", reason: "insufficient-balance" }
          : latest.auto,
      });
      scheduleBoardClear(latest.selectedIndexes);
      return;
    }

    let metrics = latest.metrics;
    let nextBet = latest.betAmount;
    let autoStatus = latest.auto;

    if (auto) {
      const settled = settleAutobetRound(
        { metrics: latest.metrics, nextBet: latest.betAmount },
        { win: isWin, betAmount, payoutAmount },
        {
          auto: true,
          initialBet: latest.initialBet,
          stopConditions: getStopConditions(latest),
          fiatRate: getCryptoStakeFloorRate(wallet.currencyId),
        },
      );
      metrics = settled.metrics;
      nextBet = settled.nextBet;

      const canContinue = canContinueAutobet(
        {
          rounds: latest.rounds,
          metrics,
          stopConditions: getStopConditions(latest),
        },
        "1",
      );

      if (latest.auto.kind === "stopping") {
        autoStatus = { kind: "stopping" };
      } else if (!canContinue) {
        autoStatus = { kind: "idle" };
      }
    }

    patchState({
      cells,
      isRoundPlaying: false,
      showWinModal: isWin,
      winMultiplier: `x${multiplier.toFixed(2)}`,
      winAmount: formatWinAmount(payoutAmount),
      resultAnnouncement: createMinesStoryAnnouncement(announcement),
      metrics,
      betAmount: nextBet,
      auto: autoStatus,
    });
    scheduleBoardClear(latest.selectedIndexes);
  };

  const startManualRound = () => {
    const current = stateRef.current;
    if (current.isRoundPlaying || current.mode !== "manual") return false;
    if (!new BigNumber(current.betAmount).gt(0)) return false;
    if (!wallet.canAfford(current.betAmount)) return false;

    clearBoardClearTimer();
    stopMinesStorySounds(activeSoundsRef.current);
    const mineIndexes = createRandomMinesMineIndexes(
      current.gridSize,
      current.numberOfMines,
    );

    patchState({
      cells: createMinesGridCells(current.gridSize),
      mineIndexes,
      selectedIndexes: [],
      isRoundPlaying: true,
      showWinModal: false,
      resultAnnouncement: createMinesStoryAnnouncement(
        "Round started. Pick a safe tile.",
      ),
    });
    return true;
  };

  const cashout = () => {
    const current = stateRef.current;
    if (!current.isRoundPlaying || current.mode !== "manual") return;
    const revealedSafe = countMinesStorySafeRevealed(
      current.cells,
      current.mineIndexes,
    );
    if (revealedSafe <= 0) return;

    const multiplier = getMinesStoryMultiplier(
      current.gridSize,
      current.numberOfMines,
      revealedSafe,
    );
    const payoutAmount = new BigNumber(current.betAmount)
      .times(multiplier)
      .toFixed();

    playSound("cashout");
    settleFinishedRound({
      betAmount: current.betAmount,
      payoutAmount,
      multiplier,
      isWin: true,
      auto: false,
      cells: revealMinesStoryBoard({
        cells: current.cells,
        mineIndexes: current.mineIndexes,
      }),
      announcement: "Cashed out.",
    });
  };

  const revealManualCell = (index: number) => {
    const current = stateRef.current;
    if (!current.isRoundPlaying || current.mode !== "manual") return;
    const cell = current.cells[index];
    if (!cell || cell.revealed || cell.disabled) return;

    if (current.mineIndexes.includes(index)) {
      playSound("mine");
      settleFinishedRound({
        betAmount: current.betAmount,
        payoutAmount: "0",
        multiplier: 0,
        isWin: false,
        auto: false,
        cells: revealMinesStoryBoard({
          cells: current.cells,
          mineIndexes: current.mineIndexes,
          hitIndex: index,
        }),
        announcement: "Mine hit. Round lost.",
      });
      return;
    }

    const revealedSafe =
      countMinesStorySafeRevealed(current.cells, current.mineIndexes) + 1;
    const multiplier = getMinesStoryMultiplier(
      current.gridSize,
      current.numberOfMines,
      revealedSafe,
    );
    const nextCells = current.cells.map((entry, cellIndex) =>
      cellIndex === index
        ? {
            revealed: true,
            content: "safe" as const,
            revealStyle: "player" as const,
            selected: false,
            cashoutLabel: formatCellCashoutLabel(current.betAmount, multiplier),
            disabled: false,
          }
        : entry,
    );

    const { totalCells } = getMinesStoryGridSettings(current.gridSize);
    const safeCellCount = totalCells - current.mineIndexes.length;
    const clearedBoard = revealedSafe >= safeCellCount;

    playSound("cell");

    if (clearedBoard) {
      const payoutAmount = new BigNumber(current.betAmount)
        .times(multiplier)
        .toFixed();
      playSound("cashout");
      settleFinishedRound({
        betAmount: current.betAmount,
        payoutAmount,
        multiplier,
        isWin: true,
        auto: false,
        cells: revealMinesStoryBoard({
          cells: nextCells,
          mineIndexes: current.mineIndexes,
        }),
        announcement: "All safe tiles cleared.",
      });
      return;
    }

    patchState({
      cells: nextCells,
      resultAnnouncement: createMinesStoryAnnouncement("Safe tile revealed."),
    });
  };

  const toggleAutoSelection = (index: number) => {
    const current = stateRef.current;
    if (
      current.mode !== "auto" ||
      current.isRoundPlaying ||
      isAutobetActive(current.auto)
    ) {
      return;
    }
    const selected = new Set(current.selectedIndexes);
    if (selected.has(index)) selected.delete(index);
    else selected.add(index);
    const selectedIndexes = Array.from(selected).sort(
      (left, right) => left - right,
    );
    applyAutobetEdit({
      cells: applyMinesStorySelection(current.cells, selectedIndexes),
      selectedIndexes,
    });
  };

  const clickCell = (index: number) => {
    const current = stateRef.current;
    if (current.mode === "auto" && !current.isRoundPlaying) {
      toggleAutoSelection(index);
      return;
    }
    revealManualCell(index);
  };

  const runAutoRound = () => {
    const current = stateRef.current;
    const stopConditions = getStopConditions(current);

    if (
      !canContinueAutobet(
        { rounds: current.rounds, metrics: current.metrics, stopConditions },
        "1",
      )
    ) {
      patchState({ auto: { kind: "idle" } });
      return;
    }

    if (current.auto.kind === "stopping") {
      patchState({
        auto: {
          kind: current.metrics.roundsCompleted > 0 ? "paused" : "idle",
        },
      });
      return;
    }

    if (current.auto.kind !== "running") return;
    if (current.selectedIndexes.length === 0) {
      patchState({ auto: { kind: "idle" } });
      return;
    }
    if (!wallet.canAfford(current.betAmount)) {
      patchState({
        auto: { kind: "failed", reason: "insufficient-balance" },
      });
      return;
    }

    clearBoardClearTimer();
    clearAutobetTimers();
    const generation = ++autobetGenerationRef.current;
    const selectedIndexes = [...current.selectedIndexes];
    const gridSize = current.gridSize;
    const numberOfMines = current.numberOfMines;
    const betAmount = current.betAmount;
    const mineIndexes = createRandomMinesMineIndexes(gridSize, numberOfMines);
    const idleCells = applyMinesStorySelection(
      createMinesGridCells(gridSize),
      selectedIndexes,
    );
    const reduceMotion = shouldReduceMotion();

    patchState({
      cells: idleCells,
      mineIndexes,
      selectedIndexes,
      isRoundPlaying: true,
      showWinModal: false,
      resultAnnouncement: createMinesStoryAnnouncement(
        "Autobet round started.",
      ),
    });

    queueAutobetTimer(
      () => {
        if (autobetGenerationRef.current !== generation) return;
        const latest = stateRef.current;
        if (latest.auto.kind !== "running" && latest.auto.kind !== "stopping") {
          patchState({ isRoundPlaying: false });
          return;
        }

        const mineSet = new Set(mineIndexes);
        const hitIndex = selectedIndexes.find((entry) => mineSet.has(entry));
        const orderedPicks = [...selectedIndexes].sort(
          (left, right) => left - right,
        );

        if (hitIndex !== undefined) {
          playSound("mine");
          settleFinishedRound({
            betAmount,
            payoutAmount: "0",
            multiplier: 0,
            isWin: false,
            auto: true,
            cells: revealMinesStoryBoard({
              cells: idleCells,
              mineIndexes,
              hitIndex,
            }),
            announcement: "Mine hit. Round lost.",
          });
          return;
        }

        let safeCount = 0;
        const revealedSelected = idleCells.map((cell, index) => {
          if (!orderedPicks.includes(index)) {
            return { ...cell, selected: false };
          }
          safeCount += 1;
          const multiplier = getMinesStoryMultiplier(
            gridSize,
            numberOfMines,
            safeCount,
          );
          return {
            revealed: true,
            content: "safe" as const,
            revealStyle: "player" as const,
            selected: false,
            cashoutLabel: formatCellCashoutLabel(betAmount, multiplier),
            disabled: false,
          };
        });

        const multiplier = getMinesStoryMultiplier(
          gridSize,
          numberOfMines,
          orderedPicks.length,
        );
        const payoutAmount = new BigNumber(betAmount)
          .times(multiplier)
          .toFixed();
        playSound("cashout");
        settleFinishedRound({
          betAmount,
          payoutAmount,
          multiplier,
          isWin: true,
          auto: true,
          cells: revealMinesStoryBoard({
            cells: revealedSelected,
            mineIndexes,
          }),
          announcement: "Autobet round won.",
        });
      },
      reduceMotion ? 0 : MINES_STORY_AUTOBET_REVEAL_DELAY_MS,
    );
  };

  const placeManualBet = () => {
    const current = stateRef.current;
    if (current.mode !== "manual") return;
    if (current.isRoundPlaying) {
      cashout();
      return;
    }
    startManualRound();
  };

  const startAutoBet = () => {
    const current = stateRef.current;
    if (
      current.isRoundPlaying ||
      current.mode !== "auto" ||
      !new BigNumber(current.betAmount).gt(0) ||
      current.selectedIndexes.length === 0 ||
      !wallet.canAfford(current.betAmount) ||
      getConfiguredMaxRounds(current.rounds) <= 0
    ) {
      return;
    }

    const next: MinesSessionState = {
      ...current,
      initialBet: current.betAmount,
      auto: { kind: "running" },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
    };
    stateRef.current = next;
    setState(next);
    queueMicrotask(() => runAutoRound());
  };

  const continueAutobet = () => {
    const current = stateRef.current;
    if (
      current.isRoundPlaying ||
      (current.auto.kind !== "paused" && current.auto.kind !== "failed")
    ) {
      return;
    }
    if (
      !canContinueAutobet(
        {
          rounds: current.rounds,
          metrics: current.metrics,
          stopConditions: getStopConditions(current),
        },
        "1",
      )
    ) {
      const idle = { ...current, auto: { kind: "idle" as const } };
      stateRef.current = idle;
      setState(idle);
      return;
    }
    const next = { ...current, auto: { kind: "running" as const } };
    stateRef.current = next;
    setState(next);
    queueMicrotask(() => runAutoRound());
  };

  const stopAutoBet = () => {
    const current = stateRef.current;
    if (current.auto.kind !== "running") return;

    if (!current.isRoundPlaying && boardClearTimerRef.current === null) {
      const next = {
        ...current,
        auto: {
          kind:
            current.metrics.roundsCompleted > 0
              ? ("paused" as const)
              : ("idle" as const),
        },
      };
      stateRef.current = next;
      setState(next);
      return;
    }

    const next = { ...current, auto: { kind: "stopping" as const } };
    stateRef.current = next;
    setState(next);
  };

  const handleAutoAction = () => {
    const current = stateRef.current;
    if (isAutobetActive(current.auto)) {
      stopAutoBet();
      return;
    }
    if (current.auto.kind === "paused" || current.auto.kind === "failed") {
      continueAutobet();
      return;
    }
    startAutoBet();
  };

  const setMode = (mode: OriginalsConfigMode) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || current.mode === mode) return;
    if (isAutobetActive(current.auto)) stopAutoBet();
    clearAutobetTimers();
    clearBoardClearTimer();
    const next: MinesSessionState = {
      ...current,
      mode,
      auto: { kind: "idle" },
      metrics: { ...EMPTY_ORIGINAL_AUTOBET_METRICS },
      cells: createMinesGridCells(current.gridSize),
      mineIndexes: [],
      selectedIndexes: [],
      showWinModal: false,
      resultAnnouncement: undefined,
    };
    stateRef.current = next;
    setState(next);
  };

  const setRounds = (rounds: string) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const edited = prepareAutobetEdit(current);
    if (rounds === edited.rounds && edited.auto.kind === current.auto.kind) {
      return;
    }
    const next = { ...current, ...edited, rounds };
    stateRef.current = next;
    setState(next);
  };

  const setGridSize = (nextGridSize: MinesGridSizeValue) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const update = getMinesStoryGridSizeUpdate(
      nextGridSize,
      current.numberOfMines,
    );
    clearBoardClearTimer();
    clearAutobetTimers();
    applyAutobetEdit({
      gridSize: update.gridSize,
      numberOfMines: update.numberOfMines,
      cells: createMinesGridCells(update.gridSize),
      mineIndexes: [],
      selectedIndexes: [],
      showWinModal: false,
      resultAnnouncement: undefined,
    });
  };

  const setNumberOfMines = (numberOfMines: number) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const settings = getMinesStoryGridSettings(current.gridSize);
    const clamped = Math.min(
      Math.max(numberOfMines, settings.minNumberOfMines),
      settings.maxNumberOfMines,
    );
    applyAutobetEdit({ numberOfMines: clamped });
  };

  const clearSelection = () => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    applyAutobetEdit({
      selectedIndexes: [],
      cells: applyMinesStorySelection(current.cells, []),
    });
  };

  const continueAfterPresentation = useEffectEvent(runAutoRound);
  useEffect(() => {
    if (!isAutobetActive(state.auto) || state.isRoundPlaying) return undefined;
    if (state.auto.kind === "stopping") return undefined;
    const timer = window.setTimeout(
      continueAfterPresentation,
      AUTOBET_CONTINUE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [state.auto, state.isRoundPlaying, state.metrics.roundsCompleted]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) stopAutoBet();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", stopAutoBet);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", stopAutoBet);
    };
  }, []);

  useEffect(() => {
    if (
      isAutobetActive(stateRef.current.auto) ||
      stateRef.current.isRoundPlaying
    ) {
      return;
    }
    const next = "0";
    applyAutobetEdit({ betAmount: next, initialBet: next });
  }, [wallet.currencyId]);

  const commitCryptoBetAmount = (cryptoAmount: string) => {
    const amount = cryptoAmount || "0";
    applyAutobetEdit({ betAmount: amount, initialBet: amount });
    return amount;
  };

  const scaleBetAmount = (factor: number) => {
    const current = stateRef.current;
    if (current.isRoundPlaying || isAutobetActive(current.auto)) return;
    const next = new BigNumber(current.betAmount).times(factor);
    if (!next.isFinite() || next.lte(0)) return;
    const available = new BigNumber(wallet.balances[wallet.currencyId]);
    const capped = BigNumber.min(next, available);
    const digits = WALLET_CRYPTO_FRACTION_DIGITS[wallet.currencyId];
    commitCryptoBetAmount(capped.toFixed(digits));
  };

  const revealedSafeCount = countMinesStorySafeRevealed(
    state.cells,
    state.mineIndexes,
  );
  const currentMultiplier =
    state.isRoundPlaying && revealedSafeCount > 0
      ? getMinesStoryMultiplier(
          state.gridSize,
          state.numberOfMines,
          revealedSafeCount,
        )
      : 0;
  const currentPayoutAmount =
    currentMultiplier > 0
      ? new BigNumber(state.betAmount).times(currentMultiplier).toFixed()
      : "0";

  return {
    ...state,
    wallet,
    revealedSafeCount,
    currentMultiplier,
    currentPayoutAmount,
    fieldsDisabled: state.isRoundPlaying || isAutobetActive(state.auto),
    canCashout: state.isRoundPlaying && revealedSafeCount > 0,
    hasSelection: state.selectedIndexes.length > 0,
    placeManualBet,
    handleAutoAction,
    setMode,
    setRounds,
    setGridSize,
    setNumberOfMines,
    clearSelection,
    clickCell,
    setTheatreMode: (theatreMode: boolean) => patchState({ theatreMode }),
    setVolume: (volume: number) => patchState({ volume }),
    setOnWinValue: (onWinValue: number) => applyAutobetEdit({ onWinValue }),
    setOnLossValue: (onLossValue: number) => applyAutobetEdit({ onLossValue }),
    setStopProfitValue: (stopProfitValue: string) =>
      applyAutobetEdit({ stopProfitValue }),
    setStopLossValue: (stopLossValue: string) =>
      applyAutobetEdit({ stopLossValue }),
    setIsActiveOnWin: (isActiveOnWin: boolean) =>
      applyAutobetEdit({ isActiveOnWin }),
    setIsActiveOnLoss: (isActiveOnLoss: boolean) =>
      applyAutobetEdit({ isActiveOnLoss }),
    commitCryptoBetAmount,
    scaleBetAmount,
  };
}

export type MinesSession = ReturnType<typeof useMinesSession>;
